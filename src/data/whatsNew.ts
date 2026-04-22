// Content source for the "What's New" page (Newsletters + Changelog).
// To add a newsletter: prepend a new entry to `newsletters` with the HTML
// content provided by product. To add a release: prepend to `changelog`.

export interface Newsletter {
  id: string;
  /** ISO date (YYYY-MM-DD) — used for sorting and the unread indicator. */
  date: string;
  title: string;
  excerpt: string;
  /** Raw HTML body as provided by the product team. Rendered as-is. */
  html?: string;
  /** Optional URL to a standalone HTML email document (served from /public).
   *  When set, the newsletter is rendered inside an isolated iframe so its own
   *  styles don't leak into the host app. Takes precedence over `html`. */
  htmlUrl?: string;
}

export type ChangelogEntryType = 'added' | 'changed' | 'fixed' | 'removed';

export interface ChangelogItem {
  type: ChangelogEntryType;
  text: string;
}

export interface ChangelogRelease {
  version: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  title?: string;
  items: ChangelogItem[];
}

// ---------------------------------------------------------------------------
// Newsletters — newest first
// ---------------------------------------------------------------------------
export const newsletters: Newsletter[] = [
  {
    id: '2026-03',
    date: '2026-03-31',
    title: 'Product News — Mars 2026',
    excerpt:
      'Focus distribution déléguée : notification automatique du contresignataire SDG après validation partenaire, flux Penelop personnalisables par application, règles conditionnelles alignées sur tous les modes de soumission.',
    htmlUrl: '/newsletters/2026-03-mars.html',
  },
];

// ---------------------------------------------------------------------------
// Changelog — newest first
// ---------------------------------------------------------------------------
export const changelog: ChangelogRelease[] = [
  {
    version: '3.04.03',
    date: '2026-04-20',
    title: 'Avril 2026',
    items: [
      { type: 'added', text: 'Page Nouveautés regroupant newsletters et changelog.' },
      { type: 'added', text: 'Indicateur de nouvelles publications dans le header.' },
      { type: 'changed', text: 'Refonte visuelle de la vue &laquo; Dossiers&nbsp;&raquo;.' },
      { type: 'fixed', text: 'Correction d’un bug d’affichage des totaux dans Bird View.' },
    ],
  },
  {
    version: '3.04.02',
    date: '2026-03-28',
    title: 'Mars 2026',
    items: [
      { type: 'added', text: 'Partage de vues DataHub aux investisseurs.' },
      { type: 'changed', text: 'Amélioration des performances du tableau des souscriptions.' },
    ],
  },
  {
    version: '3.04.01',
    date: '2026-02-18',
    title: 'Février 2026',
    items: [
      { type: 'added', text: 'Nouveau sélecteur de contexte fonds dans la sidebar.' },
      { type: 'fixed', text: 'Correction des filtres de la page Investisseurs.' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Latest item date across both feeds — drives the unread indicator.
// ---------------------------------------------------------------------------
export function getLatestWhatsNewDate(): string {
  const dates = [
    ...newsletters.map((n) => n.date),
    ...changelog.map((c) => c.date),
  ];
  return dates.sort().at(-1) ?? '';
}
