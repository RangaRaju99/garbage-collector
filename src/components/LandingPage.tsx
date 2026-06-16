import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, FlaskConical, Bug, Film, Compass,
  ArrowRight, Cpu, Zap, Shield, ChevronRight
} from 'lucide-react';
import { useJVMStore } from '../store/jvmStore';

const features = [
  {
    icon: Film,
    title: 'Cinematic Movie Mode',
    desc: '12 narrated scenes — object birth, GC robots, island collapse, PermGen explosion. Lean back and learn.',
    tag: 'Interactive',
  },
  {
    icon: Compass,
    title: 'JVM City Explorer',
    desc: 'Free-roam Eden, Old Gen, Metaspace, Stack towers, and String Pool. Click any element to inspect it.',
    tag: 'Explore',
  },
  {
    icon: FlaskConical,
    title: 'Code Sandbox',
    desc: 'Write Java → watch allocations, GC events, and promotions happen live in the 3D city.',
    tag: 'Hands-On',
  },
  {
    icon: Bug,
    title: 'Detective Mode',
    desc: '5 real-world memory leak scenarios. Diagnose the root cause, then see the production-ready fix.',
    tag: 'Diagnostic',
  },
  {
    icon: BookOpen,
    title: 'Interview Preparation',
    desc: '25 animated JVM interview Q&As with visual explanations. Answer with confidence.',
    tag: 'Learning',
  },
  {
    icon: Zap,
    title: 'GC Algorithm Lab',
    desc: 'Compare Serial, G1, ZGC, Shenandoah side-by-side. See pause times, throughput, and heap layouts.',
    tag: 'Analysis',
  },
];

const stats = [
  { val: '42', label: 'Learning Modules' },
  { val: '7', label: 'GC Algorithms' },
  { val: '12', label: 'Cinematic Scenes' },
  { val: '5', label: 'Leak Scenarios' },
];

const gcAlgorithms = ['Serial GC', 'Parallel GC', 'CMS', 'G1 GC', 'ZGC', 'Shenandoah', 'Epsilon'];

export default function LandingPage() {
  const setStarted = useJVMStore(state => state.setStarted);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col overflow-y-auto font-sans">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
            <Cpu size={13} className="text-blue-400" />
          </div>
          <span className="text-[14px] font-bold tracking-tight text-white">Inside the JVM</span>
        </div>

        <div className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1 rounded-lg border border-white/6 text-[11px]">
          {['Curriculum', 'GC Algorithms', 'Detective Mode', 'Sandbox'].map(item => (
            <button
              key={item}
              className="px-3 py-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-all font-medium"
            >
              {item}
            </button>
          ))}
        </div>

        <button
          onClick={() => setStarted(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-[12px] font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/30"
        >
          Launch App <ArrowRight size={13} />
        </button>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-20 pb-16 relative">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl relative"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[11px] text-blue-400 font-semibold mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Simulation Engine Active — WebGL · 60 FPS
          </div>

          <h1 className="text-5xl md:text-6xl font-black leading-[1.05] tracking-tight mb-6">
            <span className="text-white">See Garbage Collection.</span>
            <br />
            <span className="text-blue-400">Don't Just Read About It.</span>
          </h1>

          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Walk inside a living JVM. Watch objects be born in Eden, age through Survivor spaces,
            get promoted to Old Gen — then be collected by GC robots. Understand JVM internals in 30 minutes
            better than 300 pages of documentation.
          </p>

          <div className="flex items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStarted(true)}
              className="flex items-center gap-2.5 px-8 py-4 bg-blue-600 text-white rounded-xl text-[14px] font-bold hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/40"
            >
              <span>▶ Enter the JVM</span>
              <ArrowRight size={16} />
            </motion.button>

            <button className="flex items-center gap-2 px-6 py-4 bg-white/5 border border-white/10 text-zinc-300 rounded-xl text-[14px] font-bold hover:bg-white/8 hover:border-white/15 transition-all">
              Watch 3-min Demo
            </button>
          </div>
        </motion.div>

        {/* GC Algorithm Tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-10 max-w-2xl">
          {gcAlgorithms.map((algo) => (
            <span
              key={algo}
              className="px-3 py-1 bg-white/[0.03] border border-white/8 rounded-full text-[10px] font-bold text-zinc-500 uppercase tracking-wider hover:text-zinc-300 hover:border-white/15 transition-all cursor-pointer"
            >
              {algo}
            </span>
          ))}
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-white/5 bg-white/[0.015] py-8 px-8">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(({ val, label }) => (
            <div key={label} className="flex flex-col gap-1">
              <span className="text-3xl font-black text-blue-400 tabular-nums">{val}</span>
              <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-widest">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-8 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-black text-white mb-3">
              Everything You Need to Master JVM Internals
            </h2>
            <p className="text-zinc-500 text-sm max-w-lg mx-auto">
              From zero JVM knowledge to production-level debugging skills — in a single interactive session.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              const isHovered = hoveredFeature === i;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * i, duration: 0.5 }}
                  onHoverStart={() => setHoveredFeature(i)}
                  onHoverEnd={() => setHoveredFeature(null)}
                  className={`p-5 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isHovered
                      ? 'bg-blue-500/5 border-blue-500/20'
                      : 'bg-white/[0.02] border-white/6 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2.5 rounded-lg border transition-all ${
                      isHovered ? 'bg-blue-500/15 border-blue-500/30' : 'bg-white/5 border-white/8'
                    }`}>
                      <Icon size={16} className={isHovered ? 'text-blue-400' : 'text-zinc-400'} />
                    </div>
                    <span className="text-[9px] font-bold text-zinc-600 bg-white/5 border border-white/8 px-2 py-0.5 rounded-full uppercase tracking-widest">
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-[13px] mb-2 leading-snug">{f.title}</h3>
                  <p className="text-[12px] text-zinc-500 leading-relaxed">{f.desc}</p>
                  {isHovered && (
                    <div className="flex items-center gap-1 mt-4 text-blue-400 text-[11px] font-bold">
                      <span>Explore</span>
                      <ChevronRight size={12} />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What you'll learn */}
      <section className="px-8 pb-16">
        <div className="max-w-5xl mx-auto bg-white/[0.02] border border-white/6 rounded-2xl p-8">
          <div className="flex items-start gap-6">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl shrink-0">
              <Shield size={20} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white mb-3">Production-Grade Education</h2>
              <p className="text-zinc-400 text-sm mb-6 leading-relaxed max-w-2xl">
                This is not a tutorial. This is a living, breathing JVM you can walk inside. Every concept
                is visualized in real-time 3D — from TLAB allocation to Remembered Sets to Safepoints.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  'Object Lifecycle', 'GC Root Analysis', 'Stop-The-World Events',
                  'Memory Segmentation', 'JFR Event Streams', 'Metaspace vs PermGen',
                  'Thread-Local Allocation', 'Finalization Pipeline', 'Card Table & Write Barriers',
                ].map(topic => (
                  <div key={topic} className="flex items-center gap-2 text-[11px] text-zinc-400">
                    <div className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                    {topic}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-t border-white/5 py-16 px-8 text-center bg-white/[0.01]">
        <h2 className="text-2xl font-black text-white mb-3">Ready to walk inside the JVM?</h2>
        <p className="text-zinc-500 text-sm mb-8 max-w-md mx-auto">
          Works entirely in your browser. No installation, no signup, no backend required.
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setStarted(true)}
          className="inline-flex items-center gap-3 px-10 py-4 bg-blue-600 text-white rounded-xl text-[15px] font-black hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/30"
        >
          Start Free — No Signup Required
          <ArrowRight size={16} />
        </motion.button>
      </section>
    </div>
  );
}
