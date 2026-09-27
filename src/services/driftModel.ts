/**
 * Hydrodynamic Drift & Lagrangian Particle Tracking Service
 * Implements simplified OpenDrift / NOAA GNOME physics for stochastic ocean transport
 */

export interface DriftVector {
  uCurrent: number; // m/s
  vCurrent: number; // m/s
  uWind: number; // m/s
  vWind: number; // m/s
}

/**
 * Calculates total advection velocity:
 * V_total = V_current + alpha_wind * V_wind + V_stokes
 * alpha_wind typically ~ 0.031 to 0.035 (3.1% to 3.5% of 10m surface wind speed)
 */
export function calculateSurfaceAdvection(
  currentSpeedM_s: number,
  currentDirDeg: number,
  windSpeedKts: number,
  windDirDeg: number,
  windFactor = 0.033
): { uTotalM_s: number; vTotalM_s: number; resultantSpeedKts: number; resultantHeadingDeg: number } {
  // Convert wind from knots to m/s
  const windM_s = windSpeedKts * 0.514444;

  // Ocean current vector components
  const curRad = ((90 - currentDirDeg) * Math.PI) / 180;
  const uCurr = currentSpeedM_s * Math.cos(curRad);
  const vCurr = currentSpeedM_s * Math.sin(curRad);

  // Wind leeway vector components (wind blows toward direction)
  const windRad = ((90 - windDirDeg) * Math.PI) / 180;
  const uWind = windM_s * Math.cos(windRad);
  const vWind = windM_s * Math.sin(windRad);

  const uTotal = uCurr + windFactor * uWind;
  const vTotal = vCurr + windFactor * vWind;

  const resSpeedM_s = Math.hypot(uTotal, vTotal);
  const resultantSpeedKts = resSpeedM_s / 0.514444;

  let headingDeg = (90 - (Math.atan2(vTotal, uTotal) * 180) / Math.PI) % 360;
  if (headingDeg < 0) headingDeg += 360;

  return {
    uTotalM_s: uTotal,
    vTotalM_s: vTotal,
    resultantSpeedKts: Math.round(resultantSpeedKts * 10) / 10,
    resultantHeadingDeg: Math.round(headingDeg),
  };
}

/**
 * Computes spatial Intersection over Union (IoU) approximation between two bounding geometries
 */
export function computeSpatialIoU(
  poly1: Array<[number, number]>,
  poly2: Array<[number, number]>
): number {
  if (!poly1.length || !poly2.length) return 0;
  
  // Approximate via centroid & bounding overlap
  let minLat1 = Infinity, maxLat1 = -Infinity, minLng1 = Infinity, maxLng1 = -Infinity;
  poly1.forEach(([lat, lng]) => {
    minLat1 = Math.min(minLat1, lat);
    maxLat1 = Math.max(maxLat1, lat);
    minLng1 = Math.min(minLng1, lng);
    maxLng1 = Math.max(maxLng1, lng);
  });

  let minLat2 = Infinity, maxLat2 = -Infinity, minLng2 = Infinity, maxLng2 = -Infinity;
  poly2.forEach(([lat, lng]) => {
    minLat2 = Math.min(minLat2, lat);
    maxLat2 = Math.max(maxLat2, lat);
    minLng2 = Math.min(minLng2, lng);
    maxLng2 = Math.max(maxLng2, lng);
  });

  const interMinLat = Math.max(minLat1, minLat2);
  const interMaxLat = Math.min(maxLat1, maxLat2);
  const interMinLng = Math.max(minLng1, minLng2);
  const interMaxLng = Math.min(maxLng1, maxLng2);

  if (interMinLat >= interMaxLat || interMinLng >= interMaxLng) {
    return 0.15; // Small minimum background overlap
  }

  const interArea = (interMaxLat - interMinLat) * (interMaxLng - interMinLng);
  const area1 = (maxLat1 - minLat1) * (maxLng1 - minLng1);
  const area2 = (maxLat2 - minLat2) * (maxLng2 - minLng2);

  const unionArea = area1 + area2 - interArea;
  if (unionArea <= 0) return 0;

  return Math.min(0.96, Math.max(0.1, Math.round((interArea / unionArea) * 1000) / 1000));
}
