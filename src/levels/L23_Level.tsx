import { useState } from 'react';
import { motion } from 'framer-motion';

export default function L23_Level() {
  const [heap, setHeap] = useState(0);
  const [_, setObjects] = useState<{id: number, size: number}[]>([]);
  const MAX_HEAP = 100;

  const spawn = () => {
    if (heap >= MAX_HEAP) return;
    const size = Math.floor(Math.random() * 5) + 5;
    setObjects(prev => [{ id: Date.now(), size }, ...prev].slice(0, 50));
    setHeap(prev => Math.min(MAX_HEAP, prev + size));
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans">
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-[rgba(100,255,100,0.15)] border border-[rgba(100,255,100,0.3)] rounded text-[10px] font-mono text-[#44ff44]">L23</span>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">ENGINEER TRACK</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Epsilon: The No-Op GC</h1>
        <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
          The ultimate performance collector. Epsilon handles allocation and memory layout but 
          <span className="text-[#44ff44] font-bold"> never reclaims memory</span>. Once the heap is full, the JVM simply dies.
        </p>
      </div>

      <div className="px-8 pb-8 flex flex-col lg:flex-row gap-12">
         {/* Simulation */}
         <div className="flex-1 space-y-8">
            <div className="flex justify-center flex-col items-center gap-6">
               <button 
                 onClick={spawn} 
                 disabled={heap >= MAX_HEAP}
                 className={`px-12 py-4 bg-white text-black font-black rounded-xl text-sm transition-all hover:scale-105 active:scale-95 ${heap >= MAX_HEAP ? 'opacity-20 pointer-events-none' : 'shadow-[0_0_30px_white]'}`}
               >
                 ALLOCATE (No-Return)
               </button>
               {heap >= MAX_HEAP && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500 text-white font-black text-xs uppercase tracking-widest rounded animate-pulse"
                  >
                     CRITICAL: java.lang.OutOfMemoryError - Heap Exhausted
                  </motion.div>
               )}
            </div>

            <div className="h-64 w-full bg-black/40 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col items-center justify-end p-8">
               <div className="absolute inset-0 z-0 opacity-10">
                  <div className="grid grid-cols-12 gap-1 p-2">
                     {Array.from({ length: 120 }).map((_, i) => (
                        <div key={i} className="aspect-square border border-white/20 rounded-sm" />
                     ))}
                  </div>
               </div>
               
               {/* Growing bar */}
               <motion.div 
                 animate={{ height: `${heap}%` }}
                 className="w-full bg-gradient-to-t from-green-900 to-green-400 rounded-lg relative z-10"
               />
               
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
                  <div className="text-4xl font-black text-white">{heap}%</div>
                  <div className="text-[10px] uppercase font-bold text-gray-500 tracking-[0.4em]">Heap Usage</div>
               </div>
            </div>
         </div>

         <div className="w-full lg:w-96 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Why build a No-Op?</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
                  It sounds crazy, but Epsilon is vital for three things:
               </p>
               <div className="space-y-3">
                  <div className="flex gap-3">
                     <span className="text-green-500">🏎</span>
                     <div>
                        <div className="font-bold text-white text-[10px]">Performance Benchmarking</div>
                        <p className="text-[9px] text-gray-500">Measure code speed without GC interference.</p>
                     </div>
                  </div>
                  <div className="flex gap-3">
                     <span className="text-green-500">☁️</span>
                     <div>
                        <div className="font-bold text-white text-[10px]">Short-Lived Tasks</div>
                        <p className="text-[9px] text-gray-500">Serverless functions (AWS Lambda) that finish before the heap fills up.</p>
                     </div>
                  </div>
                  <div className="flex gap-3">
                     <span className="text-green-500">🧬</span>
                     <div>
                        <div className="font-bold text-white text-[10px]">Testing GC Impact</div>
                        <p className="text-[9px] text-gray-500">Determine if a performance bug is caused by GC or your application logic.</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-6 rounded-3xl bg-green-500/5 border border-green-500/10">
               <h4 className="text-[10px] font-bold text-green-400 uppercase mb-2">Zero Barrier Overhead</h4>
               <p className="text-[11px] text-gray-500 leading-relaxed">
                  Unlike G1 or ZGC, Epsilon has <span className="text-white">zero write barriers</span>. Allocation is literally just incrementing a pointer. This is the absolute fastest way to run Java code.
               </p>
               <p className="text-[10px] text-gray-600 font-mono mt-3 uppercase tracking-tighter">-XX:+UseEpsilonGC</p>
            </div>
         </div>
      </div>
    </div>
  );
}