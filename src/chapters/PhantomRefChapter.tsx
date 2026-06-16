import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PhantomRefChapter() {
  const [phase, setPhase] = useState<'ALIVE' | 'UNREACHABLE' | 'FINALIZED' | 'PHANTOM' | 'COLLECTED'>('ALIVE');

  const progress = () => {
    if (phase === 'ALIVE') setPhase('UNREACHABLE');
    else if (phase === 'UNREACHABLE') setPhase('FINALIZED');
    else if (phase === 'FINALIZED') setPhase('PHANTOM');
    else if (phase === 'PHANTOM') setPhase('COLLECTED');
    else setPhase('ALIVE');
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans p-8">
      <div className="mb-8">
         <h1 className="text-3xl font-black mb-2">PhantomReference</h1>
         <p className="text-gray-400 text-sm max-w-2xl">The most elusive reference. A PhantomReference is used to know <span className="text-white font-bold">when memory is about to be freed</span>, after finalization has already occurred.</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-12">
         <div className="flex-1 space-y-8 flex flex-col items-center justify-center">
            <button onClick={progress} className="px-10 py-4 bg-purple-600 text-white font-black rounded-xl hover:scale-105 active:scale-95 transition shadow-[0_0_30px_rgba(170,68,255,0.3)]">
               NEXT STAGE: {phase}
            </button>

            <div className="relative h-64 w-64 flex items-center justify-center">
               <AnimatePresence mode="wait">
                  <motion.div
                    key={phase}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    className={`w-40 h-40 rounded-[40px] border-4 flex flex-col items-center justify-center text-center p-4 transition-colors ${
                      phase === 'COLLECTED' ? 'border-transparent bg-transparent' : 'border-purple-500 bg-purple-500/10'
                    }`}
                  >
                     {phase !== 'COLLECTED' && (
                        <>
                           <div className="text-3xl mb-2">{phase === 'ALIVE' ? '💎' : '👻'}</div>
                           <div className="text-[10px] font-black uppercase tracking-tighter">{phase}</div>
                        </>
                     )}
                     {phase === 'COLLECTED' && <div className="text-gray-700 font-mono text-[10px]">MEMORY RELEASED</div>}
                  </motion.div>
               </AnimatePresence>
               
               {/* Reference Beam */}
               <div className="absolute top-1/2 left-full w-24 h-px bg-purple-500/30 dash ml-4" />
            </div>
         </div>

         <div className="w-full lg:w-96 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Lifecycle of a Phantom</h4>
               <div className="space-y-4 text-[11px] text-gray-400">
                  <div className={phase === 'ALIVE' ? 'text-white font-bold' : ''}>1. Alive: Normal object usage.</div>
                  <div className={phase === 'UNREACHABLE' ? 'text-white font-bold' : ''}>2. Unreachable: No strong refs remain.</div>
                  <div className={phase === 'FINALIZED' ? 'text-white font-bold' : ''}>3. Finalized: JVM calls finalize() or Cleaner.</div>
                  <div className={phase === 'PHANTOM' ? 'text-white font-bold' : ''}>4. Enqueued: PhantomRef enters ReferenceQueue.</div>
                  <div className={phase === 'COLLECTED' ? 'text-white font-bold' : ''}>5. Reclaimed: Physical RAM is finally freed.</div>
               </div>
            </div>

            <div className="p-6 rounded-3xl bg-purple-500/5 border border-purple-500/20">
               <h4 className="text-[10px] font-bold text-purple-400 uppercase mb-2">Key Rule</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed italic">
                  Calling <code className="text-white">phantomRef.get()</code> always returns <code className="text-white">null</code>. 
                  You cannot "save" a phantom object. You can only know when it's gone for good.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}