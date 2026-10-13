import { TIER_LABEL, type Tier } from '../types';

export default function TierBadge({ tier }: { tier: Tier }) {
  return <span className={`badge ${tier === 'specs-only' ? '' : tier}`}>{TIER_LABEL[tier]}</span>;
}
