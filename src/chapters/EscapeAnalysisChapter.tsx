import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EscapeAnalysisChapter() {
  const [escapes, setEscapes] = useState(true);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans p-8">
      <div className="mb-8 shrink-0">
         <h1 className="text-3xl font-black mb-2">Escape Analysis</h1>
         <p className="text-gray-400 text-sm max-w-2xl">The JIT's hidden superpower. By analyzing if an object "escapes" its method, the JVM can completely <span className="text-white font-bold">eliminate heap allocation</span>, moving it to the lightning-fast Thread Stack.</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-12">
         <div className="flex-1 flex flex-col items-center justify-center space-y-12">
            <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
               <button onClick={() => setEscapes(true)} className={`px-6 py-2 rounded-lg text-xs font-bold transition ${escapes ? 'bg-red-500 text-white' : 'text-gray-500'}`}>OBJECT ESCAPES</button>
               <button onClick={() => setEscapes(false)} className={`px-6 py-2 rounded-lg text-xs font-bold transition ${!escapes ? 'bg-green-500 text-black' : 'text-gray-500'}`}>NO ESCAPE ✅</button>
            </div>

            <div className="relative w-full max-w-lg h-64 bg-black/40 border border-white/5 rounded-[40px] overflow-hidden flex items-center justify-around px-8">
               {/* Method Scope */}
               <div className="w-40 h-40 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-end p-4">
                  <div className="text-[10px] text-gray-700 font-bold uppercase mb-auto">Method Scope</div>
                  <motion.div
                    animate={{ 
                      y: escapes ? -100 : 0, 
                      scale: escapes ? 0.3 : 1,
                      opacity: escapes ? 0 : 1,
                      backgroundColor: escapes ? '#ff4444' : '#00ff88'
                    }}
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                  >
                    📦
                  </motion.div>
               </div>

               <div className="text-4xl text-gray-800">→</div>

               {/* Heap vs Stack */}
               <div className="w-40 h-40 border-2 border-white/5 bg-white/5 rounded-3xl flex flex-col items-center justify-center">
                  <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2">{escapes ? 'JAVA HEAP' : 'THREAD STACK'}</div>
                  <AnimatePresence>
                     {escapes ? (
                        <motion.div key="heap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl">🏜️</motion.div>
                       ) : (
                        <motion.div key="stack" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl">⚡</motion.div>
                       )
                     }
                  </AnimatePresence>
               </div>
            </div>

            <p className="text-xs font-mono text-gray-500 text-center max-w-sm">
               {escapes 
                 ? "Object is returned or stored in a static field. It must live on the heap and be collected by GC later."
                 : "Object never leaves the method. JIT can allocate it on the STACK. Zero GC pressure. High cache locality."}
            </p>
         </div>

         <div className="w-full lg:w-96 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Scalar Replacement</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
                  When No Escape is detected, the JVM doesn't just move the object to the stack—it often <span className="text-white">explodes</span> it.
                  <br/><br/>
                  The object's fields become local variables (scalars), and the object itself <span className="text-white">never exists</span> in memory at all.
               </p>
            </div>

            <div className="p-6 bg-green-500/5 border border-green-500/20 rounded-3xl">
               <h4 className="text-[10px] font-bold text-green-400 uppercase mb-2">Performance Impact</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed italic">
                  Enabled by <code className="text-white">-XX:+DoEscapeAnalysis</code> (default). It's why small, short-lived objects (like Iterators or Points) have almost zero cost in modern Java.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}