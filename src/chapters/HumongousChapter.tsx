import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HumongousChapter() {
  const [regions, setRegions] = useState<('EMPTY' | 'OBJECT' | 'HUMONGOUS')[]>(Array(16).fill('EMPTY'));

  const dropHumongous = () => {
    const next = [...regions];
    let count = 0;
    for (let i = 0; i < next.length && count < 3; i++) {
      if (next[i] === 'EMPTY') {
        next[i] = 'HUMONGOUS';
        count++;
      }
    }
    setRegions(next);
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans p-8">
      <div className="mb-8 shrink-0">
         <h1 className="text-3xl font-black mb-2">Humongous Objects in G1</h1>
         <p className="text-gray-400 text-sm max-w-2xl">When an object is <span className="text-white font-bold">&gt;50% of a region</span>, it becomes Humongous. These objects bypass Young Gen and are allocated directly into continuous Old Gen regions, often causing severe fragmentation.</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-12">
         <div className="flex-1 space-y-8 flex flex-col items-center">
            {/* Region Grid */}
            <div className="grid grid-cols-4 gap-4 p-6 bg-white/5 border border-white/10 rounded-[40px] w-full max-w-lg">
               {regions.map((r, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      backgroundColor: r === 'HUMONGOUS' ? '#ff444433' : r === 'OBJECT' ? '#00d4ff33' : 'rgba(255,255,255,0.02)',
                      borderColor: r === 'HUMONGOUS' ? '#ff4444' : r === 'OBJECT' ? '#00d4ff' : 'rgba(255,255,255,0.1)'
                    }}
                    className="aspect-square border rounded-2xl flex items-center justify-center relative overflow-hidden"
                  >
                     <div className="text-[10px] font-mono opacity-20">R{i}</div>
                     {r === 'HUMONGOUS' && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 flex items-center justify-center font-black text-[10px] text-red-500">BIG DATA</motion.div>}
                  </motion.div>
               ))}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={dropHumongous}
                className="px-8 py-3 bg-red-600/20 border border-red-600/50 text-red-500 font-bold text-xs rounded-xl hover:bg-red-600/30 transition shadow-[0_0_20px_rgba(255,68,68,0.1)]"
              >
                ALLOCATE HUMONGOUS (3 REGIONS)
              </button>
              <button onClick={() => setRegions(Array(16).fill('EMPTY'))} className="px-8 py-3 border border-white/10 text-gray-600 font-bold text-xs rounded-xl hover:text-white transition">RESET HEAP</button>
            </div>
         </div>

         <div className="w-full lg:w-96 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">G1 Fragmentation</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
                  G1 prefers to allocate small objects in Young Gen and move them to Old Gen only when they survive.
                  <br/><br/>
                  <span className="text-white font-bold">Humongous objects</span> break this flow. They must find <span className="text-white">consecutive free regions</span>. If the heap is fragmented, G1 may trigger a Full GC even if plenty of total memory is free!
               </p>
            </div>

            <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/20">
               <h4 className="text-[10px] font-bold text-red-400 uppercase mb-2">Tuning Tip</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed italic mb-4">
                  If you see "G1 Humongous Allocation" in your logs:
               </p>
               <code className="text-[10px] font-mono text-white bg-black/40 p-2 rounded block">
                  -XX:G1HeapRegionSize=16m
               </code>
               <p className="text-[10px] text-gray-500 mt-2">Increase region size so big objects stay under the 50% limit.</p>
            </div>
         </div>
      </div>
    </div>
  );
}