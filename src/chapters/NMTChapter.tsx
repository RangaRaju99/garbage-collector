import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NMTChapter() {
  const [showNative, setShowNative] = useState(false);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans p-8">
      <div className="mb-8 shrink-0">
         <h1 className="text-3xl font-black mb-2">Native Memory Tracking (NMT)</h1>
         <p className="text-gray-400 text-sm max-w-2xl">The truth beyond the Heap. Use NMT to track every byte of memory the JVM uses outside of `-Xmx`, including Code Cache, Metaspace, and Thread Stacks.</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-12">
         <div className="flex-1 flex flex-col items-center justify-center space-y-12">
            <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-[40px] p-8 relative overflow-hidden">
               <div className="text-center mb-8 relative z-10">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">JVM Process RSS</div>
                  <div className="text-4xl font-black text-white">1,412 MB</div>
               </div>

               <div className="space-y-4">
                  {/* Heap */}
                  <div className="space-y-1">
                     <div className="flex justify-between text-[10px] font-mono text-gray-500"><span>Java Heap (-Xmx)</span> <span>1024MB</span></div>
                     <div className="h-4 bg-blue-500/30 border border-blue-500/50 rounded-sm" />
                  </div>

                  <AnimatePresence>
                     {showNative && (
                       <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-4 pt-4 border-t border-white/5">
                         {[
                           { label: 'Metaspace', val: 128, color: '#00d4ff' },
                           { label: 'Code Cache', val: 120, color: '#00ff88' },
                           { label: 'Thread Stacks', val: 64, color: '#ffaa00' },
                           { label: 'GC Internal', val: 76, color: '#aa44ff' },
                         ].map(item => (
                            <div key={item.label} className="space-y-1">
                               <div className="flex justify-between text-[10px] font-mono text-gray-500"><span>{item.label}</span> <span>{item.val}MB</span></div>
                               <div className="h-2 rounded-sm" style={{ backgroundColor: item.color, opacity: 0.4, border: `1px solid ${item.color}` }} />
                            </div>
                         ))}
                       </motion.div>
                     )}
                  </AnimatePresence>
               </div>

               {!showNative && (
                 <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent flex items-end justify-center pb-8">
                    <button onClick={() => setShowNative(true)} className="px-6 py-2 bg-accent-alive text-black font-bold text-[10px] rounded-lg animate-bounce">ACTIVATE NMT (-XX:NativeMemoryTracking=detail)</button>
                 </div>
               )}
            </div>
         </div>

         <div className="w-full lg:w-96 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Why track Native?</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
                  A JVM process consumes <span className="text-white">Heap + Native Overhead</span>. If you only look at your GC logs, you are missing 20-30% of your RAM usage.
                  <br/><br/>
                  In Kubernetes, if `RSS` exceeds the container limit, the OOMKiller will kill the process <span className="text-red-400">instantly</span>, without the JVM ever knowing what happened.
               </p>
            </div>

            <div className="p-6 bg-accent-alive/5 border border-accent-alive/20 rounded-3xl">
               <h4 className="text-[10px] font-bold text-accent-alive uppercase mb-2">Snapshot Command</h4>
               <p className="text-[11px] text-gray-500 font-mono italic">jcmd &lt;pid&gt; VM.native_memory summary</p>
               <p className="text-[9px] text-gray-600 mt-2">Requires -XX:NativeMemoryTracking enabled at startup.</p>
            </div>
         </div>
      </div>
    </div>
  );
}