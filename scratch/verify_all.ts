import { mockIncidents } from '../src/data/mockIncidents.ts';
import { runForwardSimulation } from '../src/services/counterfactualSimulator.ts';
import { generateForensicInvestigationPDF } from '../src/services/pdfExporter.ts';

console.log('--- STARTING COMPREHENSIVE SIH 2026 VERIFICATION ---');

// 1. Verify Incidents
console.log(`Verifying ${mockIncidents.length} mock incidents...`);
for (const incident of mockIncidents) {
  console.log(`Checking Incident ${incident.id} (${incident.region})...`);
  
  if (!incident.coordinates || incident.coordinates.length !== 2) {
    throw new Error(`Incident ${incident.id} missing coordinates`);
  }
  if (incident.candidateVessels && incident.candidateVessels.length > 0) {
    // Test In-silico Forward Simulation for all candidate vessels
    for (const cand of incident.candidateVessels) {
      const simResult = runForwardSimulation(cand, incident);
      if (!simResult || typeof simResult.spatialIoU !== 'number') {
        throw new Error(`Simulation failed for ${incident.id} - ${cand.name}`);
      }
    }
  } else {
    console.log(`  (Note: ${incident.id} is in initial screening triage with 0 candidates)`);
  }

  // Test PDF generation
  try {
    const doc = generateForensicInvestigationPDF(incident);
    const pages = doc.getNumberOfPages();
    if (pages < 2) {
      throw new Error(`PDF for ${incident.id} only has ${pages} pages`);
    }
  } catch (err) {
    throw new Error(`PDF generation threw error for ${incident.id}: ${err}`);
  }
}

console.log('✅ ALL INCIDENTS, SIMULATION RUNS, AND PDF REPORTS VERIFIED SUCCESSFULLY!');
