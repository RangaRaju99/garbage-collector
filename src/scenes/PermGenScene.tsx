import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Box } from '@react-three/drei';
import * as THREE from 'three';

interface PermGenSceneProps {
  fillRatio?: number; // 0..1
  exploding?: boolean;
}

export default function PermGenScene({ fillRatio = 0.5, exploding = false }: PermGenSceneProps) {
  const buildingRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (glowRef.current) {
      // Glow pulses red when filling up
      const intensity = fillRatio > 0.8
        ? 2 + Math.sin(clock.elapsedTime * 8) * 1.5
        : 0.5;
      glowRef.current.intensity = intensity;
      glowRef.current.color.setHex(fillRatio > 0.8 ? 0xff2200 : 0xff8800);
    }
    if (buildingRef.current && exploding) {
      buildingRef.current.rotation.y += 0.05;
      buildingRef.current.position.y += 0.02;
    }
  });

  const shelfCount = 6;
  const shelves = Array.from({ length: shelfCount });
  const booksPerShelf = 5;

  return (
    <group ref={buildingRef} position={[0, 0, 8]}>
      <pointLight ref={glowRef} position={[0, 3, 0]} intensity={0.5} distance={10} />

      {/* Stone building walls */}
      <Box args={[8, 6, 0.3]} position={[0, 3, -3]}>
        <meshStandardMaterial color="#3a2a1a" roughness={0.9} />
      </Box>
      <Box args={[0.3, 6, 6]} position={[-4, 3, 0]}>
        <meshStandardMaterial color="#3a2a1a" roughness={0.9} />
      </Box>
      <Box args={[0.3, 6, 6]} position={[4, 3, 0]}>
        <meshStandardMaterial color="#3a2a1a" roughness={0.9} />
      </Box>
      {/* Floor */}
      <Box args={[8, 0.2, 6]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#2a1a0a" roughness={1} />
      </Box>
      {/* Ceiling */}
      <Box args={[8, 0.2, 6]} position={[0, 6, 0]}>
        <meshStandardMaterial color="#3a2a1a" roughness={0.9} />
      </Box>

      {/* Shelves */}
      {shelves.map((_, si) => {
        const y = 0.8 + si * 0.85;
        const filledBooks = Math.round(booksPerShelf * Math.min(1, fillRatio * shelfCount - si));
        return (
          <group key={si}>
            {/* Shelf plank */}
            <Box args={[7, 0.1, 0.4]} position={[0, y, -0.5]}>
              <meshStandardMaterial color="#5a3a1a" roughness={0.8} />
            </Box>
            {/* Books / class blueprints */}
            {Array.from({ length: filledBooks }).map((_, bi) => (
              <Box key={bi} args={[0.8, 0.65, 0.3]} position={[-3 + bi * 1.5, y + 0.35, -0.5]}>
                <meshStandardMaterial
                  color={si / shelfCount > fillRatio ? '#334' : '#cc8833'}
                  emissive={fillRatio > 0.8 ? '#ff2200' : '#000'}
                  emissiveIntensity={fillRatio > 0.8 ? 0.4 : 0}
                />
              </Box>
            ))}
          </group>
        );
      })}

      {/* Label */}
      <Text position={[0, 6.6, -2]} fontSize={0.35} color="#ffaa00" font="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2">
        PERMGEN — ARCHIVE VAULT
      </Text>
      <Text position={[0, 6.15, -2]} fontSize={0.2} color="#ff6644">
        FIXED SIZE: 256MB MAX
      </Text>

      {/* Fill meter */}
      <Box args={[4 * fillRatio, 0.18, 0.15]} position={[-2 + 2 * fillRatio, -0.3, 0]}>
        <meshStandardMaterial color={fillRatio > 0.8 ? '#ff2200' : '#cc8833'} emissive={fillRatio > 0.8 ? '#ff0000' : '#000'} emissiveIntensity={0.5} />
      </Box>
      <Box args={[4, 0.18, 0.15]} position={[0, -0.3, 0]}>
        <meshStandardMaterial color="#333" transparent opacity={0.5} />
      </Box>
      <Text position={[0, -0.6, 0]} fontSize={0.22} color="#ffaa00">
        {`${Math.round(fillRatio * 100)}% Full`}
      </Text>
    </group>
  );
}