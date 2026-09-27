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
      tagline: 'Candidate Slick Geometry Identification',
      icon: <Radar size={18} />,
      description: 'Identifies candidate slick geometry and anomalous dark formations on ocean water surfaces using high-resolution Synthetic Aperture Radar (Sentinel-1, EOS-04) invariant to cloud cover.',
      technology: 'PyTorch SegFormer-B4 / U-Net (Architecture target; pre-vectorised in demonstration)',
      inputs: 'Raw GRDH SAR Amplitude Scenes (VV + VH Polarisation), 10m Resolution',
      outputs: 'Binary Slick Mask Polygon, GeoJSON, NRCS Backscatter Damping Map',
      formulaOrRule: 'Backscatter Damping: Δσ₀ = σ₀(Clean Ocean) - σ₀(Slick) > 4.5 dB',
      sampleMetric: 'Detection Contrast: 8.4 dB | Look-Alike Risk: Low (0.08)',
    },
    {
      step: '02',
      name: 'CHARACTERISE',
      tagline: 'Measurement, Weathering & Look-Alike Screening',
      icon: <Layers size={18} />,
      description: 'Measures geometry, surface area, and weathering state while screening for look-alikes such as natural biogenic sheens, low-wind calm water, and sediment plumes.',
      technology: 'Morphological Analysis, GDAL, Wind Wave Damping Thresholds',
      inputs: 'Detected polygon, wind velocity, sea surface temperature, bathymetry',
      outputs: 'Estimated slick age (hours), volumetric estimate (~420 m³), weathering state',
      formulaOrRule: 'Fay Viscous-Inertial Spreading Laws & Weathering Curves',
      sampleMetric: 'Area: 14.85 km² | Thickness: 28.3 µm | Estimated Age: 4.5–6.0 hrs',
    },
    {
      step: '03',
      name: 'HINDCAST',
      tagline: 'Reconstructing Likely Origin Region & Time',
      icon: <RotateCcw size={18} />,
      description: 'Reconstructs the likely origin region and release-time window by reversing ocean current and wind advection under analytical and stochastic drift dynamics.',
      technology: 'Production target: OpenDrift / NOAA GNOME; Demo: Lightweight analytical reverse advection',
      inputs: 'Slick polygon, ERA5 wind grid, CMEMS surface currents (U/V), wave Stokes drift',
      outputs: 'P50 / P80 / P95 modelled uncertainty envelopes and release-time window',
      formulaOrRule: 'dX_t = -(u_{curr} + α_{wind} · u_{wind} + u_{stokes})dt + √(2K_h)dW_t',
      sampleMetric: 'Release Window: 08:45–10:15 UTC (Centroid: 18.26°N, 70.92°E)',
    },
    {
      step: '04',
      name: 'FORECAST',
      tagline: 'Projecting Potential Dispersion & Shoreline Risk',
      icon: <TrendingUp size={18} />,
      description: 'Projects potential forward dispersion and expanding uncertainty envelopes over the next 24–72 hours to assist coastal protection and boom deployment planning.',
      technology: 'Production target: OpenOil Lagrangian dispersion; Demo: Forward trajectory simulation',
      inputs: 'Current slick position, forecasted meteorological winds & tidal streams',
      outputs: 'T+6h, T+12h, T+24h trajectory cones, sensitive area proximity assessments',
      formulaOrRule: 'Forward Advection-Diffusion Mass Balance with Evaporation & Emulsification',
      sampleMetric: 'T+24h Travel: 28.4 km @ 058° | Nearest Sanctuary CPA: 44.6 nm',
    },
    {
      step: '05',
      name: 'CORRELATE',
      tagline: 'Searching Historical Vessel Telemetry',
      icon: <Radio size={18} />,
      description: 'Searches historical vessel telemetry within the reconstructed origin spacetime bounding box to isolate candidate vessels transiting during the release window.',
      technology: 'DuckDB / PostGIS Spatiotemporal Query Engine (Synthetic demo fleet)',
      inputs: 'Modelled origin envelope (P95), release window [08:45, 10:15 UTC], AIS stream',
      outputs: 'Candidate vessel fleet, closest point of approach (CPA), speed profiles',
      formulaOrRule: 'Spatiotemporal Intersection: d_v(t) ∈ Polygon_{origin}(t) for t ∈ [T₀, T₁]',
      sampleMetric: '3 Filtered Candidates from 48 Vessels in Sector',
    },
    {
      step: '06',
      name: 'INVESTIGATE',
      tagline: 'Analysing Kinematics & Continuity',
      icon: <Search size={18} />,
      description: 'Analyses vessel kinematics, speed profile anomalies, course alterations, and flags AIS gaps or discrepancies against radar metallic targets.',
      technology: 'Kinematic Acceleration Filters & SAR Target Cross-Matching',
      inputs: 'Vessel broadcast records, reported speed over ground, SAR radar detections',
      outputs: 'Kinematic / AIS continuity anomalies, speed drop logs, track deviation alerts',
      formulaOrRule: 'Kinematic Plausibility: ||a_v(t)|| < a_{max}; AIS continuity checks flagged',
      sampleMetric: '1 Candidate Speed Drop: 14.2 → 8.4 kts (42 min duration)',
    },
    {
      step: '07',
      name: 'VERIFY',
      tagline: 'Candidate Counterfactual Comparison',
      icon: <CheckCircle2 size={18} />,
      description: 'Runs candidate counterfactual comparison: simulates hypothetical discharge from candidate tracks forward to test whether it reproduces the observed SAR slick footprint.',
      technology: 'Lagrangian Particle Tracking & Spatial IoU / Hausdorff Distance Evaluation',
      inputs: 'Candidate vessel trajectory, hypothetical discharge volume, metocean fields',
      outputs: 'Simulated slick footprint, spatial IoU, Hausdorff distance, shape similarity',
      formulaOrRule: 'IoU = Area(S_{observed} ∩ S_{simulated}) / Area(S_{observed} ∪ S_{simulated})',
      sampleMetric: 'Candidate A IoU: 84.2% | Hausdorff: 1.15 km | Shape Similarity: 91.4%',
    },
    {
      step: '08',
      name: 'ATTRIBUTE',
      tagline: 'Combining Evidence with Transparent Weighting',
      icon: <Award size={18} />,
      description: 'Combines multiple independent evidence channels into an auditable composite score using transparent operational weighting to rank candidate vessels.',
      technology: 'Multi-Channel Evidence Fusion & Operational Weighting Engine',
      inputs: 'Six evidence scores: Satellite (20%), Drift (25%), AIS (20%), Behaviour (10%), CF (20%), History (5%)',
      outputs: 'Ranked candidate list with Composite Evidence Scores; High/Moderate/Low tiering',
      formulaOrRule: 'Score = Σ (w_k · S_k) | Weights: Sat 0.20, Drift 0.25, AIS 0.20, Behav 0.10, CF 0.20, Hist 0.05',
      sampleMetric: 'Top-Ranked Candidate: MT AL-HIKMA — 89.9 / 100 (HIGH CORRELATION)',
    },
    {
      step: '09',
      name: 'ABSTAIN',
      tagline: 'Principled Abstention: Return INCONCLUSIVE When Weak',
      icon: <AlertOctagon size={18} />,
      description: 'Returns INCONCLUSIVE when evidence is insufficient, look-alike risk is high, or candidate separation is ambiguous, preventing unverified allegations.',
      technology: 'Evidentiary Sufficiency Governor & Abstention Logic',
      inputs: 'Look-alike risk index, telemetry completeness, counterfactual IoU margin',
      outputs: 'Formal INCONCLUSIVE verdict with itemised evidentiary gaps and field sampling advisory',
      formulaOrRule: 'If LookAlikeRisk > Cutoff OR TopScore < Threshold OR IoU < 0.70 => ABSTAIN',
      sampleMetric: 'Incident OS-037: INCONCLUSIVE (High Look-Alike Risk, Weak AIS)',
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
              ANALYTICAL PIPELINE
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
                Method & Tools
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
              Click any stage tab to inspect inputs, formulation & criteria
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
              ANALYTICAL FORMULATION // STAGE {current.step}
            </span>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
              ANALYTICAL METHOD
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
              DEMONSTRATION OUTPUT
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
