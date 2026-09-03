import { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  FileCheck,
  FileText,
  Gavel,
  Globe,
  Landmark,
  ListChecks,
  MessageSquare,
  Newspaper,
  Pencil,
  Radar,
  RefreshCw,
  RotateCcw,
  Scale,
  ShieldAlert,
  ShieldCheck,
  User,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '../utils/languageContext';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { cn } from './ui/utils';
import { PRIMARY_BUTTON_GRADIENT } from './ui/page-header';
import {
  OnboardingCompletionCard,
  type OnboardingBucketStats,
} from './OnboardingCompletionOverview';
import {
  adequacyVerdict,
  aggregateClassScore,
  componentScore,
  computeProfileScore,
  findRiskTier,
  mockAdequacyCriteria,
  mockCategorisation,
  mockComplianceJournal,
  mockMonitoringUpdates,
  mockRiskProfile,
  mockRiskScales,
  mockScreenedEntities,
  type InvestorCategory,
  type RiskComponentSource,
  type RiskTone,
  type ScreenedEntity,
  type ScreeningCategory,
  type ScreeningHit,
  type ScreeningPurpose,
} from '../utils/subscriptionRiskMockData';

type ComplianceStatus = 'pending' | 'awaitingValidation' | 'validated';

interface HitDecisionState {
  discarded?: { by: string; at: string };
  accepted?: { by: string; at: string };
  comment?: { text: string; by: string; at: string };
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

const CATEGORY_ICONS: Record<ScreeningCategory, typeof Scale> = {
  sanctions: Scale,
  lawEnforcement: Gavel,
  regulatoryEnforcement: Landmark,
  otherBodies: Globe,
  pep: Users,
  specialInterest: ShieldAlert,
  adverseMedia: Newspaper,
};

const SOURCE_ICONS: Record<RiskComponentSource, typeof Globe> = {
  onboardingAnswer: FileCheck,
  manualQuestion: Pencil,
  countryList: Globe,
  screening: Radar,
  externalService: RefreshCw,
};

const INVESTOR_CATEGORIES: InvestorCategory[] = [
  'nonProfessional',
  'professionalByNature',
  'professionalOnRequest',
  'eligibleCounterparty',
];

const PURPOSE_ORDER: ScreeningPurpose[] = [
  'subscriber',
  'representative',
  'signatory',
  'beneficialOwner',
  'other',
];

const now = () => {
  const date = new Date();
  return `${date.toLocaleDateString('fr-FR')} ${date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

const round1 = (value: number) => Math.round(value * 10) / 10;

function ToneBadge({ tone, label, className }: { tone: RiskTone; label: string; className?: string }) {
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

interface RiskProfileWidgetProps {
  manualScores: Record<string, number>;
  onManualScore: (componentId: string, value: number) => void;
  computedAt: string;
  onRecompute: () => void;
  scoreValidated: boolean;
  scoreValidatedBy: string | null;
  scoreValidatedAt: string | null;
  onValidateScore: () => void;
}

/** Widget Risque : score, echelle et detail du calcul classe par classe. */
export function RiskProfileWidget({
  manualScores,
  onManualScore,
  computedAt,
  onRecompute,
  scoreValidated,
  scoreValidatedBy,
  scoreValidatedAt,
  onValidateScore,
}: RiskProfileWidgetProps) {
  const { t } = useTranslation();
  const [scaleVisible, setScaleVisible] = useState(false);
  const [editingComponent, setEditingComponent] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const tc = (key: string, count: number) => t(`${key}${count === 1 ? 'One' : 'Many'}`, { count });

  const classScores = useMemo(
    () =>
      mockRiskProfile.classes.map(riskClass => ({
        riskClass,
        score: aggregateClassScore(riskClass, manualScores),
        unevaluated: riskClass.components.filter(
          component => componentScore(component, manualScores) === null,
        ).length,
      })),
    [manualScores],
  );

  const profileScore = useMemo(() => computeProfileScore(manualScores), [manualScores]);
  const profileTier = findRiskTier(mockRiskProfile.scaleId, profileScore);
  const tone: RiskTone = profileTier?.tone ?? 'medium';
  const validationRequired = profileTier?.requiresValidation ?? false;

  const handleSave = (componentId: string, min: number, max: number) => {
    const parsed = Number(editingValue.replace(',', '.'));
    if (Number.isNaN(parsed) || parsed < min || parsed > max) {
      toast.error(t('subscriptions.detail.compliance.toast.invalidScore'), {
        description: t('subscriptions.detail.compliance.toast.invalidScoreDesc', { min, max }),
      });
      return;
    }
    onManualScore(componentId, round1(parsed));
    setEditingComponent(null);
  };

  return (
    <Card className="shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground truncate">
            {t('subscriptions.detail.compliance.profile.widgetTitle', { name: mockRiskProfile.name })}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {t('subscriptions.detail.compliance.score.origin', {
              onboarding: mockRiskProfile.originOnboarding,
            })}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground"
            title={t('subscriptions.detail.compliance.profile.showScale')}
            aria-label={t('subscriptions.detail.compliance.profile.showScale')}
            onClick={() => setScaleVisible(prev => !prev)}
          >
            <ListChecks className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground"
            title={t('subscriptions.detail.compliance.score.recompute')}
            aria-label={t('subscriptions.detail.compliance.score.recompute')}
            onClick={onRecompute}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 px-4 py-3 border-b">
        <ScoreDonut
          score={profileScore}
          tone={tone}
          label={profileTier ? t(profileTier.labelKey) : t('subscriptions.detail.compliance.score.unavailable')}
        />

        <div className="min-w-0 flex-1 space-y-1">
          <Badge
            className={
              mockRiskProfile.formulaKind === 'custom'
                ? 'bg-amber-50 text-amber-700 border-amber-200 text-xs'
                : 'bg-muted text-muted-foreground text-xs'
            }
          >
            {t(`subscriptions.detail.compliance.profile.formulaKind.${mockRiskProfile.formulaKind}`)}
          </Badge>
          <p className="text-xs text-muted-foreground">{mockRiskProfile.formula}</p>
          <p className="text-xs text-muted-foreground">
            {t('subscriptions.detail.compliance.score.computedAt', { date: computedAt })}
          </p>

          {validationRequired ? (
            scoreValidated ? (
              <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  {t('subscriptions.detail.compliance.score.validated')} · {scoreValidatedBy} ·{' '}
                  {scoreValidatedAt}
                </span>
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-start gap-1.5 text-xs text-amber-700">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  {t('subscriptions.detail.compliance.score.validationRequired')}
                </span>
                <Button
                  size="sm"
                  className="gap-1.5 text-xs h-7 text-white hover:opacity-90"
                  style={{ background: PRIMARY_BUTTON_GRADIENT }}
                  onClick={onValidateScore}
                >
                  <ShieldCheck className="w-3 h-3" />
                  {t('subscriptions.detail.compliance.score.validate')}
                </Button>
              </div>
            )
          ) : (
            <p className="text-xs text-muted-foreground">
              {t('subscriptions.detail.compliance.score.noValidationNeeded')}
            </p>
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
                    {tier.min} – {tier.max}
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
        {classScores.map(({ riskClass, score, unevaluated }) => {
          const tier = findRiskTier(riskClass.scaleId, score);
          return (
            <li key={riskClass.id} className="px-4 py-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{t(riskClass.labelKey)}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {t('subscriptions.detail.compliance.profile.weight', { weight: riskClass.weight })}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">{riskClass.formula}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
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
                    {score === null ? '—' : score.toFixed(2)}
                  </span>
                  {tier ? (
                    <ToneBadge tone={tier.tone} label={t(tier.labelKey)} className="text-xs" />
                  ) : (
                    <Badge className="bg-muted text-muted-foreground text-xs">
                      {t('subscriptions.detail.compliance.score.unavailable')}
                    </Badge>
                  )}
                </div>
              </div>

              <ul className="mt-1.5 space-y-1">
                {riskClass.components.map(component => {
                  const SourceIcon = SOURCE_ICONS[component.source];
                  const shown = componentScore(component, manualScores);
                  const manual =
                    typeof manualScores[component.id] === 'number' ||
                    typeof component.manualScore === 'number';
                  const isEditing = editingComponent === component.id;

                  return (
                    <li key={component.id} className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-1.5 text-xs">
                        <SourceIcon className="w-3 h-3 shrink-0 text-muted-foreground" />
                        <span className="truncate text-foreground">{t(component.labelKey)}</span>
                        <span className="truncate text-muted-foreground">{component.value}</span>
                      </span>

                      <span className="flex items-center gap-1 shrink-0">
                        {manual && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Pencil className="w-3 h-3 text-amber-600" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <span className="text-xs">
                                {t('subscriptions.detail.compliance.profile.manualBy', {
                                  name: component.manualBy ?? CURRENT_OPERATOR,
                                  date: component.manualAt ?? computedAt,
                                })}
                              </span>
                            </TooltipContent>
                          </Tooltip>
                        )}

                        {isEditing ? (
                          <>
                            <Input
                              value={editingValue}
                              onChange={event => setEditingValue(event.target.value)}
                              className="h-6 w-14 text-right text-xs"
                            />
                            <Button
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleSave(component.id, component.min, component.max)}
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <span className="text-xs font-semibold text-foreground tabular-nums">
                              {shown === null ? '—' : shown.toFixed(2)}
                            </span>
                            {component.manualAllowed && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-muted-foreground"
                                title={t('subscriptions.detail.compliance.profile.setScore')}
                                aria-label={t('subscriptions.detail.compliance.profile.setScore')}
                                onClick={() => {
                                  setEditingComponent(component.id);
                                  setEditingValue(shown === null ? '' : String(shown));
                                }}
                              >
                                <Pencil className="w-3 h-3" />
                              </Button>
                            )}
                          </>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

interface ScreeningWidgetProps {
  hitDecisions: Record<string, HitDecisionState>;
  onDiscard: (hit: ScreeningHit, comment: string) => boolean;
  onAccept: (hit: ScreeningHit, comment: string) => void;
  monitoring: Record<string, boolean>;
  onToggleMonitoring: (entity: ScreenedEntity, next: boolean) => void;
  extraRuns: Record<string, { at: string; by: string }[]>;
  onRerun: (entity: ScreenedEntity) => void;
  acknowledgedUpdates: string[];
  onAcknowledge: (updateId: string) => void;
}

/** Widget Screening : entites controlees, listes detectees et decision par correspondance. */
export function ScreeningWidget({
  hitDecisions,
  onDiscard,
  onAccept,
  monitoring,
  onToggleMonitoring,
  extraRuns,
  onRerun,
  acknowledgedUpdates,
  onAcknowledge,
}: ScreeningWidgetProps) {
  const { t } = useTranslation();
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [openCommentFor, setOpenCommentFor] = useState<string | null>(null);
  const [openHistory, setOpenHistory] = useState<string[]>([]);

  const tc = (key: string, count: number) => t(`${key}${count === 1 ? 'One' : 'Many'}`, { count });

  const entities = [...mockScreenedEntities].sort(
    (a, b) => PURPOSE_ORDER.indexOf(a.purpose) - PURPOSE_ORDER.indexOf(b.purpose),
  );
  const allHits = entities.flatMap(entity => entity.hits);
  const untreated = allHits.filter(hit => {
    const decision = hitDecisions[hit.id];
    return !decision?.discarded && !decision?.accepted;
  }).length;
  const accepted = allHits.filter(hit => hitDecisions[hit.id]?.accepted).length;
  const pendingUpdates = mockMonitoringUpdates.filter(
    update => !acknowledgedUpdates.includes(update.id),
  );

  return (
    <Card className="shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground truncate">
            {t('subscriptions.detail.compliance.screening.title')}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {t('subscriptions.detail.compliance.screening.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge
            className={
              untreated > 0
                ? 'bg-amber-50 text-amber-700 border-amber-200 text-xs'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 text-xs'
            }
          >
            {tc('subscriptions.detail.compliance.screening.untreated', untreated)}
          </Badge>
          {accepted > 0 && (
            <Badge className="bg-red-50 text-red-700 border-red-200 text-xs">
              {tc('subscriptions.detail.compliance.screening.accepted', accepted)}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground"
            title={t('subscriptions.detail.compliance.screening.exportPdf')}
            aria-label={t('subscriptions.detail.compliance.screening.exportPdf')}
            onClick={() =>
              toast.success(t('subscriptions.detail.compliance.toast.exportScreening'), {
                description: t('subscriptions.detail.compliance.toast.exportScreeningDesc'),
              })
            }
          >
            <FileText className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {pendingUpdates.length > 0 && (
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 space-y-1.5">
          {pendingUpdates.map(update => {
            const entity = entities.find(item => item.id === update.entityId);
            return (
              <div key={update.id} className="flex items-start justify-between gap-2">
                <span className="flex items-start gap-1.5 text-xs text-amber-700 min-w-0">
                  <Radar className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>
                    {t('subscriptions.detail.compliance.monitoring.updateLine', {
                      name: entity?.name ?? '',
                      date: update.at,
                    })}{' '}
                    {t(update.labelKey)}
                  </span>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs h-6 shrink-0"
                  onClick={() => onAcknowledge(update.id)}
                >
                  <Check className="w-3 h-3" />
                  {t('subscriptions.detail.compliance.monitoring.acknowledge')}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <ul className="divide-y">
        {entities.map(entity => {
          const EntityIcon = entity.kind === 'company' ? Building2 : User;
          const runs = [
            ...(extraRuns[entity.id] ?? []).map(run => ({
              at: run.at,
              by: run.by,
              hitCount: entity.hits.length,
            })),
            ...entity.runs,
          ];
          const historyOpen = openHistory.includes(entity.id);

          return (
            <li key={entity.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <EntityIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm truncate">
                      <span className="text-muted-foreground">
                        {t(
                          entity.kind === 'company'
                            ? 'subscriptions.detail.compliance.screening.entityChecked'
                            : 'subscriptions.detail.compliance.screening.individualChecked',
                        )}
                      </span>{' '}
                      <span className="font-semibold text-foreground">{entity.name}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {t(`subscriptions.detail.compliance.purposes.${entity.purpose}`)} ·{' '}
                      {t(`subscriptions.detail.compliance.providers.${entity.provider}`)} ·{' '}
                      {entity.providerRef}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex items-center">
                        <Switch
                          checked={monitoring[entity.id]}
                          onCheckedChange={next => onToggleMonitoring(entity, next)}
                        />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span className="text-xs">
                        {t('subscriptions.detail.compliance.screening.monitoring')}
                      </span>
                    </TooltipContent>
                  </Tooltip>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground"
                    title={t('subscriptions.detail.compliance.screening.rerun')}
                    aria-label={t('subscriptions.detail.compliance.screening.rerun')}
                    onClick={() => onRerun(entity)}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground"
                    title={t('subscriptions.detail.compliance.screening.history')}
                    aria-label={t('subscriptions.detail.compliance.screening.history')}
                    onClick={() =>
                      setOpenHistory(prev =>
                        prev.includes(entity.id)
                          ? prev.filter(item => item !== entity.id)
                          : [...prev, entity.id],
                      )
                    }
                  >
                    {historyOpen ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="mt-1.5 flex items-center gap-1.5">
                {entity.hits.length === 0 ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-xs text-foreground">
                      {t('subscriptions.detail.compliance.screening.noMatchWithList', {
                        list: entity.screeningList,
                      })}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span className="text-xs font-medium text-foreground">
                      {t(
                        `subscriptions.detail.compliance.screening.resultsWithList${
                          entity.hits.length === 1 ? 'One' : 'Many'
                        }`,
                        { count: entity.hits.length, list: entity.screeningList },
                      )}
                    </span>
                  </>
                )}
              </div>

              {entity.hits.map(hit => {
                const decision = hitDecisions[hit.id] ?? {};
                const CategoryIcon = CATEGORY_ICONS[hit.category];
                const isCommentOpen = openCommentFor === hit.id;
                const treated = Boolean(decision.discarded || decision.accepted);

                return (
                  <div
                    key={hit.id}
                    className={cn(
                      'mt-2 rounded-lg border p-2.5',
                      decision.accepted
                        ? 'bg-red-50 border-red-200'
                        : decision.discarded
                          ? 'bg-muted'
                          : 'bg-amber-50 border-amber-200',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge className="bg-card text-foreground text-[11px]">
                            {t(
                              `subscriptions.detail.compliance.screening.match${
                                hit.matchType === 'exact' ? 'Exact' : 'Partial'
                              }`,
                            )}
                          </Badge>
                          <span className="text-sm font-medium text-foreground truncate">{hit.name}</span>
                          <span className="text-[11px] text-muted-foreground tabular-nums">
                            {t('subscriptions.detail.compliance.screening.matchRate', {
                              rate: hit.matchRate,
                            })}
                          </span>
                        </div>

                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                          <span className="inline-flex items-center gap-1 text-foreground">
                            <CategoryIcon className="w-3 h-3 text-muted-foreground shrink-0" />
                            {t(`subscriptions.detail.compliance.hitCategories.${hit.category}`)}
                          </span>
                          <span className="text-muted-foreground">{hit.country}</span>
                          {hit.birthYear && (
                            <span className="text-muted-foreground">
                              {t('subscriptions.detail.compliance.screening.birthYear', {
                                year: hit.birthYear,
                              })}
                            </span>
                          )}
                          <span className="text-muted-foreground">{t(hit.sourceKey)}</span>
                        </div>

                        <p className="mt-0.5 text-xs text-muted-foreground">{t(hit.summaryKey)}</p>

                        {decision.comment && (
                          <div className="mt-1.5 rounded-lg bg-card p-2">
                            <p className="text-xs text-foreground">{decision.comment.text}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {t('subscriptions.detail.compliance.screening.commentBy', {
                                name: decision.comment.by,
                                date: decision.comment.at,
                              })}
                            </p>
                          </div>
                        )}

                        {isCommentOpen && (
                          <div className="mt-1.5 space-y-1">
                            <Textarea
                              value={commentDrafts[hit.id] ?? ''}
                              onChange={event =>
                                setCommentDrafts(prev => ({ ...prev, [hit.id]: event.target.value }))
                              }
                              placeholder={t('subscriptions.detail.compliance.screening.commentPlaceholder')}
                              className="text-xs"
                            />
                            <p className="text-[11px] text-muted-foreground">
                              {t('subscriptions.detail.compliance.screening.commentMandatory')}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {decision.accepted ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge className="bg-red-100 text-red-700 border-red-300 text-[11px]">
                                {t('subscriptions.detail.compliance.screening.acceptedTag')}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <span className="text-xs">
                                {t('subscriptions.detail.compliance.screening.decisionBy', {
                                  name: decision.accepted.by,
                                  date: decision.accepted.at,
                                })}
                              </span>
                            </TooltipContent>
                          </Tooltip>
                        ) : decision.discarded ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge className="bg-card text-muted-foreground text-[11px]">
                                {t('subscriptions.detail.compliance.screening.discarded')}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <span className="text-xs">
                                {t('subscriptions.detail.compliance.screening.decisionBy', {
                                  name: decision.discarded.by,
                                  date: decision.discarded.at,
                                })}
                              </span>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Badge className="bg-card text-amber-700 border-amber-300 text-[11px]">
                            <Clock className="w-3 h-3 mr-1" />
                            {t('subscriptions.detail.compliance.screening.toTreatShort')}
                          </Badge>
                        )}

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground"
                            title={t('subscriptions.detail.compliance.screening.comment')}
                            aria-label={t('subscriptions.detail.compliance.screening.comment')}
                            onClick={() => setOpenCommentFor(isCommentOpen ? null : hit.id)}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 text-xs h-7"
                            onClick={() => {
                              const ok = onDiscard(hit, (commentDrafts[hit.id] ?? '').trim());
                              if (!ok) setOpenCommentFor(hit.id);
                              else setOpenCommentFor(null);
                            }}
                          >
                            <X className="w-3 h-3" />
                            {t('subscriptions.detail.compliance.screening.discard')}
                          </Button>
                          <Button
                            size="sm"
                            className="gap-1 text-xs h-7 bg-red-600 text-white hover:opacity-90"
                            onClick={() => {
                              onAccept(hit, (commentDrafts[hit.id] ?? '').trim());
                              setOpenCommentFor(null);
                            }}
                          >
                            <AlertCircle className="w-3 h-3" />
                            {t('subscriptions.detail.compliance.screening.accept')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {historyOpen && (
                <ul className="mt-2 space-y-0.5 rounded-lg bg-muted p-2">
                  {runs.map((run, index) => (
                    <li
                      key={`${entity.id}-run-${index}`}
                      className="flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground"
                    >
                      <span className="text-foreground">{run.at}</span>
                      <span>{run.by}</span>
                      <span>
                        {t(
                          `subscriptions.detail.compliance.screening.historyHits${
                            run.hitCount === 1 ? 'One' : 'Many'
                          }`,
                          { count: run.hitCount },
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

interface SubscriptionComplianceSectionProps {
  questions: OnboardingBucketStats;
  documents: OnboardingBucketStats;
  scoreValidated: boolean;
  scoreValidatedBy: string | null;
  scoreValidatedAt: string | null;
  onValidateScore: () => void;
  onSubscriptionValidated: () => void;
}

/** Espace Validation / Conformite : widgets risque, screening, categorisation et validation. */
export function SubscriptionComplianceSection({
  questions,
  documents,
  scoreValidated,
  scoreValidatedBy,
  scoreValidatedAt,
  onValidateScore,
  onSubscriptionValidated,
}: SubscriptionComplianceSectionProps) {
  const { t } = useTranslation();

  const tc = (key: string, count: number) => t(`${key}${count === 1 ? 'One' : 'Many'}`, { count });

  const [manualScores, setManualScores] = useState<Record<string, number>>({});
  const [computedAt, setComputedAt] = useState(mockRiskProfile.computedAt);

  const [hitDecisions, setHitDecisions] = useState<Record<string, HitDecisionState>>(() => {
    const seeded: Record<string, HitDecisionState> = {};
    mockScreenedEntities.forEach(entity => {
      entity.hits.forEach(hit => {
        seeded[hit.id] = { discarded: hit.discarded, accepted: hit.accepted, comment: hit.comment };
      });
    });
    return seeded;
  });
  const [monitoring, setMonitoring] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(mockScreenedEntities.map(entity => [entity.id, entity.monitoring])),
  );
  const [extraRuns, setExtraRuns] = useState<Record<string, { at: string; by: string }[]>>({});
  const [acknowledgedUpdates, setAcknowledgedUpdates] = useState<string[]>(
    mockMonitoringUpdates.filter(update => update.acknowledged).map(update => update.id),
  );

  const [category, setCategory] = useState<InvestorCategory>(mockCategorisation.category);
  const [categoryDecidedBy, setCategoryDecidedBy] = useState(mockCategorisation.decidedBy);
  const [categoryDecidedAt, setCategoryDecidedAt] = useState(mockCategorisation.decidedAt);

  const [status, setStatus] = useState<ComplianceStatus>('awaitingValidation');
  const [statusBy, setStatusBy] = useState<string | null>(null);
  const [statusAt, setStatusAt] = useState<string | null>(null);
  const [overrideRequested, setOverrideRequested] = useState(false);
  const [note, setNote] = useState('');
  const [journalNotes, setJournalNotes] = useState<
    { id: string; at: string; by: string; text: string }[]
  >([]);

  const profileScore = computeProfileScore(manualScores);
  const profileTier = findRiskTier(mockRiskProfile.scaleId, profileScore);
  const validationRequired = profileTier?.requiresValidation ?? false;

  const allHits = mockScreenedEntities.flatMap(entity => entity.hits);
  const untreatedHits = allHits.filter(hit => {
    const decision = hitDecisions[hit.id];
    return !decision?.discarded && !decision?.accepted;
  }).length;
  const pendingUpdates = mockMonitoringUpdates.filter(
    update => !acknowledgedUpdates.includes(update.id),
  ).length;

  const adequacy = adequacyVerdict();
  const dossierValidated =
    questions.validated === questions.total && documents.validated === documents.total;

  const checklist = [
    {
      id: 'completion',
      labelKey: 'subscriptions.detail.compliance.checklist.completion',
      done: dossierValidated,
      blocking: true,
      detail: t('subscriptions.detail.compliance.checklist.completionDetail', {
        validated: questions.validated + documents.validated,
        total: questions.total + documents.total,
      }),
    },
    {
      id: 'hits',
      labelKey: 'subscriptions.detail.compliance.checklist.hits',
      done: untreatedHits === 0,
      blocking: true,
      detail: t('subscriptions.detail.compliance.checklist.hitsDetail', {
        untreated: untreatedHits,
        total: allHits.length,
      }),
    },
    {
      id: 'score',
      labelKey: 'subscriptions.detail.compliance.checklist.score',
      done: !validationRequired || scoreValidated,
      blocking: true,
      detail: validationRequired
        ? t('subscriptions.detail.compliance.checklist.scoreDetailRequired')
        : t('subscriptions.detail.compliance.checklist.scoreDetailOptional'),
    },
    {
      id: 'categorisation',
      labelKey: 'subscriptions.detail.compliance.checklist.categorisation',
      done: true,
      blocking: true,
      detail: t(`subscriptions.detail.compliance.categories.${category}`),
    },
    {
      id: 'adequacy',
      labelKey: 'subscriptions.detail.compliance.checklist.adequacy',
      done: adequacy !== 'ko',
      blocking: true,
      detail: t(
        `subscriptions.detail.compliance.adequacy.verdict${
          adequacy === 'ok' ? 'Ok' : adequacy === 'warning' ? 'Warning' : 'Ko'
        }`,
      ),
    },
    {
      id: 'monitoring',
      labelKey: 'subscriptions.detail.compliance.checklist.monitoring',
      done: pendingUpdates === 0,
      blocking: false,
      detail: tc('subscriptions.detail.compliance.checklist.monitoringDetail', pendingUpdates),
    },
  ];

  const blockingLeft = checklist.filter(item => item.blocking && !item.done);
  const canValidate = blockingLeft.length === 0 || overrideRequested;

  const handleManualScore = (componentId: string, value: number) => {
    setManualScores(prev => ({ ...prev, [componentId]: value }));
    setComputedAt(now());
    toast.success(t('subscriptions.detail.compliance.toast.manualScoreSaved'), {
      description: t('subscriptions.detail.compliance.toast.manualScoreSavedDesc'),
    });
  };

  const handleRecompute = () => {
    setComputedAt(now());
    toast.success(t('subscriptions.detail.compliance.toast.recomputed'), {
      description: t('subscriptions.detail.compliance.toast.recomputedDesc'),
    });
  };

  const handleDiscardHit = (hit: ScreeningHit, comment: string) => {
    if (!comment) {
      toast.error(t('subscriptions.detail.compliance.toast.commentRequired'), {
        description: t('subscriptions.detail.compliance.toast.commentRequiredDesc'),
      });
      return false;
    }
    const stamp = now();
    setHitDecisions(prev => ({
      ...prev,
      [hit.id]: {
        ...prev[hit.id],
        discarded: { by: CURRENT_OPERATOR, at: stamp },
        comment: { text: comment, by: CURRENT_OPERATOR, at: stamp },
      },
    }));
    toast.success(t('subscriptions.detail.compliance.toast.hitDiscarded'), { description: hit.name });
    return true;
  };

  const handleAcceptHit = (hit: ScreeningHit, comment: string) => {
    const stamp = now();
    setHitDecisions(prev => ({
      ...prev,
      [hit.id]: {
        ...prev[hit.id],
        accepted: { by: CURRENT_OPERATOR, at: stamp },
        comment: comment ? { text: comment, by: CURRENT_OPERATOR, at: stamp } : prev[hit.id]?.comment,
      },
    }));
    toast.warning(t('subscriptions.detail.compliance.toast.hitAccepted'), { description: hit.name });
  };

  const handleRerun = (entity: ScreenedEntity) => {
    setExtraRuns(prev => ({
      ...prev,
      [entity.id]: [{ at: now(), by: CURRENT_OPERATOR }, ...(prev[entity.id] ?? [])],
    }));
    toast.success(t('subscriptions.detail.compliance.toast.screeningRelaunched'), {
      description: entity.name,
    });
  };

  const handleToggleMonitoring = (entity: ScreenedEntity, next: boolean) => {
    setMonitoring(prev => ({ ...prev, [entity.id]: next }));
    toast.info(
      next
        ? t('subscriptions.detail.compliance.toast.monitoringOn')
        : t('subscriptions.detail.compliance.toast.monitoringOff'),
      { description: entity.name },
    );
  };

  const handleCategoryChange = (next: InvestorCategory) => {
    setCategory(next);
    setCategoryDecidedBy(CURRENT_OPERATOR);
    setCategoryDecidedAt(now());
    toast.success(t('subscriptions.detail.compliance.toast.categorySaved'), {
      description: t(`subscriptions.detail.compliance.categories.${next}`),
    });
  };

  const handleValidateCompliance = () => {
    const stamp = now();
    setStatus('validated');
    setStatusBy(CURRENT_OPERATOR);
    setStatusAt(stamp);
    toast.success(t('subscriptions.detail.compliance.toast.complianceValidated'), {
      description: overrideRequested
        ? t('subscriptions.detail.compliance.toast.complianceValidatedOverride')
        : t('subscriptions.detail.compliance.toast.complianceValidatedDesc'),
    });
    onSubscriptionValidated();
  };

  const handleReopen = () => {
    setStatus('pending');
    setStatusBy(CURRENT_OPERATOR);
    setStatusAt(now());
    setOverrideRequested(false);
    toast.info(t('subscriptions.detail.compliance.toast.complianceReopened'));
  };

  const handleSubmitToCompliance = () => {
    setStatus('awaitingValidation');
    setStatusBy(CURRENT_OPERATOR);
    setStatusAt(now());
    toast.success(t('subscriptions.detail.compliance.toast.submittedToCompliance'));
  };

  const handleAddNote = () => {
    if (!note.trim()) return;
    setJournalNotes(prev => [
      { id: `note-${prev.length + 1}`, at: now(), by: CURRENT_OPERATOR, text: note.trim() },
      ...prev,
    ]);
    setNote('');
    toast.success(t('subscriptions.detail.compliance.toast.noteAdded'));
  };

  const summaryItems = [
    ...checklist.slice(0, 2),
    {
      id: 'score',
      labelKey: 'subscriptions.detail.compliance.score.title',
      done: !validationRequired || scoreValidated,
      blocking: true,
      detail: `${profileScore ?? '—'} · ${
        profileTier ? t(profileTier.labelKey) : t('subscriptions.detail.compliance.score.unavailable')
      }${
        validationRequired && !scoreValidated
          ? ` · ${t('subscriptions.detail.compliance.final.scorePending')}`
          : ''
      }`,
    },
    ...checklist.slice(3),
  ];

  return (
    <div className="space-y-4">
      <OnboardingCompletionCard questions={questions} documents={documents} />

      {/* Validation du dossier : résumé de la page et action principale */}
      <Card className="shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground">
              {t('subscriptions.detail.compliance.final.title')}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {status === 'validated' ? (
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {t('subscriptions.detail.compliance.status.validated')}
                </Badge>
              ) : (
                <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {t(`subscriptions.detail.compliance.status.${status}`)}
                </Badge>
              )}
              {statusAt && (
                <span className="text-xs text-muted-foreground">
                  {t('subscriptions.detail.compliance.status.lastAction', {
                    name: statusBy ?? '',
                    date: statusAt,
                  })}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
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
            {status === 'validated' ? (
              <Button variant="outline" className="gap-2" onClick={handleReopen}>
                <RotateCcw className="w-4 h-4" />
                {t('subscriptions.detail.compliance.status.reopen')}
              </Button>
            ) : (
              <Button
                size="lg"
                className="gap-2 px-6 text-white hover:opacity-90"
                style={{ background: PRIMARY_BUTTON_GRADIENT }}
                disabled={!canValidate}
                onClick={handleValidateCompliance}
              >
                <ShieldCheck className="w-4 h-4" />
                {t('subscriptions.detail.compliance.final.validate')}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 border-t px-4 py-3">
          {summaryItems.map(item => (
            <div key={item.id} className="flex items-start gap-2 min-w-0">
              {item.done ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              ) : item.blocking ? (
                <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <span className="min-w-0 text-xs">
                <span className="font-medium text-foreground">{t(item.labelKey)}</span>{' '}
                <span className="text-muted-foreground">{item.detail}</span>
              </span>
            </div>
          ))}
        </div>

        {status !== 'validated' && blockingLeft.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-red-50 px-4 py-2">
            <span className="flex items-start gap-2 text-xs text-red-700 min-w-0">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                {tc('subscriptions.detail.compliance.final.blocked', blockingLeft.length)} :{' '}
                {blockingLeft.map(item => t(item.labelKey)).join(', ')}
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

        {status === 'validated' && (
          <div className="flex items-start gap-2 border-t px-4 py-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              {t('subscriptions.detail.compliance.final.validatedBy', {
                name: statusBy ?? '',
                date: statusAt ?? '',
              })}
            </span>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {/* Widget categorisation investisseur */}
        <Card className="p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('subscriptions.detail.compliance.categorisation.title')}
            </h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="bg-muted text-muted-foreground text-xs shrink-0">
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

          <div className="flex items-center gap-2 mb-3">
            <UserCheck className="w-4 h-4 text-muted-foreground shrink-0" />
            <Select value={category} onValueChange={value => handleCategoryChange(value as InvestorCategory)}>
              <SelectTrigger className="h-9 text-sm">
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

          <p className="text-xs text-muted-foreground mb-3">
            {t(`subscriptions.detail.compliance.categoryHints.${category}`)}
          </p>

          <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground space-y-1">
            <div className="text-foreground">{t(mockCategorisation.justificationKey)}</div>
            <div>
              {t('subscriptions.detail.compliance.categorisation.decidedBy', {
                name: categoryDecidedBy,
                date: categoryDecidedAt,
              })}
            </div>
            <div>
              {t('subscriptions.detail.compliance.categorisation.reviewDue', {
                date: mockCategorisation.reviewDueAt,
              })}
            </div>
          </div>
        </Card>

        {/* Widget adequation */}
        <Card className="p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('subscriptions.detail.compliance.adequacy.title')}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {t('subscriptions.detail.compliance.adequacy.subtitle')}
              </p>
            </div>
            <Badge
              className={
                adequacy === 'ko'
                  ? 'bg-red-100 text-red-700 border-red-300 shrink-0'
                  : adequacy === 'warning'
                    ? 'bg-amber-100 text-amber-700 border-amber-300 shrink-0'
                    : 'bg-emerald-100 text-emerald-700 border-emerald-200 shrink-0'
              }
            >
              {t(
                `subscriptions.detail.compliance.adequacy.verdict${
                  adequacy === 'ok' ? 'Ok' : adequacy === 'warning' ? 'Warning' : 'Ko'
                }`,
              )}
            </Badge>
          </div>

          <ul className="divide-y mb-3">
            {mockAdequacyCriteria.map(criterion => (
              <li key={criterion.id} className="flex items-center justify-between gap-2 py-2">
                <span className="text-sm text-foreground truncate">{t(criterion.labelKey)}</span>
                <span className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs text-muted-foreground">{criterion.answer}</span>
                  {criterion.verdict === 'ok' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  {criterion.verdict === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                  {criterion.verdict === 'ko' && <AlertCircle className="w-4 h-4 text-red-600" />}
                </span>
              </li>
            ))}
          </ul>

          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1.5 text-xs h-8"
            onClick={() =>
              toast.success(t('subscriptions.detail.compliance.toast.adequacyGenerated'), {
                description: t('subscriptions.detail.compliance.toast.adequacyGeneratedDesc'),
              })
            }
          >
            <FileCheck className="w-3.5 h-3.5" />
            {t('subscriptions.detail.compliance.adequacy.generate')}
          </Button>
        </Card>
      </div>

      <div
        className="grid items-start gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(520px, 1fr))' }}
      >
        <RiskProfileWidget
          manualScores={manualScores}
          onManualScore={handleManualScore}
          computedAt={computedAt}
          onRecompute={handleRecompute}
          scoreValidated={scoreValidated}
          scoreValidatedBy={scoreValidatedBy}
          scoreValidatedAt={scoreValidatedAt}
          onValidateScore={onValidateScore}
        />

        <ScreeningWidget
          hitDecisions={hitDecisions}
          onDiscard={handleDiscardHit}
          onAccept={handleAcceptHit}
          monitoring={monitoring}
          onToggleMonitoring={handleToggleMonitoring}
          extraRuns={extraRuns}
          onRerun={handleRerun}
          acknowledgedUpdates={acknowledgedUpdates}
          onAcknowledge={updateId => setAcknowledgedUpdates(prev => [...prev, updateId])}
        />
      </div>

      {/* Widget journal de conformite */}
      <Card className="shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-foreground">
            {t('subscriptions.detail.compliance.journal.title')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('subscriptions.detail.compliance.journal.subtitle')}
          </p>
        </div>

        <div className="px-6 py-4 space-y-3">
          <div className="flex items-start gap-2">
            <Input
              value={note}
              onChange={event => setNote(event.target.value)}
              placeholder={t('subscriptions.detail.compliance.journal.notePlaceholder')}
              className="h-9 text-sm"
            />
            <Button size="sm" className="h-9 gap-1.5 text-xs" onClick={handleAddNote}>
              <MessageSquare className="w-3.5 h-3.5" />
              {t('subscriptions.detail.compliance.journal.addNote')}
            </Button>
          </div>

          <ul className="space-y-3">
            {journalNotes.map(entry => (
              <li key={entry.id} className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-foreground">{entry.text}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.by} · {entry.at}
                  </p>
                </div>
              </li>
            ))}
            {mockComplianceJournal.map(entry => (
              <li key={entry.id} className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                  {entry.kind === 'screening' && <Radar className="w-3.5 h-3.5 text-muted-foreground" />}
                  {entry.kind === 'decision' && <Check className="w-3.5 h-3.5 text-muted-foreground" />}
                  {entry.kind === 'score' && <Scale className="w-3.5 h-3.5 text-muted-foreground" />}
                  {entry.kind === 'status' && <ShieldAlert className="w-3.5 h-3.5 text-muted-foreground" />}
                  {entry.kind === 'categorisation' && <UserCheck className="w-3.5 h-3.5 text-muted-foreground" />}
                  {entry.kind === 'note' && <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-foreground">{t(entry.labelKey)}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.by} · {entry.at}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}
