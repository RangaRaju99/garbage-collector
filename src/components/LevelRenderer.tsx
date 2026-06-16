import React, { Suspense, lazy } from 'react';
import { useJVMStore } from '../store/jvmStore';

// Lazy load actual level components
const L01 = lazy(() => import('../levels/L01_Level'));
const L02 = lazy(() => import('../levels/L02_Level'));
const L03 = lazy(() => import('../levels/L03_Level'));
const L04 = lazy(() => import('../levels/L04_Level'));
const L05 = lazy(() => import('../levels/L05_Level'));
const L06 = lazy(() => import('../levels/L06_Level'));
const L07 = lazy(() => import('../levels/L07_Level'));
const L08 = lazy(() => import('../levels/L08_Level'));
const L09 = lazy(() => import('../levels/L09_Level'));
const L10 = lazy(() => import('../levels/L10_Level'));
const L11 = lazy(() => import('../levels/L11_Level'));
const L12 = lazy(() => import('../levels/L12_Level'));
const L13 = lazy(() => import('../levels/L13_Level'));
const L14 = lazy(() => import('../levels/L14_Level'));
const L15 = lazy(() => import('../levels/L15_Level'));
const L16 = lazy(() => import('../levels/L16_Level'));
const L17 = lazy(() => import('../levels/L17_Level'));
const L18 = lazy(() => import('../levels/L18_Level'));
const L19 = lazy(() => import('../levels/L19_Level'));
const L20 = lazy(() => import('../levels/L20_Level'));
const L21 = lazy(() => import('../levels/L21_Level'));
const L22 = lazy(() => import('../levels/L22_Level'));
const L23 = lazy(() => import('../levels/L23_Level'));
const L24 = lazy(() => import('../levels/L24_Level'));
const L25 = lazy(() => import('../levels/L25_Level'));
const L26 = lazy(() => import('../levels/L26_Level'));
const L27 = lazy(() => import('../levels/L27_Level'));
const L28 = lazy(() => import('../levels/L28_Level'));
const L29 = lazy(() => import('../levels/L29_Level'));
const L30 = lazy(() => import('../levels/L30_Level'));
const L31 = lazy(() => import('../levels/L31_Level'));
const L32 = lazy(() => import('../levels/L32_Level'));
const L33 = lazy(() => import('../levels/L33_Level'));
const L34 = lazy(() => import('../levels/L34_Level'));
const L35 = lazy(() => import('../levels/L35_Level'));
const L36 = lazy(() => import('../levels/L36_Level'));
const L37 = lazy(() => import('../levels/L37_Level'));
const L38 = lazy(() => import('../levels/L38_Level'));
const L39 = lazy(() => import('../levels/L39_Level'));
const L40 = lazy(() => import('../levels/L40_Level'));
const L41 = lazy(() => import('../levels/L41_Level'));
const L42 = lazy(() => import('../levels/L42_Level'));

const LevelMap: Record<string, React.FC> = {
  'L01': L01,
  'L02': L02,
  'L03': L03,
  'L04': L04,
  'L05': L05,
  'L06': L06,
  'L07': L07,
  'L08': L08,
  'L09': L09,
  'L10': L10,
  'L11': L11,
  'L12': L12,
  'L13': L13,
  'L14': L14,
  'L15': L15,
  'L16': L16,
  'L17': L17,
  'L18': L18,
  'L19': L19,
  'L20': L20,
  'L21': L21,
  'L22': L22,
  'L23': L23,
  'L24': L24,
  'L25': L25,
  'L26': L26,
  'L27': L27,
  'L28': L28,
  'L29': L29,
  'L30': L30,
  'L31': L31,
  'L32': L32,
  'L33': L33,
  'L34': L34,
  'L35': L35,
  'L36': L36,
  'L37': L37,
  'L38': L38,
  'L39': L39,
  'L40': L40,
  'L41': L41,
  'L42': L42,
};

export default function LevelRenderer() {
  const activeLevel = useJVMStore(state => state.activeLevel);
  const mode = useJVMStore(state => state.mode);

  // Only render levels if in learn mode or if a specific level is active
  if (mode !== 'learn' && activeLevel === 'L00') return null;

  const ActiveComponent = LevelMap[activeLevel];

  if (!ActiveComponent) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 text-white p-20 text-center">
        <div>
           <h2 className="text-2xl font-black mb-4">Level {activeLevel} Under Construction</h2>
           <p className="text-gray-400">This immersive module is currently being finalized in the JVM city development cycle.</p>
           <div className="mt-8 px-4 py-2 bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.3)] rounded text-[#00d4ff] text-xs font-bold animate-pulse">
              COMING SOON
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md">
       <Suspense fallback={<div className="h-full w-full flex items-center justify-center"><div className="w-10 h-10 border-4 border-dashed border-accent-alive rounded-full animate-spin"/></div>}>
          <ActiveComponent />
       </Suspense>
       
       {/* Global Level Controls */}
       <button 
         onClick={() => useJVMStore.getState().setLevel('L00')}
         className="absolute top-6 right-6 w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition z-50"
       >
         ✕
       </button>
    </div>
  );
}
