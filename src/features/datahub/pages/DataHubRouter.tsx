import { useEffect, useMemo, useState } from 'react';
import { CollectionWizard } from '../components/CollectionWizard';
import { DemoScenarioHelper } from '../components/DemoScenarioHelper';
import { CollectionsProvider } from '../context/CollectionsContext';
import { CollectionDetailPage } from './CollectionDetailPage';
import { DataHubDashboardPage } from './DataHubDashboardPage';
import { DataHubPlaceholderPage } from './DataHubPlaceholderPage';
import { ViewAsLpPage } from './ViewAsLpPage';
import type { Collection } from '../types';

interface ParsedHash {
  path: string;
  params: URLSearchParams;
}

function parseHash(): ParsedHash {
  const hash = window.location.hash.replace(/^#/, '');
  const [rawPath, query] = hash.split('?');
  return {
    path: rawPath || '/',
    params: new URLSearchParams(query ?? ''),
  };
}

function navigateHash(path: string) {
  window.location.hash = `#${path}`;
}

const VIEW_AS_LP_RE = /^\/datahub\/([^/]+)\/view-as-lp$/;
const DETAIL_RE = /^\/datahub\/([^/]+)$/;

function InnerRouter() {
  const [hash, setHash] = useState<ParsedHash>(() => parseHash());

  useEffect(() => {
    const onChange = () => setHash(parseHash());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const demoVisible = hash.params.get('demo') === '1';

  const content = useMemo(() => {
    const { path } = hash;
    if (path === '/datahub' || path === '/datahub/') {
      return <DataHubDashboardPage />;
    }
    if (path === '/datahub/new') {
      return (
        <CollectionWizard
          onExit={() => navigateHash('/datahub')}
          onCreated={(collectionId) => navigateHash(`/datahub/${collectionId}`)}
        />
      );
    }
    const viewAs = path.match(VIEW_AS_LP_RE);
    if (viewAs) {
      return (
        <ViewAsLpPage
          collectionKey={viewAs[1]}
          onExit={() => navigateHash(`/datahub/${viewAs[1]}`)}
        />
      );
    }
    const detail = path.match(DETAIL_RE);
    if (detail) {
      const collectionKey = detail[1];
      const gotoDashboard = () => navigateHash('/datahub');
      const refresh = (collection: Collection) => {
        navigateHash(`/datahub?refresh=${collection.id}`);
      };
      const viewAsLp = (collection: Collection) => {
        navigateHash(`/datahub/${collection.id}/view-as-lp`);
      };
      return (
        <CollectionDetailPage
          collectionKey={collectionKey}
          onExit={gotoDashboard}
          onRefresh={refresh}
          onViewAsLp={viewAsLp}
        />
      );
    }
    return <DataHubPlaceholderPage />;
  }, [hash]);

  return (
    <>
      {content}
      <DemoScenarioHelper visible={demoVisible} />
    </>
  );
}

export function DataHubRouter() {
  return (
    <CollectionsProvider>
      <InnerRouter />
    </CollectionsProvider>
  );
}

export default DataHubRouter;
