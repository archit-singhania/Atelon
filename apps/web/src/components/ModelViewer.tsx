import { signalQuality } from '../lib/telemetry';
import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bounds, Clone, ContactShadows, OrbitControls, Html, useBounds, useGLTF, useProgress } from '@react-three/drei';
import type { Group, Mesh, MeshStandardMaterial } from 'three';
import type { ModelHotspot, ExplodedPart } from '../types';
import { vehicles } from '../lib/data';
import CameraRig from './CameraRig';
import ShowroomEnvironment from './ShowroomEnvironment';
import { reportRenderer, useDeviceTier } from '../lib/useDeviceTier';

function Model({ url, scrollRotate, hotspots = [], active, select, paint, paintMaterials = [], exploded = false, parts = [] }: { url: string; scrollRotate: boolean; hotspots?: ModelHotspot[]; active?: string; select: (id: string) => void; paint: string; paintMaterials?: string[]; exploded?: boolean; parts?: ExplodedPart[] }) {
  const { scene } = useGLTF(url, false, true); // explicitly install Meshopt before loading optimized GLBs
  const group = useRef<Group>(null);
  const bounds = useBounds();
  useEffect(() => { const hotspot = hotspots.find(item => item.id === active); if (hotspot) { const [x,y,z] = hotspot.position; const distance = bounds.getSize().distance * .6; bounds.moveTo([x + distance, y + distance * .4, z + distance]).lookAt({ target: hotspot.position }); } }, [active]);
  useEffect(() => { const base = new Map<string, [number,number,number]>(); for (const part of parts) { const node = group.current?.getObjectByName(part.node); if (!node) continue; base.set(part.node, node.position.toArray() as [number,number,number]); if (exploded) node.position.add({ x: part.offset[0], y: part.offset[1], z: part.offset[2] } as never); } return () => { for (const [name, position] of base) group.current?.getObjectByName(name)?.position.fromArray(position); }; }, [exploded, parts]);
  useEffect(() => { if (!paintMaterials.length) return; const originals: { material: MeshStandardMaterial; color: string }[] = []; group.current?.traverse(object => { const mesh = object as Mesh; if (!mesh.isMesh) return; const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]; for (const material of materials as MeshStandardMaterial[]) if (paintMaterials.includes(material.name) && material.color) { originals.push({ material, color: material.color.getHexString() }); material.color.set(paint); } }); return () => originals.forEach(({ material, color }) => material.color.set(`#${color}`)); }, [paint, paintMaterials]);
  useFrame(() => {
    if (scrollRotate && group.current) group.current.rotation.y = window.scrollY * 0.004; // scroll-driven orbit
  });
  return (
    <group ref={group}>
      <Clone object={scene} deep />
      {hotspots.map(hotspot => <Html key={hotspot.id} position={hotspot.position} center><button className="hotspot-anchor" aria-label={hotspot.label} aria-pressed={active === hotspot.id} onClick={() => select(hotspot.id)}>+</button></Html>)}
    </group>
  );
}

function Ready({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady]); // mounts only after the model has loaded (inside Suspense)
  return null;
}
function Capture({ url }: { url: string }) { const { gl, scene, camera } = useThree(); useEffect(() => { const capture = (event: Event) => { const detail = (event as CustomEvent<{ url: string; done: (value: string | null) => void }>).detail; if (detail.url !== url) return; try { gl.render(scene,camera); detail.done(gl.domElement.toDataURL('image/png')); } catch { detail.done(null); } }; addEventListener('atelon-capture-model',capture);return()=>removeEventListener('atelon-capture-model',capture); },[url,gl,scene,camera]);return null; }

class ViewerBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  componentDidCatch() { signalQuality('model_failure'); }
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className="placeholder"><span>3D preview unavailable</span><small>The showroom poster and sourced specifications remain available.</small></div> : this.props.children; }
}

function LoadingStatus() {
  const { progress } = useProgress();
  return <div className="model-loading" role="status">Preparing interactive 3D · {Math.round(progress)}%</div>;
}

let webglSupport: boolean | undefined;
function supportsWebGL() {
  if (webglSupport !== undefined) return webglSupport;
  try { const canvas = document.createElement('canvas'); const context = canvas.getContext('webgl2') || canvas.getContext('webgl'); webglSupport = Boolean(context); context?.getExtension('WEBGL_lose_context')?.loseContext(); return webglSupport; } catch { webglSupport = false; return false; }
}

interface Props {
  filmProgress?:number;
  endPreset?:string;
  url: string;
  poster?: string;
  fullscreenButton?: boolean;
  scrollRotate?: boolean; // hero mode: rotate with scroll instead of free orbit
  cameraPreset?: string;
  environment?: string;
  lightIntensity?: number;
  orbitSpeed?: number;
  hotspots?: ModelHotspot[];
  paintMaterials?: string[];
  explodedParts?: ExplodedPart[];
}

export default function ModelViewer({ filmProgress, endPreset, url, poster, fullscreenButton = false, scrollRotate = false, cameraPreset = 'hero', environment = 'studio', lightIntensity = 1, orbitSpeed = 1.2, hotspots: suppliedHotspots, paintMaterials: suppliedPaintMaterials, explodedParts: suppliedParts }: Props) {
  const quality = useDeviceTier();
  const vehicle = vehicles.find(vehicle => vehicle.model3d?.glb === url); const metadata = vehicle?.model3d;
  const hotspots = (suppliedHotspots || metadata?.hotspots || []).filter(item => item.review?.modelHash === metadata?.optimizedHash && Boolean(item.review?.reviewer) && vehicle?.specs.some(spec => spec.key === item.specKey && spec.source === item.review?.source)); const paintMaterials = suppliedPaintMaterials || metadata?.paintMaterials || []; const explodedParts = suppliedParts || metadata?.explodedParts || [];
  const [active, setActive] = useState(() => { const id=new URLSearchParams(location.search).get('hotspot')||'';return hotspots.some(hotspot=>hotspot.id===id)?id:''; }); const [paint, setPaint] = useState('#8196a8'); const [exploded, setExploded] = useState(false);
  const [rotate, setRotate] = useState(true);
  const [ready, setReady] = useState(false);
  const [nearby, setNearby] = useState(false);
  const [requested, setRequested] = useState(false);
  const [visible, setVisible] = useState(!document.hidden);
  const [motionReduced, setMotionReduced] = useState(document.documentElement.dataset.motion === 'reduced');
  const box = useRef<HTMLDivElement>(null);
  const reduced = motionReduced || (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const connection = typeof navigator !== 'undefined' ? (navigator as Navigator & { connection?: { saveData?: boolean } }).connection : undefined;
  const memory = typeof navigator !== 'undefined' ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory : undefined;
  const deferForDevice = Boolean(connection?.saveData || (memory && memory <= 4));
  const webgl = typeof document === 'undefined' || supportsWebGL();

  useEffect(() => {
    const visibility = () => setVisible(!document.hidden); const appearance = () => setMotionReduced(document.documentElement.dataset.motion === 'reduced'); document.addEventListener('visibilitychange', visibility); window.addEventListener('atelon-appearance-change', appearance); return () => { document.removeEventListener('visibilitychange', visibility); window.removeEventListener('atelon-appearance-change', appearance); };
  }, []);
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
      {webgl && nearby && (!deferForDevice || requested) && <>{!ready && <LoadingStatus />}<ViewerBoundary><Canvas onCreated={({ gl }) => reportRenderer(gl)} frameloop={!visible ? 'never' : reduced || quality === 'low' ? 'demand' : 'always'} camera={{ position: cameraPreset === 'side' ? [5, .8, .2] : cameraPreset === 'detail' ? [2.2, 1.1, 2.2] : [3, 1.5, 4], fov: cameraPreset === 'detail' ? 32 : 40 }} dpr={quality === 'low' ? 1 : quality === 'balanced' ? [1, 1.25] : [1, 1.75]} gl={{ powerPreference: quality === 'high' ? 'high-performance' : 'low-power', antialias: quality === 'high' }} style={{ opacity: ready ? 1 : 0, transition: 'opacity .4s' }}>
        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.4} maxDuration={reduced ? 0 : .75}>
            <CameraRig preset={cameraPreset} url={url} reduced={reduced} progress={filmProgress} endPreset={endPreset}/>
            <Model url={url} scrollRotate={scrollRotate && !reduced && quality !== 'low'} hotspots={hotspots} active={active} select={id => { setActive(id); setRotate(false); }} paint={paint} paintMaterials={paintMaterials} exploded={exploded} parts={explodedParts} />
          </Bounds>
          {fullscreenButton ? <ShowroomEnvironment url={url} environment={environment} /> : <ContactShadows position={[0, 0, 0]} opacity={0.5} blur={2.5} scale={12} />}
          <hemisphereLight intensity={1.3 * lightIntensity} color={environment === 'pearl' ? '#fff5e4' : '#dff5ff'} groundColor={environment === 'pearl' ? '#88817a' : '#121820'} />
          <directionalLight position={[4, 7, 5]} intensity={(environment === 'night' ? 1.3 : 2.4) * lightIntensity} color="#ffffff" />
          <directionalLight position={[-4, 2, -3]} intensity={1.1 * lightIntensity} color={environment === 'night' ? '#988bff' : '#8ddcff'} />
          <Ready onReady={() => setReady(true)} />
          <Capture url={url} />
        </Suspense>
        {!scrollRotate && (
          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.08}
            autoRotate={filmProgress === undefined && rotate && !reduced && quality !== 'low'}
            autoRotateSpeed={orbitSpeed}
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
      {active && hotspots.filter(item=>item.id===active).map(item=><aside key={item.id} className="glass-dense hotspot-source"><strong>{item.label}</strong><p>{String(vehicle?.specs.find(spec=>spec.key===item.specKey)?.value)}</p><p>{item.review?.notes}</p><a href={item.review?.source} target="_blank" rel="noreferrer">Engineering source ↗</a><small>Anchor reviewed {item.review?.verifiedAt} · {item.review?.reviewer}. Reference geometry is not a factory measurement.</small></aside>)}
      {(hotspots.length > 0 || paintMaterials.length > 0 || explodedParts.length > 0) && <div className="model-tools glass-dense">{!!hotspots.length && <label>Engineering focus<select value={active} onChange={e => { setActive(e.target.value); setRotate(false); }}><option value="">Select a highlight</option>{hotspots.map(item => <option key={item.id} value={item.id}>{item.label} · {item.specKey}</option>)}</select></label>}{!!paintMaterials.length && <label>Visual paint preview<input aria-label="Visual paint preview" type="color" value={paint} onChange={e => setPaint(e.target.value)} /></label>}{!!explodedParts.length && <button className="btn ghost" aria-pressed={exploded} onClick={() => setExploded(!exploded)}>Exploded view</button>}</div>}
    </div>
  );
}
