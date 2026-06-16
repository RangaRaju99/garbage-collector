import { motion } from 'framer-motion';

const history = [
  { year: '1995', ver: 'Java 1.0', tech: 'Serial GC', desc: 'Single-threaded, Stop-The-World. Simple and effective for tiny heaps.', focus: 'Accuracy over Speed' },
  { year: '2004', ver: 'Java 5', tech: 'Parallel GC', desc: 'Multi-threaded collector for throughput. Focused on server-side performance.', focus: 'High Throughput' },
  { year: '2006', ver: 'Java 6u14', tech: 'G1 GC', desc: 'Region-based, avoids Full GC. Targets predictable pause times.', focus: 'Pause Predictability' },
  { year: '2014', ver: 'Java 8', tech: 'CMS Deprecated', desc: 'The rise of G1 as the default for most server applications.', focus: 'Efficiency' },
  { year: '2018', ver: 'Java 11', tech: 'ZGC & Epsilon', desc: 'Sub-ms pauses regardless of heap size. No-op collector for clouds.', focus: 'Ultra-Low Latency' },
  { year: '2023', ver: 'Java 21+', tech: 'Generational ZGC', desc: 'The holy grail: Sub-ms pauses with high throughput efficiency.', focus: 'The Future' },
];

export default function CollectorEvolutionChapter() {
  const active = history.length - 1;

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans p-8">
      <div className="mb-12 shrink-0">
         <h1 className="text-4xl font-black mb-3">Collector Evolution</h1>
         <p className="text-gray-400 text-sm max-w-2xl">From milliseconds to microseconds. Watch the 30-year journey of the JVM's quest for the <span className="text-white font-bold">Invisible Garbage Collector</span>.</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-16">
         <div className="flex-1 relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2" />

            <div className="space-y-12 relative z-10">
               {history.map((h, i) => (
                  <motion.div 
                    key={h.year}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className={`flex items-center gap-8 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                  >
                     <div className={`flex-1 ${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
                        <div className="text-sm font-black text-white">{h.ver}</div>
                        <div className="text-[10px] text-gray-500 font-mono mb-2">{h.year}</div>
                        <div className="text-lg font-black text-accent-alive mb-1">{h.tech}</div>
                        <p className="text-xs text-gray-400 leading-relaxed max-w-xs inline-block">{h.desc}</p>
                     </div>

                     <div className="w-12 h-12 rounded-full bg-black border-4 border-white/10 flex items-center justify-center shrink-0">
                        <div className={`w-3 h-3 rounded-full ${i <= active ? 'bg-accent-alive shadow-[0_0_10px_rgba(0,212,255,0.8)]' : 'bg-gray-800'}`} />
                     </div>

                     <div className="flex-1">
                        <div className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl inline-block">
                           <div className="text-[8px] font-bold text-gray-500 uppercase mb-1">Focus</div>
                           <div className="text-[10px] text-white font-bold">{h.focus}</div>
                        </div>
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>

         <div className="w-full lg:w-96 space-y-4 pt-12">
            <div className="p-8 rounded-[40px] bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">The Trade-off Triangle</h4>
               <div className="relative aspect-square w-full">
                  <div className="absolute inset-0 border-2 border-dashed border-white/10 rounded-full" />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 p-2 bg-black border border-white/10 rounded text-[10px] font-bold text-[#00ff88]">THROUGHPUT</div>
                  <div className="absolute bottom-4 left-0 p-2 bg-black border border-white/10 rounded text-[10px] font-bold text-[#ffaa00]">LATENCY</div>
                  <div className="absolute bottom-4 right-0 p-2 bg-black border border-white/10 rounded text-[10px] font-bold text-[#00d4ff]">FOOTPRINT</div>
                  
                  <div className="absolute inset-16 border-2 border-accent-alive/30 rotate-45" />
               </div>
               <p className="mt-8 text-[11px] text-gray-500 leading-relaxed text-center italic">
                  You can typically only optimize for two at once. Generational ZGC is the first to truly bridge the gap for all three.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}