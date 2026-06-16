import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type LeakPattern = 'STATIC' | 'THREADLOCAL' | 'INNER' | 'RESOURCE';

export default function L29_Level() {
  const [pattern, setPattern] = useState<LeakPattern>('STATIC');
  const [heap, setHeap] = useState(10);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => {
        setHeap(prev => Math.min(100, prev + (pattern === 'STATIC' ? 2 : 1)));
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isRunning, pattern]);

  const runGC = () => {
     // Leaked objects won't be collected
     setHeap(prev => Math.max(prev - 5, 20)); 
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans">
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-[rgba(255,100,100,0.15)] border border-[rgba(255,100,100,0.3)] rounded text-[10px] font-mono text-[#ff4444]">L29</span>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">ADVANCED TRACK</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Memory Leak Gallery</h1>
        <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
          The GC can't save you if <span className="text-white font-bold">you</span> keep the references alive. 
          Explore the 4 biggest ways Java developers accidentally kill their production apps.
        </p>
      </div>

      <div className="px-8 pb-8 flex flex-col lg:flex-row gap-12">
         <div className="flex-1 space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
               {(['STATIC', 'THREADLOCAL', 'INNER', 'RESOURCE'] as LeakPattern[]).map(p => (
                  <button 
                    key={p} onClick={() => { setPattern(p); setHeap(10); setIsRunning(false); }}
                    className={`p-4 rounded-2xl border-2 transition text-left ${pattern === p ? 'bg-red-500/10 border-red-500/50' : 'bg-white/5 border-transparent hover:border-white/10'}`}
                  >
                     <div className={`text-[8px] font-black mb-1 ${pattern === p ? 'text-red-400' : 'text-gray-600'}`}>{p}</div>
                     <div className="text-[10px] font-bold">{p === 'STATIC' ? 'Static Maps' : p === 'THREADLOCAL' ? 'ThreadLocal' : p === 'INNER' ? 'Inner Classes' : 'Stream Leak'}</div>
                  </button>
               ))}
            </div>

            <div className="p-8 bg-black/40 rounded-[40px] border border-white/5 relative flex flex-col items-center">
               <div className="w-full flex justify-between items-center mb-8">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Memory Pressure: {heap}%</div>
                  <div className="flex gap-4">
                     <button onClick={() => setIsRunning(!isRunning)} className={`px-6 py-2 rounded-lg text-xs font-black transition ${isRunning ? 'bg-red-600 text-white animate-pulse' : 'bg-white text-black'}`}>
                        {isRunning ? 'APP RUNNING (LEAKING...)' : 'START APPLICATION'}
                     </button>
                     <button onClick={runGC} className="px-6 py-2 border border-white/20 rounded-lg text-xs font-bold hover:bg-white/5 transition">
                        TRIGGER FULL GC
                     </button>
                  </div>
               </div>

               <div className="w-full h-8 bg-white/5 rounded-full overflow-hidden border border-white/5 relative mb-4">
                  <motion.div 
                    animate={{ width: `${heap}%`, backgroundColor: heap > 80 ? '#ff4444' : heap > 50 ? '#ffaa00' : '#44ff44' }}
                    className="absolute inset-y-0 left-0 bg-accent-alive"
                  />
               </div>
               
               <div className="text-[10px] font-mono text-gray-600 uppercase">Heap Usage after GC never returns to baseline</div>
            </div>
         </div>

         <div className="w-full lg:w-96 space-y-4">
            <AnimatePresence mode="wait">
               <motion.div 
                 key={pattern} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                 className="p-6 rounded-3xl bg-white/5 border border-white/10"
               >
                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-4">The Fault: {pattern}</h4>
                  <div className="text-[11px] text-gray-400 leading-relaxed space-y-4">
                     {pattern === 'STATIC' && <p>Adding entries to a <code className="text-white">static Map</code> without ever removing them. Since static roots live as long as the ClassLoader, these objects are <span className="text-white">immortal</span>.</p>}
                     {pattern === 'THREADLOCAL' && <p>Using <code className="text-white">ThreadLocal</code> in an app server with a thread pool. If you don't call <code className="text-white">.remove()</code>, the data persists as long as the thread is in the pool (effectively forever).</p>}
                     {pattern === 'INNER' && <p>Non-static inner classes hold a hidden <code className="text-white">this$0</code> reference to the parent. Returning an inner class object can leak the massive parent object by accident.</p>}
                     {pattern === 'RESOURCE' && <p>Forgetting to close a <code className="text-white">FileInputStream</code> or a database connection. The native buffers stay allocated until the unreachable object is finally collected, which might take forever.</p>}
                  </div>
               </motion.div>
            </AnimatePresence>

            <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/20">
               <h4 className="text-[10px] font-bold text-red-500 uppercase mb-2">Detection Tool</h4>
               <p className="text-[11px] text-gray-500 leading-relaxed">
                  Real leaks are solved by taking two <span className="text-white">Heap Dumps</span> 5 minutes apart and comparing them in **VisualVM** or **Eclipse MAT**. Look for the "Dominator Tree".
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}