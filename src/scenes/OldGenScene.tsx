import { Text, Box } from '@react-three/drei';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useJVMStore } from '../store/jvmStore';

export default function OldGenScene() {
  const objects = useJVMStore(s => s.objects);
  const oldGenObjects = objects.filter(o => o.region === 'oldGen').slice(0, 24);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.05) * 0.02;
    }
  });

  const rows = 4, cols = 6;

  return (
    <group ref={groupRef} position={[12, 0, 0]}>
      {/* Old Gen floor */}
      <Box args={[18, 0.15, 12]} position={[0, -0.08, 0]}>
        <meshStandardMaterial color="#2a1a3a" roughness={0.9} />
      </Box>
      {/* Perimeter wall */}
      {[-9, 9].map((x, i) => (
        <Box key={i} args={[0.1, 3, 12]} position={[x, 1.5, 0]}>
          <meshStandardMaterial color="#331a44" transparent opacity={0.4} />
        </Box>
      ))}
      <Text position={[0, 3.8, -5.5]} fontSize={0.55} color="#aa44ff" anchorX="center">
        OLD GENERATION — LUXURY RESIDENTIAL
      </Text>
      <Text position={[0, 3.1, -5.5]} fontSize={0.22} color="#661a88" anchorX="center">
        Long-lived objects promoted after {'>'}=15 GC cycles
      </Text>

      {/* Object grid */}
      {Array.from({ length: rows * cols }).map((_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const obj = oldGenObjects[i];
        const x = -6.5 + col * 2.5;
        const z = -3 + row * 2;
        return (
          <group key={i} position={[x, 0, z]}>
            {/* Mansion base */}
            <Box args={[1.7, 0.1, 1.7]} position={[0, 0, 0]}>
              <meshStandardMaterial color="#1a0a2a" />
            </Box>
            {obj ? (
              <>
                <Box args={[1.2, 1.0, 1.2]} position={[0, 0.5, 0]}>
                  <meshStandardMaterial color="#6644aa" emissive="#6644aa" emissiveIntensity={0.2} roughness={0.6} />
                </Box>
                <Text position={[0, 1.2, 0.65]} fontSize={0.14} color="#cc99ff" anchorX="center">
                  {obj.type ?? 'Object'}
                </Text>
                <Text position={[0, 0.95, 0.65]} fontSize={0.11} color="#9966cc" anchorX="center">
                  {`age:${(obj as any).age ?? 15}`}
                </Text>
              </>
            ) : (
              // Empty plot
              <Box args={[1.5, 0.05, 1.5]} position={[0, 0.05, 0]}>
                <meshStandardMaterial color="#220d33" roughness={1} />
              </Box>
            )}
          </group>
        );
      })}

      {/* Card table indicator strip */}
      <Box args={[18, 0.08, 0.3]} position={[0, 0.04, 5.85]}>
        <meshStandardMaterial color="#ff6b00" transparent opacity={0.5} emissive="#ff6b00" emissiveIntensity={0.3} />
      </Box>
      <Text position={[0, 0.4, 6.2]} fontSize={0.2} color="#ff6b00" anchorX="center">
        Card Table — tracks Old→Young refs
      </Text>
    </group>
  );
}