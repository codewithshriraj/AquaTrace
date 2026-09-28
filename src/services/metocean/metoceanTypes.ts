import { DataProvenance } from '../dataProvider/provenance';

export interface CurrentVector {
  lat: number;
  lng: number;
  speedKnots: number;
  speedM_s: number;
  directionDeg: number;
  depthM: number;
}

export interface WindVector {
  lat: number;
  lng: number;
  speedKnots: number;
  speedM_s: number;
  directionDeg: number;
  gustKnots?: number;
}

export interface EnvironmentalPointConditions {
  lat: number;
  lng: number;
  timestampUtc: string;
  seaSurfaceTemperatureC?: number;
  significantWaveHeightM?: number;
  waveDirectionDeg?: number;
  wavePeriodS?: number;
  surfaceCurrent: CurrentVector;
  wind10m: WindVector;
  windThresholdStatus: 'OPTIMAL' | 'LOW_WIND_LOOKALIKE_RISK' | 'HIGH_WIND_DISPERSION_RISK';
  provenance: DataProvenance;
}

export interface TimeAwareMetoceanSequence {
  tMinus12h: EnvironmentalPointConditions;
  tMinus6h: EnvironmentalPointConditions;
  tZero: EnvironmentalPointConditions;
  tPlus6h: EnvironmentalPointConditions;
  tPlus12h: EnvironmentalPointConditions;
  tPlus24h?: EnvironmentalPointConditions;
  tPlus48h?: EnvironmentalPointConditions;
  provenance: DataProvenance;
}
