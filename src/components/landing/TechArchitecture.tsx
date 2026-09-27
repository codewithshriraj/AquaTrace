import React from 'react';
import { Database, Cpu, Compass, Server, ArrowDown, CheckCircle, Clock } from 'lucide-react';

export const TechArchitecture: React.FC = () => {
  const layers = [
    {
      name: 'DATA INGESTION & SENSING LAYER',
      icon: <Database size={18} color="#0284c7" />,
      color: '#e0f2fe',
      borderColor: '#38bdf8',
      description: 'Satellite orbital data, metocean assimilation & vessel telemetry streams',
      items: [
        { title: 'Sentinel-1 C-SAR', detail: 'IW GRDH (VV+VH) 10m Ground Resolution', status: 'Reference Geometry' },
        { title: 'EOS-04 / RISAT-1A', detail: 'ISRO Hybrid-Polarimetric SAR (FRS-1 Mode)', status: 'Reference Geometry' },
        { title: 'Sentinel-2 MSI', detail: 'Optical & Multi-spectral (NDWI / Chlorophyll-a)', status: 'Integration Target' },
        { title: 'Zenodo Gold SAR', detail: '11,128 Annotated Oil Spill Benchmark Scenes', status: 'Demonstration Benchmark' },
        { title: 'AIS Telemetry Stream', detail: 'Vessel Relays (Class A/B Transponders)', status: 'Synthetic Demo Data' },
        { title: 'ERA5 & CMEMS', detail: '10m Surface Wind Fields & 3D Ocean Current Grids', status: 'Simulated Demo Forcing' },
      ],
    },
    {
      name: 'COMPUTER VISION & SEGMENTATION LAYER',
      icon: <Cpu size={18} color="#0d9488" />,
      color: '#ccfbf1',
      borderColor: '#2dd4bf',
      description: 'Dark-formation segmentation, look-alike classification & explainability',
      items: [
        { title: 'PyTorch SegFormer-B4', detail: 'Hierarchical Transformer for Multi-Scale Slicks', status: 'Integration Target' },
        { title: 'U-Net ResNet-50', detail: 'High-Resolution Edge Boundary Refinement', status: 'Integration Target' },
        { title: 'Vector Geometry Engine', detail: 'Morphological Skeletonization & Thickness Index', status: 'Implemented / Demo' },
        { title: 'Look-Alike Filter', detail: 'Thresholds on Texture & Wind Wave Damping', status: 'Implemented / Demo' },
        { title: 'Feature Attribution', detail: 'Pixel-Level Feature Attribution & Mask Verification', status: 'Integration Target' },
        { title: 'Evidence Fusion', detail: 'Multi-Modal Forensic Synthesis & Operational Scoring', status: 'Implemented / Demo' },
      ],
    },
    {
      name: 'HYDRODYNAMIC & GEOSPATIAL MODELING LAYER',
      icon: <Compass size={18} color="#d97706" />,
      color: '#fef3c7',
      borderColor: '#fbbf24',
      description: 'Reverse Lagrangian particle tracking & forward oil dispersion physics',
      items: [
        { title: 'OpenDrift Framework', detail: 'Stochastic Ocean Advection & Stokes Drift', status: 'Integration Target' },
        { title: 'OpenOil Physics', detail: 'Viscous Spreading, Evaporation, Emulsification', status: 'Integration Target' },
        { title: 'NOAA GNOME 1.6', detail: 'Ensemble Hindcasting & Origin Uncertainty Envelopes', status: 'Integration Target' },
        { title: 'Analytical Reverse Advection', detail: 'Lightweight In-Browser Backward Drift Model', status: 'Implemented / Demo' },
        { title: 'Spatial Geometry Metrics', detail: 'Convex Hulls, Spatial IoU, Hausdorff Distance', status: 'Implemented / Demo' },
        { title: 'Counterfactual Engine', detail: 'Candidate-Specific In-Silico Discharge Validation', status: 'Implemented / Demo' },
      ],
    },
    {
      name: 'PLATFORM, STORAGE & MARITIME WORKSTATION',
      icon: <Server size={18} color="#475569" />,
      color: '#f1f5f9',
      borderColor: '#94a3b8',
      description: 'Modular microservices, spatial queries & responsive analyst interface',
      items: [
        { title: 'FastAPI Backend', detail: 'Asynchronous Python Microservices API', status: 'Integration Target' },
        { title: 'React + TypeScript', detail: 'Editorial GIS Analytical Workstation UI', status: 'Implemented / Demo' },
        { title: 'Leaflet & Canvas GIS', detail: 'Interactive Vector/Raster Maritime Mapping', status: 'Implemented / Demo' },
        { title: 'PostgreSQL + PostGIS', detail: 'Spatial-Temporal Spacetime Trajectory Database', status: 'Integration Target' },
        { title: 'In-Memory Query Engine', detail: 'Deterministic Candidate Screening & Trajectory Math', status: 'Implemented / Demo' },
        { title: 'Standalone PDF Engine', detail: '20-Section Forensic Briefing Document Generator', status: 'Implemented / Demo' },
      ],
    },
  ];

  return (
    <div>
      <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 40px auto' }}>
        <span className="badge badge-blue" style={{ marginBottom: '8px' }}>MODULAR SYSTEM ARCHITECTURE</span>
        <h3 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
          Modular Architecture: Current Prototype vs Production Targets
        </h3>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Designed with clean decoupling between satellite ingestion, deep-learning segmentation, hydrodynamic drift simulation, and evidentiary forensic reporting.
        </p>
      </div>

      {/* Distinction Summary Banner */}
      <div 
        style={{ 
          maxWidth: '1000px', 
          margin: '0 auto 32px auto', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '16px' 
        }}
      >
        <div style={{ padding: '16px 20px', backgroundColor: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <CheckCircle size={18} color="#16a34a" />
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#15803d', margin: 0 }}>
              CURRENT DEMONSTRATION PROTOTYPE
            </h4>
          </div>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#166534', lineHeight: 1.6 }}>
            <li>Browser-based investigation workstation interface</li>
            <li>Deterministic demonstration cases (OS-042 and OS-037)</li>
            <li>Synthetic AIS telemetry & simulated environmental forcing</li>
            <li>Pre-vectorised demonstration SAR geometry</li>
            <li>Lightweight analytical drift model & operational evidence weighting</li>
            <li>Rule-based look-alike screening & principled abstention logic</li>
          </ul>
        </div>

        <div style={{ padding: '16px 20px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Clock size={18} color="#0284c7" />
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0369a1', margin: 0 }}>
              PRODUCTION INTEGRATION TARGETS
            </h4>
          </div>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <li>Operational satellite orbital ingestion (Sentinel-1 / EOS-04)</li>
            <li>Live & public terrestrial/satellite AIS feeds</li>
            <li>ERA5 reanalysis / Copernicus Marine (CMEMS) real-time pipelines</li>
            <li>Full SegFormer / U-Net segmentation inference cluster</li>
            <li>OpenDrift / OpenOil execution & NOAA GNOME cross-check</li>
            <li>PostgreSQL / PostGIS persistence with FastAPI backend</li>
          </ul>
        </div>
      </div>

      {/* Layer breakdown cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
        {layers.map((layer, idx) => (
          <React.Fragment key={layer.name}>
            <div 
              className="gis-panel"
              style={{
                borderLeft: `4px solid ${layer.borderColor}`,
                padding: '20px 24px',
                backgroundColor: '#ffffff'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '6px', backgroundColor: layer.color, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {layer.icon}
                  </div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
                    {layer.name}
                  </h4>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  LAYER 0{idx + 1} // SUBSYSTEM
                </span>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                {layer.description}
              </p>

              {/* Grid of technologies */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                {layer.items.map((it) => (
                  <div 
                    key={it.title}
                    style={{ 
                      backgroundColor: 'var(--bg-subtle)', 
                      padding: '8px 12px', 
                      borderRadius: '4px', 
                      border: '1px solid var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '4px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {it.title}
                        </span>
                        <span 
                          style={{ 
                            fontSize: '9px', 
                            fontFamily: 'var(--font-mono)', 
                            padding: '1px 5px', 
                            borderRadius: '2px',
                            backgroundColor: it.status.includes('Implemented') || it.status.includes('Demonstration') ? '#dcfce7' : '#e2e8f0',
                            color: it.status.includes('Implemented') || it.status.includes('Demonstration') ? '#15803d' : '#475569',
                            fontWeight: 600,
                            flexShrink: 0
                          }}
                        >
                          {it.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                        {it.detail}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {idx < layers.length - 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', margin: '-8px 0' }}>
                <div style={{ padding: '4px', backgroundColor: '#e2e8f0', borderRadius: '50%', color: '#64748b' }}>
                  <ArrowDown size={14} />
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
