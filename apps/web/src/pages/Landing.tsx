import { lazy, Suspense, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { vehicles } from '../lib/data';
import { useSeo } from '../lib/useSeo';
import FeaturedCarousel from '../components/FeaturedCarousel';
import SpecRace from '../components/SpecRace';
import ChatDemo from '../components/ChatDemo';

const ModelViewer = lazy(() => import('../components/ModelViewer'));

export default function Landing() {
  useSeo('Atelon - every machine in 3D', 'Atelon is an AI vehicle atlas for cars and motorcycles, with honest 3D labels and sourced specs.');
  const withModels = vehicles.filter((v) => v.tier !== 'specs-only' && v.model3d);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (withModels.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % withModels.length), 8000);
    return () => clearInterval(t);
  }, [withModels.length]);

  const current = withModels[i];

  return (
    <>
      <section className="hero">
        <div>
          <div className="viewer">
            {current?.model3d ? (
              <Suspense fallback={<div className="placeholder">Loading 3D...</div>}>
                <ModelViewer key={current.slug} url={current.model3d.glb} poster={current.poster} scrollRotate />
              </Suspense>
            ) : (
              <div className="placeholder">3D showroom opens once the first licensed models are added.</div>
            )}
          </div>
          <h1>Every machine. In 3D.</h1>
          <p>Atelon is an AI vehicle atlas for cars and motorcycles, with honest labels on every model and a source for every number.</p>
          <Link to="/garage" className="btn primary">Explore the Garage</Link>
          <Link to="/ask" className="btn ghost">Ask the AI</Link>
        </div>
      </section>

      <FeaturedCarousel />
      <SpecRace />

      <section className="page">
        <h2>Honest by design</h2>
        <p className="muted">Every vehicle shows how much we can stand behind its 3D model.</p>
        <div className="tiers">
          <div className="card glass"><span className="badge full">Full 3D</span><p>The exact vehicle model, with verified permissions and credit.</p></div>
          <div className="card glass"><span className="badge reference">Reference 3D</span><p>A clearly labelled representative model. Never passed off as the exact vehicle.</p></div>
          <div className="card glass"><span className="badge">Specs only</span><p>Complete, sourced information when no suitable 3D model exists.</p></div>
        </div>
      </section>

      <ChatDemo />
    </>
  );
}
