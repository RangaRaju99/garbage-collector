import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Box, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { useJVMStore } from '../store/jvmStore';

export default function SurvivorScene() {
  const objects = useJVMStore(s => s.objects);
  const survivors = objects.filter(o => o.region === 'survivor');
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(clock.elapsedTime * 0.4) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[6, 0, 4]}>
      {/* S0 */}
      <group position={[-3, 0, 0]}>
        <Box args={[5, 0.15, 8]} position={[0, -0.08, 0]}>
          <meshStandardMaterial color="#1a2a3a" roughness={0.9} />
        </Box>
        <Text position={[0, 2.5, -3.5]} fontSize={0.4} color="#00d4ff" anchorX="center">
          SURVIVOR S0
        </Text>
        <Text position={[0, 2.0, -3.5]} fontSize={0.2} color="#447799" anchorX="center">
          Waiting Room — Active
        </Text>
        {survivors.filter((_, i) => i % 2 === 0).slice(0, 6).map((obj, i) => (
          <group key={obj.id} position={[-1.5 + (i % 3) * 1.5, 0.5, -1 + Math.floor(i / 3) * 2]}>
            <Sphere args={[0.3, 16, 16]}>
              <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.3} />
            </Sphere>
            <Text position={[0, 0.55, 0]} fontSize={0.18} color="#00d4ff" anchorX="center">
              age:{(obj as any).age ?? 1}
            </Text>
          </group>
        ))}
        {survivors.length === 0 && Array.from({ length: 3 }).map((_, i) => (
          <group key={i} position={[-1 + i * 1, 0.5, 0]}>
            <Sphere args={[0.3, 16, 16]}>
              <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.3} />
            </Sphere>
            <Text position={[0, 0.55, 0]} fontSize={0.18} color="#00d4ff" anchorX="center">
              {`age:${i + 1}`}
            </Text>
          </group>
        ))}
      </group>

      {/* S1 */}
      <group position={[3, 0, 0]}>
        <Box args={[5, 0.15, 8]} position={[0, -0.08, 0]}>
          <meshStandardMaterial color="#1a1a2a" roughness={0.9} />
        </Box>
        <Text position={[0, 2.5, -3.5]} fontSize={0.4} color="#8888ff" anchorX="center">
          SURVIVOR S1
        </Text>
        <Text position={[0, 2.0, -3.5]} fontSize={0.2} color="#555577" anchorX="center">
          Waiting Room — Empty
        </Text>
        <Text position={[0, 0.5, 0]} fontSize={0.22} color="#333355" anchorX="center">
          (Inactive this cycle)
        </Text>
      </group>

      {/* Age promotion arrow */}
      <Text position={[0, 3.5, 0]} fontSize={0.26} color="#ffaa00" anchorX="center">
        Age {'>'}= MaxTenuringThreshold → Promote to Old Gen
      </Text>
      <Text position={[0, 3.1, 0]} fontSize={0.18} color="#886600" anchorX="center">
        Default: -XX:MaxTenuringThreshold=15
      </Text>
    </group>
  );
}