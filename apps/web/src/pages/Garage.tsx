import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { vehicles } from '../lib/data';
import TierBadge from '../components/TierBadge';

export default function Garage() {
  const [q, setQ] = useState('');
  const [type, setType] = useState<'all' | 'car' | 'motorcycle'>('all');
  const [tier, setTier] = useState<'all' | 'full' | 'reference' | 'specs-only'>('all');

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
        <input placeholder="Search make or model" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={type} onChange={(e) => setType(e.target.value as typeof type)}>
          <option value="all">Cars and motorcycles</option>
          <option value="car">Cars</option>
          <option value="motorcycle">Motorcycles</option>
        </select>
        <select value={tier} onChange={(e) => setTier(e.target.value as typeof tier)}>
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
