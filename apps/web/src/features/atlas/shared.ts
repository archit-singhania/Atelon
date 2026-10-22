import { vehicles } from '../../lib/data';
import type { Vehicle } from '../../types';
export { parseQuantity } from '../../lib/quantities';
export const atlasFeatures = [
  ['commands','Showroom concierge','Turn a request into a precise showroom action.'],
  ['lab','Engineering laboratory','Explore original, educational mechanical models.'],
  ['bay','Scale comparison bay','Compare calibrated geometry and recorded dimensions.'],
  ['graph','Knowledge graph','Follow sourced relationships between machines and facts.'],
  ['evidence','Evidence intelligence','Save source-linked catalogue snapshots and inspect changes.'],
  ['rooms','Research rooms','Present a shared vehicle and research board.'],
  ['interiors','Interior explorer','Enter reviewed cabin camera positions.'],
  ['fit','Garage-fit studio','Explore vehicle dimensions and clearance envelopes.'],
  ['identify','Visual identification','Request catalogue matches from a vehicle photograph.'],
  ['discovery','Discovery map','Explore vehicles by recorded engineering character.'],
  ['director','Story director','Build and export a narrated vehicle presentation.'],
  ['evolution','Generation stories','Scrub sourced generation records side by side.'],
  ['sound','Sound archive','Listen to approved vehicle recordings.'],
  ['dossiers','Research dossiers','Compose a dated, source-linked research report.'],
  ['contribute','Contributor review','Submit sourced corrections for expert review.']
] as const;
export function vehicleName(vehicle: Vehicle) { return `${vehicle.make} ${vehicle.model}`; }
export function dimensionRecord(vehicle: Vehicle) {
  const spec=vehicle.specs.find(spec=>/dimensions.*l.*w.*h/i.test(spec.key));
  const match=typeof spec?.value==='string'?spec.value.match(/^([\d,]+)\s*\/\s*([\d,]+)\s*\/\s*([\d,]+)\s*mm$/):null;
  return match&&spec?{length:Number(match[1].replace(/,/g,''))/1000,width:Number(match[2].replace(/,/g,''))/1000,height:Number(match[3].replace(/,/g,''))/1000,source:spec.source}:null;
}
export function catalogueLinks() {
  const links:{a:string;b:string;label:string;sources:string[]}[]=[];
  for(let i=0;i<vehicles.length;i++)for(let j=i+1;j<vehicles.length;j++){
    const a=vehicles[i],b=vehicles[j];
    if(a.make===b.make)links.push({a:a.slug,b:b.slug,label:'Same recorded manufacturer',sources:[...new Set([...a.specs,...b.specs].map(spec=>spec.source))]});
    if(a.generationFamily&&a.generationFamily===b.generationFamily)links.push({a:a.slug,b:b.slug,label:'Reviewed generation family',sources:[...new Set([...a.specs,...b.specs].map(spec=>spec.source))]});
  }return links;
}
