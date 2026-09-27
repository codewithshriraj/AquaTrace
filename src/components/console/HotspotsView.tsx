import React, { useState, useEffect, useRef } from 'react';
import { mockHotspots } from '../../data/mockIncidents';
import L from 'leaflet';
import { MapPin, AlertTriangle, ShieldAlert, TrendingUp, Layers, RotateCcw, Compass } from 'lucide-react';

export const HotspotsView: React.FC = () => {
  const [selectedHotspotId, setSelectedHotspotId] = useState(mockHotspots[0].id);
  const selectedHotspot = mockHotspots.find((h) => h.id === selectedHotspotId) || mockHotspots[0];

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Hotspot GIS Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [selectedHotspot.lat, selectedHotspot.lng],
        zoom: 5,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // High-res satellite imagery basemap
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
      }).addTo(map);

      // Layer group for hotspots and shipping corridors
      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;

      // Draw Global Commercial Crude Shipping Fairways (Esri / Viridien style)
      const majorShippingRoutes: [number, number][][] = [
        // Persian Gulf -> Arabian Sea -> Malacca Strait Trunkline
        [
          [26.5, 56.5], // Strait of Hormuz
          [24.0, 60.0],
          [20.0, 66.0],
          [18.5, 71.3], // Mumbai High
          [12.0, 75.0],
          [6.0, 80.0],  // Southern Sri Lanka
          [5.5, 95.0],  // Northern Sumatra
          [3.2, 101.0], // Malacca Strait
          [1.25, 103.8] // Singapore
        ],
        // Bab-el-Mandeb -> Red Sea -> Suez Approach
        [
          [12.5, 43.5], // Bab-el-Mandeb
          [18.0, 40.0],
          [23.0, 37.0],
          [27.5, 34.2], // Suez South
          [29.9, 32.5]  // Suez Canal
        ],
        // India West Coast feeder (Gulf of Kachchh -> Mumbai)
        [
          [22.3, 69.2], // Gulf of Kachchh
          [20.5, 70.8],
          [18.5, 71.3]  // Mumbai High
        ]
      ];

      majorShippingRoutes.forEach((route) => {
        L.polyline(route, {
          color: '#f59e0b',
          weight: 3.5,
          opacity: 0.25,
        }).addTo(markersGroup);

        L.polyline(route, {
          color: '#fde047',
          weight: 1.2,
          dashArray: '8, 6',
          opacity: 0.75,
        }).addTo(markersGroup);
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Hotspot Markers & Clusters
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    // Render hotspot markers
    mockHotspots.forEach((hs) => {
      const isSelected = hs.id === selectedHotspotId;
      const isCritical = hs.riskScore >= 85;

      // Risk Radius Area (Semi-transparent circle)
      L.circle([hs.lat, hs.lng], {
        radius: hs.riskScore * 650,
        color: isCritical ? '#ef4444' : '#f59e0b',
        fillColor: isCritical ? '#ef4444' : '#f59e0b',
        fillOpacity: isSelected ? 0.35 : 0.18,
        weight: isSelected ? 2.5 : 1.2,
        dashArray: isSelected ? undefined : '4, 4',
      }).addTo(markersGroup);

      // Custom Hotspot Pin Icon
      const pinIconHtml = `
        <div style="
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(15, 23, 42, 0.94);
          border: 2px solid ${isSelected ? '#38bdf8' : isCritical ? '#ef4444' : '#f59e0b'};
          padding: 3px 8px;
          border-radius: 20px;
          color: #f8fafc;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0,0,0,0.6);
          cursor: pointer;
          transform: ${isSelected ? 'scale(1.12)' : 'scale(1.0)'};
          transition: transform 0.2s ease;
        ">
          <span style="
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: ${isCritical ? '#ef4444' : '#f59e0b'};
            box-shadow: 0 0 8px ${isCritical ? '#ef4444' : '#f59e0b'};
            display: inline-block;
          "></span>
          <span>${hs.name.split(' ')[0]} (${hs.spillCount})</span>
        </div>
      `;

      const customPin = L.divIcon({
        html: pinIconHtml,
        className: `hotspot-pin-${hs.id}`,
        iconSize: [120, 24],
        iconAnchor: [60, 12],
      });

      const marker = L.marker([hs.lat, hs.lng], { icon: customPin }).addTo(markersGroup);
      marker.on('click', () => {
        setSelectedHotspotId(hs.id);
        map.flyTo([hs.lat, hs.lng], 7, { duration: 1.2 });
      });

      marker.bindTooltip(
        `<div style="font-family:'IBM Plex Mono', monospace; font-size:11px; padding:4px;">
          <strong style="color:#38bdf8;">${hs.name}</strong><br/>
          Verified Slicks: <strong>${hs.spillCount}</strong> | Risk Index: <strong>${hs.riskScore}/100</strong><br/>
          Primary Cause: ${hs.primaryCause}
        </div>`,
        { sticky: true }
      );
    });
  }, [selectedHotspotId]);

  // Handle Card Click -> Smooth Fly to Map Coordinates
  const handleSelectHotspot = (hsId: string) => {
    setSelectedHotspotId(hsId);
    const target = mockHotspots.find((h) => h.id === hsId);
    if (target && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([target.lat, target.lng], 7, { duration: 1.2 });
    }
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '24px', backgroundColor: 'var(--bg-body)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-teal">MULTI-EVENT SPATIAL INTELLIGENCE</span>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                HISTORICAL SPILL CLUSTERS & SHIPPING CORRIDORS
              </span>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              Maritime Chronic Spill Corridors & Hotspots
            </h3>
          </div>

          <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            Aggregating 5 Global Surveillance Zones (Viridien & Esri AIS Feeds)
          </div>
        </div>

        {/* INTERACTIVE GLOBAL / REGIONAL CORRIDOR MAP (Satellite Basemap + Hotspots + Shipping Lanes) */}
        <div 
          className="gis-panel" 
          style={{ 
            height: '380px', 
            position: 'relative', 
            overflow: 'hidden',
            borderRadius: '8px',
            border: '1px solid var(--border-strong)',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          {/* Map Leaflet Canvas */}
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

          {/* Map Overlay Badge */}
          <div 
            style={{ 
              position: 'absolute', 
              top: '12px', 
              left: '12px', 
              zIndex: 10,
              backgroundColor: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(8px)',
              padding: '6px 12px',
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#f8fafc',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 6px #10b981' }}></span>
            <span>GLOBAL AIS TRUNK LINES // SATELLITE CHRONIC SLICK CLUSTERS</span>
          </div>

          {/* Map Reset Button */}
          <button
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo([15.0, 75.0], 4, { duration: 1.0 });
              }
            }}
            className="btn btn-secondary btn-sm"
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              zIndex: 10,
              backgroundColor: 'rgba(15, 23, 42, 0.92)',
              color: '#f8fafc',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)'
            }}
            title="Reset Global View"
          >
            <RotateCcw size={12} /> Global View
          </button>
        </div>

        {/* Grid of Hotspots */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {mockHotspots.map((hs) => {
            const isSelected = hs.id === selectedHotspot.id;
            const isCritical = hs.riskScore >= 85;
            return (
              <div
                key={hs.id}
                onClick={() => handleSelectHotspot(hs.id)}
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
                    className={`badge ${isCritical ? 'badge-red' : 'badge-amber'}`}
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
                  <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>Fly on Map →</span>
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
