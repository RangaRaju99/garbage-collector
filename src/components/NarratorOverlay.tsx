import { useJVMStore } from '../store/jvmStore';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Cue = { id: number; text: string; level: 'info' | 'warn' | 'critical'; };

export default function NarratorOverlay() {
  const events = useJVMStore(s => s.events);
  const isSafepoint = useJVMStore(s => s.isSafepoint);
  const [cues, setCues] = useState<Cue[]>([]);
  const idRef = { current: 0 };

  useEffect(() => {
    if (events.length === 0) return;
    const last = events[events.length - 1];
    const level = last.type === 'OOM' ? 'critical' : last.type === 'WARNING' ? 'warn' : 'info';
    const cue: Cue = { id: idRef.current++, text: last.message, level };
    setCues(q => [cue, ...q].slice(0, 3));
    const t = setTimeout(() => setCues(q => q.filter(c => c.id !== cue.id)), 5000);
    return () => clearTimeout(t);
  }, [events.length]);

  useEffect(() => {
    if (isSafepoint) {
      const cue: Cue = { id: idRef.current++, text: '⏱ Stop-The-World — All threads at safepoint. GC executing.', level: 'warn' };
      setCues(q => [cue, ...q].slice(0, 3));
      const t = setTimeout(() => setCues(q => q.filter(c => c.id !== cue.id)), 4000);
      return () => clearTimeout(t);
    }
  }, [isSafepoint]);

  const colors = { info: { bg: 'rgba(0,212,255,0.12)', border: 'rgba(0,212,255,0.3)', text: '#00d4ff' }, warn: { bg: 'rgba(255,170,0,0.12)', border: 'rgba(255,170,0,0.35)', text: '#ffaa00' }, critical: { bg: 'rgba(255,68,68,0.12)', border: 'rgba(255,68,68,0.4)', text: '#ff4444' } };

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col-reverse gap-2 w-[560px] pointer-events-none">
      <AnimatePresence>
        {cues.map(cue => {
          const c = colors[cue.level];
          return (
            <motion.div
              key={cue.id}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="px-5 py-3 rounded-xl backdrop-blur-md border text-sm leading-relaxed"
              style={{ backgroundColor: c.bg, borderColor: c.border, color: c.text }}
            >
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 animate-pulse" style={{ backgroundColor: c.text }} />
                <span className="font-medium">{cue.text}</span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}