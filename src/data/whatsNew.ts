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
  html: string;
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
    id: '2026-04',
    date: '2026-04-15',
    title: 'Newsletter d’avril 2026',
    excerpt:
      'Première édition de la newsletter InvestHub : rappel des nouveautés produit, événements à venir et retour sur le trimestre.',
    html: `
      <h2>Édito</h2>
      <p>
        Bienvenue dans la première newsletter mensuelle d’InvestHub. Chaque mois,
        nous partagerons ici les principales nouveautés produit, les événements
        à venir et quelques retours d’usage de nos clients.
      </p>

      <h2>Nouveautés du mois</h2>
      <ul>
        <li><strong>Dossiers de conformité :</strong> nouvelle vue consolidée avec indicateurs de complétude.</li>
        <li><strong>DataHub :</strong> partage de vues personnalisées aux LP avec prévisualisation en &laquo; view as LP &raquo;.</li>
        <li><strong>Bird View :</strong> filtrage multi-fonds amélioré.</li>
      </ul>

      <h2>À venir</h2>
      <p>
        Le module de retrocessions va recevoir son refresh UI courant mai, avec notamment
        une nouvelle timeline des flux et un export CSV enrichi.
      </p>

      <p style="color:#6b7280;font-size:13px;margin-top:24px">
        Vous recevez cette newsletter car vous êtes utilisateur d’InvestHub OS.
      </p>
    `,
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
