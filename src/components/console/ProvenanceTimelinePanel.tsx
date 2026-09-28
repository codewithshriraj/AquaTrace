import React from 'react';
import { Incident } from '../../types';
import { 
  Clock, 
  ShieldCheck, 
  Database, 
  Cpu, 
  Layers, 
  Lock, 
  CheckCircle2, 
  AlertTriangle,
  Info
} from 'lucide-react';

interface ProvenanceTimelinePanelProps {
  incident: Incident;
}

export const ProvenanceTimelinePanel: React.FC<ProvenanceTimelinePanelProps> = ({ incident }) => {
  const isInconclusive = incident.attributionStatus === 'INCONCLUSIVE';

  // Section 19: Explicit Investigation Confidence Breakdown
  const confidenceBreakdown = [
    { area: 'Satellite Detection', level: 'HIGH', score: 88, justification: 'Clear SAR backscatter damping delineation on C-band sensor.' },
    { area: 'Slick Characterisation', level: 'HIGH', score: 84, justification: 'Morphological perimeter & thickness conform to spread physics.' },
    { area: 'Age Estimate', level: 'MEDIUM', score: 62, justification: `${incident.slickProperties.estimatedAgeHours}; emulsification kinetics introduce moderate variance.` },
    { area: 'Origin Reconstruction', level: 'MEDIUM', score: incident.id === 'OS-037' ? 52 : 78, justification: 'Numerical reverse Lagrangian advection bounded by P50/P80/P95 contours.' },
    { area: 'Drift Forecast', level: 'MEDIUM', score: 68, justification: 'Forward Lagrangian envelope with expanding diffusion cone.' },
    { area: 'AIS Correlation', level: isInconclusive ? 'LOW' : 'HIGH', score: isInconclusive ? 38 : 86, justification: isInconclusive ? 'Degraded by 145 min coastal shadow zone telemetry gap.' : 'Continuous high-frequency AIS transponder broadcasts.' },
    { area: 'Vessel Attribution', level: isInconclusive ? 'INCONCLUSIVE' : 'HIGH', score: isInconclusive ? 43 : 89, justification: isInconclusive ? 'Available evidence fails Section 33 legal threshold; abstention enforced.' : 'Counterfactual simulation match & transit speed drop.' },
  ];

  // Section 20: Incident Timeline Milestones
  const timelineMilestones = [
    { time: '2026-09-26 06:14:12 UTC', title: 'Satellite Acquisition & Ingestion', desc: `Raw ${incident.satelliteScene.satellite} scene ingested from ISRO NRSC telemetry downlink.` },
    { time: '2026-09-26 06:15:30 UTC', title: 'Automated Slick Segmentation', desc: `Neural U-Net delineated ${incident.slickProperties.areaKm2} km² dark formation boundary with ${incident.slickProperties.perimeterKm} km perimeter.` },
    { time: '2026-09-26 06:16:45 UTC', title: 'Morphological Characterisation & Look-Alike Validation', desc: `Orientation calculated at ${incident.slickProperties.orientationDeg.toFixed(0)}°. Look-alike filter evaluated biogenic damping contrast.` },
    { time: '2026-09-26 06:17:20 UTC', title: 'Backward Hydrodynamic Hindcasting', desc: `Reverse drift integrated across INCOIS surface currents and NCMRWF wind forcing field.` },
    { time: '2026-09-26 06:17:55 UTC', title: 'Probabilistic Origin Region Reconstruction', desc: `Estimated release window reconstructed at ${incident.releaseWindow.startUtc.slice(11, 16)}–${incident.releaseWindow.endUtc.slice(11, 16)} UTC at centroid ${incident.releaseWindow.centroidLat}°N, ${incident.releaseWindow.centroidLng}°E.` },
    { time: '2026-09-26 06:18:10 UTC', title: 'Historical AIS Decoding & Filtering', desc: `Regional maritime AIS traffic screened; 42 sector targets filtered down to ${incident.candidateVessels.length} candidate vessels.` },
    { time: '2026-09-26 06:18:22 UTC', title: 'Candidate Ranking & Decision Governance', desc: isInconclusive ? 'Abstention rule triggered: verdict classified as INCONCLUSIVE due to look-alike risk and AIS telemetry gap.' : 'Vessel MT Al-Hikma correlated with 89.9% composite score; Counterfactual simulation executed.' },
  ];

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'HIGH':
        return <span className="badge badge-green" style={{ fontSize: '9px' }}>HIGH</span>;
      case 'MEDIUM':
        return <span className="badge badge-amber" style={{ fontSize: '9px' }}>MEDIUM</span>;
      case 'LOW':
        return <span className="badge badge-red" style={{ fontSize: '9px' }}>LOW</span>;
      case 'INCONCLUSIVE':
        return <span className="badge badge-red" style={{ fontSize: '9px' }}>INCONCLUSIVE</span>;
      default:
        return <span className="badge badge-neutral" style={{ fontSize: '9px' }}>{level}</span>;
    }
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '22px', backgroundColor: '#ffffff', height: '100%', overflowY: 'auto' }}>
      
      {/* 1. SECTION HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-blue">GOVERNANCE & PROVENANCE</span>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              ISO/IEC 27037 FORENSIC AUDIT
            </span>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Investigation Confidence & Model Provenance
          </h3>
        </div>

        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          Case ID: <strong>{incident.id}</strong> • Model Version: <strong>AquaTrace v2.4</strong>
        </div>
      </div>

      {/* 2. SECTION 19: EXPLICIT INVESTIGATION CONFIDENCE BREAKDOWN */}
      <div style={{ backgroundColor: '#fafbfc', border: '1px solid var(--border)', borderRadius: '6px', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            INVESTIGATION CONFIDENCE MATRIX
          </span>
          <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
            MULTI-LAYER UNCERTAINTY ACCOUNTING
          </span>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '14px' }}>
          Scientific credibility demands explicit differentiation between high-confidence observations and probabilistic model inferences. AquaTrace grades each operational subsystem:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {confidenceBreakdown.map((item) => (
            <div
              key={item.area}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                backgroundColor: '#ffffff',
                borderRadius: '4px',
                border: '1px solid var(--border)',
                fontSize: '11px',
              }}
            >
              <div style={{ flex: '0 0 170px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{item.area}</strong>
              </div>

              <div style={{ flex: '0 0 110px' }}>
                {getLevelBadge(item.level)}
              </div>

              <div style={{ flex: 1, color: 'var(--text-secondary)', fontSize: '10.5px' }}>
                {item.justification}
              </div>

              <div style={{ flex: '0 0 70px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: item.score > 75 ? 'var(--accent-blue)' : item.score > 50 ? '#d97706' : 'var(--alert-red)' }}>
                {item.score}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. SECTION 20: INCIDENT TIMELINE */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            INCIDENT TIMELINE & EXECUTION MILESTONES
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            AUTOMATED PIPELINE LOG
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderLeft: '2px solid #e2e8f0', paddingLeft: '14px', marginLeft: '6px' }}>
          {timelineMilestones.map((milestone, idx) => (
            <div key={milestone.title} style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '-21px',
                  top: '4px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: idx === timelineMilestones.length - 1 ? (isInconclusive ? 'var(--alert-red)' : 'var(--accent-blue)') : '#94a3b8',
                  border: '2px solid #ffffff',
                }}
              />
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                {milestone.time}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '1px' }}>
                {milestone.title}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '1px' }}>
                {milestone.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. SECTION 21 & 22: DATA & MODEL PROVENANCE & AUDIT PANEL */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            DATA SOURCES & MODEL AUDIT REGISTER (v2.4)
          </span>
          <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
            CRYPTOGRAPHIC CHAIN
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          {/* Data Sources Grid */}
          <div style={{ backgroundColor: '#fafbfc', border: '1px solid var(--border)', borderRadius: '4px', padding: '12px', fontSize: '11px' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Database size={13} color="var(--accent-blue)" /> Data Provenance
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Satellite: </span>
                <strong>{incident.satelliteScene.satellite} ({incident.satelliteScene.resolutionM}m)</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>AIS Telemetry: </span>
                <strong>MarineCadastre & Regional Indian Coastal Receivers</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Meteorological Wind: </span>
                <strong>NCMRWF Unified Weather Model / ECMWF 0.1°</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Ocean Currents: </span>
                <strong>INCOIS High-Resolution Regional ROMS / HYCOM</strong>
              </div>
            </div>
          </div>

          {/* Model Registry */}
          <div style={{ backgroundColor: '#0f172a', borderRadius: '4px', padding: '12px', color: '#cbd5e1', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            <div style={{ color: '#38bdf8', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cpu size={13} /> AquaTrace Model Registry v2.4
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>Slick Detection: <strong style={{ color: '#f8fafc' }}>AquaTrace Neural U-Net SAR v2.4</strong></div>
              <div>Drift Engine: <strong style={{ color: '#f8fafc' }}>OpenDrift Lagrangian Reverse Advection</strong></div>
              <div>AIS Correlation: <strong style={{ color: '#f8fafc' }}>Spatio-Temporal Kinematic Correlator v2.1</strong></div>
              <div>Attribution: <strong style={{ color: '#f8fafc' }}>Composite Evidentiary Weighting Engine</strong></div>
              <div>Case Identifier: <strong style={{ color: '#38bdf8' }}>{incident.id}</strong></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
