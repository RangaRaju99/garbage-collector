import { useMemo } from 'react';
import { useJVMStore } from '../store/jvmStore';

/**
 * Hook to compute and stream human-readable NMT data.
 */
export function useNMT() {
  const metrics = useJVMStore(state => state.metrics);
  const flags = useJVMStore(state => state.flags);

  const nmtData = useMemo(() => {
    return {
      heap: metrics.heapUsed,
      metaspace: metrics.metaspaceUsed,
      codeCache: Math.floor(flags.ReservedCodeCacheSize * (metrics.heapUsed / 1000)), // dummy ratio
      threadStacks: (useJVMStore.getState().objects.length % 20 + 2) * 1.024, // simulated stacks
      total: 0 // sum calculated infra
    };
  }, [metrics, flags]);

  const total = Object.values(nmtData).reduce((a, b) => a + b, 0);
  
  return { ...nmtData, total };
}
