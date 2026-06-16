import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ObjectResurrectionChapter() {
  const [stage, setStage] = useState<'LIVE' | 'ELGIBLE' | 'FINALIZING' | 'RESURRECTED' | 'DEAD'>('LIVE');

  const advance = () => {
    if (stage === 'LIVE') setStage('ELGIBLE');
    else if (stage === 'ELGIBLE') setStage('FINALIZING');
    else if (stage === 'FINALIZING') setStage('RESURRECTED');
    else if (stage === 'RESURRECTED') setStage('DEAD');
    else setStage('LIVE');
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans p-8">
      <div className="mb-8 shrink-0">
         <h1 className="text-3xl font-black mb-2">Object Resurrection</h1>
         <p className="text-gray-400 text-sm max-w-2xl">The reason `finalize()` is deprecated. An object can literally <span className="text-green-400 font-bold">return to life</span> during its own execution — but only once.</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-12">
         <div className="flex-1 flex flex-col items-center justify-center space-y-12">
            <button onClick={advance} className="px-10 py-4 bg-green-600 text-white font-black rounded-xl hover:scale-105 active:scale-95 transition shadow-[0_0_30px_rgba(34,197,94,0.3)] uppercase">
               ADVANCE TIMELINE: {stage}
            </button>

            <div className="relative h-64 w-64 flex items-center justify-center">
               <AnimatePresence mode="wait">
                  <motion.div
                    key={stage}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ 
                      y: 0, 
                      opacity: stage === 'DEAD' ? 0.1 : 1,
                      scale: stage === 'RESURRECTED' ? 1.2 : 1,
                      filter: stage === 'FINALIZING' ? 'grayscale(1) blur(1px)' : 'none'
                    }}
                    className={`w-48 h-48 rounded-[60px] border-4 flex flex-col items-center justify-center text-center p-6 transition-all ${
                      stage === 'RESURRECTED' ? 'border-green-400 bg-green-500/20' : 
                      stage === 'FINALIZING' ? 'border-gray-500 bg-gray-500/10' :
                      stage === 'DEAD' ? 'border-white/5 bg-transparent' : 'border-blue-500 bg-blue-500/10'
                    }`}
                  >
                     <div className="text-5xl mb-3">
                        {stage === 'LIVE' ? '👤' : stage === 'FINALIZING' ? '👻' : stage === 'RESURRECTED' ? '🧟' : '💀'}
                     </div>
                     <div className="text-xs font-black uppercase tracking-widest">{stage}</div>
                  </motion.div>
               </AnimatePresence>
               
               {stage === 'RESURRECTED' && (
                 <motion.div 
                   initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                   className="absolute -top-12 text-green-400 font-bold text-xs uppercase italic"
                 >
                   "Wait! I store 'this' in a static field!"
                 </motion.div>
               )}
            </div>
         </div>

         <div className="w-full lg:w-96 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">The finalizer trap</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
                  When an object has a <code className="text-white">finalize()</code> method, the GC can't just kill it. It must add it to the <span className="text-white font-bold">Finalizer Queue</span>.
                  <br/><br/>
                  If the object's `finalize()` method assigns <code className="text-white">static_field = this;</code>, the object is suddenly reachable again! It becomes <span className="text-green-400">Resurrected</span>.
               </p>
            </div>

            <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/20">
               <h4 className="text-[10px] font-bold text-red-400 uppercase mb-2">The Limit</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed italic">
                  A finalizer is <span className="text-white">only called once</span> by the JVM. If the resurrected object becomes eligible for GC a second time, it will die immediately. Finalization cannot be looped.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}