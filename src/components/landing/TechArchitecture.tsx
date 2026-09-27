import React from 'react';
import { Database, Cpu, Compass, Server, ArrowDown } from 'lucide-react';

export const TechArchitecture: React.FC = () => {
  const layers = [
    {
      name: 'DATA INGESTION & SENSING LAYER',
      icon: <Database size={18} color="#0284c7" />,
      color: '#e0f2fe',
      borderColor: '#38bdf8',
      description: 'Production target architecture: Satellite orbital downlink, metocean assimilation & historical/live AIS ingestion',
      items: [
        { title: 'Sentinel-1 C-SAR', detail: 'IW GRDH (VV+VH) 10m Ground Resolution' },
        { title: 'EOS-04 / RISAT-1A', detail: 'ISRO Hybrid-Polarimetric SAR (FRS-1 Mode)' },
        { title: 'Sentinel-2 MSI', detail: 'Optical & Multi-spectral (NDWI / Chlorophyll-a)' },
        { title: 'Zenodo Gold SAR', detail: '11,128 Annotated Oil Spill Benchmark Scenes' },
        { title: 'Global AIS Network', detail: 'Terrestrial & Satellite Vessel Relays (Class A/B)' },
        { title: 'ERA5 & CMEMS', detail: '10m Surface Wind Fields & 3D Ocean Current Grids' },
      ],
    },
    {
      name: 'AI / COMPUTER VISION & SEGMENTATION LAYER',
      icon: <Cpu size={18} color="#0d9488" />,
      color: '#ccfbf1',
      borderColor: '#2dd4bf',
      description: 'Robust dark-formation segmentation, look-alike classification & explainability',
      items: [
        { title: 'PyTorch SegFormer-B4', detail: 'Hierarchical Transformer for Multi-Scale Slicks' },
        { title: 'U-Net ResNet-50', detail: 'High-Resolution Edge Boundary Refinement' },
        { title: 'OpenCV & NumPy', detail: 'Morphological Skeletonization & Thickness Index' },
        { title: 'Look-Alike Filter', detail: 'Random Forest on Texture & Wind Wave Damping' },
        { title: 'Grad-CAM & SHAP', detail: 'Pixel-Level Feature Attribution & Model Explainability' },
        { title: 'Evidence Fusion', detail: 'Multi-Modal Forensic Synthesis & Operational Scoring' },
      ],
    },
    {
      name: 'HYDRODYNAMIC & GEOSPATIAL MODELING LAYER',
      icon: <Compass size={18} color="#d97706" />,
      color: '#fef3c7',
      borderColor: '#fbbf24',
      description: 'Reverse Lagrangian particle tracking & forward oil dispersion physics',
      items: [
        { title: 'OpenDrift Framework', detail: 'Stochastic Ocean Advection & Stokes Drift' },
        { title: 'OpenOil Physics', detail: 'Viscous Spreading, Evaporation, Emulsification' },
        { title: 'NOAA GNOME 1.6', detail: 'Ensemble Hindcasting & Origin Probability Contours' },
        { title: 'GDAL & Rasterio', detail: 'Sub-Pixel Geospatial Tiling & Orthorectification' },
        { title: 'GeoPandas & Shapely', detail: 'Convex Hulls, IoU, Hausdorff Spatial Distance' },
        { title: 'Counterfactual Engine', detail: 'Vessel-Specific In-Silico Discharge Validation' },
      ],
    },
    {
      name: 'PLATFORM, STORAGE & MARITIME UI WORKSTATION',
      icon: <Server size={18} color="#475569" />,
      color: '#f1f5f9',
      borderColor: '#94a3b8',
      description: 'Cloud-native microservices, auditable PostGIS ledger & GIS interface',
      items: [
        { title: 'FastAPI Backend', detail: 'High-Throughput Asynchronous Python Microservices' },
        { title: 'React + TypeScript', detail: 'Swiss/Editorial GIS Analytical Workstation UI' },
        { title: 'Leaflet & Canvas', detail: 'Resilient Vector/Raster Mapping (Zero External Dep)' },
        { title: 'PostgreSQL + PostGIS', detail: 'Spatial-Temporal Spacetime Trajectory Queries' },
        { title: 'DuckDB Engine', detail: 'In-Memory Sub-Second Historical AIS Scanning' },
        { title: 'Docker Orchestration', detail: 'Deterministic Deployment on Edge & Cloud' },
      ],
    },
  ];

  return (
    <div>
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 40px auto' }}>
        <span className="badge badge-blue" style={{ marginBottom: '8px' }}>PRODUCTION ARCHITECTURE</span>
        <h3 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
          Modular Full-Stack Scientific Stack
        </h3>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Designed with clean decoupling between satellite ingestion, deep-learning segmentation, hydrodynamic drift simulation, and evidentiary forensic reporting.
        </p>
      </div>

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
                      border: '1px solid var(--border)' 
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {it.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {it.detail}
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
