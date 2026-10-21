import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Bounds, Clone, ContactShadows, OrbitControls, useGLTF, useProgress } from '@react-three/drei';
import type { Group } from 'three';

function Model({ url, scrollRotate }: { url: string; scrollRotate: boolean }) {
  const { scene } = useGLTF(url, false, true); // explicitly install Meshopt before loading optimized GLBs
  const group = useRef<Group>(null);
  useFrame(() => {
    if (scrollRotate && group.current) group.current.rotation.y = window.scrollY * 0.004; // scroll-driven orbit
  });
  return (
    <group ref={group}>
      <Clone object={scene} deep />
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
  render() { return this.state.failed ? <div className="placeholder"><span>3D preview unavailable</span><small>The showroom poster and sourced specifications remain available.</small></div> : this.props.children; }
}

function LoadingStatus() {
  const { progress } = useProgress();
  return <div className="model-loading" role="status">Preparing interactive 3D · {Math.round(progress)}%</div>;
}

function supportsWebGL() {
  try { const canvas = document.createElement('canvas'); return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl')); } catch { return false; }
}

interface Props {
  url: string;
  poster?: string;
  fullscreenButton?: boolean;
  scrollRotate?: boolean; // hero mode: rotate with scroll instead of free orbit
  cameraPreset?: string;
}

export default function ModelViewer({ url, poster, fullscreenButton = false, scrollRotate = false, cameraPreset = 'hero' }: Props) {
  const [rotate, setRotate] = useState(true);
  const [ready, setReady] = useState(false);
  const [nearby, setNearby] = useState(false);
  const [requested, setRequested] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const connection = typeof navigator !== 'undefined' ? (navigator as Navigator & { connection?: { saveData?: boolean } }).connection : undefined;
  const memory = typeof navigator !== 'undefined' ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory : undefined;
  const deferForDevice = Boolean(connection?.saveData || (memory && memory <= 4));
  const webgl = typeof document === 'undefined' || supportsWebGL();

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
      {!webgl && <div className="placeholder">Interactive 3D is unavailable in this browser. The poster and sourced specifications remain available.</div>}
      {webgl && nearby && deferForDevice && !requested && <div className="model-consent"><button className="btn primary" type="button" onClick={() => setRequested(true)}>Load interactive 3D</button><small>Data Saver or a lower-memory device was detected.</small></div>}
      {webgl && nearby && (!deferForDevice || requested) && <><LoadingStatus /><ViewerBoundary><Canvas camera={{ position: cameraPreset === 'side' ? [5, .8, .2] : cameraPreset === 'detail' ? [2.2, 1.1, 2.2] : [3, 1.5, 4], fov: cameraPreset === 'detail' ? 32 : 40 }} dpr={memory && memory <= 4 ? [1, 1.25] : [1, 1.75]} gl={{ powerPreference: 'high-performance', antialias: !(memory && memory <= 4) }} style={{ opacity: ready ? 1 : 0, transition: 'opacity .4s' }}>
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
      </Canvas></ViewerBoundary></>}
      {fullscreenButton && (
        <button className="btn ghost" style={{ position: 'absolute', right: 8, bottom: 8, padding: '6px 12px', fontSize: 12 }} onClick={() => box.current?.requestFullscreen?.()}>
          Fullscreen
        </button>
      )}
    </div>
  );
}
