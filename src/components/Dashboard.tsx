import { useJVMStore } from '../store/jvmStore';
import { Activity, Zap, Box, Layers, Terminal as TerminalIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const metrics = useJVMStore(state => state.metrics);
  const flags = useJVMStore(state => state.flags);
  const events = useJVMStore(state => state.events);
  const gcAlgorithm = useJVMStore(state => state.gcAlgorithm);
  const requestGC = useJVMStore(state => state.requestGC);
  const injectLeak = useJVMStore(state => state.injectLeak);

  const heapTotal = flags.Xmx;
  const heapUsagePercent = Math.round((metrics.heapUsed / heapTotal) * 100) || 0;

  return (
    <div className="flex-1 flex flex-col bg-surface-secondary overflow-hidden font-sans border-l border-white/5">
      {/* Header */}
      <div className="px-5 py-5 border-b border-white/5 bg-black/20 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-[13px] font-bold text-white tracking-tight uppercase">Live Telemetry</h2>
          <p className="text-[10px] text-zinc-500 font-medium font-mono tracking-wider mt-0.5">Real-time JVM Metrics</p>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-500/10 rounded-md border border-emerald-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.15em]">Connected</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-7 custom-scrollbar min-h-0">
        
        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
           <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
               <Layers size={24} className="text-brand-primary" />
             </div>
             <div className="relative z-10">
               <span className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-3 block">Heap Usage</span>
               <div className="flex items-baseline gap-1">
                 <span className="text-2xl font-black text-white font-mono">{heapUsagePercent}%</span>
                 <span className="text-[10px] text-zinc-600 font-bold uppercase">Util</span>
               </div>
               <div className="mt-2 text-[10px] text-zinc-500 font-medium font-mono">
                 {metrics.heapUsed}MB <span className="text-zinc-800">/</span> {heapTotal}MB
               </div>
             </div>
           </div>
           
           <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
               <Activity size={24} className="text-brand-primary" />
             </div>
             <div className="relative z-10">
               <span className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-3 block">Objects Alive</span>
               <div className="flex items-baseline gap-1">
                 <span className="text-2xl font-black text-white font-mono">{metrics.objectsAlive.toLocaleString()}</span>
               </div>
               <div className="mt-2 text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">
                 +2.4k <span className="text-zinc-600 font-medium lowercase">current cycle</span>
               </div>
             </div>
           </div>
        </div>

        {/* Segmentation Visualization */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
               <Layers size={11} className="text-brand-primary" /> Memory Segments
            </div>
            <span className="text-[9px] font-mono text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-md border border-brand-primary/20 font-black uppercase">
              {gcAlgorithm}
            </span>
          </div>
          
          <div className="h-6 w-full flex gap-1 p-1 bg-zinc-950 border border-white/5 rounded-xl overflow-hidden shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(metrics.edenUsed / heapTotal) * 100}%` }}
              className="h-full bg-emerald-500/40 border-r border-emerald-500/20 transition-all rounded-lg" 
            />
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(metrics.survivorUsed / heapTotal) * 100}%` }}
              className="h-full bg-blue-500/40 border-r border-blue-500/20 transition-all rounded-lg" 
            />
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(metrics.oldGenUsed / heapTotal) * 100}%` }}
              className="h-full bg-zinc-800 transition-all rounded-lg" 
            />
          </div>

          <div className="grid grid-cols-3 gap-3 px-1">
             {[
               { label: 'Eden', val: metrics.edenUsed, color: 'bg-emerald-500' },
               { label: 'Survivor', val: metrics.survivorUsed, color: 'bg-blue-500' },
               { label: 'Old Gen', val: metrics.oldGenUsed, color: 'bg-zinc-700' },
             ].map(item => (
               <div key={item.label} className="flex flex-col gap-1">
                 <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${item.color} shadow-[0_0_6px_rgba(255,255,255,0.1)]`} />
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.15em]">{item.label}</span>
                 </div>
                 <span className="text-[11px] text-white font-mono font-bold pl-3.5 tracking-tight">{item.val} MB</span>
               </div>
             ))}
          </div>
        </section>

        {/* System Logs */}
        <section className="flex-1 flex flex-col min-h-0 min-w-0 pb-6">
           <div className="flex items-center justify-between mb-4 px-1 shrink-0">
             <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
               <TerminalIcon size={11} className="text-brand-primary" /> Internal Log Stream
             </div>
             <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Listening</span>
             </div>
           </div>
           
           <div className="flex-1 p-5 bg-zinc-950/60 border border-white/5 rounded-2xl font-mono text-[11px] overflow-y-auto custom-scrollbar shadow-inner min-h-[300px]">
             <div className="space-y-4">
                {events.length > 0 ? events.map((ev, i) => (
                   <div key={i} className="flex gap-4 items-start group">
                     <span className="text-zinc-700 shrink-0 font-mono text-[9px] pt-1">
                       {new Date(ev.time).toLocaleTimeString([], { hour12: false, second: '2-digit', minute: '2-digit' })}
                     </span>
                     <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black uppercase tracking-widest ${
                            ev.type === 'GC' || ev.type === 'GC_REQ' ? 'text-status-error' : 
                            ev.type === 'OOM' ? 'text-status-error' :
                            ev.type === 'LEAK' ? 'text-status-warning' : 'text-brand-primary'
                          }`}>{ev.type}</span>
                          <div className={`h-px flex-1 min-w-[20px] ${
                            ev.type === 'GC' || ev.type === 'GC_REQ' ? 'bg-status-error/10' : 'bg-brand-primary/10'
                          }`} />
                        </div>
                        <span className="text-zinc-400 group-hover:text-zinc-200 transition-colors leading-relaxed font-medium">
                          {ev.message}
                        </span>
                     </div>
                   </div>
                )) : (
                   <div className="h-full flex flex-col items-center justify-center py-20 text-zinc-800 italic text-[11px]">
                     <Activity size={24} className="mb-4 opacity-10" />
                     Waiting for JVM activity...
                   </div>
                )}
             </div>
           </div>
        </section>
      </div>

      {/* Footer Controls */}
      <div className="p-5 bg-black/30 border-t border-white/5 grid grid-cols-2 gap-3 shrink-0">
        <button 
          onClick={requestGC} 
          className="flex items-center justify-center gap-2 py-3.5 bg-white text-black hover:bg-zinc-200 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all transform active:scale-95 shadow-xl shadow-white/5"
        >
          <Zap size={14} fill="currentColor" /> System.gc()
        </button>
        <button 
          onClick={injectLeak} 
          className="flex items-center justify-center gap-2 py-3.5 bg-zinc-900 border border-white/5 hover:bg-zinc-800 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] text-zinc-300 transition-all transform active:scale-95"
        >
          <Box size={14} /> Inject Leak
        </button>
      </div>
    </div>
  );
}
