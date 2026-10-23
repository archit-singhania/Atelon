import { useEffect, useState } from 'react';

// Optional AR via Google's <model-viewer>; the library loads only when this component mounts.
export default function ArButton({ glb, name }: { glb: string; name: string }) {
  const [requested,setRequested]=useState(false);const [ready,setReady]=useState(false);const [failed,setFailed]=useState(false);
  useEffect(() => {if(!requested)return;let active=true;try{const canvas=document.createElement('canvas');const gl=canvas.getContext('webgl2')||canvas.getContext('webgl');if(!gl){setFailed(true);return;}gl.getExtension('WEBGL_lose_context')?.loseContext();}catch{setFailed(true);return;}import('@google/model-viewer').then(()=>{if(active)setReady(true);}).catch(()=>{if(active)setFailed(true);});return()=>{active=false;};}, [requested]);
  if(failed)return <p role="status">AR preview is unavailable on this device.</p>;
  if(!ready)return <button className="btn ghost" disabled={requested} onClick={()=>setRequested(true)}>{requested?'Preparing AR preview…':'Load AR preview'}</button>;
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
