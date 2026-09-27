import React, { useState } from 'react';
import { Incident } from '../../types';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  Clock, 
  TrendingUp, 
  Compass, 
  Wind, 
  Waves,
  ShieldCheck 
} from 'lucide-react';

interface ForensicReplayViewProps {
  incident: Incident;
}

export const ForensicReplayView: React.FC<ForensicReplayViewProps> = ({ incident }) => {
  const [activeStep, setActiveStep] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps = [
    { timeOffset: 'T - 12h', timeUtc: '02:32 UTC', event: 'Initial Background Metocean Forcing', candA: 35, candB: 30, candC: 28, note: 'Offshore southwesterly winds established at 14 kts' },
    { timeOffset: 'T - 9h', timeUtc: '05:32 UTC', event: 'Vessel Approach Towards Fairway', candA: 42, candB: 45, candC: 32, note: 'MT Al-Hikma and Pacific Glory enter Arabian Sea sector' },
    { timeOffset: 'T - 6h', timeUtc: '08:45 UTC', event: 'Estimated Discharge Window (Apex)', candA: 68, candB: 58, candC: 25, note: 'MT Al-Hikma decelerates to 8.4 kts inside 50% origin contour' },
    { timeOffset: 'T - 3h', timeUtc: '11:32 UTC', event: 'Surface Spreading & Emulsification', candA: 78, candB: 62, candC: 24, note: 'Viscous spreading laws model expansion to 14.85 km²' },
    { timeOffset: 'Detection', timeUtc: '14:32 UTC', event: 'Sentinel-1C SAR Scene Downlink', candA: 86, candB: 65, candC: 26, note: 'C-SAR IW scene captures slick with 6.2 dB backscatter damping' },
    { timeOffset: 'T + 3h', timeUtc: '17:32 UTC', event: 'Ensemble Hindcast & Counterfactual', candA: 89.9, candB: 66.9, candC: 31.5, note: 'Lagrangian in-silico match reaches 91.4% spatial shape similarity' },
    { timeOffset: 'T + 6h', timeUtc: '20:32 UTC', event: 'Forward Dispersion Risk Assessment', candA: 89.9, candB: 66.9, candC: 31.5, note: 'Trajectory cone projects eastward travel toward Angria Bank' },
    { timeOffset: 'T + 12h', timeUtc: '28 SEP 02:32 UTC', event: 'Final Evidentiary Synthesis', candA: 89.9, candB: 66.9, candC: 31.5, note: 'Audit chain locked with SHA-256 state hash for PSC action' },
  ];

  const current = steps[activeStep];

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '24px', backgroundColor: 'var(--bg-body)' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-blue">TIME-SERIES INVESTIGATION</span>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                SPATIO-TEMPORAL REPLAY
              </span>
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              Forensic Replay & Evolution of Attribution Confidence
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-neutral mono">{incident.id}</span>
            <span className="badge badge-blue">REPLAY READY</span>
          </div>
        </div>

        {/* Playback Control Bar */}
        <div 
          className="gis-panel"
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
              className="btn btn-secondary btn-sm"
            >
              <SkipBack size={14} />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`btn btn-sm ${isPlaying ? 'btn-amber' : 'btn-primary'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>

            <button
              onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
              className="btn btn-secondary btn-sm"
            >
              <SkipForward size={14} />
            </button>

            <button
              onClick={() => { setIsPlaying(false); setActiveStep(0); }}
              className="btn btn-secondary btn-sm"
            >
              <RotateCcw size={14} />
            </button>

            <div style={{ marginLeft: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
              <Clock size={14} color="var(--accent-blue)" />
              <strong>{current.timeOffset}</strong> ({current.timeUtc})
            </div>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            <strong>{current.event}</strong>
          </div>
        </div>

        {/* Confidence Evolution Graph Card */}
        <div className="gis-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <span className="badge badge-teal" style={{ marginBottom: '4px' }}>
                COMPOSITE EVIDENCE SCORE PROGRESSION OVER TIME
              </span>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Candidate Attribution Trajectory Curve
              </h4>
            </div>

            <div style={{ display: 'flex', gap: '16px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              <span style={{ color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                ■ MT AL-HIKMA (Candidate A)
              </span>
              <span style={{ color: 'var(--spill-amber)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                ■ PACIFIC GLORY (Candidate B)
              </span>
              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                ■ NORDIC RUNNER (Candidate C)
              </span>
            </div>
          </div>

          {/* Graphical Representation of Confidence Curves */}
          <div style={{ height: '200px', width: '100%', position: 'relative', borderBottom: '1px solid var(--border-strong)', borderLeft: '1px solid var(--border-strong)', padding: '10px 0' }}>
            <svg width="100%" height="100%" viewBox="0 0 800 180" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="45" x2="800" y2="45" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="90" x2="800" y2="90" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="135" x2="800" y2="135" stroke="#f1f5f9" strokeWidth="1" />

              {/* Curve Candidate A (Blue) */}
              <polyline
                points="0,120 114,105 228,60 342,40 456,25 570,16 684,16 800,16"
                fill="none"
                stroke="#0284c7"
                strokeWidth="3"
              />

              {/* Curve Candidate B (Amber) */}
              <polyline
                points="0,130 114,100 228,75 342,68 456,64 570,64 684,64 800,64"
                fill="none"
                stroke="#d97706"
                strokeWidth="2.5"
                strokeDasharray="4 4"
              />

              {/* Curve Candidate C (Gray) */}
              <polyline
                points="0,135 114,125 228,140 342,142 456,138 570,138 684,138 800,138"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
              />

              {/* Active Step Indicator Line */}
              {(() => {
                const xPos = (activeStep / (steps.length - 1)) * 800;
                return (
                  <line
                    x1={xPos}
                    y1="0"
                    x2={xPos}
                    y2="180"
                    stroke="#dc2626"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                  />
                );
              })()}
            </svg>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '8px' }}>
            <span>T-12h (02:32)</span>
            <span>T-6h (Release Apex)</span>
            <span>Detection (14:32)</span>
            <span>T+6h (Forecast)</span>
            <span>T+12h (Lock)</span>
          </div>

          {/* Step Detail Explanation */}
          <div style={{ marginTop: '16px', padding: '12px 16px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '13px' }}>
            <strong>Analytical Observation at {current.timeOffset} ({current.timeUtc}):</strong> {current.note}
          </div>
        </div>

      </div>
    </div>
  );
};
