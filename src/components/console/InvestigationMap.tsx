import React, { useEffect, useRef, useState } from 'react';
import { Incident } from '../../types';
import { regionalCoastlines } from '../../data/coastalBoundaries';
import L from 'leaflet';
import { 
  Layers, 
  RotateCcw, 
  Compass, 
  Maximize2, 
  Minimize2,
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Ship, 
  Activity,
  Crosshair,
  Ruler,
  X
} from 'lucide-react';

interface InvestigationMapProps {
  incident: Incident;
  selectedCandidateId: string | null;
  onSelectCandidate: (candidateId: string) => void;
  replayTimeIndex?: number;
  showCounterfactualOverlay?: boolean;
}

export type MapVisualMode = 'spectral-plume' | 'satellite-noaa' | 'sar-osi' | 'ocean-bathymetry' | 'tactical-dark' | 'nautical-chart';

export const InvestigationMap: React.FC<InvestigationMapProps> = ({
  incident,
  selectedCandidateId,
  onSelectCandidate,
  showCounterfactualOverlay = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupsRef = useRef<{ [key: string]: L.LayerGroup }>({});

  // Active Map Visual Style
  const [visualMode, setVisualMode] = useState<MapVisualMode>('spectral-plume');
  const [isLegendOpen, setIsLegendOpen] = useState(true);
  const [isVesselHudOpen, setIsVesselHudOpen] = useState(true);
  const [showMirosModal, setShowMirosModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Measurement Tool State
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);
  const [measureResult, setMeasureResult] = useState<{ distanceNm: number; bearingDeg: number } | null>(null);

  // Live Cursor Telemetry State
  const [cursorTelemetry, setCursorTelemetry] = useState<{
    lat: number;
    lng: number;
    depthM: number;
    nrcsDb: number;
  } | null>(null);

  // Active Map Layer Toggles
  const [layersVisible, setLayersVisible] = useState({
    slickMultiTier: true,
    sarSwathFootprint: true,
    shippingCorridors: true,
    rangeRings: true,
    scienceDirectCallouts: true,
    orthogonalOffsets: true,
    origin50: true,
    origin80: true,
    origin95: true,
    hindcast: true,
    forecast: true,
    aisTracks: true,
    waypointTimestamps: true,
    correlationVector: true,
    darkVessels: true,
    currents: true,
    sensitiveAreas: true,
    counterfactual: true,
    coastlines: true,
    graticule: true,
  });

  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Active selected candidate vessel
  const selectedCandidate = incident.candidateVessels.find((c) => c.id === selectedCandidateId) || incident.candidateVessels[0];

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

      L.control.zoom({ position: 'topright' }).addTo(map);
      mapInstanceRef.current = map;

      // Layer groups in strict visual z-order
      layerGroupsRef.current = {
        baseTiles: L.layerGroup().addTo(map),
        swathFootprint: L.layerGroup().addTo(map),
        shippingLanes: L.layerGroup().addTo(map),
        analyticalChart: L.layerGroup().addTo(map),
        graticule: L.layerGroup().addTo(map),
        rangeRings: L.layerGroup().addTo(map),
        sensitiveAreas: L.layerGroup().addTo(map),
        forecast: L.layerGroup().addTo(map),
        origin: L.layerGroup().addTo(map),
        hindcast: L.layerGroup().addTo(map),
        currents: L.layerGroup().addTo(map),
        slickMultiTier: L.layerGroup().addTo(map),
        counterfactual: L.layerGroup().addTo(map),
        ais: L.layerGroup().addTo(map),
        correlationVector: L.layerGroup().addTo(map),
        waypoints: L.layerGroup().addTo(map),
        callouts: L.layerGroup().addTo(map),
        darkVessels: L.layerGroup().addTo(map),
        measurement: L.layerGroup().addTo(map),
      };

      // Mousemove telemetry listener
      map.on('mousemove', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        const dLat = lat - incident.coordinates[0];
        const dLng = lng - incident.coordinates[1];
        const dist = Math.hypot(dLat, dLng);
        // Estimate capillary damping inside slick
        const nrcs = dist < 0.12 ? -18.4 - (0.12 - dist) * 15 : -12.2 + Math.sin(lat * 8) * 0.6;
        const depth = Math.round(950 + Math.abs(dLng) * 1200 + Math.abs(dLat) * 400);
        setCursorTelemetry({ lat, lng, depthM: depth, nrcsDb: Number(nrcs.toFixed(1)) });
      });

      map.on('mouseout', () => {
        setCursorTelemetry(null);
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Measurement Click Handler
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!isMeasuring) return;

      const clickPt: [number, number] = [e.latlng.lat, e.latlng.lng];
      setMeasurePoints((prev) => {
        if (prev.length === 0) {
          return [clickPt];
        } else if (prev.length === 1) {
          const ptA = prev[0];
          const ptB = clickPt;

          // Calculate nautical distance (1 deg ~ 60 nm)
          const dLat = (ptB[0] - ptA[0]) * 60;
          const dLng = (ptB[1] - ptA[1]) * 60 * Math.cos(((ptA[0] + ptB[0]) / 2) * (Math.PI / 180));
          const distNm = Math.hypot(dLat, dLng);

          // Calculate true bearing
          let bearing = (Math.atan2(dLng, dLat) * 180) / Math.PI;
          if (bearing < 0) bearing += 360;

          setMeasureResult({
            distanceNm: Number(distNm.toFixed(2)),
            bearingDeg: Math.round(bearing),
          });

          return [ptA, ptB];
        } else {
          setMeasureResult(null);
          return [clickPt];
        }
      });
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isMeasuring]);

  // Render Measurement Visuals
  useEffect(() => {
    const groups = layerGroupsRef.current;
    if (!groups || !groups.measurement) return;
    groups.measurement.clearLayers();

    if (measurePoints.length === 1) {
      L.circleMarker(measurePoints[0], {
        radius: 6,
        color: '#facc15',
        fillColor: '#facc15',
        fillOpacity: 1,
        weight: 2,
      }).addTo(groups.measurement);
    } else if (measurePoints.length === 2 && measureResult) {
      const [ptA, ptB] = measurePoints;

      L.polyline([ptA, ptB], {
        color: '#facc15',
        weight: 2.5,
        dashArray: '5, 5',
        opacity: 0.95,
      }).addTo(groups.measurement);

      L.circleMarker(ptA, { radius: 5, color: '#facc15', fillColor: '#facc15', fillOpacity: 1 }).addTo(groups.measurement);
      L.circleMarker(ptB, { radius: 5, color: '#facc15', fillColor: '#ef4444', fillOpacity: 1 }).addTo(groups.measurement);

      const midPt: [number, number] = [(ptA[0] + ptB[0]) / 2, (ptA[1] + ptB[1]) / 2];
      const tag = L.divIcon({
        html: `
          <div style="
            background: rgba(15, 23, 42, 0.92);
            border: 1px solid #facc15;
            color: #fef08a;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 10px;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 4px;
            white-space: nowrap;
            box-shadow: 0 2px 6px rgba(0,0,0,0.6);
          ">
            📐 ${measureResult.distanceNm} NM · ${measureResult.bearingDeg}°T
          </div>
        `,
        className: 'measure-tag',
        iconSize: [110, 22],
        iconAnchor: [55, 11],
      });
      L.marker(midPt, { icon: tag, interactive: false }).addTo(groups.measurement);
    }
  }, [measurePoints, measureResult]);

  // Center when incident changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([incident.coordinates[0], incident.coordinates[1]], 9, {
        animate: true,
      });
    }
  }, [incident.id]);

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([incident.coordinates[0], incident.coordinates[1]], 9, {
        animate: true,
      });
    }
  };

  // Base Tiles setup based on active visual mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    const baseGroup = layerGroupsRef.current.baseTiles;
    if (!map || !baseGroup) return;

    baseGroup.clearLayers();

    if (visualMode === 'nautical-chart') {
      if (mapContainerRef.current) {
        mapContainerRef.current.style.backgroundColor = '#0b1622';
        mapContainerRef.current.style.backgroundImage = 'radial-gradient(#1e3a5f 1px, transparent 1px)';
        mapContainerRef.current.style.backgroundSize = '32px 32px';
      }
      return;
    }

    let tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    let maxZoom = 19;
    let subdomains = 'abc';

    if (visualMode === 'tactical-dark') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      maxZoom = 19;
    } else if (visualMode === 'ocean-bathymetry') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}';
      maxZoom = 13;
    } else if (visualMode === 'sar-osi') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      maxZoom = 19;
    } else {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      maxZoom = 19;
    }

    const tiles = L.tileLayer(tileUrl, {
      maxZoom,
      subdomains,
    });

    tiles.on('tileerror', () => {
      if (mapContainerRef.current) {
        mapContainerRef.current.style.backgroundColor = '#0b1928';
        mapContainerRef.current.style.backgroundImage = 'radial-gradient(#1e3a5f 1px, transparent 1px)';
        mapContainerRef.current.style.backgroundSize = '32px 32px';
      }
    });

    tiles.addTo(baseGroup);
  }, [visualMode]);

  // Helper to generate concentric offset polygons for scientific multi-tier plume gradients
  const generateConcentricRings = (points: [number, number][], apexCentroid: [number, number]) => {
    if (points.length < 3) return [];
    
    let sumLat = 0;
    let sumLng = 0;
    points.forEach(([lat, lng]) => {
      sumLat += lat;
      sumLng += lng;
    });
    const cLat = sumLat / points.length;
    const cLng = sumLng / points.length;

    const dirLat = apexCentroid[0] - cLat;
    const dirLng = apexCentroid[1] - cLng;

    // 5 distinct physical oil layers according to Bonn Agreement & NOAA thickness codes
    const tiers = [
      { scale: 1.30, shift: 0.05, code: 'Code 1', label: 'Capillary Damping Halo (< 0.1 µm)' },
      { scale: 1.00, shift: 0.00, code: 'Code 2', label: 'Rainbow Sheen Boundary (0.1–5.0 µm)' },
      { scale: 0.72, shift: 0.14, code: 'Code 3', label: 'Metallic / Dispersed Film (5.0–20 µm)' },
      { scale: 0.48, shift: 0.25, code: 'Code 4', label: 'Emulsified Oil Plume (20–100 µm)' },
      { scale: 0.25, shift: 0.38, code: 'Code 5', label: 'Continuous Heavy Crude Core (> 100 µm)' },
    ];

    return tiers.map(tier => {
      const ring = points.map(([lat, lng]) => {
        const scaledLat = cLat + (lat - cLat) * tier.scale + dirLat * tier.shift;
        const scaledLng = cLng + (lng - cLng) * tier.scale + dirLng * tier.shift;
        return [scaledLat, scaledLng] as [number, number];
      });
      return { ring, label: tier.label, code: tier.code, scale: tier.scale };
    });
  };

  // Draw Dynamic Map Layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const groups = layerGroupsRef.current;
    if (!groups) return;

    // Clear analytical vector layers
    Object.keys(groups).forEach((k) => {
      if (k !== 'baseTiles' && k !== 'measurement') groups[k].clearLayers();
    });

    const [centerLat, centerLng] = incident.coordinates;
    const apexPoint: [number, number] = [incident.releaseWindow.centroidLat, incident.releaseWindow.centroidLng];

    // 1. SATELLITE RADAR SWATH FOOTPRINT (Sentinel-1 / EOS-04 acquisition frame with coordinate labels)
    if (layersVisible.sarSwathFootprint) {
      const swathBounds: [number, number][] = [
        [centerLat + 1.25, centerLng - 1.55],
        [centerLat + 1.45, centerLng + 1.35],
        [centerLat - 1.35, centerLng + 1.55],
        [centerLat - 1.55, centerLng - 1.35],
        [centerLat + 1.25, centerLng - 1.55],
      ];

      L.polygon(swathBounds, {
        color: '#38bdf8',
        weight: 1.4,
        dashArray: '8, 6',
        opacity: 0.85,
        fillColor: '#0284c7',
        fillOpacity: visualMode === 'sar-osi' ? 0.08 : 0.03,
      }).addTo(groups.swathFootprint).bindTooltip(
        `<div style="font-family:'IBM Plex Mono', monospace; font-size:11px;">
          <strong>SAR SWATH ACQUISITION FOOTPRINT</strong><br/>
          Sensor: ${incident.satelliteScene.satellite} (${incident.satelliteScene.sensor})<br/>
          Pass: ${incident.satelliteScene.orbitPass}<br/>
          Incidence Angle: ${incident.satelliteScene.incidenceAngleDeg}° | Polarization: ${incident.satelliteScene.polarisation}
        </div>`,
        { sticky: true }
      );

      // Swath Corner Marker Tag
      const swathTag = L.divIcon({
        html: `<div style="font-family:'IBM Plex Mono',monospace; font-size:9px; color:#38bdf8; background:rgba(15,23,42,0.85); padding:2px 6px; border-radius:3px; border:1px solid #38bdf8; white-space:nowrap;">🛰️ ${incident.satelliteScene.satellite} IW GRDH</div>`,
        className: 'swath-tag',
        iconSize: [120, 18],
      });
      L.marker([centerLat + 1.25, centerLng - 1.55], { icon: swathTag, interactive: false }).addTo(groups.swathFootprint);
    }

    // 2. CONCENTRIC NAUTICAL RANGE RINGS (Britannica / Sanchi Collision Reference)
    if (layersVisible.rangeRings) {
      const distancesNm = [5, 10, 15, 20, 25];
      distancesNm.forEach((nm) => {
        const radiusMeters = nm * 1852;
        L.circle(apexPoint, {
          radius: radiusMeters,
          color: '#38bdf8',
          weight: 1.1,
          dashArray: '4, 6',
          opacity: 0.45,
          fill: false,
        }).addTo(groups.rangeRings);

        // Radial Range Label along 045° bearing
        const rad = (45 * Math.PI) / 180;
        const dDeg = (nm / 60);
        const labelLat = apexPoint[0] + dDeg * Math.cos(rad);
        const labelLng = apexPoint[1] + (dDeg * Math.sin(rad)) / Math.cos(apexPoint[0] * (Math.PI / 180));

        const ringLabel = L.divIcon({
          html: `<div style="font-family:'IBM Plex Mono',monospace; font-size:9px; color:#38bdf8; background:rgba(15,23,42,0.85); padding:1px 4px; border-radius:2px; border:1px solid rgba(56,189,248,0.3);">${nm} NM</div>`,
          className: 'range-ring-label',
          iconSize: [36, 14],
        });
        L.marker([labelLat, labelLng], { icon: ringLabel, interactive: false }).addTo(groups.rangeRings);
      });
    }

    // 3. SHIPPING LANES / TRAFFIC CORRIDORS (from Esri "Protecting the Oceans and Shores" reference)
    if (layersVisible.shippingCorridors) {
      const shippingCorridors: [number, number][][] = [
        [
          [17.8, 70.2],
          [18.1, 70.6],
          [18.28, 70.95],
          [18.5, 71.4],
          [18.8, 71.9],
          [19.1, 72.4]
        ],
        [
          [17.5, 71.8],
          [18.0, 72.0],
          [18.6, 72.3],
          [19.0, 72.6]
        ]
      ];

      shippingCorridors.forEach((corr, idx) => {
        L.polyline(corr, {
          color: '#f59e0b',
          weight: 4,
          opacity: 0.22,
          lineCap: 'round',
        }).addTo(groups.shippingLanes);

        L.polyline(corr, {
          color: '#fde047',
          weight: 1.2,
          dashArray: '10, 8',
          opacity: 0.65,
        }).addTo(groups.shippingLanes).bindTooltip(
          `<div style="font-family:'IBM Plex Mono', monospace; font-size:10px;">
            <strong>COMMERCIAL SHIPPING FAIRWAY (TSS ${idx === 0 ? 'CRUDE TRUNK' : 'COASTAL FEEDER'})</strong><br/>
            Density: ~140 vessels / 24h · Direction: 062° True
          </div>`,
          { sticky: true }
        );
      });
    }

    // 4. LAT/LONG GRATICULE GRID
    if (layersVisible.graticule) {
      const minLat = Math.floor(centerLat) - 1.5;
      const maxLat = Math.ceil(centerLat) + 1.5;
      const minLng = Math.floor(centerLng) - 2.0;
      const maxLng = Math.ceil(centerLng) + 2.0;

      for (let lat = minLat; lat <= maxLat; lat += 0.5) {
        L.polyline([[lat, minLng], [lat, maxLng]], {
          color: '#ffffff',
          weight: 0.7,
          dashArray: '3, 6',
          opacity: 0.35,
        }).addTo(groups.graticule);

        const latLabel = L.divIcon({
          html: `<div style="font-family:'IBM Plex Mono',monospace; font-size:9px; color:#cbd5e1; background:rgba(15,23,42,0.80); padding:1px 4px; border-radius:2px; border:1px solid rgba(255,255,255,0.12);">${lat.toFixed(1)}°N</div>`,
          className: 'graticule-label',
          iconSize: [42, 14],
        });
        L.marker([lat, minLng + 0.1], { icon: latLabel, interactive: false }).addTo(groups.graticule);
      }

      for (let lng = minLng; lng <= maxLng; lng += 0.5) {
        L.polyline([[minLat, lng], [maxLat, lng]], {
          color: '#ffffff',
          weight: 0.7,
          dashArray: '3, 6',
          opacity: 0.35,
        }).addTo(groups.graticule);

        const lngLabel = L.divIcon({
          html: `<div style="font-family:'IBM Plex Mono',monospace; font-size:9px; color:#cbd5e1; background:rgba(15,23,42,0.80); padding:1px 4px; border-radius:2px; border:1px solid rgba(255,255,255,0.12);">${lng.toFixed(1)}°E</div>`,
          className: 'graticule-label',
          iconSize: [42, 14],
        });
        L.marker([minLat + 0.1, lng], { icon: lngLabel, interactive: false }).addTo(groups.graticule);
      }
    }

    // 5. REGIONAL COASTLINE SHORELINES
    if (layersVisible.coastlines) {
      regionalCoastlines.forEach((feat) => {
        L.polygon(feat.polygon, {
          color: visualMode === 'nautical-chart' ? '#475569' : '#38bdf8',
          weight: visualMode === 'nautical-chart' ? 1.5 : 1.2,
          opacity: 0.75,
          fillColor: visualMode === 'nautical-chart' ? '#1e293b' : '#0f172a',
          fillOpacity: visualMode === 'nautical-chart' ? 0.8 : 0.12,
        }).addTo(groups.analyticalChart).bindTooltip(feat.name, { sticky: true });
      });
    }

    // 6. SENSITIVE MARINE AREAS
    if (layersVisible.sensitiveAreas && incident.sensitiveAreas) {
      incident.sensitiveAreas.forEach((sa) => {
        L.polygon(sa.coordinates.map(([lat, lng]) => [lat, lng] as [number, number]), {
          color: '#10b981',
          weight: 1.8,
          dashArray: '4, 4',
          fillColor: '#10b981',
          fillOpacity: 0.18,
        }).addTo(groups.sensitiveAreas).bindTooltip(
          `<div style="font-family:'Inter', sans-serif; font-size:11px;">
            <strong style="color:#10b981;">PROTECTED SANCTUARY: ${sa.name}</strong><br/>
            Type: ${sa.type} | Proximity: ${sa.distanceNm} nm
          </div>`,
          { sticky: true }
        );
      });
    }

    // 7. PROBABILISTIC ORIGIN UNCERTAINTY ENVELOPES (P50, P80, P95)
    if (incident.originContours) {
      if (layersVisible.origin95 && incident.originContours.p95) {
        L.polygon(incident.originContours.p95.map(([lat, lng]) => [lat, lng] as [number, number]), {
          color: '#38bdf8',
          weight: 1.4,
          dashArray: '6, 5',
          opacity: 0.75,
          fillColor: '#38bdf8',
          fillOpacity: 0.08,
        }).addTo(groups.origin).bindTooltip('P95 Modelled Origin Uncertainty Envelope', { sticky: true });
      }

      if (layersVisible.origin80 && incident.originContours.p80) {
        L.polygon(incident.originContours.p80.map(([lat, lng]) => [lat, lng] as [number, number]), {
          color: '#0284c7',
          weight: 1.8,
          dashArray: '4, 3',
          opacity: 0.85,
          fillColor: '#0284c7',
          fillOpacity: 0.18,
        }).addTo(groups.origin).bindTooltip('P80 Modelled Origin Uncertainty Envelope', { sticky: true });
      }

      if (layersVisible.origin50 && incident.originContours.p50) {
        const p50Poly = L.polygon(incident.originContours.p50.map(([lat, lng]) => [lat, lng] as [number, number]), {
          color: '#38bdf8',
          weight: 2.4,
          opacity: 1,
          fillColor: '#0284c7',
          fillOpacity: 0.40,
        }).addTo(groups.origin);

        p50Poly.bindTooltip(
          `<div style="font-family:'IBM Plex Mono', monospace; font-size:11px; padding:4px;">
            <strong style="color:#38bdf8;">P50 CORE RECONSTRUCTED ORIGIN</strong><br/>
            Release Window: ${incident.releaseWindow.startUtc.slice(11, 16)} – ${incident.releaseWindow.endUtc.slice(11, 16)} UTC<br/>
            Centroid: ${incident.releaseWindow.centroidLat.toFixed(2)}°N, ${incident.releaseWindow.centroidLng.toFixed(2)}°E<br/>
            Modelled Drift Time: ${incident.slickProperties.estimatedAgeHours}
          </div>`,
          { sticky: true }
        );

        L.circleMarker(apexPoint, {
          radius: 5,
          color: '#ea580c',
          fillColor: '#f97316',
          fillOpacity: 1,
          weight: 2,
        }).addTo(groups.origin);
      }
    }

    // 8. HINDCAST BACKWARD TRAJECTORY
    if (layersVisible.hindcast && incident.hindcastTrajectory.length > 0) {
      const latlngs = incident.hindcastTrajectory.map((p) => [p.lat, p.lng] as [number, number]);
      
      const hindcastLine = L.polyline(latlngs, {
        color: '#38bdf8',
        weight: 3.2,
        dashArray: '6, 6',
        opacity: 0.95,
      }).addTo(groups.hindcast);

      hindcastLine.bindTooltip('Reverse Lagrangian Drift Hindcast Trajectory (OpenDrift Advection Model)', { sticky: true });

      incident.hindcastTrajectory.forEach((p, idx) => {
        const marker = L.circleMarker([p.lat, p.lng], {
          radius: idx === 0 ? 5.5 : 3.5,
          color: '#38bdf8',
          fillColor: idx === 0 ? '#ea580c' : '#ffffff',
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

    // 9. FORECAST FORWARD DISPERSION CONE
    if (layersVisible.forecast && incident.forecastEnvelope.length > 0) {
      incident.forecastEnvelope.forEach((fc) => {
        if (fc.p50Cone && fc.p50Cone.length > 0) {
          L.polygon(fc.p50Cone.map(([lat, lng]) => [lat, lng] as [number, number]), {
            color: '#f59e0b',
            weight: 1.5,
            dashArray: '4, 4',
            opacity: 0.85,
            fillColor: '#fbbf24',
            fillOpacity: 0.18,
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
            Forecast Horizon: ${fc.time}<br/>
            Dispersion Envelope: ±${fc.uncertaintyRadiusKm} km
          </div>`
        );
      });
    }

    // 10. OCEAN CURRENT VECTORS
    if (layersVisible.currents && incident.currentVectors) {
      incident.currentVectors.forEach((cv) => {
        const len = 0.05 * (cv.speedKnots / 1.0);
        const rad = ((90 - cv.directionDeg) * Math.PI) / 180;
        const endLat = cv.lat + len * Math.sin(rad);
        const endLng = cv.lng + len * Math.cos(rad);

        L.polyline([[cv.lat, cv.lng], [endLat, endLng]], {
          color: '#2dd4bf',
          weight: 2,
          opacity: 0.85,
        }).addTo(groups.currents);

        L.circleMarker([endLat, endLng], {
          radius: 2,
          color: '#2dd4bf',
          fillColor: '#2dd4bf',
          fillOpacity: 1,
        }).addTo(groups.currents).bindTooltip(`Surface Current: ${cv.speedKnots} kts @ ${cv.directionDeg}°`);
      });
    }

    // 11. MULTI-TIER OIL SLICK & SPECTRAL DISPERSION PLUME
    if (layersVisible.slickMultiTier && incident.slickPolygon.length > 0) {
      const slickLatlngs = incident.slickPolygon.map(([lat, lng]) => [lat, lng] as [number, number]);
      const concentricLayers = generateConcentricRings(slickLatlngs, apexPoint);

      if (visualMode === 'spectral-plume') {
        const palette = [
          { stroke: '#0284c7', fill: '#0369a1', fillOpacity: 0.35, weight: 1.5 },
          { stroke: '#10b981', fill: '#10b981', fillOpacity: 0.50, weight: 1.8 },
          { stroke: '#eab308', fill: '#eab308', fillOpacity: 0.65, weight: 2.0 },
          { stroke: '#f97316', fill: '#f97316', fillOpacity: 0.78, weight: 2.2 },
          { stroke: '#ef4444', fill: '#dc2626', fillOpacity: 0.92, weight: 2.5 },
        ];

        concentricLayers.forEach((cLayer, idx) => {
          const style = palette[idx] || palette[palette.length - 1];
          const poly = L.polygon(cLayer.ring, {
            color: style.stroke,
            weight: style.weight,
            fillColor: style.fill,
            fillOpacity: style.fillOpacity,
            lineJoin: 'round',
          }).addTo(groups.slickMultiTier);

          poly.bindTooltip(
            `<div style="font-family:'IBM Plex Mono', monospace; font-size:11px; padding:4px;">
              <strong style="color:${style.stroke};">SPECTRAL OIL PLUME // ${cLayer.code}: ${cLayer.label}</strong><br/>
              Incident: ${incident.id} (${incident.region})<br/>
              Total Area: ${incident.slickProperties.areaKm2} km² | Estimated Volume: ~${incident.slickProperties.estimatedVolumeM3} m³<br/>
              Radar Contrast Damping: Δσ₀ = 8.4 dB
            </div>`,
            { sticky: true }
          );
        });

      } else if (visualMode === 'satellite-noaa') {
        const palette = [
          { stroke: '#22d3ee', fill: '#06b6d4', fillOpacity: 0.40, weight: 2.0 },
          { stroke: '#0ea5e9', fill: '#0284c7', fillOpacity: 0.60, weight: 2.0 },
          { stroke: '#2563eb', fill: '#1d4ed8', fillOpacity: 0.75, weight: 2.2 },
          { stroke: '#1e40af', fill: '#1e3a8a', fillOpacity: 0.88, weight: 2.5 },
          { stroke: '#312e81', fill: '#1e1b4b', fillOpacity: 0.98, weight: 2.8 },
        ];

        concentricLayers.forEach((cLayer, idx) => {
          const style = palette[idx] || palette[palette.length - 1];
          const poly = L.polygon(cLayer.ring, {
            color: style.stroke,
            weight: style.weight,
            fillColor: style.fill,
            fillOpacity: style.fillOpacity,
            lineJoin: 'round',
          }).addTo(groups.slickMultiTier);

          poly.bindTooltip(
            `<div style="font-family:'IBM Plex Mono', monospace; font-size:11px; padding:4px;">
              <strong style="color:${style.stroke};">NOAA OR&R MULTI-LAYER SLICK // ${cLayer.code}: ${cLayer.label}</strong><br/>
              Area: ${incident.slickProperties.areaKm2} km² | Thickness: ${incident.slickProperties.thicknessMicron} µm<br/>
              Weathering: ${incident.slickProperties.weatheringState}
            </div>`,
            { sticky: true }
          );
        });

      } else if (visualMode === 'sar-osi') {
        const palette = [
          { stroke: '#38bdf8', fill: '#0284c7', fillOpacity: 0.25, weight: 1.5 },
          { stroke: '#22d3ee', fill: '#0f172a', fillOpacity: 0.65, weight: 1.8 },
          { stroke: '#f59e0b', fill: '#090d16', fillOpacity: 0.85, weight: 2.0 },
          { stroke: '#ea580c', fill: '#040711', fillOpacity: 0.95, weight: 2.2 },
          { stroke: '#ef4444', fill: '#020617', fillOpacity: 0.98, weight: 2.5 },
        ];

        concentricLayers.forEach((cLayer, idx) => {
          const style = palette[idx] || palette[palette.length - 1];
          const poly = L.polygon(cLayer.ring, {
            color: style.stroke,
            weight: style.weight,
            fillColor: style.fill,
            fillOpacity: style.fillOpacity,
            lineJoin: 'round',
          }).addTo(groups.slickMultiTier);

          poly.bindTooltip(
            `<div style="font-family:'IBM Plex Mono', monospace; font-size:11px; padding:4px;">
              <strong style="color:#38bdf8;">SAR OIL SPILL INDEX (OSI) DAMPING</strong><br/>
              Backscatter Attenuation: Δσ₀ = 8.4 dB (High Contrast)<br/>
              Surface Roughness Damping: Capillary Wave Suppression
            </div>`,
            { sticky: true }
          );
        });

      } else {
        const poly = L.polygon(slickLatlngs, {
          color: '#f59e0b',
          weight: 2.5,
          fillColor: '#d97706',
          fillOpacity: 0.65,
        }).addTo(groups.slickMultiTier);

        poly.bindTooltip(
          `<div style="font-family:'IBM Plex Mono', monospace; font-size:11px; padding:4px;">
            <strong>DETECTED OIL SLICK: ${incident.id}</strong><br/>
            Area: ${incident.slickProperties.areaKm2} km² | Volume: ~${incident.slickProperties.estimatedVolumeM3} m³
          </div>`,
          { sticky: true }
        );
      }
    }

    // 12. AIS CANDIDATE TRACKS & WAYPOINT TIMESTAMPS (ScienceDirect & MDPI reference)
    if (layersVisible.aisTracks && incident.candidateVessels) {
      incident.candidateVessels.forEach((cand) => {
        const isSelected = cand.id === selectedCandidateId;
        const isHigh = cand.correlationTier === 'HIGH CORRELATION';
        
        const trackColor = isSelected 
          ? '#ef4444' 
          : isHigh 
          ? '#38bdf8' 
          : '#64748b';

        // Draw Full Vessel Track Line
        if (cand.track.length > 1) {
          const latlngs = cand.track.map((t) => [t.lat, t.lng] as [number, number]);
          
          const trackPoly = L.polyline(latlngs, {
            color: trackColor,
            weight: isSelected ? 3.8 : 2.2,
            opacity: isSelected ? 1 : 0.65,
            dashArray: isHigh ? undefined : '5, 5',
          }).addTo(groups.ais);

          trackPoly.on('click', () => onSelectCandidate(cand.id));

          // Draw timestamped waypoints along the track (matching ScienceDirect figure)
          if (layersVisible.waypointTimestamps && (isSelected || isHigh)) {
            cand.track.forEach((wp) => {
              const isCpaPoint = wp.speedKnots < 10.0;
              
              L.circleMarker([wp.lat, wp.lng], {
                radius: isCpaPoint ? 6 : 3.5,
                color: isCpaPoint ? '#ef4444' : '#ffffff',
                fillColor: isCpaPoint ? '#ef4444' : trackColor,
                fillOpacity: 1,
                weight: 2,
              }).addTo(groups.waypoints);

              const wpTagIcon = L.divIcon({
                html: `
                  <div style="
                    font-family: 'IBM Plex Mono', monospace;
                    font-size: 9px;
                    font-weight: 600;
                    color: ${isCpaPoint ? '#fca5a5' : '#cbd5e1'};
                    background: ${isCpaPoint ? 'rgba(153, 27, 27, 0.92)' : 'rgba(15, 23, 42, 0.88)'};
                    padding: 1px 5px;
                    border-radius: 3px;
                    border: 1px solid ${isCpaPoint ? '#ef4444' : 'rgba(255,255,255,0.2)'};
                    white-space: nowrap;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.5);
                  ">
                    ${wp.time} ${isCpaPoint ? `(${wp.speedKnots} kts CPA)` : `(${wp.speedKnots} kts)`}
                  </div>
                `,
                className: 'waypoint-tag',
                iconSize: [95, 16],
                iconAnchor: [-8, 8],
              });
              L.marker([wp.lat, wp.lng], { icon: wpTagIcon, interactive: false }).addTo(groups.waypoints);
            });
          }
        }

        // Vessel Ship Icon at Apex CPA with Metallic Radar Bloom (ScienceDirect Paper)
        const candApex = cand.track[Math.min(2, cand.track.length - 1)];
        if (candApex) {
          const shipIconHtml = `
            <div style="
              position: relative;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <!-- Radar Specular Bloom Crosshair -->
              <div style="
                position: absolute;
                inset: 0;
                border-radius: 50%;
                background: ${isSelected ? 'radial-gradient(circle, rgba(239, 68, 68, 0.6) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(56, 189, 248, 0.5) 0%, transparent 70%)'};
                animation: pulse 2s infinite;
              "></div>
              <div style="
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: ${isSelected ? '#ef4444' : isHigh ? '#0284c7' : '#334155'};
                color: #ffffff;
                border-radius: 50%;
                border: 2px solid #ffffff;
                box-shadow: 0 0 10px ${isSelected ? 'rgba(239, 68, 68, 0.9)' : 'rgba(2, 132, 199, 0.9)'};
                font-size: 11px;
                cursor: pointer;
                z-index: 2;
              ">
                🚢
              </div>
            </div>
          `;

          const customIcon = L.divIcon({
            html: shipIconHtml,
            className: 'custom-vessel-marker',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const marker = L.marker([candApex.lat, candApex.lng], { icon: customIcon }).addTo(groups.ais);
          marker.on('click', () => onSelectCandidate(cand.id));

          marker.bindTooltip(
            `<div style="font-family:'IBM Plex Mono', monospace; font-size:11px; padding:4px;">
              <strong>${cand.name} (${cand.flag})</strong><br/>
              MMSI: ${cand.mmsi} | Type: ${cand.vesselType}<br/>
              Speed at CPA: ${cand.speedAtCpaKnots} kts | Rank: #${cand.correlationRank}<br/>
              Composite Evidence Score: <strong>${cand.overallScore} / 100</strong> (${cand.correlationTier})
            </div>`,
            { sticky: true }
          );
        }
      });
    }

    // 13. SCIENCEDIRECT SHIP & SLICK ANNOTATION CALLOUT ARROWS
    if (layersVisible.scienceDirectCallouts && selectedCandidate) {
      const candApex = selectedCandidate.track[Math.min(2, selectedCandidate.track.length - 1)];
      const slickCenter = incident.slickPolygon[Math.floor(incident.slickPolygon.length / 2)] || incident.coordinates;

      if (candApex) {
        const shipArrowHtml = `
          <div style="
            display: flex;
            align-items: center;
            gap: 6px;
            background: rgba(15, 23, 42, 0.92);
            border: 1px solid #ef4444;
            padding: 3px 8px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.6);
            white-space: nowrap;
          ">
            <span style="color:#ef4444; font-size:14px; font-weight:900;">➔</span>
            <span style="font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:700; color:#f8fafc;">
              SHIP: <span style="color:#38bdf8;">${selectedCandidate.name}</span> (${selectedCandidate.speedAtCpaKnots} kts)
            </span>
          </div>
        `;
        const shipArrowIcon = L.divIcon({
          html: shipArrowHtml,
          className: 'sciencedirect-ship-arrow',
          iconSize: [210, 24],
          iconAnchor: [-10, 12],
        });
        L.marker([candApex.lat, candApex.lng], { icon: shipArrowIcon, interactive: false }).addTo(groups.callouts);
      }

      const slickArrowHtml = `
        <div style="
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(15, 23, 42, 0.92);
          border: 1px solid #ef4444;
          padding: 3px 8px;
          border-radius: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.6);
          white-space: nowrap;
        ">
          <span style="color:#ef4444; font-size:14px; font-weight:900;">➔</span>
          <span style="font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:700; color:#f8fafc;">
            OIL SPILL: <span style="color:#ef4444;">${incident.slickProperties.areaKm2} km²</span> (Δσ₀ = 8.4 dB)
          </span>
        </div>
      `;
      const slickArrowIcon = L.divIcon({
        html: slickArrowHtml,
        className: 'sciencedirect-slick-arrow',
        iconSize: [200, 24],
        iconAnchor: [-10, 12],
      });
      L.marker(slickCenter, { icon: slickArrowIcon, interactive: false }).addTo(groups.callouts);
    }

    // 14. ORTHOGONAL MINIMUM DISTANCE & CORRELATION VECTORS (MDPI Reference)
    if (layersVisible.orthogonalOffsets && selectedCandidate) {
      const candApex = selectedCandidate.track[Math.min(2, selectedCandidate.track.length - 1)];
      if (candApex) {
        L.polyline([[candApex.lat, candApex.lng], apexPoint], {
          color: '#ef4444',
          weight: 2,
          dashArray: '3, 4',
          opacity: 0.95,
        }).addTo(groups.correlationVector);

        const midLat = (candApex.lat + apexPoint[0]) / 2;
        const midLng = (candApex.lng + apexPoint[1]) / 2;
        const distTag = L.divIcon({
          html: `
            <div style="
              font-family:'IBM Plex Mono',monospace; 
              font-size:9px; 
              font-weight:700;
              color:#fca5a5; 
              background:rgba(15,23,42,0.90); 
              padding:1px 6px; 
              border-radius:3px; 
              border:1px solid #ef4444; 
              white-space:nowrap;
            ">
              ⊥ CPA Offset: ${selectedCandidate.closestPointOfApproachNm} nm
            </div>
          `,
          className: 'cpa-vector-tag',
          iconSize: [110, 18],
          iconAnchor: [55, 9],
        });
        L.marker([midLat, midLng], { icon: distTag, interactive: false }).addTo(groups.correlationVector);
      }
    }

    // 15. POTENTIAL AIS/SAR DISCREPANCIES (Dark Vessels)
    if (layersVisible.darkVessels && incident.darkVessels) {
      incident.darkVessels.forEach((dv) => {
        const darkIconHtml = `
          <div style="
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #ea580c;
            color: #ffffff;
            border-radius: 4px;
            border: 2px solid #ffffff;
            box-shadow: 0 0 8px rgba(234, 88, 12, 0.7);
            font-size: 11px;
            cursor: pointer;
          ">
            ⚠️
          </div>
        `;

        const darkIcon = L.divIcon({
          html: darkIconHtml,
          className: 'custom-dark-vessel-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([dv.lat, dv.lng], { icon: darkIcon }).addTo(groups.darkVessels);

        marker.bindTooltip(
          `<div style="font-family:'IBM Plex Mono', monospace; font-size:11px; padding:4px; max-width:240px;">
            <strong style="color:#ea580c;">KINEMATIC / AIS CONTINUITY ANOMALY (${dv.id})</strong><br/>
            SAR Metallic Length: ~${dv.estimatedLengthM}m<br/>
            SAR Radar Cross Section: ${dv.sarRCS_dB} dB<br/>
            Nearest AIS Transmission: ${dv.nearestAisDistanceNm} nm<br/>
            <span style="font-size:10px; color:#cbd5e1;">${dv.notes}</span>
          </div>`,
          { sticky: true }
        );
      });
    }

    // 16. COUNTERFACTUAL SIMULATION OVERLAY
    if (showCounterfactualOverlay && layersVisible.counterfactual) {
      if (selectedCandidate?.counterfactualResult?.simulatedSlickGeoJson) {
        const simLatlngs = selectedCandidate.counterfactualResult.simulatedSlickGeoJson.map(([lat, lng]) => [lat, lng] as [number, number]);
        
        const simPoly = L.polygon(simLatlngs, {
          color: '#14b8a6',
          weight: 2.2,
          dashArray: '5, 5',
          fillColor: '#2dd4bf',
          fillOpacity: 0.38,
        }).addTo(groups.counterfactual);

        simPoly.bindTooltip(
          `<div style="font-family:'IBM Plex Mono', monospace; font-size:11px; padding:4px;">
            <strong style="color:#14b8a6;">CANDIDATE COUNTERFACTUAL SIMULATION</strong><br/>
            Candidate: ${selectedCandidate.name}<br/>
            Spatial IoU Match: ${(selectedCandidate.counterfactualResult.iouMetric * 100).toFixed(1)}%<br/>
            Hausdorff Distance: ${selectedCandidate.counterfactualResult.hausdorffDistanceKm.toFixed(2)} km<br/>
            Shape Similarity: ${selectedCandidate.counterfactualResult.similarityPct}%
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
    visualMode,
  ]);

  return (
    <div 
      style={{ 
        position: isFullscreen ? 'fixed' : 'relative', 
        inset: isFullscreen ? 0 : 'auto',
        width: '100%', 
        height: '100%', 
        overflow: 'hidden',
        zIndex: isFullscreen ? 9999 : 1,
        backgroundColor: '#0b1622'
      }}
    >
      {/* MAP CANVAS */}
      <div 
        ref={mapContainerRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          zIndex: 1,
          cursor: isMeasuring ? 'crosshair' : 'grab'
        }} 
      />

      {/* TOP LEFT: MAP HEADING & SCIENTIFIC RECON HUD */}
      <div 
        style={{ 
          position: 'absolute', 
          top: '12px', 
          left: '12px', 
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxWidth: 'calc(100% - 320px)'
        }}
      >
        <div 
          style={{ 
            backgroundColor: 'rgba(15, 23, 42, 0.92)', 
            backdropFilter: 'blur(10px)',
            padding: '8px 14px', 
            borderRadius: '6px', 
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#f8fafc'
          }}
        >
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }}></div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{incident.region}</span>
              <span 
                style={{ 
                  fontSize: '9px', 
                  fontFamily: 'var(--font-mono)', 
                  backgroundColor: visualMode === 'spectral-plume' ? 'rgba(234, 179, 8, 0.25)' : 'rgba(56, 189, 248, 0.25)', 
                  color: visualMode === 'spectral-plume' ? '#fde047' : '#38bdf8',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                {visualMode.toUpperCase()}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {incident.satelliteScene.satellite} • {incident.detectionTimeUtc} • SAR C-Band
            </div>
          </div>
        </div>

        {/* VISUALIZATION MODE SWITCHER PILLS */}
        <div 
          style={{ 
            backgroundColor: 'rgba(15, 23, 42, 0.90)', 
            backdropFilter: 'blur(8px)',
            padding: '4px 6px', 
            borderRadius: '6px', 
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flexWrap: 'wrap'
          }}
        >
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#94a3b8', padding: '0 6px' }}>
            MAP RECON:
          </span>
          {[
            { id: 'spectral-plume', label: '🌈 Spectral Plume (Caspian/ResearchGate)' },
            { id: 'satellite-noaa', label: '🛰️ NOAA Satellite (OR&R)' },
            { id: 'sar-osi', label: '📡 SAR False-Color OSI' },
            { id: 'ocean-bathymetry', label: '🌊 Bathymetry / Relief' },
            { id: 'tactical-dark', label: '🗺️ Tactical Dark' },
            { id: 'nautical-chart', label: '🧭 Vector Chart' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setVisualMode(mode.id as MapVisualMode)}
              style={{
                backgroundColor: visualMode === mode.id ? '#0284c7' : 'transparent',
                color: visualMode === mode.id ? '#ffffff' : '#cbd5e1',
                border: 'none',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: visualMode === mode.id ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* TOP RIGHT: TOOLBAR CONTROLS */}
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
        {/* Miros Wave Damping Button */}
        <button
          onClick={() => setShowMirosModal(true)}
          className="btn btn-secondary btn-sm"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.90)',
            color: '#38bdf8',
            borderColor: 'rgba(56, 189, 248, 0.3)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)'
          }}
          title="Miros SAR Wave Damping Profile"
        >
          <Activity size={13} /> Miros Damping
        </button>

        {/* Distance Measurement Tool Button */}
        <button
          onClick={() => {
            setIsMeasuring(!isMeasuring);
            setMeasurePoints([]);
            setMeasureResult(null);
          }}
          className="btn btn-secondary btn-sm"
          style={{
            backgroundColor: isMeasuring ? '#f59e0b' : 'rgba(15, 23, 42, 0.90)',
            color: isMeasuring ? '#000000' : '#f8fafc',
            borderColor: isMeasuring ? '#f59e0b' : 'rgba(255, 255, 255, 0.15)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600
          }}
          title="Nautical Distance Measurement Tool"
        >
          <Ruler size={13} /> {isMeasuring ? 'Measuring...' : 'Measure'}
        </button>

        {/* Reset View Button */}
        <button
          onClick={handleResetView}
          className="btn btn-secondary btn-sm"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.90)',
            color: '#f8fafc',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            boxShadow: 'var(--shadow-sm)',
            padding: '6px 10px',
          }}
          title="Reset Map Center"
        >
          <RotateCcw size={13} />
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="btn btn-secondary btn-sm"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.90)',
            color: '#f8fafc',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            boxShadow: 'var(--shadow-sm)',
            padding: '6px 10px',
          }}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Workstation'}
        >
          {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
        </button>

        {/* Layers Button */}
        <button
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          className="btn btn-secondary btn-sm"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.90)',
            color: '#f8fafc',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 500,
          }}
        >
          <Layers size={13} /> Layers ({Object.values(layersVisible).filter(Boolean).length})
        </button>

        {/* Layers Dropdown Menu */}
        {showLayerMenu && (
          <div 
            style={{ 
              position: 'absolute', 
              top: '40px', 
              right: 0, 
              width: '290px', 
              backgroundColor: '#0f172a', 
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '6px', 
              boxShadow: 'var(--shadow-xl)',
              padding: '14px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px', 
              zIndex: 30,
              color: '#f8fafc',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#38bdf8', fontFamily: 'var(--font-mono)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>
              GEOSPATIAL & FORENSIC LAYERS
            </div>

            {[
              { key: 'slickMultiTier', label: 'Multi-Tier Plume Gradient (SAR)' },
              { key: 'rangeRings', label: 'Nautical Range Rings (5-25 nm)' },
              { key: 'scienceDirectCallouts', label: 'ScienceDirect Ship & Wake Arrows' },
              { key: 'orthogonalOffsets', label: 'MDPI Orthogonal CPA Offsets' },
              { key: 'sarSwathFootprint', label: 'SAR Acquisition Swath Frame' },
              { key: 'shippingCorridors', label: 'Commercial Shipping Fairways' },
              { key: 'origin50', label: 'P50 Core Reconstructed Origin' },
              { key: 'origin80', label: 'P80 Modelled Uncertainty Envelope' },
              { key: 'origin95', label: 'P95 Modelled Uncertainty Envelope' },
              { key: 'hindcast', label: 'Lagrangian Hindcast Trajectory' },
              { key: 'forecast', label: 'Dispersion Forecast Cones' },
              { key: 'aisTracks', label: 'AIS Candidate Vessel Tracks' },
              { key: 'waypointTimestamps', label: 'Timestamped Track Waypoints' },
              { key: 'correlationVector', label: 'CPA-to-Apex Correlation Vector' },
              { key: 'darkVessels', label: 'SAR Discrepancy Contacts' },
              { key: 'currents', label: 'Surface Ocean Current Vectors' },
              { key: 'sensitiveAreas', label: 'Marine Protected Sanctuaries' },
              { key: 'counterfactual', label: 'Counterfactual Simulation' },
              { key: 'coastlines', label: 'Regional Coastline Shorelines' },
              { key: 'graticule', label: 'Lat/Long Coordinate Graticule' },
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
                    color: '#e2e8f0', 
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
          </div>
        )}
      </div>

      {/* TOP RIGHT (BELOW CONTROLS): CANDIDATE CORRELATION HUD CARD */}
      {selectedCandidate && isVesselHudOpen && (
        <div
          style={{
            position: 'absolute',
            top: '56px',
            right: '12px',
            zIndex: 10,
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '6px',
            padding: '10px 14px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: '#f8fafc',
            width: '270px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Ship size={14} color="#38bdf8" />
              <strong style={{ color: '#38bdf8' }}>{selectedCandidate.name}</strong>
            </div>
            <button
              onClick={() => setIsVesselHudOpen(false)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '11px' }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>MMSI / Flag:</span>
              <span>{selectedCandidate.mmsi} ({selectedCandidate.flag})</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Closest Point of Approach:</span>
              <span style={{ color: '#f87171', fontWeight: 700 }}>{selectedCandidate.closestPointOfApproachNm} nm @ 09:22 UTC</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Speed Anomaly:</span>
              <span style={{ color: '#fde047' }}>14.2 → 8.4 kts (42 min)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Counterfactual IoU:</span>
              <span style={{ color: '#34d399', fontWeight: 700 }}>{(selectedCandidate.counterfactualResult.iouMetric * 100).toFixed(1)}% match</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '4px', marginTop: '2px' }}>
              <span style={{ color: '#94a3b8' }}>Composite Evidence:</span>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>{selectedCandidate.overallScore} / 100</span>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM RIGHT: FLOATING SCIENTIFIC COLORBAR & THICKNESS LEGEND */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          right: '14px',
          zIndex: 10,
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '6px',
          padding: '12px 14px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: '#f8fafc',
          width: '270px',
        }}
      >
        <div 
          onClick={() => setIsLegendOpen(!isLegendOpen)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            cursor: 'pointer',
            paddingBottom: isLegendOpen ? '8px' : '0',
            borderBottom: isLegendOpen ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} color="#38bdf8" />
            <span style={{ fontWeight: 700, letterSpacing: '0.02em', fontSize: '11px', color: '#38bdf8' }}>
              OIL THICKNESS & PLUME INDEX
            </span>
          </div>
          {isLegendOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>

        {isLegendOpen && (
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>
              Bonn Agreement / NOAA Surface Concentration Scale:
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch' }}>
              <div 
                style={{ 
                  width: '14px', 
                  borderRadius: '3px',
                  background: visualMode === 'satellite-noaa'
                    ? 'linear-gradient(to bottom, #1e1b4b, #1d4ed8, #2563eb, #0284c7, #22d3ee)'
                    : visualMode === 'sar-osi'
                    ? 'linear-gradient(to bottom, #020617, #040711, #090d16, #0f172a, #38bdf8)'
                    : visualMode === 'ocean-bathymetry'
                    ? 'linear-gradient(to bottom, #7f1d1d, #c2410c, #ca8a04, #15803d, #0369a1)'
                    : 'linear-gradient(to bottom, #dc2626, #f97316, #eab308, #10b981, #0284c7)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '10px', lineHeight: 1.3, flex: 1 }}>
                <div>
                  <strong style={{ color: visualMode === 'satellite-noaa' ? '#818cf8' : '#f87171' }}>&gt; 100 µm</strong>
                  <div style={{ color: '#94a3b8', fontSize: '9px' }}>Code 5: Continuous Heavy Crude Core</div>
                </div>
                <div>
                  <strong style={{ color: visualMode === 'satellite-noaa' ? '#60a5fa' : '#fb923c' }}>20 – 100 µm</strong>
                  <div style={{ color: '#94a3b8', fontSize: '9px' }}>Code 4: True Emulsion / Mousse</div>
                </div>
                <div>
                  <strong style={{ color: visualMode === 'satellite-noaa' ? '#38bdf8' : '#fde047' }}>5.0 – 20 µm</strong>
                  <div style={{ color: '#94a3b8', fontSize: '9px' }}>Code 3: Moderate Weathered Film</div>
                </div>
                <div>
                  <strong style={{ color: visualMode === 'satellite-noaa' ? '#22d3ee' : '#4ade80' }}>0.1 – 5.0 µm</strong>
                  <div style={{ color: '#94a3b8', fontSize: '9px' }}>Code 2: Rainbow Sheen / Metallic</div>
                </div>
                <div>
                  <strong style={{ color: '#38bdf8' }}>&lt; 0.1 µm</strong>
                  <div style={{ color: '#94a3b8', fontSize: '9px' }}>Code 1: Capillary Wave Damping Zone</div>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '6px', fontSize: '9px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
              <span>NRCS Damping: Δσ₀ = 8.4 dB</span>
              <span style={{ color: '#38bdf8' }}>C-SAR 10m Ground Pixel</span>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM LEFT: DATA PROVENANCE KEY */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '12px',
          zIndex: 10,
          backgroundColor: 'rgba(15, 23, 42, 0.90)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '6px',
          padding: '8px 12px',
          boxShadow: 'var(--shadow-sm)',
          fontSize: '10px',
          fontFamily: 'var(--font-mono)',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          maxWidth: '240px'
        }}
      >
        <div style={{ fontWeight: 700, color: '#38bdf8', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '3px', marginBottom: '2px', display: 'flex', justifyContent: 'space-between' }}>
          <span>GEOSPATIAL PROVENANCE</span>
          <span style={{ color: '#94a3b8' }}>STATUS</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#ef4444', display: 'inline-block' }}></span>
          <span><strong style={{ color: '#f87171' }}>OBSERVED:</strong> Multi-Tier SAR Slick</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0284c7', display: 'inline-block' }}></span>
          <span><strong style={{ color: '#38bdf8' }}>DERIVED:</strong> Origin Centroid</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', border: '1px dashed #38bdf8', borderRadius: '2px', display: 'inline-block' }}></span>
          <span><strong style={{ color: '#38bdf8' }}>UNCERTAIN:</strong> P50/80/95 Envelopes</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '2px', backgroundColor: '#f59e0b', display: 'inline-block' }}></span>
          <span><strong style={{ color: '#fbbf24' }}>MODELLED:</strong> Hindcast / Forecast</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '2px', backgroundColor: '#38bdf8', display: 'inline-block' }}></span>
          <span><strong style={{ color: '#38bdf8' }}>SYNTHETIC:</strong> AIS Vessel Tracks</span>
        </div>
      </div>

      {/* BOTTOM CENTER: REAL-TIME CURSOR TELEMETRY HUD */}
      {cursorTelemetry && (
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            backgroundColor: 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '4px',
            padding: '4px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            color: '#f8fafc',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
            pointerEvents: 'none'
          }}
        >
          <div>
            <span style={{ color: '#94a3b8' }}>LAT: </span>
            <strong style={{ color: '#38bdf8' }}>{cursorTelemetry.lat.toFixed(4)}°N</strong>
          </div>
          <div>
            <span style={{ color: '#94a3b8' }}>LON: </span>
            <strong style={{ color: '#38bdf8' }}>{cursorTelemetry.lng.toFixed(4)}°E</strong>
          </div>
          <div>
            <span style={{ color: '#94a3b8' }}>BATHYMETRY: </span>
            <strong style={{ color: '#34d399' }}>-{cursorTelemetry.depthM} m</strong>
          </div>
          <div>
            <span style={{ color: '#94a3b8' }}>RADAR σ₀: </span>
            <strong style={{ color: cursorTelemetry.nrcsDb < -16 ? '#f87171' : '#cbd5e1' }}>
              {cursorTelemetry.nrcsDb} dB
            </strong>
          </div>
        </div>
      )}

      {/* MIROS RADAR WAVE DAMPING MODAL / HUD */}
      {showMirosModal && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 50,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '680px',
              width: '100%',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
              color: '#f8fafc',
              fontFamily: 'var(--font-mono)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <span className="badge badge-blue" style={{ fontSize: '10px' }}>SAR REMOTE SENSING PHYSICS</span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#38bdf8', marginTop: '4px' }}>
                  Miros Capillary Wave Damping & Backscatter Transect
                </h3>
              </div>
              <button
                onClick={() => setShowMirosModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '16px' }}>
              Synthetic Aperture Radar (SAR) detects ocean slicks through <strong>Bragg scattering resonance suppression</strong>. Thin oil films dampen short gravity-capillary waves (λ = 1.7–3.5 cm), causing severe radar reflection drop:
            </p>

            {/* SVG Wave Damping Cross-Section Diagram */}
            <div style={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '16px', marginBottom: '16px' }}>
              <svg viewBox="0 0 500 160" style={{ width: '100%', height: 'auto' }}>
                {/* Clean Ocean Rough Surface Left */}
                <path d="M 0 60 Q 20 50, 40 60 T 80 60 T 120 60" fill="none" stroke="#38bdf8" strokeWidth="2" />
                {/* Damped Smooth Slick Surface Center */}
                <path d="M 120 60 L 380 60" fill="none" stroke="#ef4444" strokeWidth="3" />
                {/* Clean Ocean Rough Surface Right */}
                <path d="M 380 60 Q 400 50, 420 60 T 460 60 T 500 60" fill="none" stroke="#38bdf8" strokeWidth="2" />

                {/* Radar Attenuation dB Curve */}
                <path d="M 0 110 L 120 110 L 160 145 L 340 145 L 380 110 L 500 110" fill="none" stroke="#facc15" strokeWidth="2" strokeDasharray="4 4" />

                {/* Labels */}
                <text x="20" y="45" fill="#38bdf8" fontSize="10" fontFamily="monospace">Clean Sea (-12 dB)</text>
                <text x="180" y="45" fill="#f87171" fontSize="11" fontWeight="bold" fontFamily="monospace">OIL SLICK CORE (-20.4 dB)</text>
                <text x="400" y="45" fill="#38bdf8" fontSize="10" fontFamily="monospace">Clean Sea (-12 dB)</text>

                <text x="210" y="138" fill="#facc15" fontSize="10" fontWeight="bold" fontFamily="monospace">Δσ₀ = -8.4 dB DAMPING</text>
              </svg>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '10px' }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ color: '#94a3b8' }}>BRAGG WAVELENGTH</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>λ = 2.8 cm</div>
                <div style={{ color: '#64748b', fontSize: '9px', marginTop: '2px' }}>C-Band 5.405 GHz @ 34.2°</div>
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ color: '#94a3b8' }}>RADAR CONTRAST</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#f87171', marginTop: '2px' }}>8.4 dB Peak</div>
                <div style={{ color: '#64748b', fontSize: '9px', marginTop: '2px' }}>Optimal SAR wind window</div>
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ color: '#94a3b8' }}>SURFACE VISCOSITY</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#34d399', marginTop: '2px' }}>Marangoni Elasticity</div>
                <div style={{ color: '#64748b', fontSize: '9px', marginTop: '2px' }}>Capillary damping wave ring</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
