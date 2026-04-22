import type { ComponentType } from 'react';
import { BookOpen, TrendingUp, Zap } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../../components/ui/utils';
import type { PivotTemporalType } from '../types';

type LucideIcon = ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;

const pivotTypeBadgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap w-fit transition-colors',
  {
    variants: {
      size: {
        sm: 'px-2 py-0.5 text-xs [&>svg]:size-3',
        md: 'px-2.5 py-1 text-xs [&>svg]:size-3.5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

interface PivotMeta {
  label: string;
  icon: LucideIcon;
  bg: string;
  fg: string;
  border: string;
}

const pivotMap: Record<PivotTemporalType, PivotMeta> = {
  timeseries: {
    label: 'Série temporelle',
    icon: TrendingUp,
    bg: 'var(--datahub-pivot-timeseries-bg)',
    fg: 'var(--datahub-pivot-timeseries-fg)',
    border: 'var(--datahub-pivot-timeseries-border)',
  },
  reference: {
    label: 'Référentiel',
    icon: BookOpen,
    bg: 'var(--datahub-pivot-reference-bg)',
    fg: 'var(--datahub-pivot-reference-fg)',
    border: 'var(--datahub-pivot-reference-border)',
  },
  event: {
    label: 'Évènementielle',
    icon: Zap,
    bg: 'var(--datahub-pivot-event-bg)',
    fg: 'var(--datahub-pivot-event-fg)',
    border: 'var(--datahub-pivot-event-border)',
  },
};

export interface PivotTypeBadgeProps
  extends VariantProps<typeof pivotTypeBadgeVariants> {
  type: PivotTemporalType;
  showIcon?: boolean;
  className?: string;
}

export function PivotTypeBadge({
  type,
  size = 'md',
  showIcon = true,
  className,
}: PivotTypeBadgeProps) {
  const meta = pivotMap[type];
  const Icon = meta.icon;

  return (
    <span
      role="status"
      aria-label={meta.label}
      style={{
        backgroundColor: meta.bg,
        color: meta.fg,
        borderColor: meta.border,
      }}
      className={cn(pivotTypeBadgeVariants({ size }), className)}
    >
      {showIcon && <Icon aria-hidden />}
      {meta.label}
    </span>
  );
}

export default PivotTypeBadge;
