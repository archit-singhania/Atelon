import { useEffect, useRef, useState } from 'react';
import { ask } from '../lib/data';
import { useSeo } from '../lib/useSeo';

interface Reply { answer: string; provider: string; sources: string[]; matchedVehicles: string[]; fallback: boolean }
interface Message { id: number; role: 'assistant' | 'user'; text: string; reply?: Reply; error?: boolean }

const suggestions = ['What can I explore in Atelon?', 'How do Full 3D and Reference 3D differ?', 'Compare two vehicles from the Garage'];

export default function Ask() {
  useSeo('Ask Atelon | Vehicle help desk', 'Chat with the Atelon vehicle help desk using verified Garage data.');
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [slow, setSlow] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ id: 1, role: 'assistant', text: 'Hi, I’m Atelon AI. I can help you explore vehicles, compare verified specifications, and explain each 3D confidence tier. What would you like to know?' }]);
  const nextId = useRef(2);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [messages, slow]);
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
      setMessages((items) => [...items, { id: nextId.current++, role: 'assistant', text: error instanceof Error ? error.message : 'I couldn’t reach the help desk just now. Please try again.', error: true }]);
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
            <button className="clear-chat" type="button" onClick={() => setMessages([{ id: nextId.current++, role: 'assistant', text: 'Conversation cleared. How can I help with your next vehicle question?' }])}>New chat</button>
          </header>

          <div className="message-log" role="log" aria-live="polite" aria-relevant="additions">
            <div className="chat-day"><span>Today</span></div>
            {messages.map((message) => (
              <article className={`message-row ${message.role}`} key={message.id}>
                {message.role === 'assistant' && <div className="message-avatar"><img src="/icons/icon-192.png" alt="Atelon AI" /></div>}
                <div className={`message ${message.error ? 'error' : ''}`}>
                  <p>{message.text}</p>
                  {message.reply && <div className="message-meta">{message.reply.fallback ? 'Verified-data fallback' : `Answered by ${message.reply.provider}`}{message.reply.matchedVehicles.length ? ` · ${message.reply.matchedVehicles.join(', ')}` : ''}</div>}
                  {!!message.reply?.sources.length && <div className="message-sources">Sources {message.reply.sources.map((source, index) => <a key={source} href={source} target="_blank" rel="noreferrer" aria-label={`Open source ${index + 1}`}>{index + 1}</a>)}</div>}
                </div>
              </article>
            ))}
            {busy && <article className="message-row assistant"><div className="message-avatar"><img src="/icons/icon-192.png" alt="" /></div><div className="message typing"><i /><i /><i /></div></article>}
            {slow && <p className="wake-note">The help desk is waking up. This can take about a minute on the free service.</p>}
            <div ref={end} />
          </div>

          {messages.length === 1 && <div className="suggestion-row">{suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => submit(suggestion)}>{suggestion}</button>)}</div>}
          <div className="composer-wrap">
            <div className="composer">
              <textarea aria-label="Message Atelon AI" rows={1} maxLength={500} placeholder="Message Atelon AI…" value={q} onChange={(event) => setQ(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit(); } }} />
              <button type="button" aria-label="Send message" onClick={() => submit()} disabled={busy || !q.trim()}>↑</button>
            </div>
            <small>Atelon can make mistakes. Verify important details using the linked sources.</small>
          </div>
        </section>
      </div>
    </div>
  );
}
