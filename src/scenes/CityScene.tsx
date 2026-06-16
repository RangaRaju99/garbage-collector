import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, ContactShadows, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useJVMStore } from '../store/jvmStore';
import gsap from 'gsap';

import G1RegionGridScene from './G1RegionGridScene';
import EdenScene from './EdenScene';
import SurvivorScene from './SurvivorScene';
import OldGenScene from './OldGenScene';

import ReferenceBeam from '../components/ReferenceBeam';
import STWTrafficLight from '../components/STWTrafficLight';
import GCRobots from '../components/GCRobot';
import { instance as jvmEngine } from '../simulator/JVMEngine';

function PermGenDistrict() {
  const groupRef = useRef<THREE.Group>(null);
  useEffect(() => {
    if (groupRef.current) {
      gsap.from(groupRef.current.position, { y: 20, duration: 2, ease: "bounce.out" });
    }
  }, []);
  return (
    <group position={[2, 0, -12]} ref={groupRef}>
      <mesh position={[0, -0.6, 0]} receiveShadow>
        <boxGeometry args={[8, 0.2, 8]} />
        <meshStandardMaterial color="#3a2a1a" />
      </mesh>
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[6, 4, 6]} />
        <meshStandardMaterial color="#4a3a2a" roughness={0.8} />
      </mesh>
      <Text position={[0, 4.5, 3]} fontSize={0.8} color="#ffaa00" anchorX="center" outlineWidth={0.05} outlineColor="black">
        PERMGEN VAULT
      </Text>
    </group>
  );
}

function MetaspaceDistrict() {
  const groupRef = useRef<THREE.Group>(null);
  useEffect(() => {
    if (groupRef.current) {
      gsap.fromTo(groupRef.current.position, 
        { y: -20, scale: 0 }, 
        { y: 0, scale: 1, duration: 3, ease: "elastic.out(1, 0.5)" }
      );
    }
  }, []);
  return (
    <group position={[0, 0, -15]} ref={groupRef}>
      <mesh position={[0, -0.6, 0]} receiveShadow>
        <cylinderGeometry args={[8, 8, 0.2, 32]} />
        <meshStandardMaterial color="#1a2a3a" />
      </mesh>
      <mesh position={[0, 3, 0]} castShadow>
        <cylinderGeometry args={[5, 6, 6, 8]} />
        <meshStandardMaterial color="#2a3a4a" metalness={0.7} roughness={0.2} transparent opacity={0.8} />
      </mesh>
      <Text position={[0, 6.5, 0]} fontSize={1} color="#00d4ff" anchorX="center" outlineWidth={0.05} outlineColor="black">
        METASPACE LIBRARY (NATIVE)
      </Text>
      <gridHelper args={[16, 16, '#00d4ff', '#1a2a3a']} position={[0, -0.49, 0]} material-opacity={0.3} material-transparent />
    </group>
  );
}

function ExplosionParticles({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Points>(null);
  const [particles] = useState(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000 * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 5;
    }
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geom;
  });
  useFrame(() => {
    if (ref.current) {
      const positions = ref.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] *= 1.05;
        positions[i + 1] += (Math.random() * 0.2);
        positions[i + 2] *= 1.05;
      }
      ref.current.geometry.attributes.position.needsUpdate = true;
      (ref.current.material as THREE.PointsMaterial).opacity *= 0.96;
    }
  });
  return (
    <points position={position} ref={ref} geometry={particles}>
      <pointsMaterial size={0.15} color="#ffaa00" transparent opacity={1} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function CameraController() {
  const { camera, controls } = useThree();
  const sequence = useJVMStore(state => state.activeCameraSequence);
  useEffect(() => {
    const cameraSequences: Record<string, {pos: [number,number,number], target: [number,number,number], duration: number}> = {
      default:        { pos: [15, 12, 18],  target: [2,0,5],    duration: 1.5 },
      objectBirth:    { pos: [-8, 6, 12],   target: [-8,0,4],   duration: 2 }, 
      markPhase:      { pos: [0, 25, 5],    target: [2,0,5],    duration: 1.5 }, 
      sweepPhase:     { pos: [-15, 12, 10], target: [0,0,5],    duration: 2 },
      promotion:      { pos: [10, 8, 12],   target: [12,0,0],   duration: 2 }, 
      islandCollapse: { pos: [5, 15, 10],   target: [2,0,5],    duration: 2.5 },
      fullGCFreeze:   { pos: [0, 45, 5],    target: [0,0,0],    duration: 1 }
    };
    const targetSeq = cameraSequences[sequence] || cameraSequences.default;
    gsap.to(camera.position, {
      x: targetSeq.pos[0], y: targetSeq.pos[1], z: targetSeq.pos[2],
      duration: targetSeq.duration, ease: "power2.inOut"
    });
    if (controls) {
       gsap.to((controls as any).target, {
         x: targetSeq.target[0], y: targetSeq.target[1], z: targetSeq.target[2],
         duration: targetSeq.duration, ease: "power2.inOut"
       });
    }
  }, [sequence, camera, controls]);
  return null;
}

export default function CityScene() {
  const javaVersion = useJVMStore(state => state.javaVersion);
  const gcAlgorithm = useJVMStore(state => state.gcAlgorithm);
  const xrayMode = useJVMStore(state => state.xrayMode);
  const [showExplosion, setShowExplosion] = useState(false);
  const prevVersion = useRef(javaVersion);

  useEffect(() => {
    if (prevVersion.current < 8 && javaVersion >= 8) {
      setShowExplosion(true);
      setTimeout(() => setShowExplosion(false), 3000); 
    }
    prevVersion.current = javaVersion;
  }, [javaVersion]);

  return (
    <div className="absolute inset-0">
      <Canvas shadows camera={{ position: [20, 20, 20], fov: 40 }}>
        <color attach="background" args={['#050508']} />
        <fog attach="fog" args={['#050508', 30, 65]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[15, 25, 10]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
        <pointLight position={[0, 10, -10]} intensity={showExplosion ? 20 : 0} color="#ff6600" distance={60} />
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
        
        <group scale={xrayMode ? 0.95 : 1}>
           <EdenScene />
           <SurvivorScene />
           {gcAlgorithm === 'G1' || gcAlgorithm === 'ZGC' || gcAlgorithm === 'Shenandoah' 
             ? <G1RegionGridScene /> 
             : <OldGenScene />
           }
        </group>
        
        {javaVersion < 8 ? <PermGenDistrict /> : <MetaspaceDistrict />}
        {showExplosion && <ExplosionParticles position={[2, 4, -12]} />}
        <STWTrafficLight />
        <GCRobots />
        
        {Array.from(jvmEngine.objects.values()).slice(0, 30).map((obj) => {
          if (!obj.references || obj.references.length === 0) return null;
          return obj.references.map((refId) => {
            const target = jvmEngine.objects.get(refId);
            if (!target) return null;
            const getObjPos = (oObj: any): [number, number, number] => {
               if (oObj.generation === 'eden') return [-8 + (Math.random()*4-2), 0.5, 4 + (Math.random()*2-1)];
               if (oObj.generation === 'old') return [12 + (Math.random()*4-2), 0.5, 0 + (Math.random()*2-1)];
               return [0, 0 ,0];
            }
            return (
              <ReferenceBeam key={`${obj.id}-${refId}`} startObjId={obj.id} endObjId={refId} type="strong" startPos={getObjPos(obj)} endPos={getObjPos(target)} />
            );
          });
        })}

        <CameraController />
        <ContactShadows resolution={1024} scale={60} blur={2.5} opacity={0.4} far={20} color="#000000" />
        <OrbitControls enablePan={true} enableZoom={true} rotateSpeed={0.5} maxPolarAngle={Math.PI / 2 - 0.1} minDistance={10} maxDistance={50} />
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}
