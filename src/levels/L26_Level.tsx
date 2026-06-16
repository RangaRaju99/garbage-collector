import { useState } from 'react';
import { motion } from 'framer-motion';

export default function L26_Level() {
  const [era, setEra] = useState<'java7' | 'java8'>('java8');

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans">
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] rounded text-[10px] font-mono text-[#00d4ff]">L26</span>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">ENGINEER TRACK</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Metaspace vs. PermGen</h1>
        <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
          The historic shift in Java 8. We moved class metadata from a fixed-size contiguous heap (PermGen) to dynamic native memory (Metaspace).
        </p>
      </div>

      <div className="px-8 pb-8 flex-1 flex flex-col lg:flex-row gap-12">
         {/* Visual Comparison */}
         <div className="flex-1 space-y-8">
            <div className="flex bg-white/5 p-1 rounded-xl w-fit border border-white/5">
               <button 
                 onClick={() => setEra('java7')}
                 className={`px-6 py-2 rounded-lg text-xs font-bold transition ${era === 'java7' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:text-white'}`}
               >
                 Java 7 (PermGen)
               </button>
               <button 
                 onClick={() => setEra('java8')}
                 className={`px-6 py-2 rounded-lg text-xs font-bold transition ${era === 'java8' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-white'}`}
               >
                 Java 8+ (Metaspace)
               </button>
            </div>

            <div className="relative h-80 w-full bg-black/40 border border-white/5 rounded-3xl p-8 flex flex-col">
               <div className="flex gap-4 items-end mb-4 h-48">
                  {/* The Heap */}
                  <div className="flex-1 bg-white/10 border border-white/10 rounded-t-xl flex flex-col items-center justify-center p-4 relative">
                     <span className="text-[10px] font-black uppercase text-gray-600 absolute top-4">JVM Heap (Xmx)</span>
                     {era === 'java7' && (
                        <motion.div 
                          initial={{ height: 0 }} animate={{ height: '60%' }}
                          className="w-full bg-orange-500/20 border-t-2 border-orange-500 flex items-center justify-center text-[10px] font-bold text-orange-400 mt-auto"
                        >
                          PermGen
                        </motion.div>
                     )}
                     <div className={`w-full bg-blue-500/10 h-[30%] ${era === 'java8' ? 'mt-auto' : ''}`}></div>
                  </div>

                  {/* Native Memory */}
                  <div className="flex-1 rounded-t-xl flex flex-col p-4 relative">
                     <span className="text-[10px] font-black uppercase text-gray-600 absolute top-4">Native RAM</span>
                     {era === 'java8' && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }} 
                          animate={{ height: '80%', opacity: 1 }}
                          className="w-full bg-blue-500/20 border-t-2 border-blue-500 flex items-center justify-center text-[10px] font-bold text-blue-400 mt-auto"
                        >
                          Metaspace
                        </motion.div>
                     )}
                  </div>
               </div>

               <div className="mt-auto h-1 w-full bg-white/5 rounded-full" />
               <div className="text-[10px] font-mono text-gray-700 mt-4 text-center uppercase tracking-widest">
                  {era === 'java7' ? 'Class metadata limited by fixed heap size' : 'Class metadata limited by total system RAM'}
               </div>
            </div>
         </div>

         {/* Stats Panel */}
         <div className="w-full lg:w-96 space-y-4">
            {era === 'java7' ? (
               <div className="p-6 rounded-2xl bg-orange-950/20 border border-orange-500/30">
                  <h4 className="text-sm font-bold text-orange-400 mb-4">PermGen Architecture</h4>
                  <ul className="space-y-3 text-[11px] text-gray-400">
                     <li className="flex gap-2"><span>🔴</span> <span>Contiguous part of the Java Heap.</span></li>
                     <li className="flex gap-2"><span>🔴</span> <span>Fixed size: -XX:MaxPermSize.</span></li>
                     <li className="flex gap-2"><span>🔴</span> <span>Prone to `java.lang.OutOfMemoryError: PermGen space`.</span></li>
                     <li className="flex gap-2"><span>🔴</span> <span>Managed by JVM GC.</span></li>
                  </ul>
               </div>
            ) : (
               <div className="p-6 rounded-2xl bg-blue-950/20 border border-blue-500/30">
                  <h4 className="text-sm font-bold text-blue-400 mb-4">Metaspace Architecture</h4>
                  <ul className="space-y-3 text-[11px] text-gray-400">
                     <li className="flex gap-2"><span>🟢</span> <span>Native memory, NOT part of the Java Heap.</span></li>
                     <li className="flex gap-2"><span>🟢</span> <span>Dynamic: grows automatically until OS RAM is full.</span></li>
                     <li className="flex gap-2"><span>🟢</span> <span>Optionally limited by -XX:MaxMetaspaceSize.</span></li>
                     <li className="flex gap-2"><span>🟢</span> <span>Metadata cleaned during Full GC.</span></li>
                  </ul>
               </div>
            )}

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
               <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-2">The Migration Strategy</h4>
               <p className="text-[11px] text-gray-500 leading-relaxed">
                  Moving metadata to native memory allowed the JVM to be more flexible, but introduced new risks like 
                  <span className="text-white"> native memory exhaustion</span> if classloaders leak.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}