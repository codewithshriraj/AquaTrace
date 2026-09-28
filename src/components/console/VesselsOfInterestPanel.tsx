import React, { useState, useEffect, useRef } from 'react';
import { Incident, CandidateVessel } from '../../types';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import {
  runForwardSimulation,
  SimulationResult,
  SimulationParams
} from '../../services/counterfactualSimulator';
import {
  Ship,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Compass,
  Layers,
  ArrowRight,
  Info,
  Clock,
  Radio,
  FileText,
  Sliders,
  Download,
  Cpu,
  FileCheck,
  Eye,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Zap,
  Flame
} from 'lucide-react';

interface VesselsOfInterestPanelProps {
  incident: Incident;
  selectedCandidateId: string | null;
  onSelectCandidate: (candidateId: string) => void;
  onToggleCounterfactualOverlay: (active: boolean) => void;
  isCounterfactualOverlayActive: boolean;
  activeSimulationResult?: SimulationResult | null;
  onSimulationResultChange?: (result: SimulationResult | null) => void;
  activeSimulationFrameIndex?: number;
  onSimulationFrameIndexChange?: (frameIndex: number) => void;
  showSimulationParticles?: boolean;
  onToggleSimulationParticles?: (show: boolean) => void;
}

export const VesselsOfInterestPanel: React.FC<VesselsOfInterestPanelProps> = ({
  incident,
  selectedCandidateId,
  onSelectCandidate,
  onToggleCounterfactualOverlay,
  isCounterfactualOverlayActive,
  activeSimulationResult,
  onSimulationResultChange,
  activeSimulationFrameIndex,
  onSimulationFrameIndexChange,
  showSimulationParticles = true,
  onToggleSimulationParticles,
}) => {
  // Tabs
  const [activeTab, setActiveTab] = useState<'ranking' | 'evidence' | 'funnel' | 'counterfactual'>('counterfactual');

  // Simulation execution state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(100);
  const [simulationStepText, setSimulationStepText] = useState('Simulation idle · Ready to execute forward advection run');
  const [isPlayingAnimation, setIsPlayingAnimation] = useState(false);
  const playbackTimerRef = useRef<any>(null);

  // Local state fallbacks if not bound from parent
  const [localSimResult, setLocalSimResult] = useState<SimulationResult | null>(null);
  const [localFrameIndex, setLocalFrameIndex] = useState<number>(5);

  const currentSimResult = activeSimulationResult !== undefined ? activeSimulationResult : localSimResult;
  const currentFrameIndex = activeSimulationFrameIndex !== undefined ? activeSimulationFrameIndex : localFrameIndex;

  const updateSimResult = (res: SimulationResult | null) => {
    setLocalSimResult(res);
    if (onSimulationResultChange) onSimulationResultChange(res);
  };

  const updateFrameIndex = (idx: number) => {
    setLocalFrameIndex(idx);
    if (onSimulationFrameIndexChange) onSimulationFrameIndexChange(idx);
  };

  // Customizable simulation physics parameters
  const [params, setParams] = useState<SimulationParams>({
    particleCount: 1000,
    windDriftFactor: 0.033,
    diffusionCoeff: 2.5,
    releaseType: 'instantaneous',
    timeStepCount: 6,
  });

  const [isParamsOpen, setIsParamsOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);

  const selectedCandidate: CandidateVessel =
    incident.candidateVessels.find((c) => c.id === selectedCandidateId) ||
    incident.candidateVessels[0];

  const isInconclusive = incident.attributionStatus === 'INCONCLUSIVE';

  // Initialize or re-run baseline simulation whenever candidate changes
  useEffect(() => {
    const res = runForwardSimulation(selectedCandidate, incident, params);
    updateSimResult(res);
    updateFrameIndex(res.frames.length - 1);
  }, [selectedCandidate.id, incident.id]);

  // Clean up playback timer on unmount
  useEffect(() => {
    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, []);

  // Run full dynamic in-silico simulation with live 4-phase progress
  const executeSimulation = (customP?: Partial<SimulationParams>) => {
    const activeP = { ...params, ...customP };
    setIsSimulating(true);
    setSimulationProgress(0);
    setIsPlayingAnimation(false);
    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);

    onToggleCounterfactualOverlay(true);
    updateFrameIndex(0);

    const stages = [
      { pct: 15, text: `Seeding ${activeP.particleCount.toLocaleString()} Lagrangian particles at CPA [${selectedCandidate.track[1]?.lat || incident.releaseWindow.centroidLat}°N, ${selectedCandidate.track[1]?.lng || incident.releaseWindow.centroidLng}°E]...` },
      { pct: 40, text: `Integrating surface currents (0.45 kts @ 140°) & wind leeway (${(activeP.windDriftFactor * 100).toFixed(1)}%)...` },
      { pct: 65, text: `Calculating stochastic Brownian turbulent diffusion tensor (D = ${activeP.diffusionCoeff} m²/s)...` },
      { pct: 85, text: `Advancing forward advection trajectory over ${selectedCandidate.counterfactualResult.driftDurationHours}h drift horizon...` },
      { pct: 100, text: `Rasterizing geometric polygon boundary & computing Spatial IoU against SAR slick...` },
    ];

    let currentStage = 0;
    const interval = setInterval(() => {
      if (currentStage < stages.length) {
        const stage = stages[currentStage];
        setSimulationProgress(stage.pct);
        setSimulationStepText(stage.text);

        // Progressively advance the visible frame on the map
        const frameIdx = Math.min(5, Math.floor((currentStage / (stages.length - 1)) * 5));
        updateFrameIndex(frameIdx);

        currentStage++;
      } else {
        clearInterval(interval);
        // Complete simulation
        const result = runForwardSimulation(selectedCandidate, incident, activeP);
        updateSimResult(result);
        updateFrameIndex(result.frames.length - 1);
        setIsSimulating(false);
        setSimulationStepText(`Simulation Complete · Computed Spatial IoU: ${(result.spatialIoU * 100).toFixed(1)}% | Hausdorff: ${result.hausdorffDistanceKm.toFixed(2)} km`);
      }
    }, 320);
  };

  // Play / Pause animation playback
  const togglePlayAnimation = () => {
    if (isPlayingAnimation) {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      setIsPlayingAnimation(false);
    } else {
      setIsPlayingAnimation(true);
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);

      playbackTimerRef.current = setInterval(() => {
        setLocalFrameIndex((prev) => {
          const next = (prev + 1) % (currentSimResult?.frames.length || 6);
          if (onSimulationFrameIndexChange) onSimulationFrameIndexChange(next);
          return next;
        });
      }, 750);
    }
  };

  // Download cryptographic certificate as JSON
  const downloadCertificateJson = () => {
    if (!currentSimResult) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentSimResult, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `AquaTrace-SimCert-${currentSimResult.runHash}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Evidence category badge
  const getEvidenceCategory = (vessel: CandidateVessel) => {
    if (vessel.overallScore >= 80) return { label: 'Strong Evidence', class: 'badge-blue' };
    if (vessel.overallScore >= 50) return { label: 'Moderate Evidence', class: 'badge-amber' };
    if (vessel.overallScore >= 30) return { label: 'Weak Evidence', class: 'badge-neutral' };
    return { label: 'Insufficient Evidence', class: 'badge-red' };
  };

  // Funnel counts
  const funnelStages = [
    { name: 'All AIS Vessels in Sector', count: incident.id === 'OS-037' ? 42 : 84, description: 'Raw broadcast telemetry in regional EEZ' },
    { name: 'Spatial Bounding Filter', count: incident.id === 'OS-037' ? 18 : 36, description: 'Transited within 30 nm corridor of slick' },
    { name: 'Temporal Window Filter', count: incident.id === 'OS-037' ? 7 : 14, description: 'Present during reconstructed release window' },
    { name: 'Trajectory Compatibility', count: incident.id === 'OS-037' ? 4 : 5, description: 'Heading & speed aligned with drift vectors' },
    { name: 'Behavioural Analysis', count: incident.id === 'OS-037' ? 3 : 3, description: 'CPA within P95 contour / speed anomaly check' },
    { name: 'Vessels of Interest', count: incident.candidateVessels.length, description: 'Ranked candidates undergoing formal forensic breakdown' },
  ];

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#ffffff', height: '100%', overflowY: 'auto' }}>

      {/* 1. SECTION HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <ProvenanceBadge
              classification={incident.isSyntheticDemo ? 'DEMO_SIMULATION' : 'MODEL_DERIVED'}
              sourceText="GFW / Coastal AIS (72h NRT) + Multi-Criteria Filter"
              compact
            />
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              AIS TELEMETRY & ATTRIBUTION
            </span>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Vessels of Interest & Explainable Evidence
          </h3>
        </div>

        {/* View Switcher Tabs */}
        <div style={{ display: 'flex', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', padding: '3px', border: '1px solid var(--border)', flexWrap: 'wrap', gap: '2px' }}>
          <button
            onClick={() => setActiveTab('counterfactual')}
            style={{
              padding: '5px 12px',
              fontSize: '11px',
              fontWeight: 700,
              border: 'none',
              borderRadius: '3px',
              backgroundColor: activeTab === 'counterfactual' ? '#0f172a' : 'transparent',
              color: activeTab === 'counterfactual' ? '#38bdf8' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Cpu size={12} /> In-Silico Simulation
          </button>
          <button
            onClick={() => setActiveTab('ranking')}
            style={{
              padding: '5px 12px',
              fontSize: '11px',
              fontWeight: 600,
              border: 'none',
              borderRadius: '3px',
              backgroundColor: activeTab === 'ranking' ? '#0f172a' : 'transparent',
              color: activeTab === 'ranking' ? '#ffffff' : 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            Ranked Table
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            style={{
              padding: '5px 12px',
              fontSize: '11px',
              fontWeight: 600,
              border: 'none',
              borderRadius: '3px',
              backgroundColor: activeTab === 'evidence' ? '#0f172a' : 'transparent',
              color: activeTab === 'evidence' ? '#ffffff' : 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            Evidence Breakdown
          </button>
          <button
            onClick={() => setActiveTab('funnel')}
            style={{
              padding: '5px 12px',
              fontSize: '11px',
              fontWeight: 600,
              border: 'none',
              borderRadius: '3px',
              backgroundColor: activeTab === 'funnel' ? '#0f172a' : 'transparent',
              color: activeTab === 'funnel' ? '#ffffff' : 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            Filtering Funnel
          </button>
        </div>
      </div>

      {/* INCONCLUSIVE CASE MANDATORY VERDICT BANNER */}
      {isInconclusive && (
        <div style={{ padding: '12px 16px', borderRadius: '4px', border: '1px solid #fecaca', backgroundColor: 'rgba(254, 242, 242, 0.8)', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <AlertTriangle size={18} color="var(--alert-red)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--alert-red)', fontFamily: 'var(--font-mono)' }}>
              OFFICIAL VERDICT: INCONCLUSIVE (PRINCIPLED ABSTENTION ENFORCED)
            </div>
            <div style={{ fontSize: '11px', color: '#7f1d1d', lineHeight: 1.4, marginTop: '2px' }}>
              Available satellite backscatter contrast (3.2 dB damping) and AIS receiver coverage gaps (145 min gap in Mandapam sector) are insufficient for legally substantiated vessel attribution. Vessels below are listed as <strong>Screened Candidates</strong> under probabilistic correlation, not confirmed responsible parties.
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. TAB CONTENT: IN-SILICO COUNTERFACTUAL FORWARD SIMULATION */}
      {/* ======================================================== */}
      {activeTab === 'counterfactual' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* CANDIDATE VESSEL SELECTOR PILLS */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '8px', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Select Candidate Vessel for Forward Dispersion Run:</span>
              <span style={{ fontSize: '10px', color: 'var(--accent-blue)' }}>{incident.candidateVessels.length} SCREENED CANDIDATES</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: incident.candidateVessels.length > 2 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: '8px' }}>
              {incident.candidateVessels.map((cand) => {
                const isSelected = cand.id === selectedCandidate.id;
                return (
                  <button
                    key={cand.id}
                    onClick={() => onSelectCandidate(cand.id)}
                    style={{
                      padding: '10px',
                      borderRadius: '6px',
                      border: isSelected ? '2px solid #0284c7' : '1px solid var(--border)',
                      backgroundColor: isSelected ? 'rgba(2, 132, 199, 0.08)' : '#fafbfc',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: isSelected ? '#0284c7' : 'var(--text-primary)' }}>
                        #{cand.correlationRank} {cand.name}
                      </span>
                      <span className={`badge ${isSelected ? 'badge-blue' : 'badge-neutral'}`} style={{ fontSize: '9px', padding: '1px 5px' }}>
                        {cand.flag}
                      </span>
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      CPA: {cand.closestPointOfApproachNm} nm · {cand.speedAtCpaKnots} kts
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MAIN SIMULATION CARD */}
          <div style={{ backgroundColor: '#fafbfc', border: '1px solid var(--border)', borderRadius: '6px', padding: '16px', position: 'relative' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-teal)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                  Counterfactual Dispersion Verification
                </span>
                <span className="badge badge-teal" style={{ fontSize: '10px' }}>
                  IN SILICO FORWARD RUN
                </span>
              </div>

              {/* Toggle Physics Parameters */}
              <button
                onClick={() => setIsParamsOpen(!isParamsOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'none',
                  border: '1px solid var(--border)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '10.5px',
                  color: isParamsOpen ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  backgroundColor: '#ffffff'
                }}
              >
                <Sliders size={12} /> {isParamsOpen ? 'Hide Parameters' : 'Adjust Physics'}
              </button>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '14px' }}>
              Simulates forward advection of <strong>{params.particleCount.toLocaleString()}</strong> synthetic Lagrangian particles released at candidate vessel <strong>{selectedCandidate.name}</strong>'s CPA coordinates ({selectedCandidate.cpaTimeUtc}) to test geometric overlap with the observed SAR footprint.
            </p>

            {/* EXPANDABLE PHYSICS PARAMETER TUNER */}
            {isParamsOpen && (
              <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '12px', marginBottom: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sliders size={13} color="var(--accent-blue)" /> Physics & Metocean Drift Configuration
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '11px' }}>
                  {/* Particle Count */}
                  <div>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>Particle Count (N):</div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[500, 1000, 2500].map((num) => (
                        <button
                          key={num}
                          onClick={() => setParams({ ...params, particleCount: num })}
                          style={{
                            flex: 1,
                            padding: '3px 0',
                            border: '1px solid #cbd5e1',
                            borderRadius: '3px',
                            fontSize: '10.5px',
                            fontWeight: params.particleCount === num ? 700 : 500,
                            backgroundColor: params.particleCount === num ? '#0284c7' : '#ffffff',
                            color: params.particleCount === num ? '#ffffff' : 'var(--text-primary)',
                            cursor: 'pointer'
                          }}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Wind Leeway Alpha */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                      <span>Wind Drift Leeway (α):</span>
                      <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{(params.windDriftFactor * 100).toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.020"
                      max="0.050"
                      step="0.002"
                      value={params.windDriftFactor}
                      onChange={(e) => setParams({ ...params, windDriftFactor: parseFloat(e.target.value) })}
                      style={{ width: '100%', cursor: 'pointer' }}
                    />
                  </div>

                  {/* Diffusivity D */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                      <span>Turbulent Diffusivity (D):</span>
                      <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{params.diffusionCoeff.toFixed(1)} m²/s</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="5.0"
                      step="0.5"
                      value={params.diffusionCoeff}
                      onChange={(e) => setParams({ ...params, diffusionCoeff: parseFloat(e.target.value) })}
                      style={{ width: '100%', cursor: 'pointer' }}
                    />
                  </div>

                  {/* Release Profile */}
                  <div>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>Discharge Pattern:</div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => setParams({ ...params, releaseType: 'instantaneous' })}
                        style={{
                          flex: 1,
                          padding: '3px 4px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '3px',
                          fontSize: '10px',
                          backgroundColor: params.releaseType === 'instantaneous' ? '#0284c7' : '#ffffff',
                          color: params.releaseType === 'instantaneous' ? '#ffffff' : 'var(--text-primary)',
                          cursor: 'pointer'
                        }}
                      >
                        Instantaneous
                      </button>
                      <button
                        onClick={() => setParams({ ...params, releaseType: 'continuous' })}
                        style={{
                          flex: 1,
                          padding: '3px 4px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '3px',
                          fontSize: '10px',
                          backgroundColor: params.releaseType === 'continuous' ? '#0284c7' : '#ffffff',
                          color: params.releaseType === 'continuous' ? '#ffffff' : 'var(--text-primary)',
                          cursor: 'pointer'
                        }}
                      >
                        Bilge Track (30m)
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => executeSimulation()}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                  >
                    <RotateCcw size={11} /> Apply Parameters & Re-simulate
                  </button>
                </div>
              </div>
            )}

            {/* ACTION EXECUTE BUTTON */}
            <button
              onClick={() => executeSimulation()}
              disabled={isSimulating}
              className="btn btn-primary"
              style={{
                width: '100%',
                marginBottom: '12px',
                fontWeight: 700,
                fontSize: '13px',
                padding: '10px 16px',
                background: isSimulating ? '#0284c7' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.35)',
              }}
            >
              {isSimulating ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <RotateCcw size={15} className="spin" /> Simulating Lagrangian Dispersion ({simulationProgress}%)...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Play size={15} /> Run Counterfactual Forward Simulation
                </span>
              )}
            </button>

            {/* LIVE SIMULATION PROGRESS STATUS BAR */}
            {isSimulating && (
              <div style={{ marginBottom: '14px', backgroundColor: '#0f172a', padding: '10px', borderRadius: '4px', border: '1px solid #1e293b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono)', marginBottom: '5px' }}>
                  <span style={{ color: '#38bdf8' }}>LAGRANGIAN STEPPING IN PROGRESS</span>
                  <span>{simulationProgress}%</span>
                </div>
                <div style={{ height: '4px', backgroundColor: '#1e293b', borderRadius: '2px', overflow: 'hidden', marginBottom: '6px' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${simulationProgress}%`,
                      backgroundColor: '#38bdf8',
                      transition: 'width 0.25s ease'
                    }}
                  />
                </div>
                <div style={{ fontSize: '10.5px', color: '#cbd5e1', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  ⚡ {simulationStepText}
                </div>
              </div>
            )}

            {/* RESULTS BOX */}
            {currentSimResult && (
              <div style={{ backgroundColor: '#0f172a', borderRadius: '6px', padding: '14px', color: '#f8fafc', border: '1px solid #1e293b', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}>

                {/* Header Metrics Banner */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '9px', color: '#94a3b8', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                      COUNTERFACTUAL SHAPE SIMILARITY
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: currentSimResult.spatialIoU >= 0.7 ? '#34d399' : currentSimResult.spatialIoU >= 0.2 ? '#f59e0b' : '#ef4444', fontFamily: 'var(--font-mono)' }}>
                      {currentSimResult.shapeSimilarityPct}% Match
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '9px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                      SPATIAL INTERSECTION IOU
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: currentSimResult.spatialIoU >= 0.7 ? '#34d399' : currentSimResult.spatialIoU >= 0.2 ? '#f59e0b' : '#ef4444', fontFamily: 'var(--font-mono)' }}>
                      {(currentSimResult.spatialIoU * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* 4-Column Physics & Geometric Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '11px', color: '#cbd5e1', marginBottom: '12px' }}>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '10px', display: 'block' }}>Hausdorff Distance:</span>
                    <strong style={{ fontSize: '13px', color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>{currentSimResult.hausdorffDistanceKm.toFixed(2)} km</strong>
                  </div>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '10px', display: 'block' }}>Centroid Offset:</span>
                    <strong style={{ fontSize: '13px', color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>{currentSimResult.centroidOffsetKm.toFixed(2)} km</strong>
                  </div>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '10px', display: 'block' }}>Net Advection Velocity:</span>
                    <strong style={{ fontSize: '12px', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>{currentSimResult.advectionVelocityKnots} kts @ {currentSimResult.advectionDirectionDeg}°</strong>
                  </div>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '10px', display: 'block' }}>Drift Horizon:</span>
                    <strong style={{ fontSize: '12px', color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>{currentSimResult.driftDurationHours}h ({currentSimResult.totalDisplacementKm} km)</strong>
                  </div>
                </div>

                {/* VERDICT CALLOUT BANNER */}
                <div style={{
                  backgroundColor: currentSimResult.verdict === 'HIGH_CONCORDANCE' ? 'rgba(52, 211, 153, 0.12)' : currentSimResult.verdict === 'MARGINAL_INCONCLUSIVE' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  border: `1px solid ${currentSimResult.verdict === 'HIGH_CONCORDANCE' ? '#34d399' : currentSimResult.verdict === 'MARGINAL_INCONCLUSIVE' ? '#f59e0b' : '#ef4444'}`,
                  borderRadius: '4px',
                  padding: '8px 10px',
                  marginBottom: '12px'
                }}>
                  <div style={{ fontSize: '10.5px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: currentSimResult.verdict === 'HIGH_CONCORDANCE' ? '#34d399' : currentSimResult.verdict === 'MARGINAL_INCONCLUSIVE' ? '#f59e0b' : '#ef4444', marginBottom: '2px' }}>
                    {currentSimResult.verdictTitle}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#e2e8f0', lineHeight: 1.35 }}>
                    {currentSimResult.verdictDescription}
                  </div>
                </div>

                {/* INTERACTIVE TIME SCRUBBER & ANIMATION CONTROLS */}
                <div style={{ backgroundColor: '#020617', padding: '10px', borderRadius: '4px', marginBottom: '12px', border: '1px solid #1e293b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={togglePlayAnimation}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '3px',
                          border: 'none',
                          backgroundColor: isPlayingAnimation ? '#ef4444' : '#0284c7',
                          color: '#ffffff',
                          fontSize: '10.5px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {isPlayingAnimation ? <><Pause size={11} /> Pause</> : <><Play size={11} /> Play Drift</>}
                      </button>

                      <button
                        onClick={() => updateFrameIndex(0)}
                        style={{
                          background: 'none',
                          border: '1px solid #334155',
                          borderRadius: '3px',
                          color: '#94a3b8',
                          padding: '3px 6px',
                          fontSize: '10px',
                          cursor: 'pointer'
                        }}
                        title="Reset to CPA Release"
                      >
                        T=0h
                      </button>

                      <button
                        onClick={() => updateFrameIndex(currentSimResult.frames.length - 1)}
                        style={{
                          background: 'none',
                          border: '1px solid #334155',
                          borderRadius: '3px',
                          color: '#94a3b8',
                          padding: '3px 6px',
                          fontSize: '10px',
                          cursor: 'pointer'
                        }}
                        title="Jump to SAR Frame"
                      >
                        T=Final
                      </button>
                    </div>

                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#38bdf8', fontWeight: 700 }}>
                      Step: {currentSimResult.frames[currentFrameIndex]?.timestampUtc || 'T + 8.5h'}
                    </span>
                  </div>

                  {/* Scrubber slider */}
                  <input
                    type="range"
                    min="0"
                    max={currentSimResult.frames.length - 1}
                    value={currentFrameIndex}
                    onChange={(e) => {
                      updateFrameIndex(parseInt(e.target.value, 10));
                      setIsPlayingAnimation(false);
                      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
                    }}
                    style={{ width: '100%', cursor: 'pointer', accentColor: '#38bdf8' }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748b', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    <span>T+0h (CPA: {selectedCandidate.cpaTimeUtc})</span>
                    <span>T+{currentSimResult.driftDurationHours}h (SAR Detection)</span>
                  </div>
                </div>

                {/* OVERLAY MAP TOGGLES */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '4px', borderTop: '1px solid #1e293b' }}>
                  <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isCounterfactualOverlayActive}
                      onChange={(e) => onToggleCounterfactualOverlay(e.target.checked)}
                    />
                    Show Simulated Plume Polygon on Map
                  </label>

                  <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={showSimulationParticles}
                      onChange={(e) => {
                        if (onToggleSimulationParticles) onToggleSimulationParticles(e.target.checked);
                      }}
                    />
                    Show Synthetic Particle Swarm ({currentSimResult.frames[currentFrameIndex]?.particles.length || 200} particles rendered)
                  </label>
                </div>

                {/* FORENSIC CERTIFICATE ACTION */}
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setIsCertificateModalOpen(true)}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      backgroundColor: 'rgba(56, 189, 248, 0.1)',
                      border: '1px solid #0284c7',
                      borderRadius: '4px',
                      color: '#38bdf8',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px'
                    }}
                  >
                    <FileCheck size={13} /> View Legal Verification Certificate
                  </button>

                  <button
                    onClick={downloadCertificateJson}
                    style={{
                      padding: '6px 10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid #334155',
                      borderRadius: '4px',
                      color: '#cbd5e1',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Export Run Certificate JSON"
                  >
                    <Download size={13} /> JSON
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. TAB CONTENT: RANKED TABLE (SECTION 16) */}
      {/* ======================================================== */}
      {activeTab === 'ranking' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div style={{ border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '11px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    <th style={{ padding: '8px 10px' }}>RANK / VESSEL</th>
                    <th style={{ padding: '8px 10px' }}>MMSI</th>
                    <th style={{ padding: '8px 10px' }}>TYPE</th>
                    <th style={{ padding: '8px 10px' }}>CPA DIST</th>
                    <th style={{ padding: '8px 10px' }}>TIME OVERLAP</th>
                    <th style={{ padding: '8px 10px' }}>SPEED / BEHAVIOUR</th>
                    <th style={{ padding: '8px 10px' }}>AIS STATUS</th>
                    <th style={{ padding: '8px 10px' }}>EVIDENCE CATEGORY</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>SIMULATE</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>SCORE</th>
                  </tr>
                </thead>
                <tbody>
                  {incident.candidateVessels.map((vessel) => {
                    const isSelected = vessel.id === selectedCandidate.id;
                    const cat = getEvidenceCategory(vessel);

                    return (
                      <tr
                        key={vessel.id}
                        onClick={() => onSelectCandidate(vessel.id)}
                        style={{
                          backgroundColor: isSelected ? 'var(--bg-subtle)' : '#ffffff',
                          borderBottom: '1px solid var(--border)',
                          cursor: 'pointer',
                          fontWeight: isSelected ? 600 : 400,
                          transition: 'background-color 0.1s ease',
                        }}
                      >
                        <td style={{ padding: '10px', borderLeft: isSelected ? '3px solid var(--accent-blue)' : '3px solid transparent' }}>
                          <strong style={{ color: 'var(--text-primary)' }}>#{vessel.correlationRank} {vessel.name}</strong>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{vessel.flag}</div>
                        </td>
                        <td style={{ padding: '10px', fontFamily: 'var(--font-mono)' }}>{vessel.mmsi}</td>
                        <td style={{ padding: '10px' }}>{vessel.vesselType}</td>
                        <td style={{ padding: '10px', fontFamily: 'var(--font-mono)' }}>{vessel.closestPointOfApproachNm} nm</td>
                        <td style={{ padding: '10px', fontFamily: 'var(--font-mono)' }}>{vessel.cpaTimeUtc}</td>
                        <td style={{ padding: '10px' }}>
                          <div>{vessel.speedAtCpaKnots} kts</div>
                          <span style={{ fontSize: '9px', color: vessel.speedAnomaly && !vessel.speedAnomaly.includes('No') ? '#d97706' : 'var(--text-muted)' }}>
                            {vessel.speedAnomaly}
                          </span>
                        </td>
                        <td style={{ padding: '10px' }}>
                          {vessel.aisGapDetected ? (
                            <span style={{ color: '#d97706', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Radio size={11} /> {vessel.aisGapDurationMinutes}m Gap
                            </span>
                          ) : (
                            <span style={{ color: 'var(--success-green)', fontSize: '10px' }}>Continuous</span>
                          )}
                        </td>
                        <td style={{ padding: '10px' }}>
                          <span className={`badge ${cat.class}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                            {cat.label}
                          </span>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectCandidate(vessel.id);
                              setActiveTab('counterfactual');
                              executeSimulation();
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '10px', padding: '2px 6px' }}
                            title="Run forward simulation for this vessel"
                          >
                            <Play size={10} /> Test
                          </button>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                          <span style={{ color: vessel.overallScore > 75 ? 'var(--accent-blue)' : vessel.overallScore > 40 ? '#d97706' : 'var(--text-muted)' }}>
                            {vessel.overallScore}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Highlight of Selected Vessel */}
          <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: '6px', border: '1px solid var(--border)', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Ship size={16} color="var(--accent-blue)" />
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Selected Vessel of Interest: {selectedCandidate.name} ({selectedCandidate.flag})
                </span>
              </div>
              <button
                onClick={() => setActiveTab('counterfactual')}
                className="btn btn-primary btn-sm"
                style={{ fontSize: '11px', padding: '3px 8px' }}
              >
                Launch Forward Simulation <ArrowRight size={12} />
              </button>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              CPA: <strong>{selectedCandidate.closestPointOfApproachNm} nm</strong> at <strong>{selectedCandidate.cpaTimeUtc}</strong> • Destination: <strong>{selectedCandidate.destination}</strong> • Route: <strong>{selectedCandidate.route}</strong>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. TAB CONTENT: EXPLAINABLE EVIDENCE SCORE (SECTION 17) */}
      {/* ======================================================== */}
      {activeTab === 'evidence' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Candidate Card Header */}
          <div style={{ backgroundColor: '#fafbfc', border: '1px solid var(--border)', borderRadius: '6px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    #{selectedCandidate.correlationRank} {selectedCandidate.name}
                  </h4>
                  <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                    IMO: {selectedCandidate.imo}
                  </span>
                  <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                    MMSI: {selectedCandidate.mmsi}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {selectedCandidate.vesselType} • {selectedCandidate.lengthM}m Length • DWT {selectedCandidate.deadweightTonnage.toLocaleString()} MT
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: selectedCandidate.overallScore > 75 ? 'var(--accent-blue)' : '#d97706' }}>
                  {selectedCandidate.overallScore}%
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  COMPOSITE EVIDENCE
                </div>
              </div>
            </div>

            {/* Explainable Progress Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              {[
                { label: 'SPATIAL PROXIMITY (CPA DISTANCE)', val: selectedCandidate.scores.drift },
                { label: 'TRAJECTORY ALIGNMENT (HEADING MATCH)', val: selectedCandidate.scores.satellite },
                { label: 'TIME-WINDOW OVERLAP (RELEASE WINDOW)', val: selectedCandidate.scores.ais },
                { label: 'BEHAVIOURAL INDICATORS (SPEED DROP)', val: selectedCandidate.scores.behaviour },
                { label: 'IN-SILICO FORWARD SIMULATION (IOU MATCH)', val: Math.round(selectedCandidate.counterfactualResult.iouMetric * 100) },
                { label: 'AIS CONTINUITY (TRANSPONDER INTEGRITY)', val: selectedCandidate.aisGapDetected ? 38 : 92 },
              ].map(({ label, val }) => (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    <strong style={{ color: val > 75 ? 'var(--accent-blue)' : val > 45 ? '#d97706' : 'var(--text-muted)' }}>
                      {val} / 100
                    </strong>
                  </div>
                  <div style={{ height: '5px', backgroundColor: 'var(--bg-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${val}%`,
                        backgroundColor: val > 75 ? 'var(--accent-blue)' : val > 45 ? '#d97706' : '#94a3b8',
                        borderRadius: '3px',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setActiveTab('counterfactual');
                  executeSimulation();
                }}
                className="btn btn-primary btn-sm"
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                <Cpu size={12} /> Test Forward Dispersion in Simulation Lab
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. TAB CONTENT: FILTERING FUNNEL */}
      {/* ======================================================== */}
      {activeTab === 'funnel' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              AIS Correlation Funnel Architecture
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Demonstrates systematic step-down narrowing from raw marine transponder telemetry to auditable candidate screening and explainable evidence attribution.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {funnelStages.map((stage, idx) => (
              <div
                key={stage.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border)',
                  borderLeft: `4px solid ${idx === funnelStages.length - 1 ? 'var(--accent-blue)' : '#94a3b8'}`,
                  borderRadius: '4px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    0{idx + 1}
                  </span>
                  <div>
                    <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{stage.name}</strong>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{stage.description}</div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                    {stage.count}
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    VESSELS REMAINING
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. VERIFICATION CERTIFICATE MODAL */}
      {/* ======================================================== */}
      {isCertificateModalOpen && currentSimResult && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '8px',
            maxWidth: '620px',
            width: '100%',
            color: '#f8fafc',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '12px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="#38bdf8" />
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                    Auditable Forensic Verification Certificate
                  </h4>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
                    AQUATRACE IN-SILICO LAGRANGIAN RUN HASH: {currentSimResult.runHash}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsCertificateModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '16px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ backgroundColor: '#020617', padding: '10px', borderRadius: '4px', border: '1px solid #1e293b' }}>
                <div style={{ color: '#38bdf8', fontWeight: 700, fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                  1. SIMULATION TARGET & METOCEAN FORCING
                </div>
                <div>Candidate: <strong>{currentSimResult.candidateName}</strong> ({currentSimResult.candidateType})</div>
                <div>CPA Coordinates: <strong>{currentSimResult.cpaCoordinates[0].toFixed(4)}°N, {currentSimResult.cpaCoordinates[1].toFixed(4)}°E</strong></div>
                <div>Release Window: <strong>{currentSimResult.cpaTimeUtc}</strong> • SAR Acquisition: <strong>{currentSimResult.sarAcquisitionTimeUtc}</strong></div>
                <div>Net Drift Displacement: <strong>{currentSimResult.totalDisplacementKm} km over {currentSimResult.driftDurationHours} hours</strong></div>
                <div>Forcing Vectors: Current <strong>0.45 kts @ 140°</strong> + Wind <strong>4.1 kts @ 115° (Leeway {(currentSimResult.params.windDriftFactor * 100).toFixed(1)}%)</strong></div>
              </div>

              <div style={{ backgroundColor: '#020617', padding: '10px', borderRadius: '4px', border: '1px solid #1e293b' }}>
                <div style={{ color: '#38bdf8', fontWeight: 700, fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                  2. GEOMETRIC INTERSECTION METRICS
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '4px' }}>
                  <div>Spatial IoU: <strong>{(currentSimResult.spatialIoU * 100).toFixed(1)}%</strong></div>
                  <div>Hausdorff Dist: <strong>{currentSimResult.hausdorffDistanceKm.toFixed(2)} km</strong></div>
                  <div>Shape Match: <strong>{currentSimResult.shapeSimilarityPct}%</strong></div>
                </div>
              </div>

              <div style={{
                backgroundColor: currentSimResult.verdict === 'HIGH_CONCORDANCE' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                border: `1px solid ${currentSimResult.verdict === 'HIGH_CONCORDANCE' ? '#34d399' : '#f59e0b'}`,
                padding: '10px',
                borderRadius: '4px'
              }}>
                <div style={{ fontWeight: 800, color: currentSimResult.verdict === 'HIGH_CONCORDANCE' ? '#34d399' : '#f59e0b', fontFamily: 'var(--font-mono)' }}>
                  3. LEGAL SUBSTANTIATION OPINION
                </div>
                <div style={{ marginTop: '2px' }}>
                  {currentSimResult.verdictDescription}
                </div>
              </div>

              <div style={{ fontSize: '9.5px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                Generated at {currentSimResult.runTimestamp} by AquaTrace v2.4 Forensic Suite (Smart India Hackathon 2026 PS-26143 / NTRO).
              </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={downloadCertificateJson}
                className="btn btn-primary btn-sm"
                style={{ fontSize: '11px', padding: '6px 14px' }}
              >
                <Download size={13} /> Download Certificate (JSON)
              </button>
              <button
                onClick={() => setIsCertificateModalOpen(false)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '11px', padding: '6px 14px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
