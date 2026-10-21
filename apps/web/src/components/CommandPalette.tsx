import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehicles } from '../lib/data';

const routes = [{ label: 'Open Garage', path: '/garage' }, { label: 'Compare vehicles', path: '/compare' }, { label: 'Ask Atelon AI', path: '/ask' }, { label: 'View credits', path: '/credits' }];

export default function CommandPalette() {
  const [open, setOpen] = useState(false); const [query, setQuery] = useState(''); const navigate = useNavigate(); const input = useRef<HTMLInputElement>(null);
  useEffect(() => { const onKey = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setOpen((value) => !value); } if (event.key === 'Escape') setOpen(false); }; addEventListener('keydown', onKey); return () => removeEventListener('keydown', onKey); }, []);
  useEffect(() => { if (open) requestAnimationFrame(() => input.current?.focus()); }, [open]);
  const items = useMemo(() => [...routes, ...vehicles.map((vehicle) => ({ label: `${vehicle.make} ${vehicle.model}`, path: `/vehicle/${vehicle.slug}` }))].filter((item) => item.label.toLowerCase().includes(query.toLowerCase())).slice(0, 9), [query]);
  const go = (path: string) => { setOpen(false); setQuery(''); const transition = (document as Document & { startViewTransition?: (callback: () => void) => void }).startViewTransition; transition ? transition(() => navigate(path)) : navigate(path); };
  return <><button className="command-trigger" type="button" onClick={() => setOpen(true)} aria-label="Open command palette">⌕ <span>Search</span><kbd>⌘K</kbd></button>{open && <div className="command-scrim" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}><div className="command-palette glass-dense" role="dialog" aria-modal="true" aria-label="Navigate Atelon"><input ref={input} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search vehicles, pages, and actions…" aria-label="Command search" /><div>{items.map((item) => <button key={item.path} type="button" onClick={() => go(item.path)}><span>{item.label}</span><span>↗</span></button>)}</div>{!items.length && <p className="muted">No matching destination.</p>}</div></div>}</>;
}
