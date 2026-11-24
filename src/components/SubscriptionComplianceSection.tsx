import { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileCheck,
  Globe,
  History,
  Eye,
  ListChecks,
  MessageSquare,
  Pencil,
  Radar,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  UserCheck,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '../utils/languageContext';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
  BIG_MODAL_COMPACT,
  BigModal,
  BigModalBody,
  BigModalContent,
  BigModalPanelFooter,
  BigModalPanelHeader,
} from './ui/big-modal';
import { DisabledReason } from './ui/disabled-reason';
import { RowActionButton } from './ui/row-actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { cn, WIDGET_LABEL_CLASS, WIDGET_SUBTITLE_CLASS, WIDGET_TITLE_CLASS } from './ui/utils';
import { PRIMARY_BUTTON_GRADIENT } from './ui/page-header';
import { WizardSteps } from './ui/wizard-steps';
import {
  aggregateClassScore,
  componentScore,
  computeProfileScore,
  findRiskTier,
  mockCategorisation,
  mockRiskProfile,
  mockRiskScales,
  PROFILE_SCORE_ID,
  type InvestorCategory,
  type RiskComponentSource,
  type RiskTone,
} from '../utils/subscriptionRiskMockData';
import {
  SubscriptionScreeningWidget,
  useSubscriptionScreening,
} from './SubscriptionScreeningWidget';
import type { LiveAuditInput } from '../utils/subscriptionAuditMock';
import {
  RiskScorePanel,
  ScoreCommentItem,
  type RiskScoreSave,
  type RiskScoreTarget,
  type ScoreComment,
} from './RiskScorePanel';

export type ComplianceStatus = 'pending' | 'awaitingValidation' | 'validated';

export interface ComplianceStatusSnapshot {
  status: ComplianceStatus;
  by: string | null;
  at: string | null;
}

const CURRENT_OPERATOR = 'Marie Dubois';

const TONE_STYLES: Record<RiskTone, { badge: string; text: string; bar: string; soft: string; stroke: string }> = {
  low: {
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    text: 'text-emerald-700',
    bar: 'bg-emerald-500',
    soft: 'bg-emerald-50 border-emerald-200',
    stroke: 'var(--color-emerald-500, #10b981)',
  },
  medium: {
    badge: 'bg-amber-100 text-amber-700 border-amber-300',
    text: 'text-amber-700',
    bar: 'bg-amber-500',
    soft: 'bg-amber-50 border-amber-200',
    stroke: 'var(--color-amber-500, #f59e0b)',
  },
  high: {
    badge: 'bg-orange-100 text-orange-700 border-orange-300',
    text: 'text-orange-700',
    bar: 'bg-orange-500',
    soft: 'bg-orange-50 border-orange-200',
    stroke: 'var(--color-orange-500, #f97316)',
  },
  critical: {
    badge: 'bg-red-100 text-red-700 border-red-300',
    text: 'text-red-700',
    bar: 'bg-red-500',
    soft: 'bg-red-50 border-red-200',
    stroke: 'var(--color-red-500, #ef4444)',
  },
};

const SOURCE_ICONS: Record<RiskComponentSource, typeof Globe> = {
  onboardingAnswer: FileCheck,
  manualQuestion: Pencil,
  screening: Radar,
};

const INVESTOR_CATEGORIES: InvestorCategory[] = [
  'nonProfessional',
  'professionalByNature',
  'professionalOnRequest',
  'eligibleCounterparty',
];

const now = () => {
  const date = new Date();
  return `${date.toLocaleDateString('fr-FR')} ${date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

export function ToneBadge({ tone, label, className }: { tone: RiskTone; label: string; className?: string }) {
  return <Badge className={cn(TONE_STYLES[tone].badge, className)}>{label}</Badge>;
}

/** Jauge circulaire du score, sur l'echelle 0-100 du profil. */
function ScoreDonut({
  score,
  tone,
  label,
  size = 96,
}: {
  score: number | null;
  tone: RiskTone;
  label: string;
  size?: number;
}) {
  const stroke = size >= 120 ? 12 : 9;
  const radius = size / 2 - stroke;
  const circumference = 2 * Math.PI * radius;
  const ratio = score === null ? 0 : Math.min(Math.max(score, 0), 100) / 100;

  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{ height: size, width: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={TONE_STYLES[tone].stroke}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference * ratio} ${circumference}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="relative text-center">
        <div className="text-2xl font-bold text-foreground tabular-nums leading-none">{score ?? '—'}</div>
        <div className={cn('mt-0.5 text-[11px] font-semibold', TONE_STYLES[tone].text)}>{label}</div>
      </div>
    </div>
  );
}

/** Détail des commentaires saisis à chaque modification de score. */
function ScoreCommentsDialog({
  open,
  onOpenChange,
  comments,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comments: ScoreComment[];
}) {
  const { t } = useTranslation();
  return (
    <BigModal open={open} onOpenChange={onOpenChange}>
      <BigModalContent className={`${BIG_MODAL_COMPACT} p-0 gap-0`}>
        <div className="flex flex-col overflow-hidden rounded-3xl">
          <BigModalPanelHeader
            icon={MessageSquare}
            title={t('subscriptions.detail.compliance.profile.comments.title')}
            subtitle={t('subscriptions.detail.compliance.profile.comments.subtitle')}
            onClose={() => onOpenChange(false)}
            closeLabel={t('common.confirmDialog.close')}
          />
          <BigModalBody>
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t('subscriptions.detail.compliance.profile.comments.empty')}
              </p>
            ) : (
              <ul className="divide-y divide-border rounded-lg border bg-card">
                {comments.map(item => (
                  <ScoreCommentItem key={item.id} item={item} />
                ))}
              </ul>
            )}
          </BigModalBody>
          <BigModalPanelFooter
            end={
              <Button variant="outline" size="sm" className="h-9" onClick={() => onOpenChange(false)}>
                {t('subscriptions.detail.compliance.profile.comments.close')}
              </Button>
            }
          />
        </div>
      </BigModalContent>
    </BigModal>
  );
}

interface RiskProfileWidgetProps {
  /** Dossier valide : les decisions ne sont plus modifiables. */
  locked: boolean;
  /** Scores saisis à la main, par composante, par section ou pour le score global. */
  manualScores: Record<string, number>;
  /** Scores des réponses choisies aux questions manuelles, par composante. */
  answerScores: Record<string, number>;
  /** Réponses modifiées depuis le panneau de détail, par composante. */
  answers: Record<string, string>;
  onScoreSave: (target: RiskScoreTarget, change: RiskScoreSave) => void;
  comments: ScoreComment[];
  computedAt: string;
  onRecompute: () => void;
  scoreValidated: boolean;
  scoreValidatedBy: string | null;
  scoreValidatedAt: string | null;
  onValidateScore: () => void;
  onReopenScore: () => void;
}

/** Widget Risque : score global, dates de calcul et de validation, scores par section. */
export function RiskProfileWidget({
  locked,
  manualScores,
  answerScores,
  answers,
  onScoreSave,
  comments,
  computedAt,
  onRecompute,
  scoreValidated,
  scoreValidatedBy,
  scoreValidatedAt,
  onValidateScore,
  onReopenScore,
}: RiskProfileWidgetProps) {
  const { t } = useTranslation();
  const [scaleVisible, setScaleVisible] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [panel, setPanel] = useState<{ target: RiskScoreTarget; context?: string } | null>(null);

  const tc = (key: string, count: number) => t(`${key}${count === 1 ? 'One' : 'Many'}`, { count });

  const scores = useMemo(() => ({ ...answerScores, ...manualScores }), [answerScores, manualScores]);

  const classScores = useMemo(
    () =>
      mockRiskProfile.classes.map(riskClass => ({
        riskClass,
        score: aggregateClassScore(riskClass, scores),
        unevaluated: riskClass.components.filter(
          component => componentScore(component, scores) === null,
        ).length,
      })),
    [manualScores, scores],
  );

  const profileScore = useMemo(() => computeProfileScore(scores), [scores]);
  const profileTier = findRiskTier(mockRiskProfile.scaleId, profileScore);
  const tone: RiskTone = profileTier?.tone ?? 'medium';
  const validationRequired = profileTier?.requiresValidation ?? false;
  const forced = typeof manualScores[PROFILE_SCORE_ID] === 'number';

  const editLockedReason = scoreValidated
    ? t('subscriptions.detail.compliance.score.editLockedReason')
    : undefined;

  const readOnlyReason = locked
    ? t('subscriptions.detail.compliance.score.lockedReason')
    : editLockedReason;

  const manualMarker = (targetId: string) => {
    const change = comments.find(item => item.targetId === targetId && item.scoreChange);
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Pencil className="w-3 h-3 text-amber-600" />
        </TooltipTrigger>
        <TooltipContent>
          <span className="text-xs">
            {t('subscriptions.detail.compliance.profile.manualBy', {
              name: change?.by ?? CURRENT_OPERATOR,
              date: change?.at ?? computedAt,
            })}
          </span>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <Card className="shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className={cn(WIDGET_TITLE_CLASS, 'truncate')}>
            {t('subscriptions.detail.compliance.profile.widgetTitle')}
          </h3>
          <p className={cn(WIDGET_SUBTITLE_CLASS, 'truncate')}>
            {t('subscriptions.detail.compliance.profile.widgetSubtitle', {
              name: mockRiskProfile.name,
              onboarding: mockRiskProfile.originOnboarding,
            })}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <RowActionButton
            icon={ListChecks}
            tooltip={t('subscriptions.detail.compliance.profile.showScale')}
            onClick={() => setScaleVisible(prev => !prev)}
          />
          <RowActionButton
            icon={MessageSquare}
            tooltip={tc('subscriptions.detail.compliance.profile.comments.open', comments.length)}
            onClick={() => setCommentsOpen(true)}
          />
          {!locked && (
            <RowActionButton
              icon={RefreshCw}
              tooltip={t('subscriptions.detail.compliance.score.recompute')}
              disabledReason={editLockedReason}
              onClick={onRecompute}
            />
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 px-4 py-3 border-b">
        <ScoreDonut
          score={profileScore}
          tone={tone}
          label={profileTier ? t(profileTier.labelKey) : t('subscriptions.detail.compliance.score.unavailable')}
        />

        <div className="min-w-0 flex-1 space-y-2">
          <dl className="space-y-1 text-xs">
            <div className="flex flex-wrap gap-1.5">
              <dt className="text-muted-foreground">{t('subscriptions.detail.compliance.score.computedDate')}</dt>
              <dd className="font-medium text-foreground">{computedAt}</dd>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <dt className="text-muted-foreground">{t('subscriptions.detail.compliance.score.validationDate')}</dt>
              <dd className="font-medium text-foreground">
                {scoreValidated
                  ? t('subscriptions.detail.compliance.score.validatedByAt', {
                      date: scoreValidatedAt ?? '',
                      name: scoreValidatedBy ?? '',
                    })
                  : t('subscriptions.detail.compliance.score.notValidated')}
              </dd>
            </div>
          </dl>

          {forced && (
            <p className="flex items-center gap-1.5 text-xs text-amber-700">
              {manualMarker(PROFILE_SCORE_ID)}
              {t('subscriptions.detail.compliance.score.forced')}
            </p>
          )}

          {validationRequired && !scoreValidated && (
            <p className="flex items-start gap-1.5 text-xs text-amber-700">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              {t('subscriptions.detail.compliance.score.validationRequired')}
            </p>
          )}

          {!locked && (
            <div className="flex flex-wrap items-center gap-2">
              {scoreValidated ? (
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={onReopenScore}>
                  <RotateCcw className="w-3.5 h-3.5" />
                  {t('subscriptions.detail.compliance.score.invalidate')}
                </Button>
              ) : (
                <Button variant="primary" size="sm" className="h-8 gap-1.5 text-xs" onClick={onValidateScore}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {t('subscriptions.detail.compliance.score.validate')}
                </Button>
              )}
              <DisabledReason reason={editLockedReason}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  disabled={scoreValidated}
                  onClick={() =>
                    setPanel({
                      target: {
                        id: PROFILE_SCORE_ID,
                        kind: 'profile',
                        labelKey: 'subscriptions.detail.compliance.score.global',
                        min: 0,
                        max: 100,
                        score: profileScore,
                        resettable: forced,
                      },
                    })
                  }
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  {t('subscriptions.detail.compliance.score.force')}
                </Button>
              </DisabledReason>
            </div>
          )}
        </div>
      </div>

      {scaleVisible && (
        <div className="px-4 py-3 border-b">
          <div className="grid grid-cols-4 gap-1.5">
            {mockRiskScales
              .find(scale => scale.id === mockRiskProfile.scaleId)
              ?.tiers.map(tier => (
                <div
                  key={tier.labelKey}
                  className={cn('rounded-lg border p-2', TONE_STYLES[tier.tone].soft)}
                >
                  <div className={cn('text-xs font-semibold', TONE_STYLES[tier.tone].text)}>
                    {t(tier.labelKey)}
                  </div>
                  <div className="text-[11px] text-muted-foreground tabular-nums">
                    {tier.min} - {tier.max}
                  </div>
                  {tier.requiresValidation && (
                    <ShieldCheck className="w-3 h-3 mt-1 text-muted-foreground" />
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      <ul className="divide-y">
        {classScores.map(({ riskClass, score, unevaluated }) => (
          <li key={riskClass.id} className="px-4 py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="min-w-0 truncate text-sm font-semibold text-foreground">
                {t(riskClass.labelKey)}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                {unevaluated > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <span className="text-xs">
                        {tc('subscriptions.detail.compliance.profile.unevaluated', unevaluated)}
                      </span>
                    </TooltipContent>
                  </Tooltip>
                )}
                <span className="text-sm font-bold text-foreground tabular-nums">
                  {score === null ? '-' : score.toFixed(2)}
                </span>
                <span className="w-8" aria-hidden />
              </div>
            </div>

            <ul>
              {riskClass.components.map(component => {
                const SourceIcon = SOURCE_ICONS[component.source];
                const shown = componentScore(component, scores);
                const isDefaultAnswer = Boolean(component.defaultAnswer) && answers[component.id] === undefined;
                const manual =
                  typeof manualScores[component.id] === 'number' ||
                  typeof component.manualScore === 'number';

                return (
                  <li key={component.id} className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-1.5 text-xs">
                      <SourceIcon className="w-3 h-3 shrink-0 text-muted-foreground" />
                      <span className="truncate text-foreground">{t(component.labelKey)}</span>
                      <span className="truncate text-muted-foreground">
                        {answers[component.id] ?? component.value}
                        {isDefaultAnswer && ` ${t('subscriptions.detail.compliance.profile.panel.defaultAnswer')}`}
                      </span>
                    </span>

                    <span className="flex items-center gap-1.5 shrink-0">
                      {manual && manualMarker(component.id)}
                      <span className="text-xs font-semibold text-foreground tabular-nums">
                        {shown === null ? '-' : shown.toFixed(2)}
                      </span>
                      <RowActionButton
                        icon={Eye}
                        tooltip={t('subscriptions.detail.compliance.profile.viewDetail')}
                        onClick={() =>
                          setPanel({
                            context: t(riskClass.labelKey),
                            target: {
                              id: component.id,
                              kind: component.source,
                              labelKey: component.labelKey,
                              answer: answers[component.id] ?? component.value,
                              answerOptions: component.answerOptions,
                              defaultAnswer: isDefaultAnswer,
                              scoreModifiable: component.scoreModifiable,
                              scoreValues: component.scoreValues,
                              frozen: manual,
                              min: component.min,
                              max: component.max,
                              score: shown,
                              resettable: false,
                            },
                          })
                        }
                      />
                    </span>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>

      <RiskScorePanel
        target={panel?.target ?? null}
        context={panel?.context}
        comments={comments}
        readOnlyReason={readOnlyReason}
        onClose={() => setPanel(null)}
        onSave={(target, change) => {
          onScoreSave(target, change);
          setPanel(null);
        }}
        onOpenAllComments={() => setCommentsOpen(true)}
      />
      <ScoreCommentsDialog open={commentsOpen} onOpenChange={setCommentsOpen} comments={comments} />
    </Card>
  );
}

interface SubscriptionComplianceSectionProps {
  scoreValidated: boolean;
  scoreValidatedBy: string | null;
  scoreValidatedAt: string | null;
  onValidateScore: () => void;
  onInvalidateScore: () => void;
  onSubscriptionValidated: () => void;
  /** Etat de la decision de conformite conserve par le parent entre deux affichages de l'etape. */
  initialStatus?: ComplianceStatusSnapshot;
  /** Identifiant de la souscription : fixe les tiers screenes rattaches au dossier. */
  screeningSeed?: string;
  onStatusChange?: (next: ComplianceStatusSnapshot) => void;
  /** Mode de validation (IC-5634) : chaque analyste passe la main au suivant, le dernier valide. */
  reviewMode?: 'partnerPrevalidation' | 'standard' | 'fourEyes';
  reviewChain?: { partner?: { name: string; by?: string }; firstAnalyst: string; secondAnalyst: string };
  onReviewEvent?: (event: { type: 'handedOff' | 'finalValidation'; by: string; to?: string }) => void;
  /** Inscrit une action de conformité dans la piste d'audit de la souscription. */
  onAuditEvent?: (entry: LiveAuditInput) => void;
  onOpenJournal?: () => void;
  /** Nombre d'actions du journal de conformité, affiché sur le bouton d'ouverture. */
  journalCount?: number;
}

/** Espace Validation / Conformite : widgets risque, screening, categorisation et validation. */
export function SubscriptionComplianceSection({
  scoreValidated,
  scoreValidatedBy,
  scoreValidatedAt,
  onValidateScore,
  onInvalidateScore,
  onSubscriptionValidated,
  initialStatus,
  screeningSeed = 'subscription',
  onStatusChange,
  reviewMode = 'standard',
  reviewChain,
  onReviewEvent,
  onAuditEvent,
  onOpenJournal,
  journalCount,
}: SubscriptionComplianceSectionProps) {
  const { t } = useTranslation();

  const tc = (key: string, count: number) => t(`${key}${count === 1 ? 'One' : 'Many'}`, { count });

  const [manualScores, setManualScores] = useState<Record<string, number>>({});
  const [computedAt, setComputedAt] = useState(mockRiskProfile.computedAt);
  const [riskAnswers, setRiskAnswers] = useState<Record<string, string>>({});
  const [answerScores, setAnswerScores] = useState<Record<string, number>>({});
  const [scoreComments, setScoreComments] = useState<ScoreComment[]>(() =>
    mockRiskProfile.classes
      .flatMap(item => item.components)
      .filter(component => typeof component.manualScore === 'number' && component.manualComment)
      .map(component => ({
        id: `seed-${component.id}`,
        targetId: component.id,
        labelKey: component.labelKey,
        scoreChange: { previous: component.score, next: component.manualScore ?? null },
        comment: component.manualComment ?? '',
        by: component.manualBy ?? CURRENT_OPERATOR,
        at: component.manualAt ?? mockRiskProfile.computedAt,
      })),
  );

  const [category, setCategory] = useState<InvestorCategory>(mockCategorisation.category);
  const [categoryDecidedBy, setCategoryDecidedBy] = useState(mockCategorisation.decidedBy);
  const [categoryDecidedAt, setCategoryDecidedAt] = useState(mockCategorisation.decidedAt);

  const [status, setStatus] = useState<ComplianceStatus>(
    initialStatus?.status ?? 'awaitingValidation',
  );
  const [statusBy, setStatusBy] = useState<string | null>(initialStatus?.by ?? null);
  const [statusAt, setStatusAt] = useState<string | null>(initialStatus?.at ?? null);
  const [overrideRequested, setOverrideRequested] = useState(false);
  const [reopenedAt, setReopenedAt] = useState<string | null>(null);
  const [handedOffTo, setHandedOffTo] = useState<string | null>(null);

  const logAudit = (entry: LiveAuditInput) => onAuditEvent?.({ actorName: CURRENT_OPERATOR, ...entry });

  const handleReportDownloaded = (entity: { name: string }) =>
    logAudit({ type: 'providerReportDownloaded', subject: entity.name });

  const profileScore = computeProfileScore({ ...answerScores, ...manualScores });
  const profileTier = findRiskTier(mockRiskProfile.scaleId, profileScore);
  const validationRequired = profileTier?.requiresValidation ?? false;

  const screening = useSubscriptionScreening(screeningSeed);

  const locked = status === 'validated';

  const blockers = [
    ...(screening.pending > 0
      ? [{ id: 'hits', labelKey: 'subscriptions.detail.compliance.final.blockerHits' }]
      : []),
    ...(validationRequired && !scoreValidated
      ? [{ id: 'score', labelKey: 'subscriptions.detail.compliance.final.blockerScore' }]
      : []),
  ];
  const canValidate = blockers.length === 0 || overrideRequested;

  const handleScoreSave = (target: RiskScoreTarget, change: RiskScoreSave) => {
    const stamp = now();
    const subject = t(target.labelKey);
    const answerChanged = change.answer !== undefined;
    const scoreChanged = change.score !== undefined;

    if (answerChanged) {
      logAudit({
        type: 'answerModified',
        subject,
        previousValue: target.answer || undefined,
        newValue: change.answer,
        reason: change.comment,
      });
      setRiskAnswers(prev => ({ ...prev, [target.id]: change.answer ?? '' }));
      if (change.answerScore !== undefined) {
        const answerScore = change.answerScore;
        setAnswerScores(prev => ({ ...prev, [target.id]: answerScore }));
      }
    }
    if (scoreChanged) {
      const next = change.score ?? null;
      logAudit({
        type: 'manualScoreSet',
        subject,
        previousValue: target.score === null ? undefined : String(target.score),
        newValue: next === null ? t('subscriptions.detail.compliance.profile.panel.computedValue') : String(next),
        reason: change.comment,
      });
      setManualScores(prev => {
        const scores = { ...prev };
        if (next === null) delete scores[target.id];
        else scores[target.id] = next;
        return scores;
      });
    }
    if (!answerChanged && !scoreChanged) {
      logAudit({ type: 'commentAdded', subject, newValue: change.comment });
    } else {
      setComputedAt(stamp);
    }

    setScoreComments(prev => [
      {
        id: `${target.id}-${Date.now()}`,
        targetId: target.id,
        labelKey: target.labelKey,
        scoreChange: scoreChanged
          ? { previous: target.score, next: change.score ?? null }
          : change.answerScore !== undefined
            ? { previous: target.score, next: change.answerScore }
            : undefined,
        answerChange: answerChanged ? { previous: target.answer ?? '', next: change.answer ?? '' } : undefined,
        comment: change.comment,
        by: CURRENT_OPERATOR,
        at: stamp,
      },
      ...prev,
    ]);

    const toastKey = !answerChanged && !scoreChanged
      ? 'commentSaved'
      : change.score === null
        ? 'scoreReset'
        : scoreChanged
          ? 'manualScoreSaved'
          : 'riskAnswerSaved';
    toast.success(t(`subscriptions.detail.compliance.toast.${toastKey}`), {
      description:
        answerChanged || scoreChanged
          ? t('subscriptions.detail.compliance.toast.manualScoreSavedDesc')
          : undefined,
    });
  };

  const handleRecompute = () => {
    logAudit({ type: 'scoreRecomputed', origin: 'operator', newValue: String(profileScore ?? '') });
    setComputedAt(now());
    toast.success(t('subscriptions.detail.compliance.toast.recomputed'), {
      description: t('subscriptions.detail.compliance.toast.recomputedDesc'),
    });
  };

  const handleCategoryChange = (next: InvestorCategory) => {
    logAudit({
      type: 'categorisationSet',
      previousValue: t(`subscriptions.detail.compliance.categories.${category}`),
      newValue: t(`subscriptions.detail.compliance.categories.${next}`),
    });
    setCategory(next);
    setCategoryDecidedBy(CURRENT_OPERATOR);
    setCategoryDecidedAt(now());
    toast.success(t('subscriptions.detail.compliance.toast.categorySaved'), {
      description: t(`subscriptions.detail.compliance.categories.${next}`),
    });
  };

  const firstAnalyst = reviewChain?.firstAnalyst ?? CURRENT_OPERATOR;
  const fourEyes = reviewMode === 'fourEyes' && Boolean(reviewChain);
  const awaitingHandOff = fourEyes && !handedOffTo;
  const currentAnalyst = handedOffTo ?? firstAnalyst;

  const chainSteps = [
    ...(reviewMode === 'partnerPrevalidation' && reviewChain?.partner
      ? [
          t('subscriptions.detail.compliance.chain.partner', {
            name: reviewChain.partner.by ?? reviewChain.partner.name,
          }),
        ]
      : []),
    t('subscriptions.detail.compliance.chain.analyst1', { name: firstAnalyst }),
    ...(fourEyes && reviewChain
      ? [t('subscriptions.detail.compliance.chain.analyst2', { name: reviewChain.secondAnalyst })]
      : []),
    t('subscriptions.detail.compliance.chain.validated'),
  ];
  const chainCurrent = locked
    ? chainSteps.length - 1
    : (reviewMode === 'partnerPrevalidation' && reviewChain?.partner ? 1 : 0) + (handedOffTo ? 1 : 0);

  const handleHandOff = () => {
    if (!reviewChain) return;
    const stamp = now();
    setHandedOffTo(reviewChain.secondAnalyst);
    setStatusBy(firstAnalyst);
    setStatusAt(stamp);
    onReviewEvent?.({ type: 'handedOff', by: firstAnalyst, to: reviewChain.secondAnalyst });
    toast.success(t('subscriptions.detail.compliance.chain.handedOffToast', { name: reviewChain.secondAnalyst }), {
      description: t('subscriptions.detail.compliance.chain.handedOffToastDesc'),
    });
  };

  const handleValidateCompliance = () => {
    const stamp = now();
    if (blockers.length > 0 && overrideRequested) {
      logAudit({
        type: 'complianceOverride',
        actorName: currentAnalyst,
        newValue: blockers.map(item => t(item.labelKey)).join(', '),
        reason: t('subscriptions.detail.compliance.final.override'),
      });
    }
    setStatus('validated');
    setStatusBy(currentAnalyst);
    setStatusAt(stamp);
    setReopenedAt(null);
    onReviewEvent?.({ type: 'finalValidation', by: currentAnalyst });
    onStatusChange?.({ status: 'validated', by: currentAnalyst, at: stamp });
    toast.success(t('subscriptions.detail.compliance.toast.complianceValidated'), {
      description: overrideRequested
        ? t('subscriptions.detail.compliance.toast.complianceValidatedOverride')
        : t('subscriptions.detail.compliance.toast.complianceValidatedDesc'),
    });
  };

  const handleReopen = () => {
    const stamp = now();
    logAudit({ type: 'complianceReopened' });
    setStatus('awaitingValidation');
    setStatusBy(CURRENT_OPERATOR);
    setStatusAt(stamp);
    setReopenedAt(stamp);
    setOverrideRequested(false);
    setHandedOffTo(null);
    onStatusChange?.({ status: 'awaitingValidation', by: CURRENT_OPERATOR, at: stamp });
    toast.info(t('subscriptions.detail.compliance.toast.complianceReopened'), {
      description: t('subscriptions.detail.compliance.toast.complianceReopenedDesc'),
    });
  };

  const handleSubmitToCompliance = () => {
    const stamp = now();
    logAudit({ type: 'complianceSubmitted' });
    setStatus('awaitingValidation');
    setStatusBy(CURRENT_OPERATOR);
    setStatusAt(stamp);
    onStatusChange?.({ status: 'awaitingValidation', by: CURRENT_OPERATOR, at: stamp });
    toast.success(t('subscriptions.detail.compliance.toast.submittedToCompliance'));
  };

  return (
    <div className="space-y-4">
      {/* Conformité : score, parties tierces, catégorisation et décision */}
      <Card className="shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <h3 className={WIDGET_TITLE_CLASS}>
              {t('subscriptions.detail.compliance.final.title')}
            </h3>
            {statusAt && (
              <p className={WIDGET_SUBTITLE_CLASS}>
                {t('subscriptions.detail.compliance.status.lastAction', {
                  name: statusBy ?? '',
                  date: statusAt,
                })}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onOpenJournal && (
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-9" onClick={onOpenJournal}>
                <History className="w-3.5 h-3.5" />
                {t('subscriptions.detail.compliance.journal.open')}
                {journalCount !== undefined && (
                  <span className="rounded-full bg-muted px-1.5 text-[11px] tabular-nums text-muted-foreground">
                    {journalCount}
                  </span>
                )}
              </Button>
            )}
            {locked ? (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                {t('subscriptions.detail.compliance.status.validated')}
              </Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                {t(`subscriptions.detail.compliance.status.${status}`)}
              </Badge>
            )}

            {locked ? (
              <>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-9" onClick={handleReopen}>
                  <RotateCcw className="w-3.5 h-3.5" />
                  {t('subscriptions.detail.compliance.status.reopen')}
                </Button>
                <Button
                  className="gap-2 text-white hover:opacity-90"
                  style={{ background: PRIMARY_BUTTON_GRADIENT }}
                  onClick={onSubscriptionValidated}
                >
                  <ChevronRight className="w-4 h-4" />
                  {t('subscriptions.detail.compliance.final.toSignature')}
                </Button>
              </>
            ) : (
              <>
                {status === 'pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs h-9"
                    onClick={handleSubmitToCompliance}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {t('subscriptions.detail.compliance.status.submit')}
                  </Button>
                )}
                <Button
                  size="lg"
                  className="gap-2 px-6 text-white hover:opacity-90"
                  style={{ background: PRIMARY_BUTTON_GRADIENT }}
                  disabled={!canValidate}
                  onClick={awaitingHandOff ? handleHandOff : handleValidateCompliance}
                >
                  {awaitingHandOff ? <ChevronRight className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                  {awaitingHandOff
                    ? t('subscriptions.detail.compliance.chain.handOff', { name: reviewChain?.secondAnalyst ?? '' })
                    : fourEyes
                      ? t('subscriptions.detail.compliance.chain.finalValidation', { name: currentAnalyst })
                      : t('subscriptions.detail.compliance.final.validate')}
                </Button>
              </>
            )}
          </div>
        </div>

        {chainSteps.length > 2 && (
          <div className="border-t px-4 py-3">
            <WizardSteps
              steps={chainSteps}
              current={chainCurrent}
              ariaLabel={t('subscriptions.detail.compliance.chain.ariaLabel')}
            />
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 border-t px-4 py-3">
          {/* Sous-widget score de risque */}
          <div className="rounded-lg border p-3">
            <div className="flex items-start justify-between gap-2">
              <span className={cn(WIDGET_LABEL_CLASS, 'flex items-center gap-1.5')}>
                <Radar className="w-3.5 h-3.5" />
                {t('subscriptions.detail.compliance.score.title')}
              </span>
              {!locked && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-[11px] h-6 shrink-0"
                  onClick={scoreValidated ? onInvalidateScore : onValidateScore}
                >
                  {scoreValidated ? (
                    <>
                      <RotateCcw className="w-3 h-3" />
                      {t('subscriptions.detail.compliance.score.invalidate')}
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3 h-3" />
                      {t('subscriptions.detail.compliance.score.validate')}
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="mt-2 flex items-center gap-2">
              <span className="text-xl font-bold text-foreground tabular-nums leading-none">
                {profileScore ?? '—'}
              </span>
              {profileTier && (
                <ToneBadge tone={profileTier.tone} label={t(profileTier.labelKey)} className="text-xs" />
              )}
            </div>

            {scoreValidated ? (
              <p className="mt-1.5 flex items-start gap-1.5 text-xs text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                {t('subscriptions.detail.compliance.final.scoreValidatedBy', {
                  name: scoreValidatedBy ?? '',
                  date: scoreValidatedAt ?? '',
                })}
              </p>
            ) : !validationRequired ? (
              <p className="mt-1.5 flex items-start gap-1.5 text-xs text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                {t('subscriptions.detail.compliance.score.noValidationNeeded')}
              </p>
            ) : (
              <p className="mt-1.5 flex items-start gap-1.5 text-xs text-amber-700">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                {t('subscriptions.detail.compliance.score.validationRequired')}
              </p>
            )}
          </div>

          {/* Sous-widget parties tierces */}
          <div className="rounded-lg border p-3">
            <span className={cn(WIDGET_LABEL_CLASS, 'flex items-center gap-1.5')}>
              <Users className="w-3.5 h-3.5" />
              {t('subscriptions.detail.compliance.final.thirdParties')}
            </span>

            {screening.partiesWithMatch === 0 ? (
              <p className="mt-2 flex items-start gap-1.5 text-sm text-foreground">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                {t('subscriptions.detail.compliance.final.noThirdPartyMatch')}
              </p>
            ) : (
              <>
                <p className="mt-2 text-sm text-foreground">
                  {tc(
                    'subscriptions.detail.compliance.final.thirdPartiesConcerned',
                    screening.partiesWithMatch,
                  )}{' '}
                  <span className="text-xs text-muted-foreground">
                    {tc('subscriptions.detail.compliance.final.matchCount', screening.matches.length)}
                  </span>
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {screening.pending > 0 && (
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {tc('subscriptions.detail.compliance.final.matchesToTreat', screening.pending)}
                    </Badge>
                  )}
                  {screening.treated > 0 && (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                      <Check className="w-3 h-3 mr-1" />
                      {tc('subscriptions.detail.compliance.final.matchesTreated', screening.treated)}
                    </Badge>
                  )}
                  {screening.confirmed > 0 && (
                    <Badge className="bg-red-50 text-red-700 border-red-200 text-xs">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {tc('subscriptions.detail.compliance.final.matchesAccepted', screening.confirmed)}
                    </Badge>
                  )}
                </div>
              </>
            )}

            {screening.clearParties > 0 && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                {tc('subscriptions.detail.compliance.final.thirdPartiesClear', screening.clearParties)}
              </p>
            )}
          </div>

          {/* Sous-widget catégorisation investisseur */}
          <div className="rounded-lg border p-3">
            <div className="flex items-start justify-between gap-2">
              <span className={cn(WIDGET_LABEL_CLASS, 'flex items-center gap-1.5')}>
                <UserCheck className="w-3.5 h-3.5" />
                {t('subscriptions.detail.compliance.categorisation.title')}
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className="bg-muted text-muted-foreground text-[11px] shrink-0">
                    {t('subscriptions.detail.compliance.categorisation.mifid')}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <span className="text-xs">
                    {t('subscriptions.detail.compliance.categorisation.mifidHint')}
                  </span>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="mt-2">
              <Select
                value={category}
                disabled={locked}
                onValueChange={value => handleCategoryChange(value as InvestorCategory)}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INVESTOR_CATEGORIES.map(item => (
                    <SelectItem key={item} value={item}>
                      {t(`subscriptions.detail.compliance.categories.${item}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <p className="mt-1.5 text-xs text-muted-foreground truncate">
              {t('subscriptions.detail.compliance.categorisation.decidedBy', {
                name: categoryDecidedBy,
                date: categoryDecidedAt,
              })}
            </p>
          </div>
        </div>

        {locked && (
          <div className="flex items-start gap-2 border-t bg-emerald-50 px-4 py-2 text-xs text-emerald-700">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>
              {t('subscriptions.detail.compliance.final.validatedBy', {
                name: statusBy ?? '',
                date: statusAt ?? '',
              })}{' '}
              {t('subscriptions.detail.compliance.final.lockedNotice')}
            </span>
          </div>
        )}

        {!locked && reopenedAt && (
          <div className="flex items-start gap-2 border-t bg-amber-50 px-4 py-2 text-xs text-amber-700">
            <RotateCcw className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>
              {t('subscriptions.detail.compliance.final.reopenedNotice', {
                name: statusBy ?? '',
                date: reopenedAt,
              })}
            </span>
          </div>
        )}

        {!locked && blockers.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-red-50 px-4 py-2">
            <span className="flex items-start gap-2 text-xs text-red-700 min-w-0">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                {tc('subscriptions.detail.compliance.final.blocked', blockers.length)} :{' '}
                {blockers.map(item => t(item.labelKey)).join(', ')}
              </span>
            </span>
            <label className="flex items-start gap-2 text-xs text-red-700 shrink-0">
              <input
                type="checkbox"
                checked={overrideRequested}
                onChange={event => setOverrideRequested(event.target.checked)}
                className="mt-0.5"
              />
              <span>{t('subscriptions.detail.compliance.final.override')}</span>
            </label>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <RiskProfileWidget
          locked={locked}
          manualScores={manualScores}
          answerScores={answerScores}
          answers={riskAnswers}
          onScoreSave={handleScoreSave}
          comments={scoreComments}
          computedAt={computedAt}
          onRecompute={handleRecompute}
          scoreValidated={scoreValidated}
          scoreValidatedBy={scoreValidatedBy}
          scoreValidatedAt={scoreValidatedAt}
          onValidateScore={onValidateScore}
          onReopenScore={onInvalidateScore}
        />

        <SubscriptionScreeningWidget
          screening={screening}
          locked={locked}
          onReportDownloaded={handleReportDownloaded}
          onDecisionApplied={({ alerts, decisionLabel, comments }) =>
            alerts.forEach(alert =>
              logAudit({
                type: 'hitQualified',
                subject: `${alert.name} · ${alert.entityName}`,
                newValue: decisionLabel,
                reason: comments[alert.id] || undefined,
              }),
            )
          }
        />
      </div>

    </div>
  );
}
