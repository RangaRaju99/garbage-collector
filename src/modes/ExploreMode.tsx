import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Command, Box, Cpu, Zap, Activity } from 'lucide-react';

export default function ExploreMode() {
  const [focus, setFocus] = useState<string | null>(null);

  const regions = [
    { id: 'eden', label: 'Eden Space', desc: 'Object allocation district via TLAB bump-pointer logic. High churn.', metric: '82%', color: '#10b981' },
    { id: 'survivor', label: 'Survivor Space', desc: 'Aging area for objects surviving minor GC cycles. Copied bi-directionally.', metric: '14%', color: '#3b82f6' },
    { id: 'oldgen', label: 'Old Generation', desc: 'Long-term storage for tenant-stable objects. Major GC target.', metric: '45%', color: '#6366f1' },
    { id: 'metaspace', label: 'Metaspace', desc: 'Native memory for class metadata, vtables and JIT info.', metric: '124MB', color: '#f59e0b' },
    { id: 'stack', label: 'Thread Stack', desc: 'Local variables and PC register control frames. Stack-per-thread.', metric: '1MB/T', color: '#06b6d4' },
    { id: 'stringpool', label: 'String Pool', desc: 'Shared interned character sequence deduplication in heap.', metric: '42k', color: '#ec4899' },
    { id: 'directmem', label: 'Direct Memory', desc: 'Off-heap ByteBuffer mapping to OS address space. Unbounded.', metric: '12MB', color: '#94a3b8' },
    { id: 'codecache', label: 'Code Cache', desc: 'Non-heap storage for C2 optimized JIT binaries. Native code.', metric: '32MB', color: '#8b5cf6' },
  ];

  return (
    <div className="h-full flex flex-col bg-surface-secondary overflow-hidden font-sans">
      {/* Header */}
      <div className="px-5 py-5 border-b border-white/5 bg-black/20 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-[13px] font-bold text-white tracking-tight uppercase">System Map</h2>
          <p className="text-[10px] text-zinc-500 font-medium font-mono tracking-wider mt-0.5">Heap Topography & Regions</p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-zinc-800/50 border border-white/5 flex items-center justify-center">
          <Map size={14} className="text-zinc-400" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar min-h-0">
        
        {/* Region Grid */}
        <div className="grid grid-cols-1 gap-3 mb-8">
          {regions.map(region => (
            <motion.button
              key={region.id}
              onClick={() => setFocus(focus === region.id ? null : region.id)}
              className={`text-left p-4 rounded-xl border transition-all duration-200 relative overflow-hidden group ${
                focus === region.id 
                  ? 'bg-zinc-950/80 border-white/20 ring-1 ring-white/10' 
                  : 'bg-zinc-950/30 border-white/5 hover:border-white/10 hover:bg-zinc-950/50 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]" style={{ backgroundColor: region.color }} />
                  <span className={`font-black text-[11px] uppercase tracking-wider ${focus === region.id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                    {region.label}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-zinc-600 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                  {region.metric}
                </span>
              </div>
              
              <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                {region.desc}
              </p>
              
              <AnimatePresence>
                {focus === region.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-4 overflow-hidden"
                  >
                    <div className="space-y-1">
                       <span className="block text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Health</span>
                       <div className="flex items-center gap-2">
                          <Activity size={10} className="text-emerald-500" />
                          <span className="text-[10px] font-mono text-zinc-300">NOMINAL</span>
                       </div>
                    </div>
                    <div className="space-y-1">
                       <span className="block text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Access Pattern</span>
                       <div className="flex items-center gap-2">
                          <Zap size={10} className="text-brand-primary" />
                          <span className="text-[10px] font-mono text-zinc-300">BURST_Y</span>
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>

        {/* Global Shortcut Cheat-sheet */}
        <section className="bg-zinc-950/50 border border-white/5 rounded-2xl p-5 shadow-inner">
           <div className="flex items-center gap-3 mb-5 px-1">
              <div className="w-6 h-6 rounded bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
                <Command size={10} className="text-brand-primary" />
              </div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Live Bindings</span>
           </div>
           
           <div className="grid grid-cols-2 gap-x-8 gap-y-4 px-1">
             {[
               ['X', 'X-Ray View'], ['H', 'Object Headers'],
               ['C', 'Card Table'], ['V', 'TLAB Bounds'],
               ['N', 'NMT View'], ['T', 'Thread Pool'],
               ['G', 'Manual GC'], ['R', 'Cold Reset'],
             ].map(([key, action]) => (
               <div key={key} className="flex items-center justify-between group">
                 <span className="text-[10px] text-zinc-500 font-bold tracking-tight group-hover:text-zinc-300 transition-colors uppercase">{action}</span>
                 <kbd className="min-w-[20px] h-5 flex items-center justify-center bg-zinc-800 rounded border border-white/10 text-white text-[9px] font-black group-hover:bg-brand-primary group-hover:text-black transition-all shadow-sm">
                   {key}
                 </kbd>
               </div>
             ))}
           </div>
        </section>
      </div>
    </div>
  );
}