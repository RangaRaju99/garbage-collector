import { useState } from 'react';
import { motion } from 'framer-motion';

export default function CardTable() {
  const [cards, setCards] = useState<boolean[]>(Array.from({ length: 64 }, () => Math.random() > 0.8));

  const toggle = (i: number) => {
    const next = [...cards];
    next[i] = !next[i];
    setCards(next);
  };

  return (
    <div className="bg-black/60 border border-white/10 rounded-xl overflow-hidden font-mono p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Card Table (512B segments)</h3>
        <button onClick={() => setCards(prev => prev.map(() => false))} className="text-[9px] text-gray-600 hover:text-white uppercase transition">Clear Table</button>
      </div>

      <div className="grid grid-cols-8 gap-1.5">
        {cards.map((dirty, i) => (
          <motion.div
            key={i}
            onClick={() => toggle(i)}
            animate={{ 
              backgroundColor: dirty ? '#ff4444' : '#ffffff08',
              boxShadow: dirty ? '0 0 10px rgba(255,68,68,0.2)' : 'none'
            }}
            whileHover={{ scale: 1.1 }}
            className={`aspect-square rounded-sm border cursor-pointer ${dirty ? 'border-red-500/50' : 'border-white/5'}`}
          />
        ))}
      </div>

      <div className="mt-4 flex gap-4 text-[9px]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-sm bg-red-500" />
          <span className="text-gray-500 uppercase">Dirty (Must Scan)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-sm bg-white/5 border border-white/10" />
          <span className="text-gray-500 uppercase">Clean (Skip)</span>
        </div>
      </div>
      
      <p className="mt-4 text-[9px] text-gray-500 leading-relaxed italic">
        When an Old Gen object writes a reference to a Young Gen object, the JIT-inserted write barrier "dirties" the card.
      </p>
    </div>
  );
}