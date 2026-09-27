import React, { useState } from 'react';
import { 
  Target, 
  GitCompare, 
  Network, 
  EyeOff, 
  Sliders, 
  MapPin, 
  Activity,
  Check,
  AlertTriangle
} from 'lucide-react';

export const InnovationShowcase: React.FC = () => {
  // Interactive state for Card 1 (Probabilistic Origin)
  const [selectedConfidence, setSelectedConfidence] = useState<'50' | '80' | '95'>('50');

  // Interactive state for Card 2 (Counterfactual Simulation)
  const [cfSimulateState, setCfSimulateState] = useState<'both' | 'observed' | 'simulated'>('both');

  // Interactive state for Card 4 (Dark Vessel)
  const [darkVesselRadarActive, setDarkVesselRadarActive] = useState(true);

  // Interactive state for Card 5 (Calibrated Ranking)
  const [selectedCandidateTier, setSelectedCandidateTier] = useState<string>('candA');

  // Interactive state for Card 7 (Kinematic check)
  const [kinematicSpeedStep, setKinematicSpeedStep] = useState(2);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
      
      {/* 01 — Probabilistic Origin-Time Map */}
      <div className="gis-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span className="badge badge-blue">INNOVATION 01</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>SPATIO-TEMPORAL PDF</span>
          </div>
          <h4 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Probabilistic Origin-Time Distribution
          </h4>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
            AquaTrace rejects the naïve assumption of a single pin drop origin. Spills are reconstructed as stochastic probability envelopes (50%, 80%, 95%) bounded by ocean turbulence and wind shear variance.
          </p>
        </div>

        {/* Interactive Visualizer */}
        <div style={{ backgroundColor: '#0f172a', borderRadius: '6px', padding: '16px', color: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
              PROBABILITY CONTOUR: {selectedConfidence}% CI
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['50', '80', '95'] as const).map((ci) => (
                <button
                  key={ci}
                  onClick={() => setSelectedConfidence(ci)}
                  style={{
                    backgroundColor: selectedConfidence === ci ? '#0284c7' : '#1e293b',
                    color: '#ffffff',
                    border: 'none',
                    padding: '3px 8px',
                    borderRadius: '3px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                  }}
                >
                  {ci}%
                </button>
              ))}
            </div>
          </div>

          {/* SVG Contour Simulation */}
          <div style={{ height: '120px', width: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="100%" height="100%" viewBox="0 0 280 120">
              {/* Outer 95% Contour */}
              <ellipse 
                cx="140" 
                cy="60" 
                rx="110" 
                ry="46" 
                fill={selectedConfidence === '95' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(56, 189, 248, 0.08)'} 
                stroke="#38bdf8" 
                strokeWidth={selectedConfidence === '95' ? 2 : 1}
                strokeDasharray="4 4"
              />
              {/* Middle 80% Contour */}
              <ellipse 
                cx="140" 
                cy="60" 
                rx="70" 
                ry="30" 
                fill={selectedConfidence === '80' || selectedConfidence === '95' ? 'rgba(56, 189, 248, 0.35)' : 'rgba(56, 189, 248, 0.15)'} 
                stroke="#38bdf8" 
                strokeWidth={selectedConfidence === '80' ? 2 : 1}
              />
              {/* Inner 50% Core Contour */}
              <ellipse 
                cx="140" 
                cy="60" 
                rx="35" 
                ry="16" 
                fill="rgba(56, 189, 248, 0.6)" 
                stroke="#ffffff" 
                strokeWidth={selectedConfidence === '50' ? 2.5 : 1.5}
              />
              {/* Centroid apex pin */}
              <circle cx="140" cy="60" r="4" fill="#ea580c" />
            </svg>
            <div style={{ position: 'absolute', bottom: '6px', left: '10px', fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
              Release Window: 08:45 – 10:15 UTC (±22 min margin)
            </div>
          </div>
        </div>
      </div>

      {/* 02 — Counterfactual Vessel Simulation */}
      <div className="gis-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span className="badge badge-teal">INNOVATION 02</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>IN SILICO EXPERIMENT</span>
          </div>
          <h4 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Counterfactual Vessel Simulation
          </h4>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
            For every candidate vessel, the system tests a counterfactual hypothesis: <em>"If this vessel discharged oil at this GPS coordinate and time, would the resulting slick match what Sentinel-1 observed?"</em>
          </p>
        </div>

        {/* Interactive Visualizer */}
        <div style={{ backgroundColor: '#0f172a', borderRadius: '6px', padding: '16px', color: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#10b981' }}>
              MATCH SIMILARITY: 91.4% (IoU 0.84)
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['both', 'observed', 'simulated'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setCfSimulateState(mode)}
                  style={{
                    backgroundColor: cfSimulateState === mode ? '#0d9488' : '#1e293b',
                    color: '#ffffff',
                    border: 'none',
                    padding: '3px 8px',
                    borderRadius: '3px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: '120px', width: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="100%" height="100%" viewBox="0 0 280 120">
              {/* Observed SAR slick (Amber) */}
              {(cfSimulateState === 'both' || cfSimulateState === 'observed') && (
                <path
                  d="M 50 65 Q 90 40 140 50 T 230 45 Q 210 80 140 75 Z"
                  fill="rgba(217, 119, 6, 0.45)"
                  stroke="#f59e0b"
                  strokeWidth="2"
                />
              )}
              {/* Simulated particle dispersion slick (Teal dashed) */}
              {(cfSimulateState === 'both' || cfSimulateState === 'simulated') && (
                <path
                  d="M 55 62 Q 95 42 142 48 T 225 48 Q 205 78 138 72 Z"
                  fill="rgba(13, 148, 136, 0.4)"
                  stroke="#2dd4bf"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              )}
            </svg>
            <div style={{ position: 'absolute', bottom: '6px', left: '10px', display: 'flex', gap: '16px', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
              <span style={{ color: '#f59e0b' }}>■ Observed SAR Slick</span>
              <span style={{ color: '#2dd4bf' }}>■ Simulated Candidate A</span>
            </div>
          </div>
        </div>
      </div>

      {/* 03 — Forensic Evidence Graph */}
      <div className="gis-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span className="badge badge-blue">INNOVATION 03</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>PROVENANCE DAG</span>
          </div>
          <h4 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            End-to-End Forensic Evidence Graph
          </h4>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
            Every inference links explicitly into an acyclic provenance graph from raw satellite telemetry to final attribution, providing complete evidentiary defensibility and audit accountability.
          </p>
        </div>

        {/* Visual Graph Chain */}
        <div style={{ backgroundColor: '#f8fafc', border: '1px solid var(--border)', borderRadius: '6px', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', overflowX: 'auto', paddingBottom: '6px' }}>
            {[
              { title: 'Sentinel-1', code: 'SCENE' },
              { title: 'SegFormer', code: 'AI MODEL' },
              { title: 'OpenDrift', code: 'PHYSICS' },
              { title: 'Origin CI', code: 'SPACETIME' },
              { title: 'AIS Track', code: 'MMSI' },
              { title: 'Attribution', code: '89.9%' }
            ].map((node, i) => (
              <React.Fragment key={node.title}>
                <div style={{ textAlign: 'center', flexShrink: 0, padding: '8px 10px', backgroundColor: '#ffffff', border: '1px solid var(--border-strong)', borderRadius: '4px', minWidth: '70px' }}>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{node.code}</div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>{node.title}</div>
                </div>
                {i < 5 && <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>→</span>}
              </React.Fragment>
            ))}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '8px', textAlign: 'center' }}>
            Clickable nodes with cryptographic SHA-256 verifiable hashes
          </div>
        </div>
      </div>

      {/* 04 — Dark-Vessel Forensics */}
      <div className="gis-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span className="badge badge-amber">INNOVATION 04</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>RADAR VS AIS</span>
          </div>
          <h4 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Dark-Vessel SAR Cross-Matching
          </h4>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
            Deliberately disabled AIS does not conceal a perpetrator. AquaTrace extracts high-RCS radar reflectors directly from SAR imagery and correlates with AIS transponder silence to flag dark vessels.
          </p>
        </div>

        {/* Interactive Visualizer */}
        <div style={{ backgroundColor: '#0f172a', borderRadius: '6px', padding: '16px', color: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#f59e0b' }}>
              SAR CFAR DETECTIONS VS AIS
            </span>
            <button
              onClick={() => setDarkVesselRadarActive(!darkVesselRadarActive)}
              className="btn btn-sm btn-secondary"
              style={{ padding: '2px 8px', fontSize: '10px' }}
            >
              Toggle Overlay
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ padding: '10px', backgroundColor: '#1e293b', borderRadius: '4px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>SAR RADAR TARGET</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#38bdf8' }}>164m Metallic Hull</div>
              <div style={{ fontSize: '11px', color: '#cbd5e1' }}>RCS: 42.8 dB (Apex point)</div>
            </div>
            <div style={{ padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.15)', borderRadius: '4px', border: '1px solid #ef4444' }}>
              <div style={{ fontSize: '10px', color: '#fca5a5', fontFamily: 'var(--font-mono)' }}>MATCHING AIS BROADCAST</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#ef4444' }}>NO BROADCAST MATCH</div>
              <div style={{ fontSize: '11px', color: '#fca5a5' }}>Possible AIS Silence Gap</div>
            </div>
          </div>
        </div>
      </div>

      {/* 05 — Calibrated Ranking + INCONCLUSIVE */}
      <div className="gis-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span className="badge badge-green">INNOVATION 05</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>UNCERTAINTY-AWARE</span>
          </div>
          <h4 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Operational Attribution & Abstention
          </h4>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
            The system yields operational composite evidence scores instead of binary claims. When environmental data or AIS coverage is inadequate, AquaTrace transparently issues an INCONCLUSIVE verdict.
          </p>
        </div>

        {/* Tier selection buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { id: 'candA', name: 'Candidate A (MT Al-Hikma)', score: '89.9%', tier: 'HIGH CORRELATION', color: 'var(--accent-blue)' },
            { id: 'candB', name: 'Candidate B (Pacific Glory)', score: '66.9%', tier: 'MODERATE CORRELATION', color: 'var(--spill-amber)' },
            { id: 'candInc', name: 'Incident OS-037 (Gulf of Mannar)', score: '43.1%', tier: 'INCONCLUSIVE (ABSTAIN)', color: 'var(--alert-red)' },
          ].map((cand) => (
            <div 
              key={cand.id}
              onClick={() => setSelectedCandidateTier(cand.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '4px',
                border: selectedCandidateTier === cand.id ? `2px solid ${cand.color}` : '1px solid var(--border)',
                backgroundColor: selectedCandidateTier === cand.id ? 'var(--bg-subtle)' : '#ffffff',
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{cand.name}</div>
                <div style={{ fontSize: '11px', color: cand.color, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{cand.tier}</div>
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: cand.color }}>
                {cand.score}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 06 — Multi-Event Hotspot Intelligence */}
      <div className="gis-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span className="badge badge-teal">INNOVATION 06</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>SPATIAL CLUSTERING</span>
          </div>
          <h4 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Multi-Event Maritime Hotspots
          </h4>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
            Aggregates multi-year historical spill observations against global shipping routes to identify repeat illegal tank-washing corridors and flag chronic flag-state non-compliance.
          </p>
        </div>

        <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: '6px', padding: '12px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
            <span>Identified High-Risk Corridors</span>
            <span style={{ color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>5 Active Clusters</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              <span>Strait of Malacca TSS</span>
              <span style={{ color: 'var(--alert-red)' }}>31 Spills (Risk 95)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              <span>Mumbai High Tanker Route</span>
              <span style={{ color: 'var(--spill-amber)' }}>14 Spills (Risk 88)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              <span>Gulf of Kachchh Approaches</span>
              <span style={{ color: 'var(--spill-amber)' }}>9 Spills (Risk 74)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 07 — Kinematic AIS Cross-Check */}
      <div className="gis-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span className="badge badge-blue">INNOVATION 07</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>KINEMATIC CONTINUITY</span>
          </div>
          <h4 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Kinematic AIS Trajectory Validation
          </h4>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
            Screens for kinematic and AIS continuity anomalies by testing reported speed over ground and rate of turn against hydrodynamic limits of commercial vessel inertia.
          </p>
        </div>

        <div style={{ backgroundColor: '#0f172a', borderRadius: '6px', padding: '14px', color: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#38bdf8', marginBottom: '8px' }}>
            <span>REPORTED AIS VS PHYSICAL DEAD RECKONING</span>
            <span>KINEMATIC PASS</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>MAX ACCEL:</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#10b981', fontFamily: 'var(--font-mono)' }}>0.04 m/s² (PHYSICALLY PLAUSIBLE)</span>
          </div>
          <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
            Verified against SAR position fix. Inconsistency confidence: <strong>0.02 (Nominal track)</strong>.
          </div>
        </div>
      </div>

    </div>
  );
};
