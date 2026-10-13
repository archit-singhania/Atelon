import { useEffect } from 'react';

// Optional AR via Google's <model-viewer>; the library loads only when this component mounts.
export default function ArButton({ glb, name }: { glb: string; name: string }) {
  useEffect(() => { import('@google/model-viewer'); }, []);
  return (
    <model-viewer
      src={glb}
      alt={`${name} in augmented reality`}
      ar
      ar-modes="webxr scene-viewer quick-look"
      camera-controls
      style={{ width: '100%', height: 220, borderRadius: 16, background: 'var(--surface)', marginTop: 16 }}
    >
      <button slot="ar-button" className="btn ghost" style={{ position: 'absolute', right: 12, bottom: 12 }}>
        View in AR
      </button>
    </model-viewer>
  );
}
