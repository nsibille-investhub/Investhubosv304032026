import type { LucideIcon } from 'lucide-react';
import {
  AlertCircle,
  CheckCircle2,
  CircleDashed,
  ClipboardList,
  Clock,
  FolderOpen,
} from 'lucide-react';
import { useTranslation } from '../utils/languageContext';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { cn, WIDGET_TITLE_CLASS } from './ui/utils';

export type OnboardingItemState =
  | 'pending'
  | 'awaitingValidation'
  | 'awaitingCorrection'
  | 'validated';

export interface OnboardingBucketStats {
  total: number;
  pending: number;
  awaitingValidation: number;
  awaitingCorrection: number;
  validated: number;
}

export interface OnboardingNavSection {
  id: string;
  titleKey: string;
  icon: LucideIcon;
  position: number;
  kind: 'questions' | 'documents';
  stats: OnboardingBucketStats;
}

const STATE_ORDER: OnboardingItemState[] = [
  'pending',
  'awaitingValidation',
  'awaitingCorrection',
  'validated',
];

const STATE_STYLES: Record<
  OnboardingItemState,
  { icon: LucideIcon; bar: string; dot: string; text: string; tile: string }
> = {
  pending: {
    icon: CircleDashed,
    bar: 'bg-border',
    dot: 'bg-gray-300',
    text: 'text-muted-foreground',
    tile: 'bg-muted',
  },
  awaitingValidation: {
    icon: Clock,
    bar: 'bg-amber-500',
    dot: 'bg-amber-500',
    text: 'text-amber-700',
    tile: 'bg-amber-50 border-amber-200',
  },
  awaitingCorrection: {
    icon: AlertCircle,
    bar: 'bg-red-500',
    dot: 'bg-red-500',
    text: 'text-red-700',
    tile: 'bg-red-50 border-red-200',
  },
  validated: {
    icon: CheckCircle2,
    bar: 'bg-emerald-500',
    dot: 'bg-emerald-500',
    text: 'text-emerald-700',
    tile: 'bg-emerald-50 border-emerald-200',
  },
};

export function emptyBucketStats(): OnboardingBucketStats {
  return {
    total: 0,
    pending: 0,
    awaitingValidation: 0,
    awaitingCorrection: 0,
    validated: 0,
  };
}

export function addToBucketStats(
  stats: OnboardingBucketStats,
  state: OnboardingItemState,
) {
  stats.total += 1;
  stats[state] += 1;
}

export function mergeBucketStats(
  target: OnboardingBucketStats,
  source: OnboardingBucketStats,
) {
  target.total += source.total;
  target.pending += source.pending;
  target.awaitingValidation += source.awaitingValidation;
  target.awaitingCorrection += source.awaitingCorrection;
  target.validated += source.validated;
}

/** Etat d'une section : vert quand tout est valide, rouge des qu'une correction est attendue. */
export function getSectionState(stats: OnboardingBucketStats): OnboardingItemState {
  if (stats.total > 0 && stats.validated === stats.total) return 'validated';
  if (stats.awaitingCorrection > 0) return 'awaitingCorrection';
  if (stats.pending > 0) return 'pending';
  return 'awaitingValidation';
}

const percent = (value: number, total: number) =>
  total > 0 ? Math.round((value / total) * 100) : 0;

function StackedBar({ stats }: { stats: OnboardingBucketStats }) {
  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
      {STATE_ORDER.map(state => {
        const count = stats[state];
        if (count === 0) return null;
        return (
          <div
            key={state}
            className={cn('h-full', STATE_STYLES[state].bar)}
            style={{ width: `${percent(count, stats.total)}%` }}
          />
        );
      })}
    </div>
  );
}

interface OnboardingCompletionCardProps {
  questions: OnboardingBucketStats;
  documents: OnboardingBucketStats;
}

/** Bandeau d'avancement du dossier : une ligne par famille. */
export function OnboardingCompletionCard({ questions, documents }: OnboardingCompletionCardProps) {
  const { t } = useTranslation();

  const total = questions.total + documents.total;
  const validated = questions.validated + documents.validated;
  const globalPercent = percent(validated, total);

  const rows = [
    {
      id: 'questions',
      icon: ClipboardList,
      label: t('subscriptions.detail.onboarding.completion.questions'),
      stats: questions,
    },
    {
      id: 'documents',
      icon: FolderOpen,
      label: t('subscriptions.detail.onboarding.completion.documents'),
      stats: documents,
    },
  ];

  return (
    <Card className="p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h3 className={WIDGET_TITLE_CLASS}>
          {t('subscriptions.detail.onboarding.completion.title')}
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground tabular-nums">
            {t('subscriptions.detail.onboarding.completion.validatedItems', { validated, total })}
          </span>
          <Badge
            className={cn(
              'tabular-nums',
              globalPercent === 100
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200',
            )}
          >
            {globalPercent}%
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        {rows.map(row => {
          const RowIcon = row.icon;
          return (
            <div key={row.id} className="flex items-center gap-3">
              <span className="flex w-52 shrink-0 items-center gap-2">
                <RowIcon className="w-4 h-4 shrink-0 text-muted-foreground" />
                <span className="truncate text-sm font-medium text-foreground">{row.label}</span>
              </span>
              <span className="min-w-0 flex-1">
                <StackedBar stats={row.stats} />
              </span>
              <OnboardingStateCounter stats={row.stats} compact className="shrink-0" />
              <span className="w-20 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                {row.stats.validated}/{row.stats.total}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

interface OnboardingStateCounterProps {
  stats: OnboardingBucketStats;
  /** Masque les libelles et ne garde que l'icone et le compteur. */
  compact?: boolean;
  className?: string;
}

/** Rappel des quatre etats, utilise dans l'en-tete de chaque section. */
export function OnboardingStateCounter({
  stats,
  compact = false,
  className,
}: OnboardingStateCounterProps) {
  const { t } = useTranslation();

  return (
    <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1', className)}>
      {STATE_ORDER.map(state => {
        const count = stats[state];
        if (count === 0) return null;
        const style = STATE_STYLES[state];
        const Icon = style.icon;
        const label = t(`subscriptions.detail.onboarding.completion.state.${state}`);

        if (compact) {
          return (
            <Tooltip key={state}>
              <TooltipTrigger asChild>
                <span
                  className={cn('inline-flex items-center gap-1 text-xs font-semibold', style.text)}
                  aria-label={`${count} ${label}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {count}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <span className="text-xs">{`${count} · ${label}`}</span>
              </TooltipContent>
            </Tooltip>
          );
        }

        return (
          <span
            key={state}
            className={cn('inline-flex items-center gap-1 text-xs font-semibold', style.text)}
          >
            <Icon className="w-3.5 h-3.5" />
            {count}
            <span className="font-medium">{label}</span>
          </span>
        );
      })}
    </div>
  );
}

interface OnboardingSectionNavProps {
  sections: OnboardingNavSection[];
  activeSectionId: string | null;
  onSelect: (sectionId: string) => void;
}

export function OnboardingSectionNav({
  sections,
  activeSectionId,
  onSelect,
}: OnboardingSectionNavProps) {
  const { t } = useTranslation();

  return (
    <Card className="p-3 shadow-sm sticky top-4">
      <h3 className={cn('px-2 pb-2 pt-1', WIDGET_TITLE_CLASS)}>
        {t('subscriptions.detail.onboarding.completion.sectionsTitle')}
      </h3>

      <nav className="flex flex-col gap-1">
        {sections.map(section => {
          const Icon = section.icon;
          const isActive = activeSectionId === section.id;
          const state = getSectionState(section.stats);
          const style = STATE_STYLES[state];

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSelect(section.id)}
              aria-current={isActive ? 'true' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent',
                isActive && 'bg-accent',
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                  state === 'validated' ? 'bg-emerald-50' : 'bg-muted',
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4',
                    state === 'validated' ? 'text-emerald-600' : 'text-muted-foreground',
                  )}
                />
              </span>

              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    'block truncate text-sm',
                    isActive ? 'font-semibold text-primary' : 'font-medium text-foreground',
                  )}
                >
                  {t(section.titleKey)}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {section.kind === 'documents'
                    ? t(
                        `subscriptions.detail.onboarding.completion.documentsCount${
                          section.stats.total === 1 ? 'One' : 'Many'
                        }`,
                        { count: section.stats.total },
                      )
                    : t('subscriptions.detail.onboarding.completion.sectionPosition', {
                        position: section.position,
                        total: sections.length,
                      })}
                </span>
              </span>

              <span className="flex shrink-0 items-center gap-1.5">
                <span className={cn('text-xs font-semibold tabular-nums', style.text)}>
                  {section.stats.validated}/{section.stats.total}
                </span>
                <span className={cn('h-2 w-2 rounded-full', style.dot)} />
              </span>
            </button>
          );
        })}
      </nav>
    </Card>
  );
}
