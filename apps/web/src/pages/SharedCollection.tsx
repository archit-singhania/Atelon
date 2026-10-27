import {useEffect,useState} from 'react';
import {Link,useLocation} from 'react-router-dom';
import {API_URL,bySlug} from '../lib/data';
import {Glass} from '../components/Glass';
type Snapshot={name:string;notes?:string;vehicle_slugs:string[];shared_at:string};
export default function SharedCollection(){
 const {hash}=useLocation();const [data,setData]=useState<Snapshot|null>(null);const [notice,setNotice]=useState('Loading shared collection…');
 useEffect(()=>{const controller=new AbortController();setData(null);const token=hash.slice(1);if(!/^[a-f0-9]{64}$/.test(token)){setNotice('This link is invalid.');return;}
 fetch(`${API_URL}/api/v2/shared/collections/${token}`,{cache:'no-store',referrerPolicy:'no-referrer',signal:controller.signal}).then(async r=>{if(!r.ok)throw Error('This link is unavailable or revoked.');return r.json();}).then(result=>{setData(result.collection);setNotice('Read-only snapshot. Later edits are not included.');}).catch(e=>{if(!controller.signal.aborted)setNotice(e.message);});return()=>controller.abort();},[hash]);
 return <div className="page"><p className="eyebrow">Shared research</p><h1>{data?.name||'Shared collection'}</h1><p role="status">{notice}</p>{data&&<Glass><p>Shared {new Date(data.shared_at).toLocaleDateString()}</p>{data.notes&&<p style={{whiteSpace:'pre-wrap'}}>{data.notes}</p>}<ul>{data.vehicle_slugs.map(slug=><li key={slug}><Link to={`/vehicle/${slug}`}>{bySlug(slug)?.model||slug}</Link></li>)}</ul></Glass>}<Link className="btn ghost" to="/garage">Browse Garage</Link></div>;
}
