import { FileText, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { cn } from './ui/utils';
import { useTranslation } from '../utils/languageContext';

export interface DocumentCounterData {
  total: number;
  validated: number;
  pending: number;
  rejected: number;
}

interface DocumentCounterProps {
  data: DocumentCounterData;
  className?: string;
}

export function DocumentCounter({ data, className }: DocumentCounterProps) {
  const { t } = useTranslation();
  const { total, validated, pending, rejected } = data;
  const handled = validated + pending + rejected;
  const tone =
    rejected > 0
      ? 'danger'
      : validated === total && total > 0
        ? 'success'
        : pending > 0
          ? 'warning'
          : 'neutral';

  const wrapper = {
    success: 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    warning: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    danger: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    neutral: 'bg-gray-50 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800',
  }[tone];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            'inline-flex items-center gap-2 px-2 py-1 rounded-md border text-xs font-medium cursor-default',
            wrapper,
            className
          )}
          aria-label={t('subscriptions.documents.counterAria', {
            handled,
            total,
          })}
        >
          <FileText className="w-3.5 h-3.5 opacity-80" />
          <span className="tabular-nums font-semibold">
            {handled}/{total}
          </span>
          <span className="flex items-center gap-1.5 ml-1">
            <span className="flex items-center gap-0.5">
              <CheckCircle2 className="w-3 h-3 text-green-600 dark:text-green-400" />
              <span className="tabular-nums text-[11px]">{validated}</span>
            </span>
            <span className="flex items-center gap-0.5">
              <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span className="tabular-nums text-[11px]">{pending}</span>
            </span>
            <span className="flex items-center gap-0.5">
              <XCircle className="w-3 h-3 text-red-600 dark:text-red-400" />
              <span className="tabular-nums text-[11px]">{rejected}</span>
            </span>
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-1 text-xs">
          <div className="font-semibold">{t('subscriptions.documents.tooltipTitle')}</div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            {t('subscriptions.documents.validatedCount', { count: validated })}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-amber-500" />
            {t('subscriptions.documents.pendingCount', { count: pending })}
          </div>
          <div className="flex items-center gap-1.5">
            <XCircle className="w-3 h-3 text-red-500" />
            {t('subscriptions.documents.rejectedCount', { count: rejected })}
          </div>
          <div className="pt-1 border-t border-border/60">
            {t('subscriptions.documents.progress', { handled, total })}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
