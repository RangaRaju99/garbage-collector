import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Text, Environment } from '@react-three/drei';
import * as THREE from 'three';

export default function DirectMemoryScene() {
  const pipesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (pipesRef.current) {
      pipesRef.current.children.forEach((child, i) => {
        child.position.y += Math.sin(state.clock.elapsedTime + i) * 0.005;
      });
    }
  });

  return (
    <group>
      <Environment preset="night" />
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#ffaa00" />

      {/* Industrial Base */}
      <Box args={[100, 1, 100]} position={[0, -5, 0]}>
        <meshStandardMaterial color="#111" roughness={0.1} metalness={0.9} />
      </Box>

      <group ref={pipesRef}>
        {/* Direct Buffer Containers */}
        {Array.from({ length: 8 }).map((_, i) => (
          <group key={i} position={[(i - 4) * 5, 0, -10]}>
            <Cylinder args={[1, 1, 6, 32]} position={[0, 0, 0]}>
              <meshStandardMaterial 
                color="#ffaa00" 
                transparent 
                opacity={0.3} 
                roughness={0} 
                metalness={1} 
              />
            </Cylinder>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.9, 0.9, 5.8, 32]} />
              <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={0.5} />
            </mesh>
            <Text
              position={[0, 4, 0]}
              fontSize={0.3}
              color="#ffaa00"
              font="/fonts/Inter-Black.woff"
            >
              DirectBuffer_{i}
            </Text>
          </group>
        ))}

        {/* Connection Pipes */}
        <Cylinder args={[0.2, 0.2, 30, 8]} rotation={[0, 0, Math.PI / 2]} position={[0, -2, -10]}>
           <meshStandardMaterial color="#333" metalness={1} roughness={0.2} />
        </Cylinder>
      </group>

      <Text
        position={[0, 8, -20]}
        fontSize={2}
        color="#ffaa00"
        font="/fonts/Inter-Black.woff"
      >
        OFF-HEAP DIRECT MEMORY
      </Text>
    </group>
  );
}