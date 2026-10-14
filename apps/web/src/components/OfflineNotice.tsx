import { useEffect, useState } from 'react';

export default function OfflineNotice() {
  const [offline, setOffline] = useState(() => typeof navigator !== 'undefined' && !navigator.onLine);
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
  }, []);
  if (!offline) return null;
  return <div className="offline-notice" role="status">You’re offline. Saved pages and showroom posters remain available; Ask AI needs a connection.</div>;
}
