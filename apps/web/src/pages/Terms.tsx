import { useSeo } from '../lib/useSeo';
import { TAKEDOWN_EMAIL } from '../lib/site';

// DRAFT text for review by a lawyer or IP clinic. Not legal advice.
export default function Terms() {
  useSeo('Terms | Atelon', 'Terms of use for Atelon.');
  return (
    <div className="page">
      <h1>Terms of use (draft)</h1>
      <p>Atelon is provided as is. Specifications and descriptions may contain errors, and nothing here is advice on safety, legal matters or buying decisions.</p>
      <h2>Independence</h2>
      <p>Atelon is independent of all vehicle manufacturers. Names, logos and designs belong to their respective owners and are used only to identify vehicles.</p>
      <h2>3D models</h2>
      <p>Models are labelled Full 3D, Reference 3D or Specs only. Reference 3D models are approximations and are not the exact vehicle. Model creators are credited on the Credits page.</p>
      <h2>Takedown</h2>
      <p>If you own content shown here and want it removed, email <a href={`mailto:${TAKEDOWN_EMAIL}`}>{TAKEDOWN_EMAIL}</a>. We aim to reply within a few days.</p>
    </div>
  );
}
