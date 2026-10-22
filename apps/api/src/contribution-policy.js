const kinds=['platform','engine','designer','motorsport','generation'];
export function proposalIssue(kind,proposal,vehicles){
 if(!proposal||typeof proposal!=='object'||Array.isArray(proposal)||JSON.stringify(proposal).length>6000)return 'Proposal must be an object below 6,000 characters.';
 const text=value=>typeof value==='string'&&value.trim().length>0;
 if(kind==='specification'&&(!text(proposal.key)||proposal.key.length>200||!['string','number','boolean'].includes(typeof proposal.value)||(typeof proposal.value==='number'&&!Number.isFinite(proposal.value))||(typeof proposal.value==='string'&&(!text(proposal.value)||proposal.value.length>2000))||(proposal.unit!==undefined&&(!text(proposal.unit)||proposal.unit.length>50))))return 'Specification proposals need a key, scalar value and optional unit.';
 if(kind==='relationship'&&(!vehicles.some(vehicle=>vehicle.slug===proposal.targetSlug)||!kinds.includes(proposal.kind)||!text(proposal.label)||proposal.label.length>200))return 'Relationships need a known target, supported kind and descriptive label.';
 if(['annotation','model'].includes(kind)&&(!text(proposal.note)||proposal.note.length>3000))return 'Annotation and model proposals need an evidence note below 3,000 characters.';
 return null;
}
export function validReviewTransition(from,to){return (from==='submitted'&&['reviewing','accepted','rejected'].includes(to))||(from==='reviewing'&&['accepted','rejected'].includes(to));}
