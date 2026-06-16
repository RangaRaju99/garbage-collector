import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

type OpCode = { hex: string; mnemonic: string; desc: string; color: string; };

const opCodes: Record<string, OpCode> = {
  'BB': { hex: 'BB', mnemonic: 'new', desc: 'Create new object', color: '#00d4ff' },
  '59': { hex: '59', mnemonic: 'dup', desc: 'Duplicate top operand stack value', color: '#ffaa00' },
  'B7': { hex: 'B7', mnemonic: 'invokespecial', desc: 'Invoke instance method; special handling', color: '#aa44ff' },
  '4C': { hex: '4C', mnemonic: 'astore_1', desc: 'Store reference into local variable 1', color: '#00ff88' },
  '2B': { hex: '2B', mnemonic: 'aload_1', desc: 'Load reference from local variable 1', color: '#00ff88' },
  'B6': { hex: 'B6', mnemonic: 'invokevirtual', desc: 'Invoke instance method; dispatch based on class', color: '#aa44ff' },
  'B1': { hex: 'B1', mnemonic: 'return', desc: 'Return void from method', color: '#ff4444' },
};

export default function BytecodeViewer({ code = 'BB 00 03 59 B7 00 04 4C 2B B6 00 05 B1' }: { code?: string }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const bytes = useMemo(() => code.split(' '), [code]);

  return (
    <div className="bg-black/60 border border-white/10 rounded-xl overflow-hidden font-mono text-[10px]">
      <div className="bg-white/5 px-3 py-2 border-b border-white/10 flex justify-between items-center text-gray-500 uppercase tracking-widest font-bold">
        <span>Bytecode Inspector</span>
        <span className="text-[9px]">ClassFile v52.0</span>
      </div>
      
      <div className="p-4 grid grid-cols-8 gap-2">
        {bytes.map((byte, i) => {
          const op = opCodes[byte];
          return (
            <motion.div
              key={i}
              onMouseEnter={() => op && setHovered(byte)}
              onMouseLeave={() => setHovered(null)}
              animate={{ 
                backgroundColor: op ? (hovered === byte ? `${op.color}44` : `${op.color}11`) : 'transparent',
                borderColor: op ? (hovered === byte ? op.color : `${op.color}33`) : 'rgba(255,255,255,0.05)'
              }}
              className="w-10 h-10 border rounded flex items-center justify-center cursor-help transition-colors"
            >
              <span className={op ? 'text-white font-bold' : 'text-gray-600'}>{byte}</span>
            </motion.div>
          );
        })}
      </div>

      <div className="h-16 border-t border-white/5 p-3 bg-black flex items-center gap-4">
        {hovered && opCodes[hovered] ? (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4 items-center">
            <div className="px-2 py-1 rounded bg-white/10 text-white font-black text-xs">0x{hovered}</div>
            <div>
              <div className="text-accent-alive font-bold uppercase text-[9px]">{opCodes[hovered].mnemonic}</div>
              <div className="text-gray-500 text-[10px] italic">{opCodes[hovered].desc}</div>
            </div>
          </motion.div>
        ) : (
          <span className="text-gray-600 italic">Hover over bytes to disassemble...</span>
        )}
      </div>
    </div>
  );
}