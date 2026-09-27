import React from 'react';
import { Bell, AlertTriangle, ShieldCheck, Radio, CheckCircle } from 'lucide-react';

interface AlertFeedProps {
  onSelectIncident?: (id: string) => void;
}

export const AlertFeed: React.FC<AlertFeedProps> = ({ onSelectIncident }) => {
  const alerts = [
    {
      id: 'alt-1',
      time: '14:37 UTC',
      type: 'ANOMALY',
      title: 'AIS Speed Anomaly Detected',
      incidentId: 'OS-042',
      detail: 'MT AL-HIKMA decelerated to 8.4 kts inside 50% origin contour',
      severity: 'warning',
    },
    {
      id: 'alt-2',
      time: '14:35 UTC',
      type: 'ORIGIN',
      title: 'Origin PDF Updated (OpenDrift)',
      incidentId: 'OS-042',
      detail: 'Release window narrowed to 08:45–10:15 UTC (±22 min variance)',
      severity: 'info',
    },
    {
      id: 'alt-3',
      time: '14:32 UTC',
      type: 'DETECTION',
      title: 'New Slick Detected (Sentinel-1C)',
      incidentId: 'OS-042',
      detail: '14.85 km² dark slick segmented in Arabian Sea corridor (Confidence 93.6%)',
      severity: 'critical',
    },
    {
      id: 'alt-4',
      time: '06:17 UTC',
      type: 'ABSTENTION',
      title: 'Principled Inconclusive Verdict',
      incidentId: 'OS-037',
      detail: 'Gulf of Mannar case flagged INCONCLUSIVE due to natural biogenic sheen risk',
      severity: 'neutral',
    },
  ];

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '20px', backgroundColor: 'var(--bg-body)' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-blue">SURVEILLANCE STREAM</span>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                DEMONSTRATION SURVEILLANCE FEED
              </span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              Incident Alert Stream
            </h3>
          </div>
          <span className="badge badge-green">FEED ACTIVE</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {alerts.map((alt) => (
            <div
              key={alt.id}
              className="gis-panel"
              style={{
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                cursor: onSelectIncident ? 'pointer' : 'default',
              }}
              onClick={() => onSelectIncident && onSelectIncident(alt.incidentId)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div 
                  style={{ 
                    marginTop: '2px', 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: alt.severity === 'critical' ? '#ef4444' : alt.severity === 'warning' ? '#f59e0b' : '#0284c7' 
                  }} 
                />

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {alt.title}
                    </span>
                    <span className="badge badge-neutral" style={{ fontSize: '9px', padding: '1px 5px' }}>
                      {alt.incidentId}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {alt.detail}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {alt.time}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
