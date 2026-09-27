import React, { useState } from 'react';
import { mockIncidents } from '../../data/mockIncidents';
import { Incident } from '../../types';
import { InvestigationReportModal } from './InvestigationReportModal';
import { generateForensicInvestigationPDF } from '../../services/pdfExporter';
import { 
  FileText, 
  Printer, 
  Download, 
  ShieldCheck, 
  Lock, 
  Clock, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export const ReportsArchiveView: React.FC = () => {
  const [selectedIncidentForReport, setSelectedIncidentForReport] = useState<Incident | null>(null);

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '24px', backgroundColor: 'var(--bg-body)' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-blue">FORENSIC REPORTS & EVIDENCE DOSSIERS</span>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                MARPOL / PSC READY
              </span>
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              Forensic Investigation Reports Library
            </h3>
          </div>

          <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            {mockIncidents.length} Generated Case Files
          </div>
        </div>

        {/* Reports Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mockIncidents.map((inc) => {
            const isHigh = inc.attributionStatus === 'HIGH CORRELATION';
            const isInconclusive = inc.attributionStatus === 'INCONCLUSIVE';

            return (
              <div
                key={inc.id}
                className="gis-panel"
                style={{
                  padding: '18px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div 
                    style={{ 
                      width: '42px', 
                      height: '42px', 
                      borderRadius: '4px', 
                      backgroundColor: isInconclusive ? 'var(--alert-red-light)' : 'var(--accent-blue-light)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: isInconclusive ? 'var(--alert-red)' : 'var(--accent-blue)',
                      marginTop: '2px'
                    }}
                  >
                    <FileText size={20} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className="mono" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        AT-REP-{inc.id}-2026
                      </span>
                      <span 
                        className={`badge ${
                          isInconclusive ? 'badge-red' : isHigh ? 'badge-blue' : 'badge-amber'
                        }`}
                      >
                        {inc.attributionStatus}
                      </span>
                    </div>

                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {inc.region} • {inc.satelliteScene.satellite}
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                      Case Officer: {inc.assignedInvestigator} • Last Updated: {inc.lastUpdatedUtc}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => setSelectedIncidentForReport(inc)}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FileText size={13} /> View Full Report
                  </button>

                  <button
                    onClick={() => {
                      const doc = generateForensicInvestigationPDF(inc);
                      doc.save(`AquaTrace-Forensic-Report-${inc.id}.pdf`);
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    title="Generate and download full 20-section standalone PDF"
                  >
                    <Download size={13} /> Download PDF
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Report Modal */}
      {selectedIncidentForReport && (
        <InvestigationReportModal
          incident={selectedIncidentForReport}
          onClose={() => setSelectedIncidentForReport(null)}
        />
      )}
    </div>
  );
};
