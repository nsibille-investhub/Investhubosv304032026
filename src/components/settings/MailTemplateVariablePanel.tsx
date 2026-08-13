import React, { useMemo, useState } from 'react';
import { GripVertical, Search, X } from 'lucide-react';

import { useTranslation, type Language } from '../../utils/languageContext';
import {
  CONTEXT_SOURCES,
  SELECTABLE_FAMILIES,
  VARIABLE_FAMILY_ORDER,
  optionFor,
  searchVariables,
  type ContextSelection,
  type SelectableFamily,
  type VariableDef,
  type VariableFamily,
} from '../../utils/mailTemplateVariables';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { cn } from '../ui/utils';

/** Type MIME utilisé pour le glisser-déposer d'une variable vers l'éditeur. */
export const VARIABLE_DND_TYPE = 'application/x-investhub-variable';

const FAMILY_DOT: Record<VariableFamily, string> = {
  investor: 'bg-blue-500',
  partner: 'bg-purple-500',
  campaign: 'bg-teal-500',
  subscription: 'bg-indigo-500',
  operation: 'bg-emerald-500',
  document: 'bg-orange-500',
  security: 'bg-red-500',
  core: 'bg-gray-400',
};

function isSelectable(family: VariableFamily): family is SelectableFamily {
  return (SELECTABLE_FAMILIES as VariableFamily[]).includes(family);
}

export interface MailTemplateVariablePanelProps {
  /** Variables déclarées par le gabarit. */
  templateVariables: string[];
  /** Variables proposées, pas encore remplacées à l'envoi. */
  proposedVariables: string[];
  /** Variables présentes dans le contenu affiché. */
  usedVariables: string[];
  /** Valeurs d'exemple courantes, issues de la sélection. */
  values: Record<string, string>;
  selection: ContextSelection;
  onSelectionChange: (family: SelectableFamily, optionId: string) => void;
  onInsert: (variable: string) => void;
}

type Scope = 'template' | 'all';

export function MailTemplateVariablePanel({
  templateVariables,
  proposedVariables,
  usedVariables,
  values,
  selection,
  onSelectionChange,
  onInsert,
}: MailTemplateVariablePanelProps) {
  const { t, lang } = useTranslation();
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<Scope>('template');
  const [activeIndex, setActiveIndex] = useState(0);

  const allowed = useMemo(
    () => Array.from(new Set([...templateVariables, ...proposedVariables])),
    [templateVariables, proposedVariables],
  );

  const templateCount = useMemo(
    () => searchVariables('', lang as Language, allowed).length,
    [lang, allowed],
  );
  const allCount = useMemo(() => searchVariables('', lang as Language).length, [lang]);

  const results = useMemo(
    () => searchVariables(query, lang as Language, scope === 'template' ? allowed : undefined),
    [query, lang, scope, allowed],
  );

  const grouped = useMemo(() => {
    const map = new Map<VariableFamily, VariableDef[]>();
    results.forEach((def) => {
      const bucket = map.get(def.family) ?? [];
      bucket.push(def);
      map.set(def.family, bucket);
    });
    return VARIABLE_FAMILY_ORDER.filter((family) => map.has(family)).map((family) => ({
      family,
      items: map.get(family)!,
    }));
  }, [results]);

  // L'ordre à plat suit l'affichage : la navigation clavier reste prévisible.
  const flat = useMemo(() => grouped.flatMap((group) => group.items), [grouped]);
  const safeIndex = Math.min(activeIndex, Math.max(0, flat.length - 1));

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, flat.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (event.key === 'Enter' && flat[safeIndex]) {
      event.preventDefault();
      onInsert(flat[safeIndex].name);
    } else if (event.key === 'Escape' && query) {
      event.preventDefault();
      setQuery('');
    }
  };

  return (
    <div className="flex flex-col h-[600px] border-l border-gray-100 dark:border-gray-800">
      <div className="px-3 py-3 border-b border-gray-100 dark:border-gray-800 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={t('mailTemplates.editor.variableSearchPlaceholder')}
            aria-label={t('mailTemplates.editor.variableSearchPlaceholder')}
            className="pl-9 pr-8 h-9 text-sm"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label={t('mailTemplates.editor.clearSearch')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filtre de périmètre : deux onglets pleine largeur, avec les volumes */}
        <div
          role="tablist"
          aria-label={t('mailTemplates.editor.scopeLabel')}
          className="flex p-0.5 rounded-lg bg-gray-100 dark:bg-gray-800"
        >
          {(
            [
              { value: 'template' as Scope, label: t('mailTemplates.editor.scopeTemplate'), count: templateCount },
              { value: 'all' as Scope, label: t('mailTemplates.editor.scopeAll'), count: allCount },
            ]
          ).map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={scope === tab.value}
              onClick={() => {
                setScope(tab.value);
                setActiveIndex(0);
              }}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 h-7 rounded-md text-xs font-medium transition-colors',
                scope === tab.value
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-950 dark:text-gray-100'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
              )}
            >
              <span>{tab.label}</span>
              <span className="tabular-nums opacity-60">{tab.count}</span>
            </button>
          ))}
        </div>

        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          {t('mailTemplates.editor.variableHelp')}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {flat.length === 0 ? (
          <p className="py-8 px-3 text-center text-sm text-gray-500 dark:text-gray-400">
            {t('mailTemplates.editor.noVariableFound')}
          </p>
        ) : (
          grouped.map((group) => (
            <div key={group.family} className="border-b border-gray-100 dark:border-gray-800">
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900/60">
                <div className="flex items-center gap-2">
                  <span className={cn('w-1.5 h-1.5 rounded-full', FAMILY_DOT[group.family])} />
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {t(`mailTemplates.editor.families.${group.family}`)}
                  </span>
                  <span className="text-[11px] text-gray-400 dark:text-gray-500 tabular-nums">
                    {group.items.length}
                  </span>
                </div>

                {/* Choix de l'élément servant de valeurs d'exemple pour cette famille */}
                {isSelectable(group.family) && (
                  <Select
                    value={selection[group.family]}
                    onValueChange={(value) => onSelectionChange(group.family, value)}
                  >
                    <SelectTrigger
                      className="mt-1.5 h-7 text-xs"
                      aria-label={t('mailTemplates.editor.sampleFor', {
                        family: t(`mailTemplates.editor.families.${group.family}`),
                      })}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTEXT_SOURCES[group.family].map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {`${option.label} · ${option.sublabel}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div>
                {group.items.map((def) => (
                  <VariableRow
                    key={def.name}
                    def={def}
                    sample={values[def.name]}
                    isActive={flat[safeIndex]?.name === def.name}
                    isUsed={usedVariables.includes(def.name)}
                    isProposed={proposedVariables.includes(def.name)}
                    isForeign={!allowed.includes(def.name)}
                    onInsert={() => onInsert(def.name)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function VariableRow({
  def,
  sample,
  isActive,
  isUsed,
  isProposed,
  isForeign,
  onInsert,
}: {
  def: VariableDef;
  sample: string | undefined;
  isActive: boolean;
  isUsed: boolean;
  isProposed: boolean;
  isForeign: boolean;
  onInsert: () => void;
}) {
  const { t, lang } = useTranslation();
  const description = def.description[lang as Language] || def.description.fr;
  const shown = sample === undefined ? '—' : sample === '' ? t('mailTemplates.editor.emptyValue') : sample;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          draggable
          onDragStart={(event) => {
            event.dataTransfer.setData(VARIABLE_DND_TYPE, def.name);
            event.dataTransfer.setData('text/plain', def.name);
            event.dataTransfer.effectAllowed = 'copy';
          }}
          onClick={onInsert}
          className={cn(
            'w-full text-left flex items-center gap-2 px-3 py-1.5 cursor-grab transition-colors',
            isActive
              ? 'bg-gray-100 dark:bg-gray-800'
              : 'hover:bg-gray-50 dark:hover:bg-gray-900',
          )}
        >
          <GripVertical className="w-3 h-3 text-gray-300 dark:text-gray-600 shrink-0" aria-hidden />
          <span
            className={cn(
              'font-mono text-[11px] shrink-0',
              isProposed
                ? 'text-amber-700 dark:text-amber-100'
                : isUsed
                  ? 'text-gray-900 font-semibold dark:text-gray-100'
                  : 'text-gray-600 dark:text-gray-300',
            )}
          >
            {def.name}
          </span>
          <span className="flex-1 text-right text-[11px] text-gray-400 dark:text-gray-500 truncate">
            {shown}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-[300px]">
        <p className="font-mono text-[11px]">{def.name}</p>
        {description && <p className="mt-1">{description}</p>}
        <p className="mt-1 text-[11px] opacity-70">
          {isProposed
            ? t('mailTemplates.editor.chipProposed')
            : isForeign
              ? t('mailTemplates.editor.chipForeign')
              : isUsed
                ? t('mailTemplates.editor.chipUsed')
                : t('mailTemplates.editor.chipInsert')}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
