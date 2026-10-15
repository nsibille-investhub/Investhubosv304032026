import { Line, LineChart, Tooltip, YAxis } from 'recharts';
import { ChartContainer } from './chart';
import { cn } from './utils';

export interface SparklinePoint {
  label: string;
  value: number;
}

interface SparklineProps {
  points: SparklinePoint[];
  /** Format de la valeur dans l'info-bulle. */
  format: (value: number) => string;
  ariaLabel: string;
  className?: string;
}

/**
 * Mini graphique d'historique : une seule série, sans axe ni légende (le titre du bloc la nomme),
 * ligne de 2 px, info-bulle au survol. Le tableau associé sert de vue tabulaire.
 */
export function Sparkline({ points, format, ariaLabel, className }: SparklineProps) {
  return (
    <ChartContainer
      config={{ value: { label: ariaLabel, color: 'var(--chart-1)' } }}
      className={cn('h-16 w-full', className)}
      style={{ aspectRatio: 'auto' }}
      role="img"
      aria-label={ariaLabel}
    >
      <LineChart data={points} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <YAxis hide domain={['dataMin', 'dataMax']} />
        <Tooltip
          cursor={{ stroke: 'var(--border)' }}
          content={({ active, payload }) => {
            const point = active && payload?.[0] ? (payload[0].payload as SparklinePoint) : null;
            if (!point) return null;
            return (
              <div className="rounded-md border border-border bg-popover px-2 py-1 text-xs shadow-sm">
                <p className="text-muted-foreground">{point.label}</p>
                <p className="font-semibold tabular-nums text-foreground">{format(point.value)}</p>
              </div>
            );
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="var(--color-value)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, stroke: 'var(--card)', strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
