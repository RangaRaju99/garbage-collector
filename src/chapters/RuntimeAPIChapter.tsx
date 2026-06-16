import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJVMStore } from '../store/jvmStore';

export default function RuntimeAPIChapter() {
  const metrics = useJVMStore(state => state.metrics);
  const [cpuCores] = useState(8);
  const [gcRequested, setGcRequested] = useState(false);
  const [gcIgnored, setGcIgnored] = useState(false);
  const [executing, setExecuting] = useState(false);

  const handleGC = () => {
    setGcRequested(true);
    setGcIgnored(false);
    
    setTimeout(() => {
      // 30% chance to ignore GC request in simulation
      if (Math.random() > 0.7) {
        setGcIgnored(true);
        setGcRequested(false);
      } else {
        // Normal GC flow handled by JVMEngine
        setGcRequested(false);
      }
    }, 1500);
  };

  const handleExec = () => {
    setExecuting(true);
    setTimeout(() => setExecuting(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans p-8">
      <div className="mb-8 shrink-0">
         <h1 className="text-3xl font-black mb-2">java.lang.Runtime</h1>
         <p className="text-gray-400 text-sm max-w-2xl">The interface to the JVM engine itself. Access memory stats, trigger collections, and interact with the host Operating System.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-12">
         {/* Live Visualization */}
         <div className="flex flex-col items-center justify-center space-y-12 py-10 bg-white/5 rounded-[40px] border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #00ff88 0%, transparent 60%)' }}></div>
            
            <motion.div 
               animate={executing ? { scale: [1, 1.1, 1], rotate: [0, 2, -2, 0] } : {}}
               className="relative z-10 w-48 h-48 border-4 border-white/20 rounded-full flex flex-col items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.05)] bg-black/40"
            >
               <div className="text-[10px] font-black text-gray-500 uppercase mb-1">JVM Engine</div>
               <div className="text-2xl">⚙️</div>
               <div className="mt-4 flex gap-1">
                  {[...Array(cpuCores)].map((_, i) => (
                     <div key={i} className="w-2 h-2 rounded-full bg-green-500/40 animate-pulse" />
                  ))}
               </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-4 w-full px-12 z-10">
               <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                  <div className="text-[9px] text-gray-500 uppercase font-black mb-1">Free Memory</div>
                  <div className="text-lg font-mono text-green-400">{(metrics.heapUsed * 0.4).toFixed(1)}MB</div>
               </div>
               <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                  <div className="text-[9px] text-gray-500 uppercase font-black mb-1">Total Allocated</div>
                  <div className="text-lg font-mono text-blue-400">{metrics.heapUsed}MB</div>
               </div>
               <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                  <div className="text-[9px] text-gray-500 uppercase font-black mb-1">Max Memory</div>
                  <div className="text-lg font-mono text-purple-400">512MB</div>
               </div>
               <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                  <div className="text-[9px] text-gray-500 uppercase font-black mb-1">Processors</div>
                  <div className="text-lg font-mono text-white">{cpuCores} Cores</div>
               </div>
            </div>

            <AnimatePresence>
               {gcRequested && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute bottom-10 px-6 py-2 bg-yellow-500/20 border border-yellow-500/40 rounded-full text-[10px] font-black text-yellow-400 z-20">
                    GC REQUEST SENT...
                  </motion.div>
               )}
               {gcIgnored && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute bottom-10 px-6 py-2 bg-red-500/20 border border-red-500/40 rounded-full text-[10px] font-black text-red-500 z-20">
                    REQUEST IGNORED (JVM Policy)
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

         {/* Interactive API Panel */}
         <div className="space-y-6">
            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
               <h3 className="text-sm font-bold mb-4 uppercase tracking-tighter">Native Methods</h3>
               <div className="space-y-3">
                  <button onClick={handleGC} className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition border border-white/5 group">
                     <span className="text-xs font-mono text-gray-400">runtime.gc();</span>
                     <span className="text-[9px] px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded">Trigger System.gc()</span>
                  </button>
                  <button onClick={handleExec} className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition border border-white/5 group">
                     <span className="text-xs font-mono text-gray-400">runtime.exec("ls");</span>
                     <span className="text-[9px] px-2 py-1 bg-blue-500/10 text-blue-500 rounded">Interact with OS</span>
                  </button>
               </div>
            </div>

            <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-3xl">
               <h4 className="text-[10px] font-bold text-blue-400 uppercase mb-2 italic">The Myth of System.gc()</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed">
                  Calling <code className="text-white">runtime.gc()</code> does NOT force the JVM to run garbage collection. It is a <span className="text-white font-bold">hint</span>. Modern JVMs often ignore this hint entirely if the heap isn't full, or if disabled via <code className="text-white">-XX:+DisableExplicitGC</code>.
               </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="text-[10px] text-white font-bold mb-1">freeMemory()</div>
                  <div className="text-[10px] text-gray-500 italic">Usable heap space right now.</div>
               </div>
               <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="text-[10px] text-white font-bold mb-1">totalMemory()</div>
                  <div className="text-[10px] text-gray-500 italic">Heap currently committed to OS.</div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
