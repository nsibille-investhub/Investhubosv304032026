import type { ComponentType } from 'react';
import { CheckCircle2, Clock, EyeOff, Pencil } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../../components/ui/utils';
import type { CollectionRowStatus } from '../types';

type LucideIcon = ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;

const statusBadgeVariants = cva(
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

interface StatusMeta {
  label: string;
  icon: LucideIcon;
  bg: string;
  fg: string;
  border: string;
}

const statusMap: Record<CollectionRowStatus, StatusMeta> = {
  published: {
    label: 'Publié',
    icon: CheckCircle2,
    bg: 'var(--datahub-status-published-bg)',
    fg: 'var(--datahub-status-published-fg)',
    border: 'var(--datahub-status-published-border)',
  },
  draft: {
    label: 'Brouillon',
    icon: Clock,
    bg: 'var(--datahub-status-draft-bg)',
    fg: 'var(--datahub-status-draft-fg)',
    border: 'var(--datahub-status-draft-border)',
  },
  unpublished: {
    label: 'Dépublié',
    icon: EyeOff,
    bg: 'var(--datahub-status-unpublished-bg)',
    fg: 'var(--datahub-status-unpublished-fg)',
    border: 'var(--datahub-status-unpublished-border)',
  },
  changes: {
    label: 'Modif. en attente',
    icon: Pencil,
    bg: 'var(--datahub-status-changes-bg)',
    fg: 'var(--datahub-status-changes-fg)',
    border: 'var(--datahub-status-changes-border)',
  },
};

export interface StatusBadgeProps
  extends VariantProps<typeof statusBadgeVariants> {
  status: CollectionRowStatus;
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  size = 'md',
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const meta = statusMap[status];
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
      className={cn(statusBadgeVariants({ size }), className)}
    >
      {showIcon && <Icon aria-hidden />}
      {meta.label}
    </span>
  );
}

export default StatusBadge;
