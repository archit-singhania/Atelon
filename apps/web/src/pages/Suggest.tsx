import { useSeo } from '../lib/useSeo';
import { SUGGEST_URL } from '../lib/site';

export default function Suggest() {
  useSeo('Suggest a vehicle | Atelon', 'Suggest a car or motorcycle for Atelon.');
  return (
    <div className="page">
      <h1>Suggest a vehicle</h1>
      <p>No account needed. Suggestions are reviewed by hand and added when we have sourced specs and, where possible, a licensed 3D model.</p>
      <p>Know of a CC0 or CC BY 3D model? Include the link and the license. If you made a model yourself, tell us and we can ask for your permission to credit and use it.</p>
      <a className="btn primary" href={SUGGEST_URL} target="_blank" rel="noreferrer">Open the suggestion form</a>
    </div>
  );
}
