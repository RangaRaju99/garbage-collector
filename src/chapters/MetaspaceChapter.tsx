import { useState } from 'react';
import { motion } from 'framer-motion';

export default function MetaspaceChapter() {
  const [classes, setClasses] = useState(120);
  const max = 512;

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans p-8">
      <div className="mb-8 shrink-0">
         <h1 className="text-3xl font-black mb-2">Metaspace Internals</h1>
         <p className="text-gray-400 text-sm max-w-2xl">The replacement for PermGen. Metaspace stores class metadata in <span className="text-white font-bold">Native Memory</span>, making it much more flexible and resilient to OOM errors than its predecessor.</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-12">
         <div className="flex-1 space-y-8">
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
               <div className="flex justify-between items-center mb-6">
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Metadata Pressure</div>
                    <div className="text-[10px] text-gray-600 mt-1">Simulate massive dynamic class loading (e.g. Spring/Hibernate)</div>
                  </div>
                  <div className="flex gap-4">
                     <button onClick={() => setClasses(c => Math.min(1000, c + 50))} className="px-3 py-1 bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff] text-[10px] font-bold rounded">+ Load Classes</button>
                     <button onClick={() => setClasses(120)} className="px-3 py-1 border border-white/5 text-gray-600 text-[10px] font-bold rounded hover:text-white">Reset</button>
                  </div>
               </div>

               <div className="flex items-end gap-1 h-40 border-b border-white/10 pb-1 px-4 relative">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 10 }}
                      animate={{ height: i < (classes / 20) ? '80%' : '10%', opacity: i < (classes / 20) ? 1 : 0.1 }}
                      className="flex-1 bg-[#00d4ff] rounded-t-sm"
                    />
                  ))}
                  
                  {/* Native memory ceiling */}
                  <motion.div 
                    animate={{ y: - (max / 10) }}
                    className="absolute inset-x-0 h-px bg-red-500/50 border-t border-dashed border-red-500 z-10"
                  >
                    <div className="absolute right-0 -top-4 text-[8px] text-red-500 font-bold uppercase">-XX:MaxMetaspaceSize={max}M</div>
                  </motion.div>
               </div>
               
               <div className="mt-4 flex justify-between text-[10px] font-mono">
                  <div className="text-gray-500">Classes Loaded: <span className="text-white font-bold">{classes * 10}</span></div>
                  <div className="text-gray-500">Native MB: <span className="text-[#00d4ff] font-bold">{Math.round(classes * 1.2)}MB</span></div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               {[
                 { label: 'Klass Attributes', val: 'Method Tables, VTables' },
                 { label: 'Annotations', val: 'Runtime-visible metadata' },
                 { label: 'Constant Pool', val: 'Symbolic references (Native)' },
                 { label: 'Method Bytecode', val: 'The code itself' },
               ].map(i => (
                 <div key={i.label} className="p-4 bg-white/5 border border-white/5 rounded-xl">
                    <div className="text-[9px] font-bold text-gray-600 uppercase mb-1">{i.label}</div>
                    <div className="text-xs text-gray-300">{i.val}</div>
                 </div>
               ))}
            </div>
         </div>

         <div className="w-full lg:w-96 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Metaspace Mastery</h4>
               <ul className="space-y-4 text-[11px] text-gray-400">
                  <li className="flex gap-3">
                     <span className="text-accent-alive">▶</span>
                     <span>Unlike PermGen, Metaspace is <span className="text-white">not part of the Java Heap</span>. It grows on the OS RAM.</span>
                  </li>
                  <li className="flex gap-3">
                     <span className="text-accent-alive">▶</span>
                     <span>Metadata for dead classes is reclaimed only when their <span className="text-white">ClassLoader</span> is collected.</span>
                  </li>
                  <li className="flex gap-3">
                     <span className="text-accent-alive">▶</span>
                     <span>If Metaspace fills the OS RAM, it will cause a system-level swap—set <code className="text-white">-XX:MaxMetaspaceSize</code> to prevent this.</span>
                  </li>
               </ul>
            </div>

            <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10">
               <h4 className="text-[10px] font-bold text-blue-400 uppercase mb-2">Diagnostic Command</h4>
               <p className="text-[11px] text-gray-500 font-mono italic">jcmd &lt;pid&gt; GC.class_stats</p>
            </div>
         </div>
      </div>
    </div>
  );
}