import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function L18_Level() {
  const [isGCing, setIsGCing] = useState(false);
  const [threads, setThreads] = useState(4);
  const [blocks, setBlocks] = useState<any[]>(Array.from({ length: 48 }, (_, i) => ({ id: i, status: 'alive' })));

  const runGC = async () => {
    setIsGCing(true);
    // Mark stage
    await new Promise(r => setTimeout(r, 1000));
    setBlocks(prev => prev.map(b => (Math.random() > 0.4 ? b : { ...b, status: 'dead' })));
    
    // Sweep/Compact stage
    await new Promise(r => setTimeout(r, 1000));
    setBlocks(prev => {
       const alive = prev.filter(b => b.status === 'alive');
       const dead = prev.filter(b => b.status === 'dead').map(b => ({ ...b, status: 'free' }));
       return [...alive, ...dead];
    });
    setIsGCing(false);
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans">
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] rounded text-[10px] font-mono text-[#00d4ff]">L18</span>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">INTERVIEW MODE</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Parallel GC: High Throughput</h1>
        <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
          The "Throughput Collector." It stops all application threads but uses every available CPU core 
          to finish the cleanup as fast as possible.
        </p>
      </div>

      <div className="px-8 pb-8 flex flex-col lg:flex-row gap-8">
         <div className="flex-1 space-y-6">
            <div className="p-6 bg-black/40 rounded-3xl border border-white/5 relative">
               <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                     <span className="text-[10px] font-bold text-gray-500">GC THREADS:</span>
                     <div className="flex gap-1">
                        {[2, 4, 8, 16].map(n => (
                           <button 
                             key={n} onClick={() => setThreads(n)}
                             className={`px-3 py-1 rounded text-[10px] font-bold border transition ${threads === n ? 'bg-[#00d4ff] text-black border-[#00d4ff]' : 'text-gray-500 border-white/10'}`}
                           >
                              {n}
                           </button>
                        ))}
                     </div>
                  </div>
                  <button 
                    onClick={runGC} disabled={isGCing}
                    className="px-6 py-2 bg-accent-alive text-black font-black rounded-lg text-xs hover:scale-105 active:scale-95 transition"
                  >
                    {isGCing ? 'RUNNING GC...' : 'EXECUTE STOP-THE-WORLD GC'}
                  </button>
               </div>

               {/* Robots visualization */}
               <div className="flex justify-center gap-8 mb-8">
                  {Array.from({ length: threads }).map((_, i) => (
                     <motion.div 
                       key={i}
                       animate={isGCing ? { y: [0, -10, 0], scale: [1, 1.1, 1] } : {}}
                       transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                    >
                       <div className={`text-2xl ${isGCing ? 'opacity-100' : 'opacity-20'}`}>🤖</div>
                       <div className="text-[8px] text-gray-600 text-center mt-1">Core-{i}</div>
                    </motion.div>
                  ))}
               </div>

               <div className="grid grid-cols-8 sm:grid-cols-12 gap-1.5">
                  {blocks.map((b, i) => (
                     <motion.div
                       key={i}
                       layout
                       animate={{ 
                         backgroundColor: b.status === 'alive' ? '#00d4ff' : b.status === 'dead' ? '#ff4444' : '#111',
                         opacity: b.status === 'dead' && isGCing ? [1, 0.4, 1] : 1
                       }}
                       className="aspect-square rounded-sm border border-white/5"
                     />
                  ))}
               </div>
            </div>
            
            <AnimatePresence>
               {isGCing && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="p-4 bg-red-950/20 border border-red-500/30 rounded-xl flex items-center justify-center gap-4"
                  >
                     <div className="w-4 h-4 rounded-full bg-red-500 animate-ping" />
                     <span className="text-[10px] font-black uppercase text-red-400 tracking-widest">Stop-The-World (Pause Time Scaling with Heap Size)</span>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

         <div className="w-full lg:w-96 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Throughput is Priority</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
                  The goal isn't short pauses, it's <span className="text-white font-bold">maximum efficiency</span>. 
                  By pausing the app entirely, the GC doesn't have to worry about the heap changing while it works.
               </p>
               <div className="p-4 bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.1)] rounded-xl">
                  <div className="text-[10px] font-bold text-gray-300 mb-1">Use Case:</div>
                  <p className="text-[10px] text-gray-500 italic">Batch processing, scientific simulations, or backend jobs where 1-2 second pauses are acceptable if the total job finishes sooner.</p>
               </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-2">Technical Note</h4>
               <p className="text-[11px] text-gray-500 leading-relaxed">
                  Controlled by <code className="text-white">-XX:ParallelGCThreads=N</code>. On a machine with 32 cores, 32 threads will attack the heap simultaneously, making compaction significantly faster than Serial GC.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}