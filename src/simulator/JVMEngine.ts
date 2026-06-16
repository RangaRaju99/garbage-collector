import { useJVMStore } from '../store/jvmStore';
import { instance as heap } from './HeapManager';
import { instance as allocation } from './AllocationEngine';
import { instance as jit } from './JITEngine';
import { instance as metaspace } from './MetaspaceEngine';
import { instance as nmt } from './NativeMemoryTracker';
import { instance as lifecycle } from './ObjectLifecycle';
import { instance as serialGC } from './GCAlgorithms/SerialGC';
import { instance as parallelGC } from './GCAlgorithms/ParallelGC';
import { instance as g1GC } from './GCAlgorithms/G1GC';
import { instance as zGC } from './GCAlgorithms/ZGC';

export interface JVMObject {
  id: string;
  age: number;
  size: number;
  generation: 'eden' | 's0' | 's1' | 'old' | 'humongous';
  reachable: boolean;
  references: string[]; 
  isRoot: boolean;
  type: string;
}

export class JVMEngine {
  objects: Map<string, JVMObject> = new Map();
  private idCounter = 0;
  
  tick() {
    const state = useJVMStore.getState();
    if (!state.isRunning || state.isSafepoint || state.oomStatus) return;

    const playbackSpeed = state.playbackSpeed;
    
    // 1. Simulation Allocation
    const newCount = Math.floor(Math.random() * 3 * playbackSpeed);
    for (let i = 0; i < newCount; i++) {
      const size = Math.floor(Math.random() * 5) + 1;
      const type = 'String';
      const isRoot = Math.random() > 0.8;
      
      const loc = allocation.allocate(size, type);
      if (loc === 'REJECTED') {
        this.handleAllocationFailure();
        return;
      }

      const obj: JVMObject = {
        id: `obj_${this.idCounter++}`,
        age: 0,
        size,
        generation: loc === 'HUMONGOUS' ? 'humongous' : 
                    loc === 'OLD' ? 'old' : 'eden',
        reachable: true,
        references: [],
        isRoot,
        type
      };

      this.objects.set(obj.id, obj);

      // JIT Tracking
      jit.recordInvocation(type);
    }

    // 2. Class Loading Simulation
    if (Math.random() > 0.98) {
      metaspace.loadClass(`Class_${this.idCounter}`, 'app-loader');
    }

    // 3. Randomize Reachability
    this.objects.forEach(obj => {
      if (obj.isRoot && Math.random() > 0.05) {
        obj.isRoot = false;
      }
    });

    this.syncToStore();
  }

  private handleAllocationFailure() {
    const state = useJVMStore.getState();
    const config = state.flags;

    // Delegate to active GC
    if (config.UseG1GC) g1GC.runYoung();
    else if (config.UseZGC) zGC.runConcurrentCycle();
    else if (config.UseParallelGC) parallelGC.runYoung();
    else serialGC.runYoung();
  }

  syncToStore() {
    const state = useJVMStore.getState();
    
    // Sync Objects
    const storeObjs = Array.from(this.objects.values()).map(o => ({
      id: o.id,
      type: o.type,
      region: o.generation === 'old' || o.generation === 'humongous' ? 'oldGen' as const : 
              o.generation === 'eden' ? 'eden' as const : 'survivor' as const,
      age: o.age,
      sizeKB: o.size * 1024,
      color: lifecycle.getGenerationColor(o.generation),
      reachable: o.reachable
    }));
    
    state.setObjects(storeObjs);
    
    // Sync Metrics via NMT
    const stats = nmt.getSummary();
    state.updateMetrics({
      edenUsed: heap.getUsage('eden'),
      oldGenUsed: heap.getUsage('old'),
      heapUsed: stats.heap,
      objectsAlive: this.objects.size,
      objectsDead: state.metrics.objectsDead + (Math.random() > 0.8 ? 1 : 0),
    });
  }

  // --- Sandbox Simulation Hooks ---
  
  runMinorGC() {
    this.handleAllocationFailure();
    useJVMStore.getState().addEvent('GC', 'Manual System.gc() invoked from Sandbox', 25);
  }

  allocate(type: string = 'UserObject', size: number = 8) {
    const loc = allocation.allocate(size, type);
    const obj: JVMObject = {
      id: `obj_${this.idCounter++}`,
      age: 0,
      size,
      generation: loc === 'HUMONGOUS' ? 'humongous' : 'eden',
      reachable: true,
      references: [],
      isRoot: true,
      type
    };
    this.objects.set(obj.id, obj);
    this.syncToStore();
    return obj.id;
  }

  breakReference(id: string) {
    const obj = this.objects.get(id);
    if (obj) {
      obj.isRoot = false;
      obj.reachable = false;
      this.syncToStore();
    }
  }

  leakStatic(count: number = 20) {
    for (let i = 0; i < count; i++) {
      const id = this.allocate('StaticLeakObject', 16);
      const obj = this.objects.get(id);
      if (obj) obj.isRoot = true; // Permanently root it
    }
    useJVMStore.getState().addEvent('WARN', `Static leak triggered: ${count} objects rooted`, 0);
  }
}

export const instance = new JVMEngine();


