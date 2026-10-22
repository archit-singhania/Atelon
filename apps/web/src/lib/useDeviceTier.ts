import { useEffect, useState } from 'react';
import type { WebGLRenderer } from 'three';

export type DeviceTier = 'high' | 'balanced' | 'low';
let softwareRenderer = false;
export function reportRenderer(renderer: WebGLRenderer) {
  try { const context = renderer.getContext(); const extension = context.getExtension('WEBGL_debug_renderer_info'); const name = extension ? String(context.getParameter(extension.UNMASKED_RENDERER_WEBGL)) : ''; if (/swiftshader|llvmpipe|software|microsoft basic render/i.test(name)) { softwareRenderer = true; dispatchEvent(new Event('atelon-renderer-quality')); } } catch { /* Retain conservative device signals when renderer metadata is unavailable. */ }
}

export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>('balanced');
  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean; effectiveType?: string }; getBattery?: () => Promise<{ level: number; charging: boolean }> };
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduced';
    const coarse = matchMedia('(pointer: coarse)').matches;
    let next: DeviceTier = innerWidth >= 1200 && (nav.deviceMemory ?? 8) >= 8 && !coarse ? 'high' : 'balanced';
    if (reduced || nav.connection?.saveData || (nav.deviceMemory && nav.deviceMemory <= 4) || /2g/.test(nav.connection?.effectiveType || '')) next = 'low';
    const capped = () => softwareRenderer ? 'low' : next;
    setTier(capped());
    nav.getBattery?.().then((battery) => { if (!battery.charging && battery.level < .2) setTier('low'); }).catch(() => undefined);
    const appearance = () => { if (document.documentElement.dataset.motion === 'reduced') setTier('low'); else setTier(capped()); }; addEventListener('atelon-appearance-change', appearance); addEventListener('atelon-renderer-quality', appearance); return () => { removeEventListener('atelon-appearance-change', appearance); removeEventListener('atelon-renderer-quality', appearance); };
  }, []);
  return tier;
}
