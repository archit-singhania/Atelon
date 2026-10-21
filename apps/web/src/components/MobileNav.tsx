import { NavLink } from 'react-router-dom';
export default function MobileNav() { return <nav className="mobile-nav glass-dense" aria-label="Mobile navigation"><NavLink to="/">⌂<span>Home</span></NavLink><NavLink to="/garage">◇<span>Garage</span></NavLink><NavLink to="/compare">⇄<span>Compare</span></NavLink><NavLink to="/ask">✦<span>Ask</span></NavLink></nav>; }
