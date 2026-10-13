import { motion } from 'framer-motion';
import { vehicles } from '../lib/data';
import type { Vehicle } from '../types';

const num = (v: Vehicle, key: string) => {
  const s = v.specs.find((x) => x.key === key);
  return s && typeof s.value === 'number' ? s : undefined;
};

// Animated bar race between two vehicles on the first numeric spec they share. Real data only.
export default function SpecRace() {
  for (let i = 0; i < vehicles.length; i++) {
    for (let j = i + 1; j < vehicles.length; j++) {
      const a = vehicles[i], b = vehicles[j];
      const shared = a.specs.find((s) => typeof s.value === 'number' && num(b, s.key));
      if (!shared) continue;
      const sa = num(a, shared.key)!, sb = num(b, shared.key)!;
      const max = Math.max(sa.value as number, sb.value as number);
      const rows = [{ v: a, s: sa }, { v: b, s: sb }];
      return (
        <section className="page">
          <h2>Spec race: {shared.key}</h2>
          {rows.map(({ v, s }) => (
            <div key={v.slug} style={{ margin: '12px 0' }}>
              <small className="muted">{v.make} {v.model}: {String(s.value)}{s.unit ? ` ${s.unit}` : ''}</small>
              <motion.div
                className="bar"
                initial={{ width: 0 }}
                whileInView={{ width: `${((s.value as number) / max) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, ease: 'easeOut' }}
              />
            </div>
          ))}
        </section>
      );
    }
  }
  return null; // shown automatically once two vehicles share a verified numeric spec
}
