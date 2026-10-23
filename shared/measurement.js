export function measurementIssue(value) {
  if(value===undefined)return null;
  if(!value||typeof value!=='object'||Array.isArray(value))return 'Measurement must be an object.';
  const units={power:'kW',torque:'Nm',weight:'kg',length:'mm',width:'mm',height:'mm',speed:'km/h'};
  if(!Object.hasOwn(units,value.kind)||value.unit!==units[value.kind])return 'Measurement kind and canonical unit must agree.';
  if(typeof value.value!=='number'||!Number.isFinite(value.value)||value.value<0)return 'Measurement requires a finite nonnegative value.';
  if(value.uncertainty!==undefined&&(typeof value.uncertainty!=='number'||!Number.isFinite(value.uncertainty)||value.uncertainty<0))return 'Uncertainty must be nonnegative.';
  if(typeof value.qualifier!=='string'||value.qualifier.length>500)return 'Measurement requires an explicit qualifier (may be empty).';
  if(typeof value.reviewer!=='string'||!value.reviewer.trim()||value.reviewer.length>100)return 'Measurement requires its reviewer.';
  const d=value.verifiedAt;if(typeof d!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(d)||!Number.isFinite(Date.parse(d))||new Date(d).toISOString().slice(0,10)!==d)return 'Measurement requires a valid verification date.';
  return null;
}
