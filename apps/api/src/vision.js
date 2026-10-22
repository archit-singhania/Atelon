export async function readBoundedText(response,limit=65536){
  if(!response.body)throw new Error('Empty vision response.');
  const reader=response.body.getReader();const chunks=[];let size=0;
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw new Error('Vision response exceeded its budget.');}chunks.push(Buffer.from(value));}}finally{reader.releaseLock();}
  return Buffer.concat(chunks).toString('utf8');
}
export function parseVisionCandidates(raw,vehicles){
  const envelope=JSON.parse(raw);const content=envelope?.choices?.[0]?.message?.content;
  if(typeof content!=='string')throw new Error('Missing vision content.');
  const result=JSON.parse(content.replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,''));
  if(!result||!Array.isArray(result.candidates))throw new Error('Missing candidates.');
  const slugs=new Set(vehicles.map(vehicle=>vehicle.slug));const seen=new Set();
  return result.candidates.filter(candidate=>candidate&&typeof candidate==='object'&&slugs.has(candidate.slug)&&!seen.has(candidate.slug)&&seen.add(candidate.slug)).slice(0,3).map(candidate=>({slug:candidate.slug,confidence:typeof candidate.confidence==='number'&&Number.isFinite(candidate.confidence)?Math.min(1,Math.max(0,candidate.confidence)):0,features:(Array.isArray(candidate.features)?candidate.features:[]).filter(value=>typeof value==='string').slice(0,5).map(value=>value.slice(0,200))}));
}
