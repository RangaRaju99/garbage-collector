import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Region = { id: number; rset: number[]; type: 'young' | 'old'; color: string; };

export default function L15_Level() {
  const [regions] = useState<Region[]>([
    { id: 0, rset: [2, 5], type: 'young', color: '#00d4ff' },
    { id: 1, rset: [5], type: 'young', color: '#00d4ff' },
    { id: 2, rset: [], type: 'old', color: '#aa44ff' },
    { id: 3, rset: [], type: 'old', color: '#aa44ff' },
    { id: 4, rset: [], type: 'old', color: '#aa44ff' },
    { id: 5, rset: [], type: 'old', color: '#aa44ff' },
  ]);
  const [activeRegion, setActiveRegion] = useState<number | null>(null);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans">
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] rounded text-[10px] font-mono text-[#00d4ff]">L15</span>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">INTERMEDIATE TRACK</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Remembered Sets (RSets)</h1>
        <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
          In regional collectors like G1, we need to know which <span className="text-[#aa44ff] font-bold">Old regions</span> point into a <span className="text-[#00d4ff] font-bold">Young region</span>. This is "Points-In" tracking.
        </p>
      </div>

      <div className="px-8 pb-8 flex flex-col xl:flex-row gap-8">
         <div className="flex-1 space-y-4">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Region Grid (Select a region to see its RSet)</h3>
            <div className="grid grid-cols-3 gap-4">
               {regions.map(r => (
                  <motion.div
                    key={r.id}
                    onClick={() => setActiveRegion(r.id)}
                    animate={{ 
                       borderColor: activeRegion === r.id ? r.color : 'rgba(255,255,255,0.1)',
                       backgroundColor: activeRegion === r.id ? `${r.color}11` : 'rgba(255,255,255,0.03)'
                    }}
                    className="aspect-square rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all relative overflow-hidden"
                  >
                     <div className="text-[10px] font-black opacity-40 mb-1">{r.type.toUpperCase()}</div>
                     <div className="text-sm font-bold" style={{ color: r.color }}>Region {r.id}</div>
                     {activeRegion !== null && regions[activeRegion].rset.includes(r.id) && (
                        <div className="absolute inset-0 bg-red-500/10 border-2 border-red-500/40 z-10 animate-pulse flex items-center justify-center">
                           <span className="text-[8px] font-black text-red-500 uppercase">Incoming Ref</span>
                        </div>
                     )}
                  </motion.div>
               ))}
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5 min-h-[100px]">
               <AnimatePresence mode="wait">
                  {activeRegion !== null && regions[activeRegion].type === 'young' ? (
                     <motion.div key={activeRegion} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="text-[10px] font-bold text-[#00d4ff] mb-2 uppercase">RSet (Remembered Set) for Region {activeRegion}:</div>
                        <p className="text-[11px] text-gray-500 mb-4">Tracking Old-to-Young references to avoid a full scan.</p>
                        <div className="flex gap-2">
                           {regions[activeRegion].rset.map(id => (
                              <div key={id} className="px-3 py-1 rounded bg-red-950/30 border border-red-500/30 text-red-400 text-[10px] font-mono font-bold">
                                 Pointer from Region {id}
                              </div>
                           ))}
                           {regions[activeRegion].rset.length === 0 && <span className="text-gray-600 text-[10px] italic">No incoming cross-region references.</span>}
                        </div>
                     </motion.div>
                  ) : (
                     <div className="h-full flex items-center justify-center text-gray-700 text-xs italic">Select a Young region to inspect its Remembered Set.</div>
                  )}
               </AnimatePresence>
            </div>
         </div>

         <div className="w-full xl:w-96 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">"Points-In" Design</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed space-y-4">
                  A **Remembered Set** is a per-region data structure. It tells a region: "Who points to me?"
                  <br/><br/>
                  This is the inverse of a Card Table, which tracks "Who do I point to?". By knowing which Old regions point into it, a Young region can be collected in isolation.
               </p>
            </div>

            <div className="p-6 rounded-3xl bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.1)]">
               <h4 className="text-[10px] font-bold text-[#00d4ff] uppercase mb-2">Memory Overhead</h4>
               <p className="text-[11px] text-gray-500 leading-relaxed">
                  RSets make G1 highly efficient, but they consume memory (often <span className="text-white">5-10% of heap</span>). If your application has massive cross-region reference complexity, RSets can bloat significantly.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}