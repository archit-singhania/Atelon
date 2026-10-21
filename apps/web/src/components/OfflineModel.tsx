import { lazy, Suspense, useEffect, useState } from 'react';
import { bySlug } from '../lib/data';
const ModelViewer = lazy(() => import('./ModelViewer'));
export default function OfflineModel({ slug }: { slug: string }) {
  const [url, setUrl] = useState(''); const [open, setOpen] = useState(false);
  useEffect(() => { let active = true; let objectUrl = ''; const vehicle = bySlug(slug); if (vehicle?.model3d) caches.open(`atelon-pack-${slug}`).then(cache => cache.match(vehicle.model3d!.glb)).then(response => response?.blob()).then(blob => { if (!blob || !active) return; objectUrl = URL.createObjectURL(blob); setUrl(objectUrl); }).catch(() => undefined); return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); }; }, [slug]);
  return url ? <><button className="btn ghost" onClick={() => setOpen(!open)}>{open ? 'Close offline showroom' : 'Open downloaded 3D'}</button>{open && <div className="viewer" style={{ height: 420 }}><Suspense fallback={<p>Preparing downloaded model…</p>}><ModelViewer url={url} fullscreenButton /></Suspense></div>}</> : null;
}
