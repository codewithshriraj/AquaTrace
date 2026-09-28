import React from 'react';
import { Incident } from '../../types';
import { 
  Radar, 
  Box, 
  RotateCcw, 
  Ship, 
  ShieldCheck, 
  Compass, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ChevronRight 
} from 'lucide-react';

interface InvestigationPipelineProps {
  incident: Incident;
  activeStageId?: string;
  onSelectStage?: (stageId: string) => void;
}

export interface PipelineStage {
  id: string;
  number: string;
  title: string;
  icon: React.ReactNode;
  status: 'COMPLETED' | 'IN_REVIEW' | 'INCONCLUSIVE' | 'ACTIVE';
  statusLabel: string;
  summary: string;
  targetTab: string;
}

export const InvestigationPipeline: React.FC<InvestigationPipelineProps> = ({
  incident,
  activeStageId,
  onSelectStage,
}) => {
  const isInconclusive = incident.attributionStatus === 'INCONCLUSIVE';

  const stages: PipelineStage[] = [
    {
      id: 'detect',
      number: '01',
      title: 'DETECT',
      icon: <Radar size={15} />,
      status: 'COMPLETED',
      statusLabel: 'VERIFIED',
      summary: `${incident.satelliteScene.satellite.split(' ')[0]} SAR (${incident.slickProperties.confidencePct.toFixed(0)}% Conf)`,
      targetTab: 'satellite',
    },
    {
      id: 'characterise',
      number: '02',
      title: 'CHARACTERISE',
      icon: <Box size={15} />,
      status: 'COMPLETED',
      statusLabel: 'DELINEATED',
      summary: `${incident.slickProperties.areaKm2} km² • Age ${incident.slickProperties.estimatedAgeHours.split('(')[0].trim()}`,
      targetTab: 'satellite',
    },
    {
      id: 'hindcast',
      number: '03',
      title: 'HINDCAST',
      icon: <RotateCcw size={15} />,
      status: 'COMPLETED',
      statusLabel: 'RECONSTRUCTED',
      summary: `${incident.releaseWindow.durationHours}h Reverse Drift Window`,
      targetTab: 'origin-drift',
    },
    {
      id: 'ais',
      number: '04',
      title: 'AIS CORRELATION',
      icon: <Ship size={15} />,
      status: 'COMPLETED',
      statusLabel: 'CORRELATED',
      summary: `${incident.candidateVessels.length} Candidates Screened`,
      targetTab: 'vessels',
    },
    {
      id: 'attribution',
      number: '05',
      title: 'ATTRIBUTION',
      icon: <ShieldCheck size={15} />,
      status: isInconclusive ? 'INCONCLUSIVE' : 'IN_REVIEW',
      statusLabel: isInconclusive ? 'ABSTENTION' : 'RANKED',
      summary: isInconclusive ? 'Insufficient Evidence' : `${incident.candidateVessels[0]?.overallScore.toFixed(0)}% Composite Top`,
      targetTab: 'vessels',
    },
    {
      id: 'forecast',
      number: '06',
      title: 'FORECAST',
      icon: <Compass size={15} />,
      status: 'COMPLETED',
      statusLabel: 'PROJECTED',
      summary: `${incident.forecastEnvelope[0]?.time.split('(')[0].trim() || 'T+24h'} Envelope`,
      targetTab: 'origin-drift',
    },
  ];

  const getStatusBadgeStyle = (status: PipelineStage['status']) => {
    switch (status) {
      case 'COMPLETED':
        return {
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          color: '#34d399',
          border: '1px solid rgba(16, 185, 129, 0.3)',
        };
      case 'IN_REVIEW':
        return {
          backgroundColor: 'rgba(56, 189, 248, 0.12)',
          color: '#38bdf8',
          border: '1px solid rgba(56, 189, 248, 0.3)',
        };
      case 'INCONCLUSIVE':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          color: '#f87171',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        };
      default:
        return {
          backgroundColor: 'rgba(245, 158, 11, 0.12)',
          color: '#fbbf24',
          border: '1px solid rgba(245, 158, 11, 0.3)',
        };
    }
  };

  return (
    <div 
      className="investigation-pipeline-container"
      style={{
        backgroundColor: '#070c14',
        borderBottom: '1px solid #1e293b',
        padding: '3px 12px',
        display: 'flex',
        alignItems: 'center',
        overflowX: 'auto',
        gap: '6px',
        flexShrink: 0,
      }}
    >
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          paddingRight: '10px',
          borderRight: '1px solid #1e293b',
          flexShrink: 0,
        }}
      >
        <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#0284c7' }} />
        <span style={{ fontSize: '9.5px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          PIPELINE
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: 1, minWidth: '700px' }}>
        {stages.map((stage, idx) => {
          const isActive = activeStageId === stage.id || activeStageId === stage.targetTab;
          const badgeStyle = getStatusBadgeStyle(stage.status);

          return (
            <React.Fragment key={stage.id}>
              <button
                onClick={() => onSelectStage && onSelectStage(stage.targetTab)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '3px 8px',
                  borderRadius: '3px',
                  backgroundColor: isActive ? '#1e293b' : 'rgba(15, 23, 42, 0.5)',
                  border: isActive ? '1px solid #38bdf8' : '1px solid #1e293b',
                  color: '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  flex: 1,
                  minWidth: '110px',
                }}
                title={`Open stage: ${stage.title} (${stage.summary})`}
              >
                <div 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: isActive ? '#38bdf8' : '#64748b',
                    transform: 'scale(0.85)'
                  }}
                >
                  {stage.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                    <span style={{ fontSize: '9.5px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: isActive ? '#38bdf8' : '#cbd5e1' }}>
                      {stage.number} {stage.title}
                    </span>
                    <span 
                      style={{ 
                        fontSize: '8px', 
                        fontFamily: 'var(--font-mono)', 
                        padding: '0 3px', 
                        borderRadius: '2px', 
                        fontWeight: 700,
                        ...badgeStyle 
                      }}
                    >
                      {stage.statusLabel}
                    </span>
                  </div>
                  <div 
                    style={{ 
                      fontSize: '9px', 
                      color: '#94a3b8', 
                      fontFamily: 'var(--font-sans)', 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {stage.summary}
                  </div>
                </div>
              </button>

              {idx < stages.length - 1 && (
                <ChevronRight size={13} color="#475569" style={{ flexShrink: 0 }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
