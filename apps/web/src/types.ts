export type Tier = 'full' | 'reference' | 'specs-only';
export type VehicleStatus = 'draft' | 'researching' | 'license-review' | 'asset-processing' | 'qa' | 'live' | 'rejected';

export interface Spec {
  key: string;
  value: number | string | boolean;
  unit?: string;
  source: string;
}

export interface Vehicle {
  slug: string;
  status: VehicleStatus;
  make: string;
  model: string;
  generation?: string;
  type: 'car' | 'motorcycle';
  years: [number, number | null];
  tier: Tier;
  summary: string;
  specs: Spec[];
  model3d?: {
    glb: string;
    credit: string;
    license?: 'CC0' | 'CC BY 4.0' | 'CC BY 3.0' | 'written-permission';
    sourceUrl?: string;
    licenseEvidence?: string;
    verifiedAt?: string;
    originalHash?: string;
    optimizedHash?: string;
    accuracyNotes?: string;
    triangleCount?: number;
    fileSizeBytes?: number;
    reviewer?: string;
  };
  poster?: string;
  posterSmall?: string;
}

export const TIER_LABEL: Record<Tier, string> = {
  full: 'Full 3D',
  reference: 'Reference 3D',
  'specs-only': 'Specs only'
};
