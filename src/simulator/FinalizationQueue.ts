export class FinalizationQueue {
  private queue: string[] = [];

  enqueue(objId: string) {
    this.queue.push(objId);
  }

  processOne(): string | undefined {
    return this.queue.shift();
  }

  getPendingCount() {
    return this.queue.length;
  }
}

export const instance = new FinalizationQueue();