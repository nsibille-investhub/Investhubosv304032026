import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, Ban, Loader2 } from 'lucide-react';
import { useTranslation } from '../../utils/languageContext';
import { Button } from './button';
import { DisabledReason } from './disabled-reason';
import { cn } from './utils';
import { toneSurface, toneText } from './tone';

export interface BlockerItem {
  id: string;
  icon: LucideIcon;
  label: string;
  /** Motif du blocage, sous le libellé. */
  detail?: string;
  /** Nombre d'éléments concernés ; absent pour un élément unique. */
  count?: number;
  onOpen?: () => void;
}

interface BlockersPanelProps {
  title: string;
  description?: string;
  blockers: BlockerItem[];
  alternative?: {
    label: string;
    description?: string;
    onAction: () => void;
    loading?: boolean;
    disabledReason?: string;
  };
  className?: string;
}

/** Explique pourquoi une action est refusée par le serveur et propose une action de repli. */
export function BlockersPanel({
  title,
  description,
  blockers,
  alternative,
  className,
}: BlockersPanelProps) {
  const { t } = useTranslation();

  return (
    <section
      role="alert"
      className={cn('rounded-xl border p-4', className)}
      style={toneSurface('danger')}
    >
      <div className="flex items-start gap-3">
        <Ban className="w-5 h-5 mt-0.5 shrink-0" aria-hidden />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-0.5 text-xs text-foreground/80">
            {description ?? t('common.blockersPanel.description')}
          </p>
        </div>
      </div>

      <ul className="mt-3 divide-y divide-border rounded-lg border border-border bg-card text-foreground">
        {blockers.map(blocker => {
          const Icon = blocker.icon;
          return (
            <li key={blocker.id} className="flex items-center gap-3 px-3 py-2">
              <Icon className="w-4 h-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm">{blocker.label}</span>
                {blocker.detail && (
                  <span className="block truncate text-xs text-muted-foreground">{blocker.detail}</span>
                )}
              </span>
              {blocker.count !== undefined && (
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums"
                  style={{ ...toneSurface('danger'), ...toneText('danger') }}
                >
                  {blocker.count}
                </span>
              )}
              {blocker.onOpen && (
                <Button variant="link" size="sm" className="h-auto px-0" onClick={blocker.onOpen}>
                  {t('common.blockersPanel.open')}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
              )}
            </li>
          );
        })}
      </ul>

      {alternative && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2 text-foreground">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">
              {t('common.blockersPanel.alternative')}
            </p>
            {alternative.description && (
              <p className="text-xs text-muted-foreground">{alternative.description}</p>
            )}
          </div>
          <DisabledReason reason={alternative.disabledReason}>
            <Button
              size="sm"
              onClick={alternative.onAction}
              disabled={alternative.loading || Boolean(alternative.disabledReason)}
            >
              {alternative.loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {alternative.label}
            </Button>
          </DisabledReason>
        </div>
      )}
    </section>
  );
}
