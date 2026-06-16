import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ObjectState = { id: number; age: number; status: 'eden' | 'survivor' | 'promoted' | 'dead'; };

export default function L08_Level() {
  const [objects, setObjects] = useState<ObjectState[]>([]);
  const [cycle, setCycle] = useState(0);
  const [threshold, setThreshold] = useState(4); // Default for demo
  const [isGCing, setIsGCing] = useState(false);

  const spawnObject = () => {
    const newObj: ObjectState = { id: Date.now(), age: 0, status: 'eden' };
    setObjects(prev => [...prev, newObj]);
  };

  const runMinorGC = async () => {
    setIsGCing(true);
    await new Promise(r => setTimeout(r, 800)); // Simulating STW pause

    setObjects(prev => {
      const result: ObjectState[] = prev.map(obj => {
        // 80% of eden objects die in first GC
        if (obj.status === 'eden') {
           if (Math.random() > 0.2) return { ...obj, status: 'dead' as const };
           return { ...obj, status: 'survivor' as const, age: 1 };
        }
        
        if (obj.status === 'survivor') {
           const nextAge = obj.age + 1;
           if (nextAge >= threshold) return { ...obj, status: 'promoted' as const, age: nextAge };
           if (Math.random() > 0.9) return { ...obj, status: 'dead' as const }; // small chance to die in survivor
           return { ...obj, status: 'survivor' as const, age: nextAge };
        }

        return obj;
      });
      return result.filter(obj => obj.status !== 'dead');
    });

    setCycle(c => c + 1);
    setIsGCing(false);
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans">
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] rounded text-[10px] font-mono text-[#00d4ff]">L08</span>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">BEGINNER TRACK</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Object Aging & Tenuring</h1>
        <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
          How the JVM decides when an object is "old enough" to move to the Old Generation. 
          Every survival increments the 4-bit age counter in the object header.
        </p>
      </div>

      {/* Control Panel */}
      <div className="px-8 pb-6 flex items-center gap-6 shrink-0">
         <button 
           onClick={spawnObject}
           className="px-6 py-2 bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.3)] rounded-lg text-sm text-[#00ff88] font-bold hover:bg-[rgba(0,255,136,0.2)] transition"
         >
           + New Object (Eden)
         </button>
         <button 
           onClick={runMinorGC}
           disabled={isGCing}
           className={`px-6 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${
             isGCing ? 'bg-red-900/50 text-red-300' : 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30'
           }`}
         >
           {isGCing ? <div className="w-3 h-3 border-2 border-t-transparent border-white rounded-full animate-spin" /> : '☢'}
           Run Minor GC
         </button>
         
         <div className="flex flex-col gap-1">
            <span className="text-[10px] text-gray-500 uppercase font-bold">MaxTenuringThreshold: {threshold}</span>
            <input 
              type="range" min="1" max="15" value={threshold} 
              onChange={(e) => setThreshold(parseInt(e.target.value))}
              className="w-32 accent-accent-alive"
            />
         </div>

         <div className="ml-auto text-right">
            <div className="text-[10px] text-gray-500 uppercase font-bold">GC Cycle</div>
            <div className="text-2xl font-mono font-black text-white">#{cycle}</div>
         </div>
      </div>

      {/* Arena */}
      <div className="flex-1 px-8 pb-8 flex gap-4 min-h-[400px]">
         {/* Eden */}
         <div className="flex-1 rounded-2xl border border-[rgba(0,255,136,0.1)] bg-[rgba(0,255,136,0.02)] p-4 flex flex-col">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Eden</div>
            <div className="flex flex-wrap gap-2 content-start flex-1">
               <AnimatePresence>
                  {objects.filter(o => o.status === 'eden').map(obj => (
                    <motion.div
                       key={obj.id}
                       initial={{ scale: 0, opacity: 0 }}
                       animate={{ scale: 1, opacity: 1 }}
                       exit={{ scale: 0, opacity: 0 }}
                       className="w-10 h-10 rounded-lg bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.3)] flex items-center justify-center text-[10px] font-bold text-[#00ff88]"
                    >
                       Age 0
                    </motion.div>
                  ))}
               </AnimatePresence>
            </div>
         </div>

         {/* Survivor */}
         <div className="flex-1 rounded-2xl border border-[rgba(0,212,255,0.1)] bg-[rgba(0,212,255,0.02)] p-4 flex flex-col">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Survivor (S0/S1)</div>
            <div className="flex flex-wrap gap-2 content-start flex-1">
               <AnimatePresence>
                  {objects.filter(o => o.status === 'survivor').sort((a,b) => b.age - a.age).map(obj => (
                    <motion.div
                       key={obj.id}
                       layout
                       initial={{ x: -20, opacity: 0 }}
                       animate={{ x: 0, opacity: 1 }}
                       className="w-10 h-10 rounded-lg bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.3)] flex items-center justify-center text-[10px] font-bold text-[#00d4ff] relative overflow-hidden"
                    >
                       <div className="z-10">Age {obj.age}</div>
                       <motion.div 
                         className="absolute inset-x-0 bottom-0 bg-[#00d4ff22]"
                         animate={{ height: `${(obj.age / threshold) * 100}%` }}
                       />
                    </motion.div>
                  ))}
               </AnimatePresence>
               {objects.filter(o => o.status === 'survivor').length === 0 && (
                  <div className="w-full h-full flex items-center justify-center text-gray-700 text-[10px] uppercase font-bold italic">
                     Empty
                  </div>
               )}
            </div>
         </div>

         {/* Old Gen */}
         <div className="flex-1 rounded-2xl border border-[rgba(170,0,255,0.1)] bg-[rgba(170,0,255,0.02)] p-4 flex flex-col">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Old Gen</div>
            <div className="flex flex-wrap gap-2 content-start flex-1">
               <AnimatePresence>
                  {objects.filter(o => o.status === 'promoted').map(obj => (
                    <motion.div
                       key={obj.id}
                       initial={{ y: 20, opacity: 0 }}
                       animate={{ y: 0, opacity: 1 }}
                       className="w-10 h-10 rounded-lg bg-[rgba(170,0,255,0.1)] border border-[rgba(170,0,255,0.3)] flex items-center justify-center text-[10px] font-bold text-[#aa00ff]"
                    >
                       🏠
                    </motion.div>
                  ))}
               </AnimatePresence>
               {objects.filter(o => o.status === 'promoted').length === 0 && (
                  <div className="w-full h-full flex items-center justify-center text-gray-700 text-[10px] uppercase font-bold italic">
                     No Residents
                  </div>
               )}
            </div>
         </div>
      </div>

      {/* Footer Insight */}
      <div className="px-8 pb-8 shrink-0">
         <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] flex gap-6 items-start">
            <div className="flex-1">
               <h4 className="text-xs font-bold text-white mb-1">How it works internally</h4>
               <p className="text-[11px] text-gray-500 leading-relaxed">
                  Every object header has 4 bits reserved for GC age. This is why the maximum age is 15.
                  When you set <code className="text-accent-alive">-XX:MaxTenuringThreshold=15</code>, the object is promoted after surviving 15 GCs.
               </p>
            </div>
            <div className="flex-1">
               <h4 className="text-xs font-bold text-white mb-1">Premature Promotion</h4>
               <p className="text-[11px] text-gray-500 leading-relaxed">
                  If the Survivor space fills up before an object reaches the threshold, it is promoted early. 
                  This is called <span className="text-red-400">Tenuring Threshold overflow</span>.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}