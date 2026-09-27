import React, { useState } from 'react';
import { 
  Target, 
  GitCompare, 
  Network, 
  Sliders, 
  Activity,
  AlertOctagon,
  History
} from 'lucide-react';

export const InnovationShowcase: React.FC = () => {
  // Interactive state for Card 1 (Modelled Origin-Time Uncertainty)
  const [selectedConfidence, setSelectedConfidence] = useState<'P50' | 'P80' | 'P95'>('P50');

  // Interactive state for Card 2 (Candidate-Specific Counterfactual Simulation)
  const [cfSimulateState, setCfSimulateState] = useState<'both' | 'observed' | 'simulated'>('both');

  // Interactive state for Card 4 (Kinematic / AIS Continuity Anomaly)
  const [anomalyOverlayActive, setAnomalyOverlayActive] = useState(true);

  // Interactive state for Card 6 (Principled Abstention)
  const [selectedCandidateTier, setSelectedCandidateTier] = useState<string>('candA');

  // Interactive state for Card 7 (Forensic Replay)
  const [replayStep, setReplayStep] = useState<number>(2);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
      
      {/* 01 — Modelled Origin-Time Uncertainty */}
      <div className="gis-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span className="badge badge-blue">INNOVATION 01</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>SPATIO-TEMPORAL ENVELOPES</span>
          </div>
          <h4 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Modelled Origin-Time Uncertainty
          </h4>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
            AquaTrace represents the reconstructed origin using P50, P80, and P95 modelled uncertainty envelopes paired with an estimated release-time window, accounting for current shear and turbulent dispersion.
          </p>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '16px', borderLeft: '2px solid var(--accent-blue)', paddingLeft: '8px' }}>
            These are modelled uncertainty bounds for investigation, not calibrated statistical probabilities.
          </div>
        </div>

        {/* Interactive Visualizer */}
        <div style={{ backgroundColor: '#0f172a', borderRadius: '6px', padding: '16px', color: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
              MODELLED ENVELOPE: {selectedConfidence} BOUND
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['P50', 'P80', 'P95'] as const).map((env) => (
                <button
                  key={env}
                  onClick={() => setSelectedConfidence(env)}
                  style={{
                    backgroundColor: selectedConfidence === env ? '#0284c7' : '#1e293b',
                    color: '#ffffff',
                    border: 'none',
                    padding: '3px 8px',
                    borderRadius: '3px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                  }}
                >
                  {env}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Envelope Simulation */}
          <div style={{ height: '120px', width: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="100%" height="100%" viewBox="0 0 280 120">
              {/* Outer P95 Envelope */}
              <ellipse 
                cx="140" 
                cy="60" 
                rx="110" 
                ry="46" 
                fill={selectedConfidence === 'P95' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(56, 189, 248, 0.08)'} 
                stroke="#38bdf8" 
                strokeWidth={selectedConfidence === 'P95' ? 2 : 1}
                strokeDasharray="4 4"
              />
              {/* Middle P80 Envelope */}
              <ellipse 
                cx="140" 
                cy="60" 
                rx="70" 
                ry="30" 
                fill={selectedConfidence === 'P80' || selectedConfidence === 'P95' ? 'rgba(56, 189, 248, 0.35)' : 'rgba(56, 189, 248, 0.15)'} 
                stroke="#38bdf8" 
                strokeWidth={selectedConfidence === 'P80' ? 2 : 1}
              />
              {/* Inner P50 Core Envelope */}
              <ellipse 
                cx="140" 
                cy="60" 
                rx="35" 
                ry="16" 
                fill="rgba(56, 189, 248, 0.6)" 
                stroke="#ffffff" 
                strokeWidth={selectedConfidence === 'P50' ? 2.5 : 1.5}
              />
              {/* Centroid apex pin */}
              <circle cx="140" cy="60" r="4" fill="#ea580c" />
            </svg>
            <div style={{ position: 'absolute', bottom: '6px', left: '10px', fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
              Modelled Release Window: 08:45 – 10:15 UTC (~4.5–6.0 h age)
            </div>
          </div>
        </div>
      </div>

      {/* 02 — Candidate-Specific Counterfactual Simulation */}
      <div className="gis-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span className="badge badge-teal">INNOVATION 02</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>HYPOTHESIS TESTING</span>
          </div>
          <h4 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Candidate-Specific Counterfactual Simulation
          </h4>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
            Tests whether a hypothetical discharge along a candidate vessel’s historical coordinates and timestamp could reproduce the observed slick footprint, comparing geometric dispersion under matching environmental forcing.
          </p>
        </div>

        {/* Interactive Visualizer */}
        <div style={{ backgroundColor: '#0f172a', borderRadius: '6px', padding: '16px', color: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#10b981' }}>
              COUNTERFACTUAL METRICS (CANDIDATE A)
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

          <div style={{ height: '100px', width: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="100%" height="100%" viewBox="0 0 280 100">
              {/* Observed SAR slick (Amber) */}
              {(cfSimulateState === 'both' || cfSimulateState === 'observed') && (
                <path
                  d="M 50 55 Q 90 30 140 40 T 230 35 Q 210 70 140 65 Z"
                  fill="rgba(217, 119, 6, 0.45)"
                  stroke="#f59e0b"
                  strokeWidth="2"
                />
              )}
              {/* Simulated particle dispersion slick (Teal dashed) */}
              {(cfSimulateState === 'both' || cfSimulateState === 'simulated') && (
                <path
                  d="M 55 52 Q 95 32 142 38 T 225 38 Q 205 68 138 62 Z"
                  fill="rgba(13, 148, 136, 0.4)"
                  stroke="#2dd4bf"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              )}
            </svg>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', borderTop: '1px solid #334155', paddingTop: '10px', marginTop: '6px' }}>
            <div>
              <div style={{ fontSize: '9px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>SPATIAL IOU</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8' }}>84.2%</div>
            </div>
            <div>
              <div style={{ fontSize: '9px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>HAUSDORFF</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#10b981' }}>1.15 km</div>
            </div>
            <div>
              <div style={{ fontSize: '9px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>SHAPE MATCH</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b' }}>91.4%</div>
            </div>
            <div>
              <div style={{ fontSize: '9px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>DRIFT CONSIST.</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#a78bfa' }}>High</div>
            </div>
          </div>
        </div>
      </div>

      {/* 03 — Explainable Evidence Fusion */}
      <div className="gis-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span className="badge badge-blue">INNOVATION 03</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>TRANSPARENT WEIGHTING</span>
          </div>
          <h4 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Explainable Evidence Fusion
          </h4>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
            Fuses six independent evidence channels with operational weighting to prevent over-reliance on any single data stream or algorithmic estimate.
          </p>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '16px', borderLeft: '2px solid var(--accent-blue)', paddingLeft: '8px' }}>
            The resulting score is an Operational Composite Evidence Score, not a calibrated probability of responsibility.
          </div>
        </div>

        {/* Channel Weights Grid */}
        <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: '6px', padding: '14px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '8px' }}>
            {[
              { label: 'Satellite', weight: '20%' },
              { label: 'Drift', weight: '25%' },
              { label: 'AIS Proximity', weight: '20%' },
              { label: 'Behaviour', weight: '10%' },
              { label: 'Counterfactual', weight: '20%' },
              { label: 'History / Context', weight: '5%' },
            ].map((ch) => (
              <div key={ch.label} style={{ backgroundColor: '#ffffff', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{ch.label}</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-blue)' }}>{ch.weight}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
            Fixed operational weights sum to exactly 1.00 (100%)
          </div>
        </div>
      </div>

      {/* 04 — AIS / SAR Discrepancy Analysis */}
      <div className="gis-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span className="badge badge-amber">INNOVATION 04</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>CROSS-SENSOR AUDIT</span>
          </div>
          <h4 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            AIS / SAR Discrepancy Analysis
          </h4>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
            Identifies kinematic and AIS continuity anomalies by cross-referencing SAR high-backscatter metallic targets against vessel broadcast streams without premature assumptions regarding intent.
          </p>
        </div>

        {/* Interactive Visualizer */}
        <div style={{ backgroundColor: '#0f172a', borderRadius: '6px', padding: '16px', color: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#f59e0b' }}>
              KINEMATIC / AIS CONTINUITY ANOMALY
            </span>
            <button
              onClick={() => setAnomalyOverlayActive(!anomalyOverlayActive)}
              className="btn btn-sm btn-secondary"
              style={{ padding: '2px 8px', fontSize: '10px', backgroundColor: '#1e293b', color: '#cbd5e1' }}
            >
              Toggle Overlay
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ padding: '10px', backgroundColor: '#1e293b', borderRadius: '4px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>SAR RADAR TARGET</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#38bdf8' }}>164m Metallic Vessel</div>
              <div style={{ fontSize: '11px', color: '#cbd5e1' }}>RCS: 42.8 dB (near apex)</div>
            </div>
            <div style={{ padding: '10px', backgroundColor: anomalyOverlayActive ? 'rgba(245, 158, 11, 0.15)' : 'rgba(100, 116, 139, 0.15)', borderRadius: '4px', border: `1px solid ${anomalyOverlayActive ? '#f59e0b' : '#475569'}` }}>
              <div style={{ fontSize: '10px', color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>TELEMETRY STATUS</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#fcd34d' }}>Continuity Gap Detected</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Unmatched radar reflection</div>
            </div>
          </div>
        </div>
      </div>

      {/* 05 — Evidentiary Provenance Graph */}
      <div className="gis-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span className="badge badge-blue">INNOVATION 05</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>PROVENANCE DAG</span>
          </div>
          <h4 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Evidentiary Provenance Graph
          </h4>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
            Connects every intermediate inference step into an auditable evidence chain so human investigators can inspect every transformation from raw imagery to candidate ranking.
          </p>
        </div>

        {/* Visual Graph Chain */}
        <div style={{ backgroundColor: '#f8fafc', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            {[
              'Satellite Scene',
              'Slick',
              'Origin',
              'Environmental Inputs',
              'Drift',
              'AIS',
              'Candidate',
              'Counterfactual',
              'Evidence Fusion',
              'Finding'
            ].map((node, i, arr) => (
              <React.Fragment key={node}>
                <span style={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid var(--border)', 
                  padding: '3px 6px', 
                  borderRadius: '3px',
                  fontWeight: 600,
                  color: 'var(--text-primary)'
                }}>
                  {node}
                </span>
                {i < arr.length - 1 && <span style={{ color: 'var(--text-muted)' }}>→</span>}
              </React.Fragment>
            ))}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '10px', textAlign: 'center' }}>
            Explicit directed dependency chain for full analytical transparency
          </div>
        </div>
      </div>

      {/* 06 — Principled Abstention */}
      <div className="gis-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span className="badge badge-green">INNOVATION 06</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>DECISION INTEGRITY</span>
          </div>
          <h4 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Principled Abstention (INCONCLUSIVE)
          </h4>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
            When environmental conditions produce elevated look-alike risks, vessel telemetry is incomplete, or candidate separation is ambiguous, AquaTrace explicitly abstains rather than generating a forced attribution.
          </p>
        </div>

        {/* Tier selection demonstration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { id: 'candA', name: 'Candidate A (MT Al-Hikma)', score: '89.9 / 100', tier: 'HIGH CORRELATION', color: 'var(--accent-blue)' },
            { id: 'candB', name: 'Candidate B (Pacific Glory)', score: '66.9 / 100', tier: 'MODERATE CORRELATION', color: 'var(--spill-amber)' },
            { id: 'candInc', name: 'Incident OS-037 (Gulf of Mannar)', score: '43.1 / 100', tier: 'INCONCLUSIVE (ABSTAIN)', color: 'var(--alert-red)' },
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
              <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: cand.color }}>
                {cand.score}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 07 — Forensic Replay */}
      <div className="gis-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gridColumn: 'span 1' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span className="badge badge-teal">INNOVATION 07</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>TEMPORAL AUDIT</span>
          </div>
          <h4 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Forensic Replay & Evolution
          </h4>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
            Enables analysts to scrub across the entire investigation timeline, reviewing how evidence evolved as satellite acquisitions, oceanographic forecasts, and AIS updates arrived.
          </p>
        </div>

        <div style={{ backgroundColor: '#0f172a', borderRadius: '6px', padding: '14px', color: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#38bdf8', marginBottom: '8px' }}>
            <span>SCRUB INVESTIGATION TIMELINE</span>
            <span>T-{6 - replayStep * 1.5}h TO OBSERVATION</span>
          </div>
          <input 
            type="range"
            min="0"
            max="4"
            step="1"
            value={replayStep}
            onChange={(e) => setReplayStep(parseInt(e.target.value))}
            style={{ width: '100%', marginBottom: '8px', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
            <span>08:45 Origin</span>
            <span>10:15 Window Close</span>
            <span>14:32 SAR Acquisition</span>
          </div>
        </div>
      </div>

    </div>
  );
};
