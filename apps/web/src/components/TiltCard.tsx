import { useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

// Tilt-on-hover card; no tilt when reduced motion is requested.
export default function TiltCard({ to, children }: { to: string; children: ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const move = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || reduced) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
  };
  const leave = () => { if (ref.current) ref.current.style.transform = ''; };

  return (
    <Link ref={ref} to={to} className="card" onMouseMove={move} onMouseLeave={leave}>
      {children}
    </Link>
  );
}
