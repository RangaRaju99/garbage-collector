import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CompressedOOPsChapter() {
  const [heapSize, setHeapSize] = useState(16);
  const isCompressed = heapSize <= 32;

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans p-8">
      <div className="mb-8 shrink-0">
         <h1 className="text-3xl font-black mb-2">Compressed OOPs (32GB Wall)</h1>
         <p className="text-gray-400 text-sm max-w-2xl">The 32GB cliff. Compressed <span className="text-white font-bold">Ordinary Object Pointers</span> use a clever bit-shift trick to address 32GB of heap using only 32 bits of space.</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-12">
         <div className="flex-1 space-y-12">
            <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 flex flex-col items-center">
               <div className="w-full max-w-md mb-10">
                  <div className="flex justify-between items-center mb-4">
                     <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Configured Max Heap (-Xmx)</div>
                     <div className={`text-2xl font-black ${isCompressed ? 'text-[#00d4ff]' : 'text-red-400'}`}>{heapSize} GB</div>
                  </div>
                  <input 
                    type="range" min="4" max="64" step="4" value={heapSize} 
                    onChange={(e) => setHeapSize(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="mt-2 flex justify-between text-[10px] text-gray-600 font-mono">
                     <span>4GB</span>
                     <span className="text-gray-400">32GB (The Boundary)</span>
                     <span>64GB</span>
                  </div>
               </div>

               <div className="flex gap-16 items-center">
                  {/* Virtual Pointer Logic */}
                  <div className="text-center space-y-4">
                     <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Pointer Format</div>
                     <motion.div
                       animate={{ 
                         width: isCompressed ? 120 : 240,
                         backgroundColor: isCompressed ? '#00d4ff22' : '#ff444422',
                         borderColor: isCompressed ? '#00d4ff' : '#ff4444'
                       }}
                       className="h-16 border-2 rounded-2xl flex items-center justify-center font-mono font-black"
                     >
                        {isCompressed ? '32-BIT OOP' : '64-BIT NATIVE'}
                     </motion.div>
                  </div>

                  <div className="text-4xl text-gray-700">→</div>

                  <div className="text-center space-y-4">
                     <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Memory Efficiency</div>
                     <div className="flex items-center gap-2">
                        {Array.from({ length: isCompressed ? 1 : 2 }).map((_, i) => (
                           <motion.div key={i} layoutId="box" className={`w-8 h-8 rounded ${isCompressed ? 'bg-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-red-400'}`} />
                        ))}
                     </div>
                     <div className="text-[10px] font-bold text-gray-500">{isCompressed ? 'L1 CACHE FRIENDLY' : 'CACHE BLOAT ⚠'}</div>
                  </div>
               </div>
            </div>

            <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-3xl">
               <h4 className="text-[10px] font-bold text-blue-400 uppercase mb-4 tracking-widest">The Mathematics of 32GB</h4>
               <p className="text-sm font-mono text-gray-300 leading-relaxed italic">
                  Address = (native_32bit_ptr &lt;&lt; 3)
                  <br/><br/>
                  <span className="text-[11px] text-gray-500 font-sans not-italic">
                    Since objects are always 8-byte aligned, the last 3 bits of any address are always 000. 
                    The JVM drops them during storage and shifts them back during access, effectively turning 2^32 (4GB) into 2^35 (32GB).
                  </span>
               </p>
            </div>
         </div>

         <div className="w-full lg:w-96 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Why 31GB is better than 33GB</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
                  Going from 31GB to 33GB triggers a <span className="text-red-400 font-bold">performance penalty</span>. 
                  <br/><br/>
                  Pointers double in size, meaning you can fit fewer objects in the CPU cache. You might actually find that your app runs <span className="text-white">slower</span> with 40GB of ram than with 31GB!
               </p>
               <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] text-red-400 font-bold uppercase text-center">
                  Avoid the "Dead Zone" (32GB - 40GB)
               </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 font-mono text-[10px] text-gray-500">
               -XX:+UseCompressedOops<br/>
               (Enabled by default for heap &lt; 32GB)
            </div>
         </div>
      </div>
    </div>
  );
}