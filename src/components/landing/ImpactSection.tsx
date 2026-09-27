import React from 'react';
import { Compass, Search, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const ImpactSection: React.FC = () => {
  return (
    <div>
      <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 40px auto' }}>
        <span className="badge badge-teal" style={{ marginBottom: '8px' }}>DECISION SUPPORT & OPERATIONAL VALUE</span>
        <h3 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
          From Detection to Actionable Investigation
        </h3>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          AquaTrace is designed to reduce the analytical gap between:
        </p>
        <div style={{ margin: '16px auto', display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '640px' }}>
          <div style={{ padding: '12px 18px', backgroundColor: 'var(--bg-subtle)', borderLeft: '3px solid #94a3b8', textAlign: 'left', fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '14px' }}>
            “A satellite detected something.”
          </div>
          <div style={{ padding: '12px 18px', backgroundColor: '#e0f2fe', borderLeft: '3px solid var(--accent-blue)', textAlign: 'left', fontWeight: 500, color: '#0369a1', fontSize: '14px' }}>
            “Here is the evidence, uncertainty and vessel activity that an investigator should examine.”
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* OPERATIONAL SCREENING */}
        <div className="gis-panel" style={{ padding: '28px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '6px', backgroundColor: 'var(--accent-teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Search size={22} color="var(--accent-teal)" />
          </div>
          <h4 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Targeted Vessel Screening
          </h4>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
            Helps maritime operational centres rapidly filter candidate vessels from hundreds of regional transits down to a ranked, manageable set.
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              'Faster spill investigation through automated spatiotemporal correlation',
              'Targeted vessel screening prioritizing inspections by Port State Control',
              'Maritime situational awareness across expansive Exclusive Economic Zones (EEZ)',
              'Investigation prioritisation based on objective multi-factor scoring'
            ].map((pt, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--text-primary)' }}>
                <CheckCircle2 size={15} color="var(--accent-teal)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* RESPONSE & ENVIRONMENT */}
        <div className="gis-panel" style={{ padding: '28px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '6px', backgroundColor: 'var(--accent-blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Compass size={22} color="var(--accent-blue)" />
          </div>
          <h4 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Response & Environmental Planning
          </h4>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
            Provides emergency response teams with forward trajectory projections and proximity assessments to sensitive coastal zones.
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              'Environmental response planning for coastal sanctuaries and fisheries',
              'Forward trajectory forecasting with expanding uncertainty envelopes',
              'Evidence organisation combining satellite, metocean and vessel data in one view',
              'Contextual look-alike risk screening to prevent false alarms'
            ].map((pt, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--text-primary)' }}>
                <CheckCircle2 size={15} color="var(--accent-blue)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* HUMAN-IN-THE-LOOP */}
        <div className="gis-panel" style={{ padding: '28px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '6px', backgroundColor: 'var(--spill-amber-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <ShieldCheck size={22} color="var(--spill-amber)" />
          </div>
          <h4 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Structured Decision Support
          </h4>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
            Furnishes officers and analysts with transparent, auditable evidence chains while preserving critical human oversight.
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              'Structured human-in-the-loop decision support for maritime officers',
              'Acyclic evidentiary provenance graph from satellite scene to finding',
              'Principled abstention (INCONCLUSIVE) when evidence is insufficient',
              'Exportable forensic briefing reports documenting all analytical assumptions'
            ].map((pt, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--text-primary)' }}>
                <CheckCircle2 size={15} color="var(--spill-amber)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Final Statement Banner */}
      <div 
        style={{ 
          marginTop: '32px', 
          padding: '16px 24px', 
          backgroundColor: '#f8fafc', 
          borderRadius: '6px', 
          border: '1px solid var(--border-strong)',
          textAlign: 'center',
          fontSize: '13px',
          color: 'var(--text-secondary)'
        }}
      >
        <strong>Notice:</strong> AquaTrace is decision-support software. It does not autonomously determine legal responsibility or enforcement action.
      </div>
    </div>
  );
};
