import { useJVMStore } from '../store/jvmStore';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import { instance as jvmEngine } from '../simulator/JVMEngine';

export default function OOMErrorOverlay() {
  const oomStatus = useJVMStore((state) => state.oomStatus);
  const clearOOM = useJVMStore((state) => state.clearOOM);

  if (!oomStatus) return null;

  const handleRestart = () => {
    // Clear simulation data to pretend JVM reboot
    jvmEngine.objects.clear();
    jvmEngine.edenRef = [];
    jvmEngine.oldGenRef = [];
    
    useJVMStore.setState({ isRunning: true });
    clearOOM();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.85)] mix-blend-multiply transition-all backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(255,0,0,0.2)] to-transparent pointer-events-none" />
      
      <div className="bg-primary-bg-alt border border-danger-gc shadow-[0_0_80px_rgba(255,0,0,0.5)] p-8 max-w-xl text-center rounded-xl relative z-10">
        <AlertTriangle size={64} className="text-danger-gc mx-auto mb-6 animate-pulse" />
        
        <h1 className="text-3xl font-bold text-white tracking-widest mb-2 font-mono">
          <span className="text-danger-gc">FATAL ERROR:</span> OutOfMemoryError
        </h1>
        
        <h2 className="text-xl text-red-300 font-mono mb-6 bg-[rgba(255,0,0,0.1)] py-2 rounded">
          {oomStatus}
        </h2>
        
        <p className="text-gray-400 mb-8 font-sans leading-relaxed text-sm">
          The JVM has completely exhausted available memory bounds mapped by your JVM Flags. 
          Garbage Collection attempts failed to reclaim sufficient contiguous blocks. The process has been killed.
        </p>

        <div className="flex gap-4 justify-center">
          <button 
            onClick={handleRestart}
            className="flex items-center gap-2 px-6 py-3 bg-danger-gc text-white font-bold rounded hover:bg-red-500 transition shadow-[0_0_15px_rgba(255,0,0,0.4)]"
          >
            <RotateCcw size={18} />
            REBOOT JVM
          </button>
        </div>
      </div>
    </div>
  );
}