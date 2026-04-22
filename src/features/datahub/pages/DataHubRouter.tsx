import { useEffect, useState } from 'react';
import { CollectionWizard } from '../components/CollectionWizard';
import { DataHubDashboardPage } from './DataHubDashboardPage';
import { DataHubPlaceholderPage } from './DataHubPlaceholderPage';

function readHashPath() {
  const hash = window.location.hash;
  return hash.replace(/^#/, '').split('?')[0] || '/';
}

function navigateHash(path: string) {
  window.location.hash = `#${path}`;
}

export function DataHubRouter() {
  const [path, setPath] = useState(readHashPath);

  useEffect(() => {
    const onChange = () => setPath(readHashPath());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  if (path === '/datahub' || path === '/datahub/') {
    return <DataHubDashboardPage />;
  }
  if (path === '/datahub/new') {
    return <CollectionWizard onExit={() => navigateHash('/datahub')} />;
  }
  return <DataHubPlaceholderPage />;
}

export default DataHubRouter;
