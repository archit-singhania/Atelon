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
        <div className="row"><input aria-label="Sample search" placeholder="Search the garage" /><select aria-label="Sample filter"><option>All vehicles</option></select></div>
      </section>
      <section className="grid qa-grid">
        <article className="card"><p className="eyebrow">Full fidelity</p><h3>Vehicle surface</h3><TierBadge tier="full" /><p className="muted">Smoked or frosted material with a spectral edge.</p></article>
        <article className="card"><p className="eyebrow">Reference</p><h3>Disclosure state</h3><TierBadge tier="reference" /><p className="muted">Clearly communicates an approximate asset.</p></article>
        <article className="card"><p className="eyebrow">Data first</p><h3>Specifications</h3><TierBadge tier="specs-only" /><p className="muted">Useful even when no reusable model exists.</p></article>
      </section>
      <section className="glass-panel"><h2>Status language</h2><div className="notice success">Verified and ready to publish.</div><div className="notice warning">License review still required.</div><div className="notice error">This asset could not be loaded.</div></section>
    </div>
  );
}
