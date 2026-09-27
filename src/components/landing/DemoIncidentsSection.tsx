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
            <span className="badge badge-neutral">VERIFIED HISTORICAL CASES</span>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              DEMONSTRATION & BENCHMARK DATASET
            </span>
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Incident Intelligence & Forensic Case Registry
          </h3>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', maxWidth: '340px' }}>
          Demonstration case studies modelled with simulated hydrodynamics & Sentinel-1 SAR reference geometries.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {mockIncidents.map((inc) => {
          const isHigh = inc.attributionStatus === 'HIGH CORRELATION';
          const isInconclusive = inc.attributionStatus === 'INCONCLUSIVE';

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
                  <span className="badge badge-neutral">{inc.id}</span>
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

                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '14px' }}>
                  {inc.detectionTimeUtc} • {inc.satelliteScene.satellite}
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                  {inc.conclusionSummary}
                </p>

                {/* Key Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', backgroundColor: 'var(--bg-subtle)', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>SLICK SURFACE AREA</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {inc.slickProperties.areaKm2} km²
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CORRELATED CANDIDATES</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {inc.candidateVessels.length} vessels {inc.darkVessels.length > 0 ? `+ ${inc.darkVessels.length} Dark` : ''}
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
                      <span>4 Evidence Gaps</span>
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
