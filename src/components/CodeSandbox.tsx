import { useState } from 'react';
import { Play, RotateCcw, Terminal, Cpu, FileCode, CheckCircle2 } from 'lucide-react';
import { useJVMStore } from '../store/jvmStore';
import { instance as jvmEngine } from '../simulator/JVMEngine';
import { motion, AnimatePresence } from 'framer-motion';

export default function CodeSandbox() {
  const [code, setCode] = useState<string>(
`Employee e1 = new Employee("Alice");
Employee e2 = new Employee("Bob");
e1.manager = e2;
// e2 = null;
// System.gc();`
  );
  
  const [bytecode, setBytecode] = useState<string[]>([]);
  const [output, setOutput] = useState<string[]>([]);

  const handleRun = () => {
    setOutput([]);
    setBytecode([]);
    const lines = code.split('\n');
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//')) return;

      if (trimmed.includes('new ')) {
        const typeMatch = trimmed.match(/new (\w+)/);
        const type = typeMatch ? typeMatch[1] : 'Object';
        jvmEngine.allocateObject(24, type, true);
        
        setBytecode(prev => [...prev, `new #${Math.floor(Math.random() * 10)}`, 'dup', `v-special #${Math.floor(Math.random() * 10)}`, 'astore_1']);
        setOutput(prev => [...prev, `ALLOC [${type}] → Eden (24KB)`]);
      } 
      else if (trimmed.includes('System.gc()')) {
        setBytecode(prev => [...prev, 'invokestatic #System.gc()']);
        setOutput(prev => [...prev, `GC Request sent to JVM`]);
        useJVMStore.getState().addEvent('INFO', 'System.gc() triggered', 0);
        jvmEngine.runMinorGC();
      }
      else if (trimmed.includes('= null')) {
        setBytecode(prev => [...prev, 'aconst_null', 'astore_1']);
        setOutput(prev => [...prev, `REF NULL [Root dropped]`]);
        if (jvmEngine.edenRef.length > 0) jvmEngine.edenRef[0].isRoot = false;
      }
      else if (trimmed.includes('.manager =')) {
        setBytecode(prev => [...prev, 'aload_1', 'aload_2', 'putfield #manager']);
        setOutput(prev => [...prev, `LINK [e1] → [e2]`]);
      }
    });

    jvmEngine.publishMetrics();
  };

  const handleReset = () => {
    setCode(`Employee e1 = new Employee("Alice");\nEmployee e2 = new Employee("Bob");\ne1.manager = e2;`);
    setOutput([]);
    setBytecode([]);
  };

  return (
    <div className="flex-1 flex flex-col bg-surface-primary overflow-hidden font-sans border-l border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
            <FileCode size={14} />
          </div>
          <div>
            <h2 className="text-[11px] font-black text-white tracking-widest uppercase">Java Workspace</h2>
            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Runtime Inspector</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button onClick={handleReset} className="p-2 text-zinc-500 hover:text-zinc-200 hover:bg-white/5 rounded-lg transition-all" title="Reset Workspace">
            <RotateCcw size={14} />
          </button>
          <button 
            onClick={handleRun} 
            className="flex items-center gap-2 px-4 py-1.5 bg-brand-primary text-white rounded-lg text-[11px] font-black tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-brand-primary/20 active:scale-95"
          >
            <Play size={12} fill="currentColor" /> RUN
          </button>
        </div>
      </div>

      {/* Code Editor Area */}
      <div className="h-56 shrink-0 relative flex flex-col border-b border-white/5 bg-black/40">
        <div className="px-5 py-1.5 bg-white/5 border-b border-white/5 flex items-center justify-between">
           <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Main.java</span>
           <div className="flex gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
           </div>
        </div>
        <textarea 
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 bg-transparent text-zinc-300 p-5 font-mono text-[12px] leading-relaxed resize-none focus:outline-none custom-scrollbar"
          spellCheck={false}
        />
      </div>

      {/* Multi-Output Panel */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Bytecode Stream */}
        <div className="w-[45%] flex flex-col border-r border-white/5">
           <div className="px-5 py-2 bg-black/20 border-b border-white/5 flex items-center gap-2">
              <Cpu size={10} className="text-zinc-600" />
              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Instruction Set</span>
           </div>
           <div className="flex-1 p-5 overflow-y-auto custom-scrollbar font-mono text-[11px] space-y-1.5 text-zinc-500">
             <AnimatePresence initial={false}>
               {bytecode.map((cmd, i) => (
                 <motion.div key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
                   <span className="text-zinc-800 w-4 text-right">{i * 3}</span>
                   <span className={cmd.startsWith('new') ? 'text-brand-primary' : 'text-zinc-500'}>{cmd}</span>
                 </motion.div>
               ))}
               {bytecode.length === 0 && <div className="italic opacity-30 px-7 pt-4">No instructions generated...</div>}
             </AnimatePresence>
           </div>
        </div>

        {/* Runtime Diagnostics */}
        <div className="flex-1 flex flex-col bg-black/10">
           <div className="px-5 py-2 bg-black/20 border-b border-white/5 flex items-center gap-2">
              <Terminal size={10} className="text-zinc-600" />
              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Runtime Analytics</span>
           </div>
           <div className="flex-1 p-5 overflow-y-auto custom-scrollbar space-y-3">
             <AnimatePresence initial={false}>
               {output.map((out, i) => (
                 <motion.div key={i} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                   <CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                   <span className="text-[11px] font-bold text-zinc-400 break-all leading-relaxed">{out}</span>
                 </motion.div>
               ))}
               {output.length === 0 && <div className="italic opacity-30 text-[11px] p-2">Waiting for execution...</div>}
             </AnimatePresence>
           </div>
        </div>
      </div>
    </div>
  );
}
