import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle, GraduationCap, Zap, Activity } from 'lucide-react';

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
  'Finalization Pipeline (Classic)',
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
  'Direct memory (Off-heap)',
  'Humongous objects in G1',
  'Remembered Sets vs Card Tables',
  'SATB write barriers',
  'Object Header bit layout',
];

const interviewQA = [
  { q: 'What is GC and why does Java need it?', a: 'GC automatically reclaims heap memory occupied by objects no longer reachable by any GC root. Java needs it because manual memory management (malloc/free) leads to memory leaks, dangling pointers, and buffer overflows — all of which are mitigated by GC.' },
  { q: 'Explain the Generational Hypothesis.', a: 'Most objects die young — over 90% are unreachable after their first GC cycle. Generational collection exploits this by separately collecting Young Gen (frequently, cheap) and Old Gen (rarely, expensive).' },
  { q: 'How does G1 GC differ from CMS?', a: 'G1 uses region-based heap (no fixed gen boundaries), compacts during evacuation (no fragmentation), and targets specific pause goals. CMS has no compaction, leading to fragmentation and potentially expensive Full GCs.' },
  { q: 'What is a safepoint?', a: 'A safepoint is a JVM execution point where all Java threads are suspended and all GC roots are precisely known. Required before any STW (Stop-The-World) operation.' },
  { q: 'Explain all 4 Java reference types.', a: 'Strong: default, never GC’d. Soft: cleared under memory pressure (caches). Weak: cleared at next GC (WeakHashMap). Phantom: get() always null, used for post-finalization cleanup via Cleaner API.' },
  { q: 'What is Escape Analysis?', a: 'JIT analysis determining if an object can "escape" its allocation method. If not, JVM can allocate on stack (zero GC pressure) or replace with scalar fields.' },
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
    { id: 'beginner' as Track, label: 'Beginner', count: beginnerTopics.length, color: '#10b981' },
    { id: 'intermediate' as Track, label: 'Intermediate', count: intermediatTopics.length, color: '#3b82f6' },
    { id: 'interview' as Track, label: 'Interview', count: interviewQA.length, color: '#f59e0b' },
    { id: 'engineer' as Track, label: 'Labs', count: 8, color: '#8b5cf6' },
  ];

  return (
    <div className="h-full flex flex-col bg-surface-secondary overflow-hidden font-sans">
      {/* Track selector */}
      <div className="px-5 py-4 border-b border-white/5 bg-black/20 flex gap-1 overflow-x-auto shrink-0 custom-scrollbar">
        {tracks.map(t => (
          <button 
            key={t.id} 
            onClick={() => { setTrack(t.id); setActiveQ(null); }}
            className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
              track === t.id 
                ? 'bg-zinc-800 border-white/10 text-white shadow-lg' 
                : 'bg-transparent border-transparent text-zinc-600 hover:text-zinc-400'
            }`}
          >
            {t.label}
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono ${track === t.id ? 'bg-white/10' : 'bg-black/20'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={track}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-1.5"
          >
            {track === 'beginner' && (
              <>
                <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4 px-1 flex justify-between">
                   <span>Core Concepts</span>
                   <span className="text-brand-primary">{completedBeginner.size} / {beginnerTopics.length}</span>
                </div>
                {beginnerTopics.map((topic, i) => (
                  <button 
                    key={i} 
                    onClick={() => toggleBeginner(i)}
                    className={`w-full text-left px-4 py-3 rounded-xl border flex items-center justify-between transition-all group ${
                      completedBeginner.has(i) 
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500 shadow-sm' 
                        : 'bg-zinc-950/30 border-white/5 text-zinc-400 hover:border-white/10 hover:bg-zinc-950/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                       <div className={`w-5 h-5 rounded-md border flex items-center justify-center text-[10px] font-mono shrink-0 transition-colors ${
                         completedBeginner.has(i) ? 'bg-emerald-500 border-emerald-500 text-black shadow-lg' : 'border-zinc-800 bg-black/20 text-zinc-700'
                       }`}>
                          {completedBeginner.has(i) ? '✓' : i + 1}
                       </div>
                       <span className={`text-[12px] font-semibold leading-tight ${completedBeginner.has(i) ? 'text-zinc-200' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                         {topic}
                       </span>
                    </div>
                  </button>
                ))}
              </>
            )}

            {track === 'intermediate' && (
              <>
                <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4 px-1 flex justify-between">
                   <span>Advanced Architecture</span>
                   <span className="text-brand-primary">{completedIntermediate.size} / {intermediatTopics.length}</span>
                </div>
                {intermediatTopics.map((topic, i) => (
                  <button 
                    key={i} 
                    onClick={() => toggleIntermediate(i)}
                    className={`w-full text-left px-4 py-3 rounded-xl border flex items-center justify-between transition-all group ${
                      completedIntermediate.has(i) 
                        ? 'bg-brand-primary/5 border-brand-primary/20 text-brand-primary shadow-sm' 
                        : 'bg-zinc-950/30 border-white/5 text-zinc-400 hover:border-white/10 hover:bg-zinc-950/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                       <div className={`w-5 h-5 rounded-md border flex items-center justify-center text-[10px] font-mono shrink-0 transition-colors ${
                         completedIntermediate.has(i) ? 'bg-brand-primary border-brand-primary text-white shadow-lg' : 'border-zinc-800 bg-black/20 text-zinc-700'
                       }`}>
                          {completedIntermediate.has(i) ? '✓' : i + 1}
                       </div>
                       <span className={`text-[12px] font-semibold leading-tight ${completedIntermediate.has(i) ? 'text-zinc-200' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                         {topic}
                       </span>
                    </div>
                  </button>
                ))}
              </>
            )}

            {track === 'interview' && (
              <>
                <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4 px-1">Interview Prep Guide</div>
                {interviewQA.map((qa, i) => (
                  <div key={i} className="bg-zinc-950/30 border border-white/5 rounded-2xl overflow-hidden shadow-sm">
                    <button 
                      onClick={() => setActiveQ(activeQ === i ? null : i)}
                      className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-white/[0.02] transition-all group"
                    >
                      <div className="shrink-0 w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-black flex items-center justify-center">
                        {revealedAnswers.has(i) ? '✓' : i + 1}
                      </div>
                      <span className="text-[12px] font-bold text-zinc-300 leading-snug group-hover:text-white transition-colors">{qa.q}</span>
                    </button>
                    <AnimatePresence>
                      {activeQ === i && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-5 pt-0">
                            {!revealedAnswers.has(i) ? (
                              <button 
                                onClick={() => revealAnswer(i)}
                                className="w-full py-2 bg-amber-500 text-black rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all shadow-lg active:scale-[0.98]"
                              >
                                Reveal Explanation
                              </button>
                            ) : (
                              <div className="p-4 bg-zinc-900/50 rounded-xl border border-white/5">
                                <p className="text-[12px] text-zinc-400 leading-relaxed font-medium">
                                   {qa.a}
                                </p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </>
            )}

            {track === 'engineer' && (
              <div className="space-y-4">
                <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1 px-1">Engineering Labs</div>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { title: 'Runtime API', desc: 'Live Runtime.getRuntime() visualization', icon: <Activity size={14}/> },
                    { title: 'Reference Lab', desc: 'Weak/Soft/Phantom reference simulation', icon: <GraduationCap size={14}/> },
                    { title: 'Leak Diagnosis', desc: 'ClassLoader & Metaspace leak labs', icon: <Zap size={14}/> },
                    { title: 'JIT Workspace', desc: 'Code Cache & OSR visualization', icon: <BookOpen size={14}/> },
                  ].map((item, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-zinc-950/40 border border-white/5 flex items-center justify-between group hover:bg-zinc-950/60 transition-all cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500">
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="text-[12px] font-bold text-zinc-200 uppercase tracking-tight">{item.title}</h4>
                          <p className="text-[10px] text-zinc-500 font-medium">{item.desc}</p>
                        </div>
                      </div>
                      <div className="px-2 py-1 bg-white/5 rounded text-[8px] font-mono text-zinc-600 border border-white/5">ENG_MODE</div>
                    </div>
                  ))}
                </div>
                
                <ContainerSizingCalculator />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function ContainerSizingCalculator() {
  const [containerMB, setContainerMB] = useState(2048);
  const xmx = Math.round(containerMB * 0.75);
  const meta = 256;
  const threads = 100;
  const total = xmx + meta + Math.round(threads * 1) + 256;

  return (
    <div className="p-5 bg-zinc-950/60 border border-brand-primary/20 rounded-2xl space-y-4 mt-6">
      <div className="flex items-center gap-2 text-[10px] font-bold text-brand-primary uppercase tracking-widest">
        <Activity size={12} /> Container Sizing Helper
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center text-[11px] font-bold text-zinc-400">
           <span>Pod Memory Limit</span>
           <span className="text-white font-mono">{containerMB} MB</span>
        </div>
        <input 
          type="range" min={512} max={16384} step={256} 
          value={containerMB} onChange={e => setContainerMB(+e.target.value)}
          className="w-full h-1 bg-white/5 rounded-full accent-brand-primary" 
        />
      </div>

      <div className="space-y-2 py-2 border-y border-white/5">
        <div className="flex justify-between text-[10px] font-medium font-mono">
           <span className="text-zinc-600">-Xmx (75%)</span>
           <span className="text-brand-primary">{xmx} MB</span>
        </div>
        <div className="flex justify-between text-[10px] font-medium font-mono">
           <span className="text-zinc-600">Off-Heap Overhead</span>
           <span className="text-zinc-400">{total - xmx} MB</span>
        </div>
      </div>

      <div className={`p-3 rounded-lg flex items-center justify-between transition-colors ${
        total > containerMB ? 'bg-status-error/10 text-status-error' : 'bg-emerald-500/10 text-emerald-500'
      }`}>
        <span className="text-[10px] font-black uppercase tracking-widest">
           {total > containerMB ? 'OVER_LIMIT' : 'SAFE_THRESHOLD'}
        </span>
        <span className="text-[12px] font-black font-mono">{total} MB Total</span>
      </div>
    </div>
  );
}