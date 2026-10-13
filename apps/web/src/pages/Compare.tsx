import { useState } from 'react';
import { bySlug, vehicles } from '../lib/data';

export default function Compare() {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const va = bySlug(a);
  const vb = bySlug(b);

  const keys = [...new Set([...(va?.specs ?? []), ...(vb?.specs ?? [])].map((s) => s.key))];
  const val = (v: typeof va, k: string) => {
    const s = v?.specs.find((x) => x.key === k);
    return s ? `${s.value}${s.unit ? ' ' + s.unit : ''}` : 'no data';
  };

  const picker = (value: string, set: (s: string) => void) => (
    <select value={value} onChange={(e) => set(e.target.value)}>
      <option value="">Choose a vehicle</option>
      {vehicles.map((v) => <option key={v.slug} value={v.slug}>{v.make} {v.model}</option>)}
    </select>
  );

  return (
    <div className="page">
      <h1>Compare</h1>
      <div className="row">{picker(a, setA)}{picker(b, setB)}</div>
      {va && vb ? (
        keys.length ? (
          <table>
            <thead><tr><th></th><th>{va.make} {va.model}</th><th>{vb.make} {vb.model}</th></tr></thead>
            <tbody>{keys.map((k) => <tr key={k}><th>{k}</th><td>{val(va, k)}</td><td>{val(vb, k)}</td></tr>)}</tbody>
          </table>
        ) : <p className="muted">Neither vehicle has verified specs yet.</p>
      ) : <p className="muted">Pick two vehicles to compare.</p>}
    </div>
  );
}
