import { useEffect, useState } from 'react';
import { ask } from '../lib/data';

interface Reply { answer: string; provider: string; sources: string[] }

export default function Ask() {
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [slow, setSlow] = useState(false);
  const [reply, setReply] = useState<Reply | null>(null);
  const [error, setError] = useState('');

  // Render's free tier sleeps: show a friendly note if the first call is slow.
  useEffect(() => {
    if (!busy) { setSlow(false); return; }
    const t = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(t);
  }, [busy]);

  async function submit() {
    if (!q.trim() || busy) return;
    setBusy(true); setError(''); setReply(null);
    try { setReply(await ask(q.trim())); }
    catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong.'); }
    finally { setBusy(false); }
  }

  return (
    <div className="page">
      <h1>Ask Atelon</h1>
      <p className="muted">Answers come only from the verified data in the Garage. If we don't have it, we'll say so.</p>
      <div className="row">
        <input style={{ flex: 1, minWidth: 240 }} maxLength={500} placeholder="e.g. How much power does the Classic 350 make?" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
        <button className="btn primary" onClick={submit} disabled={busy}>{busy ? 'Thinking...' : 'Ask'}</button>
      </div>
      {slow && <p className="muted">Waking the AI, about 1 minute.</p>}
      {error && <div className="bubble">{error}</div>}
      {reply && (
        <div className="bubble">
          {reply.answer}
          {reply.sources.length > 0 && (
            <p className="muted" style={{ fontSize: 12 }}>
              Sources: {reply.sources.map((s, i) => <a key={s} href={s} target="_blank" rel="noreferrer">[{i + 1}] </a>)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
