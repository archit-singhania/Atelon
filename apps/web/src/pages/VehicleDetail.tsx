import { lazy, Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';
import { bySlug } from '../lib/data';
import { useSeo } from '../lib/useSeo';
import TierBadge from '../components/TierBadge';

const ModelViewer = lazy(() => import('../components/ModelViewer'));
const ArButton = lazy(() => import('../components/ArButton'));

export default function VehicleDetail() {
  const { slug } = useParams();
  const v = bySlug(slug);
  useSeo(
    v ? `${v.make} ${v.model} - specs and 3D | Atelon` : 'Vehicle not found | Atelon',
    v ? `${v.make} ${v.model}: sourced specifications${v.tier !== 'specs-only' ? ' and an interactive 3D model' : ''} on Atelon.` : 'Vehicle not found.'
  );

  if (!v) return <div className="page"><h1>Vehicle not found</h1><Link to="/garage">Back to the Garage</Link></div>;
  const has3d = v.model3d && v.tier !== 'specs-only';

  return (
    <div className="page">
      <TierBadge tier={v.tier} />
      <h1 style={{ marginTop: 10 }}>{v.make} {v.model}</h1>
      <p className="muted">{v.type} · {v.years[0]}-{v.years[1] ?? 'present'}</p>

      <div className="viewer big">
        {has3d ? (
          <Suspense fallback={<div className="placeholder">Loading 3D...</div>}>
            <ModelViewer url={v.model3d!.glb} poster={v.poster} fullscreenButton />
          </Suspense>
        ) : (
          <div className="placeholder">
            {v.poster ? <img src={v.poster} alt="" style={{ maxHeight: '100%' }} /> : 'No licensed 3D model for this vehicle yet. Specifications only.'}
          </div>
        )}
      </div>
      {v.tier === 'reference' && <p className="muted">Reference 3D: a representative model, not the exact vehicle.</p>}
      {v.model3d && <p className="muted" style={{ fontSize: 12 }}>{v.model3d.credit}</p>}
      {has3d && (
        <Suspense fallback={null}>
          <ArButton glb={v.model3d!.glb} name={`${v.make} ${v.model}`} />
        </Suspense>
      )}

      <p>{v.summary}</p>

      <h2>Specifications</h2>
      {v.specs.length === 0 ? (
        <p className="muted">No verified specifications yet.</p>
      ) : (
        <table>
          <tbody>
            {v.specs.map((s) => (
              <tr key={s.key}>
                <th>{s.key}</th>
                <td>{String(s.value)}{s.unit ? ` ${s.unit}` : ''}</td>
                <td><a href={s.source} target="_blank" rel="noreferrer">source</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
