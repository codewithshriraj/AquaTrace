import React, { useEffect, useRef } from 'react';
import { mockIncidents } from '../../data/mockIncidents';
import { regionalCoastlines } from '../../data/coastalBoundaries';
import { Incident } from '../../types';
import L from 'leaflet';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Compass,
  MapPin,
  Ship,
  Layers,
  ArrowRight,
  Radar,
  Radio,
  Clock,
  Eye
} from 'lucide-react';

interface DashboardOverviewProps {
  onSelectIncident: (id: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onSelectIncident }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Exact KPIs computed from real application data
  const totalIncidents = mockIncidents.length;
  const activeIncidents = mockIncidents.filter(
    (i) => i.status === 'UNDER_INVESTIGATION' || i.status === 'SCREENING' || i.status === 'INCONCLUSIVE'
  ).length;
  const highConfidenceSlicks = mockIncidents.filter(
    (i) => i.slickProperties.confidencePct >= 80
  ).length;
  const vesselsOfInterestCount = mockIncidents.reduce(
    (acc, inc) => acc + inc.candidateVessels.length, 0
  );
  const investigationsUnderReview = mockIncidents.filter(
    (i) => i.status === 'UNDER_INVESTIGATION' || i.status === 'SCREENING'
  ).length;
  const attributedOrClosed = mockIncidents.filter(
    (i) => i.status === 'CLOSED' || i.attributionStatus === 'HIGH CORRELATION'
  ).length;
  const inconclusiveCases = mockIncidents.filter(
    (i) => i.status === 'INCONCLUSIVE' || i.attributionStatus === 'INCONCLUSIVE'
  ).length;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center on Indian Maritime EEZ
      const map = L.map(mapContainerRef.current, {
        center: [14.5, 76.5],
        zoom: 5,
        zoomControl: false,
        attributionControl: false,
      });

      // Professional dark maritime carto basemap
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png',
        {
          subdomains: 'abcd',
          maxZoom: 19,
        }
      ).addTo(map);

      // Add labels overlay
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
        {
          subdomains: 'abcd',
          maxZoom: 19,
          opacity: 0.7,
        }
      ).addTo(map);

      // Render regional coastline boundary paths
      regionalCoastlines.forEach((coast) => {
        L.polyline(coast.polygon, {
          color: '#0284c7',
          weight: 1.2,
          opacity: 0.55,
          dashArray: '4,4',
        }).addTo(map);
      });

      // Render each incident with interactive marker & polygon footprint
      mockIncidents.forEach((inc) => {
        const isInconclusive = inc.attributionStatus === 'INCONCLUSIVE';
        const isHigh = inc.attributionStatus === 'HIGH CORRELATION';
        const markerColor = isInconclusive ? '#ef4444' : isHigh ? '#0284c7' : '#f59e0b';

        // 1. Slick Polygon
        if (inc.slickPolygon && inc.slickPolygon.length > 0) {
          L.polygon(inc.slickPolygon, {
            color: markerColor,
            fillColor: markerColor,
            fillOpacity: 0.45,
            weight: 2,
          }).addTo(map);
        }

        // 2. Probable Origin Contour (P80 or P50)
        if (inc.originContours?.p80) {
          L.polygon(inc.originContours.p80, {
            color: '#f59e0b',
            fillColor: '#f59e0b',
            fillOpacity: 0.2,
            weight: 1.5,
            dashArray: '3,3',
          }).addTo(map);
        }

        // 3. Hindcast Trajectory line
        if (inc.hindcastTrajectory && inc.hindcastTrajectory.length > 0) {
          const latLngs = inc.hindcastTrajectory.map(pt => [pt.lat, pt.lng] as [number, number]);
          L.polyline(latLngs, {
            color: '#38bdf8',
            weight: 2,
            dashArray: '4,4',
            opacity: 0.8,
          }).addTo(map);
        }

        // 4. Custom Pulsing Marker
        const iconHtml = `
          <div style="
            position: relative;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            <div style="
              position: absolute;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background-color: ${markerColor};
              opacity: 0.3;
              animation: pulse 2s infinite;
            "></div>
            <div style="
              width: 14px;
              height: 14px;
              border-radius: 50%;
              background-color: ${markerColor};
              border: 2px solid #ffffff;
              box-shadow: 0 0 8px rgba(0,0,0,0.5);
            "></div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: '',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([inc.coordinates[0], inc.coordinates[1]], { icon: customIcon }).addTo(map);

        // Interactive Popup
        const popupContent = document.createElement('div');
        popupContent.style.fontFamily = 'var(--font-sans)';
        popupContent.style.padding = '4px';
        popupContent.style.minWidth = '220px';
        popupContent.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <strong style="color: #0f172a; font-size: 13px;">${inc.id}</strong>
            <span style="font-size: 9px; padding: 2px 6px; border-radius: 3px; font-weight: 700; background-color: ${markerColor}; color: #ffffff;">
              ${inc.status}
            </span>
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
            ${inc.region}
          </div>
          <div style="font-size: 10.5px; color: #64748b; font-family: var(--font-mono); margin-bottom: 8px;">
            Area: ${inc.slickProperties.areaKm2} km² • Age: ${inc.slickProperties.estimatedAgeHours.split('(')[0].trim()}<br/>
            Candidates: ${inc.candidateVessels.length} vessels
          </div>
          <button id="btn-${inc.id}" style="
            width: 100%;
            padding: 6px 10px;
            background-color: #0284c7;
            color: #ffffff;
            border: none;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
          ">
            Open Investigation (${inc.id}) →
          </button>
        `;

        marker.bindPopup(popupContent);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-${inc.id}`);
          if (btn) {
            btn.onclick = () => onSelectIncident(inc.id);
          }
        });
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [onSelectIncident]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-body)', overflow: 'hidden' }}>

      {/* 1. TOP OPERATIONAL KPI CARDS BAR (SECTION 4) */}
      <div
        style={{
          padding: '16px 20px',
          backgroundColor: '#0f172a',
          borderBottom: '1px solid #1e293b',
          color: '#ffffff',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-blue">SURVEILLANCE OVERVIEW</span>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
                INDIAN MARITIME EEZ & SHIPPING CORRIDORS
              </span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', marginTop: '2px', letterSpacing: '-0.01em' }}>
              Maritime Oil Spill Detection & Attribution Console
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
              Active Incidents: <strong style={{ color: '#38bdf8' }}>{activeIncidents}</strong>
            </span>
            <span>•</span>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
              Fleet Candidates: <strong style={{ color: '#34d399' }}>{vesselsOfInterestCount}</strong>
            </span>
          </div>
        </div>

        {/* 6 Concise Operational KPIs (Section 4) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
          <div style={{ backgroundColor: '#1e293b', padding: '10px 12px', borderRadius: '4px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>ACTIVE INCIDENTS</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
              {activeIncidents}
            </div>
            <div style={{ fontSize: '9.5px', color: '#64748b' }}>Across EEZ Corridors</div>
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '10px 12px', borderRadius: '4px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>HIGH-CONFIDENCE SLICKS</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
              {highConfidenceSlicks}
            </div>
            <div style={{ fontSize: '9.5px', color: '#64748b' }}>Confidence ≥ 80%</div>
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '10px 12px', borderRadius: '4px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>VESSELS OF INTEREST</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
              {vesselsOfInterestCount}
            </div>
            <div style={{ fontSize: '9.5px', color: '#64748b' }}>Screened in Sectors</div>
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '10px 12px', borderRadius: '4px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>UNDER REVIEW</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
              {investigationsUnderReview}
            </div>
            <div style={{ fontSize: '9.5px', color: '#64748b' }}>Active Forensic Stage</div>
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '10px 12px', borderRadius: '4px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>ATTRIBUTED / CLOSED</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
              {attributedOrClosed}
            </div>
            <div style={{ fontSize: '9.5px', color: '#64748b' }}>High Evidence Cases</div>
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '10px 12px', borderRadius: '4px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>INCONCLUSIVE CASES</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#ef4444', fontFamily: 'var(--font-mono)' }}>
              {inconclusiveCases}
            </div>
            <div style={{ fontSize: '9.5px', color: '#64748b' }}>Principled Abstention</div>
          </div>
        </div>
      </div>

      {/* 2. MAIN SPLIT: LARGE PRIMARY MAP (LEFT) + INCIDENTS LIST (RIGHT) */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 380px', overflow: 'hidden' }}>

        {/* Large Primary Map (Section 4) */}
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

          {/* Map Cartographic Legend Overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              backgroundColor: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(8px)',
              padding: '10px 14px',
              borderRadius: '6px',
              border: '1px solid #334155',
              color: '#ffffff',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              zIndex: 1000
            }}
          >
            <div style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 700, marginBottom: '6px' }}>
              PRIMARY CARTOGRAPHIC LAYERS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0284c7', display: 'inline-block' }} />
                <span>Active Spill Slick</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
                <span>Inconclusive Case</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '2px', backgroundColor: '#38bdf8', display: 'inline-block', borderBottom: '1px dashed #38bdf8' }} />
                <span>Reverse Hindcast</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', backgroundColor: 'rgba(245, 158, 11, 0.3)', border: '1px dashed #f59e0b', display: 'inline-block' }} />
                <span>Origin Region</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Active Case Files List */}
        <div style={{ backgroundColor: '#ffffff', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', backgroundColor: '#fafbfc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              Registered Case Files ({mockIncidents.length})
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Click to Open
            </span>
          </div>

          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {mockIncidents.map((inc) => {
              const isInconclusive = inc.attributionStatus === 'INCONCLUSIVE';
              const isHigh = inc.attributionStatus === 'HIGH CORRELATION';

              return (
                <div
                  key={inc.id}
                  onClick={() => onSelectIncident(inc.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    backgroundColor: inc.id === 'OS-037' ? 'var(--bg-subtle)' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  className="incident-overview-card"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{inc.id}</strong>
                      {inc.id === 'OS-037' && (
                        <span className="badge badge-amber" style={{ fontSize: '8px', padding: '1px 4px' }}>
                          FEATURED DEMO
                        </span>
                      )}
                    </div>

                    <span
                      className={`badge ${isInconclusive
                          ? 'badge-red'
                          : isHigh
                            ? 'badge-blue'
                            : 'badge-amber'
                        }`}
                      style={{ fontSize: '9px' }}
                    >
                      {inc.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.3 }}>
                    {inc.region}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
                    <div>Area: <strong style={{ color: 'var(--text-primary)' }}>{inc.slickProperties.areaKm2} km²</strong></div>
                    <div>Conf: <strong style={{ color: inc.slickProperties.confidencePct > 70 ? 'var(--accent-blue)' : '#d97706' }}>{inc.slickProperties.confidencePct.toFixed(0)}%</strong></div>
                    <div>Sensor: <strong>{inc.satelliteScene.satellite.split(' ')[0]}</strong></div>
                    <div>Candidates: <strong>{inc.candidateVessels.length}</strong></div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', fontSize: '11px', fontWeight: 600, color: 'var(--accent-blue)' }}>
                    <span>Launch Investigation</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
