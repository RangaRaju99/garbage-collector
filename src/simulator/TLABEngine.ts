export interface TLAB {
  threadId: string;
  start: number;
  end: number;
  top: number;
  size: number;
}

export class TLABEngine {
  private tlabs: Map<string, TLAB> = new Map();
  private defaultTlabSize = 2; // 2MB default

  createTLAB(threadId: string, sizeMB: number = this.defaultTlabSize): TLAB {
    const tlab: TLAB = {
      threadId,
      start: 0,
      end: sizeMB,
      top: 0,
      size: sizeMB
    };
    this.tlabs.set(threadId, tlab);
    return tlab;
  }

  allocate(threadId: string, sizeMB: number): boolean {
    let tlab = this.tlabs.get(threadId);
    
    // Auto-create if not exists
    if (!tlab) {
      tlab = this.createTLAB(threadId);
    }

    if (tlab.top + sizeMB <= tlab.end) {
      tlab.top += sizeMB;
      return true;
    }

    // TLAB full - normally would retire and get new one
    // But for simulation, we'll signal to use the shared Eden space
    return false;
  }

  retire(threadId: string) {
    this.tlabs.delete(threadId);
  }

  getStats() {
    return {
      activeTLABs: this.tlabs.size,
      totalTLABCapacity: Array.from(this.tlabs.values()).reduce((acc, t) => acc + t.size, 0),
      totalUsed: Array.from(this.tlabs.values()).reduce((acc, t) => acc + t.top, 0)
    };
  }

  clearAll() {
    this.tlabs.clear();
  }
}

export const instance = new TLABEngine();