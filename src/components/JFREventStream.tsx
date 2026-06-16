import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJVMStore } from '../store/jvmStore';
import { Activity } from 'lucide-react';

interface JFREvent {
  id: string;
  time: number;
  type: 'Allocation' | 'GC' | 'Promotion' | 'JIT';
  message: string;
  severity: 'info' | 'warn' | 'error';
}

export default function JFREventStream() {
  const [events, setEvents] = useState<JFREvent[]>([]);
  const isRunning = useJVMStore(state => state.isRunning);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const types: JFREvent['type'][] = ['Allocation', 'GC', 'Promotion', 'JIT'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      let message = '';
      let severity: JFREvent['severity'] = 'info';

      switch(type) {
        case 'Allocation': 
          const size = Math.floor(Math.random() * 256) + 1;
          message = `New instance created (${size}KB) in TLAB`;
          break;
        case 'GC':
          message = `Minor GC completed in ${Math.floor(Math.random() * 20) + 5}ms`;
          severity = 'warn';
          break;
        case 'Promotion':
          message = `Object promoted to Old Gen at age 15`;
          break;
        case 'JIT':
          message = `Method 'calculate()' compiled to C2 native code`;
          break;
      }

      const newEvent: JFREvent = {
        id: Math.random().toString(36).substr(2, 9),
        time: Date.now(),
        type,
        message,
        severity
      };

      setEvents(prev => [newEvent, ...prev.slice(0, 49)]);
    }, 2000);

    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div className="h-full flex flex-col bg-surface-tertiary border border-white/5 rounded-xl overflow-hidden font-sans">
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
        <div className="flex flex-col">
           <h3 className="text-[11px] font-bold text-white tracking-tight">JFR Diagnostic Stream</h3>
           <span className="text-[8px] text-gray-500 font-medium font-mono">FLIGHT RECORDING V2</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-status-info/10 rounded border border-status-info/20">
          <div className="w-1 h-1 rounded-full bg-status-info animate-pulse" />
          <span className="text-[8px] font-black text-status-info uppercase tracking-tighter">Live</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-black/10">
        <AnimatePresence initial={false}>
          {events.map((ev) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-3 rounded-md border transition-all duration-200 group ${
                ev.severity === 'warn' 
                  ? 'bg-status-warning/[0.03] border-status-warning/20' 
                  : 'bg-white/[0.02] border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-start justify-between mb-1.5">
                <span className={`text-[9px] font-black tracking-widest uppercase ${
                  ev.type === 'Allocation' ? 'text-status-success' :
                  ev.type === 'GC' ? 'text-status-error' :
                  ev.type === 'Promotion' ? 'text-brand-primary' : 'text-brand-secondary'
                }`}>
                  {ev.type}
                </span>
                <span className="text-[8px] font-mono text-gray-600">
                  {new Date(ev.time).toLocaleTimeString([], { hour12: false, second: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium group-hover:text-gray-300 transition-colors leading-relaxed">
                {ev.message}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {events.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-10 gap-3 py-16">
             <Activity size={24} />
             <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-center">Pipeline Handshake...</p>
          </div>
        )}
      </div>
    </div>
  );
}
