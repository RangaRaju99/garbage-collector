import { useState } from 'react';
import { motion } from 'framer-motion';

const CARDS = 8;

export default function CardTableChapter() {
  const [dirty, setDirty] = useState<boolean[]>(Array(CARDS).fill(false));
  const [scanning, setScanning] = useState<number | null>(null);
  const [scanned, setScanned] = useState<boolean[]>(Array(CARDS).fill(false));
  const [withCardTable, setWithCardTable] = useState(true);

  const writeRef = (card: number) => {
    setDirty(d => d.map((v, i) => i === card ? true : v));
  };

  const runMinorGC = async () => {
    const newScanned = Array(CARDS).fill(false);
    setScanned(newScanned);
    if (withCardTable) {
      // Only scan dirty cards
      for (let i = 0; i < CARDS; i++) {
        if (dirty[i]) {
          setScanning(i);
          await delay(300);
          newScanned[i] = true;
          setScanned([...newScanned]);
        }
      }
    } else {
      // Scan ALL cards (slow)
      for (let i = 0; i < CARDS; i++) {
        setScanning(i);
        await delay(150);
        newScanned[i] = true;
        setScanned([...newScanned]);
      }
    }
    setScanning(null);
  };

  const reset = () => {
    setDirty(Array(CARDS).fill(false));
    setScanned(Array(CARDS).fill(false));
    setScanning(null);
  };

  const dirtyCount = dirty.filter(Boolean).length;
  const scannedCount = scanned.filter(Boolean).length;

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans p-6">
      <h1 className="text-2xl font-black mb-1">Card Table — Cross-Generation Reference Tracking</h1>
      <p className="text-gray-400 text-sm mb-5">Minor GC must find all Old Gen → Young Gen references without scanning all of Old Gen.</p>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-5">
        {[true, false].map(wct => (
          <button key={String(wct)} onClick={() => setWithCardTable(wct)}
            className={`px-4 py-2 rounded-lg text-sm font-bold border transition ${withCardTable === wct ? 'bg-[rgba(0,212,255,0.15)] border-[rgba(0,212,255,0.4)] text-[#00d4ff]' : 'border-[rgba(255,255,255,0.08)] text-gray-500'}`}>
            {wct ? '✅ With Card Table' : '❌ Without Card Table (scan all)'}
          </button>
        ))}
      </div>

      {/* Old Gen grid of cards */}
      <div className="mb-4">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
          OLD GEN — {CARDS} CARDS (each = 512 bytes)
        </div>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: CARDS }).map((_, i) => (
            <div key={i} className="relative">
              <motion.div
                animate={{
                  backgroundColor: scanning === i ? '#ffff0020' : dirty[i] ? 'rgba(255,107,0,0.15)' : scanned[i] ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.03)',
                  borderColor: scanning === i ? '#ffff00' : dirty[i] ? '#ff6b00' : scanned[i] ? '#00d4ff' : 'rgba(255,255,255,0.08)',
                }}
                className="p-3 rounded-xl border cursor-pointer transition-all"
                onClick={() => writeRef(i)}
              >
                <div className="text-[10px] font-bold text-gray-500 mb-1">Card {i}</div>
                <div className="text-[9px] font-mono text-gray-600">512B region</div>
                <div className="mt-1 text-[10px] font-bold">
                  {scanning === i ? <span className="text-yellow-400 animate-pulse">🔍 Scanning</span> :
                   dirty[i] ? <span className="text-[#ff6b00]">🔴 DIRTY</span> :
                   scanned[i] ? <span className="text-[#00d4ff]">✓ Done</span> :
                   <span className="text-gray-700">⬜ Clean</span>}
                </div>
              </motion.div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-600 mt-2">Click any card to simulate an Old Gen → Young Gen reference write (marks card DIRTY)</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="p-3 rounded-lg border border-[rgba(255,107,0,0.2)] bg-[rgba(255,107,0,0.05)] text-center">
          <div className="text-xl font-black text-[#ff6b00]">{dirtyCount}</div>
          <div className="text-[10px] text-gray-500">Dirty Cards</div>
        </div>
        <div className="p-3 rounded-lg border border-[rgba(0,212,255,0.2)] bg-[rgba(0,212,255,0.05)] text-center">
          <div className="text-xl font-black text-[#00d4ff]">{scannedCount}</div>
          <div className="text-[10px] text-gray-500">Cards Scanned</div>
        </div>
        <div className="p-3 rounded-lg border border-[rgba(0,255,136,0.2)] bg-[rgba(0,255,136,0.05)] text-center">
          <div className="text-xl font-black text-[#00ff88]">
            {withCardTable ? `${CARDS - dirtyCount} saved` : '0'}
          </div>
          <div className="text-[10px] text-gray-500">Cards Skipped</div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={runMinorGC}
          className="px-5 py-2.5 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] text-[#00d4ff] rounded-lg font-bold text-sm transition hover:bg-[rgba(0,212,255,0.25)]">
          ▶ Run Minor GC
        </button>
        <button onClick={reset} className="px-5 py-2.5 border border-[rgba(255,255,255,0.1)] text-gray-400 rounded-lg font-bold text-sm transition hover:text-white">
          ↺ Reset
        </button>
      </div>
    </div>
  );
}

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }