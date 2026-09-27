export type CorrelationTier = 'HIGH CORRELATION' | 'MODERATE CORRELATION' | 'LOW CORRELATION' | 'INCONCLUSIVE';

export type IncidentStatus = 
  | 'NEW'
  | 'SCREENING'
  | 'UNDER_INVESTIGATION'
  | 'PROVISIONAL'
  | 'INCONCLUSIVE'
  | 'CLOSED';

export interface SlickProperties {
  areaKm2: number;
  perimeterKm: number;
  estimatedVolumeM3: number;
  thicknessMicron: number;
  estimatedAgeHours: string;
  lookAlikeRisk: 'Low' | 'Moderate' | 'High';
  confidencePct: number;
  lengthKm: number;
  widthKm: number;
  orientationDeg: number;
  weatheringState: string;
}

export interface SatelliteScene {
  satellite: string;
  sensor: string;
  polarisation: string;
  resolutionM: number;
  sceneId: string;
  orbitPass: string;
  acquisitionTimeUtc: string;
  incidenceAngleDeg: number;
}

export interface CandidateVessel {
  id: string;
  name: string;
  mmsi: string;
  imo: string;
  callsign: string;
  flag: string;
  flagCode: string;
  vesselType: string;
  deadweightTonnage: number;
  lengthM: number;
  beamM: number;
  destination: string;
  route: string;
  correlationRank: number;
  correlationTier: CorrelationTier;
  overallScore: number;
  scores: {
    satellite: number;
    drift: number;
    ais: number;
    behaviour: number;
    counterfactual: number;
    history: number;
  };
  closestPointOfApproachNm: number;
  cpaTimeUtc: string;
  speedAtCpaKnots: number;
  averageSpeedKnots: number;
  speedAnomaly: string;
  courseAtCpaDeg: number;
  aisGapDetected: boolean;
  aisGapDurationMinutes?: number;
  kinematicDiscrepancy: boolean;
  track: Array<{
    lat: number;
    lng: number;
    time: string;
    speedKnots: number;
    courseDeg: number;
  }>;
  counterfactualResult: {
    similarityPct: number;
    iouMetric: number;
    hausdorffDistanceKm: number;
    simulatedSlickGeoJson: Array<[number, number]>;
    driftDurationHours: number;
    particleCount: number;
  };
  history: {
    previousSpills: number;
    portDeficiencies: number;
    lastPscInspection: string;
    routeFrequency: string;
    pscDetentions: number;
  };
  humanReview?: {
    confirmed: boolean;
    investigatorNotes?: string;
    overrideRank?: number;
    overrideReason?: string;
    reviewedBy?: string;
    reviewedAtUtc?: string;
  };
}

export interface DarkVessel {
  id: string;
  sarDetectionTime: string;
  lat: number;
  lng: number;
  estimatedLengthM: number;
  estimatedHeadingDeg: number;
  nearestAisDistanceNm: number;
  sarRCS_dB: number;
  confidence: 'HIGH' | 'MODERATE' | 'LOW';
  notes: string;
}

export interface AuditEntry {
  id: string;
  timestampUtc: string;
  action: string;
  modelVersion: string;
  dataSource: string;
  userOrSystem: string;
  status: 'SUCCESS' | 'WARNING' | 'INFO';
  sha256Hash: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'scene' | 'model' | 'slick' | 'metocean' | 'origin' | 'ais' | 'vessel' | 'counterfactual' | 'verdict';
  timestamp?: string;
  summary: string;
  details: Record<string, string | number>;
  status?: 'verified' | 'provisional' | 'inconclusive';
}

export interface GraphEdge {
  from: string;
  to: string;
  label: string;
}

export interface Incident {
  id: string;
  title: string;
  region: string;
  coordinates: [number, number]; // [lat, lng]
  detectionTimeUtc: string;
  status: IncidentStatus;
  isSyntheticDemo: boolean;
  assignedInvestigator: string;
  lastUpdatedUtc: string;
  satelliteScene: SatelliteScene;
  slickProperties: SlickProperties;
  releaseWindow: {
    startUtc: string;
    endUtc: string;
    durationHours: number;
    centroidLat: number;
    centroidLng: number;
  };
  slickPolygon: Array<[number, number]>;
  originContours: {
    p50: Array<[number, number]>;
    p80: Array<[number, number]>;
    p95: Array<[number, number]>;
  };
  hindcastTrajectory: Array<{
    lat: number;
    lng: number;
    time: string;
    uCurrentM_s: number;
    vCurrentM_s: number;
    windSpeedKts: number;
    windDirDeg: number;
  }>;
  forecastEnvelope: Array<{
    lat: number;
    lng: number;
    time: string;
    uncertaintyRadiusKm: number;
    p50Cone: Array<[number, number]>;
  }>;
  currentVectors: Array<{
    lat: number;
    lng: number;
    speedKnots: number;
    directionDeg: number;
  }>;
  windVectors: Array<{
    lat: number;
    lng: number;
    speedKnots: number;
    directionDeg: number;
  }>;
  sensitiveAreas: Array<{
    name: string;
    type: string;
    coordinates: Array<[number, number]>;
    distanceNm: number;
  }>;
  candidateVessels: CandidateVessel[];
  darkVessels: DarkVessel[];
  conclusionSummary: string;
  attributionStatus: CorrelationTier;
  evidenceGaps?: string[];
  recommendedActions: string[];
  auditTrail: AuditEntry[];
  evidenceGraph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
  kinematicCheck: {
    reportedSpeedTrend: Array<{ time: string; reportedKts: number; calculatedKts: number }>;
    discrepancyDetected: boolean;
    explanation: string;
  };
  investigatorNotes?: string;
}

export interface VesselProfile {
  id: string;
  name: string;
  mmsi: string;
  imo: string;
  callsign: string;
  flag: string;
  flagCode: string;
  vesselType: string;
  dwt: number;
  lengthM: number;
  beamM: number;
  builtYear: number;
  operator: string;
  aisContinuityScorePct: number;
  totalGapsInPastYear: number;
  historicalSpillAssociations: number;
  lastPscInspectionDate: string;
  pscDeficienciesFound: number;
  currentStatus: 'UNDERWAY' | 'AT_ANCHOR' | 'MOORED' | 'AIS_SILENT';
  currentLocationDesc: string;
  recentPorts: string[];
}

export interface SystemConfig {
  weights: {
    satellite: number;
    drift: number;
    ais: number;
    behaviour: number;
    counterfactual: number;
    history: number;
  };
  abstentionThreshold: number; // below which case becomes INCONCLUSIVE
  lookAlikeCutoff: number; // above which look-alike triggers warning/abstention
  minCounterfactualIoU: number; // minimum IoU for high correlation
  demonstrationMode: boolean;
  activeSatelliteConstellation: string[];
}
