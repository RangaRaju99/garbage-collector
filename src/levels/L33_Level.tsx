import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const logSnippets = [
  "[2024-06-16T12:00:05.123+0000] GC(12) Pause Young (Normal) (G1 Evacuation Pause) 40M->15M(128M) 4.120ms",
  "[2024-06-16T12:00:10.555+0000] GC(13) Pause Young (Normal) (G1 Evacuation Pause) 128M->40M(256M) 15.602ms",
  "[2024-06-16T12:00:15.900+0000] GC(14) Pause Remark 60M->60M(256M) 2.100ms",
  "[2024-06-16T12:01:02.000+0000] GC(15) Pause Full (System.gc()) 200M->10M(256M) 120.500ms",
];

export default function L33_Level() {
  const [activeLog, setActiveLog] = useState<number | null>(null);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans">
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-[rgba(0,255,136,0.15)] border border-[rgba(0,255,136,0.3)] rounded text-[10px] font-mono text-[#00ff88]">L33</span>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">ADVANCED TRACK</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">GC Log Visualizer</h1>
        <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
          Production debugging starts with the logs. Learn to read the <span className="text-[#00ff88] font-bold">Unified Logging</span> format 
          and spot trends in allocation failure and pause times.
        </p>
      </div>

      <div className="px-8 pb-8 flex flex-col lg:flex-row gap-8">
         <div className="flex-1 space-y-6">
            <div className="p-6 bg-black/80 rounded-2xl border border-white/5 font-mono text-[11px] h-[400px] flex flex-col">
               <div className="text-gray-600 mb-4 border-b border-white/5 pb-2">gc.log - STDOUT</div>
               <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-4">
                  {logSnippets.map((line, i) => (
                     <motion.div 
                       key={i} 
                       onClick={() => setActiveLog(i)}
                       className={`p-2 rounded cursor-pointer transition ${activeLog === i ? 'bg-white/10 text-white border-l-2 border-[#00ff88]' : 'text-gray-500 hover:text-gray-300'}`}
                     >
                        {line}
                     </motion.div>
                  ))}
                  <div className="animate-pulse text-[#00ff88] p-2 mt-4">_</div>
               </div>
            </div>

            <AnimatePresence mode="wait">
               {activeLog !== null ? (
                  <motion.div 
                    key={activeLog} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-3xl bg-[#00ff88]/5 border border-[#00ff88]/20"
                  >
                     <h4 className="text-[10px] font-black text-[#00ff88] uppercase mb-4 tracking-[0.2em]">Parsing Details</h4>
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        <div>
                           <div className="text-[9px] text-gray-500 uppercase font-black mb-1">GC ID</div>
                           <div className="text-lg font-black">{activeLog + 12}</div>
                        </div>
                        <div>
                           <div className="text-[9px] text-gray-500 uppercase font-black mb-1">Heap Change</div>
                           <div className="text-lg font-black text-white">{activeLog === 3 ? '200' + ' -> ' + '10' : 'G1 Active'}</div>
                        </div>
                        <div>
                           <div className="text-[9px] text-gray-500 uppercase font-black mb-1">Pause Time</div>
                           <div className={`text-lg font-black ${activeLog === 3 ? 'text-red-400' : 'text-green-400'}`}>
                              {activeLog === 3 ? '120ms' : activeLog === 1 ? '15ms' : '4ms'}
                           </div>
                        </div>
                        <div>
                           <div className="text-[9px] text-gray-500 uppercase font-black mb-1">Reason</div>
                           <div className="text-xs font-bold text-gray-300">{activeLog === 3 ? 'Manual' : 'Allocation Failure'}</div>
                        </div>
                     </div>
                  </motion.div>
               ) : (
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 text-center text-xs text-gray-500 italic">
                     Select a log line above to breakdown the metadata.
                  </div>
               )}
            </AnimatePresence>
         </div>

         <div className="w-full lg:w-96 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Reading Unified Logs</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed space-y-4">
                  Since **Java 9**, GC logs follow a strict pattern:
                  <br/><br/>
                  <code className="text-[#00ff88]">Before {'->'} After (Total Capacity) Duration</code>
                  <br/><br/>
                  If "After" is close to "Before", it means a GC cycle happened but failed to clear much memory—a clear sign of a **Leak**.
               </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-2">Enable GC Logs</h4>
               <p className="text-[11px] text-gray-500 leading-relaxed mb-4 font-mono">
                  -Xlog:gc*:file=gc.log:<br/>
                  time,uptime,level,tags:<br/>
                  filecount=10,filesize=10M
               </p>
               <p className="text-[10px] text-gray-600 italic">Always keep GC logs enabled in production. The overhead is negligible, and they are your only map when a server crashes.</p>
            </div>
         </div>
      </div>
    </div>
  );
}