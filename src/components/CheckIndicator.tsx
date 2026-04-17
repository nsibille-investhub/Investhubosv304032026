import { CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { cn } from './ui/utils';

interface CheckIndicatorProps {
  checked: boolean;
  checkedLabel?: string;
  uncheckedLabel?: string;
  className?: string;
}

export function CheckIndicator({
  checked,
  checkedLabel = 'Activé',
  uncheckedLabel = 'Désactivé',
  className,
}: CheckIndicatorProps) {
  const Icon = checked ? CheckCircle2 : XCircle;
  const iconClassName = checked
    ? 'w-5 h-5 text-green-600 dark:text-green-400'
    : 'w-5 h-5 text-gray-400 dark:text-gray-600';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn('inline-flex items-center justify-center', className)}>
          <Icon className={iconClassName} />
        </span>
      </TooltipTrigger>
      <TooltipContent>{checked ? checkedLabel : uncheckedLabel}</TooltipContent>
    </Tooltip>
  );
}

/**
 * StatusIndicator — Design System component
 * Key: ds-status-indicator
 *
 * Three-state circular indicator used in activity / engagement tables
 * (notifications, reception, consultation…). Extends the CheckIndicator
 * pattern with an explicit "na" (non applicable) state.
 */
export type StatusIndicatorState = 'done' | 'failed' | 'na';

interface StatusIndicatorProps {
  state: StatusIndicatorState;
  label?: string;
  className?: string;
  size?: 'sm' | 'md';
}

const STATUS_STYLES: Record<StatusIndicatorState, { Icon: typeof CheckCircle2; className: string; defaultLabel: string }> = {
  done: {
    Icon: CheckCircle2,
    className: 'text-green-600 dark:text-green-400',
    defaultLabel: 'Effectué',
  },
  failed: {
    Icon: XCircle,
    className: 'text-destructive',
    defaultLabel: 'En attente',
  },
  na: {
    Icon: MinusCircle,
    className: 'text-gray-400 dark:text-gray-600',
    defaultLabel: 'Non applicable',
  },
};

export function StatusIndicator({
  state,
  label,
  className,
  size = 'sm',
}: StatusIndicatorProps) {
  const { Icon, className: iconColor, defaultLabel } = STATUS_STYLES[state];
  const iconSize = size === 'md' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn('inline-flex items-center justify-center', className)}>
          <Icon className={cn(iconSize, iconColor)} aria-label={label ?? defaultLabel} />
        </span>
      </TooltipTrigger>
      <TooltipContent>{label ?? defaultLabel}</TooltipContent>
    </Tooltip>
  );
}
