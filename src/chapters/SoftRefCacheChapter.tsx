import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SoftRefCacheChapter() {
  const [pressure, setPressure] = useState(20);
  const [cache, setCache] = useState([
    { id: 1, name: 'User_442', size: 15 },
    { id: 2, name: 'Img_Large', size: 40 },
    { id: 3, name: 'Query_Cache', size: 10 },
  ]);

  const evict = () => {
    setCache(prev => prev.filter(item => item.size < (100 - pressure) / 2));
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans p-8">
      <div className="mb-8">
         <h1 className="text-3xl font-black mb-2">SoftReference Caching</h1>
         <p className="text-gray-400 text-sm max-w-2xl">SoftReferences are the best friend of a cache. They stay alive as long as there is enough memory, but <span className="text-orange-400 font-bold">vanish instantly</span> before an OutOfMemoryError occurs.</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-12">
         <div className="flex-1 space-y-8 flex flex-col items-center">
            <div className="w-full max-w-md bg-white/5 p-6 rounded-3xl border border-white/10">
               <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Memory Pressure Stress</span>
                  <span className={`text-sm font-mono ${pressure > 80 ? 'text-red-400' : 'text-green-400'}`}>{pressure}%</span>
               </div>
               <input 
                 type="range" min="0" max="100" value={pressure} 
                 onChange={(e) => { setPressure(parseInt(e.target.value)); if(parseInt(e.target.value) > 70) evict(); }}
                 className="w-full h-1 bg-white/10 rounded-full accent-orange-500 cursor-pointer"
               />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 w-full max-w-2xl">
               <AnimatePresence>
                  {cache.map(item => (
                     <motion.div
                       key={item.id}
                       initial={{ scale: 0.8, opacity: 0 }}
                       animate={{ 
                         scale: 1, 
                         opacity: (100 - pressure) / 100,
                         filter: pressure > 60 ? 'blur(2px)' : 'none'
                       }}
                       exit={{ scale: 1.5, opacity: 0, filter: 'blur(10px)' }}
                       className="aspect-square bg-orange-500/10 border-2 border-orange-500/30 rounded-3xl flex flex-col items-center justify-center p-4 text-center"
                     >
                        <div className="text-2xl mb-1">💾</div>
                        <div className="text-[10px] font-black uppercase text-orange-400">{item.name}</div>
                        <div className="text-[9px] text-gray-600 mt-1">{item.size}MB</div>
                     </motion.div>
                  ))}
               </AnimatePresence>
            </div>
         </div>

         <div className="w-full lg:w-96 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Cache Guarantee</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
                  The JVM guarantees that all SoftReferences will be cleared before it throws an <code className="text-white">OutOfMemoryError</code>.
                  <br/><br/>
                  This makes them perfect for <span className="text-white">Optional Memory</span>—things that improve performance but aren't strictly required for correctness.
               </p>
               <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                  <div className="text-[10px] font-bold text-orange-400 mb-1">JIT Logic:</div>
                  <p className="text-[10px] text-gray-500 italic">"I will kill these softly, to save the app."</p>
               </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-2">LRU Strategy</h4>
               <p className="text-[11px] text-gray-500 leading-relaxed">
                  Most modern JVMs use a clock-based strategy: <code className="text-white">-XX:SoftRefLRUPolicyMSPerMB=1000</code>. 
                  This keeps a softly referenced object alive for 1 second per MB of free heap remaining.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}