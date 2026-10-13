import type { ReactNode } from 'react';
import { LucideIcon, FilterX, RefreshCw } from 'lucide-react';
import { useTranslation } from '../utils/languageContext';
import { cn } from './ui/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  /** Mode listing : libellés générés à partir du nom de l'entité. */
  hasFilters?: boolean;
  hasSearch?: boolean;
  onReset?: () => void;
  entityName?: string; // "investisseur", "partenaire", etc.
  entityNamePlural?: string; // "investisseurs", "partenaires", etc.
  /** Mode générique : titre, description et action libres. Prioritaires sur le mode listing. */
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  hasFilters = false,
  hasSearch = false,
  onReset,
  icon: Icon,
  entityName = '',
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const { t } = useTranslation();
  const isFiltered = !title && (hasFilters || hasSearch);

  const heading =
    title ??
    (isFiltered
      ? t('common.emptyState.noneFound', { entity: entityName })
      : t('common.emptyState.none', { entity: entityName }));
  const body =
    description ??
    (isFiltered
      ? t('common.emptyState.filteredDescription', { entity: entityName })
      : t('common.emptyState.emptyDescription', { entity: entityName }));

  return (
    <div className={cn('flex items-center justify-center py-20 px-6', className)}>
      <div className="max-w-md text-center">
        <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted">
          {isFiltered ? (
            <FilterX className="w-7 h-7 text-muted-foreground" />
          ) : (
            <Icon className="w-7 h-7 text-muted-foreground" />
          )}
        </div>

        <h3 className="text-foreground mb-2">{heading}</h3>

        <p className="text-sm text-muted-foreground mb-6">{body}</p>

        {isFiltered && onReset && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-lg hover:bg-muted transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            {t('common.emptyState.resetFilters')}
          </button>
        )}
        {action}
      </div>
    </div>
  );
}
