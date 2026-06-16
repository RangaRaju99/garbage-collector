import { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { useJVMStore } from '../store/jvmStore';
import { instance as jvmEngine } from '../simulator/JVMEngine';

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
    
    // Simplistic line-by-line interpreter
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//')) return;

      if (trimmed.includes('new ')) {
        const typeMatch = trimmed.match(/new (\w+)/);
        const type = typeMatch ? typeMatch[1] : 'Object';
        jvmEngine.allocateObject(24, type, true);
        
        setBytecode(prev => [...prev, `new #${Math.floor(Math.random() * 10)}`, 'dup', `invokespecial #${Math.floor(Math.random() * 10)}`, 'astore_1']);
        setOutput(prev => [...prev, `✅ Allocated ${type} → TLAB → Eden (24KB)`]);
      } 
      else if (trimmed.includes('System.gc()')) {
        setBytecode(prev => [...prev, 'invokestatic #System.gc()']);
        setOutput(prev => [...prev, `🤖 GC requested by app`]);
        useJVMStore.getState().addEvent('INFO', 'System.gc() requested', 0);
        jvmEngine.runMinorGC();
      }
      else if (trimmed.includes('= null')) {
        setBytecode(prev => [...prev, 'aconst_null', 'astore_1']);
        setOutput(prev => [...prev, `⚠️ reference nullified: external ref gone`]);
        // Simulate root drop
        if (jvmEngine.edenRef.length > 0) jvmEngine.edenRef[0].isRoot = false;
      }
      else if (trimmed.includes('.manager =')) {
        setBytecode(prev => [...prev, 'aload_1', 'aload_2', 'putfield #manager']);
        setOutput(prev => [...prev, `🔗 e1.manager → e2 (Strong)`]);
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
    <div className="flex-1 flex flex-col glass-panel overflow-hidden border-l border-[rgba(0,212,255,0.2)]">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-3 border-b border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)]">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          JAVA SANDBOX
        </h2>
        <div className="flex gap-2">
          <button onClick={handleReset} className="p-1 hover:bg-[rgba(255,255,255,0.1)] rounded transition text-gray-400 hover:text-white" title="Reset Code">
            <RotateCcw size={14} />
          </button>
          <button onClick={handleRun} className="flex items-center gap-1 px-3 py-1 bg-accent-alive text-black rounded text-xs font-bold hover:bg-white transition shadow-[0_0_10px_rgba(0,212,255,0.3)]">
            <Play size={12} fill="currentColor" /> RUN
          </button>
        </div>
      </div>

      {/* Code Editor Area */}
      <div className="h-40 border-b border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.4)] relative">
        <textarea 
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-full bg-transparent text-gray-300 p-4 font-mono text-xs resize-none focus:outline-none focus:ring-1 focus:ring-accent-alive"
          spellCheck={false}
        />
      </div>

      {/* Output Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Bytecode */}
        <div className="w-1/2 border-r border-[rgba(255,255,255,0.1)] p-3 overflow-y-auto">
          <h3 className="text-[10px] text-gray-500 font-bold mb-2 uppercase tracking-wide">BYTECODE PANEL</h3>
          <ul className="text-xs font-mono space-y-1 text-gray-400">
            {bytecode.map((cmd, i) => (
              <li key={i}>{cmd}</li>
            ))}
          </ul>
        </div>
        
        {/* Simulation Output */}
        <div className="w-1/2 p-3 overflow-y-auto bg-[rgba(0,212,255,0.02)]">
           <h3 className="text-[10px] text-gray-500 font-bold mb-2 uppercase tracking-wide">SIMULATION OUTPUT</h3>
           <ul className="text-xs font-sans space-y-2 text-gray-300">
            {output.map((out, i) => (
              <li key={i}>{out}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
