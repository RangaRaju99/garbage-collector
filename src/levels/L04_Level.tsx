import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Step = { bytecode: string; description: string; region: string; detail: string; };

const steps: Step[] = [
  {
    bytecode: 'new #2 <Employee>',
    description: '① Bytecode: new instruction — triggers class check',
    region: 'Execution Engine',
    detail: 'JVM checks if Employee.class is already loaded. If not: ClassLoader chain activates (Bootstrap → Extension → Application). Bytecode verified. Class linked and initialized.',
  },
  {
    bytecode: 'dup',
    description: '② Duplicate object reference on operand stack',
    region: 'Operand Stack',
    detail: 'Duplicates the top of the operand stack. One copy will be used for invokespecial (constructor), one becomes the value stored in variable e.',
  },
  {
    bytecode: 'TLAB check',
    description: '③ Memory reservation: check TLAB bump pointer',
    region: 'TLAB (Eden)',
    detail: 'JVM checks thread-local TLAB. If remaining bytes ≥ object size: bump pointer advances by object size. No lock needed! If TLAB exhausted → request new TLAB from Eden.',
  },
  {
    bytecode: 'Object Header Init',
    description: '④ Mark Word + Klass Pointer written',
    region: 'Eden / TLAB',
    detail: 'Mark Word: [HashCode=0, GC Age=0, LockState=UNLOCKED (01)]. Klass Pointer → Employee class metadata in Metaspace. Size = 16 bytes header + instance fields.',
  },
  {
    bytecode: 'zeroing fields',
    description: '⑤ All instance fields zeroed (Java safety guarantee)',
    region: 'Eden',
    detail: 'int → 0, boolean → false, long → 0L, float → 0.0f, double → 0.0, Object references → null. This is why Java has no "uninitialized memory" reads.',
  },
  {
    bytecode: 'invokespecial #3\n<Employee.<init>:()V>',
    description: '⑥ Constructor executes: Employee.<init>()',
    region: 'Stack (new frame)',
    detail: 'New stack frame pushed for Employee constructor. super() called first (Object.<init>). Field assignments execute: name = "Alice", id = 101. Constructor frame popped.',
  },
  {
    bytecode: 'astore_1',
    description: '⑦ Reference stored in local variable e',
    region: 'Stack Frame',
    detail: 'Local variable slot 1 in current stack frame now holds the address of the new Employee object in Eden (e.g., 0x7f3a1b20). The reference beam from stack → Eden is now live.',
  },
];

export default function L04_Level() {
  const [activeStep, setActiveStep] = useState(0);
  const step = steps[activeStep];

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans">
      <div className="px-8 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] rounded text-[10px] font-mono text-[#00d4ff]">L04</span>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">BEGINNER TRACK</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Object Creation — Every Single Step</h1>
        <p className="text-gray-400 text-sm mb-1">
          What actually happens when you write <code className="text-[#00d4ff] bg-[rgba(0,212,255,0.1)] px-1 rounded">Employee e = new Employee();</code>
        </p>
        <p className="text-gray-500 text-xs">Step through each bytecode instruction and watch the JVM respond.</p>
      </div>

      {/* Code line at top */}
      <div className="px-8 pb-4">
        <div className="bg-[rgba(0,0,0,0.5)] border border-[rgba(0,212,255,0.2)] rounded-xl p-4 font-mono text-sm">
          <span className="text-gray-500">// Java source:</span>
          {'\n'}
          <span className="text-white">Employee </span>
          <span className="text-[#00d4ff]">e</span>
          <span className="text-white"> = </span>
          <span className="text-[#00ff88]">new</span>
          <span className="text-white"> Employee(</span>
          <span className="text-[#ffaa00]">"Alice"</span>
          <span className="text-white">);</span>
        </div>
      </div>

      {/* Step navigator */}
      <div className="px-8 pb-3">
        <div className="flex gap-1 flex-wrap">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveStep(i)}
              className={`w-8 h-8 rounded font-bold text-xs transition-all border ${
                i === activeStep
                  ? 'bg-[#00d4ff] border-[#00d4ff] text-black'
                  : i < activeStep
                  ? 'bg-[rgba(0,212,255,0.2)] border-[rgba(0,212,255,0.3)] text-[#00d4ff]'
                  : 'bg-transparent border-[rgba(255,255,255,0.1)] text-gray-500 hover:border-[rgba(255,255,255,0.3)]'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Active step panel */}
      <div className="px-8 pb-6 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid md:grid-cols-2 gap-4"
          >
            {/* Bytecode panel */}
            <div className="bg-[rgba(0,0,0,0.5)] border border-[rgba(0,212,255,0.15)] rounded-xl p-5">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00d4ff]" /> BYTECODE
              </div>
              <pre className="font-mono text-sm text-[#00d4ff] leading-relaxed whitespace-pre-wrap">{step.bytecode}</pre>
            </div>

            {/* Details panel */}
            <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl p-5">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">HAPPENING IN THE JVM</div>
              <h3 className="text-sm font-bold text-white mb-3">{step.description}</h3>
              <div className="inline-block px-2 py-0.5 bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.2)] rounded text-[10px] font-mono text-[#00ff88] mb-3">
                📍 {step.region}
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{step.detail}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
            disabled={activeStep === 0}
            className="px-5 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] text-gray-400 hover:text-white hover:border-[rgba(255,255,255,0.3)] disabled:opacity-30 transition text-sm font-bold"
          >
            ← Previous
          </button>
          <button
            onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
            disabled={activeStep === steps.length - 1}
            className="px-5 py-2 rounded-lg bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] text-[#00d4ff] hover:bg-[rgba(0,212,255,0.25)] disabled:opacity-30 transition text-sm font-bold"
          >
            Next Step →
          </button>
          {activeStep === steps.length - 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 px-4 text-[#00ff88] text-sm font-bold">
              ✅ Complete! Object lives in Eden.
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}