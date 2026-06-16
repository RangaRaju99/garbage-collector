import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, FlaskConical, Bug, Film, Compass } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { Stars, OrbitControls, Environment } from '@react-three/drei';
import { useJVMStore } from '../store/jvmStore';

// Landing particle system (simplified Three.js scene just for hero BG)
function HeroCityBackground() {
  return (
    <>
      <Stars radius={80} depth={30} count={4000} factor={3} fade speed={0.5} />
      <Environment preset="night" />
      <ambientLight intensity={0.2} />
      <pointLight position={[-10, 10, 5]} color="#00d4ff" intensity={3} distance={40} />
      <pointLight position={[10, 5, -5]} color="#00ff88" intensity={2} distance={30} />
      {/* Floating city grid */}
      <gridHelper args={[50, 30, '#001133', '#001133']} position={[0, -3, 0]} />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} />
    </>
  );
}

const features = [
  { icon: <Film size={20} />, title: '12-Scene Movie Mode', desc: 'Cinematic narrated walkthrough — object birth, GC robots, island collapse, PermGen explosion.' },
  { icon: <Compass size={20} />, title: 'JVM City Explorer', desc: 'Free-roam Young Gen, Old Gen, Metaspace, Stack towers, String Pool. Click any element.' },
  { icon: <FlaskConical size={20} />, title: 'Code Sandbox', desc: 'Write Java → watch allocations, GC, promotions happen live in the 3D city.' },
  { icon: <Bug size={20} />, title: 'Detective Mode', desc: '5 real-world memory leak scenarios. Diagnose, investigate, then see the fix.' },
  { icon: <BookOpen size={20} />, title: 'Interview Ready', desc: '25 animated JVM interview Q&As. Answer confidently after one session.' },
];

export default function LandingPage() {
  const setStarted = useJVMStore(state => state.setStarted);
  const [hovered, setHovered] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col overflow-x-hidden relative">
      {/* Hero 3D Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
        <Canvas camera={{ position: [0, 5, 20], fov: 60 }}>
          <HeroCityBackground />
        </Canvas>
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-[rgba(0,212,255,0.1)]">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00d4ff] animate-pulse shadow-[0_0_10px_#00d4ff]" />
          <span className="font-bold text-[#00d4ff] text-sm tracking-wide">Inside the JVM</span>
        </div>
        <div className="flex items-center gap-6 text-xs text-gray-400">
          <span className="hover:text-white cursor-pointer transition">Curriculum</span>
          <span className="hover:text-white cursor-pointer transition">GC Algorithms</span>
          <span className="hover:text-white cursor-pointer transition">Detective Mode</span>
          <button
            onClick={() => setStarted(true)}
            className="px-4 py-1.5 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.4)] rounded text-[#00d4ff] hover:bg-[rgba(0,212,255,0.25)] transition font-bold"
          >
            Launch App
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)] rounded-full text-xs text-[#00d4ff] font-mono mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Simulation Engine Active · 60 FPS · WebGL
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 tracking-tight">
            <span className="text-white">See Garbage Collection.</span>
            <br />
            <span style={{ background: 'linear-gradient(135deg, #00d4ff, #00ff88)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Don't Just Read About It.
            </span>
          </h1>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Walk inside a living JVM city. Watch objects be born in Eden, age through Survivor spaces,
            get promoted to Old Gen — then be swept away by GC robots. Understand JVM internals in 30 minutes
            better than 300 pages of documentation.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <motion.button
              onHoverStart={() => setHovered(true)}
              onHoverEnd={() => setHovered(false)}
              onClick={() => setStarted(true)}
              className="relative px-8 py-4 text-base font-bold rounded-xl overflow-hidden transition-all"
              style={{
                background: 'linear-gradient(135deg, #00d4ff22, #00ff8822)',
                border: '1px solid rgba(0,212,255,0.5)',
                boxShadow: hovered ? '0 0 40px rgba(0,212,255,0.4), 0 0 80px rgba(0,212,255,0.2)' : '0 0 20px rgba(0,212,255,0.2)'
              }}
            >
              <span className="relative z-10 text-white flex items-center gap-2">
                ▶ Enter the JVM City
              </span>
            </motion.button>

            <button className="px-8 py-4 text-base font-bold rounded-xl border border-[rgba(255,255,255,0.1)] text-gray-300 hover:text-white hover:border-[rgba(255,255,255,0.3)] transition">
              Watch 3-min Demo
            </button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-8 pb-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-white mb-10">
            Everything You Need to Master JVM Internals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                className="p-5 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] hover:border-[rgba(0,212,255,0.2)] transition-all group"
              >
                <div className="text-[#00d4ff] mb-3 group-hover:scale-110 transition-transform inline-block">
                  {f.icon}
                </div>
                <h3 className="font-bold text-white mb-1.5 text-sm">{f.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key stats */}
      <section className="relative z-10 border-t border-[rgba(255,255,255,0.05)] py-12 px-8">
        <div className="max-w-4xl mx-auto grid grid-cols-4 gap-8 text-center">
          {[
            { val: '34', label: 'Learning Levels' },
            { val: '12', label: 'Cinematic Scenes' },
            { val: '6', label: 'GC Algorithms' },
            { val: '25', label: 'Interview Q&As' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-3xl font-black text-[#00d4ff] mb-1">{s.val}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative z-10 text-center py-16 px-8">
        <h2 className="text-3xl font-black text-white mb-4">Ready to walk inside the JVM?</h2>
        <button
          onClick={() => setStarted(true)}
          className="px-10 py-4 text-lg font-black rounded-xl text-[#0a0a0f] transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #00d4ff, #00ff88)', boxShadow: '0 0 30px rgba(0,212,255,0.4)' }}
        >
          Start Free — No Signup Required
        </button>
        <p className="text-xs text-gray-500 mt-4">Works entirely in your browser. No installation. No backend.</p>
      </section>
    </div>
  );
}
