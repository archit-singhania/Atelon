import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Points as ThreePoints } from 'three';
import { useDeviceTier } from '../lib/useDeviceTier';

function Field({ count }: { count: number }) {
  const ref = useRef<ThreePoints>(null);
  const points = useMemo(() => { const data = new Float32Array(count * 3); for (let i = 0; i < count * 3; i += 3) { data[i] = (Math.random() - .5) * 18; data[i + 1] = (Math.random() - .5) * 12; data[i + 2] = (Math.random() - .5) * 12; } return data; }, [count]);
  useFrame((state, delta) => { if (!ref.current || document.hidden) return; ref.current.rotation.y += delta * .008; ref.current.rotation.x = Math.sin(state.clock.elapsedTime * .05) * .04; });
  return <Points ref={ref} positions={points} stride={3} frustumCulled><PointMaterial transparent color="#8ddcff" size={.025} sizeAttenuation depthWrite={false} opacity={.34} /></Points>;
}

export default function SpatialBackdrop() {
  const tier = useDeviceTier();
  const [visible, setVisible] = useState(!document.hidden); useEffect(() => { const update = () => setVisible(!document.hidden); document.addEventListener('visibilitychange', update); return () => document.removeEventListener('visibilitychange', update); }, []);
  if (tier === 'low') return <div className="spatial-backdrop spatial-static" aria-hidden="true" />;
  return <div className={`spatial-backdrop spatial-${tier}`} aria-hidden="true"><Canvas frameloop={visible ? 'always' : 'never'} dpr={tier === 'high' ? [1, 1.4] : 1} camera={{ position: [0, 0, 7], fov: 50 }} gl={{ alpha: true, powerPreference: tier === 'high' ? 'high-performance' : 'low-power', antialias: false }}><Field count={tier === 'high' ? 520 : 220} /></Canvas></div>;
}
