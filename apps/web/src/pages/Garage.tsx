import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { vehicles } from '../lib/data';
import TierBadge from '../components/TierBadge';

export default function Garage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const type = (params.get('type') || 'all') as 'all' | 'car' | 'motorcycle';
  const tier = (params.get('tier') || 'all') as 'all' | 'full' | 'reference' | 'specs-only';
  const make = params.get('make') || 'all';
  const makes = [...new Set(vehicles.map((vehicle) => vehicle.make))].sort();
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
        (make === 'all' || v.make === make) &&
        (!needle || `${v.make} ${v.model} ${v.generation ?? ''}`.toLowerCase().includes(needle))
    );
  }, [q, type, tier, make]);

  return (
    <div className="page">
      <h1>Garage</h1>
      <p className="lede">Explore nine sourced vehicles with poster-first 3D and transparent model-confidence labels.</p>
      <div className="row filter-bar" role="search">
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
        <select aria-label="Vehicle make" value={make} onChange={(e) => update('make', e.target.value)}>
          <option value="all">All makes</option>
          {makes.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        {(q || type !== 'all' || tier !== 'all' || make !== 'all') && <button className="btn ghost" type="button" onClick={() => setParams({}, { replace: true })}>Reset filters</button>}
      </div>
      <p className="result-count" aria-live="polite">{list.length} {list.length === 1 ? 'vehicle' : 'vehicles'}</p>
      {list.length === 0 ? (
        <div className="empty-state glass-panel"><h2>No matching vehicles</h2><p className="muted">Try a broader search or reset the filters.</p><button className="btn primary" type="button" onClick={() => setParams({}, { replace: true })}>Show every vehicle</button></div>
      ) : (
        <div className="grid">
          {list.map((v) => (
            <Link key={v.slug} to={`/vehicle/${v.slug}`} className="card">
              {v.posterSmall && <img className="garage-poster" src={v.posterSmall} alt="" loading="lazy" />}
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
