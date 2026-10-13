import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { vehicles } from '../lib/data';
import TierBadge from '../components/TierBadge';

export default function Garage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const type = (params.get('type') || 'all') as 'all' | 'car' | 'motorcycle';
  const tier = (params.get('tier') || 'all') as 'all' | 'full' | 'reference' | 'specs-only';
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === 'all') next.delete(key); else next.set(key, value);
    setParams(next, { replace: true });
  };

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return vehicles.filter(
      (v) =>
        (type === 'all' || v.type === type) &&
        (tier === 'all' || v.tier === tier) &&
        (!needle || `${v.make} ${v.model} ${v.generation ?? ''}`.toLowerCase().includes(needle))
    );
  }, [q, type, tier]);

  return (
    <div className="page">
      <h1>Garage</h1>
      <div className="row">
        <input aria-label="Search vehicles" placeholder="Search make or model" value={q} onChange={(e) => update('q', e.target.value)} />
        <select aria-label="Vehicle type" value={type} onChange={(e) => update('type', e.target.value)}>
          <option value="all">Cars and motorcycles</option>
          <option value="car">Cars</option>
          <option value="motorcycle">Motorcycles</option>
        </select>
        <select aria-label="3D tier" value={tier} onChange={(e) => update('tier', e.target.value)}>
          <option value="all">Any 3D tier</option>
          <option value="full">Full 3D</option>
          <option value="reference">Reference 3D</option>
          <option value="specs-only">Specs only</option>
        </select>
      </div>
      {list.length === 0 ? (
        <p className="muted">No vehicles to show yet.</p>
      ) : (
        <div className="grid">
          {list.map((v) => (
            <Link key={v.slug} to={`/vehicle/${v.slug}`} className="card">
              <TierBadge tier={v.tier} />
              <h3 style={{ marginTop: 10 }}>{v.make} {v.model}</h3>
              <small>{v.type} · {v.years[0]}-{v.years[1] ?? 'present'}</small>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
