import React from 'react';
import { Leaf, DollarSign, Scale, CheckCircle } from 'lucide-react';

export const ImpactSection: React.FC = () => {
  return (
    <div>
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 40px auto' }}>
        <span className="badge badge-teal" style={{ marginBottom: '8px' }}>NATIONAL & GLOBAL IMPACT</span>
        <h3 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
          Defensible Environmental Accountability at Sea
        </h3>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Transforming maritime spill response from reactive shoreline clean-up into proactive satellite detection, forensic vessel attribution, and forensic-grade evidence chains.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* ENVIRONMENTAL */}
        <div className="gis-panel" style={{ padding: '28px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '6px', backgroundColor: 'var(--accent-teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Leaf size={22} color="var(--accent-teal)" />
          </div>
          <h4 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Environmental Protection
          </h4>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
            Protects fragile coastal ecosystems, coral reefs, and marine protected areas through rapid spill awareness and trajectory forecasting.
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              'Sub-hour detection prevents irreversible emulsification',
              'Forward dispersion cones safeguard marine reserves (e.g. Malvan, Gulf of Mannar)',
              'Discriminates between toxic hydrocarbon slicks and harmless biogenic sheens',
              'Long-term ecosystem recovery monitoring with satellite revisit tracks'
            ].map((pt, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--text-primary)' }}>
                <CheckCircle size={15} color="var(--accent-teal)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ECONOMIC */}
        <div className="gis-panel" style={{ padding: '28px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '6px', backgroundColor: 'var(--accent-blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <DollarSign size={22} color="var(--accent-blue)" />
          </div>
          <h4 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Economic & Response Efficiency
          </h4>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
            Eliminates thousands of flying hours for costly aerial maritime patrol aircraft by targeting reconnaissance missions with high-confidence geospatial coordinates.
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              '85% reduction in manual analyst correlation workload',
              'Optimal vectoring of Coast Guard interceptor assets and boom deployers',
              'Recover clean-up costs from offending shipowners under MARPOL Annex I',
              'Protection of coastal tourism, fisheries livelihoods, and desalination intakes'
            ].map((pt, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--text-primary)' }}>
                <CheckCircle size={15} color="var(--accent-blue)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* GOVERNANCE */}
        <div className="gis-panel" style={{ padding: '28px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '6px', backgroundColor: 'var(--spill-amber-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Scale size={22} color="var(--spill-amber)" />
          </div>
          <h4 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Governance & Maritime Law
          </h4>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
            Provides sovereign maritime authorities with an auditable, operational forensic evidence chain that supports Port State Control enforcement.
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              'Tamper-evident SHA-256 audit trail linking all data sources and ML models',
              'Principled abstention (INCONCLUSIVE) avoids false diplomatic accusations',
              'Port State Control (PSC) pre-arrival enforcement and targeted OWS inspections',
              'Full compliance with UNCLOS Article 194 & MARPOL 73/78 discharge standards'
            ].map((pt, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--text-primary)' }}>
                <CheckCircle size={15} color="var(--spill-amber)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};
