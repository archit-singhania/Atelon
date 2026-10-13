export type Tier = 'full' | 'reference' | 'specs-only';

export interface Spec {
  key: string;
  value: number | string | boolean;
  unit?: string;
  source: string;
}

export interface Vehicle {
  slug: string;
  status: 'draft' | 'live';
  make: string;
  model: string;
  generation?: string;
  type: 'car' | 'motorcycle';
  years: [number, number | null];
  tier: Tier;
  summary: string;
  specs: Spec[];
  model3d?: { glb: string; credit: string };
  poster?: string;
}

export const TIER_LABEL: Record<Tier, string> = {
  full: 'Full 3D',
  reference: 'Reference 3D',
  'specs-only': 'Specs only'
};
