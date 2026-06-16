import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Map, Book, Settings, Play } from 'lucide-react';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const results = [
    { type: 'Jump To', name: 'PermGen → Metaspace Expansion', icon: <Play size={16}/> },
    { type: 'GC Engine', name: 'Toggle G1 -> ZGC Collector', icon: <Settings size={16}/> },
    { type: 'Mode', name: 'Enter Detective Mode (Memory Leaks)', icon: <Map size={16}/> },
    { type: 'Documentation', name: 'What is the TLAB?', icon: <Book size={16}/> },
    { type: 'Chapter', name: 'Escape Analysis & Stack Allocation', icon: <Book size={16}/> },
    { type: 'Chapter', name: 'Native Memory Tracking (NMT)', icon: <Book size={16}/> },
    { type: 'Chapter', name: 'Phantom References & Post-Mortem', icon: <Book size={16}/> },
    { type: 'Chapter', name: 'G1 Humongous Objects', icon: <Book size={16}/> },
    { type: 'Chapter', name: 'Compressed OOPs (32GB Wall)', icon: <Book size={16}/> },
    { type: 'Chapter', name: 'Object Header Bit Layout', icon: <Book size={16}/> },
  ].filter(r => r.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[15vh]"
        onClick={() => setIsOpen(false)}
      >
        <motion.div 
          initial={{ opacity: 0, y: -8, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.99 }}
          transition={{ duration: 0.1, ease: 'easeOut' }}
          className="bg-surface-secondary overflow-hidden border border-white/10 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] rounded-xl w-[560px] max-w-full flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Input Header */}
          <div className="flex items-center p-5 border-b border-white/5">
            <Search size={18} className="text-gray-500 mr-4" />
            <input 
              autoFocus
              className="flex-1 bg-transparent border-none text-white focus:outline-none text-[14px] font-sans placeholder-gray-600 font-medium" 
              placeholder="Search chapters, settings, or objects..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="flex items-center gap-1.5 ml-4">
               <kbd className="min-w-[32px] h-[20px] flex items-center justify-center bg-white/[0.05] rounded border border-white/10 text-gray-500 text-[10px] font-bold">
                 ESC
               </kbd>
            </div>
          </div>

          {/* Results Area */}
          <div className="max-h-[400px] overflow-y-auto p-2 custom-scrollbar">
             {results.length > 0 ? (
               <div className="space-y-0.5">
                  {results.map((res, i) => (
                    <div key={i} className="group flex items-center p-3 hover:bg-white/[0.04] rounded-lg cursor-pointer transition-all duration-150">
                      <div className="w-8 h-8 flex items-center justify-center bg-white/[0.03] rounded-md text-gray-500 group-hover:text-brand-primary group-hover:bg-brand-primary/10 transition-all mr-4">
                         {res.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">{res.type}</span>
                        <span className="text-[13px] font-medium text-gray-300 group-hover:text-white transition-colors">{res.name}</span>
                      </div>
                    </div>
                  ))}
               </div>
             ) : (
                <div className="flex flex-col items-center justify-center py-12 px-8 text-center space-y-2">
                   <div className="text-[14px] font-bold text-gray-400">No matches found</div>
                   <p className="text-[11px] text-gray-500 max-w-[200px]">Try searching for "Metaspace" or "ZGC" to explore more.</p>
                </div>
             )}
          </div>
          
          {/* Footer Metadata */}
          <div className="px-5 py-3 bg-black/20 border-t border-white/5 flex items-center justify-between">
             <div className="flex items-center gap-4 text-[10px] text-gray-500 font-medium">
                <span className="flex items-center gap-1.5"><kbd className="bg-white/5 px-1 rounded">↑↓</kbd> Navigate</span>
                <span className="flex items-center gap-1.5"><kbd className="bg-white/5 px-1 rounded">↵</kbd> Select</span>
             </div>
             <span className="text-[9px] font-mono text-gray-600">JVM_CONTEXT_V1.1</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
