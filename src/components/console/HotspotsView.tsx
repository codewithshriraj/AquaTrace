import React, { useState } from 'react';
import { mockHotspots } from '../../data/mockIncidents';
import { MapPin, AlertTriangle, ShieldAlert, TrendingUp, Filter, ArrowRight } from 'lucide-react';

export const HotspotsView: React.FC = () => {
  const [selectedHotspotId, setSelectedHotspotId] = useState(mockHotspots[0].id);

  const selectedHotspot = mockHotspots.find((h) => h.id === selectedHotspotId) || mockHotspots[0];

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '24px', backgroundColor: 'var(--bg-body)' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-teal">MULTI-EVENT SPATIAL INTELLIGENCE</span>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                HISTORICAL SPILL CLUSTERS
              </span>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              Maritime Chronic Spill Corridors & Hotspots
            </h3>
          </div>

          <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            Aggregating 5 Global Surveillance Zones
          </div>
        </div>

        {/* Grid of Hotspots */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {mockHotspots.map((hs) => {
            const isSelected = hs.id === selectedHotspot.id;
            return (
              <div
                key={hs.id}
                onClick={() => setSelectedHotspotId(hs.id)}
                className="gis-panel"
                style={{
                  padding: '16px',
                  border: isSelected ? '2px solid var(--accent-blue)' : '1px solid var(--border)',
                  backgroundColor: isSelected ? 'var(--bg-subtle)' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                    LAT {hs.lat}°N, LON {hs.lng}°E
                  </span>
                  <span 
                    className="badge badge-amber"
                    style={{ fontSize: '10px' }}
                  >
                    Risk Index: {hs.riskScore}/100
                  </span>
                </div>

                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {hs.name}
                </h4>

                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  Primary Cause: <strong>{hs.primaryCause}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  <span>Verified Incidents: <strong>{hs.spillCount}</strong></span>
                  <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>Inspect Cluster →</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Hotspot Deep Dive */}
        {selectedHotspot && (
          <div className="gis-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span className="badge badge-blue" style={{ marginBottom: '6px' }}>CLUSTER PROVENANCE</span>
                <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedHotspot.name}
                </h4>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Coordinates: {selectedHotspot.lat}° N, {selectedHotspot.lng}° E
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>HISTORICAL OCCURRENCE</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--spill-amber)', fontFamily: 'var(--font-mono)' }}>
                  {selectedHotspot.spillCount} Slicks Detected
                </div>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
              This regional chokepoint exhibits dense commercial traffic intersections combined with frequent unbroadcasted nighttime bilge discharges. Pattern recognition models highlight that vessels transiting this sector decelerate by an average of 4.2 knots during late-night tidal ebb windows.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>RECOMMENDED PATROL</div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>High-Priority Satellite Tasking</div>
              </div>
              <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>PRIMARY FLEET TYPE</div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Crude & Chemical Tankers</div>
              </div>
              <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ENFORCEMENT BODY</div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Regional Coast Guard & PSC</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
