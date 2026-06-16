import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Text, Float, Line } from '@react-three/drei';
import * as THREE from 'three';

export default function StackScene() {
  const stackRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (stackRef.current) {
      stackRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  const frames = [
    { title: 'main()', color: '#ff4444' },
    { title: 'handleRequest()', color: '#00d4ff' },
    { title: 'validateAuth()', color: '#00d4ff' },
    { title: 'dbQuery()', color: '#00ff88' },
    { title: 'getConn()', color: '#ffaa00' },
  ];

  return (
    <group position={[0, -2, 0]}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#00d4ff" />

      <group ref={stackRef}>
        {frames.map((f, i) => (
          <group key={i} position={[0, i * 2.2, 0]}>
            <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
              <Box args={[6, 1.8, 4]}>
                <meshStandardMaterial 
                  color={f.color} 
                  transparent 
                  opacity={0.15} 
                  metalness={0.9} 
                  roughness={0.1}
                  emissive={f.color}
                  emissiveIntensity={0.2}
                />
              </Box>
              <Box args={[6.1, 1.9, 4.1]}>
                <meshStandardMaterial color={f.color} wireframe opacity={0.3} transparent />
              </Box>
              
              <Text
                position={[0, 0, 2.1]}
                fontSize={0.4}
                color="white"
                font="/fonts/Inter-Black.woff"
              >
                {f.title}
              </Text>
              
              {/* Stack Variables */}
              <group position={[-2, -0.4, 0.5]}>
                 <Box args={[0.5, 0.5, 0.5]}>
                    <meshStandardMaterial color="#fff" />
                 </Box>
                 <Text position={[1.2, 0, 0]} fontSize={0.2} color="gray">v_0: primitive</Text>
              </group>
            </Float>
          </group>
        ))}
      </group>

      {/* Connection Beam */}
      <Line
        points={[[0, -5, 0], [0, 15, 0]]}
        color="#ffffff"
        opacity={0.1}
        transparent
        lineWidth={1}
      />

      <Text
        position={[8, 5, 0]}
        rotation={[0, -Math.PI / 4, 0]}
        fontSize={1.5}
        color="white"
        font="/fonts/Inter-Black.woff"
      >
        STACK FRAMES
      </Text>
    </group>
  );
}