import { Link, NavLink, Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing';
import Garage from './pages/Garage';
import VehicleDetail from './pages/VehicleDetail';
import Compare from './pages/Compare';
import Ask from './pages/Ask';
import Credits from './pages/Credits';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Suggest from './pages/Suggest';
import DesignQA from './pages/DesignQA';
import ThemeToggle from './components/ThemeToggle';

export default function App() {
  return (
    <>
      <header className="nav-wrap">
        <div className="nav glass-panel">
        <Link to="/" className="brand" aria-label="Atelon home">
          <img className="brand-logo brand-logo-dark" src="/brand/atelon-wordmark-dark.webp" alt="" />
          <img className="brand-logo brand-logo-light" src="/brand/atelon-wordmark-light.webp" alt="" />
        </Link>
        <nav>
          <NavLink to="/garage">Garage</NavLink>
          <NavLink to="/compare">Compare</NavLink>
          <NavLink to="/ask">Ask AI</NavLink>
          <NavLink to="/credits">Credits</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>
        <ThemeToggle />
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/garage" element={<Garage />} />
          <Route path="/vehicle/:slug" element={<VehicleDetail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/ask" element={<Ask />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/suggest" element={<Suggest />} />
          <Route path="/design-system" element={<DesignQA />} />
          <Route path="*" element={<div className="page"><h1>Not found</h1><Link to="/garage">Back to the Garage</Link></div>} />
        </Routes>
      </main>
      <footer className="foot">
        Atelon is independent of all vehicle manufacturers. All brand names belong to their owners.
        <div><Link to="/privacy">Privacy</Link> · <Link to="/terms">Terms</Link> · <Link to="/suggest">Suggest</Link></div>
      </footer>
    </>
  );
}
