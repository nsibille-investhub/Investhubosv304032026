import type { ComponentType } from 'react';
import { Download, FileUp, Pencil, Sparkles, Upload } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../../components/ui/utils';
import type { IngestionMode } from '../types';

type LucideIcon = ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;

const ingestionModeBadgeVariants = cva(
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

interface ModeMeta {
  label: string;
  icon: LucideIcon;
  bg: string;
  fg: string;
  border: string;
}

const modeMap: Record<IngestionMode, ModeMeta> = {
  manual: {
    label: 'Manuel',
    icon: Pencil,
    bg: 'var(--datahub-mode-manual-bg)',
    fg: 'var(--datahub-mode-manual-fg)',
    border: 'var(--datahub-mode-manual-border)',
  },
  file: {
    label: 'Import fichier',
    icon: FileUp,
    bg: 'var(--datahub-mode-file-bg)',
    fg: 'var(--datahub-mode-file-fg)',
    border: 'var(--datahub-mode-file-border)',
  },
  'api-pull': {
    label: 'API (pull)',
    icon: Download,
    bg: 'var(--datahub-mode-api-bg)',
    fg: 'var(--datahub-mode-api-fg)',
    border: 'var(--datahub-mode-api-border)',
  },
  'api-push': {
    label: 'API (push)',
    icon: Upload,
    bg: 'var(--datahub-mode-api-bg)',
    fg: 'var(--datahub-mode-api-fg)',
    border: 'var(--datahub-mode-api-border)',
  },
  mcp: {
    label: 'MCP',
    icon: Sparkles,
    bg: 'var(--datahub-mode-mcp-bg)',
    fg: 'var(--datahub-mode-mcp-fg)',
    border: 'var(--datahub-mode-mcp-border)',
  },
};

export interface IngestionModeBadgeProps
  extends VariantProps<typeof ingestionModeBadgeVariants> {
  mode: IngestionMode;
  showIcon?: boolean;
  showLabel?: boolean;
  className?: string;
}

export function IngestionModeBadge({
  mode,
  size = 'md',
  showIcon = true,
  showLabel = true,
  className,
}: IngestionModeBadgeProps) {
  const meta = modeMap[mode];
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
      className={cn(ingestionModeBadgeVariants({ size }), className)}
    >
      {showIcon && <Icon aria-hidden />}
      {showLabel && <span>{meta.label}</span>}
    </span>
  );
}

export default IngestionModeBadge;
