import { useEffect,useState } from 'react';
import { API_URL,vehicles,bySlug } from '../../lib/data';
import { supabase } from '../../lib/supabase';
import { downloadText,readLocal,saveLocal } from '../../lib/research';
import { record,safeHttpUrl } from '../../lib/atlasState';
import { vehicleName } from './shared';
type Row={id:string;vehicle_slug:string;kind:string;proposal:Record<string,unknown>;source_url:string;status:string;review_note?:string};
const templates:Record<string,object>={specification:{key:'Engine',value:'Proposed sourced value'},relationship:{targetSlug:vehicles[1].slug,kind:'generation',label:'Describe the documented relationship'},annotation:{note:'Explain the correction and cite the submitted evidence.'},model:{note:'Describe model identity, provenance and required accuracy review.'}};
export default function Contribute(){
 const original=readLocal<unknown>('atelon-contribution-draft-v4','');const saved=readLocal<unknown>('atelon-contribution-v5',{});
 const initial=record(saved)?saved:{};
 const [slug,setSlug]=useState(typeof initial.slug==='string'&&bySlug(initial.slug)?initial.slug:vehicles[0].slug);
 const [kind,setKind]=useState(typeof initial.kind==='string'&&initial.kind in templates?initial.kind:'specification');
 const [proposal,setProposal]=useState(typeof initial.proposal==='string'?initial.proposal:typeof original==='string'&&original?original:JSON.stringify(templates.specification,null,2));
 const [source,setSource]=useState(typeof initial.source==='string'?initial.source:'');
 const [rows,setRows]=useState<Row[]>([]);const [canReview,setCanReview]=useState(false);const [reviewMode,setReviewMode]=useState(false);const [notes,setNotes]=useState<Record<string,string>>({});const [notice,setNotice]=useState('');const [busy,setBusy]=useState(false);
 useEffect(()=>{saveLocal('atelon-contribution-v5',{slug,kind,proposal,source});},[slug,kind,proposal,source]);
 function draft(){const value=JSON.parse(proposal);if(!record(value))throw new Error('The proposal must be a JSON object.');if(!safeHttpUrl(source))throw new Error('Add an HTTP or HTTPS source URL without credentials.');return {vehicle_slug:slug,kind,source_url:source,proposal:value};}
 async function request(path='',method='GET',body?:unknown){
  const session=(await supabase?.auth.getSession())?.data.session;if(!session)throw new Error('Sign in from My Garage. Local draft export works without an account.');
  const response=await fetch(`${API_URL}/api/v4/contributions${path}`,{method,signal:AbortSignal.timeout(15000),headers:{Authorization:`Bearer ${session.access_token}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
  const result=await response.json();if(!response.ok)throw new Error(result.error?.message||'Contribution service unavailable.');return result;
 }
 async function load(review=false){
  setBusy(true);try{const result=await request(review?'?review=1':'');setRows(Array.isArray(result.results)?result.results.filter((row:Row)=>row&&record(row.proposal)):[]);setCanReview(Boolean(result.canReview));setReviewMode(review);setNotice(review?'Expert queue loaded. Final decisions cannot be silently reopened.':'Your submissions are loaded.');}catch(error){setNotice((error as Error).message);}finally{setBusy(false);}
 }
 async function review(row:Row,status:string){
  setBusy(true);try{const result=await request(`/${row.id}/review`,'PATCH',{expectedStatus:row.status,status,note:notes[row.id].trim()});setRows(previous=>previous.map(item=>item.id===row.id?result:item));setNotice('Audited decision saved. Accepted content still requires catalogue QA.');}catch(error){setNotice((error as Error).message);}finally{setBusy(false);}
 }
 return <section className="atlas-panel">
  <p>Submit a source-backed correction, relationship, annotation or model reference. Acceptance records a review decision; it does not bypass publication gates. Your complete draft is kept on this device.</p>
  <form onSubmit={async event=>{event.preventDefault();setBusy(true);try{await request('','POST',draft());await load();setNotice('Proposal submitted for independent review.');}catch(error){setNotice((error as Error).message);}finally{setBusy(false);}}}>
   <label>Vehicle<select value={slug} onChange={event=>setSlug(event.target.value)}>{vehicles.map(vehicle=><option value={vehicle.slug} key={vehicle.slug}>{vehicleName(vehicle)}</option>)}</select></label>
   <label>Contribution type<select value={kind} onChange={event=>setKind(event.target.value)}>{Object.keys(templates).map(value=><option key={value}>{value}</option>)}</select></label>
   <button className="btn ghost" type="button" onClick={()=>{setProposal(JSON.stringify(templates[kind],null,2));setNotice('Example structure loaded. Replace its text with your sourced proposal.');}}>Use {kind} structure</button>
   <label>Authoritative source URL<input type="url" required value={source} maxLength={1000} onChange={event=>setSource(event.target.value)} placeholder="https://manufacturer.example/brochure"/></label>
   <label>Structured proposal<textarea value={proposal} maxLength={6000} onChange={event=>setProposal(event.target.value)} spellCheck={false}/></label>
   <p className="atlas-status">Specifications: key/value/unit. Relationships: targetSlug/kind/label. Annotations and models: note. Review requires evidence; reviewers cannot approve their own submissions.</p>
   <button className="btn primary" disabled={busy||!supabase}>Submit for review</button>
   <button className="btn ghost" type="button" onClick={()=>{try{downloadText('atelon-contribution.json',JSON.stringify(draft(),null,2),'application/json');setNotice('Local proposal exported.');}catch(error){setNotice((error as Error).message);}}}>Export local draft</button>
  </form>
  <div className="atlas-toolbar"><button className="btn ghost" disabled={busy||!supabase} onClick={()=>load()}>Load my submissions</button>{canReview&&<button className="btn primary" disabled={busy} onClick={()=>load(!reviewMode)}>{reviewMode?'Return to my submissions':'Open expert review queue'}</button>}</div>
  {!supabase&&<p className="atlas-status">Cloud submission and review are not configured. Prepare and export a source-backed draft locally.</p>}
  <p role="status">{notice}</p>
  {rows.map(row=>{const vehicle=bySlug(row.vehicle_slug);const old=vehicle?.specs.find(spec=>spec.key===row.proposal.key);const transitions=row.status==='submitted'?['reviewing','accepted','rejected']:row.status==='reviewing'?['accepted','rejected']:[];
   return <article className="atlas-record" key={row.id}><h3>{vehicle?vehicleName(vehicle):row.vehicle_slug} · {row.kind}</h3><p>Status: {row.status}</p><p>Current recorded value: {old?String(old.value):'No corresponding recorded field'}</p><pre className="atlas-json">Proposed: {JSON.stringify(row.proposal,null,2)}</pre>{safeHttpUrl(row.source_url)&&<a href={row.source_url} target="_blank" rel="noreferrer">Submitted evidence ↗</a>}{row.review_note&&<p>Review: {row.review_note}</p>}
    {reviewMode&&canReview&&transitions.length>0&&<><label>Review reason<textarea value={notes[row.id]||''} maxLength={2000} onChange={event=>setNotes({...notes,[row.id]:event.target.value})}/></label>{transitions.map(status=><button className="btn ghost" disabled={busy||(notes[row.id]||'').trim().length<3} key={status} onClick={()=>review(row,status)}>{status}</button>)}</>}
   </article>;
  })}
 </section>;
}
