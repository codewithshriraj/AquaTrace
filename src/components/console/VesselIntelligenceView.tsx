import React, { useState } from 'react';
import { mockVessels } from '../../data/mockVessels';
import { VesselProfile } from '../../types';
import { 
  Search, 
  ShieldCheck, 
  AlertTriangle, 
  Compass, 
  Radio, 
  MapPin, 
  ArrowRight,
  ExternalLink,
  Anchor
} from 'lucide-react';

export const VesselIntelligenceView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVesselId, setSelectedVesselId] = useState<string>(mockVessels[0].id);

  const filteredVessels = mockVessels.filter((v) => {
    return (
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.mmsi.includes(searchTerm) ||
      v.imo.includes(searchTerm) ||
      v.flag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vesselType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const selectedVessel = mockVessels.find((v) => v.id === selectedVesselId) || mockVessels[0];

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '24px', backgroundColor: 'var(--bg-body)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-blue">MARITIME INTELLIGENCE REGISTRY</span>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                GLOBAL VESSEL DATABASE & AIS AUDIT
              </span>
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              Vessel Profiles & AIS Continuity Intelligence
            </h3>
          </div>

          <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            {mockVessels.length} Indexed Commercial Profiles
          </div>
        </div>

        {/* Search Bar */}
        <div className="gis-panel" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search vessels by Name, MMSI, IMO, Flag, or Hull Type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: '13px',
              fontFamily: 'var(--font-sans)',
              backgroundColor: 'transparent',
            }}
          />
        </div>

        {/* Split Grid: Vessel List (Left) + Detail Card (Right) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'flex-start' }}>
          
          {/* Vessels List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredVessels.map((v) => {
              const isSelected = v.id === selectedVessel.id;
              const isSilent = v.currentStatus === 'AIS_SILENT';

              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVesselId(v.id)}
                  className="gis-panel"
                  style={{
                    padding: '16px',
                    border: isSelected
                      ? '2px solid var(--accent-blue)'
                      : isSilent
                      ? '1px solid var(--alert-red)'
                      : '1px solid var(--border)',
                    backgroundColor: isSelected ? 'var(--bg-subtle)' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {v.name}
                      </span>
                      <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                        {v.flag}
                      </span>
                    </div>

                    <span
                      className={`badge ${
                        v.aisContinuityScorePct > 95
                          ? 'badge-green'
                          : v.aisContinuityScorePct > 75
                          ? 'badge-amber'
                          : 'badge-red'
                      }`}
                    >
                      AIS {v.aisContinuityScorePct}%
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {v.vesselType} • MMSI: <span className="mono">{v.mmsi}</span> • IMO: <span className="mono">{v.imo}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    <span>Gaps past 12m: <strong>{v.totalGapsInPastYear}</strong></span>
                    <span>Past investigations: <strong>{v.historicalSpillAssociations}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Vessel Deep Intelligence Inspector */}
          {selectedVessel && (
            <div className="gis-panel" style={{ padding: '24px', backgroundColor: '#ffffff', position: 'sticky', top: '20px' }}>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '16px' }}>
                <span className="badge badge-blue" style={{ marginBottom: '6px' }}>
                  VESSEL DOSSIER
                </span>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {selectedVessel.name}
                </h4>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Operator: <strong>{selectedVessel.operator}</strong>
                </div>
              </div>

              {/* Technical Telemetry Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', backgroundColor: 'var(--bg-subtle)', padding: '12px', borderRadius: '4px', border: '1px solid var(--border)', marginBottom: '16px', fontSize: '12px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'var(--font-mono)', display: 'block' }}>MMSI / CALLSIGN</span>
                  <strong className="mono">{selectedVessel.mmsi} / {selectedVessel.callsign}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'var(--font-mono)', display: 'block' }}>IMO / DWT</span>
                  <strong className="mono">{selectedVessel.imo} ({selectedVessel.dwt.toLocaleString()} t)</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'var(--font-mono)', display: 'block' }}>DIMENSIONS</span>
                  <strong className="mono">{selectedVessel.lengthM}m × {selectedVessel.beamM}m</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'var(--font-mono)', display: 'block' }}>STATUS</span>
                  <strong className="mono">{selectedVessel.currentStatus}</strong>
                </div>
              </div>

              {/* AIS Continuity Analysis */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>AIS TRANSMISSION CONTINUITY</span>
                  <strong>{selectedVessel.aisContinuityScorePct}%</strong>
                </div>
                <div style={{ height: '6px', backgroundColor: 'var(--bg-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${selectedVessel.aisContinuityScorePct}%`,
                      backgroundColor: selectedVessel.aisContinuityScorePct > 90 ? 'var(--success-green)' : 'var(--alert-red)',
                    }}
                  />
                </div>
              </div>

              {/* Compliance & Port State Control */}
              <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fafbfc', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '12px' }}>
                <div style={{ fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Port State Control (PSC) & Investigation History
                </div>
                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  • Last Inspection: <strong className="mono">{selectedVessel.lastPscInspectionDate}</strong><br/>
                  • Deficiencies Recorded: <strong className="mono">{selectedVessel.pscDeficienciesFound}</strong><br/>
                  • Historical Spill Associations: <strong className="mono">{selectedVessel.historicalSpillAssociations} cases</strong>
                </div>
              </div>

              {/* Recent Port Calls */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Recent Port Calls & Route Profile
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedVessel.recentPorts.map((pt, i) => (
                    <span key={i} className="badge badge-neutral" style={{ fontSize: '11px' }}>
                      {pt}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
