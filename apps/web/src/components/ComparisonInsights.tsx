import { useSearchParams } from 'react-router-dom';
import { bySlug, vehicles } from '../lib/data';
import { convertSpec } from '../lib/units';
import { Glass } from './Glass';
export default function ComparisonInsights() {
  const [params] = useSearchParams(); const selected = [...new Set(['a','b','c','d'].map(key => params.get(key)).filter(Boolean))].map(slug => bySlug(slug!)).filter(Boolean) as typeof vehicles;
  if (selected.length < 2) return null;
  const entries = selected.map(vehicle => { const power = vehicle.specs.find(spec => /power/i.test(spec.key)); const weight = vehicle.specs.find(spec => /weight|mass/i.test(spec.key)); const p = power ? convertSpec(power.value,power.unit,'metric') : null; const w = weight ? convertSpec(weight.value,weight.unit,'metric') : null; const value = p?.unit === 'kW' && w?.unit === 'kg' && typeof p.value === 'number' && typeof w.value === 'number' && w.value > 0 ? p.value / w.value * 1000 : null; return { vehicle, power, weight, value }; });
  const max = Math.max(...entries.map(row => row.value || 0));
  return <section className="page"><p className="eyebrow">Derived engineering</p><h2>Power meets mass.</h2><p>Calculated only when sourced power and weight are both available in convertible units. Weight definitions can differ by vehicle.</p><div className="grid">{entries.map(({ vehicle, power, weight, value }) => <Glass className="workspace-section" key={vehicle.slug}><h3>{vehicle.make} {vehicle.model}</h3><strong>{value === null ? 'Insufficient sourced data' : `${value.toFixed(1)} kW / tonne`}</strong>{value !== null && <><div className="bar" style={{ width: `${value / max * 100}%` }} /><p><a href={power!.source} target="_blank" rel="noreferrer">Power source ↗</a> · <a href={weight!.source} target="_blank" rel="noreferrer">Weight source ↗</a></p></>}</Glass>)}</div></section>;
}
