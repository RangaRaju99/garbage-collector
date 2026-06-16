import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

type Thread = { id: number; status: 'running' | 'polling' | 'paused'; delay: number; block: boolean; };

export default function L09_Level() {
  const [threads, setThreads] = useState<Thread[]>([
    { id: 1, status: 'running', delay: 0, block: false },
    { id: 2, status: 'running', delay: 0, block: false },
    { id: 3, status: 'running', delay: 0, block: true }, // Logic: this one is in a tight loop and won't pause immediately
    { id: 4, status: 'running', delay: 0, block: false },
  ]);
  const [isGCRequested, setIsGCRequested] = useState(false);
  const [globalSTW, setGlobalSTW] = useState(false);

  const requestGC = () => {
    setIsGCRequested(true);
    setThreads(prev => prev.map(t => ({ ...t, status: 'polling' })));
  };

  useEffect(() => {
    if (isGCRequested) {
      const timers = threads.map((t, i) => {
        const time = t.block ? 2500 : Math.random() * 800 + 200;
        return setTimeout(() => {
          setThreads(prev => {
            const next = [...prev];
            next[i] = { ...next[i], status: 'paused' };
            return next;
          });
        }, time);
      });
      return () => timers.forEach(clearTimeout);
    }
  }, [isGCRequested]);

  useEffect(() => {
     if (isGCRequested && threads.every(t => t.status === 'paused')) {
        setGlobalSTW(true);
     }
  }, [threads, isGCRequested]);

  const reset = () => {
    setIsGCRequested(false);
    setGlobalSTW(false);
    setThreads([
      { id: 1, status: 'running', delay: 0, block: false },
      { id: 2, status: 'running', delay: 0, block: false },
      { id: 3, status: 'running', delay: 0, block: true },
      { id: 4, status: 'running', delay: 0, block: false },
    ]);
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans">
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-[rgba(255,100,100,0.15)] border border-[rgba(255,100,100,0.3)] rounded text-[10px] font-mono text-[#ff4444]">L09</span>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">BEGINNER TRACK</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Stop-The-World Mechanisms</h1>
        <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
          The GC cannot safely move objects while your code is mutating them. 
          It must bring every thread to a <span className="text-red-400 font-bold">Safepoint</span>.
        </p>
      </div>

      <div className="px-8 pb-8 flex flex-col lg:flex-row gap-12">
         <div className="flex-1 space-y-8">
            <div className="flex justify-center">
               <button 
                 onClick={isGCRequested ? reset : requestGC}
                 className="px-10 py-4 bg-red-600 text-white font-black rounded-lg text-sm hover:scale-105 active:scale-95 transition shadow-[0_0_40px_rgba(255,0,0,0.3)] border-b-4 border-red-900"
               >
                 {isGCRequested ? 'RESET SIMULATION' : 'TRIGGER SYSTEM.GC()'}
               </button>
            </div>

            <div className="p-6 bg-black/40 rounded-3xl border border-white/5 relative min-h-[300px]">
               {globalSTW && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="absolute inset-0 z-10 flex items-center justify-center bg-red-950/40 backdrop-blur-sm rounded-3xl overflow-hidden"
                  >
                     <div className="text-center">
                        <div className="text-4xl mb-4">❄️</div>
                        <h2 className="text-2xl font-black text-red-400 tracking-tighter">STOP-THE-WORLD FREEZE</h2>
                        <p className="text-xs text-gray-400 uppercase tracking-widest mt-2">All SafePoints reached. GC Thread Active.</p>
                     </div>
                  </motion.div>
               )}

               <div className="space-y-4">
                  {threads.map(t => (
                     <div key={t.id} className="relative">
                        <div className="flex justify-between items-center mb-1">
                           <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">App Thread-{t.id} {t.block && '(Tight Loop)'}</span>
                           <span className={`text-[10px] font-bold ${t.status === 'running' ? 'text-green-400' : t.status === 'polling' ? 'text-yellow-400' : 'text-red-400'}`}>
                              {t.status.toUpperCase()}
                           </span>
                        </div>
                        <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                           {t.status === 'running' && (
                              <motion.div 
                                animate={{ x: ['-100%', '100%'] }} 
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                className="absolute inset-y-0 w-1/3 bg-green-500/20 blur-md"
                              />
                           )}
                           {t.status === 'polling' && (
                              <motion.div 
                                animate={{ opacity: [0.3, 1, 0.3] }} 
                                transition={{ repeat: Infinity, duration: 0.5 }}
                                className="absolute inset-0 bg-yellow-500/40"
                              />
                           )}
                           {t.status === 'paused' && <div className="absolute inset-0 bg-red-500/40" />}
                        </div>
                     </div>
                  ))}
               </div>

               <div className="mt-12 p-5 bg-white/5 rounded-2xl border border-white/10">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-3">Live Log:</h4>
                  <div className="font-mono text-[10px] space-y-1">
                     <div className="text-gray-500">{`> GC requested by Thread-0`}</div>
                     {isGCRequested && <div className="text-yellow-400">{`> Signaling Safepoint Poll bits...`}</div>}
                     {threads.filter(t => t.status === 'paused').map(t => (
                        <div key={t.id} className="text-red-400">{`> Thread-${t.id} suspended at Safepoint.`}</div>
                     ))}
                     {globalSTW && <div className="text-white font-bold">{`> [STW] Global pause duration: 0.0s`}</div>}
                  </div>
               </div>
            </div>
         </div>

         <div className="w-full lg:w-96 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">The Safepoint Poll</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed space-y-2">
                  The JVM doesn't "kill" threads to stop them. It asks them to stop themselves. 
                  Every thread periodically checks a <span className="text-white font-bold">Safepoint Poll</span> bit in its instruction stream.
               </p>
               <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                  <div className="text-[10px] font-bold text-yellow-500 mb-1">The TTSP Delay:</div>
                  <p className="text-[10px] text-gray-500 italic">"Time To Safepoint"</p>
                  <p className="text-[10px] text-gray-500 mt-1">If a thread is in a heavy calculation (like Thread-3 above), it might not poll the bit for a long time, causing all other threads to wait in a "Safepoint synchronization" state.</p>
               </div>
            </div>

            <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/10">
               <h4 className="text-[10px] font-bold text-red-400 uppercase mb-2">Impact on Latency</h4>
               <p className="text-[11px] text-gray-500 leading-relaxed">
                  Your GC pause time is NOT just the GC operation. It is <span className="text-white">TTSP + GC + Thread Wakeup</span>. This is why low-latency systems avoid long-running loops without "counting" safepoint logic.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}