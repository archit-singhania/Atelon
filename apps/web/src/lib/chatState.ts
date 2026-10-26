export interface Reply { answer: string; provider: string; sources: string[]; matchedVehicles: string[]; fallback: boolean; fallbackReason?: string | null; retryable?: boolean; attemptedProviders?: string[] }
export interface Message { id: number; role: 'assistant' | 'user'; text: string; reply?: Reply; error?: boolean; retryText?: string }
const strings=(value:unknown):string[]=>Array.isArray(value)?value.filter((v):v is string=>typeof v==='string').slice(0,50):[];
const safeSource=(value:string)=>{try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password;}catch{return false;}};
export function normalizeMessages(value:unknown):Message[]{
 if(!Array.isArray(value))return [];
 return value.slice(-40).flatMap((item,index)=>{
  if(!item||typeof item!=='object'||!['user','assistant'].includes(item.role)||typeof item.text!=='string')return [];
  const message:Message={id:index+1,role:item.role,text:item.text.slice(0,30000)};
  if(item.reply&&typeof item.reply==='object'){const r=item.reply;message.reply={answer:typeof r.answer==='string'?r.answer.slice(0,30000):message.text,provider:typeof r.provider==='string'?r.provider:'saved response',sources:strings(r.sources).filter(safeSource),matchedVehicles:strings(r.matchedVehicles).filter(s=>/^[a-z0-9-]+$/.test(s)),fallback:r.fallback===true};}
  if(item.error===true)message.error=true;if(typeof item.retryText==='string')message.retryText=item.retryText.slice(0,500);
  return [message];
 });
}
