import { DataProvenance } from '../dataProvider/provenance';

export type SatelliteMission = 'SENTINEL-1A' | 'SENTINEL-1B' | 'EOS-04' | 'RADARSAT-2' | 'RISAT-1A';
export type SarPolarisation = 'VV' | 'VH' | 'VV+VH' | 'HH' | 'HV' | 'HH+HV';
export type SarProductType = 'GRD' | 'SLC' | 'RAW';
export type SarAcquisitionMode = 'IW' | 'EW' | 'SM' | 'WV';

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface SatelliteSearchParams {
  mission?: SatelliteMission;
  productType?: SarProductType;
  polarisation?: SarPolarisation;
  mode?: SarAcquisitionMode;
  bbox?: BoundingBox;
  point?: { lat: number; lng: number; radiusKm?: number };
  startDateUtc: string;
  endDateUtc: string;
  maxResults?: number;
}

export interface SatelliteProduct {
  id: string;
  name: string;
  mission: SatelliteMission;
  sensor: string;
  instrumentMode: SarAcquisitionMode;
  productType: SarProductType;
  polarisation: SarPolarisation;
  resolutionM: number;
  orbitDirection: 'ASCENDING' | 'DESCENDING';
  relativeOrbitNumber?: number;
  absoluteOrbitNumber?: number;
  acquisitionTimeUtc: string;
  ingestionTimeUtc: string;
  incidenceAngleNearDeg?: number;
  incidenceAngleFarDeg?: number;
  footprintCoordinates: Array<[number, number]>; // [lat, lng] polygon
  quicklookUrl?: string;
  downloadUrl?: string;
  online: boolean;
  cloudCoveragePct?: number; // 0 for SAR radar
  provenance: DataProvenance;
}

export interface SatelliteSearchResponse {
  products: SatelliteProduct[];
  totalMatches: number;
  searchDurationMs: number;
  sourceEndpoint: string;
  usedFallback: boolean;
  provenance: DataProvenance;
}

export interface DarkSpotFeatureExtraction {
  centroid: [number, number];
  polygon: Array<[number, number]>;
  areaKm2: number;
  perimeterKm: number;
  lengthKm: number;
  widthKm: number;
  aspectRatio: number;
  orientationDeg: number;
  meanBackscatterDampDb: number;
  backgroundBackscatterDb: number;
  dampingRatioDb: number;
  gradientSharpness: number;
  isLookAlikeSuspect: boolean;
  lookAlikeFactors: string[];
}
