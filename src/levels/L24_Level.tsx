import { useState } from 'react';
import { motion } from 'framer-motion';

export default function L24_Level() {
  const [arch, setArch] = useState<'jit' | 'aot'>('jit');

  const stats = {
    jit: { memory: 450, startup: '1.2s', footprint: 'Large (Full JVM)', speed: 'Hyper-Peak' },
    aot: { memory: 40, startup: '0.005s', footprint: 'Tiny (Static Binary)', speed: 'Fast' }
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans">
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-[rgba(170,0,255,0.15)] border border-[rgba(170,0,255,0.3)] rounded text-[10px] font-mono text-[#aa00ff]">L24</span>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">ENGINEER TRACK</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Native Image: GraalVM</h1>
        <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
          The end of JIT? GraalVM's Native Image (SubstrateVM) compiles Java into <span className="text-[#aa00ff] font-bold">Static Binaries</span>. 
          No loading, no bytecode, no warm-up.
        </p>
      </div>

      <div className="px-8 pb-8 flex flex-col lg:flex-row gap-12">
         <div className="flex-1 space-y-8">
            <div className="flex bg-white/5 p-1 rounded-2xl w-fit border border-white/5">
               <button 
                 onClick={() => setArch('jit')}
                 className={`px-8 py-3 rounded-xl text-xs font-bold transition-all ${arch === 'jit' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-500'}`}
               >
                 HotSpot JIT
               </button>
               <button 
                 onClick={() => setArch('aot')}
                 className={`px-8 py-3 rounded-xl text-xs font-bold transition-all ${arch === 'aot' ? 'bg-[#aa00ff] text-white shadow-lg' : 'text-gray-500'}`}
               >
                 GraalVM Native (AOT)
               </button>
            </div>

            <div className="p-8 bg-black/40 rounded-[40px] border border-white/5 relative flex flex-col items-center">
               <div className="mb-12 flex gap-20">
                  <div className="text-center">
                     <div className="text-[10px] text-gray-500 uppercase mb-2">Startup Delay</div>
                     <motion.div 
                       animate={{ 
                         height: arch === 'jit' ? 100 : 2,
                         backgroundColor: arch === 'jit' ? '#ff6600' : '#aa00ff'
                       }}
                       className="w-1 rounded-full mx-auto"
                     />
                     <div className="mt-2 text-xs font-bold">{stats[arch].startup}</div>
                  </div>
                  <div className="text-center">
                     <div className="text-[10px] text-gray-500 uppercase mb-2">Heap Overhead</div>
                     <motion.div 
                       animate={{ 
                         height: arch === 'jit' ? 140 : 15,
                         backgroundColor: arch === 'jit' ? '#ff6600' : '#aa00ff'
                       }}
                       className="w-12 rounded-t-lg mx-auto"
                     />
                     <div className="mt-2 text-xs font-bold">{stats[arch].memory}MB</div>
                  </div>
               </div>

               <div className="w-full h-px bg-white/5 mb-8" />

               <div className="grid grid-cols-2 gap-8 w-full max-w-md">
                  <div className="space-y-1">
                     <div className="text-[9px] text-gray-600 uppercase font-black">Runtime Footprint</div>
                     <div className="text-sm font-bold">{stats[arch].footprint}</div>
                  </div>
                  <div className="space-y-1">
                     <div className="text-[9px] text-gray-600 uppercase font-black">Optimization Strategy</div>
                     <div className="text-sm font-bold">{stats[arch].speed}</div>
                  </div>
               </div>
            </div>
         </div>

         <div className="w-full lg:w-96 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">AOT vs JIT</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
                  **JIT (Just-In-Time)** compiles while the app runs. It can use <span className="text-white">Profile-Guided Optimization (PGO)</span> to reach extreme speeds, but it needs a full JVM and starts slow.
                  <br/><br/>
                  **AOT (Ahead-Of-Time)** does all work during build. It results in a tiny executable that starts in milliseconds.
               </p>
               <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                  <div className="text-[10px] font-bold text-purple-400 mb-1">SubstrateVM Rule:</div>
                  <p className="text-[10px] text-gray-500 italic">"Closed World Assumption." GraalVM AOT assumes it knows every class at build time. Dynamic reflection and proxies require static configuration.</p>
               </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-2">Cloud Native Advantage</h4>
               <p className="text-[11px] text-gray-500 leading-relaxed">
                  Native Images are perfect for <span className="text-white">Kubernetes and Serverless</span>. You can scale from 0 to 1 instance and handle a request in less time than it takes a standard JVM to load its first class.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}