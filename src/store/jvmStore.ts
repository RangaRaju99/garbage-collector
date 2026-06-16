import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type GCAlgorithm = 'Serial' | 'Parallel' | 'CMS' | 'G1' | 'ZGC' | 'Shenandoah' | 'Epsilon';
export type AppMode = 'explore' | 'movie' | 'sandbox' | 'detective' | 'learn';
export type LearnSubMode = 'beginner' | 'intermediate' | 'interview' | 'engineer';

export interface HeapObject {
  id: string;
  type: string;
  region: 'eden' | 'survivor' | 'oldGen' | 'metaspace';
  age: number;
  sizeKB: number;
  color: string;
  reachable: boolean;
}

export interface JVMState {
  // Phase & Core control
  isRunning: boolean;
  playbackSpeed: number;
  javaVersion: string;
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
    UseG1GC: boolean;
    UseZGC: boolean;
    UseParallelGC: boolean;
    UseSerialGC: boolean;
    MaxMetaspaceSize: number;
    ReservedCodeCacheSize: number;
  };
  
  // Simulated Memory Statistics
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
  
  events: Array<{ time: number; type: string; message: string; durationMs: number }>;
  objects: HeapObject[];

  hasStarted: boolean;
  isSafepoint: boolean;
  oomStatus: string | null;
  xrayMode: boolean;
  activeLevel: string;
  mode: AppMode;
  learnSubMode: LearnSubMode;
  activeCameraSequence: 'default' | 'objectBirth' | 'markPhase' | 'sweepPhase' | 'promotion' | 'islandCollapse' | 'fullGCFreeze';

  showObjectHeaders: boolean;
  showTLABBoundaries: boolean;
  showCardTable: boolean;
  showNMT: boolean;
  showGCThreads: boolean;

  // Actions
  setStarted: (started: boolean) => void;
  setSafepoint: (active: boolean) => void;
  triggerOOM: (type: string) => void;
  clearOOM: () => void;
  toggleXRay: () => void;
  requestGC: () => void;
  injectLeak: () => void;
  toggleObjectHeaders: () => void;
  toggleTLABBoundaries: () => void;
  toggleCardTable: () => void;
  toggleNMT: () => void;
  toggleGCThreads: () => void;
  setSimulationSpeed: (speed: number) => void;
  setLevel: (levelId: string) => void;
  setMode: (mode: AppMode) => void;
  setVersion: (version: string) => void;
  setIsPlaying: (playing: boolean) => void;
  setCameraSequence: (seq: JVMState['activeCameraSequence']) => void;
  setFlag: (key: keyof JVMState['flags'], value: any) => void;
  setAlgorithm: (algo: GCAlgorithm) => void;
  updateMetrics: (newMetrics: Partial<JVMState['metrics']>) => void;
  addEvent: (type: string, message: string, durationMs: number) => void;
  setObjects: (objects: HeapObject[]) => void;
  addObject: (object: HeapObject) => void;
  togglePlayback: () => void;
}

export const useJVMStore = create<JVMState>()(
  immer((set) => ({
    isRunning: true,
    playbackSpeed: 1.0,
    javaVersion: '8',
    gcAlgorithm: 'G1',

    flags: {
      Xmx: 512,
      Xms: 256,
      NewRatio: 2,
      SurvivorRatio: 8,
      MaxTenuringThreshold: 15,
      UseCompressedOops: true,
      UseTLAB: true,
      UseG1GC: true,
      UseZGC: false,
      UseParallelGC: false,
      UseSerialGC: false,
      MaxMetaspaceSize: 128,
      ReservedCodeCacheSize: 240,
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
    objects: [],

    hasStarted: false,
    isSafepoint: false,
    xrayMode: false,
    oomStatus: null,
    activeLevel: 'L00',
    mode: 'explore',
    learnSubMode: 'beginner',
    activeCameraSequence: 'default',

    showObjectHeaders: false,
    showTLABBoundaries: false,
    showCardTable: false,
    showNMT: false,
    showGCThreads: false,

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

    setMode: (mode) => set((state) => {
      state.mode = mode;
    }),

    setVersion: (version) => set((state) => {
      state.javaVersion = version;
    }),

    setCameraSequence: (seq) => set((state) => {
       state.activeCameraSequence = seq;
    }),

    requestGC: () => set((state) => {
      state.events.unshift({ time: Date.now(), type: 'GC_REQ', message: 'Manual System.gc() triggered', durationMs: 45 });
      state.metrics.heapUsed = Math.max(state.metrics.heapUsed * 0.3, 10);
      state.metrics.edenUsed = 0;
      state.metrics.survivorUsed = Math.max(state.metrics.survivorUsed * 0.5, 2);
    }),

    injectLeak: () => set((state) => {
      state.events.unshift({ time: Date.now(), type: 'LEAK', message: 'Static collection memory leak injected', durationMs: 0 });
    }),

    toggleObjectHeaders: () => set((state) => { state.showObjectHeaders = !state.showObjectHeaders; }),
    toggleTLABBoundaries: () => set((state) => { state.showTLABBoundaries = !state.showTLABBoundaries; }),
    toggleCardTable: () => set((state) => { state.showCardTable = !state.showCardTable; }),
    toggleNMT: () => set((state) => { state.showNMT = !state.showNMT; }),
    toggleGCThreads: () => set((state) => { state.showGCThreads = !state.showGCThreads; }),

    setSimulationSpeed: (speed) => set((state) => { state.playbackSpeed = speed; }),
    setIsPlaying: (playing) => set((state) => { state.isRunning = playing; }),

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

    setObjects: (objects) => set((state) => {
      state.objects = objects;
    }),

    addObject: (object) => set((state) => {
      state.objects.push(object);
      if (state.objects.length > 200) state.objects.shift();
    }),

    togglePlayback: () => set((state) => {
      state.isRunning = !state.isRunning;
    })
  }))
);
