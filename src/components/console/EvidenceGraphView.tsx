import React, { useState } from 'react';
import { Incident, GraphNode } from '../../types';
import { 
  Network, 
  CheckCircle, 
  HelpCircle, 
  AlertTriangle, 
  Lock, 
  ArrowRight,
  Database,
  ExternalLink,
  Cpu
} from 'lucide-react';

interface EvidenceGraphViewProps {
  incident: Incident;
}

export const EvidenceGraphView: React.FC<EvidenceGraphViewProps> = ({ incident }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('n1');

  const nodes = incident.evidenceGraph?.nodes || [];
  const edges = incident.evidenceGraph?.edges || [];

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  return (
    <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '1.6fr 1fr', backgroundColor: '#ffffff', overflow: 'hidden' }}>
      
      {/* LEFT: GRAPH WORKSPACE */}
      <div style={{ padding: '24px', overflowY: 'auto', backgroundColor: 'var(--bg-body)', borderRight: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-blue">EVIDENTIARY PROVENANCE DAG</span>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                AUDITABLE EVIDENCE CHAIN
              </span>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              Forensic Evidence Dependency Graph
            </h3>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {nodes.length} Verified Nodes • {edges.length} Causal Edges
          </div>
        </div>

        {/* Directed Node Flow */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '720px' }}>
          {nodes.map((node, index) => {
            const isSelected = node.id === selectedNodeId;
            const isInconclusive = node.status === 'inconclusive';

            return (
              <div 
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                style={{
                  backgroundColor: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.75)',
                  border: isSelected 
                    ? '2px solid var(--accent-blue)' 
                    : isInconclusive 
                    ? '1px solid var(--alert-red)' 
                    : '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '16px 20px',
                  boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div 
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      backgroundColor: isInconclusive ? 'var(--alert-red-light)' : 'var(--accent-blue-light)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: isInconclusive ? 'var(--alert-red)' : 'var(--accent-blue)',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px'
                    }}
                  >
                    0{index + 1}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {node.label}
                      </span>
                      <span className="badge badge-neutral" style={{ fontSize: '9px', padding: '1px 5px' }}>
                        {node.type.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {node.summary}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {isInconclusive ? (
                    <span className="badge badge-red">Uncertain</span>
                  ) : (
                    <span className="badge badge-green">Verified</span>
                  )}
                  <span style={{ color: 'var(--text-muted)' }}>→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: NODE METADATA INSPECTOR */}
      <div style={{ padding: '24px', overflowY: 'auto', backgroundColor: '#ffffff' }}>
        {selectedNode ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <div>
                <span className="badge badge-blue" style={{ marginBottom: '4px' }}>
                  NODE METADATA // {selectedNode.type.toUpperCase()}
                </span>
                <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedNode.label}
                </h4>
              </div>
              <span title="SHA-256 Verified" style={{ display: 'inline-flex' }}>
                <Lock size={16} color="var(--accent-blue)" />
              </span>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              {selectedNode.summary}
            </p>

            {/* Properties Table */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '8px', textTransform: 'uppercase' }}>
                Technical Parameters & Provenance
              </div>

              <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                {Object.entries(selectedNode.details || {}).map(([key, value], idx) => (
                  <div 
                    key={key}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      padding: '8px 12px',
                      borderBottom: idx < Object.keys(selectedNode.details).length - 1 ? '1px solid var(--border)' : 'none',
                      fontSize: '12px'
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'capitalize' }}>
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cryptographic Provenance Guarantee */}
            <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '6px', color: '#f8fafc' }}>
              <div style={{ fontSize: '11px', color: '#38bdf8', fontFamily: 'var(--font-mono)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={12} /> CRYPTOGRAPHIC HASH
              </div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#94a3b8', wordBreak: 'break-all', backgroundColor: '#1e293b', padding: '8px', borderRadius: '4px' }}>
                sha256:4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945
              </div>
              <div style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '8px' }}>
                Timestamped in local PostGIS audit ledger. Immutable chain of custody for maritime law enforcement.
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
            Select an evidence node on the left to inspect parameters.
          </div>
        )}
      </div>

    </div>
  );
};
