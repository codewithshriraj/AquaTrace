import React, { useState } from 'react';
import { mockIncidents } from '../../data/mockIncidents';
import { Incident, IncidentStatus } from '../../types';
import { 
  Search, 
  Filter, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Compass,
  FileText
} from 'lucide-react';

interface IncidentsListViewProps {
  onSelectIncident: (id: string) => void;
}

export const IncidentsListView: React.FC<IncidentsListViewProps> = ({ onSelectIncident }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredIncidents = mockIncidents.filter((inc) => {
    const matchesSearch =
      inc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.satelliteScene.satellite.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.assignedInvestigator.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'NEW':
        return <span className="badge badge-blue">NEW</span>;
      case 'SCREENING':
        return <span className="badge badge-amber">SCREENING</span>;
      case 'UNDER_INVESTIGATION':
        return <span className="badge badge-blue">UNDER INVESTIGATION</span>;
      case 'PROVISIONAL':
        return <span className="badge badge-amber">PROVISIONAL</span>;
      case 'INCONCLUSIVE':
        return <span className="badge badge-red">INCONCLUSIVE</span>;
      case 'CLOSED':
        return <span className="badge badge-green">CLOSED</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '24px', backgroundColor: 'var(--bg-body)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-blue">INCIDENT MANAGEMENT</span>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                SURVEILLANCE REGISTRY
              </span>
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              Active Maritime Spill Incidents & Case Files
            </h3>
          </div>

          <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            Showing {filteredIncidents.length} of {mockIncidents.length} Registered Cases
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div 
          className="gis-panel"
          style={{
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search by Incident ID, Region, Sensor, or Investigator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                fontSize: '13px',
                fontFamily: 'var(--font-sans)',
                backgroundColor: 'transparent',
              }}
            />
          </div>

          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {['ALL', 'UNDER_INVESTIGATION', 'NEW', 'SCREENING', 'PROVISIONAL', 'INCONCLUSIVE', 'CLOSED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '3px',
                  border: statusFilter === st ? '1px solid var(--accent-blue)' : '1px solid var(--border)',
                  backgroundColor: statusFilter === st ? 'var(--accent-blue-light)' : '#ffffff',
                  color: statusFilter === st ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Incidents Table */}
        <div className="gis-panel table-responsive">
          <table style={{ width: '100%', minWidth: '760px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#fafbfc', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>CASE ID</th>
                <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>REGION / SECTOR</th>
                <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>DETECTION TIME</th>
                <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>SLICK AREA</th>
                <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>CONFIDENCE</th>
                <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>INVESTIGATOR</th>
                <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>STATUS</th>
                <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.map((inc) => (
                <tr
                  key={inc.id}
                  style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.1s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '12px 16px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)' }}>
                    {inc.id}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{inc.region}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {inc.coordinates[0]}°N, {inc.coordinates[1]}°E
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                    {inc.detectionTimeUtc.slice(0, 16)}
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>
                    {inc.slickProperties.areaKm2} km²
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>
                    {inc.slickProperties.confidencePct}%
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {inc.assignedInvestigator}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {getStatusBadge(inc.status)}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => onSelectIncident(inc.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
                    >
                      Inspect <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
