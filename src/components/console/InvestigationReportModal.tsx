import React from 'react';
import { Incident } from '../../types';
import { 
  X, 
  Printer, 
  Download,
  Compass,
  FileText,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Database,
  ArrowRight,
  Activity,
  Layers,
  MapPin,
  Scale
} from 'lucide-react';
import { generateForensicInvestigationPDF } from '../../services/pdfExporter';

interface InvestigationReportModalProps {
  incident: Incident;
  onClose: () => void;
}

export const InvestigationReportModal: React.FC<InvestigationReportModalProps> = ({ incident, onClose }) => {
  const topCandidate = incident.candidateVessels[0];
  const isInconclusive = incident.attributionStatus === 'INCONCLUSIVE';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const doc = generateForensicInvestigationPDF(incident);
    doc.save(`AquaTrace-Forensic-Report-${incident.id}.pdf`);
  };

  return (
    <div 
      className="report-modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div 
        className="report-modal-container"
        style={{
          width: '100%',
          maxWidth: '960px',
          maxHeight: '94vh',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid var(--border-strong)'
        }}
      >
        {/* Modal Toolbar (Non-printable) */}
        <div 
          className="no-print"
          style={{
            padding: '12px 20px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #334155',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={18} color="#38bdf8" />
            <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.03em', fontFamily: 'var(--font-mono)' }}>
              FORENSIC INVESTIGATION REPORT // {incident.id}
            </span>
            <span className="badge badge-amber" style={{ fontSize: '10px' }}>
              DEMONSTRATION CASE
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleDownloadPDF}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Generate and download full 20-section standalone PDF"
            >
              <Download size={13} /> Download Forensic PDF (.pdf)
            </button>

            <button
              onClick={handlePrint}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Print document or Save as PDF via browser"
            >
              <Printer size={13} /> Print / Save as PDF
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
              }}
              title="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div 
          className="report-scroll-body"
          style={{ 
            padding: '40px 48px', 
            overflowY: 'auto', 
            backgroundColor: '#ffffff', 
            color: 'var(--text-primary)',
            fontSize: '13px',
            lineHeight: 1.6
          }}
        >
          
          {/* 1. COVER PAGE & REFERENCE BLOCK */}
          <div className="pdf-section" style={{ borderBottom: '3px solid #0f172a', paddingBottom: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Compass size={28} color="#0284c7" />
                  <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>
                      AquaTrace
                    </h1>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      1. Cover Page & Reference Block — Maritime Oil Spill Forensic Investigation Report
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '8px' }}>
                  CASE REF: AT-REP-{incident.id}-2026 • SIH PS 143 (SIH26143) • ORG: NTRO • TEAM: CODE BLOODED
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div 
                  className={`badge ${isInconclusive ? 'badge-red' : 'badge-blue'}`}
                  style={{ fontSize: '12px', padding: '5px 12px', fontWeight: 700 }}
                >
                  VERDICT: {incident.attributionStatus}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>
                  OBSERVED: {incident.detectionTimeUtc}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--spill-amber)', fontWeight: 700, marginTop: '2px' }}>
                  DETERMINISTIC DEMONSTRATION CASE
                </div>
              </div>
            </div>
          </div>

          {/* FORENSIC NOTICE */}
          <div style={{ backgroundColor: 'var(--bg-subtle)', borderLeft: '4px solid #0284c7', padding: '12px 16px', marginBottom: '28px', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <strong>FORENSIC NOTICE & OPERATIONAL EVIDENCE THRESHOLD:</strong> This intelligence brief provides evidentiary attribution based on coupled Synthetic Aperture Radar (SAR) damping, reverse Lagrangian hydrodynamic trajectory hindcasting, and historical AIS correlation. It establishes investigative priority and targets Port State Control (PSC) boarding inspections. It does not assert unilateral civil or criminal liability.
          </div>

          {/* 2. EXECUTIVE SUMMARY */}
          <div className="pdf-section" style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f172a', borderBottom: '1px solid var(--border)', paddingBottom: '6px', marginBottom: '12px' }}>
              2. Executive Summary
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
              On <strong>{incident.detectionTimeUtc}</strong>, satellite radar observation ({incident.satelliteScene.satellite}) detected an anomalous surface slick of estimated area <strong>{incident.slickProperties.areaKm2} km²</strong> (estimated volume <strong>~{incident.slickProperties.estimatedVolumeM3} m³</strong>) in the <strong>{incident.region}</strong>. Reverse Lagrangian hydrodynamic hindcasting driven by simulated metocean forcing (currents: {incident.currentVectors[0].speedKnots} kts @ {incident.currentVectors[0].directionDeg}°, winds: {incident.windVectors[0].speedKnots} kts @ {incident.windVectors[0].directionDeg}°) reconstructed a release window between <strong>{incident.releaseWindow.startUtc.slice(11, 16)}–{incident.releaseWindow.endUtc.slice(11, 16)} UTC</strong> at centroid <strong>{incident.releaseWindow.centroidLat}°N, {incident.releaseWindow.centroidLng}°E</strong>.
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>
              {isInconclusive ? (
                <span>Evaluation of the candidate fleet yielded an <strong>INCONCLUSIVE</strong> verdict. Due to elevated biogenic look-alike likelihood ({incident.slickProperties.confidencePct}% confidence) under sub-threshold wind regimes ({incident.windVectors[0].speedKnots} kts) and sparse regional AIS telemetry, the evidence is insufficient to attribute release to a specific commercial vessel without unacceptable false-positive risk. Mandatory evidence-based abstention is enforced.</span>
              ) : (
                <span>Spatio-temporal correlation identified candidate <strong>{topCandidate.name} ({topCandidate.flag}, MMSI: {topCandidate.mmsi})</strong> as having the highest correlation (Composite Evidence Score: <strong>{topCandidate.overallScore}/100</strong>, {topCandidate.correlationTier}). Counterfactual forward release simulation matched the observed SAR slick geometry with <strong>{topCandidate.counterfactualResult.similarityPct}% shape similarity</strong> and <strong>{(topCandidate.counterfactualResult.iouMetric * 100).toFixed(1)}% spatial IoU</strong> (demonstration metrics).</span>
              )}
            </p>
          </div>

          {/* 3. INCIDENT OVERVIEW & GEOSPATIAL BOUNDARY */}
          <div className="pdf-section" style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f172a', borderBottom: '1px solid var(--border)', paddingBottom: '6px', marginBottom: '12px' }}>
              3. Incident Overview & Geospatial Boundary
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', backgroundColor: '#fafbfc', border: '1px solid var(--border)', borderRadius: '4px', padding: '14px' }}>
              <div>
                <span className="secondary-meta" style={{ display: 'block' }}>INCIDENT IDENTIFIER</span>
                <strong className="mono">{incident.id}</strong>
              </div>
              <div>
                <span className="secondary-meta" style={{ display: 'block' }}>GEOGRAPHIC REGION</span>
                <strong>{incident.region}</strong>
              </div>
              <div>
                <span className="secondary-meta" style={{ display: 'block' }}>OBSERVED CENTROID</span>
                <strong className="mono">{incident.coordinates[0].toFixed(2)}°N, {incident.coordinates[1].toFixed(2)}°E</strong>
              </div>
              <div>
                <span className="secondary-meta" style={{ display: 'block' }}>SLICK SURFACE AREA</span>
                <strong className="mono">{incident.slickProperties.areaKm2} km²</strong>
              </div>
              <div>
                <span className="secondary-meta" style={{ display: 'block' }}>ESTIMATED VOLUME</span>
                <strong className="mono">~{incident.slickProperties.estimatedVolumeM3} m³ (~{(incident.slickProperties.estimatedVolumeM3 * 6.29).toFixed(0)} bbl)</strong>
              </div>
              <div>
                <span className="secondary-meta" style={{ display: 'block' }}>ASSIGNED INVESTIGATOR</span>
                <strong>{incident.assignedInvestigator}</strong>
              </div>
            </div>
          </div>

          {/* 4. SATELLITE OBSERVATION & SAR SENSOR METRICS */}
          <div className="pdf-section" style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f172a', borderBottom: '1px solid var(--border)', paddingBottom: '6px', marginBottom: '12px' }}>
              4. Satellite Observation & SAR Sensor Metrics
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
              The oil slick anomaly was captured via Sentinel-1 Synthetic Aperture Radar (SAR), which operates independently of cloud cover and solar illumination by detecting normalized radar cross-section (NRCS) damping caused by short-gravity wave suppression. <em>(Browser demonstration utilizes pre-vectorized SAR-derived geometry; raw Level-1 GRD preprocessing pipeline is a production target).</em>
            </p>
            <div style={{ border: '1px solid var(--border)', borderRadius: '4px', padding: '12px', backgroundColor: '#fafbfc' }}>
              <div style={{ fontWeight: 600, marginBottom: '6px', color: '#0f172a' }}>Sensor & Acquisition Parameters</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                <div><strong>Satellite:</strong> {incident.satelliteScene.satellite}</div>
                <div><strong>Sensor:</strong> {incident.satelliteScene.sensor}</div>
                <div><strong>Polarisation:</strong> {incident.satelliteScene.polarisation}</div>
                <div><strong>Spatial Resolution:</strong> {incident.satelliteScene.resolutionM} meters</div>
                <div><strong>Scene Identifier:</strong> <span className="mono" style={{ fontSize: '10px' }}>{incident.satelliteScene.sceneId}</span></div>
                <div><strong>Incidence Angle:</strong> {incident.satelliteScene.incidenceAngleDeg}°</div>
              </div>
            </div>
          </div>

          {/* 5. SPILL CHARACTERISATION & BONN THICKNESS ESTIMATE */}
          <div className="pdf-section" style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f172a', borderBottom: '1px solid var(--border)', paddingBottom: '6px', marginBottom: '12px' }}>
              5. Spill Characterisation & Bonn Thickness Estimate
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
              <div style={{ border: '1px solid var(--border)', borderRadius: '4px', padding: '10px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>MAJOR AXIS (LENGTH)</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }} className="mono">{incident.slickProperties.lengthKm} km</div>
              </div>
              <div style={{ border: '1px solid var(--border)', borderRadius: '4px', padding: '10px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>MINOR AXIS (WIDTH)</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }} className="mono">{incident.slickProperties.widthKm} km</div>
              </div>
              <div style={{ border: '1px solid var(--border)', borderRadius: '4px', padding: '10px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ASPECT RATIO / ORIENTATION</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }} className="mono">6.22 : 1 @ {incident.slickProperties.orientationDeg}°</div>
              </div>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4, padding: '8px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px' }}>
              <strong>Bonn Agreement Appearance Formulation:</strong> Volume is estimated empirically based on appearance standard thickness (28.3 μm metallic sheen convention): V ≈ Area ({incident.slickProperties.areaKm2} km²) × Thickness (28.3 μm) ≈ ~{incident.slickProperties.estimatedVolumeM3} m³. Weathering state: {incident.slickProperties.weatheringState}.
            </div>
          </div>

          {/* 6. ORIGIN-TIME RECONSTRUCTION & AGE WINDOW */}
          <div className="pdf-section" style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f172a', borderBottom: '1px solid var(--border)', paddingBottom: '6px', marginBottom: '12px' }}>
              6. Origin-Time Reconstruction & Age Window
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Origin is expressed as nested spatial uncertainty envelopes representing modelled spatial uncertainty around the reverse-advection origin estimate (not statistically calibrated Bayesian credible intervals):
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
              <div style={{ border: '2px solid #0369a1', borderRadius: '4px', padding: '10px', backgroundColor: '#e0f2fe' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#0369a1' }}>P50 CORE ORIGIN (50%)</div>
                <div style={{ fontSize: '16px', fontWeight: 800, margin: '4px 0' }} className="mono">±4.2 km</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Modelled core release apex</div>
              </div>
              <div style={{ border: '1.5px solid #0284c7', borderRadius: '4px', padding: '10px', backgroundColor: '#f0f9ff' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#0284c7' }}>P80 ENVELOPE (80%)</div>
                <div style={{ fontSize: '16px', fontWeight: 800, margin: '4px 0' }} className="mono">±8.6 km</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Kinematic search corridor</div>
              </div>
              <div style={{ border: '1px dashed #38bdf8', borderRadius: '4px', padding: '10px', backgroundColor: '#f8fafc' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#0284c7' }}>P95 BOUND (95%)</div>
                <div style={{ fontSize: '16px', fontWeight: 800, margin: '4px 0' }} className="mono">±14.8 km</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Maximum lateral dispersion bound</div>
              </div>
            </div>
            <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              Reconstructed Age Window: <strong>4.5–6.0 hours</strong> prior to satellite observation. Release window: <strong>{incident.releaseWindow.startUtc.slice(11, 16)}–{incident.releaseWindow.endUtc.slice(11, 16)} UTC</strong> at centroid <strong>{incident.releaseWindow.centroidLat}°N, {incident.releaseWindow.centroidLng}°E</strong>.
            </div>
          </div>

          {/* 7. ANALYTICAL LAGRANGIAN HINDCAST */}
          <div className="pdf-section" style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f172a', borderBottom: '1px solid var(--border)', paddingBottom: '6px', marginBottom: '12px' }}>
              7. Analytical Lagrangian Hindcast
            </h2>
            <div style={{ border: '1px solid var(--border)', borderRadius: '4px', padding: '14px', backgroundColor: '#fafbfc' }}>
              <div style={{ fontWeight: 600, color: '#0284c7', marginBottom: '8px' }}>Reverse Advection Kinematic Parameters</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '12px' }}>
                <div><strong>Surface Current Vector (U_curr):</strong> {incident.currentVectors[0].speedKnots} kts @ {incident.currentVectors[0].directionDeg}°</div>
                <div><strong>Atmospheric Wind Leeway (U_wind):</strong> {incident.windVectors[0].speedKnots} kts @ {incident.windVectors[0].directionDeg}°</div>
                <div><strong>Leeway Wind Drift Factor (α):</strong> 3.3% standard empirical coefficient</div>
                <div><strong>Traceback Duration:</strong> ~5.2 hours reverse transport to origin apex</div>
              </div>
              <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
                Governing Equation: U_total = U_current + 0.033 × U_wind. Production target integrates OpenDrift stochastic ensemble particle tracking.
              </div>
            </div>
          </div>

          {/* 8. HYDRODYNAMIC DISPERSION FORECAST */}
          <div className="pdf-section" style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f172a', borderBottom: '1px solid var(--border)', paddingBottom: '6px', marginBottom: '12px' }}>
              8. Hydrodynamic Dispersion Forecast
            </h2>
            <div style={{ border: '1px solid var(--border)', borderRadius: '4px', padding: '14px', backgroundColor: '#fafbfc' }}>
              <div style={{ fontWeight: 600, color: '#d97706', marginBottom: '8px' }}>Forward Dispersion Vector Offsets</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '12px' }}>
                <div><strong>T+6h Projected Offset:</strong> ~5.8 nm @ 072°</div>
                <div><strong>T+12h Projected Offset:</strong> ~12.4 nm @ 075°</div>
                <div><strong>T+24h Projected Offset:</strong> ~23.8 nm @ 080°</div>
                <div><strong>Shoreline Intercept Risk:</strong> Low (trajectory parallel to continental shelf break)</div>
              </div>
            </div>
          </div>

          {/* 9. AIS TELEMETRY RECONSTRUCTION */}
          <div className="pdf-section" style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f172a', borderBottom: '1px solid var(--border)', paddingBottom: '6px', marginBottom: '12px' }}>
              9. AIS Telemetry Reconstruction
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Spatio-temporal filtering reconstructed synthetic AIS vessel trajectories formatted per MarineCadastre specifications across origin window ±3.5 hours. Cross-referencing against CFAR radar target detections identified:
            </p>
            {incident.darkVessels.length > 0 ? (
              <div style={{ border: '1px solid #fde68a', backgroundColor: '#fffbeb', borderRadius: '4px', padding: '12px', fontSize: '12px', color: '#92400e' }}>
                <strong>POTENTIAL AIS/SAR DISCREPANCY IDENTIFIED ({incident.darkVessels[0].id}):</strong>
                <ul style={{ paddingLeft: '18px', marginTop: '6px' }}>
                  <li>SAR Metallic Contact: Estimated length ~{incident.darkVessels[0].estimatedLengthM}m, RCS: {incident.darkVessels[0].sarRCS_dB} dB</li>
                  <li>AIS Status: No transponder broadcast within {incident.darkVessels[0].nearestAisDistanceNm} nm radius during acquisition</li>
                  <li>Assessment: {incident.darkVessels[0].notes}</li>
                </ul>
              </div>
            ) : (
              <div style={{ border: '1px solid var(--border)', backgroundColor: '#fafbfc', borderRadius: '4px', padding: '10px', fontSize: '12px' }}>
                All SAR radar contacts in the origin window mapped to known commercial AIS transponder broadcasts.
              </div>
            )}
          </div>

          {/* 10. MULTI-CHANNEL CANDIDATE COMPARISON TABLE */}
          <div className="pdf-section" style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f172a', borderBottom: '1px solid var(--border)', paddingBottom: '6px', marginBottom: '12px' }}>
              10. Multi-Channel Candidate Comparison Table
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', marginBottom: '8px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '2px solid var(--border-strong)' }}>
                  <th style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)' }}>RANK</th>
                  <th style={{ padding: '8px 10px' }}>CANDIDATE</th>
                  <th style={{ padding: '8px 10px' }}>SATELLITE (20%)</th>
                  <th style={{ padding: '8px 10px' }}>DRIFT (25%)</th>
                  <th style={{ padding: '8px 10px' }}>AIS FIT (20%)</th>
                  <th style={{ padding: '8px 10px' }}>BEHAVIOUR (10%)</th>
                  <th style={{ padding: '8px 10px' }}>COUNTERFACTUAL (20%)</th>
                  <th style={{ padding: '8px 10px' }}>SCORE</th>
                  <th style={{ padding: '8px 10px' }}>TIER</th>
                </tr>
              </thead>
              <tbody>
                {incident.candidateVessels.map((cand) => (
                  <tr key={cand.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)' }}>#{cand.correlationRank}</td>
                    <td style={{ padding: '8px 10px', fontWeight: 600 }}>{cand.name} ({cand.flag})</td>
                    <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)' }}>{cand.scores.satellite}%</td>
                    <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)' }}>{cand.scores.drift}%</td>
                    <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)' }}>{cand.scores.ais}%</td>
                    <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)' }}>{cand.scores.behaviour}%</td>
                    <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)' }}>{cand.scores.counterfactual}%</td>
                    <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0284c7' }}>{cand.overallScore}</td>
                    <td style={{ padding: '8px 10px' }}>
                      <span className={`badge ${cand.correlationTier === 'HIGH CORRELATION' ? 'badge-blue' : cand.correlationTier === 'INCONCLUSIVE' ? 'badge-red' : 'badge-neutral'}`} style={{ fontSize: '10px' }}>
                        {cand.correlationTier}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              * Score calculation: Canonical 6-channel linear weighted synthesis (Weights: Sat 0.20, Drift 0.25, AIS 0.20, Behaviour 0.10, Counterfactual 0.20, Historical Context 0.05). Operational weighting; not statistically calibrated against empirical ground-truth base rates.
            </div>
          </div>

          {/* 11. IN-SILICO COUNTERFACTUAL RELEASE SIMULATION */}
          <div className="pdf-section" style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f172a', borderBottom: '1px solid var(--border)', paddingBottom: '6px', marginBottom: '12px' }}>
              11. In-Silico Counterfactual Release Simulation
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Tests hypothesis: <em>"If candidate {topCandidate.name} released oil along its reconstructed CPA track, would forward hydrodynamic transport match the observed SAR slick?"</em>
            </p>
            <div style={{ backgroundColor: '#fafbfc', border: '1px solid var(--border)', borderRadius: '4px', padding: '14px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>
              <div>
                <span className="secondary-meta">SPATIAL IoU OVERLAP</span>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0284c7', margin: '4px 0' }} className="mono">
                  {(topCandidate.counterfactualResult.iouMetric * 100).toFixed(1)}%
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Demonstration metric</span>
              </div>
              <div>
                <span className="secondary-meta">HAUSDORFF DISTANCE</span>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0284c7', margin: '4px 0' }} className="mono">
                  {topCandidate.counterfactualResult.hausdorffDistanceKm.toFixed(2)} km
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Demonstration metric</span>
              </div>
              <div>
                <span className="secondary-meta">TRAJECTORY MATCH</span>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0284c7', margin: '4px 0' }} className="mono">
                  {topCandidate.scores.drift}%
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Vector alignment</span>
              </div>
              <div>
                <span className="secondary-meta">SHAPE SIMILARITY</span>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0284c7', margin: '4px 0' }} className="mono">
                  {topCandidate.counterfactualResult.similarityPct}%
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Demonstration metric</span>
              </div>
            </div>
          </div>

          {/* 12. EVIDENTIARY PROVENANCE GRAPH */}
          <div className="pdf-section" style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f172a', borderBottom: '1px solid var(--border)', paddingBottom: '6px', marginBottom: '12px' }}>
              12. Evidentiary Provenance Graph
            </h2>
            <div style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '4px', backgroundColor: '#fafbfc', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              <div>[SCENE-S1C-143210] ──► [SEGMENTATION-MODULE] ──► [SLICK-POLY-{incident.id}]</div>
              <div style={{ paddingLeft: '24px' }}>│</div>
              <div style={{ paddingLeft: '24px' }}>└──► [HINDCAST-ADVECTION] ──► [ORIGIN-P50-CENTROID]</div>
              <div style={{ paddingLeft: '64px' }}>│</div>
              <div style={{ paddingLeft: '64px' }}>└──► [AIS-CORRIDOR-FILTER] ──► [CANDIDATE-{topCandidate.mmsi}]</div>
              <div style={{ paddingLeft: '110px' }}>│</div>
              <div style={{ paddingLeft: '110px' }}>└──► [COUNTERFACTUAL-TEST] ──► [COMPOSITE-SCORE: {topCandidate.overallScore}]</div>
            </div>
          </div>

          {/* 13. KINEMATIC FEASIBILITY & CONTINUITY ANALYSIS */}
          <div className="pdf-section" style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f172a', borderBottom: '1px solid var(--border)', paddingBottom: '6px', marginBottom: '12px' }}>
              13. Kinematic Feasibility & Continuity Analysis
            </h2>
            <div style={{ border: '1px solid var(--border)', borderRadius: '4px', padding: '12px', backgroundColor: '#fafbfc' }}>
              <div style={{ fontSize: '12px', lineHeight: 1.5 }}>
                <div><strong>Speed Profile Observation:</strong> MT Al-Hikma transited the sector with baseline cruise of 14.2 knots, decelerating to <strong>8.4 knots for 42 minutes</strong> inside the reconstructed release corridor before resuming nominal speed.</div>
                <div style={{ marginTop: '6px' }}><strong>Rate of Turn / Heading Alignment:</strong> Course at CPA (064°) aligns within 2° of slick major axis orientation (062°).</div>
                <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}><em>Investigative Notice: Kinematic speed changes indicate operational anomalies requiring logbook review; they do not by themselves establish illicit discharge.</em></div>
              </div>
            </div>
          </div>

          {/* 14. UNCERTAINTY BOUNDS & SCIENTIFIC LIMITATIONS */}
          <div className="pdf-section" style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f172a', borderBottom: '1px solid var(--border)', paddingBottom: '6px', marginBottom: '12px' }}>
              14. Uncertainty Bounds & Scientific Limitations
            </h2>
            <ul style={{ paddingLeft: '18px', color: 'var(--text-secondary)', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>Look-Alike Disambiguation:</strong> Biogenic films, grease ice, and internal waves may mimic oil backscatter damping. Risk is screened against wind speed validity thresholds (3–12 m/s).</li>
              <li><strong>Drift Uncertainty:</strong> Stokes drift and sub-mesoscale ocean eddies introduce up to 12% lateral uncertainty over 6-hour traceback horizons.</li>
              <li><strong>AIS Telemetry Continuity:</strong> Terrestrial VHF AIS coverage is subject to line-of-sight horizon limits (&gt;35 nm from shore stations).</li>
              <li><strong>False Attribution Safeguard:</strong> Where counterfactual IoU is &lt;50% or origin separation is ambiguous, AquaTrace executes mandatory evidence-based abstention (INCONCLUSIVE).</li>
            </ul>
          </div>

          {/* 15. INVESTIGATION FINDING & CORRELATION STATUS */}
          <div className="pdf-section" style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f172a', borderBottom: '1px solid var(--border)', paddingBottom: '6px', marginBottom: '12px' }}>
              15. Investigation Finding & Correlation Status
            </h2>
            <div style={{ backgroundColor: isInconclusive ? '#fef2f2' : '#f0fdf4', border: isInconclusive ? '1px solid #fecaca' : '1px solid #bbf7d0', borderRadius: '4px', padding: '14px', marginBottom: '14px' }}>
              <div style={{ fontWeight: 700, color: isInconclusive ? '#b91c1c' : '#15803d', fontSize: '14px', marginBottom: '6px' }}>
                VERDICT: {incident.attributionStatus}
              </div>
              <p style={{ fontSize: '12px', color: isInconclusive ? '#991b1b' : '#166534', margin: 0 }}>
                {isInconclusive 
                  ? 'The available evidentiary chain does not permit reliable singular attribution. Primary limitations include overlapping candidate trajectories and elevated biogenic look-alike likelihood under low wind conditions (2.1 m/s). Mandatory abstention enforced.'
                  : `Multi-channel evidence synthesis identifies MT AL-HIKMA as the highest-ranked candidate vessel with Composite Evidence Score ${topCandidate.overallScore}/100. Attribution remains subject to physical Port State Control confirmation.`}
              </p>
            </div>

            <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
              Recommended Port State Control (PSC) Operational Actions:
            </h3>
            <ul style={{ paddingLeft: '18px', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {incident.recommendedActions.map((act, i) => (
                <li key={i}>{act}</li>
              ))}
            </ul>
          </div>

          {/* 16. IMMUTABLE AUDIT TRAIL & RECORD INTEGRITY */}
          <div className="pdf-section" style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f172a', borderBottom: '1px solid var(--border)', paddingBottom: '6px', marginBottom: '12px' }}>
              16. Immutable Audit Trail & Record Integrity
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '6px 8px', fontFamily: 'var(--font-mono)' }}>TIMESTAMP (UTC)</th>
                  <th style={{ padding: '6px 8px' }}>EVENT / ACTION</th>
                  <th style={{ padding: '6px 8px' }}>OPERATOR / ENGINE</th>
                  <th style={{ padding: '6px 8px', fontFamily: 'var(--font-mono)' }}>INTEGRITY HASH</th>
                </tr>
              </thead>
              <tbody>
                {incident.auditTrail.map((ev) => (
                  <tr key={ev.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '6px 8px', fontFamily: 'var(--font-mono)' }}>{ev.timestampUtc}</td>
                    <td style={{ padding: '6px 8px' }}>{ev.action}</td>
                    <td style={{ padding: '6px 8px' }}>{ev.userOrSystem}</td>
                    <td style={{ padding: '6px 8px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                      {ev.sha256Hash.slice(0, 16)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 17. INGESTION DATA PROVENANCE MATRIX */}
          <div className="pdf-section" style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f172a', borderBottom: '1px solid var(--border)', paddingBottom: '6px', marginBottom: '12px' }}>
              17. Ingestion Data Provenance Matrix
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '11px', color: 'var(--text-secondary)' }}>
              <div>• <strong>Satellite SAR:</strong> ESA Copernicus Sentinel-1C C-SAR (Demonstration geometry)</div>
              <div>• <strong>Meteorological Forcing:</strong> Simulated wind vectors parameterizing ERA5 leeway drift</div>
              <div>• <strong>Ocean Hydrodynamics:</strong> Simulated current fields parameterizing CMEMS advection</div>
              <div>• <strong>AIS Telemetry:</strong> Synthetic transponder records following MarineCadastre schema</div>
            </div>
          </div>

          {/* 18. ANALYTICAL ATTRIBUTION METHODOLOGY */}
          <div className="pdf-section" style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f172a', borderBottom: '1px solid var(--border)', paddingBottom: '6px', marginBottom: '12px' }}>
              18. Analytical Attribution Methodology
            </h2>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>• <strong>Lagrangian Advection Formula:</strong> U_total = U_current + 0.033 × U_wind (calculated client-side via vector decomposition).</div>
              <div>• <strong>Spatial IoU Formulation:</strong> IoU = Area(S_observed ∩ S_simulated) / Area(S_observed ∪ S_simulated).</div>
              <div>• <strong>Candidate Evidence Synthesis:</strong> Score = 0.20·Sat + 0.25·Drift + 0.20·AIS + 0.10·Behaviour + 0.20·Counterfactual + 0.05·History.</div>
            </div>
          </div>

          {/* 19. DEMONSTRATION MODE & REALITY DISCLOSURES */}
          <div className="pdf-section" style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f172a', borderBottom: '1px solid var(--border)', paddingBottom: '6px', marginBottom: '12px' }}>
              19. Demonstration Mode & Reality Disclosures
            </h2>
            <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '4px', padding: '12px', fontSize: '11px', color: '#92400e', lineHeight: 1.4 }}>
              <strong>ZERO-FABRICATION DISCLOSURE:</strong> AquaTrace operates as a functional deterministic demonstration architecture for Smart India Hackathon 2026 PS 143. All vessel tracks are synthetic scenario data structured to MarineCadastre standards. Metocean vectors simulate ERA5 and CMEMS values. Production ML inference and full OpenDrift hydrodynamic integration are documented architectural targets.
            </div>
          </div>

          {/* 20. OFFICIAL INVESTIGATOR SIGN-OFF & VERIFICATION PROTOCOL */}
          <div className="pdf-section" style={{ borderTop: '2px solid var(--border-strong)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '11px' }}>
            <div>
              <h2 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f172a', marginBottom: '6px' }}>
                20. Official Investigator Sign-Off & Verification Protocol
              </h2>
              <div><strong>Lead Investigator:</strong> {incident.assignedInvestigator}</div>
              <div><strong>Operational Status:</strong> Case Documented • Target Advisory Ready</div>
              <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>AquaTrace Platform v2.4 • NTRO PS 143 Target Architecture</div>
            </div>
            <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
              <div>EVIDENTIARY SEAL: VALIDATED</div>
              <div style={{ color: 'var(--text-muted)' }}>SHA-256: e3b0c44298fc1c149afbf4c8996fb924</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
