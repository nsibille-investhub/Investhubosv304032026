import { useMemo } from 'react';

import { applyLpViewFilters, type LpViewFilters } from '../lib/applyLpViewFilters';
import type { PerfRow } from '../seed/demoScenario';
import type { Collection } from '../types';
import { EvolutionChartWidget } from './widgets/EvolutionChartWidget';
import { ExportWidget } from './widgets/ExportWidget';
import { HistoryTableWidget } from './widgets/HistoryTableWidget';
import { KpiWidget } from './widgets/KpiWidget';

export interface LpPortalPreviewProps {
  collection: Collection;
  rows: ReadonlyArray<PerfRow>;
  filters: LpViewFilters;
  showDrafts: boolean;
}

export function LpPortalPreview({
  collection,
  rows,
  filters,
  showDrafts,
}: LpPortalPreviewProps) {
  const visibleRows = useMemo(
    () => applyLpViewFilters(rows, filters, showDrafts),
    [rows, filters, showDrafts],
  );

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-background p-4">
      <header className="flex flex-col gap-0.5">
        <h3 className="text-sm font-medium text-foreground">
          {collection.displayName}
        </h3>
        <p className="text-xs text-muted-foreground">
          Aperçu du portail LP — données filtrées selon les sélecteurs
          ci-dessus.
        </p>
      </header>

      <KpiWidget rows={visibleRows} includeDrafts={showDrafts} />

      <EvolutionChartWidget rows={visibleRows} includeDrafts={showDrafts} />

      <HistoryTableWidget rows={visibleRows} includeDrafts={showDrafts} />

      <ExportWidget filteredCount={visibleRows.length} />
    </div>
  );
}

export default LpPortalPreview;
