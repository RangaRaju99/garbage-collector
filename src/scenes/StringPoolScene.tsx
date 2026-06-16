import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, Icosahedron, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

export default function StringPoolScene() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  const constants = ["\"admin\"", "\"password\"", "\"GET\"", "\"200 OK\"", "\"UTF-8\"", "\"index.html\"", "\"java/lang/Object\""];

  return (
    <group>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={2} color="#00d4ff" />

      {/* The Central Pool Core */}
      <Icosahedron args={[10, 2]} position={[0, 0, -20]}>
        <MeshDistortMaterial
          color="#002233"
          speed={2}
          distort={0.4}
          radius={1}
          metalness={1}
          roughness={0}
        />
      </Icosahedron>

      <group ref={groupRef}>
        {constants.map((str, i) => {
          const angle = (i / constants.length) * Math.PI * 2;
          const radius = 15;
          const x = Math.cos(angle) * radius;
          const y = (i - 3) * 3;
          const z = Math.sin(angle) * radius;

          return (
            <Float key={i} speed={2} rotationIntensity={1} floatIntensity={1} position={[x, y, z]}>
              <Text
                fontSize={1.2}
                color="#00d4ff"
                font="/fonts/Inter-Black.woff"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.05}
                outlineColor="#004455"
              >
                {str}
              </Text>
            </Float>
          );
        })}
      </group>

      <Text
        position={[0, 12, -10]}
        fontSize={2}
        color="#00d4ff"
        font="/fonts/Inter-Black.woff"
      >
        THE STRING POOL
      </Text>
    </group>
  );
}