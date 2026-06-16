import { useJVMStore, type GCAlgorithm } from '../store/jvmStore';

export default function JVMFlags() {
  const flags = useJVMStore((state) => state.flags);
  const setFlag = useJVMStore((state) => state.setFlag);
  const gcAlgo = useJVMStore((state) => state.gcAlgorithm);
  const setAlgorithm = useJVMStore((state) => state.setAlgorithm);

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto w-full h-full text-xs">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-[rgba(0,212,255,0.2)]">
        <h2 className="font-bold text-gray-400 uppercase tracking-widest">JVM Live Tuning</h2>
      </div>

      <div className="glass-panel p-3">
        <h3 className="font-bold text-accent-alive mb-2">Heap Configurations</h3>
        
        <div className="flex justify-between items-center mb-2">
          <label className="text-gray-300">-Xmx (Max Heap)</label>
          <div className="flex items-center gap-2">
            <input type="range" min="128" max="8192" step="128" value={flags.Xmx} onChange={(e) => setFlag('Xmx', parseInt(e.target.value))} className="w-24 accent-accent-alive" />
            <span className="w-12 text-right font-mono">{flags.Xmx}M</span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-2">
          <label className="text-gray-300">-Xms (Init Heap)</label>
          <div className="flex items-center gap-2">
            <input type="range" min="64" max="4096" step="64" value={flags.Xms} onChange={(e) => setFlag('Xms', parseInt(e.target.value))} className="w-24 accent-accent-alive" />
            <span className="w-12 text-right font-mono">{flags.Xms}M</span>
          </div>
        </div>
      </div>

      <div className="glass-panel p-3">
        <h3 className="font-bold text-accent-alive mb-2">Generational Boundaries</h3>
        
        <div className="flex justify-between items-center mb-2">
          <label className="text-gray-300">-XX:NewRatio</label>
          <div className="flex items-center gap-2">
            <input type="range" min="1" max="10" step="1" value={flags.NewRatio} onChange={(e) => setFlag('NewRatio', parseInt(e.target.value))} className="w-24 accent-accent-alive" />
            <span className="w-12 text-right font-mono">{flags.NewRatio}</span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-2" title="Max GC cycles before Old Gen promotion">
          <label className="text-gray-300">-XX:MaxTenuringThreshold</label>
          <div className="flex items-center gap-2">
            <input type="range" min="1" max="15" step="1" value={flags.MaxTenuringThreshold} onChange={(e) => setFlag('MaxTenuringThreshold', parseInt(e.target.value))} className="w-24 accent-accent-alive" />
            <span className="w-12 text-right font-mono">{flags.MaxTenuringThreshold}</span>
          </div>
        </div>
      </div>

      <div className="glass-panel p-3">
        <h3 className="font-bold text-accent-alive mb-2">Garbage Collector</h3>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {(['Serial', 'Parallel', 'CMS', 'G1', 'ZGC', 'Shenandoah', 'Epsilon'] as GCAlgorithm[]).map((algo) => (
            <button
              key={algo}
              onClick={() => setAlgorithm(algo)}
              className={`p-1 border rounded text-center transition ${
                gcAlgo === algo 
                  ? 'bg-accent-alive text-black font-bold border-accent-alive' 
                  : 'border-[rgba(255,255,255,0.1)] text-gray-400 hover:border-accent-alive hover:text-white'
              }`}
            >
              {algo}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel p-3">
        <h3 className="font-bold text-accent-alive mb-2">Optimizations</h3>
        <label className="flex items-center gap-2 mb-2 cursor-pointer text-gray-300">
          <input type="checkbox" checked={flags.UseCompressedOops} onChange={(e) => setFlag('UseCompressedOops', e.target.checked)} className="accent-accent-alive" />
          -XX:+UseCompressedOops
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-gray-300">
          <input type="checkbox" checked={flags.UseTLAB} onChange={(e) => setFlag('UseTLAB', e.target.checked)} className="accent-accent-alive" />
          -XX:+UseTLAB
        </label>
      </div>
    </div>
  );
}
