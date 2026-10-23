import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { askStream, bySlug, vehicles } from '../lib/data';
import { useSeo } from '../lib/useSeo';
import AnswerCards from '../components/AnswerCards';
import VoiceInput from '../components/VoiceInput';
import { bookmark } from '../lib/research';
import ChatLibrary from '../components/ChatLibrary';

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
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => () => activeRequest.current?.abort(), []);
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
    const messageId = nextId.current++;
    setMessages((items) => [...items, { id: messageId, role: 'assistant', text: '', reply: { answer: '', provider: 'connecting', sources: [], matchedVehicles: [], fallback: false } }]);
    activeRequest.current = new AbortController();
    try {
      await askStream(question, ({ type, data }) => setMessages((items) => items.map((message) => {
        if (message.id !== messageId || !message.reply) return message;
        if (type === 'answer_delta') return { ...message, text: message.text + String(data.text || '') };
        if (type === 'citation') return { ...message, reply: { ...message.reply, sources: [...new Set([...message.reply.sources, String(data.url)])] } };
        if (type === 'matched_vehicle') return { ...message, reply: { ...message.reply, matchedVehicles: [...new Set([...message.reply.matchedVehicles, String(data.slug)])] } };
        if (type === 'fallback') return { ...message, reply: { ...message.reply, fallback: true, fallbackReason: String(data.reason || '') } };
        if (type === 'status') return { ...message, reply: { ...message.reply, provider: String(data.provider || 'verified data') } };
        if (type === 'done') return { ...message, text: String(data.answer || message.text), reply: data as unknown as Reply };
        return message;
      })), activeRequest.current.signal, messages.slice().reverse().find(message => message.reply?.matchedVehicles.length)?.reply?.matchedVehicles);
    } catch (error) {
      if ((error as Error).name !== 'AbortError') setMessages((items) => items.map((message) => message.id === messageId ? { ...message, text: error instanceof Error ? error.message : 'I couldn’t reach the help desk just now.', error: true, retryText: question } : message));
    } finally { setBusy(false); activeRequest.current = null; }
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
          <ChatLibrary messages={messages} disabled={busy} restore={items => { setMessages(items); nextId.current = Math.max(1, ...items.map(item => item.id)) + 1; }} />
          <div className="support-trust"><span className="status-dot" />Grounded in verified Garage data</div>
        </aside>

        <section className="conversation" id="conversation">
          <header className="conversation-header">
            <div className="agent-avatar"><img src="/icons/icon-192.png" alt="" /></div>
            <div><h1>Ask Atelon</h1><p><span className="status-dot" /> AI vehicle help desk</p></div>
            <button className="clear-chat" disabled={busy} type="button" onClick={() => { localStorage.removeItem('atelon-chat-v1'); setMessages([{ id: nextId.current++, role: 'assistant', text: 'Conversation cleared. How can I help with your next vehicle question?' }]); }}>New chat</button>
          </header>

          <div className="message-log" role="log" aria-live="polite" aria-relevant="additions">
            <div className="chat-day"><span>Today</span></div>
            {messages.map((message, index) => (
              <article className={`message-row ${message.role}`} key={message.id}>
                {message.role === 'assistant' && <div className="message-avatar"><img src="/icons/icon-192.png" alt="Atelon AI" /></div>}
                <div className={`message ${message.error ? 'error' : ''}`}>
                  <p>{message.text}</p><div className="message-actions">{message.role === 'assistant' && message.text && <><button onClick={() => bookmark({ title: 'Atelon AI answer', text: message.text, url: '/ask', source: message.reply?.sources[0] })}>Bookmark answer</button>{'speechSynthesis' in window && <><button onClick={() => { speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(message.text)); }}>Read aloud</button><button onClick={() => speechSynthesis.cancel()}>Stop audio</button></>}{index > 0 && <button disabled={busy} onClick={() => submit(messages.slice(0,index).reverse().find(item => item.role === 'user')?.text || '')}>Regenerate</button>}</>}{message.role === 'user' && <button disabled={busy} onClick={() => setQ(message.text)}>Edit & resend</button>}</div>
                  {message.reply && <div className="message-meta">{message.reply.fallback ? `Verified-data fallback${message.reply.fallbackReason ? ` · ${message.reply.fallbackReason}` : ''}` : `Answered by ${message.reply.provider}`}</div>}
                  {message.reply && <AnswerCards slugs={message.reply.matchedVehicles} ask={submit} disabled={busy}/ >}
                  {!!message.reply?.matchedVehicles.length && <div className="vehicle-chips">{message.reply.matchedVehicles.map((slug) => { const vehicle = bySlug(slug); return <Link key={slug} to={`/vehicle/${slug}`}>{vehicle ? `${vehicle.make} ${vehicle.model}` : slug}</Link>; })}</div>}
                  {!!message.reply?.sources.length && <div className="message-sources">Sources {message.reply.sources.map((source) => { const label = (() => { try { return new URL(source).hostname.replace(/^www\./, ''); } catch { return 'Source'; } })(); return <a key={source} href={source} target="_blank" rel="noreferrer">{label} ↗</a>; })}</div>}
                  <div className="message-actions"><button type="button" onClick={() => navigator.clipboard?.writeText(message.text)}>Copy</button>{message.reply && message.reply.matchedVehicles.length >= 2 && <Link to={`/compare?a=${message.reply.matchedVehicles[0]}&b=${message.reply.matchedVehicles[1]}`}>Compare</Link>}{message.retryText && <button type="button" onClick={() => submit(message.retryText)}>Retry</button>}</div>
                </div>
              </article>
            ))}
            {busy && <button className="stop-generation" type="button" onClick={() => activeRequest.current?.abort()}>Stop response</button>}
            {slow && <p className="wake-note">The help desk is waking up. This can take about a minute on the free service.</p>}
            <div ref={end} />
          </div>

          {messages.length === 1 && <div className="suggestion-row">{suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => submit(suggestion)}>{suggestion}</button>)}</div>}
          <div className="composer-wrap">
            <VoiceInput onTranscript={setQ} />
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
