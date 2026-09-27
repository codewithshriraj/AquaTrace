import React, { useState } from 'react';
import { 
  Radar, 
  Layers, 
  RotateCcw, 
  TrendingUp, 
  Radio, 
  Search, 
  CheckCircle2, 
  Award, 
  AlertOctagon,
  ArrowRight
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
      tagline: 'Multi-Sensor Satellite Oil Slick Segmentation',
      icon: <Radar size={18} />,
      description: 'Detects anomalous dark formations on open ocean water surfaces using high-resolution Synthetic Aperture Radar (Sentinel-1, EOS-04) invariant to cloud cover and solar illumination.',
      technology: 'PyTorch, SegFormer-B4 MiT, Sentinel-1 C-SAR IW Mode, Zenodo SAR Dataset',
      inputs: 'Raw GRDH SAR Amplitude Scenes (VV + VH Polarisation), 10m Resolution',
      outputs: 'Binary Slick Mask Polygon, GeoJSON, NRCS Backscatter Damping Map',
      formulaOrRule: 'Backscatter Damping: Δσ₀ = σ₀(Clean Ocean) - σ₀(Slick) > 4.5 dB',
      sampleMetric: 'Detection Confidence: 93.6% | Look-Alike Risk: Low (0.08)',
    },
    {
      step: '02',
      name: 'CHARACTERISE',
      tagline: 'Morphology, Age Estimation & Look-Alike Filtering',
      icon: <Layers size={18} />,
      description: 'Quantifies geometric thickness, surface area, weathering state, and filters out false positives such as biogenic algal films, wind shadow lees, internal waves, and coastal upwellings.',
      technology: 'OpenCV, Shapely, GDAL, Sentinel-2 Multispectral Chlorophyll-a / NDWI',
      inputs: 'Detected polygon, wind velocity, sea surface temperature, bathymetry',
      outputs: 'Estimated slick age (hours), volumetric estimate (m³), weathering state',
      formulaOrRule: 'Fay Surface Tension / Viscous-Inertial Spreading Laws & Weathering Curves',
      sampleMetric: 'Area: 14.85 km² | Thickness: 28.3 µm | Age: 4.5–6.0 hrs',
    },
    {
      step: '03',
      name: 'HINDCAST',
      tagline: 'Ensemble Backward Drift Oceanographic Reconstruction',
      icon: <RotateCcw size={18} />,
      description: 'Reverses time through hydrodynamic and wind current fields to reconstruct the exact probabilistic spacetime distribution of where and when the release occurred.',
      technology: 'OpenDrift, NOAA GNOME, ECMWF ERA5 10m Winds, CMEMS Global Ocean Currents',
      inputs: 'Slick polygon, ERA5 wind grid, CMEMS surface currents (U/V), wave Stokes drift',
      outputs: '50%, 80%, and 95% spatial-temporal origin probability envelopes and release time window',
      formulaOrRule: 'dX_t = -(u_{curr} + α_{wind} · u_{wind} + u_{stokes})dt + √(2K_h)dW_t',
      sampleMetric: 'Release Window: 08:45–10:15 UTC (Centroid: 18.26°N, 70.92°E)',
    },
    {
      step: '04',
      name: 'FORECAST',
      tagline: 'Predictive Forward Dispersion & Shoreline Impact',
      icon: <TrendingUp size={18} />,
      description: 'Forecasts the forward trajectory of the oil slick over the next 24–72 hours with expanding uncertainty envelopes to protect sensitive coastal habitats and aquaculture.',
      technology: 'OpenOil Particle Dispersion, RK4 Integration, Bathymetric Shoal Model',
      inputs: 'Current slick position, forecasted meteorological winds & tidal streams',
      outputs: 'T+6h, T+12h, T+24h trajectory cones, shoreline contact probabilities',
      formulaOrRule: 'Advection-Diffusion with Evaporation & Emulsification Mass Balance',
      sampleMetric: 'T+24h Travel: 28.4 km @ 058° | Nearest Sanctuary CPA: 44.6 nm',
    },
    {
      step: '05',
      name: 'CORRELATE',
      tagline: 'Spatiotemporal AIS Vessel Historical Reconstruction',
      icon: <Radio size={18} />,
      description: 'Queries global Class A and B AIS broadcast records within the reconstructed origin spacetime bounding box to isolate all commercial vessels transiting the spill apex.',
      technology: 'DuckDB, PostGIS Spatial Indexing, MarineCadastre, Spire AIS Relay',
      inputs: 'Origin polygon (P95), release window [T_start, T_end], vessel MMSI stream',
      outputs: 'Candidate vessel fleet, closest point of approach (CPA), speed profiles',
      formulaOrRule: 'Spatial-Temporal Intersection: d_v(t) ∈ Polygon_{origin}(t) for t ∈ [T₀, T₁]',
      sampleMetric: '4 Candidates Filtered from 142 Vessels in Sector',
    },
    {
      step: '06',
      name: 'INVESTIGATE',
      tagline: 'Dark Vessel Forensics & Kinematic Anomaly Detection',
      icon: <Search size={18} />,
      description: 'Detects vessels with non-reporting AIS (dark vessels) by cross-referencing SAR CFAR metallic ship targets against AIS broadcasts, and flags kinematic / continuity anomalies.',
      technology: 'SAR CFAR (Constant False Alarm Rate), Kinematic Acceleration Filter',
      inputs: 'SAR high-resolution backscatter peaks, AIS message timestamps and positions',
      outputs: 'Unmatched radar targets, speed anomalies, unexplained deceleration logs',
      formulaOrRule: 'Vessel Match: ||X_{SAR} - X_{AIS}(t_{SAR})|| < ε_{drift}; AIS Silence Flagged',
      sampleMetric: '1 Dark Vessel (Small Trawler) + 1 Speed Drop Anomaly (8.4 kts)',
    },
    {
      step: '07',
      name: 'VERIFY',
      tagline: 'Counterfactual Vessel Discharge Simulation',
      icon: <CheckCircle2 size={18} />,
      description: 'Injects virtual discharge particles at each candidate vessel’s exact coordinates and timestamp, runs forward hydrodynamic dispersion, and computes geometric similarity against observed SAR slick.',
      technology: 'Lagrangian Particle Tracking, Geometric Intersection over Union (IoU)',
      inputs: 'Candidate vessel GPS track, discharge volume hypothesis, metocean fields',
      outputs: 'Simulated slick footprint, Hausdorff distance, spatial IoU similarity score',
      formulaOrRule: 'IoU = Area(S_{observed} ∩ S_{simulated}) / Area(S_{observed} ∪ S_{simulated})',
      sampleMetric: 'Candidate A IoU: 84.2% (Overall Similarity 91.4%)',
    },
    {
      step: '08',
      name: 'ATTRIBUTE',
      tagline: 'Multi-Channel Forensic Evidence Fusion',
      icon: <Award size={18} />,
      description: 'Combines satellite radar contrast, drift hindcast convergence, AIS spacetime proximity, vessel behaviour, and counterfactual validation into an auditable composite evidence score.',
      technology: 'Multi-Factor Evidence Network, Operational Weighted Scoring, Audit Trail',
      inputs: 'Vector of multi-modal evidence scores [S_sat, S_drift, S_ais, S_behav, S_cf, S_hist]',
      outputs: 'Ranked candidate list: High, Moderate, Low Correlation or Inconclusive',
      formulaOrRule: 'Score = Σ (w_k · S_k) | w_k: Sat 20%, Drift 25%, AIS 20%, Behav 10%, CF 20%, Hist 5%',
      sampleMetric: 'Rank #1: MT AL-HIKMA — 89.9% (HIGH CORRELATION)',
    },
    {
      step: '09',
      name: 'ABSTAIN',
      tagline: 'Rigorous Abstention: INCONCLUSIVE When Evidence Is Weak',
      icon: <AlertOctagon size={18} />,
      description: 'AquaTrace never forces a false allegation. If look-alike risk is high, AIS coverage is missing, or counterfactual IoU is below 70%, the system flags the case as INCONCLUSIVE.',
      technology: 'Uncertainty Quantifier, Evidence Sufficiency Governor',
      inputs: 'Confidence margins, data coverage completeness, model variance',
      outputs: 'Formal INCONCLUSIVE verdict with itemised evidentiary gaps and field sampling actions',
      formulaOrRule: 'If P(Top_1) - P(Top_2) < Threshold OR LookAlike > 0.40 => ABSTAIN',
      sampleMetric: 'Incident OS-037: INCONCLUSIVE (High Biogenic Look-Alike Risk)',
    },
  ];

  const current = steps[activeStepIndex];

  return (
    <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
      {/* 9-Step Tab Bar */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(9, 1fr)', 
          borderBottom: '1px solid var(--border)',
          backgroundColor: '#fafbfc'
        }}
      >
        {steps.map((st, idx) => {
          const isActive = idx === activeStepIndex;
          const isAbstain = st.step === '09';
          return (
            <button
              key={st.step}
              onClick={() => setActiveStepIndex(idx)}
              style={{
                padding: '14px 8px',
                border: 'none',
                borderRight: idx < 8 ? '1px solid var(--border)' : 'none',
                borderBottom: isActive ? `3px solid ${isAbstain ? 'var(--alert-red)' : 'var(--accent-blue)'}` : '3px solid transparent',
                backgroundColor: isActive ? '#ffffff' : 'transparent',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <div 
                style={{ 
                  fontFamily: 'var(--font-mono)', 
                  fontSize: '11px', 
                  fontWeight: 600, 
                  color: isActive ? (isAbstain ? 'var(--alert-red)' : 'var(--accent-blue)') : 'var(--text-muted)',
                  marginBottom: '4px'
                }}
              >
                {st.step}
              </div>
              <div 
                style={{ 
                  fontSize: '12px', 
                  fontWeight: 600, 
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {st.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Step Detailed Showcase */}
      <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span className={`badge ${current.step === '09' ? 'badge-red' : 'badge-blue'}`}>
              STAGE {current.step} OF 09
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              FORENSIC PIPELINE
            </span>
          </div>

          <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {current.name} — {current.tagline}
          </h3>

          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
            {current.description}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                Technology & Frameworks
              </div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                {current.technology}
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                Primary Inputs
              </div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                {current.inputs}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setActiveStepIndex((prev) => (prev + 1) % steps.length)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              Next Step <ArrowRight size={14} />
            </button>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Click any stage tab to inspect inputs, math & criteria
            </span>
          </div>
        </div>

        {/* Right Card: Technical Formula & Scientific Spec */}
        <div 
          style={{ 
            backgroundColor: '#0f172a', 
            borderRadius: '6px', 
            padding: '24px', 
            color: '#e2e8f0',
            border: '1px solid #334155'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#38bdf8', letterSpacing: '0.05em' }}>
              SCIENTIFIC FORMULATION // STAGE {current.step}
            </span>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
              PEER-REVIEWED SPEC
            </span>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Governing Equation / Rule
            </div>
            <div 
              style={{ 
                fontFamily: 'var(--font-mono)', 
                fontSize: '13px', 
                backgroundColor: '#1e293b', 
                padding: '12px 14px', 
                borderRadius: '4px', 
                color: '#f8fafc',
                border: '1px solid #475569',
                wordBreak: 'break-all'
              }}
            >
              {current.formulaOrRule}
            </div>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Verified Production Output
            </div>
            <div style={{ fontSize: '13px', color: '#cbd5e1' }}>
              {current.outputs}
            </div>
          </div>

          <div 
            style={{ 
              padding: '10px 14px', 
              backgroundColor: current.step === '09' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(2, 132, 199, 0.15)', 
              borderRadius: '4px', 
              borderLeft: `3px solid ${current.step === '09' ? '#ef4444' : '#38bdf8'}` 
            }}
          >
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px', fontFamily: 'var(--font-mono)' }}>
              CASE BENCHMARK (INCIDENT OS-042 / OS-037)
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: current.step === '09' ? '#fca5a5' : '#7dd3fc', fontFamily: 'var(--font-mono)' }}>
              {current.sampleMetric}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
