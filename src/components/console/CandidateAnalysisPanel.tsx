import React, { useState } from 'react';
import { Incident, CandidateVessel } from '../../types';
import { 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  ShieldAlert, 
  Compass, 
  Layers, 
  Sliders, 
  ArrowRight,
  Info,
  ExternalLink
} from 'lucide-react';

interface CandidateAnalysisPanelProps {
  incident: Incident;
  selectedCandidateId: string | null;
  onSelectCandidate: (candidateId: string) => void;
  onToggleCounterfactualOverlay: (active: boolean) => void;
  isCounterfactualOverlayActive: boolean;
}

export const CandidateAnalysisPanel: React.FC<CandidateAnalysisPanelProps> = ({
  incident,
  selectedCandidateId,
  onSelectCandidate,
  onToggleCounterfactualOverlay,
  isCounterfactualOverlayActive,
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [simulationComplete, setSimulationComplete] = useState(false);

  const selectedCandidate: CandidateVessel =
    incident.candidateVessels.find((c) => c.id === selectedCandidateId) ||
    incident.candidateVessels[0];

  const runCounterfactual = () => {
    setIsSimulating(true);
    setSimulationProgress(0);
    setSimulationComplete(false);
    onToggleCounterfactualOverlay(true);

    const interval = setInterval(() => {
      setSimulationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSimulating(false);
          setSimulationComplete(true);
          return 100;
        }
        return prev + 25;
      });
    }, 280);
  };

  return (
    <div 
      style={{ 
        height: '100%', 
        overflowY: 'auto', 
        backgroundColor: '#ffffff', 
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Panel Header */}
      <div 
        style={{ 
          padding: '16px 20px', 
          borderBottom: '1px solid var(--border)',
          backgroundColor: '#fafbfc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Candidate Attribution
            </span>
            <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
              DEMO DATA
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Composite Evidence Network (Operational Weighting)
          </div>
        </div>

        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          {incident.candidateVessels.length} Evaluated
        </div>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* 1. CANDIDATE SELECTION LIST */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '8px', textTransform: 'uppercase' }}>
            Ranked Candidate Fleet
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {incident.candidateVessels.map((vessel) => {
              const isSelected = vessel.id === selectedCandidate.id;
              const isHigh = vessel.correlationTier === 'HIGH CORRELATION';
              const isInconclusive = vessel.correlationTier === 'INCONCLUSIVE';

              return (
                <div
                  key={vessel.id}
                  onClick={() => onSelectCandidate(vessel.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '4px',
                    border: isSelected
                      ? '2px solid var(--accent-blue)'
                      : '1px solid var(--border)',
                    backgroundColor: isSelected ? 'var(--bg-subtle)' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        #{vessel.correlationRank} {vessel.name}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        ({vessel.flag})
                      </span>
                    </div>

                    <span
                      className={`badge ${
                        isInconclusive
                          ? 'badge-red'
                          : isHigh
                          ? 'badge-blue'
                          : 'badge-neutral'
                      }`}
                    >
                      {vessel.overallScore}%
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <span>{vessel.vesselType}</span>
                    <span 
                      style={{ 
                        fontWeight: 600, 
                        color: isInconclusive ? 'var(--alert-red)' : isHigh ? 'var(--accent-blue)' : 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px'
                      }}
                    >
                      {vessel.correlationTier}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Inconclusive Option Card / Case */}
            {incident.attributionStatus === 'INCONCLUSIVE' && (
              <div 
                style={{ 
                  padding: '12px 14px', 
                  borderRadius: '4px', 
                  border: '2px solid var(--alert-red)', 
                  backgroundColor: 'var(--alert-red-light)' 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <AlertTriangle size={16} color="var(--alert-red)" />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--alert-red)' }}>
                    OFFICIAL VERDICT: INCONCLUSIVE
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#7f1d1d', lineHeight: 1.4 }}>
                  Available satellite backscatter contrast & AIS continuity are insufficient for reliable legal attribution. Principled abstention enforced.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. SELECTED CANDIDATE DEEP-DIVE TELEMETRY */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              Vessel Telemetry & Origin CPA
            </span>
            <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
              MMSI: {selectedCandidate.mmsi}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', backgroundColor: 'var(--bg-subtle)', padding: '12px', borderRadius: '4px', border: '1px solid var(--border)', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CLOSEST APPROACH (CPA)</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {selectedCandidate.closestPointOfApproachNm} nm
              </div>
            </div>

            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CPA TIMESTAMP</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {selectedCandidate.cpaTimeUtc}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>SPEED AT ORIGIN</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: selectedCandidate.speedAnomaly ? '#d97706' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {selectedCandidate.speedAtCpaKnots} kts (Avg: {selectedCandidate.averageSpeedKnots})
              </div>
            </div>

            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>FLAG / REGISTRY</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {selectedCandidate.flag} (IMO {selectedCandidate.imo})
              </div>
            </div>
          </div>

          {selectedCandidate.speedAnomaly && (
            <div style={{ padding: '8px 10px', backgroundColor: 'var(--spill-amber-light)', borderRadius: '4px', border: '1px solid #fde68a', fontSize: '11px', color: '#92400e', marginBottom: '12px', lineHeight: 1.4 }}>
              <strong>Speed Anomaly Flag:</strong> {selectedCandidate.speedAnomaly}
            </div>
          )}
        </div>

        {/* 3. MULTI-DIMENSIONAL EVIDENCE BREAKDOWN (BARS) */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              Forensic Evidence Breakdown
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              OPERATIONAL SYNTHESIS
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'SATELLITE CONTRAST (20%)', val: selectedCandidate.scores.satellite, max: 100 },
              { label: 'DRIFT HINDCAST (25%)', val: selectedCandidate.scores.drift, max: 100 },
              { label: 'AIS SPACETIME (20%)', val: selectedCandidate.scores.ais, max: 100 },
              { label: 'BEHAVIOUR & SPEED (10%)', val: selectedCandidate.scores.behaviour, max: 100 },
              { label: 'COUNTERFACTUAL MATCH (20%)', val: selectedCandidate.scores.counterfactual, max: 100 },
              { label: 'HISTORICAL CONTEXT [NON-CAUSAL] (5%)', val: selectedCandidate.scores.history, max: 100 },
            ].map(({ label, val }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', marginBottom: '3px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  <span style={{ fontWeight: 700, color: val > 80 ? 'var(--accent-blue)' : val > 50 ? 'var(--spill-amber)' : 'var(--text-muted)' }}>
                    {val}%
                  </span>
                </div>
                <div style={{ height: '6px', backgroundColor: 'var(--bg-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${val}%`,
                      backgroundColor: val > 80 ? 'var(--accent-blue)' : val > 50 ? 'var(--spill-amber)' : 'var(--text-muted)',
                      borderRadius: '3px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            ))}

            <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: '6px' }}>
              <strong>Composite Evidence Score: {selectedCandidate.overallScore} / 100</strong>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Operational evidence weighting; not statistically calibrated against empirical ground-truth base rates. Historical Port State Control records provide contextual intelligence only and do not establish responsibility for this incident.
              </div>
            </div>
          </div>
        </div>

        {/* 4. COUNTERFACTUAL DISCHARGE SIMULATION MODULE */}
        <div 
          style={{ 
            borderTop: '1px solid var(--border)', 
            paddingTop: '16px',
            backgroundColor: '#fafbfc',
            margin: '0 -20px -20px -20px',
            padding: '20px',
            borderBottomLeftRadius: '6px',
            borderBottomRightRadius: '6px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-teal)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              Counterfactual Verification
            </span>
            <span className="badge badge-teal" style={{ fontSize: '10px' }}>
              IN SILICO DRIFT
            </span>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '14px' }}>
            Tests whether a hypothetical discharge by <strong>{selectedCandidate.name}</strong> at 09:22 UTC would drift into the observed SAR footprint.
          </p>

          <button
            onClick={runCounterfactual}
            disabled={isSimulating}
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '12px', fontWeight: 600 }}
          >
            {isSimulating ? (
              <span>Simulating Dispersion ({simulationProgress}%)...</span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Play size={14} /> Run Counterfactual Simulation
              </span>
            )}
          </button>

          {/* Results Box */}
          <div style={{ backgroundColor: '#0f172a', borderRadius: '4px', padding: '12px', color: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                COUNTERFACTUAL SHAPE SIMILARITY
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                {selectedCandidate.counterfactualResult.similarityPct}% Match (Demo)
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px', color: '#cbd5e1' }}>
              <div>Spatial IoU: <strong>{(selectedCandidate.counterfactualResult.iouMetric * 100).toFixed(1)}% (Demo)</strong></div>
              <div>Hausdorff Dist: <strong>{selectedCandidate.counterfactualResult.hausdorffDistanceKm} km (Demo)</strong></div>
            </div>

            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isCounterfactualOverlayActive}
                  onChange={(e) => onToggleCounterfactualOverlay(e.target.checked)}
                />
                Show Simulated Slick on Map
              </label>
            </div>
          </div>
        </div>

        {/* 5. HUMAN-IN-THE-LOOP INVESTIGATOR REVIEW */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              Human Investigator Review & Overrides
            </span>
            <span className="badge badge-blue" style={{ fontSize: '10px' }}>
              SECTION 33 GOVERNANCE
            </span>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '12px' }}>
            Analysts may confirm/dispute analytical evidence, log formal notes, and override ranking with mandatory justification.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Evidence Checklist */}
            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Evidence Verification Checklist
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked /> Confirm Satellite SAR slick boundary
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked /> Confirm AIS spacetime origin window overlap
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked={Boolean(selectedCandidate.speedAnomaly)} /> Confirm speed drop anomaly ({selectedCandidate.speedAtCpaKnots} kts)
              </label>
            </div>

            {/* Investigator Notes */}
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                OFFICER CASE OBSERVATIONS
              </div>
              <textarea
                rows={2}
                defaultValue={incident.investigatorNotes || ''}
                placeholder="Enter field notes, PSC inspection instructions, or environmental observations..."
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-strong)',
                  fontSize: '12px',
                  fontFamily: 'var(--font-sans)',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Rank Override with Mandatory Reason */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                MANUAL RANK OVERRIDE (REQUIRES JUSTIFICATION)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '8px' }}>
                <input
                  type="number"
                  min="1"
                  max="10"
                  defaultValue={selectedCandidate.correlationRank}
                  style={{
                    padding: '6px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-strong)',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    textAlign: 'center',
                  }}
                />
                <input
                  type="text"
                  placeholder="Mandatory reason for override..."
                  style={{
                    padding: '6px 10px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-strong)',
                    fontSize: '12px',
                    fontFamily: 'var(--font-sans)',
                  }}
                />
              </div>
            </div>

            <button
              onClick={() => alert('Investigator review and override recorded in immutable audit log.')}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', fontWeight: 600, marginTop: '4px' }}
            >
              Log Human Review into Audit Chain
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
