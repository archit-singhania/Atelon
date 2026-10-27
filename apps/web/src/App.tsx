import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
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
import OfflineNotice from './components/OfflineNotice';
import NotFound from './pages/NotFound';
import PwaControls from './components/PwaControls';
import CommandPalette from './components/CommandPalette';
import MobileNav from './components/MobileNav';
import Admin from './pages/Admin';
import Account from './pages/Account';
import SharedCollection from './pages/SharedCollection';
import Research from './pages/Research';
import NavigationMotion from './components/NavigationMotion';
import CollectionSharing from './components/CollectionSharing';
import GenerationExplorer from './components/GenerationExplorer';
import ComparisonInsights from './components/ComparisonInsights';
import ResearchOrganization, { SaveComparison } from './components/ResearchOrganization';
import { ComparisonShareStudio } from './components/ShareStudio';
import ModerationQueue from './components/ModerationQueue';
import { features } from './lib/features';
import AmbientMotion from './components/AmbientMotion';
const PosterStudio = lazy(() => import('./pages/PosterStudio'));
const SpatialBackdrop = lazy(() => import('./components/SpatialBackdrop'));
const Atlas = lazy(() => import('./features/atlas/Atlas'));

export default function App() {
  const location = useLocation();
  const [spatialReady, setSpatialReady] = useState(false);
  useEffect(() => { const timer = window.setTimeout(() => setSpatialReady(true), 900); return () => window.clearTimeout(timer); }, []);
  if (location.pathname.startsWith('/poster-studio/')) {
    return <Suspense fallback={null}><Routes><Route path="/poster-studio/:slug" element={<PosterStudio />} /></Routes></Suspense>;
  }
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <OfflineNotice />
      <NavigationMotion />
      <AmbientMotion />
      <PwaControls />
      <div className="spatial-backdrop spatial-static" aria-hidden="true" />
      {features.spatialBackdrop && spatialReady && <Suspense fallback={null}><SpatialBackdrop /></Suspense>}
      <header className="nav-wrap">
        <div className="nav glass-panel">
        <Link to="/" className="brand" aria-label="Atelon home">
          <img className="brand-logo brand-logo-dark" src="/brand/atelon-wordmark-dark.webp" alt="" />
          <img className="brand-logo brand-logo-light" src="/brand/atelon-wordmark-light.webp" alt="" />
        </Link>
        <nav>
          <NavLink to="/garage">Garage</NavLink>
          <NavLink to="/compare">Compare</NavLink>
          <NavLink to="/atlas">Atlas</NavLink>
          <NavLink to="/ask">Ask AI</NavLink>
          <NavLink to="/credits">Credits</NavLink>
          <NavLink to="/about">About</NavLink>
          {features.accounts && <NavLink to="/account">My Garage</NavLink>}
        </nav>
        <ThemeToggle />
        <CommandPalette />
        </div>
      </header>
      <main id="main-content" className="route-stage" key={location.pathname}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/garage" element={<Garage />} />
          <Route path="/atlas" element={<Suspense fallback={<p role="status">Preparing atlas…</p>}><Atlas /></Suspense>} />
          <Route path="/atlas/:feature" element={<Suspense fallback={<p role="status">Preparing workspace…</p>}><Atlas /></Suspense>} />
          <Route path="/vehicle/:slug" element={<><VehicleDetail /><GenerationExplorer /></>} />
          <Route path="/compare" element={<><Compare /><SaveComparison /><ComparisonInsights /><ComparisonShareStudio /></>} />
          <Route path="/ask" element={<Ask />} />
          <Route path="/shared/collection" element={<SharedCollection />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/suggest" element={<Suggest />} />
          <Route path="/design-system" element={<DesignQA />} />
          <Route path="/research" element={<><Research />{!location.search.includes('share=') && <div className="page"><ResearchOrganization /><CollectionSharing /></div>}</>} />
          {features.catalogueStudio && <Route path="/admin" element={<><Admin /><ModerationQueue /></>} />}
          {features.accounts && <Route path="/account" element={<Account />} />}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <MobileNav />
      <footer className="foot">
        Atelon is independent of all vehicle manufacturers. All brand names belong to their owners.
        <div><Link to="/research">Research workspace</Link> · <Link to="/privacy">Privacy</Link> · <Link to="/terms">Terms</Link> · <Link to="/suggest">Suggest</Link></div>
      </footer>
    </>
  );
}
