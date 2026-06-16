import { useState } from 'react';
import { motion } from 'framer-motion';

export default function L13_Level() {
  const [infancyRate, setInfancyRate] = useState(0.9); // 90% die in Eden
  const [tenuringRate, setTenuringRate] = useState(0.2); // 20% die per survivor cycle

  // Calculate curve points
  const points = Array.from({ length: 16 }).map((_, age) => {
    if (age === 0) return 100;
    if (age === 1) return 100 * (1 - infancyRate);
    return 100 * (1 - infancyRate) * Math.pow(1 - tenuringRate, age - 1);
  });

  const path = points.map((p, i) => `${i * 30},${250 - p * 2.2}`).join(' L ');

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans">
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] rounded text-[10px] font-mono text-[#00d4ff]">L13</span>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">INTERMEDIATE TRACK</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">The Generational Hypothesis</h1>
        <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
          "Most objects die young." This empirical observation is the heart of JVM performance. 
          The <span className="text-accent-alive font-bold">Survival Curve</span> dictates how we size heap regions.
        </p>
      </div>

      <div className="px-8 pb-8 flex flex-col xl:flex-row gap-12">
         <div className="flex-1 space-y-8">
            <div className="p-8 bg-black/40 rounded-3xl border border-white/5 relative overflow-hidden">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Mortality vs Age (Tenure)</h3>
                  <div className="flex gap-4">
                     <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-accent-alive" /> <span className="text-[8px] text-gray-500 uppercase">Population %</span></div>
                  </div>
               </div>

               <svg className="w-full h-64 overflow-visible" viewBox="0 0 450 250">
                  {/* Grid */}
                  {Array.from({ length: 6 }).map((_, i) => (
                     <line key={i} x1="0" y1={i * 50} x2="450" y2={i * 50} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  ))}
                  
                  {/* Path */}
                  <motion.path 
                    d={`M 0,0 L ${path}`}
                    fill="none"
                    stroke="#00d4ff"
                    strokeWidth="3"
                    initial={false}
                    animate={{ d: `M 0,0 L ${path}` }}
                  />

                  {/* Nodes */}
                  {points.map((p, i) => (
                     <motion.circle 
                       key={i} cx={i * 30} cy={250 - p * 2.2} r="4" 
                       fill="#00d4ff" initial={false} animate={{ cy: 250 - p * 2.2 }} 
                     />
                  ))}

                  {/* Labels */}
                  <text x="0" y="248" fontSize="8" fill="#444">Newborn</text>
                  <text x="420" y="248" fontSize="8" fill="#444">Promoted</text>
               </svg>
               
               <div className="mt-8 grid grid-cols-2 gap-8 border-t border-white/5 pt-8">
                  <div className="space-y-4">
                     <div>
                        <div className="flex justify-between text-[10px] mb-2 font-mono uppercase tracking-widest text-[#00d4ff]">
                           <span>Infant Mortality Rate</span>
                           <span>{Math.round(infancyRate * 100)}%</span>
                        </div>
                        <input 
                           type="range" min="0" max="1" step="0.05" value={infancyRate} 
                           onChange={(e) => setInfancyRate(parseFloat(e.target.value))}
                           className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-alive"
                        />
                        <p className="text-[9px] text-gray-500 mt-2">Probability of death in Eden (Age 0)</p>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <div>
                        <div className="flex justify-between text-[10px] mb-2 font-mono uppercase tracking-widest text-[#aa44ff]">
                           <span>Tenuring Decay Rate</span>
                           <span>{Math.round(tenuringRate * 100)}%</span>
                        </div>
                        <input 
                           type="range" min="0" max="1" step="0.05" value={tenuringRate} 
                           onChange={(e) => setTenuringRate(parseFloat(e.target.value))}
                           className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                        <p className="text-[9px] text-gray-500 mt-2">Survivor death rate per GC cycle</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className="w-full xl:w-96 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">The Logic of Tiers</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
                  If we used one big heap for everything, a Full GC would be required every time. 
                  By separating objects by age, we can clean the "Infant" region (Eden) constantly with minimal cost.
               </p>
               <div className="p-4 bg-accent-alive/10 border border-accent-alive/20 rounded-xl">
                  <div className="text-[10px] font-bold text-accent-alive mb-1">Observation:</div>
                  <p className="text-[10px] text-gray-500 italic">In most enterprise apps, over 95% of objects are temporary buffers or local variables that die in less than 1 second.</p>
               </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-2">Sizing Your Regions</h4>
               <p className="text-[11px] text-gray-500 leading-relaxed">
                  If you have a <span className="text-white">steep curve</span> (objects die very fast), you want a massive Eden and tiny Survivor spaces. 
                  If objects linger, you need larger survivor spaces to avoid Premature Promotion.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}