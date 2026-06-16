import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Box } from '@react-three/drei';
import * as THREE from 'three';
import { useJVMStore } from '../store/jvmStore';

export default function EdenScene() {
  const flags = useJVMStore(s => s.flags);
  const objects = useJVMStore(s => s.objects);
  const tlabRef = useRef<THREE.Group>(null);
  const tlabCount = 4;

  useFrame(({ clock }) => {
    if (tlabRef.current) {
      tlabRef.current.children.forEach((child, i) => {
        child.position.y = 0.05 * Math.sin(clock.elapsedTime * 0.5 + i);
      });
    }
  });

  return (
    <group position={[-8, 0, 4]}>
      <Box args={[14, 0.15, 8]} position={[0, -0.08, 0]}>
        <meshStandardMaterial color="#1a3a2a" roughness={0.9} />
      </Box>
      <Text position={[0, 3.2, -3.5]} fontSize={0.5} color="#00ff88" anchorX="center">
        EDEN — BIRTH HOSPITAL
      </Text>
      <Text position={[0, 2.6, -3.5]} fontSize={0.22} color="#00aa66" anchorX="center">
        Objects born here via TLAB bump-pointer allocation
      </Text>
      <group ref={tlabRef}>
        {Array.from({ length: tlabCount }).map((_, i) => {
          const x = -5 + i * 3.5;
          return (
            <group key={i} position={[x, 0, 0]}>
              <Box args={[3, 0.05, 7.5]} position={[0, 0.01, 0]}>
                <meshStandardMaterial color="#00ffff" transparent opacity={0.04} />
              </Box>
              <Box args={[0.04, 0.4, 7.5]} position={[-1.5, 0.2, 0]}>
                <meshStandardMaterial color="#00ffff" transparent opacity={0.3} />
              </Box>
              <Box args={[0.04, 0.4, 7.5]} position={[1.5, 0.2, 0]}>
                <meshStandardMaterial color="#00ffff" transparent opacity={0.3} />
              </Box>
              <Text position={[0, 0.5, -3.5]} fontSize={0.22} color="#00ffff" anchorX="center">
                {`TLAB-${i + 1} / Thread-${i + 1}`}
              </Text>
              <Box args={[2.8, 0.06, 0.06]} position={[0, 0.12, 1.5 - i * 0.4]}>
                <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.8} />
              </Box>
            </group>
          );
        })}
      </group>
      {objects.filter(o => o.region === 'eden').slice(0, 20).map((obj, i) => (
        <Box key={obj.id} args={[0.45, 0.45, 0.45]}
          position={[-5 + (i % 5) * 2.5, 0.25, -1 + Math.floor(i / 5) * 1.5]}>
          <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.25} />
        </Box>
      ))}
      <Text position={[6.5, 1.5, 0]} fontSize={0.22} color="#888" anchorX="right" textAlign="right">
        {`Capacity: ${Math.round(flags.Xmx * 0.25)}MB\nTLABs: ${tlabCount}`}
      </Text>
    </group>
  );
}