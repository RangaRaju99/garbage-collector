import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RuntimeClassChapter() {
  const [view, setView] = useState<'INSTANCE' | 'METADATA'>('INSTANCE');

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans p-8">
      <div className="mb-8 shrink-0">
         <h1 className="text-3xl font-black mb-2">Class Runtime Representation</h1>
         <p className="text-gray-400 text-sm max-w-2xl">The duality of a Java class. It is both <span className="text-blue-400 font-bold">Metadata</span> in Metaspace (for the JVM) and a <span className="text-green-400 font-bold">Java Object</span> on the Heap (for the programmer).</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-12">
         <div className="flex-1 flex flex-col items-center justify-center space-y-8">
            <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
               <button onClick={() => setView('INSTANCE')} className={`px-6 py-2 rounded-lg text-xs font-bold transition ${view === 'INSTANCE' ? 'bg-green-500 text-black' : 'text-gray-500'}`}>USER VIEW (Heap)</button>
               <button onClick={() => setView('METADATA')} className={`px-6 py-2 rounded-lg text-xs font-bold transition ${view === 'METADATA' ? 'bg-blue-500 text-black' : 'text-gray-500'}`}>JVM VIEW (Metaspace)</button>
            </div>

            <div className="w-full max-w-lg aspect-video relative flex items-center justify-center">
               <AnimatePresence mode="wait">
                  {view === 'INSTANCE' ? (
                     <motion.div 
                       key="heap" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.2, opacity: 0 }}
                       className="w-80 h-48 bg-green-500/5 border-2 border-green-500/30 rounded-3xl p-6 flex flex-col justify-center"
                     >
                        <div className="flex items-center gap-4 mb-4">
                           <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center text-2xl font-bold text-green-400">?</div>
                           <div>
                              <div className="text-xs font-black text-white italic">java.lang.Class@4fa2</div>
                              <div className="text-[10px] text-green-500 font-mono">Located in: Old Gen</div>
                           </div>
                        </div>
                        <div className="space-y-1">
                           <div className="text-[10px] text-gray-500 font-mono flex justify-between"><span>.getName()</span> <span className="text-white">"com.app.User"</span></div>
                           <div className="text-[10px] text-gray-500 font-mono flex justify-between"><span>.getClassLoader()</span> <span className="text-white">AppCL@11</span></div>
                        </div>
                     </motion.div>
                  ) : (
                     <motion.div 
                       key="meta" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.2, opacity: 0 }}
                       className="w-80 h-48 bg-blue-500/5 border-2 border-blue-500/30 rounded-3xl p-6 flex flex-col justify-center"
                     >
                        <div className="text-[10px] font-bold text-blue-400 uppercase mb-4 tracking-widest border-b border-blue-500/20 pb-2">Internal instanceKlass</div>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                           <div className="text-[9px] text-gray-400">vTable size: <span className="text-white">24 entries</span></div>
                           <div className="text-[9px] text-gray-400">Class Size: <span className="text-white">1,244 bytes</span></div>
                           <div className="text-[9px] text-gray-400">Access: <span className="text-white">ACC_PUBLIC</span></div>
                           <div className="text-[9px] text-red-400">Klass Pointer: <span className="text-white font-mono">0x7f...a02</span></div>
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>
         </div>

         <div className="w-full lg:w-96 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">The Link</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed">
                  Every object on the heap has a <span className="text-white">class pointer</span> in its header. This points to the <span className="text-blue-400 font-bold">instanceKlass</span> in Metaspace.
                  <br/><br/>
                  The <span className="text-green-400 font-bold">java.lang.Class</span> object you use in reflection is just a Java-friendly wrapper around this internal native structure.
               </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 font-mono text-[10px] text-gray-500 italic">
               Object obj = new User();<br/>
               Class c = obj.getClass(); <br/>
               <span className="text-gray-700">// c lives on heap, but 'obj' header points to Metaspace!</span>
            </div>
         </div>
      </div>
    </div>
  );
}