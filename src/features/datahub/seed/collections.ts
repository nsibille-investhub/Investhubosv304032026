import type { Collection, CollectionColumn } from '../types';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const anchor = Date.UTC(2026, 3, 22, 8, 0, 0); // 2026-04-22 08:00 UTC
const iso = (msAgo: number) => new Date(anchor - msAgo).toISOString();

function col(
  partial: Omit<CollectionColumn, 'required'> & { required?: boolean },
): CollectionColumn {
  return { required: false, ...partial };
}

export const astorgCollections: Collection[] = [
  {
    id: 'col_perf_astorg',
    technicalName: 'performance_fonds_astorg',
    displayName: 'Performance fonds Astorg',
    description:
      'Indicateurs trimestriels de performance des fonds Astorg — TVPI, DPI, IRR, NAV.',
    ingestionMode: 'api-pull',
    pivotType: 'timeseries',
    linkedPivotObjects: ['campaign'],
    publicationWorkflow: 'direct',
    columns: [
      col({ id: 'c1', technicalName: 'fund_id', label: 'Fonds', type: 'text', required: true, isKeyToInvestHubObject: 'campaign' }),
      col({ id: 'c2', technicalName: 'period_end', label: 'Fin de période', type: 'date', required: true, isTemporalPivot: true }),
      col({ id: 'c3', technicalName: 'tvpi', label: 'TVPI', type: 'number' }),
      col({ id: 'c4', technicalName: 'dpi', label: 'DPI', type: 'number' }),
      col({ id: 'c5', technicalName: 'irr', label: 'IRR', type: 'percentage', unit: '%' }),
      col({ id: 'c6', technicalName: 'nav', label: 'NAV', type: 'currency', unit: 'EUR' }),
    ],
    stats: { totalRows: 142, publishedRows: 140, draftRows: 2, unpublishedRows: 0, changesRows: 0 },
    lastSyncAt: iso(2 * HOUR),
    createdAt: iso(120 * DAY),
    updatedAt: iso(2 * HOUR),
  },
  {
    id: 'col_participations_astorg',
    technicalName: 'participations_astorg',
    displayName: 'Participations Astorg',
    description:
      "Portefeuille des participations actuelles d'Astorg, toutes générations confondues.",
    ingestionMode: 'api-pull',
    pivotType: 'reference',
    linkedPivotObjects: ['campaign'],
    publicationWorkflow: 'direct',
    columns: [
      col({ id: 'c1', technicalName: 'company_name', label: 'Société', type: 'text', required: true }),
      col({ id: 'c2', technicalName: 'sector', label: 'Secteur', type: 'select' }),
      col({ id: 'c3', technicalName: 'fund_id', label: 'Fonds', type: 'text', required: true, isKeyToInvestHubObject: 'campaign' }),
      col({ id: 'c4', technicalName: 'investment_date', label: "Date d'investissement", type: 'date' }),
      col({ id: 'c5', technicalName: 'stake_pct', label: 'Participation', type: 'percentage', unit: '%' }),
      col({ id: 'c6', technicalName: 'website', label: 'Site web', type: 'url' }),
    ],
    stats: { totalRows: 48, publishedRows: 48, draftRows: 0, unpublishedRows: 0, changesRows: 0 },
    lastSyncAt: iso(18 * HOUR),
    createdAt: iso(180 * DAY),
    updatedAt: iso(18 * HOUR),
  },
  {
    id: 'col_flux_astorg',
    technicalName: 'flux_trimestriels_astorg',
    displayName: 'Flux trimestriels Astorg',
    description:
      'Historique des appels et distributions trimestriels vers les investisseurs.',
    ingestionMode: 'file',
    pivotType: 'event',
    linkedPivotObjects: ['campaign', 'investor'],
    publicationWorkflow: 'manual-validation',
    columns: [
      col({ id: 'c1', technicalName: 'flow_date', label: 'Date du flux', type: 'date', required: true, isTemporalPivot: true }),
      col({ id: 'c2', technicalName: 'flow_type', label: 'Type', type: 'select', required: true }),
      col({ id: 'c3', technicalName: 'amount', label: 'Montant', type: 'currency', unit: 'EUR', required: true }),
      col({ id: 'c4', technicalName: 'investor_id', label: 'Investisseur', type: 'text', required: true, isKeyToInvestHubObject: 'investor' }),
      col({ id: 'c5', technicalName: 'fund_id', label: 'Fonds', type: 'text', required: true, isKeyToInvestHubObject: 'campaign' }),
      col({ id: 'c6', technicalName: 'reference', label: 'Référence', type: 'text' }),
    ],
    stats: { totalRows: 96, publishedRows: 96, draftRows: 0, unpublishedRows: 0, changesRows: 0 },
    lastSyncAt: iso(6 * DAY),
    createdAt: iso(240 * DAY),
    updatedAt: iso(6 * DAY),
  },
  {
    id: 'col_esg_astorg',
    technicalName: 'esg_reporting_astorg',
    displayName: 'Reporting ESG Astorg',
    description:
      "Indicateurs ESG agrégés par période de reporting — scope interne Astorg.",
    ingestionMode: 'manual',
    pivotType: 'timeseries',
    linkedPivotObjects: ['campaign'],
    publicationWorkflow: 'manual-validation',
    columns: [
      col({ id: 'c1', technicalName: 'period', label: 'Période', type: 'date', required: true, isTemporalPivot: true }),
      col({ id: 'c2', technicalName: 'co2_intensity', label: 'Intensité CO₂', type: 'number', unit: 'tCO2e/M€' }),
      col({ id: 'c3', technicalName: 'diversity_score', label: 'Score diversité', type: 'number' }),
      col({ id: 'c4', technicalName: 'governance_score', label: 'Score gouvernance', type: 'number' }),
      col({ id: 'c5', technicalName: 'employees_count', label: 'Effectifs', type: 'number' }),
    ],
    stats: { totalRows: 24, publishedRows: 20, draftRows: 4, unpublishedRows: 0, changesRows: 0 },
    lastSyncAt: undefined,
    createdAt: iso(90 * DAY),
    updatedAt: iso(1 * DAY),
  },
  {
    id: 'col_news_investisseurs',
    technicalName: 'news_investisseurs',
    displayName: 'News investisseurs',
    description:
      'Actualités éditoriales à pousser dans les portails investisseurs.',
    ingestionMode: 'manual',
    pivotType: 'reference',
    linkedPivotObjects: [],
    publicationWorkflow: 'manual-validation',
    columns: [
      col({ id: 'c1', technicalName: 'title', label: 'Titre', type: 'text', required: true }),
      col({ id: 'c2', technicalName: 'published_at', label: 'Date de publication', type: 'datetime' }),
      col({ id: 'c3', technicalName: 'category', label: 'Catégorie', type: 'select' }),
      col({ id: 'c4', technicalName: 'author', label: 'Auteur', type: 'text' }),
      col({ id: 'c5', technicalName: 'summary', label: 'Résumé', type: 'text' }),
    ],
    stats: { totalRows: 12, publishedRows: 10, draftRows: 2, unpublishedRows: 0, changesRows: 0 },
    lastSyncAt: undefined,
    createdAt: iso(45 * DAY),
    updatedAt: iso(3 * DAY),
  },
  {
    id: 'col_alertes_compliance',
    technicalName: 'alertes_compliance',
    displayName: 'Alertes compliance',
    description:
      "Alertes générées par l'agent MCP de compliance sur signaux faibles KYC/AML.",
    ingestionMode: 'mcp',
    pivotType: 'event',
    linkedPivotObjects: ['investor'],
    publicationWorkflow: 'ai-validation',
    columns: [
      col({ id: 'c1', technicalName: 'triggered_at', label: 'Détection', type: 'datetime', required: true, isTemporalPivot: true }),
      col({ id: 'c2', technicalName: 'severity', label: 'Sévérité', type: 'select', required: true }),
      col({ id: 'c3', technicalName: 'investor_id', label: 'Investisseur', type: 'text', required: true, isKeyToInvestHubObject: 'investor' }),
      col({ id: 'c4', technicalName: 'rule_name', label: 'Règle déclenchée', type: 'text' }),
      col({ id: 'c5', technicalName: 'description', label: 'Description', type: 'text' }),
      col({ id: 'c6', technicalName: 'resolution_status', label: 'Statut de résolution', type: 'select' }),
    ],
    stats: { totalRows: 5, publishedRows: 3, draftRows: 2, unpublishedRows: 0, changesRows: 0 },
    lastSyncAt: iso(1 * HOUR),
    createdAt: iso(14 * DAY),
    updatedAt: iso(1 * HOUR),
  },
];
