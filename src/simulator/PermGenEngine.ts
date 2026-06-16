import { instance as heap } from './HeapManager';

export class PermGenEngine {
  // Legacy simulation for Java 7 and older levels
  private used = 0;
  private capacity = 64;

  allocate(size: number): boolean {
    if (this.used + size <= this.capacity) {
      this.used += size;
      return true;
    }
    return false;
  }

  getUsage() {
    return {
      used: this.used,
      capacity: this.capacity
    };
  }

  clear() {
    this.used = 0;
  }
}

export const instance = new PermGenEngine();