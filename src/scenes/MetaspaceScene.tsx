import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Box, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface MetaspaceSceneProps {
  fillRatio?: number;
}

export default function MetaspaceScene({ fillRatio = 0.3 }: MetaspaceSceneProps) {
  const libraryRef = useRef<THREE.Group>(null);
  const breathRef = useRef(0);

  useFrame(({ clock }) => {
    breathRef.current = clock.elapsedTime;
    if (libraryRef.current) {
      // Breathing / growing effect
      const scale = 1 + fillRatio * 0.3 + Math.sin(clock.elapsedTime * 0.8) * 0.01;
      libraryRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={[20, 0, 0]}>
      {/* "NATIVE MEMORY" boundary label */}
      <Text position={[0, 8, 0]} fontSize={0.4} color="#1a7aff" anchorX="center">
        ⚠ NATIVE MEMORY — NOT PART OF HEAP
      </Text>

      {/* Dashed boundary line (simulated with thin elongated boxes) */}
      {Array.from({ length: 12 }).map((_, i) => (
        <Box key={i} args={[0.1, 0.1, 12]} position={[-6 + i * 1.1, 0, 0]} rotation={[0, 0, 0]}>
          <meshStandardMaterial color="#1a4aff" transparent opacity={0.2} />
        </Box>
      ))}

      {/* The Library structure */}
      <group ref={libraryRef} position={[0, 0, 0]}>
        {/* Base platform */}
        <Box args={[10, 0.3, 8]} position={[0, -0.15, 0]}>
          <meshStandardMaterial color="#1a2a3a" />
        </Box>

        {/* Main building */}
        <Box args={[9, 5, 7]} position={[0, 2.5, 0]}>
          <meshStandardMaterial color="#1a2a3a" transparent opacity={0.7} roughness={0.3} metalness={0.4} />
        </Box>

        {/* Glowing windows */}
        {[-3, 0, 3].map((x, i) => (
          <Box key={i} args={[1.2, 1.5, 0.1]} position={[x, 2.5, 3.51]}>
            <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.6} transparent opacity={0.8} />
          </Box>
        ))}

        {/* Class "books" on shelves — represent loaded class metadata */}
        {Array.from({ length: Math.round(fillRatio * 15) }).map((_, i) => (
          <Box key={i}
            args={[0.5, 0.7, 0.2]}
            position={[-3.5 + (i % 8) * 0.9, 0.5 + Math.floor(i / 8) * 1.1, 3.3]}
          >
            <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.3} />
          </Box>
        ))}

        {/* Label on building */}
        <Text position={[0, 5.8, 0]} fontSize={0.4} color="#00d4ff">
          METASPACE
        </Text>
        <Text position={[0, 5.2, 0]} fontSize={0.22} color="#4499ff">
          Class Metadata | Method Data | Constant Pool
        </Text>

        {/* Fill indicator */}
        <Text position={[0, -0.7, 0]} fontSize={0.25} color={fillRatio > 0.8 ? '#ff4444' : '#00d4ff'}>
          {`${Math.round(fillRatio * 100)}% Used — Grows Dynamically`}
        </Text>

        {/* Dynamic growth particles */}
        {Array.from({ length: 5 }).map((_, i) => (
          <Sphere key={i} args={[0.08, 8, 8]}
            position={[
              (Math.sin(i * 1.3) * 5),
              3 + Math.cos(i * 0.8) * 2,
              (Math.cos(i * 1.3) * 4)
            ]}
          >
            <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={1} />
          </Sphere>
        ))}
      </group>

      {/* Key insight banner */}
      <Text position={[0, -1.5, 0]} fontSize={0.28} color="#aaaaaa" maxWidth={12} anchorX="center" textAlign="center">
        {`Metaspace unbounded by default.\nSet -XX:MaxMetaspaceSize to cap it.`}
      </Text>
    </group>
  );
}