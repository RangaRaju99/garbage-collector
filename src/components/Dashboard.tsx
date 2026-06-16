
import { useJVMStore } from '../store/jvmStore';

export default function Dashboard() {
  const metrics = useJVMStore(state => state.metrics);
  const flags = useJVMStore(state => state.flags);
  const triggerGC = () => {
    useJVMStore.getState().addEvent('INFO', 'System.gc() requested by user', 0);
    import('../simulator/JVMEngine').then(m => m.instance.runMinorGC());
  };

  const triggerLeak = () => {
    useJVMStore.getState().addEvent('WARNING', 'Memory leak initiated', 0);
    import('../simulator/JVMEngine').then(m => {
      // Allocate massive arrays rapidly
      for(let i=0; i<50; i++) m.instance.allocateObject(10, 'LeakedArray', true);
      m.instance.publishMetrics();
    });
  };

  const heapTotal = flags.Xmx;
  const heapUsagePercent = Math.round((metrics.heapUsed / heapTotal) * 100) || 0;

  // Assuming Eden is configured via NewRatio, typically roughly 1/3 of heap if NewRatio=2
  const youngGenTotal = Math.floor(heapTotal / (flags.NewRatio + 1));
  const oldGenTotal = heapTotal - youngGenTotal;
  const edenTotal = Math.floor(youngGenTotal * (flags.SurvivorRatio / (flags.SurvivorRatio + 2)));
  const survivorTotal = Math.floor(youngGenTotal * (1 / (flags.SurvivorRatio + 2)));

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">JVM Live Feed</h2>
        <span className="flex items-center gap-2 text-red-500 text-xs font-bold animate-pulse">
          <span className="w-2 h-2 rounded-full bg-red-500"></span> LIVE
        </span>
      </div>

      {/* Heap Breakdown */}
      <div className="glass-panel p-4 flex flex-col gap-3">
        <div className="text-xs text-gray-400 flex justify-between">
          <span>HEAP TOTAL</span>
          <span className="text-white">{heapUsagePercent}% ({metrics.heapUsed}M / {heapTotal}M)</span>
        </div>
        <div className="w-full h-2 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden flex">
          <div className="h-full bg-green-500" style={{ width: `${(metrics.edenUsed / heapTotal) * 100}%` }} title="Eden"></div>
          <div className="h-full bg-green-700" style={{ width: `${(metrics.survivorUsed / heapTotal) * 100}%` }} title="Survivor"></div>
          <div className="h-full bg-blue-500" style={{ width: `${(metrics.oldGenUsed / heapTotal) * 100}%` }} title="Old Gen"></div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
          <div className="flex flex-col">
            <span className="text-gray-500">Eden ({edenTotal}M)</span>
            <span className="text-green-400 font-mono">{metrics.edenUsed} MB</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500">Survivor (x2) ({survivorTotal}M)</span>
            <span className="text-green-600 font-mono">{metrics.survivorUsed} MB</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500">Old Gen ({oldGenTotal}M)</span>
            <span className="text-blue-400 font-mono">{metrics.oldGenUsed} MB</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500">Metaspace</span>
            <span className="text-purple-400 font-mono">{metrics.metaspaceUsed} MB</span>
          </div>
        </div>
      </div>

      {/* Objects Overview */}
      <div className="glass-panel p-4">
        <h3 className="text-xs text-gray-400 mb-2">OBJECT LIFECYCLE</h3>
        <div className="flex justify-between items-end mb-1 text-sm">
          <span>Reachable (Alive)</span>
          <span className="font-mono text-success-reachable">{metrics.objectsAlive}</span>
        </div>
        <div className="flex justify-between items-end mb-1 text-sm">
          <span>Garbage (Dead)</span>
          <span className="font-mono text-danger-gc">{metrics.objectsDead}</span>
        </div>
      </div>

      {/* GC Events */}
      <div className="glass-panel p-4 flex-1">
        <h3 className="text-xs text-gray-400 mb-2">GC ACTIVITY (G1)</h3>
        <ul className="text-xs space-y-2 font-mono">
          <li className="flex justify-between border-b border-[rgba(255,255,255,0.05)] pb-1">
            <span className="text-gray-400">[0.042s]</span>
            <span className="text-yellow-400">Minor GC Pause</span>
            <span>12ms</span>
          </li>
          <li className="flex justify-between border-b border-[rgba(255,255,255,0.05)] pb-1">
            <span className="text-gray-400">[1.204s]</span>
            <span className="text-yellow-400">Minor GC Pause</span>
            <span>14ms</span>
          </li>
          <li className="flex justify-between border-b border-[rgba(255,255,255,0.05)] pb-1">
            <span className="text-gray-400">[5.441s]</span>
            <span className="text-blue-400">Mixed GC Pause</span>
            <span>22ms</span>
          </li>
        </ul>
      </div>
      
      {/* Actions */}
      <div className="flex gap-2 shrink-0">
        <button onClick={triggerGC} className="flex-1 py-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] rounded text-xs font-bold transition">
          System.gc()
        </button>
        <button onClick={triggerLeak} className="flex-1 py-2 bg-[rgba(255,0,0,0.1)] hover:bg-[rgba(255,0,0,0.2)] border border-[rgba(255,0,0,0.3)] rounded text-xs font-bold transition text-red-400 shadow-[0_0_10px_rgba(255,0,0,0.2)] hover:shadow-[0_0_20px_rgba(255,0,0,0.5)]">
          Leak Memory
        </button>
      </div>
    </div>
  );
}
