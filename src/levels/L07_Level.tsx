import { useState } from 'react';
import { motion } from 'framer-motion';

type Node = { id: string; x: number; y: number; isRoot: boolean; reachable: boolean; connected: string[]; };

const initialNodes: Node[] = [
  { id: 'Thread-1', x: 50, y: 30, isRoot: true, reachable: true, connected: ['A', 'D'] },
  { id: 'A', x: 200, y: 30, isRoot: false, reachable: false, connected: ['B', 'C'] },
  { id: 'B', x: 350, y: 30, isRoot: false, reachable: false, connected: [] },
  { id: 'C', x: 350, y: 100, isRoot: false, reachable: false, connected: [] },
  { id: 'D', x: 200, y: 150, isRoot: false, reachable: false, connected: ['E'] },
  { id: 'E', x: 350, y: 180, isRoot: false, reachable: false, connected: [] },
  { id: 'Garbage-X', x: 50, y: 180, isRoot: false, reachable: false, connected: ['Garbage-Y'] },
  { id: 'Garbage-Y', x: 120, y: 220, isRoot: false, reachable: false, connected: [] },
];

export default function L07_Level() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [phase, setPhase] = useState<'IDLE' | 'MARK' | 'SWEEP'>('IDLE');

  const startMark = () => {
    setPhase('MARK');
    const nextNodes = JSON.parse(JSON.stringify(initialNodes)) as Node[];
    
    // Simple BFS for reachability
    const queue = nextNodes.filter(n => n.isRoot).map(n => n.id);
    const visited = new Set<string>();
    
    while(queue.length > 0) {
      const currentId = queue.shift()!;
      if(visited.has(currentId)) continue;
      visited.add(currentId);
      
      const node = nextNodes.find(n => n.id === currentId);
      if(node) {
        node.reachable = true;
        queue.push(...node.connected);
      }
    }
    setNodes(nextNodes);
  };

  const startSweep = () => {
    setPhase('SWEEP');
    setTimeout(() => {
       setNodes(prev => prev.filter(n => n.reachable));
    }, 1000);
  };

  const reset = () => {
    setNodes(initialNodes);
    setPhase('IDLE');
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans">
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] rounded text-[10px] font-mono text-[#00d4ff]">L07</span>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">BEGINNER TRACK</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Algorithm: Mark & Sweep</h1>
        <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
          The foundation of all JVM Collectors. Phase 1: Identify "Alive" objects from GC Roots. 
          Phase 2: Reclaim memory from the unreachable "Dead".
        </p>
      </div>

      <div className="px-8 pb-8 flex flex-col lg:flex-row gap-8">
         <div className="flex-1 min-h-[400px] bg-black/40 border border-white/5 rounded-2xl relative overflow-hidden flex flex-col p-6">
            {/* Visualizer SVGs */}
            <svg className="flex-1 w-full" viewBox="0 0 500 300">
               <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#333" />
                  </marker>
               </defs>
               
               {/* Connections */}
               {nodes.map(node => (
                 node.connected.map(targetId => {
                    const target = nodes.find(n => n.id === targetId);
                    if (!target) return null;
                    return (
                       <motion.line 
                         key={`${node.id}-${targetId}`}
                         x1={node.x} y1={node.y} x2={target.x} y2={target.y}
                         stroke={node.reachable && target.reachable && phase !== 'IDLE' ? '#00d4ff' : '#222'}
                         strokeWidth={2}
                         markerEnd="url(#arrow)"
                       />
                    );
                 })
               ))}

               {/* Nodes */}
               {nodes.map(node => (
                 <motion.g key={node.id} layout>
                    <motion.circle 
                      cx={node.x} cy={node.y} r={node.isRoot ? 16 : 12}
                      initial={false}
                      animate={{ 
                        fill: node.reachable && phase !== 'IDLE' ? '#00d4ff' : node.isRoot ? '#ffaa00' : '#1a1a2a',
                        stroke: node.reachable && phase !== 'IDLE' ? '#00d4ff' : '#444',
                        scale: node.reachable && phase !== 'IDLE' ? 1.1 : 1
                      }}
                      strokeWidth={2}
                    />
                    <text 
                      x={node.x} y={node.y + (node.isRoot ? 28 : 24)} 
                      textAnchor="middle" fontSize={10} fill="#666" 
                      className="font-mono"
                    >
                      {node.id}
                    </text>
                 </motion.g>
               ))}
            </svg>

            {/* Step Controls */}
            <div className="flex justify-center gap-4 pt-4 border-t border-white/5">
               <button onClick={startMark} className={`px-5 py-2 rounded-lg text-xs font-bold transition ${phase === 'MARK' ? 'bg-[#00d4ff] text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}>PHASE 1: MARK ALIVE ✅</button>
               <button onClick={startSweep} className={`px-5 py-2 rounded-lg text-xs font-bold transition ${phase === 'SWEEP' ? 'bg-red-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}>PHASE 2: SWEEP DEAD 🧹</button>
               <button onClick={reset} className="px-5 py-2 rounded-lg text-xs font-bold bg-white/5 text-gray-400 hover:text-white">RESET SIM</button>
            </div>
         </div>

         <div className="w-full lg:w-80 space-y-4">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Object Reachability</h4>
               <div className="space-y-4">
                  <div className="p-3 bg-[#ffaa00]/10 border border-[#ffaa00]/30 rounded-lg">
                     <span className="text-[10px] font-black text-[#ffaa00] border border-[#ffaa00] px-1 rounded mr-2">ROOT</span>
                     <span className="text-[11px] text-gray-300">Stack variables, Static fields, JNI references.</span>
                  </div>
                  <div className="p-3 bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-lg">
                     <span className="text-[10px] font-black text-[#00d4ff] border border-[#00d4ff] px-1 rounded mr-2">ALIVE</span>
                     <span className="text-[11px] text-gray-300">Any object with a path of references back to a Root.</span>
                  </div>
                  <div className="p-3 bg-red-900/10 border border-red-900/30 rounded-lg opacity-60">
                     <span className="text-[10px] font-black text-red-400 border border-red-400 px-1 rounded mr-2">DEAD</span>
                     <span className="text-[11px] text-gray-300">Unreachable orphans. Reclaimed in Sweep phase.</span>
                  </div>
               </div>
            </div>

            <div className="p-6 rounded-2xl bg-accent-alive/5 border border-accent-alive/20">
               <h4 className="text-[10px] font-bold text-accent-alive uppercase mb-2">The Sweep Problem</h4>
               <p className="text-[11px] text-gray-400 leading-relaxed">
                  Mark & Sweep alone leaves memory with gaps (Fragmentation). Most JVM collectors add a 
                  <span className="text-white"> COMPACT</span> phase to slide objects together and reclaim continuous free space.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}