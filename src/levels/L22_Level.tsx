import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function L22_Level() {
  const [phase, setPhase] = useState<'IDLE' | 'EVAC'>('IDLE');
  const [moved, setMoved] = useState(false);

  const triggerEvac = async () => {
    setPhase('EVAC');
    await new Promise(r => setTimeout(r, 1000));
    setMoved(true);
    await new Promise(r => setTimeout(r, 1000));
    setPhase('IDLE');
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans">
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] rounded text-[10px] font-mono text-[#00d4ff]">L22</span>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">INTERMEDIATE TRACK</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Shenandoah: Brooks Pointers</h1>
        <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
          How to move objects <span className="text-accent-alive font-bold">while they are being used</span>? 
          Shenandoah uses a "Pointer to Self" in the object header to enable concurrent evacuation.
        </p>
      </div>

      <div className="px-8 pb-8 flex flex-col lg:flex-row gap-12 justify-center items-center">
         <div className="flex-1 space-y-12">
            <div className="flex justify-center">
               <button 
                 onClick={triggerEvac} disabled={phase !== 'IDLE'}
                 className="px-10 py-4 bg-accent-alive text-black font-black rounded-xl text-sm transition-all shadow-[0_0_30px_rgba(0,212,255,0.3)]"
               >
                 {phase === 'IDLE' ? 'EVACUATE OBJECT CONCURRENTLY' : 'EVACUATING...'}
               </button>
            </div>

            <div className="relative h-[250px] w-full flex items-center justify-between px-20">
               {/* Old Block */}
               <motion.div 
                 animate={{ opacity: moved ? 0.3 : 1, scale: moved ? 0.9 : 1 }}
                 className="w-48 h-32 rounded-3xl bg-white/5 border-2 border-white/10 flex flex-col items-center justify-center relative"
               >
                  <div className="text-[10px] font-bold text-gray-500 mb-2 uppercase">Original Object</div>
                  <div className="p-2 rounded bg-black/40 border border-white/5 font-mono text-[10px] text-accent-alive">
                     Brooks: {moved ? '-> New' : '-> Self'}
                  </div>
                  {moved && (
                     <motion.div 
                       layoutId="pointer"
                       className="absolute top-1/2 left-full w-24 h-0.5 bg-accent-alive origin-left z-20"
                       initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                     />
                  )}
               </motion.div>

               {/* New Block */}
               <AnimatePresence>
                  {phase === 'EVAC' && (
                     <motion.div 
                       initial={{ x: 100, opacity: 0 }}
                       animate={{ x: 0, opacity: 1 }}
                       className="w-48 h-32 rounded-3xl bg-blue-500/20 border-2 border-blue-500 flex flex-col items-center justify-center relative"
                     >
                        <div className="text-[10px] font-bold text-blue-400 mb-2 uppercase">New Copy</div>
                        <div className="p-2 rounded bg-black/40 border border-blue-500/30 font-mono text-[10px] text-blue-400">
                           Brooks: {'->'} Self
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>

            <div className="p-6 bg-black/40 rounded-3xl border border-white/10">
               <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">The Logic</div>
               <p className="text-[11px] text-gray-500 leading-relaxed">
                  During compaction, Shenandoah copies the object to a new location. But what if a thread tries to write to the old one?
                  <br/><br/>
                  The **Brooks Pointer** acts as a traffic controller. Every read/write is redirected to the "True" address. 
                  Once the copy is done, the pointer is swapped, and the old memory is reclaimed—all without stopping the app.
               </p>
            </div>
         </div>

         <div className="w-full lg:w-96 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 border-l-4 border-l-accent-alive">
               <h4 className="text-xs font-bold text-accent-alive uppercase tracking-widest mb-4">Concurrent Evacuation</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
                  G1 pauses to move objects. Shenandoah (and ZGC) move them while the application is active.
               </p>
               <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px]">
                     <span className="text-green-500">✔</span>
                     <span>Zero STW Compaction</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                     <span className="text-green-500">✔</span>
                     <span>Predictable Latency</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                     <span className="text-red-500">✖</span>
                     <span>Barrier Overhead (write checks)</span>
                  </div>
               </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-2">Developed by Red Hat</h4>
               <p className="text-[11px] text-gray-500 leading-relaxed">
                  Shenandoah was developed outside Oracle by Red Hat to solve the "huge heap" pause problem. It was backported to Java 8u and 11, making it a powerful choice for legacy enterprise systems needing ultra-low latency.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}