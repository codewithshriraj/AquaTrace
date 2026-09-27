import React, { useState, useEffect } from 'react';
import { Incident } from '../../types';
import { mockIncidents } from '../../data/mockIncidents';
import { InvestigationMap } from './InvestigationMap';
import { ReplayTimeline } from './ReplayTimeline';
import { CandidateAnalysisPanel } from './CandidateAnalysisPanel';
import { EvidenceGraphView } from './EvidenceGraphView';
import { KinematicCheckView } from './KinematicCheckView';
import { HotspotsView } from './HotspotsView';
import { DataSourcesView } from './DataSourcesView';
import { AlertFeed } from './AlertFeed';
import { FieldView } from './FieldView';
import { IncidentsListView } from './IncidentsListView';
import { VesselIntelligenceView } from './VesselIntelligenceView';
import { ForensicReplayView } from './ForensicReplayView';
import { ReportsArchiveView } from './ReportsArchiveView';
import { SettingsView } from './SettingsView';
import { InvestigationReportModal } from './InvestigationReportModal';
import { AuditTrailDrawer } from './AuditTrailDrawer';
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
  Network
} from 'lucide-react';

interface ConsoleWorkspaceProps {
  initialIncidentId?: string;
  initialNavView?: string;
  onReturnToLanding: () => void;
  onNavigateRoute?: (path: string) => void;
}

export const ConsoleWorkspace: React.FC<ConsoleWorkspaceProps> = ({
  initialIncidentId = 'OS-042',
  initialNavView = 'investigation-map',
  onReturnToLanding,
  onNavigateRoute,
}) => {
  // Current active incident
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(initialIncidentId);
  const currentIncident = mockIncidents.find((i) => i.id === selectedIncidentId) || mockIncidents[0];

  // Active navigation view
  const [activeNavView, setActiveNavView] = useState<string>(initialNavView);

  // Candidate selection
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    currentIncident.candidateVessels[0]?.id || null
  );

  // Counterfactual overlay toggle
  const [isCounterfactualOverlayActive, setIsCounterfactualOverlayActive] = useState<boolean>(true);

  // Replay timeline index
  const [replayTimeIndex, setReplayTimeIndex] = useState<number>(3);

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
            <Layers size={15} /> Incident Registry ({mockIncidents.length})
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
      
      {/* 0. PERSISTENT DEMONSTRATION DISCLOSURE BANNER */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#f59e0b', fontWeight: 700 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }}></span>
            DEMONSTRATION MODE
          </span>
          <span>•</span>
          <span>CASE: <strong style={{ color: '#f8fafc' }}>{selectedIncidentId}</strong></span>
          <span>•</span>
          <span>SYNTHETIC AIS TELEMETRY (MarineCadastre format)</span>
          <span>•</span>
          <span>SIMULATED METOCEAN FORCING</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>SIH 2026 PS 143 • NTRO</span>
          <span>•</span>
          <span style={{ color: '#38bdf8' }}>EVALUATION BENCHMARK: ZENODO (JRC)</span>
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
              {mockIncidents.map((inc) => (
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

        {/* Center: System Widgets (Desktop only) */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <NextPassWidget />
            <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
              {currentUtcTime}
            </div>
          </div>
        )}

        {/* Right: Operational Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          
          {/* Quick Demo Case Switcher Buttons */}
          <button
            onClick={() => handleSelectIncidentFromList('OS-042')}
            className={`btn btn-sm ${selectedIncidentId === 'OS-042' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '3px 8px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}
            title="Load Prime Showcase Case (MT Al-Hikma)"
          >
            OS-042
          </button>

          <button
            onClick={() => handleSelectIncidentFromList('OS-037')}
            className={`btn btn-sm ${selectedIncidentId === 'OS-037' ? 'btn-amber' : 'btn-secondary'}`}
            style={{ padding: '3px 8px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}
            title="Load Inconclusive Abstention Case (Gulf of Mannar)"
          >
            OS-037
          </button>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}
          >
            <FileText size={13} /> {isMobile ? '' : 'Report'}
          </button>

          {!isMobile && (
            <button
              onClick={() => setIsAuditDrawerOpen(true)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}
            >
              <ShieldCheck size={13} /> Audit
            </button>
          )}

          <button
            onClick={() => setIsFieldViewActive(true)}
            className="btn btn-dark btn-sm"
            style={{ backgroundColor: '#1e293b', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}
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
              width: '230px',
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
          
          {activeNavView === 'investigation-map' ? (
            isMobile ? (
              // Mobile stacked layout: Map on top (380px), Candidate Analysis Panel scrolling underneath
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                <div style={{ height: '380px', minHeight: '380px', flexShrink: 0, position: 'relative' }}>
                  <InvestigationMap
                    incident={currentIncident}
                    selectedCandidateId={selectedCandidateId}
                    onSelectCandidate={(id) => setSelectedCandidateId(id)}
                    replayTimeIndex={replayTimeIndex}
                    showCounterfactualOverlay={isCounterfactualOverlayActive}
                  />
                </div>

                <div style={{ flexShrink: 0 }}>
                  <ReplayTimeline
                    incident={currentIncident}
                    currentTimeIndex={replayTimeIndex}
                    onTimeChange={(idx) => setReplayTimeIndex(idx)}
                  />
                </div>

                <div style={{ flex: 1, borderTop: '1px solid var(--border)' }}>
                  <CandidateAnalysisPanel
                    incident={currentIncident}
                    selectedCandidateId={selectedCandidateId}
                    onSelectCandidate={(id) => setSelectedCandidateId(id)}
                    isCounterfactualOverlayActive={isCounterfactualOverlayActive}
                    onToggleCounterfactualOverlay={(active) => setIsCounterfactualOverlayActive(active)}
                  />
                </div>
              </div>
            ) : (
              // Desktop side-by-side layout: Map (approx 65%) + Candidate Panel (approx 35%)
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: windowWidth < 1200 ? '1fr 340px' : '1fr 390px', overflow: 'hidden' }}>
                
                {/* GIS Map & Bottom Replay Timeline */}
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <InvestigationMap
                      incident={currentIncident}
                      selectedCandidateId={selectedCandidateId}
                      onSelectCandidate={(id) => setSelectedCandidateId(id)}
                      replayTimeIndex={replayTimeIndex}
                      showCounterfactualOverlay={isCounterfactualOverlayActive}
                    />
                  </div>

                  {/* Bottom Incident Replay Timeline */}
                  <ReplayTimeline
                    incident={currentIncident}
                    currentTimeIndex={replayTimeIndex}
                    onTimeChange={(idx) => setReplayTimeIndex(idx)}
                  />
                </div>

                {/* Right Analytical Candidate Analysis Panel */}
                <CandidateAnalysisPanel
                  incident={currentIncident}
                  selectedCandidateId={selectedCandidateId}
                  onSelectCandidate={(id) => setSelectedCandidateId(id)}
                  isCounterfactualOverlayActive={isCounterfactualOverlayActive}
                  onToggleCounterfactualOverlay={(active) => setIsCounterfactualOverlayActive(active)}
                />

              </div>
            )
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
          ) : activeNavView === 'data-sources' ? (
            <DataSourcesView />
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

    </div>
  );
};
