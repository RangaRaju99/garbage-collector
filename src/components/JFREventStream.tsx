import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJVMStore } from '../store/jvmStore';
import { Activity, Zap, Box, Database, Clock } from 'lucide-react';

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
    <div className="h-full flex flex-col bg-black/40 border border-white/10 rounded-3xl overflow-hidden font-sans">
      <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
          <Activity size={12} className="text-pink-500" /> JFR Event Stream
        </h3>
        <div className="flex gap-1">
          <div className="w-1 h-1 rounded-full bg-pink-500 animate-ping" />
          <span className="text-[8px] font-mono text-pink-500 uppercase">Live</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        <AnimatePresence initial={false}>
          {events.map((ev) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 20 }}
              className={`p-2 rounded-lg border border-white/[0.03] bg-white/[0.01] flex gap-3 items-start group overflow-hidden ${
                ev.severity === 'warn' ? 'border-yellow-500/20 bg-yellow-500/[0.02]' : ''
              }`}
            >
              <div className="shrink-0 mt-1">
                {ev.type === 'Allocation' && <Box size={12} className="text-green-500" />}
                {ev.type === 'GC' && <Zap size={12} className="text-red-500" />}
                {ev.type === 'Promotion' && <Database size={12} className="text-blue-500" />}
                {ev.type === 'JIT' && <Zap size={12} className="text-purple-500" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <span className={`text-[8px] font-black uppercase tracking-tighter ${
                    ev.type === 'Allocation' ? 'text-green-500' :
                    ev.type === 'GC' ? 'text-red-500' :
                    ev.type === 'Promotion' ? 'text-blue-500' : 'text-purple-500'
                  }`}>
                    {ev.type}
                  </span>
                  <span className="text-[8px] font-mono text-gray-600 group-hover:text-gray-400">
                    {new Date(ev.time).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 leading-tight truncate">{ev.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {events.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-30 gap-2 mt-10">
             <Clock size={24} />
             <p className="text-[10px] font-mono uppercase">Waiting for JFR Events...</p>
          </div>
        )}
      </div>
    </div>
  );
}
