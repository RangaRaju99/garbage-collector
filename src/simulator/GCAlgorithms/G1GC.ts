import { useJVMStore } from '../../store/jvmStore';
import { instance as heap } from '../HeapManager';

export class G1GC {
  private pauseGoal = 200; // ms

  runYoung() {
    const state = useJVMStore.getState();
    state.setSafepoint(true);
    
    // G1 only cleans enough regions to meet pause goal
    const edenUsed = heap.getUsage('eden');
    const reclaimed = Math.floor(edenUsed * 0.95);
    const survivors = edenUsed - reclaimed;
    
    heap.clearRegion('eden');
    heap.allocate('old', survivors); // Simplified promotion
    
    // G1 is good at hitting pause goal
    const duration = this.pauseGoal * (0.4 + Math.random() * 0.2);
    
    state.addEvent('G1 Young (Normal)', `Region-based evacuation complete.`, duration);
    
    setTimeout(() => {
      state.setSafepoint(false);
    }, duration);
  }

  runMixed() {
    const state = useJVMStore.getState();
    state.setSafepoint(true);
    
    // Mixed collection cleans young + some old regions
    const oldUsed = heap.getUsage('old');
    const reclaimed = Math.floor(oldUsed * 0.1); // Small incremental reclamation
    
    heap.free('old', reclaimed);
    
    const duration = this.pauseGoal * (0.8 + Math.random() * 0.3);
    state.addEvent('G1 Mixed', `Incremental Old Gen reclamation.`, duration);

    setTimeout(() => {
       state.setSafepoint(false);
    }, duration);
  }

  runFull() {
    const state = useJVMStore.getState();
    state.setSafepoint(true);
    
    const oldUsed = heap.getUsage('old');
    heap.free('old', Math.floor(oldUsed * 0.8));
    
    const duration = 500 + Math.random() * 500;
    state.addEvent('G1 Full GC', `CRITICAL: Region-based flow failed.`, duration);

    setTimeout(() => {
       state.setSafepoint(false);
    }, duration);
  }
}

export const instance = new G1GC();