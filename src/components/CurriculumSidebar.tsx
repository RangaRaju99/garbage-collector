import { useJVMStore } from '../store/jvmStore';
import { BookOpen, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const curriculum = [
  { id: 'L01', title: 'Why GC Exists', section: 'BEGINNER TRACK', cam: 'default' },
  { id: 'L02', title: 'Manual vs. Managed', section: 'BEGINNER TRACK', cam: 'default' },
  { id: 'L03', title: 'Memory Safety', section: 'BEGINNER TRACK', cam: 'default' },
  { id: 'L04', title: 'Object Creation (Birth)', section: 'BEGINNER TRACK', cam: 'objectBirth' },
  { id: 'L05', title: 'Object Memory Layout', section: 'BEGINNER TRACK', cam: 'default' },
  { id: 'L06', title: 'Field Reordering', section: 'BEGINNER TRACK', cam: 'default' },
  { id: 'L07', title: 'Mark & Sweep', section: 'BEGINNER TRACK', cam: 'markPhase' },
  { id: 'L08', title: 'Aging & Tenuring', section: 'INTERMEDIATE', cam: 'promotion' },
  { id: 'L09', title: 'Stop-The-World', section: 'BEGINNER TRACK', cam: 'fullGCFreeze' },
  { id: 'L10', title: 'Generational Theory', section: 'INTERMEDIATE', cam: 'markPhase' },
  { id: 'L11', title: 'Young Generation / Eden', section: 'INTERMEDIATE', cam: 'targetEden' },
  { id: 'L12', title: 'Survivor Spaces', section: 'INTERMEDIATE', cam: 'promotion' },
  { id: 'L13', title: 'Survival Curves', section: 'INTERMEDIATE', cam: 'default' },
  { id: 'L14', title: 'Card Tables', section: 'INTERMEDIATE', cam: 'markPhase' },
  { id: 'L15', title: 'Remembered Sets', section: 'INTERMEDIATE', cam: 'targetEden' },
  { id: 'L16', title: 'GC Algorithm Overview', section: 'INTERVIEW MODE', cam: 'fullGCFreeze' },
  { id: 'L17', title: 'Serial GC', section: 'INTERVIEW MODE', cam: 'default' },
  { id: 'L18', title: 'Parallel GC', section: 'INTERVIEW MODE', cam: 'default' },
  { id: 'L19', title: 'CMS GC', section: 'INTERVIEW MODE', cam: 'default' },
  { id: 'L20', title: 'G1 GC (Regional)', section: 'INTERVIEW MODE', cam: 'targetEden' },
  { id: 'L21', title: 'ZGC (Colored Pointers)', section: 'INTERVIEW MODE', cam: 'markPhase' },
  { id: 'L22', title: 'Shenandoah', section: 'INTERVIEW MODE', cam: 'default' },
  { id: 'L23', title: 'Epsilon GC', section: 'INTERVIEW MODE', cam: 'default' },
  { id: 'L24', title: 'Native Image (GraalVM)', section: 'INTERVIEW MODE', cam: 'default' },
  { id: 'L25', title: 'Safepoints', section: 'INTERMEDIATE', cam: 'fullGCFreeze' },
  { id: 'L26', title: 'Metaspace vs. PermGen', section: 'INTERMEDIATE', cam: 'default' },
  { id: 'L27', title: 'String Deduplication', section: 'ADVANCED', cam: 'default' },
  { id: 'L28', title: 'Reference Types', section: 'ADVANCED', cam: 'default' },
  { id: 'L29', title: 'Memory Leaks Gallery', section: 'ADVANCED', cam: 'default' },
  { id: 'L30', title: 'OOM Errors Simulator', section: 'INTERVIEW MODE', cam: 'default' },
  { id: 'L31', title: 'JIT & Code Cache', section: 'ADVANCED', cam: 'default' },
  { id: 'L32', title: 'Native Memory (NMT)', section: 'ADVANCED', cam: 'default' },
  { id: 'L33', title: 'GC Log Visualizer', section: 'ADVANCED', cam: 'default' },
  { id: 'L34', title: 'Movie Mode (Cinematic)', section: 'MOVIE MODE', cam: 'objectBirth' },
  { id: 'L35', title: 'Runtime.getRuntime()', section: 'JVM ENGINEER', cam: 'default' },
  { id: 'L36', title: 'WeakHashMap Mastery', section: 'JVM ENGINEER', cam: 'default' },
  { id: 'L37', title: 'SoftReference Caching', section: 'JVM ENGINEER', cam: 'default' },
  { id: 'L38', title: 'PhantomRef & Queues', section: 'JVM ENGINEER', cam: 'default' },
  { id: 'L39', title: 'Metaspace Leaks', section: 'JVM ENGINEER', cam: 'default' },
  { id: 'L40', title: 'Object Resurrection', section: 'JVM ENGINEER', cam: 'default' },
  { id: 'L41', title: 'Finalization Pipeline', section: 'JVM ENGINEER', cam: 'default' },
  { id: 'L42', title: 'Evolution Timeline', section: 'JVM ENGINEER', cam: 'default' },
];

export default function CurriculumSidebar() {
  const activeLevel = useJVMStore(state => state.activeLevel);
  const setLevel = useJVMStore(state => state.setLevel);
  const setCam = useJVMStore(state => state.setCameraSequence);
  const setMode = useJVMStore(state => state.setMode);

  const handleSelect = (id: string, camInfo: any) => {
    setLevel(id);
    if (id === 'L34') setMode('movie');
    else setMode('learn');
    
    if(camInfo === 'targetEden') setCam('objectBirth');
    else setCam(camInfo);
  };

  return (
    <div className="flex flex-col h-full bg-surface-primary overflow-hidden font-sans border-r border-white/5">
      {/* Header Panel */}
      <div className="p-5 border-b border-white/5 bg-black/20">
        <div className="flex items-center justify-between mb-5">
           <div className="flex flex-col">
             <h3 className="text-[14px] font-bold text-white tracking-tight">Curriculum</h3>
             <span className="text-[10px] text-zinc-500 font-medium">Internal Diagnostics</span>
           </div>
           <div className="w-8 h-8 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
             <BookOpen size={14} className="text-brand-primary" />
           </div>
        </div>
        
        {/* Progress System */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] items-center px-0.5">
            <span className="text-zinc-500 font-bold tracking-widest uppercase">Progress</span>
            <span className="text-brand-primary font-mono font-bold">12 / 42</span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: '28%' }}
               className="h-full bg-brand-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
               transition={{ duration: 1.5, ease: "easeOut" }}
             />
          </div>
        </div>
      </div>

      {/* Level Navigation */}
      <div className="flex-1 py-4 space-y-7 overflow-y-auto custom-scrollbar">
        {['BEGINNER TRACK', 'INTERMEDIATE', 'INTERVIEW MODE', 'ADVANCED', 'JVM ENGINEER', 'MOVIE MODE'].map((sectionTitle) => {
          const sectionLevels = curriculum.filter(x => x.section === sectionTitle);
          if (sectionLevels.length === 0) return null;

          return (
            <div key={sectionTitle} className="px-2">
               <h4 className="px-4 text-[9px] text-zinc-600 font-black tracking-[0.2em] uppercase mb-2">
                 {sectionTitle}
               </h4>
               <div className="space-y-0.5">
                  {sectionLevels.map((lvl) => {
                     const isActive = activeLevel === lvl.id;
                     return (
                       <button
                         key={lvl.id}
                         onClick={() => handleSelect(lvl.id, lvl.cam)}
                         className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-150 group relative ${
                           isActive 
                             ? 'bg-white/[0.05] text-white shadow-sm' 
                             : 'text-zinc-500 hover:bg-white/[0.02] hover:text-zinc-300'
                         }`}
                       >
                         <div className="flex items-center gap-3">
                            <span className={`font-mono text-[9px] w-5 text-center transition-colors ${isActive ? 'text-brand-primary font-black' : 'text-zinc-700 group-hover:text-zinc-500'}`}>
                              {lvl.id.replace('L', '')}
                            </span>
                            <span className={`text-[11px] font-medium truncate transition-colors ${isActive ? 'text-white' : ''}`}>
                              {lvl.title}
                            </span>
                            {isActive && (
                              <motion.div 
                                layoutId="active-nav-pill"
                                className="absolute left-1 top-2 bottom-2 w-[2px] bg-brand-primary rounded-full" 
                              />
                            )}
                         </div>
                       </button>
                     );
                  })}
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
