import { useMemo, type CSSProperties } from 'react';
import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react';

import { Badge } from '../../../../components/ui/badge';
import { Card, CardContent } from '../../../../components/ui/card';
import type { PerfRow } from '../../seed/demoScenario';

interface KpiSpec {
  key: 'nav' | 'tvpi' | 'dpi' | 'irr';
  label: string;
  format: (v: number) => string;
}

const eur = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const nf2 = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct1 = new Intl.NumberFormat('fr-FR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });

const KPI_SPECS: KpiSpec[] = [
  { key: 'nav', label: 'NAV', format: (v) => eur.format(v) },
  { key: 'tvpi', label: 'TVPI', format: (v) => `${nf2.format(v)}x` },
  { key: 'dpi', label: 'DPI', format: (v) => `${nf2.format(v)}x` },
  { key: 'irr', label: 'IRR', format: (v) => pct1.format(v) },
];

function latestTwo(rows: ReadonlyArray<PerfRow>, includeDrafts: boolean) {
  // Keep only visible rows, sort desc by periodEnd.
  const sorted = [...rows].sort((a, b) => b.periodEnd.localeCompare(a.periodEnd));
  const latest = sorted[0];
  if (!latest) return { latest: undefined, previous: undefined, latestIsDraft: false };

  // "Previous" should be the period before the latest, regardless of draft state.
  // In practice the latest is typically the draft T1 2026 in demo mode, and the
  // previous is the published T4 2025.
  const previous = sorted.find((r) => r.periodEnd < latest.periodEnd);
  return {
    latest,
    previous,
    latestIsDraft: includeDrafts && latest.status !== 'published',
  };
}

function aggregateByPeriod(rows: ReadonlyArray<PerfRow>): PerfRow[] {
  // When multiple funds are in scope, aggregate per period before picking
  // latest/previous so KPIs reflect the sum / average.
  const byPeriod = new Map<string, PerfRow>();
  for (const row of rows) {
    const current = byPeriod.get(row.periodLabel);
    if (!current) {
      byPeriod.set(row.periodLabel, { ...row });
    } else {
      byPeriod.set(row.periodLabel, {
        ...current,
        nav: current.nav + row.nav,
        called: current.called + row.called,
        distributed: current.distributed + row.distributed,
        // Averages for ratios
        tvpi: (current.tvpi + row.tvpi) / 2,
        dpi: (current.dpi + row.dpi) / 2,
        irr: (current.irr + row.irr) / 2,
      });
    }
  }
  return Array.from(byPeriod.values());
}

function valueOf(row: PerfRow | undefined, key: KpiSpec['key']): number | undefined {
  return row ? row[key] : undefined;
}

function variation(current: number | undefined, prev: number | undefined) {
  if (current === undefined || prev === undefined || prev === 0) return undefined;
  return (current - prev) / Math.abs(prev);
}

export interface KpiWidgetProps {
  rows: ReadonlyArray<PerfRow>;
  includeDrafts?: boolean;
}

export function KpiWidget({ rows, includeDrafts = false }: KpiWidgetProps) {
  const { latest, previous, latestIsDraft } = useMemo(() => {
    const aggregated = aggregateByPeriod(rows);
    return latestTwo(aggregated, includeDrafts);
  }, [rows, includeDrafts]);

  const draftBorderStyle: CSSProperties = latestIsDraft
    ? { borderColor: 'var(--datahub-status-draft-border)' }
    : {};

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {KPI_SPECS.map((spec) => {
        const value = valueOf(latest, spec.key);
        const prev = valueOf(previous, spec.key);
        const variationValue = variation(value, prev);
        const formatted = value !== undefined ? spec.format(value) : '—';

        const varLabel =
          variationValue !== undefined
            ? pct1.format(variationValue).replace('-', '−')
            : null;

        const ArrowIcon =
          variationValue === undefined
            ? null
            : variationValue > 0.001
              ? ArrowUp
              : variationValue < -0.001
                ? ArrowDown
                : ArrowRight;

        return (
          <Card key={spec.key} style={draftBorderStyle} className="relative">
            {latestIsDraft && (
              <div className="absolute right-3 top-3">
                <Badge
                  variant="outline"
                  className="text-[10px] font-medium"
                  style={{
                    backgroundColor: 'var(--datahub-status-draft-bg)',
                    color: 'var(--datahub-status-draft-fg)',
                    borderColor: 'var(--datahub-status-draft-border)',
                  }}
                >
                  Nouveau
                </Badge>
              </div>
            )}
            <CardContent className="flex flex-col gap-1.5 px-5 py-4">
              <span className="text-xs text-muted-foreground">{spec.label}</span>
              <span className="text-2xl font-semibold leading-none text-foreground">
                {formatted}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                {ArrowIcon && <ArrowIcon aria-hidden className="size-3" />}
                {varLabel ?? '—'}
                <span className="text-[10px]">vs période précédente</span>
              </span>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default KpiWidget;
