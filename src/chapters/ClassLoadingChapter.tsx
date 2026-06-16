import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type LoaderLevel = 'bootstrap' | 'extension' | 'application' | 'custom';

export default function ClassLoadingChapter() {
  const [activeLoader, setActiveLoader] = useState<LoaderLevel | null>(null);
  const [className, setClassName] = useState('com.myapp.Service');
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const loaders = [
    { id: 'bootstrap' as LoaderLevel, name: 'Bootstrap ClassLoader', path: 'rt.jar / $JAVA_HOME/lib', color: '#ff6b00', classes: ['java.lang.Object', 'java.lang.String', 'java.util.List'], note: 'Written in C/C++. Parent of all classloaders. Loads JDK core classes.' },
    { id: 'extension' as LoaderLevel, name: 'Extension ClassLoader', path: '$JAVA_HOME/lib/ext', color: '#ffaa00', classes: ['jsse', 'security libs', 'xml parsers'], note: 'Loads JDK extension modules. Java 9+: Platform ClassLoader.' },
    { id: 'application' as LoaderLevel, name: 'Application ClassLoader', path: '-classpath / CLASSPATH', color: '#00d4ff', classes: ['com.myapp.*', 'spring.*, hibernate.*', 'user code'], note: 'Loads your application classes. Default ClassLoader for user code.' },
    { id: 'custom' as LoaderLevel, name: 'Custom ClassLoader', path: 'defineClass() API', color: '#aa44ff', classes: ['Hot-reload (Spring DevTools)', 'OSGi bundles', 'Plugin systems'], note: 'Enables hot reload, isolation, and dynamic class loading.' },
  ];

  const delegationSteps = [
    { loader: 'Application CL', action: `Requested to load: ${className}`, checkSelf: true },
    { loader: 'Application CL', action: 'Not found locally → delegate UP to Extension CL', checkSelf: false },
    { loader: 'Extension CL', action: 'Not found → delegate UP to Bootstrap CL', checkSelf: false },
    { loader: 'Bootstrap CL', action: `Searching rt.jar for ${className}... NOT FOUND`, checkSelf: false },
    { loader: 'Extension CL', action: `Searching ext/ for ${className}... NOT FOUND`, checkSelf: false },
    { loader: 'Application CL', action: `Searching classpath for ${className}... FOUND! Class loaded ✅`, checkSelf: false },
  ];

  const simulate = async () => {
    setLoading(true);
    for (let i = 0; i <= delegationSteps.length; i++) {
      setStep(i);
      await new Promise(r => setTimeout(r, 500));
    }
    setLoading(false);
  };

  const reset = () => { setStep(0); setLoading(false); };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans p-6">
      <h1 className="text-2xl font-black mb-1">ClassLoader Hierarchy — Delegation Model</h1>
      <p className="text-gray-400 text-sm mb-5">Java's class loading follows strict parent delegation — a class is always checked in parent loaders first.</p>

      {/* Loader hierarchy */}
      <div className="mb-5">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">CLASSLOADER HIERARCHY</div>
        <div className="flex flex-col gap-2">
          {loaders.map((loader, i) => (
            <motion.button
              key={loader.id}
              onClick={() => setActiveLoader(activeLoader === loader.id ? null : loader.id)}
              whileHover={{ scale: 1.005 }}
              className="text-left p-4 rounded-xl border transition-all"
              style={{
                marginLeft: `${i * 24}px`,
                borderColor: activeLoader === loader.id ? loader.color : 'rgba(255,255,255,0.06)',
                backgroundColor: activeLoader === loader.id ? `${loader.color}10` : 'rgba(255,255,255,0.02)',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm" style={{ color: loader.color }}>{loader.name}</div>
                  <div className="text-[10px] font-mono text-gray-500 mt-0.5">{loader.path}</div>
                </div>
                <span className="text-gray-600">{activeLoader === loader.id ? '▼' : '▶'}</span>
              </div>
              <AnimatePresence>
                {activeLoader === loader.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-3">
                    <div className="flex gap-6">
                      <div>
                        <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">Example Classes</div>
                        {loader.classes.map(c => <div key={c} className="text-[10px] font-mono text-gray-400">{c}</div>)}
                      </div>
                      <div className="flex-1">
                        <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">Note</div>
                        <p className="text-[10px] text-gray-400 leading-relaxed">{loader.note}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Delegation simulation */}
      <div className="p-5 rounded-xl border border-[rgba(0,212,255,0.15)] bg-[rgba(0,212,255,0.04)]">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">DELEGATION: simulate loading a class</div>
        <div className="flex gap-2 mb-4">
          <input value={className} onChange={e => setClassName(e.target.value)}
            className="flex-1 bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] rounded px-3 py-1.5 text-xs font-mono text-gray-300 focus:outline-none focus:border-[rgba(0,212,255,0.4)]" />
          <button onClick={simulate} disabled={loading}
            className="px-4 py-1.5 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] text-[#00d4ff] rounded text-xs font-bold disabled:opacity-40 transition hover:bg-[rgba(0,212,255,0.25)]">
            Load Class
          </button>
          <button onClick={reset} className="px-3 py-1.5 border border-[rgba(255,255,255,0.08)] text-gray-500 rounded text-xs font-bold transition hover:text-white">↺</button>
        </div>
        <div className="space-y-1">
          {delegationSteps.map((s, i) => (
            <div key={i} className={`flex items-start gap-2 p-2 rounded text-[10px] font-mono transition-all ${i < step ? 'opacity-100' : 'opacity-20'}`}>
              <div className={`w-2 h-2 rounded-full mt-0.5 shrink-0 ${i < step ? 'bg-[#00d4ff]' : 'bg-gray-700'}`} />
              <div>
                <span className="text-[#ffaa00]">[{s.loader}]</span> <span className="text-gray-300">{s.action.replace('${className}', className)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}