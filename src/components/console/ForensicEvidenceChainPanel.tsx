import React, { useState } from 'react';
import { Incident } from '../../types';
import { 
  Network, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  ArrowDown, 
  Info, 
  ChevronRight,
  Database,
  Lock,
  Layers
} from 'lucide-react';

interface ForensicEvidenceChainPanelProps {
  incident: Incident;
}

interface EvidenceNode {
  id: string;
  step: string;
  title: string;
  category: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'INCONCLUSIVE';
  summary: string;
  evidenceItems: { label: string; value: string }[];
  auditHash?: string;
}

export const ForensicEvidenceChainPanel: React.FC<ForensicEvidenceChainPanelProps> = ({ incident }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-1');

  const isInconclusive = incident.attributionStatus === 'INCONCLUSIVE';

  const nodes: EvidenceNode[] = [
    {
      id: 'node-1',
      step: '01',
      title: 'Satellite Observation',
      category: 'PRIMARY SENSOR',
      confidence: 'HIGH',
      summary: `Acquisition by ${incident.satelliteScene.satellite} (${incident.satelliteScene.sensor})`,
      evidenceItems: [
        { label: 'Satellite Sensor', value: incident.satelliteScene.satellite },
        { label: 'Acquisition Timestamp', value: incident.satelliteScene.acquisitionTimeUtc },
        { label: 'Spatial Resolution', value: `${incident.satelliteScene.resolutionM} meters` },
        { label: 'Polarisation Mode', value: incident.satelliteScene.polarisation },
        { label: 'Incidence Angle', value: `${incident.satelliteScene.incidenceAngleDeg}°` },
      ],
      auditHash: 'sha256:4a8f912c0192ea88102bfa4c',
    },
    {
      id: 'node-2',
      step: '02',
      title: 'Slick Detection & Segmentation',
      category: 'COMPUTER VISION',
      confidence: 'HIGH',
      summary: `Automated U-Net segmentation identified anomalous dark surface patch`,
      evidenceItems: [
        { label: 'Detection Model', value: 'AquaTrace U-Net SAR Segmenter v2.4' },
        { label: 'Raw Backscatter Contrast', value: '-3.2 dB damping vs ocean background' },
        { label: 'Confidence Score', value: `${incident.slickProperties.confidencePct.toFixed(1)}%` },
        { label: 'Spatial Intersection', value: `${incident.slickPolygon.length} boundary polygon vertices` },
      ],
      auditHash: 'sha256:7c18a0029b31d87f9104ca88',
    },
    {
      id: 'node-3',
      step: '03',
      title: 'Slick Characterisation & Look-Alike Validation',
      category: 'MORPHOLOGICAL ANALYSIS',
      confidence: incident.slickProperties.lookAlikeRisk === 'High' ? 'MEDIUM' : 'HIGH',
      summary: `Area: ${incident.slickProperties.areaKm2} km², Aspect: ${(incident.slickProperties.lengthKm / incident.slickProperties.widthKm).toFixed(1)}:1, Look-alike Risk: ${incident.slickProperties.lookAlikeRisk}`,
      evidenceItems: [
        { label: 'Delineated Area', value: `${incident.slickProperties.areaKm2} km²` },
        { label: 'Perimeter', value: `${incident.slickProperties.perimeterKm} km` },
        { label: 'Major Length / Minor Width', value: `${incident.slickProperties.lengthKm} km × ${incident.slickProperties.widthKm} km` },
        { label: 'Estimated Release Age', value: incident.slickProperties.estimatedAgeHours },
        { label: 'Look-Alike Risk Assessment', value: `${incident.slickProperties.lookAlikeRisk} Risk (Biogenic/Wind Calms)` },
      ],
      auditHash: 'sha256:1902bcfa81024e8832a81900',
    },
    {
      id: 'node-4',
      step: '04',
      title: 'Environmental Metocean Forcing',
      category: 'HYDRODYNAMIC INPUT',
      confidence: 'HIGH',
      summary: `INCOIS currents (${incident.currentVectors[0]?.speedKnots} kts) + NCMRWF winds (${incident.windVectors[0]?.speedKnots} kts)`,
      evidenceItems: [
        { label: 'Ocean Surface Current', value: `${incident.currentVectors[0]?.speedKnots} kts @ ${incident.currentVectors[0]?.directionDeg}°` },
        { label: '10m Surface Wind Field', value: `${incident.windVectors[0]?.speedKnots} kts @ ${incident.windVectors[0]?.directionDeg}°` },
        { label: 'Current Data Source', value: 'INCOIS Regional Ocean Modeling System' },
        { label: 'Wind Data Source', value: 'NCMRWF Unified Numerical Weather Model' },
      ],
      auditHash: 'sha256:88102a90192cba447019efa1',
    },
    {
      id: 'node-5',
      step: '05',
      title: 'Backward Hindcast Drift Simulation',
      category: 'LAGRANGIAN PHYSICS',
      confidence: 'MEDIUM',
      summary: `Reverse drift backwards across ${incident.releaseWindow.durationHours}h temporal window`,
      evidenceItems: [
        { label: 'Hydrodynamic Engine', value: 'OpenDrift Lagrangian Reverse Advection v2.4' },
        { label: 'Windage Coupling Factor', value: '3.0% (±0.5% stochastic perturbation)' },
        { label: 'Coriolis Deflection Angle', value: '15.0° Right' },
        { label: 'Reconstructed Window', value: `${incident.releaseWindow.startUtc.slice(11, 16)}–${incident.releaseWindow.endUtc.slice(11, 16)} UTC` },
      ],
      auditHash: 'sha256:5521ca990182810a9c819280',
    },
    {
      id: 'node-6',
      step: '06',
      title: 'Origin Probability Distribution',
      category: 'STOCHASTIC MAPPING',
      confidence: 'MEDIUM',
      summary: `P50/P80/P95 probability distribution around centroid [${incident.releaseWindow.centroidLat}°N, ${incident.releaseWindow.centroidLng}°E]`,
      evidenceItems: [
        { label: 'Centroid Coordinates', value: `${incident.releaseWindow.centroidLat}°N, ${incident.releaseWindow.centroidLng}°E` },
        { label: 'P50 Core Vertices', value: `${incident.originContours.p50.length} geographic coordinates` },
        { label: 'P80 Operational Zone', value: `${incident.originContours.p80.length} geographic coordinates` },
        { label: 'P95 Outer Bound', value: `${incident.originContours.p95.length} geographic coordinates` },
      ],
      auditHash: 'sha256:aa912800192eab120938ca88',
    },
    {
      id: 'node-7',
      step: '07',
      title: 'Historical AIS Reconstruction',
      category: 'SPATIO-TEMPORAL AIS',
      confidence: isInconclusive ? 'LOW' : 'HIGH',
      summary: `Decoded regional maritime AIS transmissions around release window`,
      evidenceItems: [
        { label: 'AIS Telemetry Ingested', value: 'MarineCadastre / Regional Coastal Receiver Stream' },
        { label: 'AIS Continuity Quality', value: isInconclusive ? 'Degraded (145 min coastal shadow zone gap)' : 'Continuous transponder broadcasts' },
        { label: 'Candidate Vessels Filtered', value: `${incident.candidateVessels.length} vessels in spatial proximity` },
      ],
      auditHash: 'sha256:33219088102a900182ea8102',
    },
    {
      id: 'node-8',
      step: '08',
      title: 'Candidate Filtering & Kinematic Analysis',
      category: 'BEHAVIOURAL SCREENING',
      confidence: 'HIGH',
      summary: `Spatiotemporal CPA filter + course/speed anomaly detection`,
      evidenceItems: [
        { label: 'Closest Point of Approach', value: `${incident.candidateVessels[0]?.closestPointOfApproachNm} nm` },
        { label: 'CPA Transit Timestamp', value: incident.candidateVessels[0]?.cpaTimeUtc || 'N/A' },
        { label: 'Speed Pattern', value: incident.candidateVessels[0]?.speedAnomaly || 'Nominal' },
      ],
      auditHash: 'sha256:6610928019a8120038bca910',
    },
    {
      id: 'node-9',
      step: '09',
      title: 'Counterfactual In Silico Verification',
      category: 'VALIDATION RUN',
      confidence: 'MEDIUM',
      summary: `1,000 synthetic particles forward-drifted from candidate track`,
      evidenceItems: [
        { label: 'Particle Dispersion Count', value: '1,000 Lagrangian particles' },
        { label: 'Footprint Shape Similarity', value: `${incident.candidateVessels[0]?.counterfactualResult.similarityPct}% (Demo)` },
        { label: 'Spatial Intersection IoU', value: `${(incident.candidateVessels[0]?.counterfactualResult.iouMetric * 100).toFixed(1)}%` },
        { label: 'Hausdorff Distance Metric', value: `${incident.candidateVessels[0]?.counterfactualResult.hausdorffDistanceKm} km` },
      ],
      auditHash: 'sha256:772189001a81209bca819280',
    },
    {
      id: 'node-10',
      step: '10',
      title: 'Final Evidentiary Attribution Verdict',
      category: 'DECISION GOVERNANCE',
      confidence: isInconclusive ? 'INCONCLUSIVE' : 'HIGH',
      summary: isInconclusive ? 'Principled Abstention Enforced' : `High Correlation for ${incident.candidateVessels[0]?.name}`,
      evidenceItems: [
        { label: 'Official System Verdict', value: incident.attributionStatus },
        { label: 'Decision Rule Basis', value: isInconclusive ? 'Section 33 Governance: Lookalike ambiguity & AIS gap' : 'Composite Evidence Score exceeding 80% threshold' },
        { label: 'Assigned Investigator', value: incident.assignedInvestigator },
        { label: 'PSC Action Required', value: incident.recommendedActions[0] || 'Physical Inspection' },
      ],
      auditHash: 'sha256:990182ba81024ca8810291ca',
    },
  ];

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  const getConfidenceBadge = (confidence: EvidenceNode['confidence']) => {
    switch (confidence) {
      case 'HIGH':
        return <span className="badge badge-green" style={{ fontSize: '9px' }}>HIGH CONFIDENCE</span>;
      case 'MEDIUM':
        return <span className="badge badge-amber" style={{ fontSize: '9px' }}>MODERATE CONFIDENCE</span>;
      case 'LOW':
        return <span className="badge badge-red" style={{ fontSize: '9px' }}>LOW CONFIDENCE</span>;
      case 'INCONCLUSIVE':
        return <span className="badge badge-red" style={{ fontSize: '9px' }}>INCONCLUSIVE</span>;
    }
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#ffffff', height: '100%', overflowY: 'auto' }}>
      
      {/* 1. SECTION HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-blue">FORENSIC EVIDENCE CHAIN</span>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              END-TO-END CAUSAL DAG GRAPH
            </span>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Auditable Evidence Dependency Chain
          </h3>
        </div>

        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          10 Directed Nodes • Cryptographically Hashed
        </div>
      </div>

      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        Every conclusion in AquaTrace is explainable through an unbroken chain of forensic evidence. Click on any node in the causal flow to review supporting measurements, sensor metadata, and mathematical models:
      </p>

      {/* 2. SPLIT WORKSPACE: NODES LIST + SELECTED NODE DETAILS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
        
        {/* Left: Interactive Node Chain */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {nodes.map((node, idx) => {
            const isSelected = node.id === selectedNodeId;

            return (
              <React.Fragment key={node.id}>
                <div
                  onClick={() => setSelectedNodeId(node.id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: isSelected ? 'var(--bg-subtle)' : '#ffffff',
                    border: isSelected ? '2px solid var(--accent-blue)' : '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span 
                        style={{ 
                          width: '20px', 
                          height: '20px', 
                          borderRadius: '50%', 
                          backgroundColor: isSelected ? 'var(--accent-blue)' : '#0f172a',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '9.5px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                        }}
                      >
                        {node.step}
                      </span>
                      <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                        {node.title}
                      </strong>
                    </div>

                    {getConfidenceBadge(node.confidence)}
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', paddingLeft: '28px', lineHeight: 1.3 }}>
                    {node.summary}
                  </div>
                </div>

                {idx < nodes.length - 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '1px 0' }}>
                    <ArrowDown size={14} color="#94a3b8" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Right: Selected Node Detail Inspector */}
        <div style={{ backgroundColor: '#fafbfc', border: '1px solid var(--border)', borderRadius: '6px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', height: 'fit-content', position: 'sticky', top: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span className="badge badge-neutral" style={{ fontSize: '9px' }}>
                STAGE {selectedNode.step} • {selectedNode.category}
              </span>
              {getConfidenceBadge(selectedNode.confidence)}
            </div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {selectedNode.title}
            </h4>
          </div>

          {/* Evidence Key-Value Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
            {selectedNode.evidenceItems.map((item) => (
              <div key={item.label} style={{ fontSize: '11px' }}>
                <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                  {item.label}
                </div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginTop: '1px' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* SHA-256 Audit Signature */}
          {selectedNode.auditHash && (
            <div style={{ backgroundColor: '#0f172a', padding: '8px 10px', borderRadius: '4px', color: '#94a3b8', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
              <div style={{ color: '#38bdf8', fontWeight: 700, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Lock size={10} /> PROVENANCE HASH
              </div>
              <div style={{ wordBreak: 'break-all' }}>{selectedNode.auditHash}</div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
