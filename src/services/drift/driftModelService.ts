import { 
  DriftSimulationResult, 
  HindcastStep, 
  ForecastStep, 
  OriginProbabilityContour 
} from './driftTypes';
import { EnvironmentalPointConditions } from '../metocean/metoceanTypes';

export class DriftModelService {
  private static instance: DriftModelService;

  private constructor() {}

  public static getInstance(): DriftModelService {
    if (!DriftModelService.instance) {
      DriftModelService.instance = new DriftModelService();
    }
    return DriftModelService.instance;
  }

  /**
   * Runs the full AquaTrace Lagrangian Drift Model:
   * 1. Backward Hindcast with stochastic diffusion ensemble
   * 2. Origin Probability Density contour generation (P50, P80, P95)
   * 3. Forward Forecast with expanding uncertainty envelope (+12h, +24h, +48h)
   */
  public simulateDrift(
    slickCentroid: [number, number],
    observationTimeUtc: string,
    metocean: EnvironmentalPointConditions,
    hindcastHours: number = 8.5,
    particleCount: number = 150
  ): DriftSimulationResult {
    const obsTimeMs = new Date(observationTimeUtc).getTime();
    const windageFactor = 0.03; // 3% wind leeway drift factor
    const D = 1.2; // Brownian horizontal diffusion coefficient (m^2/s)
    const dtSeconds = 1800; // 30 minute integration step
    const totalSteps = Math.round((hindcastHours * 3600) / dtSeconds);

    // Current & Wind vector components in m/s
    // Environmental current flows toward directionDeg
    const currentRad = (metocean.surfaceCurrent.directionDeg * Math.PI) / 180;
    const uCurrent = metocean.surfaceCurrent.speedM_s * Math.sin(currentRad);
    const vCurrent = metocean.surfaceCurrent.speedM_s * Math.cos(currentRad);

    // Wind blows toward directionDeg + 180 (meteorological convention)
    const windTowardRad = ((metocean.wind10m.directionDeg + 180) % 360) * (Math.PI / 180);
    const uWind = metocean.wind10m.speedM_s * Math.sin(windTowardRad);
    const vWind = metocean.wind10m.speedM_s * Math.cos(windTowardRad);

    // Combined net surface drift velocity
    const uNet = uCurrent + (windageFactor * uWind);
    const vNet = vCurrent + (windageFactor * vWind);

    // Geodesic conversions
    const R = 6371000; // Earth radius in meters
    const latRad = (slickCentroid[0] * Math.PI) / 180;
    const mPerDegLat = (Math.PI / 180) * R;
    const mPerDegLng = (Math.PI / 180) * R * Math.cos(latRad);

    // Initialize particle ensemble at detected slick centroid with initial spatial spread
    let particles = Array.from({ length: particleCount }, (_, idx) => {
      const angle = (idx / particleCount) * 2 * Math.PI;
      const radiusM = 200 + ((idx % 7) * 40);
      return {
        lat: slickCentroid[0] + (radiusM * Math.cos(angle)) / mPerDegLat,
        lng: slickCentroid[1] + (radiusM * Math.sin(angle)) / mPerDegLng
      };
    });

    const hindcastSteps: HindcastStep[] = [];

    // Step 0 (Observation time)
    hindcastSteps.push({
      timeUtc: observationTimeUtc,
      hoursAgo: 0,
      centroidLat: slickCentroid[0],
      centroidLng: slickCentroid[1],
      currentVelocityKnots: metocean.surfaceCurrent.speedKnots,
      currentDirectionDeg: metocean.surfaceCurrent.directionDeg,
      windSpeedKnots: metocean.wind10m.speedKnots,
      windDirectionDeg: metocean.wind10m.directionDeg,
      particlePositions: particles.map(p => [p.lat, p.lng] as [number, number])
    });

    // Backward numerical integration: position(t - dt) = position(t) - drift * dt + noise
    let curCentroidLat = slickCentroid[0];
    let curCentroidLng = slickCentroid[1];

    for (let step = 1; step <= totalSteps; step++) {
      const timeMs = obsTimeMs - (step * dtSeconds * 1000);
      const hoursAgo = Math.round(((step * dtSeconds) / 3600) * 10) / 10;

      // Deterministic backward translation
      const dxM = -uNet * dtSeconds;
      const dyM = -vNet * dtSeconds;

      curCentroidLat += dyM / mPerDegLat;
      curCentroidLng += dxM / mPerDegLng;

      // Particle random walk diffusion
      const diffSigma = Math.sqrt(2 * D * dtSeconds);

      particles = particles.map(p => {
        const randX = (Math.random() - 0.5) * 2 * diffSigma;
        const randY = (Math.random() - 0.5) * 2 * diffSigma;
        return {
          lat: p.lat + (dyM + randY) / mPerDegLat,
          lng: p.lng + (dxM + randX) / mPerDegLng
        };
      });

      // Record key milestones (every 2 hours and final)
      if (step % 4 === 0 || step === totalSteps) {
        hindcastSteps.push({
          timeUtc: new Date(timeMs).toISOString(),
          hoursAgo,
          centroidLat: Math.round(curCentroidLat * 10000) / 10000,
          centroidLng: Math.round(curCentroidLng * 10000) / 10000,
          currentVelocityKnots: metocean.surfaceCurrent.speedKnots,
          currentDirectionDeg: metocean.surfaceCurrent.directionDeg,
          windSpeedKnots: metocean.wind10m.speedKnots,
          windDirectionDeg: metocean.wind10m.directionDeg,
          particlePositions: particles.map(p => [
            Math.round(p.lat * 10000) / 10000,
            Math.round(p.lng * 10000) / 10000
          ] as [number, number])
        });
      }
    }

    // Origin Probability Contours (P50, P80, P95) calculated from final particle ensemble covariance
    const finalParticles = particles;
    let sumLat = 0, sumLng = 0;
    for (const p of finalParticles) {
      sumLat += p.lat;
      sumLng += p.lng;
    }
    const originLat = sumLat / particleCount;
    const originLng = sumLng / particleCount;

    // Calculate variance in metric space
    let varX = 0, varY = 0;
    for (const p of finalParticles) {
      const dy = (p.lat - originLat) * mPerDegLat;
      const dx = (p.lng - originLng) * mPerDegLng;
      varX += dx * dx;
      varY += dy * dy;
    }
    const sigmaX = Math.sqrt(varX / particleCount);
    const sigmaY = Math.sqrt(varY / particleCount);

    const generateEllipse = (scale: number): Array<[number, number]> => {
      const points: Array<[number, number]> = [];
      const numPts = 32;
      const rx = sigmaX * scale;
      const ry = sigmaY * scale;

      for (let i = 0; i <= numPts; i++) {
        const theta = (i / numPts) * 2 * Math.PI;
        const xM = rx * Math.cos(theta);
        const yM = ry * Math.sin(theta);
        points.push([
          Math.round((originLat + yM / mPerDegLat) * 10000) / 10000,
          Math.round((originLng + xM / mPerDegLng) * 10000) / 10000
        ]);
      }
      return points;
    };

    const originContours: OriginProbabilityContour = {
      p50: generateEllipse(1.177), // Chi-square 50%
      p80: generateEllipse(1.794), // Chi-square 80%
      p95: generateEllipse(2.447), // Chi-square 95%
      centroid: [Math.round(originLat * 10000) / 10000, Math.round(originLng * 10000) / 10000],
      areaKm2: Math.round(((Math.PI * sigmaX * sigmaY * 1.794 * 1.794) / 1e6) * 10) / 10
    };

    // Forward Forecast (+12h, +24h, +48h)
    const forecastSteps: ForecastStep[] = [];
    const forecastIntervalsHours = [12, 24, 48];

    for (const h of forecastIntervalsHours) {
      const fwdTimeMs = obsTimeMs + (h * 3600 * 1000);
      const fwdDxM = uNet * (h * 3600);
      const fwdDyM = vNet * (h * 3600);

      const fwdLat = slickCentroid[0] + (fwdDyM / mPerDegLat);
      const fwdLng = slickCentroid[1] + (fwdDxM / mPerDegLng);

      // Uncertainty grows with sqrt(t)
      const uncertaintyRadiusKm = Math.round((1.5 + (0.35 * Math.sqrt(h))) * 10) / 10;
      const conePoints: Array<[number, number]> = [];
      const numPts = 16;
      for (let i = 0; i <= numPts; i++) {
        const theta = (i / numPts) * 2 * Math.PI;
        conePoints.push([
          Math.round((fwdLat + (uncertaintyRadiusKm * 1000 * Math.sin(theta)) / mPerDegLat) * 10000) / 10000,
          Math.round((fwdLng + (uncertaintyRadiusKm * 1000 * Math.cos(theta)) / mPerDegLng) * 10000) / 10000
        ]);
      }

      forecastSteps.push({
        timeUtc: new Date(fwdTimeMs).toISOString(),
        hoursAhead: h,
        lat: Math.round(fwdLat * 10000) / 10000,
        lng: Math.round(fwdLng * 10000) / 10000,
        uncertaintyRadiusKm,
        conePolygon: conePoints,
        windForcingTimestampUtc: observationTimeUtc
      });
    }

    return {
      simulationId: `SIM-LAG-${Date.now().toString(36).toUpperCase()}`,
      initialSlickCentroid: slickCentroid,
      observationTimeUtc,
      particleCount,
      diffusionCoefficientM2_s: D,
      windDriftFactor: windageFactor,
      hindcastSteps,
      originContours,
      forecastSteps,
      provenance: {
        sourceName: 'AquaTrace Lagrangian Drift Engine (v2.4)',
        sourceProvider: 'AquaTrace Physical Oceanography Pipeline',
        tier: 'TIER_1_LIVE_NRT',
        classification: 'MODEL_DERIVED',
        observationTimeUtc,
        retrievalTimeUtc: new Date().toISOString(),
        processingVersion: 'Euler-Maruyama Stochastic Integration (N=150)',
        isSimulatedFallback: false,
        citationNotice: 'Calculated using instantaneous metocean vectors.'
      }
    };
  }
}

export const driftModelService = DriftModelService.getInstance();
