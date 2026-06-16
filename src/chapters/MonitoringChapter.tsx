import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MonitoringChapter() {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const tools = [
    { id: 'jstat', name: 'jstat', icon: '📈', desc: 'Real-time GC stats from the command line. No overhead.', cmd: 'jstat -gcutil <pid> 1000' },
    { id: 'jmap', name: 'jmap', icon: '🗺', desc: 'Generate heap dumps or print class histograms.', cmd: 'jmap -histo:live <pid>' },
    { id: 'jfr', name: 'JFR', icon: '✈', desc: 'Java Flight Recorder. Low-overhead event recording.', cmd: 'jcmd <pid> JFR.start' },
    { id: 'visualvm', name: 'VisualVM', icon: '👁', desc: 'Comprehensive GUI for monitoring, profiling, and heap dumps.', cmd: 'UI-Based Tool' },
    { id: 'jconsole', name: 'JConsole', icon: '🛡', desc: 'JMX-based management and monitoring console.', cmd: 'jconsole <pid>' },
    { id: 'async', name: 'Async Profiler', icon: '⏱', desc: 'Deep native + Java profiling for performance hotspots.', cmd: 'profiler.sh -d 30 <pid>' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans p-8">
      <div className="mb-8 shrink-0">
         <h1 className="text-3xl font-black mb-2">The JVM Toolbelt</h1>
         <p className="text-gray-400 text-sm max-w-2xl">Production visibility is the line between guessing and knowing. Master the <span className="text-white font-bold">Standard JDK Tools</span> for monitoring and diagnosing the JVM.</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-12">
         <div className="flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
               {tools.map(tool => (
                  <motion.button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-6 rounded-3xl border text-left transition-all ${activeTool === tool.id ? 'bg-accent-alive/10 border-accent-alive shadow-[0_0_20px_rgba(0,212,255,0.1)]' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                  >
                     <div className="text-3xl mb-4">{tool.icon}</div>
                     <div className={`text-sm font-black mb-1 ${activeTool === tool.id ? 'text-accent-alive' : 'text-white'}`}>{tool.name}</div>
                     <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2">{tool.desc}</p>
                  </motion.button>
               ))}
            </div>

            <AnimatePresence mode="wait">
               {activeTool && (
                  <motion.div 
                    key={activeTool} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mt-8 p-6 bg-black/60 border border-white/10 rounded-[32px] font-mono"
                  >
                     <div className="text-[10px] font-bold text-gray-600 uppercase mb-3 tracking-widest">CLI Execution Example</div>
                     <div className="p-4 bg-black/40 border border-white/5 rounded-xl text-xs text-accent-alive">
                        $ {tools.find(t => t.id === activeTool)?.cmd}
                     </div>
                     <div className="mt-4 text-[11px] text-gray-400 leading-relaxed italic">
                        {tools.find(t => t.id === activeTool)?.desc}
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

         <div className="w-full lg:w-96 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Monitoring Levels</h4>
               <ul className="space-y-4 text-[11px] text-gray-400">
                  <li className="flex gap-3">
                     <span className="text-green-500">1</span>
                     <span><span className="text-white">Continuous:</span> JMX, Micrometer, Prometheus/Grafana (Health metrics).</span>
                  </li>
                  <li className="flex gap-3">
                     <span className="text-yellow-500">2</span>
                     <span><span className="text-white">Diagnostic:</span> jstat, jfr (Triage when things look slow).</span>
                  </li>
                  <li className="flex gap-3">
                     <span className="text-red-500">3</span>
                     <span><span className="text-white">Deep Forensic:</span> jmap heaps dumps, Async-Profiler (Solving the leak).</span>
                  </li>
               </ul>
            </div>

            <div className="p-6 bg-accent-alive/5 border border-accent-alive/20 rounded-3xl">
               <h4 className="text-[10px] font-bold text-accent-alive uppercase mb-2">Golden Rule</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed italic">
                 "Never take a heap dump on a production cluster node while it's serving traffic. The STW pause for a 32GB dump can last minutes."
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}