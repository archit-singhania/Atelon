import { useEffect, useLayoutEffect } from 'react';
import { flushSync } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
const positions = new Map<string, number>();
export default function NavigationMotion() {
  const navigate = useNavigate(); const location = useLocation();
  useLayoutEffect(() => { const key = location.pathname + location.search; const position = positions.get(key) || 0; window.scrollTo({ top: position, behavior: 'instant' }); const showroom = document.querySelector<HTMLElement>('.vehicle-showroom'); if (showroom) showroom.style.viewTransitionName = 'vehicle-preview'; }, [location.pathname]);
  useEffect(() => {
    const click = (event: MouseEvent) => { const anchor = (event.target as Element)?.closest('a'); if (!anchor || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || anchor.target || anchor.hasAttribute('download')) return; const url = new URL(anchor.href); if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return; positions.set(window.location.pathname + window.location.search, window.scrollY); const transition = (document as Document & { startViewTransition?: (callback: () => void) => unknown }).startViewTransition; if (!transition || matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduced') return; if (url.pathname.startsWith('/vehicle/')) { document.querySelectorAll<HTMLElement>('[style*="view-transition-name"]').forEach(element => element.style.viewTransitionName = 'none'); const image = anchor.querySelector('img'); if (image) image.style.viewTransitionName = 'vehicle-preview'; } event.preventDefault(); transition.call(document, () => flushSync(() => navigate(url.pathname + url.search + url.hash))); };
    document.addEventListener('click', click, true); return () => document.removeEventListener('click', click, true);
  }, [navigate]); return null;
}
