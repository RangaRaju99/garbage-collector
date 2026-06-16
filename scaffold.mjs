import fs from 'fs';
import path from 'path';

const dirs = [
  'simulator',
  'simulator/GCAlgorithms',
  'scenes',
  'components',
  'levels',
  'chapters',
  'modes',
  'store',
  'hooks',
  'services',
  'layouts',
  'routes',
  'design-system',
  'utils'
];

const files = {
  'simulator/HeapManager.ts': 'export class HeapManager {}',
  'simulator/GCAlgorithms/SerialGC.ts': 'export class SerialGC {}',
  'simulator/GCAlgorithms/ParallelGC.ts': 'export class ParallelGC {}',
  'simulator/GCAlgorithms/CMS.ts': 'export class CMS {}',
  'simulator/GCAlgorithms/G1GC.ts': 'export class G1GC {}',
  'simulator/GCAlgorithms/ZGC.ts': 'export class ZGC {}',
  'simulator/GCAlgorithms/ShenandoahGC.ts': 'export class ShenandoahGC {}',
  'simulator/GCAlgorithms/EpsilonGC.ts': 'export class EpsilonGC {}',
  'simulator/AllocationEngine.ts': 'export class AllocationEngine {}',
  'simulator/ObjectLifecycle.ts': 'export class ObjectLifecycle {}',
  'simulator/ReferenceTracker.ts': 'export class ReferenceTracker {}',
  'simulator/ClassLoader.ts': 'export class ClassLoader {}',
  'simulator/PermGenEngine.ts': 'export class PermGenEngine {}',
  'simulator/MetaspaceEngine.ts': 'export class MetaspaceEngine {}',
  'simulator/StringPool.ts': 'export class StringPool {}',
  'simulator/EscapeAnalysis.ts': 'export class EscapeAnalysis {}',
  'simulator/TLABEngine.ts': 'export class TLABEngine {}',
  'simulator/PLABEngine.ts': 'export class PLABEngine {}',
  'simulator/ObjectHeaderEngine.ts': 'export class ObjectHeaderEngine {}',
  'simulator/CardTable.ts': 'export class CardTable {}',
  'simulator/RememberedSet.ts': 'export class RememberedSet {}',
  'simulator/SATBEngine.ts': 'export class SATBEngine {}',
  'simulator/SafepointEngine.ts': 'export class SafepointEngine {}',
  'simulator/JITEngine.ts': 'export class JITEngine {}',
  'simulator/CodeCache.ts': 'export class CodeCache {}',
  'simulator/CompressedOOPs.ts': 'export class CompressedOOPs {}',
  'simulator/NativeMemoryTracker.ts': 'export class NativeMemoryTracker {}',
  'simulator/RuntimeEngine.ts': 'export class RuntimeEngine {}',
  'simulator/FinalizationQueue.ts': 'export class FinalizationQueue {}',
  'simulator/GCThreads.ts': 'export class GCThreads {}',
  'simulator/BytecodeEngine.ts': 'export class BytecodeEngine {}',

  // React Scenes
  ...[
    'EdenScene', 'SurvivorScene', 'OldGenScene', 'MetaspaceScene', 'PermGenScene', 
    'StackScene', 'IslandScene', 'StringPoolScene', 'DirectMemoryScene', 
    'CodeCacheScene', 'NativeMemoryScene', 'G1RegionGridScene'
  ].reduce((acc, name) => ({...acc, [`scenes/${name}.tsx`]: `export default function ${name}() { return null; }`}), {}),

  // React Components
  ...[
    'ObjectCharacter', 'ObjectHeaderViewer', 'ReferenceBeam', 'ReferenceQueue', 
    'WeakHashMapViz', 'GCRobot', 'GCThreadPanel', 'NarratorOverlay', 
    'RuntimeMonitor', 'BytecodeViewer', 'CardTable', 
    'CompressedOOPsViewer', 'OOMErrorOverlay', 'NMTDashboard'
  ].reduce((acc, name) => ({...acc, [`components/${name}.tsx`]: `export default function ${name}() { return null; }`}), {}),

  // Modes
  ...[
    'MovieMode', 'ExploreMode', 'SandboxMode', 'DetectiveMode', 'LearnMode'
  ].reduce((acc, name) => ({...acc, [`modes/${name}.tsx`]: `export default function ${name}() { return null; }`}), {}),

  // Chapters
  ...[
    'JavaVersionTimeline', 'PermGenChapter', 'MetaspaceChapter', 'ClassLoadingChapter',
    'StringPoolChapter', 'EscapeAnalysisChapter', 'TLABChapter', 'ObjectHeaderChapter',
    'CardTableChapter', 'HumongousChapter', 'DirectMemoryChapter', 'JITGCChapter',
    'FinalizationChapter', 'CleanerAPIChapter', 'OOMChapter', 'MonitoringChapter',
    'RuntimeClassChapter', 'WeakHashMapChapter', 'ReferenceQueueChapter', 'SoftRefCacheChapter',
    'PhantomRefChapter', 'ObjectResurrectionChapter', 'CompressedOOPsChapter', 'CodeCacheChapter',
    'NMTChapter', 'GCLoggingChapter', 'CollectorEvolutionChapter'
  ].reduce((acc, name) => ({...acc, [`chapters/${name}.tsx`]: `export default function ${name}() { return null; }`}), {})
};

// 34 Levels
for(let i=1; i<=34; i++) {
  const pad = i.toString().padStart(2, '0');
  files[`levels/L${pad}_Level.tsx`] = `export default function L${pad}_Level() { return null; }`;
}

dirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), 'src', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

Object.entries(files).forEach(([file, content]) => {
  const fullPath = path.join(process.cwd(), 'src', file);
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, content);
  }
});

console.log('Scaffolding complete.');
