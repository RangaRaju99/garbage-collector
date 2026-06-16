import { useJVMStore } from '../../store/jvmStore';
import { instance as heap } from '../HeapManager';

export class CMS {
  
  runConcurrentCycle() {
    const state = useJVMStore.getState();
    
    // CMS has multiple short STW pauses (Initial Mark, Remark)
    state.setSafepoint(true);
    setTimeout(() => {
      state.setSafepoint(false);
      state.addEvent('CMS Initial Mark', 'Root scanning finished.', 5);
      
      // Concurrent marking phase
      setTimeout(() => {
        state.setSafepoint(true); // Remark phase
        setTimeout(() => {
          state.setSafepoint(false);
          const oldUsed = heap.getUsage('old');
          const reclaimed = Math.floor(oldUsed * 0.3);
          heap.free('old', reclaimed);
          state.addEvent('CMS Remark', `Concurrent sweep complete. Reclaimed ${reclaimed}MB.`, 20);
        }, 50);
      }, 1000);
    }, 10);
  }
}

export const instance = new CMS();