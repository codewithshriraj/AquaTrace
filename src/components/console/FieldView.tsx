import React from 'react';
import { Incident } from '../../types';
import { InvestigationMap } from './InvestigationMap';
import { Phone, ShieldAlert, AlertTriangle, ArrowLeft, Radio, Compass } from 'lucide-react';

interface FieldViewProps {
  incident: Incident;
  selectedCandidateId: string | null;
  onSelectCandidate: (id: string) => void;
  onExitFieldView: () => void;
}

export const FieldView: React.FC<FieldViewProps> = ({
  incident,
  selectedCandidateId,
  onSelectCandidate,
  onExitFieldView,
}) => {
  const topCandidate = incident.candidateVessels[0];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-body)' }}>
      {/* Field View Top Tactical Header */}
      <div 
        style={{ 
          padding: '12px 20px', 
          backgroundColor: '#0f172a', 
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onExitFieldView}
            className="btn btn-secondary btn-sm"
            style={{ backgroundColor: '#1e293b', color: '#ffffff', borderColor: '#334155' }}
          >
            <ArrowLeft size={14} /> Back to Analyst Console
          </button>

          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8' }}>
              FIELD TACTICAL VIEW // PATROL UNIT DISPATCH
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
              INCIDENT {incident.id} • {incident.region}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className={`badge ${incident.attributionStatus === 'HIGH CORRELATION' ? 'badge-blue' : 'badge-red'}`}>
            {incident.attributionStatus}
          </span>
          <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#10b981' }}>
            GPS LINK ACTIVE
          </div>
        </div>
      </div>

      {/* Main Tactical Split: 70% Map, 30% Critical Action Cards */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 340px', overflow: 'hidden' }}>
        
        {/* Full Tactical Map */}
        <div style={{ height: '100%', position: 'relative' }}>
          <InvestigationMap
            incident={incident}
            selectedCandidateId={selectedCandidateId}
            onSelectCandidate={onSelectCandidate}
          />
        </div>

        {/* Tactical Action & Target Brief */}
        <div style={{ height: '100%', overflowY: 'auto', backgroundColor: '#ffffff', borderLeft: '1px solid var(--border)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Target Card */}
          <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: '6px', padding: '16px', border: '1px solid var(--border-strong)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
              PRIMARY TARGET OF INTEREST
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {topCandidate?.name || 'TARGET UNASSIGNED'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              MMSI: <span className="mono">{topCandidate?.mmsi}</span> • Flag: {topCandidate?.flag}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              <div>CPA to Origin: <strong>{topCandidate?.closestPointOfApproachNm} nm</strong></div>
              <div>Speed: <strong>{topCandidate?.speedAtCpaKnots} kts</strong></div>
              <div>Correlation: <strong>{topCandidate?.overallScore}%</strong></div>
              <div>Tier: <strong>{topCandidate?.correlationTier}</strong></div>
            </div>
          </div>

          {/* Quick Intercept Vector */}
          <div style={{ backgroundColor: '#0f172a', borderRadius: '6px', padding: '16px', color: '#f8fafc' }}>
            <div style={{ fontSize: '11px', color: '#38bdf8', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
              INTERCEPT & SAMPLING VECTOR
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Forward Drift Trajectory
            </div>
            <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.4 }}>
              Current slick centroid drifting 058° at 0.9 kts. Recommend deploying water grab sampling kit at 18°35′N, 71°22′E before 18:00 UTC.
            </div>
          </div>

          {/* Coast Guard Dispatch Contacts */}
          <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
              TACTICAL COMMUNICATIONS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)' }}>
                <span>MRCC Mumbai:</span>
                <strong>VHF CH 16 / 022-24388065</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)' }}>
                <span>ICG Patrol Craft:</span>
                <strong>ICG Varaha (Air-to-Sea 2182 kHz)</strong>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
