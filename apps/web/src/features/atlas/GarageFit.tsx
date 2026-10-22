import { lazy,Suspense,useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { vehicles,bySlug } from '../../lib/data';
import { dimensionRecord,vehicleName } from './shared';
import { downloadText } from '../../lib/research';
const ArButton=lazy(()=>import('../../components/ArButton'));
const clamp=(value:string|null,fallback:number,min:number,max:number)=>value!==null&&value.trim()&&Number.isFinite(Number(value))?Math.min(max,Math.max(min,Number(value))):fallback;
export default function GarageFit(){
 const [params,setParams]=useSearchParams();const [notice,setNotice]=useState('');
 const vehicle=bySlug(params.get('vehicle')||'')||vehicles.find(vehicle=>dimensionRecord(vehicle))||vehicles[0];
 const length=clamp(params.get('l'),6,1,30),width=clamp(params.get('w'),3,1,20),height=clamp(params.get('h'),2.5,1,10),clearance=clamp(params.get('c'),.35,0,2),rotate=params.get('r')==='1';
 const dimensions=dimensionRecord(vehicle);const carL=dimensions?(rotate?dimensions.width:dimensions.length):0,carW=dimensions?(rotate?dimensions.length:dimensions.width):0;
 const fit=Boolean(dimensions&&carL+clearance*2<=length&&carW+clearance*2<=width&&dimensions.height<=height);
 const maxL=Math.max(length,carL+clearance*2),maxW=Math.max(width,carW+clearance*2);const scale=Math.min(480/maxL,300/maxW);
 const x=60+(maxL-length)*scale/2,y=40+(maxW-width)*scale/2;
 function change(key:string,value:string){const next=new URLSearchParams(params);next.set(key,value);setParams(next,{replace:true});}
 const setup={vehicle:vehicle.slug,space:{length,width,height},clearance,rotate,dimensions,assessment:dimensions?(fit?'recorded-envelope-fits':'clearance-exceeded'):'insufficient-data',createdAt:new Date().toISOString()};
 return <section className="atlas-panel">
  <label>Vehicle<select value={vehicle.slug} onChange={event=>change('vehicle',event.target.value)}>{vehicles.map(item=><option key={item.slug} value={item.slug}>{vehicleName(item)}{dimensionRecord(item)?' · sourced dimensions':''}</option>)}</select></label>
  <div className="atlas-two-column"><div>
   <label>Space length (m)<input type="number" min="1" max="30" step=".1" value={length} onChange={event=>change('l',event.target.value)}/></label>
   <label>Space width (m)<input type="number" min="1" max="20" step=".1" value={width} onChange={event=>change('w',event.target.value)}/></label>
   <label>Space height (m)<input type="number" min="1" max="10" step=".1" value={height} onChange={event=>change('h',event.target.value)}/></label>
   <label>Planning clearance per side (m)<input type="number" min="0" max="2" step=".05" value={clearance} onChange={event=>change('c',event.target.value)}/></label>
   <label><input type="checkbox" checked={rotate} onChange={event=>change('r',event.target.checked?'1':'0')}/> Rotate envelope 90°</label>
  </div><div>{dimensions?<>
   <svg viewBox="0 0 600 420" className="atlas-graph" role="img" aria-label="Metre-scale garage envelope">
    <rect x={x} y={y} width={length*scale} height={width*scale} fill="none" stroke="currentColor" strokeWidth="3"/>
    <rect x={x+(length-carL-clearance*2)*scale/2} y={y+(width-carW-clearance*2)*scale/2} width={(carL+clearance*2)*scale} height={(carW+clearance*2)*scale} fill="none" stroke={fit?'var(--accent)':'var(--error)'} strokeDasharray="8 5"/>
    <rect x={x+(length-carL)*scale/2} y={y+(width-carW)*scale/2} width={carL*scale} height={carW*scale} rx="10" fill="var(--accent-glow)" stroke="var(--accent)"/>
    <text x="60" y="390">{dimensions.length} × {dimensions.width} m vehicle envelope</text>
   </svg>
   <h3>{fit?'Recorded envelope fits the entered space':'Recorded envelope exceeds the entered space or clearance budget'}</h3>
   <p>Remaining length: {(length-carL).toFixed(2)} m · width: {(width-carW).toFixed(2)} m · height: {(height-dimensions.height).toFixed(2)} m</p>
   <a href={dimensions.source} target="_blank" rel="noreferrer">Dimension source ↗</a>
  </>:<p>Complete sourced dimensions are missing; no fit calculation is made.</p>}
  <p className="atlas-status">A planning envelope, not a parking safety guarantee. Mirrors, door arcs, obstacles, measurement error and access requirements need separate assessment. Floor plan and height are checked separately.</p></div></div>
  <div className="atlas-toolbar"><button className="btn ghost" onClick={()=>navigator.clipboard.writeText(window.location.href).then(()=>setNotice('Fit setup link copied.')).catch(()=>setNotice('Copy the URL from the address bar.'))}>Copy fit setup</button><button className="btn ghost" onClick={()=>downloadText('atelon-garage-fit.json',JSON.stringify(setup,null,2),'application/json')}>Export fit assessment</button></div>
  <p role="status">{notice}</p>
  {vehicle.model3d?.calibration?.metersPerUnit===1?<Suspense fallback={<p>Preparing AR…</p>}><ArButton glb={vehicle.model3d.glb} name={vehicleName(vehicle)}/></Suspense>:<p>True-scale AR is unavailable until the published GLB has reviewed metre-scale calibration.</p>}
 </section>;
}
