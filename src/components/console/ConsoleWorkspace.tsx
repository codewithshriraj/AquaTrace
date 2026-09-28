import React, { useState, useEffect } from 'react';
import { Incident } from '../../types';
import { mockIncidents } from '../../data/mockIncidents';
import { SimulationResult } from '../../services/counterfactualSimulator';
import { providerRegistry, OperatingMode } from '../../services/dataProvider/providerRegistry';
import { InvestigationMap } from './InvestigationMap';
import { ReplayTimeline } from './ReplayTimeline';
import { CandidateAnalysisPanel } from './CandidateAnalysisPanel';
import { DashboardOverview } from './DashboardOverview';
import { InvestigationPipeline } from './InvestigationPipeline';
import { SatelliteObservationPanel } from './SatelliteObservationPanel';
import { OriginDriftPanel } from './OriginDriftPanel';
import { VesselsOfInterestPanel } from './VesselsOfInterestPanel';
import { ForensicEvidenceChainPanel } from './ForensicEvidenceChainPanel';
import { ProvenanceTimelinePanel } from './ProvenanceTimelinePanel';
import { EvidenceGraphView } from './EvidenceGraphView';
import { KinematicCheckView } from './KinematicCheckView';
import { HotspotsView } from './HotspotsView';
import { DataSourcesView } from './DataSourcesView';
import { DataExplorerView } from './DataExplorerView';
import { DataIntegrityView } from './DataIntegrityView';
import { AlertFeed } from './AlertFeed';
import { FieldView } from './FieldView';
import { IncidentsListView } from './IncidentsListView';
import { VesselIntelligenceView } from './VesselIntelligenceView';
import { ForensicReplayView } from './ForensicReplayView';
import { ReportsArchiveView } from './ReportsArchiveView';
import { SettingsView } from './SettingsView';
import { InvestigationReportModal } from './InvestigationReportModal';
import { AuditTrailDrawer } from './AuditTrailDrawer';
import { PipelineHealthModal } from './PipelineHealthModal';
import { NextPassWidget } from './NextPassWidget';
import { 
  Compass, 
  Map as MapIcon, 
  Layers, 
  Clock, 
  Activity, 
  MapPin, 
  FileText, 
  ShieldCheck, 
  Database, 
  Bell, 
  Tablet,
  ArrowLeft,
  Ship,
  Sliders,
  Menu,
  X as CloseIcon,
  Network,
  LayoutDashboard,
  Radar,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Radio
} from 'lucide-react';

interface ConsoleWorkspaceProps {
  initialIncidentId?: string;
  initialNavView?: string;
  onReturnToLanding: () => void;
  onNavigateRoute?: (path: string) => void;
}

export const ConsoleWorkspace: React.FC<ConsoleWorkspaceProps> = ({
  initialIncidentId = 'OS-037',
  initialNavView = 'investigation-map',
  onReturnToLanding,
  onNavigateRoute,
}) => {
  // Global platform mode
  const [platformMode, setPlatformMode] = useState<OperatingMode>(() => providerRegistry.getMode());
  const [isPipelineHealthOpen, setIsPipelineHealthOpen] = useState<boolean>(false);

  // Current active incident
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(initialIncidentId);
  const allAvailableIncidents = providerRegistry.getAllIncidents();
  const currentIncident = allAvailableIncidents.find((i) => i.id === selectedIncidentId) || allAvailableIncidents[0];

  // Active navigation view
  const [activeNavView, setActiveNavView] = useState<string>(initialNavView);

  // Active analytical inspector tab in investigation view
  const [activeInspectorTab, setActiveInspectorTab] = useState<'vessels' | 'satellite' | 'origin-drift' | 'forensic-chain' | 'provenance'>('vessels');

  // Candidate selection
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    currentIncident.candidateVessels[0]?.id || null
  );

  // Counterfactual overlay & in-silico simulation state
  const [isCounterfactualOverlayActive, setIsCounterfactualOverlayActive] = useState<boolean>(true);
  const [activeSimulationResult, setActiveSimulationResult] = useState<SimulationResult | null>(null);
  const [activeSimulationFrameIndex, setActiveSimulationFrameIndex] = useState<number>(5);
  const [showSimulationParticles, setShowSimulationParticles] = useState<boolean>(true);

  // Replay timeline index & visibility
  const [replayTimeIndex, setReplayTimeIndex] = useState<number>(3);
  const [isTimelineVisible, setIsTimelineVisible] = useState<boolean>(false);

  // UI Modals & Views
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState<boolean>(false);
  const [isFieldViewActive, setIsFieldViewActive] = useState<boolean>(false);

  // Responsive state
  const [windowWidth, setWindowWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Live UTC Clock
  const [currentUtcTime, setCurrentUtcTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentUtcTime(now.toUTCString().slice(17, 25) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync state if initial props change
  useEffect(() => {
    setSelectedIncidentId(initialIncidentId);
  }, [initialIncidentId]);

  useEffect(() => {
    if (initialNavView) {
      setActiveNavView(initialNavView);
    }
  }, [initialNavView]);

  // When incident changes, sync candidate selection
  useEffect(() => {
    setSelectedCandidateId(currentIncident.candidateVessels[0]?.id || null);
    setReplayTimeIndex(3);
  }, [currentIncident.id]);

  const handleNavClick = (view: string, routePath: string) => {
    setActiveNavView(view);
    setIsMobileMenuOpen(false);
    if (onNavigateRoute) {
      onNavigateRoute(routePath);
    }
  };

  const handleSelectIncidentFromList = (id: string) => {
    setSelectedIncidentId(id);
    setActiveNavView('investigation-map');
    setIsMobileMenuOpen(false);
    if (onNavigateRoute) {
      onNavigateRoute(`/console/incidents/${id}`);
    }
  };

  if (isFieldViewActive) {
    return (
      <FieldView
        incident={currentIncident}
        selectedCandidateId={selectedCandidateId}
        onSelectCandidate={(id) => setSelectedCandidateId(id)}
        onExitFieldView={() => setIsFieldViewActive(false)}
      />
    );
  }

  // Navigation Links Component
  const renderNavLinks = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '16px 12px' }}>
      {/* OVERVIEW SECTION */}
      <div>
        <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', paddingLeft: '8px', marginBottom: '6px', textTransform: 'uppercase' }}>
          Incidents & Overview
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <button
            onClick={() => handleNavClick('overview', '/console/overview')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: activeNavView === 'overview' ? 'var(--bg-subtle)' : 'transparent',
              color: activeNavView === 'overview' ? 'var(--accent-blue)' : 'var(--text-primary)',
              fontWeight: activeNavView === 'overview' ? 600 : 500,
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%'
            }}
          >
            <LayoutDashboard size={15} /> Overview Dashboard
          </button>

          <button
            onClick={() => handleNavClick('investigation-map', `/console/incidents/${selectedIncidentId}`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: activeNavView === 'investigation-map' ? 'var(--bg-subtle)' : 'transparent',
              color: activeNavView === 'investigation-map' ? 'var(--accent-blue)' : 'var(--text-primary)',
              fontWeight: activeNavView === 'investigation-map' ? 600 : 500,
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%'
            }}
          >
            <MapIcon size={15} /> Active Investigation
          </button>

          <button
            onClick={() => handleNavClick('incidents', '/console/incidents')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: activeNavView === 'incidents' ? 'var(--bg-subtle)' : 'transparent',
              color: activeNavView === 'incidents' ? 'var(--accent-blue)' : 'var(--text-primary)',
              fontWeight: activeNavView === 'incidents' ? 600 : 500,
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%'
            }}
          >
            <Layers size={15} /> Incident Registry ({allAvailableIncidents.length})
          </button>

          <button
            onClick={() => handleNavClick('data-explorer', '/console/explorer')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: activeNavView === 'data-explorer' ? 'var(--bg-subtle)' : 'transparent',
              color: activeNavView === 'data-explorer' ? 'var(--accent-blue)' : 'var(--text-primary)',
              fontWeight: activeNavView === 'data-explorer' ? 600 : 500,
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%'
            }}
          >
            <Radio size={15} /> Satellite AOI Explorer
          </button>

          <button
            onClick={() => handleNavClick('alerts', '/console/alerts')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: activeNavView === 'alerts' ? 'var(--bg-subtle)' : 'transparent',
              color: activeNavView === 'alerts' ? 'var(--accent-blue)' : 'var(--text-primary)',
              fontWeight: activeNavView === 'alerts' ? 600 : 500,
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%'
            }}
          >
            <Bell size={15} /> Live Alert Feed
          </button>
        </div>
      </div>

      {/* FORENSIC TOOLS SECTION */}
      <div>
        <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', paddingLeft: '8px', marginBottom: '6px', textTransform: 'uppercase' }}>
          Forensic Analytics
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <button
            onClick={() => handleNavClick('replay', '/console/replay')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: activeNavView === 'replay' ? 'var(--bg-subtle)' : 'transparent',
              color: activeNavView === 'replay' ? 'var(--accent-blue)' : 'var(--text-primary)',
              fontWeight: activeNavView === 'replay' ? 600 : 500,
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%'
            }}
          >
            <Clock size={15} /> Forensic Replay
          </button>

          <button
            onClick={() => handleNavClick('evidence-graph', '/console/evidence-graph')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: activeNavView === 'evidence-graph' ? 'var(--bg-subtle)' : 'transparent',
              color: activeNavView === 'evidence-graph' ? 'var(--accent-blue)' : 'var(--text-primary)',
              fontWeight: activeNavView === 'evidence-graph' ? 600 : 500,
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%'
            }}
          >
            <Network size={15} /> Evidence DAG Graph
          </button>

          <button
            onClick={() => handleNavClick('kinematics', '/console/kinematics')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: activeNavView === 'kinematics' ? 'var(--bg-subtle)' : 'transparent',
              color: activeNavView === 'kinematics' ? 'var(--accent-blue)' : 'var(--text-primary)',
              fontWeight: activeNavView === 'kinematics' ? 600 : 500,
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%'
            }}
          >
            <Activity size={15} /> Kinematic Anomaly
          </button>
        </div>
      </div>

      {/* MARITIME INTELLIGENCE SECTION */}
      <div>
        <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', paddingLeft: '8px', marginBottom: '6px', textTransform: 'uppercase' }}>
          Maritime Intelligence
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <button
            onClick={() => handleNavClick('vessels', '/console/vessels')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: activeNavView === 'vessels' ? 'var(--bg-subtle)' : 'transparent',
              color: activeNavView === 'vessels' ? 'var(--accent-blue)' : 'var(--text-primary)',
              fontWeight: activeNavView === 'vessels' ? 600 : 500,
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%'
            }}
          >
            <Ship size={15} /> Vessel Intelligence
          </button>

          <button
            onClick={() => handleNavClick('hotspots', '/console/hotspots')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: activeNavView === 'hotspots' ? 'var(--bg-subtle)' : 'transparent',
              color: activeNavView === 'hotspots' ? 'var(--accent-blue)' : 'var(--text-primary)',
              fontWeight: activeNavView === 'hotspots' ? 600 : 500,
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%'
            }}
          >
            <MapPin size={15} /> Hotspots & Corridors
          </button>
        </div>
      </div>

      {/* REPORTING & DATA SECTION */}
      <div>
        <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', paddingLeft: '8px', marginBottom: '6px', textTransform: 'uppercase' }}>
          Reports & Provenance
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <button
            onClick={() => handleNavClick('reports', '/console/reports')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: activeNavView === 'reports' ? 'var(--bg-subtle)' : 'transparent',
              color: activeNavView === 'reports' ? 'var(--accent-blue)' : 'var(--text-primary)',
              fontWeight: activeNavView === 'reports' ? 600 : 500,
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%'
            }}
          >
            <FileText size={15} /> Reports Library
          </button>

          <button
            onClick={() => handleNavClick('data-sources', '/console/data')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: activeNavView === 'data-sources' ? 'var(--bg-subtle)' : 'transparent',
              color: activeNavView === 'data-sources' ? 'var(--accent-blue)' : 'var(--text-primary)',
              fontWeight: activeNavView === 'data-sources' ? 600 : 500,
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%'
            }}
          >
            <Database size={15} /> Data Sources (7)
          </button>

          <button
            onClick={() => handleNavClick('data-integrity', '/console/integrity')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: activeNavView === 'data-integrity' ? 'var(--bg-subtle)' : 'transparent',
              color: activeNavView === 'data-integrity' ? 'var(--accent-blue)' : 'var(--text-primary)',
              fontWeight: activeNavView === 'data-integrity' ? 600 : 500,
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%'
            }}
          >
            <ShieldCheck size={15} /> Data Lineage Diagnostic
          </button>

          <button
            onClick={() => handleNavClick('settings', '/console/settings')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: activeNavView === 'settings' ? 'var(--bg-subtle)' : 'transparent',
              color: activeNavView === 'settings' ? 'var(--accent-blue)' : 'var(--text-primary)',
              fontWeight: activeNavView === 'settings' ? 600 : 500,
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%'
            }}
          >
            <Sliders size={15} /> System Settings
          </button>
        </div>
      </div>
    </div>
  );

  const isMobile = windowWidth < 960;

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-body)', overflow: 'hidden' }}>
      
      {/* 0. PERSISTENT OPERATING MODE & DATA DISCLOSURE BANNER */}
      <div 
        style={{ 
          backgroundColor: '#020617', 
          borderBottom: '1px solid #1e293b', 
          color: '#94a3b8', 
          fontSize: '11px', 
          fontFamily: 'var(--font-mono)', 
          padding: '4px 16px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: '8px',
          zIndex: 50,
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Mode Switcher Toggle Pill */}
          <div style={{ display: 'flex', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '4px', padding: '1px' }}>
            <button
              onClick={() => {
                providerRegistry.setMode('LIVE');
                setPlatformMode('LIVE');
              }}
              style={{
                padding: '2px 8px',
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                fontWeight: platformMode === 'LIVE' ? 800 : 500,
                backgroundColor: platformMode === 'LIVE' ? '#059669' : 'transparent',
                color: platformMode === 'LIVE' ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
              title="Activate Real Live External Feeds (Copernicus CDSE, NOAA, GFW)"
            >
              ● LIVE DATA
            </button>
            <button
              onClick={() => {
                providerRegistry.setMode('DEMO');
                setPlatformMode('DEMO');
              }}
              style={{
                padding: '2px 8px',
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                fontWeight: platformMode === 'DEMO' ? 800 : 500,
                backgroundColor: platformMode === 'DEMO' ? '#d97706' : 'transparent',
                color: platformMode === 'DEMO' ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
              title="Activate Curated Deterministic Benchmark Case (OS-037)"
            >
              ● DEMO MODE
            </button>
          </div>

          <span>•</span>
          {platformMode === 'LIVE' ? (
            <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <strong>LIVE PIPELINE ACTIVE</strong>: Copernicus CDSE OData • NOAA GFS • INCOIS ROMS • GFW Public AIS (NRT 72h)
            </span>
          ) : (
            <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <strong>CURATED BENCHMARK DEMO</strong>: Case {selectedIncidentId} • Controlled Synthetic Data • Guaranteed Deterministic
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>SIH 2026 PS-26143 • NTRO</span>
          <span>•</span>
          <button
            onClick={() => setIsPipelineHealthOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#38bdf8',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Pipeline Health Check
          </button>
        </div>
      </div>

      {/* 1. TOP OPERATIONAL APP BAR */}
      <header
        style={{
          height: '52px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          borderBottom: '1px solid #1e293b',
          zIndex: 40,
          flexShrink: 0
        }}
      >
        {/* Left: Hamburger (mobile), Brand, & Incident Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isMobile && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="btn btn-dark btn-sm"
              style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '6px' }}
              title="Toggle Navigation Menu"
            >
              <Menu size={16} />
            </button>
          )}

          <button
            onClick={onReturnToLanding}
            className="btn btn-sm"
            style={{ backgroundColor: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Return to Public Landing Page"
          >
            <ArrowLeft size={13} />
            <span style={{ fontSize: '11px' }}>Landing</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Compass size={18} color="#0284c7" />
            <span style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc' }}>
              AquaTrace
            </span>
            {!isMobile && <span style={{ color: '#64748b' }}>/</span>}
          </div>

          {/* Incident Selector Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <select
              value={selectedIncidentId}
              onChange={(e) => handleSelectIncidentFromList(e.target.value)}
              style={{
                backgroundColor: '#1e293b',
                color: '#ffffff',
                border: '1px solid #334155',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                cursor: 'pointer',
                maxWidth: isMobile ? '130px' : '260px'
              }}
            >
              {allAvailableIncidents.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  {inc.id} — {inc.region}
                </option>
              ))}
            </select>

            {!isMobile && (
              <span
                className={`badge ${
                  currentIncident.attributionStatus === 'HIGH CORRELATION'
                    ? 'badge-blue'
                    : currentIncident.attributionStatus === 'INCONCLUSIVE'
                    ? 'badge-red'
                    : 'badge-amber'
                }`}
                style={{ fontSize: '10px' }}
              >
                {currentIncident.attributionStatus}
              </span>
            )}
          </div>
        </div>

        {/* Center: System Widgets & Live Data Status Indicator (Desktop only) */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Live Data Status Indicator Bar */}
            <button
              onClick={() => setIsPipelineHealthOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px',
                borderRadius: '4px',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                color: '#cbd5e1',
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer'
              }}
              title="Inspect Live Data Pipeline Status"
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34d399' }} />
                <span>Sat: <strong>CDSE</strong></span>
              </span>
              <span style={{ color: '#475569' }}>|</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#fbbf24' }} />
                <span>AIS: <strong>NRT 72h</strong></span>
              </span>
              <span style={{ color: '#475569' }}>|</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34d399' }} />
                <span>Ocean: <strong>ROMS</strong></span>
              </span>
              <span style={{ color: '#475569' }}>|</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34d399' }} />
                <span>Wind: <strong>NOAA</strong></span>
              </span>
            </button>

            <NextPassWidget />
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
              {currentUtcTime}
            </div>
          </div>
        )}

        {/* Right: Operational Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          
          {/* Quick Demo Case Switcher Buttons (Sleek Segmented Pill) */}
          <div style={{ display: 'flex', backgroundColor: '#1e293b', borderRadius: '4px', padding: '2px', border: '1px solid #334155' }}>
            <button
              onClick={() => handleNavClick('overview', '/console/overview')}
              style={{
                padding: '3px 8px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: activeNavView === 'overview' ? 700 : 500,
                backgroundColor: activeNavView === 'overview' ? '#0284c7' : 'transparent',
                color: activeNavView === 'overview' ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
              title="Open Operational Overview Dashboard"
            >
              Overview
            </button>

            <button
              onClick={() => handleSelectIncidentFromList('OS-037')}
              style={{
                padding: '3px 8px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: selectedIncidentId === 'OS-037' && activeNavView === 'investigation-map' ? 700 : 500,
                backgroundColor: selectedIncidentId === 'OS-037' && activeNavView === 'investigation-map' ? '#ea580c' : 'transparent',
                color: selectedIncidentId === 'OS-037' && activeNavView === 'investigation-map' ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
              title="Load Inconclusive Abstention Case (Gulf of Mannar)"
            >
              OS-037 (Demo)
            </button>

            <button
              onClick={() => handleSelectIncidentFromList('OS-042')}
              style={{
                padding: '3px 8px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: selectedIncidentId === 'OS-042' && activeNavView === 'investigation-map' ? 700 : 500,
                backgroundColor: selectedIncidentId === 'OS-042' && activeNavView === 'investigation-map' ? '#0284c7' : 'transparent',
                color: selectedIncidentId === 'OS-042' && activeNavView === 'investigation-map' ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
              title="Load Prime Showcase Case (MT Al-Hikma)"
            >
              OS-042
            </button>
          </div>

          {!isMobile && (
            <button
              onClick={() => setIsAuditDrawerOpen(true)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', padding: '4px 8px', backgroundColor: '#1e293b', color: '#cbd5e1', borderColor: '#334155' }}
            >
              <ShieldCheck size={13} /> Audit
            </button>
          )}

          <button
            onClick={() => setIsFieldViewActive(true)}
            className="btn btn-dark btn-sm"
            style={{ backgroundColor: '#1e293b', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', padding: '4px 8px' }}
            title="Switch to Tablet Field View"
          >
            <Tablet size={13} /> {isMobile ? '' : 'Field'}
          </button>
        </div>
      </header>

      {/* 2. BODY LAYOUT: SIDEBAR + MAIN WORKSPACE */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        
        {/* DESKTOP SIDEBAR NAVIGATION */}
        {!isMobile && (
          <aside
            style={{
              width: '200px',
              backgroundColor: '#ffffff',
              borderRight: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              flexShrink: 0,
              overflowY: 'auto',
            }}
          >
            {renderNavLinks()}

            {/* Sidebar Footer Info */}
            <div style={{ padding: '14px', borderTop: '1px solid var(--border)', backgroundColor: '#fafbfc' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                AQUATRACE v2.4 • POSTGIS
              </div>
              <div style={{ fontSize: '10px', color: 'var(--accent-teal)', fontWeight: 600, marginTop: '2px' }}>
                PROVENANCE SECURED
              </div>
            </div>
          </aside>
        )}

        {/* MOBILE SLIDE-OVER DRAWER NAVIGATION */}
        {isMobile && isMobileMenuOpen && (
          <div 
            style={{
              position: 'fixed',
              top: '52px',
              left: 0,
              width: '100%',
              height: 'calc(100% - 52px)',
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              zIndex: 50,
              display: 'flex'
            }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div 
              style={{
                width: '280px',
                height: '100%',
                backgroundColor: '#ffffff',
                borderRight: '1px solid var(--border-strong)',
                overflowY: 'auto',
                boxShadow: 'var(--shadow-xl)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>INVESTIGATION VIEWS</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}
                >
                  <CloseIcon size={18} />
                </button>
              </div>
              {renderNavLinks()}
            </div>
          </div>
        )}

        {/* MAIN WORKING AREA */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {activeNavView === 'overview' ? (
            <DashboardOverview onSelectIncident={(id) => handleSelectIncidentFromList(id)} />
          ) : activeNavView === 'investigation-map' ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
              
              {/* INCIDENT COMPACT SUMMARY HEADER (SECTION 5) */}
              <div 
                style={{
                  backgroundColor: '#070c14',
                  borderBottom: '1px solid #1e293b',
                  padding: '6px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px',
                  flexShrink: 0
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em', fontFamily: 'var(--font-mono)', margin: 0 }}>
                      INCIDENT {currentIncident.id}
                    </h2>
                    <span style={{ color: '#475569' }}>•</span>
                    <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 600 }}>
                      {currentIncident.region}
                    </span>
                    <span 
                      className={`badge ${
                        currentIncident.attributionStatus === 'INCONCLUSIVE' 
                          ? 'badge-red' 
                          : currentIncident.attributionStatus === 'HIGH CORRELATION' 
                          ? 'badge-blue' 
                          : 'badge-amber'
                      }`}
                      style={{ fontSize: '9px', fontWeight: 700, padding: '1px 6px' }}
                    >
                      {currentIncident.attributionStatus === 'INCONCLUSIVE' 
                        ? 'INCONCLUSIVE ABSTENTION' 
                        : 'HIGH CORRELATION'}
                    </span>
                  </div>

                  {/* Compact Metadata Strip */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#94a3b8', flexWrap: 'wrap' }}>
                    <span>Sensor: <strong style={{ color: '#f8fafc' }}>{currentIncident.satelliteScene.satellite.split(' ')[0]}</strong></span>
                    <span>•</span>
                    <span>Area: <strong style={{ color: '#38bdf8' }}>{currentIncident.slickProperties.areaKm2} km²</strong></span>
                    <span>•</span>
                    <span>Age: <strong style={{ color: '#fbbf24' }}>{currentIncident.slickProperties.estimatedAgeHours.split('(')[0].trim()}</strong></span>
                    <span>•</span>
                    <span>Origin: <strong style={{ color: currentIncident.slickProperties.confidencePct > 70 ? '#34d399' : '#f87171' }}>{currentIncident.slickProperties.confidencePct.toFixed(0)}%</strong></span>
                    <span>•</span>
                    <span>AIS: <strong style={{ color: '#38bdf8' }}>{currentIncident.candidateVessels.length} vessels</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setIsTimelineVisible(!isTimelineVisible)}
                    className="btn btn-secondary btn-sm"
                    style={{
                      backgroundColor: isTimelineVisible ? '#1e293b' : 'transparent',
                      color: isTimelineVisible ? '#38bdf8' : '#94a3b8',
                      borderColor: isTimelineVisible ? '#38bdf8' : '#334155',
                      fontSize: '11px',
                      padding: '3px 8px',
                      minHeight: '26px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                    title="Toggle Replay Timeline Scrubber"
                  >
                    <Clock size={12} />
                    <span>{isTimelineVisible ? 'Hide Timeline' : 'Replay Timeline'}</span>
                  </button>

                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, padding: '4px 10px', minHeight: '26px' }}
                  >
                    <FileText size={12} /> Generate Investigation Report
                  </button>
                </div>
              </div>

              {/* HORIZONTAL INVESTIGATION PIPELINE (SECTION 6) */}
              <InvestigationPipeline
                incident={currentIncident}
                activeStageId={activeInspectorTab}
                onSelectStage={(stageTab) => {
                  setActiveInspectorTab(stageTab as any);
                }}
              />

              {/* SPLIT WORKSPACE: MAP (LEFT) + ANALYTICAL INSPECTOR (RIGHT) */}
              {isMobile ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                  <div style={{ height: '360px', minHeight: '360px', flexShrink: 0, position: 'relative' }}>
                    <InvestigationMap
                      incident={currentIncident}
                      selectedCandidateId={selectedCandidateId}
                      onSelectCandidate={(id) => setSelectedCandidateId(id)}
                      replayTimeIndex={replayTimeIndex}
                      showCounterfactualOverlay={isCounterfactualOverlayActive}
                    />
                  </div>
                  {isTimelineVisible && (
                    <div style={{ flexShrink: 0, position: 'relative' }}>
                      <ReplayTimeline
                        incident={currentIncident}
                        currentTimeIndex={replayTimeIndex}
                        onTimeChange={(idx) => setReplayTimeIndex(idx)}
                      />
                    </div>
                  )}
                  {/* Mobile Tab Strip */}
                  <div style={{ display: 'flex', backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b', overflowX: 'auto', flexShrink: 0, padding: '4px', gap: '4px' }}>
                    <button onClick={() => setActiveInspectorTab('vessels')} className={`btn btn-sm ${activeInspectorTab === 'vessels' ? 'btn-primary' : 'btn-dark'}`} style={{ fontSize: '10.5px' }}>Vessels</button>
                    <button onClick={() => setActiveInspectorTab('satellite')} className={`btn btn-sm ${activeInspectorTab === 'satellite' ? 'btn-primary' : 'btn-dark'}`} style={{ fontSize: '10.5px' }}>Satellite</button>
                    <button onClick={() => setActiveInspectorTab('origin-drift')} className={`btn btn-sm ${activeInspectorTab === 'origin-drift' ? 'btn-primary' : 'btn-dark'}`} style={{ fontSize: '10.5px' }}>Origin/Drift</button>
                    <button onClick={() => setActiveInspectorTab('forensic-chain')} className={`btn btn-sm ${activeInspectorTab === 'forensic-chain' ? 'btn-primary' : 'btn-dark'}`} style={{ fontSize: '10.5px' }}>Evidence DAG</button>
                    <button onClick={() => setActiveInspectorTab('provenance')} className={`btn btn-sm ${activeInspectorTab === 'provenance' ? 'btn-primary' : 'btn-dark'}`} style={{ fontSize: '10.5px' }}>Provenance</button>
                  </div>
                  <div style={{ flex: 1 }}>
                    {activeInspectorTab === 'vessels' && (
                      <VesselsOfInterestPanel
                        incident={currentIncident}
                        selectedCandidateId={selectedCandidateId}
                        onSelectCandidate={(id) => setSelectedCandidateId(id)}
                        isCounterfactualOverlayActive={isCounterfactualOverlayActive}
                        onToggleCounterfactualOverlay={(active) => setIsCounterfactualOverlayActive(active)}
                        activeSimulationResult={activeSimulationResult}
                        onSimulationResultChange={(result) => setActiveSimulationResult(result)}
                        activeSimulationFrameIndex={activeSimulationFrameIndex}
                        onSimulationFrameIndexChange={(frame) => setActiveSimulationFrameIndex(frame)}
                        showSimulationParticles={showSimulationParticles}
                        onToggleSimulationParticles={(show) => setShowSimulationParticles(show)}
                      />
                    )}
                    {activeInspectorTab === 'satellite' && (
                      <SatelliteObservationPanel incident={currentIncident} />
                    )}
                    {activeInspectorTab === 'origin-drift' && (
                      <OriginDriftPanel incident={currentIncident} />
                    )}
                    {activeInspectorTab === 'forensic-chain' && (
                      <ForensicEvidenceChainPanel incident={currentIncident} />
                    )}
                    {activeInspectorTab === 'provenance' && (
                      <ProvenanceTimelinePanel incident={currentIncident} />
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: windowWidth < 1300 ? '1fr 410px' : '1fr 450px', overflow: 'hidden' }}>
                  
                  {/* Left: Leaflet GIS Map + Optional Replay Timeline */}
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <InvestigationMap
                        incident={currentIncident}
                        selectedCandidateId={selectedCandidateId}
                        onSelectCandidate={(id) => setSelectedCandidateId(id)}
                        replayTimeIndex={replayTimeIndex}
                        showCounterfactualOverlay={isCounterfactualOverlayActive}
                        simulationResult={activeSimulationResult}
                        simulationFrameIndex={activeSimulationFrameIndex}
                        showParticles={showSimulationParticles}
                      />
                    </div>
                    {isTimelineVisible && (
                      <div style={{ position: 'relative', borderTop: '1px solid var(--border)' }}>
                        <button
                          onClick={() => setIsTimelineVisible(false)}
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '12px',
                            zIndex: 10,
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                          title="Hide Timeline"
                        >
                          ✕ Close
                        </button>
                        <ReplayTimeline
                          incident={currentIncident}
                          currentTimeIndex={replayTimeIndex}
                          onTimeChange={(idx) => setReplayTimeIndex(idx)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Right: Analytical Inspector Tabs & Content Container */}
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', borderLeft: '1px solid var(--border)', backgroundColor: '#ffffff' }}>
                    {/* Inspector Top Tab Selector */}
                    <div 
                      style={{ 
                        display: 'flex', 
                        backgroundColor: '#0a1120', 
                        borderBottom: '1px solid #1e293b', 
                        overflowX: 'auto', 
                        flexShrink: 0,
                        padding: '4px 6px',
                        gap: '4px'
                      }}
                    >
                      <button
                        onClick={() => setActiveInspectorTab('vessels')}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: activeInspectorTab === 'vessels' ? '#1e293b' : 'transparent',
                          color: activeInspectorTab === 'vessels' ? '#38bdf8' : '#94a3b8',
                          fontWeight: activeInspectorTab === 'vessels' ? 700 : 500,
                          fontSize: '11px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          whiteSpace: 'nowrap',
                          borderBottom: activeInspectorTab === 'vessels' ? '2px solid #38bdf8' : '2px solid transparent',
                        }}
                      >
                        <Ship size={13} /> Vessels & Attribution ({currentIncident.candidateVessels.length})
                      </button>

                      <button
                        onClick={() => setActiveInspectorTab('satellite')}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: activeInspectorTab === 'satellite' ? '#1e293b' : 'transparent',
                          color: activeInspectorTab === 'satellite' ? '#38bdf8' : '#94a3b8',
                          fontWeight: activeInspectorTab === 'satellite' ? 700 : 500,
                          fontSize: '11px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          whiteSpace: 'nowrap',
                          borderBottom: activeInspectorTab === 'satellite' ? '2px solid #38bdf8' : '2px solid transparent',
                        }}
                      >
                        <Radar size={13} /> Satellite & Validation
                      </button>

                      <button
                        onClick={() => setActiveInspectorTab('origin-drift')}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: activeInspectorTab === 'origin-drift' ? '#1e293b' : 'transparent',
                          color: activeInspectorTab === 'origin-drift' ? '#38bdf8' : '#94a3b8',
                          fontWeight: activeInspectorTab === 'origin-drift' ? 700 : 500,
                          fontSize: '11px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          whiteSpace: 'nowrap',
                          borderBottom: activeInspectorTab === 'origin-drift' ? '2px solid #38bdf8' : '2px solid transparent',
                        }}
                      >
                        <RotateCcw size={13} /> Origin & Drift
                      </button>

                      <button
                        onClick={() => setActiveInspectorTab('forensic-chain')}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: activeInspectorTab === 'forensic-chain' ? '#1e293b' : 'transparent',
                          color: activeInspectorTab === 'forensic-chain' ? '#38bdf8' : '#94a3b8',
                          fontWeight: activeInspectorTab === 'forensic-chain' ? 700 : 500,
                          fontSize: '11px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          whiteSpace: 'nowrap',
                          borderBottom: activeInspectorTab === 'forensic-chain' ? '2px solid #38bdf8' : '2px solid transparent',
                        }}
                      >
                        <Network size={13} /> Evidence DAG
                      </button>

                      <button
                        onClick={() => setActiveInspectorTab('provenance')}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: activeInspectorTab === 'provenance' ? '#1e293b' : 'transparent',
                          color: activeInspectorTab === 'provenance' ? '#38bdf8' : '#94a3b8',
                          fontWeight: activeInspectorTab === 'provenance' ? 700 : 500,
                          fontSize: '11px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          whiteSpace: 'nowrap',
                          borderBottom: activeInspectorTab === 'provenance' ? '2px solid #38bdf8' : '2px solid transparent',
                        }}
                      >
                        <Clock size={13} /> Timeline & Audit
                      </button>
                    </div>

                    {/* Inspector Panel Active View */}
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                      {activeInspectorTab === 'vessels' && (
                        <VesselsOfInterestPanel
                          incident={currentIncident}
                          selectedCandidateId={selectedCandidateId}
                          onSelectCandidate={(id) => setSelectedCandidateId(id)}
                          isCounterfactualOverlayActive={isCounterfactualOverlayActive}
                          onToggleCounterfactualOverlay={(active) => setIsCounterfactualOverlayActive(active)}
                          activeSimulationResult={activeSimulationResult}
                          onSimulationResultChange={(result) => setActiveSimulationResult(result)}
                          activeSimulationFrameIndex={activeSimulationFrameIndex}
                          onSimulationFrameIndexChange={(frame) => setActiveSimulationFrameIndex(frame)}
                          showSimulationParticles={showSimulationParticles}
                          onToggleSimulationParticles={(show) => setShowSimulationParticles(show)}
                        />
                      )}
                      {activeInspectorTab === 'satellite' && (
                        <SatelliteObservationPanel incident={currentIncident} />
                      )}
                      {activeInspectorTab === 'origin-drift' && (
                        <OriginDriftPanel incident={currentIncident} />
                      )}
                      {activeInspectorTab === 'forensic-chain' && (
                        <ForensicEvidenceChainPanel incident={currentIncident} />
                      )}
                      {activeInspectorTab === 'provenance' && (
                        <ProvenanceTimelinePanel incident={currentIncident} />
                      )}
                    </div>
                  </div>

                </div>
              )}
            </div>
          ) : activeNavView === 'incidents' ? (
            <IncidentsListView onSelectIncident={(id) => handleSelectIncidentFromList(id)} />
          ) : activeNavView === 'vessels' ? (
            <VesselIntelligenceView />
          ) : activeNavView === 'replay' ? (
            <ForensicReplayView incident={currentIncident} />
          ) : activeNavView === 'reports' ? (
            <ReportsArchiveView />
          ) : activeNavView === 'settings' ? (
            <SettingsView />
          ) : activeNavView === 'evidence-graph' ? (
            <EvidenceGraphView incident={currentIncident} />
          ) : activeNavView === 'kinematics' ? (
            <KinematicCheckView incident={currentIncident} />
          ) : activeNavView === 'hotspots' ? (
            <HotspotsView />
          ) : activeNavView === 'data-explorer' ? (
            <DataExplorerView onSelectIncident={(id) => handleSelectIncidentFromList(id)} />
          ) : activeNavView === 'data-sources' ? (
            <DataSourcesView />
          ) : activeNavView === 'data-integrity' ? (
            <DataIntegrityView />
          ) : activeNavView === 'alerts' ? (
            <AlertFeed onSelectIncident={(id) => handleSelectIncidentFromList(id)} />
          ) : null}

        </main>

      </div>

      {/* MODALS */}
      {isReportModalOpen && (
        <InvestigationReportModal
          incident={currentIncident}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      <AuditTrailDrawer
        incident={currentIncident}
        isOpen={isAuditDrawerOpen}
        onClose={() => setIsAuditDrawerOpen(false)}
      />

      <PipelineHealthModal
        isOpen={isPipelineHealthOpen}
        onClose={() => setIsPipelineHealthOpen(false)}
      />

    </div>
  );
};
