import { DataProvenance } from '../dataProvider/provenance';

export interface AisPositionReport {
  lat: number;
  lng: number;
  timeUtc: string;
  speedKnots: number;
  courseDeg: number;
  headingDeg?: number;
  navStatus?: string;
}

export interface AisVesselRecord {
  mmsi: string;
  imo?: string;
  name: string;
  callsign?: string;
  flag: string;
  flagCode: string;
  vesselType: string;
  lengthM: number;
  beamM: number;
  destination?: string;
  eta?: string;
  lastPosition: AisPositionReport;
  track: AisPositionReport[];
  dataSource: string;
  provenance: DataProvenance;
}

export interface AisGapEvent {
  vesselMmsi: string;
  vesselName: string;
  lastObservedTimeUtc: string;
  nextObservedTimeUtc: string;
  gapDurationMinutes: number;
  lastKnownLocation: [number, number];
  nextKnownLocation: [number, number];
  distanceDiscrepancyNm: number;
  legalAssessment: string; // "AIS coverage/data gap detected. This may reflect receiver coverage, transmission loss, data availability, or other causes; intentional disabling cannot be inferred from this gap alone."
}

export interface CandidateScoringWeights {
  wSpatial: number;    // default 0.25
  wTemporal: number;   // default 0.25
  wTrajectory: number; // default 0.15
  wBehaviour: number;  // default 0.15
  wContinuity: number; // default 0.20
}

export interface FilteredCandidateVessel {
  vessel: AisVesselRecord;
  distanceToOriginNm: number;
  timeOverlapHours: number;
  trajectoryAlignmentScore: number; // 0 - 100
  behaviourAnomalyScore: number;     // 0 - 100
  aisContinuityScore: number;        // 0 - 100
  overallEvidenceScore: number;      // 0 - 100 (Evidence Compatibility Score)
  aisGapEvent?: AisGapEvent;
  screeningVerdict: 'HIGH_INTEREST' | 'MODERATE_INTEREST' | 'LOW_INTEREST' | 'EXCLUDED';
  provenance: DataProvenance;
}
