import { instance as jit } from './JITEngine';
import { instance as heap } from './HeapManager';
import { instance as metaspace } from './MetaspaceEngine';
import { instance as nmt } from './NativeMemoryTracker';

export class RuntimeEngine {
  
  tick() {
    // Background runtime tasks
    if (Math.random() > 0.5) {
      jit.recordInvocation('String');
    }
  }

  getOverallStatus() {
    return {
      nmt: nmt.getSummary(),
      jit: jit.getHotMethods(),
      metaspace: metaspace.getStats(),
      heap: {
        used: heap.getUsage('eden') + heap.getUsage('old'),
        capacity: heap.getRegion('old')?.capacity || 0
      }
    };
  }
}

export const instance = new RuntimeEngine();