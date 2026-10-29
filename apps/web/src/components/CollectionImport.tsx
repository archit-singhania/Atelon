import {useState} from 'react';
import {vehicles} from '../lib/data';
import {prepareCollectionImport,importedCollectionId,type ImportCandidate} from '../lib/collectionImport';
import {loadGarageQueue,saveGarageQueue} from '../lib/garageQueue';
import {downloadText} from '../lib/research';
const sourceKey='atelon-collections-v3';
export default function CollectionImport({owner,onImported}:{owner:string;onImported:(id:string)=>void}){
 const [raw,setRaw]=useState('');const [items,setItems]=useState<unknown[]>([]);const [candidate,setCandidate]=useState<ImportCandidate|null>(null);const [notice,setNotice]=useState('');const [busy,setBusy]=useState(false);
 function review(){try{const text=localStorage.getItem(sourceKey)||'[]';const value=JSON.parse(text);if(!Array.isArray(value))throw Error('Local collection storage is malformed. Export it before repairing.');setRaw(text);setItems(value);setCandidate(null);setNotice(value.length?'Choose a collection to preview.':'No local Research collections found.');}catch(e){setNotice((e as Error).message);}}
 async function confirm(){if(!candidate||busy)return;setBusy(true);try{
  if(localStorage.getItem(sourceKey)!==raw)throw Error('Local collections changed. Review them again before importing.');
  const id=await importedCollectionId(owner,candidate.sourceId);const queueOwner=`${owner}:collection:${id}`;const q=await loadGarageQueue(queueOwner);
  const directoryKey=`atelon-collection-queues:${owner}`;const directory=JSON.parse(localStorage.getItem(directoryKey)||'[]');
  if(!Array.isArray(directory)||directory.some(id=>typeof id!=='string'))throw Error('Collection queue directory needs repair; no import was queued.');
  const ids=[...new Set([...directory,id])];if(ids.length>200)throw Error('This device has reached its collection queue limit.');
  localStorage.setItem(`atelon-research-import-backup:${owner}`,raw);
  localStorage.setItem(directoryKey,JSON.stringify(ids));
  if(q.base||q.pending){setNotice('An earlier import already exists. Opening it without overwriting its notes.');onImported(id);return;}
  await saveGarageQueue({...q,pending:{operationId:crypto.randomUUID(),expectedRevision:0,document:candidate.document}});
  setNotice('Confirmed import queued. Original Research collections and a local backup remain intact.');setCandidate(null);onImported(id);
 }catch(e){setNotice((e as Error).message);}finally{setBusy(false);}}
 return <section aria-label="Import Research collections"><h3>Import local Research collections</h3><p>Review one collection before syncing. Per-vehicle notes are preserved as labelled JSON in the cloud Notes field. Oversized notes are rejected, never shortened.</p><button className="btn ghost" disabled={busy} onClick={review}>Review local collections</button><button className="btn ghost" onClick={()=>downloadText('atelon-local-collections.json',localStorage.getItem(sourceKey)||'[]','application/json')}>Export local collections backup</button>{items.map((item,i)=><button className="btn ghost" key={i} disabled={busy} onClick={()=>{try{setCandidate(prepareCollectionImport(item,new Set(vehicles.map(v=>v.slug))));setNotice('Review the complete notes below before confirming.');}catch(e){setCandidate(null);setNotice((e as Error).message);}}}>Review collection {i+1}</button>)}{candidate&&<section aria-label="Review collection import"><h4>{candidate.document.name}</h4><p>{candidate.document.vehicle_slugs.length} vehicles</p><pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{candidate.document.notes}</pre><button className="btn primary" disabled={busy} onClick={confirm}>Confirm import and queue sync</button><button className="btn ghost" disabled={busy} onClick={()=>setCandidate(null)}>Cancel import</button></section>}<p role="status">{notice}</p></section>;
}
