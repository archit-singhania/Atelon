import {useEffect,useState} from 'react';
import type {Session} from '@supabase/supabase-js';
import {API_URL} from '../lib/data';
import GarageSync from './GarageSync';
import {Glass} from './Glass';
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
export default function CollectionWorkspace({session}:{session:Session}){
 const key=`atelon-collection-queues:${session.user.id}`;
 const [ids,setIds]=useState<string[]>(()=>{try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value.filter(v=>typeof v==='string'&&uuid.test(v)).slice(0,200):[];}catch{return[];}});
 const [rows,setRows]=useState<{id:string;name:string}[]>([]);const [selected,setSelected]=useState('');const [notice,setNotice]=useState('');
 useEffect(()=>{const c=new AbortController();fetch(`${API_URL}/api/v2/collections`,{headers:{Authorization:`Bearer ${session.access_token}`},signal:c.signal}).then(async r=>{if(!r.ok)throw Error('Cloud collections unavailable. Saved device queues remain accessible.');return r.json();}).then(data=>setRows(data.results.filter((r:{system_key?:string})=>!r.system_key))).catch(e=>{if(!c.signal.aborted)setNotice(e.message);});return()=>c.abort();},[session.access_token]);
 function create(){try{if(ids.length>=200)throw Error('This device already has 200 collection queues.');const id=crypto.randomUUID();const next=[...ids,id];localStorage.setItem(key,JSON.stringify(next));setIds(next);setSelected(id);}catch(e){setNotice((e as Error).message);}}
 const all=[...new Set([...ids,...rows.map(r=>r.id)])];
 return <Glass depth="dense"><h2>Named collection sync</h2><p>Open a collection to resume its queue. Each collection keeps its own revisions and conflict decisions. Local research collections are not imported automatically.</p><button className="btn ghost" onClick={create}>Prepare a new cloud collection</button><label>Open collection<select value={selected} onChange={e=>setSelected(e.target.value)}><option value="">Choose a collection</option>{all.map(id=><option key={id} value={id}>{rows.find(r=>r.id===id)?.name||`Device queue ${id.slice(0,8)}`}</option>)}</select></label><p role="status">{notice}</p>{selected&&<GarageSync key={`${session.user.id}:${selected}`} session={session} collectionId={selected}/>}</Glass>;
}
