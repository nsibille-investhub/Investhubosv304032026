import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  AlertCircle,
  CheckCircle2,
  CircleDashed,
  ClipboardList,
  Clock,
  FolderOpen,
  Info,
  Share2,
} from 'lucide-react';
import { useTranslation } from '../utils/languageContext';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { cn, WIDGET_SUBTITLE_CLASS, WIDGET_TITLE_CLASS } from './ui/utils';
import { SectionNav, type SectionNavItem } from './ui/section-nav';
import { SegmentedProgress } from './ui/segmented-progress';
import type { Tone } from './ui/tone';

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
  /** Clé du libellé de groupe (préonboarding, dossier). */
  groupKey?: string;
}

const STATE_ORDER: OnboardingItemState[] = [
  'pending',
  'awaitingValidation',
  'awaitingCorrection',
  'validated',
];

const STATE_STYLES: Record<
  OnboardingItemState,
  { icon: LucideIcon; dot: string; text: string; tile: string }
> = {
  pending: {
    icon: CircleDashed,
    dot: 'bg-gray-300',
    text: 'text-muted-foreground',
    tile: 'bg-muted',
  },
  awaitingValidation: {
    icon: Clock,
    dot: 'bg-amber-500',
    text: 'text-amber-700',
    tile: 'bg-amber-50 border-amber-200',
  },
  awaitingCorrection: {
    icon: AlertCircle,
    dot: 'bg-red-500',
    text: 'text-red-700',
    tile: 'bg-red-50 border-red-200',
  },
  validated: {
    icon: CheckCircle2,
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
    <SegmentedProgress
      total={stats.total}
      segments={STATE_ORDER.map(state => ({
        id: state,
        value: stats[state],
        tone: ONBOARDING_STATE_TONE[state],
      }))}
    />
  );
}

interface OnboardingCompletionCardProps {
  questions: OnboardingBucketStats;
  documents: OnboardingBucketStats;
  /** Action affichee a droite de l'en-tete, par exemple un renvoi vers l'onboarding. */
  action?: ReactNode;
}

/** Bandeau d'avancement du dossier : une ligne par famille. */
export function OnboardingCompletionCard({
  questions,
  documents,
  action,
}: OnboardingCompletionCardProps) {
  const { t } = useTranslation();

  // Les pièces justificatives ne comptent pas dans la complétion (IC-5216) : elles sont contrôlées à cette étape.
  const total = questions.total;
  const validated = questions.validated;
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
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className={WIDGET_TITLE_CLASS}>
            {t('subscriptions.detail.onboarding.completion.title')}
          </h3>
          <p className={cn(WIDGET_SUBTITLE_CLASS, 'tabular-nums')}>
            {t('subscriptions.detail.onboarding.completion.validatedItems', { validated, total })}
          </p>
        </div>
        <div className="flex items-center gap-2">
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
          {action}
        </div>
      </div>

      <div className="space-y-2">
        {rows.map(row => {
          const RowIcon = row.icon;
          return (
            <div key={row.id} className="flex items-center gap-3">
              <span className="flex w-48 shrink-0 items-center gap-2">
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
      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Info className="w-3.5 h-3.5 shrink-0" />
        {t('subscriptions.detail.onboarding.completion.documentsExcluded')}
      </p>
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
  /** Accès au rapport de report des données vers les objets liés, avec son état de synchronisation. */
  report?: { synced: boolean; onOpen: () => void };
}

const REPORT_NAV_ID = 'submission-report';

export const ONBOARDING_STATE_TONE: Record<OnboardingItemState, Tone> = {
  pending: 'neutral',
  awaitingValidation: 'warning',
  awaitingCorrection: 'danger',
  validated: 'success',
};

export function OnboardingSectionNav({
  sections,
  activeSectionId,
  onSelect,
  report,
}: OnboardingSectionNavProps) {
  const { t } = useTranslation();

  const reportState = report?.synced ? 'synced' : 'notSynced';
  const pinnedItems: SectionNavItem[] = report
    ? [
        {
          id: REPORT_NAV_ID,
          title: t('subscriptions.detail.report.navTitle'),
          subtitle: t(`subscriptions.detail.report.${reportState}`),
          icon: Share2,
          iconTone: report.synced ? 'success' : 'warning',
          indicator: {
            kind: 'dot',
            tone: report.synced ? 'success' : 'warning',
            label: t(`subscriptions.detail.report.${reportState}`),
          },
        },
      ]
    : [];

  const items: SectionNavItem[] = sections.map(section => {
    const state = getSectionState(section.stats);
    return {
      id: section.id,
      title: t(section.titleKey),
      subtitle:
        section.kind === 'documents'
          ? t(
              `subscriptions.detail.onboarding.completion.documentsCount${
                section.stats.total === 1 ? 'One' : 'Many'
              }`,
              { count: section.stats.total },
            )
          : t('subscriptions.detail.onboarding.completion.sectionPosition', {
              position: section.position,
              total: sections.length,
            }),
      icon: section.icon,
      iconTone: state === 'validated' ? 'success' : 'neutral',
      group: section.groupKey ? t(section.groupKey) : undefined,
      indicator: {
        kind: 'count',
        value: section.stats.validated,
        total: section.stats.total,
        tone: ONBOARDING_STATE_TONE[state],
      },
    };
  });

  return (
    <SectionNav
      title={t('subscriptions.detail.onboarding.completion.sectionsTitle')}
      items={items}
      activeId={activeSectionId}
      onSelect={id => (id === REPORT_NAV_ID ? report?.onOpen() : onSelect(id))}
      pinnedItems={pinnedItems}
    />
  );
}
