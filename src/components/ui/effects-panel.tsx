import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronDown, ChevronRight, RotateCcw, TriangleAlert } from 'lucide-react';
import { useTranslation } from '../../utils/languageContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';
import { StatusBadge } from '../StatusBadge';
import { cn, WIDGET_TITLE_CLASS } from './utils';

export interface EffectItem {
  id: string;
  icon: LucideIcon;
  label: string;
  /** Objets touchés, listés au dépliage. Le nombre affiché est leur total. */
  objects?: { id: string; label: string }[];
  /** Nombre d'objets quand la liste n'est pas chargée. */
  count?: number;
  reversible: boolean;
}

interface EffectsPanelProps {
  effects: EffectItem[];
  title?: string;
  description?: string;
  className?: string;
}

function EffectRow({ effect }: { effect: EffectItem }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const Icon = effect.icon;
  const count = effect.objects?.length ?? effect.count;
  const expandable = (effect.objects?.length ?? 0) > 0;

  const countLabel =
    count === undefined
      ? null
      : t(count === 1 ? 'common.effectsPanel.objectsOne' : 'common.effectsPanel.objectsMany', {
          count,
        });

  return (
    <li className="py-3">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Icon className="w-4 h-4 text-muted-foreground" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-foreground">{effect.label}</p>
            {countLabel &&
              (expandable ? (
                <CollapsibleTrigger className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                  {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  {countLabel}
                </CollapsibleTrigger>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">{countLabel}</p>
              ))}
          </div>
          <StatusBadge
            label={
              effect.reversible
                ? t('common.effectsPanel.reversible')
                : t('common.effectsPanel.irreversible')
            }
            variant={effect.reversible ? 'neutral' : 'danger'}
            icon={effect.reversible ? RotateCcw : TriangleAlert}
          />
        </div>
        {expandable && (
          <CollapsibleContent>
            <ul className="ml-10 mt-2 max-h-40 space-y-1 overflow-auto rounded-lg border border-border bg-muted/40 p-2">
              {effect.objects!.map(object => (
                <li key={object.id} className="truncate text-xs text-foreground/80">
                  {object.label}
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        )}
      </Collapsible>
    </li>
  );
}

/**
 * Annonce ce qu'une action va produire avant sa validation : valeur liquidative,
 * propagation depuis un fonds maître, suppression. La liste est fournie par le serveur.
 */
export function EffectsPanel({ effects, title, description, className }: EffectsPanelProps) {
  const { t } = useTranslation();

  return (
    <section
      className={cn('rounded-xl border border-border bg-card p-4', className)}
      aria-label={title ?? t('common.effectsPanel.title')}
    >
      <h3 className={WIDGET_TITLE_CLASS}>{title ?? t('common.effectsPanel.title')}</h3>
      {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      {effects.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{t('common.effectsPanel.none')}</p>
      ) : (
        <ul className="mt-1 divide-y divide-border">
          {effects.map(effect => (
            <EffectRow key={effect.id} effect={effect} />
          ))}
        </ul>
      )}
    </section>
  );
}
