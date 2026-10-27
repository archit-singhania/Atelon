import {useState} from 'react';
import type {Session} from '@supabase/supabase-js';
import {API_URL} from '../lib/data';
import {Glass} from './Glass';
export default function AccountDeletion({session,onDeleted}:{session:Session;onDeleted:()=>void}){
 const [open,setOpen]=useState(false);const [confirmation,setConfirmation]=useState('');const [busy,setBusy]=useState(false);const [notice,setNotice]=useState('');
 async function remove(){if(confirmation!=='DELETE MY ACCOUNT'||busy)return;setBusy(true);try{
  const response=await fetch(`${API_URL}/api/v2/account/identity`,{method:'DELETE',headers:{Authorization:`Bearer ${session.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({confirmation}),signal:AbortSignal.timeout(30000)});
  const result=await response.json();if(!response.ok||result.deleted!==true)throw Error(result.error?.message||'Deletion was not confirmed. Check your session before retrying.');
  setNotice('Account deletion confirmed. Device-only data remains on this browser.');onDeleted();
 }catch(error){setNotice((error as Error).message);}finally{setBusy(false);}}
 return <Glass depth="dense"><h2>Delete account</h2><p>Export your data first. Deletion removes your sign-in identity and owned cloud records, including rooms you own. Shared editorial content, published assets and device-only saves remain.</p>{!open?<button className="btn ghost" onClick={()=>setOpen(true)}>Review account deletion</button>:<section aria-label="Confirm account deletion"><label>Type DELETE MY ACCOUNT<input autoComplete="off" value={confirmation} onChange={e=>setConfirmation(e.target.value)}/></label><button className="btn primary" disabled={busy||confirmation!=='DELETE MY ACCOUNT'} onClick={remove}>Permanently delete my account</button><button className="btn ghost" disabled={busy} onClick={()=>{setOpen(false);setConfirmation('');}}>Cancel</button></section>}<p role="status">{notice}</p></Glass>;
}
