import type {GarageDocument} from './garageQueue';
export type ImportCandidate={sourceId:string;document:GarageDocument};
export function prepareCollectionImport(value:unknown,known:ReadonlySet<string>):ImportCandidate{
 if(!value||typeof value!=='object')throw Error('Invalid collection record.');
 const c=value as Record<string,unknown>;
 if(typeof c.id!=='string'||!c.id||c.id.length>200||typeof c.name!=='string'||!c.name.trim()||c.name.length>80)throw Error('Collection needs a valid ID and a name of at most 80 characters.');
 if(!Array.isArray(c.slugs)||c.slugs.length>200||c.slugs.some(s=>typeof s!=='string'||!known.has(s)))throw Error('Collection contains unavailable vehicles or exceeds 200 entries. Nothing was imported.');
 if(!c.notes||typeof c.notes!=='object'||Array.isArray(c.notes)||Object.entries(c.notes).some(([key,note])=>!known.has(key)||typeof note!=='string'))throw Error('Collection notes contain invalid or unavailable vehicle references.');
 // A reversible representation retains every note and its vehicle association,
 // including notes for vehicles removed from the membership list.
 const notes=JSON.stringify({vehicleNotes:c.notes},null,2);
 if(notes.length>2000)throw Error('These notes exceed the current cloud limit of 2,000 characters. Export a local backup; nothing will be truncated or imported.');
 return{sourceId:c.id,document:{name:c.name,notes,vehicle_slugs:[...new Set(c.slugs as string[])]}};
}
export async function importedCollectionId(owner:string,sourceId:string){
 const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(['atelon-research-import-v1',owner,sourceId])));
 const b=new Uint8Array(hash).slice(0,16);b[6]=(b[6]&15)|80;b[8]=(b[8]&63)|128;
 const hex=Array.from(b,n=>n.toString(16).padStart(2,'0')).join('');return`${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
