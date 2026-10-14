import credits from '../data/credits.json';

export default function Credits() {
  const credited = credits as Array<{ vehicle_slug: string; source_url: string; creator: string; license: string; attribution_line: string }>;
  return (
    <div className="page">
      <h1>Credits and licences</h1>
      <p className="muted">This page is generated from Atelon’s asset ledger. The current showcase uses owner-supplied reference files; creator and marketplace provenance has not been independently verified.</p>
      {credited.length === 0 ? (
        <p className="muted">No third-party 3D models yet.</p>
      ) : (
        <table>
          <tbody>
            {credited.map((row) => (
              <tr key={row.vehicle_slug}><th>{row.vehicle_slug.replaceAll('-', ' ')}</th><td>{/^https?:/.test(row.source_url) ? <a href={row.source_url} target="_blank" rel="noreferrer">{row.attribution_line}</a> : row.attribution_line}</td><td><span className="badge">{row.license}</span></td></tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="muted" style={{ marginTop: 24 }}>Vehicle names and brands belong to their owners. Atelon is independent of all manufacturers.</p>
    </div>
  );
}
