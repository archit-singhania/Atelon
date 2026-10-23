import { Link } from 'react-router-dom';
import { vehicles } from '../lib/data';
import { readLocal } from '../lib/research';
import { readGarage } from '../lib/garage';
export default function PersonalShelf() {
  const raw = readLocal<unknown>('atelon-recent', []);
  const recent = Array.isArray(raw) ? raw.filter((slug): slug is string => typeof slug === 'string') : [];
  const saved = readGarage();
  const comparisonsRaw=readLocal<unknown>('atelon-comparisons-v3',[]);
  const comparisons=Array.isArray(comparisonsRaw)?comparisonsRaw.filter(v=>v&&typeof v.title==='string'&&typeof v.query==='string').slice(-3):[];
  const collectionsRaw=readLocal<unknown>('atelon-collections-v3',[]);
  const collections=Array.isArray(collectionsRaw)?collectionsRaw.filter(v=>v&&typeof v.name==='string'&&Array.isArray(v.slugs)).slice(-3):[];
  const selected = [...new Set([...recent, ...saved])].map(slug => vehicles.find(v => v.slug === slug)).filter(Boolean).slice(0,4);
  if (!selected.length&&!comparisons.length&&!collections.length) return null;
  return <section className="page personal-shelf"><p className="eyebrow">Your atlas</p><h2>Pick up your curiosity.</h2><p className="muted">Recently explored and saved on this device.</p><div className="grid">{selected.map(v => v && <Link key={v.slug} className="vehicle-tile glass-thin" to={`/vehicle/${v.slug}`}><img className="garage-poster" src={v.posterSmall} alt="" loading="lazy"/><h3>{v.make} {v.model}</h3><p>{saved.includes(v.slug) ? 'Saved to your Garage' : 'Continue exploring'} →</p></Link>)}</div><div className="row">{comparisons.map((c,i)=><Link className="btn ghost" key={i} to={`/compare?${new URLSearchParams(c.query).toString()}`}>{c.title} →</Link>)}{collections.map((c,i)=><Link className="btn ghost" key={`collection-${i}`} to="/research">{c.name} · {c.slugs.length} machines</Link>)}</div><Link className="btn ghost" to="/research">Open your research workspace →</Link></section>;
}
