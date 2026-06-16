import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Phase = { name: string; type: 'STW' | 'Concurrent'; durationMs: string; description: string; detail: string; };

const g1Phases: Phase[] = [
  { name: '1. Initial Mark', type: 'STW', durationMs: '~5ms', description: 'Mark objects directly reachable from GC roots.', detail: 'Piggybacks on Minor GC. Only GC roots touched — very short. Sets up marking bitmap. SATB write barriers activated.' },
  { name: '2. Root Region Scan', type: 'Concurrent', durationMs: '1-30ms', description: 'Scan Survivor regions for references into Old Gen.', detail: 'Runs concurrently with application. Must complete before the next Minor GC starts. Identifies Old Gen objects pointed to by Young Gen survivors.' },
  { name: '3. Concurrent Mark', type: 'Concurrent', durationMs: '100-500ms', description: 'Traverse full object graph, building live data per region.', detail: 'SATB (Snapshot At The Beginning) write barriers capture any object references modified during marking. Each region tracks its liveness %. This determines which regions are best to collect.' },
  { name: '4. Remark', type: 'STW', durationMs: '~10ms', description: 'Process remaining SATB buffers, complete marking.', detail: 'Short STW. Processes any SATB buffers not yet handled (modified object references). Reference processing (weak/soft/phantom) happens here.' },
  { name: '5. Cleanup', type: 'STW', durationMs: '~5ms', description: 'Sort regions by garbage density. Reclaim 100%-garbage regions.', detail: 'Fully empty regions reclaimed immediately. Remaining regions sorted by live% — those with MOST garbage go into Collection Set. Partially concurrent.' },
  { name: '6. Evacuation / Mixed GC', type: 'STW', durationMs: '10-200ms', description: 'Copy live objects from Collection Set to free regions.', detail: 'THE key insight: "Garbage First" = target regions with most garbage. Live objects copied (evacuated) to free regions. Source regions 100% freed. PLAB used for parallel copy.' },
];

export default function L20_Level() {
  const [active, setActive] = useState(0);
  const [hoveredRegion, setHoveredRegion] = useState<number | null>(null);

  // G1 region grid data
  const regionTypes = ['E','E','S','O','O','H','H','F','O','E','F','O','S','E','O','F'];
  const regionColors: Record<string, string> = { E: '#1a3a2a', S: '#1a2a3a', O: '#2a1a3a', H: '#3a3a00', F: '#151515' };
  const regionLabels: Record<string, string> = { E: 'Eden', S: 'Survivor', O: 'Old', H: 'Humongous', F: 'Free' };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans">
      <div className="px-8 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] rounded text-[10px] font-mono text-[#00d4ff]">L20</span>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">INTERMEDIATE TRACK</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">G1 GC — Garbage First Collector</h1>
        <p className="text-gray-400 text-sm">Default since Java 9. Divides the heap into equal regions, targets highest-garbage regions first. 6-phase cycle.</p>
      </div>

      <div className="px-8 pb-5 grid md:grid-cols-2 gap-6">
        {/* Region Grid */}
        <div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">G1 HEAP REGION GRID</div>
          <div className="grid grid-cols-4 gap-1.5 mb-3">
            {regionTypes.map((r, i) => (
              <motion.div
                key={i}
                onHoverStart={() => setHoveredRegion(i)}
                onHoverEnd={() => setHoveredRegion(null)}
                className="aspect-square rounded flex items-center justify-center text-[10px] font-bold border cursor-pointer transition-all"
                style={{
                  backgroundColor: regionColors[r],
                  borderColor: hoveredRegion === i ? '#fff' : `${regionColors[r]}ff`,
                  color: r === 'F' ? '#333' : '#fff',
                  boxShadow: hoveredRegion === i ? '0 0 12px rgba(255,255,255,0.2)' : 'none',
                }}
              >
                {r}
              </motion.div>
            ))}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(regionLabels).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1 text-[10px]">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: regionColors[k] }} />
                <span className="text-gray-400">{k}={v}</span>
              </div>
            ))}
          </div>
          {/* Key flag */}
          <div className="mt-3 p-3 rounded-lg bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.07)] text-[10px] font-mono text-gray-400">
            -XX:+UseG1GC (default Java 9+)<br />
            -XX:G1HeapRegionSize=16m<br />
            -XX:MaxGCPauseMillis=200 (target)
          </div>
        </div>

        {/* Phase list */}
        <div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">6-PHASE CYCLE</div>
          <div className="space-y-1.5">
            {g1Phases.map((p, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  active === i
                    ? 'border-[rgba(0,212,255,0.4)] bg-[rgba(0,212,255,0.08)]'
                    : 'border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.15)] bg-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{p.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-gray-500">{p.durationMs}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${p.type === 'STW' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                      {p.type}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">{p.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      <div className="px-8 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-xl border border-[rgba(0,212,255,0.15)] bg-[rgba(0,212,255,0.04)]"
          >
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-bold text-white">{g1Phases[active].name}</h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${g1Phases[active].type === 'STW' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/15 text-green-400'}`}>
                {g1Phases[active].type === 'STW' ? '🔴 Stop-The-World' : '🟢 Concurrent (app runs)'}
              </span>
              <span className="text-[10px] font-mono text-gray-400 ml-auto">{g1Phases[active].durationMs}</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{g1Phases[active].detail}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}