import { useState } from 'react';
import SceneCanvas from './scenes/CityScene';
import Dashboard from './components/Dashboard';
import Timeline from './components/Timeline';
import JVMFlags from './components/JVMFlags';
import CodeSandbox from './components/CodeSandbox';
import LandingPage from './components/LandingPage';
import OOMErrorOverlay from './components/OOMErrorOverlay';
import CommandPalette from './components/CommandPalette';
import LevelRenderer from './components/LevelRenderer';
import NarratorOverlay from './components/NarratorOverlay';
import CurriculumSidebar from './components/CurriculumSidebar';
import PlatformHeader from './components/PlatformHeader';
import JFREventStream from './components/JFREventStream';
import GCLogParser from './components/GCLogParser';

import DetectiveMode from './modes/DetectiveMode';
import MovieMode from './modes/MovieMode';
import LearnMode from './modes/LearnMode';
import ExploreMode from './modes/ExploreMode';
import SandboxMode from './modes/SandboxMode';

import { useJVMStore } from './store/jvmStore';
import { useJVMEngine } from './hooks/useJVMEngine';
import { useKeyboard } from './hooks/useKeyboard';

import { motion, AnimatePresence } from 'framer-motion';

type RightPanelTab = 'Dashboard' | 'Flags' | 'Sandbox' | 'Detective' | 'Monitor';

function App() {
  useKeyboard();
  useJVMEngine();

  const hasStarted = useJVMStore(state => state.hasStarted);
  const mode = useJVMStore(state => state.mode);
  const [activeTab, setActiveTab] = useState<RightPanelTab>('Dashboard');

  if (!hasStarted) {
    return (
      <div className="h-screen w-screen overflow-y-auto bg-zinc-950">
        <LandingPage />
        <CommandPalette />
      </div>
    );
  }

  // Determine if we need a "Wide" operations panel
  const isWidePanel = activeTab === 'Detective' || activeTab === 'Sandbox';

  return (
    <div className="h-screen w-screen flex flex-col bg-surface-primary overflow-hidden font-sans antialiased text-zinc-300">
      
      {/* ── Top Header ─────────────────────────────────────────── */}
      <header className="h-14 shrink-0 z-50 border-b border-white/5 bg-surface-primary/90 backdrop-blur-xl">
        <PlatformHeader />
      </header>

      {/* ── Main Area ──────────────────────────────────────────── */}
      <main className="flex-1 flex overflow-hidden min-h-0 relative">

        {/* Global Command Palette */}
        <CommandPalette />

        {/* Left Sidebar — Fixed Navigation */}
        <aside className="w-64 shrink-0 border-r border-white/5 z-20 bg-surface-primary/50 backdrop-blur-md">
          <CurriculumSidebar />
        </aside>

        {/* Center — 3D Scene + Overlays */}
        <section className="flex-1 relative overflow-hidden bg-black min-w-0">
          {/* 3D Canvas */}
          <div className="absolute inset-0 z-0">
            <SceneCanvas />
          </div>

          {/* Level Content Overlay (if any level active) */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            <LevelRenderer />
          </div>

          {/* Movie Mode Overlay */}
          {mode === 'movie' && (
            <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-md flex items-center justify-center p-12">
              <div className="w-full h-full max-w-5xl shadow-2xl rounded-3xl overflow-hidden border border-white/10 ring-1 ring-white/10">
                <MovieMode />
              </div>
            </div>
          )}

          {/* Global States & Notifications */}
          <OOMErrorOverlay />
          <NarratorOverlay />
        </section>

        {/* Right Panel — Dynamic Width Operations */}
        <aside 
          className={`shrink-0 border-l border-white/5 bg-surface-secondary z-20 flex flex-col transition-all duration-300 ease-in-out ${
            isWidePanel ? 'w-[640px]' : 'w-[400px]'
          }`}
        >
          {/* Operations Tab Bar */}
          <div className="flex items-center border-b border-white/5 bg-black/30 p-1.5 gap-1 shrink-0">
            {(['Dashboard', 'Flags', 'Sandbox', 'Detective', 'Monitor'] as RightPanelTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-[10px] font-black tracking-widest uppercase transition-all rounded-lg relative ${
                  activeTab === tab ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <span className="relative z-10">{tab}</span>
                {activeTab === tab && (
                  <motion.div
                    layoutId="rightPanelTabActive"
                    className="absolute inset-0 bg-white/[0.08] border border-white/10 rounded-lg shadow-inner"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content Viewport */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col relative bg-surface-secondary/50">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex-1 flex flex-col min-h-0 overflow-hidden"
              >
                {activeTab === 'Dashboard' && (
                  mode === 'learn'   ? <LearnMode />   :
                  mode === 'explore' ? <ExploreMode /> : <Dashboard />
                )}
                {activeTab === 'Flags'    && <JVMFlags />}
                {activeTab === 'Sandbox'  && (
                  mode === 'sandbox' ? <SandboxMode /> : <CodeSandbox />
                )}
                {activeTab === 'Detective' && <DetectiveMode />}
                {activeTab === 'Monitor'   && (
                  <div className="flex-1 flex flex-col gap-6 p-6 overflow-y-auto custom-scrollbar min-h-0 bg-surface-primary/20">
                    <JFREventStream />
                    <GCLogParser />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </aside>

      </main>

      {/* ── Bottom Global Timeline ──────────────────────────────── */}
      <footer className="h-16 shrink-0 z-50 border-t border-white/5 bg-surface-primary/95 backdrop-blur-xl">
        <Timeline />
      </footer>
    </div>
  );
}

export default App;
