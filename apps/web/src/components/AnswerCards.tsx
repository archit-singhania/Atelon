import { Link } from 'react-router-dom';
import { bySlug } from '../lib/data';
export default function AnswerCards({slugs,ask,disabled}:{slugs:string[];ask:(question:string)=>void;disabled:boolean}) {
  return <div className="answer-cards">{slugs.slice(0,2).map(slug=>{const v=bySlug(slug);return v?<section className="glass-thin" key={slug}><Link to={`/vehicle/${slug}`}><img src={v.posterSmall} alt="" loading="lazy"/><strong>{v.make} {v.model}</strong></Link><small>{v.generation} · {v.tier}</small><button disabled={disabled} onClick={()=>ask(`What sourced power and weight information is available for ${v.make} ${v.model}?`)}>Explore engineering →</button></section>:null})}</div>;
}
