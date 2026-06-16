import { useJVMStore } from '../../store/jvmStore';
import { instance as heap } from '../HeapManager';

export class ParallelGC {
  
  runYoung() {
    const state = useJVMStore.getState();
    const threadCount = 4; // Parallel workers
    
    state.setSafepoint(true);
    
    const edenUsed = heap.getUsage('eden');
    const survivors = Math.floor(edenUsed * 0.15);
    const promoted = Math.floor(survivors * 0.3);
    
    heap.clearRegion('eden');
    heap.allocate('s1', survivors - promoted);
    heap.allocate('old', promoted);
    
    // Efficiency gain from parallelism
    const duration = (20 + Math.random() * 30) / (threadCount * 0.7);
    
    state.addEvent('Minor GC (Parallel)', `Throughput-focused collection. Workers: ${threadCount}`, duration);
    
    setTimeout(() => {
      state.setSafepoint(false);
    }, duration);
  }

  runFull() {
    const state = useJVMStore.getState();
    state.setSafepoint(true);
    
    const oldUsed = heap.getUsage('old');
    const reclaimed = Math.floor(oldUsed * 0.5);
    
    heap.free('old', reclaimed);
    
    const duration = (150 + Math.random() * 100) / 2.5; // Parallel Old compaction
    state.addEvent('Full GC (Parallel)', `Parallel Compaction Complete. Reclaimed ${reclaimed}MB.`, duration);

    setTimeout(() => {
       state.setSafepoint(false);
    }, duration);
  }
}

export const instance = new ParallelGC();