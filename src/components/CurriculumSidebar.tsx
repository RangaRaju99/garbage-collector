import { useJVMStore } from '../store/jvmStore';
import { BookOpen, Video } from 'lucide-react';

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
    if (id === 'L34') {
      setMode('movie');
    } else {
      setMode('learn');
    }
    
    if(camInfo === 'targetEden') setCam('objectBirth');
    else setCam(camInfo);
  };

  return (
    <aside className="w-64 border-r border-[rgba(0,212,255,0.2)] bg-primary-bg-alt overflow-y-auto shrink-0 flex flex-col custom-scrollbar">
      {/* Header */}
      <div className="p-5 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.2)]">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-1">
          <BookOpen size={14} className="text-accent-alive" /> CURRICULUM
        </h3>
        <p className="text-[10px] text-gray-500 font-mono">0% Completed (0/42)</p>
      </div>

      {/* Levels Map */}
      <div className="flex-1 px-3 py-4 space-y-6">
        {['BEGINNER TRACK', 'INTERMEDIATE', 'INTERVIEW MODE', 'ADVANCED', 'JVM ENGINEER', 'MOVIE MODE'].map((sectionTitle) => (
          <div key={sectionTitle}>
             <h4 className="text-[10px] text-gray-500 font-bold tracking-widest mb-2 pl-2">
               {sectionTitle === 'MOVIE MODE' ? <Video size={10} className="inline mr-1"/> : null}
               {sectionTitle}
             </h4>
             <div className="space-y-1">
                {curriculum.filter(x => x.section === sectionTitle).map((lvl) => {
                   const isActive = activeLevel === lvl.id;
                   return (
                     <button
                       key={lvl.id}
                       onClick={() => handleSelect(lvl.id, lvl.cam)}
                       className={`w-full text-left px-3 py-2 rounded font-sans text-xs flex items-center justify-between transition-all border ${
                         isActive 
                           ? 'bg-[rgba(0,212,255,0.1)] text-white border-accent-alive shadow-[0_0_10px_rgba(0,212,255,0.2)]' 
                           : 'bg-transparent text-gray-400 border-transparent hover:bg-[rgba(255,255,255,0.05)] hover:text-gray-200'
                       }`}
                     >
                       <div className="flex items-center gap-2 truncate">
                          <span className={`font-mono text-[9px] ${isActive ? 'text-accent-alive' : 'text-gray-500'}`}>{lvl.id}</span>
                          <span className="truncate max-w-[130px] font-medium">{lvl.title}</span>
                       </div>
                       {isActive && <div className="w-1.5 h-1.5 rounded-full bg-accent-alive shadow-[0_0_5px_rgba(0,212,255,1)] animate-pulse" />}
                     </button>
                   );
                })}
             </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
