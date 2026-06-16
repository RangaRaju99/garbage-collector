import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJVMStore } from '../store/jvmStore';

type Scene = {
  id: number;
  title: string;
  narrator: string;
  duration: number; // seconds
  regionFocus: string;
  keyFact: string;
};

const scenes: Scene[] = [
  { id: 1, title: 'JVM City Awakens', narrator: 'Welcome to the JVM. What you see is not code — it is a living city. Every district is a memory region. Every moving object is a Java object being allocated right now.', duration: 8, regionFocus: 'overview', keyFact: 'The JVM divides memory into regions: Heap (Eden, Survivor, Old Gen), Metaspace, Stack, and Direct Memory.' },
  { id: 2, title: 'Object Birth in TLAB', narrator: 'Watch. A new object is being born. The JVM finds the current thread\'s TLAB — a private lane in Eden. The bump pointer advances. No lock acquired. Zero contention.', duration: 8, regionFocus: 'eden', keyFact: 'TLAB (Thread-Local Allocation Buffer) gives each thread a private chunk of Eden. 10,000 objects created — 0 locks acquired.' },
  { id: 3, title: 'Minor GC — The First Collection', narrator: 'Eden is full. The GC signal fires. All threads reach safepoints. The city freezes. GC robots emerge. They trace every reference beam from GC roots outward.', duration: 9, regionFocus: 'eden', keyFact: 'Minor GC scans only Young Gen (Eden + 2 Survivor spaces). 92% of objects die here. Pause: 5-50ms.' },
  { id: 4, title: 'Survivor Spaces — The Waiting Room', narrator: 'Survivors from Eden are moved to Survivor space S0. Objects that survive again move to S1. Their age counter increments with every GC they survive.', duration: 8, regionFocus: 'survivor', keyFact: 'Objects alternate between S0 and S1. Age increments each GC. Default MaxTenuringThreshold = 15.' },
  { id: 5, title: 'Promotion to Old Gen', narrator: 'This object has survived 15 GC cycles. It has earned its place in the Old Generation — the luxury residential district. Here it will live until a Major or Full GC comes.', duration: 7, regionFocus: 'oldgen', keyFact: 'After MaxTenuringThreshold GCs, objects promote to Old Gen. Old Gen collected less frequently but pauses are longer.' },
  { id: 6, title: 'Island of Isolation', narrator: 'Three objects, each referencing the others. A closed loop. No GC root can reach them. They think they\'re alive — but to the GC, they are invisible. Watch what happens.', duration: 8, regionFocus: 'island', keyFact: 'Circular references do NOT prevent GC collection. Reachability is defined from GC roots — not from other objects.' },
  { id: 7, title: 'Full GC — City Wide Freeze', narrator: 'Old Gen is 85% full. The JVM cannot wait. Full GC begins. Every application thread arrives at a safepoint. The city goes dark. GC robots sweep the entire heap.', duration: 9, regionFocus: 'fullgc', keyFact: 'Full GC pauses all threads and collects the entire heap. Can take seconds on large heaps. Design system to avoid Full GC.' },
  { id: 8, title: 'Reference Types', narrator: 'Four types of reference beams connect objects. The green beam — strong — cannot be broken by GC. The yellow beam — weak — snaps at the next collection. Blue — soft — breaks only under memory pressure.', duration: 9, regionFocus: 'references', keyFact: 'Strong Reference: never GC\'d. Soft: memory pressure. Weak: next GC. Phantom: post-finalization notification only.' },
  { id: 9, title: 'TLAB Allocation — Zero Locks', narrator: 'Three threads allocate one million objects. Watch the counters. Each thread writes to its own private TLAB lane. No locking. No contention. No waiting. Pure speed.', duration: 7, regionFocus: 'tlab', keyFact: 'At 1,000,000 objects with TLAB: 0 lock acquisitions. Without TLAB: up to 1,000,000 lock acquisitions.' },
  { id: 10, title: 'PermGen → Metaspace Migration', narrator: 'Java 7. The Archive Vault is overflowing. Ten deployments. Ten class loaders. The shelves are full. OutOfMemoryError: PermGen space. Server crashes. Then — Java 8 changes everything.', duration: 12, regionFocus: 'permgen', keyFact: 'Java 8 removed PermGen permanently. Metaspace now lives in native memory — unbounded by default. Set -XX:MaxMetaspaceSize to cap it.' },
  { id: 11, title: 'Escape Analysis Optimization', narrator: 'The JIT compiler scans this method. It finds a Point object. It traces every path. The object never escapes the method. The GC robots walk straight past it — they cannot see stack-allocated objects.', duration: 8, regionFocus: 'stack', keyFact: 'Escape analysis enables stack allocation and scalar replacement. Result: zero heap allocations, zero GC pressure for local objects.' },
  { id: 12, title: 'G1 Region — Garbage First', narrator: 'G1 sees every region\'s garbage density. Red means most garbage. G1 selects the top offenders — the Collection Set. Live objects evacuated. Old regions freed completely. Maximum reclamation per millisecond.', duration: 9, regionFocus: 'g1', keyFact: 'G1 targets regions with most garbage first. Pause target is configurable: -XX:MaxGCPauseMillis=200. Default GC since Java 9.' },
];

export default function MovieMode() {
  const [currentScene, setCurrentScene] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [showNarrator, setShowNarrator] = useState(true);
  const [isExploding, setIsExploding] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
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
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, currentScene, speed, scene.duration]);

  // Sync camera to scene region
  useEffect(() => {
    const map: Record<string, any> = {
      overview: 'default', eden: 'objectBirth', survivor: 'promotion',
      oldgen: 'promotion', island: 'islandCollapse', fullgc: 'fullGCFreeze',
      references: 'markPhase', tlab: 'objectBirth', permgen: 'markPhase',
      stack: 'default', g1: 'sweepPhase',
    };
    const seq = map[scene.regionFocus] ?? 'default';
    setCameraSequence(seq);

    // Trigger PermGen Explosion cinematic in Scene 10
    if (scene.id === 10) {
      setTimeout(() => {
        setIsExploding(true);
        const shell = document.getElementById('main-content-shell');
        if (shell) shell.classList.add('shake-active');
        
        setTimeout(() => {
          setIsExploding(false);
          if (shell) shell.classList.remove('shake-active');
        }, 2000);
      }, 5000); // Explode after mention of failure
    }
  }, [currentScene]);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Scene selector */}
      <div className="flex overflow-x-auto gap-1 px-4 pt-4 pb-2 shrink-0">
        {scenes.map((s, i) => (
          <button key={s.id} onClick={() => { setCurrentScene(i); setProgress(0); }}
            className={`shrink-0 px-3 py-1.5 rounded text-[10px] font-bold transition border whitespace-nowrap ${
              i === currentScene ? 'bg-[rgba(0,212,255,0.15)] border-[rgba(0,212,255,0.4)] text-[#00d4ff]' :
              i < currentScene ? 'bg-[rgba(0,255,136,0.08)] border-[rgba(0,255,136,0.2)] text-[#00ff88]' :
              'border-[rgba(255,255,255,0.06)] text-gray-600 hover:text-gray-300'
            }`}
          >
            {i < currentScene ? '✓ ' : ''}{s.id}. {s.title}
          </button>
        ))}
      </div>

      {/* Current scene */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScene}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col"
          >
            {/* Scene header */}
            <div className="px-6 py-3">
              <div className="flex items-center gap-3">
                <div className="px-2 py-0.5 bg-[rgba(255,255,255,0.08)] rounded text-[10px] font-mono text-gray-400">
                  SCENE {scene.id} / {scenes.length}
                </div>
                <h2 className="text-lg font-black text-white">{scene.title}</h2>
              </div>
              {/* Key fact badge */}
              <div className="mt-2 px-3 py-2 bg-[rgba(0,212,255,0.06)] border border-[rgba(0,212,255,0.15)] rounded-lg">
                <div className="text-[9px] font-bold text-[#00d4ff] uppercase tracking-widest mb-0.5">KEY FACT</div>
                <p className="text-[11px] text-gray-300">{scene.keyFact}</p>
              </div>
            </div>

            {/* Narrator */}
            {showNarrator && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-6 mb-3 p-4 bg-[rgba(0,0,0,0.6)] border border-[rgba(255,255,255,0.08)] rounded-xl backdrop-blur-sm"
              >
                <div className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> NARRATOR
                </div>
                <p className="text-sm text-gray-200 leading-relaxed italic">"{scene.narrator}"</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-[rgba(255,255,255,0.05)] mx-4">
        <motion.div className="h-full bg-[#00d4ff]" style={{ width: `${progress * 100}%` }} />
      </div>

      {/* Playback controls */}
      <div className="flex items-center gap-4 px-6 py-3 border-t border-[rgba(255,255,255,0.06)] shrink-0">
        <button onClick={() => { setCurrentScene(Math.max(0, currentScene - 1)); setProgress(0); }}
          className="text-gray-400 hover:text-white transition text-lg">⏮</button>
        <button onClick={() => setPlaying(!playing)}
          className="w-10 h-10 rounded-full bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.4)] text-[#00d4ff] flex items-center justify-center hover:bg-[rgba(0,212,255,0.25)] transition text-lg">
          {playing ? '⏸' : '▶'}
        </button>
        <button onClick={() => { setCurrentScene(Math.min(scenes.length - 1, currentScene + 1)); setProgress(0); }}
          className="text-gray-400 hover:text-white transition text-lg">⏭</button>

        {/* Speed selector */}
        <div className="flex gap-1 ml-2">
          {[0.25, 1, 2, 4].map(s => (
            <button key={s} onClick={() => setSpeed(s)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition border ${speed === s ? 'bg-[rgba(0,212,255,0.15)] border-[rgba(0,212,255,0.4)] text-[#00d4ff]' : 'border-[rgba(255,255,255,0.08)] text-gray-500'}`}>
              {s}×
            </button>
          ))}
        </div>

        {/* Scene time */}
        <div className="ml-auto text-[10px] font-mono text-gray-500">
          {Math.round(progress * scene.duration)}s / {scene.duration}s
        </div>
        <button onClick={() => setShowNarrator(!showNarrator)}
          className="text-[10px] text-gray-500 hover:text-white transition">
          {showNarrator ? '🎬 Hide Narrator' : '🎬 Show Narrator'}
        </button>
      </div>

      {/* Explosion Overlay */}
      <AnimatePresence>
        {isExploding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 1, 1, 0],
              backgroundColor: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.9)', 'rgba(255,100,50,0.4)', 'rgba(0,0,0,0)']
            }}
            transition={{ duration: 2 }}
            className="absolute inset-0 z-[100] pointer-events-none flex items-center justify-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.5, 2],
                rotate: [0, 5, -5, 0]
              }}
              className="text-6xl font-black text-white filter blur-sm"
            >
              PERMGEN REMOVED
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(3px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -1px) rotate(0deg); }
        }
        .shake-active {
          animation: shake 0.5s;
          animation-iteration-count: 4;
        }
      `}} />
    </div>
  );
}