import { useState } from 'react';

type ThreadState = 'running' | 'requested' | 'stopped' | 'resuming';

export default function L25_Level() {
  const [phase, setPhase] = useState<ThreadState>('running');
  const [ttsp, setTtsp] = useState(0);

  const threads = [
    { id: 1, name: 'Thread-1 (HTTP handler)', loop: false },
    { id: 2, name: 'Thread-2 (DB worker)', loop: false },
    { id: 3, name: 'Thread-3 (tight loop)', loop: true },
    { id: 4, name: 'Thread-4 (Compiler)', loop: false },
  ];

  const run = () => { setPhase('running'); setTtsp(0); };
  const requestSafepoint = () => {
    setPhase('requested');
    // Thread 3 (tight loop) delays → TTSP
    let t = 0;
    const interval = setInterval(() => {
      t += 100;
      setTtsp(t);
      if (t >= 800) {
        clearInterval(interval);
        setPhase('stopped');
        setTimeout(() => setPhase('resuming'), 2000);
        setTimeout(() => { setPhase('running'); setTtsp(0); }, 3000);
      }
    }, 100);
  };

  const threadStopped = (t: typeof threads[0]) => {
    if (phase === 'running') return false;
    if (phase === 'requested') return !t.loop && ttsp > 200;
    return phase === 'stopped' || phase === 'resuming';
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans">
      <div className="px-8 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] rounded text-[10px] font-mono text-[#00d4ff]">L25</span>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">ADVANCED TRACK</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Safepoints — Thread Suspension Deep Dive</h1>
        <p className="text-gray-400 text-sm">A safepoint is a point where ALL JVM threads are paused and all GC roots are precisely known. Required for STW GC operations.</p>
      </div>

      {/* Thread visualization */}
      <div className="px-8 pb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">THREAD STATUS</div>
          <div className={`px-3 py-1 rounded text-xs font-bold font-mono border ${
            phase === 'running' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
            phase === 'requested' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 animate-pulse' :
            phase === 'stopped' ? 'bg-red-500/20 border-red-500/40 text-red-400' :
            'bg-blue-500/10 border-blue-500/30 text-blue-400'
          }`}>
            {phase === 'running' ? '🟢 RUNNING' : phase === 'requested' ? `⏳ SAFEPOINT REQUESTED — TTSP: ${ttsp}ms` : phase === 'stopped' ? '🔴 AT SAFEPOINT — GC RUNNING' : '🔵 RESUMING'}
          </div>
        </div>

        <div className="space-y-2">
          {threads.map(t => {
            const stopped = threadStopped(t);
            const isDelaying = phase === 'requested' && t.loop;
            return (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg border transition-all"
                style={{
                  borderColor: stopped ? 'rgba(255,68,68,0.3)' : isDelaying ? 'rgba(255,170,0,0.4)' : 'rgba(0,212,255,0.15)',
                  backgroundColor: stopped ? 'rgba(255,68,68,0.05)' : isDelaying ? 'rgba(255,170,0,0.07)' : 'rgba(0,212,255,0.04)',
                }}
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${stopped ? 'bg-red-500' : isDelaying ? 'bg-yellow-400 animate-pulse' : 'bg-green-400 animate-pulse'}`} />
                <div className="flex-1">
                  <div className="text-xs font-bold text-white">{t.name}</div>
                  {t.loop && <div className="text-[10px] text-yellow-400">⚠ Tight counted loop — no back-edge poll!</div>}
                </div>
                <div className="text-[10px] font-mono text-gray-500">
                  {stopped ? '🛑 At safepoint' : isDelaying ? `Looping... (${ttsp}ms delay)` : '→→→ Running'}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 mt-4">
          <button onClick={requestSafepoint} disabled={phase !== 'running'}
            className="px-5 py-2 rounded-lg bg-red-500/15 border border-red-500/40 text-red-400 text-sm font-bold disabled:opacity-30 hover:bg-red-500/25 transition">
            🔴 Request Safepoint (GC)
          </button>
          <button onClick={run} disabled={phase !== 'running'}
            className="px-5 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] text-gray-400 text-sm font-bold disabled:opacity-30 transition">
            Reset
          </button>
        </div>
      </div>

      {/* Key concepts */}
      <div className="px-8 pb-8 grid md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)]">
          <h3 className="font-bold text-white text-sm mb-3">Where JIT Inserts Safepoint Polls</h3>
          <div className="space-y-2 text-sm text-gray-300">
            {[
              '✅ Method returns (every method exit)',
              '✅ Loop back-edges (after each loop iteration)',
              '✅ JNI calls (crossing native boundary)',
              '❌ Inside tight counted loops (optimization!)',
              '❌ Inside compiled native code blocks',
            ].map((item, i) => (
              <div key={i} className="text-xs font-mono">{item}</div>
            ))}
          </div>
        </div>
        <div className="p-5 rounded-xl border border-[rgba(255,170,0,0.15)] bg-[rgba(255,170,0,0.04)]">
          <h3 className="font-bold text-yellow-400 text-sm mb-2">⚠ TTSP — Time To Safepoint Problem</h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            The reported GC pause time starts when ALL threads reach a safepoint — not when GC is requested. If Thread-3 is in a tight counted loop without a back-edge poll, it can delay the safepoint by hundreds of ms, causing all other threads to wait.
          </p>
          <div className="mt-2 text-[10px] font-mono text-yellow-400">
            -XX:+SafepointTimeout -XX:SafepointTimeoutDelay=200
          </div>
        </div>
      </div>
    </div>
  );
}