import React, { useState } from 'react';
import { 
  Radar, 
  Layers, 
  RotateCcw, 
  Compass, 
  Ship, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Database
} from 'lucide-react';

interface WorkflowStep {
  step: string;
  name: string;
  tagline: string;
  icon: React.ReactNode;
  description: string;
  technology: string;
  inputs: string;
  outputs: string;
  formulaOrRule: string;
  sampleMetric: string;
}

export const WorkflowExplorer: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const steps: WorkflowStep[] = [
    {
      step: '01',
      name: 'DETECT',
      tagline: 'Candidate Slick Geometry Identification',
      icon: <Radar size={18} />,
      description: 'Identifies candidate slick geometry and anomalous dark formations on ocean water surfaces using high-resolution Synthetic Aperture Radar (Sentinel-1, EOS-04 RISAT-1A) invariant to cloud cover and daylight.',
      technology: 'PyTorch U-Net SAR Neural Segmenter v2.4 (Pre-vectorised inference in demo)',
      inputs: 'Raw GRDH SAR Amplitude Scenes (VV + VH Polarisation), 10m–12.5m Resolution',
      outputs: 'Binary Slick Mask Polygon, GeoJSON, NRCS Backscatter Damping Map',
      formulaOrRule: 'Backscatter Damping: Δσ₀ = σ₀(Clean Ocean) - σ₀(Slick) > 4.5 dB (Mineral Oil)',
      sampleMetric: 'Detection Contrast: 8.4 dB (OS-042) / 3.2 dB (OS-037) | Confidence: 93.6%',
    },
    {
      step: '02',
      name: 'CHARACTERISE',
      tagline: 'Measurement, Weathering & Look-Alike Validation',
      icon: <Layers size={18} />,
      description: 'Quantifies geometric properties (area, perimeter, orientation, aspect ratio) while rigorously screening against look-alikes including natural biogenic algal sheens, low-wind calms (<3 m/s), and river sediment turbulence.',
      technology: 'Morphological Analysis, GDAL Geometry Engine, Surface Wave Damping Filters',
      inputs: 'Detected polygon, wind velocity, sea surface temperature, bathymetry, optical check',
      outputs: 'Slick Area (km²), Estimated Age Range (e.g. 8–14 hrs), Look-Alike Risk Index',
      formulaOrRule: 'Fay Viscous-Inertial Spreading Laws & Weathering Emulsification Kinetics',
      sampleMetric: 'Area: 6.4 km² (OS-037) / 14.85 km² (OS-042) | Age: 8–14 hrs (High Uncertainty)',
    },
    {
      step: '03',
      name: 'HINDCAST',
      tagline: 'Lagrangian Reverse Drift & Origin Probability',
      icon: <RotateCcw size={18} />,
      description: 'Reconstructs the probable origin region and release-time window by reversing ocean currents and wind advection under analytical and stochastic drift dynamics. Never assumes a single magical point source.',
      technology: 'OpenDrift Lagrangian Reverse Advection / NOAA GNOME Coupled Metocean Engine',
      inputs: 'Observed slick polygon, NCMRWF wind field, INCOIS surface currents (U/V), Stokes drift',
      outputs: 'P50 / P80 / P95 modelled uncertainty envelopes and release-time window [T₀, T₁]',
      formulaOrRule: 'dX_t = -(u_{curr} + α_{wind} · R(θ) · u_{wind} + u_{stokes})dt + √(2K_h)dW_t',
      sampleMetric: 'Release Window: 18:00–00:00 UTC (Centroid: 8.92°N, 79.05°E | P50 Apex)',
    },
    {
      step: '04',
      name: 'AIS CORRELATION',
      tagline: 'Historical Telemetry & Candidate Filtering Funnel',
      icon: <Ship size={18} />,
      description: 'Decodes historical regional AIS broadcasts, screening maritime traffic through a 6-stage physical and kinematic funnel (Spatial → Temporal → Heading → Velocity → AIS continuity → CPA) to isolate candidates of interest.',
      technology: 'PostGIS Spatiotemporal R-Tree Indexing & Kinematic Acceleration Filters',
      inputs: 'Reconstructed origin envelope (P95), release window, historical AIS transponder stream',
      outputs: 'Filtered candidate fleet, Closest Point of Approach (CPA), speed anomaly flags, AIS gap logs',
      formulaOrRule: 'Spatiotemporal Intersection: d_v(t) ∈ Polygon_{origin}(t) for t ∈ [T₀, T₁]',
      sampleMetric: '42 Sector Vessels Filtered down to 3 Candidates of Interest',
    },
    {
      step: '05',
      name: 'ATTRIBUTION',
      tagline: 'Explainable Evidence Fusion & Principled Abstention',
      icon: <ShieldCheck size={18} />,
      description: 'Synthesises multiple independent evidence channels (spatial, temporal, heading, speed drop, counterfactual simulation, transponder continuity) into transparent composite scores. Enforces INCONCLUSIVE when evidence is insufficient.',
      technology: 'Multi-Channel Evidence Fusion Engine & Section 33 Governance Rules',
      inputs: 'Six evidence scores: Satellite (20%), Drift (25%), AIS (20%), Behaviour (10%), CF (20%), History (5%)',
      outputs: 'Ranked candidate vessels of interest with explainable score breakdown or formal abstention verdict',
      formulaOrRule: 'Score = Σ (w_k · S_k) | If LookAlike > Cutoff OR TopScore < Threshold => Abstain (INCONCLUSIVE)',
      sampleMetric: 'OS-042: MT Al-Hikma (89.9%) | OS-037: Official Verdict INCONCLUSIVE (Abstention)',
    },
    {
      step: '06',
      name: 'FORECAST',
      tagline: 'Forward Trajectory Forecasting & Shoreline Risk',
      icon: <Compass size={18} />,
      description: 'Projects forward slick trajectory, spreading, and weathering over +12h, +24h, and +48h horizons with expanding uncertainty envelopes to inform containment vessel deployment and marine protected area defense.',
      technology: 'OpenOil Forward Lagrangian Advection-Diffusion Mass Balance Model',
      inputs: 'Current slick position, forecasted meteorological winds, tidal streams, coastline geometries',
      outputs: '+12h, +24h, +48h trajectory cones, sensitive area arrival time (ETA) estimates',
      formulaOrRule: 'Forward Dispersion: C(x,y,t) with Evaporation Loss & Water-in-Oil Emulsification',
      sampleMetric: '+24h Travel: 14.8 km @ 140° SE | ETA to Marine National Park: 14.5 hours',
    },
  ];

  const current = steps[activeStepIndex];

  return (
    <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
      {/* 6-Step Tab Bar */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(6, 1fr)', 
          borderBottom: '1px solid var(--border)',
          backgroundColor: '#0a1120'
        }}
      >
        {steps.map((st, idx) => {
          const isActive = idx === activeStepIndex;
          return (
            <button
              key={st.step}
              onClick={() => setActiveStepIndex(idx)}
              style={{
                padding: '14px 10px',
                border: 'none',
                borderRight: idx < 5 ? '1px solid #1e293b' : 'none',
                borderBottom: isActive ? '3px solid #38bdf8' : '3px solid transparent',
                backgroundColor: isActive ? '#0f172a' : 'transparent',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: isActive ? '#38bdf8' : '#94a3b8', marginBottom: '4px' }}>
                {st.icon}
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  {st.step}
                </span>
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: isActive ? '#ffffff' : '#cbd5e1', letterSpacing: '0.02em' }}>
                {st.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Step Detail Content Body */}
      <div style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span className="badge badge-blue" style={{ marginBottom: '6px' }}>
              PHASE {current.step} OF 06
            </span>
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {current.step}. {current.name} — {current.tagline}
            </h3>
          </div>

          <div style={{ padding: '6px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            BENCHMARK: {current.sampleMetric}
          </div>
        </div>

        <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px', maxWidth: '900px' }}>
          {current.description}
        </p>

        {/* 4 Technical Metadata Blocks */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '14px', borderRadius: '4px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px', textTransform: 'uppercase' }}>
              Method & Engine Architecture
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {current.technology}
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '14px', borderRadius: '4px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px', textTransform: 'uppercase' }}>
              Input Telemetry & Metocean Fields
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {current.inputs}
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '14px', borderRadius: '4px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px', textTransform: 'uppercase' }}>
              Generated Forensic Artifacts
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {current.outputs}
            </div>
          </div>
        </div>

        {/* Governing Equation / Mathematical Rule */}
        <div style={{ backgroundColor: '#0f172a', padding: '14px 18px', borderRadius: '6px', color: '#cbd5e1', fontSize: '12px', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '3px' }}>
              GOVERNING FORMULATION / OPERATIONAL CRITERION
            </div>
            <div style={{ color: '#f8fafc', fontWeight: 600 }}>
              {current.formulaOrRule}
            </div>
          </div>

          <div style={{ color: '#94a3b8', fontSize: '11px' }}>
            ISO/IEC 27037 Compliant Traceability
          </div>
        </div>
      </div>
    </div>
  );
};
