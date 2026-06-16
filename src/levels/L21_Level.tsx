import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Bit = { field: string; bits: string; color: string; desc: string; };
type PointerState = 'normal' | 'marking' | 'relocating' | 'remapped';

const pointerStates: Record<PointerState, { label: string; bits: Bit[]; desc: string }> = {
  normal: {
    label: 'Normal State',
    desc: 'All color bits clear. Object at original address. No GC in progress.',
    bits: [
      { field: 'Unused [18b]', bits: '000000000000000000', color: '#333', desc: 'Reserved' },
      { field: 'Finalizable', bits: '0', color: '#2a2a2a', desc: 'Object needs finalization' },
      { field: 'Remapped', bits: '0', color: '#2a2a2a', desc: 'Pointer updated to new location' },
      { field: 'Marked1', bits: '0', color: '#2a2a2a', desc: 'Marked in odd GC cycle' },
      { field: 'Marked0', bits: '0', color: '#2a2a2a', desc: 'Marked in even GC cycle' },
      { field: 'Heap Address [42b]', bits: '0x7f3a1b208c00', color: '#1a3a2a', desc: 'Object location in ZGC heap' },
    ]
  },
  marking: {
    label: 'Mark Phase (M0 set)',
    desc: 'ZGC sets the M0 (Marked0) bit via load barriers. App reads object → barrier sees M0 unset → sets M0, schedules for marking.',
    bits: [
      { field: 'Unused [18b]', bits: '000000000000000000', color: '#333', desc: 'Reserved' },
      { field: 'Finalizable', bits: '0', color: '#2a2a2a', desc: '' },
      { field: 'Remapped', bits: '0', color: '#2a2a2a', desc: '' },
      { field: 'Marked1', bits: '0', color: '#2a2a2a', desc: '' },
      { field: 'Marked0 ◄ SET', bits: '1', color: '#00d4ff', desc: '← Marked in this GC cycle!' },
      { field: 'Heap Address [42b]', bits: '0x7f3a1b208c00', color: '#1a3a2a', desc: '' },
    ]
  },
  relocating: {
    label: 'Relocation Phase',
    desc: 'Object moved to new address. Forwarding table records old→new mapping. Load barrier intercepts stale reads and returns new address.',
    bits: [
      { field: 'Unused [18b]', bits: '000000000000000000', color: '#333', desc: '' },
      { field: 'Finalizable', bits: '0', color: '#2a2a2a', desc: '' },
      { field: 'Remapped', bits: '0', color: '#2a2a2a', desc: '' },
      { field: 'Marked1', bits: '1', color: '#ffaa00', desc: '← Object moved this cycle' },
      { field: 'Marked0', bits: '1', color: '#00d4ff', desc: '← Was marked' },
      { field: 'Heap Address [42b]', bits: '0x7f3b9a14c800 ← new', color: '#1a3a6a', desc: 'NEW address after relocation' },
    ]
  },
  remapped: {
    label: 'Remap Phase (complete)',
    desc: 'All stale pointers updated to new locations. Remapped bit set. Load barriers no longer need to fix pointers for this cycle.',
    bits: [
      { field: 'Unused [18b]', bits: '000000000000000000', color: '#333', desc: '' },
      { field: 'Finalizable', bits: '0', color: '#2a2a2a', desc: '' },
      { field: 'Remapped ◄ SET', bits: '1', color: '#00ff88', desc: '← Pointer fully updated ✅' },
      { field: 'Marked1', bits: '0', color: '#2a2a2a', desc: '' },
      { field: 'Marked0', bits: '0', color: '#2a2a2a', desc: '' },
      { field: 'Heap Address [42b]', bits: '0x7f3b9a14c800', color: '#1a3a2a', desc: 'Stable new address' },
    ]
  },
};

export default function L21_Level() {
  const [state, setState] = useState<PointerState>('normal');

  const info = pointerStates[state];
  const stateOrder: PointerState[] = ['normal', 'marking', 'relocating', 'remapped'];

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans">
      <div className="px-8 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] rounded text-[10px] font-mono text-[#00d4ff]">L21</span>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">ADVANCED TRACK</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">ZGC — Colored Pointers</h1>
        <p className="text-gray-400 text-sm">ZGC stores GC metadata IN the pointer itself. Pause time &lt;1ms regardless of heap size. Production since Java 15.</p>
      </div>

      {/* State selector */}
      <div className="px-8 pb-4">
        <div className="flex gap-2 flex-wrap">
          {stateOrder.map((s) => (
            <button key={s} onClick={() => setState(s)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition border ${state === s ? 'bg-[rgba(0,212,255,0.15)] border-[rgba(0,212,255,0.5)] text-[#00d4ff]' : 'border-[rgba(255,255,255,0.08)] text-gray-500 hover:text-white'}`}>
              {pointerStates[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* 64-bit pointer visualization */}
      <div className="px-8 pb-5">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">64-BIT COLORED POINTER</div>
        <AnimatePresence mode="wait">
          <motion.div key={state} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-1">
            {info.bits.map((bit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2"
              >
                <div className="w-28 text-[10px] font-mono text-gray-500 shrink-0 text-right">{bit.field}</div>
                <div
                  className="px-2 py-1.5 rounded font-mono text-[11px] font-bold border transition-all"
                  style={{
                    backgroundColor: `${bit.color}`,
                    borderColor: bit.color === '#333' || bit.color === '#2a2a2a' ? '#333' : bit.color,
                    color: bit.color === '#333' || bit.color === '#2a2a2a' ? '#555' : '#fff',
                    boxShadow: bit.color !== '#333' && bit.color !== '#2a2a2a' && bit.color !== '#1a3a2a' && bit.color !== '#1a3a6a' ? `0 0 10px ${bit.color}66` : 'none',
                  }}
                >
                  {bit.bits}
                </div>
                {bit.desc && <span className="text-[10px] text-gray-500">{bit.desc}</span>}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Description */}
      <div className="px-8 pb-5">
        <div className="p-4 rounded-xl border border-[rgba(0,212,255,0.15)] bg-[rgba(0,212,255,0.04)]">
          <h3 className="font-bold text-white text-sm mb-2">{info.label}</h3>
          <p className="text-sm text-gray-300 leading-relaxed">{info.desc}</p>
        </div>
      </div>

      {/* Pause time comparison */}
      <div className="px-8 pb-8">
        <div className="grid md:grid-cols-3 gap-3">
          {[
            { label: 'ZGC Pause Time', val: '< 1ms', sub: 'Any heap size (4GB or 4TB)', color: '#00ff88' },
            { label: 'G1 Pause Time', val: '10–200ms', sub: '512MB heap, tuned target', color: '#ffaa00' },
            { label: 'Full GC Pause', val: '1000–5000ms', sub: '512MB heap, old collectors', color: '#ff4444' },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)]">
              <div className="text-xs text-gray-500 mb-1">{s.label}</div>
              <div className="text-xl font-black" style={{ color: s.color }}>{s.val}</div>
              <div className="text-[10px] text-gray-600">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}