import { useState } from 'react';
import { motion } from 'framer-motion';

type Block = { id: number; status: 'alive' | 'dead' | 'floating'; };

export default function L19_Level() {
  const [phase, setPhase] = useState<'IDLE' | 'MARK' | 'SWEEP'>('IDLE');
  const [blocks, setBlocks] = useState<Block[]>(Array.from({ length: 36 }, (_, i) => ({ id: i, status: 'alive' })));
  const [log, setLog] = useState<string[]>(['CMS initialized. Ready for concurrent cycle.']);

  const runPhase = async () => {
    // 1. Initial Mark (STW)
    setPhase('MARK');
    setLog(prev => ['STW: Initial Mark (finding roots)...', ...prev]);
    await new Promise(r => setTimeout(r, 800));

    // 2. Concurrent Mark (BG)
    setLog(prev => ['CONCURRENT: Marking reachable graph in background...', ...prev]);
    const next = [...blocks];
    next.forEach((b, i) => { if (Math.random() > 0.6) next[i] = { ...b, status: 'dead' as const }; });
    setBlocks(next);
    await new Promise(r => setTimeout(r, 1200));

    // 3. Floating Garbage Simulation (Code creates new dead objects during mark)
    setLog(prev => ['ANOMALY: Application thread killed objects during mark!', ...prev]);
    setBlocks(prev => prev.map(b => (b.status === 'alive' && Math.random() > 0.8) ? { ...b, status: 'floating' as const } : b));
    await new Promise(r => setTimeout(r, 1000));

    // 4. Final Remark (STW)
    setLog(prev => ['STW: Final Remark (cleaning up sync issues)...', ...prev]);
    await new Promise(r => setTimeout(r, 800));

    // 5. Sweep (BG)
    setPhase('SWEEP');
    setLog(prev => ['CONCURRENT: Sweeping dead objects (Floating garbage remains!)', ...prev]);
    setBlocks(prev => prev.map(b => b.status === 'dead' ? { ...b, status: 'floating' as const } : b).filter(b => b.status !== 'dead')); // Logic simplification
    
    await new Promise(r => setTimeout(r, 1000));
    setPhase('IDLE');
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans">
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-[rgba(255,170,0,0.15)] border border-[rgba(255,170,0,0.3)] rounded text-[10px] font-mono text-[#ffaa00]">L19</span>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">INTERVIEW MODE</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">CMS: Concurrent Mark Sweep</h1>
        <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
          The pioneer of low-latency. CMS was the first to try marking objects <span className="text-[#ffaa00] font-bold">while the app was running</span>, but it introduced a new bug: Floating Garbage.
        </p>
      </div>

      <div className="px-8 pb-8 flex flex-col lg:flex-row gap-12">
         <div className="flex-1 space-y-6">
            <div className="flex justify-center">
               <button 
                 onClick={runPhase} disabled={phase !== 'IDLE'}
                 className="px-8 py-3 bg-[#ffaa00] text-black font-black rounded-lg text-xs hover:scale-105 active:scale-95 transition shadow-[0_0_20px_rgba(255,170,0,0.2)]"
               >
                 {phase === 'IDLE' ? 'START CONCURRENT CYCLE' : 'PHASE IN PROGRESS...'}
               </button>
            </div>

            <div className="p-6 bg-black/40 rounded-3xl border border-white/5 relative min-h-[300px]">
               <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
                  {blocks.map(b => (
                     <motion.div
                       key={b.id}
                       animate={{ 
                         backgroundColor: b.status === 'alive' ? '#ffffff11' : b.status === 'dead' ? '#ff4444' : '#ffaa00',
                         scale: b.status === 'floating' ? [1, 1.1, 1] : 1
                       }}
                       transition={b.status === 'floating' ? { repeat: Infinity, duration: 2 } : {}}
                       className={`aspect-square rounded border ${b.status === 'floating' ? 'border-[#ffaa00] shadow-[0_0_10px_rgba(255,170,0,0.2)]' : 'border-white/5'}`}
                     >
                     </motion.div>
                  ))}
               </div>

               <div className="mt-12 p-5 bg-white/5 rounded-2xl border border-white/10 font-mono text-[10px] overflow-hidden">
                  <div className="text-gray-500 mb-3 uppercase tracking-widest font-black">CMS Cycle Log</div>
                  <div className="space-y-1 h-32 overflow-y-auto">
                     {log.map((line, i) => (
                        <div key={i} className={line.startsWith('STW') ? 'text-red-400' : line.startsWith('ANOMALY') ? 'text-yellow-400' : 'text-gray-400'}>
                           {`> ${line}`}
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         <div className="w-full lg:w-96 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Floating Garbage</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
                  If an object becomes "dead" <span className="text-white">after</span> the GC thread has already scanned it, CMS cannot see it until the <span className="text-white">next</span> cycle.
               </p>
               <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                  <div className="text-[10px] font-bold text-orange-400 mb-1">The Result:</div>
                  <p className="text-[10px] text-gray-500 italic">Heap usage actually INCREASES during a GC cycle! If it fills up before the sweep finishes, a "Concurrent Mode Failure" happens, and the JVM falls back to a massive STW Serial GC.</p>
               </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-2">Why it was removed</h4>
               <p className="text-[11px] text-gray-500 leading-relaxed">
                  CMS did not <span className="text-white">compact</span> the heap. It only swept. This led to serious fragmentation issues over long uptimes, making G1 a superior alternative for most loads.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}