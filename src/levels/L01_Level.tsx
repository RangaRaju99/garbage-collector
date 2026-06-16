import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Disaster = { id: string; title: string; lang: string; code: string; explosion: string; color: string; };

const disasters: Disaster[] = [
  {
    id: 'leak', title: 'Memory Leak', color: '#ff6b00',
    lang: 'C',
    code: `void processRequest() {
  char* buffer = malloc(1024);
  // ❌ forgot free(buffer)!
  // Buffer leaks every request
  return;
}
// After 10,000 requests:
// 10MB leaked → OS kills process`,
    explosion: 'Heap fills up. Process killed by OS. No warning. No stack trace.',
  },
  {
    id: 'dangling', title: 'Dangling Pointer', color: '#ff4444',
    lang: 'C',
    code: `Employee* e = malloc(sizeof(Employee));
e->name = "Alice";
free(e);          // ✅ freed

// But then...
printf("%s", e->name); // ❌ USE AFTER FREE
// Reading deallocated memory
// → Undefined behavior, segfault, or
// reading another object's data`,
    explosion: 'Accessing freed memory: data corruption, segfault, or silent wrong values.',
  },
  {
    id: 'wild', title: 'Wild Pointer', color: '#ff00aa',
    lang: 'C',
    code: `int* ptr; // ❌ uninitialized!
// ptr contains random stack address

*ptr = 42; // Writing to random memory!
// Could overwrite:
// - Another variable
// - Function return address
// - OS kernel memory
// → Instant crash or silent corruption`,
    explosion: 'Writing to random memory. Anything could be overwritten.',
  },
  {
    id: 'doublefree', title: 'Double Free', color: '#aa00ff',
    lang: 'C',
    code: `Employee* e = malloc(sizeof(Employee));
free(e);   // ✅ first free — correct
// ...
free(e);   // ❌ second free!
// malloc's internal bookkeeping corrupted
// → heap corruption
// → next malloc returns wrong address
// → program crash or security exploit`,
    explosion: 'Freeing the same memory twice corrupts the heap allocator internals.',
  },
  {
    id: 'overflow', title: 'Buffer Overflow', color: '#ffaa00',
    lang: 'C',
    code: `char username[8];
// ❌ No bounds check!
strcpy(username, "Alexandra_Smith_III");
// "username" buffer: 8 bytes
// Input string: 20 bytes
// Overflow overwrites:
//  - Adjacent stack variables
//  - Saved return address → exploitable!
// → Security vulnerability (CVE-level)`,
    explosion: 'Buffer overflow: adjacent memory corrupted. Return address hijacked.',
  },
];

export default function L01_Level() {
  const [active, setActive] = useState<string | null>(null);
  const [showJava, setShowJava] = useState(false);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans">
      {/* Header */}
      <div className="px-8 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] rounded text-[10px] font-mono text-[#00d4ff]">L01</span>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">BEGINNER TRACK</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Why Does Java Need Garbage Collection?</h1>
        <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
          Before Java, every developer manually managed memory. Here's what happened — and why the JVM GC was invented to eliminate all of it.
        </p>
      </div>

      {/* C Disasters Grid */}
      <div className="px-8 pb-6">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
          5 C/C++ Memory Disasters — Click Each to Explore
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {disasters.map((d) => (
            <motion.button
              key={d.id}
              onClick={() => setActive(active === d.id ? null : d.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`text-left p-4 rounded-xl border transition-all ${
                active === d.id
                  ? 'border-[rgba(255,255,255,0.3)] bg-[rgba(255,255,255,0.08)]'
                  : 'border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)]'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color, boxShadow: `0 0 8px ${d.color}` }} />
                <span className="font-bold text-sm text-white">{d.title}</span>
                <span className="ml-auto text-[9px] font-mono text-gray-600 bg-[rgba(255,255,255,0.05)] px-1.5 py-0.5 rounded">C/C++</span>
              </div>
              <pre className="text-[9px] font-mono text-gray-400 leading-relaxed whitespace-pre-wrap overflow-hidden max-h-28">
                {d.code}
              </pre>
              <AnimatePresence>
                {active === d.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.08)]"
                  >
                    <div className="flex items-start gap-2 p-2 rounded bg-[rgba(255,0,0,0.08)] border border-[rgba(255,0,0,0.2)]">
                      <span className="text-red-400 text-xs">💥</span>
                      <p className="text-[11px] text-red-300 leading-relaxed">{d.explosion}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Java's Answer */}
      <div className="px-8 pb-8">
        <div className="border border-[rgba(0,212,255,0.2)] bg-[rgba(0,212,255,0.04)] rounded-xl p-6">
          <h2 className="text-lg font-bold text-[#00d4ff] mb-3 flex items-center gap-2">
            🤖 Java's Answer: Automatic Garbage Collection
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <pre className="text-[11px] font-mono text-gray-300 bg-[rgba(0,0,0,0.4)] p-4 rounded-lg leading-relaxed">
{`// Java — no malloc, no free
Employee e = new Employee("Alice");
// JVM allocates automatically in Heap

e = null; // You signal: "not needed"

// GC robot runs → detects unreachable
// → collects e → memory reclaimed
// ZERO manual free() required.
// ZERO dangling pointers.
// ZERO double-frees possible.`}
              </pre>
            </div>
            <div className="space-y-3">
              {[
                { icon: '✅', text: 'No malloc() / free() — JVM handles all allocation' },
                { icon: '✅', text: 'No dangling pointers — GC only removes truly unreachable objects' },
                { icon: '✅', text: 'No double-free — GC tracks object lifecycle internally' },
                { icon: '✅', text: 'No buffer overflow — Java checks array bounds at runtime' },
                { icon: '✅', text: 'No wild pointers — all references are type-safe' },
                { icon: '⚠️', text: 'Tradeoff: GC pauses (milliseconds to seconds depending on collector)' },
                { icon: '⚠️', text: 'Tradeoff: Memory overhead (~2-5× live data for efficient GC)' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span>{item.icon}</span>
                  <span className="text-gray-300">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setShowJava(!showJava)}
            className="mt-4 px-5 py-2 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] rounded-lg text-sm text-[#00d4ff] font-bold transition"
          >
            {showJava ? '▼' : '▶'} See GC in action (Object lifecycle summary)
          </motion.button>
          <AnimatePresence>
            {showJava && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
                  {['new Employee()', '→ TLAB', '→ Eden', '→ Survivor (age++)', '→ Old Gen', '→ GC Collects', '→ Memory reclaimed ✅'].map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.15 }}
                        className="px-2 py-1 rounded bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)] text-[#00d4ff]"
                      >
                        {step}
                      </motion.div>
                      {i < 6 && <span className="text-gray-600">→</span>}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}