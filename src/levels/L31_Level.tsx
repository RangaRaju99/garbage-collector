import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

type Tier = 'INTERPRETED' | 'C1 (Client)' | 'C2 (Server)';

export default function L31_Level() {
  const [invocations, setInvocations] = useState(0);
  const [tier, setTier] = useState<Tier>('INTERPRETED');
  const [codeCache, setCodeCache] = useState(0);

  useEffect(() => {
    if (invocations > 5000 && tier === 'INTERPRETED') setTier('C1 (Client)');
    if (invocations > 15000 && tier === 'C1 (Client)') setTier('C2 (Server)');
    if (tier !== 'INTERPRETED') setCodeCache(prev => Math.min(100, prev + 1));
  }, [invocations, tier]);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans">
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] rounded text-[10px] font-mono text-[#00d4ff]">L31</span>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">ADVANCED TRACK</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">JIT & The Code Cache</h1>
        <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
          Java doesn't just run bytecode. It <span className="text-accent-alive font-bold">watches your code</span> and compiles hot methods directly into machine code. This is Tiered Compilation.
        </p>
      </div>

      <div className="px-8 pb-8 flex flex-col lg:flex-row gap-12">
         <div className="flex-1 space-y-8">
            <div className="flex justify-center flex-col items-center gap-4">
               <button 
                 onMouseDown={() => {
                   const interval = setInterval(() => setInvocations(p => p + 100), 50);
                   (window as any)._invInt = interval;
                 }}
                 onMouseUp={() => clearInterval((window as any)._invInt)}
                 className="px-10 py-4 bg-accent-alive text-black font-black rounded-xl text-sm transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(0,212,255,0.2)]"
               >
                 HOLD TO EXECUTE: calculate()
               </button>
               <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Method Invocations: {invocations.toLocaleString()}</div>
            </div>

            <div className="p-10 bg-black/40 rounded-[40px] border border-white/5 relative min-h-[300px] flex flex-col items-center justify-center">
               <div className="flex gap-4 mb-12">
                  {(['INTERPRETED', 'C1 (Client)', 'C2 (Server)'] as Tier[]).map(t => (
                     <div key={t} className={`px-4 py-2 rounded-lg border-2 transition-all ${tier === t ? 'bg-accent-alive border-accent-alive text-black shadow-[0_0_30px_rgba(0,212,255,0.3)] scale-110' : 'bg-transparent border-white/5 text-gray-600'}`}>
                        <div className="text-[8px] font-black uppercase mb-1">{t === tier ? 'ACTIVE' : 'TIER'}</div>
                        <div className="text-[10px] font-bold">{t}</div>
                     </div>
                  ))}
               </div>

               <div className="w-full max-w-md space-y-4">
                  <div className="flex justify-between text-[10px] text-gray-500 uppercase font-black">
                     <span>Code Cache Usage (Native)</span>
                     <span>{codeCache}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                     <motion.div 
                       animate={{ width: `${codeCache}%` }}
                       className="absolute inset-y-0 left-0 bg-blue-500 shadow-[0_0_20px_rgba(0,212,255,0.5)]"
                     />
                  </div>
               </div>
            </div>
         </div>

         <div className="w-full lg:w-96 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Tiered Compilation</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed space-y-4">
                  1. **Interpreted**: Very slow but zero delay.
                  <br/>
                  2. **C1**: Fast compilation, simple optimizations. Starts around 1,500 calls.
                  <br/>
                  3. **C2**: High-performance "Heavyweight" compilation. In-lining, loop unrolling, and branch prediction. Starts around 10,000 calls.
               </p>
            </div>

            <div className="p-6 rounded-3xl bg-accent-alive/5 border border-accent-alive/20">
               <h4 className="text-[10px] font-bold text-accent-alive uppercase mb-2">Memory Insight</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed">
                  Compiled code travels into a special heap called the <span className="text-white font-bold">Code Cache</span>. It is NOT part of the Java Heap. If it fills up, the JIT turns off, and your app's performance will drop by 90%!
               </p>
               <p className="text-[10px] text-gray-600 font-mono mt-3 uppercase tracking-tighter">-XX:InitialCodeCacheSize</p>
            </div>
         </div>
      </div>
    </div>
  );
}