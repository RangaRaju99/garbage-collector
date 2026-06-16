import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, Box, Stars } from '@react-three/drei';
import * as THREE from 'three';

export default function CodeCacheScene() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#00d4ff" />

      {/* Grid Floor */}
      <gridHelper args={[50, 50, '#1a1a1a', '#0a0a0a']} position={[0, -2, 0]} />

      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <group position={[0, 0, 0]}>
          {/* Main Code Cache Hub */}
          <Box args={[10, 0.5, 10]} position={[0, -1, 0]}>
            <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
          </Box>

          {/* Compiled Methods (Buildings) */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const x = Math.cos(angle) * 4;
            const z = Math.sin(angle) * 4;
            const height = Math.random() * 3 + 1;
            
            return (
              <group key={i} position={[x, height / 2 - 1, z]}>
                <Box args={[0.5, height, 0.5]}>
                   <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={2} />
                </Box>
                {/* Method Label */}
                <Text
                   position={[0, height / 2 + 0.3, 0]}
                   fontSize={0.2}
                   color="white"
                   font="/fonts/Inter-Black.woff"
                   anchorX="center"
                >
                   Method_{i}()
                </Text>
              </group>
            );
          })}
        </group>
      </Float>

      <Text
        position={[0, 5, -10]}
        fontSize={1}
        color="#00d4ff"
        maxWidth={20}
        textAlign="center"
        font="/fonts/Inter-Black.woff"
      >
        JIT CODE CACHE
      </Text>
    </group>
  );
}