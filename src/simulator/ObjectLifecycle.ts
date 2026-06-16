// import { useJVMStore } from '../store/jvmStore';

export interface ObjectState {
  age: number;
  generation: 'eden' | 's0' | 's1' | 'old' | 'humongous';
  tenured: boolean;
}

export class ObjectLifecycle {
  
  processSurvivor(age: number, threshold: number): { nextAge: number, shouldPromote: boolean } {
    const nextAge = age + 1;
    return {
      nextAge,
      shouldPromote: nextAge >= threshold
    };
  }

  getGenerationColor(gen: ObjectState['generation']): string {
    switch(gen) {
      case 'eden': return '#00ff88';
      case 's0': 
      case 's1': return '#ffaa00';
      case 'old': return '#aa44ff';
      case 'humongous': return '#ff4444';
      default: return '#ffffff';
    }
  }
}

export const instance = new ObjectLifecycle();