import fs from 'fs';
import path from 'path';
import { mockIncidents } from '../src/data/mockIncidents';
import { generateForensicInvestigationPDF } from '../src/services/pdfExporter';

const scratchDir = path.resolve('scratch');
if (!fs.existsSync(scratchDir)) {
  fs.mkdirSync(scratchDir, { recursive: true });
}

console.log('====================================================');
console.log('AQUATRACE 20-SECTION PDF EXPORT VERIFICATION SUITE');
console.log('====================================================\n');

const expectedHeadings = [
  '1. Cover Page',
  '2. Executive Summary',
  '3. Incident Overview & Geospatial Boundary',
  '4. Satellite Observation & SAR Sensor Metrics',
  '5. Spill Characterisation & Bonn Thickness Estimate',
  '6. Origin-Time Reconstruction & Age Window',
  '7. Analytical Lagrangian Hindcast',
  '8. Hydrodynamic Dispersion Forecast',
  '9. AIS Telemetry Reconstruction',
  '10. Multi-Channel Candidate Comparison Table',
  '11. In-Silico Counterfactual Release Simulation',
  '12. Evidentiary Provenance Graph',
  '13. Kinematic Feasibility & Continuity Analysis',
  '14. Uncertainty Bounds & Scientific Limitations',
  '15. Investigation Finding & Correlation Status',
  '16. Immutable Audit Trail & Record Integrity',
  '17. Ingestion Data Provenance Matrix',
  '18. Analytical Attribution Methodology',
  '19. Demonstration Mode & Reality Disclosures',
  '20. Official Investigator Sign-Off & Verification Protocol',
];

const testIncidents = [
  { id: 'OS-042', expectedScore: '89.9', expectedStatus: 'HIGH CORRELATION' },
  { id: 'OS-037', expectedScore: null, expectedStatus: 'INCONCLUSIVE' },
];

let allTestsPassed = true;

for (const testCase of testIncidents) {
  const incident = mockIncidents.find((i) => i.id === testCase.id);
  if (!incident) {
    console.error(`ERROR: Incident ${testCase.id} not found in mockIncidents!`);
    allTestsPassed = false;
    continue;
  }

  console.log(`[TESTING ${testCase.id}] Generating PDF...`);
  const doc = generateForensicInvestigationPDF(incident);
  const totalPages = doc.getNumberOfPages();
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  const filePath = path.join(scratchDir, `${testCase.id}-Forensic-Report.pdf`);
  fs.writeFileSync(filePath, pdfBuffer);

  console.log(`✓ PDF Generated: ${filePath} (${(pdfBuffer.length / 1024).toFixed(1)} KB, ${totalPages} Pages)`);

  if (totalPages < 4) {
    console.error(`✗ FAIL: Total pages is ${totalPages}, expected at least 4 pages for 20 sections!`);
    allTestsPassed = false;
  } else {
    console.log(`✓ Page Count Valid: ${totalPages} pages generated.`);
  }

  // Extract raw text streams from PDF
  const pdfContent = pdfBuffer.toString('latin1');

  console.log(`\nVerifying all 20 Section Headings for ${testCase.id}:`);
  let missingHeadings = 0;
  for (const heading of expectedHeadings) {
    // Look for heading text in PDF stream (case-insensitive substring)
    // jsPDF escapes text or outputs in parentheses e.g. (1. Cover Page...)
    const normalizedTarget = heading.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedPdf = pdfContent.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (normalizedPdf.includes(normalizedTarget)) {
      console.log(`  ✓ ${heading}: FOUND`);
    } else {
      console.error(`  ✗ ${heading}: NOT DETECTED IN PDF STREAMS!`);
      missingHeadings++;
    }
  }

  if (missingHeadings === 0) {
    console.log(`✓ All 20 Sections physically verified in ${testCase.id} PDF!`);
  } else {
    console.error(`✗ ${missingHeadings} sections missing in ${testCase.id}!`);
    allTestsPassed = false;
  }

  // Verify critical numerical metrics
  console.log(`\nVerifying Critical Metrics in ${testCase.id} PDF:`);
  if (testCase.id === 'OS-042') {
    const checks = [
      { name: 'Composite Evidence Score 89.9', pattern: '89.9' },
      { name: 'Spatial IoU 84.2%', pattern: '84.2' },
      { name: 'Hausdorff Distance 1.15 km', pattern: '1.15' },
      { name: 'Shape Similarity 91.4%', pattern: '91.4' },
      { name: 'Estimated Volume ~420 m³', pattern: '420' },
      { name: 'Satellite Weight 20%', pattern: '20%' },
      { name: 'Drift Weight 25%', pattern: '25%' },
    ];
    for (const chk of checks) {
      if (pdfContent.includes(chk.pattern)) {
        console.log(`  ✓ ${chk.name}: DETECTED`);
      } else {
        console.error(`  ✗ ${chk.name}: NOT FOUND!`);
        allTestsPassed = false;
      }
    }
  } else if (testCase.id === 'OS-037') {
    const checks = [
      { name: 'Verdict INCONCLUSIVE', pattern: 'INCONCLUSIVE' },
      { name: 'Mandatory Abstention Enforced', pattern: 'ABSTENTION' },
    ];
    for (const chk of checks) {
      if (pdfContent.includes(chk.pattern)) {
        console.log(`  ✓ ${chk.name}: DETECTED`);
      } else {
        console.error(`  ✗ ${chk.name}: NOT FOUND!`);
        allTestsPassed = false;
      }
    }
  }
  console.log('----------------------------------------------------\n');
}

if (allTestsPassed) {
  console.log('🎉 ALL VERIFICATION CHECKS PASSED PERFECTLY!');
  process.exit(0);
} else {
  console.error('❌ SOME CHECKS FAILED!');
  process.exit(1);
}
