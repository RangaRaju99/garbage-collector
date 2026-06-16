import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TLABChapter() {
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState(0);
  const [locks, setLocks] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    if (running) return;
    setRunning(true);
    setCount(0);
    setLocks(0);
    timerRef.current = setInterval(() => {
      setCount(c => {
        if (c >= 100000) {
          clearInterval(timerRef.current!);
          setRunning(false);
          return c;
        }
        return c + 1000;
      });
    }, 50);
  };

  const reset = () => {
    clearInterval(timerRef.current!);
    setRunning(false);
    setCount(0);
    setLocks(0);
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans p-6">
      <h1 className="text-2xl font-black mb-1">TLAB — Thread-Local Allocation Buffers</h1>
      <p className="text-gray-400 text-sm mb-5">Why allocating millions of objects per second requires zero locks.</p>

      <div className="grid md:grid-cols-2 gap-5 mb-5">
        <div className="p-5 rounded-xl border border-[rgba(255,0,0,0.2)] bg-[rgba(255,0,0,0.04)]">
          <h3 className="font-bold text-red-400 mb-2">Without TLAB ❌</h3>
          <p className="text-xs text-gray-400 mb-3 leading-relaxed">If every thread allocates from shared Eden, every allocation needs a CAS (Compare-And-Swap) lock on the bump pointer. At 10k threads and 1M allocs/sec → millions of lock contentions.</p>
          <pre className="text-[10px] font-mono text-gray-400 bg-black/40 p-3 rounded">{`// Shared Eden bump pointer
CAS(eden.bumpPtr, old, old + size);
// Every. Single. Allocation.
// At scale: massive thread contention`}</pre>
        </div>
        <div className="p-5 rounded-xl border border-[rgba(0,255,136,0.2)] bg-[rgba(0,255,136,0.04)]">
          <h3 className="font-bold text-green-400 mb-2">With TLAB ✅</h3>
          <p className="text-xs text-gray-400 mb-3 leading-relaxed">Each thread gets its own private TLAB chunk from Eden. Allocations within TLAB are simple pointer bumps — no CAS, no lock, no contention. When TLAB exhausted, brief lock to get new TLAB.</p>
          <pre className="text-[10px] font-mono text-gray-400 bg-black/40 p-3 rounded">{`// Thread-private TLAB
tlab.bumpPtr += size; // NO LOCK
// 10,000 objects = 10,000 allocations
// = 0 lock acquisitions (within TLAB)`}</pre>
        </div>
      </div>

      {/* Live counter */}
      <div className="p-5 rounded-xl border border-[rgba(0,212,255,0.2)] bg-[rgba(0,212,255,0.04)] mb-5">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">SIMULATION — 3 THREADS, 100,000 OBJECTS</div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[1, 2, 3].map(t => (
            <div key={t} className="text-center">
              <div className="text-[10px] text-gray-500 mb-1">Thread-{t}</div>
              <div className="text-[10px] font-mono text-[#00ffff] mb-1">TLAB-{t}</div>
              <motion.div
                animate={{ height: running ? [`${Math.random() * 40 + 40}%`, `${Math.random() * 40 + 40}%`] : '50%' }}
                transition={{ duration: 0.5, repeat: running ? Infinity : 0 }}
                className="mx-auto w-8 bg-[#00ffff22] border border-[#00ffff44] rounded-t relative"
                style={{ minHeight: '60px' }}
              >
                {running && <div className="absolute bottom-1 left-0 right-0 h-1 bg-[#ffd700] rounded" />}
              </motion.div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-6 text-sm font-mono">
          <div>
            <div className="text-[10px] text-gray-500">Objects Allocated</div>
            <div className="text-2xl font-black text-[#00d4ff]">{count.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500">Lock Acquisitions</div>
            <div className="text-2xl font-black text-[#00ff88]">{locks}</div>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={start} disabled={running}
            className="px-4 py-2 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] text-[#00d4ff] rounded font-bold text-sm disabled:opacity-40 transition hover:bg-[rgba(0,212,255,0.25)]">
            ▶ Start Simulation
          </button>
          <button onClick={reset} className="px-4 py-2 border border-[rgba(255,255,255,0.1)] text-gray-400 rounded font-bold text-sm transition hover:text-white">
            ↺ Reset
          </button>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.06)]">
        <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">JVM FLAGS</div>
        <div className="font-mono text-xs space-y-1 text-gray-400">
          <div><span className="text-[#00d4ff]">-XX:+UseTLAB</span> (default: enabled)</div>
          <div><span className="text-[#00d4ff]">-XX:TLABSize=512k</span> (manual size override)</div>
          <div><span className="text-[#00d4ff]">-XX:-ResizeTLAB</span> (disable adaptive sizing)</div>
        </div>
      </div>
    </div>
  );
}