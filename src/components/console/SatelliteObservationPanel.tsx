import React, { useState } from 'react';
import { Incident } from '../../types';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { 
  Radar, 
  Layers, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Maximize2, 
  Eye, 
  Crosshair, 
  Sliders, 
  Info, 
  Radio, 
  FileCheck2, 
  Wind 
} from 'lucide-react';

interface SatelliteObservationPanelProps {
  incident: Incident;
}

export const SatelliteObservationPanel: React.FC<SatelliteObservationPanelProps> = ({ incident }) => {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'toggle' | 'mask-only'>('toggle');
  const [activeToggleImage, setActiveToggleImage] = useState<'original' | 'detected'>('detected');
  const [showMaskOverlay, setShowMaskOverlay] = useState(true);
  const [showBoundingBox, setShowBoundingBox] = useState(true);
  const [showAxes, setShowAxes] = useState(true);

  const isInconclusive = incident.attributionStatus === 'INCONCLUSIVE';
  const lookAlikeRisk = incident.slickProperties.lookAlikeRisk;

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '22px', backgroundColor: '#ffffff', height: '100%', overflowY: 'auto' }}>
      
      {/* 1. SECTION HEADER WITH PROVENANCE BADGE */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <ProvenanceBadge 
              classification={incident.isSyntheticDemo ? 'DEMO_SIMULATION' : 'REAL_OBSERVATION'}
              sourceText={incident.satelliteScene.satellite}
              compact
            />
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              SAR DUAL-POLARISATION C-BAND
            </span>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Satellite Imagery & Delineated Oil Slick
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            Sensor: <strong>{incident.satelliteScene.satellite}</strong>
          </span>
          <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
            {incident.satelliteScene.resolutionM}m Pixel
          </span>
        </div>
      </div>

      {/* 2. SATELLITE COMPARISON VIEW (ORIGINAL VS DETECTED) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            Visual Comparison: Original SAR vs Detected Oil Slick
          </div>

          {/* Mode Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ display: 'flex', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', padding: '2px', border: '1px solid var(--border)' }}>
              <button
                onClick={() => setViewMode('side-by-side')}
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '3px',
                  backgroundColor: viewMode === 'side-by-side' ? '#0f172a' : 'transparent',
                  color: viewMode === 'side-by-side' ? '#ffffff' : 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                Side-by-Side
              </button>
              <button
                onClick={() => setViewMode('toggle')}
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '3px',
                  backgroundColor: viewMode === 'toggle' ? '#0f172a' : 'transparent',
                  color: viewMode === 'toggle' ? '#ffffff' : 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                Toggle Comparison
              </button>
            </div>

            {viewMode === 'toggle' && (
              <div style={{ display: 'flex', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', padding: '2px', border: '1px solid var(--border)' }}>
                <button
                  onClick={() => setActiveToggleImage('original')}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: '3px',
                    backgroundColor: activeToggleImage === 'original' ? '#0284c7' : 'transparent',
                    color: activeToggleImage === 'original' ? '#ffffff' : 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  Original SAR
                </button>
                <button
                  onClick={() => setActiveToggleImage('detected')}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: '3px',
                    backgroundColor: activeToggleImage === 'detected' ? '#0284c7' : 'transparent',
                    color: activeToggleImage === 'detected' ? '#ffffff' : 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  Detected Slick
                </button>
              </div>
            )}
          </div>
        </div>

        {/* The Image Canvas / Visual Representation */}
        {viewMode === 'side-by-side' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            {/* Left: Original SAR Image */}
            <div style={{ backgroundColor: '#020617', borderRadius: '6px', overflow: 'hidden', border: '1px solid #1e293b' }}>
              <div style={{ padding: '8px 12px', backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#38bdf8', fontWeight: 700 }}>
                  ORIGINAL SAR BACKSCATTER
                </span>
                <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                  Raw σ₀
                </span>
              </div>
              <div style={{ position: 'relative', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#050c18' }}>
                {/* SVG Simulated SAR Texture & Backscatter Dark Formation */}
                <svg width="100%" height="100%" viewBox="0 0 400 240" style={{ display: 'block' }}>
                  <defs>
                    <radialGradient id="sarBg" cx="50%" cy="50%" r="70%">
                      <stop offset="0%" stopColor="#0f2137" />
                      <stop offset="100%" stopColor="#040b14" />
                    </radialGradient>
                    <filter id="noiseFilter">
                      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                      <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0.22 0" />
                    </filter>
                  </defs>
                  
                  {/* Water Clutter Background */}
                  <rect width="400" height="240" fill="url(#sarBg)" />
                  <rect width="400" height="240" filter="url(#noiseFilter)" opacity="0.45" />

                  {/* Range Gridlines */}
                  <line x1="50" y1="0" x2="50" y2="240" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3,3" />
                  <line x1="150" y1="0" x2="150" y2="240" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3,3" />
                  <line x1="250" y1="0" x2="250" y2="240" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3,3" />
                  <line x1="350" y1="0" x2="350" y2="240" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3,3" />
                  <line x1="0" y1="60" x2="400" y2="60" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3,3" />
                  <line x1="0" y1="120" x2="400" y2="120" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3,3" />
                  <line x1="0" y1="180" x2="400" y2="180" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3,3" />

                  {/* Dark Formation / Damped Wave Footprint */}
                  <path
                    d="M 110,85 C 140,75 190,90 230,110 C 275,130 300,160 280,180 C 255,195 210,180 170,160 C 130,140 95,100 110,85 Z"
                    fill="#02050b"
                    opacity="0.92"
                  />
                  <path
                    d="M 125,95 C 150,85 195,100 225,118 C 260,135 285,160 268,172 C 248,185 208,172 175,152 C 140,132 115,105 125,95 Z"
                    fill="#000000"
                    opacity="0.98"
                  />

                  {/* Subtle coastal shoal backscatter (Gulf of Mannar context) */}
                  <path d="M 0,210 Q 70,200 120,240 L 0,240 Z" fill="#132438" opacity="0.7" />
                  <text x="14" y="230" fill="#64748b" fontSize="9" fontFamily="var(--font-mono)">Coastline Shoal</text>

                  {/* Telemetry Annotations */}
                  <text x="14" y="24" fill="#94a3b8" fontSize="10" fontFamily="var(--font-mono)">Scene: {incident.satelliteScene.sceneId.slice(0, 22)}...</text>
                  <text x="14" y="38" fill="#64748b" fontSize="9" fontFamily="var(--font-mono)">Incident Angle: {incident.satelliteScene.incidenceAngleDeg}° • Polarisation: {incident.satelliteScene.polarisation}</text>
                  <text x="180" y="145" fill="#475569" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">Dark Formation (σ₀ -3.2 dB damping)</text>
                </svg>
              </div>
            </div>

            {/* Right: Detected Oil Slick (Mask + Delineation) */}
            <div style={{ backgroundColor: '#020617', borderRadius: '6px', overflow: 'hidden', border: '1px solid #1e293b' }}>
              <div style={{ padding: '8px 12px', backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#34d399', fontWeight: 700 }}>
                  DELINEATED SLICK MASK
                </span>
                <span className="badge badge-blue" style={{ fontSize: '9px', padding: '1px 5px' }}>
                  {incident.slickProperties.confidencePct.toFixed(1)}% Conf
                </span>
              </div>
              <div style={{ position: 'relative', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#050c18' }}>
                <svg width="100%" height="100%" viewBox="0 0 400 240" style={{ display: 'block' }}>
                  {/* Same SAR Background Clutter */}
                  <rect width="400" height="240" fill="url(#sarBg)" />
                  <rect width="400" height="240" filter="url(#noiseFilter)" opacity="0.3" />

                  {/* Bounding Region Box */}
                  {showBoundingBox && (
                    <rect 
                      x="98" 
                      y="70" 
                      width="210" 
                      height="125" 
                      fill="none" 
                      stroke="#f59e0b" 
                      strokeWidth="1.2" 
                      strokeDasharray="4,3" 
                      opacity="0.85"
                    />
                  )}

                  {/* Segmented Slick Mask */}
                  {showMaskOverlay && (
                    <path
                      d="M 110,85 C 140,75 190,90 230,110 C 275,130 300,160 280,180 C 255,195 210,180 170,160 C 130,140 95,100 110,85 Z"
                      fill="rgba(245, 158, 11, 0.45)"
                      stroke="#f59e0b"
                      strokeWidth="2"
                    />
                  )}

                  {/* Major and Minor Axes */}
                  {showAxes && (
                    <>
                      {/* Major Axis (Length: 5.6 km, Orientation 145 deg) */}
                      <line x1="105" y1="80" x2="285" y2="185" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3,2" />
                      <circle cx="195" cy="132" r="4" fill="#38bdf8" />
                      {/* Minor Axis (Width: 1.1 km) */}
                      <line x1="175" y1="155" x2="215" y2="108" stroke="#34d399" strokeWidth="1.2" strokeDasharray="2,2" />
                    </>
                  )}

                  {/* Labels on SVG */}
                  <text x="102" y="65" fill="#f59e0b" fontSize="9" fontFamily="var(--font-mono)" fontWeight="700">BOUNDING BOX [{incident.slickProperties.lengthKm} km × {incident.slickProperties.widthKm} km]</text>
                  <text x="290" y="195" fill="#38bdf8" fontSize="9" fontFamily="var(--font-mono)">Major Axis ({incident.slickProperties.orientationDeg}°)</text>
                  <text x="195" y="146" fill="#ffffff" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle" fontWeight="700">Centroid</text>
                  <text x="14" y="24" fill="#34d399" fontSize="10" fontFamily="var(--font-mono)">Mask Delineation: Neural U-Net SAR v2.4</text>
                  <text x="14" y="38" fill="#94a3b8" fontSize="9" fontFamily="var(--font-mono)">Area: {incident.slickProperties.areaKm2} km² • Perimeter: {incident.slickProperties.perimeterKm} km</text>
                </svg>
              </div>
            </div>
          </div>
        ) : (
          /* Toggle View */
          <div style={{ backgroundColor: '#020617', borderRadius: '6px', overflow: 'hidden', border: '1px solid #1e293b' }}>
            <div style={{ padding: '8px 12px', backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: activeToggleImage === 'original' ? '#38bdf8' : '#34d399', fontWeight: 700 }}>
                {activeToggleImage === 'original' ? 'ORIGINAL SAR SCENE (RAW BACKSCATTER)' : 'DETECTED OIL SLICK (SEGMENTATION & BOUNDING MASK)'}
              </span>
              <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                Viewing Mode: Single Interactive Canvas
              </span>
            </div>
            <div style={{ position: 'relative', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#050c18' }}>
              <svg width="100%" height="100%" viewBox="0 0 600 280" style={{ display: 'block' }}>
                <rect width="600" height="280" fill="url(#sarBg)" />
                <rect width="600" height="280" filter="url(#noiseFilter)" opacity="0.35" />

                {activeToggleImage === 'original' ? (
                  <>
                    <path
                      d="M 160,105 C 220,85 300,110 370,140 C 430,170 470,210 440,230 C 400,250 330,230 270,200 C 200,170 140,120 160,105 Z"
                      fill="#000000"
                      opacity="0.96"
                    />
                    <text x="300" y="175" fill="#64748b" fontSize="12" fontFamily="var(--font-mono)" textAnchor="middle">
                      Raw Damped SAR Low-Backscatter Region (-3.2 dB)
                    </text>
                  </>
                ) : (
                  <>
                    {showBoundingBox && (
                      <rect x="140" y="85" width="330" height="165" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,3" />
                    )}
                    <path
                      d="M 160,105 C 220,85 300,110 370,140 C 430,170 470,210 440,230 C 400,250 330,230 270,200 C 200,170 140,120 160,105 Z"
                      fill="rgba(245, 158, 11, 0.5)"
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                    />
                    {showAxes && (
                      <>
                        <line x1="150" y1="95" x2="445" y2="235" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4,2" />
                        <circle cx="300" cy="165" r="5" fill="#38bdf8" />
                      </>
                    )}
                    <text x="300" y="150" fill="#ffffff" fontSize="11" fontFamily="var(--font-mono)" textAnchor="middle" fontWeight="700">
                      Slick Area: {incident.slickProperties.areaKm2} km² (IoU Conf: {incident.slickProperties.confidencePct}%)
                    </text>
                  </>
                )}
              </svg>
            </div>
          </div>
        )}

        {/* Overlay Layers Quick Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input type="checkbox" checked={showMaskOverlay} onChange={(e) => setShowMaskOverlay(e.target.checked)} />
            Show Segmentation Mask
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input type="checkbox" checked={showBoundingBox} onChange={(e) => setShowBoundingBox(e.target.checked)} />
            Show Bounding Region
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input type="checkbox" checked={showAxes} onChange={(e) => setShowAxes(e.target.checked)} />
            Show Principal Orientation Axes
          </label>
        </div>
      </div>

      {/* 3. SLICK CHARACTERISATION CARD (SECTION 9) */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            Slick Characterisation (Geometric & Physical Properties)
          </span>
          <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
            SAR C-BAND DERIVED
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '12px' }}>
          <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>SLICK AREA</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {incident.slickProperties.areaKm2} km²
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Perimeter: {incident.slickProperties.perimeterKm} km</div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>LENGTH & WIDTH</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {incident.slickProperties.lengthKm} × {incident.slickProperties.widthKm} km
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Aspect: {(incident.slickProperties.lengthKm / incident.slickProperties.widthKm).toFixed(1)} : 1</div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ORIENTATION</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {incident.slickProperties.orientationDeg.toFixed(0)}° Azimuth
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Major Axis Alignment</div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ESTIMATED AGE</span>
              <ProvenanceBadge classification="MODEL_DERIVED" compact />
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#d97706', fontFamily: 'var(--font-mono)' }}>
              {incident.slickProperties.estimatedAgeHours}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Confidence: MEDIUM • Lagrangian decay</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ backgroundColor: '#fafbfc', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '11px' }}>
            <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>WEATHERING STATE: </span>
            <strong style={{ color: 'var(--text-primary)' }}>{incident.slickProperties.weatheringState}</strong>
          </div>
          <div style={{ backgroundColor: '#fafbfc', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '11px' }}>
            <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ESTIMATED VOLUME & THICKNESS: </span>
            <strong style={{ color: 'var(--text-primary)' }}>~{incident.slickProperties.estimatedVolumeM3} m³ ({incident.slickProperties.thicknessMicron} µm film)</strong>
          </div>
        </div>
      </div>

      {/* 4. DEDICATED LOOK-ALIKE FILTERING & SLICK VALIDATION (SECTION 8) */}
      <div 
        style={{ 
          borderTop: '1px solid var(--border)', 
          paddingTop: '18px',
          backgroundColor: lookAlikeRisk === 'High' ? 'rgba(254, 242, 242, 0.6)' : '#fafbfc',
          padding: '16px',
          borderRadius: '6px',
          border: lookAlikeRisk === 'High' ? '1px solid #fecaca' : '1px solid var(--border)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={16} color={lookAlikeRisk === 'High' ? 'var(--alert-red)' : 'var(--accent-blue)'} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: lookAlikeRisk === 'High' ? 'var(--alert-red)' : 'var(--text-primary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              SLICK VALIDATION & LOOK-ALIKE FILTERING
            </span>
          </div>

          <span 
            className={`badge ${lookAlikeRisk === 'High' ? 'badge-red' : 'badge-green'}`}
            style={{ fontSize: '10px' }}
          >
            {lookAlikeRisk.toUpperCase()} LOOK-ALIKE RISK
          </span>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
          Synthetic Aperture Radar detects surface capillary damping; however, natural biogenic sheens, grease ice, low wind calms, and shallow shoals can produce dark formations resembling mineral oil spills. AquaTrace applies physical filter criteria to quantify oil likelihood:
        </p>

        {/* Visual Pipeline Funnel */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            backgroundColor: '#0f172a', 
            padding: '12px 16px', 
            borderRadius: '4px',
            marginBottom: '14px',
            color: '#ffffff',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)'
          }}
        >
          <div>
            <div style={{ color: '#94a3b8', fontSize: '9px' }}>INPUT</div>
            <strong style={{ color: '#cbd5e1' }}>SAR Dark Formation</strong>
          </div>
          <div style={{ color: '#64748b' }}>→</div>
          <div>
            <div style={{ color: '#94a3b8', fontSize: '9px' }}>PHYSICAL FILTERS</div>
            <strong style={{ color: '#38bdf8' }}>6 Look-Alike Criteria</strong>
          </div>
          <div style={{ color: '#64748b' }}>→</div>
          <div>
            <div style={{ color: '#94a3b8', fontSize: '9px' }}>OUTCOME</div>
            <strong style={{ color: incident.slickProperties.confidencePct > 70 ? '#34d399' : '#f87171' }}>
              Oil Likelihood: {incident.slickProperties.confidencePct.toFixed(1)}%
            </strong>
          </div>
        </div>

        {/* Multi-Factor Criteria Table */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '11px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>SAR TEXTURE & DAMPING</div>
            <strong>3.2 dB Contrast</strong>
            <div style={{ color: lookAlikeRisk === 'High' ? 'var(--alert-red)' : 'var(--text-secondary)', fontSize: '10px', marginTop: '2px' }}>
              {lookAlikeRisk === 'High' ? 'Within biogenic natural sheen overlap zone (2.5–4.0 dB)' : 'Strong mineral oil damping contrast (>6.0 dB)'}
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>WIND VELOCITY CONDITIONS</div>
            <strong>{incident.windVectors[0]?.speedKnots || 4.1} kts (~2.1 m/s)</strong>
            <div style={{ color: lookAlikeRisk === 'High' ? 'var(--alert-red)' : 'var(--text-secondary)', fontSize: '10px', marginTop: '2px' }}>
              {lookAlikeRisk === 'High' ? 'Low wind calm damping risk (<3.0 m/s threshold)' : 'Optimal wind regime (3.5–10.0 m/s)'}
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>COASTLINE PROXIMITY</div>
            <strong>{incident.sensitiveAreas[0]?.distanceNm || 4.2} nm Off Coastal Shoal</strong>
            <div style={{ color: 'var(--text-secondary)', fontSize: '10px', marginTop: '2px' }}>
              Suspended sediment & algal bloom boundary zone
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>SHIP WAKE CORRELATION</div>
            <strong>Ruled Out (No Linear Wake)</strong>
            <div style={{ color: 'var(--success-green)', fontSize: '10px', marginTop: '2px' }}>
              Does not match narrow Kelvin wake attenuation
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>MULTISPECTRAL OPTICAL CHECK</div>
            <strong>Sentinel-2 Cloud Obscured (88%)</strong>
            <div style={{ color: 'var(--text-muted)', fontSize: '10px', marginTop: '2px' }}>
              Chlorophyll-a NDWI cross-validation unavailable
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>DECISION GOVERNANCE</div>
            <strong style={{ color: isInconclusive ? 'var(--alert-red)' : 'var(--accent-blue)' }}>
              {isInconclusive ? 'Principled Abstention' : 'Confidence Sustained'}
            </strong>
            <div style={{ color: 'var(--text-secondary)', fontSize: '10px', marginTop: '2px' }}>
              Prevents wrongful attribution on ambiguous slick
            </div>
          </div>
        </div>
      </div>

      {/* 5. MULTI-MISSION SATELLITE SOURCES */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '8px' }}>
          Supported Satellite Missions & Sensor Provenance
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '11px' }}>
          <div style={{ border: '1px solid var(--accent-blue)', borderRadius: '4px', padding: '8px 10px', backgroundColor: 'var(--accent-blue-light)' }}>
            <div style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>EOS-04 (RISAT-1A) SAR</div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Primary Indian C-band SAR sensor utilized in this detection.</div>
          </div>

          <div style={{ border: '1px solid var(--border)', borderRadius: '4px', padding: '8px 10px', backgroundColor: 'var(--bg-subtle)' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Sentinel-1C (Copernicus)</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Interferometric Wide Swath C-SAR (supported source).</div>
          </div>

          <div style={{ border: '1px solid var(--border)', borderRadius: '4px', padding: '8px 10px', backgroundColor: 'var(--bg-subtle)' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Sentinel-2 MSI Optical</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>High-resolution multispectral sheen verification (daylight/clear).</div>
          </div>
        </div>
      </div>

    </div>
  );
};
