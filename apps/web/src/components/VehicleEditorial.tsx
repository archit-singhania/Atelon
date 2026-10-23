import type { Vehicle } from '../types';
const stories:Record<string,{layout:string;title:string;focus:string;detail:string}>={
 'delorean-dmc-12-time-machine':{layout:'cinema',title:'A familiar shape. An extraordinary story.',focus:'The road car beneath the fiction',detail:'Read the production-car specifications separately from the film-inspired visual treatment.'},
 'gmc-sierra-1500-at4x':{layout:'expedition',title:'Presence, with purpose.',focus:'The working end of luxury',detail:'Start with the recorded powertrain, then explore the hardware and configuration.'},
 'lamborghini-countach-5000qv':{layout:'wedge',title:'An unmistakable point of view.',focus:'Study the architecture',detail:'Explore the relationship between the silhouette, the engine and the recorded generation.'},
 'mahindra-thar-4x4':{layout:'field',title:'Built around the journey.',focus:'A machine in context',detail:'Keep the specific powertrain and generation in view as you explore this reference model.'},
 'mazda-furai':{layout:'concept',title:'An idea, given form.',focus:'Read the concept record',detail:'Explore the recorded concept specifications without treating them as a production-car promise.'},
 'nissan-skyline-r34-brians':{layout:'technical',title:'An icon, under the surface.',focus:'Engineering before mythology',detail:'The visual treatment and the sourced road-car record tell different parts of the story.'},
 'plymouth-hemi-cuda-1971':{layout:'heritage',title:'An era with a signature.',focus:'The original record',detail:'Read period figures with their original definitions and source context intact.'},
 'porsche-911-carrera-4s':{layout:'openair',title:'A different perspective on the 911.',focus:'Explore the Cabriolet',detail:'Follow the generation, drivetrain and sourced performance figures together.'},
 'porsche-911-930-turbo-1975':{layout:'archive',title:'The beginning of a lineage.',focus:'Return to the source',detail:'Explore the original Turbo record through its specifications and generation context.'}
};
export default function VehicleEditorial({vehicle}:{vehicle:Vehicle}) {
 const story=stories[vehicle.slug]||{layout:'archive',title:vehicle.model,focus:'The vehicle record',detail:'Explore the sourced specifications.'};
 const highlights=vehicle.specs.filter(s=>/power|engine|layout|torque/i.test(s.key)).slice(0,2);
 return <section id="story" className={`vehicle-editorial editorial-${story.layout}`} aria-label={`${vehicle.make} ${vehicle.model} story`}>
   <header><p className="eyebrow">{vehicle.generation} · {vehicle.years[0]}</p><h2>{story.title}</h2></header>
   <figure><img src={vehicle.poster} alt={`${vehicle.make} ${vehicle.model} reference visualization`} loading="lazy"/><figcaption>{vehicle.tier==='reference'?'Reference visualization · not a dimensional digital twin':`${vehicle.tier} visualization`}</figcaption></figure>
   <div className="editorial-narrative"><p className="eyebrow">{story.focus}</p><p className="editorial-summary">{vehicle.summary}</p><p className="muted">{story.detail}</p><a className="btn ghost" href="#specifications">Read the engineering ↓</a></div>
   <div className="editorial-evidence">{highlights.map(s=><a key={s.key} href={s.source} target="_blank" rel="noreferrer"><small>{s.key}</small><strong>{String(s.value)} {s.unit}</strong><span>Explore source ↗</span></a>)}</div>
 </section>;
}
