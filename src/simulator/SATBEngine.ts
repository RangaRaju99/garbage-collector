export class SATBEngine {
  private snapshot: Set<string> = new Set();
  private isActive = false;

  startSnapshot() {
    this.isActive = true;
    this.snapshot.clear();
  }

  recordWrite(objId: string) {
    if (this.isActive) {
      this.snapshot.add(objId);
    }
  }

  getSnapshot() {
    return Array.from(this.snapshot);
  }

  stop() {
    this.isActive = false;
  }
}

export const instance = new SATBEngine();