import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, ContactShadows, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useJVMStore } from '../store/jvmStore';
import gsap from 'gsap';
import G1RegionGridScene from './G1RegionGridScene';
import ObjectCharacter from '../components/ObjectCharacter';
import ReferenceBeam from '../components/ReferenceBeam';
import STWTrafficLight from '../components/STWTrafficLight';
import GCRobots from '../components/GCRobot';
import { instance as jvmEngine } from '../simulator/JVMEngine';

function EdenDistrict() {
  return (
    <group position={[-5, 0, 0]}>
      {/* Platform */}
      <mesh position={[0, -0.6, 0]} receiveShadow>
        <boxGeometry args={[10, 0.2, 10]} />
        <meshStandardMaterial color="#1a3a2a" />
      </mesh>
      
      {/* TLAB Lanes */}
      <group position={[0, -0.48, 0]}>
        <mesh position={[-3, 0, 0]} receiveShadow>
          <planeGeometry args={[2, 9]} />
          <meshStandardMaterial color="#00d4ff" transparent opacity={0.1} side={THREE.DoubleSide} />
        </mesh>
        <Text position={[-3, 0.01, 4.2]} rotation={[-Math.PI/2, 0, 0]} fontSize={0.2} color="cyan">TLAB-1</Text>

        <mesh position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[2, 9]} />
          <meshStandardMaterial color="#00ff88" transparent opacity={0.1} side={THREE.DoubleSide} />
        </mesh>
        <Text position={[0, 0.01, 4.2]} rotation={[-Math.PI/2, 0, 0]} fontSize={0.2} color="#00ff88">TLAB-2</Text>

        <mesh position={[3, 0, 0]} receiveShadow>
          <planeGeometry args={[2, 9]} />
          <meshStandardMaterial color="#ffaa00" transparent opacity={0.1} side={THREE.DoubleSide} />
        </mesh>
        <Text position={[3, 0.01, 4.2]} rotation={[-Math.PI/2, 0, 0]} fontSize={0.2} color="#ffaa00">TLAB-3</Text>
      </group>
      
      {/* Engine dynamic objects placed deterministically for visual purpose */}
      {Array.from(jvmEngine.objects.values()).filter(o => o.generation === 'eden').map((obj, i) => (
         <ObjectCharacter 
            key={obj.id} 
            position={[-4 + (i%3)*2, 0, -4 + Math.floor(i/3)*2]} 
            objData={{id: obj.id, age: obj.age, size: obj.size, generation: obj.generation, reachable: obj.isRoot, type: obj.type}} 
         />
      ))}
      
      <gridHelper args={[10, 10, '#00ff88', '#00ff88']} position={[0, -0.49, 0]} material-opacity={0.2} material-transparent />
      
      <Text position={[0, -0.4, 4.5]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.6} color="white" anchorX="center" anchorY="bottom">
        EDEN DISTRICT
      </Text>
    </group>
  );
}

function OldGenerationDistrict() {
  return (
    <group position={[8, 0, 0]}>
      <mesh position={[0, -0.6, 0]} receiveShadow>
        <boxGeometry args={[12, 0.2, 12]} />
        <meshStandardMaterial color="#2a1a3a" />
      </mesh>
      
      {/* Long lived objects */}
      {Array.from(jvmEngine.objects.values()).filter(o => o.generation === 'old').map((obj, i) => (
         <ObjectCharacter 
            key={obj.id} 
            position={[-5 + (i%4)*2, 0, -5 + Math.floor(i/4)*2]} 
            color="#3B82F6"
            objData={{id: obj.id, age: obj.age, size: obj.size, generation: obj.generation, reachable: obj.isRoot, type: obj.type}} 
         />
      ))}
      
      <gridHelper args={[12, 12, '#00d4ff', '#00d4ff']} position={[0, -0.49, 0]} material-opacity={0.2} material-transparent />
      
      <Text position={[0, -0.4, 5.5]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.6} color="white" anchorX="center" anchorY="bottom">
        OLD GENERATION
      </Text>
    </group>
  );
}

function PermGenDistrict() {
  const groupRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    // Drop in animation
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
      {/* Vault Building */}
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
      // Cinematic birth from below
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
      {/* Metaspace Library */}
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
      <pointsMaterial size={0.2} color="#ffaa00" transparent opacity={1} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function CameraController() {
  const { camera, controls } = useThree();
  const sequence = useJVMStore(state => state.activeCameraSequence);

  useEffect(() => {
    // Defined in master prompt
    const cameraSequences: Record<string, {pos: [number,number,number], target: [number,number,number], duration: number}> = {
      default:        { pos: [12, 10, 15],  target: [0,0,0],    duration: 1.5 },
      objectBirth:    { pos: [0, 5, 12],    target: [-5,0,0],   duration: 2 }, // Target Eden
      markPhase:      { pos: [0, 30, 0],    target: [0,0,0],    duration: 1.5 }, // Top down
      sweepPhase:     { pos: [-15, 10, 5],  target: [0,0,0],    duration: 2 },
      promotion:      { pos: [5, 5, 8],     target: [5,0,0],    duration: 2 }, // Gate OldGen
      islandCollapse: { pos: [5, 15, 10],   target: [0,0,0],    duration: 2.5 },
      fullGCFreeze:   { pos: [0, 40, 5],    target: [0,0,0],    duration: 1 }
    };

    const targetSeq = cameraSequences[sequence] || cameraSequences.default;

    // Tween Camera Position
    gsap.to(camera.position, {
      x: targetSeq.pos[0],
      y: targetSeq.pos[1],
      z: targetSeq.pos[2],
      duration: targetSeq.duration,
      ease: "power2.inOut"
    });

    // Tween OrbitControls target if controls exist
    if (controls) {
       gsap.to((controls as any).target, {
         x: targetSeq.target[0],
         y: targetSeq.target[1],
         z: targetSeq.target[2],
         duration: targetSeq.duration,
         ease: "power2.inOut"
       });
    }
  }, [sequence, camera, controls]);

  return null;
}

export default function CityScene() {
  const javaVersion = useJVMStore(state => state.javaVersion);
  const gcAlgorithm = useJVMStore(state => state.gcAlgorithm);
  const [showExplosion, setShowExplosion] = useState(false);
  const prevVersion = useRef(javaVersion);

  useEffect(() => {
    if (prevVersion.current < 8 && javaVersion >= 8) {
      // Trigger explosion!
      setShowExplosion(true);
      setTimeout(() => setShowExplosion(false), 3000); // clear explosion after 3s
    }
    prevVersion.current = javaVersion;
  }, [javaVersion]);

  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 20, 25], fov: 45 }}>
        <color attach="background" args={['#0a0a0f']} />
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 10]} intensity={2} castShadow />
        <pointLight position={[0, 10, -10]} intensity={showExplosion ? 10 : 0} color="#ff4400" distance={50} />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {/* Memory Regions */}
        <EdenDistrict />
        
        {gcAlgorithm === 'G1' || gcAlgorithm === 'ZGC' || gcAlgorithm === 'Shenandoah' 
          ? <G1RegionGridScene /> 
          : <OldGenerationDistrict />
        }
        
        {/* Conditional rendering based on Java Version */}
        {javaVersion < 8 ? <PermGenDistrict /> : <MetaspaceDistrict />}
        
        {/* Render Reference Beams */}
        {Array.from(jvmEngine.objects.values()).map((obj) => {
          if (!obj.references || obj.references.length === 0) return null;
          
          return obj.references.map((refId) => {
            const target = jvmEngine.objects.get(refId);
            if (!target) return null;
            
            // Derive a deterministic position for visual link purposes
            // We'll approximate their positions based on the logic we used in the mapping above
            // (real engine needs physics or explicit node coords, here we fake deterministic ones)
            const getObjPos = (oObj: any): [number, number, number] => {
               const oList = oObj.generation === 'eden' ? jvmEngine.edenRef : jvmEngine.oldGenRef;
               const idx = oList.findIndex(x => x.id === oObj.id);
               if(idx===-1) return [0,0,0];
               if(oObj.generation === 'eden') return [-4 + (idx%3)*2, 0, -4 + Math.floor(idx/3)*2];
               return [-5 + (idx%4)*2, 0, -5 + Math.floor(idx/4)*2];
            }

            const sPos = getObjPos(obj);
            const tPos = getObjPos(target);

            // Mock ref type based on generation hash for visual variety
            const types = ['strong', 'soft', 'weak', 'phantom'];
            const rType = types[(obj.id.length + target.id.length) % 4] as any;

            return <ReferenceBeam key={`${obj.id}-${refId}`} startObjId={obj.id} endObjId={refId} type={rType} startPos={sPos} endPos={tPos} />;
          });
        })}

        {showExplosion && <ExplosionParticles position={[2, 4, -12]} />}
        
        {/* STW Overlay */}
        <STWTrafficLight />
        <GCRobots />
        
        <CameraController />

        <ContactShadows resolution={1024} scale={50} blur={2} opacity={0.5} far={10} color="#000000" />
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2 - 0.05} // don't go below ground
        />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
