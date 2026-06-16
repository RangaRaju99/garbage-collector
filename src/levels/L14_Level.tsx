import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function L14_Level() {
  const [cards, setCards] = useState<boolean[]>(Array.from({ length: 64 }, () => false));
  const [showScan, setShowScan] = useState(false);

  const toggleCard = (i: number) => {
    const next = [...cards];
    next[i] = !next[i];
    setCards(next);
  };

  const runMinorGC = () => {
    setShowScan(true);
    setTimeout(() => setShowScan(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans">
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-[rgba(170,68,255,0.15)] border border-[rgba(170,68,255,0.3)] rounded text-[10px] font-mono text-[#aa44ff]">L14</span>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">INTERMEDIATE TRACK</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Card Tables & Bitmaps</h1>
        <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
          How does the JVM find references from Old Gen to Young Gen without scanning the entire heap? 
          It uses a <span className="text-[#aa44ff] font-bold">Write Barrier</span> to mark regions of memory as "Dirty".
        </p>
      </div>

      <div className="px-8 pb-8 flex flex-col xl:flex-row gap-12">
         <div className="flex-1 space-y-8">
            <div className="p-8 bg-black/40 rounded-3xl border border-white/5 relative">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Old Generation Memory (512-byte Cards)</h3>
                  <button 
                    onClick={runMinorGC}
                    className="px-4 py-1.5 bg-[#aa44ff] text-white text-[10px] font-black rounded hover:scale-105 transition"
                  >
                    IDENTIFY ROOTS
                  </button>
               </div>

               <div className="grid grid-cols-8 gap-1.5 aspect-square max-w-[400px] mx-auto relative">
                  {cards.map((dirty, i) => (
                     <motion.div
                       key={i}
                       onClick={() => toggleCard(i)}
                       animate={{ 
                         backgroundColor: dirty ? '#aa44ff' : 'rgba(255,255,255,0.03)',
                         borderColor: dirty ? '#cc88ff' : 'rgba(255,255,255,0.1)'
                       }}
                       className="aspect-square rounded-sm border cursor-pointer hover:border-[#aa44ff]/50 flex items-center justify-center"
                     >
                        {dirty && <span className="text-[10px]">📍</span>}
                     </motion.div>
                  ))}

                  <AnimatePresence>
                    {showScan && (
                       <motion.div 
                         initial={{ y: '-100%' }} animate={{ y: '100%' }} exit={{ opacity: 0 }}
                         transition={{ duration: 1.5, ease: 'linear' }}
                         className="absolute inset-x-0 h-1 bg-white/40 shadow-[0_0_20px_white] z-20 pointer-events-none"
                       />
                    )}
                  </AnimatePresence>
               </div>
               
               <div className="mt-8 flex justify-center gap-8">
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded bg-white/5 border border-white/10" />
                     <span className="text-[10px] text-gray-500 uppercase">Clean Card</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded bg-[#aa44ff]" />
                     <span className="text-[10px] text-gray-400 uppercase">Dirty / Modified</span>
                  </div>
               </div>
            </div>
         </div>

         <div className="w-full xl:w-96 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">The Write Barrier</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed space-y-4 text-justify">
                  Whenever your code does <code className="text-white">oldObject.field = youngObject</code>, the JIT-compiled code executes a tiny piece of logic called a **Write Barrier**.
                  <br/><br/>
                  It marks a bit in a side structure (the Card Table) corresponding to the address of `oldObject`.
               </p>
               <div className="mt-6 p-4 bg-[#aa44ff]/10 border border-[#aa44ff]/20 rounded-xl">
                  <div className="text-[10px] font-bold text-[#aa44ff] mb-1">GC Efficiency:</div>
                  <p className="text-[10px] text-gray-500 italic">During Minor GC, the JVM only scans objects located within the "Dirty Cards". This reduces root-scanning time by 99%.</p>
               </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-2">Technical Detail</h4>
               <p className="text-[11px] text-gray-500 leading-relaxed">
                  A card is typically <span className="text-white">512 bytes</span>. The card table is a simple byte array where each element represents one card. It's an O(1) lookup to find a card from a pointer.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}