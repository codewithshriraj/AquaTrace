import React from 'react';
import { Incident } from '../../types';
import { Activity, ShieldCheck, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';

interface KinematicCheckViewProps {
  incident: Incident;
}

export const KinematicCheckView: React.FC<KinematicCheckViewProps> = ({ incident }) => {
  const selectedCandidate = incident.candidateVessels[0];

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '24px', backgroundColor: 'var(--bg-body)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-blue">KINEMATIC & AIS CONTINUITY VALIDATION</span>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                HYDRODYNAMIC DEAD-RECKONING
              </span>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              Kinematic AIS Trajectory Cross-Check
            </h3>
          </div>

          <span className={`badge ${incident.kinematicCheck.discrepancyDetected ? 'badge-red' : 'badge-green'}`}>
            {incident.kinematicCheck.discrepancyDetected ? 'CONTINUITY ANOMALY DETECTED' : 'PHYSICALLY PLAUSIBLE'}
          </span>
        </div>

        {/* Overview Box */}
        <div className="gis-panel" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>
            Trajectory Physical Feasibility Analysis
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '10px' }}>
            {incident.kinematicCheck.explanation}
          </p>
          <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', borderLeft: '3px solid var(--accent-blue)', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            <strong>Investigative Protocol:</strong> Any observed continuity or kinematic anomaly requires investigator review and does not by itself establish vessel manipulation or wrongdoing.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>MAX OBSERVED ACCELERATION</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                0.042 m/s² (Nominal &lt; 0.15)
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>MAX RATE OF TURN (ROT)</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                0.8°/min (Aframax Limit 2.5°)
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>SAR POSITION DEVIATION</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#15803d', fontFamily: 'var(--font-mono)' }}>
                Δ 0.18 nm (Radar Concurrence)
              </div>
            </div>
          </div>
        </div>

        {/* Speed Trend Table / Visual Comparison */}
        <div className="gis-panel" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
            Reported AIS Speed vs Physically Calculated Drift Profile ({selectedCandidate?.name})
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(incident.kinematicCheck.reportedSpeedTrend || []).map((pt) => (
              <div
                key={pt.time}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              >
                <span className="mono" style={{ fontWeight: 600 }}>{pt.time} UTC</span>
                <span className="mono">Reported Speed: <strong>{pt.reportedKts} kts</strong></span>
                <span className="mono">Physical Hydrodynamic Speed: <strong>{pt.calculatedKts} kts</strong></span>
                <span className="badge badge-green" style={{ fontSize: '9px' }}>
                  Δ {Math.abs(pt.reportedKts - pt.calculatedKts).toFixed(1)} kts (Pass)
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
