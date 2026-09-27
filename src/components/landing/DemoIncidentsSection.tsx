import React from 'react';
import { mockIncidents } from '../../data/mockIncidents';
import { ArrowRight, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

interface DemoIncidentsSectionProps {
  onSelectIncident: (id: string) => void;
}

export const DemoIncidentsSection: React.FC<DemoIncidentsSectionProps> = ({ onSelectIncident }) => {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-neutral">DEMONSTRATION BENCHMARK</span>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              CONTROLLED CASE STUDIES
            </span>
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Demonstration Incident Registry
          </h3>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', maxWidth: '380px' }}>
          Illustrating end-to-end investigation workflows under distinct operational uncertainty conditions.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {mockIncidents.map((inc) => {
          const isHigh = inc.attributionStatus === 'HIGH CORRELATION';
          const isInconclusive = inc.attributionStatus === 'INCONCLUSIVE';
          const isOS042 = inc.id === 'OS-042';
          const isOS037 = inc.id === 'OS-037';

          return (
            <div 
              key={inc.id}
              className="gis-panel"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                cursor: 'pointer',
              }}
              onClick={() => onSelectIncident(inc.id)}
            >
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="badge badge-neutral">{inc.id}</span>
                    <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      DEMO CASE
                    </span>
                  </div>
                  <span 
                    className={`badge ${
                      isInconclusive ? 'badge-red' : isHigh ? 'badge-blue' : 'badge-amber'
                    }`}
                  >
                    {inc.attributionStatus}
                  </span>
                </div>

                <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {inc.region}
                </h4>

                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>
                  {inc.detectionTimeUtc} • {inc.satelliteScene.satellite}
                </div>

                {isOS042 && (
                  <div style={{ marginBottom: '14px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '8px' }}>
                      Highest-Ranked Candidate Vessel correlated with reconstructed origin window (08:45–10:15 UTC). Counterfactual simulation matches observed SAR footprint with 91.4% shape similarity (IoU 84.2%, Hausdorff 1.15 km).
                    </p>
                    <div style={{ padding: '6px 10px', backgroundColor: '#e0f2fe', borderRadius: '4px', fontSize: '11px', color: '#0369a1', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      89.9 / 100 — Composite Evidence Score
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                      Operational evidence weighting; not statistically calibrated against empirical ground-truth base rates.
                    </div>
                  </div>
                )}

                {isOS037 && (
                  <div style={{ marginBottom: '14px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '8px' }}>
                      Low radar backscatter contrast (3.2 dB) and low wind (2.1 m/s) produce elevated biogenic look-alike risk. Incomplete coastal AIS telemetry creates an AIS shadow zone with weak candidate separation.
                    </p>
                    <div style={{ padding: '6px 10px', backgroundColor: '#fee2e2', borderRadius: '4px', fontSize: '11px', color: '#b91c1c', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      Outcome: INCONCLUSIVE (Principled Abstention)
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                      Abstention is intentional to prevent unverified allegations under insufficient evidence.
                    </div>
                  </div>
                )}

                {!isOS042 && !isOS037 && (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                    {inc.conclusionSummary}
                  </p>
                )}

                {/* Key Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', backgroundColor: 'var(--bg-subtle)', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>SLICK SURFACE AREA</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {inc.slickProperties.areaKm2} km²
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CANDIDATE FLEET</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {isOS042 ? '48 → 3 candidates' : `${inc.candidateVessels.length} candidates`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer with CTA */}
              <div 
                style={{ 
                  padding: '12px 20px', 
                  borderTop: '1px solid var(--border)', 
                  backgroundColor: '#fafbfc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottomLeftRadius: '6px',
                  borderBottomRightRadius: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {isInconclusive ? (
                    <>
                      <HelpCircle size={14} color="var(--alert-red)" />
                      <span>Evidence-Based Abstention</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={14} color="var(--success-green)" />
                      <span>Auditable Evidence Chain</span>
                    </>
                  )}
                </div>

                <span 
                  style={{ 
                    fontSize: '12px', 
                    fontWeight: 600, 
                    color: 'var(--accent-blue)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px' 
                  }}
                >
                  Launch Investigation <ArrowRight size={14} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
