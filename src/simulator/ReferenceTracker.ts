export type ReferenceType = 'STRONG' | 'SOFT' | 'WEAK' | 'PHANTOM';

export interface ManagedReference {
  id: string;
  type: ReferenceType;
  referentId: string;
  isCleared: boolean;
  enqueued: boolean;
}

export class ReferenceTracker {
  private refs: Map<string, ManagedReference> = new Map();

  register(referentId: string, type: ReferenceType): ManagedReference {
    const id = `ref_${Math.random().toString(16).slice(2, 8)}`;
    const ref: ManagedReference = {
      id,
      type,
      referentId,
      isCleared: false,
      enqueued: false
    };
    this.refs.set(id, ref);
    return ref;
  }

  processGC(pressure: number) {
    this.refs.forEach(ref => {
      if (ref.isCleared) return;

      if (ref.type === 'WEAK') {
        ref.isCleared = true;
        ref.enqueued = true;
      } else if (ref.type === 'SOFT' && pressure > 80) {
        ref.isCleared = true;
        ref.enqueued = true;
      } else if (ref.type === 'PHANTOM') {
        // Phantom is cleared only after finalization
        ref.enqueued = true;
      }
    });
  }

  getQueue() {
    return Array.from(this.refs.values()).filter(r => r.enqueued);
  }

  clear() {
    this.refs.clear();
  }
}

export const instance = new ReferenceTracker();