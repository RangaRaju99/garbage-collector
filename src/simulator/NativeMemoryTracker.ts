import { instance as heap } from './HeapManager';

export class NativeMemoryTracker {
  
  getSummary() {
    const metaspace = heap.getUsage('metaspace');
    const codeCache = heap.getUsage('codecache');
    const heapUsed = heap.getUsage('eden') + heap.getUsage('old') + heap.getUsage('s0') + heap.getUsage('s1');
    
    // Simulations for other native components
    const stackSize = 64; // Constant for threads
    const gcMetadata = heapUsed * 0.05; // 5% overhead
    const cInternal = 32;

    const totalRSS = heapUsed + metaspace + codeCache + stackSize + gcMetadata + cInternal;

    return {
      heap: heapUsed,
      metaspace,
      codeCache,
      stackSize,
      gcMetadata,
      cInternal,
      totalRSS
    };
  }
}

export const instance = new NativeMemoryTracker();