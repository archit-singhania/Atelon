const key = 'atelon-my-garage-v2';
export function readGarage():string[]{try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?[...new Set(value.filter((v):v is string=>typeof v==='string'&&/^[a-z0-9-]+$/.test(v)))].slice(0,200):[];}catch{return [];}}
export function writeGarage(slugs:string[]){const next=[...new Set(slugs)].slice(0,200);localStorage.setItem(key,JSON.stringify(next));dispatchEvent(new CustomEvent('atelon-garage-change',{detail:next}));return next;}
export function toggleGarage(slug:string){const current=readGarage();const next=current.includes(slug)?current.filter(item=>item!==slug):[...current,slug];try{return writeGarage(next);}catch{dispatchEvent(new CustomEvent('atelon-storage-error'));return current;}}
