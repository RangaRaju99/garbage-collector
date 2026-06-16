import React, { Suspense, lazy } from 'react';
import { useJVMStore } from '../store/jvmStore';
import { motion } from 'framer-motion';
import { X, Loader2, Construction, ArrowLeft } from 'lucide-react';

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
  'L01': L01, 'L02': L02, 'L03': L03, 'L04': L04, 'L05': L05, 'L06': L06,
  'L07': L07, 'L08': L08, 'L09': L09, 'L10': L10, 'L11': L11, 'L12': L12,
  'L13': L13, 'L14': L14, 'L15': L15, 'L16': L16, 'L17': L17, 'L18': L18,
  'L19': L19, 'L20': L20, 'L21': L21, 'L22': L22, 'L23': L23, 'L24': L24,
  'L25': L25, 'L26': L26, 'L27': L27, 'L28': L28, 'L29': L29, 'L30': L30,
  'L31': L31, 'L32': L32, 'L33': L33, 'L34': L34, 'L35': L35, 'L36': L36,
  'L37': L37, 'L38': L38, '(' : L39, 'L39': L39, 'L40': L40, 'L41': L41, 'L42': L42,
};

export default function LevelRenderer() {
  const activeLevel = useJVMStore(state => state.activeLevel);
  const mode = useJVMStore(state => state.mode);
  const setLevel = (lvl: string) => useJVMStore.setState({ activeLevel: lvl });

  // Only render overlays if a specific level is active and NOT L00
  if (activeLevel === 'L00') return null;

  const ActiveComponent = LevelMap[activeLevel];

  return (
    <div className="absolute inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xl flex flex-col">
       {/* Minimalist Top Control Bar */}
       <div className="h-14 flex items-center justify-between px-6 shrink-0 z-50">
          <button 
            onClick={() => setLevel('L00')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all text-[11px] font-bold uppercase tracking-widest border border-white/5"
          >
            <ArrowLeft size={14} /> Back to Hub
          </button>
          
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-mono text-zinc-600 bg-white/5 px-2 py-0.5 rounded uppercase">{mode} MODE</span>
             <button 
               onClick={() => setLevel('L00')}
               className="w-8 h-8 flex items-center justify-center rounded-lg bg-status-error/10 text-status-error hover:bg-status-error hover:text-white transition-all border border-status-error/20"
             >
               <X size={16} />
             </button>
          </div>
       </div>

       {/* Level Content Area */}
       <div className="flex-1 overflow-hidden relative">
          <Suspense fallback={
            <div className="h-full w-full flex items-center justify-center">
               <div className="flex flex-col items-center gap-4">
                  <Loader2 size={32} className="text-brand-primary animate-spin" />
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Loading Neural Link...</span>
               </div>
            </div>
          }>
             {ActiveComponent ? (
                <ActiveComponent />
             ) : (
                <div className="h-full flex items-center justify-center p-20 text-center">
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                     className="max-w-md space-y-6"
                   >
                      <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mx-auto">
                        <Construction size={32} className="text-brand-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tight">Access restricted</h2>
                        <p className="text-[13px] text-zinc-500 font-medium leading-relaxed">
                          Level <span className="text-zinc-300 font-mono">{activeLevel}</span> is currently being synthesized in the JVM development lab. 
                          Check back after the next runtime update.
                        </p>
                      </div>
                      <button 
                        onClick={() => setLevel('L00')}
                        className="px-8 py-3 bg-white text-black rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all"
                      >
                         Return to Hub
                      </button>
                   </motion.div>
                </div>
             )}
          </Suspense>
       </div>
    </div>
  );
}
