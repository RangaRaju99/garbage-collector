import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReferenceQueueChapter() {
  const [queue, setQueue] = useState<{id: number, type: string}[]>([]);
  const [deadCount, setDeadCount] = useState(0);

  const killObject = () => {
    const id = Date.now();
    setQueue(prev => [{ id, type: Math.random() > 0.5 ? 'Weak' : 'Phantom' }, ...prev]);
    setDeadCount(d => d + 1);
  };

  const process = () => {
    setQueue(prev => prev.slice(0, -1));
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans p-8">
      <div className="mb-8">
         <h1 className="text-3xl font-black mb-2">Reference Queues</h1>
         <p className="text-gray-400 text-sm max-w-2xl">The "Post-Office" of the JVM. When a Weak or Phantom reference is cleared, its <span className="text-accent-alive font-bold">skeleton</span> is put into a queue so your code can perform native cleanup.</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-12">
         <div className="flex-1 flex flex-col items-center gap-8">
            <div className="flex gap-4">
               <button onClick={killObject} className="px-8 py-3 bg-red-600/20 border border-red-600/50 text-red-500 font-bold text-xs rounded-xl hover:bg-red-600/30 transition">KILL OBJECT (REF DISCONNECTED)</button>
               <button onClick={process} disabled={queue.length === 0} className="px-8 py-3 bg-accent-alive text-black font-black text-xs rounded-xl hover:scale-105 transition disabled:opacity-30">POLL QUEUE (CLEANUP)</button>
            </div>

            <div className="w-full max-w-lg p-8 bg-black/40 rounded-[40px] border border-white/5 relative min-h-[300px]">
               <div className="text-center mb-8">
                  <div className="text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-1">Queue Persistence</div>
                  <div className="text-4xl font-black text-white">{queue.length}</div>
               </div>

               <div className="flex flex-wrap-reverse gap-3 justify-center">
                  <AnimatePresence>
                     {queue.map(ref => (
                        <motion.div
                          key={ref.id}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ x: 50, opacity: 0 }}
                          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2"
                        >
                           <div className={`w-1.5 h-1.5 rounded-full ${ref.type === 'Weak' ? 'bg-green-400' : 'bg-purple-400'}`} />
                           <span className="text-[10px] font-mono text-gray-400">{ref.type}Ref@001</span>
                        </motion.div>
                     ))}
                  </AnimatePresence>
               </div>

               <div className="absolute -bottom-4 right-8 bg-black border border-white/10 px-3 py-1 rounded text-[10px] text-gray-500 italic">
                  Total Dead Objects: {deadCount}
               </div>
            </div>
         </div>

         <div className="w-full lg:w-96 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Why use a Queue?</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
                  Normal garbage collection is <span className="text-white">silent</span>. You don't know when it happens.
                  <br/><br/>
                  By passing a <code className="text-white">ReferenceQueue</code> to a WeakReference constructor, the JVM will <span className="text-white">enqueue</span> the reference object itself once the referent is cleared.
               </p>
            </div>

            <div className="p-6 rounded-3xl bg-green-500/5 border border-green-500/20">
               <h4 className="text-[10px] font-bold text-green-400 uppercase mb-2">Native Cleanup</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed italic">
                  "I just saw a PhantomReference in the queue for a DirectBuffer. Now I know for sure I can safely free the associated OS memory!"
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}