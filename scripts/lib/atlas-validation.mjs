const object=value=>Boolean(value)&&typeof value==='object'&&!Array.isArray(value);
const text=value=>typeof value==='string'&&value.trim().length>0;
const url=value=>{try{const parsed=new URL(value);return ['http:','https:'].includes(parsed.protocol)&&!parsed.username&&!parsed.password;}catch{return false;}};
const vector=value=>Array.isArray(value)&&value.length===3&&value.every(Number.isFinite);
const reviewed=value=>object(value)&&text(value.reviewer)&&typeof value.verifiedAt==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value.verifiedAt)&&Number.isFinite(Date.parse(value.verifiedAt))&&new Date(value.verifiedAt).toISOString().slice(0,10)===value.verifiedAt;
const uniqueIds=rows=>new Set(rows.map(row=>row?.id)).size===rows.length;
const localAudio=value=>typeof value==='string'&&/^\/(?!\/)[^\s?#]+\.(mp3|wav|ogg|m4a|webm)$/.test(value)&&!value.split('/').some(part=>part==='..'||part==='.')&&!/%|\\/.test(value);
export function validateAtlasMetadata(vehicle,knownSlugs){
 const errors=[];const model=vehicle.model3d;
 if(model?.calibration!==undefined){const value=model.calibration;if(!reviewed(value)||!url(value.source)||!vector(value.rotation)||!Number.isFinite(value.metersPerUnit)||value.metersPerUnit<=0)errors.push('calibration requires a positive metre scale, finite rotation, source and dated reviewer');}
 if(model?.interior!==undefined){
   const value=model.interior;
   if(!reviewed(value)||!Array.isArray(value.seats)||!value.seats.length||value.seats.length>12||!uniqueIds(value.seats)||value.seats.some(seat=>!object(seat)||!text(seat.id)||!text(seat.label)||!vector(seat.position)||!vector(seat.target)||seat.position.every((number,index)=>number===seat.target[index])))errors.push('interior requires unique reviewed seating positions and distinct finite targets');
   if(object(value)&&value.controls!==undefined&&(!Array.isArray(value.controls)||value.controls.length>50||!uniqueIds(value.controls)||value.controls.some(control=>!object(control)||!text(control.id)||!text(control.label)||!text(control.description)||!url(control.source))))errors.push('interior controls require unique identifiers, descriptions and sources');
 }
 if(vehicle.relationships!==undefined&&(!Array.isArray(vehicle.relationships)||vehicle.relationships.length>100||vehicle.relationships.some(link=>!object(link)||link.targetSlug===vehicle.slug||!knownSlugs.has(link.targetSlug)||!['platform','engine','designer','motorsport','generation'].includes(link.kind)||!text(link.label)||!url(link.source))))errors.push('relationships require known distinct targets, supported kinds, labels and sources');
 if(vehicle.recordings!==undefined&&(!Array.isArray(vehicle.recordings)||vehicle.recordings.length>30||!uniqueIds(vehicle.recordings)||vehicle.recordings.some(recording=>!object(recording)||!text(recording.id)||!text(recording.title)||!text(recording.credit)||!url(recording.source)||!['startup','idle','acceleration'].includes(recording.kind)||!localAudio(recording.url))))errors.push('recordings require unique attributed, sourced local audio assets and a supported kind');
 return errors;
}
