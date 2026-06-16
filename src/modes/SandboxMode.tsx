export default function SandboxMode() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-[#0a0a0f] text-gray-400 p-6 text-center">
      <div className="text-4xl mb-3">⌨️</div>
      <h2 className="text-xl font-black text-white mb-2">Sandbox Mode</h2>
      <p className="text-sm leading-relaxed max-w-xs">
        Use the <span className="text-[#00d4ff] font-bold">Code Sandbox</span> panel on the right to write and execute Java pseudo-code. Objects appear in the 3D city in real-time.
      </p>
      <div className="mt-5 space-y-2 text-left text-[11px] font-mono text-gray-500 max-w-xs">
        {['new Employee("Alice")   → allocate in TLAB', 'e1 = null              → break strong ref', 'System.gc()            → request GC', '// island              → trigger isolation', '// oom:heap            → simulate OOM', 'ByteBuffer.allocateDirect(n) → off-heap'].map((line) => (
          <div key={line} className="px-3 py-1.5 bg-[rgba(255,255,255,0.03)] rounded border border-[rgba(255,255,255,0.06)]">{line}</div>
        ))}
      </div>
    </div>
  );
}