import type { CollectionRowStatus } from '../types';

export const ASTORG_PERF_COLLECTION_ID = 'col_perf_astorg';
export const ASTORG_PERF_TECHNICAL_NAME = 'performance_fonds_astorg';

export interface PerfRow {
  id: string;
  status: CollectionRowStatus;
  fund: string; // fund id (ASTORG_VIII, …)
  fundLabel: string;
  periodLabel: string; // 'T1 2026'
  periodEnd: string;   // ISO date of period end
  tvpi: number;
  dpi: number;
  irr: number;         // as ratio, e.g. 0.184 = 18.4%
  nav: number;         // EUR
  called: number;      // EUR
  distributed: number; // EUR
  investorId?: string; // hook for investor-scoped collections
}

export interface DemoFund {
  id: string;
  label: string;
}

export const DEMO_FUNDS: DemoFund[] = [
  { id: 'ASTORG_VIII', label: 'Astorg VIII' },
  { id: 'ASTORG_VII', label: 'Astorg VII' },
  { id: 'ASTORG_MID_CAP', label: 'Astorg Mid-Cap' },
];

export interface DemoInvestor {
  id: string;
  label: string;
}

export const DEMO_INVESTORS: DemoInvestor[] = [
  { id: 'LP_001', label: 'Fonds de Fonds Européen' },
  { id: 'LP_002', label: 'Family Office Durand' },
  { id: 'LP_003', label: 'Institutionnel Alpha' },
  { id: 'LP_004', label: 'Caisse de Retraite Mérovingienne' },
];

export const DEMO_PERIODS: string[] = [
  'T1 2026',
  'T4 2025',
  'T3 2025',
  'T2 2025',
  'T1 2025',
  'T4 2024',
];

const PERIOD_END: Record<string, string> = {
  'T1 2026': '2026-03-31',
  'T4 2025': '2025-12-31',
  'T3 2025': '2025-09-30',
  'T2 2025': '2025-06-30',
  'T1 2025': '2025-03-31',
  'T4 2024': '2024-12-31',
};

interface FundTrajectory {
  fund: DemoFund;
  base: { tvpi: number; dpi: number; irr: number; nav: number; called: number; distributed: number };
  step: { tvpi: number; dpi: number; irr: number; nav: number; called: number; distributed: number };
  /** Projected-draft values for T1 2026 — intentionally above the last-published (T4 2025) to make the toggle visibly impactful. */
  draftQ1_2026: { tvpi: number; dpi: number; irr: number; nav: number; called: number; distributed: number } | null;
}

const TRAJECTORIES: FundTrajectory[] = [
  {
    fund: DEMO_FUNDS[0], // Astorg VIII
    base: { tvpi: 1.1, dpi: 0.2, irr: 0.08, nav: 900_000_000, called: 800_000_000, distributed: 200_000_000 },
    step: { tvpi: 0.07, dpi: 0.14, irr: 0.022, nav: 75_000_000, called: 50_000_000, distributed: 110_000_000 },
    draftQ1_2026: { tvpi: 1.45, dpi: 0.87, irr: 0.184, nav: 1_250_000_000, called: 1_020_000_000, distributed: 780_000_000 },
  },
  {
    fund: DEMO_FUNDS[1], // Astorg VII
    base: { tvpi: 1.35, dpi: 0.75, irr: 0.16, nav: 980_000_000, called: 870_000_000, distributed: 590_000_000 },
    step: { tvpi: 0.06, dpi: 0.08, irr: 0.008, nav: 22_000_000, called: 20_000_000, distributed: 55_000_000 },
    draftQ1_2026: { tvpi: 1.71, dpi: 1.12, irr: 0.212, nav: 1_070_000_000, called: 970_000_000, distributed: 910_000_000 },
  },
  {
    fund: DEMO_FUNDS[2], // Astorg Mid-Cap
    base: { tvpi: 1.05, dpi: 0.05, irr: 0.04, nav: 420_000_000, called: 380_000_000, distributed: 15_000_000 },
    step: { tvpi: 0.05, dpi: 0.07, irr: 0.018, nav: 30_000_000, called: 25_000_000, distributed: 20_000_000 },
    draftQ1_2026: null, // only VII + VIII get a T1 2026 draft
  },
];

/**
 * Generate realistic perf rows for the demo. Emits:
 *   - 5 published rows per fund for T4 2024 → T4 2025 (ascending values)
 *   - 1 draft row for T1 2026 for Astorg VIII and Astorg VII
 */
function buildAstorgPerfRows(): PerfRow[] {
  const rows: PerfRow[] = [];
  const publishedPeriods = ['T4 2024', 'T1 2025', 'T2 2025', 'T3 2025', 'T4 2025'];

  for (const traj of TRAJECTORIES) {
    publishedPeriods.forEach((periodLabel, idx) => {
      rows.push({
        id: `${traj.fund.id}_${periodLabel.replace(' ', '_')}`,
        status: 'published',
        fund: traj.fund.id,
        fundLabel: traj.fund.label,
        periodLabel,
        periodEnd: PERIOD_END[periodLabel],
        tvpi: round(traj.base.tvpi + idx * traj.step.tvpi, 2),
        dpi: round(traj.base.dpi + idx * traj.step.dpi, 2),
        irr: round(traj.base.irr + idx * traj.step.irr, 3),
        nav: Math.round(traj.base.nav + idx * traj.step.nav),
        called: Math.round(traj.base.called + idx * traj.step.called),
        distributed: Math.round(traj.base.distributed + idx * traj.step.distributed),
      });
    });

    if (traj.draftQ1_2026) {
      rows.push({
        id: `${traj.fund.id}_T1_2026_draft`,
        status: 'draft',
        fund: traj.fund.id,
        fundLabel: traj.fund.label,
        periodLabel: 'T1 2026',
        periodEnd: PERIOD_END['T1 2026'],
        ...traj.draftQ1_2026,
      });
    }
  }

  return rows;
}

function round(n: number, digits: number): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

export const astorgPerfRows: PerfRow[] = buildAstorgPerfRows();

/**
 * Ensures the Astorg performance collection is in a clean demo state. Called
 * on first render of the DataHub surface when ?demo=1 is present, OR can be
 * invoked manually by the demo helper buttons.
 *
 * Currently a noop since the seed already matches the invariants — kept as
 * a hook for future tweaks without touching page-level code.
 */
export function setupAstorgDemoState(_ctx: {
  updateCollection: (id: string, patch: unknown) => void;
  getCollection: (id: string) => unknown;
}): void {
  // Noop: the Astorg seed already has totalRows=142 / draftRows=2 and the
  // row generator above produces 17 realistic rows (15 published + 2 drafts)
  // that the preview can consume. Retained for future demo-reset needs.
}
