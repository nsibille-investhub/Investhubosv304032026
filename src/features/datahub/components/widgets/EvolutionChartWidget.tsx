import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import type { PerfRow } from '../../seed/demoScenario';

type Metric = 'tvpi' | 'dpi' | 'nav';

const METRIC_LABELS: Record<Metric, string> = {
  tvpi: 'TVPI',
  dpi: 'DPI',
  nav: 'NAV',
};

// Up to 4 fund lines — map to the DS chart tokens so colors stay off the
// "sobriety" list and follow the theme.
const LINE_COLOR_VARS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
];

interface ChartPoint {
  periodEnd: string; // sort key
  periodLabel: string; // x-axis label
  [fundLabel: string]: string | number | null;
}

const nf2 = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const eurCompact = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  notation: 'compact',
  maximumFractionDigits: 1,
});

function formatMetric(value: number | null | undefined, metric: Metric): string {
  if (value === null || value === undefined) return '—';
  if (metric === 'nav') return eurCompact.format(value);
  return `${nf2.format(value)}x`;
}

function buildChartData(
  rows: ReadonlyArray<PerfRow>,
  metric: Metric,
): { data: ChartPoint[]; fundLabels: string[]; draftPeriodLabel?: string } {
  const periods = Array.from(
    new Map(rows.map((r) => [r.periodLabel, r.periodEnd])).entries(),
  )
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([label, end]) => ({ label, end }));

  const funds = Array.from(
    new Map(rows.map((r) => [r.fund, r.fundLabel])).entries(),
  )
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([, label]) => label);

  const data: ChartPoint[] = periods.map(({ label, end }) => {
    const point: ChartPoint = { periodEnd: end, periodLabel: label };
    for (const fundLabel of funds) {
      const row = rows.find(
        (r) => r.periodLabel === label && r.fundLabel === fundLabel,
      );
      point[fundLabel] = row ? row[metric] : null;
    }
    return point;
  });

  const draftPeriodLabel = rows.find((r) => r.status !== 'published')?.periodLabel;

  return { data, fundLabels: funds, draftPeriodLabel };
}

export interface EvolutionChartWidgetProps {
  rows: ReadonlyArray<PerfRow>;
  includeDrafts?: boolean;
}

export function EvolutionChartWidget({
  rows,
  includeDrafts = false,
}: EvolutionChartWidgetProps) {
  const [metric, setMetric] = useState<Metric>('tvpi');

  const { data, fundLabels, draftPeriodLabel } = useMemo(
    () => buildChartData(rows, metric),
    [rows, metric],
  );

  const hasProjection = includeDrafts && !!draftPeriodLabel;

  return (
    <Card className="gap-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Évolution</CardTitle>
        <Select value={metric} onValueChange={(v) => setMetric(v as Metric)}>
          <SelectTrigger className="h-8 w-[120px]" aria-label="Métrique affichée">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(METRIC_LABELS) as Metric[]).map((m) => (
              <SelectItem key={m} value={m}>
                {METRIC_LABELS[m]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pb-4">
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="periodLabel"
                stroke="var(--muted-foreground)"
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                tickFormatter={(v) => formatMetric(v, metric)}
                width={70}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--popover)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  fontSize: 12,
                }}
                labelStyle={{ color: 'var(--foreground)' }}
                formatter={(v: number) => formatMetric(v, metric)}
              />
              {fundLabels.map((fund, idx) => {
                const color = LINE_COLOR_VARS[idx % LINE_COLOR_VARS.length];
                return (
                  <Line
                    key={fund}
                    type="monotone"
                    dataKey={fund}
                    stroke={color}
                    strokeWidth={2}
                    dot={{ r: 3, fill: color }}
                    // Tail-of-line projection style for the draft period only.
                    strokeDasharray={hasProjection ? undefined : undefined}
                    isAnimationActive={false}
                    connectNulls
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {fundLabels.map((fund, idx) => (
            <span key={fund} className="inline-flex items-center gap-1.5">
              <span
                aria-hidden
                className="inline-block size-2.5 rounded-full"
                style={{ backgroundColor: LINE_COLOR_VARS[idx % LINE_COLOR_VARS.length] }}
              />
              {fund}
            </span>
          ))}
          {hasProjection && (
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden
                className="inline-block h-0 w-4 border-t-2 border-dashed"
                style={{ borderColor: 'var(--datahub-status-draft-border)' }}
              />
              Projection {draftPeriodLabel}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default EvolutionChartWidget;
