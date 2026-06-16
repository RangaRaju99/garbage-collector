import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type RefType = 'STRONG' | 'SOFT' | 'WEAK' | 'PHANTOM';

export default function L28_Level() {
  const [type, setType] = useState<RefType>('STRONG');
  const [pressure, setPressure] = useState(20);
  const [alive, setAlive] = useState(true);

  const runGC = () => {
    let survived = true;
    if (type === 'WEAK') survived = false;
    if (type === 'SOFT' && pressure > 80) survived = false;
    if (type === 'PHANTOM') survived = false; 
    setAlive(survived);
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans">
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] rounded text-[10px] font-mono text-[#00d4ff]">L28</span>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">INTERMEDIATE TRACK</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Reference Types</h1>
        <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
          Not all references are created equal. Java provides 4 levels of "attachment" to an object, 
          letting you control <span className="text-accent-alive font-bold">how aggressively</span> the GC reclaims them.
        </p>
      </div>

      <div className="px-8 pb-8 flex flex-col lg:flex-row gap-12">
         <div className="flex-1 space-y-8">
            <div className="flex justify-between items-center">
               <div className="flex bg-white/5 p-1 rounded-xl w-fit border border-white/5">
                  {(['STRONG', 'SOFT', 'WEAK', 'PHANTOM'] as RefType[]).map(t => (
                     <button 
                       key={t} onClick={() => { setType(t); setAlive(true); }}
                       className={`px-4 py-2 rounded-lg text-[10px] font-bold transition ${type === t ? 'bg-accent-alive text-black' : 'text-gray-500 hover:text-white'}`}
                     >
                       {t}
                     </button>
                  ))}
               </div>
               <button 
                 onClick={runGC}
                 className="px-8 py-2 bg-white text-black font-black rounded-lg text-xs hover:scale-105 active:scale-95 transition"
               >
                 TRIGGER GC
               </button>
            </div>

            <div className="p-10 bg-black/40 rounded-[40px] border border-white/5 relative flex flex-col items-center">
               {/* Pressure Slider */}
               <div className="w-full mb-12">
                  <div className="flex justify-between text-[10px] mb-2 font-mono uppercase tracking-widest text-gray-500">
                     <span>GC Pressure (Memory Stress)</span>
                     <span className={pressure > 70 ? 'text-red-400' : 'text-green-400'}>{pressure}%</span>
                  </div>
                  <input 
                     type="range" min="0" max="100" value={pressure} 
                     onChange={(e) => setPressure(parseInt(e.target.value))}
                     className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-alive"
                  />
               </div>

               <div className="relative">
                  {/* The Object */}
                  <AnimatePresence>
                     {alive ? (
                        <motion.div 
                          key="obj" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.5, opacity: 0, filter: 'blur(20px)' }}
                          className="w-48 h-48 rounded-[60px] bg-gradient-to-br from-accent-alive to-blue-700 shadow-[0_0_50px_rgba(0,212,255,0.3)] flex items-center justify-center border-4 border-white/10"
                        >
                           <div className="text-center">
                              <div className="text-3xl mb-2">💎</div>
                              <div className="text-[10px] font-black uppercase tracking-widest">Object</div>
                           </div>
                        </motion.div>
                     ) : (
                        <motion.div 
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="w-48 h-48 rounded-[60px] border-2 border-dashed border-white/10 flex items-center justify-center"
                        >
                           <div className="text-[10px] uppercase font-bold text-gray-700">Reclaimed</div>
                        </motion.div>
                     )}
                  </AnimatePresence>

                  {/* The Reference Line */}
                  <div className="absolute top-1/2 right-full mr-12 -translate-y-1/2">
                     <div className="text-right">
                        <div className="text-[10px] font-bold text-gray-500 uppercase mb-2">Variable</div>
                        <div className="w-24 h-0.5 bg-white/20 relative">
                           <div className={`absolute inset-0 bg-accent-alive transition-all duration-1000 ${type === 'STRONG' ? 'opacity-100' : type === 'SOFT' ? 'opacity-60 dash' : 'opacity-20 dash-fast'}`} />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className="w-full lg:w-96 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Ref Encyclopedia</h4>
               <div className="space-y-4">
                  <div className={`p-4 rounded-xl border transition ${type === 'STRONG' ? 'bg-blue-500/10 border-blue-500/40' : 'bg-transparent border-transparent'}`}>
                     <div className="text-[10px] font-bold text-blue-400 mb-1">StrongReference</div>
                     <p className="text-[9px] text-gray-500">Your standard `Object o = new Object()`. Will NEVER be collected as long as reachable.</p>
                  </div>
                  <div className={`p-4 rounded-xl border transition ${type === 'SOFT' ? 'bg-orange-500/10 border-orange-500/40' : 'bg-transparent border-transparent'}`}>
                     <div className="text-[10px] font-bold text-orange-400 mb-1">SoftReference (Cache)</div>
                     <p className="text-[9px] text-gray-500">GC only reclaims these if the JVM is actually running out of memory (High Pressure).</p>
                  </div>
                  <div className={`p-4 rounded-xl border transition ${type === 'WEAK' ? 'bg-green-500/10 border-green-500/40' : 'bg-transparent border-transparent'}`}>
                     <div className="text-[10px] font-bold text-green-400 mb-1">WeakReference (Maps)</div>
                     <p className="text-[9px] text-gray-500">The next GC cycle will reclaim these immediately, regardless of memory pressure.</p>
                  </div>
               </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-2">Phantom References</h4>
               <p className="text-[11px] text-gray-500 leading-relaxed">
                  Used for cleanups <span className="text-white">after</span> the object is finalized but before memory is reclaimed. Replaced the old (and buggy) `finalize()` method.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}