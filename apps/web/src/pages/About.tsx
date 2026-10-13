import { useSeo } from '../lib/useSeo';
import { Link } from 'react-router-dom';
import { TAKEDOWN_EMAIL } from '../lib/site';

export default function About() {
  useSeo('About | Atelon', 'About Atelon, the independent AI vehicle atlas.');
  return (
    <div className="page">
      <h1>About Atelon</h1>
      <p>Atelon is an independent AI vehicle atlas for cars and motorcycles. Every spec links to a source, and every 3D model is labelled Full 3D, Reference 3D or Specs only.</p>
      <p>Atelon is not affiliated with, endorsed by or sponsored by any vehicle manufacturer.</p>

      <h2>Takedown requests</h2>
      <p>If you own something shown here and want it removed, email <a href={`mailto:${TAKEDOWN_EMAIL}`}>{TAKEDOWN_EMAIL}</a>. We aim to reply within a few days.</p>

      <p><Link to="/privacy">Privacy</Link> · <Link to="/terms">Terms</Link> · <Link to="/suggest">Suggest a vehicle</Link> · <Link to="/credits">Credits</Link></p>
    </div>
  );
}
