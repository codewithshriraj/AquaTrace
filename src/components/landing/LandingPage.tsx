import React from 'react';
import { WorkflowExplorer } from './WorkflowExplorer';
import { InnovationShowcase } from './InnovationShowcase';
import { DemoIncidentsSection } from './DemoIncidentsSection';
import { ImpactSection } from './ImpactSection';
import { TechArchitecture } from './TechArchitecture';
import { 
  Compass, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  ChevronRight,
  Database,
  Radio,
  FileCheck2,
  Users,
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react';

interface LandingPageProps {
  onEnterConsole: (incidentId?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterConsole }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-body)' }}>
      
      {/* 1. TOP MARITIME INTELLIGENCE STATUS BAR */}
      <div 
        style={{ 
          backgroundColor: '#0f172a', 
          color: '#94a3b8', 
          fontSize: '11px', 
          fontFamily: 'var(--font-mono)', 
          padding: '6px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #1e293b',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#38bdf8' }}>
            <span className="pulse-dot"></span>
            SIH 2026 · SIH26143 / PS 143 · PROTOTYPE
          </span>
          <span>•</span>
          <span>ORG: NTRO (NATIONAL TECHNICAL RESEARCH ORGANISATION)</span>
          <span>•</span>
          <span>TEAM: CODE BLOODED</span>
          <span>•</span>
          <span>THEME: DISASTER MANAGEMENT</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span>DEMONSTRATION MODE ACTIVE</span>
          <span>•</span>
          <span style={{ color: '#10b981' }}>SYSTEM STATUS: ALL ENGINES NOMINAL</span>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION HEADER */}
      <header 
        style={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 50, 
          backgroundColor: 'rgba(255, 255, 255, 0.98)', 
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--border)',
          padding: '10px 0'
        }}
      >
        <div className="editorial-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          {/* Brand Wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <div 
              style={{ 
                width: '34px', 
                height: '34px', 
                backgroundColor: 'var(--accent-blue)', 
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <Compass size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                  AquaTrace
                </span>
                <span className="badge badge-blue" style={{ fontSize: '9px', padding: '1px 5px', flexShrink: 0 }}>
                  DECISION SUPPORT
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Explainable Maritime Oil Spill Traceback & Vessel Attribution
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
            <a href="#problem" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Problem
            </a>
            <a href="#workflow" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Workflow
            </a>
            <a href="#innovations" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Innovations
            </a>
            <a href="#human-in-the-loop" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Human-in-the-Loop
            </a>
            <a href="#incidents" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Cases
            </a>
            <a href="#disclosure" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Disclosure
            </a>
            <a href="#architecture" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Architecture
            </a>
            <a href="#sih" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none' }}>
              SIH 2026
            </a>
          </nav>

          {/* Header Action Button */}
          <button 
            onClick={() => onEnterConsole('OS-042')}
            className="btn btn-primary btn-sm"
            style={{ fontWeight: 600, padding: '7px 14px', flexShrink: 0 }}
          >
            Launch Console <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section style={{ position: 'relative', height: '620px', display: 'flex', alignItems: 'center', overflow: 'hidden', backgroundColor: '#0c1b29' }}>
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 1,
            pointerEvents: 'none',
            transform: 'translateX(-12.5%) scale(1.25)',
            transformOrigin: 'center center',
          }}
        >
          <source src="/Ships.mp4" type="video/mp4" />
        </video>

        {/* Foreground Content Card overlay (Swiss Grid Editorial style) */}
        <div className="editorial-container" style={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
          <div 
            style={{ 
              maxWidth: '680px', 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              backdropFilter: 'blur(16px)',
              padding: '38px',
              borderRadius: '6px',
              border: '1px solid var(--border-strong)',
              boxShadow: 'var(--shadow-xl)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <span className="badge badge-blue">AQUATRACE</span>
              <span className="badge badge-neutral">DECISION-SUPPORT PLATFORM</span>
            </div>

            <h1 style={{ fontSize: '32px', fontWeight: 800, lineHeight: 1.18, color: 'var(--text-primary)', marginBottom: '14px' }}>
              Explainable Maritime Oil Spill Traceback & Vessel Attribution
            </h1>

            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              Satellite intelligence for detecting maritime oil slicks, reconstructing likely release regions, correlating vessel activity, testing candidate hypotheses, and producing an auditable evidence chain under uncertainty.
            </p>

            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '22px' }}>
              Smart India Hackathon 2026 · SIH26143 · NTRO · Disaster Management · Team Code Blooded
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '24px' }}>
              <button 
                onClick={() => onEnterConsole('OS-042')}
                className="btn btn-primary btn-lg"
                style={{ fontWeight: 600 }}
              >
                Launch Investigator Console <ArrowRight size={18} />
              </button>
              
              <a 
                href="#workflow" 
                className="btn btn-secondary btn-lg"
                style={{ fontWeight: 500 }}
              >
                Explore 9-Stage Workflow
              </a>
            </div>

            {/* Quick Metrics Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>SENSOR SENSITIVITY</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>10m SAR C-Band</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>MODELLED UNCERTAINTY</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>P50 / P80 / P95 Envelopes</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>DECISION INTEGRITY</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-teal)' }}>Principled Abstention</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE PROBLEM SECTION */}
      <section id="problem" style={{ padding: '80px 0', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border)' }}>
        <div className="editorial-container">
          <div style={{ maxWidth: '800px', marginBottom: '40px' }}>
            <span className="badge badge-amber" style={{ marginBottom: '8px' }}>THE PROBLEM</span>
            <h2 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Detecting an oil slick is only the beginning.
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Satellite imagery can reveal surface anomalies, but determining where a spill originated and which vessels were present during the relevant time is substantially harder.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            <div className="gis-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ padding: '6px', backgroundColor: '#fee2e2', borderRadius: '4px' }}>
                  <AlertCircle size={20} color="#dc2626" />
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 600 }}>Spatial and Temporal Drift</h4>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                A slick observed by satellite may have travelled significantly from its release location due to surface currents, wind and dispersion. Attributing a vessel observed directly beneath a weathered slick is almost always scientifically invalid.
              </p>
            </div>

            <div className="gis-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ padding: '6px', backgroundColor: '#fef3c7', borderRadius: '4px' }}>
                  <Radio size={20} color="#d97706" />
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 600 }}>Incomplete Vessel Telemetry</h4>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                AIS records can contain gaps, sparse reporting or incomplete coverage in coastal shadow zones or open ocean basins. A missing AIS record must not automatically be interpreted as responsibility.
              </p>
            </div>

            <div className="gis-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ padding: '6px', backgroundColor: '#e0f2fe', borderRadius: '4px' }}>
                  <FileCheck2 size={20} color="#0284c7" />
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 600 }}>Radar Look-Alikes</h4>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Low-wind areas, natural biogenic films, sediment effects and other ocean-surface phenomena can produce SAR signatures similar to oil. Automated systems that force a positive attribution create severe risks of false accusations.
              </p>
            </div>
          </div>

          {/* Core conclusion quote */}
          <div 
            style={{ 
              marginTop: '32px', 
              padding: '20px 24px', 
              backgroundColor: '#f8fafc', 
              borderLeft: '4px solid var(--accent-blue)', 
              borderRadius: '4px',
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6
            }}
          >
            <p style={{ marginBottom: '6px', fontWeight: 600, color: 'var(--text-primary)' }}>
              A simple “nearest vessel to the slick” approach is insufficient.
            </p>
            <p style={{ margin: 0 }}>
              AquaTrace reconstructs the investigation backwards from the observed slick and evaluates multiple independent evidence channels before producing a result.
            </p>
          </div>

          {/* Visual Concept Flow: Satellite -> Drift -> Origin -> AIS */}
          <div 
            style={{ 
              marginTop: '28px', 
              backgroundColor: '#0f172a', 
              borderRadius: '6px', 
              padding: '20px 24px', 
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
              <div>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>OBSERVED TARGET</div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Drifting Slick Polygon</div>
              </div>
            </div>

            <span style={{ color: '#38bdf8', fontSize: '14px', fontFamily: 'var(--font-mono)' }}>← Reverse Advection ←</span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#38bdf8' }}></div>
              <div>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>MODELLED ORIGIN</div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>P50 / P80 / P95 Envelopes</div>
              </div>
            </div>

            <span style={{ color: '#38bdf8', fontSize: '14px', fontFamily: 'var(--font-mono)' }}>← Spacetime Query ←</span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
              <div>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>AIS CORRELATION</div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Candidate Fleet Verification</div>
              </div>
            </div>

            <button 
              onClick={() => onEnterConsole('OS-042')}
              className="btn btn-primary btn-sm"
              style={{ marginLeft: 'auto' }}
            >
              Examine Demo Case (OS-042) <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS / 9-STEP WORKFLOW */}
      <section id="workflow" style={{ padding: '80px 0', backgroundColor: 'var(--bg-body)', borderBottom: '1px solid var(--border)' }}>
        <div className="editorial-container">
          <div style={{ maxWidth: '780px', marginBottom: '32px' }}>
            <span className="badge badge-blue" style={{ marginBottom: '8px' }}>FORENSIC METHODOLOGY</span>
            <h2 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
              The 9-Stage Forensic Attribution Workflow
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              From initial SAR scene acquisition to counterfactual verification and composite evidence ranking: inspect each analytical stage in detail.
            </p>
          </div>

          <WorkflowExplorer />
        </div>
      </section>

      {/* 6. INNOVATION SECTION */}
      <section id="innovations" style={{ padding: '80px 0', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border)' }}>
        <div className="editorial-container">
          <div style={{ maxWidth: '780px', marginBottom: '36px' }}>
            <span className="badge badge-teal" style={{ marginBottom: '8px' }}>CORE INNOVATIONS</span>
            <h2 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Key Technical Innovations & Methods
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Seven core capabilities engineered to move beyond simple proximity matching into auditable maritime investigation under uncertainty.
            </p>
          </div>

          <InnovationShowcase />
        </div>
      </section>

      {/* 7. HUMAN-IN-THE-LOOP SECTION */}
      <section id="human-in-the-loop" style={{ padding: '72px 0', backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
        <div className="editorial-container">
          <div style={{ maxWidth: '780px', margin: '0 auto 32px auto', textAlign: 'center' }}>
            <span className="badge badge-neutral" style={{ marginBottom: '8px' }}>CORE PHILOSOPHY</span>
            <h2 style={{ fontSize: '30px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Human-in-the-Loop Decision Support
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              AquaTrace does not act as an automated judge or jury. It structures complex multi-source data to empower trained investigators.
            </p>
          </div>

          {/* Principle Flow Box */}
          <div 
            style={{ 
              maxWidth: '860px', 
              margin: '0 auto 28px auto', 
              backgroundColor: '#ffffff', 
              padding: '24px 32px', 
              borderRadius: '6px', 
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
              AquaTrace Analytical Delivery
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', letterSpacing: '-0.01em' }}>
              Evidence → Uncertainty → Candidate Ranking → Investigation Context
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
              The investigator remains responsible for interpreting the evidence and determining what action, if any, should follow.
            </p>

            <div 
              style={{ 
                padding: '12px 18px', 
                backgroundColor: 'rgba(239, 68, 68, 0.08)', 
                borderLeft: '4px solid #ef4444', 
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <ShieldCheck size={20} color="#dc2626" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '13px', color: '#991b1b', fontWeight: 600 }}>
                When evidence is inadequate: AQUATRACE ABSTAINS.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. DEMONSTRATION CASES */}
      <section id="incidents" style={{ padding: '80px 0', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border)' }}>
        <div className="editorial-container">
          <DemoIncidentsSection onSelectIncident={onEnterConsole} />
        </div>
      </section>

      {/* 9. STRONG DEMONSTRATION DISCLOSURE */}
      <section id="disclosure" style={{ padding: '64px 0', backgroundColor: '#fafbfc', borderBottom: '1px solid var(--border)' }}>
        <div className="editorial-container" style={{ maxWidth: '880px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Info size={18} color="var(--accent-blue)" />
            <span className="badge badge-amber" style={{ fontSize: '11px' }}>DEMONSTRATION DISCLOSURE</span>
          </div>
          
          <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Demonstration Mode & Scope of Prototype
          </h3>

          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
            AquaTrace is currently demonstrated using controlled and synthetic inputs for selected components of the workflow:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            <div style={{ padding: '12px 16px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>INPUT COMPONENT</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>AIS Telemetry</div>
              <div style={{ fontSize: '12px', color: 'var(--spill-amber)', fontWeight: 500 }}>Synthetic demonstration data</div>
            </div>

            <div style={{ padding: '12px 16px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>INPUT COMPONENT</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Environmental Forcing</div>
              <div style={{ fontSize: '12px', color: 'var(--spill-amber)', fontWeight: 500 }}>Simulated demonstration data</div>
            </div>

            <div style={{ padding: '12px 16px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>INPUT COMPONENT</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>SAR Geometry</div>
              <div style={{ fontSize: '12px', color: 'var(--spill-amber)', fontWeight: 500 }}>Pre-vectorised demonstration geometry</div>
            </div>

            <div style={{ padding: '12px 16px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>INPUT COMPONENT</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Browser Drift Model</div>
              <div style={{ fontSize: '12px', color: 'var(--accent-blue)', fontWeight: 500 }}>Lightweight analytical model</div>
            </div>

            <div style={{ padding: '12px 16px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>BACKEND TARGET</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Production Drift Engines</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Integration target (OpenDrift / NOAA GNOME)</div>
            </div>

            <div style={{ padding: '12px 16px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>BACKEND TARGET</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Operational Data Ingestion</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Integration target (Live AIS / Sentinel Hub)</div>
            </div>
          </div>

          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, padding: '12px 16px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid var(--border-strong)' }}>
            <strong>Demonstration notice:</strong> Demonstration metrics illustrate the analytical workflow and are not presented as statistically calibrated probabilities or ground-truth attribution results.
          </div>
        </div>
      </section>

      {/* 10. IMPACT SECTION */}
      <section id="impact" style={{ padding: '80px 0', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border)' }}>
        <div className="editorial-container">
          <ImpactSection />
        </div>
      </section>

      {/* 11. TECHNOLOGY & ARCHITECTURE SECTION */}
      <section id="architecture" style={{ padding: '80px 0', backgroundColor: 'var(--bg-body)', borderBottom: '1px solid var(--border)' }}>
        <div className="editorial-container">
          <TechArchitecture />
        </div>
      </section>

      {/* 12. SIH 2026 OFFICIAL PROBLEM STATEMENT CALLOUT */}
      <section id="sih" style={{ padding: '64px 0', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border)' }}>
        <div className="editorial-container" style={{ maxWidth: '820px', textAlign: 'center' }}>
          <span className="badge badge-blue" style={{ marginBottom: '10px' }}>HACKATHON CONTEXT</span>
          <h3 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px' }}>
            Smart India Hackathon 2026
          </h3>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '20px', flexWrap: 'wrap' }}>
            <span><strong>Problem Statement:</strong> SIH26143 / PS 143</span>
            <span>•</span>
            <span><strong>Organization:</strong> NTRO</span>
            <span>•</span>
            <span><strong>Theme:</strong> Disaster Management</span>
            <span>•</span>
            <span><strong>Team:</strong> Code Blooded</span>
          </div>

          <div 
            style={{ 
              padding: '20px 24px', 
              backgroundColor: '#f1f5f9', 
              borderRadius: '6px', 
              borderLeft: '4px solid var(--accent-blue)', 
              textAlign: 'left',
              margin: '0 auto 20px auto'
            }}
          >
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '6px' }}>
              OFFICIAL PROBLEM STATEMENT
            </div>
            <blockquote style={{ margin: 0, fontSize: '15px', fontStyle: 'italic', color: '#1e293b', lineHeight: 1.6 }}>
              “Leveraging satellite imagery to determine Oil spills at sea along with AIS data correlations to identify vessel responsible for the spill.”
            </blockquote>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            AquaTrace is an exploratory research prototype created by Team Code Blooded addressing the challenge specifications of SIH26143.
          </p>
        </div>
      </section>

      {/* 13. FINAL CALL TO ACTION */}
      <section style={{ padding: '80px 0', backgroundColor: '#0f172a', color: '#ffffff', textAlign: 'center' }}>
        <div className="editorial-container" style={{ maxWidth: '780px' }}>
          <span className="badge badge-blue" style={{ marginBottom: '12px' }}>INTERACTIVE DEMONSTRATION</span>
          <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px', color: '#ffffff' }}>
            From Satellite Detection to Auditable Evidence
          </h2>
          <p style={{ fontSize: '16px', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '32px' }}>
            One transparent workflow for detection, origin reconstruction, vessel correlation, counterfactual verification and uncertainty-aware attribution. Test the complete interactive prototype.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => onEnterConsole('OS-042')}
              className="btn btn-primary btn-lg"
              style={{ fontWeight: 600 }}
            >
              Open Investigator Console <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => onEnterConsole('OS-037')}
              className="btn btn-secondary btn-lg"
              style={{ fontWeight: 500, backgroundColor: '#1e293b', color: '#ffffff', borderColor: '#475569' }}
            >
              Inspect Inconclusive Case (OS-037)
            </button>
          </div>
        </div>
      </section>

      {/* 14. FOOTER */}
      <footer style={{ backgroundColor: '#020617', color: '#64748b', padding: '36px 0', borderTop: '1px solid #1e293b' }}>
        <div className="editorial-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc', fontWeight: 700, fontSize: '15px' }}>
              <Compass size={18} color="#0284c7" />
              AquaTrace
            </div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              Built by Team Code Blooded for SIH 2026 PS 143 (SIH26143) · National Technical Research Organisation (NTRO).
            </div>
          </div>

          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
            <div>SAR DATA: ESA Copernicus Sentinel-1 & ISRO EOS-04 (Reference)</div>
            <div>METOCEAN: ECMWF ERA5 & CMEMS Mercator Ocean (Simulated)</div>
            <div>BENCHMARK: Zenodo SAR Oil Spill Dataset (JRC Reference)</div>
          </div>
        </div>
      </footer>

    </div>
  );
};
