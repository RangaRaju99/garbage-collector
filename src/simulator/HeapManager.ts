import { useJVMStore } from '../store/jvmStore';

export interface MemoryRegion {
  name: string;
  start: number;
  end: number;
  used: number;
  capacity: number;
  type: 'eden' | 's0' | 's1' | 'old' | 'humongous' | 'metaspace' | 'codecache';
}

export class HeapManager {
  private regions: Map<string, MemoryRegion> = new Map();

  constructor() {
    this.initialize();
  }

  initialize() {
    const flags = useJVMStore.getState().flags;
    const xmx = flags.Xmx;
    
    // Generational Split
    const youngGenTotal = Math.floor(xmx / (flags.NewRatio + 1));
    const oldGenTotal = xmx - youngGenTotal;
    
    // Survivor Split
    const survivorSize = Math.floor(youngGenTotal / (flags.SurvivorRatio + 2));
    const edenSize = youngGenTotal - (survivorSize * 2);

    this.regions.set('eden', { name: 'Eden', start: 0, end: edenSize, used: 0, capacity: edenSize, type: 'eden' });
    this.regions.get('eden');

    this.regions.set('s0', { name: 'Survivor 0', start: edenSize, end: edenSize + survivorSize, used: 0, capacity: survivorSize, type: 's0' });
    this.regions.set('s1', { name: 'Survivor 1', start: edenSize + survivorSize, end: edenSize + (survivorSize * 2), used: 0, capacity: survivorSize, type: 's1' });
    this.regions.set('old', { name: 'Old Gen', start: youngGenTotal, end: xmx, used: 0, capacity: oldGenTotal, type: 'old' });
    
    // Native Regions
    this.regions.set('metaspace', { name: 'Metaspace', start: 0, end: flags.MaxMetaspaceSize, used: 0, capacity: flags.MaxMetaspaceSize, type: 'metaspace' });
    this.regions.set('codecache', { name: 'Code Cache', start: 0, end: flags.ReservedCodeCacheSize, used: 0, capacity: flags.ReservedCodeCacheSize, type: 'codecache' });
  }

  getRegion(type: MemoryRegion['type']): MemoryRegion | undefined {
    return this.regions.get(type);
  }

  allocate(type: MemoryRegion['type'], size: number): boolean {
    const region = this.regions.get(type);
    if (!region) return false;
    
    if (region.used + size <= region.capacity) {
      region.used += size;
      return true;
    }
    return false;
  }

  free(type: MemoryRegion['type'], size: number) {
    const region = this.regions.get(type);
    if (region) {
      region.used = Math.max(0, region.used - size);
    }
  }

  getUsage(type: MemoryRegion['type']): number {
    return this.regions.get(type)?.used || 0;
  }

  clearRegion(type: MemoryRegion['type']) {
    const region = this.regions.get(type);
    if (region) region.used = 0;
  }
}

export const instance = new HeapManager();