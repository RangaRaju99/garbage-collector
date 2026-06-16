import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

interface ReferenceBeamProps {
  startObjId: string;
  endObjId: string;
  type: 'strong' | 'soft' | 'weak' | 'phantom';
  startPos: [number, number, number];
  endPos: [number, number, number];
}

export default function ReferenceBeam({ type, startPos, endPos }: ReferenceBeamProps) {
  const lineRef = useRef<any>(null);

  let color = '#22c55e'; // Strong: Solid Green
  let lineWidth = 3;
  let dashed = false;

  if (type === 'soft') {
    color = '#3b82f6'; // Soft: Blue pulsing
    lineWidth = 2;
  } else if (type === 'weak') {
    color = '#eab308'; // Weak: Thin Yellow
    lineWidth = 1;
    dashed = true;
  } else if (type === 'phantom') {
    color = '#a855f7'; // Phantom: Purple ghost
    lineWidth = 1;
    dashed = true;
  }

  useFrame(({ clock }) => {
    if (lineRef.current?.material) {
      if (type === 'soft') {
        lineRef.current.material.opacity = 0.5 + Math.sin(clock.elapsedTime * 4) * 0.5;
      } else if (type === 'phantom') {
         lineRef.current.material.opacity = 0.3;
      }
      
      if (dashed && lineRef.current.material.dashOffset !== undefined) {
         lineRef.current.material.dashOffset -= 0.05;
      }
    }
  });

  // Calculate arc for visual flare
  const midX = (startPos[0] + endPos[0]) / 2;
  const midZ = (startPos[2] + endPos[2]) / 2;
  const midY = Math.max(startPos[1], endPos[1]) + 2; // Arch upwards

  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(...startPos),
    new THREE.Vector3(midX, midY, midZ),
    new THREE.Vector3(...endPos)
  );

  const points = curve.getPoints(20);

  return (
    <Line 
      ref={lineRef}
      points={points} 
      color={color} 
      lineWidth={lineWidth}
      dashed={dashed}
      dashScale={2}
      dashSize={0.5}
      dashOffset={0}
      transparent
    />
  );
}