import { useEffect, useRef } from 'react';
import { useJVMStore } from '../store/jvmStore';
import { instance as jvmEngine } from '../simulator/JVMEngine';

/**
 * Hook to manage the JVM Simulation loop.
 * Orchestrates the relationship between the singleton engine and the React lifecycle.
 */
export function useJVMEngine() {
  const { hasStarted, isRunning, playbackSpeed, isSafepoint, oomStatus } = useJVMStore();
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!hasStarted || !isRunning || isSafepoint || oomStatus) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    const tick = () => {
      const now = Date.now();
      const delta = now - lastTimeRef.current;
      
      // Calibrate simulation steps based on delta and speed
      // Aim for ~2 simulator ticks per second at 1x speed
      const interval = 500 / playbackSpeed;

      if (delta > interval) {
        jvmEngine.tick();
        lastTimeRef.current = now;
      }

      requestRef.current = requestAnimationFrame(tick);
    };

    requestRef.current = requestAnimationFrame(tick);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [hasStarted, isRunning, playbackSpeed, isSafepoint, oomStatus]);
}
