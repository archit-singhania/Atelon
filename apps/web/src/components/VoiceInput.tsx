import { useEffect, useRef, useState } from 'react';
type Recognition = { lang: string; continuous: boolean; interimResults: boolean; start(): void; stop(): void; onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null; onerror: (() => void) | null; onend: (() => void) | null };
export default function VoiceInput({ onTranscript }: { onTranscript: (value: string) => void }) {
  const [listening, setListening] = useState(false); const [notice, setNotice] = useState(''); const active = useRef<Recognition | null>(null);
  const Constructor = (window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: new () => Recognition }).webkitSpeechRecognition;
  useEffect(() => () => active.current?.stop(), []);
  if (!Constructor) return null;
  function start() { if (listening) { active.current?.stop(); return; } const recognition = new Constructor!(); active.current = recognition; recognition.lang = 'en-IN'; recognition.continuous = false; recognition.interimResults = false; recognition.onresult = event => onTranscript(event.results[0][0].transcript); recognition.onerror = () => { setListening(false); setNotice('Voice input unavailable. You can continue typing.'); }; recognition.onend = () => setListening(false); try { recognition.start(); setListening(true); setNotice(''); } catch { setNotice('Microphone unavailable.'); } }
  return <span><button className="btn ghost" type="button" aria-pressed={listening} onClick={start}>{listening ? 'Stop microphone' : 'Voice input'}</button>{notice && <small role="status">{notice}</small>}</span>;
}
