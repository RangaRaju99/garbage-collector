import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type MemoryBlock = { val: string; status: 'valid' | 'corrupt' | 'bound'; };

export default function L03_Level() {
  const [heap, setHeap] = useState<MemoryBlock[]>(Array.from({ length: 12 }, () => ({ val: 'data', status: 'valid' })));
  const [mode, setMode] = useState<'java' | 'cpp'>('cpp');
  const [error, setError] = useState<string | null>(null);

  const triggerOverflow = () => {
    setError(null);
    if (mode === 'java') {
      setError("java.lang.ArrayIndexOutOfBoundsException: Index 12 out of bounds for length 12");
    } else {
      setHeap(prev => {
        const next = [...prev];
        // Corrupt memory outside the logical array bounds (simulated here by corrupting indices 0-2)
        next[0] = { val: 'system_ptr', status: 'corrupt' };
        next[1] = { val: 'return_addr', status: 'corrupt' };
        return next;
      });
      setError("SEGMENTATION FAULT (Signal 11). System buffer corrupted.");
    }
  };

  const reset = () => {
    setHeap(Array.from({ length: 12 }, () => ({ val: 'data', status: 'valid' })));
    setError(null);
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans">
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] rounded text-[10px] font-mono text-[#00d4ff]">L03</span>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">BEGINNER TRACK</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Memory Safety: Java vs. C++</h1>
        <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
          The JVM acts as a "Sandbox". In C++, you can walk past the end of an array and corrupt system memory. 
          Java sacrifices a bit of speed for <span className="text-accent-alive font-bold">Runtime Bound Checks</span>.
        </p>
      </div>

      <div className="px-8 pb-8 flex flex-col xl:flex-row gap-8">
         <div className="flex-1 space-y-6">
            <div className="flex bg-white/5 p-1 rounded-xl w-fit border border-white/5">
               <button 
                 onClick={() => { setMode('cpp'); reset(); }}
                 className={`px-6 py-2 rounded-lg text-xs font-bold transition ${mode === 'cpp' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:text-white'}`}
               >
                 C++ (Unmanaged)
               </button>
               <button 
                 onClick={() => { setMode('java'); reset(); }}
                 className={`px-6 py-2 rounded-lg text-xs font-bold transition ${mode === 'java' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-white'}`}
               >
                 Java (Managed)
               </button>
            </div>

            <div className="p-6 bg-black/40 rounded-3xl border border-white/10 relative">
               <div className="mb-4 text-[10px] uppercase font-bold text-gray-600 tracking-widest">Process Memory Map</div>
               <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {heap.map((b, i) => (
                     <motion.div
                       key={i}
                       animate={{ 
                         backgroundColor: b.status === 'corrupt' ? '#ff4444' : (mode === 'java' ? '#00d4ff22' : '#ffffff05'),
                         borderColor: b.status === 'corrupt' ? '#ff4444' : '#ffffff11',
                         scale: b.status === 'corrupt' ? 1.05 : 1
                       }}
                       className={`aspect-video rounded-lg border-2 flex flex-col items-center justify-center p-2 relative overflow-hidden`}
                     >
                        <span className="text-[8px] font-mono opacity-30 absolute top-1 left-2">0x{i.toString(16).toUpperCase()}</span>
                        <span className={`text-[10px] font-bold ${b.status === 'corrupt' ? 'text-white' : 'text-gray-500'}`}>{b.val}</span>
                        {i >= heap.length - 1 && mode === 'java' && (
                           <div className="absolute inset-0 border-2 border-dashed border-blue-500/30 rounded-lg pointer-events-none" />
                        )}
                     </motion.div>
                  ))}
               </div>
               
               <div className="mt-8 flex justify-center">
                  <button 
                    onClick={triggerOverflow}
                    className="px-8 py-3 bg-white text-black font-black rounded-full text-xs hover:scale-105 active:scale-95 transition shadow-2xl"
                  >
                    RUN: arr[12] = 0xDEADBEEF
                  </button>
               </div>
            </div>

            <AnimatePresence>
               {error && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
                    className={`p-5 rounded-2xl border font-mono text-xs ${mode === 'java' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}
                  >
                     <div className="font-bold mb-2 uppercase">{mode === 'java' ? '✅ Exception Caught' : '❌ System Crash'}</div>
                     {error}
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

         <div className="w-full xl:w-96 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">How it works</h4>
               <div className="space-y-4 text-[11px] leading-relaxed text-gray-400">
                  <p>
                    <span className="text-white font-bold">C++:</span> Array access is a raw pointer offset. <code className="text-orange-400">ptr + index</code>. The CPU doesn't know where your array ends. Overwriting neighbors is silent until the program crashes.
                  </p>
                  <p>
                    <span className="text-white font-bold">Java:</span> Every array is an object that knows its <code className="text-blue-400">length</code>. Before every access, the JVM injects a range check. If it fails, the JVM throws an Exception instead of letting the process corrupt itself.
                  </p>
               </div>
            </div>

            <div className={`p-6 rounded-3xl border transition-colors ${mode === 'java' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-orange-500/10 border-orange-500/20'}`}>
               <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-2">Trade-off: Speed vs Safety</h4>
               <p className="text-[11px] text-gray-500 leading-relaxed">
                  Bound checks take CPU cycles. However, the JIT Compiler can often <span className="text-white">optimistically remove</span> these checks if it can prove the loop index will never exceed the length.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}