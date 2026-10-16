import { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

interface InstallPromptEvent extends Event { prompt(): Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }

export default function PwaControls() {
  const [install, setInstall] = useState<InstallPromptEvent | null>(null);
  const [updateReady, setUpdateReady] = useState(false);
  const [update, setUpdate] = useState<((reload?: boolean) => Promise<void>) | null>(null);
  useEffect(() => {
    const updateSW = registerSW({ onNeedRefresh: () => setUpdateReady(true), onRegisteredSW: (_url, registration) => registration?.update() });
    setUpdate(() => updateSW);
    const capture = (event: Event) => { event.preventDefault(); setInstall(event as InstallPromptEvent); };
    addEventListener('beforeinstallprompt', capture);
    addEventListener('appinstalled', () => setInstall(null), { once: true });
    return () => removeEventListener('beforeinstallprompt', capture);
  }, []);
  if (!install && !updateReady) return null;
  return <div className="pwa-controls" role="status">
    {install && <button type="button" onClick={async () => { await install.prompt(); const choice = await install.userChoice; if (choice.outcome === 'accepted') setInstall(null); }}>Install Atelon</button>}
    {updateReady && <button type="button" onClick={() => update?.(true)}>Update available · Reload</button>}
  </div>;
}
