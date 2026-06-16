import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Search, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import * as d3 from 'd3';

type Scenario = {
  id: number;
  title: string;
  type: string;
  description: string;
  badCode: string;
  fixCode: string;
  explanation: string;
};

const scenarios: Scenario[] = [
  {
    id: 1,
    title: 'Static Collection Leak',
    type: 'Heap Space',
    description: 'A static List grows unboundedly. Objects are added but never removed.',
    badCode: `// ❌ MEMORY LEAK
class EventBus {
  static List<Event> events = new ArrayList<>();
  
  void publish(Event e) {
    events.add(e); // Never cleared!
  }
}`,
    fixCode: `// ✅ FIXED
class EventBus {
  // Use bounded queue with eviction
  static Queue<Event> events = 
    new LinkedBlockingQueue<>(1000);
  
  void publish(Event e) {
    if (events.size() >= 1000) 
      events.poll(); // Evict oldest
    events.offer(e);
  }
}`,
    explanation: "Static fields are GC roots. Objects added to a static collection are always reachable, so they can never be collected. The List grows until OOM.",
  },
  {
    id: 2,
    title: 'ClassLoader Leak (Hot Reload)',
    type: 'Metaspace OOM',
    description: 'Web app redeployed 10× — old ClassLoader held by static ThreadLocal prevents GC.',
    badCode: `// ❌ MEMORY LEAK
class MyServlet {
  // static ThreadLocal holds ref to servlet instance
  // which holds ref to the ClassLoader!
  static ThreadLocal<MyServlet> context = 
    new ThreadLocal<>();
  
  void init() {
    context.set(this); // Never removed!
  }
}`,
    fixCode: `// ✅ FIXED
class MyServlet {
  static ThreadLocal<Context> ctx = new ThreadLocal<>();
  
  void service(Request req) {
    ctx.set(new Context(req));
    try {
      // ... handle request
    } finally {
      ctx.remove(); // ALWAYS clean up!
    }
  }
}`,
    explanation: "Each redeployment creates a new ClassLoader. If a static ThreadLocal keeps a reference to any class loaded by the old ClassLoader, that entire ClassLoader (and all its loaded classes in Metaspace) cannot be GC'd.",
  },
  {
    id: 3,
    title: 'Listener Never Deregistered',
    type: 'Heap Space',
    description: 'Event listeners added but never removed. The event source holds a strong reference to each listener.',
    badCode: `// ❌ MEMORY LEAK
class Dashboard {
  Dashboard() {
    // EventBus holds strong ref to this Dashboard
    EventBus.getInstance()
      .addListener(this::onEvent);
    // When Dashboard is "closed", it's still
    // referenced by EventBus!
  }
  void onEvent(Event e) { ... }
}`,
    fixCode: `// ✅ FIXED
class Dashboard {
  private final Runnable cleanup;
  
  Dashboard() {
    Runnable unsubscribe = EventBus.getInstance()
      .addListener(this::onEvent);
    this.cleanup = unsubscribe;
  }
  
  void close() {
    cleanup.run(); // Remove listener on close
  }
}`,
    explanation: "The EventBus (often a singleton) holds strong references to all its listeners. If you never remove a listener, the Dashboard object (and everything it references) stays alive indefinitely.",
  },
  {
    id: 4,
    title: 'ThreadLocal Not Cleaned',
    type: 'Heap Space',
    description: 'Thread pool reuses threads. ThreadLocal values from old tasks accumulate.',
    badCode: `// ❌ MEMORY LEAK
class RequestProcessor {
  // ThreadLocal stores large user context
  static ThreadLocal<UserSession> session =
    new ThreadLocal<>();
    
  void process(Request req) {
    session.set(new UserSession(req));
    // ... process ...
    // Thread returns to pool with stale session!
  }
}`,
    fixCode: `// ✅ FIXED
class RequestProcessor {
  static ThreadLocal<UserSession> session = 
    new ThreadLocal<>();
    
  void process(Request req) {
    session.set(new UserSession(req));
    try {
      // ... process ...
    } finally {
      session.remove(); // Critical!
    }
  }
}`,
    explanation: "Thread pools reuse threads. When a thread returns to the pool, ThreadLocal values persist. The next task running on that thread may encounter or accumulate stale values — and the objects are never GC'd.",
  },
  {
    id: 5,
    title: 'Unbounded Cache',
    type: 'Heap Space',
    description: 'A HashMap used as cache with no eviction. Grows forever until OOM.',
    badCode: `// ❌ MEMORY LEAK
class ImageCache {
  private Map<String, BufferedImage> cache = new HashMap<>();
  BufferedImage get(String path) {
    return cache.computeIfAbsent(path, p -> loadFromDisk(p));
  }
}`,
    fixCode: `// ✅ FIXED
class ImageCache {
  // Use a proper LRU cache
  private Cache<String, BufferedImage> cache = 
    Caffeine.newBuilder().maximumSize(100).build();
}`,
    explanation: "Standard HashMaps have no eviction policy. Every entry added stays in memory until the map itself is cleared or collected. For caches, always use bounded collections or specialized libraries like Caffeine/Guava.",
  },
  {
    id: 6,
    title: 'Inner Class Leak',
    type: 'Heap Space',
    description: 'Anonymous Runnable holds an implicit reference to the outer Activity/Controller, preventing its collection.',
    badCode: `// ❌ MEMORY LEAK
public class TaskController {
  void start() {
    new Thread(new Runnable() {
      public void run() {
        while(true) { /* Do work */ }
      }
    }).start(); // Keeps TaskController alive!
  }
}`,
    fixCode: `// ✅ FIXED
public class TaskController {
  // Use static inner class to break 'this' reference
  static class MyTask implements Runnable {
    public void run() { ... }
  }
}`,
    explanation: "Non-static inner classes and anonymous classes hold an implicit reference to their outer class. If the inner object (like a long-running Thread) lives longer than the outer object, the outer object is leaked.",
  },
  {
    id: 7,
    title: 'Spring Prototype Leak',
    type: 'Heap Space',
    description: 'A prototype bean is injected into a singleton and never destroyed by the container.',
    badCode: `// ❌ MEMORY LEAK
@Component
public class SingletonService {
  @Autowired 
  private PrototypeBean bean; // Injected once, lived forever
}`,
    fixCode: `// ✅ FIXED
@Component
public class SingletonService {
  @Lookup // Spring creates a new instance on every call
  public PrototypeBean getBean() { return null; }
}`,
    explanation: "When a prototype bean is injected into a singleton, it is only created once at startup. If you need a fresh prototype instance each time, you must use Method Injection (@Lookup) or ObjectProvider.",
  },
  {
    id: 8,
    title: 'JDBC Connection Leak',
    type: 'Native Threads',
    description: 'Connections are never returned to the pool because close() is missed after an exception.',
    badCode: `// ❌ MEMORY LEAK
void loadData() throws SQLException {
  Connection c = dataSource.getConnection();
  ResultSet rs = c.createStatement().executeQuery("...");
  // If exception happens here, c.close() is never called
  c.close();
}`,
    fixCode: `// ✅ FIXED
void loadData() throws SQLException {
  try (Connection c = dataSource.getConnection()) {
    // try-with-resources handles auto-close
  }
}`,
    explanation: "Native resources like database connections must be closed explicitly. Using try-with-resources ensures the connection is returned to the pool even if an exception occurs during execution.",
  },
  {
    id: 9,
    title: 'Hibernate Session Cache',
    type: 'Heap Space',
    description: 'Processing 100,000 entities in a single transaction; the Session cache grows to OOM.',
    badCode: `// ❌ MEMORY LEAK
for (int i = 0; i < 100000; i++) {
  User user = new User(i);
  session.save(user); // All 100k held in Session cache!
}`,
    fixCode: `// ✅ FIXED
for (int i = 0; i < 100000; i++) {
  session.save(new User(i));
  if (i % 50 == 0) {
    session.flush(); session.clear(); // Clear first-level cache
  }
}`,
    explanation: "Hibernate's first-level cache (the Session) tracks all objects in the current transaction. When doing bulk updates, you must periodically flush and clear the session to prevent it from consuming all heap memory.",
  },
  {
    id: 10,
    title: 'Kubernetes OOM Kill',
    type: 'OS Signal',
    description: 'JVM exceeds container limits. Linux OOM Killer sends SIGKILL 9.',
    badCode: `// ❌ CONFIG LEAK
// Container Limit: 1GB
// JVM: -Xmx1g
// (JVM crashes because Metaspace + Stacks need room too!)`,
    fixCode: `// ✅ FIXED
// Container Limit: 1GB
// JVM: -Xmx768m
// (Remaining 256MB for non-heap native memory)`,
    explanation: "A JVM process uses significantly more memory than just the heap. If you set -Xmx equal to the container limit, the extra memory used by Metaspace, threads, and the JIT will push the process over the edge, causing a SIGKILL.",
  },
];

function MemoryGrowthChart({ growing, reset }: { growing: boolean; reset: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dataRef = useRef<number[]>([10]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (reset) {
      dataRef.current = [10];
      render();
    }
  }, [reset]);

  useEffect(() => {
    if (growing) {
      timerRef.current = setInterval(() => {
        const last = dataRef.current[dataRef.current.length - 1];
        dataRef.current.push(Math.min(100, last + Math.random() * 5 + 1));
        if (dataRef.current.length > 40) dataRef.current.shift();
        render();
      }, 300);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [growing]);

  const render = () => {
    const svg = d3.select(svgRef.current);
    const w = 380, h = 120;
    svg.selectAll('*').remove();

    const x = d3.scaleLinear().domain([0, 39]).range([0, w]);
    const y = d3.scaleLinear().domain([0, 100]).range([h, 0]);
    const data = dataRef.current;

    const line = d3.line<number>()
      .x((_, i) => x(i + (40 - data.length)))
      .y(d => y(d))
      .curve(d3.curveBasis);

    const area = d3.area<number>()
      .x((_, i) => x(i + (40 - data.length)))
      .y0(h).y1(d => y(d))
      .curve(d3.curveBasis);

    const last = data[data.length - 1];
    const lineColor = last > 80 ? '#ef4444' : last > 60 ? '#f59e0b' : '#00d4ff';
    const areaColor = last > 80 ? 'rgba(239,68,68,0.15)' : last > 60 ? 'rgba(245,158,11,0.15)' : 'rgba(0,212,255,0.1)';

    svg.append('path').datum(data).attr('fill', areaColor).attr('d', area);
    svg.append('path').datum(data).attr('fill', 'none').attr('stroke', lineColor).attr('stroke-width', 2).attr('d', line);

    // OOM threshold line at 95%
    svg.append('line').attr('x1', 0).attr('x2', w).attr('y1', y(95)).attr('y2', y(95))
      .attr('stroke', '#ef4444').attr('stroke-dasharray', '4,2').attr('stroke-width', 1).attr('opacity', 0.6);
    svg.append('text').attr('x', w - 2).attr('y', y(95) - 3).attr('fill', '#ef4444').attr('font-size', 9).attr('text-anchor', 'end').text('OOM');
  };

  useEffect(() => { render(); }, []);

  return (
    <div className="bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.07)] rounded-lg p-3">
      <div className="text-[10px] text-gray-400 font-mono mb-2 flex justify-between">
        <span>HEAP USAGE %</span>
        <span className={dataRef.current[dataRef.current.length - 1] > 80 ? 'text-red-400 animate-pulse' : 'text-gray-500'}>
          {Math.round(dataRef.current[dataRef.current.length - 1])}% Used
        </span>
      </div>
      <svg ref={svgRef} width={380} height={120} className="w-full" />
    </div>
  );
}

export default function DetectiveMode() {
  const [activeScenario, setActiveScenario] = useState<Scenario>(scenarios[0]);
  const [phase, setPhase] = useState<'briefing' | 'leaking' | 'detected' | 'fixed'>('briefing');

  const handleStart = () => setPhase('leaking');
  const handleDetect = () => setPhase('detected');
  const handleFix = () => setPhase('fixed');
  const handleReset = () => setPhase('briefing');

  const selectScenario = (s: Scenario) => {
    setActiveScenario(s);
    setPhase('briefing');
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white font-sans overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[rgba(255,0,0,0.2)] bg-[rgba(255,0,0,0.04)]">
        <Search size={20} className="text-red-400" />
        <h1 className="text-lg font-bold text-white">Detective Mode — Memory Leak Investigation</h1>
        <div className="ml-auto text-xs text-red-400 font-mono animate-pulse">🔴 LIVE</div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Scenario list */}
        <aside className="w-56 border-r border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.3)] shrink-0 overflow-y-auto p-3">
          <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3">Scenarios</div>
          {scenarios.map(s => (
            <button key={s.id}
              onClick={() => selectScenario(s)}
              className={`w-full text-left px-3 py-2.5 rounded mb-1 text-xs transition-all border ${
                activeScenario.id === s.id
                  ? 'bg-[rgba(255,0,0,0.12)] border-red-500/40 text-white'
                  : 'bg-transparent border-transparent text-gray-400 hover:bg-[rgba(255,255,255,0.04)] hover:text-gray-200'
              }`}
            >
              <div className="font-bold">#{s.id} {s.title}</div>
              <div className={`text-[9px] mt-0.5 font-mono ${activeScenario.id === s.id ? 'text-red-400' : 'text-gray-600'}`}>
                {s.type}
              </div>
            </button>
          ))}
        </aside>

        {/* Main area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Scenario title */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-400" />
                {activeScenario.title}
              </h2>
              <p className="text-sm text-gray-400 mt-1 max-w-xl">{activeScenario.description}</p>
            </div>
            <div className="px-3 py-1 bg-[rgba(255,0,0,0.15)] border border-red-500/30 rounded text-xs font-mono text-red-400">
              {activeScenario.type}
            </div>
          </div>

          {/* Phase Stepper */}
          <div className="flex items-center gap-2 text-xs font-mono">
            {['briefing', 'leaking', 'detected', 'fixed'].map((p, i) => (
              <div key={p} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${phase === p ? 'bg-red-400 animate-pulse' : 
                  ['briefing', 'leaking', 'detected', 'fixed'].indexOf(phase) > i ? 'bg-green-400' : 'bg-gray-600'}`} />
                <span className={phase === p ? 'text-white' : 'text-gray-500'}>
                  {p.toUpperCase()}
                </span>
                {i < 3 && <ArrowRight size={10} className="text-gray-600" />}
              </div>
            ))}
          </div>

          {/* Memory Growth D3 Chart */}
          <MemoryGrowthChart growing={phase === 'leaking'} reset={phase === 'briefing'} />

          {/* Code comparison */}
          <div className={`grid gap-4 ${phase === 'fixed' ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {/* Bad code or detected */}
            <div className="bg-[rgba(255,0,0,0.05)] border border-red-500/20 rounded-lg overflow-hidden">
              <div className="px-4 py-2 bg-[rgba(255,0,0,0.1)] text-xs font-bold text-red-400 flex items-center gap-2">
                <AlertTriangle size={12} /> LEAKING CODE
              </div>
              <pre className="p-4 text-[11px] text-gray-300 font-mono whitespace-pre-wrap overflow-auto max-h-52 leading-relaxed">
                {activeScenario.badCode}
              </pre>
            </div>

            {/* Fixed code (only after fix phase) */}
            <AnimatePresence>
              {phase === 'fixed' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[rgba(0,255,138,0.05)] border border-green-500/20 rounded-lg overflow-hidden"
                >
                  <div className="px-4 py-2 bg-[rgba(0,255,138,0.1)] text-xs font-bold text-green-400 flex items-center gap-2">
                    <CheckCircle size={12} /> FIXED CODE
                  </div>
                  <pre className="p-4 text-[11px] text-gray-300 font-mono whitespace-pre-wrap overflow-auto max-h-52 leading-relaxed">
                    {activeScenario.fixCode}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Explanation panel */}
          <AnimatePresence>
            {(phase === 'detected' || phase === 'fixed') && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)] p-4 rounded-lg"
              >
                <div className="text-xs font-bold text-cyan-400 mb-2 flex items-center gap-2">
                  <Zap size={12} /> ROOT CAUSE ANALYSIS
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{activeScenario.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA Buttons */}
          <div className="flex gap-3">
            {phase === 'briefing' && (
              <button onClick={handleStart}
                className="px-5 py-2.5 bg-red-500 hover:bg-red-400 text-white text-sm font-bold rounded transition">
                ▶ Start Leak Simulation
              </button>
            )}
            {phase === 'leaking' && (
              <button onClick={handleDetect}
                className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-bold rounded transition animate-bounce">
                <Search size={14} className="inline mr-1" /> I Found the Leak!
              </button>
            )}
            {phase === 'detected' && (
              <button onClick={handleFix}
                className="px-5 py-2.5 bg-green-500 hover:bg-green-400 text-black text-sm font-bold rounded transition">
                <CheckCircle size={14} className="inline mr-1" /> Show Fix
              </button>
            )}
            {phase === 'fixed' && (
              <button onClick={handleReset}
                className="px-5 py-2.5 bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] text-white text-sm font-bold rounded transition">
                ↺ Reset Scenario
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}