import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type LockState = 'UNLOCKED' | 'BIASED' | 'THIN' | 'FAT' | 'GC';

const states: Record<LockState, { label: string, bits: string, color: string, desc: string }> = {
  UNLOCKED: { label: 'Unlocked', bits: '01', color: '#00ff88', desc: 'Default state. No thread synchronization.' },
  BIASED: { label: 'Biased', bits: '101', color: '#00d4ff', desc: 'Performance optimization for single-thread locks.' },
  THIN: { label: 'Lightweight', bits: '00', color: '#ffaa00', desc: 'Contention detected. CAS-based locking active.' },
  FAT: { label: 'Heavyweight', bits: '10', color: '#ff4444', desc: 'Heavy contention. OS monitor used (waiting list).' },
  GC: { label: 'GC Marked', bits: '11', color: '#aa44ff', desc: 'Object is being processed or forwarded by GC.' },
};

export default function ObjectHeaderChapter() {
  const [state, setState] = useState<LockState>('UNLOCKED');

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans p-8">
      <div className="mb-8 shrink-0">
         <h1 className="text-3xl font-black mb-2">Object Header Bit Layout</h1>
         <p className="text-gray-400 text-sm max-w-2xl">The 12-16 byte overhead on every Java object. This "hidden" memory stores everything the JVM needs to manage <span className="text-white font-bold">Locks</span>, <span className="text-white font-bold">Identity</span>, and <span className="text-white font-bold">Garbage Collection</span>.</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-12">
         <div className="flex-1 space-y-8 flex flex-col items-center justify-center">
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 overflow-hidden">
               {Object.keys(states).map((s) => (
                  <button 
                    key={s} 
                    onClick={() => setState(s as LockState)} 
                    className={`px-4 py-2 text-[9px] font-bold tracking-widest transition-all ${state === s ? 'bg-white/10 text-white' : 'text-gray-600 hover:text-gray-400'}`}
                  >
                    {s}
                  </button>
               ))}
            </div>

            {/* The Header (64-bit Mark Word + 32-bit Klass) */}
            <div className="w-full max-w-lg space-y-4 font-mono">
               <div className="text-[10px] text-gray-600 font-bold tracking-widest uppercase">Mark Word (64-bit)</div>
               <div className="flex gap-1 h-12">
                  <div className="flex-[31] bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-gray-500">Identity HashCode (31 bits)</div>
                  <div className="flex-[4] bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-gray-500">Age</div>
                  <div className="flex-[1] bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-gray-500">B</div>
                  <motion.div 
                    animate={{ backgroundColor: states[state].color, borderColor: states[state].color }}
                    className="flex-[2] border flex items-center justify-center text-[10px] text-black font-black"
                  >
                    {states[state].bits}
                  </motion.div>
               </div>

               <div className="flex justify-between items-start pt-6 border-t border-white/5">
                  <div className="flex-1">
                     <div className="text-[10px] font-bold text-gray-500 mb-1">CURRENT STATE</div>
                     <div className="text-lg font-black" style={{ color: states[state].color }}>{states[state].label}</div>
                  </div>
                  <div className="flex-[2]">
                     <p className="text-xs text-gray-400 leading-relaxed italic">{states[state].desc}</p>
                  </div>
               </div>

               <div className="pt-8">
                  <div className="text-[10px] text-gray-600 font-bold tracking-widest uppercase mb-2">Klass Pointer (32-bit compressed)</div>
                  <div className="h-8 bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-[8px] text-blue-400">
                     PTR TO METASPACE_INSTANCE_KLASS_ENTRY (0x4fa...)
                  </div>
               </div>
            </div>
         </div>

         <div className="w-full lg:w-96 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">The Mark Word</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
                  The first 64 bits of an object are the most dynamic. It changes as threads compete for the object's monitor.
               </p>
               <ul className="space-y-3 text-[11px] text-gray-500">
                  <li className="flex gap-2"><span>•</span> <span>Age bits increment every time an object survives a Scavenge (GC).</span></li>
                  <li className="flex gap-2"><span>•</span> <span>Biased locking bits help single-threaded apps run much faster.</span></li>
                  <li className="flex gap-2"><span>•</span> <span>Identity HashCode is cached here once generated.</span></li>
               </ul>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 font-mono text-[10px] text-gray-700 italic">
               Object obj = new Object(); <br/>
               <span className="text-gray-500">// Header = 12 bytes (Mark + Klass)</span> <br/>
               <span className="text-gray-500">// Padding = 4 bytes (to align to 8)</span> <br/>
               <span className="text-white">// Total size = 16 bytes</span>
            </div>
         </div>
      </div>
    </div>
  );
}