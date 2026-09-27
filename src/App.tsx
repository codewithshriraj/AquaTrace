import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/landing/LandingPage';
import { ConsoleWorkspace } from './components/console/ConsoleWorkspace';

function getNormalizedPath(): string {
  // 1. Check hash routing first (e.g. #/console/...)
  const hash = window.location.hash.replace(/^#/, '');
  if (hash.startsWith('/console')) {
    return hash;
  }

  // 2. Normalize pathname by stripping GitHub Pages repository subpath (e.g. /AquaTrace)
  let path = window.location.pathname;
  if (path.startsWith('/AquaTrace')) {
    path = path.slice('/AquaTrace'.length);
    if (!path.startsWith('/')) path = '/' + path;
  }
  return path || '/';
}

function getBasePrefix(): string {
  return window.location.pathname.startsWith('/AquaTrace') ? '/AquaTrace' : '';
}

function parseUrlState() {
  const path = getNormalizedPath();
  if (!path.startsWith('/console')) {
    return {
      route: 'landing' as const,
      navView: 'investigation-map',
      incidentId: 'OS-042',
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
      incidentId: 'OS-042',
    };
  }

  if (path.startsWith('/console/vessels')) {
    return {
      route: 'console' as const,
      navView: 'vessels',
      incidentId: 'OS-042',
    };
  }

  if (path.startsWith('/console/alerts')) {
    return {
      route: 'console' as const,
      navView: 'alerts',
      incidentId: 'OS-042',
    };
  }

  if (path.startsWith('/console/replay')) {
    return {
      route: 'console' as const,
      navView: 'replay',
      incidentId: 'OS-042',
    };
  }

  if (path.startsWith('/console/data')) {
    return {
      route: 'console' as const,
      navView: 'data-sources',
      incidentId: 'OS-042',
    };
  }

  if (path.startsWith('/console/reports')) {
    return {
      route: 'console' as const,
      navView: 'reports',
      incidentId: 'OS-042',
    };
  }

  if (path.startsWith('/console/settings')) {
    return {
      route: 'console' as const,
      navView: 'settings',
      incidentId: 'OS-042',
    };
  }

  if (path.startsWith('/console/evidence-graph')) {
    return {
      route: 'console' as const,
      navView: 'evidence-graph',
      incidentId: 'OS-042',
    };
  }

  if (path.startsWith('/console/kinematics')) {
    return {
      route: 'console' as const,
      navView: 'kinematics',
      incidentId: 'OS-042',
    };
  }

  if (path.startsWith('/console/hotspots')) {
    return {
      route: 'console' as const,
      navView: 'hotspots',
      incidentId: 'OS-042',
    };
  }

  // Default /console
  return {
    route: 'console' as const,
    navView: 'investigation-map',
    incidentId: 'OS-042',
  };
}

export function App() {
  const [urlState, setUrlState] = useState(parseUrlState);

  useEffect(() => {
    const handlePopState = () => {
      setUrlState(parseUrlState());
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigateToConsole = (incidentId?: string) => {
    const targetId = incidentId || 'OS-042';
    const targetSubpath = incidentId ? `/console/incidents/${incidentId}` : '/console';
    const prefix = getBasePrefix();
    const fullPath = `${prefix}${targetSubpath}`;
    window.history.pushState({}, '', fullPath);
    setUrlState({
      route: 'console',
      navView: 'investigation-map',
      incidentId: targetId,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToLanding = () => {
    const prefix = getBasePrefix();
    window.history.pushState({}, '', prefix ? `${prefix}/` : '/');
    setUrlState({
      route: 'landing',
      navView: 'investigation-map',
      incidentId: 'OS-042',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateRoute = (subpath: string) => {
    const prefix = getBasePrefix();
    const fullPath = `${prefix}${subpath}`;
    window.history.pushState({}, '', fullPath);
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
