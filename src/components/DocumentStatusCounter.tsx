import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { cn } from './ui/utils';
import { useTranslation } from '../utils/languageContext';

interface DocumentStatusCounterProps {
  total: number;
  validated: number;
  pending: number;
  rejected: number;
  className?: string;
}

export function DocumentStatusCounter({
  total,
  validated,
  pending,
  rejected,
  className,
}: DocumentStatusCounterProps) {
  const { t } = useTranslation();
  const received = validated + pending + rejected;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn('flex items-center gap-2', className)}>
          <span className={cn(
            'text-sm font-semibold',
            received === total ? 'text-green-700 dark:text-green-400' : 'text-foreground'
          )}>
            {received}/{total}
          </span>
          <div className="flex items-center gap-1">
            {validated > 0 && (
              <span className="inline-flex items-center gap-0.5 text-xs text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {validated}
              </span>
            )}
            {pending > 0 && (
              <span className="inline-flex items-center gap-0.5 text-xs text-amber-600 dark:text-amber-400">
                <Clock className="w-3.5 h-3.5" />
                {pending}
              </span>
            )}
            {rejected > 0 && (
              <span className="inline-flex items-center gap-0.5 text-xs text-red-600 dark:text-red-400">
                <XCircle className="w-3.5 h-3.5" />
                {rejected}
              </span>
            )}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="space-y-1 text-xs">
          <div className="font-medium">{t('subscriptions.documents.title', { received, total })}</div>
          <div className="flex items-center gap-1 text-green-500">
            <CheckCircle2 className="w-3 h-3" /> {t('subscriptions.documents.validated', { count: validated })}
          </div>
          <div className="flex items-center gap-1 text-amber-500">
            <Clock className="w-3 h-3" /> {t('subscriptions.documents.pending', { count: pending })}
          </div>
          <div className="flex items-center gap-1 text-red-500">
            <XCircle className="w-3 h-3" /> {t('subscriptions.documents.rejected', { count: rejected })}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
