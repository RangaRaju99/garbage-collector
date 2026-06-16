import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DirectMemoryChapter() {
  const [allocation, setAllocation] = useState(0);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans p-8">
      <div className="mb-8 shrink-0">
         <h1 className="text-3xl font-black mb-2">Direct Memory (Off-Heap)</h1>
         <p className="text-gray-400 text-sm max-w-2xl">Bypassing the GC for peak performance. `ByteBuffer.allocateDirect()` creates memory directly on the OS heap, enabling zero-copy I/O operations.</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-12">
         <div className="flex-1 space-y-8 flex flex-col items-center">
            <div className="grid grid-cols-2 gap-8 w-full max-w-2xl">
               {/* Java Heap Lane */}
               <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/20 relative h-[300px] flex flex-col items-center">
                  <div className="text-[10px] font-bold text-blue-400 uppercase mb-6">JAVA HEAP (SAFELY MANAGED)</div>
                  <div className="flex-1 flex items-center justify-center">
                     <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="text-4xl">🧘</motion.div>
                  </div>
                  <p className="text-[10px] text-gray-500 text-center leading-relaxed">Copies data from OS buffer to Java heap before user can read it. <b>Safe but slow.</b></p>
               </div>

               {/* Direct Memory Lane */}
               <div className="p-6 rounded-3xl bg-orange-500/5 border border-orange-500/20 relative h-[300px] flex flex-col items-center overflow-hidden">
                  <div className="text-[10px] font-bold text-orange-400 uppercase mb-6">DIRECT MEMORY (OFF-HEAP)</div>
                  <div className="flex-1 flex items-center justify-center relative w-full">
                     <motion.div 
                       animate={{ x: [-100, 100] }} 
                       transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                       className="absolute h-1 w-20 bg-orange-500 shadow-[0_0_15px_rgba(255,170,0,0.5)]"
                     />
                  </div>
                  <p className="text-[10px] text-gray-500 text-center leading-relaxed">One address space shared between JVM and Kernel. <b>Zero-copy performance.</b></p>
               </div>
            </div>

            <button onClick={() => setAllocation(a => a + 1)} className="px-10 py-4 bg-orange-500 text-black font-black rounded-xl hover:scale-105 active:scale-95 transition shadow-[0_0_30px_rgba(255,170,0,0.2)]">
               ALLOCATE 256MB DIRECT BUFFER
            </button>
         </div>

         <div className="w-full lg:w-96 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Why use Direct Memory?</h4>
               <ul className="space-y-4 text-[11px] text-gray-400">
                  <li className="flex gap-3">
                     <span className="text-orange-500">⚡</span>
                     <span><span className="text-white">Zero Copy:</span> OS network stack can write directly into the buffer memory—no intermediate copies required.</span>
                  </li>
                  <li className="flex gap-3">
                     <span className="text-orange-500">⚡</span>
                     <span><span className="text-white">No GC Overhead:</span> Large buffers don't pressure the GC root tracing, keeping Minor GC pauses low.</span>
                  </li>
                  <li className="flex gap-3">
                     <span className="text-red-500">⚠</span>
                     <span><span className="text-white">Dangerous:</span> Native memory takes longer to allocate/deallocate and is hard to diagnose with `jmap`.</span>
                  </li>
               </ul>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 font-mono text-[10px] text-gray-500">
               <div className="text-orange-400 mb-2 underline tracking-widest">LIMITATION:</div>
               {`-XX:MaxDirectMemorySize=2g
Default is usually equal to -Xmx, but you should always cap it explicitly.`}
            </div>
         </div>
      </div>
    </div>
  );
}