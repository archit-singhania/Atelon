import { Link } from 'react-router-dom';
import { useSeo } from '../lib/useSeo';

export default function NotFound() {
  useSeo('Page not found | Atelon', 'The requested Atelon page could not be found.');
  return <div className="page empty-state"><p className="eyebrow">404</p><h1>That road ends here.</h1><p className="muted">The page may have moved, or the address may be incomplete.</p><Link className="btn primary" to="/garage">Explore the Garage</Link><Link className="btn ghost" to="/">Return home</Link></div>;
}
