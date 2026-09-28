import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/landing/LandingPage';
import { ConsoleWorkspace } from './components/console/ConsoleWorkspace';

function parseUrlState() {
  const path = window.location.pathname;
  if (!path.startsWith('/console')) {
    return {
      route: 'landing' as const,
      navView: 'investigation-map',
      incidentId: 'OS-037',
    };
  }

  // Handle /console/overview
  if (path === '/console/overview' || path === '/console/overview/') {
    return {
      route: 'console' as const,
      navView: 'overview',
      incidentId: 'OS-037',
    };
  }

  // Handle /console/incidents/OS-XXX
  const incidentMatch = path.match(/^\/console\/incidents\/([a-zA-Z0-9_-]+)/);
  if (incidentMatch) {
    return {
      route: 'console' as const,
      navView: 'investigation-map',
      incidentId: incidentMatch[1],
    };
  }

  if (path === '/console/incidents' || path === '/console/incidents/') {
    return {
      route: 'console' as const,
      navView: 'incidents',
      incidentId: 'OS-037',
    };
  }

  if (path.startsWith('/console/vessels')) {
    return {
      route: 'console' as const,
      navView: 'vessels',
      incidentId: 'OS-037',
    };
  }

  if (path.startsWith('/console/alerts')) {
    return {
      route: 'console' as const,
      navView: 'alerts',
      incidentId: 'OS-037',
    };
  }

  if (path.startsWith('/console/replay')) {
    return {
      route: 'console' as const,
      navView: 'replay',
      incidentId: 'OS-037',
    };
  }

  if (path.startsWith('/console/explorer') || path.startsWith('/console/data-explorer')) {
    return {
      route: 'console' as const,
      navView: 'data-explorer',
      incidentId: 'OS-037',
    };
  }

  if (path.startsWith('/console/integrity') || path.startsWith('/console/data-integrity')) {
    return {
      route: 'console' as const,
      navView: 'data-integrity',
      incidentId: 'OS-037',
    };
  }

  if (path.startsWith('/console/data')) {
    return {
      route: 'console' as const,
      navView: 'data-sources',
      incidentId: 'OS-037',
    };
  }

  if (path.startsWith('/console/reports')) {
    return {
      route: 'console' as const,
      navView: 'reports',
      incidentId: 'OS-037',
    };
  }

  if (path.startsWith('/console/settings')) {
    return {
      route: 'console' as const,
      navView: 'settings',
      incidentId: 'OS-037',
    };
  }

  if (path.startsWith('/console/evidence-graph')) {
    return {
      route: 'console' as const,
      navView: 'evidence-graph',
      incidentId: 'OS-037',
    };
  }

  if (path.startsWith('/console/kinematics')) {
    return {
      route: 'console' as const,
      navView: 'kinematics',
      incidentId: 'OS-037',
    };
  }

  if (path.startsWith('/console/hotspots')) {
    return {
      route: 'console' as const,
      navView: 'hotspots',
      incidentId: 'OS-037',
    };
  }

  // Default /console
  return {
    route: 'console' as const,
    navView: 'investigation-map',
    incidentId: 'OS-037',
  };
}

export function App() {
  const [urlState, setUrlState] = useState(parseUrlState);

  useEffect(() => {
    const handlePopState = () => {
      setUrlState(parseUrlState());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToConsole = (incidentId?: string) => {
    const targetId = incidentId || 'OS-037';
    const targetPath = incidentId ? `/console/incidents/${incidentId}` : '/console/incidents/OS-037';
    window.history.pushState({}, '', targetPath);
    setUrlState({
      route: 'console',
      navView: 'investigation-map',
      incidentId: targetId,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToLanding = () => {
    window.history.pushState({}, '', '/');
    setUrlState({
      route: 'landing',
      navView: 'investigation-map',
      incidentId: 'OS-037',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateRoute = (path: string) => {
    window.history.pushState({}, '', path);
    setUrlState(parseUrlState());
  };

  return (
    <>
      {urlState.route === 'landing' ? (
        <LandingPage onEnterConsole={navigateToConsole} />
      ) : (
        <ConsoleWorkspace
          key={`${urlState.incidentId}-${urlState.navView}`}
          initialIncidentId={urlState.incidentId}
          initialNavView={urlState.navView}
          onReturnToLanding={navigateToLanding}
          onNavigateRoute={handleNavigateRoute}
        />
      )}
    </>
  );
}

export default App;
