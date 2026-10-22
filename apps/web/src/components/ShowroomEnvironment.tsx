import { useMemo } from 'react';
import { ContactShadows, MeshReflectorMaterial, useGLTF } from '@react-three/drei';
import { Box3, Vector3 } from 'three';
import { useDeviceTier } from '../lib/useDeviceTier';

/** Original, procedural architecture. Its dimensions follow the loaded asset's bounds. */
export default function ShowroomEnvironment({ url, environment }: { url: string; environment: string }) {
  const { scene } = useGLTF(url, false, true);
  const tier = useDeviceTier();
  const { center, radius, floor } = useMemo(() => {
    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    const radius = Math.max(size.x, size.y, size.z, .01);
    return { center: box.getCenter(new Vector3()), radius, floor: box.min.y - radius * .004 };
  }, [scene]);
  const pearl = environment === 'pearl';
  const floorColor = pearl ? '#c9c7c1' : environment === 'night' ? '#111323' : '#7d8185';
  return <group position={[center.x, floor, center.z]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[radius * 7, radius * 7]} />
      {tier === 'high' ? <MeshReflectorMaterial resolution={256} blur={[128, 64]} mirror={.18} mixBlur={1} mixStrength={.6} depthScale={.2} minDepthThreshold={.4} maxDepthThreshold={1.4} color={floorColor} roughness={.7} metalness={.15} /> : <meshStandardMaterial color={floorColor} roughness={.88} metalness={.08} />}
    </mesh>
    {tier !== 'low' && <ContactShadows position={[0, radius * .002, 0]} scale={radius * 3} opacity={pearl ? .25 : .45} blur={2.5} far={radius} resolution={256} frames={1} />}
    {environment === 'studio' && [-1.9, -.95, .95, 1.9].map((x, index) => <group key={x} position={[radius * x, radius * .9, -radius * 1.65]}>
      <mesh><boxGeometry args={[radius * .12, radius * 1.8, radius * .16]} /><meshStandardMaterial color={index % 2 ? '#b2b6b9' : '#d4d2cb'} roughness={.8} /></mesh>
      <mesh position={[0, radius * .85, 0]}><boxGeometry args={[radius * .34, radius * .05, radius * .25]} /><meshStandardMaterial color="#e3e2dd" roughness={.7} /></mesh>
    </group>)}
    {pearl && <mesh position={[0, -radius * .025, 0]}><cylinderGeometry args={[radius * .86, radius * .9, radius * .045, tier === 'low' ? 24 : 64]} /><meshStandardMaterial color="#e3e1db" metalness={.08} roughness={.6} /></mesh>}
  </group>;
}
