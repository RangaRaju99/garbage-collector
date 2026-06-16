import { instance as heap } from './HeapManager';
import { instance as tlab } from './TLABEngine';
import { useJVMStore } from '../store/jvmStore';

export class AllocationEngine {
  
  allocate(sizeMB: number, type: string, threadId: string = 'main'): 'EDEN' | 'TLAB' | 'OLD' | 'HUMONGOUS' | 'REJECTED' {
    const flags = useJVMStore.getState().flags;
    
    // 1. Humongous Check (if > 50% of G1 region or just "large")
    if (sizeMB > flags.Xmx / 20) {
      if (heap.allocate('old', sizeMB)) {
        return 'HUMONGOUS';
      }
      return 'REJECTED';
    }

    // 2. Try TLAB
    if (tlab.allocate(threadId, sizeMB)) {
      heap.allocate('eden', sizeMB); // TLAB sits inside Eden
      return 'TLAB';
    }

    // 3. Try Shared Eden
    if (heap.allocate('eden', sizeMB)) {
      return 'EDEN';
    }

    // 4. Allocation Failure (Triggers GC)
    return 'REJECTED';
  }

  allocateNative(type: 'metaspace' | 'codecache', sizeMB: number): boolean {
    return heap.allocate(type, sizeMB);
  }
}

export const instance = new AllocationEngine();