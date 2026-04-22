import type { Collection, InvestHubPivotObject } from '../types';

export type ImportScope = 'all' | 'one' | 'many';
export type ImportPeriod = 'last' | 'quarter' | 'custom';
export type ImportBehavior = 'draft' | 'publish' | 'simulate';

export interface ImportOptions {
  scope: ImportScope;
  /** ids of the scope entities (funds / investors / …) selected by the user. */
  scopeIds: string[];
  period: ImportPeriod;
  periodQuarter?: string;
  periodStart?: string;
  periodEnd?: string;
  behavior: ImportBehavior;
}

export interface ImportBreakdownRow {
  id: string;
  label: string;
  count: number;
}

export interface ImportSimulation {
  totalRows: number;
  breakdown: ImportBreakdownRow[];
  duplicates: number;
  preview: Array<Record<string, unknown>>;
}

/**
 * Mock entity catalogue per pivot object. Used to present a scope selector
 * and a breakdown in the simulation report. Keys match what RefreshDataModal
 * passes as `scopeIds`.
 */
export const SCOPE_ENTITIES: Record<
  InvestHubPivotObject,
  Array<{ id: string; label: string }>
> = {
  campaign: [
    { id: 'ASTORG_VIII', label: 'Astorg VIII' },
    { id: 'ASTORG_VII', label: 'Astorg VII' },
    { id: 'ASTORG_VI', label: 'Astorg VI' },
    { id: 'ASTORG_MID_CAP', label: 'Astorg Mid-Cap' },
  ],
  investor: [
    { id: 'LP_001', label: 'Pension Fund Alpha' },
    { id: 'LP_002', label: 'Sovereign Wealth Beta' },
    { id: 'LP_003', label: 'Family Office Gamma' },
  ],
  subscription: [
    { id: 'SUB_A', label: 'Souscription A — Astorg VIII' },
    { id: 'SUB_B', label: 'Souscription B — Astorg VII' },
  ],
  contact: [
    { id: 'CT_001', label: 'Jean Dupont' },
    { id: 'CT_002', label: 'Marie Leclerc' },
  ],
  distributor: [
    { id: 'DIST_01', label: 'Banque Privée A' },
    { id: 'DIST_02', label: 'Family Office B' },
  ],
  'capital-account': [
    { id: 'CAP_01', label: 'Compte LP_001 — Astorg VIII' },
    { id: 'CAP_02', label: 'Compte LP_002 — Astorg VII' },
  ],
  commitment: [
    { id: 'COM_01', label: 'Engagement LP_001' },
    { id: 'COM_02', label: 'Engagement LP_002' },
  ],
};

export const PIVOT_OBJECT_LABEL_PLURAL: Record<InvestHubPivotObject, string> = {
  campaign: 'fonds',
  investor: 'investisseurs',
  subscription: 'souscriptions',
  contact: 'contacts',
  distributor: 'distributeurs',
  'capital-account': 'comptes de capital',
  commitment: 'engagements',
};

export const PIVOT_OBJECT_LABEL_SINGULAR: Record<InvestHubPivotObject, string> = {
  campaign: 'fonds',
  investor: 'investisseur',
  subscription: 'souscription',
  contact: 'contact',
  distributor: 'distributeur',
  'capital-account': 'compte de capital',
  commitment: 'engagement',
};

function pseudoRandom(seed: string): () => number {
  // Deterministic PRNG seeded on a string (so the same user input yields the
  // same simulation output — nice for demos).
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickPrincipalObject(collection: Collection): InvestHubPivotObject | undefined {
  return collection.linkedPivotObjects[0];
}

function sampleValueFor(col: { type: string; technicalName: string }, rand: () => number) {
  switch (col.type) {
    case 'boolean':
      return rand() > 0.5;
    case 'number':
      return Math.round(rand() * 1000) / 10;
    case 'currency':
      return Math.round(rand() * 1_000_000_000);
    case 'percentage':
      return Math.round(rand() * 1000) / 1000;
    case 'date':
      return '2026-06-30';
    case 'datetime':
      return '2026-06-30T16:00:00Z';
    case 'url':
      return 'https://example.com';
    default:
      return `val_${col.technicalName}_${Math.floor(rand() * 1000)}`;
  }
}

function periodFactor(period: ImportPeriod): number {
  if (period === 'custom') return 2;
  return 1;
}

export function simulateImport(
  collection: Collection,
  options: ImportOptions,
): ImportSimulation {
  const principal = pickPrincipalObject(collection);
  const seed = `${collection.id}|${options.scope}|${options.scopeIds.join(',')}|${options.period}|${options.periodQuarter ?? ''}|${options.periodStart ?? ''}|${options.periodEnd ?? ''}`;
  const rand = pseudoRandom(seed);

  // How many scope entities are we importing into?
  let entities: Array<{ id: string; label: string }> = [];
  if (principal) {
    const pool = SCOPE_ENTITIES[principal] ?? [];
    if (options.scope === 'all') entities = pool;
    else if (options.scope === 'one') {
      entities = pool.filter((e) => options.scopeIds.includes(e.id)).slice(0, 1);
    } else {
      entities = pool.filter((e) => options.scopeIds.includes(e.id));
    }
  }

  // Synthetic row counts — 6 to 12 rows per scope entity per period factor.
  const perEntity = 6 + Math.floor(rand() * 7);
  const pf = periodFactor(options.period);
  const breakdown: ImportBreakdownRow[] =
    entities.length === 0
      ? [
          {
            id: 'total',
            label: 'Total',
            count: perEntity * pf + Math.floor(rand() * 5),
          },
        ]
      : entities.map((e) => ({
          id: e.id,
          label: e.label,
          count: perEntity * pf + Math.floor(rand() * 5),
        }));

  const totalRows = breakdown.reduce((acc, b) => acc + b.count, 0);
  const duplicates = Math.floor(totalRows * (0.05 + rand() * 0.15));

  const preview: Array<Record<string, unknown>> = [];
  for (let i = 0; i < Math.min(3, totalRows); i++) {
    const row: Record<string, unknown> = {};
    for (const col of collection.columns) {
      row[col.technicalName] = sampleValueFor(col, rand);
    }
    preview.push(row);
  }

  return { totalRows, breakdown, duplicates, preview };
}

/**
 * Generates the last N quarter labels (`T{q} {yyyy}`) going backwards from a
 * reference date. Anchoring on a fixed date keeps the UI stable in demos.
 */
export function lastQuarters(count: number, anchor: Date = new Date()): string[] {
  const out: string[] = [];
  let year = anchor.getUTCFullYear();
  let q = Math.floor(anchor.getUTCMonth() / 3) + 1;
  for (let i = 0; i < count; i++) {
    out.push(`T${q} ${year}`);
    q -= 1;
    if (q === 0) {
      q = 4;
      year -= 1;
    }
  }
  return out;
}
