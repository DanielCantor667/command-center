export type CityDistrictId =
  'command-center' | 'kliniu' | 'vevi' | 'intranet-ess' | 'lorigine' | 'academy' | 'drokex';

export type CityVector3 = readonly [number, number, number];

interface CityLandmarkTransform {
  readonly position: CityVector3;
  readonly rotation: CityVector3;
  readonly scale: CityVector3;
}

export interface CityAssetDimensions {
  readonly width: number;
  readonly height: number;
  readonly depth: number;
  readonly unit: 'm';
}

export interface CityTriangleBudget {
  readonly lod0: number;
  readonly lod1: number;
}

export interface CityMotionProfile {
  /** Emissive beacon cycle for the district's public role. */
  readonly pulsePeriodSeconds: number;
}

export interface CityAssetSource {
  readonly kind: 'original' | 'cc0' | 'commercial';
  readonly name: string;
  readonly url?: string;
  readonly author?: string;
  readonly createdAt?: string;
  readonly sha256?: string;
}

export interface CityAssetLicense {
  readonly id: string;
  readonly url?: string;
  readonly redistributable: boolean;
}

export interface CityDistrictAsset {
  readonly id: CityDistrictId;
  readonly projectId: CityDistrictId | '4ustudio-academy';
  readonly label: string;
  readonly lod0Path: string | null;
  readonly lod1Path: string | null;
  readonly source: CityAssetSource | null;
  readonly license: CityAssetLicense | null;
  readonly dimensions: CityAssetDimensions | null;
  readonly triangleBudget: CityTriangleBudget | null;
  readonly version: string;
  readonly position: CityVector3;
  readonly scale: CityVector3;
  readonly motion: CityMotionProfile;
  readonly transform?: CityLandmarkTransform;
}

/**
 * Layout and public model contract for the interactive Engineering City.
 *
 * Keep architectural source files private. This manifest only points to the
 * optimized GLBs that are safe to serve from `apps/web/public/models/city`.
 */
export const CITY_ASSETS: readonly CityDistrictAsset[] = [
  { id: 'drokex', projectId: 'drokex', label: 'Drokex', lod0Path: null, lod1Path: null,
    source: null, license: null, dimensions: null, triangleBudget: null, version: 'procedural-v1',
    position: [0, 0.1, -3.1], scale: [0.85, 0.65, 0.85], motion: { pulsePeriodSeconds: 8 } },
  {
    id: 'command-center',
    projectId: 'command-center',
    label: 'Command Center',
    lod0Path: '/models/city/command-center.glb',
    lod1Path: '/models/city/command-center-lod1.glb',
    source: {
      kind: 'original',
      name: 'Command Center original Blender landmark',
      author: 'Command Center',
      createdAt: '2026-07-30',
    },
    license: {
      id: 'MIT',
      url: '/LICENSE',
      redistributable: true,
    },
    dimensions: { width: 53.78, height: 72, depth: 46.765, unit: 'm' },
    triangleBudget: { lod0: 18_000, lod1: 5_000 },
    version: 'v1.0.0',
    position: [0, 0.45, 0],
    scale: [1.25, 0.65, 1.25],
    motion: { pulsePeriodSeconds: 8 },
    transform: {
      // Blender exports in metres; the navigator uses a compact city scale.
      position: [0, 0.18, 0],
      rotation: [0, 0, 0],
      scale: [0.04, 0.04, 0.04],
    },
  },
  {
    id: 'kliniu',
    projectId: 'kliniu',
    label: 'Kliniu',
    lod0Path: '/models/city/kliniu.glb',
    lod1Path: '/models/city/kliniu-lod1.glb',
    source: {
      kind: 'original',
      name: 'Kliniu original Blender landmark',
      author: 'Command Center',
      createdAt: '2026-07-30',
    },
    license: {
      id: 'MIT',
      url: '/LICENSE',
      redistributable: true,
    },
    dimensions: { width: 97.8, height: 39.6, depth: 84.87, unit: 'm' },
    triangleBudget: { lod0: 18_000, lod1: 5_000 },
    version: 'v1.0.0',
    position: [-2.6, 0.1, -1.2],
    scale: [1.08, 0.44, 0.95],
    motion: { pulsePeriodSeconds: 8 },
    transform: {
      position: [0, 0.12, 0],
      rotation: [0, 0, 0],
      scale: [0.021, 0.021, 0.021],
    },
  },
  {
    id: 'vevi',
    projectId: 'vevi',
    label: 'Vevi',
    lod0Path: '/models/city/vevi.glb',
    lod1Path: '/models/city/vevi-lod1.glb',
    source: {
      kind: 'original',
      name: 'Vevi original Blender landmark',
      author: 'Command Center',
      createdAt: '2026-07-30',
    },
    license: {
      id: 'MIT',
      url: '/LICENSE',
      redistributable: true,
    },
    dimensions: { width: 67.8, height: 55.93, depth: 58.89, unit: 'm' },
    triangleBudget: { lod0: 18_000, lod1: 5_000 },
    version: 'v1.0.0',
    position: [2.5, 0.1, -1.15],
    scale: [1.08, 0.55, 1.08],
    motion: { pulsePeriodSeconds: 4 },
    transform: {
      position: [0, 0.14, 0],
      rotation: [0, 0, 0],
      scale: [0.031, 0.031, 0.031],
    },
  },
  {
    id: 'intranet-ess',
    projectId: 'intranet-ess',
    label: 'Intranet ESS',
    lod0Path: '/models/city/intranet-ess.glb',
    lod1Path: '/models/city/intranet-ess-lod1.glb',
    source: {
      kind: 'original',
      name: 'Intranet ESS original Blender landmark',
      author: 'Command Center',
      createdAt: '2026-07-30',
    },
    license: {
      id: 'MIT',
      url: '/LICENSE',
      redistributable: true,
    },
    dimensions: { width: 95.8, height: 42, depth: 83.138, unit: 'm' },
    triangleBudget: { lod0: 18_000, lod1: 5_000 },
    version: 'v1.0.0',
    position: [-2.25, 0.1, 1.55],
    scale: [1.08, 0.43, 0.96],
    motion: { pulsePeriodSeconds: 8 },
    transform: {
      position: [0, 0.12, 0],
      rotation: [0, 0, 0],
      scale: [0.019, 0.019, 0.019],
    },
  },
  {
    id: 'lorigine',
    projectId: 'lorigine',
    label: "L'Origine",
    lod0Path: '/models/city/lorigine.glb',
    lod1Path: '/models/city/lorigine-lod1.glb',
    source: {
      kind: 'original',
      name: "L'Origine original Blender landmark",
      author: 'Command Center',
      createdAt: '2026-07-30',
    },
    license: {
      id: 'MIT',
      url: '/LICENSE',
      redistributable: true,
    },
    dimensions: { width: 67.82, height: 29.943, depth: 73.145, unit: 'm' },
    triangleBudget: { lod0: 18_000, lod1: 5_000 },
    version: 'v1.0.0',
    position: [2.25, 0.1, 1.55],
    scale: [1, 0.40, 1.04],
    motion: { pulsePeriodSeconds: 10 },
    transform: {
      position: [0, 0.12, 0],
      rotation: [0, 0, 0],
      scale: [0.027, 0.027, 0.027],
    },
  },
  {
    id: 'academy',
    projectId: '4ustudio-academy',
    label: 'Academy',
    lod0Path: '/models/city/academy.glb',
    lod1Path: '/models/city/academy-lod1.glb',
    source: {
      kind: 'original',
      name: 'Academy original Blender landmark',
      author: 'Command Center',
      createdAt: '2026-07-30',
    },
    license: {
      id: 'MIT',
      url: '/LICENSE',
      redistributable: true,
    },
    dimensions: { width: 47.82, height: 38, depth: 42.033, unit: 'm' },
    triangleBudget: { lod0: 18_000, lod1: 5_000 },
    version: 'v1.0.0',
    position: [0, 0.1, 2.6],
    scale: [0.92, 0.46, 0.92],
    motion: { pulsePeriodSeconds: 8 },
    transform: {
      position: [0, 0.12, 0],
      rotation: [0, 0, 0],
      scale: [0.04, 0.04, 0.04],
    },
  },
];
