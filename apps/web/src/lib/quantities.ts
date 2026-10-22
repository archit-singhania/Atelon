import type { Spec } from '../types';
export function parseQuantity(spec?: Pick<Spec,'value'|'unit'>): {value:number;unit:string;qualifier:string}|null {
  if(!spec)return null;
  if(typeof spec.value==='number'&&Number.isFinite(spec.value)&&spec.unit)return {value:spec.value,unit:spec.unit,qualifier:''};
  if(typeof spec.value!=='string')return null;
  const match=spec.value.match(/^\s*([\d,]+(?:\.\d+)?)\s*(kW|bhp|hp|PS|CV|kg|lb-ft|lb|Nm|mm|cm|m|km\/h|mph)\b(.*)$/i);
  if(!match)return null;const value=Number(match[1].replace(/,/g,''));return Number.isFinite(value)?{value,unit:match[2],qualifier:match[3].trim()}:null;
}
