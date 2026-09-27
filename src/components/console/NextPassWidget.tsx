import React, { useState, useEffect } from 'react';
import { Satellite, Clock, Radio } from 'lucide-react';

export const NextPassWidget: React.FC = () => {
  const [secondsRemaining, setSecondsRemaining] = useState(13320); // 03h 42m

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 14400));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  const formatted = `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;

  return (
    <div 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        backgroundColor: '#f1f5f9', 
        padding: '4px 10px', 
        borderRadius: '4px',
        border: '1px solid var(--border)',
        fontSize: '11px',
        fontFamily: 'var(--font-mono)'
      }}
      title="Estimated next Sentinel-1 / EOS-04 constellation observation pass"
    >
      <Satellite size={13} color="var(--accent-blue)" />
      <span style={{ color: 'var(--text-muted)' }}>NEXT PASS:</span>
      <strong style={{ color: 'var(--text-primary)' }}>{formatted}</strong>
      <span style={{ color: 'var(--accent-blue)', fontSize: '10px' }}>(Sentinel-1C Pass 128)</span>
    </div>
  );
};
