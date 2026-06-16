import { useJVMStore } from '../store/jvmStore';

export class SafepointEngine {
  private inSafepoint = false;

  enter() {
    this.inSafepoint = true;
    useJVMStore.getState().setSafepoint(true);
  }

  exit() {
    this.inSafepoint = false;
    useJVMStore.getState().setSafepoint(false);
  }

  isAtSafepoint() {
    return this.inSafepoint;
  }
}

export const instance = new SafepointEngine();