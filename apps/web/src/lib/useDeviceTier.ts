import { useEffect, useState } from 'react';

export type DeviceTier = 'high' | 'balanced' | 'low';

export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>('balanced');
  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean; effectiveType?: string }; getBattery?: () => Promise<{ level: number; charging: boolean }> };
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = matchMedia('(pointer: coarse)').matches;
    let next: DeviceTier = innerWidth >= 1200 && (nav.deviceMemory ?? 8) >= 8 && !coarse ? 'high' : 'balanced';
    if (reduced || nav.connection?.saveData || (nav.deviceMemory && nav.deviceMemory <= 4) || /2g/.test(nav.connection?.effectiveType || '')) next = 'low';
    setTier(next);
    nav.getBattery?.().then((battery) => { if (!battery.charging && battery.level < .2) setTier('low'); }).catch(() => undefined);
  }, []);
  return tier;
}
