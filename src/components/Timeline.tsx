
import { Play, Square, FastForward, Rewind, Settings } from 'lucide-react';

export default function Timeline() {
  return (
    <div className="w-full h-full flex items-center px-6 gap-6">
      {/* Playback Controls */}
      <div className="flex items-center gap-3">
        <button className="w-10 h-10 rounded-full bg-accent-alive text-black flex items-center justify-center hover:bg-accent-alive-alt transition">
          <Play size={20} className="ml-1" />
        </button>
        <button className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-white flex items-center justify-center transition">
          <Square size={16} />
        </button>
      </div>

      {/* Scrub Bar */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex justify-between text-xs text-gray-500 mb-1 font-mono">
          <span>00:00</span>
          <span>Minor GC triggered</span>
          <span>01:30</span>
        </div>
        <div className="relative w-full h-2 bg-[rgba(255,255,255,0.1)] rounded-full cursor-pointer">
          {/* Timeline progress line */}
          <div className="absolute top-0 left-0 h-full w-1/3 bg-accent-alive rounded-l-full"></div>
          
          {/* Playhead */}
          <div className="absolute top-1/2 left-1/3 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(0,212,255,0.5)]"></div>
          
          {/* GC Event Markers */}
          <div className="absolute top-0 left-[10%] w-1 h-full bg-yellow-400" title="Minor GC"></div>
          <div className="absolute top-0 left-[25%] w-1 h-full bg-yellow-400" title="Minor GC"></div>
        </div>
      </div>

      {/* Speed & Settings */}
      <div className="flex items-center gap-4 text-gray-400">
        <div className="flex bg-[rgba(255,255,255,0.05)] rounded-md overflow-hidden text-xs font-mono">
          <button className="px-3 py-1.5 hover:bg-[rgba(255,255,255,0.1)] transition border-r border-[rgba(255,255,255,0.05)]">0.5x</button>
          <button className="px-3 py-1.5 bg-accent-alive text-black font-bold">1.0x</button>
          <button className="px-3 py-1.5 hover:bg-[rgba(255,255,255,0.1)] transition border-l border-[rgba(255,255,255,0.05)]">2.0x</button>
        </div>
        <button className="text-gray-400 hover:text-white transition">
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
}
