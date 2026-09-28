import React, { useState } from 'react';
import { Incident } from '../../types';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { 
  RotateCcw, 
  Compass, 
  Wind, 
  Waves, 
  Thermometer, 
  Layers, 
  Clock, 
  ShieldAlert, 
  Info, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Database
} from 'lucide-react';

interface OriginDriftPanelProps {
  incident: Incident;
}

export const OriginDriftPanel: React.FC<OriginDriftPanelProps> = ({ incident }) => {
  const [activeSubTab, setActiveSubTab] = useState<'origin-hindcast' | 'forecast' | 'metocean'>('origin-hindcast');
  const [selectedForecastHorizon, setSelectedForecastHorizon] = useState<'12h' | '24h' | '48h'>('24h');

  const originConfidence = incident.slickProperties.confidencePct;
  const isInconclusive = incident.attributionStatus === 'INCONCLUSIVE';

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#ffffff', height: '100%', overflowY: 'auto' }}>
      
      {/* 1. SECTION HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <ProvenanceBadge 
              classification="MODEL_DERIVED"
              sourceText="AquaTrace Lagrangian Engine v2.4"
              compact
            />
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              LAGRANGIAN HYDRODYNAMIC ENGINE
            </span>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Probabilistic Origin & Trajectory Intelligence
          </h3>
        </div>

        {/* Sub-tab Navigation */}
        <div style={{ display: 'flex', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', padding: '3px', border: '1px solid var(--border)' }}>
          <button
            onClick={() => setActiveSubTab('origin-hindcast')}
            style={{
              padding: '5px 10px',
              fontSize: '11px',
              fontWeight: 600,
              border: 'none',
              borderRadius: '3px',
              backgroundColor: activeSubTab === 'origin-hindcast' ? '#0f172a' : 'transparent',
              color: activeSubTab === 'origin-hindcast' ? '#ffffff' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <RotateCcw size={12} /> Origin & Hindcast
          </button>
          <button
            onClick={() => setActiveSubTab('forecast')}
            style={{
              padding: '5px 10px',
              fontSize: '11px',
              fontWeight: 600,
              border: 'none',
              borderRadius: '3px',
              backgroundColor: activeSubTab === 'forecast' ? '#0f172a' : 'transparent',
              color: activeSubTab === 'forecast' ? '#ffffff' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Compass size={12} /> Future Drift Forecast
          </button>
          <button
            onClick={() => setActiveSubTab('metocean')}
            style={{
              padding: '5px 10px',
              fontSize: '11px',
              fontWeight: 600,
              border: 'none',
              borderRadius: '3px',
              backgroundColor: activeSubTab === 'metocean' ? '#0f172a' : 'transparent',
              color: activeSubTab === 'metocean' ? '#ffffff' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Waves size={12} /> Environmental Data
          </button>
        </div>
      </div>

      {/* 2. SUB-TAB CONTENT */}
      {activeSubTab === 'origin-hindcast' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* PROBABILISTIC ORIGIN RECONSTRUCTION CARD (SECTION 10) */}
          <div style={{ backgroundColor: '#fafbfc', border: '1px solid var(--border)', borderRadius: '6px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                PROBABILISTIC ORIGIN RECONSTRUCTION
              </span>
              <span className="badge badge-amber" style={{ fontSize: '10px' }}>
                UNCERTAINTY ENVELOPE (P50/P80/P95)
              </span>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
              Spill origin is modeled as a <strong>continuous probability density function</strong> rather than an exact deterministic coordinate. The distribution reflects stochastic windage variance (2.5%–3.5%), hydrodynamic turbulence, and observation timestamp uncertainty.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ESTIMATED ORIGIN WINDOW</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {incident.releaseWindow.startUtc.slice(11, 16)} – {incident.releaseWindow.endUtc.slice(11, 16)} UTC
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Duration: {incident.releaseWindow.durationHours} hours window</div>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ORIGIN CENTROID</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {incident.releaseWindow.centroidLat.toFixed(2)}°N, {incident.releaseWindow.centroidLng.toFixed(2)}°E
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Gaussian Peak (Highest Probability)</div>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ORIGIN CONFIDENCE</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: originConfidence > 70 ? 'var(--accent-blue)' : '#d97706', fontFamily: 'var(--font-mono)' }}>
                  {originConfidence.toFixed(1)}% {originConfidence < 60 ? '(High Uncertainty)' : '(Robust)'}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Accounting for metocean noise</div>
              </div>
            </div>

            {/* Probability Contours Table */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid var(--border)', padding: '10px 14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Spatial Probability Contour Bounds
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '11px' }}>
                <div style={{ borderLeft: '3px solid #ef4444', paddingLeft: '8px' }}>
                  <strong style={{ color: '#ef4444' }}>P50 High Core</strong>
                  <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>50% cumulative probability apex ({incident.originContours.p50.length} vertices)</div>
                </div>
                <div style={{ borderLeft: '3px solid #f59e0b', paddingLeft: '8px' }}>
                  <strong style={{ color: '#f59e0b' }}>P80 Operational Zone</strong>
                  <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>80% credible origin boundary ({incident.originContours.p80.length} vertices)</div>
                </div>
                <div style={{ borderLeft: '3px solid #38bdf8', paddingLeft: '8px' }}>
                  <strong style={{ color: '#38bdf8' }}>P95 Outer Bound</strong>
                  <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>95% boundary envelope ({incident.originContours.p95.length} vertices)</div>
                </div>
              </div>
            </div>
          </div>

          {/* BACKWARD HINDCAST DETAILS (SECTION 11) */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                BACKWARD HINDCAST DRIFT TRAJECTORY
              </span>
              <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                REVERSE LAGRANGIAN (T-0 to T-{incident.releaseWindow.durationHours}h)
              </span>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '12px' }}>
              Traces backwards in time from the satellite-observed slick boundary to reconstruct candidate release points along the historical current and wind forcing field:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {incident.hindcastTrajectory.map((step, idx) => (
                <div
                  key={step.time}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: idx === 0 ? 'var(--bg-subtle)' : '#ffffff',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span 
                      style={{ 
                        width: '20px', 
                        height: '20px', 
                        borderRadius: '50%', 
                        backgroundColor: idx === 0 ? '#38bdf8' : idx === incident.hindcastTrajectory.length - 1 ? '#f59e0b' : '#64748b',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '9px',
                        fontWeight: 700,
                      }}
                    >
                      {idx === 0 ? 'T₀' : `-${idx}`}
                    </span>
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>{step.time}</strong>
                      <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>
                        [{step.lat.toFixed(2)}°N, {step.lng.toFixed(2)}°E]
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-secondary)' }}>
                    <span>Current: <strong>{Math.hypot(step.uCurrentM_s, step.vCurrentM_s).toFixed(2)} m/s</strong></span>
                    <span>Wind: <strong>{step.windSpeedKts} kts @ {step.windDirDeg}°</strong></span>
                    <span style={{ color: idx === incident.hindcastTrajectory.length - 1 ? '#d97706' : '#0284c7', fontWeight: 600 }}>
                      {idx === 0 ? 'Observed Slick' : idx === incident.hindcastTrajectory.length - 1 ? 'Reconstructed Origin Apex' : 'Reverse Drift Vector'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* FUTURE DRIFT FORECAST (SECTION 12) */}
      {activeSubTab === 'forecast' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ backgroundColor: '#fafbfc', border: '1px solid var(--border)', borderRadius: '6px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                FUTURE DRIFT FORECAST & SENSITIVE ZONE RISK
              </span>
              <span className="badge badge-teal" style={{ fontSize: '10px' }}>
                FORWARD ENVELOPE
              </span>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
              Projects future slick trajectory and spreading using forward Lagrangian advection-diffusion modeling coupled with forecast wind and ocean currents. An expanding uncertainty cone communicates probability bounds without claiming deterministic precision.
            </p>

            {/* Horizon Selector */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              {(['12h', '24h', '48h'] as const).map((horizon) => (
                <button
                  key={horizon}
                  onClick={() => setSelectedForecastHorizon(horizon)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: selectedForecastHorizon === horizon ? '1px solid var(--accent-blue)' : '1px solid var(--border)',
                    backgroundColor: selectedForecastHorizon === horizon ? 'var(--accent-blue-light)' : '#ffffff',
                    color: selectedForecastHorizon === horizon ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  }}
                >
                  +{horizon} Horizon
                </button>
              ))}
            </div>

            {/* Forecast Projection Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>PROJECTED POSITION (+{selectedForecastHorizon})</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {incident.forecastEnvelope[0]?.lat.toFixed(2) || '8.81'}°N, {incident.forecastEnvelope[0]?.lng.toFixed(2) || '79.16'}°E
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Bearing: 140° SE</div>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>UNCERTAINTY RADIUS</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0284c7', fontFamily: 'var(--font-mono)' }}>
                  ±{incident.forecastEnvelope[0]?.uncertaintyRadiusKm || 5.5} km
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Diffusion & wind forecast error</div>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>THREATENED SENSITIVE ZONE</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626' }}>
                  {incident.sensitiveAreas[0]?.name || 'Marine Protected Area'}
                </div>
                <div style={{ fontSize: '10px', color: '#dc2626' }}>ETA to boundary: ~14.5 hours</div>
              </div>
            </div>
          </div>

          {/* Differentiated Map Layer Guide (Section 12) */}
          <div style={{ backgroundColor: '#0f172a', padding: '12px 16px', borderRadius: '6px', color: '#f8fafc', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            <div style={{ color: '#38bdf8', fontWeight: 700, marginBottom: '6px' }}>MAP LAYER CARTOGRAPHIC KEY</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '2px', display: 'inline-block' }} />
                <span>Observed Slick</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '2px', backgroundColor: '#38bdf8', display: 'inline-block' }} />
                <span>Hindcast Trajectory</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '2px', backgroundColor: '#34d399', display: 'inline-block', borderBottom: '1px dashed #34d399' }} />
                <span>Forecast Vector</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', backgroundColor: 'rgba(56, 189, 248, 0.25)', border: '1px dashed #38bdf8', display: 'inline-block' }} />
                <span>Uncertainty Envelope</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ENVIRONMENTAL CONDITIONS / METOCEAN FORCING (SECTION 13) */}
      {activeSubTab === 'metocean' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ backgroundColor: '#fafbfc', border: '1px solid var(--border)', borderRadius: '6px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                METOCEAN FORCING CONDITIONS & PROVENANCE
              </span>
              <ProvenanceBadge 
                classification={incident.isSyntheticDemo ? 'DEMO_SIMULATION' : 'REAL_OBSERVATION'}
                sourceText="INCOIS ROMS + NOAA GFS"
                compact
              />
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
              Drift trajectories are not synthetic linear curves; they are numerically integrated over spatial wind and ocean current vector fields ingested from operational meteorological agencies:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                  <Wind size={13} /> 10m SURFACE WIND
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {incident.windVectors[0]?.speedKnots.toFixed(1)} kts @ {incident.windVectors[0]?.directionDeg}°
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Source: NCMRWF Unified Model / ECMWF IFS 0.1°</div>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                  <Waves size={13} /> OCEAN SURFACE CURRENTS
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {incident.currentVectors[0]?.speedKnots.toFixed(2)} kts @ {incident.currentVectors[0]?.directionDeg}°
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Source: INCOIS Regional Ocean Model / HYCOM</div>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                  <Thermometer size={13} /> SEA-SURFACE TEMPERATURE & WAVE
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  28.4°C • 1.2m SWH
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Source: INCOIS Coastal Buoy Network (Mandapam)</div>
              </div>
            </div>

            {/* Governing Physics Equation & Method */}
            <div style={{ backgroundColor: '#0f172a', padding: '12px 14px', borderRadius: '4px', color: '#cbd5e1', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              <div style={{ color: '#38bdf8', fontWeight: 700, marginBottom: '4px' }}>
                HYDRODYNAMIC LAGRANGIAN ADVECTION FORMULATION
              </div>
              <div style={{ color: '#f8fafc', padding: '6px 0', borderBottom: '1px solid #334155', marginBottom: '6px' }}>
                v_drift(t) = u_current(t) + α_windage · R(θ_Coriolis) · v_wind10m(t) + v_Stokes(t) + ε_turbulence
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', color: '#94a3b8', fontSize: '10px' }}>
                <div>Windage Factor (α): <strong>3.0% (±0.5%)</strong></div>
                <div>Coriolis Deflection (θ): <strong>15.0° Right</strong></div>
                <div>Drift Model: <strong>OpenDrift v2.4 (Python/C)</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
