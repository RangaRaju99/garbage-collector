export default function ObjectHeaderViewer({ gcAlgorithm }: { gcAlgorithm: string }) {
  // Simulate Mark Word bit layout. We highlight ZGC specifics dynamically if selected.
  const isZGC = gcAlgorithm === 'ZGC';
  
  return (
    <div className="mt-2 pt-2 border-t border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.4)] p-2 rounded relative overflow-hidden group">
      <div className="absolute inset-0 bg-[rgba(0,212,255,0.05)] opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none" />
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-accent-alive rounded-full animate-pulse" /> 64-Bit Mark Word
        </span>
      </div>

      <div className="grid grid-cols-12 gap-px bg-gray-800 rounded overflow-hidden">
        {isZGC ? (
          <>
            <div className="col-span-3 bg-gray-700 py-1 text-center text-[7px] text-gray-400 font-mono" title="Unused Bits">000000...</div>
            <div className="col-span-1 bg-red-900/50 py-1 text-center text-[8px] text-red-400 font-mono font-bold" title="M0 (Marked)">1</div>
            <div className="col-span-1 bg-gray-700 py-1 text-center text-[8px] text-gray-500 font-mono">0</div>
            <div className="col-span-1 bg-gray-700 py-1 text-center text-[8px] text-gray-500 font-mono" title="Remapped">0</div>
            <div className="col-span-1 bg-gray-700 py-1 text-center text-[8px] text-gray-500 font-mono" title="Finalizable">0</div>
            <div className="col-span-5 bg-blue-900/40 py-1 text-center text-[7px] text-blue-300 font-mono truncate px-1" title="Object Address">0xCAFE...</div>
          </>
        ) : (
          <>
            <div className="col-span-6 bg-gray-700 py-1 text-center text-[7px] text-gray-400 font-mono" title="Hash Code">0xA1B2C3</div>
            <div className="col-span-2 bg-yellow-900/50 py-1 text-center text-[7px] text-yellow-500 font-mono" title="GC Age (0-15)">0100</div>
            <div className="col-span-1 bg-gray-700 py-1 text-center text-[7px] text-gray-400 font-mono" title="Biased Lock">0</div>
            <div className="col-span-3 bg-green-900/30 py-1 text-center text-[7px] text-green-400 font-mono" title="Lock Status (01 = Unlocked)">01</div>
          </>
        )}
      </div>

      <div className="text-[8px] mt-1 text-gray-500 flex justify-between">
        <span>{isZGC ? 'Colored Pointer Active' : 'Standard Alignment'}</span>
        <span className="text-gray-400">PTR: 64b</span>
      </div>
    </div>
  );
}