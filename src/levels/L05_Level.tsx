import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type BitField = { name: string; size: string; val: string; color: string; desc: string; };

const markWord64: BitField[] = [
  { name: 'Unused', size: '25 bits', val: '00...', color: '#333', desc: 'Reserved for future use' },
  { name: 'Identity HashCode', size: '31 bits', val: '0x7A1F...', color: '#00d4ff', desc: 'System.identityHashCode() value' },
  { name: 'Unused', size: '1 bit', val: '0', color: '#222', desc: '' },
  { name: 'GC Age', size: '4 bits', val: '0011', color: '#ffaa00', desc: 'Increments each GC survival. Max 15.' },
  { name: 'Biased lock', size: '1 bit', val: '0', color: '#ff4444', desc: '0: non-biased, 1: biased' },
  { name: 'Lock state', size: '2 bits', val: '01', color: '#ff4444', desc: '01: unlocked, 00: lightweight, 10: heavy, 11: GC marked' },
];

export default function L05_Level() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans">
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] rounded text-[10px] font-mono text-[#00d4ff]">L05</span>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">BEGINNER TRACK</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Object Memory Layout</h1>
        <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
          Peeling back the abstraction. What does a Java object actually look like in RAM? 
          It's more than just your fields — it includes the critical "Object Header".
        </p>
      </div>

      <div className="px-8 pb-8 flex flex-col xl:flex-row gap-8">
         {/* Layout Diagram */}
         <div className="flex-1 space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Physical Layout (64-bit JVM)</h3>
            
            <div className="space-y-1">
               {/* Mark Word */}
               <motion.div 
                 onClick={() => setActive(0)}
                 className={`p-4 rounded-xl border cursor-pointer transition-all ${active === 0 ? 'bg-[rgba(0,212,255,0.08)] border-[#00d4ff]' : 'bg-white/5 border-white/10'}`}
               >
                  <div className="flex justify-between items-center mb-1">
                     <span className="font-bold text-sm">Mark Word</span>
                     <span className="text-[10px] font-mono text-gray-500">8 bytes (64 bits)</span>
                  </div>
                  <div className="flex gap-0.5 h-3 rounded-full overflow-hidden">
                     {markWord64.map((b, i) => (
                        <div key={i} style={{ flex: parseInt(b.size) || 1, backgroundColor: b.color }} />
                     ))}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2 italic">Stores metadata: hashcode, gc age, lock state.</p>
               </motion.div>

               {/* K lass Word */}
               <motion.div 
                 onClick={() => setActive(1)}
                 className={`p-4 rounded-xl border cursor-pointer transition-all ${active === 1 ? 'bg-[rgba(170,0,255,0.08)] border-[#aa00ff]' : 'bg-white/5 border-white/10'}`}
               >
                  <div className="flex justify-between items-center mb-1">
                     <span className="font-bold text-sm">Klass Word</span>
                     <span className="text-[10px] font-mono text-gray-500">4-8 bytes</span>
                  </div>
                  <p className="text-[10px] text-gray-400">Pointer to the class metadata in Metaspace. Defines the "type" of the object.</p>
               </motion.div>

               {/* Fields */}
               <motion.div 
                 onClick={() => setActive(2)}
                 className={`p-4 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-all ${active === 2 ? 'bg-white/10 border-white/30' : ''}`}
               >
                  <div className="flex justify-between items-center mb-1">
                     <span className="font-bold text-sm text-green-400">Instance Fields</span>
                     <span className="text-[10px] font-mono text-gray-500">Varies</span>
                  </div>
                  <p className="text-[10px] text-gray-500">Primitive values and references to other objects.</p>
                  <div className="mt-2 flex gap-1">
                     <div className="flex-1 h-2 rounded-sm bg-green-900/40" />
                     <div className="flex-1 h-2 rounded-sm bg-green-900/40" />
                     <div className="flex-1 h-2 rounded-sm bg-blue-900/40" />
                  </div>
               </motion.div>

               {/* Padding */}
               <motion.div 
                 className="p-3 rounded-xl border border-dashed border-white/5 bg-transparent"
               >
                  <div className="flex justify-between items-center">
                     <span className="font-bold text-xs text-gray-600 italic">Alignment Padding</span>
                     <span className="text-[10px] font-mono text-gray-700">0-7 bytes</span>
                  </div>
                  <p className="text-[9px] text-gray-700">Objects are always 8-byte aligned for CPU cache efficiency.</p>
               </motion.div>
            </div>
         </div>

         {/* Detail Panel */}
         <div className="w-full xl:w-96">
            <AnimatePresence mode="wait">
               {active === 0 ? (
                  <motion.div key="mark" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 rounded-2xl bg-black/40 border border-white/10">
                     <h3 className="font-bold text-[#00d4ff] mb-4">Mark Word Bit Breakdown</h3>
                     <div className="space-y-4">
                        {markWord64.slice(1).map((b, i) => (
                           <div key={i}>
                              <div className="flex justify-between text-[10px] font-bold mb-1">
                                 <span style={{ color: b.color }}>{b.name}</span>
                                 <span className="text-gray-500">{b.size}</span>
                              </div>
                              <div className="p-2 rounded bg-white/5 font-mono text-xs mb-1" style={{ borderColor: `${b.color}44`, borderLeft: `3px solid ${b.color}` }}>
                                 {b.val}
                              </div>
                              <p className="text-[10px] text-gray-500 leading-relaxed">{b.desc}</p>
                           </div>
                        ))}
                     </div>
                  </motion.div>
               ) : active === 1 ? (
                  <motion.div key="klass" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 rounded-2xl bg-black/40 border border-white/10">
                     <h3 className="font-bold text-[#aa00ff] mb-4">Klass Word & OOPs</h3>
                     <p className="text-sm text-gray-300 leading-relaxed mb-4">
                        Java uses <span className="text-[#aa00ff] font-bold">OOPs</span> (Ordinary Object Pointers).
                     </p>
                     <div className="p-4 rounded-lg bg-[rgba(170,0,255,0.1)] border border-[rgba(170,0,255,0.3)]">
                        <div className="text-[10px] font-bold uppercase mb-2">Optimization: Compressed OOPs</div>
                        <p className="text-[11px] text-gray-400 leading-relaxed">
                           On 64-bit systems, pointers take 8 bytes. With <code className="text-white">-XX:+UseCompressedOops</code>, the JVM treats pointers as 4-byte offsets if heap &lt; 32GB, saving massive amounts of memory.
                        </p>
                     </div>
                  </motion.div>
               ) : active === 2 ? (
                  <motion.div key="fields" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 rounded-2xl bg-black/40 border border-white/10">
                     <h3 className="font-bold text-green-400 mb-4">Field Packing & Reordering</h3>
                     <p className="text-sm text-gray-300 leading-relaxed mb-4">
                        The JVM reorders your fields to minimize memory gaps (padding).
                     </p>
                     <div className="space-y-2">
                        <div className="text-[10px] uppercase font-bold text-gray-500">Standard Order:</div>
                        <div className="text-[11px] text-gray-400 font-mono">1. Longs/Doubles (8b)<br/>2. Ints/Floats (4b)<br/>3. Shorts/Chars (2b)<br/>4. Bytes/Booleans (1b)<br/>5. References (4-8b)</div>
                     </div>
                  </motion.div>
               ) : (
                  <div className="h-full flex items-center justify-center border-2 border-dashed border-white/5 rounded-2xl text-gray-600 text-xs italic">
                     Click an object part to see deep-dive details.
                  </div>
               )}
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
}