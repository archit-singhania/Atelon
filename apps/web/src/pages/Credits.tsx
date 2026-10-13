import { vehicles } from '../lib/data';

export default function Credits() {
  const credited = vehicles.filter((v) => v.model3d?.credit);
  return (
    <div className="page">
      <h1>Credits and licences</h1>
      <p className="muted">3D models are used under CC0 or CC BY licences. Thank you to the creators.</p>
      {credited.length === 0 ? (
        <p className="muted">No third-party 3D models yet.</p>
      ) : (
        <table>
          <tbody>
            {credited.map((v) => (
              <tr key={v.slug}><th>{v.make} {v.model}</th><td>{v.model3d!.credit}</td></tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="muted" style={{ marginTop: 24 }}>Vehicle names and brands belong to their owners. Atelon is independent of all manufacturers.</p>
    </div>
  );
}
