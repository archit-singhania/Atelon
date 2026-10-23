import { useSeo } from '../lib/useSeo';
import { TAKEDOWN_EMAIL } from '../lib/site';

// DRAFT text for review by a lawyer or IP clinic. Not legal advice.
export default function Privacy() {
  useSeo('Privacy | Atelon', 'How Atelon handles data.');
  return (
    <div className="page">
      <h1>Privacy notice (draft)</h1>
      <p>Anonymous browsing is available. Preferences, saved vehicles, research snapshots and drafts may be stored on this device. Optional Supabase accounts use an email address or configured sign-in provider; cloud synchronization stores the research you choose to upload. No sale of personal data is intended.</p>
      <h2>Ask Atelon</h2>
      <p>The text you type is sent to our server and may be forwarded to third-party AI providers (Hugging Face, Groq or Cloudflare) to generate an answer. Do not include personal information in questions. Your IP address is used briefly for rate limiting.</p>
      <h2>Photos, audio and research sharing</h2>
      <p>Photo previews remain local until you explicitly request identification. When configured, identification sends the selected photo through the API to the configured vision provider. This application does not persist the photo; the provider may apply separate retention rules. Avoid images containing personal information. Local audio previews and narration are not uploaded.</p>
      <p>Cloud room participants can see shared vehicle views and notes. Invitation holders can join after sign-in; keep invitations private. Contributions are visible to their author and authorized reviewers. Research dossier exports may include personal notes or bookmarks when selected.</p>
      <h2>Service diagnostics</h2><p>The application may send a fixed diagnostic category for a failed model or slow screen. These events contain no page URL, prompt, account identity or error text. Counts are held in API process memory and reset on restart. Do Not Track is respected. Hosting access logs and rate limiting may still process connection information.</p><h2>Export and deletion</h2>
      <p>Authenticated application-data export and deletion endpoints are available. Clearing browser storage removes local-only data. Application-data deletion does not remove the Supabase Auth identity, and administrative audit retention requires a separate policy. Hosting, provider retention, identity deletion and contact details must be finalized before launch.</p>
      <h2>Contact</h2>
      <p>Questions or removal requests: <a href={`mailto:${TAKEDOWN_EMAIL}`}>{TAKEDOWN_EMAIL}</a>.</p>
    </div>
  );
}
