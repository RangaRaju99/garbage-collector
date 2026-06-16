import { useState } from 'react';
import { motion } from 'framer-motion';

export default function WeakHashMapChapter() {
  const [step, setStep] = useState(0);

  const steps = [
    { title: 'Normal Entry', desc: 'Key A has a strong reference. The Entry is healthy.', state: 'HEALTHY' },
    { title: 'Key Nullified', desc: 'The strong reference to Key A is removed. Only the WeakReference in the Map remains.', state: 'WEAK' },
    { title: 'GC Cycle', desc: 'GC runs and clears the WeakReference because no strong refs exist.', state: 'CLEARED' },
    { title: 'Self-Cleanup', desc: 'On the next map access, the Map removes the entry from its internal table.', state: 'EXPUNGED' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans p-8">
      <div className="mb-8 shrink-0">
         <h1 className="text-3xl font-black mb-2">WeakHashMap Internals</h1>
         <p className="text-gray-400 text-sm max-w-2xl">The memory-safe cache. Learn how `WeakHashMap` uses a <span className="text-white font-bold">ReferenceQueue</span> to automatically purge entries after their keys are collected.</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-12">
         <div className="flex-1 space-y-12 flex flex-col items-center">
            <div className="flex gap-2">
               {steps.map((_, i) => (
                  <button key={i} onClick={() => setStep(i)} className={`w-12 h-1.5 rounded-full transition-all ${i === step ? 'bg-accent-alive shadow-[0_0_10px_rgba(0,212,255,0.5)]' : 'bg-white/10'}`} />
               ))}
            </div>

            <div className="w-full max-w-lg bg-white/5 border border-white/10 rounded-[40px] p-10 flex flex-col items-center shadow-2xl">
               <div className="flex items-center gap-12 mb-10 h-32">
                  {/* The Key */}
                  <div className="text-center">
                     <div className="text-[10px] font-bold text-gray-600 uppercase mb-3">Key Object</div>
                     <motion.div
                       animate={{ 
                         opacity: step >= 2 ? 0.1 : 1,
                         scale: step >= 2 ? 0.8 : 1,
                         backgroundColor: step === 1 ? '#ffaa0022' : '#00d4ff22',
                         borderColor: step === 1 ? '#ffaa00' : '#00d4ff'
                       }}
                       className="w-16 h-16 border-2 rounded-2xl flex items-center justify-center text-2xl"
                     >
                       🔑
                     </motion.div>
                  </div>

                  <div className="text-2xl text-gray-800">↔</div>

                  {/* The Entry */}
                  <div className="text-center">
                     <div className="text-[10px] font-bold text-gray-600 uppercase mb-3">Map Entry</div>
                     <motion.div
                       animate={{ 
                         opacity: step === 3 ? 0 : 1,
                         y: step === 3 ? -20 : 0,
                         backgroundColor: step >= 2 ? '#ff444422' : '#ffffff05'
                       }}
                       className={`w-32 h-16 border-2 rounded-2xl flex items-center justify-center font-mono text-[10px] ${step >= 2 ? 'border-red-500 text-red-500' : 'border-white/10 text-gray-400'}`}
                     >
                       {step === 3 ? 'REMOVED' : 'Value_0xF2A'}
                     </motion.div>
                  </div>
               </div>

               <div className="text-center max-w-sm">
                  <h3 className="text-lg font-black text-white mb-2">{steps[step].title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed italic">"{steps[step].desc}"</p>
               </div>
            </div>

            <button 
              onClick={() => setStep(s => (s + 1) % 4)}
              className="px-10 py-3 bg-white/10 border border-white/10 text-white font-bold text-xs rounded-xl hover:bg-white/20 transition uppercase tracking-widest"
            >
              Simulate Next Action
            </button>
         </div>

         <div className="w-full lg:w-96 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">How it cleans itself</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
                  `WeakHashMap` doesn't have a background thread. It cleans its table <span className="text-white">on every call</span> to `get()`, `put()`, or `size()`.
                  <br/><br/>
                  It polls an internal <span className="text-accent-alive font-bold">ReferenceQueue</span>. If it finds a cleared key reference, it knows the associated value is now garbage and removes it.
               </p>
            </div>

            <div className="p-6 bg-yellow-500/5 border border-yellow-500/20 rounded-3xl">
               <h4 className="text-[10px] font-bold text-yellow-400 uppercase mb-2">Memory Leak Risk</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed italic">
                 Don't use `WeakHashMap` if your values have a strong reference back to the keys! This creates a circular dependency that prevents the key from ever being cleared.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}