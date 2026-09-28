/**
 * Data Provenance & Realism Hierarchy
 * Enforces strict scientific traceability across the AquaTrace pipeline.
 */

export type DataTier = 
  | 'TIER_1_LIVE_NRT'         // Real live or near-real-time observations
  | 'TIER_2_HISTORICAL_REAL'   // Genuinely observed real historical data
  | 'TIER_3_PREPROCESSED_REAL' // Real sensor data preprocessed for calibration/testing
  | 'TIER_4_DEMO_SIMULATION';  // Controlled synthetic/demo data (explicitly labeled)

export type ProvenanceClassification =
  | 'REAL_OBSERVATION'
  | 'MODEL_DERIVED'
  | 'CACHED_REAL_DATA'
  | 'DEMO_SIMULATION';

export interface DataProvenance {
  sourceName: string;
  sourceProvider: string;
  datasetId?: string;
  productId?: string;
  tier: DataTier;
  classification: ProvenanceClassification;
  observationTimeUtc?: string;
  retrievalTimeUtc: string;
  processingVersion: string;
  spatialResolution?: string;
  temporalResolution?: string;
  dataLatencyHours?: number;
  isSimulatedFallback: boolean;
  citationNotice?: string;
}

export interface PipelineHealthStatus {
  serviceId: string;
  name: string;
  provider: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'UNAVAILABLE' | 'RATE_LIMITED' | 'FALLBACK';
  tier: DataTier;
  lastSuccessfulPingUtc: string;
  lastUpdatedUtc: string;
  latencyMs: number;
  errorMessage?: string;
  endpointUrl?: string;
}

/**
 * Calculates human-readable data age from UTC timestamp.
 */
export function calculateDataAge(timestampUtc: string): { text: string; hours: number; isStale: boolean } {
  try {
    const time = new Date(timestampUtc).getTime();
    if (isNaN(time)) return { text: 'Unknown', hours: 0, isStale: false };
    const diffMs = Math.max(0, Date.now() - time);
    const hours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
    
    if (hours < 1) {
      const minutes = Math.max(1, Math.round(diffMs / (1000 * 60)));
      return { text: `${minutes}m ago`, hours, isStale: false };
    }
    if (hours < 24) {
      return { text: `${Math.round(hours)}h ago`, hours, isStale: hours > 12 };
    }
    const days = Math.round((hours / 24) * 10) / 10;
    return { text: `${days}d ago`, hours, isStale: true };
  } catch {
    return { text: 'Unknown', hours: 0, isStale: false };
  }
}

/**
 * Maps provenance classification to badge display properties.
 */
export function getProvenanceBadgeConfig(classification: ProvenanceClassification) {
  switch (classification) {
    case 'REAL_OBSERVATION':
      return {
        label: 'REAL OBSERVATION',
        bgClass: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
        dotClass: 'bg-emerald-400',
        desc: 'Direct sensor measurement without model modification.',
      };
    case 'MODEL_DERIVED':
      return {
        label: 'MODEL-DERIVED ESTIMATE',
        bgClass: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
        dotClass: 'bg-cyan-400',
        desc: 'Calculated using physical/mathematical model equations.',
      };
    case 'CACHED_REAL_DATA':
      return {
        label: 'CACHED REAL DATA',
        bgClass: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
        dotClass: 'bg-blue-400',
        desc: 'Real observation served from authenticated local cache.',
      };
    case 'DEMO_SIMULATION':
      return {
        label: 'DEMO / SIMULATION DATA',
        bgClass: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
        dotClass: 'bg-amber-400 animate-pulse',
        desc: 'Controlled benchmark simulation for operational demonstration.',
      };
  }
}
