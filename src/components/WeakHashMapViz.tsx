import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Entry = { id: number; keyAlive: boolean; val: string; };

export default function WeakHashMapViz() {
  const [entries, setEntries] = useState<Entry[]>([
    { id: 1, keyAlive: true, val: "Metadata A" },
    { id: 2, keyAlive: true, val: "Metadata B" },
    { id: 3, keyAlive: true, val: "Metadata C" },
  ]);

  const dropKey = (id: number) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, keyAlive: false } : e));
  };

  const runGC = () => {
    setEntries(prev => prev.filter(e => e.keyAlive));
  };

  return (
    <div className="bg-black/60 border border-white/10 rounded-xl overflow-hidden p-6 font-mono">
      <div className="flex justify-between items-center mb-6">
         <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">WeakHashMap Table</h3>
         <button onClick={runGC} className="px-4 py-1 bg-[#00ff88] text-black font-black text-[10px] rounded uppercase transition hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(0,255,136,0.2)]">TRIGGER GC</button>
      </div>

      <div className="space-y-2 min-h-[140px]">
        <AnimatePresence>
          {entries.map((e) => (
            <motion.div
              key={e.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="p-3 bg-white/5 border border-white/5 rounded-lg flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <motion.div 
                  onClick={() => dropKey(e.id)}
                  animate={{ 
                    backgroundColor: e.keyAlive ? '#00d4ff' : 'transparent',
                    borderColor: e.keyAlive ? '#00d4ff' : 'rgba(255,255,255,0.1)',
                    opacity: e.keyAlive ? 1 : 0.3
                  }}
                  className={`w-12 h-6 border rounded flex items-center justify-center text-[8px] font-black cursor-pointer ${e.keyAlive ? 'text-black' : 'text-gray-500'}`}
                >
                  {e.keyAlive ? 'KEY' : 'DEAD'}
                </motion.div>
                <div className="w-4 h-px bg-white/10" />
                <div className="text-[10px] text-gray-500">{e.val}</div>
              </div>
              
              {e.keyAlive && (
                <div className="text-[8px] text-gray-700 opacity-0 group-hover:opacity-100 transition">CLICK KEY TO NULLIFY</div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {entries.length === 0 && (
          <div className="h-full flex items-center justify-center text-gray-700 text-[10px] uppercase">HashMap Empty</div>
        )}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-green-500/5 border border-green-500/10 text-[10px] text-gray-500 leading-relaxed italic">
        Unlike a normal Map, WeakHashMap holds <span className="text-white">WeakReferences</span> to its keys. Once a key's strong reference is gone, the entry is automatically purged during the next GC cycle.
      </div>
    </div>
  );
}