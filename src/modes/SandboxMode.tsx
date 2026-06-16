import { useJVMStore } from '../store/jvmStore';

const QUICK_SNIPPETS = [
  { label: 'Allocate Object',      code: 'new Employee("Alice")' },
  { label: 'Break Reference',      code: 'e1 = null' },
  { label: 'Trigger GC',           code: 'System.gc()' },
  { label: 'Create Island',        code: '// island' },
  { label: 'Simulate OOM',         code: '// oom:heap' },
  { label: 'Direct Memory',        code: 'ByteBuffer.allocateDirect(64)' },
];

export default function SandboxMode() {
  const requestGC = useJVMStore(state => state.requestGC);
  const injectLeak = useJVMStore(state => state.injectLeak);
  const addEvent = useJVMStore(state => state.addEvent);

  const runSnippet = (code: string) => {
    if (code.includes('System.gc()')) {
      requestGC();
    } else if (code.includes('null')) {
      addEvent('REF', 'Strong reference broken — object eligible for collection', 0);
    } else if (code.includes('oom')) {
      addEvent('OOM', 'OutOfMemoryError: Java heap space simulated', 0);
    } else if (code.includes('island')) {
      addEvent('ISO', 'Reference island detected — unreachable cycle', 0);
    } else if (code.includes('new ')) {
      addEvent('ALLOC', `Object allocated via TLAB: ${code}`, 0);
    } else {
      addEvent('EXEC', code, 0);
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface-secondary overflow-hidden font-sans">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5 shrink-0">
        <h2 className="text-[13px] font-bold text-white">JVM Sandbox</h2>
        <p className="text-[10px] text-zinc-500 mt-0.5">Execute Java pseudo-code and watch the 3D city respond</p>
      </div>

      <div className="flex-1 p-5 overflow-y-auto custom-scrollbar space-y-5">
        {/* Quick Actions */}
        <div>
          <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-3">Quick Snippets</p>
          <div className="space-y-1.5">
            {QUICK_SNIPPETS.map(({ label, code }) => (
              <button
                key={code}
                onClick={() => runSnippet(code)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-white/[0.02] border border-white/6 rounded-lg hover:bg-white/[0.05] hover:border-white/10 transition-all group text-left"
              >
                <span className="text-[11px] font-medium text-zinc-400 group-hover:text-white transition-colors">{label}</span>
                <code className="text-[10px] font-mono text-brand-primary/70 group-hover:text-brand-primary transition-colors truncate ml-3 max-w-[40%] text-right">
                  {code}
                </code>
              </button>
            ))}
          </div>
        </div>

        {/* Emergency controls */}
        <div>
          <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-3">Simulation Controls</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={requestGC}
              className="flex items-center justify-center gap-2 py-2.5 bg-white text-black rounded-lg text-[11px] font-bold hover:bg-zinc-200 active:scale-95 transition-all"
            >
              System.gc()
            </button>
            <button
              onClick={injectLeak}
              className="flex items-center justify-center gap-2 py-2.5 bg-status-error/10 border border-status-error/25 text-status-error rounded-lg text-[11px] font-bold hover:bg-status-error/20 active:scale-95 transition-all"
            >
              Inject Leak
            </button>
          </div>
        </div>

        {/* Cheat-sheet */}
        <div className="bg-black/20 border border-white/5 rounded-xl p-4">
          <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-3">Syntax Reference</p>
          <div className="space-y-2 font-mono text-[10px]">
            {[
              ['new Foo()', 'Allocate in TLAB / Eden'],
              ['ref = null', 'Drop strong reference'],
              ['System.gc()', 'Request GC run'],
              ['// oom:heap', 'Simulate heap OOM'],
              ['// oom:meta', 'Simulate Metaspace OOM'],
              ['// island', 'Create reference island'],
            ].map(([syn, desc]) => (
              <div key={syn} className="flex items-baseline gap-3">
                <code className="text-brand-primary/80 shrink-0 w-32">{syn}</code>
                <span className="text-zinc-600">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}