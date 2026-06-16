import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const nmtData = [
  { name: 'Java Heap', size: '2048MB', color: '#00d4ff', description: 'Your application objects.' },
  { name: 'Class', size: '150MB', color: '#aa44ff', description: 'Metadata for loaded classes (Metaspace).' },
  { name: 'Thread', size: '84MB', color: '#ff4444', description: 'Stack memory for 120 threads.' },
  { name: 'Code', size: '60MB', color: '#ffaa00', description: 'Compiled method JIT cache.' },
  { name: 'GC', size: '120MB', color: '#00ff88', description: 'Remembered Sets, Mark Bitmaps, Card Tables.' },
  { name: 'Symbol', size: '20MB', color: '#ffffff', description: 'String pool and constant pool symbols.' },
];

export default function L32_Level() {
  const [selected, setSelected] = useState(0);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans">
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] rounded text-[10px] font-mono text-[#00d4ff]">L32</span>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">ADVANCED TRACK</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Native Memory Tracking (NMT)</h1>
        <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
          The <code className="text-white">-Xmx</code> flag ONLY limits the Java Heap. The JVM process actually consumes much more. 
          Use <span className="text-accent-alive font-bold">NMT</span> to see where the physical RAM is going.
        </p>
      </div>

      <div className="px-8 pb-8 flex flex-col lg:flex-row gap-12">
         <div className="flex-1 space-y-12">
            {/* Visual Breakdown */}
            <div className="flex flex-col gap-2 p-10 bg-black/40 rounded-[40px] border border-white/5 relative">
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 italic text-center">Process RSS Breakdown (Total: 2.5GB)</h3>
               
               <div className="flex h-32 w-full rounded-2xl overflow-hidden border border-white/10">
                  {nmtData.map((d, i) => (
                     <motion.div 
                       key={d.name}
                       onMouseEnter={() => setSelected(i)}
                       animate={{ 
                         width: i === 0 ? '60%' : i === 1 ? '15%' : '5%',
                         opacity: selected === i ? 1 : 0.6,
                         scale: selected === i ? 1.02 : 1
                       }}
                       style={{ backgroundColor: d.color }}
                       className="h-full cursor-help transition-all"
                     />
                  ))}
               </div>

               <div className="mt-12">
                  <AnimatePresence mode="wait">
                     <motion.div 
                       key={selected}
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between"
                     >
                        <div>
                           <div className="flex items-center gap-3 mb-1">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: nmtData[selected].color }} />
                              <h4 className="text-lg font-black">{nmtData[selected].name}</h4>
                           </div>
                           <p className="text-xs text-gray-400">{nmtData[selected].description}</p>
                        </div>
                        <div className="text-2xl font-black font-mono text-white">{nmtData[selected].size}</div>
                     </motion.div>
                  </AnimatePresence>
               </div>
            </div>
         </div>

         <div className="w-full lg:w-96 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">RSS vs Heap</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed space-y-4">
                  A common mistake is setting <code className="text-white">-Xmx2g</code> on a container with <code className="text-white">2GB RAM</code>. 
                  The JVM will be killed by the Linux OOM Killer because it needs about 20-30% extra space for native metadata.
               </p>
               <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <div className="text-[10px] font-bold text-blue-400 mb-1">Pro Tip:</div>
                  <p className="text-[10px] text-gray-500 italic">"Native Memory" includes direct byte buffers (Netty), JVM internal structures, and class metadata.</p>
               </div>
            </div>

            <div className="p-6 rounded-3xl bg-accent-alive/5 border border-accent-alive/20">
               <h4 className="text-[10px] font-bold text-accent-alive uppercase mb-2">How to enable</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
                  Native Tracking has a 1-5% performance cost. Enable it with:
               </p>
               <code className="text-[9px] text-gray-300 block bg-black/60 p-3 rounded font-mono">
                  -XX:NativeMemoryTracking=[summary|detail]<br/>
                  jcmd &lt;pid&gt; VM.native_memory summary
               </code>
            </div>
         </div>
      </div>
    </div>
  );
}