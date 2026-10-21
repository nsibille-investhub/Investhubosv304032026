import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronDown, ChevronRight, RotateCcw, TriangleAlert } from 'lucide-react';
import { useTranslation } from '../../utils/languageContext';
import { Checkbox } from './checkbox';
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
  /** Effet optionnel : case à cocher. Décoché, l'effet ne se produira pas. */
  option?: { checked: boolean; onCheckedChange: (checked: boolean) => void; disabled?: boolean };
  /** Précision sous le libellé, par exemple le nombre d'emails qui partiront. */
  note?: string;
  /** Liste des objets dépliée à l'affichage. */
  defaultOpen?: boolean;
}

interface EffectsPanelProps {
  effects: EffectItem[];
  title?: string;
  description?: string;
  /** "none" masque les marqueurs Réversible et Irréversible, par exemple en mode annulation. */
  marker?: 'reversibility' | 'none';
  className?: string;
}

function EffectRow({ effect, marker }: { effect: EffectItem; marker: 'reversibility' | 'none' }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(Boolean(effect.defaultOpen));
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
          {effect.option ? (
            <Checkbox
              id={`effect-${effect.id}`}
              checked={effect.option.checked}
              onCheckedChange={checked => effect.option?.onCheckedChange(checked === true)}
              disabled={effect.option.disabled}
              className="mt-1.5"
            />
          ) : null}
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Icon className="w-4 h-4 text-muted-foreground" aria-hidden />
          </span>
          <div className={cn('min-w-0 flex-1', effect.option && !effect.option.checked && 'opacity-50')}>
            {effect.option ? (
              <label htmlFor={`effect-${effect.id}`} className="block cursor-pointer text-sm text-foreground">
                {effect.label}
              </label>
            ) : (
              <p className="text-sm text-foreground">{effect.label}</p>
            )}
            {effect.note && <p className="mt-0.5 text-xs text-muted-foreground">{effect.note}</p>}
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
          {marker === 'reversibility' && (
          <StatusBadge
            label={
              effect.reversible
                ? t('common.effectsPanel.reversible')
                : t('common.effectsPanel.irreversible')
            }
            variant={effect.reversible ? 'neutral' : 'danger'}
            icon={effect.reversible ? RotateCcw : TriangleAlert}
          />
          )}
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
export function EffectsPanel({ effects, title, description, marker = 'reversibility', className }: EffectsPanelProps) {
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
            <EffectRow key={effect.id} effect={effect} marker={marker} />
          ))}
        </ul>
      )}
    </section>
  );
}
