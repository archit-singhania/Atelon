import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { validCamera } from '../lib/camera';
export default function LiveRoom({id,local,presenter,following,url}:{id:string;local:boolean;presenter:boolean;following:boolean;url:string}) {
  const [status,setStatus]=useState('Connecting live camera…');
  useEffect(()=>{
    let active=true;let localChannel:BroadcastChannel|undefined;let remote:ReturnType<NonNullable<typeof supabase>['channel']>|undefined;
    let send:(payload:unknown)=>void=()=>{};
    const receive=(payload:unknown)=>{const p=payload as {url?:string;camera?:unknown};if(following&&p?.url===url&&validCamera(p.camera))dispatchEvent(new CustomEvent('atelon-camera-apply',{detail:{url,camera:p.camera}}));};
    const publish=(event:Event)=>{const d=(event as CustomEvent).detail;if(presenter&&d.url===url&&validCamera(d.camera))send({url,camera:d.camera});};
    addEventListener('atelon-camera-change',publish);
    async function connect(){
      if(local){try{localChannel=new BroadcastChannel(`atelon-live-${id}`);localChannel.onmessage=e=>receive(e.data);send=p=>localChannel?.postMessage(p);setStatus('Live camera connected across local tabs.');}catch{setStatus('Live camera unavailable; saved views remain available.');}return;}
      if(!supabase){setStatus('Sign in to enable live collaboration.');return;}
      const session=(await supabase.auth.getSession()).data.session;if(!active||!session)return;
      await supabase.realtime.setAuth(session.access_token);if(!active)return;
      remote=supabase.channel(`atelon-room:${id}`,{config:{private:true,broadcast:{self:false},presence:{key:crypto.randomUUID()}}});
      remote.on('broadcast',{event:'camera'},event=>receive(event.payload)).on('presence',{event:'sync'},()=>{if(active)setStatus(`Live room · ${Object.keys(remote!.presenceState()).length} connected participant(s)`);}).subscribe(async state=>{if(!active)return;if(state==='SUBSCRIBED'){await remote!.track({online:true});setStatus('Live camera connected.');}else if(state==='CHANNEL_ERROR'||state==='TIMED_OUT')setStatus('Live connection unavailable. Saved views still synchronize.');});
      send=payload=>{void remote?.send({type:'broadcast',event:'camera',payload}).catch(()=>{if(active)setStatus('Live connection interrupted.');});};
    }
    connect().catch(()=>{if(active)setStatus('Live connection unavailable. Saved views still synchronize.');});
    return()=>{active=false;removeEventListener('atelon-camera-change',publish);localChannel?.close();if(remote)void supabase?.removeChannel(remote);};
  },[id,local,presenter,following,url]);
  return <p className="atlas-status" role="status">{status} {presenter?'Drag the model to share your viewpoint.':''}</p>;
}
