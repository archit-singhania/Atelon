import { lazy,Suspense,useEffect,useState } from 'react';
import { Link,useParams,useSearchParams } from 'react-router-dom';
import { atlasFeatures } from './shared';
import { useSeo } from '../../lib/useSeo';
import { vehicles } from '../../lib/data';
import NotFound from '../../pages/NotFound';
import ToolBoundary from './ToolBoundary';
import './atlas.css';

const modules={
  commands:lazy(()=>import('./Concierge')),lab:lazy(()=>import('./EngineeringLab')),
  bay:lazy(()=>import('./ScaleBay')),graph:lazy(()=>import('./KnowledgeGraph')),
  evidence:lazy(()=>import('./Evidence')),rooms:lazy(()=>import('./ResearchRooms')),
  interiors:lazy(()=>import('./Interiors')),fit:lazy(()=>import('./GarageFit')),
  identify:lazy(()=>import('./Identify')),discovery:lazy(()=>import('./DiscoveryMap')),
  director:lazy(()=>import('./StoryDirector')),evolution:lazy(()=>import('./Evolution')),
  sound:lazy(()=>import('./SoundArchive')),dossiers:lazy(()=>import('./Dossiers')),
  contribute:lazy(()=>import('./Contribute'))
};
const categories:Record<string,string>={commands:'Showroom',lab:'Research',bay:'Showroom',graph:'Research',evidence:'Research',rooms:'Collaborate',interiors:'Showroom',fit:'Showroom',identify:'Research',discovery:'Research',director:'Create',evolution:'Research',sound:'Showroom',dossiers:'Create',contribute:'Collaborate'};
function readiness(id:string){
  if(id==='interiors')return vehicles.some(vehicle=>vehicle.model3d?.interior)?'Reviewed content available':'Needs reviewed cabin assets';
  if(id==='sound')return vehicles.some(vehicle=>vehicle.recordings?.length)?'Recordings available':'Needs authentic recordings';
  if(id==='identify')return 'Requires vision service';
  if(id==='contribute')return 'Local drafts · cloud review optional';
  if(id==='rooms')return 'Local rooms · cloud optional';
  if(id==='bay'||id==='fit')return 'Sourced envelopes · calibration pending';
  return 'Available locally';
}
export default function Atlas(){
  const {feature}=useParams();const [params,setParams]=useSearchParams();const [storageWarning,setStorageWarning]=useState(false);
  const definition=atlasFeatures.find(item=>item[0]===feature);
  const Page=feature&&feature in modules?modules[feature as keyof typeof modules]:undefined;
  const query=params.get('q')||'';const category=params.get('category')||'All';
  const tools=atlasFeatures.filter(([id,title,description])=>(category==='All'||categories[id]===category)&&(`${title} ${description}`).toLowerCase().includes(query.toLowerCase().trim()));
  useSeo(`${feature&&!definition?'Workspace not found':definition?.[1]||'Advanced Atlas'} | Atelon`,'Explore interactive automotive research with explicit evidence and availability.');
  useEffect(()=>{const warn=()=>setStorageWarning(true);addEventListener('atelon-storage-error',warn);return()=>removeEventListener('atelon-storage-error',warn);},[]);
  function filter(key:string,value:string){const next=new URLSearchParams(params);value&&value!=='All'?next.set(key,value):next.delete(key);setParams(next,{replace:true});}
  if(feature&&!definition)return <NotFound/>;
  return <div className="page atlas-workspace">
    <div className="atlas-heading"><div><p className="eyebrow">Atelon · advanced atlas</p><h1>{definition?.[1]||'Go beyond the surface.'}</h1><p className="lede">{definition?.[2]||'Fifteen connected tools for seeing, studying and sharing automotive knowledge.'}</p></div>{feature&&<Link className="btn ghost" to="/atlas">All tools ↗</Link>}</div>
    {storageWarning&&<p className="notice warning" role="alert">Browser storage is unavailable or full. This session still works, but changes may not survive a reload. Export important research before leaving.</p>}
    {feature?<><nav className="atlas-feature-nav" aria-label="Atlas tools">{atlasFeatures.map(([id,title])=><Link aria-current={feature===id?'page':undefined} className={feature===id?'active':''} key={id} to={`/atlas/${id}`}>{title}</Link>)}</nav><p className="atlas-readiness"><span aria-hidden="true">◈</span> {readiness(feature)} <span>· Evidence before assumptions</span></p><ToolBoundary key={feature}><Suspense fallback={<div className="atlas-panel atlas-loading" role="status">Preparing your workspace…</div>}>{Page&&<Page/>}</Suspense></ToolBoundary></>:<>
      <section className="atlas-command-shelf glass-regular" aria-label="Find an Atlas tool">
        <label>Find your next perspective<input type="search" value={query} maxLength={100} placeholder="Search tools, evidence, stories…" onChange={event=>filter('q',event.target.value)}/></label>
        <div className="atlas-category-row" role="group" aria-label="Tool category">{['All','Showroom','Research','Create','Collaborate'].map(item=><button className="btn ghost" aria-pressed={category===item} key={item} onClick={()=>filter('category',item)}>{item}</button>)}</div>
        <p className="atlas-status" role="status">{tools.length} of {atlasFeatures.length} tools · {vehicles.length} sourced vehicle records</p>
      </section>
      {tools.length?<div className="grid atlas-tool-grid">{tools.map(([id,title,description])=><Link className="atlas-feature glass-regular glass-interactive" key={id} to={`/atlas/${id}`}><div className="atlas-card-meta"><span>{String(atlasFeatures.findIndex(item=>item[0]===id)+1).padStart(2,'0')}</span><span>{categories[id]}</span></div><h2>{title}</h2><p>{description}</p><span className="atlas-capability">{readiness(id)}</span><span className="atlas-card-arrow" aria-hidden="true">↗</span></Link>)}</div>:<section className="atlas-panel"><h2>No matching tools</h2><p>Try a broader term or another category.</p><button className="btn primary" onClick={()=>setParams({})}>Reset tool filters</button></section>}
    </>}
  </div>;
}
