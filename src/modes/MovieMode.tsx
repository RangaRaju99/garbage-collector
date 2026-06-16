import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJVMStore } from '../store/jvmStore';
import { Play, Pause, SkipForward, SkipBack, Info, Clapperboard, Activity, ShieldAlert } from 'lucide-react';

type Scene = {
  id: number;
  title: string;
  narrator: string;
  duration: number; 
  regionFocus: string;
  keyFact: string;
};

const scenes: Scene[] = [
  { id: 1, title: 'JVM City Awakens', narrator: 'Welcome to the JVM. What you see is not code — it is a living city. Every district is a memory region.', duration: 8, regionFocus: 'overview', keyFact: 'JVM memory: Heap (Eden, Survivor, Old Gen), Metaspace, Stack.' },
  { id: 2, title: 'Object Birth in TLAB', narrator: 'Watch. A new object is being born. The JVM finds the current thread\'s TLAB — a private lane in Eden. No contention.', duration: 8, regionFocus: 'eden', keyFact: 'TLAB (Thread-Local Allocation Buffer) enables zero-lock allocation per thread.' },
  { id: 3, title: 'Minor GC — Collection', narrator: 'Eden is full. The city freezes. GC robots emerge to trace every reference beam from GC roots.', duration: 9, regionFocus: 'eden', keyFact: 'Minor GC scans Young Gen only. 92% of objects typically die here.' },
  { id: 4, title: 'Survivor Spaces', narrator: 'Survivors move to S0. They wait, aging with every cycle they survive.', duration: 8, regionFocus: 'survivor', keyFact: 'Objects alternate between S0/S1 until they reach MaxTenuringThreshold.' },
  { id: 5, title: 'Promotion to Old Gen', narrator: 'This object has survived maturity. It promotes to the stable Old Generation residential district.', duration: 7, regionFocus: 'oldgen', keyFact: 'Long-lived objects move to Old Gen to avoid repeated scanning.' },
  { id: 6, title: 'Island of Isolation', narrator: 'Two objects referencing each other in a loop. No GC root can reach them. They are invisible to the robots.', duration: 8, regionFocus: 'island', keyFact: 'Circular references do NOT prevent collection if the island is unreachable.' },
  { id: 10, title: 'PermGen Explosion', narrator: 'Java 7 Archive Vault overflows. OOM: PermGen. Then — Java 8 removes the limit with Metaspace.', duration: 12, regionFocus: 'permgen', keyFact: 'Metaspace lives in native memory, preventing predictable PermGen OOMs.' },
  { id: 12, title: 'G1 — Garbage First', narrator: 'G1 targets regions with the most garbage first. Live objects evacuated, regions reclaimed.', duration: 9, regionFocus: 'g1', keyFact: 'G1 uses regional evacuation for predictable pause targets.' },
];

export default function MovieMode() {
  const [currentScene, setCurrentScene] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isExploding, setIsExploding] = useState(false);
  const timerRef = useRef<any>(null);
  const scene = scenes[currentScene];

  const setCameraSequence = useJVMStore(s => s.setCameraSequence);

  useEffect(() => {
    if (playing) {
      const interval = 100;
      timerRef.current = setInterval(() => {
        setProgress(p => {
          const next = p + (interval / (scene.duration * 1000)) * speed;
          if (next >= 1) {
            if (currentScene < scenes.length - 1) {
              setCurrentScene(cs => cs + 1);
              return 0;
            } else {
              setPlaying(false);
              return 1;
            }
          }
          return next;
        });
      }, interval);
    } else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [playing, currentScene, speed, scene.duration]);

  useEffect(() => {
    const map: Record<string, any> = {
      overview: 'default', eden: 'objectBirth', survivor: 'promotion',
      oldgen: 'promotion', island: 'islandCollapse', fullgc: 'fullGCFreeze',
      references: 'markPhase', tlab: 'objectBirth', permgen: 'markPhase',
      stack: 'default', g1: 'sweepPhase',
    };
    setCameraSequence(map[scene.regionFocus] ?? 'default');
  }, [currentScene]);

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-white relative overflow-hidden font-sans">
      
      {/* Cinematic Scene Strip */}
      <div className="flex bg-black/40 border-b border-white/5 px-4 pt-4 pb-2 gap-2 overflow-x-auto custom-scrollbar shrink-0">
        {scenes.map((s, i) => (
          <button 
            key={s.id} 
            onClick={() => { setCurrentScene(i); setProgress(0); }}
            className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
              i === currentScene 
                ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-[1.02]' 
                : i < currentScene 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                : 'bg-zinc-900 border-white/5 text-zinc-600 hover:text-zinc-400'
            }`}
          >
            {i < currentScene && '✓ '}{s.title}
          </button>
        ))}
      </div>

      {/* Main Narrative Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScene}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl space-y-10"
          >
            <div className="space-y-4">
               <div className="flex items-center justify-center gap-3">
                  <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-mono text-zinc-500 font-bold tracking-widest">
                    MODULE {currentScene + 1} / {scenes.length}
                  </div>
                  <span className="h-px w-8 bg-zinc-800" />
                  <div className="flex items-center gap-2 text-brand-primary text-[10px] font-black uppercase tracking-[0.2em]">
                     <Clapperboard size={12} /> Narrative Sequence
                  </div>
               </div>
               <h2 className="text-4xl font-black italic tracking-tight">{scene.title}</h2>
            </div>

            <p className="text-[18px] text-zinc-300 font-medium leading-relaxed italic max-w-2xl mx-auto">
              "{scene.narrator}"
            </p>

            <div className="inline-flex items-start gap-4 p-5 bg-brand-primary/5 border border-brand-primary/10 rounded-2xl text-left max-w-lg mx-auto">
               <Info size={18} className="text-brand-primary shrink-0 mt-1" />
               <div className="space-y-1">
                  <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Technical Insight</span>
                  <p className="text-[12px] text-zinc-400 leading-relaxed font-semibold">{scene.keyFact}</p>
               </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modern Cinematic Controls */}
      <div className="p-8 pb-10 bg-black/40 border-t border-white/5 space-y-6 shrink-0">
        
        {/* Progress Bar */}
        <div className="relative w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-brand-primary shadow-[0_0_15px_rgba(59,130,246,0.6)]" 
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: 'linear', duration: 0.1 }}
          />
        </div>

        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => { setCurrentScene(Math.max(0, currentScene - 1)); setProgress(0); }}
                className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-all active:scale-90"
              >
                <SkipBack size={18} fill="currentColor" />
              </button>
              
              <button 
                onClick={() => setPlaying(!playing)}
                className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:bg-zinc-200 transition-all shadow-xl shadow-white/5 active:scale-95"
              >
                {playing ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
              </button>

              <button 
                onClick={() => { setCurrentScene(Math.min(scenes.length - 1, currentScene + 1)); setProgress(0); }}
                className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-all active:scale-90"
              >
                <SkipForward size={18} fill="currentColor" />
              </button>

              <div className="h-6 w-px bg-white/5 mx-2" />

              <div className="flex gap-1.5">
                {[0.5, 1, 2].map(s => (
                  <button 
                    key={s} onClick={() => setSpeed(s)}
                    className={`min-w-[40px] px-2 py-1 rounded-lg text-[10px] font-black tracking-widest border transition-all ${
                      speed === s 
                        ? 'bg-zinc-800 border-white/10 text-white' 
                        : 'bg-transparent border-transparent text-zinc-600 hover:text-zinc-400'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
           </div>

           <div className="flex items-center gap-6">
              <div className="flex flex-col items-end gap-1">
                 <span className="text-[10px] font-black font-mono text-zinc-600 uppercase tracking-widest">Runtime Duration</span>
                 <div className="flex items-baseline gap-1">
                    <span className="text-[14px] font-black text-zinc-200 font-mono tracking-tighter">
                      0:{(Math.round(progress * scene.duration)).toString().padStart(2, '0')}
                    </span>
                    <span className="text-[11px] text-zinc-700 font-bold">/</span>
                    <span className="text-[11px] text-zinc-700 font-bold font-mono">0:{scene.duration}</span>
                 </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all">
                 <Activity size={12} /> Auto-Cam Active
              </button>
           </div>
        </div>
      </div>

    </div>
  );
}