import type { PerfRow } from '../seed/demoScenario';

export interface LpViewFilters {
  investor: string;
  fund: string; // 'all' | fund id
  period: string; // 'all' | period label ('T1 2026', …)
}

/**
 * Apply the LP preview filter set to a row array.
 *
 * Rules:
 *  - showDrafts=false → only `published` rows are kept
 *  - showDrafts=true  → `published | draft | changes` are kept (for `changes`,
 *    the row already carries the new value in this demo data)
 *  - fund / period filters are applied when not set to 'all'
 *  - investor filter is a hook — rows only carry an `investor_id` when the
 *    collection is investor-scoped (not the case for fund performance rows)
 */
export function applyLpViewFilters(
  rows: ReadonlyArray<PerfRow>,
  filters: LpViewFilters,
  showDrafts: boolean,
): PerfRow[] {
  return rows.filter((row) => {
    if (!showDrafts && row.status !== 'published') return false;
    if (showDrafts && !['published', 'draft', 'changes'].includes(row.status)) return false;
    if (filters.fund !== 'all' && row.fund !== filters.fund) return false;
    if (filters.period !== 'all' && row.periodLabel !== filters.period) return false;
    if (
      filters.investor !== 'all' &&
      row.investorId !== undefined &&
      row.investorId !== filters.investor
    ) {
      return false;
    }
    return true;
  });
}
