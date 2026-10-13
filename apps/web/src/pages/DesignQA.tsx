import TierBadge from '../components/TierBadge';

export default function DesignQA() {
  return (
    <div className="page qa-page">
      <p className="eyebrow">Internal visual QA</p>
      <h1>Liquid glass system</h1>
      <p className="lede">Theme, type, depth, controls, states and responsive behavior in one place.</p>
      <section className="glass-panel stack">
        <h2>Controls</h2>
        <div className="row"><button className="btn primary">Primary action</button><button className="btn ghost">Secondary</button><button className="btn ghost" disabled>Disabled</button></div>
        <div className="row"><input aria-label="Sample search" placeholder="Search the garage" /><select aria-label="Sample filter"><option>All vehicles</option></select><span className="badge full">Full 3D</span><span className="badge reference">Reference 3D</span><span className="badge">Specs only</span></div>
      </section>
      <section className="grid qa-grid">
        <article className="card"><p className="eyebrow">Full fidelity</p><h3>Vehicle surface</h3><TierBadge tier="full" /><p className="muted">Smoked or frosted material with a spectral edge.</p></article>
        <article className="card"><p className="eyebrow">Reference</p><h3>Disclosure state</h3><TierBadge tier="reference" /><p className="muted">Clearly communicates an approximate asset.</p></article>
        <article className="card"><p className="eyebrow">Data first</p><h3>Specifications</h3><TierBadge tier="specs-only" /><p className="muted">Useful even when no reusable model exists.</p></article>
      </section>
      <section className="glass-panel"><h2>Status language</h2><div className="notice success">Verified and ready to publish.</div><div className="notice warning">License review still required.</div><div className="notice error">This asset could not be loaded.</div></section>
      <section className="qa-grid qa-two-column">
        <article className="glass-panel qa-surface"><p className="eyebrow">Messaging</p><h2>Support states</h2><div className="message-row assistant"><div className="message-avatar"><img src="/icons/icon-192.png" alt="" /></div><div className="message"><p>Verified answers keep their sources and confidence visible.</p><div className="message-meta">Grounded response</div></div></div><div className="message-row user"><div className="message"><p>Compare the available vehicles.</p></div></div><div className="message-row assistant"><div className="message-avatar"><img src="/icons/icon-192.png" alt="" /></div><div className="message typing" aria-label="Atelon is responding"><i /><i /><i /></div></div></article>
        <article className="glass-panel qa-surface"><p className="eyebrow">Overlays</p><h2>Dialog and sheet</h2><div className="qa-dialog" role="group" aria-label="Example confirmation dialog"><strong>Open 3D showroom?</strong><p className="muted">The model loads only after you choose to continue.</p><div className="row"><button className="btn primary">Continue</button><button className="btn ghost">Not now</button></div></div><div className="qa-sheet"><span className="qa-sheet-handle" /><strong>Mobile bottom sheet</strong><p className="muted">Filters remain reachable on compact screens.</p></div></article>
      </section>
    </div>
  );
}
