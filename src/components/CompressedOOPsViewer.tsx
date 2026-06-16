import { useState } from 'react';
import { motion } from 'framer-motion';

export default function CompressedOOPsViewer() {
  const [mode, setMode] = useState<'standard' | 'compressed'>('compressed');

  return (
    <div className="bg-black/60 border border-white/10 rounded-xl overflow-hidden p-6 font-mono">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pointer Layout</h3>
          <p className="text-[10px] text-gray-500 mt-1 font-sans">Toggle to see memory footprint impact.</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-lg border border-white/5">
          <button onClick={() => setMode('standard')} 
            className={`px-3 py-1.5 rounded text-[10px] font-bold transition ${mode === 'standard' ? 'bg-red-500 text-white' : 'text-gray-500'}`}>64-BIT</button>
          <button onClick={() => setMode('compressed')} 
            className={`px-3 py-1.5 rounded text-[10px] font-bold transition ${mode === 'compressed' ? 'bg-[#00d4ff] text-white' : 'text-gray-500'}`}>OOPs</button>
        </div>
      </div>

      <div className="relative h-20 mb-8 flex gap-1">
        {Array.from({ length: 64 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              height: mode === 'standard' ? '100%' : (i < 32 ? '100%' : '20%'),
              backgroundColor: mode === 'standard' ? (i < 32 ? '#ff4444' : '#ff4444aa') : (i < 32 ? '#00d4ff' : '#ffffff05'),
              opacity: mode === 'compressed' && i >= 32 ? 0.1 : 1
            }}
            className="flex-1 rounded-sm"
          />
        ))}
        
        <div className="absolute inset-x-0 -bottom-6 flex justify-between text-[8px] text-gray-600 font-bold uppercase">
          <span>Bit 0</span>
          <span>{mode === 'standard' ? 'Bit 63' : 'Bit 31'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-white/5 rounded-lg border border-white/5">
          <div className="text-[8px] text-gray-500 uppercase mb-1">Heap Addressability</div>
          <div className="text-xs font-bold">{mode === 'standard' ? '18.4 EB (Exabytes)' : '32.0 GB'}</div>
        </div>
        <div className="p-3 bg-white/5 rounded-lg border border-white/5">
          <div className="text-[8px] text-gray-500 uppercase mb-1">Memory Overhead</div>
          <div className={`text-xs font-bold ${mode === 'standard' ? 'text-red-400' : 'text-green-400'}`}>{mode === 'standard' ? '+100% per ref' : '-50% (Normal)'}</div>
        </div>
      </div>

      <p className="mt-6 text-[10px] text-gray-500 leading-relaxed font-sans italic">
        {mode === 'compressed' 
          ? "Compressed OOPs use a 3-bit shift to address up to 32GB of heap using only 32-bit pointers, saving significant CPU cache space."
          : "Standard 64-bit pointers can address massive heaps but double the memory footprint of reference fields, reducing cache efficiency."}
      </p>
    </div>
  );
}