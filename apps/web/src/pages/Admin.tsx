import OperationsDashboard from '../components/OperationsDashboard';
import { useState } from 'react';
import { vehicles } from '../lib/data';
import { Glass, Segmented } from '../components/Glass';
import { useSeo } from '../lib/useSeo';
import AdminEditor from '../components/AdminEditor';

export default function Admin() {
  useSeo('Catalogue studio | Atelon', 'Internal catalogue quality and asset pipeline overview.');
  const [queue, setQueue] = useState('published');
  if (queue === 'editor') return <div className="page admin-page"><p className="eyebrow">Catalogue studio</p><h1>Content operations</h1><button className="btn ghost" onClick={() => setQueue('published')}>Back to overview</button><AdminEditor /></div>;
  return <div className="page admin-page"><p className="eyebrow">Catalogue studio</p><h1>Content operations</h1><p className="lede">A credential-ready operator surface. Publishing remains locked to validation gates.</p><button className="btn primary" onClick={() => setQueue('editor')}>Open catalogue editor</button><Segmented label="Pipeline queue" value={queue} onChange={setQueue} options={[{ value: 'published', label: 'Published' }, { value: 'qa', label: 'QA' }, { value: 'processing', label: 'Processing' }]} /><OperationsDashboard/><div className="metric-grid"><Glass depth="thin"><strong>{vehicles.length}</strong><span>Live vehicles</span></Glass><Glass depth="thin"><strong>{vehicles.filter((v) => v.model3d).length}</strong><span>Optimized models</span></Glass><Glass depth="thin"><strong>{vehicles.reduce((sum, v) => sum + v.specs.length, 0)}</strong><span>Sourced facts</span></Glass></div>{queue === 'published' ? <div className="admin-list">{vehicles.map((vehicle) => <Glass key={vehicle.slug} depth="regular" className="admin-row"><img src={vehicle.posterSmall} alt="" /><div><strong>{vehicle.make} {vehicle.model}</strong><span>{vehicle.status} · {vehicle.tier}</span></div><div className="admin-health"><span>GLB {vehicle.model3d ? `${(vehicle.model3d.fileSizeBytes! / 1048576).toFixed(1)} MiB` : '—'}</span><span>{vehicle.specs.length} specs</span></div></Glass>)}</div> : <Glass className="empty-state"><h2>No local items in this queue</h2><p className="muted">Cloud moderation and processing queues appear when Supabase is configured.</p></Glass>}</div>;
}
