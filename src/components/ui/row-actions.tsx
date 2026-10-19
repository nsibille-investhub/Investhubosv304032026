import * as React from 'react';
import { Check, Eye, MoreVertical, RotateCcw, X, type LucideIcon } from 'lucide-react';
import { useTranslation } from '../../utils/languageContext';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';
import { cn } from './utils';

type Intent = 'neutral' | 'success' | 'danger' | 'warning';

const INTENT_CLASS: Record<Intent, string> = {
  neutral: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800',
  success: 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950',
  danger: 'text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950',
  warning: 'text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950',
};

interface RowActionButtonProps {
  icon: LucideIcon;
  tooltip: string;
  onClick: (e: React.MouseEvent) => void;
  intent?: Intent;
  disabled?: boolean;
  /** Action indisponible : bouton grisé, motif ajouté à l'infobulle. */
  disabledReason?: string;
  ariaLabel?: string;
}

/** Bouton icône d'une action de ligne, libellé de l'action au survol. */
export function RowActionButton({
  icon: Icon,
  tooltip,
  onClick,
  intent = 'neutral',
  disabled,
  disabledReason,
  ariaLabel,
}: RowActionButtonProps) {
  const isDisabled = disabled || Boolean(disabledReason);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* Le span garde l'infobulle active quand le bouton est désactivé. */}
        <span className="inline-flex" tabIndex={isDisabled ? 0 : undefined} onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            disabled={isDisabled}
            aria-label={ariaLabel || tooltip}
            className={cn('h-8 w-8 p-0', INTENT_CLASS[intent])}
            onClick={(e) => {
              e.stopPropagation();
              onClick(e);
            }}
          >
            <Icon className="h-4 w-4" />
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        {disabledReason ? (
          <span className="flex flex-col">
            <span>{tooltip}</span>
            <span className="text-xs opacity-80">{disabledReason}</span>
          </span>
        ) : (
          tooltip
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export interface TableRowAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  intent?: Intent;
  /** Action indisponible : grisée, motif au survol ou sous le libellé. */
  disabledReason?: string;
  /** Dans le menu ⋮ : séparateur avant l'action. */
  separatorBefore?: boolean;
}

/** Nombre d'actions affichées en boutons avant de passer au menu ⋮. */
export const ROW_ACTIONS_VISIBLE = 3;

/**
 * Actions d'une ligne de tableau, règle commune à toute l'application :
 * jusqu'à 3 actions, toutes en boutons icône ; au-delà, les 3 premières en boutons
 * et les suivantes dans un menu ⋮. Chaque bouton affiche son libellé au survol.
 */
export function TableRowActions({
  actions,
  className,
}: {
  actions: TableRowAction[];
  className?: string;
}) {
  const { t } = useTranslation();
  const visible = actions.slice(0, ROW_ACTIONS_VISIBLE);
  const overflow = actions.slice(ROW_ACTIONS_VISIBLE);

  return (
    <div className={cn('flex items-center justify-end gap-1', className)} onClick={(e) => e.stopPropagation()}>
      {visible.map((action) => (
        <RowActionButton
          key={action.label}
          icon={action.icon}
          tooltip={action.label}
          intent={action.intent}
          disabledReason={action.disabledReason}
          onClick={action.onClick}
        />
      ))}
      {overflow.length > 0 && (
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={t('common.listing.moreActions')}
                  className={cn('h-8 w-8 p-0', INTENT_CLASS.neutral)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>{t('common.listing.moreActions')}</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            {overflow.map((action, index) => (
              <React.Fragment key={action.label}>
                {action.separatorBefore && index > 0 && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  onClick={action.onClick}
                  disabled={Boolean(action.disabledReason)}
                  variant={action.intent === 'danger' ? 'destructive' : 'default'}
                >
                  <action.icon className="h-4 w-4" />
                  <span className="flex flex-col">
                    <span>{action.label}</span>
                    {action.disabledReason && <span className="text-xs text-muted-foreground">{action.disabledReason}</span>}
                  </span>
                </DropdownMenuItem>
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

interface RowActionsProps {
  onPreview?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  onReset?: () => void;
  previewLabel: string;
  acceptLabel?: string;
  rejectLabel?: string;
  resetLabel?: string;
  showPreview?: boolean;
  showAccept?: boolean;
  showReject?: boolean;
  showReset?: boolean;
  className?: string;
}

export function RowActions({
  onPreview,
  onAccept,
  onReject,
  onReset,
  previewLabel,
  acceptLabel,
  rejectLabel,
  resetLabel,
  showPreview = true,
  showAccept = true,
  showReject = true,
  showReset = false,
  className,
}: RowActionsProps) {
  const actions: TableRowAction[] = [];
  if (showPreview && onPreview) actions.push({ label: previewLabel, icon: Eye, onClick: onPreview });
  if (showReset && onReset && resetLabel) actions.push({ label: resetLabel, icon: RotateCcw, intent: 'warning', onClick: onReset });
  if (showAccept && onAccept && acceptLabel) actions.push({ label: acceptLabel, icon: Check, intent: 'success', onClick: onAccept });
  if (showReject && onReject && rejectLabel) actions.push({ label: rejectLabel, icon: X, intent: 'danger', onClick: onReject });
  return <TableRowActions actions={actions} className={className} />;
}
