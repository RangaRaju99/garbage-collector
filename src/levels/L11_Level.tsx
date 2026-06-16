import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function L11_Level() {
  const [useTLAB, setUseTLAB] = useState(true);
  const [threads, setThreads] = useState([
    { id: 1, pos: 0, progress: 0, allocations: 0 },
    { id: 2, pos: 25, progress: 0, allocations: 0 },
    { id: 3, pos: 50, progress: 0, allocations: 0 },
    { id: 4, pos: 75, progress: 0, allocations: 0 },
  ]);
  const [contention, setContention] = useState(0);

  const simulateAllocation = () => {
    setThreads(prev => prev.map(t => {
      const nextProgress = t.progress + 15 + Math.random() * 20;
      if (nextProgress >= 100) {
        if (!useTLAB) setContention(c => c + 1);
        return { ...t, progress: 0, allocations: t.allocations + 1 };
      }
      return { ...t, progress: nextProgress };
    }));
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans">
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] rounded text-[10px] font-mono text-[#00d4ff]">L11</span>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">INTERMEDIATE TRACK</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Young Gen: Eden & TLAB</h1>
        <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
          The birth district. Most objects die young, so allocation here must be lightning-fast. 
          The secret? <span className="text-accent-alive font-bold">Thread Local Allocation Buffers (TLAB)</span>.
        </p>
      </div>

      <div className="px-8 pb-8 flex flex-col gap-6">
         {/* Toggle */}
         <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-xl w-fit">
            <span className={`text-sm font-bold ${!useTLAB ? 'text-red-400' : 'text-gray-500'}`}>Shared Eden (Global Lock)</span>
            <button 
              onClick={() => { setUseTLAB(!useTLAB); setContention(0); }}
              className={`w-12 h-6 rounded-full relative transition-colors ${useTLAB ? 'bg-accent-alive' : 'bg-gray-700'}`}
            >
               <motion.div 
                 animate={{ x: useTLAB ? 26 : 2 }}
                 className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
               />
            </button>
            <span className={`text-sm font-bold ${useTLAB ? 'text-accent-alive' : 'text-gray-500'}`}>TLAB (Lock-Free)</span>
         </div>

         {/* Simulation Arena */}
         <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 relative h-64 bg-black/40 border border-white/5 rounded-2xl p-6 overflow-hidden">
               <div className="absolute inset-x-0 top-0 h-1 bg-white/5" />
               <div className="absolute inset-x-0 bottom-0 h-1 bg-white/5" />
               
               {/* Allocation Pointers */}
               {threads.map((t, i) => (
                  <div key={t.id} className="mb-4">
                     <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-mono text-gray-500">Thread-{t.id}</span>
                        <span className="text-[10px] font-mono text-accent-alive">{t.allocations} objs</span>
                     </div>
                     <div className="h-6 w-full bg-white/5 rounded-md relative overflow-hidden flex items-center px-1">
                        {!useTLAB && i > 0 && <div className="absolute inset-0 bg-red-900/10 z-0" />}
                        <motion.div 
                           className="h-4 bg-accent-alive/40 rounded-sm border border-accent-alive/40"
                           animate={{ width: `${t.progress}%` }}
                           transition={{ duration: 0.1 }}
                        />
                        {useTLAB && (
                           <div className="absolute right-0 top-0 bottom-0 w-[40%] border-l border-dashed border-white/10 flex items-center justify-center text-[8px] text-gray-600 uppercase font-black">
                              TLAB Zone
                           </div>
                        )}
                        {!useTLAB && (
                           <AnimatePresence>
                              {t.progress > 80 && (
                                 <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="absolute inset-0 flex items-center justify-center bg-red-500/20 text-[10px] font-bold text-red-400"
                                 >
                                    SYNC LOCK REQUIRED 🔒
                                 </motion.div>
                              )}
                           </AnimatePresence>
                        )}
                     </div>
                  </div>
               ))}
               
               <button 
                 onMouseDown={() => {
                   const int = setInterval(simulateAllocation, 50);
                   const stop = () => { clearInterval(int); window.removeEventListener('mouseup', stop); };
                   window.addEventListener('mouseup', stop);
                 }}
                 className="absolute bottom-6 right-6 px-4 py-2 bg-accent-alive text-black font-black rounded-lg text-xs hover:scale-105 active:scale-95 transition shadow-[0_0_20px_rgba(0,212,255,0.3)]"
               >
                 HOLD TO ALLOCATE
               </button>
            </div>

            <div className="w-full lg:w-80 space-y-4">
               <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">Performance Impact</h4>
                  <div className="space-y-4">
                     <div>
                        <div className="flex justify-between text-[10px] mb-1">
                           <span className="text-gray-500 uppercase">Lock Contention</span>
                           <span className="text-red-400">{contention} events</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                           <motion.div 
                             className="h-full bg-red-500"
                             animate={{ width: `${Math.min(contention * 2, 100)}%` }}
                           />
                        </div>
                     </div>
                     <div>
                        <div className="flex justify-between text-[10px] mb-1">
                           <span className="text-gray-500 uppercase">Allocation Speed</span>
                           <span className="text-accent-alive">{useTLAB ? 'LOCK-FREE' : 'SYNCHRONIZED'}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                           <motion.div 
                             className="h-full bg-accent-alive"
                             animate={{ width: useTLAB ? '100%' : '30%' }}
                           />
                        </div>
                     </div>
                  </div>
               </div>

               <div className="p-5 rounded-2xl bg-accent-alive/5 border border-accent-alive/20">
                  <h4 className="text-[10px] font-bold text-accent-alive uppercase mb-2">Did you know?</h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                     TLAB is enabled by default in modern JVMs. It allows each thread to allocate objects in its own private "slab" of Eden using a 
                     <span className="text-white"> bump-the-pointer</span> technique. Since no other thread can access this slab, <span className="text-white">zero locks</span> are needed.
                  </p>
                  <p className="text-[10px] text-gray-600 font-mono mt-3">-XX:+UseTLAB</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}