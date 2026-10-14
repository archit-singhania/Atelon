import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Bounds, ContactShadows, OrbitControls, useGLTF } from '@react-three/drei';
import type { Group } from 'three';

function Model({ url, scrollRotate }: { url: string; scrollRotate: boolean }) {
  const { scene } = useGLTF(url, false, true); // explicitly install Meshopt before loading optimized GLBs
  const group = useRef<Group>(null);
  useFrame(() => {
    if (scrollRotate && group.current) group.current.rotation.y = window.scrollY * 0.004; // scroll-driven orbit
  });
  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}

function Ready({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady]); // mounts only after the model has loaded (inside Suspense)
  return null;
}

class ViewerBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className="placeholder">The interactive model could not be loaded. The sourced specifications are still available below.</div> : this.props.children; }
}

interface Props {
  url: string;
  poster?: string;
  fullscreenButton?: boolean;
  scrollRotate?: boolean; // hero mode: rotate with scroll instead of free orbit
}

export default function ModelViewer({ url, poster, fullscreenButton = false, scrollRotate = false }: Props) {
  const [rotate, setRotate] = useState(true);
  const [ready, setReady] = useState(false);
  const [nearby, setNearby] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const element = box.current;
    if (!element || !('IntersectionObserver' in window)) { setNearby(true); return; }
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setNearby(true), { rootMargin: '320px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={box} style={{ position: 'absolute', inset: 0 }}>
      {poster && !ready && <img src={poster} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} />}
      {nearby && <ViewerBoundary><Canvas camera={{ position: [3, 1.5, 4], fov: 40 }} dpr={[1, 1.75]} gl={{ powerPreference: 'high-performance', antialias: true }} style={{ opacity: ready ? 1 : 0, transition: 'opacity .4s' }}>
        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.4}>
            <Model url={url} scrollRotate={scrollRotate} />
          </Bounds>
          <ContactShadows position={[0, 0, 0]} opacity={0.5} blur={2.5} scale={12} />
          <hemisphereLight intensity={1.3} color="#dff5ff" groundColor="#121820" />
          <directionalLight position={[4, 7, 5]} intensity={2.4} color="#ffffff" />
          <directionalLight position={[-4, 2, -3]} intensity={1.1} color="#8ddcff" />
          <Ready onReady={() => setReady(true)} />
        </Suspense>
        {!scrollRotate && (
          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.08}
            autoRotate={rotate && !reduced}
            autoRotateSpeed={1.2}
            minPolarAngle={0.2}
            maxPolarAngle={Math.PI / 2.05}
            onStart={() => setRotate(false)} // stop auto-rotate on touch / drag
          />
        )}
      </Canvas></ViewerBoundary>}
      {fullscreenButton && (
        <button className="btn ghost" style={{ position: 'absolute', right: 8, bottom: 8, padding: '6px 12px', fontSize: 12 }} onClick={() => box.current?.requestFullscreen?.()}>
          Fullscreen
        </button>
      )}
    </div>
  );
}
