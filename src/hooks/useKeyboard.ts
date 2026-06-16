import { useEffect } from 'react';
import { useJVMStore } from '../store/jvmStore';

export function useKeyboard() {
  const { 
    requestGC, 
    toggleXRay, 
    toggleObjectHeaders, 
    toggleTLABBoundaries, 
    toggleCardTable, 
    toggleNMT, 
    toggleGCThreads, 
    setSimulationSpeed,
    isRunning,
    setIsPlaying
  } = useJVMStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in code sandbox or log parser
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' || target.isContentEditable) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ': // Space
          e.preventDefault();
          setIsPlaying(!isRunning);
          break;
        case 'x':
          toggleXRay();
          break;
        case 'g':
          requestGC();
          break;
        case 'h':
          toggleObjectHeaders();
          break;
        case 'v':
          toggleTLABBoundaries();
          break;
        case 'c':
          toggleCardTable();
          break;
        case 'n':
          toggleNMT();
          break;
        case 't':
          toggleGCThreads();
          break;
        case 's':
          setSimulationSpeed(0.25);
          break;
        case 'f':
          setSimulationSpeed(4);
          break;
        case 'r':
          // Reset logic could go here if implemented in store
          window.location.reload(); 
          break;
        // 1-9 for jumping to points in Movie Mode or specific scenes
        default:
          if (/[1-9]/.test(e.key)) {
            // Scene jumping logic could go here
            console.log(`Jump to scene ${e.key}`);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, setIsPlaying, requestGC, toggleCardTable, toggleGCThreads, toggleNMT, toggleObjectHeaders, toggleTLABBoundaries, toggleXRay, setSimulationSpeed]);
}
