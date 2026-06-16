import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type QueueItem = { id: number; type: 'Weak' | 'Soft' | 'Phantom'; object: string; color: string; };

export default function ReferenceQueue() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const nextId = useRef(1);

  const colors = { Weak: '#ffaa00', Soft: '#00d4ff', Phantom: '#aa44ff' };
  const objects = ['UserSession', 'CachedImage', 'DataBuffer', 'ReportObj', 'TempContext'];

  const enqueue = (type: 'Weak' | 'Soft' | 'Phantom') => {
    const obj = objects[Math.floor(Math.random() * objects.length)];
    const item: QueueItem = { id: nextId.current++, type, object: obj, color: colors[type] };
    setQueue(q => [...q, item]);
    setLog(l => [`[${new Date().toLocaleTimeString()}] ${type}Reference<${obj}> enqueued after GC`, ...l].slice(0, 10));
  };

  const poll = () => {
    if (queue.length > 0) {
      const [first, ...rest] = queue;
      setLog(l => [`[${new Date().toLocaleTimeString()}] queue.poll() → ${first.type}Reference<${first.object}> picked up → cleanup triggered`, ...l].slice(0, 10));
      setQueue(rest);
    }
  };

  const pollAll = () => {
    if (queue.length > 0) {
      setLog(l => [`[${new Date().toLocaleTimeString()}] Processed ${queue.length} references from queue`, ...l].slice(0, 10));
      setQueue([]);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 overflow-hidden bg-[#0a0a0f]">
      <div className="mb-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">REFERENCE QUEUE VISUALIZER</h3>
        <p className="text-[10px] text-gray-600 mt-0.5">Reference.enqueue() fills mailbox after object GC'd. App polls to run cleanup.</p>
      </div>

      {/* Enqueue buttons */}
      <div className="flex gap-2 mb-4">
        {(['Weak', 'Soft', 'Phantom'] as const).map(type => (
          <button key={type}
            onClick={() => enqueue(type)}
            className="flex-1 py-1.5 rounded text-[10px] font-bold transition border"
            style={{ borderColor: `${colors[type]}40`, color: colors[type], backgroundColor: `${colors[type]}10` }}
          >
            + {type}Ref
          </button>
        ))}
      </div>

      {/* Mailbox queue */}
      <div className="flex-1 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">📬 REFERENCE QUEUE</span>
          <span className="px-1.5 py-0.5 bg-[rgba(255,255,255,0.08)] rounded text-[9px] font-mono text-gray-400">{queue.length} pending</span>
        </div>
        <div className="min-h-16 max-h-28 border border-[rgba(255,255,255,0.08)] rounded-xl bg-[rgba(255,255,255,0.02)] p-2 flex flex-wrap gap-2 overflow-y-auto">
          {queue.length === 0 && (
            <div className="w-full flex items-center justify-center h-12 text-[10px] text-gray-700">Queue empty</div>
          )}
          <AnimatePresence>
            {queue.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.7, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, x: 30 }}
                className="px-2 py-1 rounded border text-[9px] font-mono"
                style={{ borderColor: `${item.color}40`, color: item.color, backgroundColor: `${item.color}10` }}
              >
                {item.type}[{item.object}]
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Poll buttons */}
      <div className="flex gap-2 mb-3">
        <button onClick={poll} disabled={queue.length === 0}
          className="flex-1 py-1.5 bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.3)] rounded text-[10px] font-bold text-[#00d4ff] disabled:opacity-30 transition hover:bg-[rgba(0,212,255,0.2)]">
          queue.poll() — pick one
        </button>
        <button onClick={pollAll} disabled={queue.length === 0}
          className="flex-1 py-1.5 bg-[rgba(0,255,136,0.08)] border border-[rgba(0,255,136,0.2)] rounded text-[10px] font-bold text-[#00ff88] disabled:opacity-30 transition">
          Drain all
        </button>
      </div>

      {/* Log */}
      <div className="border border-[rgba(255,255,255,0.06)] rounded-lg bg-[rgba(0,0,0,0.4)] p-2 overflow-y-auto max-h-28">
        <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">LOG</div>
        {log.length === 0 && <div className="text-[9px] text-gray-700 font-mono">No events yet</div>}
        {log.map((entry, i) => (
          <div key={i} className="text-[9px] font-mono text-gray-500 leading-relaxed">{entry}</div>
        ))}
      </div>

      {/* Explanation */}
      <div className="mt-3 p-2 rounded bg-[rgba(170,68,255,0.06)] border border-[rgba(170,68,255,0.15)] text-[9px] text-purple-300 leading-relaxed">
        Phantom.get() → always null. Phantom enqueued AFTER finalization (post-mortem notification). Weak/Soft enqueued when collected.
      </div>
    </div>
  );
}