export type Tier = 'full' | 'reference' | 'specs-only';
export type VehicleStatus = 'draft' | 'researching' | 'license-review' | 'asset-processing' | 'qa' | 'live' | 'rejected';
export interface ModelHotspot { id: string; label: string; position: [number, number, number]; specKey: string; review?: { reviewer:string; verifiedAt:string; source:string; modelHash:string; notes:string } }
export interface ExplodedPart { node: string; offset: [number, number, number] }

export interface Spec {
  measurement?: {kind:'power'|'torque'|'weight'|'length'|'width'|'height'|'speed';value:number;unit:string;qualifier:string;uncertainty?:number;reviewer:string;verifiedAt:string};
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
  generationFamily?: string;
  milestones?: { year: number; title: string; source: string }[];
  relationships?: { targetSlug:string;kind:'platform'|'engine'|'designer'|'motorsport'|'generation';label:string;source:string }[];
  recordings?: { id:string;title:string;url:string;source:string;credit:string;kind:'startup'|'idle'|'acceleration';recordedAt?:string }[];
  type: 'car' | 'motorcycle';
  years: [number, number | null];
  tier: Tier;
  summary: string;
  specs: Spec[];
  model3d?: {
    calibration?: { metersPerUnit:number;rotation:[number,number,number];reviewer:string;source:string;verifiedAt:string };
    interior?: { seats:{id:string;label:string;position:[number,number,number];target:[number,number,number]}[];controls?:{id:string;label:string;description:string;source:string}[];reviewer:string;verifiedAt:string };
    hotspots?: ModelHotspot[];
    paintMaterials?: string[];
    explodedParts?: ExplodedPart[];
    glb: string;
    credit: string;
    license?: 'CC0' | 'CC BY 4.0' | 'CC BY 3.0' | 'written-permission' | 'user-supplied';
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
