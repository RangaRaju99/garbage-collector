import { useState } from 'react';
import { motion } from 'framer-motion';

type Block = { id: number; status: 'free' | 'used' | 'leaked' | 'dangling'; };

export default function L02_Level() {
  const [heap, setHeap] = useState<Block[]>(Array.from({ length: 24 }, (_, i) => ({ id: i, status: 'free' })));
  const [logicLog, setLogicLog] = useState<string[]>(['Heap initialized. Ready for malloc().']);

  const malloc = () => {
    setHeap(prev => {
      const idx = prev.findIndex(b => b.status === 'free');
      if (idx === -1) {
        setLogicLog(l => ['ERROR: Out of Memory!', ...l].slice(0, 5));
        return prev;
      }
      const next = [...prev];
      next[idx] = { ...next[idx], status: 'used' };
      setLogicLog(l => [`SUCCESS: Block ${idx} allocated.`, ...l].slice(0, 5));
      return next;
    });
  };

  const free = (leak = false) => {
    setHeap(prev => {
      const used = prev.filter(b => b.status === 'used');
      if (used.length === 0) return prev;
      const target = used[0];
      const next = [...prev];
      const idx = prev.indexOf(target);
      
      if (leak) {
        setLogicLog(l => [`LEAK: Reference to block ${idx} lost without free()!`, ...l].slice(0, 5));
        next[idx] = { ...next[idx], status: 'leaked' };
      } else {
        setLogicLog(l => [`FREE: Block ${idx} returned to OS.`, ...l].slice(0, 5));
        next[idx] = { ...next[idx], status: 'free' };
      }
      return next;
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans">
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] rounded text-[10px] font-mono text-[#00d4ff]">L02</span>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">BEGINNER TRACK</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Manual Memory Management</h1>
        <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
          In C, memory is a manual gearbox. You <code className="text-[#00d4ff]">malloc()</code> it, and you MUST <code className="text-[#00d4ff]">free()</code> it. 
          Forget one, and the engine stalls. Java replaced this with an Automatic Transmission (GC).
        </p>
      </div>

      <div className="px-8 pb-8 flex flex-col xl:flex-row gap-8">
         {/* Manual Simulator */}
         <div className="flex-1 space-y-6">
            <div className="flex flex-wrap gap-4">
               <button onClick={malloc} className="px-6 py-2 bg-blue-500/20 border border-blue-500/40 rounded-lg text-sm font-bold text-blue-400 hover:bg-blue-500/30">malloc(size)</button>
               <button onClick={() => free(false)} className="px-6 py-2 bg-green-500/20 border border-green-500/40 rounded-lg text-sm font-bold text-green-400 hover:bg-green-500/30">free(ptr)</button>
               <button onClick={() => free(true)} className="px-6 py-2 bg-orange-500/20 border border-orange-500/40 rounded-lg text-sm font-bold text-orange-400 hover:bg-orange-500/30">Lost Reference (Leak)</button>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-6 bg-black/40 rounded-2xl border border-white/5">
               {heap.map(block => (
                  <motion.div
                    key={block.id}
                    animate={{ 
                      backgroundColor: block.status === 'free' ? '#111' : block.status === 'used' ? '#00d4ff' : '#ff6b00',
                      scale: block.status === 'free' ? 0.9 : 1
                    }}
                    className="aspect-square rounded border border-white/5 relative group"
                  >
                     <div className="absolute inset-0 flex items-center justify-center text-[8px] font-mono opacity-20 group-hover:opacity-100">
                        {block.status === 'free' ? '' : block.id}
                     </div>
                  </motion.div>
               ))}
            </div>

            <div className="p-4 rounded-xl bg-black/60 border border-white/5 font-mono text-[10px] space-y-1">
               {logicLog.map((log, i) => (
                  <div key={i} className={log.startsWith('ERROR') ? 'text-red-400' : log.startsWith('LEAK') ? 'text-orange-400' : 'text-gray-500'}>
                     {`> ${log}`}
                  </div>
               ))}
            </div>
         </div>

         {/* Theory Panel */}
         <div className="w-full xl:w-96 space-y-4">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">The Danger Zone</h4>
               <div className="space-y-4 text-sm">
                  <div className="flex gap-3">
                     <span className="text-orange-400 text-lg">⚠️</span>
                     <div>
                        <div className="font-bold text-white text-xs">Memory Leaks</div>
                        <p className="text-[11px] text-gray-500 leading-relaxed">Object is lost, but OS thinks you're still using it. Garbage builds up.</p>
                     </div>
                  </div>
                  <div className="flex gap-3">
                     <span className="text-red-400 text-lg">💥</span>
                     <div>
                        <div className="font-bold text-white text-xs">Dangling Pointers</div>
                        <p className="text-[11px] text-gray-500 leading-relaxed">You free() memory but keep a pointer to it. Accessing it causes segfaults.</p>
                     </div>
                  </div>
                  <div className="flex gap-3">
                     <span className="text-purple-400 text-lg">🔄</span>
                     <div>
                        <div className="font-bold text-white text-xs">Fragmentation</div>
                        <p className="text-[11px] text-gray-500 leading-relaxed">Memory gets "holey". You have 10MB total free, but no single 2MB block fits.</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-6 rounded-2xl bg-accent-alive/5 border border-accent-alive/20">
               <h4 className="text-[10px] font-bold text-accent-alive uppercase mb-2">Java's Innovation</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed">
                  Java's GC solves all three. It detects leaked objects, prevents dangling pointers by invalidating references, and 
                  <span className="text-white"> compacts</span> memory to eliminate fragmentation.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}