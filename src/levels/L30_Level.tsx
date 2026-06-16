import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type OOMType = 'heap' | 'metaspace' | 'stack' | 'overhead';

export default function L30_Level() {
  const [activeError, setActiveError] = useState<OOMType | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const trigger = (type: OOMType) => {
    setActiveError(type);
    const msgs = {
      heap: "Exception in thread 'main' java.lang.OutOfMemoryError: Java heap space",
      metaspace: "Exception in thread 'main' java.lang.OutOfMemoryError: Metaspace",
      stack: "Exception in thread 'main' java.lang.StackOverflowError",
      overhead: "Exception in thread 'main' java.lang.OutOfMemoryError: GC overhead limit exceeded"
    };
    setLog(prev => [msgs[type], ...prev].slice(0, 10));
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans">
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-[rgba(255,100,100,0.15)] border border-[rgba(255,100,100,0.3)] rounded text-[10px] font-mono text-[#ff4444]">L30</span>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">INTERVIEW MODE</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">OOM Errors Simulator</h1>
        <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
          The nightmare of every production engineer. Understand the physics of failure. 
          Which OOM is which, and how do you solve them?
        </p>
      </div>

      <div className="px-8 pb-8 flex flex-col lg:flex-row gap-8">
         <div className="flex-1 grid grid-cols-2 gap-4">
            {[
              { id: 'heap', label: 'Java Heap Space', icon: '🍰', desc: 'Object graph > Xmx', color: '#ff4444', fix: 'Check memory leaks or increase -Xmx' },
              { id: 'metaspace', label: 'Metaspace', icon: '📚', desc: 'Too many classes loaded', color: '#00d4ff', fix: 'Check ClassLoader leaks or increase MaxMetaspaceSize' },
              { id: 'stack', label: 'StackOverflow', icon: '🥞', desc: 'Infinite recursion / deep stack', color: '#ffaa00', fix: 'Fix recursion logic or increase -Xss' },
              { id: 'overhead', label: 'GC Overhead Limit', icon: '🕒', desc: 'GC spending 98% time for <2% gain', color: '#aa00ff', fix: 'Optimize object allocation rate' },
            ].map(oom => (
              <motion.button
                key={oom.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => trigger(oom.id as OOMType)}
                className={`p-6 rounded-2xl border text-left transition-all ${activeError === oom.id ? 'bg-white/10 border-white/30' : 'bg-white/5 border-white/5'}`}
              >
                 <div className="text-3xl mb-3">{oom.icon}</div>
                 <div className="font-bold text-sm mb-1">{oom.label}</div>
                 <p className="text-[10px] text-gray-500 mb-4">{oom.desc}</p>
                 {activeError === oom.id && (
                    <div className="p-3 bg-black/40 rounded-lg border border-white/10 mt-2">
                       <div className="text-[9px] font-bold text-gray-400 uppercase mb-1">Recommended Fix:</div>
                       <p className="text-[10px] text-accent-alive leading-relaxed">{oom.fix}</p>
                    </div>
                 )}
              </motion.button>
            ))}
         </div>

         {/* Console */}
         <div className="w-full lg:w-[450px] bg-[#0d0d12] border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
            <div className="bg-white/5 px-4 py-2 flex items-center gap-2 border-b border-white/10">
               <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
               </div>
               <span className="text-[10px] font-mono text-gray-500 ml-2">production-env-std-err</span>
            </div>
            <div className="flex-1 p-5 font-mono text-[11px] leading-relaxed overflow-y-auto min-h-[300px]">
               <AnimatePresence>
                  {log.length === 0 ? (
                    <div className="text-gray-700 italic">Waiting for runtime failure...</div>
                  ) : (
                    log.map((line, i) => (
                      <motion.div 
                        initial={{ x: -10, opacity: 0 }} 
                        animate={{ x: 0, opacity: 1 }} 
                        key={`${i}-${line}`}
                        className="text-red-400 mb-4 p-3 bg-red-500/5 border-l-2 border-red-500"
                      >
                         {line}
                         <div className="mt-2 text-gray-600 text-[10px]">
                            at com.app.Engine.allocate(Engine.java:42)<br/>
                            at com.app.Main.run(Main.java:10)<br/>
                            at java.base/java.lang.Thread.run(Thread.java:844)
                         </div>
                      </motion.div>
                    ))
                  )}
               </AnimatePresence>
            </div>
         </div>
      </div>
    </div>
  );
}