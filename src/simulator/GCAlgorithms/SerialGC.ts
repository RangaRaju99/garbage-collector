import { useJVMStore } from '../../store/jvmStore';
import { instance as heap } from '../HeapManager';

export class SerialGC {
  private youngCollector = "Serial Young (Mark-Copy)";
  private oldCollector = "Serial Old (Mark-Sweep-Compact)";

  runYoung() {
    const state = useJVMStore.getState();
    const startTime = performance.now();
    
    // Serial is single-threaded
    state.setSafepoint(true);
    
    // Simulate Work
    const edenUsed = heap.getUsage('eden');
    const survivors = Math.floor(edenUsed * 0.1); // 10% survive
    const promoted = Math.floor(survivors * 0.2); // 20% of survivors promoted
    
    heap.clearRegion('eden');
    heap.allocate('s0', survivors - promoted);
    heap.allocate('old', promoted);
    
    const duration = 10 + Math.random() * 50;
    
    state.addEvent('Minor GC (Serial)', `Evacuated Eden. Promoted ${promoted}MB.`, duration);
    
    setTimeout(() => {
      state.setSafepoint(false);
    }, duration);
  }

  runFull() {
     const state = useJVMStore.getState();
     state.setSafepoint(true);
     
     const oldUsed = heap.getUsage('old');
     const reclaimed = Math.floor(oldUsed * 0.6); // Reclaim 60%
     
     heap.free('old', reclaimed);
     
     const duration = 100 + Math.random() * 200;
     state.addEvent('Full GC (Serial)', `Mark-Sweep-Compact finished. Reclaimed ${reclaimed}MB.`, duration);

     setTimeout(() => {
        state.setSafepoint(false);
     }, duration);
  }
}

export const instance = new SerialGC();