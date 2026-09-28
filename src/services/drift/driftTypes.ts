import { DataProvenance } from '../dataProvider/provenance';

export interface LagrangianParticle {
  id: number;
  lat: number;
  lng: number;
  initialLat: number;
  initialLng: number;
  active: boolean;
  ageHours: number;
}

export interface OriginProbabilityContour {
  p50: Array<[number, number]>;
  p80: Array<[number, number]>;
  p95: Array<[number, number]>;
  centroid: [number, number];
  areaKm2: number;
}

export interface HindcastStep {
  timeUtc: string;
  hoursAgo: number;
  centroidLat: number;
  centroidLng: number;
  currentVelocityKnots: number;
  currentDirectionDeg: number;
  windSpeedKnots: number;
  windDirectionDeg: number;
  particlePositions: Array<[number, number]>;
}

export interface ForecastStep {
  timeUtc: string;
  hoursAhead: number;
  lat: number;
  lng: number;
  uncertaintyRadiusKm: number;
  conePolygon: Array<[number, number]>;
  windForcingTimestampUtc: string;
}

export interface DriftSimulationResult {
  simulationId: string;
  initialSlickCentroid: [number, number];
  observationTimeUtc: string;
  particleCount: number;
  diffusionCoefficientM2_s: number;
  windDriftFactor: number;
  hindcastSteps: HindcastStep[];
  originContours: OriginProbabilityContour;
  forecastSteps: ForecastStep[];
  provenance: DataProvenance;
}
