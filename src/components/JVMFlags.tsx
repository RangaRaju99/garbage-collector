import { useJVMStore, type GCAlgorithm } from '../store/jvmStore';
import { Settings2, Cpu, Zap, Activity } from 'lucide-react';

export default function JVMFlags() {
  const flags = useJVMStore((state) => state.flags);
  const setFlag = useJVMStore((state) => state.setFlag);
  const gcAlgo = useJVMStore((state) => state.gcAlgorithm);
  const setAlgorithm = useJVMStore((state) => state.setAlgorithm);

  return (
    <div className="flex-1 flex flex-col bg-surface-secondary overflow-hidden font-sans border-l border-white/5">
      {/* Header */}
      <div className="px-5 py-5 border-b border-white/5 bg-black/20 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-[13px] font-bold text-white tracking-tight uppercase">Tuning Console</h2>
          <p className="text-[10px] text-zinc-500 font-medium font-mono tracking-wider mt-0.5">Parameters & Runtime Flags</p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-zinc-800/50 border border-white/5 flex items-center justify-center">
          <Settings2 size={14} className="text-zinc-400" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-7 custom-scrollbar pb-10">
        
        {/* Heap Allocation Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-1">
            <Cpu size={11} className="text-brand-primary" /> Heap Geometry
          </div>
          
          <div className="space-y-6 bg-zinc-950/40 border border-white/5 rounded-xl p-5 shadow-sm">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-semibold text-zinc-300">-Xmx <span className="text-zinc-600 font-normal ml-1">Max Heap Limit</span></span>
                <span className="font-mono text-brand-primary font-black">{flags.Xmx} MB</span>
              </div>
              <div className="relative group">
                 <input 
                  type="range" min="128" max="8192" step="128" 
                  value={flags.Xmx} 
                  onChange={(e) => setFlag('Xmx', parseInt(e.target.value))} 
                  className="w-full h-1 appearance-none bg-white/5 rounded-full accent-brand-primary cursor-pointer hover:bg-white/10 transition-all" 
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-semibold text-zinc-300">-Xms <span className="text-zinc-600 font-normal ml-1">Initial Memory</span></span>
                <span className="font-mono text-brand-primary font-black">{flags.Xms} MB</span>
              </div>
              <div className="relative group">
                <input 
                  type="range" min="64" max="4096" step="64" 
                  value={flags.Xms} 
                  onChange={(e) => setFlag('Xms', parseInt(e.target.value))} 
                  className="w-full h-1 appearance-none bg-white/5 rounded-full accent-brand-primary cursor-pointer hover:bg-white/10 transition-all" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Generational Internals Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-1">
             <Activity size={11} className="text-brand-primary" /> Promotion Logic
          </div>
          <div className="bg-zinc-950/40 border border-white/5 rounded-xl p-5 space-y-6 shadow-sm">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-semibold text-zinc-300">-XX:NewRatio</span>
                <span className="font-mono text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">1 : {flags.NewRatio}</span>
              </div>
              <input 
                type="range" min="1" max="10" step="1" 
                value={flags.NewRatio} 
                onChange={(e) => setFlag('NewRatio', parseInt(e.target.value))} 
                className="w-full h-1 appearance-none bg-white/5 rounded-full accent-brand-primary cursor-pointer hover:bg-white/10 transition-all" 
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-semibold text-zinc-300">-XX:MaxTenuringThreshold</span>
                <span className="font-mono text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">{flags.MaxTenuringThreshold}</span>
              </div>
              <input 
                type="range" min="1" max="15" step="1" 
                value={flags.MaxTenuringThreshold} 
                onChange={(e) => setFlag('MaxTenuringThreshold', parseInt(e.target.value))} 
                className="w-full h-1 appearance-none bg-white/5 rounded-full accent-brand-primary cursor-pointer hover:bg-white/10 transition-all" 
              />
            </div>
          </div>
        </div>

        {/* GC Algorithm Selector */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-1">
             <Zap size={11} className="text-brand-primary" /> Collection Strategy
           </div>
           <div className="grid grid-cols-2 gap-2">
             {(['Serial', 'Parallel', 'CMS', 'G1', 'ZGC', 'Shenandoah', 'Epsilon'] as GCAlgorithm[]).map((algo) => (
               <button
                 key={algo}
                 onClick={() => setAlgorithm(algo)}
                 className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-[11px] font-bold transition-all duration-200 group ${
                   gcAlgo === algo 
                     ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-blue-900/30' 
                     : 'bg-zinc-950/40 border-white/5 text-zinc-500 hover:bg-white/5 hover:text-zinc-300 hover:border-white/10'
                 }`}
               >
                 {algo}
                 {gcAlgo === algo && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
               </button>
             ))}
           </div>
        </div>

        {/* Feature Toggles */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-1">
             Feature Optimization
           </div>
           <div className="bg-zinc-950/40 border border-white/5 rounded-xl p-1 divide-y divide-white/5 overflow-hidden shadow-sm">
              <label className="flex items-center justify-between px-4 py-3 cursor-pointer group hover:bg-white/[0.02] transition-all">
                <div className="flex flex-col">
                   <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-tighter">UseCompressedOops</span>
                   <span className="text-[9px] text-zinc-600 font-medium">Pointer compression optimization</span>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" checked={flags.UseCompressedOops} 
                    onChange={(e) => setFlag('UseCompressedOops', e.target.checked)} 
                    className="sr-only peer" 
                  />
                  <div className="w-8 h-4 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-500 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500/20 peer-checked:after:bg-emerald-500" />
                </div>
              </label>
              <label className="flex items-center justify-between px-4 py-3 cursor-pointer group hover:bg-white/[0.02] transition-all">
                <div className="flex flex-col">
                   <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-tighter">UseTLAB</span>
                   <span className="text-[9px] text-zinc-600 font-medium">Thread-Local Allocation Buffers</span>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" checked={flags.UseTLAB} 
                    onChange={(e) => setFlag('UseTLAB', e.target.checked)} 
                    className="sr-only peer" 
                  />
                  <div className="w-8 h-4 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-500 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500/20 peer-checked:after:bg-emerald-500" />
                </div>
              </label>
           </div>
        </div>
      </div>
    </div>
  );
}
