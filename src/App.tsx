import { useState } from 'react';
import SceneCanvas from './scenes/CityScene';
import Dashboard from './components/Dashboard';
import Timeline from './components/Timeline';
import JVMFlags from './components/JVMFlags';
import CodeSandbox from './components/CodeSandbox';
import LandingPage from './components/LandingPage';
import JavaVersionTimeline from './chapters/JavaVersionTimeline';
import OOMErrorOverlay from './components/OOMErrorOverlay';
import CommandPalette from './components/CommandPalette';
import LevelRenderer from './components/LevelRenderer';
import NarratorOverlay from './components/NarratorOverlay';
import DetectiveMode from './modes/DetectiveMode';
import MovieMode from './modes/MovieMode';
import LearnMode from './modes/LearnMode';
import ExploreMode from './modes/ExploreMode';
import SandboxMode from './modes/SandboxMode';

import { useJVMStore } from './store/jvmStore';
import { useJVMEngine } from './hooks/useJVMEngine';
import { MainLayout } from './layouts/MainLayout';

import { useKeyboard } from './hooks/useKeyboard';
import JFREventStream from './components/JFREventStream';
import GCLogParser from './components/GCLogParser';

type RightPanelTab = 'Dashboard' | 'Flags' | 'Sandbox' | 'Detective' | 'Monitor';

function App() {
  useKeyboard();
  useJVMEngine();
  
  const { gcAlgorithm, hasStarted, mode, setMode } = useJVMStore();
  const [activeTab, setActiveTab] = useState<RightPanelTab>('Dashboard');

  if (!hasStarted) {
    return (
      <>
        <LandingPage />
        <CommandPalette />
      </>
    );
  }

  return (
    <MainLayout
      topBar={
        <div className="flex items-center justify-between px-6 h-full bg-primary-bg-alt">
          <div className="font-bold text-accent-alive flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent-alive animate-pulse" />
            Inside the JVM — Cinematic Visualizer
          </div>
          <div className="flex gap-6 text-sm text-gray-400 items-center">
            <JavaVersionTimeline />
            <nav className="flex bg-black/40 rounded-lg p-0.5 border border-white/5">
              {(['explore', 'movie', 'learn'] as const).map(m => (
                <button 
                  key={m} 
                  onClick={() => setMode(m)}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition ${
                    mode === m ? 'bg-accent-alive/20 text-accent-alive' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </nav>
            <span className="flex items-center gap-2 font-mono border-l border-white/10 pl-6 h-6">
              <span className="text-gray-500">GC:</span> 
              <span className="text-white text-xs">{gcAlgorithm}</span>
            </span>
          </div>
        </div>
      }
      footer={<Timeline />}
    >
      <div id="main-content-shell" className={`h-full w-full relative flex ${mode === 'movie' ? 'movie-mode-active' : ''}`}>
        <OOMErrorOverlay />
        <NarratorOverlay />
        <SceneCanvas />
        <CommandPalette />
        
        {/* Central Viewport Overlay */}
        <div className="absolute inset-0 pointer-events-none flex">
          {/* Main interactive area */}
          <div className="flex-1 relative pointer-events-auto overflow-hidden">
            <LevelRenderer />
            {mode === 'movie' && <div className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none bg-gradient-to-t from-black/80 to-transparent z-40" />}
            {mode === 'movie' && <div className="absolute top-20 right-6 w-96 max-h-[70%] z-40"><MovieMode /></div>}
          </div>

          {/* Right Panel: Data & Tools */}
          <aside className="w-[360px] border-l border-[rgba(0,212,255,0.2)] bg-secondary-bg flex flex-col shrink-0 z-20 relative pointer-events-auto">
            <div className="flex border-b border-[rgba(0,212,255,0.2)] overflow-x-auto shrink-0">
              {(['Dashboard', 'Flags', 'Sandbox', 'Detective', 'Monitor'] as RightPanelTab[]).map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                    activeTab === tab 
                      ? 'text-accent-alive border-b-2 border-accent-alive bg-accent-alive/5' 
                      : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-hidden">
               {activeTab === 'Dashboard' && (mode === 'learn' ? <LearnMode /> : mode === 'explore' ? <ExploreMode /> : <Dashboard />)}
               {activeTab === 'Flags' && <JVMFlags />}
               {activeTab === 'Sandbox' && (mode === 'sandbox' ? <SandboxMode /> : <CodeSandbox />)}
               {activeTab === 'Detective' && <DetectiveMode />}
               {activeTab === 'Monitor' && (
                 <div className="flex flex-col h-full gap-4 p-4 overflow-y-auto custom-scrollbar">
                   <div className="h-[300px] shrink-0"><JFREventStream /></div>
                   <div className="flex-1 min-h-[500px]"><GCLogParser /></div>
                 </div>
               )}
            </div>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}

export default App;
