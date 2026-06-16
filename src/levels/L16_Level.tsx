import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const collectors = [
  { id: 'serial', name: 'Serial GC', year: '1999', java: '1.2+', motto: 'Single-threaded simplicity', description: 'Uses a single thread for all GC work. Best for tiny heaps (<100MB) or single-core containers.', stw: 'Max' },
  { id: 'parallel', name: 'Parallel GC', year: '2004', java: '5.0+', motto: 'Throughput king', description: 'Uses multiple threads for Young and Old generations. Default in Java 8. Prioritizes app performance over pause times.', stw: 'High' },
  { id: 'cms', name: 'CMS', year: '2002', java: '1.4.2+', motto: 'Latency pioneer', description: 'Concurrent Mark Sweep. The first to attempt background marking. Deprecated in Java 9, removed in 14.', stw: 'Low' },
  { id: 'g1', name: 'G1 GC', year: '2012', java: '7u4+', motto: 'The balanced giant', description: 'First regional collector. Predictable pause times for large heaps. Default from Java 9+.', stw: 'Soft Limit' },
  { id: 'zgc', name: 'ZGC', year: '2018', java: '11+', motto: 'Sub-millisecond future', description: 'Ultra-low latency. Can handle multi-terabyte heaps with <1ms pauses using colored pointers.', stw: 'Ultra-Low' },
  { id: 'shen', name: 'Shenandoah', year: '2019', java: '12+', motto: 'Red Hat innovation', description: 'Similar to ZGC but uses Brooks Pointers. Concurrent evacuation reduces pauses significantly.', stw: 'Ultra-Low' },
];

export default function L16_Level() {
  const [selected, setSelected] = useState<string>('serial');

  const current = collectors.find(c => c.id === selected)!;

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans">
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] rounded text-[10px] font-mono text-[#00d4ff]">L16</span>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">INTERVIEW MODE</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">GC Algorithm Gallery</h1>
        <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
          The evolution of memory management. From single-threaded stop-the-world to sub-millisecond concurrent compaction.
        </p>
      </div>

      <div className="px-8 pb-8 flex flex-col gap-12">
         {/* Timeline */}
         <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2" />
            <div className="flex justify-between items-center relative z-10">
               {collectors.map(c => (
                  <button 
                    key={c.id} 
                    onClick={() => setSelected(c.id)}
                    className="flex flex-col items-center group"
                  >
                     <div className={`text-[10px] font-bold mb-2 transition-colors ${selected === c.id ? 'text-accent-alive' : 'text-gray-600'}`}>{c.year}</div>
                     <motion.div 
                       animate={{ 
                         scale: selected === c.id ? 1.5 : 1,
                         backgroundColor: selected === c.id ? '#00d4ff' : 'rgba(255,255,255,0.1)'
                       }}
                       className="w-3 h-3 rounded-full border border-black group-hover:scale-125 transition-all"
                     />
                     <div className={`text-[9px] font-black uppercase mt-2 tracking-tighter transition-colors ${selected === c.id ? 'text-white' : 'text-gray-700'}`}>{c.name}</div>
                  </button>
               ))}
            </div>
         </div>

         {/* Detail Card */}
         <div className="flex flex-col lg:flex-row gap-8 min-h-[400px]">
            <div className="flex-1">
               <AnimatePresence mode="wait">
                  <motion.div 
                    key={selected}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full p-10 rounded-[40px] bg-white/5 border border-white/10 relative overflow-hidden"
                  >
                     <div className="absolute top-0 right-0 p-8 text-8xl font-black text-white/5 select-none uppercase">{current.id}</div>
                     
                     <div className="relative z-10">
                        <div className="text-accent-alive font-mono text-xs uppercase tracking-[0.3em] mb-4">Java {current.java}</div>
                        <h2 className="text-5xl font-black mb-2">{current.name}</h2>
                        <p className="text-xl text-gray-400 italic mb-8">"{current.motto}"</p>
                        
                        <div className="max-w-xl text-gray-300 leading-loose mb-12">
                           {current.description}
                        </div>

                        <div className="grid grid-cols-3 gap-8">
                           <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                              <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">STW Impact</div>
                              <div className={`text-lg font-black ${current.stw.includes('Low') ? 'text-green-400' : 'text-red-400'}`}>{current.stw}</div>
                           </div>
                           <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                              <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">Complexity</div>
                              <div className="text-lg font-black text-gray-300">O({current.id === 'serial' ? 'n' : 'log n'})</div>
                           </div>
                           <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                              <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">Primary Goal</div>
                              <div className="text-lg font-black text-accent-alive">{current.id === 'parallel' ? 'THROUGHPUT' : 'LATENCY'}</div>
                           </div>
                        </div>
                     </div>
                  </motion.div>
               </AnimatePresence>
            </div>

            <div className="w-full lg:w-80 space-y-4">
               <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Interview Tip</h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    "If an interviewer asks which GC to use, the answer is always: <span className="text-white">Profile first.</span> 
                    However, G1 is the baseline for 80% of modern apps."
                  </p>
               </div>

               <div className="p-6 rounded-3xl bg-[#00d4ff]/10 border border-[#00d4ff]/20">
                  <h4 className="text-[10px] font-bold text-[#00d4ff] uppercase mb-2">Pro Command</h4>
                  <code className="text-[10px] text-gray-300 block bg-black/40 p-2 rounded border border-white/5">
                    -XX:+Use{current.id.charAt(0).toUpperCase() + current.id.slice(1)}GC
                  </code>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}