import { useEffect, useState } from 'react';

// Illustrative chat animation. Wording is about how Atelon behaves; it contains no vehicle figures.
const Q = 'Is this the exact vehicle?';
const A = 'This is a Reference 3D model: a labelled stand-in, not the exact vehicle. I can still share the sourced specs.';

export default function ChatDemo() {
  const [n, setN] = useState(0);
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (reduced) { setN(A.length); return; }
    const t = setInterval(() => setN((x) => (x >= A.length + 40 ? 0 : x + 1)), 45);
    return () => clearInterval(t);
  }, [reduced]);

  return (
    <section className="page">
      <h2>Ask anything, get sourced answers</h2>
      <div className="bubble">{Q}</div>
      <div className="bubble" style={{ borderColor: 'var(--accent)' }}>{A.slice(0, n)}</div>
      <small className="muted">Example conversation.</small>
    </section>
  );
}
