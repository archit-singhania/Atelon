import { Link, useSearchParams } from 'react-router-dom';
import { bySlug, vehicles } from '../lib/data';
import { useSeo } from '../lib/useSeo';
import TierBadge from '../components/TierBadge';

export default function Compare() {
  useSeo('Compare vehicles | Atelon', 'Compare sourced vehicle specifications side by side.');
  const [params, setParams] = useSearchParams();
  const a = params.get('a') || '';
  const b = params.get('b') || '';
  const va = bySlug(a);
  const vb = bySlug(b);
  const set = (key: 'a' | 'b', value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
  };

  const keys = [...new Set([...(va?.specs ?? []), ...(vb?.specs ?? [])].map((spec) => spec.key))];
  const spec = (vehicle: typeof va, key: string) => vehicle?.specs.find((item) => item.key === key);
  const picker = (label: string, value: string, key: 'a' | 'b', excluded: string) => (
    <select aria-label={label} value={value} onChange={(event) => set(key, event.target.value)}>
      <option value="">Choose a vehicle</option>
      {vehicles.filter((vehicle) => vehicle.slug !== excluded).map((vehicle) => <option key={vehicle.slug} value={vehicle.slug}>{vehicle.make} {vehicle.model}</option>)}
    </select>
  );

  return (
    <div className="page">
      <h1>Compare</h1>
      <p className="lede">Put sourced factory figures side by side. Missing information stays visibly missing—Atelon never guesses.</p>
      <div className="row compare-pickers">{picker('First vehicle', a, 'a', b)}<span aria-hidden="true">versus</span>{picker('Second vehicle', b, 'b', a)}</div>
      {va && vb ? <>
        <div className="compare-heads">
          {[va, vb].map((vehicle) => <article className="card" key={vehicle.slug}>{vehicle.posterSmall && <img className="compare-poster" src={vehicle.posterSmall} alt="" />}<TierBadge tier={vehicle.tier} /><h2>{vehicle.make} {vehicle.model}</h2><p className="muted">{vehicle.generation}</p><Link to={`/vehicle/${vehicle.slug}`}>Open vehicle</Link></article>)}
        </div>
        {keys.length ? <table className="compare-table"><thead><tr><th>Specification</th><th>{va.make} {va.model}</th><th>{vb.make} {vb.model}</th></tr></thead><tbody>{keys.map((key) => {
          const left = spec(va, key), right = spec(vb, key);
          return <tr key={key}><th>{key}</th><td className={!left ? 'missing' : ''}>{left ? <>{String(left.value)}{left.unit ? ` ${left.unit}` : ''} <a className="source-link" href={left.source} target="_blank" rel="noreferrer">source</a></> : 'Not available'}</td><td className={!right ? 'missing' : ''}>{right ? <>{String(right.value)}{right.unit ? ` ${right.unit}` : ''} <a className="source-link" href={right.source} target="_blank" rel="noreferrer">source</a></> : 'Not available'}</td></tr>;
        })}</tbody></table> : <div className="empty-state"><p className="muted">Neither vehicle has verified specifications.</p></div>}
      </> : <div className="empty-state glass-panel"><h2>Choose two vehicles</h2><p className="muted">Your selection is saved in the URL, so this comparison can be bookmarked or shared.</p></div>}
    </div>
  );
}
