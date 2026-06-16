import { useJVMStore } from '../../store/jvmStore';

export class EpsilonGC {
  run() {
    const state = useJVMStore.getState();
    // Do nothing. Epsilon doesn't collect.
    state.addEvent('Epsilon GC', 'No-op: Object reclamation bypassed.', 0);
  }
}

export const instance = new EpsilonGC();