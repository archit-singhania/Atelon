import { useSeo } from '../lib/useSeo';
import { TAKEDOWN_EMAIL } from '../lib/site';

// DRAFT text for review by a lawyer or IP clinic. Not legal advice.
export default function Privacy() {
  useSeo('Privacy | Atelon', 'How Atelon handles data.');
  return (
    <div className="page">
      <h1>Privacy notice (draft)</h1>
      <p>Atelon has no accounts and does not ask for personal information. We use cookie-free analytics, if any, and do not sell data.</p>
      <h2>Ask Atelon</h2>
      <p>The text you type is sent to our server and may be forwarded to third-party AI providers (Hugging Face, Groq or Cloudflare) to generate an answer. Do not include personal information in questions. Your IP address is used briefly for rate limiting.</p>
      <h2>Contact</h2>
      <p>Questions or removal requests: <a href={`mailto:${TAKEDOWN_EMAIL}`}>{TAKEDOWN_EMAIL}</a>.</p>
    </div>
  );
}
