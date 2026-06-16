import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Field = { name: string; type: string; size: number; color: string; };

const availableFields: Field[] = [
  { name: 'header', type: 'MARK+KLASS', size: 12, color: '#333' }, // Simplified
  { name: 'long value', type: 'long', size: 8, color: '#ffaa00' },
  { name: 'int id', type: 'int', size: 4, color: '#00d4ff' },
  { name: 'short age', type: 'short', size: 2, color: '#aa00ff' },
  { name: 'boolean flag', type: 'boolean', size: 1, color: '#ff4444' },
];

export default function L06_Level() {
  const [pack, setPack] = useState(false);

  // Simulation of how fields are packed
  const unoptimized = [
    availableFields[0], // header (12)
    availableFields[4], // boolean (1) -> 7 padding
    availableFields[1], // long (8)
    availableFields[3], // short (2) -> 2 padding
    availableFields[2], // int (4)
  ];

  const optimized = [
    availableFields[0], // header (12)
    availableFields[1], // long (8)
    availableFields[2], // int (4)
    availableFields[3], // short (2)
    availableFields[4], // boolean (1)
  ];

  const currentFields = pack ? optimized : unoptimized;
  
  // Calculate padding blocks
  const renderLayout = () => {
    let offset = 0;
    const blocks: any[] = [];
    
    currentFields.forEach((f) => {
      // Basic 8-byte alignment logic simulation for display
      if (f.size === 8 && offset % 8 !== 0) {
        const pad = 8 - (offset % 8);
        blocks.push({ type: 'padding', size: pad, offset });
        offset += pad;
      }
      blocks.push({ ...f, offset });
      offset += f.size;
    });

    // Final padding to 8-byte boundary
    if (offset % 8 !== 0) {
      const pad = 8 - (offset % 8);
      blocks.push({ type: 'padding', size: pad, offset });
      offset += pad;
    }

    return { blocks, total: offset };
  };

  const { blocks, total } = renderLayout();

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans">
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] rounded text-[10px] font-mono text-[#00d4ff]">L06</span>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">BEGINNER TRACK</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Field Reordering</h1>
        <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
          The JVM doesn't keep fields in the order you declare them. It rearranges them to minimize 
          <span className="text-red-400 font-bold"> Alignment Padding</span> and save memory.
        </p>
      </div>

      <div className="px-8 pb-8 flex flex-col lg:flex-row gap-12">
         <div className="flex-1 space-y-8">
            <div className="flex justify-center">
               <button 
                 onClick={() => setPack(!pack)}
                 className={`px-8 py-3 rounded-full text-xs font-black transition-all ${pack ? 'bg-accent-alive text-black shadow-[0_0_30px_rgba(0,212,255,0.4)]' : 'bg-white/10 text-white'}`}
               >
                 {pack ? 'DISABLE JVM OPTIMIZATION' : 'ENABLE FIELD PACKING'}
               </button>
            </div>

            <div className="p-8 bg-black/40 rounded-3xl border border-white/5 relative">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Memory Footprint: {total} bytes</h3>
                  <div className="flex gap-4">
                     <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-white/20" /> <span className="text-[8px] text-gray-500 uppercase">Padding</span></div>
                     <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-accent-alive" /> <span className="text-[8px] text-gray-500 uppercase">Data</span></div>
                  </div>
               </div>

               <div className="space-y-1">
                  {/* Grid visualization */}
                  <div className="grid grid-cols-8 gap-0.5">
                     {Array.from({ length: total }).map((_, i) => {
                        const block = blocks.find(b => i >= b.offset && i < b.offset + b.size);
                        const isPadding = block?.type === 'padding';
                        return (
                          <motion.div 
                            key={i}
                            layout
                            animate={{ 
                              backgroundColor: isPadding ? 'rgba(255,255,255,0.03)' : block?.color || '#111',
                              opacity: isPadding ? 1 : 0.8
                            }}
                            className="aspect-square rounded-[1px] border border-black/20"
                          />
                        );
                     })}
                  </div>
               </div>

               <div className="mt-8 space-y-2">
                  <AnimatePresence>
                     {blocks.map((b) => !b.type && (
                        <motion.div 
                          key={b.name} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5"
                        >
                           <div className="flex items-center gap-3">
                              <div className="w-2 h-6 rounded" style={{ backgroundColor: b.color }} />
                              <span className="text-[10px] font-mono text-gray-400">{b.name} ({b.type})</span>
                           </div>
                           <span className="text-[10px] font-mono font-bold text-white">{b.size} bytes</span>
                        </motion.div>
                     ))}
                  </AnimatePresence>
               </div>
            </div>
         </div>

         <div className="w-full lg:w-96 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">The "Hole" Problem</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed space-y-2">
                  CPUs prefer accessing memory at specific boundaries (usually 4 or 8 bytes). If a 8-byte <code className="text-white">long</code> starts at offset 1, it crosses two cache lines, causing a performance hit.
               </p>
               <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="text-[10px] font-bold text-red-400 mb-1">Unoptimized Order:</div>
                  <p className="text-[10px] text-gray-500">Declared: Header {'->'} Boolean {'->'} Long. Since Long must start at an 8-multiple, the JVM wastes 7 bytes of space as "padding".</p>
               </div>
            </div>

            <div className="p-6 rounded-3xl bg-accent-alive/5 border border-accent-alive/20">
               <h4 className="text-[10px] font-bold text-accent-alive uppercase mb-2">JVM Packing Rule</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed">
                  The JVM sorts fields by size: <span className="text-white">Longs/Doubles (8)</span>, then <span className="text-white">Ints/Floats (4)</span>, then <span className="text-white">Shorts/Chars (2)</span>, and finally <span className="text-white">Bytes/Booleans (1)</span>. This greedy sorting minimizes "holes" perfectly.
               </p>
               <p className="text-[10px] text-gray-600 font-mono mt-3 uppercase tracking-tighter">-XX:FieldsAllocationStyle=1</p>
            </div>
         </div>
      </div>
    </div>
  );
}