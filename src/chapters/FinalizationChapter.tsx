import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Stage = 'briefing' | 'running' | 'detected' | 'resurrected' | 'collected';

export default function FinalizationChapter() {
  const [stage, setStage] = useState<Stage>('briefing');

  const next = () => {
    const order: Stage[] = ['briefing', 'running', 'detected', 'resurrected', 'collected'];
    const i = order.indexOf(stage);
    if (i < order.length - 1) setStage(order[i + 1]);
  };

  const reset = () => setStage('briefing');

  const stageConfig = {
    briefing: { color: '#888', label: 'Ready', obj: 'green', desc: 'Immortal object is alive, held by strong reference.' },
    running: { color: '#ffaa00', label: 'Eligible', obj: 'red', desc: 'strong ref = null → object is eligible for GC. Moves to Finalization Queue.' },
    detected: { color: '#ff4444', label: 'Finalize Called', obj: 'orange', desc: 'Finalizer thread dequeues Immortal. Calls finalize(). Code inside assigns this → static Immortal.instance.' },
    resurrected: { color: '#00ff88', label: 'Resurrected! 😱', obj: 'green', desc: 'Object turned green again! It survived GC by creating a new strong reference in finalize(). finalize() will NOT be called again.' },
    collected: { color: '#444', label: 'Collected (2nd attempt)', obj: 'gone', desc: 'Second GC cycle. No finalize() call this time. Object is permanently collected. Memory reclaimed.' },
  };

  const config = stageConfig[stage];

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans p-6">
      <h1 className="text-2xl font-black mb-1">Finalization & Object Resurrection</h1>
      <p className="text-gray-400 text-sm mb-5">What happens inside <code className="text-[#00d4ff]">finalize()</code> — and how an object can defy the GC (once).</p>

      {/* Code */}
      <div className="mb-5">
        <pre className="text-[11px] font-mono text-gray-300 bg-[rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.07)] rounded-xl p-4 leading-relaxed">
{`class Immortal {
  static Immortal instance; // GC root

  @Override
  protected void finalize() throws Throwable {
    instance = this; // ← RESURRECTION: creates new strong ref
    System.out.println("I refuse to die!");
  }
}

Immortal obj = new Immortal();
obj = null; // → eligible for GC [Step 1]
// GC runs → finalize() called → instance = this [Steps 2-3]
// obj survives! → Green again [Step 4]
// GC runs again → finalize() NOT called → permanently collected [Step 5]`}
        </pre>
      </div>

      {/* Visual */}
      <div className="flex items-start gap-6 mb-5">
        {/* Object */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">HEAP</div>
          <AnimatePresence mode="wait">
            {config.obj !== 'gone' ? (
              <motion.div key={stage} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 rounded-xl border-2 flex items-center justify-center font-bold text-xs"
                style={{
                  borderColor: config.color,
                  backgroundColor: `${config.color}15`,
                  boxShadow: `0 0 20px ${config.color}44`,
                  color: config.color,
                }}>
                Immortal
              </motion.div>
            ) : (
              <motion.div key="gone" initial={{ scale: 1, opacity: 1 }} animate={{ scale: 0, opacity: 0 }}
                className="w-20 h-20 rounded-xl border-2 border-gray-700 bg-transparent flex items-center justify-center text-xs text-gray-700">
                [freed]
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stages */}
        <div className="flex-1 space-y-2">
          {(['briefing', 'running', 'detected', 'resurrected', 'collected'] as Stage[]).map((s, i) => (
            <div key={s} className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs transition-all ${stage === s ? 'border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.05)]' : 'border-[rgba(255,255,255,0.04)] opacity-40'}`}>
              <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center shrink-0 text-[9px]" style={{ color: stageConfig[s].color }}>
                {i + 1}
              </div>
              <div>
                <div className="font-bold" style={{ color: stageConfig[s].color }}>{stageConfig[s].label}</div>
                <div className="text-gray-500 text-[10px]">{stageConfig[s].desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 mb-5">
        <button onClick={next} disabled={stage === 'collected'}
          className="px-5 py-2 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] text-[#00d4ff] rounded-lg font-bold text-sm disabled:opacity-30 transition hover:bg-[rgba(0,212,255,0.25)]">
          Next Step →
        </button>
        <button onClick={reset} className="px-5 py-2 border border-[rgba(255,255,255,0.1)] text-gray-400 rounded-lg text-sm font-bold transition hover:text-white">
          ↺ Reset
        </button>
      </div>

      <div className="p-4 rounded-xl bg-[rgba(255,68,68,0.07)] border border-[rgba(255,68,68,0.2)] space-y-2">
        <div className="text-xs font-bold text-red-400">⚠ Why Resurrection is a Design Anti-Pattern</div>
        {[
          'finalize() is called at most ONCE per object lifetime',
          'Resurrected objects may re-die without finalize() being called again',
          'Finalizer thread has low priority → backlog delays memory reclamation',
          'Deprecated since Java 9 — use Cleaner API instead',
          'finalize() may never be called if JVM exits',
        ].map((item, i) => <div key={i} className="text-xs text-gray-400">• {item}</div>)}
      </div>
    </div>
  );
}