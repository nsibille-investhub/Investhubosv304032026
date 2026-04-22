import type { Collection, CollectionRow } from '../types';

/**
 * Deterministic pseudo-random row generator. We hash the collection id
 * and the row index so the rendered rows are stable between navigations
 * (no flicker, same numbers every time the user comes back).
 */
function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const SECTORS = ['Tech', 'Santé', 'Industrie', 'Énergie', 'Services', 'Biens de conso'];
const COMPANIES = [
  'Meridian Software', 'Ardent Life Sciences', 'Flambeau Manufacturing',
  'Helios Renewables', 'Atlas Logistics', 'Kairos Brands', 'Nordwind AG',
  'Zenith Cosmétique', 'Quantis Robotics', 'Horizon MedTech', 'Vaelor Payments',
  'Selva Forestry', 'Arbor Genomics', 'Caelum Aerospace', 'Luxor Retail',
  'Prisma Insurance', 'Orion Networks', 'Vega Education', 'Auris Audio',
];
const FUNDS = ['Astorg VII', 'Astorg VIII', 'Astorg Mid-Cap'];
const INVESTORS = [
  'Fonds de Fonds Européen',
  'Family Office Durand',
  'Institutionnel Alpha',
  'Caisse de Retraite Mérovingienne',
  'Global Pension Trust',
];
const FLOW_TYPES = ['Call', 'Distribution', 'Fee', 'Interest'];
const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];
const RULES = [
  'PEP mismatch',
  'Sanctions list hit',
  'Beneficial ownership threshold',
  'Source of funds ambiguity',
  'Adverse media signal',
];
const RESOLUTIONS = ['En cours', 'Escaladée', 'Close — faux positif', 'Close — confirmée'];
const NEWS_CATEGORIES = ['Gouvernance', 'Performance', 'Événement', 'Régulation'];
const AUTHORS = ['Marie Dubois', 'Thomas Laurent', 'Sophie Bernard', 'Jean-Pierre Morel'];
const NEWS_TITLES = [
  'Lancement du fonds Astorg VIII',
  'Rapport annuel ESG 2025',
  'Closing final Astorg Mid-Cap',
  'Webinar T1 — Perspectives marché',
  'Nouvelle participation : Meridian Software',
  'Distribution exceptionnelle T4 2025',
];

/**
 * Make a demo row payload driven by the collection schema. Keys match
 * column.technicalName so the row table can render values by key.
 */
function buildDataFor(collection: Collection, idx: number, rand: () => number): Record<string, unknown> {
  const tn = collection.technicalName;
  const periodIdx = idx % 6;
  const periodEnd = [
    '2026-03-31', '2025-12-31', '2025-09-30', '2025-06-30', '2025-03-31', '2024-12-31',
  ][periodIdx];
  const periodLabel = ['T1 2026', 'T4 2025', 'T3 2025', 'T2 2025', 'T1 2025', 'T4 2024'][periodIdx];
  const fund = FUNDS[idx % FUNDS.length];
  const investor = INVESTORS[idx % INVESTORS.length];

  switch (tn) {
    case 'performance_fonds_astorg':
      return {
        fund_id: fund,
        period_end: periodEnd,
        period_label: periodLabel,
        tvpi: +(1 + rand() * 0.8).toFixed(2),
        dpi: +(0.1 + rand() * 1.1).toFixed(2),
        irr: +(0.05 + rand() * 0.2).toFixed(3),
        nav: Math.round(300_000_000 + rand() * 900_000_000),
      };
    case 'participations_astorg':
      return {
        company_name: COMPANIES[idx % COMPANIES.length],
        sector: SECTORS[idx % SECTORS.length],
        fund_id: fund,
        investment_date: `202${2 + (idx % 4)}-${String(1 + (idx % 12)).padStart(2, '0')}-${String(1 + (idx % 27)).padStart(2, '0')}`,
        stake_pct: +(10 + rand() * 80).toFixed(1),
        website: `https://${COMPANIES[idx % COMPANIES.length].toLowerCase().replace(/\s+/g, '-').replace(/[^a-z-]/g, '')}.example.com`,
      };
    case 'flux_trimestriels_astorg':
      return {
        flow_date: `${2024 + Math.floor(rand() * 3)}-${String(1 + (idx % 12)).padStart(2, '0')}-${String(1 + (idx % 27)).padStart(2, '0')}`,
        flow_type: FLOW_TYPES[idx % FLOW_TYPES.length],
        amount: Math.round((rand() < 0.5 ? -1 : 1) * (1_000_000 + rand() * 25_000_000)),
        investor_id: investor,
        fund_id: fund,
        reference: `FLX-${String(idx + 1).padStart(5, '0')}`,
      };
    case 'esg_reporting_astorg':
      return {
        period: periodEnd,
        co2_intensity: +(10 + rand() * 90).toFixed(1),
        diversity_score: +(2 + rand() * 3).toFixed(1),
        governance_score: +(2 + rand() * 3).toFixed(1),
        employees_count: Math.round(200 + rand() * 12000),
      };
    case 'news_investisseurs':
      return {
        title: NEWS_TITLES[idx % NEWS_TITLES.length],
        published_at: `202${5 + (idx % 2)}-${String(1 + (idx % 12)).padStart(2, '0')}-${String(1 + (idx % 27)).padStart(2, '0')}T09:00:00.000Z`,
        category: NEWS_CATEGORIES[idx % NEWS_CATEGORIES.length],
        author: AUTHORS[idx % AUTHORS.length],
        summary: 'Résumé synthétique de l’actualité pour les portails investisseurs.',
      };
    case 'alertes_compliance': {
      const daysAgo = Math.floor(rand() * 30);
      const when = new Date(Date.now() - daysAgo * 24 * 3600 * 1000).toISOString();
      return {
        triggered_at: when,
        severity: SEVERITIES[idx % SEVERITIES.length],
        investor_id: investor,
        rule_name: RULES[idx % RULES.length],
        description: 'Signal faible détecté par l’agent MCP — nécessite une revue humaine.',
        resolution_status: RESOLUTIONS[idx % RESOLUTIONS.length],
      };
    }
    default:
      return Object.fromEntries(
        collection.columns.map((c) => [c.technicalName, `Exemple ${idx + 1}`]),
      );
  }
}

/**
 * Produce rows whose statuses match the collection.stats totals.
 * Published first (most recent → oldest), then drafts, then the rest —
 * keeps the most useful rows on top of the table.
 */
function statusLadder(stats: Collection['stats']): Array<CollectionRow['status']> {
  const out: Array<CollectionRow['status']> = [];
  for (let i = 0; i < stats.publishedRows; i++) out.push('published');
  for (let i = 0; i < stats.draftRows; i++) out.push('draft');
  for (let i = 0; i < stats.changesRows; i++) out.push('changes');
  for (let i = 0; i < stats.unpublishedRows; i++) out.push('unpublished');
  return out;
}

export function getCollectionRows(collection: Collection): CollectionRow[] {
  const rand = seeded(hash(collection.id));
  const statuses = statusLadder(collection.stats);
  // Hard cap to keep things snappy if a collection declares a huge total.
  const count = Math.min(statuses.length, 200);

  const now = Date.now();
  const dayMs = 24 * 3600 * 1000;

  return Array.from({ length: count }, (_, idx) => {
    const status = statuses[idx] ?? 'published';
    const createdAt = new Date(now - (idx * 2 + Math.floor(rand() * 5)) * dayMs).toISOString();
    const updatedAt = status === 'changes'
      ? new Date(now - Math.floor(rand() * 3) * dayMs).toISOString()
      : createdAt;

    return {
      id: `${collection.id}_row_${idx + 1}`,
      collectionId: collection.id,
      status,
      data: buildDataFor(collection, idx, rand),
      createdAt,
      updatedAt,
      publishedAt: status === 'published' ? createdAt : undefined,
      version: status === 'changes' ? 2 : 1,
    };
  });
}
