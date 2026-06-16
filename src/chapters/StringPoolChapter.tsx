import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Demo = 'literal' | 'newString' | 'intern';

export default function StringPoolChapter() {
  const [demo, setDemo] = useState<Demo>('literal');
  const [step, setStep] = useState(0);

  const demos = {
    literal: {
      title: 'String Literals → Pool',
      steps: [
        { code: 'String s1 = "hello";', desc: 'Pool checked. "hello" not found → created in String Pool.', pool: ['hello'], heap: [], refs: { s1: 'pool:hello' } },
        { code: 'String s2 = "hello";', desc: 'Pool checked. "hello" FOUND → s2 points to SAME object. No new allocation.', pool: ['hello'], heap: [], refs: { s1: 'pool:hello', s2: 'pool:hello' } },
        { code: 's1 == s2', desc: 'TRUE — both reference the SAME object in the pool. Same address.', pool: ['hello'], heap: [], refs: { s1: 'pool:hello', s2: 'pool:hello' }, result: '→ TRUE ✅' },
      ]
    },
    newString: {
      title: 'new String() → Heap (NOT pooled)',
      steps: [
        { code: 'String s3 = new String("hello");', desc: 'new String() always creates a new object in Eden/Heap — NOT in pool. Even if "hello" exists in pool.', pool: ['hello'], heap: ['hello#2'], refs: { s1: 'pool:hello', s3: 'heap:hello#2' } },
        { code: 's1 == s3', desc: 'FALSE — different objects. s1 is in pool, s3 is a separate heap object.', pool: ['hello'], heap: ['hello#2'], refs: { s1: 'pool:hello', s3: 'heap:hello#2' }, result: '→ FALSE ❌' },
        { code: 's1.equals(s3)', desc: 'TRUE — same content "hello", just different objects. Always use .equals() for string comparison!', pool: ['hello'], heap: ['hello#2'], refs: { s1: 'pool:hello', s3: 'heap:hello#2' }, result: '→ TRUE ✅' },
      ]
    },
    intern: {
      title: 'intern() → Force into Pool',
      steps: [
        { code: 'String s4 = new String("world");', desc: 'New heap object "world". Not in pool.', pool: ['hello'], heap: ['world'], refs: { s4: 'heap:world' } },
        { code: 'String s5 = s4.intern();', desc: 'intern() checks pool. "world" not found → adds to pool → returns pool reference. s4 still on heap.', pool: ['hello', 'world'], heap: ['world'], refs: { s4: 'heap:world', s5: 'pool:world' } },
        { code: 's4 == s5', desc: 'FALSE — s4 is still the heap object, s5 is the interned pool reference.', pool: ['hello', 'world'], heap: ['world'], refs: { s4: 'heap:world', s5: 'pool:world' }, result: '→ FALSE (different refs)' },
      ]
    }
  };

  const current = demos[demo];
  const currentStep = current.steps[Math.min(step, current.steps.length - 1)];

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans p-6">
      <h1 className="text-2xl font-black mb-1">String Pool Internals</h1>
      <p className="text-gray-400 text-sm mb-4">The String Pool avoids duplicate String objects. Understanding it prevents == vs .equals() bugs.</p>

      <div className="flex gap-2 mb-4">
        {(Object.keys(demos) as Demo[]).map(d => (
          <button key={d} onClick={() => { setDemo(d); setStep(0); }}
            className={`px-3 py-1.5 rounded text-xs font-bold border transition ${demo === d ? 'bg-[rgba(0,212,255,0.15)] border-[rgba(0,212,255,0.4)] text-[#00d4ff]' : 'border-[rgba(255,255,255,0.06)] text-gray-500 hover:text-white'}`}>
            {demos[d].title}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* String Pool */}
        <div className="p-4 rounded-xl border border-[rgba(26,26,58,1)] bg-[#1a1a3a]">
          <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3">🏊 STRING POOL (Heap, Java 7+)</div>
          <div className="space-y-2">
            {currentStep.pool.map(s => (
              <div key={s} className="px-3 py-2 rounded bg-[rgba(100,100,255,0.1)] border border-[rgba(100,100,255,0.3)] font-mono text-sm text-blue-300">
                "{s}"
              </div>
            ))}
          </div>
        </div>
        {/* Heap */}
        <div className="p-4 rounded-xl border border-[rgba(26,58,26,1)] bg-[#1a3a1a]">
          <div className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-3">📦 HEAP (Eden / Old Gen)</div>
          <div className="space-y-2">
            {currentStep.heap.length === 0 && <div className="text-xs text-gray-600 italic">No extra heap String objects</div>}
            {currentStep.heap.map(s => (
              <div key={s} className="px-3 py-2 rounded bg-[rgba(0,255,136,0.08)] border border-[rgba(0,255,136,0.2)] font-mono text-sm text-green-300">
                "{s.split('#')[0]}" (new object)
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Code + description */}
      <AnimatePresence mode="wait">
        <motion.div key={`${demo}-${step}`} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-xl border border-[rgba(0,212,255,0.15)] bg-[rgba(0,212,255,0.04)]">
          <pre className="font-mono text-sm text-[#00d4ff] mb-2">{currentStep.code}</pre>
          <p className="text-sm text-gray-300">{currentStep.desc}</p>
          {currentStep.result && <div className="mt-2 font-mono font-bold text-lg text-[#00ff88]">{currentStep.result}</div>}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3 mb-4">
        {current.steps.map((_, i) => (
          <button key={i} onClick={() => setStep(i)}
            className={`w-7 h-7 rounded text-xs font-bold border transition ${i === step ? 'bg-[#00d4ff] border-[#00d4ff] text-black' : 'border-[rgba(255,255,255,0.1)] text-gray-500'}`}>
            {i + 1}
          </button>
        ))}
        <button onClick={() => setStep(s => Math.min(current.steps.length - 1, s + 1))} disabled={step >= current.steps.length - 1}
          className="px-4 py-1 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] text-[#00d4ff] rounded text-xs font-bold disabled:opacity-30 transition">
          Next →
        </button>
      </div>

      <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] text-[11px] text-gray-400">
        <span className="text-yellow-400 font-bold">⚠ Rule:</span> Always use <code className="text-[#00d4ff]">.equals()</code> for String content comparison, not <code className="text-[#00d4ff]">==</code>. The == operator compares object references, not content.
      </div>
    </div>
  );
}