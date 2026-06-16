import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function JITGCChapter() {
  const [inlined, setInlined] = useState(false);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans p-8">
      <div className="mb-8 shrink-0">
         <h1 className="text-3xl font-black mb-2">JIT & GC Cooperation</h1>
         <p className="text-gray-400 text-sm max-w-2xl">The JIT compiler doesn't just make code fast—it makes it <span className="text-white font-bold">GC-Aware</span>. Through Inlining and Safepoint insertion, it coordinates the delicate dance between execution and cleanup.</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-12">
         <div className="flex-1 flex flex-col items-center justify-center space-y-12">
            <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 w-full max-w-lg">
               <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 text-center underline">JIT Optimization: Method Inlining</div>
               
               <div className="flex flex-col items-center gap-8 relative">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-[10px] font-mono text-gray-300 w-48 text-center">
                     public void main() {'{'} <br/>
                     <span className="text-blue-400">log(data);</span> <br/>
                     {'}'}
                  </div>

                  {!inlined && (
                    <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity }} className="text-xl">⬇</motion.div>
                  )}

                  <AnimatePresence mode="wait">
                    {!inlined ? (
                      <motion.div 
                        key="call" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                        className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl text-[10px] font-mono text-gray-300 w-48 text-center"
                      >
                         <span className="text-gray-500 italic">// Method call overhead</span> <br/>
                         public void log() {'{'} ... {'}'}
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="inline" initial={{ opacity: 0, scale: 1.2 }} animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-green-500/10 border-2 border-green-500/50 rounded-xl text-[10px] font-mono text-white w-64 text-center shadow-[0_0_20px_rgba(34,197,94,0.1)]"
                      >
                         public void main() {'{'} <br/>
                         <span className="text-green-400 font-bold">// INLINED CONTENT:</span> <br/>
                         System.out.println(data); <br/>
                         {'}'}
                      </motion.div>
                    )
                  }
                  </AnimatePresence>

                  <button 
                    onClick={() => setInlined(!inlined)}
                    className={`px-8 py-3 rounded-xl font-black text-xs transition uppercase ${inlined ? 'bg-green-500 text-black' : 'bg-white/10 text-white'}`}
                  >
                    {inlined ? 'INLINED ✅' : 'TRIGGER C2 INLINING'}
                  </button>
               </div>
            </div>

            <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl max-w-sm">
               <div className="text-[10px] font-bold text-orange-400 mb-2 uppercase">GC SAFEPOINTS</div>
               <p className="text-[11px] text-gray-400 leading-relaxed italic">
                  JIT inserts <span className="text-white">Safepoint Polls</span> at the end of hot methods and in loop backstories. This ensures the GC doesn't have to wait "forever" to stop the app.
               </p>
            </div>
         </div>

         <div className="w-full lg:w-96 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">The Cooperation</h4>
               <ul className="space-y-4 text-[11px] text-gray-400">
                  <li className="flex gap-3">
                     <span className="text-accent-alive">⚡</span>
                     <span><span className="text-white">Inlining:</span> Removes method call overhead and exposes more code to GC reachability analysis (Escape Analysis).</span>
                  </li>
                  <li className="flex gap-3">
                     <span className="text-accent-alive">⚡</span>
                     <span><span className="text-white">Write Barriers:</span> JIT injects GC book-keeping code (like Card Table dirtying) directly into your native output.</span>
                  </li>
                  <li className="flex gap-3">
                     <span className="text-accent-alive">⚡</span>
                     <span><span className="text-white">Intrinsic Methods:</span> JIT uses handwritten assembly for common GC-heavy operations like `System.arraycopy`.</span>
                  </li>
               </ul>
            </div>
         </div>
      </div>
    </div>
  );
}