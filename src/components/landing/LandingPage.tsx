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
  ExternalLink,
  ChevronRight,
  Database,
  Radio,
  FileCheck2
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#38bdf8' }}>
            <span className="pulse-dot"></span>
            SIH 2026 PS 143 (SIH26143) PROTOTYPE
          </span>
          <span>•</span>
          <span>ORG: NTRO (NATIONAL TECHNICAL RESEARCH ORGANISATION)</span>
          <span>•</span>
          <span>TEAM: CODE BLOODED</span>
          <span>•</span>
          <span>THEME: DISASTER MANAGEMENT</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span>SENTINEL-1C / EOS-04 READY</span>
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
                  FORENSIC GIS
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Explainable Oil Spill Traceback & Attribution
              </div>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
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
            <a href="#incidents" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Incidents
            </a>
            <a href="#impact" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Impact
            </a>
            <a href="#architecture" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Architecture
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
        {/* Decorative MP4 background; place the video at public/ships.mp4 */}
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
              backgroundColor: 'rgba(255, 255, 255, 0.94)', 
              backdropFilter: 'blur(16px)',
              padding: '40px',
              borderRadius: '6px',
              border: '1px solid var(--border-strong)',
              boxShadow: 'var(--shadow-xl)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span className="badge badge-blue">MARITIME INTELLIGENCE PLATFORM</span>
              <span className="badge badge-neutral">MULTI-SOURCE ANALYSIS</span>
            </div>

            <h1 style={{ fontSize: '36px', fontWeight: 800, lineHeight: 1.15, color: 'var(--text-primary)', marginBottom: '14px' }}>
              Satellite Intelligence for Maritime Oil Spill Attribution
            </h1>

            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
              Detect the spill. Reconstruct its origin through ensemble ocean hindcasting. Correlate historical AIS vessel tracks. Verify hypotheses with counterfactual discharge simulation. Build an auditable forensic evidence chain under uncertainty.
            </p>

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
                Explore Forensic Workflow
              </a>
            </div>

            {/* Quick Metrics Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>SENSOR SENSITIVITY</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>10m SAR C-Band</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>HINDCAST RESOLUTION</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>50/80/95% CI</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ACCOUNTABILITY</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent-teal)' }}>Abstain & INCONCLUSIVE</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE PROBLEM SECTION */}
      <section id="problem" style={{ padding: '80px 0', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border)' }}>
        <div className="editorial-container">
          <div style={{ maxWidth: '780px', marginBottom: '40px' }}>
            <span className="badge badge-amber" style={{ marginBottom: '8px' }}>THE FORENSIC CHALLENGE</span>
            <h2 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Why Maritime Oil Spill Attribution is Extremely Difficult
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Existing maritime surveillance can spot oil slicks, but identifying the vessel responsible for the spill remains a major investigative and scientific bottleneck.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            <div className="gis-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ padding: '6px', backgroundColor: '#fee2e2', borderRadius: '4px' }}>
                  <AlertCircle size={20} color="#dc2626" />
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 600 }}>The Spatiotemporal Drift Gap</h4>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                By the time a satellite orbit passes, ocean currents and winds have transported the slick 10–50 kilometers away from the original discharge point. Attributing the vessel directly below the slick is almost always scientifically wrong.
              </p>
            </div>

            <div className="gis-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ padding: '6px', backgroundColor: '#fef3c7', borderRadius: '4px' }}>
                  <Radio size={20} color="#d97706" />
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 600 }}>Dark Vessels & AIS Non-Compliance</h4>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Vessels deliberately disable their Class A AIS transponders (dark vessels) during illegal bilge stripping or tank washing. Terrestrial coastal antennas suffer receiver blindspots in international waters.
              </p>
            </div>

            <div className="gis-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ padding: '6px', backgroundColor: '#e0f2fe', borderRadius: '4px' }}>
                  <FileCheck2 size={20} color="#0284c7" />
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 600 }}>False Accusations & Look-Alikes</h4>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Natural biogenic sheens, algal blooms, low-wind calm water, and sediment plumes frequently mimic oil slicks in radar backscatter. Black-box AI that forces a guilty verdict creates severe diplomatic and legal liability.
              </p>
            </div>
          </div>

          {/* Visual Concept Flow: Satellite -> Drift -> Origin -> AIS */}
          <div 
            style={{ 
              marginTop: '40px', 
              backgroundColor: '#0f172a', 
              borderRadius: '6px', 
              padding: '24px', 
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
                <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>OBSERVED TARGET</div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>Drifting Slick Polygon</div>
              </div>
            </div>

            <span style={{ color: '#38bdf8', fontSize: '18px' }}>← Reverse Advection ←</span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#38bdf8' }}></div>
              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>ORIGIN PROBABILITY</div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>50% / 80% / 95% Contour Box</div>
              </div>
            </div>

            <span style={{ color: '#38bdf8', fontSize: '18px' }}>← Spacetime Query ←</span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>AIS CORRELATION</div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>Candidate Fleet Verification</div>
              </div>
            </div>

            <button 
              onClick={() => onEnterConsole('OS-042')}
              className="btn btn-primary btn-sm"
              style={{ marginLeft: 'auto' }}
            >
              See Live Demo Case <ArrowRight size={14} />
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
              From initial SAR scene acquisition to counterfactual verification and composite evidence ranking: inspect each scientific stage in detail.
            </p>
          </div>

          <WorkflowExplorer />
        </div>
      </section>

      {/* 6. INNOVATION SECTION */}
      <section id="innovations" style={{ padding: '80px 0', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border)' }}>
        <div className="editorial-container">
          <div style={{ maxWidth: '780px', marginBottom: '36px' }}>
            <span className="badge badge-teal" style={{ marginBottom: '8px' }}>SCIENTIFIC NOVELTY</span>
            <h2 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Key Technical Innovations & Breakthroughs
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Seven core capabilities engineered to move beyond generic satellite monitoring into auditable, court-defensible maritime attribution.
            </p>
          </div>

          <InnovationShowcase />
        </div>
      </section>

      {/* 7. PAST INCIDENTS & BENCHMARK INTELLIGENCE */}
      <section id="incidents" style={{ padding: '80px 0', backgroundColor: 'var(--bg-body)', borderBottom: '1px solid var(--border)' }}>
        <div className="editorial-container">
          <DemoIncidentsSection onSelectIncident={onEnterConsole} />
        </div>
      </section>

      {/* 8. IMPACT SECTION */}
      <section id="impact" style={{ padding: '80px 0', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border)' }}>
        <div className="editorial-container">
          <ImpactSection />
        </div>
      </section>

      {/* 9. TECHNOLOGY & ARCHITECTURE SECTION */}
      <section id="architecture" style={{ padding: '80px 0', backgroundColor: 'var(--bg-body)', borderBottom: '1px solid var(--border)' }}>
        <div className="editorial-container">
          <TechArchitecture />
        </div>
      </section>

      {/* 10. FINAL CALL TO ACTION */}
      <section style={{ padding: '80px 0', backgroundColor: '#0f172a', color: '#ffffff', textAlign: 'center' }}>
        <div className="editorial-container" style={{ maxWidth: '780px' }}>
          <span className="badge badge-blue" style={{ marginBottom: '12px' }}>OPERATIONAL READINESS</span>
          <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px', color: '#ffffff' }}>
            From Satellite Detection to Defensible Evidence
          </h2>
          <p style={{ fontSize: '16px', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '32px' }}>
            One auditable workflow for detection, origin reconstruction, vessel correlation, counterfactual verification and uncertainty-aware attribution. Test the complete interactive prototype.
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

          <div style={{ marginTop: '28px', fontSize: '12px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
            SMART INDIA HACKATHON 2026 • PROBLEM STATEMENT 143 (SIH26143) • ORG: NTRO
          </div>
          <div style={{ marginTop: '6px', fontSize: '11px', color: '#64748b', fontStyle: 'italic', maxWidth: '750px', margin: '6px auto 0' }}>
            “Leveraging satellite imagery to determine Oil spills at sea along with AIS data correlations to identify vessel responsible for the spill.”
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer style={{ backgroundColor: '#020617', color: '#64748b', padding: '36px 0', borderTop: '1px solid #1e293b' }}>
        <div className="editorial-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc', fontWeight: 700, fontSize: '15px' }}>
              <Compass size={18} color="#0284c7" />
              AquaTrace Platform
            </div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              Built by Team Code Blooded for SIH 2026 PS 143 (SIH26143) — National Technical Research Organisation (NTRO).
            </div>
          </div>

          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
            <div>SAR DATA: ESA Copernicus Sentinel-1 & ISRO EOS-04</div>
            <div>METOCEAN: ECMWF ERA5 & CMEMS Mercator Ocean</div>
            <div>BENCHMARK: Zenodo SAR Oil Spill Dataset (JRC)</div>
          </div>
        </div>
      </footer>

    </div>
  );
};
