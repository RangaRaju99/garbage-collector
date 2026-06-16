import { useRef } from 'react';
import { Text, Sparkles, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

export default function NativeMemoryScene() {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <group>
      <PerspectiveCamera makeDefault position={[0, 10, 30]} />
      <fog attach="fog" args={['#050505', 20, 60]} />
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 20, 0]} intensity={1.5} color="#aa44ff" />

      {/* Mountain Peaks (Total RSS) */}
      <mesh ref={meshRef} position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100, 50, 50]} />
        <meshStandardMaterial 
           color="#aa44ff" 
           wireframe 
           transparent 
           opacity={0.15}
        />
      </mesh>

      <Sparkles count={200} scale={50} size={2} speed={0.5} color="#aa44ff" />

      {/* Hero Text */}
      <group position={[0, 5, 0]}>
         <Text
            fontSize={2}
            color="#aa44ff"
            font="/fonts/Inter-Black.woff"
            anchorX="center"
            anchorY="middle"
         >
            NATIVE REALM
         </Text>
         <Text
            position={[0, -1.5, 0]}
            fontSize={0.5}
            color="white"
            material-transparent
            material-opacity={0.5}
            font="/fonts/Inter-Black.woff"
            maxWidth={10}
            textAlign="center"
         >
            THE SPACE BEYOND -XMX
         </Text>
      </group>

      {/* Glowing Core */}
      <mesh position={[0, 0, -20]}>
         <sphereGeometry args={[10, 32, 32]} />
         <meshStandardMaterial 
            color="#aa44ff" 
            emissive="#aa44ff" 
            emissiveIntensity={0.5} 
            transparent 
            opacity={0.1} 
         />
      </mesh>
    </group>
  );
}