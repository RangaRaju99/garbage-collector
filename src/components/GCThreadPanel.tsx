import { useJVMStore } from '../store/jvmStore';
import { useRef, useEffect } from 'react';
import * as d3 from 'd3';

export default function GCThreadPanel() {
  const isSafepoint = useJVMStore(state => state.isSafepoint);
  const gcAlgorithm = useJVMStore(state => state.gcAlgorithm);

  const threads = [
    {
      name: 'VM Thread',
      role: 'Executes all STW VM operations. City Mayor — can freeze traffic.',
      count: '1',
      active: isSafepoint,
      color: '#ff4444',
      icon: '👑',
    },
    {
      name: 'GC Worker Threads',
      role: 'Parallel GC work during STW: mark, evacuate, sweep.',
      count: '-XX:ParallelGCThreads (default: CPU count)',
      active: isSafepoint,
      color: '#00d4ff',
      icon: '🤖',
    },
    {
      name: 'Concurrent GC Workers',
      role: 'Background GC work while app runs (G1 concurrent mark, ZGC phases).',
      count: '-XX:ConcGCThreads',
      active: !isSafepoint && gcAlgorithm !== 'Serial',
      color: '#00ff88',
      icon: '🔧',
    },
    {
      name: 'Reference Handler',
      role: 'Enqueues Soft/Weak/Phantom refs to ReferenceQueues after each GC.',
      count: '1 (built-in daemon)',
      active: false,
      color: '#ffaa00',
      icon: '📬',
    },
    {
      name: 'Finalizer Thread',
      role: 'Runs finalize() on objects in Finalizer Queue. Low priority — backlog = memory not freed!',
      count: '1 (low priority)',
      active: false,
      color: '#ff6b00',
      icon: '🧹',
    },
    {
      name: 'Compiler Threads (C1/C2)',
      role: 'JIT-compile hot methods to native code in Code Cache.',
      count: '2-4 (server JVM default)',
      active: true,
      color: '#aa44ff',
      icon: '⚡',
    },
    {
      name: 'Sweeper Thread',
      role: 'Reclaims Code Cache entries for deoptimized/obsolete compiled methods.',
      count: '1',
      active: false,
      color: '#888',
      icon: '🧽',
    },
    {
      name: 'Attach Listener',
      role: 'Handles JVM attach requests: jstack, jmap, JConsole, async-profiler.',
      count: '1 (on-demand)',
      active: false,
      color: '#4499ff',
      icon: '🔌',
    },
    {
      name: 'Signal Dispatcher',
      role: 'Routes OS signals (SIGTERM, SIGSEGV, SIGINT) to appropriate JVM handlers.',
      count: '1',
      active: true,
      color: '#aaaaaa',
      icon: '📡',
    },
  ];

  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto bg-[#0a0a0f]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">GC THREAD PANEL</h3>
        <div className={`px-2 py-0.5 rounded text-[9px] font-mono ${isSafepoint ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
          {isSafepoint ? '🔴 STW ACTIVE' : '🟢 RUNNING'}
        </div>
      </div>
      <div className="space-y-2">
        {threads.map((t) => (
          <div key={t.name}
            className="p-3 rounded-lg border transition-all"
            style={{
              backgroundColor: t.active ? `${t.color}10` : 'rgba(255,255,255,0.02)',
              borderColor: t.active ? `${t.color}40` : 'rgba(255,255,255,0.06)',
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base shrink-0">{t.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{t.name}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${t.active ? 'animate-pulse' : 'opacity-30'}`}
                      style={{ backgroundColor: t.active ? t.color : '#555' }} />
                  </div>
                  <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{t.role}</p>
                </div>
              </div>
            </div>
            <div className="mt-1.5 ml-6">
              <span className="text-[9px] font-mono text-gray-600">{t.count}</span>
            </div>
          </div>
        ))}
      </div>

      {isSafepoint && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-mono">
          ⏱ ALL APPLICATION THREADS AT SAFEPOINT — GC EXECUTING
        </div>
      )}
    </div>
  );
}