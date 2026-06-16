import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Track = 'beginner' | 'intermediate' | 'interview' | 'engineer';

const beginnerTopics = [
  'What is the JVM and why does it exist?',
  'Stack Memory vs Heap Memory',
  'What happens when you write new Employee()?',
  'What is Garbage Collection?',
  'Strong references — the default',
  'Minor GC — Young Generation collection',
  'Eden → Survivor: the object\'s first journey',
  'Promotion to Old Generation',
  'OutOfMemoryError — what causes it?',
  'System.gc() — does it actually run GC?',
  'What is a memory leak in Java?',
  'Java vs C — who manages memory?',
  'PermGen vs Metaspace — the big change',
  'Object lifecycle overview',
];

const intermediatTopics = [
  'TLAB — Zero-lock allocation',
  'Escape Analysis — stack vs heap decision',
  'All 4 reference types in depth',
  'Card Table — cross-generation references',
  'G1 GC — 6-phase cycle',
  'ZGC — colored pointer technique',
  'Safepoints and TTSP problem',
  'JVM Flags — heap sizing',
  'Reading GC logs',
  'GC overhead limit exceeded',
  'WeakHashMap internals',
  'SoftReference caches',
  'ClassLoader hierarchy',
  'finalize() and Cleaner API',
  'Direct memory (ByteBuffer.allocateDirect)',
  'Humongous objects in G1',
  'Remembered Sets vs Card Tables',
  'SATB write barriers',
  'Object Header bit layout',
  'Generational hypothesis data',
];

const interviewQA = [
  { q: 'What is GC and why does Java need it?', a: 'GC automatically reclaims heap memory occupied by objects no longer reachable by any GC root. Java needs it because manual memory management (malloc/free) leads to memory leaks, dangling pointers, and buffer overflows — all of which are impossible in Java with GC.' },
  { q: 'Explain the Generational Hypothesis.', a: 'Most objects die young — typically over 90% are unreachable after their first GC. Generational collection exploits this by separately collecting Young Gen (frequently, cheap) and Old Gen (rarely, expensive). A Minor GC takes 5-50ms vs Full GC which can take seconds.' },
  { q: 'What\'s the difference between Minor, Major, and Full GC?', a: 'Minor GC = Young Gen only (Eden + Survivors). Major GC = Old Gen (CMS/G1 concurrent collection). Full GC = STW collection of ENTIRE heap (Young + Old + Metaspace). Full GC should be avoided in production — indicates a memory pressure problem.' },
  { q: 'How does G1 GC differ from CMS?', a: 'G1 uses region-based heap (no fixed gen boundaries), compacts during evacuation (no fragmentation), targets pause goals, and has predictable pause times. CMS has no compaction (fragmentation), can fail with Concurrent Mode Failure, and was removed in Java 14.' },
  { q: 'What is a safepoint?', a: 'A safepoint is a JVM execution point where all Java threads are suspended and all GC roots are precisely known. Required before any STW operation. JIT inserts polls at method returns and loop back-edges. TTSP (Time To Safepoint) delay occurs when threads are in tight loops without polls.' },
  { q: 'What is TLAB and why does it exist?', a: 'Thread-Local Allocation Buffer — a private chunk of Eden given to each thread. Objects are allocated within TLAB via bump pointer — no lock needed. Without TLAB, every allocation would require a CAS on the shared Eden pointer, causing contention at scale.' },
  { q: 'Explain all 4 Java reference types.', a: 'Strong: default, never GC\'d while reachable. Soft: cleared under memory pressure — ideal for caches. Weak: cleared at next GC — used by WeakHashMap. Phantom: get() always null — used for post-finalization cleanup notifications (Cleaner API).' },
  { q: 'What is PermGen and why was it removed in Java 8?', a: 'PermGen (Permanent Generation) was a fixed-size heap region storing class metadata. Fixed size caused OOM on dynamic class loading. Java 8 replaced it with Metaspace — class metadata in native OS memory, unbounded by default, grows as the OS allows.' },
  { q: 'How does ZGC achieve sub-ms pauses?', a: 'Colored pointers store GC metadata IN the pointer bits (M0/M1/Remapped). Load barriers intercept every object READ and perform pointer healing lazily. Marking and relocation happen concurrently while the app runs. Only brief safepoints for phase transitions (<1ms regardless of heap size).' },
  { q: 'What is Escape Analysis?', a: 'JIT compiler analysis that determines if an object can "escape" its allocation method (via return value, stored in field, passed to another thread). If NOT: JVM can allocate on stack (zero GC pressure) or replace with scalar fields (no object at all). Default since Java 8: -XX:+DoEscapeAnalysis.' },
  { q: 'What is the Mark Word?', a: 'The first 64 bits of every Java object header. Stores: HashCode (31 bits), GC Age (4 bits), lock state, and in ZGC/Shenandoah — forwarding pointer. State: [01]=unlocked, [00]=lightweight lock, [10]=heavyweight monitor, [11]=GC mark forwarding.' },
  { q: 'How does the Card Table work?', a: 'The heap is divided into 512-byte cards. Each has a corresponding byte in the card table. When an Old Gen object writes a reference to a Young Gen object, that card is marked DIRTY. Minor GC then only scans dirty cards to find cross-generation references — not the entire Old Gen.' },
  { q: 'What is SATB in G1?', a: 'Snapshot At The Beginning — a write barrier technique. Before a reference is overwritten during concurrent marking, the OLD value is saved to an SATB buffer. This ensures no live objects are missed (concurrent marking sees a snapshot of reachability at marking start). Remark phase processes SATB buffers.' },
  { q: 'Remembered Sets vs Card Table?', a: 'Card Table: global structure tracking which 512-byte CARDS in Old Gen hold refs to Young Gen. Remembered Set: per-region structure in G1 tracking which OTHER REGIONS reference this region. Card Table = coarse global. RSet = fine-grained per-region (enables G1\'s independent region collection).' },
  { q: 'How do you detect a memory leak in production?', a: 'Heap trending up after GC (D3 graph). GC frequency increasing. Full GC happening repeatedly. Use: jmap -heap, jmat -histo for heap histogram. jfr/async-profiler for allocation hotspots. MAT (Eclipse) for heap dump dominator tree. Key: find which GC root path keeps suspect objects alive.' },
  { q: 'What causes GC overhead limit exceeded?', a: 'JVM triggers this OOM when it spends >98% of CPU time in GC but recovers <2% of heap per collection. Usually indicates: memory leak where almost all objects are reachable, heap too small for the workload, or very large amount of long-lived data crowding out short-lived allocations.' },
  { q: 'What is a Humongous Object in G1?', a: 'An object >50% of a G1 region size. Allocated directly in one or more consecutive Old Gen regions. Bypasses Young Gen entirely. Collected only during concurrent marking (not Minor GC). Excessive humongous allocations cause fragmentation and prevent normal region recycling.' },
  { q: 'What is the Brooks Pointer in Shenandoah?', a: 'An extra pointer stored IN every object header pointing to the object\'s current location. During concurrent evacuation: points to new location. Any access via old address follows Brooks pointer transparently. Enables concurrent compaction — even WRITES to moving objects are safe.' },
  { q: 'Difference between WeakReference and SoftReference?', a: 'WeakReference: collected at NEXT GC regardless of heap pressure. Too aggressive for caches. Use for: WeakHashMap keys, canonical mappings. SoftReference: collected ONLY under memory pressure (before OOM). Ideal for caches. JVM guarantees to clear all soft refs before throwing OOM.' },
  { q: 'What is object resurrection?', a: 'In finalize(): assigning this to a static field prevents collection. Object survives, turns green. But finalize() is NOT called again — so second time eligible, object is collected permanently. Resurrection is a design anti-pattern. Deprecated Java 9, use Cleaner API instead.' },
  { q: 'How do you size JVM memory in Kubernetes?', a: 'Set -Xmx = container_limit × 0.75 (not 1.0!). The other 25% covers: Metaspace + Code Cache (~240MB) + Thread stacks (threads × 256KB) + Direct Memory + GC overhead. Also: -XX:+UseContainerSupport (default on Java 10+) makes JVM respect cgroup limits automatically.' },
  { q: 'Does runtime.gc() actually run GC?', a: 'It sends a REQUEST to the JVM. JVM may honor or ignore it based on: heap pressure, configured GC policy, and -XX:+DisableExplicitGC flag. In production with -XX:+DisableExplicitGC, System.gc() is a no-op. Never rely on it in production code for correctness.' },
  { q: 'What is On-Stack Replacement (OSR)?', a: 'JIT compiles a hot method while it\'s executing. OSR replaces the interpreter frame with the compiled frame MID-EXECUTION — without waiting for the method to return. The method transitions from slow interpreter to fast native code while actively running.' },
  { q: 'What is Concurrent Mode Failure in CMS?', a: 'CMS collects Old Gen concurrently while the app runs. But if Old Gen fills up before the concurrent sweep completes, CMS falls back to a full STW collection using the Serial Old collector. Result: a seconds-long pause. Fixed by: setting -XX:CMSInitiatingOccupancyFraction=70 to start earlier.' },
  { q: 'What is the Code Cache and what happens when it fills?', a: 'The Code Cache stores JIT-compiled native methods. When full: JIT compilation stops. All methods fall back to interpreted execution (deoptimization). This causes sudden throughput drop. Fix: -XX:ReservedCodeCacheSize=512m. Monitor: -XX:+PrintCodeCache.' },
];

export default function LearnMode() {
  const [track, setTrack] = useState<Track>('beginner');
  const [completedBeginner, setCompletedBeginner] = useState<Set<number>>(new Set());
  const [completedIntermediate, setCompletedIntermediate] = useState<Set<number>>(new Set());
  const [activeQ, setActiveQ] = useState<number | null>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set());

  const toggleBeginner = (i: number) => {
    setCompletedBeginner(s => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });
  };
  const toggleIntermediate = (i: number) => {
    setCompletedIntermediate(s => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });
  };
  const revealAnswer = (i: number) => {
    setRevealedAnswers(s => { const n = new Set(s); n.add(i); return n; });
  };

  const tracks = [
    { id: 'beginner' as Track, label: 'Beginner', count: beginnerTopics.length, color: '#00ff88' },
    { id: 'intermediate' as Track, label: 'Intermediate', count: intermediatTopics.length, color: '#00d4ff' },
    { id: 'interview' as Track, label: 'Interview Q&A', count: interviewQA.length, color: '#ffaa00' },
    { id: 'engineer' as Track, label: 'JVM Engineer', count: 8, color: '#ff44aa' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-hidden">
      {/* Track selector */}
      <div className="flex gap-1 px-4 pt-4 pb-3 border-b border-[rgba(255,255,255,0.05)] overflow-x-auto shrink-0">
        {tracks.map(t => (
          <button key={t.id} onClick={() => { setTrack(t.id); setActiveQ(null); }}
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition border"
            style={{
              backgroundColor: track === t.id ? `${t.color}15` : 'transparent',
              borderColor: track === t.id ? `${t.color}50` : 'rgba(255,255,255,0.06)',
              color: track === t.id ? t.color : '#666',
            }}
          >
            {t.label}
            <span className="px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.07)] text-[9px]">{t.count}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Beginner Track */}
        {track === 'beginner' && (
          <div className="p-4 space-y-1">
            <div className="text-[10px] text-gray-600 mb-3">Click topics to mark complete. {completedBeginner.size}/{beginnerTopics.length} done.</div>
            {beginnerTopics.map((topic, i) => (
              <motion.button key={i} onClick={() => toggleBeginner(i)} whileHover={{ scale: 1.005 }}
                className={`w-full text-left px-4 py-3 rounded-lg border flex items-center gap-3 transition-all ${
                  completedBeginner.has(i) ? 'bg-[rgba(0,255,136,0.06)] border-[rgba(0,255,136,0.2)] text-[#00ff88]' : 'border-[rgba(255,255,255,0.05)] text-gray-300 hover:border-[rgba(255,255,255,0.15)]'
                }`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] shrink-0 ${completedBeginner.has(i) ? 'bg-[#00ff88] border-[#00ff88] text-black' : 'border-gray-600'}`}>
                  {completedBeginner.has(i) ? '✓' : i + 1}
                </div>
                <span className="text-sm">{topic}</span>
              </motion.button>
            ))}
          </div>
        )}

        {/* Intermediate Track */}
        {track === 'intermediate' && (
          <div className="p-4 space-y-1">
            <div className="text-[10px] text-gray-600 mb-3">Advanced JVM concepts. {completedIntermediate.size}/{intermediatTopics.length} done.</div>
            {intermediatTopics.map((topic, i) => (
              <motion.button key={i} onClick={() => toggleIntermediate(i)} whileHover={{ scale: 1.005 }}
                className={`w-full text-left px-4 py-3 rounded-lg border flex items-center gap-3 transition-all ${
                  completedIntermediate.has(i) ? 'bg-[rgba(0,212,255,0.06)] border-[rgba(0,212,255,0.2)] text-[#00d4ff]' : 'border-[rgba(255,255,255,0.05)] text-gray-300 hover:border-[rgba(255,255,255,0.15)]'
                }`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] shrink-0 ${completedIntermediate.has(i) ? 'bg-[#00d4ff] border-[#00d4ff] text-black' : 'border-gray-600'}`}>
                  {completedIntermediate.has(i) ? '✓' : i + 1}
                </div>
                <span className="text-sm">{topic}</span>
              </motion.button>
            ))}
          </div>
        )}

        {/* Interview Q&A */}
        {track === 'interview' && (
          <div className="p-4 space-y-2">
            <div className="text-[10px] text-gray-600 mb-3">Click question → think → reveal answer. {revealedAnswers.size}/{interviewQA.length} reviewed.</div>
            {interviewQA.map((qa, i) => (
              <div key={i} className="border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden">
                <button onClick={() => setActiveQ(activeQ === i ? null : i)}
                  className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-[rgba(255,255,255,0.03)] transition">
                  <span className="shrink-0 w-5 h-5 rounded bg-[rgba(255,170,0,0.15)] border border-[rgba(255,170,0,0.3)] text-[#ffaa00] text-[10px] font-bold flex items-center justify-center">
                    {revealedAnswers.has(i) ? '✓' : i + 1}
                  </span>
                  <span className="text-sm text-gray-200 leading-snug">{qa.q}</span>
                  <span className="ml-auto text-gray-600 shrink-0">{activeQ === i ? '▼' : '▶'}</span>
                </button>
                <AnimatePresence>
                  {activeQ === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      {!revealedAnswers.has(i) ? (
                        <div className="px-4 pb-3 pt-1 flex items-center gap-3">
                          <p className="text-xs text-gray-500 italic">Think about your answer first...</p>
                          <button onClick={() => revealAnswer(i)}
                            className="px-3 py-1 bg-[rgba(255,170,0,0.15)] border border-[rgba(255,170,0,0.3)] text-[#ffaa00] rounded text-[10px] font-bold hover:bg-[rgba(255,170,0,0.25)] transition shrink-0">
                            Reveal Answer
                          </button>
                        </div>
                      ) : (
                        <div className="px-4 pb-3 pt-1 border-t border-[rgba(255,255,255,0.05)] bg-[rgba(0,255,136,0.04)]">
                          <p className="text-sm text-gray-300 leading-relaxed">{qa.a}</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}

        {/* Engineer Mode */}
        {track === 'engineer' && (
          <div className="p-4 space-y-3">
            <div className="text-[10px] text-gray-600 mb-3">Advanced JVM engineering challenges and tooling.</div>
            {[
              { title: 'Runtime API Monitor', desc: 'Live Runtime.getRuntime() visualization', status: 'L35: ACTIVE' },
              { title: 'Reference Mastery', desc: 'Weak/Soft/Phantom & Queue simulation', status: 'L36-L38: ACTIVE' },
              { title: 'Metaspace Leak Lab', desc: 'Diagnose ClassLoader memory leaks', status: 'L39: ACTIVE' },
              { title: 'Object Lifecycle Advanced', desc: 'Resurrection & Finalizer Pipeline', status: 'L40-L41: ACTIVE' },
              { title: 'Evolution Timeline', desc: 'Historical JVM timeline (Java 1.0 to 25+)', status: 'L42: ACTIVE' },
              { title: 'Container Sizing Calculator', desc: 'Calculate -Xmx for K8s pod limit', status: 'L26 REF: ACTIVE' },
              { title: 'GC Log Parser', desc: 'Paste -Xlog:gc output → get visual timeline', status: 'L33: ACTIVE' },
              { title: 'NMT Dashboard', desc: 'Native Memory Tracking breakdown', status: 'L32: ACTIVE' },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl border border-[rgba(255,68,170,0.15)] bg-[rgba(255,68,170,0.04)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white text-sm">{item.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                  <span className="text-[9px] font-mono text-pink-400 bg-[rgba(255,68,170,0.1)] px-2 py-0.5 rounded shrink-0">{item.status}</span>
                </div>
              </div>
            ))}

            {/* Container sizing calculator */}
            <ContainerSizingCalculator />
          </div>
        )}
      </div>
    </div>
  );
}

function ContainerSizingCalculator() {
  const [containerMB, setContainerMB] = useState(2048);
  const xmx = Math.round(containerMB * 0.75);
  const meta = 256;
  const code = 240;
  const threads = 100;
  const threadStack = 0.5; // MB per thread
  const direct = 256;
  const total = xmx + meta + code + Math.round(threads * threadStack) + direct;

  return (
    <div className="p-4 rounded-xl border border-[rgba(0,212,255,0.15)] bg-[rgba(0,212,255,0.04)]">
      <div className="text-xs font-bold text-[#00d4ff] mb-3">🧮 Container Memory Sizing Calculator</div>
      <div className="flex items-center gap-3 mb-4">
        <label className="text-xs text-gray-400 shrink-0">Container limit:</label>
        <input type="range" min={512} max={16384} step={256} value={containerMB} onChange={e => setContainerMB(+e.target.value)}
          className="flex-1 accent-cyan-400" />
        <span className="text-sm font-mono text-[#00d4ff] w-14 text-right">{containerMB}MB</span>
      </div>
      <div className="space-y-1 text-[11px] font-mono">
        {[
          { label: '-Xmx (75% of container)', val: xmx, color: '#00d4ff' },
          { label: 'Metaspace estimate', val: meta, color: '#00ff88' },
          { label: 'Code Cache', val: code, color: '#aa44ff' },
          { label: `${threads} threads × ${threadStack}MB stack`, val: Math.round(threads * threadStack), color: '#ffaa00' },
          { label: 'Direct Memory', val: direct, color: '#ff6b00' },
        ].map(r => (
          <div key={r.label} className="flex justify-between">
            <span className="text-gray-500">{r.label}</span>
            <span style={{ color: r.color }}>{r.val}MB</span>
          </div>
        ))}
        <div className="border-t border-[rgba(255,255,255,0.08)] pt-1 flex justify-between font-bold">
          <span className="text-white">Total JVM Process</span>
          <span className={total > containerMB ? 'text-red-400' : 'text-green-400'}>{total}MB {total > containerMB ? '⚠ EXCEEDS CONTAINER!' : '✓ Safe'}</span>
        </div>
      </div>
    </div>
  );
}