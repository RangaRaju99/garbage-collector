import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type VersionKey = '1.0' | '1.2' | '7' | '8' | '9' | '11' | '15' | '17' | '21' | '25+';

interface VersionInfo {
  label: string;
  year: number;
  defaultGC: string;
  headline: string;
  changes: string[];
  explosion?: boolean;
}

const versions: Record<VersionKey, VersionInfo> = {
  '1.0': { label: 'Java 1.0', year: 1996, defaultGC: 'Serial (single-threaded)', headline: 'The beginning — Simple mark-and-sweep, no generations.', changes: ['Flat memory model', 'No generational GC', 'Single-threaded collection', 'PermGen introduced'] },
  '1.2': { label: 'Java 1.2', year: 1998, defaultGC: 'Serial Generational', headline: 'Generational GC introduced — Young vs Old Gen split.', changes: ['Young Generation introduced', 'Eden + Survivor spaces', 'Old Gen for long-lived objects', 'PermGen grows'] },
  '7': { label: 'Java 7', year: 2011, defaultGC: 'Parallel GC', headline: 'G1 GC lands (experimental). PermGen still present.', changes: ['G1 GC experimental (-XX:+UseG1GC)', 'String pool moved to HEAP', 'PermGen still exists (default 256MB)', 'Parallel GC default'] },
  '8': { label: 'Java 8', year: 2014, defaultGC: 'Parallel GC', headline: '🔥 THE GREAT TRANSITION — PermGen EXPLODES → Metaspace born!', explosion: true, changes: ['PermGen REMOVED permanently', 'Metaspace in native memory (unbounded by default)', 'Lambda + Streams changes allocation patterns', 'Default collector: Parallel GC'] },
  '9': { label: 'Java 9', year: 2017, defaultGC: 'G1 GC', headline: 'G1 becomes default. Module system (Jigsaw). Cleaner API.', changes: ['G1 GC is now the default', 'Module system changes class loading', 'Cleaner API replaces finalize()', 'CMS deprecated'] },
  '11': { label: 'Java 11 LTS', year: 2018, defaultGC: 'G1 GC', headline: 'ZGC lands as experimental. First LTS after Java 8.', changes: ['ZGC experimental (-XX:+UseZGC)', 'CMS deprecated', 'Epsilon GC (no-op) added', 'G1 major improvements'] },
  '15': { label: 'Java 15', year: 2020, defaultGC: 'G1 GC', headline: 'Shenandoah + ZGC go production. CMS fully removed.', changes: ['ZGC production ready', 'Shenandoah production ready', 'CMS completely removed', 'G1: biased locking disabled'] },
  '17': { label: 'Java 17 LTS', year: 2021, defaultGC: 'G1 GC', headline: 'Stable LTS. ZGC + Shenandoah mature and battle-tested.', changes: ['Sealed classes affect heap shape', 'ZGC massive improvements', 'GC ergonomics improved', 'Strong encapsulation of JDK internals'] },
  '21': { label: 'Java 21 LTS', year: 2023, defaultGC: 'G1 GC', headline: 'Generational ZGC! Virtual Threads land (Project Loom).', changes: ['Generational ZGC (-XX:+ZGenerational)', 'Virtual Threads: 1M+ threads, tiny stacks', 'G1 region management improved', 'Record patterns in code'] },
  '25+': { label: 'Java 25+', year: 2025, defaultGC: 'Generational G1 / ZGC', headline: 'Generational Shenandoah + Project Valhalla value types.', changes: ['Generational Shenandoah (experimental)', 'Project Valhalla: value types → zero GC pressure', 'Compact object headers (12B → 8B)', 'Predicted: default ZGC eventually'] },
};

const versionKeys: VersionKey[] = ['1.0', '1.2', '7', '8', '9', '11', '15', '17', '21', '25+'];

export default function JavaVersionTimeline() {
  const [selected, setSelected] = useState<VersionKey>('21');
  const [showExplosion, setShowExplosion] = useState(false);

  const handleSelect = (v: VersionKey) => {
    if (v === '8' && selected !== '8') {
      setShowExplosion(true);
      setTimeout(() => setShowExplosion(false), 2500);
    }
    setSelected(v);
  };

  const info = versions[selected];

  return (
    <div className="relative">
      {/* PermGen Explosion Flash */}
      <AnimatePresence>
        {showExplosion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.8, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5, times: [0, 0.1, 0.5, 1] }}
            className="fixed inset-0 z-[999] flex items-center justify-center pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, rgba(255,100,0,0.9) 0%, rgba(255,0,0,0.5) 40%, transparent 70%)' }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 2, 1.5], opacity: [0, 1, 0] }}
              transition={{ duration: 2 }}
              className="text-white font-black text-center pointer-events-none select-none"
              style={{ fontSize: 'clamp(24px, 5vw, 48px)', textShadow: '0 0 40px #ff6600' }}
            >
              💥 PermGen DESTROYED!
              <div className="text-xl mt-2" style={{ textShadow: '0 0 20px cyan' }}>
                ✨ Metaspace Born in Native Memory ✨
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline Bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {versionKeys.map((v) => {
          const isSelected = selected === v;
          const is8 = v === '8';
          return (
            <button
              key={v}
              onClick={() => handleSelect(v)}
              className={`px-3 py-1.5 rounded text-[10px] font-bold whitespace-nowrap transition-all border ${
                isSelected
                  ? is8
                    ? 'bg-orange-500 border-orange-400 text-white shadow-[0_0_15px_rgba(255,100,0,0.6)]'
                    : 'bg-[rgba(0,212,255,0.2)] border-accent-alive text-accent-alive shadow-[0_0_10px_rgba(0,212,255,0.3)]'
                  : is8
                  ? 'bg-[rgba(255,100,0,0.1)] border-orange-600/40 text-orange-400 hover:bg-[rgba(255,100,0,0.2)]'
                  : 'bg-transparent border-[rgba(255,255,255,0.1)] text-gray-400 hover:text-white hover:border-[rgba(255,255,255,0.3)]'
              }`}
            >
              {versions[v].label}
            </button>
          );
        })}
      </div>

      {/* Info Popover */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full left-0 mt-2 w-[420px] z-50 bg-[#0d1117] border border-[rgba(0,212,255,0.25)] rounded-xl shadow-2xl p-4"
        >
          <div className="flex items-start justify-between mb-2 gap-3">
            <div>
              <h3 className="font-bold text-white text-sm">{info.label} ({info.year})</h3>
              <p className={`text-xs mt-0.5 ${info.explosion ? 'text-orange-400 font-bold' : 'text-gray-400'}`}>
                {info.headline}
              </p>
            </div>
            <div className="shrink-0 px-2 py-1 bg-[rgba(0,212,255,0.1)] rounded text-[9px] font-mono text-accent-alive border border-[rgba(0,212,255,0.2)]">
              {info.defaultGC}
            </div>
          </div>
          <ul className="space-y-1">
            {info.changes.map((c, i) => (
              <li key={i} className="text-[11px] text-gray-300 flex items-start gap-2">
                <span className="text-accent-alive mt-0.5 shrink-0">→</span> {c}
              </li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}