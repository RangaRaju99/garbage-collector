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
        className="fixed inset-0 z-[100] bg-[rgba(0,0,0,0.6)] backdrop-blur-md flex items-start justify-center pt-[15vh]"
        onClick={() => setIsOpen(false)}
      >
        <motion.div 
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="bg-primary-bg overflow-hidden border border-[rgba(255,255,255,0.1)] shadow-2xl rounded-xl w-[500px] max-w-full flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Input Header */}
          <div className="flex items-center p-4 border-b border-[rgba(255,255,255,0.05)]">
            <Search size={20} className="text-gray-400 mr-3" />
            <input 
              autoFocus
              className="flex-1 bg-transparent border-none text-white focus:outline-none text-lg font-sans placeholder-gray-500" 
              placeholder="Search chapters, settings, or objects..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="text-[10px] text-gray-500 bg-[rgba(255,255,255,0.1)] px-2 py-1 rounded font-mono uppercase tracking-widest">
              ESC
            </div>
          </div>

          {/* Results Area */}
          <div className="max-h-[300px] overflow-y-auto p-2">
             {results.length > 0 ? results.map((res, i) => (
                <div key={i} className="group flex items-center p-3 hover:bg-[rgba(0,212,255,0.1)] rounded-lg cursor-pointer transition">
                  <div className="bg-[rgba(255,255,255,0.05)] p-2 rounded text-gray-400 group-hover:text-accent-alive transition mr-4">
                     {res.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 mb-1">{res.type}</span>
                    <span className="text-sm font-bold text-gray-200 group-hover:text-white transition">{res.name}</span>
                  </div>
                </div>
             )) : (
                <div className="text-center p-8 text-gray-500 text-sm">
                  No results found for "{query}". Try "Metaspace" or "ZGC".
                </div>
             )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
