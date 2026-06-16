import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClassLoaderLeakChapter() {
  const [apps, setApps] = useState<{ id: number, active: boolean, leaking: boolean }[]>([
    { id: 1, active: true, leaking: false }
  ]);

  const deploy = () => {
    // Current active app becomes a leak
    setApps(prev => [
      ...prev.map(a => ({ ...a, active: false, leaking: true })),
      { id: prev.length + 1, active: true, leaking: false }
    ]);
  };

  const clean = () => {
    setApps([{ id: 1, active: true, leaking: false }]);
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans p-8">
      <div className="mb-8 shrink-0 flex justify-between items-start">
         <div>
            <h1 className="text-3xl font-black mb-2 italic text-red-500 underline decoration-red-500/30">Metaspace Leak</h1>
            <p className="text-gray-400 text-sm max-w-2xl">The most common memory leak in modern Java. When a ClassLoader doesn't die, all the <span className="text-white font-bold">Class Metadata</span> it loaded stays in Metaspace forever.</p>
         </div>
         <div className="flex gap-2">
            <button onClick={deploy} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-[10px] font-black transition uppercase tracking-widest">🔄 Hot Reload</button>
            <button onClick={clean} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-black transition">Full Restart</button>
         </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8">
         <div className="flex-1 grid grid-cols-4 gap-4 p-8 bg-black/40 border border-white/5 rounded-[40px] auto-rows-max overflow-y-auto max-h-[500px]">
            <AnimatePresence>
               {apps.map((app) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className={`aspect-square rounded-2xl p-4 flex flex-col items-center justify-center border-2 transition-colors ${
                      app.active ? 'bg-green-500/10 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'bg-red-500/5 border-red-500/20'
                    }`}
                  >
                     <div className="text-xl mb-1">{app.active ? '🚀' : '👻'}</div>
                     <div className={`text-[8px] font-black uppercase ${app.active ? 'text-green-400' : 'text-red-900'}`}>
                        {app.active ? 'Active V2' : 'Zombie Loader'}
                     </div>
                     <div className="mt-2 text-[7px] text-gray-600 font-mono">0x{app.id}ff2a</div>
                  </motion.div>
               ))}
            </AnimatePresence>
         </div>

         <div className="w-full lg:w-96 space-y-4">
            <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-3xl">
               <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-4">Why it happens</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed mb-4 italic">
                  In Web Containers (Tomcat/Jetty), "reloading" an app creates a new ClassLoader.
                  <br/><br/>
                  If just <span className="text-white">ONE strong reference</span> (like a ThreadLocal or a Shutdown Hook) points back to a class from the old loader, it can NEVER be collected.
               </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-4">Memory Impact</h4>
               <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px]">
                     <span className="text-gray-500">Heap Usage</span>
                     <span className="text-gray-300">Constant</span>
                  </div>
                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                     <div className="bg-blue-400 h-full w-[40%]" />
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                     <span className="text-red-400">Metaspace Usage</span>
                     <span className="text-red-400 font-bold">UPWARD ↗️</span>
                  </div>
                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: '10%' }}
                        animate={{ width: `${Math.min(100, 10 + apps.length * 15)}%` }}
                        className="bg-red-500 h-full" 
                     />
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
