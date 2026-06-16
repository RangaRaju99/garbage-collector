import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type RobotPhase = 'idle' | 'marking' | 'sweeping' | 'compacting' | 'done';

const phaseInfo = {
  idle: { label: 'Ready', color: '#888', desc: 'Serial GC robot ready. One thread. Entire city will freeze during collection.' },
  marking: { label: 'Phase 1: Mark', color: '#00d4ff', desc: 'Single robot walks every reachable object from all GC roots. Marks each touched object. Unreachable objects stay grey.' },
  sweeping: { label: 'Phase 2: Sweep', color: '#ff4444', desc: 'Robot removes all unmarked (grey) objects. Memory returned to free list but NOT compacted — fragmentation begins.' },
  compacting: { label: 'Phase 3: Compact', color: '#00ff88', desc: 'Robot slides remaining live objects together. Eliminates fragmentation. Bump pointer reset. This is why Serial takes longest.' },
  done: { label: 'Complete ✅', color: '#00ff88', desc: 'GC cycle complete. City resumes. Single robot done. Pause time: 200-500ms for typical 512MB heap.' },
};

type Obj = { id: number; alive: boolean; marked: boolean; pos: number; size: number; color: string; label: string; };

function generateObjects(): Obj[] {
  const names = ['Employee', 'Request', 'Cache', 'Session', 'Logger', 'Config', 'String', 'Buffer', 'Context', 'Event', 'User', 'Order'];
  return Array.from({ length: 12 }, (_, i) => ({
    id: i,
    alive: Math.random() > 0.45,
    marked: false,
    pos: i,
    size: Math.floor(Math.random() * 2) + 1,
    color: '#00ff88',
    label: names[i % names.length],
  }));
}

export default function L17_Level() {
  const [phase, setPhase] = useState<RobotPhase>('idle');
  const [objects, setObjects] = useState<Obj[]>(generateObjects());
  const [robotPos, setRobotPos] = useState(-1);
  const [pauseMs, setPauseMs] = useState(0);
  const [running, setRunning] = useState(false);

  const runGC = async () => {
    if (running) return;
    setRunning(true);
    const start = Date.now();
    let objs = generateObjects();
    setObjects(objs);
    setPhase('marking');
    setPauseMs(0);

    // Phase 1: Mark — visit each object
    for (let i = 0; i < objs.length; i++) {
      setRobotPos(i);
      setPauseMs(Math.round((Date.now() - start)));
      await delay(200);
      if (objs[i].alive) {
        objs = objs.map((o, idx) => idx === i ? { ...o, marked: true, color: '#00d4ff' } : o);
        setObjects([...objs]);
      }
    }

    setPhase('sweeping');
    await delay(400);

    // Phase 2: Sweep — remove unmarked
    objs = objs.map(o => o.marked ? o : { ...o, color: '#222', label: '✕' });
    setObjects([...objs]);
    await delay(600);
    objs = objs.filter(o => o.marked);
    setObjects([...objs]);

    setPhase('compacting');
    await delay(400);

    // Phase 3: Compact — re-assign positions
    objs = objs.map((o, i) => ({ ...o, pos: i, color: '#00ff88', marked: false }));
    setObjects([...objs]);
    setRobotPos(-1);
    await delay(500);
    setPhase('done');
    setPauseMs(Math.round(Date.now() - start));
    setRunning(false);
  };

  const reset = () => {
    setPhase('idle');
    setObjects(generateObjects());
    setRobotPos(-1);
    setPauseMs(0);
    setRunning(false);
  };

  const info = phaseInfo[phase];

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans">
      <div className="px-8 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] rounded text-[10px] font-mono text-[#00d4ff]">L17</span>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">INTERMEDIATE TRACK</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Serial GC — Mark, Sweep, Compact</h1>
        <p className="text-gray-400 text-sm">The original collector. One thread. Three phases. The entire application freezes until complete. <code className="text-[#00d4ff] text-[11px]">-XX:+UseSerialGC</code></p>
      </div>

      {/* Phase status bar */}
      <div className="px-8 pb-4 flex items-center gap-3">
        {(['marking', 'sweeping', 'compacting'] as RobotPhase[]).map(p => (
          <div key={p} className={`flex-1 py-1.5 rounded text-center text-[10px] font-bold border transition-all ${phase === p ? 'border-current' : 'border-[rgba(255,255,255,0.06)] text-gray-600'}`}
            style={{ color: phase === p ? phaseInfo[p].color : undefined, borderColor: phase === p ? `${phaseInfo[p].color}60` : undefined, backgroundColor: phase === p ? `${phaseInfo[p].color}15` : undefined }}>
            {phaseInfo[p].label}
          </div>
        ))}
        {pauseMs > 0 && <div className="ml-2 text-xs font-mono text-yellow-400">⏱ {pauseMs}ms STW</div>}
      </div>

      {/* Heap visualization */}
      <div className="px-8 pb-4">
        <div className="p-4 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] relative overflow-hidden">
          {/* STW overlay */}
          {phase !== 'idle' && phase !== 'done' && (
            <div className="absolute inset-0 bg-[rgba(255,0,0,0.04)] pointer-events-none z-0" />
          )}
          <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3 flex items-center gap-2">
            HEAP — {phase !== 'idle' && phase !== 'done' ? <span className="text-red-400 animate-pulse">⚠ STOP-THE-WORLD ACTIVE</span> : 'RUNNING'}
          </div>
          <div className="flex flex-wrap gap-2 min-h-16 relative z-10">
            {objects.map((obj, i) => (
              <motion.div
                key={obj.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: robotPos === i ? 1.1 : 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="px-2 py-1.5 rounded text-[10px] font-mono font-bold border transition-all"
                style={{
                  color: obj.color === '#222' ? '#444' : '#fff',
                  borderColor: robotPos === i ? '#fff' : `${obj.color}60`,
                  backgroundColor: `${obj.color}20`,
                  boxShadow: robotPos === i ? `0 0 12px ${obj.color}` : 'none',
                }}
              >
                {robotPos === i ? '🤖' : ''}{obj.label}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="px-8 pb-4">
        <AnimatePresence mode="wait">
          <motion.div key={phase} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl border bg-[rgba(255,255,255,0.02)]"
            style={{ borderColor: `${info.color}30` }}>
            <div className="text-xs font-bold mb-1" style={{ color: info.color }}>{info.label}</div>
            <p className="text-sm text-gray-300">{info.desc}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Buttons */}
      <div className="px-8 pb-8 flex gap-3">
        <button onClick={runGC} disabled={running}
          className="px-6 py-2.5 bg-red-500/15 border border-red-500/40 text-red-400 rounded-lg font-bold text-sm disabled:opacity-40 hover:bg-red-500/25 transition">
          ▶ Run Serial GC
        </button>
        <button onClick={reset} className="px-6 py-2.5 border border-[rgba(255,255,255,0.1)] text-gray-400 rounded-lg font-bold text-sm hover:text-white transition">
          ↺ Reset
        </button>
      </div>
    </div>
  );
}

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }