import { useJVMStore } from '../store/jvmStore';

export default function NMTDashboard() {
  const flags = useJVMStore(state => state.flags);
  const metrics = useJVMStore(state => state.metrics);

  const heapUsed = metrics.heapUsed ?? Math.round(flags.Xmx * 0.64);
  const heapMax = flags.Xmx;
  const metaUsed = 34;
  const metaMax = 256;
  const codeCache = 48;
  const codeCacheMax = 240;
  const threadStacks = 32;
  const directMem = 128;
  const directMemMax = 256;
  const jniNative = 24;
  const gcInternal = 16;
  const jvmInternal = 8;
  const symbols = 2;

  const total = heapUsed + metaUsed + codeCache + threadStacks + directMem + jniNative + gcInternal + jvmInternal + symbols;

  const categories = [
    { label: 'Java Heap', used: heapUsed, max: heapMax, color: '#00d4ff' },
    { label: 'Metaspace', used: metaUsed, max: metaMax, color: '#00ff88' },
    { label: '└─ Class Space', used: 8, max: 64, color: '#009966', indent: true },
    { label: 'Code Cache', used: codeCache, max: codeCacheMax, color: '#aa44ff' },
    { label: 'Thread Stacks', used: threadStacks, max: null, color: '#ffaa00' },
    { label: 'GC Internal', used: gcInternal, max: null, color: '#00d4ff' },
    { label: 'Direct Buffers', used: directMem, max: directMemMax, color: '#ff6b00' },
    { label: 'JNI / Native Libs', used: jniNative, max: null, color: '#888' },
    { label: 'Symbol Tables', used: symbols, max: null, color: '#666' },
    { label: 'Internal JVM', used: jvmInternal, max: null, color: '#555' },
  ];

  const bar = (used: number, max: number | null, color: string) => {
    const pct = max ? Math.min(1, used / max) : 0.5;
    const danger = pct > 0.85;
    return (
      <div className="flex-1 h-2 bg-[rgba(255,255,255,0.07)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct * 100}%`,
            backgroundColor: danger ? '#ff4444' : color,
            boxShadow: `0 0 6px ${danger ? '#ff4444' : color}66`,
          }}
        />
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto bg-[#0a0a0f]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">NATIVE MEMORY TRACKER</h3>
        <span className="text-[9px] font-mono text-[#00d4ff]">-XX:NativeMemoryTracking=summary</span>
      </div>

      <div className="space-y-2 mb-4">
        {categories.map((cat) => (
          <div key={cat.label} className={`flex items-center gap-3 ${cat.indent ? 'pl-3' : ''}`}>
            <div className="w-28 shrink-0">
              <span className="text-[10px] text-gray-400 font-mono">{cat.label}</span>
            </div>
            {bar(cat.used, cat.max, cat.color)}
            <div className="w-12 text-right shrink-0">
              <span className="text-[10px] font-mono" style={{ color: cat.color }}>{cat.used}MB</span>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="border-t border-[rgba(255,255,255,0.08)] pt-3 mb-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-white">TOTAL PROCESS</span>
          <span className="text-[#00d4ff] font-bold font-mono">{total}MB</span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-[10px] text-gray-500">vs -Xmx (heap only)</span>
          <span className="text-gray-400 font-mono text-[10px]">{heapMax}MB</span>
        </div>
        <div className="mt-1 text-[10px] text-yellow-400 font-mono">
          ⚠ Process uses {total - heapUsed}MB MORE than just the heap
        </div>
      </div>

      {/* Key insight banner */}
      <div className="p-3 rounded-lg bg-[rgba(255,107,0,0.08)] border border-[rgba(255,107,0,0.2)] text-[10px] text-orange-300 leading-relaxed">
        💡 <strong>Container sizing rule:</strong> Set{' '}
        <code className="text-[#00d4ff]">-Xmx = container_limit × 0.75</code>{' '}
        to leave room for Metaspace + Code Cache + Direct Memory + Thread Stacks
      </div>

      {/* Memory formula */}
      <div className="mt-3 p-3 rounded-lg bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.06)]">
        <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-2">TOTAL PROCESS MEMORY FORMULA</div>
        <div className="text-[10px] font-mono text-gray-400 space-y-0.5">
          <div><span className="text-[#00d4ff]">Heap</span> (-Xmx) + <span className="text-[#00ff88]">Metaspace</span></div>
          <div>+ <span className="text-[#aa44ff]">Code Cache</span> + <span className="text-[#ffaa00]">Threads × -Xss</span></div>
          <div>+ <span className="text-[#ff6b00]">Direct Memory</span> + JNI + JVM internals</div>
        </div>
      </div>
    </div>
  );
}