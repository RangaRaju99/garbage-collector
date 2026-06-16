import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CodeCacheChapter() {
  const [fill, setFill] = useState(15);
  const isFull = fill >= 100;

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans p-8">
      <div className="mb-8 shrink-0">
         <h1 className="text-3xl font-black mb-2">The Code Cache</h1>
         <p className="text-gray-400 text-sm max-w-2xl">Where the high-performance native code lives. The JIT compiler stores all compiled methods in this <span className="text-[#00d4ff] font-bold">fixed-size native buffer</span>. If it fills up, performance collapses.</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-12">
         <div className="flex-1 flex flex-col items-center justify-center space-y-12">
            {/* Code Cache Visualization */}
            <div className="relative w-80 h-80">
               <div className="absolute inset-0 rounded-[50px] border-4 border-white/5 bg-white/5" />
               <motion.div 
                 animate={{ clipPath: `inset(${100 - fill}% 0 0 0)` }}
                 className="absolute inset-0 rounded-[50px] bg-gradient-to-t from-[#00d4ff] to-[#00ff88] opacity-20 shadow-[0_0_50px_rgba(0,212,255,0.2)]"
               />
               
               <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">RESERVED CODE CACHE</div>
                  <div className={`text-4xl font-black ${isFull ? 'text-red-500 animate-pulse' : 'text-white'}`}>{fill}%</div>
                  <div className="text-[10px] text-gray-500 font-mono mt-4 italic">
                    {isFull ? 'STOPPING JIT COMPILATION...' : 'JIT COMPILER ACTIVE'}
                  </div>
               </div>

               {/* Random Code Chunks */}
               {Array.from({ length: 48 }).map((_, i) => (
                  <motion.div 
                    key={i}
                    animate={{ 
                      opacity: i < (fill / 2) ? 1 : 0.05,
                      scale: i < (fill / 2) ? 1 : 0.5
                    }}
                    className="absolute w-4 h-4 bg-white/10 border border-white/10 rounded-sm"
                    style={{ 
                      top: `${Math.random() * 80 + 10}%`, 
                      left: `${Math.random() * 80 + 10}%`,
                    }}
                  />
               ))}
            </div>

            <div className="flex gap-4">
               <button onClick={() => setFill(f => Math.min(100, f + 10))} className="px-8 py-3 bg-[#00d4ff]/20 border border-[#00d4ff]/50 text-[#00d4ff] font-bold text-xs rounded-xl hover:bg-[#00d4ff]/30 transition uppercase">Compile Warm Methods</button>
               <button onClick={() => setFill(15)} className="px-8 py-3 border border-white/10 text-gray-600 font-bold text-xs rounded-xl hover:text-white transition">CLEAR CACHE</button>
            </div>
         </div>

         <div className="w-full lg:w-96 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">The Performance Cliff</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
                  When the Code Cache is full, the JVM emits a warning and <span className="text-red-400 font-bold">stops JIT compilation</span>.
                  <br/><br/>
                  Methods will fall back to the <span className="text-white">Interpreter</span> (bytecode execution). You will see a sudden, massive drop in throughput—often 10x slower—without any increase in CPU usage.
               </p>
            </div>

            <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/20">
               <h4 className="text-[10px] font-bold text-blue-400 uppercase mb-2">Monitor with JLink</h4>
               <code className="text-[10px] font-mono text-white bg-black/40 p-2 rounded block">
                  -XX:ReservedCodeCacheSize=512m
               </code>
               <p className="text-[10px] text-gray-500 mt-2 italic">Modern apps (Microservices/Serverless) with many small classes need larger caches than older monoliths.</p>
            </div>
         </div>
      </div>
    </div>
  );
}