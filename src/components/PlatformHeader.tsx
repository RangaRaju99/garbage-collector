import { useJVMStore } from '../store/jvmStore';
import { motion } from 'framer-motion';
import { Cpu, Maximize2, Settings, ChevronDown, Activity, MonitorDot } from 'lucide-react';

const javaVersions = [
  { id: '1.0', label: 'JDK 1.0' },
  { id: '1.2', label: 'JDK 1.2' },
  { id: '7',   label: 'Java 7'  },
  { id: '8',   label: 'Java 8'  },
  { id: '9',   label: 'Java 9'  },
  { id: '11',  label: 'Java 11' },
  { id: '17',  label: 'Java 17' },
  { id: '21',  label: 'Java 21' },
];

const modes = ['EXPLORE', 'MOVIE', 'LEARN'] as const;

export default function PlatformHeader() {
  const javaVersion = useJVMStore(state => state.javaVersion);
  const setVersion = useJVMStore(state => state.setVersion);
  const mode = useJVMStore(state => state.mode);
  const setMode = useJVMStore(state => state.setMode);
  const isRunning = useJVMStore(state => state.isRunning);
  const togglePlayback = useJVMStore(state => state.togglePlayback);

  return (
    <div className="h-full px-5 flex items-center justify-between font-sans select-none border-b border-white/5 bg-surface-primary/80 backdrop-blur-xl">
      
      {/* Brand */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-primary/15 border border-brand-primary/30 flex items-center justify-center">
            <Cpu size={14} className="text-brand-primary" />
          </div>
          <span className="text-[13px] font-bold text-white tracking-tight">JVM Monitor</span>
        </div>

        <div className="h-4 w-px bg-white/8" />

        <div className="flex items-center gap-1.5 cursor-pointer group">
          <div className="flex flex-col">
            <span className="text-[9px] font-semibold text-zinc-600 leading-none uppercase tracking-widest">Snapshot</span>
            <span className="text-[11px] font-medium text-zinc-300 leading-none mt-0.5">hotspot-v21-production</span>
          </div>
          <ChevronDown size={11} className="text-zinc-600 group-hover:text-zinc-300 transition-colors mt-1" />
        </div>

        {/* Live status indicator */}
        <div 
          onClick={togglePlayback}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border cursor-pointer transition-all ${
            isRunning 
              ? 'bg-emerald-500/8 border-emerald-500/20 hover:bg-emerald-500/12' 
              : 'bg-white/5 border-white/10 hover:bg-white/8'
          }`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-500'}`} />
          <span className={`text-[9px] font-bold uppercase tracking-widest ${isRunning ? 'text-emerald-400' : 'text-zinc-500'}`}>
            {isRunning ? 'Running' : 'Paused'}
          </span>
        </div>
      </div>

      {/* Java Version Timeline */}
      <div className="flex items-center bg-black/30 border border-white/6 rounded-lg p-1 gap-0.5">
        {javaVersions.map((v) => (
          <button
            key={v.id}
            onClick={() => setVersion(v.id)}
            title={v.label}
            className={`relative px-2.5 py-1 text-[10px] font-bold transition-all rounded-md ${
              javaVersion === v.id
                ? 'text-white'
                : 'text-zinc-600 hover:text-zinc-300'
            }`}
          >
            {javaVersion === v.id && (
              <motion.div
                layoutId="activeVersionPill"
                className="absolute inset-0 bg-white/10 border border-white/15 rounded-md"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className="relative z-10">
              {javaVersion === v.id ? v.label : v.id}
            </span>
          </button>
        ))}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Mode Switcher */}
        <div className="flex items-center bg-white/[0.03] border border-white/6 rounded-lg p-1 gap-0.5">
          {modes.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m.toLowerCase() as any)}
              className={`px-4 py-1.5 text-[10px] font-bold tracking-widest rounded-md transition-all ${
                mode.toUpperCase() === m
                  ? 'bg-brand-primary text-white shadow-lg'
                  : 'text-zinc-500 hover:text-zinc-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Icon Buttons */}
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-all" title="Activity">
            <Activity size={15} />
          </button>
          <button className="p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-all" title="Monitor">
            <MonitorDot size={15} />
          </button>
          <button className="p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-all" title="Settings">
            <Settings size={15} />
          </button>
          <button className="p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-all" title="Fullscreen">
            <Maximize2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
