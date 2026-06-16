export class RememberedSet {
  // Maps target region to source pointers
  private remSet: Map<string, Set<string>> = new Map();

  addReference(sourceId: string, targetId: string) {
    if (!this.remSet.has(targetId)) {
      this.remSet.set(targetId, new Set());
    }
    this.remSet.get(targetId)?.add(sourceId);
  }

  getIncomingReferences(targetId: string) {
    return Array.from(this.remSet.get(targetId) || []);
  }

  clearRegionReferences(_targetRegionId: string) {
    // In simulation simplified
    this.remSet.clear();
  }
}

export const instance = new RememberedSet();