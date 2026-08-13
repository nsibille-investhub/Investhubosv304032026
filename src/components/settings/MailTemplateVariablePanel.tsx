import React, { useMemo, useRef, useState } from 'react';
import { GripVertical, Search, X } from 'lucide-react';

import { useTranslation, type Language } from '../../utils/languageContext';
import {
  VARIABLE_FAMILY_ORDER,
  searchVariables,
  type VariableDef,
  type VariableFamily,
} from '../../utils/mailTemplateVariables';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { SegmentedControl } from '../ui/segmented-control';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { cn } from '../ui/utils';

/** Type MIME utilisé pour le glisser-déposer d'une variable vers l'éditeur. */
export const VARIABLE_DND_TYPE = 'application/x-investhub-variable';

const FAMILY_STYLES: Record<VariableFamily, string> = {
  investor:
    'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300',
  partner:
    'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/30 dark:text-purple-300',
  campaign:
    'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/30 dark:text-teal-300',
  subscription:
    'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300',
  operation:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300',
  document:
    'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-300',
  security:
    'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300',
  core: 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

export interface MailTemplateVariablePanelProps {
  /** Variables déclarées par le gabarit. */
  templateVariables: string[];
  /** Variables proposées, pas encore remplacées à l'envoi. */
  proposedVariables: string[];
  /** Variables présentes dans le contenu affiché. */
  usedVariables: string[];
  onInsert: (variable: string) => void;
}

type Scope = 'template' | 'all';

export function MailTemplateVariablePanel({
  templateVariables,
  proposedVariables,
  usedVariables,
  onInsert,
}: MailTemplateVariablePanelProps) {
  const { t, lang } = useTranslation();
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<Scope>('template');
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);

  const allowed = useMemo(
    () => Array.from(new Set([...templateVariables, ...proposedVariables])),
    [templateVariables, proposedVariables],
  );

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
      <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {t('mailTemplates.editor.variablesLabel')}
          </span>
          <SegmentedControl
            size="sm"
            value={scope}
            onValueChange={(value) => {
              setScope(value as Scope);
              setActiveIndex(0);
            }}
            aria-label={t('mailTemplates.editor.scopeLabel')}
            options={[
              { value: 'template', label: t('mailTemplates.editor.scopeTemplate') },
              { value: 'all', label: t('mailTemplates.editor.scopeAll') },
            ]}
          />
        </div>

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

        <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
          {t('mailTemplates.editor.variableHelp')}
        </p>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-2">
        {flat.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            {t('mailTemplates.editor.noVariableFound')}
          </p>
        ) : (
          grouped.map((group) => (
            <div key={group.family} className="mb-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  {t(`mailTemplates.editor.families.${group.family}`)}
                </span>
                <span className="text-[11px] text-gray-300 dark:text-gray-600 tabular-nums">
                  {group.items.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {group.items.map((def) => (
                  <VariableTag
                    key={def.name}
                    def={def}
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

function VariableTag({
  def,
  isActive,
  isUsed,
  isProposed,
  isForeign,
  onInsert,
}: {
  def: VariableDef;
  isActive: boolean;
  isUsed: boolean;
  isProposed: boolean;
  isForeign: boolean;
  onInsert: () => void;
}) {
  const { t, lang } = useTranslation();
  const description = def.description[lang as Language] || def.description.fr;

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
            'group inline-flex items-center gap-1 pl-1.5 pr-2 py-1 rounded-md border font-mono text-[11px] cursor-grab transition-colors',
            FAMILY_STYLES[def.family],
            isActive && 'ring-2 ring-primary',
            isUsed && 'font-semibold',
          )}
        >
          <GripVertical className="w-3 h-3 opacity-40" aria-hidden />
          <span>{def.name}</span>
          {isProposed && <span className="text-[10px]">◦</span>}
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
