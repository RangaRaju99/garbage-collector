import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Cpu, Terminal, Zap, CheckCircle, Info } from 'lucide-react';

type Disaster = { id: string; title: string; lang: string; code: string; explosion: string; color: string; };

const disasters: Disaster[] = [
  {
    id: 'leak', title: 'Memory Leak', color: '#f59e0b',
    lang: 'C',
    code: `void handleRequest() {
  char* buffer = malloc(1024);
  // ❌ Missing free(buffer)!
  // Memory stays allocated until
  // process termination.
  return;
}`,
    explosion: 'Heap fills up monotonically. OS eventually sends SIGKILL 9.',
  },
  {
    id: 'dangling', title: 'Dangling Pointer', color: '#ef4444',
    lang: 'C',
    code: `User* u = malloc(sizeof(User));
u->id = 1;
free(u); // ✅ Memory released
// ...
printf("%d", u->id); // ❌ USE AFTER FREE
// Reading stale or random memory.`,
    explosion: 'Accessing deallocated addresses causes non-deterministic crashes.',
  },
  {
    id: 'overflow', title: 'Buffer Overflow', color: '#f97316',
    lang: 'C',
    code: `char username[8];
// ❌ No bounds check!
strcpy(username, "Alexandra_Smith");
// Overflow overwrites the stack frame.`,
    explosion: 'Adjacent memory corruption. Classic security vulnerability point.',
  },
];

export default function L01_Level() {
  const [active, setActive] = useState<string | null>(null);
  const [showJava, setShowJava] = useState(false);

  return (
    <div className="h-full flex flex-col bg-transparent text-white overflow-y-auto font-sans custom-scrollbar">
      {/* Content Container */}
      <div className="max-w-6xl mx-auto p-12 space-y-12">
        
        {/* Header Section */}
        <header className="space-y-4">
          <div className="flex items-center gap-3">
             <span className="px-2 py-0.5 bg-brand-primary/10 border border-brand-primary/20 rounded text-[10px] font-mono text-brand-primary font-black uppercase">Module L01</span>
             <span className="h-px w-8 bg-zinc-800" />
             <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">The Evolution of Managed Memory</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight leading-none italic">Why does Java need GC?</h1>
          <p className="text-[16px] text-zinc-400 font-medium leading-relaxed max-w-3xl">
            Before managed runtimes, memory was a manual battlefield. Developers were responsible for manually tracking every byte. 
            A single mistake meant process death or security vulnerability.
          </p>
        </header>

        {/* Legacy Comparison */}
        <section className="space-y-6">
           <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">
             <ShieldAlert size={12} className="text-status-error" /> Legacy Memory Vectors
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {disasters.map((d) => (
               <motion.button
                 key={d.id}
                 onClick={() => setActive(active === d.id ? null : d.id)}
                 className={`text-left p-6 rounded-2xl border transition-all duration-300 relative group overflow-hidden ${
                   active === d.id
                     ? 'bg-zinc-950 border-white/20 ring-1 ring-white/10 shadow-2xl scale-[1.02]'
                     : 'bg-zinc-950/40 border-white/5 hover:border-white/10'
                 }`}
               >
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color, boxShadow: `0 0 10px ${d.color}44` }} />
                       <span className="text-[12px] font-black uppercase tracking-tight text-white">{d.title}</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-zinc-600 bg-black/40 px-2 py-0.5 rounded border border-white/5">{d.lang}</span>
                 </div>
                 
                 <div className="bg-black/60 rounded-xl p-4 mb-4 border border-white/5 group-hover:border-white/10 transition-colors">
                    <pre className="text-[11px] font-mono text-zinc-400 leading-relaxed overflow-hidden">
                      {d.code}
                    </pre>
                 </div>

                 <AnimatePresence>
                   {active === d.id && (
                     <motion.div
                       initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                       className="p-4 bg-status-error/10 border border-status-error/20 rounded-xl"
                     >
                       <div className="flex items-start gap-3">
                         <Zap size={14} className="text-status-error shrink-0 mt-0.5" />
                         <p className="text-[12px] text-status-error font-medium leading-relaxed">{d.explosion}</p>
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
                 
                 {!active && (
                   <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest text-center opacity-0 group-hover:opacity-100 transition-opacity">
                     Analyze vulnerability
                   </div>
                 )}
               </motion.button>
             ))}
           </div>
        </section>

        {/* Java Modernization */}
        <section className="bg-brand-primary/5 border border-brand-primary/10 rounded-3xl p-10 space-y-8 relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 p-10 opacity-5">
              <Cpu size={120} className="text-brand-primary" />
           </div>

           <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 rounded-2xl bg-brand-primary/20 flex items-center justify-center border border-brand-primary/30 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                    <CheckCircle size={24} className="text-brand-primary" />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-white italic tracking-tight uppercase">JVM Architecture: Managed Runtime</h2>
                    <p className="text-[13px] text-zinc-500 font-medium">Automatic Memory Management via Garbage Collection</p>
                 </div>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="bg-black/60 border border-white/5 rounded-2xl p-6 shadow-inner">
                  <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                     <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                       <Terminal size={10} /> source_code.java
                     </span>
                  </div>
                  <pre className="text-[13px] font-mono text-zinc-300 leading-loose">
{`// Memory is managed by the JVM
User u = new User("Alice");

// ... once finished
u = null; // Mark as eligible

// 🤖 GC processes reachability
// 🤖 Reclaims contiguous blocks
// 🤖 No manual free() required`}
                  </pre>
                </div>

                <div className="flex flex-col justify-center space-y-4">
                  {[
                    'Automated GC prevents dangling pointers (UAF)',
                    'Bound checks eliminate buffer overflows',
                    'Strong typing prevents wild/uninitialized pointers',
                    'Predictable memory layout (Object Header + Fields)',
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3 group">
                       <div className="w-5 h-5 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500 transition-transform group-hover:scale-110">
                          <CheckCircle size={10} />
                       </div>
                       <span className="text-[13px] text-zinc-300 font-bold tracking-tight">{benefit}</span>
                    </div>
                  ))}
                  
                  <div className="pt-4 flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5 text-zinc-500 text-[11px] font-medium italic">
                    <Info size={14} className="text-zinc-600" />
                    Tradeoff: STW pauses and runtime memory overhead.
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button 
                  onClick={() => setShowJava(!showJava)}
                  className="px-6 py-3 bg-zinc-900 border border-white/10 hover:border-brand-primary/50 text-zinc-300 hover:text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 group"
                >
                  Inspect Object Lifecycle <Activity size={14} className={`transition-transform duration-500 ${showJava ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <AnimatePresence>
                {showJava && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-4 p-6 bg-black/40 rounded-2xl border border-white/5 overflow-x-auto custom-scrollbar">
                       {['Allocation', 'TLAB Bump', 'Eden Space', 'Survivor S0', 'Tenuring', 'Old Gen'].map((step, i) => (
                          <div key={i} className="flex items-center gap-4 shrink-0">
                             <div className="flex flex-col items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary text-[10px] font-black">
                                   {i + 1}
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{step}</span>
                             </div>
                             {i < 5 && <ArrowLeft size={14} className="text-zinc-800 rotate-180 mb-6" />}
                          </div>
                       ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </section>

      </div>
    </div>
  );
}