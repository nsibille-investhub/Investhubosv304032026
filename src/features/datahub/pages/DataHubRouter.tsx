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

  const isRoot = path === '/datahub' || path === '/datahub/';
  const isWizard = path === '/datahub/new';

  if (isRoot || isWizard) {
    return (
      <>
        <DataHubDashboardPage />
        <CollectionWizard
          open={isWizard}
          onClose={() => navigateHash('/datahub')}
        />
      </>
    );
  }

  return <DataHubPlaceholderPage />;
}

export default DataHubRouter;
