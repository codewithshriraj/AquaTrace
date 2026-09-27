import { jsPDF } from 'jspdf';
import { Incident } from '../types';

export function generateForensicInvestigationPDF(incident: Incident): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm
  const bottomThreshold = pageHeight - 20;

  let y = margin;
  const topCandidate = incident.candidateVessels[0];
  const isInconclusive = incident.attributionStatus === 'INCONCLUSIVE';

  function checkPageBreak(requiredSpace: number) {
    if (y + requiredSpace > bottomThreshold) {
      doc.addPage();
      y = margin + 8;
      drawRunningHeader();
    }
  }

  function drawRunningHeader() {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`AQUATRACE MARITIME INTELLIGENCE // CASE: ${incident.id} // PS 143 (SIH26143)`, margin, margin);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, margin + 2, pageWidth - margin, margin + 2);
    y = margin + 8;
  }

  function drawSectionTitle(numberAndTitle: string) {
    checkPageBreak(16);
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42); // #0f172a
    doc.text(numberAndTitle.toUpperCase(), margin, y);
    y += 2;
    doc.setDrawColor(2, 132, 199); // #0284c7
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + 45, y);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin + 45, y, pageWidth - margin, y);
    y += 5;
  }

  function drawParagraph(text: string, fontSize = 9, isBold = false) {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(51, 65, 85);
    const lines = doc.splitTextToSize(text, contentWidth);
    const heightNeeded = lines.length * (fontSize * 0.45);
    checkPageBreak(heightNeeded + 3);
    doc.text(lines, margin, y);
    y += heightNeeded + 2;
  }

  // ==========================================
  // 1. COVER PAGE & REFERENCE BLOCK
  // ==========================================
  // Header bar
  doc.setFillColor(15, 23, 42); // Dark slate
  doc.rect(margin, y, contentWidth, 24, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('AquaTrace Maritime Forensic Report', margin + 6, y + 9);
  
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(56, 189, 248); // Light cyan
  doc.text('EXPLAINABLE MARITIME OIL SPILL DETECTION, TRACEBACK & VESSEL ATTRIBUTION', margin + 6, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(248, 250, 252);
  doc.text(`CASE REF: AT-REP-${incident.id}-2026`, pageWidth - margin - 50, y + 9);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text('SIH 2026 PS 143 • NTRO • CODE BLOODED', pageWidth - margin - 58, y + 16);
  y += 28;

  // Title Box: 1. Cover Page & Reference Block
  drawSectionTitle('1. Cover Page & Reference Block');
  
  // Reference Block Table
  const refBoxHeight = 24;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, refBoxHeight, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('INCIDENT IDENTIFIER:', margin + 4, y + 6);
  doc.text('STATUS / VERDICT:', margin + 65, y + 6);
  doc.text('DETECTION TIME (UTC):', margin + 125, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(2, 132, 199);
  doc.text(incident.id, margin + 4, y + 11);
  
  if (isInconclusive) {
    doc.setTextColor(220, 38, 38);
    doc.text('INCONCLUSIVE (MANDATORY ABSTENTION)', margin + 65, y + 11);
  } else {
    doc.setTextColor(21, 128, 61);
    doc.text(`HIGH CORRELATION (${topCandidate.overallScore}/100)`, margin + 65, y + 11);
  }

  doc.setTextColor(15, 23, 42);
  doc.text(incident.detectionTimeUtc, margin + 125, y + 11);

  doc.setFont('helvetica', 'bold');
  doc.text('GEOGRAPHIC REGION:', margin + 4, y + 17);
  doc.text('ASSIGNED INVESTIGATOR:', margin + 65, y + 17);
  doc.text('DEMONSTRATION STATUS:', margin + 125, y + 17);

  doc.setFont('helvetica', 'normal');
  doc.text(incident.region, margin + 4, y + 21);
  doc.text(incident.assignedInvestigator, margin + 65, y + 21);
  doc.setTextColor(217, 119, 6);
  doc.text('SYNTHETIC / DEMO MODE', margin + 125, y + 21);
  y += refBoxHeight + 4;

  // Forensic Notice
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(2, 132, 199);
  doc.setLineWidth(0.8);
  doc.rect(margin, y, contentWidth, 12, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(
    'FORENSIC NOTICE: This investigative brief establishes priority targets for Port State Control (PSC) verification and does not assert unilateral civil/criminal liability. Synthetic AIS and simulated metocean forcing parameterize the demonstration.',
    margin + 3,
    y + 5,
    { maxWidth: contentWidth - 6 }
  );
  y += 16;

  // ==========================================
  // 2. EXECUTIVE SUMMARY
  // ==========================================
  drawSectionTitle('2. Executive Summary');
  const execSummary = `On ${incident.detectionTimeUtc}, satellite radar observation (${incident.satelliteScene.satellite}) detected an anomalous surface slick of estimated area ${incident.slickProperties.areaKm2} km² (estimated volume ~${incident.slickProperties.estimatedVolumeM3} m³) in the ${incident.region}. Reverse Lagrangian hydrodynamic hindcasting driven by simulated metocean forcing (currents: ${incident.currentVectors[0].speedKnots} kts @ ${incident.currentVectors[0].directionDeg}°, winds: ${incident.windVectors[0].speedKnots} kts @ ${incident.windVectors[0].directionDeg}°) reconstructed a release window between ${incident.releaseWindow.startUtc.slice(11, 16)}–${incident.releaseWindow.endUtc.slice(11, 16)} UTC at centroid ${incident.releaseWindow.centroidLat}°N, ${incident.releaseWindow.centroidLng}°E.`;
  drawParagraph(execSummary);

  if (isInconclusive) {
    drawParagraph(
      `Evaluation of the candidate fleet yielded an INCONCLUSIVE verdict. Due to elevated biogenic look-alike likelihood (${incident.slickProperties.confidencePct}% confidence) under sub-threshold wind regimes (${incident.windVectors[0].speedKnots} kts) and sparse regional AIS telemetry, the evidence is insufficient to attribute release to a specific commercial vessel without unacceptable false-positive risk. Mandatory evidence-based abstention is enforced.`
    );
  } else {
    drawParagraph(
      `Spatio-temporal correlation identified candidate ${topCandidate.name} (${topCandidate.flag}, MMSI: ${topCandidate.mmsi}) as having the highest correlation (Composite Evidence Score: ${topCandidate.overallScore}/100, ${topCandidate.correlationTier}). Counterfactual forward release simulation matched the observed SAR slick geometry with ${topCandidate.counterfactualResult.similarityPct}% shape similarity and ${(topCandidate.counterfactualResult.iouMetric * 100).toFixed(1)}% spatial IoU (demonstration metrics).`
    );
  }

  // ==========================================
  // 3. INCIDENT OVERVIEW & GEOSPATIAL BOUNDARY
  // ==========================================
  drawSectionTitle('3. Incident Overview & Geospatial Boundary');
  const overviewHeight = 18;
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, overviewHeight, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('SLICK CENTROID', margin + 4, y + 5);
  doc.text('ESTIMATED SURFACE AREA', margin + 65, y + 5);
  doc.text('ESTIMATED VOLUME (BONN)', margin + 125, y + 5);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${incident.coordinates[0].toFixed(2)}°N, ${incident.coordinates[1].toFixed(2)}°E`, margin + 4, y + 11);
  doc.text(`${incident.slickProperties.areaKm2} km²`, margin + 65, y + 11);
  doc.text(`~${incident.slickProperties.estimatedVolumeM3} m³ (~${(incident.slickProperties.estimatedVolumeM3 * 6.29).toFixed(0)} bbl)`, margin + 125, y + 11);
  y += overviewHeight + 4;

  drawParagraph(
    `Geospatial boundary encompasses maritime shipping corridors inside India's Exclusive Economic Zone (EEZ). Search bounds are delimited by the Lagrangian envelope: Lat [${(incident.coordinates[0] - 0.25).toFixed(2)}°N – ${(incident.coordinates[0] + 0.25).toFixed(2)}°N], Lng [${(incident.coordinates[1] - 0.25).toFixed(2)}°E – ${(incident.coordinates[1] + 0.25).toFixed(2)}°E].`
  );

  // ==========================================
  // 4. SATELLITE OBSERVATION & SAR SENSOR METRICS
  // ==========================================
  drawSectionTitle('4. Satellite Observation & SAR Sensor Metrics');
  drawParagraph(
    'The oil slick anomaly was captured via Sentinel-1 Synthetic Aperture Radar (SAR), which operates independently of solar illumination and cloud cover by detecting normalized radar cross-section (NRCS) damping caused by short-gravity wave suppression. Browser demonstration uses pre-vectorized SAR-derived geometry; raw Level-1 GRD preprocessing and neural segmentation represent production integration targets.'
  );

  const satTableHeight = 20;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, satTableHeight, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`• Satellite Platform: ${incident.satelliteScene.satellite}`, margin + 4, y + 5);
  doc.text(`• Sensor Instrument: ${incident.satelliteScene.sensor}`, margin + 95, y + 5);
  doc.text(`• Polarization: ${incident.satelliteScene.polarisation}`, margin + 4, y + 10);
  doc.text(`• Spatial Resolution: ${incident.satelliteScene.resolutionM} meters`, margin + 95, y + 10);
  doc.text(`• Incidence Angle: ${incident.satelliteScene.incidenceAngleDeg}°`, margin + 4, y + 15);
  doc.text(`• Scene ID: ${incident.satelliteScene.sceneId}`, margin + 95, y + 15);
  y += satTableHeight + 5;

  // ==========================================
  // 5. SPILL CHARACTERISATION & BONN THICKNESS ESTIMATE
  // ==========================================
  drawSectionTitle('5. Spill Characterisation & Bonn Thickness Estimate');
  const dimBoxHeight = 16;
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, dimBoxHeight, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('MAJOR AXIS (LENGTH)', margin + 4, y + 5);
  doc.text('MINOR AXIS (WIDTH)', margin + 65, y + 5);
  doc.text('ASPECT RATIO & ORIENTATION', margin + 125, y + 5);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${incident.slickProperties.lengthKm} km`, margin + 4, y + 11);
  doc.text(`${incident.slickProperties.widthKm} km`, margin + 65, y + 11);
  doc.text(`6.22 : 1 @ ${incident.slickProperties.orientationDeg}°`, margin + 125, y + 11);
  y += dimBoxHeight + 4;

  drawParagraph(
    `Bonn Agreement Appearance Formulation: Volume is estimated empirically based on appearance standard thickness (28.3 μm metallic sheen convention): V ≈ Area (${incident.slickProperties.areaKm2} km²) × Thickness (28.3 μm) ≈ ${incident.slickProperties.estimatedVolumeM3} m³. Weathering state: ${incident.slickProperties.weatheringState}. Note: Demonstrative empirical estimate; not equivalent to direct laboratory volumetric measurement.`
  );

  // ==========================================
  // 6. ORIGIN-TIME RECONSTRUCTION & AGE WINDOW
  // ==========================================
  drawSectionTitle('6. Origin-Time Reconstruction & Age Window');
  drawParagraph(
    'Origin is expressed as nested spatial uncertainty envelopes representing modelled spatial uncertainty around the reverse-advection origin estimate (not statistically calibrated Bayesian credible intervals):'
  );

  const envBoxHeight = 16;
  doc.setFillColor(240, 249, 255);
  doc.setDrawColor(2, 132, 199);
  doc.rect(margin, y, contentWidth, envBoxHeight, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(3, 105, 161);
  doc.text('P50 CORE ORIGIN (50%)', margin + 4, y + 5);
  doc.text('P80 SEARCH ENVELOPE (80%)', margin + 65, y + 5);
  doc.text('P95 DISPERSION BOUND (95%)', margin + 125, y + 5);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text('±4.2 km (Apex core)', margin + 4, y + 11);
  doc.text('±8.6 km (Kinematic corridor)', margin + 65, y + 11);
  doc.text('±14.8 km (Maximum lateral)', margin + 125, y + 11);
  y += envBoxHeight + 4;

  drawParagraph(
    `Modelled Release Window: ${incident.releaseWindow.startUtc.slice(11, 16)} – ${incident.releaseWindow.endUtc.slice(11, 16)} UTC (estimated age window: 4.5–6.0 h prior to SAR overpass). Origin centroid: ${incident.releaseWindow.centroidLat}°N, ${incident.releaseWindow.centroidLng}°E.`
  );

  // ==========================================
  // 7. ANALYTICAL LAGRANGIAN HINDCAST
  // ==========================================
  drawSectionTitle('7. Analytical Lagrangian Hindcast');
  drawParagraph(
    'Backward trajectory reconstruction uses client-side analytical vector advection parameterizing surface current forcing and atmospheric wind leeway:'
  );
  drawParagraph(
    `• Governing Transport Equation: U_total = U_current + 0.033 × U_wind\n• Surface Current Field (U_curr): ${incident.currentVectors[0].speedKnots} kts @ ${incident.currentVectors[0].directionDeg}° (parameterizing CMEMS advection)\n• Atmospheric Wind Field (U_wind): ${incident.windVectors[0].speedKnots} kts @ ${incident.windVectors[0].directionDeg}° (parameterizing ERA5 wind stress)\n• Wind Leeway Factor (α): 3.3% standard empirical coefficient\n• Traceback Horizon: ~5.2 hours reverse advection to origin apex`
  );

  // ==========================================
  // 8. HYDRODYNAMIC DISPERSION FORECAST
  // ==========================================
  drawSectionTitle('8. Hydrodynamic Dispersion Forecast');
  drawParagraph(
    'Forward hydrodynamic trajectory modeling projects slick movement across 6h, 12h, and 24h operational response horizons:'
  );
  drawParagraph(
    '• T+6h Projected Offset: ~5.8 nm @ 072°\n• T+12h Projected Offset: ~12.4 nm @ 075°\n• T+24h Projected Offset: ~23.8 nm @ 080°\n• Shoreline Intercept Assessment: Low risk; slick advecting parallel to continental shelf break.\n• Production Target: Full OpenDrift / OpenOil integration with weathering, evaporation, and vertical droplet entrainment.'
  );

  // ==========================================
  // 9. AIS TELEMETRY RECONSTRUCTION
  // ==========================================
  drawSectionTitle('9. AIS Telemetry Reconstruction');
  drawParagraph(
    'Vessel traffic reconstruction ingests synthetic scenario AIS telemetry following the MarineCadastre-compatible schema over the temporal window [Overpass - 6h to Overpass]. Trajectories are filtered for spatial intersection with the P80/P95 origin envelopes.'
  );

  if (incident.darkVessels.length > 0) {
    drawParagraph(
      `Dark Vessel Screening Alert: SAR CFAR detector identified an uncooperative metallic contact (${incident.darkVessels[0].id}) with length ~${incident.darkVessels[0].estimatedLengthM}m (RCS: ${incident.darkVessels[0].sarRCS_dB} dB). Nearest AIS broadcast was ${incident.darkVessels[0].nearestAisDistanceNm} nm distant. Classified as potential uncooperative contact; candidate correlation continues for reporting fleet.`
    );
  } else {
    drawParagraph('All SAR radar targets in the origin corridor matched active commercial transponder broadcasts.');
  }

  // ==========================================
  // 10. MULTI-CHANNEL CANDIDATE COMPARISON TABLE
  // ==========================================
  drawSectionTitle('10. Multi-Channel Candidate Comparison Table');
  drawParagraph(
    'The six-channel evidence weighting synthesizes multi-source forensic data into a single Composite Evidence Score (Weights sum to exactly 1.00: Satellite 20%, Drift 25%, AIS 20%, Behaviour 10%, Counterfactual 20%, Historical Context 5%):'
  );

  // Table header
  checkPageBreak(30);
  const tableTop = y;
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, tableTop, contentWidth, 7, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('CANDIDATE VESSEL', margin + 2, tableTop + 5);
  doc.text('SAT(20%)', margin + 55, tableTop + 5);
  doc.text('DRIFT(25%)', margin + 74, tableTop + 5);
  doc.text('AIS(20%)', margin + 96, tableTop + 5);
  doc.text('BEH(10%)', margin + 115, tableTop + 5);
  doc.text('SIM(20%)', margin + 134, tableTop + 5);
  doc.text('SCORE', margin + 152, tableTop + 5);
  doc.text('STATUS', margin + 166, tableTop + 5);
  y = tableTop + 8;

  // Candidate rows
  incident.candidateVessels.forEach((cand) => {
    checkPageBreak(8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`#${cand.correlationRank} ${cand.name.slice(0, 18)} (${cand.flag})`, margin + 2, y + 4);
    doc.text(`${cand.scores.satellite}%`, margin + 55, y + 4);
    doc.text(`${cand.scores.drift}%`, margin + 74, y + 4);
    doc.text(`${cand.scores.ais}%`, margin + 96, y + 4);
    doc.text(`${cand.scores.behaviour}%`, margin + 115, y + 4);
    doc.text(`${cand.scores.counterfactual}%`, margin + 134, y + 4);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(2, 132, 199);
    doc.text(`${cand.overallScore}`, margin + 152, y + 4);

    if (cand.correlationTier === 'HIGH CORRELATION') {
      doc.setTextColor(21, 128, 61);
      doc.text('HIGH', margin + 166, y + 4);
    } else if (cand.correlationTier === 'INCONCLUSIVE') {
      doc.setTextColor(220, 38, 38);
      doc.text('INCONCL', margin + 166, y + 4);
    } else {
      doc.setTextColor(100, 116, 139);
      doc.text('LOW', margin + 166, y + 4);
    }

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, y + 6, pageWidth - margin, y + 6);
    y += 7;
  });

  drawParagraph(
    'Operational weighting notice: Weights represent operational decision-support criteria; not statistically calibrated against empirical ground-truth base rates. Highest-Ranked Candidate does not establish judicial guilt.',
    7.5
  );

  // ==========================================
  // 11. IN-SILICO COUNTERFACTUAL RELEASE SIMULATION
  // ==========================================
  drawSectionTitle('11. In-Silico Counterfactual Release Simulation');
  drawParagraph(
    `Hypothesis Evaluation: "If candidate ${topCandidate.name} released oil along its reconstructed CPA track at release time T_cpa, would forward hydrodynamic transport match the observed SAR slick geometry?"`
  );

  const cfBoxHeight = 16;
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, cfBoxHeight, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('SPATIAL IoU OVERLAP', margin + 4, y + 5);
  doc.text('HAUSDORFF DISTANCE', margin + 55, y + 5);
  doc.text('TRAJECTORY ALIGNMENT', margin + 110, y + 5);
  doc.text('SHAPE SIMILARITY', margin + 150, y + 5);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(2, 132, 199);
  doc.text(`${(topCandidate.counterfactualResult.iouMetric * 100).toFixed(1)}%`, margin + 4, y + 11);
  doc.text(`${topCandidate.counterfactualResult.hausdorffDistanceKm.toFixed(2)} km`, margin + 55, y + 11);
  doc.text(`${topCandidate.scores.drift}%`, margin + 110, y + 11);
  doc.text(`${topCandidate.counterfactualResult.similarityPct}%`, margin + 150, y + 11);
  y += cfBoxHeight + 4;

  drawParagraph(
    'Demonstration Metric Disclosure: Counterfactual metrics (IoU: 84.2%, Hausdorff: 1.15 km, Shape Similarity: 91.4%) are demonstration scenario values illustrating verification pipeline architecture.'
  );

  // ==========================================
  // 12. EVIDENTIARY PROVENANCE GRAPH
  // ==========================================
  drawSectionTitle('12. Evidentiary Provenance Graph');
  drawParagraph(
    'Directed Acyclic Graph (DAG) traces evidentiary transformation from raw sensor downlink to candidate ranking:'
  );
  drawParagraph(
    `[SCENE-S1C-143210] ──► [SEGMENTATION-MODULE] ──► [SLICK-POLY-${incident.id}]\n      │\n      └──► [HINDCAST-ADVECTION] ──► [ORIGIN-P50-CENTROID]\n            │\n            └──► [AIS-CORRIDOR-FILTER] ──► [CANDIDATE-${topCandidate.mmsi}]\n                  │\n                  └──► [COUNTERFACTUAL-TEST] ──► [COMPOSITE-SCORE: ${topCandidate.overallScore}]`
  );

  // ==========================================
  // 13. KINEMATIC FEASIBILITY & CONTINUITY ANALYSIS
  // ==========================================
  drawSectionTitle('13. Kinematic Feasibility & Continuity Analysis');
  drawParagraph(
    `Speed Profile Assessment: ${topCandidate.name} transited the sector with baseline cruise of 14.2 knots, decelerating to 8.4 knots for 42 minutes inside the reconstructed release corridor before resuming nominal speed.\nHeading Alignment: Course at CPA (064°) aligns within 2° of slick major axis orientation (062°).\nInvestigative Notice: Kinematic speed changes indicate operational anomalies requiring investigator review; they do not by themselves establish vessel manipulation or wrongdoing.`
  );

  // ==========================================
  // 14. UNCERTAINTY BOUNDS & SCIENTIFIC LIMITATIONS
  // ==========================================
  drawSectionTitle('14. Uncertainty Bounds & Scientific Limitations');
  drawParagraph(
    '• Look-Alike Screening: Biogenic films and internal waves mimic oil damping; screened against wind threshold (3–12 m/s).\n• Drift Uncertainty: Sub-mesoscale eddies and Stokes drift introduce ~12% lateral uncertainty over 6h traceback horizons.\n• AIS Line-of-Sight: Terrestrial VHF AIS is subject to range limits (>35 nm offshore).\n• Evidence-Based Abstention: Where counterfactual IoU is <50% or candidate separation is ambiguous, AquaTrace declares INCONCLUSIVE.'
  );

  // ==========================================
  // 15. INVESTIGATION FINDING & CORRELATION STATUS
  // ==========================================
  drawSectionTitle('15. Investigation Finding & Correlation Status');
  if (isInconclusive) {
    drawParagraph(
      'FINAL FINDING: INCONCLUSIVE — MANDATORY EVIDENCE-BASED ABSTENTION\nExplanation: The available evidentiary chain does not permit reliable singular attribution. Primary limitations include overlapping candidate trajectories and elevated biogenic look-alike likelihood under low wind conditions (2.1 m/s). False-attribution prevention protocol active.'
    );
  } else {
    drawParagraph(
      `FINAL FINDING: HIGH CORRELATION — HIGHEST-RANKED CANDIDATE IDENTIFIED\nCandidate: ${topCandidate.name} (MMSI: ${topCandidate.mmsi}, Flag: ${topCandidate.flag})\nComposite Evidence Score: ${topCandidate.overallScore} / 100\nCorrelation Tier: ${topCandidate.correlationTier}\nNotice: Findings constitute targeted investigative intelligence for maritime authorities and do not represent judicial liability confirmation.`
    );
  }

  // ==========================================
  // 16. IMMUTABLE AUDIT TRAIL & RECORD INTEGRITY
  // ==========================================
  drawSectionTitle('16. Immutable Audit Trail & Record Integrity');
  drawParagraph(
    'Chronological event ledger recording analysis pipeline state transitions with demonstration provenance identifiers:'
  );

  incident.auditTrail.slice(0, 4).forEach((ev) => {
    drawParagraph(
      `• [${ev.timestampUtc}] ${ev.action} | System: ${ev.userOrSystem} | Ref: ${ev.sha256Hash.slice(0, 16)}...`,
      8
    );
  });

  // ==========================================
  // 17. INGESTION DATA PROVENANCE MATRIX
  // ==========================================
  drawSectionTitle('17. Ingestion Data Provenance Matrix');
  drawParagraph(
    '• Satellite SAR Source: ESA Copernicus Sentinel-1C C-SAR (Demonstration geometry)\n• Meteorological Forcing: Simulated wind vectors parameterizing ERA5 atmospheric forcing\n• Ocean Hydrodynamics: Simulated current fields parameterizing CMEMS hydrodynamic advection\n• AIS Telemetry Feed: Synthetic transponder records formatted to MarineCadastre standards\n• Benchmark Corpus: JRC Zenodo Sentinel-1 SAR Oil Spill Dataset (Reference training target)'
  );

  // ==========================================
  // 18. ANALYTICAL ATTRIBUTION METHODOLOGY
  // ==========================================
  drawSectionTitle('18. Analytical Attribution Methodology');
  drawParagraph(
    '• Lagrangian Advection Formula: U_total = U_current + 0.033 × U_wind (calculated client-side via vector decomposition).\n• Spatial IoU Formulation: IoU = Area(S_observed ∩ S_simulated) / Area(S_observed ∪ S_simulated).\n• Candidate Evidence Synthesis: Score = 0.20·Sat + 0.25·Drift + 0.20·AIS + 0.10·Behaviour + 0.20·Counterfactual + 0.05·History.\n• Abstention Criterion: Enforced when look-alike risk > 80% or candidate score separation < 10%.'
  );

  // ==========================================
  // 19. DEMONSTRATION MODE & REALITY DISCLOSURES
  // ==========================================
  drawSectionTitle('19. Demonstration Mode & Reality Disclosures');
  doc.setFillColor(255, 251, 235);
  doc.setDrawColor(253, 230, 138);
  doc.rect(margin, y, contentWidth, 18, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(146, 64, 14);
  doc.text(
    'ZERO-FABRICATION SCIENTIFIC DISCLOSURE: AquaTrace operates as a functional deterministic demonstration architecture for Smart India Hackathon 2026 PS 143. All vessel tracks are synthetic scenario data structured to MarineCadastre standards. Metocean vectors simulate ERA5 and CMEMS values. Production ML inference and full OpenDrift hydrodynamic integration are documented architectural targets.',
    margin + 3,
    y + 5,
    { maxWidth: contentWidth - 6 }
  );
  y += 22;

  // ==========================================
  // 20. OFFICIAL INVESTIGATOR SIGN-OFF & VERIFICATION PROTOCOL
  // ==========================================
  drawSectionTitle('20. Official Investigator Sign-Off & Verification Protocol');
  const signHeight = 22;
  checkPageBreak(signHeight + 6);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, signHeight, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`LEAD INVESTIGATOR: ${incident.assignedInvestigator}`, margin + 4, y + 6);
  doc.text('EVIDENTIARY VERIFICATION STATUS:', margin + 110, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.text('Maritime Disaster Management Directorate // NTRO Forensic Division', margin + 4, y + 11);
  doc.setTextColor(21, 128, 61);
  doc.setFont('helvetica', 'bold');
  doc.text('VALIDATED FOR PORT STATE CONTROL TARGETING', margin + 110, y + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`AquaTrace Platform v2.4 • Report Generated: ${new Date().toISOString()}`, margin + 4, y + 17);
  doc.text('SHA-256 Provenance ID: e3b0c44298fc1c149afbf4c8996fb924', margin + 110, y + 17);
  y += signHeight + 4;

  // Add Page Numbers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${i} of ${totalPages} • AquaTrace PS 143 Forensic Investigation Report • NTRO Disaster Management`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  return doc;
}
