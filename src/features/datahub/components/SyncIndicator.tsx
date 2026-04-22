import { useEffect, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../../components/ui/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../../../components/ui/tooltip';

const syncIndicatorVariants = cva(
  'inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground [&>svg]:size-3.5',
  {
    variants: {
      variant: {
        inline: '',
        badge:
          'rounded-full border border-border bg-muted/60 px-2.5 py-1 [&>svg]:size-3',
      },
    },
    defaultVariants: {
      variant: 'inline',
    },
  },
);

const REFRESH_INTERVAL_MS = 60_000;

function useMinuteTick() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);
}

export interface SyncIndicatorProps
  extends VariantProps<typeof syncIndicatorVariants> {
  lastSyncAt?: string;
  isSyncing?: boolean;
  showIcon?: boolean;
  className?: string;
}

export function SyncIndicator({
  lastSyncAt,
  isSyncing = false,
  variant = 'inline',
  showIcon = true,
  className,
}: SyncIndicatorProps) {
  useMinuteTick();

  const rootClass = cn(syncIndicatorVariants({ variant }), className);

  if (isSyncing) {
    return (
      <span className={rootClass} aria-live="polite">
        {showIcon && <Loader2 className="animate-spin" aria-hidden />}
        <span>Sync en cours…</span>
      </span>
    );
  }

  if (!lastSyncAt) {
    return (
      <span className={rootClass}>
        {showIcon && <RefreshCw aria-hidden />}
        <span>Jamais synchronisé</span>
      </span>
    );
  }

  const date = new Date(lastSyncAt);
  const relative = formatDistanceToNow(date, { addSuffix: true, locale: fr });
  const absolute = format(date, "dd/MM/yyyy 'à' HH:mm", { locale: fr });

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={rootClass}>
          {showIcon && <RefreshCw aria-hidden />}
          <time dateTime={date.toISOString()}>{relative}</time>
        </span>
      </TooltipTrigger>
      <TooltipContent>{absolute}</TooltipContent>
    </Tooltip>
  );
}

export default SyncIndicator;
