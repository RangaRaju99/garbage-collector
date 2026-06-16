import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type GCAlgorithm = 'Serial' | 'Parallel' | 'CMS' | 'G1' | 'ZGC' | 'Shenandoah' | 'Epsilon';

export interface JVMState {
  // Phase & Core control
  isRunning: boolean;
  playbackSpeed: number;
  javaVersion: number;
  gcAlgorithm: GCAlgorithm;
  
  // JVM Flags mappings
  flags: {
    Xmx: number;
    Xms: number;
    NewRatio: number;
    SurvivorRatio: number;
    MaxTenuringThreshold: number;
    UseCompressedOops: boolean;
    UseTLAB: boolean;
  };
  
  // Simulated Memory Statistics (real-time metrics)
  metrics: {
    heapUsed: number;
    edenUsed: number;
    survivorUsed: number;
    oldGenUsed: number;
    metaspaceUsed: number;
    objectsAlive: number;
    objectsDead: number;
    pauseTimeMax: number;
    pauseTimeAvg: number;
  };
  
  // Recent events log
  events: Array<{ time: number; type: string; message: string; durationMs: number }>;

  // App State
  hasStarted: boolean;
  isSafepoint: boolean;
  oomStatus: string | null;
  xrayMode: boolean;
  activeLevel: string;
  activeCameraSequence: 'default' | 'objectBirth' | 'markPhase' | 'sweepPhase' | 'promotion' | 'islandCollapse' | 'fullGCFreeze';

  // Actions
  setStarted: (started: boolean) => void;
  setSafepoint: (active: boolean) => void;
  triggerOOM: (type: string) => void;
  clearOOM: () => void;
  toggleXRay: () => void;
  setLevel: (levelId: string) => void;
  setCameraSequence: (seq: JVMState['activeCameraSequence']) => void;
  setFlag: (key: keyof JVMState['flags'], value: any) => void;
  setAlgorithm: (algo: GCAlgorithm) => void;
  updateMetrics: (newMetrics: Partial<JVMState['metrics']>) => void;
  addEvent: (type: string, message: string, durationMs: number) => void;
  togglePlayback: () => void;
}

export const useJVMStore = create<JVMState>()(
  immer((set) => ({
    isRunning: true,
    playbackSpeed: 1.0,
    javaVersion: 21,
    gcAlgorithm: 'G1',

    flags: {
      Xmx: 512,
      Xms: 256,
      NewRatio: 2,
      SurvivorRatio: 8,
      MaxTenuringThreshold: 15,
      UseCompressedOops: true,
      UseTLAB: true,
    },

    metrics: {
      heapUsed: 10,
      edenUsed: 8,
      survivorUsed: 0,
      oldGenUsed: 2,
      metaspaceUsed: 34,
      objectsAlive: 0,
      objectsDead: 0,
      pauseTimeMax: 0,
      pauseTimeAvg: 0,
    },

    events: [],
    
    hasStarted: false,
    isSafepoint: false,
    xrayMode: false,
    oomStatus: null,
    activeLevel: 'L00',
    activeCameraSequence: 'default',

    setStarted: (started) => set((state) => {
      state.hasStarted = started;
    }),

    setSafepoint: (active) => set((state) => {
      state.isSafepoint = active;
    }),

    triggerOOM: (type) => set((state) => {
      state.oomStatus = type;
      state.isRunning = false;
    }),

    clearOOM: () => set((state) => {
      state.oomStatus = null;
    }),

    toggleXRay: () => set((state) => {
       state.xrayMode = !state.xrayMode;
    }),

    setLevel: (levelId) => set((state) => {
       state.activeLevel = levelId;
    }),

    setCameraSequence: (seq) => set((state) => {
       state.activeCameraSequence = seq;
    }),

    setFlag: (key, value) => set((state) => {
      // @ts-ignore
      state.flags[key] = value;
    }),
    
    setAlgorithm: (algo) => set((state) => {
      state.gcAlgorithm = algo;
    }),

    updateMetrics: (newMetrics) => set((state) => {
      state.metrics = { ...state.metrics, ...newMetrics };
    }),

    addEvent: (type, message, durationMs) => set((state) => {
      state.events.unshift({ time: Date.now(), type, message, durationMs });
      if (state.events.length > 50) state.events.pop();
    }),
    
    togglePlayback: () => set((state) => {
      state.isRunning = !state.isRunning;
    })
  }))
);
