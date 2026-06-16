import { useJVMStore } from '../store/jvmStore';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

const SPEED_OPTIONS = [0.25, 0.5, 1, 2, 4];

export default function Timeline() {
  const isRunning = useJVMStore(state => state.isRunning);
  const playbackSpeed = useJVMStore(state => state.playbackSpeed);
  const togglePlayback = useJVMStore(state => state.togglePlayback);
  const setSimulationSpeed = useJVMStore(state => state.setSimulationSpeed);
  const events = useJVMStore(state => state.events);

  const latestEvent = events[0];

  return (
    <div className="w-full h-full flex items-center px-5 gap-5 bg-surface-primary/90 border-t border-white/5 font-sans">
      
      {/* Playback Controls */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
          title="Skip Back"
        >
          <SkipBack size={14} />
        </button>
        <button
          onClick={togglePlayback}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all font-bold ${
            isRunning
              ? 'bg-brand-primary/15 border border-brand-primary/30 text-brand-primary hover:bg-brand-primary/25'
              : 'bg-white/8 border border-white/10 text-white hover:bg-white/12'
          }`}
          title={isRunning ? 'Pause simulation' : 'Resume simulation'}
        >
          {isRunning ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
        </button>
        <button
          className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
          title="Skip Forward"
        >
          <SkipForward size={14} />
        </button>
      </div>

      {/* Timestamps */}
      <span className="text-[10px] font-mono text-zinc-600 shrink-0">00:00</span>

      {/* Scrub Bar */}
      <div className="flex-1 flex flex-col justify-center gap-1.5">
        <div className="relative w-full h-[3px] bg-white/6 rounded-full overflow-visible cursor-pointer group">
          {/* Progress fill */}
          <div className="absolute top-0 left-0 h-full w-1/3 bg-brand-primary/50 rounded-full" />
          
          {/* GC Event Markers */}
          <div className="absolute top-1/2 left-[10%] -translate-y-1/2 w-0.5 h-3 bg-amber-400/70 rounded-full" title="Minor GC" />
          <div className="absolute top-1/2 left-[25%] -translate-y-1/2 w-0.5 h-3 bg-amber-400/70 rounded-full" title="Minor GC" />
          <div className="absolute top-1/2 left-[60%] -translate-y-1/2 w-0.5 h-5 bg-red-400/80 rounded-full" title="Major GC" />

          {/* Playhead */}
          <div className="absolute top-1/2 left-1/3 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Latest event label */}
        <div className="flex items-center gap-2">
          {latestEvent ? (
            <>
              <span className={`text-[8px] font-bold uppercase tracking-wider ${
                latestEvent.type.includes('GC') ? 'text-amber-400' : 'text-brand-primary'
              }`}>
                {latestEvent.type}
              </span>
              <span className="text-[9px] text-zinc-600 font-mono">{latestEvent.message}</span>
            </>
          ) : (
            <span className="text-[9px] text-zinc-700 font-mono">Simulation idle — waiting for events...</span>
          )}
        </div>
      </div>

      {/* End time */}
      <span className="text-[10px] font-mono text-zinc-600 shrink-0">01:30</span>

      {/* Speed Controls */}
      <div className="flex items-center bg-black/30 border border-white/6 rounded-md overflow-hidden shrink-0 font-mono">
        {SPEED_OPTIONS.map((speed) => (
          <button
            key={speed}
            onClick={() => setSimulationSpeed(speed)}
            className={`px-2.5 py-1.5 text-[10px] font-bold transition-all border-r border-white/6 last:border-0 ${
              playbackSpeed === speed
                ? 'bg-white/10 text-white'
                : 'text-zinc-600 hover:text-zinc-300 hover:bg-white/5'
            }`}
          >
            {speed}x
          </button>
        ))}
      </div>
    </div>
  );
}
