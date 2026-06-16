import { useState } from 'react';
import { motion } from 'framer-motion';

export default function OOMChapter() {
  const [errorType, setErrorType] = useState<string | null>(null);

  const errors = [
    { id: 'heap', title: 'Java heap space', desc: 'The most common. Total live objects exceed -Xmx.', cause: 'Memory Leak or Heap too small.', fix: 'Increase -Xmx or analyze heap dump.' },
    { id: 'gc', title: 'GC overhead limit exceeded', desc: 'JVM spends >98% of time in GC but recovers <2% of heap.', cause: 'App is crawling. Nearly full heap.', fix: 'Profile allocations or increase heap.' },
    { id: 'metaspace', title: 'Metaspace', desc: 'Class metadata exceeds native memory limit.', cause: 'Classloader leak or too many dynamic classes.', fix: 'Increase -XX:MaxMetaspaceSize.' },
    { id: 'thread', title: 'Unable to create native thread', desc: 'OS refused to spawn more threads.', cause: 'Thread leak or OS limit (ulimit) reached.', fix: 'Use Thread Pools or check OS limits.' },
    { id: 'direct', title: 'Direct buffer memory', desc: 'Off-heap allocations reached their limit.', cause: 'NIO buffer leak.', fix: 'Check -XX:MaxDirectMemorySize.' },
    { id: 'array', title: 'Requested array size exceeds VM limit', desc: 'Attempt to allocate an array larger than 2GB.', cause: 'Logic bug in buffer calculation.', fix: 'Use multiple smaller arrays or long-index structures.' },
    { id: 'compressed', title: 'Compressed class space', desc: 'Java 8+ subset of Metaspace for class pointers exhausted.', cause: 'Too many classes loaded with compressed pointers.', fix: 'Increase -XX:CompressedClassSpaceSize.' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans p-8">
      <div className="mb-8 shrink-0">
         <h1 className="text-3xl font-black mb-2">The OOM Gallery</h1>
         <p className="text-gray-400 text-sm max-w-2xl">There is more than one way to run out of memory. Each <span className="text-red-500 font-bold">OutOfMemoryError</span> has a specific cause and a targeted solution.</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-12">
         <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {errors.map(err => (
               <motion.button
                 key={err.id}
                 onClick={() => setErrorType(err.id)}
                 whileHover={{ x: 5 }}
                 className={`p-6 rounded-3xl border text-left transition-all relative overflow-hidden ${errorType === err.id ? 'bg-red-500/10 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
               >
                  <div className="text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Error Detail</div>
                  <div className={`text-sm font-black mb-2 ${errorType === err.id ? 'text-red-500 font-mono' : 'text-white'}`}>java.lang.OutOfMemoryError: <br/>{err.title}</div>
                  <p className="text-[10px] text-gray-400 leading-relaxed mb-4">{err.desc}</p>
                  
                  {errorType === err.id && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4 border-t border-red-500/20">
                       <div className="text-[9px] font-bold text-red-500 uppercase mb-1">Likely Cause:</div>
                       <p className="text-[10px] text-gray-300 mb-3">{err.cause}</p>
                       <div className="text-[9px] font-bold text-green-500 uppercase mb-1">Probable Fix:</div>
                       <p className="text-[10px] text-gray-300">{err.fix}</p>
                    </motion.div>
                  )}
               </motion.button>
            ))}
         </div>

         <div className="w-full lg:w-96 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">First Aid Checklist</h4>
               <ul className="space-y-4 text-[11px] text-gray-400">
                  <li className="flex gap-3">
                     <span className="text-red-500">1</span>
                     <span><span className="text-white">Collect Logs:</span> Always check the exact message after the `:`—it tells you which region failed.</span>
                  </li>
                  <li className="flex gap-3">
                     <span className="text-red-500">2</span>
                     <span><span className="text-white">GC Trends:</span> Look if Minor GC frequency was increasing before the crash.</span>
                  </li>
                  <li className="flex gap-3">
                     <span className="text-red-500">3</span>
                     <span><span className="text-white">Native Context:</span> Check if the OS OOMKiller was involved (check dmesg).</span>
                  </li>
               </ul>
            </div>

            <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-3xl">
               <h4 className="text-[10px] font-bold text-red-400 uppercase mb-2">Vital Startup Flag</h4>
               <code className="text-[10px] font-mono text-white bg-black/40 p-2 rounded block">
                  -XX:+HeapDumpOnOutOfMemoryError
               </code>
               <p className="text-[10px] text-gray-500 mt-2 italic">Without this flag, the only evidence of a crash vanishes as soon as the process restarts.</p>
            </div>
         </div>
      </div>
    </div>
  );
}