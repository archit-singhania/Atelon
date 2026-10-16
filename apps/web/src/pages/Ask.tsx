import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ask, bySlug, vehicles } from '../lib/data';
import { useSeo } from '../lib/useSeo';

interface Reply { answer: string; provider: string; sources: string[]; matchedVehicles: string[]; fallback: boolean; fallbackReason?: string | null; retryable?: boolean; attemptedProviders?: string[] }
interface Message { id: number; role: 'assistant' | 'user'; text: string; reply?: Reply; error?: boolean; retryText?: string }

const welcome: Message = { id: 1, role: 'assistant', text: 'Hi, I’m Atelon AI. I can help you explore vehicles, compare verified specifications, and explain each 3D confidence tier. What would you like to know?' };
const suggestions = [`Tell me about the ${vehicles[0].make} ${vehicles[0].model}`, `Compare the ${vehicles[1].make} ${vehicles[1].model} and ${vehicles[2].make} ${vehicles[2].model}`, 'How do Full 3D and Reference 3D differ?'];

export default function Ask() {
  useSeo('Ask Atelon | Vehicle help desk', 'Chat with the Atelon vehicle help desk using verified Garage data.');
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [slow, setSlow] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => { try { const saved = localStorage.getItem('atelon-chat-v1'); return saved ? JSON.parse(saved) : [welcome]; } catch { return [welcome]; } });
  const nextId = useRef(Math.max(1, ...messages.map((message) => message.id)) + 1);
  const [online, setOnline] = useState(() => navigator.onLine);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [messages, slow]);
  useEffect(() => { try { localStorage.setItem('atelon-chat-v1', JSON.stringify(messages.slice(-40))); } catch { /* storage can be unavailable */ } }, [messages]);
  useEffect(() => { const update = () => setOnline(navigator.onLine); addEventListener('online', update); addEventListener('offline', update); return () => { removeEventListener('online', update); removeEventListener('offline', update); }; }, []);
  useEffect(() => {
    if (!busy) { setSlow(false); return; }
    const timer = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(timer);
  }, [busy]);

  async function submit(text = q) {
    const question = text.trim();
    if (!question || busy) return;
    setMessages((items) => [...items, { id: nextId.current++, role: 'user', text: question }]);
    setQ(''); setBusy(true);
    try {
      const reply = await ask(question);
      setMessages((items) => [...items, { id: nextId.current++, role: 'assistant', text: reply.answer, reply }]);
    } catch (error) {
      setMessages((items) => [...items, { id: nextId.current++, role: 'assistant', text: error instanceof Error ? error.message : 'I couldn’t reach the help desk just now. Please try again.', error: true, retryText: question }]);
    } finally { setBusy(false); }
  }

  return (
    <div className="page help-page">
      <div className="help-shell glass-panel">
        <aside className="help-sidebar" aria-label="Atelon AI help topics">
          <div className="support-brand"><img src="/icons/icon-192.png" alt="" /><div><strong>Atelon Help</strong><span>Vehicle support</span></div></div>
          <nav>
            <a className="active" href="#conversation">Ask Atelon AI <span>›</span></a>
            <a href="/garage">Browse the Garage <span>›</span></a>
            <a href="/compare">Compare vehicles <span>›</span></a>
            <a href="/credits">Model licences <span>›</span></a>
          </nav>
          <div className="support-trust"><span className="status-dot" />Grounded in verified Garage data</div>
        </aside>

        <section className="conversation" id="conversation">
          <header className="conversation-header">
            <div className="agent-avatar"><img src="/icons/icon-192.png" alt="" /></div>
            <div><h1>Ask Atelon</h1><p><span className="status-dot" /> AI vehicle help desk</p></div>
            <button className="clear-chat" type="button" onClick={() => { localStorage.removeItem('atelon-chat-v1'); setMessages([{ id: nextId.current++, role: 'assistant', text: 'Conversation cleared. How can I help with your next vehicle question?' }]); }}>New chat</button>
          </header>

          <div className="message-log" role="log" aria-live="polite" aria-relevant="additions">
            <div className="chat-day"><span>Today</span></div>
            {messages.map((message) => (
              <article className={`message-row ${message.role}`} key={message.id}>
                {message.role === 'assistant' && <div className="message-avatar"><img src="/icons/icon-192.png" alt="Atelon AI" /></div>}
                <div className={`message ${message.error ? 'error' : ''}`}>
                  <p>{message.text}</p>
                  {message.reply && <div className="message-meta">{message.reply.fallback ? `Verified-data fallback${message.reply.fallbackReason ? ` · ${message.reply.fallbackReason}` : ''}` : `Answered by ${message.reply.provider}`}</div>}
                  {!!message.reply?.matchedVehicles.length && <div className="vehicle-chips">{message.reply.matchedVehicles.map((slug) => { const vehicle = bySlug(slug); return <Link key={slug} to={`/vehicle/${slug}`}>{vehicle ? `${vehicle.make} ${vehicle.model}` : slug}</Link>; })}</div>}
                  {!!message.reply?.sources.length && <div className="message-sources">Sources {message.reply.sources.map((source) => { const label = (() => { try { return new URL(source).hostname.replace(/^www\./, ''); } catch { return 'Source'; } })(); return <a key={source} href={source} target="_blank" rel="noreferrer">{label} ↗</a>; })}</div>}
                  <div className="message-actions"><button type="button" onClick={() => navigator.clipboard?.writeText(message.text)}>Copy</button>{message.retryText && <button type="button" onClick={() => submit(message.retryText)}>Retry</button>}</div>
                </div>
              </article>
            ))}
            {busy && <article className="message-row assistant"><div className="message-avatar"><img src="/icons/icon-192.png" alt="" /></div><div className="message typing"><i /><i /><i /></div></article>}
            {slow && <p className="wake-note">The help desk is waking up. This can take about a minute on the free service.</p>}
            <div ref={end} />
          </div>

          {messages.length === 1 && <div className="suggestion-row">{suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => submit(suggestion)}>{suggestion}</button>)}</div>}
          <div className="composer-wrap">
            {!online && <div className="composer-offline">You’re offline. Saved conversations remain available; sending will resume when you reconnect.</div>}
            <div className="composer">
              <textarea aria-label="Message Atelon AI" rows={1} maxLength={500} placeholder="Message Atelon AI…" value={q} onChange={(event) => setQ(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit(); } }} />
              <button type="button" aria-label="Send message" onClick={() => submit()} disabled={busy || !q.trim() || !online}>↑</button>
            </div>
            <small>Atelon can make mistakes. Verify important details using the linked sources.</small>
          </div>
        </section>
      </div>
    </div>
  );
}
