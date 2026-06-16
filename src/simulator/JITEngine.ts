import { instance as cache } from './CodeCache';
import { useJVMStore } from '../store/jvmStore';

export class JITEngine {
  private invocationCounts: Map<string, number> = new Map();
  private thresholds = {
    level1: 100,
    level4: 5000 // In reality 10k-15k
  };

  recordInvocation(methodName: string) {
    const count = (this.invocationCounts.get(methodName) || 0) + 1;
    this.invocationCounts.set(methodName, count);

    if (count === this.thresholds.level1) {
      cache.compile(methodName, 1);
      useJVMStore.getState().addEvent('JIT (C1)', `Compiled ${methodName} for speed.`, 5);
    } else if (count === this.thresholds.level4) {
      cache.compile(methodName, 4);
      useJVMStore.getState().addEvent('JIT (C2)', `Deeply optimized ${methodName}.`, 20);
    }
  }

  getHotMethods() {
    return Array.from(this.invocationCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }

  reset() {
    this.invocationCounts.clear();
    cache.clear();
  }
}

export const instance = new JITEngine();