import * as React from 'react';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';

import { cn } from './utils';

const BRAND_DARK = '#000E2B';
const nf = new Intl.NumberFormat('fr-FR');

export type KpiCardProgress = {
  current: number;
  total: number;
};

export type KpiCardProps = {
  icon: LucideIcon;
  label: string;
  value: number | string;
  /** Optional progress bar — e.g. "317 / 327 published" → 97%. */
  progress?: KpiCardProgress;
  /** Show a pulsing status dot next to the label (attention-grabbing). */
  pulse?: boolean;
  /** Short in-line hint shown next to the value (e.g. "à publier"). */
  hint?: string;
  /** Position in a strip, used to stagger the mount animation. */
  index?: number;
  className?: string;
};

function KpiCard({
  icon: Icon,
  label,
  value,
  progress,
  pulse,
  hint,
  index = 0,
  className,
}: KpiCardProps) {
  const ratio =
    progress && progress.total > 0 ? progress.current / progress.total : 0;
  const formattedValue =
    typeof value === 'number' ? nf.format(value) : value;

  return (
    <motion.div
      data-slot="kpi-card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.08 + index * 0.06,
        duration: 0.35,
        ease: 'easeOut',
      }}
      whileHover={{ y: -2 }}
      className={cn(
        'min-w-0 rounded-lg border border-blue-100 bg-blue-50 p-4 transition-colors hover:border-blue-200 dark:border-blue-900 dark:bg-blue-950',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <Icon
          className="size-4 shrink-0"
          style={{ color: BRAND_DARK }}
          strokeWidth={2.25}
        />
        <span
          className="truncate text-xs font-semibold uppercase tracking-[0.08em]"
          style={{ color: BRAND_DARK }}
        >
          {label}
        </span>
        {pulse ? (
          <span className="relative ml-0.5 inline-flex size-1.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-70" />
            <span className="relative inline-flex size-1.5 rounded-full bg-amber-500" />
          </span>
        ) : null}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 + index * 0.06, duration: 0.3 }}
          className="text-3xl font-bold leading-none tracking-tight tabular-nums"
          style={{ color: BRAND_DARK }}
        >
          {formattedValue}
        </motion.span>
        {hint ? (
          <span
            className="truncate text-xs font-medium opacity-70"
            style={{ color: BRAND_DARK }}
          >
            {hint}
          </span>
        ) : null}
      </div>

      {progress ? (
        <div className="mt-3 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/60 dark:bg-blue-900/60">
            <motion.div
              className="h-full rounded-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.round(ratio * 100)}%` }}
              transition={{
                delay: 0.32 + index * 0.06,
                duration: 0.8,
                ease: 'easeOut',
              }}
            />
          </div>
          <span
            className="text-[10px] font-semibold tabular-nums opacity-80"
            style={{ color: BRAND_DARK }}
          >
            {Math.round(ratio * 100)}%
          </span>
        </div>
      ) : null}
    </motion.div>
  );
}

export type KpiStripProps = {
  /** Number of columns on the grid — defaults to the number of children. */
  columns?: 2 | 3 | 4 | 5 | 6;
  className?: string;
  children: React.ReactNode;
};

const COLS_CLASS: Record<NonNullable<KpiStripProps['columns']>, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
};

function KpiStrip({ columns, className, children }: KpiStripProps) {
  const resolved =
    columns ??
    (Math.min(Math.max(React.Children.count(children), 2), 6) as
      | 2
      | 3
      | 4
      | 5
      | 6);
  return (
    <div
      data-slot="kpi-strip"
      className={cn('grid gap-4', COLS_CLASS[resolved], className)}
    >
      {children}
    </div>
  );
}

export { KpiCard, KpiStrip };
