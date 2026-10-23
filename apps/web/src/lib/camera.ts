export interface SharedCamera {position:[number,number,number];target:[number,number,number]}
export function validCamera(value:unknown):value is SharedCamera {
  if(!value||typeof value!=='object')return false;
  const row=value as Record<string,unknown>;
  return ['position','target'].every(key=>Array.isArray(row[key])&&row[key].length===3&&row[key].every((n:unknown)=>typeof n==='number'&&Number.isFinite(n)&&Math.abs(n)<1000000));
}
