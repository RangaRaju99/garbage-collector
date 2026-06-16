import { useState } from 'react';
import { motion } from 'framer-motion';

export default function PermGenChapter() {
  const [fill, setFill] = useState(40);
  const isOOM = fill >= 100;

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans p-8">
      <div className="mb-8 shrink-0">
         <h1 className="text-3xl font-black mb-2">The PermGen Vault (Legacy)</h1>
         <p className="text-gray-400 text-sm max-w-2xl">Before Java 8, class metadata lived in a fixed-size region of the <span className="text-white font-bold">Java Heap</span> called the Permanent Generation. This was the #1 cause of production crashes.</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-12">
         <div className="flex-1 flex flex-col items-center justify-center space-y-10">
            <div className="relative w-72 h-96 bg-black/40 border-4 border-white/10 rounded-3xl overflow-hidden shadow-2xl">
               {/* Fill level */}
               <motion.div 
                 animate={{ height: `${fill}%` }}
                 className={`absolute inset-x-0 bottom-0 transition-colors ${isOOM ? 'bg-red-500/40' : 'bg-[#ff6b00]/30'}`}
               />
               
               <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-t from-black/60 to-transparent">
                  <div className="text-5xl mb-4">{isOOM ? '💀' : '📂'}</div>
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-1">PERMGEN SPACE</div>
                  <div className={`text-2xl font-black ${isOOM ? 'text-red-500 animate-pulse' : 'text-white'}`}>{fill}% FULL</div>
                  {isOOM && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-[10px] text-red-500 font-mono font-bold">
                       OutOfMemoryError: PermGen space
                    </motion.div>
                  )}
               </div>
            </div>

            <div className="flex gap-4">
               <button onClick={() => setFill(f => Math.min(100, f + 15))} className="px-6 py-2 bg-red-600/20 border border-red-600/50 text-red-500 font-bold text-xs rounded-xl hover:bg-red-600/30 transition">DEPLOY NEW WAR FILE</button>
               <button onClick={() => setFill(20)} className="px-6 py-2 border border-white/10 text-gray-600 font-bold text-xs rounded-xl hover:text-white transition">RESTART SERVER</button>
            </div>
         </div>

         <div className="w-full lg:w-96 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Why it was a problem</h4>
               <ul className="space-y-4 text-[11px] text-gray-400">
                  <li className="flex gap-3">
                     <span className="text-red-500">❌</span>
                     <span><span className="text-white">Fixed Size:</span> Configured via <code className="text-white">-XX:MaxPermSize</code>. Cannot grow even if system has RAM.</span>
                  </li>
                  <li className="flex gap-3">
                     <span className="text-red-500">❌</span>
                     <span><span className="text-white">Heap Bound:</span> GC pauses in PermGen were Stop-The-World and often caused major lag.</span>
                  </li>
                  <li className="flex gap-3">
                     <span className="text-red-500">❌</span>
                     <span><span className="text-white">String Interning:</span> In Java 6, interned strings lived here, leading to many accidental OOMs.</span>
                  </li>
               </ul>
            </div>

            <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/20">
               <h4 className="text-[10px] font-bold text-red-400 uppercase mb-2">Historical Note</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed italic">
                  JRockit and IBM J9 never had a PermGen. HotSpot was the last major JVM to remove it, finally unifying the metadata management in Java 8.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}