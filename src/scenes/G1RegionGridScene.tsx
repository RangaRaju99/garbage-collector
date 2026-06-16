import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export default function G1RegionGridScene() {
  const groupRef = useRef<THREE.Group>(null);
  const gridSize = 8; // 8x8 grid = 64 regions
  const cellSize = 1.2;

  // Generate Hex-like or Cube grid
  const regions = [];
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      // Determine region type purely for visualization logic at start
      const rand = Math.random();
      let color = '#2a1a3a'; // Free/Old
      let opacity = 0.6;
      let label = '';
      
      if (rand > 0.95) { color = '#ffd700'; label = 'H'; } // Humongous
      else if (rand > 0.8) { color = '#1a3a2a'; label = 'E'; } // Eden
      else if (rand > 0.7) { color = '#1a2a1a'; label = 'S'; } // Survivor
      
      // Simulate garbage density
      if (color === '#2a1a3a' && Math.random() > 0.8) {
        color = '#ff6b00'; // High density garbage (target for mixed GC)
      }

      regions.push(
        <group key={`${i}-${j}`} position={[(i - gridSize/2) * cellSize, 0, (j - gridSize/2) * cellSize]}>
          <mesh position={[0, -0.6, 0]} receiveShadow>
            <boxGeometry args={[cellSize*0.9, 0.2, cellSize*0.9]} />
            <meshStandardMaterial color={color} transparent opacity={opacity} />
          </mesh>
          {label && (
             <Text position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.4} color="white">
               {label}
             </Text>
          )}
        </group>
      );
    }
  }

  useFrame((state) => {
    if (groupRef.current) {
        // Slow float/breathing effect
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group position={[8, 0, 0]} ref={groupRef}>
       {regions}
       <Text position={[0, -0.4, 6]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.6} color="#00d4ff" anchorX="center" anchorY="bottom">
        G1 HEAP REGIONS (Garbage First)
      </Text>
    </group>
  );
}