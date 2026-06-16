import { instance as heap } from './HeapManager';

export interface LoadedClass {
  name: string;
  loaderId: string;
  sizeMB: number;
}

export class MetaspaceEngine {
  private classes: Map<string, LoadedClass> = new Map();

  loadClass(name: string, loaderId: string): boolean {
    const size = 0.5 + Math.random() * 2; // Class metadata size
    if (heap.allocate('metaspace', size)) {
      this.classes.set(name, { name, loaderId, sizeMB: size });
      return true;
    }
    return false;
  }

  unloadByLoader(loaderId: string) {
    this.classes.forEach((c, name) => {
      if (c.loaderId === loaderId) {
        heap.free('metaspace', c.sizeMB);
        this.classes.delete(name);
      }
    });
  }

  getStats() {
    return {
      classesLoaded: this.classes.size,
      usedMB: heap.getUsage('metaspace'),
      capacityMB: heap.getRegion('metaspace')?.capacity || 0
    };
  }
}

export const instance = new MetaspaceEngine();