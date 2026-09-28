import { DataProvenance } from '../dataProvider/provenance';

export interface GeometricMetrics {
  areaKm2: number;
  perimeterKm: number;
  lengthKm: number;
  widthKm: number;
  aspectRatio: number;
  orientationDeg: number;
  centroid: [number, number];
  boundingBox: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
  complexityIndex: number; // Perimeter / (2 * sqrt(PI * Area))
}

export interface PhysicalLookAlikeEvaluation {
  windSpeedM_s: number;
  windSpeedKts: number;
  windRiskLevel: 'OPTIMAL' | 'LOW_WIND_LOOKALIKE' | 'HIGH_WIND_DISPERSED';
  dampingRatioDb: number;
  isDampingSignificant: boolean; // Damping ratio > 10 dB
  distanceToCoastlineKm: number;
  bathymetryDepthM: number;
  nearKnownReefOrUpwelling: boolean;
  nearShipWakeGeometry: boolean;
  overallLookAlikeRisk: 'Low' | 'Moderate' | 'High';
  riskFactors: string[];
}

export interface EstimatedReleaseWindow {
  observationTimeUtc: string;
  windowStartUtc: string;
  windowEndUtc: string;
  durationHours: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  derivationMethod: string;
  provenance: DataProvenance;
}

export interface DetectionResult {
  candidateId: string;
  satelliteSceneId: string;
  acquisitionTimeUtc: string;
  polygon: Array<[number, number]>;
  geometry: GeometricMetrics;
  physicalValidation: PhysicalLookAlikeEvaluation;
  oilLikelihoodPct: number;
  estimatedVolumeM3: number;
  releaseWindow: EstimatedReleaseWindow;
  status: 'VALIDATED_CANDIDATE' | 'EXPERIMENTAL_DETECTION' | 'REJECTED_LOOKALIKE';
  provenance: DataProvenance;
}
