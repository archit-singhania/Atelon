// Local storage and cloud backups are untrusted inputs, not typed application data.
export function record(value:unknown):value is Record<string,unknown>{return Boolean(value)&&typeof value==='object'&&!Array.isArray(value);}
export function safeHttpUrl(value:unknown):string|null{
  if(typeof value!=='string')return null;
  try{const url=new URL(value);return ['https:','http:'].includes(url.protocol)&&!url.username&&!url.password?url.href:null;}catch{return null;}
}
export function boundedArray<T>(value:unknown,guard:(item:unknown)=>item is T,limit=100):T[]{return Array.isArray(value)?value.filter(guard).slice(0,limit):[];}
export type StoryShot={id:string;slug:string;view:'hero'|'side'|'detail';scene:'studio'|'night'|'pearl';seconds:number;specKey:string;endView?:'hero'|'side'|'detail'};
export function normalizeShots(value:unknown,knownSlugs:ReadonlySet<string>,fallback:StoryShot[]):StoryShot[]{
  const seen=new Set<string>();
  const result=boundedArray(value,(item):item is Record<string,unknown>=>record(item)&&typeof item.slug==='string'&&knownSlugs.has(item.slug),8).map((item,index)=>{
    let id=typeof item.id==='string'&&item.id.length<100?item.id:`shot-${index}`;if(seen.has(id))id=`${id}-${index}`;seen.add(id);
    return {id,slug:String(item.slug),endView:(['hero','side','detail'].includes(String(item.endView))?item.endView:'side') as StoryShot['endView'],view:(['hero','side','detail'].includes(String(item.view))?item.view:'hero') as StoryShot['view'],scene:(['studio','night','pearl'].includes(String(item.scene))?item.scene:'studio') as StoryShot['scene'],seconds:typeof item.seconds==='number'&&Number.isFinite(item.seconds)?Math.min(8,Math.max(2,item.seconds)):3,specKey:typeof item.specKey==='string'?item.specKey.slice(0,200):''};
  });return result.length?result:fallback;
}
export type RoomState={slug:string;view:'hero'|'side'|'detail';cursor?:{x:number;y:number}};
export type RoomNote={id:string;text:string;created_at:string};
export function validRoomState(value:unknown,slugs:ReadonlySet<string>):value is RoomState{return record(value)&&typeof value.slug==='string'&&slugs.has(value.slug)&&['hero','side','detail'].includes(String(value.view));}
export function validRoomNote(value:unknown):value is RoomNote{return record(value)&&typeof value.id==='string'&&value.id.length<=100&&typeof value.text==='string'&&value.text.length<=1000&&typeof value.created_at==='string'&&Number.isFinite(Date.parse(value.created_at));}
export function mergeNotes(...groups:RoomNote[][]){return [...new Map(groups.flat().map(note=>[note.id,note])).values()].sort((a,b)=>a.created_at.localeCompare(b.created_at)||a.id.localeCompare(b.id)).slice(-100);}
