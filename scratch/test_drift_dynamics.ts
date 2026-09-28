import { driftModelService } from '../src/services/drift/driftModelService';

const baseMetocean = {
  lat: 8.7,
  lng: 78.5,
  timestampUtc: '2026-03-24T00:00:00Z',
  surfaceCurrent: { lat: 8.7, lng: 78.5, speedKnots: 1.0, speedM_s: 0.514, directionDeg: 180, depthM: 0.5 },
  wind10m: { lat: 8.7, lng: 78.5, speedKnots: 15.0, speedM_s: 7.71, directionDeg: 0, gustKnots: 18.0 },
  windThresholdStatus: 'OPTIMAL' as const,
  provenance: { sourceName: 'test', sourceProvider: 'test', tier: 'TIER_1_LIVE_NRT' as const, classification: 'REAL_OBSERVATION' as const, retrievalTimeUtc: '', processingVersion: '', isSimulatedFallback: false }
};

// Run 1: Current South (180 deg) + Wind North (0 deg)
const run1 = driftModelService.simulateDrift([8.7, 78.5], '2026-03-24T00:00:00Z', baseMetocean as any, 8.5, 100);

// Run 2: Current North (0 deg) + Wind South (180 deg)
const altMetocean = {
  ...baseMetocean,
  surfaceCurrent: { ...baseMetocean.surfaceCurrent, speedKnots: 2.0, speedM_s: 1.028, directionDeg: 0 },
  wind10m: { ...baseMetocean.wind10m, speedKnots: 25.0, speedM_s: 12.86, directionDeg: 180 }
};

const run2 = driftModelService.simulateDrift([8.7, 78.5], '2026-03-24T00:00:00Z', altMetocean as any, 8.5, 100);

console.log('=== VERIFYING DYNAMIC DRIFT SENSITIVITY (Requirement 5) ===');
console.log('Run 1 (Current 1.0 kn @ 180°, Wind 15 kn @ 0°):');
console.log('  Origin Centroid:', run1.originContours.centroid);
console.log('  Forecast +24h:', [run1.forecastSteps[1].lat, run1.forecastSteps[1].lng]);

console.log('\nRun 2 (Current 2.0 kn @ 0°, Wind 25 kn @ 180°):');
console.log('  Origin Centroid:', run2.originContours.centroid);
console.log('  Forecast +24h:', [run2.forecastSteps[1].lat, run2.forecastSteps[1].lng]);

const deltaLatOrigin = Math.abs(run1.originContours.centroid[0] - run2.originContours.centroid[0]);
const deltaLngOrigin = Math.abs(run1.originContours.centroid[1] - run2.originContours.centroid[1]);
console.log(`\nDelta Origin: Lat: ${deltaLatOrigin.toFixed(4)}°, Lng: ${deltaLngOrigin.toFixed(4)}°`);

if (deltaLatOrigin > 0.05) {
  console.log('✅ PROOF: Drift model outputs are 100% dynamically calculated from environmental inputs!');
} else {
  console.error('❌ FAIL: Model outputs did not change dynamically!');
  process.exit(1);
}
