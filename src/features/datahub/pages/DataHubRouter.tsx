import { useEffect, useState } from 'react';
import { DataHubDashboardPage } from './DataHubDashboardPage';
import { DataHubPlaceholderPage } from './DataHubPlaceholderPage';

function readHashPath() {
  const hash = window.location.hash;
  return hash.replace(/^#/, '').split('?')[0] || '/';
}

export function DataHubRouter() {
  const [path, setPath] = useState(readHashPath);

  useEffect(() => {
    const onChange = () => setPath(readHashPath());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  // Root → dashboard. Sub-routes (/datahub/new, /datahub/:id, /datahub/:id/view-as-lp)
  // still hit the placeholder until the wizard / detail screens land.
  if (path === '/datahub' || path === '/datahub/') {
    return <DataHubDashboardPage />;
  }
  return <DataHubPlaceholderPage />;
}

export default DataHubRouter;
