import type { FieldMapping, InvestHubPivotObject } from '../types';

/**
 * A pre-saved collection of field→field mappings that the user can apply
 * in one click (e.g. "Astorg performance standard"). Demo-scoped — the
 * real product would persist these under a Mappings settings page.
 */
export interface MappingTemplate {
  id: string;
  name: string;
  description?: string;
  pivotObjects: InvestHubPivotObject[];
  mappings: Array<Omit<FieldMapping, 'id'>>;
}

export const MAPPING_TEMPLATES: MappingTemplate[] = [
  {
    id: 'tpl_perf_astorg',
    name: 'Astorg · Performance trimestrielle',
    description:
      'Mapping standard pour les KPIs de performance (TVPI, DPI, IRR, NAV) par fonds et période.',
    pivotObjects: ['campaign'],
    mappings: [
      { sourceColumn: 'fund_id', targetField: 'campaign.code', pivotObject: 'campaign' },
      { sourceColumn: 'period_end', targetField: 'campaign.perf.period' },
      { sourceColumn: 'tvpi', targetField: 'campaign.perf.tvpi' },
      { sourceColumn: 'dpi', targetField: 'campaign.perf.dpi' },
      { sourceColumn: 'irr', targetField: 'campaign.perf.irr' },
      { sourceColumn: 'nav', targetField: 'campaign.perf.nav' },
    ],
  },
  {
    id: 'tpl_flux_quarterly',
    name: 'Flux trimestriels — appels & distributions',
    description:
      'Appels et distributions par investisseur / fonds / période.',
    pivotObjects: ['campaign', 'investor'],
    mappings: [
      { sourceColumn: 'fund_id', targetField: 'campaign.code', pivotObject: 'campaign' },
      { sourceColumn: 'investor_id', targetField: 'investor.code', pivotObject: 'investor' },
      { sourceColumn: 'flow_date', targetField: 'cashflow.date' },
      { sourceColumn: 'flow_type', targetField: 'cashflow.kind' },
      { sourceColumn: 'amount', targetField: 'cashflow.amount' },
      { sourceColumn: 'reference', targetField: 'cashflow.reference' },
    ],
  },
  {
    id: 'tpl_participations',
    name: 'Participations portefeuille',
    description:
      'Mapping pour créer des objets Participations à partir d’un référentiel société.',
    pivotObjects: ['campaign'],
    mappings: [
      { sourceColumn: 'company_name', targetField: 'participation.name' },
      { sourceColumn: 'sector', targetField: 'participation.sector' },
      { sourceColumn: 'fund_id', targetField: 'participation.fund.code', pivotObject: 'campaign' },
      { sourceColumn: 'investment_date', targetField: 'participation.investedAt' },
      { sourceColumn: 'stake_pct', targetField: 'participation.stake' },
      { sourceColumn: 'website', targetField: 'participation.website' },
    ],
  },
  {
    id: 'tpl_esg',
    name: 'Reporting ESG',
    description: 'Indicateurs ESG agrégés par période reporting sur les fonds.',
    pivotObjects: ['campaign'],
    mappings: [
      { sourceColumn: 'period', targetField: 'campaign.esg.period' },
      { sourceColumn: 'co2_intensity', targetField: 'campaign.esg.co2Intensity' },
      { sourceColumn: 'diversity_score', targetField: 'campaign.esg.diversity' },
      { sourceColumn: 'governance_score', targetField: 'campaign.esg.governance' },
      { sourceColumn: 'employees_count', targetField: 'campaign.esg.employees' },
    ],
  },
];

/**
 * A saved id-resolution table that maps an external identifier column to
 * an internal InvestHub attribute. Reused across collections so the same
 * fund code / LP id isn't re-declared everywhere.
 */
export interface ReferentialTemplate {
  id: string;
  name: string;
  pivotObject: InvestHubPivotObject;
  externalKey: string;
  internalKey: string;
  description?: string;
}

export const REFERENTIAL_TEMPLATES: ReferentialTemplate[] = [
  {
    id: 'ref_funds_astorg',
    name: 'Référentiel fonds Astorg',
    pivotObject: 'campaign',
    externalKey: 'ext_fund_id',
    internalKey: 'campaign.code',
    description: 'Codes fonds internes Astorg (VIII, VII, Mid-Cap…).',
  },
  {
    id: 'ref_funds_morningstar',
    name: 'Référentiel fonds Morningstar',
    pivotObject: 'campaign',
    externalKey: 'ms_fund_id',
    internalKey: 'campaign.code',
    description: 'Correspondance ISIN ↔ fonds Morningstar.',
  },
  {
    id: 'ref_lp_internal',
    name: 'Référentiel LP Astorg',
    pivotObject: 'investor',
    externalKey: 'lp_ext_id',
    internalKey: 'investor.code',
    description: 'Ids internes des Limited Partners.',
  },
  {
    id: 'ref_lp_crm',
    name: 'LP ↔ CRM Salesforce',
    pivotObject: 'investor',
    externalKey: 'sf_contact_id',
    internalKey: 'investor.code',
    description: 'Salesforce Contact ID ↔ LP InvestHub.',
  },
  {
    id: 'ref_distrib_cgp',
    name: 'Distributeurs & CGP',
    pivotObject: 'distributor',
    externalKey: 'distributor_ext_id',
    internalKey: 'distributor.code',
  },
  {
    id: 'ref_subs_internal',
    name: 'Référentiel souscriptions',
    pivotObject: 'subscription',
    externalKey: 'subscription_ext_id',
    internalKey: 'subscription.code',
  },
];

export function templatesFor(object: InvestHubPivotObject): ReferentialTemplate[] {
  return REFERENTIAL_TEMPLATES.filter((t) => t.pivotObject === object);
}
