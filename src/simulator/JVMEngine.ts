import { useJVMStore } from '../store/jvmStore';

export interface JVMObject {
  id: string;
  age: number;
  size: number;
  generation: 'eden' | 's0' | 's1' | 'old' | 'humongous';
  reachable: boolean;
  references: string[]; // IDs of other objects
  isRoot: boolean;
  type: string;
}

export class JVMEngine {
  objects: Map<string, JVMObject> = new Map();
  edenRef: JVMObject[] = [];
  oldGenRef: JVMObject[] = [];
  
  private idCounter = 0;
  
  tick() {
    const state = useJVMStore.getState();
    if (!state.isRunning || state.isSafepoint || state.oomStatus) return;

    // Simulate steady object creation rate scaled by playbackSpeed
    const newCount = Math.floor(Math.random() * 5 * state.playbackSpeed);
    for (let i = 0; i < newCount; i++) {
      const isRoot = Math.random() > 0.6;
      const newObj = this.allocateObject(Math.floor(Math.random() * 10) + 1, 'String', isRoot);
      
      // Randomly link this to an existing object to form a node graph
      if (this.edenRef.length > 1 && Math.random() > 0.5) {
        const target = this.edenRef[Math.floor(Math.random() * (this.edenRef.length - 1))];
        if (target.id !== newObj.id && !newObj.references.includes(target.id)) {
           newObj.references.push(target.id);
        }
      }
    }
    
    // Randomly drop roots to simulate dead properties
    this.objects.forEach(obj => {
      if (obj.isRoot && Math.random() > 0.95) {
        obj.isRoot = false;
      }
    });

    const config = state.flags;
    const youngGenTotal = Math.floor(config.Xmx / (config.NewRatio + 1));
    const edenTotal = Math.floor(youngGenTotal * (config.SurvivorRatio / (config.SurvivorRatio + 2)));
    
    const edenCurrentSize = this.edenRef.reduce((acc, obj) => acc + obj.size, 0);
    const oldCurrentSize = this.oldGenRef.reduce((acc, obj) => acc + obj.size, 0);

    if (edenCurrentSize + oldCurrentSize >= config.Xmx) {
      if (Math.random() > 0.5) state.triggerOOM("Java heap space");
      else state.triggerOOM("GC overhead limit exceeded");
      return;
    }

    if (edenCurrentSize > edenTotal) {
      this.runMinorGC();
    }

    this.publishMetrics();
  }

  allocateObject(size: number, type: string, isRoot: boolean): JVMObject {
    const obj: JVMObject = {
      id: `obj_${this.idCounter++}`,
      age: 0,
      size,
      generation: 'eden',
      reachable: true,
      references: [],
      isRoot,
      type
    };
    
    this.objects.set(obj.id, obj);
    this.edenRef.push(obj);
    return obj;
  }

  runMinorGC() {
    const state = useJVMStore.getState();
    state.setSafepoint(true); // Entering Stop-The-World

    const startTime = performance.now();
    
    const reachableIds = new Set<string>();
    const stack = Array.from(this.objects.values()).filter(o => o.isRoot);
    
    while (stack.length > 0) {
      const current = stack.pop()!;
      if (!reachableIds.has(current.id)) {
        reachableIds.add(current.id);
        current.references.forEach(refId => {
          const refObj = this.objects.get(refId);
          if (refObj) stack.push(refObj);
        });
      }
    }

    // Sweep Eden and handle Survivor/Promotion
    const config = state.flags;

    let preS0 = this.edenRef.length;
    this.edenRef = this.edenRef.filter(obj => reachableIds.has(obj.id));
    let postS0 = this.edenRef.length;

    const survivors: JVMObject[] = [];
    this.edenRef.forEach(obj => {
      obj.age++;
      if (obj.age >= config.MaxTenuringThreshold) {
        obj.generation = 'old';
        this.oldGenRef.push(obj);
      } else {
        survivors.push(obj);
      }
    });
    
    this.edenRef = survivors;

    // Cleanup dead objects from global map
    const newAliveCount = reachableIds.size;
    let deadObjCount = this.objects.size - newAliveCount;

    this.objects.forEach(obj => {
      if (!reachableIds.has(obj.id)) {
        this.objects.delete(obj.id);
      }
    });

    const duration = Math.round(performance.now() - startTime);

    useJVMStore.getState().addEvent(
      'Minor GC', 
      `Cleaned ${deadObjCount} objects, promoted ${preS0 - postS0} to Old Gen`, 
      duration
    );

    // Simulate STW holding for visual purposes (200ms)
    setTimeout(() => {
       useJVMStore.getState().setSafepoint(false);
    }, 200 + (Math.random() * 300));
  }

  publishMetrics() {
    const state = useJVMStore.getState();
    const edenCurrentSize = this.edenRef.reduce((acc, obj) => acc + obj.size, 0);
    const oldCurrentSize = this.oldGenRef.reduce((acc, obj) => acc + obj.size, 0);

    state.updateMetrics({
      edenUsed: edenCurrentSize, // MB pseudo unit
      oldGenUsed: oldCurrentSize,
      heapUsed: edenCurrentSize + oldCurrentSize,
      objectsAlive: this.objects.size,
      objectsDead: state.metrics.objectsDead + (Math.random() > 0.6 ? 1 : 0), // Fake increasing dead counter historically
    });
  }
}

export const instance = new JVMEngine();
