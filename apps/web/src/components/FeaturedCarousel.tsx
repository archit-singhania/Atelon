import { vehicles } from '../lib/data';
import TiltCard from './TiltCard';
import TierBadge from './TierBadge';

export default function FeaturedCarousel() {
  const featured = vehicles.slice(0, 12);
  if (featured.length === 0) return null;
  return (
    <section className="page">
      <h2>Featured</h2>
      <div className="carousel">
        {featured.map((v) => (
          <div key={v.slug} className="slide">
            <TiltCard to={`/vehicle/${v.slug}`}>
              {v.poster && <img src={v.poster} alt={`${v.make} ${v.model}`} loading="lazy" style={{ width: '100%', borderRadius: 10 }} />}
              <TierBadge tier={v.tier} />
              <h3 style={{ marginTop: 10 }}>{v.make} {v.model}</h3>
              <small>{v.type}</small>
            </TiltCard>
          </div>
        ))}
      </div>
    </section>
  );
}
