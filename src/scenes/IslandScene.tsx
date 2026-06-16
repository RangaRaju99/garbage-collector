import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';

type Phase = 'alive' | 'rootCut' | 'collecting' | 'collected';

export default function IslandScene() {
  const [phase, setPhase] = useState<Phase>('alive');
  const islandRef = useRef<THREE.Group>(null);
  const rootBeamRef = useRef<THREE.Group>(null);

  // Objects on the island: A → B → C → A (circular)
  const positions: [number, number, number][] = [
    [0, 0.5, 0],
    [1.5, 0.5, 1.3],
    [-1.5, 0.5, 1.3],
  ];

  useEffect(() => {
    if (phase === 'rootCut') {
      // After 1.5s start collecting
      setTimeout(() => setPhase('collecting'), 1500);
    }
    if (phase === 'collecting') {
      // Sink island + dissolve
      if (islandRef.current) {
        gsap.to(islandRef.current.position, { y: -5, duration: 2.5, ease: 'power2.in' });
        gsap.to(islandRef.current.rotation, { y: Math.PI * 4, duration: 2.5, ease: 'power2.in' });
      }
      setTimeout(() => setPhase('collected'), 2600);
    }
  }, [phase]);

  useFrame(({ clock }) => {
    if (islandRef.current && phase === 'alive') {
      islandRef.current.position.y = Math.sin(clock.elapsedTime * 0.6) * 0.15;
    }
  });

  const objectColor = phase === 'rootCut' ? '#ffaa00' : phase === 'collecting' ? '#ff4444' : phase === 'collected' ? '#333333' : '#00ff88';
  const labelColor = phase === 'collecting' ? '#ff4444' : phase === 'collected' ? '#666' : '#00d4ff';

  return (
    <group position={[0, 2, -8]}>
      {/* Root bridge (strong external reference) */}
      {phase === 'alive' && (
        <group ref={rootBeamRef}>
          <Line points={[[-6, 0, 0], [0, 0, 0]]} color="#00ff88" lineWidth={3} />
          <Text position={[-4, 0.4, 0]} fontSize={0.3} color="#00ff88">GC Root</Text>
        </group>
      )}

      {phase === 'rootCut' && (
        <group>
          {/* Broken beam */}
          <Line points={[[-6, 0, 0], [-3, 0.5, 0]]} color="#ff4444" lineWidth={2} />
          <Text position={[-4, 1, 0]} fontSize={0.3} color="#ff4444">✗ Root Cut!</Text>
        </group>
      )}

      {/* The island platform */}
      {phase !== 'collected' && (
        <group ref={islandRef}>
          {/* Island base */}
          <mesh position={[0, -0.3, 0.8]}>
            <cylinderGeometry args={[2.5, 2, 0.4, 24]} />
            <meshStandardMaterial color="#1a3a2a" />
          </mesh>

          {/* Objects on island (A, B, C) */}
          {positions.map((pos, idx) => (
            <group key={idx} position={pos}>
              <Sphere args={[0.4, 16, 16]}>
                <meshStandardMaterial
                  color={objectColor}
                  emissive={objectColor}
                  emissiveIntensity={phase === 'collecting' ? 0.8 : 0.3}
                  transparent
                  opacity={phase === 'collecting' ? 0.6 : 1}
                />
              </Sphere>
              <Html center zIndexRange={[100, 0]}>
                <div className="bg-black/70 border border-white/20 px-2 py-1 rounded text-[10px] font-mono text-white">
                  Object {String.fromCharCode(65 + idx)}
                  <br />
                  <span className={phase === 'collecting' ? 'text-red-400' : 'text-green-400'}>
                    {phase === 'collecting' ? '⚠ UNMARKED' : phase === 'rootCut' ? '⚠ Unreachable' : '✓ Alive'}
                  </span>
                </div>
              </Html>
            </group>
          ))}

          {/* Circular reference beams: A→B, B→C, C→A */}
          <Line points={[positions[0], positions[1]]} color="#ffaa00" lineWidth={2} />
          <Line points={[positions[1], positions[2]]} color="#ffaa00" lineWidth={2} />
          <Line points={[positions[2], positions[0]]} color="#ffaa00" lineWidth={2} />

          <Text position={[0, -0.8, 0.8]} fontSize={0.25} color={labelColor} anchorX="center">
            {phase === 'alive'
              ? 'Circular References — but still rooted'
              : phase === 'rootCut'
              ? '⚠ No GC Root Reachable — ISLAND!'
              : '💀 Collected Together'}
          </Text>
        </group>
      )}

      {phase === 'collected' && (
        <Text position={[0, 0, 0]} fontSize={0.5} color="#888" anchorX="center">
          💨 Entire island collected.{'\n'}
          <Text fontSize={0.25} color="#666">
            Circular refs don't protect from GC.
          </Text>
        </Text>
      )}

      {/* Control buttons */}
      <Html position={[0, -3.5, 0]} center zIndexRange={[200, 0]}>
        <div className="flex gap-3">
          {phase === 'alive' && (
            <button
              onClick={() => setPhase('rootCut')}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded transition shadow-lg"
            >
              ✂ Cut GC Root
            </button>
          )}
          {phase === 'collected' && (
            <button
              onClick={() => setPhase('alive')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded transition"
            >
              ↺ Reset
            </button>
          )}
        </div>
      </Html>
    </group>
  );
}