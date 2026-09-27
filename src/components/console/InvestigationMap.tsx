import React, { useEffect, useRef, useState } from 'react';
import { Incident } from '../../types';
import { regionalCoastlines } from '../../data/coastalBoundaries';
import L from 'leaflet';
import { 
  Layers, 
  RotateCcw, 
  MapPin, 
  Navigation,
  Compass,
  Maximize2
} from 'lucide-react';

interface InvestigationMapProps {
  incident: Incident;
  selectedCandidateId: string | null;
  onSelectCandidate: (candidateId: string) => void;
  replayTimeIndex?: number;
  showCounterfactualOverlay?: boolean;
}

export const InvestigationMap: React.FC<InvestigationMapProps> = ({
  incident,
  selectedCandidateId,
  onSelectCandidate,
  showCounterfactualOverlay = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupsRef = useRef<{ [key: string]: L.LayerGroup }>({});

  // Active Map Layer Toggles
  const [layersVisible, setLayersVisible] = useState({
    slick: true,
    origin50: true,
    origin80: true,
    origin95: true,
    hindcast: true,
    forecast: true,
    aisTracks: true,
    darkVessels: true,
    currents: true,
    sensitiveAreas: true,
    counterfactual: true,
    coastlines: true,
    graticule: true,
  });

  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [mapStyle, setMapStyle] = useState<'osm' | 'carto' | 'chart'>('osm');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [incident.coordinates[0], incident.coordinates[1]],
        zoom: 9,
        zoomControl: false,
        attributionControl: false,
      });

      // Add zoom control at top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      mapInstanceRef.current = map;

      // Initialize Layer Groups
      layerGroupsRef.current = {
        baseTiles: L.layerGroup().addTo(map),
        analyticalChart: L.layerGroup().addTo(map),
        graticule: L.layerGroup().addTo(map),
        sensitiveAreas: L.layerGroup().addTo(map),
        origin: L.layerGroup().addTo(map),
        hindcast: L.layerGroup().addTo(map),
        forecast: L.layerGroup().addTo(map),
        currents: L.layerGroup().addTo(map),
        slick: L.layerGroup().addTo(map),
        ais: L.layerGroup().addTo(map),
        darkVessels: L.layerGroup().addTo(map),
        counterfactual: L.layerGroup().addTo(map),
      };
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Center when incident changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([incident.coordinates[0], incident.coordinates[1]], 9, {
        animate: true,
      });
    }
  }, [incident.id]);

  // Reset View Handler
  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([incident.coordinates[0], incident.coordinates[1]], 9, {
        animate: true,
      });
    }
  };

  // Base Tiles & Offline Analytical Background
  useEffect(() => {
    const map = mapInstanceRef.current;
    const baseGroup = layerGroupsRef.current.baseTiles;
    if (!map || !baseGroup) return;

    baseGroup.clearLayers();

    if (mapStyle === 'chart') {
      // 100% Offline Analytical Nautical Chart Mode (no tile requests)
      if (mapContainerRef.current) {
        mapContainerRef.current.style.backgroundColor = '#e8f0f8';
        mapContainerRef.current.style.backgroundImage = 'radial-gradient(#cbd5e1 1px, transparent 1px)';
        mapContainerRef.current.style.backgroundSize = '32px 32px';
      }
    } else {
      // Free, open basemap with automatic offline fallback
      const tileUrl =
        mapStyle === 'carto'
          ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
          : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

      const tiles = L.tileLayer(tileUrl, {
        maxZoom: 18,
        subdomains: 'abc',
      });

      tiles.on('tileerror', () => {
        // Tile request failed or network blocked: fallback to procedural chart background
        if (mapContainerRef.current) {
          mapContainerRef.current.style.backgroundColor = '#e8f0f8';
          mapContainerRef.current.style.backgroundImage = 'radial-gradient(#cbd5e1 1px, transparent 1px)';
          mapContainerRef.current.style.backgroundSize = '32px 32px';
        }
      });

      tiles.addTo(baseGroup);
    }
  }, [mapStyle]);

  // Draw Dynamic Layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const groups = layerGroupsRef.current;
    if (!groups) return;

    // Clear analytical vector layers
    Object.keys(groups).forEach((k) => {
      if (k !== 'baseTiles') groups[k].clearLayers();
    });

    const [centerLat, centerLng] = incident.coordinates;

    // 1. LAT/LONG GRATICULE GRID (0.25° increments)
    if (layersVisible.graticule) {
      const minLat = Math.floor(centerLat) - 1.5;
      const maxLat = Math.ceil(centerLat) + 1.5;
      const minLng = Math.floor(centerLng) - 2.0;
      const maxLng = Math.ceil(centerLng) + 2.0;

      for (let lat = minLat; lat <= maxLat; lat += 0.5) {
        L.polyline([[lat, minLng], [lat, maxLng]], {
          color: '#94a3b8',
          weight: 0.8,
          dashArray: '3, 6',
          opacity: 0.5,
        }).addTo(groups.graticule);

        // Latitude label marker
        const latLabel = L.divIcon({
          html: `<div style="font-family:'IBM Plex Mono',monospace; font-size:9px; color:#64748b; background:rgba(255,255,255,0.7); padding:1px 3px; border-radius:2px;">${lat.toFixed(1)}°N</div>`,
          className: 'graticule-label',
          iconSize: [40, 14],
        });
        L.marker([lat, minLng + 0.1], { icon: latLabel, interactive: false }).addTo(groups.graticule);
      }

      for (let lng = minLng; lng <= maxLng; lng += 0.5) {
        L.polyline([[minLat, lng], [maxLat, lng]], {
          color: '#94a3b8',
          weight: 0.8,
          dashArray: '3, 6',
          opacity: 0.5,
        }).addTo(groups.graticule);

        // Longitude label marker
        const lngLabel = L.divIcon({
          html: `<div style="font-family:'IBM Plex Mono',monospace; font-size:9px; color:#64748b; background:rgba(255,255,255,0.7); padding:1px 3px; border-radius:2px;">${lng.toFixed(1)}°E</div>`,
          className: 'graticule-label',
          iconSize: [40, 14],
        });
        L.marker([minLat + 0.1, lng], { icon: lngLabel, interactive: false }).addTo(groups.graticule);
      }
    }

    // 2. REGIONAL COASTLINE POLYGONS (Instant Self-Contained Landmasses)
    if (layersVisible.coastlines) {
      regionalCoastlines.forEach((feat) => {
        L.polygon(feat.polygon, {
          color: '#94a3b8',
          weight: 1.5,
          opacity: 0.8,
          fillColor: '#f1f5f9',
          fillOpacity: 0.7,
        }).addTo(groups.analyticalChart).bindTooltip(feat.name, { sticky: true });
      });
    }

    // 3. SENSITIVE MARINE AREAS
    if (layersVisible.sensitiveAreas && incident.sensitiveAreas) {
      incident.sensitiveAreas.forEach((sa) => {
        L.polygon(sa.coordinates.map(([lat, lng]) => [lat, lng] as [number, number]), {
          color: '#15803d',
          weight: 1.5,
          dashArray: '4, 4',
          fillColor: '#16a34a',
          fillOpacity: 0.12,
        }).addTo(groups.sensitiveAreas).bindTooltip(
          `<div style="font-family:'Inter', sans-serif; font-size:11px;">
            <strong style="color:#15803d;">PROTECTED AREA: ${sa.name}</strong><br/>
            Type: ${sa.type} | Distance: ${sa.distanceNm} nm
          </div>`,
          { sticky: true }
        );
      });
    }

    // 4. PROBABILISTIC ORIGIN CONTOURS (50%, 80%, 95%)
    if (incident.originContours) {
      // 95% Contour
      if (layersVisible.origin95 && incident.originContours.p95) {
        L.polygon(incident.originContours.p95.map(([lat, lng]) => [lat, lng] as [number, number]), {
          color: '#38bdf8',
          weight: 1.5,
          dashArray: '5, 5',
          opacity: 0.7,
          fillColor: '#38bdf8',
          fillOpacity: 0.08,
        }).addTo(groups.origin).bindTooltip('Probable Origin 95% Confidence Contour', { sticky: true });
      }

      // 80% Contour
      if (layersVisible.origin80 && incident.originContours.p80) {
        L.polygon(incident.originContours.p80.map(([lat, lng]) => [lat, lng] as [number, number]), {
          color: '#0284c7',
          weight: 1.8,
          opacity: 0.85,
          fillColor: '#0284c7',
          fillOpacity: 0.18,
        }).addTo(groups.origin).bindTooltip('Probable Origin 80% Confidence Contour', { sticky: true });
      }

      // 50% Contour (Apex Core)
      if (layersVisible.origin50 && incident.originContours.p50) {
        const p50Poly = L.polygon(incident.originContours.p50.map(([lat, lng]) => [lat, lng] as [number, number]), {
          color: '#0369a1',
          weight: 2.5,
          opacity: 1,
          fillColor: '#0284c7',
          fillOpacity: 0.45,
        }).addTo(groups.origin);

        p50Poly.bindTooltip(
          `<div style="font-family:'IBM Plex Mono', monospace; font-size:11px; padding:4px;">
            <strong>PROBABLE ORIGIN REGION (P50 CORE)</strong><br/>
            Release Window: ${incident.releaseWindow.startUtc.slice(11, 16)} – ${incident.releaseWindow.endUtc.slice(11, 16)} UTC<br/>
            Centroid: ${incident.releaseWindow.centroidLat.toFixed(2)}°N, ${incident.releaseWindow.centroidLng.toFixed(2)}°E<br/>
            Uncertainty Radius: ±${incident.releaseWindow.durationHours * 3.5} km
          </div>`,
          { sticky: true }
        );
      }
    }

    // 5. HINDCAST BACKWARD TRAJECTORY (Observed Slick -> Origin)
    if (layersVisible.hindcast && incident.hindcastTrajectory.length > 0) {
      const latlngs = incident.hindcastTrajectory.map((p) => [p.lat, p.lng] as [number, number]);
      
      const hindcastLine = L.polyline(latlngs, {
        color: '#0284c7',
        weight: 3,
        dashArray: '6, 6',
        opacity: 0.9,
      }).addTo(groups.hindcast);

      hindcastLine.bindTooltip('Ensemble Backward Drift Hindcast (OpenDrift Lagrangian Advection)', { sticky: true });

      // Waypoint markers with arrows
      incident.hindcastTrajectory.forEach((p, idx) => {
        const marker = L.circleMarker([p.lat, p.lng], {
          radius: idx === 0 ? 5 : 3.5,
          color: '#0284c7',
          fillColor: '#ffffff',
          fillOpacity: 1,
          weight: 2,
        }).addTo(groups.hindcast);

        marker.bindTooltip(
          `<div style="font-family:'IBM Plex Mono', monospace; font-size:10px;">
            Hindcast Point: ${p.time}<br/>
            Wind: ${p.windSpeedKts} kts (${p.windDirDeg}°)<br/>
            Current: ${Math.hypot(p.uCurrentM_s, p.vCurrentM_s).toFixed(2)} m/s
          </div>`
        );
      });
    }

    // 6. FORECAST FORWARD DRIFT CONE (Current Slick -> Future Dispersion)
    if (layersVisible.forecast && incident.forecastEnvelope.length > 0) {
      incident.forecastEnvelope.forEach((fc) => {
        if (fc.p50Cone && fc.p50Cone.length > 0) {
          L.polygon(fc.p50Cone.map(([lat, lng]) => [lat, lng] as [number, number]), {
            color: '#d97706',
            weight: 1.5,
            dashArray: '4, 4',
            opacity: 0.75,
            fillColor: '#fbbf24',
            fillOpacity: 0.15,
          }).addTo(groups.forecast);
        }

        const fcMarker = L.circleMarker([fc.lat, fc.lng], {
          radius: 4.5,
          color: '#d97706',
          fillColor: '#f59e0b',
          fillOpacity: 0.95,
          weight: 1.5,
        }).addTo(groups.forecast);

        fcMarker.bindTooltip(
          `<div style="font-family:'IBM Plex Mono', monospace; font-size:10px;">
            Forward Forecast Horizon: ${fc.time}<br/>
            Dispersion Envelope: ±${fc.uncertaintyRadiusKm} km
          </div>`
        );
      });
    }

    // 7. OCEAN CURRENT VECTORS
    if (layersVisible.currents && incident.currentVectors) {
      incident.currentVectors.forEach((cv) => {
        const len = 0.05 * (cv.speedKnots / 1.0);
        const rad = ((90 - cv.directionDeg) * Math.PI) / 180;
        const endLat = cv.lat + len * Math.sin(rad);
        const endLng = cv.lng + len * Math.cos(rad);

        L.polyline([[cv.lat, cv.lng], [endLat, endLng]], {
          color: '#0d9488',
          weight: 1.8,
          opacity: 0.75,
        }).addTo(groups.currents);

        L.circleMarker([endLat, endLng], {
          radius: 2,
          color: '#0d9488',
          fillColor: '#0d9488',
          fillOpacity: 1,
        }).addTo(groups.currents).bindTooltip(`Current: ${cv.speedKnots} kts @ ${cv.directionDeg}°`);
      });
    }

    // 8. DETECTED OIL SLICK POLYGON (Amber / Orange with Core)
    if (layersVisible.slick && incident.slickPolygon.length > 0) {
      const slickLatlngs = incident.slickPolygon.map(([lat, lng]) => [lat, lng] as [number, number]);
      
      // Outer Dispersion Aura
      L.polygon(slickLatlngs, {
        color: '#d97706',
        weight: 6,
        opacity: 0.35,
        fillColor: '#d97706',
        fillOpacity: 0.25,
      }).addTo(groups.slick);

      // Core Slick
      const coreSlick = L.polygon(slickLatlngs, {
        color: '#ea580c',
        weight: 2,
        opacity: 0.95,
        fillColor: '#b45309',
        fillOpacity: 0.7,
      }).addTo(groups.slick);

      coreSlick.bindTooltip(
        `<div style="font-family:'IBM Plex Mono', monospace; font-size:11px; padding:4px;">
          <strong>DETECTED SLICK: ${incident.id}</strong><br/>
          Area: ${incident.slickProperties.areaKm2} km²<br/>
          Volume: ${incident.slickProperties.estimatedVolumeM3} m³<br/>
          Confidence: ${incident.slickProperties.confidencePct}%<br/>
          Look-Alike Risk: ${incident.slickProperties.lookAlikeRisk}
        </div>`,
        { sticky: true }
      );
    }

    // 9. AIS CANDIDATE TRACKS & SHIP MARKERS
    if (layersVisible.aisTracks && incident.candidateVessels) {
      incident.candidateVessels.forEach((cand) => {
        const isSelected = cand.id === selectedCandidateId;
        const isHigh = cand.correlationTier === 'HIGH CORRELATION';
        
        const trackColor = isSelected 
          ? '#dc2626' 
          : isHigh 
          ? '#0284c7' 
          : '#64748b';

        if (cand.track.length > 1) {
          const latlngs = cand.track.map((t) => [t.lat, t.lng] as [number, number]);
          
          const trackPoly = L.polyline(latlngs, {
            color: trackColor,
            weight: isSelected ? 3.5 : 2,
            opacity: isSelected ? 1 : 0.65,
          }).addTo(groups.ais);

          trackPoly.on('click', () => onSelectCandidate(cand.id));
        }

        // Apex coordinate on track
        const apexPoint = cand.track[Math.min(2, cand.track.length - 1)];
        if (apexPoint) {
          const shipIconHtml = `
            <div style="
              width: 24px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              background-color: ${isSelected ? '#dc2626' : isHigh ? '#0284c7' : '#475569'};
              color: #ffffff;
              border-radius: 50%;
              border: 2px solid #ffffff;
              box-shadow: 0 2px 5px rgba(0,0,0,0.3);
              font-size: 11px;
              cursor: pointer;
            ">
              🚢
            </div>
          `;

          const customIcon = L.divIcon({
            html: shipIconHtml,
            className: 'custom-vessel-marker',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          const marker = L.marker([apexPoint.lat, apexPoint.lng], { icon: customIcon }).addTo(groups.ais);
          marker.on('click', () => onSelectCandidate(cand.id));

          marker.bindTooltip(
            `<div style="font-family:'IBM Plex Mono', monospace; font-size:11px; padding:4px;">
              <strong>${cand.name} (${cand.flag})</strong><br/>
              MMSI: ${cand.mmsi} | Type: ${cand.vesselType}<br/>
              Speed at CPA: ${cand.speedAtCpaKnots} kts<br/>
              Correlation Rank: #${cand.correlationRank} (${cand.overallScore}% ${cand.correlationTier})
            </div>`,
            { sticky: true }
          );
        }
      });
    }

    // 10. SAR CONTACTS & AIS DISCREPANCIES (Dark Vessels)
    if (layersVisible.darkVessels && incident.darkVessels) {
      incident.darkVessels.forEach((dv) => {
        const darkIconHtml = `
          <div style="
            width: 22px;
            height: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #ea580c;
            color: #ffffff;
            border-radius: 4px;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 5px rgba(0,0,0,0.4);
            font-size: 10px;
            cursor: pointer;
          ">
            ⚠️
          </div>
        `;

        const darkIcon = L.divIcon({
          html: darkIconHtml,
          className: 'custom-dark-vessel-marker',
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        const marker = L.marker([dv.lat, dv.lng], { icon: darkIcon }).addTo(groups.darkVessels);

        marker.bindTooltip(
          `<div style="font-family:'IBM Plex Mono', monospace; font-size:11px; padding:4px; max-width:240px;">
            <strong style="color:#ea580c;">POTENTIAL AIS/SAR DISCREPANCY (${dv.id})</strong><br/>
            SAR Metallic Length: ~${dv.estimatedLengthM}m<br/>
            SAR Radar Cross Section: ${dv.sarRCS_dB} dB<br/>
            Nearest AIS Transmission: ${dv.nearestAisDistanceNm} nm<br/>
            <span style="font-size:10px; color:#64748b;">${dv.notes}</span>
          </div>`,
          { sticky: true }
        );
      });
    }

    // 11. COUNTERFACTUAL SIMULATION OVERLAY
    if (showCounterfactualOverlay && layersVisible.counterfactual) {
      const selectedCand = incident.candidateVessels.find((c) => c.id === selectedCandidateId) || incident.candidateVessels[0];
      if (selectedCand?.counterfactualResult?.simulatedSlickGeoJson) {
        const simLatlngs = selectedCand.counterfactualResult.simulatedSlickGeoJson.map(([lat, lng]) => [lat, lng] as [number, number]);
        
        const simPoly = L.polygon(simLatlngs, {
          color: '#0d9488',
          weight: 2,
          dashArray: '4, 4',
          fillColor: '#2dd4bf',
          fillOpacity: 0.35,
        }).addTo(groups.counterfactual);

        simPoly.bindTooltip(
          `<div style="font-family:'IBM Plex Mono', monospace; font-size:11px; padding:4px;">
            <strong style="color:#0d9488;">COUNTERFACTUAL SIMULATION OVERLAY</strong><br/>
            Candidate: ${selectedCand.name}<br/>
            Spatial IoU Match: ${(selectedCand.counterfactualResult.iouMetric * 100).toFixed(1)}%<br/>
            Centroid Offset: ${selectedCand.counterfactualResult.hausdorffDistanceKm.toFixed(1)} km<br/>
            Overall Similarity: ${selectedCand.counterfactualResult.similarityPct}%
          </div>`,
          { sticky: true }
        );
      }
    }

  }, [
    incident,
    selectedCandidateId,
    layersVisible,
    showCounterfactualOverlay,
  ]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* MAP CONTAINER */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

      {/* TOP LEFT: MAP HEADING & TELEMETRY BADGE */}
      <div 
        style={{ 
          position: 'absolute', 
          top: '12px', 
          left: '12px', 
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxWidth: 'calc(100% - 130px)'
        }}
      >
        <div 
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.96)', 
            backdropFilter: 'blur(8px)',
            padding: '6px 12px', 
            borderRadius: '4px',
            border: '1px solid var(--border-strong)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0284c7' }}></div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {incident.region}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {incident.satelliteScene.satellite} • {incident.detectionTimeUtc}
            </div>
          </div>
        </div>

        {/* Legend Bar */}
        <div 
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.96)', 
            backdropFilter: 'blur(8px)',
            padding: '5px 10px', 
            borderRadius: '4px',
            border: '1px solid var(--border)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '10px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '9px', height: '9px', backgroundColor: '#d97706', display: 'inline-block', borderRadius: '2px' }}></span>
            <span>Observed Slick</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '9px', height: '9px', backgroundColor: '#0284c7', display: 'inline-block', borderRadius: '2px' }}></span>
            <span>Origin P50/P80/P95</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '9px', height: '9px', backgroundColor: '#15803d', display: 'inline-block', borderRadius: '2px' }}></span>
            <span>Sanctuary</span>
          </div>
          {showCounterfactualOverlay && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '9px', height: '9px', backgroundColor: '#0d9488', display: 'inline-block', borderRadius: '2px', border: '1px dashed #ffffff' }}></span>
              <span style={{ color: '#0d9488', fontWeight: 600 }}>Simulated Release</span>
            </div>
          )}
        </div>
      </div>

      {/* TOP RIGHT: CONTROLS (RESET VIEW + LAYERS TOGGLE) */}
      <div 
        style={{ 
          position: 'absolute', 
          top: '12px', 
          right: '54px', 
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        <button
          onClick={handleResetView}
          className="btn btn-secondary btn-sm"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            boxShadow: 'var(--shadow-sm)',
            padding: '5px 8px',
          }}
          title="Reset Map Center"
        >
          <RotateCcw size={13} />
        </button>

        <button
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          className="btn btn-secondary btn-sm"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 500,
          }}
        >
          <Layers size={13} /> Layers ({Object.values(layersVisible).filter(Boolean).length})
        </button>

        {showLayerMenu && (
          <div 
            style={{ 
              position: 'absolute', 
              top: '36px', 
              right: 0, 
              width: '250px', 
              backgroundColor: '#ffffff', 
              border: '1px solid var(--border-strong)',
              borderRadius: '6px',
              boxShadow: 'var(--shadow-lg)',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              zIndex: 30
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
              GEOSPATIAL LAYERS
            </div>

            {[
              { key: 'slick', label: 'Detected Oil Slick (SAR)' },
              { key: 'origin50', label: 'Probable Origin 50% Core' },
              { key: 'origin80', label: 'Probable Origin 80%' },
              { key: 'origin95', label: 'Probable Origin 95% Bound' },
              { key: 'hindcast', label: 'Drift Hindcast Path' },
              { key: 'forecast', label: 'Drift Forecast Cone' },
              { key: 'aisTracks', label: 'AIS Candidate Tracks' },
              { key: 'darkVessels', label: 'Potential AIS/SAR Gaps' },
              { key: 'currents', label: 'Ocean Current Vectors' },
              { key: 'sensitiveAreas', label: 'Marine Protected Areas' },
              { key: 'counterfactual', label: 'Simulated Slick Overlay' },
              { key: 'coastlines', label: 'Regional Coastlines' },
              { key: 'graticule', label: 'Lat/Long Graticule Grid' },
            ].map(({ key, label }) => {
              const active = layersVisible[key as keyof typeof layersVisible];
              return (
                <label 
                  key={key}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setLayersVisible({ ...layersVisible, [key]: e.target.checked })}
                  />
                </label>
              );
            })}

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '4px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                BASEMAP PROVIDER (ZERO API KEY)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                {[
                  { id: 'osm', label: 'OpenStreet' },
                  { id: 'carto', label: 'Voyager' },
                  { id: 'chart', label: 'Vector Chart' }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setMapStyle(st.id as any)}
                    style={{
                      padding: '4px 6px',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      border: '1px solid var(--border)',
                      borderRadius: '3px',
                      backgroundColor: mapStyle === st.id ? 'var(--accent-blue-light)' : '#ffffff',
                      color: mapStyle === st.id ? 'var(--accent-blue)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM LEFT: DATA PROVENANCE LAYER LEGEND (SECTION 20 COMPLIANCE) */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          zIndex: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--border-strong)',
          borderRadius: '4px',
          padding: '8px 10px',
          boxShadow: 'var(--shadow-sm)',
          fontSize: '10px',
          fontFamily: 'var(--font-mono)',
          maxWidth: '230px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}
      >
        <div style={{ fontWeight: 700, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '3px', marginBottom: '2px', display: 'flex', justifyContent: 'space-between' }}>
          <span>LAYER PROVENANCE</span>
          <span style={{ color: 'var(--accent-blue)' }}>STATUS KEY</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#dc2626', display: 'inline-block' }}></span>
          <span><strong style={{ color: '#991b1b' }}>OBSERVED:</strong> SAR Spill Slick</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0284c7', display: 'inline-block' }}></span>
          <span><strong style={{ color: '#0369a1' }}>DERIVED:</strong> Origin Centroid</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', border: '1px dashed #0284c7', borderRadius: '2px', display: 'inline-block' }}></span>
          <span><strong style={{ color: '#0284c7' }}>UNCERTAIN:</strong> P50/80/95 Envelopes</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '2px', backgroundColor: '#d97706', display: 'inline-block' }}></span>
          <span><strong style={{ color: '#b45309' }}>MODELLED:</strong> Hindcast / Forecast</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '2px', backgroundColor: '#0d9488', display: 'inline-block' }}></span>
          <span><strong style={{ color: '#0f766e' }}>SYNTHETIC:</strong> AIS Reconstructed Track</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#10b981', opacity: 0.6, display: 'inline-block' }}></span>
          <span><strong style={{ color: '#047857' }}>COUNTERFACTUAL:</strong> In-Silico Release</span>
        </div>
      </div>

      {/* BOTTOM RIGHT: PRECISION COORDINATES & ENGINE STATUS */}
      <div 
        style={{ 
          position: 'absolute', 
          bottom: '10px', 
          right: '12px', 
          zIndex: 10,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(6px)',
          padding: '4px 8px',
          borderRadius: '4px',
          color: '#f8fafc',
          fontSize: '10px',
          fontFamily: 'var(--font-mono)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <span>WGS84 EPSG:4326</span>
        <span>•</span>
        <span>NO API KEY REQUIRED</span>
        <span>•</span>
        <span>OPEN GEOSPATIAL ENGINE</span>
      </div>

    </div>
  );
};
