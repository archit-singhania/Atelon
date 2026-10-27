import {useEffect,useRef,useState} from 'react';
import type {Session} from '@supabase/supabase-js';
import {API_URL} from '../lib/data';
import {downloadText} from '../lib/research';
import {Glass} from './Glass';

export default function AccountExport({session}:{session:Session}){
 const [busy,setBusy]=useState(false);const [notice,setNotice]=useState('');const controller=useRef<AbortController|null>(null);
 useEffect(()=>()=>controller.current?.abort(),[]);
 async function download(){
  if(controller.current)return;
  const current=new AbortController();controller.current=current;setBusy(true);setNotice('Preparing your private account archive…');
  const timeout=setTimeout(()=>current.abort(),60000);
  try{
   const response=await fetch(`${API_URL}/api/v2/account/export`,{headers:{Authorization:`Bearer ${session.access_token}`},signal:current.signal});
   if(!response.ok)throw Error(response.status===401?'Your session expired. Sign in again to export.':'The complete export could not be prepared. Please retry.');
   const archive=await response.json();if(current.signal.aborted)return;
   if(!archive.data||!archive.exportedAt)throw Error('The export response was incomplete. Please retry.');
   downloadText('atelon-account-export.json',JSON.stringify({...archive,scope:'Cloud personal records. Device-only saves, pending changes, uploaded asset binaries and shared editorial records are not included.',consistency:'Collected across multiple reads; pause edits on other devices for a stable archive.'},null,2),'application/json');
   setNotice('Account archive downloaded. Keep it private: it contains your notes and conversations.');
  }catch(error){if(!current.signal.aborted)setNotice((error as Error).message);else setNotice('Export stopped. No complete archive was downloaded.');}
  finally{clearTimeout(timeout);controller.current=null;setBusy(false);}
 }
 return <Glass depth="dense" className="account-card"><h2>Your account data</h2><p>Download cloud saves, comparisons, conversations, profile, viewing history, research and submissions. Device-only changes and uploaded model files are separate.</p><button className="btn ghost" disabled={busy} onClick={download}>{busy?'Preparing export…':'Export cloud account'}</button><p role="status">{notice}</p></Glass>;
}
