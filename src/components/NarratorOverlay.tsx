import { useJVMStore } from '../store/jvmStore';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, AlertTriangle, ShieldAlert, Zap } from 'lucide-react';

type Level = 'info' | 'warn' | 'critical';
type Cue = { id: number; text: string; level: Level; type?: string };

const LEVEL_STYLES: Record<Level, { bg: string; border: string; icon: any; color: string }> = {
  info:     { bg: 'bg-zinc-950/80',  border: 'border-white/10', icon: Info,          color: 'text-brand-primary' },
  warn:     { bg: 'bg-zinc-950/80',  border: 'border-white/10', icon: AlertTriangle,  color: 'text-status-warning' },
  critical: { bg: 'bg-zinc-950/80',  border: 'border-white/10', icon: ShieldAlert,    color: 'text-status-error'   },
};

export default function NarratorOverlay() {
  const events = useJVMStore(s => s.events);
  const isSafepoint = useJVMStore(s => s.isSafepoint);
  const [cues, setCues] = useState<Cue[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    if (events.length === 0) return;
    const last = events[0];
    
    // Deduplicate identical consecutive messages
    if (cues[0]?.text === last.message) return;

    const level: Level = last.type === 'OOM' ? 'critical' : last.type === 'WARNING' || last.type === 'LEAK' ? 'warn' : 'info';
    const cue: Cue = { id: idRef.current++, text: last.message, level, type: last.type };
    
    setCues(q => [cue, ...q].slice(0, 3));
    const t = setTimeout(() => setCues(q => q.filter(c => c.id !== cue.id)), 6000);
    return () => clearTimeout(t);
  }, [events]);

  return (
    <>
      {/* Global Status Bar for Safepoint (STW) */}
      <AnimatePresence>
        {isSafepoint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20, x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, y: -20, x: '-50%' }}
            className="absolute top-6 left-1/2 z-[100] pointer-events-none"
          >
            <div className="flex items-center gap-3 px-5 py-2 bg-zinc-950/90 border border-status-warning/40 rounded-full backdrop-blur-2xl shadow-2xl ring-1 ring-white/10">
               <Zap size={14} className="text-status-warning animate-pulse" fill="currentColor" />
               <span className="text-[11px] font-black text-status-warning uppercase tracking-[0.2em]">Stop-The-World Safepoint Active</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Toast System (Bottom Right of Central View) */}
      <div className="absolute bottom-6 right-6 z-40 flex flex-col gap-2 w-[340px] pointer-events-none items-end">
        <AnimatePresence initial={false}>
          {cues.map(cue => {
            const S = LEVEL_STYLES[cue.level];
            const Icon = S.icon;
            return (
              <motion.div
                key={cue.id}
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 10, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={`flex items-start gap-4 p-4 rounded-2xl border backdrop-blur-2xl shadow-2xl ${S.bg} ${S.border} ring-1 ring-white/5 pointer-events-auto w-full`}
              >
                <div className={`p-2 rounded-lg bg-white/5 border border-white/5 mt-0.5 ${S.color}`}>
                  <Icon size={14} />
                </div>
                <div className="flex flex-col gap-1 pr-4">
                  {cue.type && (
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] opacity-80 ${S.color}`}>
                      {cue.type} EVENT
                    </span>
                  )}
                  <p className="text-[12px] font-semibold text-zinc-100 leading-relaxed transition-colors">
                    {cue.text}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
}