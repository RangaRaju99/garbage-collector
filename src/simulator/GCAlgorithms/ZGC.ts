import { useJVMStore } from '../../store/jvmStore';
import { instance as heap } from '../HeapManager';

export class ZGC {
  
  runConcurrentCycle() {
    const state = useJVMStore.getState();
    
    // ZGC Safepoints are extremely short (< 1ms)
    state.setSafepoint(true);
    setTimeout(() => state.setSafepoint(false), 1);
    
    // Most work is concurrent while app runs
    const oldUsed = heap.getUsage('old');
    const reclaimed = Math.floor(oldUsed * 0.4);
    
    // Simulate concurrent reclamation over few seconds
    setTimeout(() => {
      heap.free('old', reclaimed);
      state.addEvent('ZGC Cycle', `Concurrent relocation finished. Reclaimed ${reclaimed}MB.`, 0.8);
    }, 2000);
  }
}

export const instance = new ZGC();