import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function L27_Level() {
  const [dedup, setDedup] = useState(false);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans">
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] rounded text-[10px] font-mono text-[#00d4ff]">L27</span>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">INTERMEDIATE TRACK</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">String Deduplication</h1>
        <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
          Strings often take up 25-40% of the heap. If you have 10,000 instances of "admin", G1 can save memory by 
          pointing all of them to <span className="text-accent-alive font-bold">one single char[] array</span>.
        </p>
      </div>

      <div className="px-8 pb-8 flex flex-col lg:flex-row gap-12">
         <div className="flex-1 space-y-8">
            <div className="flex justify-center">
               <button 
                 onClick={() => setDedup(!dedup)}
                 className={`px-8 py-3 rounded-full text-xs font-black transition-all ${dedup ? 'bg-accent-alive text-black shadow-[0_0_30px_rgba(0,212,255,0.4)]' : 'bg-white/10 text-white'}`}
               >
                 {dedup ? 'OPTIMIZATION ACTIVE' : 'ENABLE G1 DEDUPLICATION'}
               </button>
            </div>

            <div className="p-8 bg-black/40 rounded-3xl border border-white/5 relative min-h-[350px]">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Memory Map (Heads vs Arrays)</h3>
                  <div className="flex gap-4">
                     <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> <span className="text-[8px] text-gray-500 uppercase">String Object</span></div>
                     <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-accent-alive" /> <span className="text-[8px] text-gray-500 uppercase">Backing Array</span></div>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-20">
                  {/* String Headers */}
                  <div className="space-y-4">
                     {Array.from({ length: 6 }).map((_, i) => (
                        <motion.div 
                          key={i} layout
                          className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center justify-between text-[10px] font-mono relative"
                        >
                           <span>String@0x{i}f3</span>
                           <span className="text-blue-400">"admin"</span>
                           
                           {/* Reference Line */}
                           <motion.div 
                             animate={{ 
                               x: 200, 
                               y: dedup ? (20 - i * 42) : 0,
                               width: 40,
                               opacity: 1
                             }}
                             className="absolute left-full top-1/2 h-0.5 bg-white/10 origin-left z-0"
                           />
                        </motion.div>
                     ))}
                  </div>

                  {/* Backing Arrays */}
                  <div className="space-y-4 relative">
                     <AnimatePresence>
                        {Array.from({ length: dedup ? 1 : 6 }).map((_, i) => (
                           <motion.div 
                             key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                             className="p-3 bg-accent-alive/10 border border-accent-alive/30 rounded-lg flex items-center gap-3 text-[10px] font-mono"
                           >
                              <div className="w-2 h-6 bg-accent-alive rounded-sm" />
                              <span className="text-accent-alive">char['a','d','m','i','n']</span>
                           </motion.div>
                        ))}
                     </AnimatePresence>
                  </div>
               </div>
            </div>
         </div>

         <div className="w-full lg:w-96 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">How it works</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed space-y-4">
                  When G1 scans strings, it calculates a hash of the backing `char[]`. 
                  It then looks in a global table to see if that exact array already exists.
                  <br/><br/>
                  If it finds a duplicate, it updates the String object to point to the existing array and frees the new one.
               </p>
            </div>

            <div className="p-6 rounded-3xl bg-accent-alive/5 border border-accent-alive/20">
               <h4 className="text-[10px] font-bold text-accent-alive uppercase mb-2">Performance Impact</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
                  This happens <span className="text-white">concurrently</span> and doesn't add to STW pause time. 
                  It can reduce total heap usage by up to <span className="text-white font-bold">10-20%</span> in typical web applications.
               </p>
               <p className="text-[10px] text-gray-600 font-mono mt-3 uppercase tracking-tighter">-XX:+UseStringDeduplication</p>
            </div>
         </div>
      </div>
    </div>
  );
}