import { useEffect,useRef,useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL,bySlug } from '../../lib/data';
import { vehicleName } from './shared';
type Candidate={slug:string;confidence:number;features:string[]};
export default function Identify(){
  const [preview,setPreview]=useState('');const [notice,setNotice]=useState('');const [ready,setReady]=useState(false);const [busy,setBusy]=useState(false);const [candidates,setCandidates]=useState<Candidate[]>([]);
  const generation=useRef(0);const request=useRef<AbortController|null>(null);const reader=useRef<FileReader|null>(null);const input=useRef<HTMLInputElement>(null);
  useEffect(()=>{const controller=new AbortController();fetch(`${API_URL}/api/v4/capabilities`,{signal:controller.signal}).then(response=>{if(!response.ok)throw Error();return response.json();}).then(data=>setReady(Boolean(data.vision))).catch(()=>undefined);return()=>{controller.abort();generation.current++;request.current?.abort();reader.current?.abort();};},[]);
  function clear(message:string){generation.current++;request.current?.abort();reader.current?.abort();setPreview('');setCandidates([]);setBusy(false);setNotice(message);if(input.current)input.current.value='';}
  function choose(file?:File){
    clear('');if(!file)return;
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size===0||file.size>2*1024*1024){setNotice('Choose a JPEG, PNG or WebP image below 2 MiB.');return;}
    const version=generation.current;const fileReader=new FileReader();reader.current=fileReader;
    fileReader.onload=()=>{if(version!==generation.current)return;setPreview(String(fileReader.result));setNotice('Photo remains on this device until you select Identify.');};
    fileReader.onerror=()=>{if(version===generation.current)setNotice('The selected image could not be read. Choose another file.');};fileReader.readAsDataURL(file);
  }
  async function identify(){
    const version=++generation.current;request.current?.abort();const controller=new AbortController();request.current=controller;
    const timer=setTimeout(()=>controller.abort(),25000);setBusy(true);setCandidates([]);setNotice('Checking the photograph against the catalogue…');
    try{const response=await fetch(`${API_URL}/api/v4/identify`,{method:'POST',signal:controller.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({image:preview})});const result=await response.json();if(!response.ok)throw new Error(result.error?.message||'Identification unavailable.');if(version!==generation.current)return;const matches=Array.isArray(result.candidates)?result.candidates.filter((item:Candidate)=>item&&bySlug(item.slug)&&Array.isArray(item.features)):[];setCandidates(matches);setNotice(String(result.notice||'Review the suggested matches.')+(matches.length?'':' No confident catalogue matches were returned.'));}
    catch(error){if(version===generation.current)setNotice(controller.signal.aborted?'Identification timed out. Retry when the service is available.':(error as Error).message);}
    finally{clearTimeout(timer);if(version===generation.current)setBusy(false);}
  }
  return <section className="atlas-panel">
    <p>Choose a vehicle photo and review it before sending. Identification searches only the current catalogue. The application does not store your photo; the configured provider may have a separate retention policy.</p>
    <label>Vehicle image · maximum 2 MiB<input ref={input} type="file" accept="image/jpeg,image/png,image/webp" onChange={event=>choose(event.target.files?.[0])}/></label>
    {preview&&<img className="atlas-photo" src={preview} alt="Selected vehicle photograph"/>}
    <button className="btn primary" disabled={!ready||!preview||busy} onClick={identify}>{busy?'Identifying…':'Identify using configured vision provider'}</button>
    <button className="btn ghost" onClick={()=>clear('Photo removed; pending identification cancelled.')}>Remove photo</button>
    {busy&&<button className="btn ghost" onClick={()=>{generation.current++;request.current?.abort();setBusy(false);setNotice('Identification cancelled.');}}>Stop identification</button>}
    {!ready&&<p>A server-side vision provider is required before identification can be sent. Local photo preview is available.</p>}
    <p role="status">{notice}</p>
    {candidates.map(candidate=>{const vehicle=bySlug(candidate.slug)!;return <article className="atlas-record" key={candidate.slug}><Link to={`/vehicle/${vehicle.slug}`}>{vehicleName(vehicle)}</Link><p>Estimated confidence: {Math.round(candidate.confidence*100)}% · uncalibrated</p><ul>{candidate.features.map((feature,index)=><li key={index}>{feature}</li>)}</ul><p>Verify the generation and visible details against official references.</p></article>;})}
  </section>;
}
