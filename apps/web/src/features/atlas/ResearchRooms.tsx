import LiveRoom from '../../components/LiveRoom';
import { lazy,Suspense,useEffect,useRef,useState } from 'react';
import { useLocation,useNavigate,useSearchParams } from 'react-router-dom';
import { API_URL,vehicles,bySlug } from '../../lib/data';
import { supabase } from '../../lib/supabase';
import { readLocal,saveLocal } from '../../lib/research';
import { boundedArray,mergeNotes,record,validRoomNote,validRoomState,type RoomState,type RoomNote } from '../../lib/atlasState';
import { vehicleName } from './shared';
const ModelViewer=lazy(()=>import('../../components/ModelViewer'));
const slugs=new Set(vehicles.map(vehicle=>vehicle.slug));
const initial:RoomState={slug:vehicles[0].slug,view:'hero'};
export default function ResearchRooms(){
  const [params,setParams]=useSearchParams();const location=useLocation();const navigate=useNavigate();
  const raw=params.get('room')||'';const id=/^[a-f0-9-]{36}$/i.test(raw)?raw:'';const local=params.get('mode')==='local';
  const token=new URLSearchParams(location.hash.slice(1)).get('invite')||params.get('invite');
  const [liveAllowed,setLiveAllowed]=useState(false);
  const [state,setState]=useState<RoomState>(initial);const [invitation,setInvitation]=useState('');const [presenter,setPresenter]=useState(false);const [notes,setNotes]=useState<RoomNote[]>([]);const [text,setText]=useState('');const [notice,setNotice]=useState('');const [following,setFollowing]=useState(true);const [busy,setBusy]=useState(false);
  const channel=useRef<BroadcastChannel|null>(null);const current=useRef({state,notes});current.current={state,notes};
  const follow=useRef(following);follow.current=following;const version=useRef(0);const writing=useRef(false);const currentId=useRef(id);currentId.current=id;
  async function request(path:string,method='GET',body?:unknown,signal?:AbortSignal){
    const session=(await supabase?.auth.getSession())?.data.session;if(!session)throw new Error('Sign in from My Garage for cross-device research rooms.');
    const response=await fetch(`${API_URL}/api/v4/rooms${path}`,{method,signal,headers:{Authorization:`Bearer ${session.access_token}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
    if(response.status===204)return null;const result=await response.json();if(!response.ok)throw new Error(result.error?.message||'Room unavailable.');return result;
  }
  function persist(next:RoomState,nextNotes:RoomNote[]){
    const value={state:next,notes:nextNotes};current.current=value;saveLocal(`atelon-room-${id}`,value);channel.current?.postMessage(value);
  }
  useEffect(()=>{
    setLiveAllowed(false);setPresenter(false);setNotes([]);version.current=0;writing.current=false;
    if(!id){setState(initial);return;}
    if(local){
      const key=`atelon-room-${id}`;const saved=readLocal<unknown>(key,{});
      const nextState=record(saved)&&validRoomState(saved.state,slugs)?saved.state:initial;
      const nextNotes=record(saved)?boundedArray(saved.notes,validRoomNote):[];
      setLiveAllowed(true);setState(nextState);setNotes(nextNotes);current.current={state:nextState,notes:nextNotes};setPresenter(true);
      function receive(value:unknown){
        if(!record(value))return;
        const merged=mergeNotes(current.current.notes,boundedArray(value.notes,validRoomNote));setNotes(merged);
        const next=follow.current&&validRoomState(value.state,slugs)?value.state:current.current.state;
        current.current={state:next,notes:merged};if(follow.current)setState(next);
        const incoming=boundedArray(value.notes,validRoomNote);if(JSON.stringify(incoming)!==JSON.stringify(merged)&&validRoomState(value.state,slugs))saveLocal(key,{state:value.state,notes:merged});
      }
      let connection:BroadcastChannel|null=null;
      try{if('BroadcastChannel'in window){connection=new BroadcastChannel(key);channel.current=connection;connection.onmessage=event=>receive(event.data);}}catch{/* Storage events provide the fallback. */}
      const onStorage=(event:StorageEvent)=>{if(event.key!==key||!event.newValue)return;try{receive(JSON.parse(event.newValue));}catch{/* Ignore malformed external storage. */}};
      addEventListener('storage',onStorage);setNotice('Local room: tabs in this browser can edit the shared view and notes.');
      return()=>{connection?.close();channel.current=null;removeEventListener('storage',onStorage);};
    }
    let active=true;let timer:ReturnType<typeof setTimeout>;const controller=new AbortController();
    async function refresh(){
      try{const room=await request(`/${id}`,'GET',undefined,controller.signal);if(!active)return;
        if(!validRoomState(room.state,slugs))throw new Error('The room contains an unsupported vehicle view.');
        if(!writing.current){version.current=room.version;if(follow.current)setState(room.state);}
        setLiveAllowed(true);setPresenter(room.role==='presenter');setNotes(boundedArray(room.notes,validRoomNote));setNotice('Connected. Vehicle views and the research board refresh automatically.');
      }catch(error){if(active){setLiveAllowed(false);setPresenter(false);setNotice((error as Error).message);}}
      finally{if(active)timer=setTimeout(refresh,document.hidden?10000:2500);}
    }
    refresh();return()=>{active=false;clearTimeout(timer);controller.abort();};
  },[id,local]);
  async function publish(next:RoomState){
    if(!presenter||writing.current)return;setState(next);
    if(local){persist(next,current.current.notes);return;}
    writing.current=true;setBusy(true);const roomId=id;
    try{const result=await request(`/${roomId}`,'PATCH',{state:next,expectedVersion:version.current});if(currentId.current===roomId)version.current=result.version;}
    catch(error){if(currentId.current===roomId)setNotice((error as Error).message);}
    finally{if(currentId.current===roomId){writing.current=false;setBusy(false);}}
  }
  async function addNote(event:React.FormEvent){
    event.preventDefault();if(!text.trim()||busy)return;setBusy(true);const roomId=id;
    try{
      if(local){const saved=readLocal<unknown>(`atelon-room-${id}`,{});const latest=record(saved)?boundedArray(saved.notes,validRoomNote):[];
        const next=mergeNotes(current.current.notes,latest,[{id:crypto.randomUUID(),text:text.trim(),created_at:new Date().toISOString()}]);setNotes(next);persist(record(saved)&&validRoomState(saved.state,slugs)?saved.state:state,next);
      }else{const note=await request(`/${id}/notes`,'POST',{text:text.trim()});if(currentId.current===roomId)setNotes(previous=>mergeNotes(previous,[note]));}
      if(currentId.current===roomId)setText('');
    }catch(error){if(currentId.current===roomId)setNotice((error as Error).message);}
    finally{if(currentId.current===roomId)setBusy(false);}
  }
  const vehicle=bySlug(state.slug)||vehicles[0];
  return <section className="atlas-panel">
    <div className="atlas-toolbar">
      <button className="btn primary" disabled={busy} onClick={()=>{setInvitation('');setParams({mode:'local',room:crypto.randomUUID()});}}>Create local two-tab room</button>
      <button className="btn ghost" disabled={!supabase||busy} onClick={async()=>{setBusy(true);try{const room=await request('','POST',{slug:state.slug});setParams({room:room.id});const url=new URL('/atlas/rooms',window.location.origin);url.searchParams.set('room',room.id);url.hash=new URLSearchParams({invite:room.invite}).toString();setInvitation(url.href);setNotice('Room created. Share the private participant invitation.');}catch(error){setNotice((error as Error).message);}finally{setBusy(false);}}}>Create cross-device room</button>
      {token&&id&&!local&&<button className="btn primary" disabled={busy} onClick={async()=>{setBusy(true);try{await request(`/${id}/join`,'POST',{invite:token});navigate(`/atlas/rooms?room=${id}`,{replace:true});setNotice('Joined room. Waiting for the latest shared view.');}catch(error){setNotice((error as Error).message);}finally{setBusy(false);}}}>Join invited room</button>}
      {id&&<button className="btn ghost" onClick={async()=>{const url=new URL(window.location.href);url.hash='';url.searchParams.delete('invite');try{await navigator.clipboard.writeText(url.href);setNotice(local?'Open the copied room URL in another tab of this browser.':'Room URL copied. New members also need the private invitation.');}catch{setNotice(url.href);}}}>Copy room URL</button>}
      {id&&<button className="btn ghost" onClick={()=>{setParams({});setInvitation('');setText('');setNotice('You left the room.');}}>Leave room</button>}
    </div>
    {raw&&!id&&<p role="alert">This room identifier is invalid. Create a new room or check the invitation.</p>}
    <p className="atlas-status" role="status">{notice}</p>
    {invitation&&<div className="atlas-record"><p className="atlas-source">Private participant invitation: {invitation}</p><button className="btn ghost" onClick={()=>navigator.clipboard.writeText(invitation).then(()=>setNotice('Invitation copied.')).catch(()=>setNotice('Select and copy the invitation above.'))}>Copy participant invitation</button></div>}
    {id&&<>
      <label><input type="checkbox" checked={following} onChange={event=>setFollowing(event.target.checked)}/> Follow shared view</label>
      <div className="atlas-toolbar"><label>Shared vehicle<select disabled={!presenter||busy} value={state.slug} onChange={event=>publish({...state,slug:event.target.value})}>{vehicles.map(item=><option key={item.slug} value={item.slug}>{vehicleName(item)}</option>)}</select></label><label>Camera preset<select disabled={!presenter||busy} value={state.view} onChange={event=>publish({...state,view:event.target.value as RoomState['view']})}>{['hero','side','detail'].map(view=><option key={view}>{view}</option>)}</select></label></div>
      <div className="atlas-scene">{vehicle.model3d&&<Suspense fallback={<p>Preparing shared showroom…</p>}><ModelViewer key={state.slug} url={vehicle.model3d.glb} poster={vehicle.poster} cameraPreset={state.view} orbitSpeed={0}/></Suspense>}</div>
      {liveAllowed&&vehicle.model3d&&<LiveRoom id={id} local={local} presenter={presenter} following={following} url={vehicle.model3d.glb}/>}<h3>Shared research board</h3><div role="log" aria-label="Shared research notes">{notes.map(note=><p key={note.id}>{note.text}</p>)}</div>
      <form onSubmit={addNote}><label>Annotation<textarea value={text} maxLength={1000} onChange={event=>setText(event.target.value)}/></label><button className="btn primary" disabled={busy||!text.trim()}>Add to board</button></form>
      {presenter&&!local&&<button className="btn ghost" disabled={busy} onClick={async()=>{setBusy(true);try{await request(`/${id}`,'DELETE');setParams({});setNotice('Room closed; access revoked.');}catch(error){setNotice((error as Error).message);}finally{setBusy(false);}}}>Close room and revoke access</button>}
    </>}
  </section>;
}
