import { instance as heap } from './HeapManager';

export interface CompiledMethod {
  name: string;
  sizeMB: number;
  entryPoint: string;
  level: 1 | 2 | 3 | 4; // Tiered compilation level
}

export class CodeCache {
  private methods: Map<string, CompiledMethod> = new Map();
  
  compile(name: string, level: 1 | 2 | 3 | 4): boolean {
    const size = level * 0.1; // More optimized code = larger size
    if (heap.allocate('codecache', size)) {
      this.methods.set(name, { name, sizeMB: size, entryPoint: `0x${Math.random().toString(16).slice(2, 10)}`, level });
      return true;
    }
    return false;
  }

  evict(name: string) {
    const method = this.methods.get(name);
    if (method) {
      heap.free('codecache', method.sizeMB);
      this.methods.delete(name);
    }
  }

  getUsage() {
    return {
      count: this.methods.size,
      usedMB: heap.getUsage('codecache'),
      capacityMB: heap.getRegion('codecache')?.capacity || 0
    };
  }

  clear() {
    this.methods.clear();
    heap.clearRegion('codecache');
  }
}

export const instance = new CodeCache();