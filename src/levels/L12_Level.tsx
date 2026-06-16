import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Obj = { id: number; age: number; };

export default function L12_Level() {
  const [fromS0, setFromS0] = useState<Obj[]>(Array.from({ length: 4 }, (_, i) => ({ id: i, age: 1 })));
  const [toS1, setToS1] = useState<Obj[]>([]);
  const [isS0Active, setIsS0Active] = useState(true);
  const [moving, setMoving] = useState(false);

  const simulateCopy = async () => {
    setMoving(true);
    await new Promise(r => setTimeout(r, 1000));
    
    if (isS0Active) {
      // Move S0 -> S1
      const promoted = fromS0.map(o => ({ ...o, age: o.age + 1 }));
      setToS1(promoted);
      setFromS0([]);
    } else {
      // Move S1 -> S0
      const promoted = toS1.map(o => ({ ...o, age: o.age + 1 }));
      setFromS0(promoted);
      setToS1([]);
    }
    
    setIsS0Active(!isS0Active);
    setMoving(false);
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans">
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] rounded text-[10px] font-mono text-[#00d4ff]">L12</span>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">INTERMEDIATE TRACK</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Survivor Spaces: The Ping-Pong</h1>
        <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
          Why are there <span className="text-accent-alive">two</span> Survivor spaces? 
          The JVM uses a <span className="text-accent-alive">Copying Collector</span>. One space is always empty (To-Space), ready to receive survivors from the other (From-Space).
        </p>
      </div>

      <div className="px-8 pb-8 flex-1 flex flex-col items-center justify-center gap-12">
         <div className="flex gap-20 items-stretch">
            {/* S0 Block */}
            <div className={`w-64 min-h-[120px] p-6 rounded-2xl border-2 transition-all ${isS0Active ? 'border-accent-alive bg-accent-alive/10 shadow-[0_0_20px_rgba(0,212,255,0.1)]' : 'border-white/5 bg-white/5 opacity-50'}`}>
               <div className="text-[10px] font-black uppercase mb-4 tracking-widest flex justify-between">
                  <span>Survivor 0</span>
                  <span className={isS0Active ? 'text-accent-alive' : 'text-gray-600'}>{isS0Active ? 'FROM (Active)' : 'TO (Receiver)'}</span>
               </div>
               <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                     {fromS0.map(o => (
                        <motion.div 
                          key={o.id}
                          layoutId={`obj-${o.id}`}
                          className="w-10 h-10 rounded bg-accent-alive/20 border border-accent-alive/40 flex items-center justify-center text-[10px] font-bold"
                        >
                           Age {o.age}
                        </motion.div>
                     ))}
                  </AnimatePresence>
               </div>
            </div>

            {/* Path */}
            <div className="flex flex-col items-center justify-center gap-2">
               <motion.div 
                 animate={{ rotate: isS0Active ? 0 : 180 }}
                 className="text-3xl text-gray-600"
               >
                 {moving ? '⚡' : '⇄'}
               </motion.div>
               <button 
                 onClick={simulateCopy}
                 disabled={moving}
                 className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-xs font-bold transition disabled:opacity-50"
               >
                 {moving ? 'COPYING...' : 'GC CYCLE'}
               </button>
            </div>

            {/* S1 Block */}
            <div className={`w-64 min-h-[120px] p-6 rounded-2xl border-2 transition-all ${!isS0Active ? 'border-accent-alive bg-accent-alive/10 shadow-[0_0_20px_rgba(0,212,255,0.1)]' : 'border-white/5 bg-white/5 opacity-50'}`}>
               <div className="text-[10px] font-black uppercase mb-4 tracking-widest flex justify-between">
                  <span>Survivor 1</span>
                  <span className={!isS0Active ? 'text-accent-alive' : 'text-gray-600'}>{!isS0Active ? 'FROM (Active)' : 'TO (Receiver)'}</span>
               </div>
               <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                     {toS1.map(o => (
                        <motion.div 
                          key={o.id}
                          layoutId={`obj-${o.id}`}
                          className="w-10 h-10 rounded bg-accent-alive/20 border border-accent-alive/40 flex items-center justify-center text-[10px] font-bold"
                        >
                           Age {o.age}
                        </motion.div>
                     ))}
                  </AnimatePresence>
               </div>
            </div>
         </div>

         <div className="max-w-2xl text-center space-y-4">
            <h4 className="text-sm font-bold text-gray-300">Why Copying?</h4>
            <div className="grid md:grid-cols-2 gap-4 text-left">
               <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-accent-alive font-bold text-xs mb-1">Zero Fragmentation</div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">By copying live objects to a fresh space, they are packed together perfectly. No gaps.</p>
               </div>
               <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-accent-alive font-bold text-xs mb-1">Cheap Deallocation</div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">After copying, the JVM simply resets the pointer of the old space. No need to visit dead objects.</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}