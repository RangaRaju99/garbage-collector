export class PLABEngine {
  // Similar to TLAB but for promotion into Old Gen
  private plabs: Map<string, number> = new Map();

  allocate(workerId: string, size: number): boolean {
    const current = this.plabs.get(workerId) || 0;
    if (current + size <= 10) { // 10MB PLABs
      this.plabs.set(workerId, current + size);
      return true;
    }
    this.plabs.set(workerId, 0); // Refill
    return true;
  }

  getStats() {
    return {
      activePLABs: this.plabs.size
    };
  }
}

export const instance = new PLABEngine();