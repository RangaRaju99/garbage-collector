export interface GCThread {
  id: string;
  state: 'IDLE' | 'SCANNING' | 'MARKING' | 'EVACUATING' | 'RELAXING';
}

export class GCThreads {
  private threads: GCThread[] = [];

  constructor(count: number = 4) {
    for (let i = 0; i < count; i++) {
      this.threads.push({ id: `gc-worker-${i}`, state: 'IDLE' });
    }
  }

  setAllState(state: GCThread['state']) {
    this.threads.forEach(t => t.state = state);
  }

  getThreads() {
    return this.threads;
  }
}

export const instance = new GCThreads();