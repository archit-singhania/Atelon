import { Link, useParams } from 'react-router-dom';
import { bySlug, vehicles } from '../lib/data';
import { Glass } from './Glass';
export default function GenerationExplorer() {
  const { slug } = useParams(); const vehicle = bySlug(slug); if (!vehicle) return null;
  const family = vehicle.generationFamily ? vehicles.filter(row => row.generationFamily === vehicle.generationFamily).sort((a,b) => a.years[0] - b.years[0]) : [vehicle];
  return <section className="page"><p className="eyebrow">Generation explorer</p><h2>Place it in time.</h2><div className="generation-timeline">{family.map(row => <Glass className="workspace-section" key={row.slug}><small>{row.years[0]}–{row.years[1] ?? 'present'}</small><h3>{row.generation || row.model}</h3><p>{row.summary}</p><Link to={`/vehicle/${row.slug}`}>Explore this record →</Link>{row.slug !== slug && <Link className="btn ghost" to={`/compare?a=${slug}&b=${row.slug}`}>What changed?</Link>}</Glass>)}</div>{vehicle.milestones?.map(item => <p key={`${item.year}-${item.title}`}><strong>{item.year}</strong> · {item.title} · <a href={item.source} target="_blank" rel="noreferrer">Source ↗</a></p>)}{family.length === 1 && <p className="muted">This catalogue currently contains one record for this generation family. Additional historical entries appear when their sources are verified.</p>}</section>;
}
