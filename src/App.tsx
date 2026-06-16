import { useState, useEffect } from 'react';
import SceneCanvas from './scenes/CityScene';
import Dashboard from './components/Dashboard';
import Timeline from './components/Timeline';
import JVMFlags from './components/JVMFlags';
import CodeSandbox from './components/CodeSandbox';
import LandingPage from './components/LandingPage';
import JavaVersionTimeline from './chapters/JavaVersionTimeline';
import OOMErrorOverlay from './components/OOMErrorOverlay';
import CommandPalette from './components/CommandPalette';
import CurriculumSidebar from './components/CurriculumSidebar';
import DetectiveMode from './modes/DetectiveMode';
import { useJVMStore } from './store/jvmStore';
import { instance as jvmEngine } from './simulator/JVMEngine';

type RightPanelTab = 'Dashboard' | 'Flags' | 'Sandbox' | 'Detective';

function App() {
  const { gcAlgorithm, hasStarted } = useJVMStore();
  const [activeTab, setActiveTab] = useState<RightPanelTab>('Dashboard');

  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if (e.key === 'g' && hasStarted) {
         jvmEngine.runMinorGC();
         useJVMStore.getState().addEvent('INFO', 'Manual system.gc() requested via hotkey', 0);
      }
      if (e.key.toLowerCase() === 'r' && hasStarted) {
         window.location.reload();
      }
      if (e.key.toLowerCase() === 'x' && hasStarted) {
         useJVMStore.getState().toggleXRay();
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    const interval = setInterval(() => {
      jvmEngine.tick();
    }, 500);
    return () => clearInterval(interval);
  }, [hasStarted]);

  if (!hasStarted) {
    return (
      <>
        <LandingPage />
        <CommandPalette />
      </>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col font-sans overflow-hidden">
      <OOMErrorOverlay />
      <CommandPalette />
      {/* Top Header */}
      <header className="h-14 border-b border-[rgba(0,212,255,0.2)] flex items-center justify-between px-6 bg-primary-bg-alt z-10 w-full shrink-0">
        <div className="font-bold text-accent-alive flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent-alive animate-pulse" />
          Inside the JVM
        </div>
        <div className="flex gap-6 text-sm text-gray-400 items-center">
          <JavaVersionTimeline />
          <span className="flex items-center gap-2 font-mono">
            <span className="text-gray-500">Collector:</span> 
            <span className="text-white">{gcAlgorithm}</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="text-gray-500">Mode:</span> 
            <span className="text-white">Movie Mode</span>
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        {/* Left Panel */}
        <CurriculumSidebar />

        {/* Center Canvas */}
        <main className="flex-1 relative bg-black shrink-0 overflow-hidden">
          <SceneCanvas />
        </main>

        {/* Right Panel */}
        <aside className="w-[320px] border-l border-[rgba(0,212,255,0.2)] bg-secondary-bg flex flex-col shrink-0 z-10 relative">
          {/* Tabs */}
          <div className="flex border-b border-[rgba(0,212,255,0.2)] overflow-x-auto">
            {(['Dashboard', 'Flags', 'Sandbox', 'Detective'] as RightPanelTab[]).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider ${
                  activeTab === tab 
                    ? 'text-accent-alive border-b-2 border-accent-alive bg-[rgba(0,212,255,0.05)]' 
                    : 'text-gray-500 hover:text-white transition'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Panel Content */}
          {activeTab === 'Dashboard' && <Dashboard />}
          {activeTab === 'Flags' && <JVMFlags />}
          {activeTab === 'Sandbox' && <CodeSandbox />}
          {activeTab === 'Detective' && <DetectiveMode />}

        </aside>
      </div>

      {/* Bottom Timeline */}
      <footer className="h-16 border-t border-[rgba(0,212,255,0.2)] bg-primary-bg-alt flex-shrink-0 z-10 relative w-full">
        <Timeline />
      </footer>
    </div>
  );
}

export default App;
