import React, { useState, useEffect } from 'react';
import { Incident } from '../../types';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  Clock, 
  TrendingUp, 
  ShieldCheck 
} from 'lucide-react';

interface ReplayTimelineProps {
  incident: Incident;
  currentTimeIndex: number;
  onTimeChange: (index: number) => void;
}

export const ReplayTimeline: React.FC<ReplayTimelineProps> = ({
  incident,
  currentTimeIndex,
  onTimeChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Key forensic events along the timeline
  const milestones = [
    { label: 'Estimated Release Window (Apex)', time: '08:45 UTC', detail: 'Vessel MT Al-Hikma transited 50% origin apex; decelerated to 8.4 kts', confidence: 55 },
    { label: 'Mid-Transit Spreading', time: '10:30 UTC', detail: 'Viscous-inertial oil spreading under 16 kts offshore winds', confidence: 62 },
    { label: 'Surface Advection & Drift', time: '12:00 UTC', detail: 'Northeastward displacement driven by CMEMS surface currents (0.92 kts)', confidence: 71 },
    { label: 'Sentinel-1C Acquisition', time: '14:32 UTC', detail: 'C-SAR IW scene downlinked; 14.85 km² dark slick segmented by SegFormer', confidence: 84 },
    { label: 'Hindcast & Spacetime Box', time: '14:33 UTC', detail: 'OpenDrift ensemble reverse drift converged on 18.26°N, 70.92°E', confidence: 89 },
    { label: 'Counterfactual In-Silico Match', time: '14:34 UTC', detail: 'Candidate A release simulated; 84.2% spatial IoU match (91.4% shape similarity)', confidence: 90 },
    { label: 'Forward Dispersion Forecast', time: 'T+24h', detail: 'Advection forecast towards Angria Bank with 50/80/95% risk envelopes', confidence: 91 },
  ];

  const current = milestones[currentTimeIndex] || milestones[3];

  useEffect(() => {
    let timer: number;
    if (isPlaying) {
      timer = window.setInterval(() => {
        onTimeChange((currentTimeIndex + 1) % milestones.length);
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentTimeIndex]);

  return (
    <div 
      style={{ 
        backgroundColor: '#ffffff', 
        borderTop: '1px solid var(--border)', 
        padding: '12px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        boxShadow: '0 -2px 6px rgba(0,0,0,0.02)'
      }}
    >
      {/* Upper Timeline Row: Playback Controls + Active Milestone Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        
        {/* Playback Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => onTimeChange(Math.max(0, currentTimeIndex - 1))}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 8px' }}
            title="Step Back"
          >
            <SkipBack size={13} />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`btn btn-sm ${isPlaying ? 'btn-amber' : 'btn-primary'}`}
            style={{ padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              {isPlaying ? 'PAUSE' : 'REPLAY'}
            </span>
          </button>

          <button
            onClick={() => onTimeChange(Math.min(milestones.length - 1, currentTimeIndex + 1))}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 8px' }}
            title="Step Forward"
          >
            <SkipForward size={13} />
          </button>

          <button
            onClick={() => { setIsPlaying(false); onTimeChange(0); }}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 8px' }}
            title="Reset to Release Apex"
          >
            <RotateCcw size={13} />
          </button>

          <div style={{ marginLeft: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
            <Clock size={13} color="var(--accent-blue)" />
            <strong style={{ color: 'var(--text-primary)' }}>{current.time}</strong>
            <span>•</span>
            <span style={{ color: 'var(--text-muted)' }}>STEP {currentTimeIndex + 1} OF {milestones.length}</span>
          </div>
        </div>

        {/* Current Active Milestone Summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {current.label}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              {current.detail}
            </div>
          </div>

          <div 
            style={{ 
              padding: '4px 10px', 
              backgroundColor: 'var(--accent-blue-light)', 
              borderRadius: '4px',
              border: '1px solid #bae6fd',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '9px', color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              EVIDENTIARY CONFIDENCE
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>
              {current.confidence}%
            </div>
          </div>
        </div>
      </div>

      {/* Scrubbable Timeline Track */}
      <div style={{ position: 'relative', marginTop: '4px' }}>
        {/* Progress Bar background */}
        <div style={{ height: '4px', backgroundColor: 'var(--border-strong)', borderRadius: '2px', position: 'relative' }}>
          <div 
            style={{ 
              height: '100%', 
              backgroundColor: 'var(--accent-blue)', 
              width: `${(currentTimeIndex / (milestones.length - 1)) * 100}%`,
              borderRadius: '2px',
              transition: 'width 0.2s ease'
            }}
          />
        </div>

        {/* Milestones Dots */}
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', top: '-11px' }}>
          {milestones.map((m, idx) => {
            const isPassed = idx <= currentTimeIndex;
            const isSelected = idx === currentTimeIndex;
            return (
              <div 
                key={m.time}
                onClick={() => onTimeChange(idx)}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <div 
                  style={{ 
                    width: isSelected ? '18px' : '14px', 
                    height: isSelected ? '18px' : '14px', 
                    borderRadius: '50%', 
                    backgroundColor: isSelected ? '#0284c7' : isPassed ? '#38bdf8' : '#e2e8f0',
                    border: isSelected ? '3px solid #ffffff' : '2px solid #ffffff',
                    boxShadow: isSelected ? '0 0 0 2px #0284c7' : 'var(--shadow-sm)',
                    transition: 'all 0.15s ease'
                  }}
                />
                <span 
                  style={{ 
                    fontSize: '10px', 
                    fontFamily: 'var(--font-mono)', 
                    color: isSelected ? 'var(--accent-blue)' : 'var(--text-muted)',
                    fontWeight: isSelected ? 700 : 500,
                    marginTop: '4px'
                  }}
                >
                  {m.time}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
