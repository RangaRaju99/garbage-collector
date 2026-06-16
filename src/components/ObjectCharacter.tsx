import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useJVMStore } from '../store/jvmStore';
import ObjectHeaderViewer from './ObjectHeaderViewer';

interface ObjectCharacterProps {
  position: [number, number, number];
  color?: string;
  objData?: {
    id: string;
    age: number;
    size: number;
    generation: string;
    type: string;
    reachable: boolean;
  };
}

export default function ObjectCharacter({ position, color = '#22C55E', objData }: ObjectCharacterProps) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const xrayMode = useJVMStore(state => state.xrayMode);
  const gcAlgorithm = useJVMStore(state => state.gcAlgorithm);
  
  useFrame((state) => {
    if (ref.current) {
      // Idle bounce
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.2;
      
      // If unreachable, confused stumble
      if (objData && !objData.reachable) {
        ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 5) * 0.5;
        ref.current.rotation.z = Math.cos(state.clock.elapsedTime * 3) * 0.2;
      }
    }
  });

  const displayColor = (objData && !objData.reachable) ? '#4b5563' : color; // Gray if dead

  return (
    <mesh 
      position={position} 
      ref={ref}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={displayColor} emissive={displayColor} emissiveIntensity={0.5} roughness={0.2} metalness={0.8} />
      
      {/* Detailed Data Billboard */}
      {(hovered || (objData && !objData.reachable)) && (
        <Html position={[0, 1.5, 0]} center zIndexRange={[100, 0]}>
          <div className="bg-primary-bg border border-[rgba(0,212,255,0.3)] backdrop-blur-md rounded-md p-3 text-xs w-64 shadow-2xl pointer-events-none transform -translate-y-2 transition-all opacity-95">
            <div className="font-bold border-b border-gray-700 pb-1 mb-2 text-white flex items-center gap-2">
              👤 {objData?.type || 'Object'} #{objData?.id || '102'}
            </div>
            <div className="space-y-1 font-mono text-gray-400">
              <div className="flex justify-between"><span>Age:</span> <span className="text-white">{objData?.age || 0} GC cycles</span></div>
              <div className="flex justify-between"><span>Size:</span> <span className="text-white">{objData?.size || 0} KB</span></div>
              <div className="flex justify-between"><span>Gen:</span> <span className="text-white uppercase">{objData?.generation || 'Eden'}</span></div>
              <div className="flex justify-between">
                <span>Status:</span> 
                <span className={objData?.reachable !== false ? 'text-success-reachable' : 'text-gray-500'}>
                  {objData?.reachable !== false ? '✅ Reachable' : '⚠️ UNREACHABLE'}
                </span>
              </div>
            </div>
            
            {xrayMode && <ObjectHeaderViewer gcAlgorithm={gcAlgorithm} />}
          </div>
        </Html>
      )}
    </mesh>
  );
}