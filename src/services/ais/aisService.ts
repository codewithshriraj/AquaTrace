import { 
  AisVesselRecord, 
  FilteredCandidateVessel, 
  CandidateScoringWeights, 
  AisGapEvent 
} from './aisTypes';
import { globalFishingWatchService } from './globalFishingWatchService';
import { EstimatedReleaseWindow } from '../detection/detectionTypes';

export const DEFAULT_CANDIDATE_WEIGHTS: CandidateScoringWeights = {
  wSpatial: 0.25,
  wTemporal: 0.25,
  wTrajectory: 0.15,
  wBehaviour: 0.15,
  wContinuity: 0.20
};

export class AisService {
  private static instance: AisService;

  private constructor() {}

  public static getInstance(): AisService {
    if (!AisService.instance) {
      AisService.instance = new AisService();
    }
    return AisService.instance;
  }

  /**
   * Transparent 5-stage AIS Candidate Screening Pipeline.
   * Computes mathematical Evidence Compatibility Score without black-box AI scores.
   */
  public async screenCandidatesForIncident(
    originCentroid: [number, number],
    releaseWindow: EstimatedReleaseWindow,
    slickOrientationDeg: number,
    weights: CandidateScoringWeights = DEFAULT_CANDIDATE_WEIGHTS
  ): Promise<FilteredCandidateVessel[]> {
    // Stage 1: Spatial Ingestion (Fetch vessels within 25 nm of origin probability region)
    const rawVessels = await globalFishingWatchService.searchVesselsInRegion(
      originCentroid[0], 
      originCentroid[1], 
      25
    );

    const results: FilteredCandidateVessel[] = [];
    const windowStartMs = new Date(releaseWindow.windowStartUtc).getTime();
    const windowEndMs = new Date(releaseWindow.windowEndUtc).getTime();

    for (const vessel of rawVessels) {
      // Find track point closest to origin centroid
      let minDistanceNm = Infinity;
      let closestTrackTimeMs = 0;
      let speedAtClosest = vessel.lastPosition.speedKnots;
      let courseAtClosest = vessel.lastPosition.courseDeg;

      for (const pt of vessel.track) {
        const dLat = (pt.lat - originCentroid[0]) * 60;
        const dLng = (pt.lng - originCentroid[1]) * 60 * Math.cos((originCentroid[0] * Math.PI) / 180);
        const distNm = Math.hypot(dLat, dLng);
        if (distNm < minDistanceNm) {
          minDistanceNm = distNm;
          closestTrackTimeMs = new Date(pt.timeUtc).getTime();
          speedAtClosest = pt.speedKnots;
          courseAtClosest = pt.courseDeg;
        }
      }

      // Stage 2: Temporal Filter (Time delta from release window in hours)
      let timeDeltaHours = 0;
      if (closestTrackTimeMs < windowStartMs) {
        timeDeltaHours = (windowStartMs - closestTrackTimeMs) / 3600000;
      } else if (closestTrackTimeMs > windowEndMs) {
        timeDeltaHours = (closestTrackTimeMs - windowEndMs) / 3600000;
      } else {
        timeDeltaHours = 0; // Exactly inside release window
      }

      // Stage 3: Trajectory Alignment (Orientation alignment between vessel course and slick axis)
      const headingDiff = Math.abs(courseAtClosest - slickOrientationDeg) % 180;
      const angleAlign = Math.min(headingDiff, 180 - headingDiff); // 0 = parallel, 90 = perpendicular
      const trajectoryScore = Math.max(0, Math.round((1 - (angleAlign / 90)) * 100));

      // Stage 4: Behaviour & Speed Profile
      let behaviourScore = 50;
      if (speedAtClosest < 8.0 && vessel.vesselType.includes('Tanker')) {
        behaviourScore = 85; // Slow steaming tanker in transit channel
      } else if (speedAtClosest < 10.0) {
        behaviourScore = 70;
      } else {
        behaviourScore = 40; // Steady transit speed
      }

      // Stage 5: AIS Continuity & Gap Detection
      let aisContinuityScore = 90;
      let gapEvent: AisGapEvent | undefined;

      // Detect if track has gaps > 30 minutes in candidate zone
      for (let i = 0; i < vessel.track.length - 1; i++) {
        const t1 = new Date(vessel.track[i].timeUtc).getTime();
        const t2 = new Date(vessel.track[i + 1].timeUtc).getTime();
        const gapMin = (t2 - t1) / 60000;

        if (gapMin > 35) {
          aisContinuityScore = 30; // Deduct for gap
          gapEvent = {
            vesselMmsi: vessel.mmsi,
            vesselName: vessel.name,
            lastObservedTimeUtc: vessel.track[i].timeUtc,
            nextObservedTimeUtc: vessel.track[i + 1].timeUtc,
            gapDurationMinutes: Math.round(gapMin),
            lastKnownLocation: [vessel.track[i].lat, vessel.track[i].lng],
            nextKnownLocation: [vessel.track[i + 1].lat, vessel.track[i + 1].lng],
            distanceDiscrepancyNm: Math.round(Math.hypot(
              vessel.track[i + 1].lat - vessel.track[i].lat,
              vessel.track[i + 1].lng - vessel.track[i].lng
            ) * 60 * 10) / 10,
            legalAssessment: 'AIS coverage/data gap detected. This may reflect receiver coverage, transmission loss, data availability, or other causes; intentional disabling cannot be inferred from this gap alone.'
          };
          break;
        }
      }

      // Scoring formulas:
      // Spatial score: 100 at 0 nm, 0 at 25 nm
      const spatialScore = Math.max(0, Math.round((1 - (minDistanceNm / 25)) * 100));
      // Temporal score: 100 inside window, decays over 6 hours
      const temporalScore = Math.max(0, Math.round((1 - Math.min(1, timeDeltaHours / 6)) * 100));

      // Weighted Evidence Compatibility Score
      const overallEvidenceScore = Math.round(
        (weights.wSpatial * spatialScore) +
        (weights.wTemporal * temporalScore) +
        (weights.wTrajectory * trajectoryScore) +
        (weights.wBehaviour * behaviourScore) +
        (weights.wContinuity * (100 - aisContinuityScore)) // High gap increases interest
      );

      let screeningVerdict: 'HIGH_INTEREST' | 'MODERATE_INTEREST' | 'LOW_INTEREST' | 'EXCLUDED' = 'LOW_INTEREST';
      if (overallEvidenceScore >= 70 && minDistanceNm <= 5.0) {
        screeningVerdict = 'HIGH_INTEREST';
      } else if (overallEvidenceScore >= 50 && minDistanceNm <= 12.0) {
        screeningVerdict = 'MODERATE_INTEREST';
      } else if (minDistanceNm > 20.0) {
        screeningVerdict = 'EXCLUDED';
      }

      results.push({
        vessel,
        distanceToOriginNm: Math.round(minDistanceNm * 10) / 10,
        timeOverlapHours: Math.round(timeDeltaHours * 10) / 10,
        trajectoryAlignmentScore: trajectoryScore,
        behaviourAnomalyScore: behaviourScore,
        aisContinuityScore,
        overallEvidenceScore,
        aisGapEvent: gapEvent,
        screeningVerdict,
        provenance: {
          sourceName: 'AquaTrace AIS Multi-Criteria Evidence Filter',
          sourceProvider: 'AquaTrace Attribution Service',
          tier: 'TIER_1_LIVE_NRT',
          classification: 'MODEL_DERIVED',
          retrievalTimeUtc: new Date().toISOString(),
          processingVersion: 'AIS Kinematic Screening v2.4',
          isSimulatedFallback: false,
          citationNotice: 'Calculated using spatial proximity, temporal overlap, and heading alignment.'
        }
      });
    }

    // Sort descending by overall evidence compatibility score
    return results.sort((a, b) => b.overallEvidenceScore - a.overallEvidenceScore);
  }
}

export const aisService = AisService.getInstance();
