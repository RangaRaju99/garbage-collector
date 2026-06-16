import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useJVMStore } from '../store/jvmStore';
import { Html } from '@react-three/drei';

export default function GCRobots() {
  const isSafepoint = useJVMStore(state => state.isSafepoint);
  const gcAlgorithm = useJVMStore(state => state.gcAlgorithm);
  
  // Create 8 robots for Parallel, 1 for Serial, 4 for G1
  const robotCount = gcAlgorithm === 'Parallel' ? 8 : gcAlgorithm === 'Serial' ? 1 : 4;
  
  const robots = useMemo(() => {
    return Array.from({ length: robotCount }).map(() => ({
      startPos: [(Math.random() - 0.5) * 15, 5, (Math.random() - 0.5) * 15],
      speed: Math.random() * 0.05 + 0.02,
      offset: Math.random() * Math.PI * 2
    }));
  }, [robotCount]);

  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current && isSafepoint) {
       groupRef.current.children.forEach((bot, i) => {
          const rData = robots[i];
          // Hover and scan spiral movement
          bot.position.x = rData.startPos[0] + Math.sin(clock.elapsedTime * rData.speed * 10 + rData.offset) * 4;
          bot.position.z = rData.startPos[2] + Math.cos(clock.elapsedTime * rData.speed * 10 + rData.offset) * 4;
          bot.position.y = 1 + Math.sin(clock.elapsedTime * 5 + rData.offset) * 0.2;
          
          bot.rotation.y += 0.1;
       });
    }
  });

  if (!isSafepoint) return null; // Only render robots during STW

  return (
    <group ref={groupRef}>
      {robots.map((r, i) => (
         <mesh key={i} position={r.startPos as any}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.8} />
            <mesh position={[0, -0.5, 0]}>
               <cylinderGeometry args={[0.05, 0.4, 1, 16]} />
               <meshStandardMaterial color="#ef4444" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
            </mesh>
            <Html position={[0,0.5,0]} center zIndexRange={[100,0]}>
                <div className="bg-red-600 px-1 py-0.5 rounded text-[8px] font-mono text-white tracking-widest whitespace-nowrap shadow-[0_0_10px_red]">
                    SWEEPING
                </div>
            </Html>
         </mesh>
      ))}
    </group>
  );
}