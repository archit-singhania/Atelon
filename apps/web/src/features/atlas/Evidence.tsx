import { useState } from 'react';
import { vehicles,bySlug } from '../../lib/data';
import { readLocal,saveLocal,downloadText } from '../../lib/research';
import { boundedArray,record,safeHttpUrl } from '../../lib/atlasState';
import { vehicleName } from './shared';
import type { Spec } from '../../types';
type Snapshot={id:string;slug:string;createdAt:string;hash:string;specs:Spec[];generation?:string};
const validSnapshot=(item:unknown):item is Snapshot=>record(item)&&typeof item.id==='string'&&typeof item.slug==='string'&&Boolean(bySlug(item.slug))&&typeof item.createdAt==='string'&&Number.isFinite(Date.parse(item.createdAt))&&typeof item.hash==='string'&&/^[a-f0-9]{64}$/.test(item.hash)&&Array.isArray(item.specs)&&item.specs.every(spec=>record(spec)&&typeof spec.key==='string'&&['string','number','boolean'].includes(typeof spec.value)&&Boolean(safeHttpUrl(spec.source)));
export default function Evidence(){
  const [slug,setSlug]=useState(vehicles[0].slug);const [baseline,setBaseline]=useState('');
  const [snapshots,setSnapshots]=useState(()=>boundedArray(readLocal<unknown>('atelon-evidence-v4',[]),validSnapshot));
  const [watches,setWatches]=useState(()=>boundedArray(readLocal<unknown>('atelon-evidence-watches-v4',[]),(item):item is string=>typeof item==='string'&&Boolean(bySlug(item))));
  const [notice,setNotice]=useState('');const [busy,setBusy]=useState(false);const vehicle=bySlug(slug)!;
  const history=snapshots.filter(row=>row.slug===slug);const previous=history.find(row=>row.id===baseline)||history[0];
  const changed=previous?vehicle.specs.filter(spec=>{const old=previous.specs.find(item=>item.key===spec.key);return !old||JSON.stringify(old)!==JSON.stringify(spec);}):[];
  const removed=previous?.specs.filter(spec=>!vehicle.specs.some(item=>item.key===spec.key))||[];
  async function capture(){
    setBusy(true);try{
      const bytes=new TextEncoder().encode(JSON.stringify(vehicle.specs));const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),byte=>byte.toString(16).padStart(2,'0')).join('');
      const snapshot={id:crypto.randomUUID(),slug,createdAt:new Date().toISOString(),hash,specs:vehicle.specs,generation:vehicle.generation};const next=[snapshot,...snapshots].slice(0,100);
      const saved=saveLocal('atelon-evidence-v4',next);setSnapshots(next);setBaseline(snapshot.id);setNotice(saved?'Dated catalogue snapshot saved. Source pages were not downloaded.':'Snapshot is available for this session only. Export it before leaving.');
    }catch{setNotice('A secure browser context is required for snapshot hashing. Your previous evidence is unchanged.');}finally{setBusy(false);}
  }
  return <section className="atlas-panel">
    <label>Inspect record<select value={slug} onChange={event=>{setSlug(event.target.value);setBaseline('');}}>{vehicles.map(item=><option key={item.slug} value={item.slug}>{vehicleName(item)}</option>)}</select></label>
    <p>{vehicle.generation} · {vehicle.years[0]}–{vehicle.years[1]??'present'} · {vehicle.tier}</p>
    <div className="atlas-toolbar"><button className="btn primary" disabled={busy} onClick={capture}>Save evidence snapshot</button><button className="btn ghost" onClick={()=>{const next=watches.includes(slug)?watches.filter(item=>item!==slug):[...watches,slug];saveLocal('atelon-evidence-watches-v4',next);setWatches(next);}}>{watches.includes(slug)?'Watching this record ✓':'Watch for catalogue changes'}</button></div>
    <p role="status">{notice}</p>
    {previous&&<div className="atlas-record">
      <label>Compare with saved baseline<select value={previous.id} onChange={event=>setBaseline(event.target.value)}>{history.map(snapshot=><option key={snapshot.id} value={snapshot.id}>{new Date(snapshot.createdAt).toLocaleString()}</option>)}</select></label>
      <strong>{changed.length+removed.length} changes since {new Date(previous.createdAt).toLocaleString()}</strong><p className="atlas-status">Snapshot SHA-256: {previous.hash}</p>
      {changed.map(spec=><p key={spec.key}>{spec.key}: {String(previous.specs.find(row=>row.key===spec.key)?.value??'missing')} → {String(spec.value)}</p>)}
      {removed.map(spec=><p key={spec.key}>Removed: {spec.key}</p>)}
      <button className="btn ghost" onClick={()=>downloadText('atelon-evidence.json',JSON.stringify(previous,null,2),'application/json')}>Export selected evidence</button>
      <button className="btn ghost" onClick={()=>{const next=snapshots.filter(row=>row.id!==previous.id);saveLocal('atelon-evidence-v4',next);setSnapshots(next);setBaseline('');setNotice('Selected local snapshot removed.');}}>Remove selected snapshot</button>
    </div>}
    <h2>Source ledger</h2>{vehicle.specs.map(spec=><article className="atlas-record" key={spec.key}><h3>{spec.key}</h3><p>{String(spec.value)} {spec.unit}</p><a className="atlas-source" href={spec.source} target="_blank" rel="noreferrer">{spec.source}</a><small>Applies to this catalogue record. Source publication and retrieval dates are not inferred.</small></article>)}
    <h3>Watched records</h3>{watches.map(watched=>{const current=bySlug(watched)!;const old=snapshots.find(row=>row.slug===watched);const updated=old&&JSON.stringify(current.specs)!==JSON.stringify(old.specs);return <button className="btn ghost" key={watched} onClick={()=>{setSlug(watched);setBaseline('');}}>{vehicleName(current)} · {updated?'Updated since snapshot':old?'No recorded change':'Save a baseline snapshot'}</button>;})}
    <p className="muted">Change checks run when you open this workspace against the loaded catalogue. This does not silently monitor external websites. Local snapshots can be edited outside the application and are not signed attestations.</p>
  </section>;
}
