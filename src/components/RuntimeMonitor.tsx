import { useJVMStore } from '../store/jvmStore';
import { instance as jvmEngine } from '../simulator/JVMEngine';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RuntimeMonitor() {
  const flags = useJVMStore(s => s.flags);
  const metrics = useJVMStore(s => s.metrics);
  const [gcResponse, setGcResponse] = useState<'idle' | 'signaled' | 'ran' | 'ignored'>('idle');

  const totalMemory = flags.Xmx;
  const freeMemory = Math.max(0, totalMemory - (metrics.heapUsed ?? 0));
  const maxMemory = flags.Xmx * 4; // simulated -Xmx headroom
  const availableProcs = 8;

  const requestGC = () => {
    setGcResponse('signaled');
    setTimeout(() => {
      const heapPressure = (metrics.heapUsed ?? 0) / flags.Xmx;
      if (heapPressure > 0.5) {
        jvmEngine.runMinorGC();
        useJVMStore.getState().addEvent('INFO', 'System.gc() honored by JVM', 0);
        setGcResponse('ran');
      } else {
        useJVMStore.getState().addEvent('INFO', 'JVM ignored System.gc() — heap pressure too low', 0);
        setGcResponse('ignored');
      }
      setTimeout(() => setGcResponse('idle'), 3000);
    }, 800);
  };

  const Meter = ({ label, used, max, color }: { label: string; used: number; max: number; color: string }) => {
    const pct = Math.min(1, used / max);
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
        <div className="w-28 shrink-0">
          <div className="text-[10px] font-mono text-gray-500">{label}</div>
          <div className="text-sm font-bold font-mono mt-0.5" style={{ color }}>{used}MB</div>
        </div>
        <div className="flex-1 h-3 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}66` }}
            animate={{ width: `${pct * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="w-12 text-right text-[10px] font-mono text-gray-500">{max}MB max</div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto bg-[#0a0a0f]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">RUNTIME MONITOR</h3>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          <span className="text-[9px] text-gray-500">LIVE</span>
        </div>
      </div>

      <div className="space-y-2 mb-5">
        <Meter label="freeMemory()" used={freeMemory} max={totalMemory} color="#00ff88" />
        <Meter label="totalMemory()" used={totalMemory} max={maxMemory} color="#00d4ff" />
        <Meter label="maxMemory()" used={maxMemory} max={maxMemory} color="#ffaa00" />

        <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
          <div className="w-28 shrink-0">
            <div className="text-[10px] font-mono text-gray-500">availableProcessors()</div>
            <div className="text-sm font-bold font-mono mt-0.5 text-[#aa44ff]">{availableProcs} cores</div>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: availableProcs }).map((_, i) => (
              <div key={i} className="w-3 h-6 rounded-sm bg-[#aa44ff] opacity-70" style={{ opacity: 0.4 + i * 0.07 }} />
            ))}
          </div>
        </div>
      </div>

      {/* System.gc() Request Panel */}
      <div className="p-4 rounded-xl border border-[rgba(0,212,255,0.15)] bg-[rgba(0,212,255,0.04)]">
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">runtime.gc() — Request GC</div>
        <button
          onClick={requestGC}
          disabled={gcResponse !== 'idle'}
          className="w-full py-2.5 rounded-lg font-bold text-sm transition-all border border-[rgba(0,212,255,0.3)] bg-[rgba(0,212,255,0.1)] hover:bg-[rgba(0,212,255,0.2)] text-[#00d4ff] disabled:opacity-50"
        >
          {gcResponse === 'idle' ? 'System.gc()' : gcResponse === 'signaled' ? '⏳ Signal sent...' : gcResponse === 'ran' ? '✅ GC Ran!' : '❌ JVM Ignored'}
        </button>

        <AnimatePresence>
          {gcResponse !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-1"
            >
              {[
                { step: 'System.gc() called', done: true },
                { step: 'Signal sent to JVM', done: gcResponse !== 'idle' },
                { step: 'JVM evaluates heap pressure', done: gcResponse === 'ran' || gcResponse === 'ignored' },
                { step: gcResponse === 'ran' ? '✅ GC executed' : '❌ JVM ignored request', done: gcResponse === 'ran' || gcResponse === 'ignored' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px] font-mono">
                  <div className={`w-1.5 h-1.5 rounded-full ${s.done ? 'bg-[#00d4ff]' : 'bg-gray-700'}`} />
                  <span className={s.done ? 'text-gray-300' : 'text-gray-600'}>{s.step}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-3 p-2 rounded bg-[rgba(255,170,0,0.08)] border border-[rgba(255,170,0,0.15)]">
          <p className="text-[10px] text-yellow-400 leading-relaxed">
            ⚠️ <strong>runtime.gc() is a REQUEST, not a command.</strong> JVM may ignore it based on heap pressure, GC ergonomics, or <code>-XX:+DisableExplicitGC</code> flag. Never rely on it in production code.
          </p>
        </div>
      </div>
    </div>
  );
}