import React from 'react';
import { Incident, AuditEntry } from '../../types';
import { X, ShieldCheck, Lock, Clock, Database, CheckCircle2 } from 'lucide-react';

interface AuditTrailDrawerProps {
  incident: Incident;
  isOpen: boolean;
  onClose: () => void;
}

export const AuditTrailDrawer: React.FC<AuditTrailDrawerProps> = ({ incident, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '460px',
        height: '100%',
        backgroundColor: '#ffffff',
        boxShadow: 'var(--shadow-xl)',
        zIndex: 90,
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid var(--border-strong)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="#38bdf8" />
          <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.03em' }}>
            IMMUTABLE AUDIT TRAIL
          </span>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Log list */}
      <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '6px' }}>
          Every ingestion, segmentation inference, drift hindcast, and AIS correlation is cryptographically logged with a SHA-256 state hash for chain-of-custody compliance.
        </div>

        {incident.auditTrail.map((entry, idx) => (
          <div
            key={entry.id}
            style={{
              padding: '12px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: '4px',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-blue)' }}>
                {entry.timestampUtc}
              </span>
              <span className="badge badge-green" style={{ fontSize: '9px', padding: '1px 5px' }}>
                {entry.status}
              </span>
            </div>

            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {entry.action}
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr', gap: '2px', marginBottom: '6px' }}>
              <div><strong>Model:</strong> {entry.modelVersion}</div>
              <div><strong>Source:</strong> {entry.dataSource}</div>
              <div><strong>Worker:</strong> {entry.userOrSystem}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
              <Lock size={10} color="var(--accent-blue)" />
              <span>{entry.sha256Hash.slice(0, 32)}...</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', backgroundColor: '#fafbfc', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
        Cryptographic ledger synced with PostGIS temporal store
      </div>
    </div>
  );
};
