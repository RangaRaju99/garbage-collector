import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, ArrowRight, Activity, Terminal, ShieldAlert, Cpu, Search } from 'lucide-react';
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
    description: 'A static List grows unboundedly. Objects are added but never removed, staying alive as long as the ClassLoader exists.',
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
      events.poll(); 
    events.offer(e);
  }
}`,
    explanation: "Static fields are GC roots. Objects in static collections are always reachable. Use bounded or weak collections for event buses.",
  },
  {
    id: 2,
    title: 'ClassLoader Leak',
    type: 'Metaspace OOM',
    description: 'Redeployments fail because old ClassLoaders are held by static ThreadLocals during hot-loading.',
    badCode: `// ❌ MEMORY LEAK
class MyServlet {
  static ThreadLocal<MyServlet> context = 
    new ThreadLocal<>();
  
  void init() {
    context.set(this); // Ref to ClassLoader!
  }
}`,
    fixCode: `// ✅ FIXED
class MyServlet {
  void service(Request req) {
    ctx.set(new Context(req));
    try {
      // process request
    } finally {
      ctx.remove(); // Cleanup!
    }
  }
}`,
    explanation: "ThreadLocals must be removed explicitly, otherwise they keep their values (and thus ClassLoaders) alive in long-lived thread pools.",
  },
  {
    id: 3,
    title: 'Dangling Listeners',
    type: 'Heap Space',
    description: 'Listeners added to long-lived singletons are never deregistered, preventing objects from being reclaimed.',
    badCode: `// ❌ MEMORY LEAK
EventBus.getInstance()
  .addListener(this::onEvent);`,
    fixCode: `// ✅ FIXED
public void close() {
  EventBus.getInstance()
    .removeListener(this::onEvent);
}`,
    explanation: "Observables hold strong references to Observers. Always deregister in close/dispose methods.",
  },
];

function MemoryChart({ growing, reset }: { growing: boolean; reset: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dataRef = useRef<number[]>([15]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (reset) { dataRef.current = [15]; render(); }
  }, [reset]);

  useEffect(() => {
    if (growing) {
      timerRef.current = setInterval(() => {
        const last = dataRef.current[dataRef.current.length - 1];
        dataRef.current.push(Math.min(99, last + Math.random() * 5 + 2));
        if (dataRef.current.length > 30) dataRef.current.shift();
        render();
      }, 300);
    } else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [growing]);

  const render = () => {
    const svg = d3.select(svgRef.current);
    const w = 400, h = 80;
    svg.selectAll('*').remove();
    const x = d3.scaleLinear().domain([0, 29]).range([0, w]);
    const y = d3.scaleLinear().domain([0, 100]).range([h, 0]);
    const color = dataRef.current[dataRef.current.length - 1] > 80 ? '#ef4444' : '#3b82f6';
    
    svg.append('path').datum(dataRef.current)
      .attr('fill', 'none').attr('stroke', color).attr('stroke-width', 2)
      .attr('d', d3.line<number>().x((_, i) => x(i)).y(d => y(d)).curve(d3.curveMonotoneX));
    
    svg.append('path').datum(dataRef.current)
      .attr('fill', color).attr('fill-opacity', 0.1)
      .attr('d', d3.area<number>().x((_, i) => x(i)).y0(h).y1(d => y(d)).curve(d3.curveMonotoneX));
  };

  useEffect(() => { render(); }, []);

  return <svg ref={svgRef} className="w-full h-20" viewBox="0 0 400 80" preserveAspectRatio="none" />;
}

export default function DetectiveMode() {
  const [activeScenario, setActiveScenario] = useState<Scenario>(scenarios[0]);
  const [phase, setPhase] = useState<'briefing' | 'leaking' | 'detected' | 'fixed'>('briefing');

  return (
    <div className="h-full flex flex-col bg-surface-secondary overflow-hidden font-sans border-l border-white/5">
      {/* Header */}
      <div className="px-5 py-5 border-b border-white/5 bg-black/20 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-status-error/10 border border-status-error/20 flex items-center justify-center">
            <ShieldAlert size={14} className="text-status-error" />
          </div>
          <div>
            <h2 className="text-[12px] font-black text-white tracking-widest uppercase">Detective Case</h2>
            <p className="text-[9px] text-zinc-500 font-mono tracking-wider mt-0.5 font-bold">Investigation Loop v4.2</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-2 py-0.5 bg-zinc-800 rounded-md border border-white/5">
          <Activity size={10} className="text-zinc-500" />
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest uppercase">Active Analysis</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Compact Sidebar */}
        <aside className="w-56 shrink-0 border-r border-white/5 bg-black/10 flex flex-col pt-4">
          <div className="px-4 mb-4">
             <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Select Case</span>
          </div>
          <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
            {scenarios.map(s => (
              <button
                key={s.id}
                onClick={() => { setActiveScenario(s); setPhase('briefing'); }}
                className={`w-full text-left px-3 py-3 rounded-xl transition-all relative group ${
                  activeScenario.id === s.id ? 'bg-white/[0.05] text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <div className="text-[11px] font-bold leading-tight mb-1">{s.title}</div>
                <div className="text-[8px] font-black uppercase tracking-widest opacity-40">{s.type}</div>
                {activeScenario.id === s.id && (
                  <div className="absolute left-1 top-3 bottom-3 w-0.5 bg-brand-primary rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Diagnostic Area */}
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-surface-primary/10">
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight italic mb-3">{activeScenario.title}</h1>
              <p className="text-[12px] text-zinc-400 font-medium leading-relaxed bg-zinc-950/40 p-4 rounded-xl border border-white/5 border-l-2 border-l-brand-primary/50">
                {activeScenario.description}
              </p>
            </div>

            {/* Live Chart */}
            <div className="p-4 bg-zinc-950 border border-white/5 rounded-2xl shadow-inner relative overflow-hidden">
               <div className="flex justify-between items-center mb-4">
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                    <Activity size={10} /> Heap Consumption Velocity
                  </span>
                  <div className="flex items-center gap-2">
                     <div className={`w-1.5 h-1.5 rounded-full ${phase === 'leaking' ? 'bg-status-error animate-pulse' : 'bg-zinc-800'}`} />
                     <span className="text-[9px] font-mono text-zinc-500">REALTIME_TELEMETRY</span>
                  </div>
               </div>
               <MemoryChart growing={phase === 'leaking'} reset={phase === 'briefing'} />
            </div>

            {/* Code Workspace */}
            <div className={`grid gap-4 ${phase === 'fixed' ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <div className="bg-zinc-950 border border-white/5 rounded-xl overflow-hidden shadow-2xl relative group">
                <div className="px-4 py-2 border-b border-white/5 bg-zinc-900/50 flex justify-between items-center">
                  <span className="text-[9px] font-bold text-status-error uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldAlert size={10} /> Leak Point Isolated
                  </span>
                </div>
                <pre className="p-5 text-[11px] text-zinc-400 font-mono leading-relaxed bg-black/40">
                  {activeScenario.badCode}
                </pre>
                {phase === 'detected' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-status-error/5 flex items-center justify-center backdrop-blur-[1px]">
                     <div className="bg-status-error text-white px-4 py-1 rounded text-[10px] font-black uppercase tracking-widest shadow-2xl">Leak Confirmed</div>
                  </motion.div>
                )}
              </div>

              {phase === 'fixed' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="bg-zinc-950 border border-white/5 rounded-xl overflow-hidden shadow-2xl">
                  <div className="px-4 py-2 border-b border-white/5 bg-emerald-500/5 flex justify-between">
                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                      <CheckCircle size={10} /> Validated Fix
                    </span>
                  </div>
                  <pre className="p-5 text-[11px] text-zinc-300 font-mono leading-relaxed bg-black/40">
                    {activeScenario.fixCode}
                  </pre>
                </motion.div>
              )}
            </div>

            {/* Discovery Controls */}
            <div className="flex gap-3 pt-4">
              {phase === 'briefing' && (
                <button onClick={() => setPhase('leaking')} className="flex-1 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-all shadow-xl active:scale-95">
                  Launch Stress Test
                </button>
              )}
              {phase === 'leaking' && (
                <button onClick={() => setPhase('detected')} className="flex-1 py-3 bg-status-error text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500 transition-all shadow-xl active:scale-95">
                  Trigger Heap Dump
                </button>
              )}
              {phase === 'detected' && (
                <button onClick={() => setPhase('fixed')} className="flex-1 py-3 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all shadow-xl active:scale-95">
                  Analyze Root Cause
                </button>
              )}
              {phase === 'fixed' && (
                <button onClick={() => setPhase('briefing')} className="flex-1 py-3 bg-zinc-900 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-all active:scale-95">
                  Close Investigation
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}