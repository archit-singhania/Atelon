import type { Spec } from '../types';
import { convertSpec } from './units.ts';
export const factKinds = ['power','torque','weight','length','width','height','speed'] as const;
export type FactKind = typeof factKinds[number];
const patterns: Record<FactKind,RegExp> = {power:/power/i,torque:/torque/i,weight:/weight|mass/i,length:/^length|overall length/i,width:/^width|overall width/i,height:/^height|overall height/i,speed:/top speed|maximum speed/i};
const units: Record<FactKind,string> = {power:'kW',torque:'Nm',weight:'kg',length:'mm',width:'mm',height:'mm',speed:'km/h'};
export function engineeringFact(specs:Spec[],kind:FactKind) {
  const candidates = specs.filter(s => s.measurement?.kind===kind||patterns[kind].test(s.key)).map(s => ({spec:s, normalized:s.measurement?.kind===kind?s.measurement:convertSpec(s.value,s.unit,'metric')})).filter(row => typeof row.normalized.value === 'number' && row.normalized.unit === units[kind]);
  if (!candidates.length) return null;
  const conflict = new Set(candidates.map(row=>row.normalized.value)).size > 1;
  return {kind, value: conflict ? null : Number(candidates[0].normalized.value), unit:units[kind], conflict, sources:candidates.map(row=>row.spec.source), records:candidates.map(row=>row.spec)};
}
