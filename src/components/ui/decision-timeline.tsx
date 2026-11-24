import type { ReactNode } from 'react';

import { cn } from './utils';

export interface DecisionTimelineEntry {
  id: string;
  /** Décision ou valeur retenue, en badge (StatusBadge). */
  badge: ReactNode;
  /** Couleur de la pastille sur le fil, par exemple `bg-red-500`. */
  dotClassName?: string;
  /** Entrée en vigueur : elle porte l'étiquette `currentLabel`. */
  current?: boolean;
  /** Précision à côté du badge : révision, question concernée... */
  meta?: ReactNode;
  /** Date déjà formatée. */
  date: string;
  author: string;
  /** Précision sous l'auteur : réponse retenue, valeur d'origine... */
  detail?: ReactNode;
  comment?: string;
}

interface DecisionTimelineProps {
  /** Entrées de la plus récente à la plus ancienne. */
  entries: DecisionTimelineEntry[];
  /** Étiquette de l'entrée en vigueur ("Décision actuelle", "Score actuel"). */
  currentLabel: string;
  emptyLabel: string;
  className?: string;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Historique de décisions sur un fil vertical : décision ou valeur en badge, auteur, date et commentaire.
 * Sert à l'historique des décisions d'une alerte et à celui des modifications de score.
 */
export function DecisionTimeline({ entries, currentLabel, emptyLabel, className }: DecisionTimelineProps) {
  if (entries.length === 0) return <p className={cn('text-sm text-slate-500', className)}>{emptyLabel}</p>;

  return (
    <div className={cn('relative', className)}>
      <span aria-hidden className="absolute left-2 top-3 bottom-0 w-px bg-gray-200" />
      <ol className="space-y-4">
        {entries.map(entry => (
          <li key={entry.id} className="relative pl-7">
            <span
              aria-hidden
              className={cn(
                'absolute left-1 top-1.5 w-2 h-2 rounded-full ring-2 ring-white',
                entry.dotClassName ?? 'bg-gray-400',
              )}
            />
            <div className="flex items-center gap-2 flex-wrap">
              {entry.badge}
              {entry.current && (
                <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  {currentLabel}
                </span>
              )}
              {entry.meta && <span className="text-xs text-slate-500">{entry.meta}</span>}
              <span className="flex-1" />
              <span className="text-xs text-slate-500 tabular-nums">{entry.date}</span>
            </div>

            <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-600">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[9px] font-semibold text-slate-600">
                {initials(entry.author)}
              </span>
              <span className="font-medium text-slate-700">{entry.author}</span>
              {entry.detail && <span className="text-slate-500">{entry.detail}</span>}
            </div>

            {entry.comment && (
              <p className="mt-2 rounded-lg border-l-2 border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {entry.comment}
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
