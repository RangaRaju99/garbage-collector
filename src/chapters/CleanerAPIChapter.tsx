import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CleanerAPIChapter() {
  const [objects, setObjects] = useState<{ id: number, cleaned: boolean }[]>([]);

  const spawn = () => {
    setObjects(prev => [...prev, { id: Date.now(), cleaned: false }]);
  };

  const triggerCleaner = (id: number) => {
    setObjects(prev => prev.map(o => o.id === id ? { ...o, cleaned: true } : o));
    setTimeout(() => {
      setObjects(prev => prev.filter(o => o.id !== id));
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans p-8">
      <div className="mb-8">
         <h1 className="text-3xl font-black mb-2">The Cleaner API</h1>
         <p className="text-gray-400 text-sm max-w-2xl">Modern, safe finalization. Since <span className="text-white font-bold">Java 9</span>, the `java.lang.ref.Cleaner` provides a way to run cleanup logic without the performance and safety risks of `finalize()`.</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-12">
         <div className="flex-1 space-y-8 flex flex-col items-center">
            <button onClick={spawn} className="px-10 py-4 bg-[#00d4ff] text-black font-black rounded-xl hover:scale-105 active:scale-95 transition shadow-[0_0_30px_rgba(0,212,255,0.2)]">
               REGISTER NEW RESOURCE
            </button>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full max-w-3xl">
               <AnimatePresence>
                  {objects.map(obj => (
                     <motion.div
                       key={obj.id}
                       initial={{ scale: 0.5, opacity: 0 }}
                       animate={{ scale: 1, opacity: 1 }}
                       exit={{ y: -50, opacity: 0 }}
                       className="relative"
                     >
                        <div className={`p-6 bg-white/5 border-2 rounded-2xl flex flex-col items-center justify-center transition-all ${obj.cleaned ? 'border-green-500/50 bg-green-500/10' : 'border-white/10'}`}>
                           <div className="text-3xl mb-2">{obj.cleaned ? '🧹' : '📦'}</div>
                           <div className="text-[9px] font-mono text-gray-500">Resource_{obj.id % 999}</div>
                           
                           {!obj.cleaned && (
                              <button 
                                onClick={() => triggerCleaner(obj.id)}
                                className="mt-4 px-3 py-1 bg-white/10 rounded-lg text-[9px] font-bold hover:bg-white/20 transition"
                              >
                                Dereference
                              </button>
                           )}
                        </div>
                        {obj.cleaned && (
                           <motion.div 
                             initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                             className="absolute inset-x-0 -bottom-6 text-center text-[9px] font-bold text-green-500 uppercase"
                           >
                             Cleaner Executed ✅
                           </motion.div>
                        )}
                     </motion.div>
                  ))}
               </AnimatePresence>
            </div>
         </div>

         <div className="w-full lg:w-96 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Cleaner vs Finalize</h4>
               <ul className="space-y-3 text-[11px] text-gray-400">
                  <li className="flex gap-2">
                     <span className="text-green-500">✅</span>
                     <span>Logic runs in its own thread—doesn't block the GC.</span>
                  </li>
                  <li className="flex gap-2">
                     <span className="text-green-500">✅</span>
                     <span>No "Object Resurrection" possible—safer design.</span>
                  </li>
                  <li className="flex gap-2">
                     <span className="text-green-500">✅</span>
                     <span>Registers a "Cleaning Action" that stays separate from the object.</span>
                  </li>
                  <li className="flex gap-2">
                     <span className="text-red-500">❌</span>
                     <span>Finalize is deprecated and will be removed. Don't use it.</span>
                  </li>
               </ul>
            </div>

            <div className="p-6 rounded-3xl bg-black/40 border border-white/5 font-mono text-[10px] text-gray-500">
               <div className="text-white mb-2 underline tracking-widest">USAGE PATTERN:</div>
               {`static final Cleaner cleaner = Cleaner.create();
...
cleaner.register(this, new State(nativePtr));`}
            </div>
         </div>
      </div>
    </div>
  );
}