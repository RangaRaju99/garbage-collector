import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ExploreMode() {
  const [focus, setFocus] = useState<string | null>(null);

  const regions = [
    { id: 'eden', label: 'Eden', desc: 'Birth district. Objects allocated via TLAB bump pointer. No locks.', color: '#00ff88', icon: '🌱' },
    { id: 'survivor', label: 'Survivor S0/S1', desc: 'Waiting rooms. Objects age here between Minor GC cycles.', color: '#00d4ff', icon: '⏳' },
    { id: 'oldgen', label: 'Old Generation', desc: 'Luxury residential. Long-lived objects promoted after MaxTenuringThreshold.', color: '#aa44ff', icon: '🏰' },
    { id: 'metaspace', label: 'Metaspace', desc: 'Native memory library. Class metadata, method bytecode. Not in heap.', color: '#ffaa00', icon: '📚' },
    { id: 'stack', label: 'Stack (per thread)', desc: 'Control towers. Stack frames → local variables → PC register.', color: '#00ffff', icon: '🗼' },
    { id: 'stringpool', label: 'String Pool', desc: 'Interned string district. Shared strings deduplicated inside heap.', color: '#ff88aa', icon: '🔤' },
    { id: 'directmem', label: 'Direct Memory', desc: 'Off-heap zone. ByteBuffer.allocateDirect() → OS memory, no GC.', color: '#888', icon: '💾' },
    { id: 'codecache', label: 'Code Cache', desc: 'JIT compiled method storage. C1/C2 native code lives here.', color: '#4499ff', icon: '⚡' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto p-5">
      <div className="mb-4">
        <h2 className="text-xl font-black text-white mb-1">Explore Mode — JVM City Map</h2>
        <p className="text-gray-500 text-xs">Click any memory region to understand it deeply. Use X key for X-Ray mode, H for headers, C for card table.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {regions.map(region => (
          <motion.button
            key={region.id}
            onClick={() => setFocus(focus === region.id ? null : region.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="text-left p-4 rounded-xl border transition-all"
            style={{
              borderColor: focus === region.id ? region.color : 'rgba(255,255,255,0.06)',
              backgroundColor: focus === region.id ? `${region.color}0d` : 'rgba(255,255,255,0.02)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{region.icon}</span>
              <span className="font-bold text-sm text-white">{region.label}</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-snug">{region.desc}</p>
            {focus === region.id && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-[10px] font-mono" style={{ color: region.color }}>
                → Focus in 3D scene: Camera navigating to {region.label}...
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      <div className="mt-4 p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
        <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">KEYBOARD SHORTCUTS</div>
        <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-gray-500">
          {[
            ['X', 'X-Ray mode (bit layout)'], ['H', 'Object headers overlay'],
            ['C', 'Card table dirty overlay'], ['V', 'TLAB boundaries'],
            ['N', 'NMT breakdown panel'], ['T', 'GC thread panel'],
            ['G', 'Request GC'], ['R', 'Reset simulation'],
            ['1-9', 'Jump to scene'], ['Space', 'Play / Pause'],
          ].map(([key, action]) => (
            <div key={key} className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-[rgba(255,255,255,0.08)] rounded text-white text-[9px]">{key}</kbd>
              <span>{action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}