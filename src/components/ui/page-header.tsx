import * as React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ChevronDown, Loader2, MoreVertical, Plus } from 'lucide-react';

import { useTranslation } from '../../utils/languageContext';
import { Button } from './button';
import { DisabledReason } from './disabled-reason';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { cn } from './utils';

export type PageHeaderBreadcrumbItem = {
  label: React.ReactNode;
  onClick?: () => void;
};

export type PageHeaderAction = {
  label: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
  /** Action indisponible : reste visible, désactivée, motif au survol. */
  disabledReason?: string;
  /** Enregistrement en cours : bouton désactivé avec indicateur de chargement. */
  loading?: boolean;
};

export type PageHeaderTertiaryAction = {
  label: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
  destructive?: boolean;
  separatorBefore?: boolean;
  disabled?: boolean;
  /** Motif affiché sous le libellé quand l'entrée est désactivée. */
  disabledReason?: string;
};

export type PageHeaderProps = {
  breadcrumb?: PageHeaderBreadcrumbItem[];
  onBack?: () => void;
  hideBackButton?: boolean;
  title: React.ReactNode;
  /** Pastille d'état, placée à droite du titre. */
  status?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Lignes complémentaires sous le sous-titre : attente, indicateurs d'état secondaires. */
  details?: React.ReactNode;
  primaryAction?: PageHeaderAction;
  secondaryAction?: PageHeaderAction;
  /** Actions secondaires supplémentaires, affichées avant secondaryAction. */
  extraActions?: PageHeaderAction[];
  tertiaryActions?: PageHeaderTertiaryAction[];
  tertiaryMenuAriaLabel?: string;
  /** Libellé du menu d'actions tertiaires. Sans libellé : icône seule. */
  tertiaryLabel?: string;
  className?: string;
};

function defaultBack() {
  if (typeof window !== 'undefined') {
    window.history.back();
  }
}

function PageHeaderBreadcrumb({
  items,
  onBack,
  showBack,
}: {
  items: PageHeaderBreadcrumbItem[];
  onBack: () => void;
  showBack: boolean;
}) {
  const { t } = useTranslation();
  return (
    <motion.nav
      aria-label={t('common.pageHeader.breadcrumb')}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-black/60 backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 text-sm">
        {showBack ? (
          <motion.button
            type="button"
            onClick={onBack}
            whileHover={{ x: -2 }}
            aria-label={t('common.pageHeader.back')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors p-1.5 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
          </motion.button>
        ) : null}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const baseClass = isLast
            ? 'text-gray-900 dark:text-gray-100 font-medium'
            : 'text-gray-400 dark:text-gray-500';
          return (
            <React.Fragment key={index}>
              {item.onClick && !isLast ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  className={cn(
                    baseClass,
                    'hover:text-gray-900 dark:hover:text-gray-100 transition-colors',
                  )}
                >
                  {item.label}
                </button>
              ) : (
                <span className={baseClass} aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span className="text-gray-300 dark:text-gray-700">/</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </motion.nav>
  );
}

export const PRIMARY_BUTTON_GRADIENT =
  'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)';

function OutlineAction({ action }: { action: PageHeaderAction }) {
  return (
    <DisabledReason reason={action.disabledReason}>
      <Button
        variant="outline"
        onClick={action.onClick}
        disabled={action.disabled || action.loading || Boolean(action.disabledReason)}
        aria-label={action.ariaLabel}
        className="gap-2"
      >
        {action.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : action.icon}
        <span className="font-medium">{action.label}</span>
      </Button>
    </DisabledReason>
  );
}

function PageHeader({
  breadcrumb,
  onBack,
  hideBackButton,
  title,
  status,
  subtitle,
  details,
  primaryAction,
  secondaryAction,
  extraActions,
  tertiaryActions,
  tertiaryMenuAriaLabel,
  tertiaryLabel,
  className,
}: PageHeaderProps) {
  const { t } = useTranslation();
  const hasTertiary = !!tertiaryActions && tertiaryActions.length > 0;
  const hasExtra = !!extraActions && extraActions.length > 0;
  const menuAriaLabel = tertiaryMenuAriaLabel ?? t('common.pageHeader.moreActions');

  return (
    <div data-slot="page-header" className={cn('flex flex-col', className)}>
      {breadcrumb && breadcrumb.length > 0 ? (
        <PageHeaderBreadcrumb
          items={breadcrumb}
          onBack={onBack ?? defaultBack}
          showBack={!hideBackButton}
        />
      ) : null}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 25 }}
        className="px-6 py-5 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800"
      >
        <div className="flex items-start justify-between gap-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              {status ? (
                <span className="inline-flex items-center gap-3">
                  {title}
                  {status}
                </span>
              ) : (
                title
              )}
            </h1>
            {subtitle ? (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            ) : null}
            {details ? <div className="mt-2 flex flex-col gap-2 text-sm text-muted-foreground">{details}</div> : null}
          </motion.div>

          {(primaryAction || secondaryAction || hasExtra || hasTertiary) && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center justify-end gap-3 shrink-0"
            >
              {extraActions?.map((action, index) => (
                <OutlineAction key={index} action={action} />
              ))}
              {secondaryAction?.disabledReason || secondaryAction?.loading ? (
                <OutlineAction action={secondaryAction} />
              ) : secondaryAction ? (
                <motion.div whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    variant="outline"
                    onClick={secondaryAction.onClick}
                    disabled={secondaryAction.disabled}
                    aria-label={secondaryAction.ariaLabel}
                    className="gap-2"
                  >
                    {secondaryAction.icon}
                    <span className="font-medium">{secondaryAction.label}</span>
                  </Button>
                </motion.div>
              ) : null}

              {primaryAction ? (
                <DisabledReason reason={primaryAction.disabledReason}>
                <motion.div whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    onClick={primaryAction.onClick}
                    disabled={primaryAction.disabled || primaryAction.loading || Boolean(primaryAction.disabledReason)}
                    aria-label={primaryAction.ariaLabel}
                    style={{ background: PRIMARY_BUTTON_GRADIENT }}
                    className="gap-2 hover:opacity-90 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 group relative overflow-hidden text-white"
                  >
                    <motion.div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                        repeatDelay: 1,
                      }}
                    />
                    <span className="relative z-10 inline-flex items-center gap-2">
                      {primaryAction.loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        primaryAction.icon ?? (
                          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                        )
                      )}
                      <span className="font-semibold">{primaryAction.label}</span>
                    </span>
                  </Button>
                </motion.div>
                </DisabledReason>
              ) : null}

              {hasTertiary ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    {tertiaryLabel ? (
                      <Button variant="outline" aria-label={menuAriaLabel} className="gap-2">
                        <span className="font-medium">{tertiaryLabel}</span>
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label={menuAriaLabel}
                        className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-900"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {tertiaryActions!.map((action, index) => (
                      <React.Fragment key={index}>
                        {action.separatorBefore && index > 0 ? (
                          <DropdownMenuSeparator />
                        ) : null}
                        <DropdownMenuItem
                          onClick={action.onClick}
                          disabled={action.disabled || Boolean(action.disabledReason)}
                          className={cn(
                            'cursor-pointer',
                            action.destructive && 'text-destructive focus:text-destructive',
                          )}
                        >
                          {action.icon ? (
                            <span className="mr-2 inline-flex items-center">
                              {action.icon}
                            </span>
                          ) : null}
                          <span className="flex flex-col">
                            <span>{action.label}</span>
                            {action.disabledReason ? (
                              <span className="text-xs text-muted-foreground">{action.disabledReason}</span>
                            ) : null}
                          </span>
                        </DropdownMenuItem>
                      </React.Fragment>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Sous-titre d'une page de détail. Référence : la fiche souscription.
 * Éléments icône + texte séparés par un trait vertical fin.
 */
function PageHeaderSubtitle({ children }: { children: React.ReactNode }) {
  return <span className="flex items-center flex-wrap gap-3">{children}</span>;
}

function PageHeaderSubtitleItem({
  icon: Icon,
  className,
  children,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </span>
  );
}

function PageHeaderSubtitleSeparator() {
  return <span aria-hidden className="h-3.5 w-px bg-border" />;
}

export { PageHeader, PageHeaderSubtitle, PageHeaderSubtitleItem, PageHeaderSubtitleSeparator };
