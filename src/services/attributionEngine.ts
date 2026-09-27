import { CandidateVessel, SystemConfig, CorrelationTier } from '../types';

export const defaultConfig: SystemConfig = {
  weights: {
    satellite: 0.20,
    drift: 0.25,
    ais: 0.20,
    behaviour: 0.10,
    counterfactual: 0.20,
    history: 0.05,
  },
  abstentionThreshold: 65.0, // cases with max score below this trigger INCONCLUSIVE
  lookAlikeCutoff: 0.35,
  minCounterfactualIoU: 0.70,
  demonstrationMode: true,
  activeSatelliteConstellation: ['Sentinel-1A', 'Sentinel-1C', 'EOS-04'],
};

/**
 * Computes Composite Evidence Score based on multi-channel forensic evidence weighting.
 * Operational evidence weighting: S = sum(w_k * S_k), normalized so sum(w_k) = 1.00.
 * Notice: Operational evidence weighting; not statistically calibrated against empirical ground-truth base rates.
 */
export function computeCompositeEvidenceScore(
  scores: CandidateVessel['scores'],
  weights = defaultConfig.weights
): number {
  const weightedSum =
    scores.satellite * weights.satellite +
    scores.drift * weights.drift +
    scores.ais * weights.ais +
    scores.behaviour * weights.behaviour +
    scores.counterfactual * weights.counterfactual +
    scores.history * weights.history;

  // Boundary saturation clamp to reflect operational uncertainty
  return Math.min(96.5, Math.max(15.0, Math.round(weightedSum * 10) / 10));
}

// Backward-compatible alias for existing call sites
export const computeCalibratedScore = computeCompositeEvidenceScore;

/**
 * Classifies candidate correlation tier based on Composite Evidence Score and evidentiary sufficiency
 */
export function classifyTier(
  score: number,
  lookAlikeRisk: 'Low' | 'Moderate' | 'High',
  counterfactualIoU: number
): CorrelationTier {
  if (lookAlikeRisk === 'High' || score < defaultConfig.abstentionThreshold) {
    return 'INCONCLUSIVE';
  }
  if (score >= 85.0 && counterfactualIoU >= defaultConfig.minCounterfactualIoU) {
    return 'HIGH CORRELATION';
  }
  if (score >= 60.0) {
    return 'MODERATE CORRELATION';
  }
  return 'LOW CORRELATION';
}
