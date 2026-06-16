import { useJVMStore } from '../store/jvmStore';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import { instance as jvmEngine } from '../simulator/JVMEngine';
import { motion } from 'framer-motion';

export default function OOMErrorOverlay() {
  const oomStatus = useJVMStore((state) => state.oomStatus);
  const clearOOM = useJVMStore((state) => state.clearOOM);

  if (!oomStatus) return null;

  const handleRestart = () => {
    jvmEngine.objects.clear();
    jvmEngine.edenRef = [];
    jvmEngine.oldGenRef = [];
    useJVMStore.setState({ isRunning: true });
    clearOOM();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-surface-secondary border border-status-error/30 rounded-2xl p-8 max-w-md w-full mx-6 text-center shadow-2xl"
      >
        <div className="w-14 h-14 rounded-xl bg-status-error/10 border border-status-error/20 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={24} className="text-status-error" />
        </div>

        <h1 className="text-[13px] font-black text-status-error uppercase tracking-widest mb-1 font-mono">
          Fatal Error
        </h1>
        <h2 className="text-xl font-black text-white mb-2">
          OutOfMemoryError
        </h2>

        <div className="bg-black/40 border border-white/5 rounded-lg px-4 py-2 mb-5 font-mono text-[11px] text-status-error">
          {oomStatus}
        </div>

        <p className="text-zinc-400 text-[12px] leading-relaxed mb-6">
          The JVM has exhausted available heap memory. GC attempts failed to reclaim sufficient space.
          The simulated process has been halted.
        </p>

        <button
          onClick={handleRestart}
          className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-status-error text-white font-bold rounded-xl hover:bg-red-500 active:scale-95 transition-all text-[12px]"
        >
          <RotateCcw size={14} />
          Reboot JVM
        </button>
      </motion.div>
    </motion.div>
  );
}