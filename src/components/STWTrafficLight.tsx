import { Html } from '@react-three/drei';
import { useJVMStore } from '../store/jvmStore';

export default function STWTrafficLight() {
  const isSafepoint = useJVMStore((state) => state.isSafepoint);

  return (
    <Html position={[0, 15, 0]} center style={{ pointerEvents: 'none' }}>
      <div 
        className={`transition-all duration-300 flex flex-col items-center justify-center p-4 rounded-xl border-2 backdrop-blur-xl ${
          isSafepoint 
            ? 'border-danger-gc bg-[rgba(239,68,68,0.2)] shadow-[0_0_50px_rgba(239,68,68,0.5)] scale-100 opacity-100' 
            : 'border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.5)] scale-90 opacity-0'
        }`}
      >
        <div className="flex gap-4 items-center">
          <div className="w-8 h-8 rounded-full bg-red-600 animate-pulse shadow-[0_0_20px_rgba(255,0,0,0.8)]" />
          <div className="w-8 h-8 rounded-full bg-gray-800" />
          <div className="w-8 h-8 rounded-full bg-gray-800" />
        </div>
        <div className="mt-4 text-center">
          <h2 className="text-white font-bold text-2xl tracking-widest uppercase">Stop The World</h2>
          <p className="text-red-300 font-mono text-sm mt-1">Safepoint Reached. JVM Paused.</p>
        </div>
      </div>
    </Html>
  );
}
