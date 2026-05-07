// Hash-based routing utilities for InvestHub

export type Page = 
  | 'entities' 
  | 'documents' 
  | 'subscriptions' 
  | 'monitoring' 
  | 'dossiers' 
  | 'tracking'
  | 'birdview'
  | 'validation'
  | 'investors'
  | 'partners'
  | 'retrocessions'
  | 'allfunds'
  | 'events'
  | 'news'
  | 'datahub'
  | 'design-system'
  | 'pitch-deck'
  | 'whats-new'
  | 'settings-app-store' 
  | 'settings-users' 
  | 'settings-teams' 
  | 'settings-rights' 
  | 'settings-mail-history' 
  | 'settings-sms-history' 
  | 'settings-mail-templates' 
  | 'settings-mail-stats' 
  | 'settings-mail-groups'
  | 'settings-investor-status' 
  | 'settings-deal-status' 
  | 'settings-deal-types' 
  | 'settings-flow-types' 
  | 'settings-management-companies' 
  | 'settings-custom-fields' 
  | 'settings-custom-status' 
  | 'settings-countries-risks' 
  | 'settings-providers' 
  | 'settings-chart-of-accounts'
  | 'settings-logs' 
  | 'settings-logs-lemonway' 
  | 'settings-logs-harvest' 
  | 'settings-known-ips' 
  | 'settings-docusign'
  | 'settings-controls' 
  | 'settings-aics' 
  | 'settings-imports' 
  | 'settings-hosted-files' 
  | 'settings-section-categories'
  | 'settings-reporting' 
  | 'settings-reports' 
  | 'settings-queries' 
  | 'settings-variable-formatting' 
  | 'settings-tools'
  | 'settings-conventions';

// Map internal page names to URL paths
const PAGE_TO_PATH: Record<Page, string> = {
  'entities': '/entities',
  'documents': '/documents',
  'subscriptions': '/subscriptions',
  'monitoring': '/monitoring',
  'dossiers': '/dossiers',
  'tracking': '/tracking',
  'birdview': '/birdview',
  'validation': '/validation',
  'investors': '/investors',
  'partners': '/partners',
  'retrocessions': '/retrocessions',
  'allfunds': '/allfunds',
  'events': '/events',
  'news': '/news',
  'datahub': '/datahub',
  'design-system': '/design-system',
  'pitch-deck': '/pitch-deck',
  'whats-new': '/whats-new',
  'settings-app-store': '/settings/app-store',
  'settings-users': '/settings/users',
  'settings-teams': '/settings/teams',
  'settings-rights': '/settings/rights',
  'settings-mail-history': '/settings/mail-history',
  'settings-sms-history': '/settings/sms-history',
  'settings-mail-templates': '/settings/mail-templates',
  'settings-mail-stats': '/settings/mail-stats',
  'settings-mail-groups': '/settings/mail-groups',
  'settings-investor-status': '/settings/investor-status',
  'settings-deal-status': '/settings/deal-status',
  'settings-deal-types': '/settings/deal-types',
  'settings-flow-types': '/settings/flow-types',
  'settings-management-companies': '/settings/management-companies',
  'settings-custom-fields': '/settings/custom-fields',
  'settings-custom-status': '/settings/custom-status',
  'settings-countries-risks': '/settings/countries-risks',
  'settings-providers': '/settings/providers',
  'settings-chart-of-accounts': '/settings/chart-of-accounts',
  'settings-logs': '/settings/logs',
  'settings-logs-lemonway': '/settings/logs-lemonway',
  'settings-logs-harvest': '/settings/logs-harvest',
  'settings-known-ips': '/settings/known-ips',
  'settings-docusign': '/settings/docusign',
  'settings-controls': '/settings/controls',
  'settings-aics': '/settings/aics',
  'settings-imports': '/settings/imports',
  'settings-hosted-files': '/settings/hosted-files',
  'settings-section-categories': '/settings/section-categories',
  'settings-reporting': '/settings/reporting',
  'settings-reports': '/settings/reports',
  'settings-queries': '/settings/queries',
  'settings-variable-formatting': '/settings/variable-formatting',
  'settings-tools': '/settings/tools',
  'settings-conventions': '/settings/conventions',
};

// Reverse map for path to page
const PATH_TO_PAGE: Record<string, Page> = Object.fromEntries(
  Object.entries(PAGE_TO_PATH).map(([page, path]) => [path, page as Page])
);

/**
 * Get the current page from the URL hash
 */
export function getPageFromHash(): Page {
  const hash = window.location.hash;
  
  // Remove leading # and any query params
  const path = hash.replace('#', '').split('?')[0];
  
  console.log('[Routing] getPageFromHash - Full URL:', window.location.href, '- Hash:', hash, '-> Path:', path, '-> Page:', PATH_TO_PAGE[path] || 'investors (default)');
  
  // If no hash, return default but don't change URL yet
  if (!hash || hash === '#' || path === '') {
    console.log('[Routing] No hash found, defaulting to investors');
    return 'investors';
  }

  // DataHub: any subpath (/datahub, /datahub/new, /datahub/:id, /datahub/:id/view-as-lp)
  // resolves to the same page key. The page reads window.location.hash for the
  // full URL, so sub-routes are handled in-page rather than in the page enum.
  if (path === '/datahub' || path.startsWith('/datahub/')) {
    return 'datahub';
  }

  // Return the page or default to 'investors'
  const page = PATH_TO_PAGE[path];
  if (!page) {
    console.warn('[Routing] Unknown path:', path, '-> Defaulting to investors');
    return 'investors';
  }

  return page;
}

/**
 * Navigate to a specific page by updating the hash
 */
export function navigateToPage(page: Page, params?: Record<string, string>) {
  const path = PAGE_TO_PATH[page] || '/investors';
  
  // Add query params if provided
  let hash = `#${path}`;
  if (params && Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString();
    hash += `?${queryString}`;
  }
  
  // Don't navigate if we're already on this hash
  if (window.location.hash === hash) {
    console.log('[Routing] Already on page:', page, '-> Skipping navigation');
    return;
  }
  
  console.log('[Routing] Navigate to page:', page, '-> Hash:', hash, '-> Current:', window.location.hash);
  window.location.hash = hash;
}

/**
 * Get query parameters from the current hash
 */
export function getHashParams(): Record<string, string> {
  const hash = window.location.hash;
  const queryString = hash.split('?')[1];
  
  if (!queryString) return {};
  
  const params: Record<string, string> = {};
  new URLSearchParams(queryString).forEach((value, key) => {
    params[key] = value;
  });
  
  return params;
}

/**
 * Update query parameters in the current hash without changing the page
 */
export function updateHashParams(params: Record<string, string>) {
  const hash = window.location.hash;
  const path = hash.replace('#', '').split('?')[0];
  
  const queryString = new URLSearchParams(params).toString();
  window.location.hash = queryString ? `#${path}?${queryString}` : `#${path}`;
}

/**
 * Get a shareable URL for a specific page
 */
export function getShareableUrl(page: Page, params?: Record<string, string>): string {
  const path = PAGE_TO_PATH[page] || '/investors';
  const baseUrl = window.location.origin + window.location.pathname;
  
  let hash = `#${path}`;
  if (params && Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString();
    hash += `?${queryString}`;
  }
  
  return baseUrl + hash;
}

/**
 * Navigate to a detail page (investor, subscription, etc.)
 */
export function navigateToDetail(
  type: 'investor' | 'subscription' | 'entity' | 'document',
  id: string
) {
  const pathMap = {
    'investor': '/investors',
    'subscription': '/subscriptions',
    'entity': '/entities',
    'document': '/documents'
  };
  
  window.location.hash = `#${pathMap[type]}/${id}`;
}

/**
 * Get detail ID from hash (e.g., /investors/123 -> 123)
 */
export function getDetailIdFromHash(): string | null {
  const hash = window.location.hash.replace('#', '');
  const parts = hash.split('/');
  
  // If we have more than 2 parts (e.g., /investors/123), return the ID
  if (parts.length >= 3) {
    return parts[2].split('?')[0]; // Remove query params
  }
  
  return null;
}

/**
 * Listen to hash changes
 */
export function onHashChange(callback: () => void): () => void {
  window.addEventListener('hashchange', callback);
  
  // Return cleanup function
  return () => window.removeEventListener('hashchange', callback);
}
