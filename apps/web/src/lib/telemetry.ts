import { API_URL } from './data';
const last=new Map<string,number>();
export function signalQuality(kind:'model_failure'|'slow_route'|'ui_error') {
  // Only a fixed event category leaves the device: no URL, message, identity or prompt.
  if(navigator.doNotTrack==='1'||!navigator.onLine)return;
  if(Date.now()-(last.get(kind)||0)<10000)return;last.set(kind,Date.now());
  void fetch(`${API_URL}/api/telemetry`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind}),credentials:'omit',keepalive:true}).catch(()=>{});
}
