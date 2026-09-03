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
  Download,
  FileCheck,
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
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '../utils/languageContext';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
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
  computeComplianceSnapshot,
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

interface SubscriptionRiskTabProps {
  questions: OnboardingBucketStats;
  documents: OnboardingBucketStats;
  /** Le palier atteint impose une validation humaine du score. */
  scoreValidated: boolean;
  scoreValidatedBy: string | null;
  scoreValidatedAt: string | null;
  onValidateScore: () => void;
}

const CURRENT_OPERATOR = 'Marie Dubois';

const TONE_STYLES: Record<RiskTone, { badge: string; text: string; bar: string; soft: string }> = {
  low: {
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    text: 'text-emerald-700',
    bar: 'bg-emerald-500',
    soft: 'bg-emerald-50 border-emerald-200',
  },
  medium: {
    badge: 'bg-amber-100 text-amber-700 border-amber-300',
    text: 'text-amber-700',
    bar: 'bg-amber-500',
    soft: 'bg-amber-50 border-amber-200',
  },
  high: {
    badge: 'bg-orange-100 text-orange-700 border-orange-300',
    text: 'text-orange-700',
    bar: 'bg-orange-500',
    soft: 'bg-orange-50 border-orange-200',
  },
  critical: {
    badge: 'bg-red-100 text-red-700 border-red-300',
    text: 'text-red-700',
    bar: 'bg-red-500',
    soft: 'bg-red-50 border-red-200',
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

export function SubscriptionRiskTab({
  questions,
  documents,
  scoreValidated,
  scoreValidatedBy,
  scoreValidatedAt,
  onValidateScore,
}: SubscriptionRiskTabProps) {
  const { t } = useTranslation();

  /** Choisit la variante One / Many de la cle selon le compteur. */
  const tc = (key: string, count: number) =>
    t(`${key}${count === 1 ? 'One' : 'Many'}`, { count });

  const [manualScores, setManualScores] = useState<Record<string, number>>(() => {
    const seeded: Record<string, number> = {};
    mockRiskProfile.classes.forEach(riskClass => {
      riskClass.components.forEach(component => {
        if (typeof component.manualScore === 'number') {
          seeded[component.id] = component.manualScore;
        }
      });
    });
    return seeded;
  });
  const [editingComponent, setEditingComponent] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [computedAt, setComputedAt] = useState(mockRiskProfile.computedAt);
  const [openClasses, setOpenClasses] = useState<string[]>(['screening']);
  const [scaleVisible, setScaleVisible] = useState(false);

  const [hitDecisions, setHitDecisions] = useState<Record<string, HitDecisionState>>(() => {
    const seeded: Record<string, HitDecisionState> = {};
    mockScreenedEntities.forEach(entity => {
      entity.hits.forEach(hit => {
        seeded[hit.id] = {
          discarded: hit.discarded,
          accepted: hit.accepted,
          comment: hit.comment,
        };
      });
    });
    return seeded;
  });
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [openCommentFor, setOpenCommentFor] = useState<string | null>(null);
  const [monitoring, setMonitoring] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(mockScreenedEntities.map(entity => [entity.id, entity.monitoring])),
  );
  const [extraRuns, setExtraRuns] = useState<Record<string, { at: string; by: string }[]>>({});
  const [openEntities, setOpenEntities] = useState<string[]>(['entity-subscriber']);
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
  const profileTone: RiskTone = profileTier?.tone ?? 'medium';
  const validationRequired = profileTier?.requiresValidation ?? false;

  const allHits = mockScreenedEntities.flatMap(entity => entity.hits);
  const untreatedHits = allHits.filter(hit => {
    const decision = hitDecisions[hit.id];
    return !decision?.discarded && !decision?.accepted;
  });
  const acceptedHits = allHits.filter(hit => hitDecisions[hit.id]?.accepted);
  const pendingUpdates = mockMonitoringUpdates.filter(
    update => !acknowledgedUpdates.includes(update.id),
  );

  const dossierValidated =
    questions.validated === questions.total && documents.validated === documents.total;
  const adequacy = adequacyVerdict();
  const adequacyBlocking = adequacy === 'ko';
  const adequacyWarning = adequacy === 'warning';

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
      done: untreatedHits.length === 0,
      blocking: true,
      detail: t('subscriptions.detail.compliance.checklist.hitsDetail', {
        untreated: untreatedHits.length,
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
      done: !adequacyBlocking,
      blocking: true,
      detail: adequacyBlocking
        ? t('subscriptions.detail.compliance.adequacy.verdictKo')
        : adequacyWarning
          ? t('subscriptions.detail.compliance.adequacy.verdictWarning')
          : t('subscriptions.detail.compliance.adequacy.verdictOk'),
    },
    {
      id: 'monitoring',
      labelKey: 'subscriptions.detail.compliance.checklist.monitoring',
      done: pendingUpdates.length === 0,
      blocking: false,
      detail: tc('subscriptions.detail.compliance.checklist.monitoringDetail', pendingUpdates.length),
    },
  ];

  const blockingLeft = checklist.filter(item => item.blocking && !item.done);
  const canValidate = blockingLeft.length === 0 || overrideRequested;

  const toggleClass = (id: string) =>
    setOpenClasses(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));

  const toggleEntity = (id: string) =>
    setOpenEntities(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));

  const handleRecompute = () => {
    setComputedAt(now());
    toast.success(t('subscriptions.detail.compliance.toast.recomputed'), {
      description: t('subscriptions.detail.compliance.toast.recomputedDesc'),
    });
  };

  const handleSaveManualScore = (componentId: string, min: number, max: number) => {
    const parsed = Number(editingValue.replace(',', '.'));
    if (Number.isNaN(parsed) || parsed < min || parsed > max) {
      toast.error(t('subscriptions.detail.compliance.toast.invalidScore'), {
        description: t('subscriptions.detail.compliance.toast.invalidScoreDesc', { min, max }),
      });
      return;
    }
    setManualScores(prev => ({ ...prev, [componentId]: round1(parsed) }));
    setEditingComponent(null);
    setComputedAt(now());
    toast.success(t('subscriptions.detail.compliance.toast.manualScoreSaved'), {
      description: t('subscriptions.detail.compliance.toast.manualScoreSavedDesc'),
    });
  };

  const handleDiscardHit = (hit: ScreeningHit) => {
    const draft = (commentDrafts[hit.id] ?? '').trim();
    if (!draft) {
      setOpenCommentFor(hit.id);
      toast.error(t('subscriptions.detail.compliance.toast.commentRequired'), {
        description: t('subscriptions.detail.compliance.toast.commentRequiredDesc'),
      });
      return;
    }
    const stamp = now();
    setHitDecisions(prev => ({
      ...prev,
      [hit.id]: {
        ...prev[hit.id],
        discarded: { by: CURRENT_OPERATOR, at: stamp },
        comment: { text: draft, by: CURRENT_OPERATOR, at: stamp },
      },
    }));
    setOpenCommentFor(null);
    toast.success(t('subscriptions.detail.compliance.toast.hitDiscarded'), {
      description: hit.name,
    });
  };

  const handleAcceptHit = (hit: ScreeningHit) => {
    const stamp = now();
    const draft = (commentDrafts[hit.id] ?? '').trim();
    setHitDecisions(prev => ({
      ...prev,
      [hit.id]: {
        ...prev[hit.id],
        accepted: { by: CURRENT_OPERATOR, at: stamp },
        comment: draft ? { text: draft, by: CURRENT_OPERATOR, at: stamp } : prev[hit.id]?.comment,
      },
    }));
    setOpenCommentFor(null);
    toast.warning(t('subscriptions.detail.compliance.toast.hitAccepted'), {
      description: hit.name,
    });
  };

  const handleRerunScreening = (entityId: string, entityName: string) => {
    setExtraRuns(prev => ({
      ...prev,
      [entityId]: [{ at: now(), by: CURRENT_OPERATOR }, ...(prev[entityId] ?? [])],
    }));
    toast.success(t('subscriptions.detail.compliance.toast.screeningRelaunched'), {
      description: entityName,
    });
  };

  const handleToggleMonitoring = (entityId: string, entityName: string, next: boolean) => {
    setMonitoring(prev => ({ ...prev, [entityId]: next }));
    toast.info(
      next
        ? t('subscriptions.detail.compliance.toast.monitoringOn')
        : t('subscriptions.detail.compliance.toast.monitoringOff'),
      { description: entityName },
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
  };

  const handleReopenCompliance = () => {
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

  const statusSteps: ComplianceStatus[] = ['pending', 'awaitingValidation', 'validated'];
  const statusIndex = statusSteps.indexOf(status);

  return (
    <div className="space-y-6">
      {/* Bandeau : score, statut du dossier de conformite, categorisation */}
      <div className="grid grid-cols-3 gap-4">
        {/* Score de risque */}
        <Card className={cn('p-5 shadow-sm border', TONE_STYLES[profileTone].soft)}>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="min-w-0">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('subscriptions.detail.compliance.score.title')}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 truncate">{mockRiskProfile.name}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-7 shrink-0"
              onClick={handleRecompute}
            >
              <RefreshCw className="w-3 h-3" />
              {t('subscriptions.detail.compliance.score.recompute')}
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div
              className={cn(
                'flex h-20 w-20 shrink-0 items-center justify-center rounded-full',
                TONE_STYLES[profileTone].bar,
              )}
            >
              <span className="text-3xl font-bold text-white tabular-nums">
                {profileScore ?? '—'}
              </span>
            </div>
            <div className="min-w-0">
              {profileTier ? (
                <ToneBadge tone={profileTone} label={t(profileTier.labelKey)} />
              ) : (
                <Badge className="bg-muted text-muted-foreground">
                  {t('subscriptions.detail.compliance.score.unavailable')}
                </Badge>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {t('subscriptions.detail.compliance.score.origin', {
                  onboarding: mockRiskProfile.originOnboarding,
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('subscriptions.detail.compliance.score.computedAt', { date: computedAt })}
              </p>
            </div>
          </div>

          <Separator className="my-3" />

          {validationRequired ? (
            scoreValidated ? (
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <div className="font-medium text-foreground">
                    {t('subscriptions.detail.compliance.score.validated')}
                  </div>
                  <div>{scoreValidatedBy}</div>
                  <div>{scoreValidatedAt}</div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-xs text-amber-700">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{t('subscriptions.detail.compliance.score.validationRequired')}</span>
                </div>
                <Button
                  size="sm"
                  className="w-full gap-2 text-white hover:opacity-90"
                  style={{ background: PRIMARY_BUTTON_GRADIENT }}
                  onClick={onValidateScore}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {t('subscriptions.detail.compliance.score.validate')}
                </Button>
              </div>
            )
          ) : (
            <p className="text-xs text-muted-foreground">
              {t('subscriptions.detail.compliance.score.noValidationNeeded')}
            </p>
          )}
        </Card>

        {/* Statut du dossier de conformite */}
        <Card className="p-5 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
            {t('subscriptions.detail.compliance.status.title')}
          </h3>

          <ol className="space-y-2 mb-4">
            {statusSteps.map((step, index) => {
              const isDone = index < statusIndex;
              const isCurrent = index === statusIndex;
              return (
                <li key={step} className="flex items-center gap-2">
                  <span
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                      isDone ? 'bg-emerald-100' : isCurrent ? 'bg-primary' : 'bg-muted',
                    )}
                  >
                    {isDone ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <span
                        className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          isCurrent ? 'bg-white' : 'bg-gray-300',
                        )}
                      />
                    )}
                  </span>
                  <span
                    className={cn(
                      'text-sm',
                      isCurrent ? 'font-semibold text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {t(`subscriptions.detail.compliance.status.${step}`)}
                  </span>
                </li>
              );
            })}
          </ol>

          {statusAt && (
            <p className="text-xs text-muted-foreground mb-3">
              {t('subscriptions.detail.compliance.status.lastAction', {
                name: statusBy ?? '',
                date: statusAt,
              })}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {status === 'pending' && (
              <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8" onClick={handleSubmitToCompliance}>
                <ShieldAlert className="w-3.5 h-3.5" />
                {t('subscriptions.detail.compliance.status.submit')}
              </Button>
            )}
            {status !== 'pending' && (
              <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8" onClick={handleReopenCompliance}>
                <RotateCcw className="w-3.5 h-3.5" />
                {t('subscriptions.detail.compliance.status.reopen')}
              </Button>
            )}
          </div>
        </Card>

        {/* Categorisation investisseur */}
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
      </div>

      {/* Profil de risque : detail du calcul */}
      <Card className="shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground">
              {t('subscriptions.detail.compliance.profile.title')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('subscriptions.detail.compliance.profile.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-8"
              onClick={() => setScaleVisible(prev => !prev)}
            >
              <ListChecks className="w-3.5 h-3.5" />
              {t('subscriptions.detail.compliance.profile.showScale')}
            </Button>
          </div>
        </div>

        <div className="px-6 py-3 bg-muted border-b">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs">
            <span className="text-muted-foreground">
              {t('subscriptions.detail.compliance.profile.formula')}
            </span>
            <span className="text-foreground">{mockRiskProfile.formula}</span>
            <Badge
              className={
                mockRiskProfile.formulaKind === 'custom'
                  ? 'bg-amber-50 text-amber-700 border-amber-200 text-xs'
                  : 'bg-muted text-muted-foreground text-xs'
              }
            >
              {t(`subscriptions.detail.compliance.profile.formulaKind.${mockRiskProfile.formulaKind}`)}
            </Badge>
          </div>
        </div>

        {scaleVisible && (
          <div className="px-6 py-4 border-b">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              {t('subscriptions.detail.compliance.profile.scaleTitle')}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {mockRiskScales
                .find(scale => scale.id === mockRiskProfile.scaleId)
                ?.tiers.map(tier => (
                  <div
                    key={tier.labelKey}
                    className={cn(
                      'rounded-lg border p-3',
                      TONE_STYLES[tier.tone].soft,
                      profileTier === tier && 'shadow-sm',
                    )}
                  >
                    <div className={cn('text-sm font-semibold', TONE_STYLES[tier.tone].text)}>
                      {t(tier.labelKey)}
                    </div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      {tier.min} – {tier.max}
                    </div>
                    {tier.requiresValidation && (
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                        <ShieldCheck className="w-3 h-3" />
                        {t('subscriptions.detail.compliance.profile.tierRequiresValidation')}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="divide-y">
          {classScores.map(({ riskClass, score, unevaluated }) => {
            const tier = findRiskTier(riskClass.scaleId, score);
            const isOpen = openClasses.includes(riskClass.id);

            return (
              <Collapsible key={riskClass.id} open={isOpen} onOpenChange={() => toggleClass(riskClass.id)}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-accent">
                    <div className="flex items-center gap-3 min-w-0 text-left">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Radar className="w-4 h-4 text-muted-foreground" />
                      </span>
                      <div className="min-w-0">
                        <div className="font-medium text-foreground">{t(riskClass.labelKey)}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {riskClass.formula}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {unevaluated > 0 && (
                        <Badge className="bg-muted text-muted-foreground text-xs">
                          {tc('subscriptions.detail.compliance.profile.unevaluated', unevaluated)}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {t('subscriptions.detail.compliance.profile.weight', { weight: riskClass.weight })}
                      </span>
                      <span className="text-lg font-bold text-foreground tabular-nums">
                        {score === null ? '—' : score}
                      </span>
                      {tier ? (
                        <ToneBadge tone={tier.tone} label={t(tier.labelKey)} className="text-xs" />
                      ) : (
                        <Badge className="bg-muted text-muted-foreground text-xs">
                          {t('subscriptions.detail.compliance.score.unavailable')}
                        </Badge>
                      )}
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="px-6 pb-4">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {t('subscriptions.detail.compliance.profile.component')}
                          </th>
                          <th className="py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {t('subscriptions.detail.compliance.profile.source')}
                          </th>
                          <th className="py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {t('subscriptions.detail.compliance.profile.value')}
                          </th>
                          <th className="py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {t('subscriptions.detail.compliance.profile.componentScore')}
                          </th>
                          <th className="py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider w-32">
                            {t('subscriptions.detail.compliance.profile.action')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {riskClass.components.map(component => {
                          const SourceIcon = SOURCE_ICONS[component.source];
                          const manual =
                            typeof manualScores[component.id] === 'number' ||
                            typeof component.manualScore === 'number';
                          const shown = componentScore(component, manualScores);
                          const isEditing = editingComponent === component.id;

                          return (
                            <tr key={component.id}>
                              <td className="py-2.5 text-sm text-foreground">
                                {t(component.labelKey)}
                              </td>
                              <td className="py-2.5">
                                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <SourceIcon className="w-3.5 h-3.5" />
                                  {t(`subscriptions.detail.compliance.sources.${component.source}`)}
                                </span>
                              </td>
                              <td className="py-2.5 text-sm text-foreground">{component.value}</td>
                              <td className="py-2.5 text-right">
                                {isEditing ? (
                                  <div className="flex items-center justify-end gap-1">
                                    <Input
                                      value={editingValue}
                                      onChange={event => setEditingValue(event.target.value)}
                                      className="h-7 w-16 text-right text-sm"
                                    />
                                    <Button
                                      size="sm"
                                      className="h-7 w-7 p-0"
                                      onClick={() =>
                                        handleSaveManualScore(component.id, component.min, component.max)
                                      }
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-end gap-2">
                                    {manual && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                                            <Pencil className="w-3 h-3 mr-1" />
                                            {t('subscriptions.detail.compliance.profile.manual')}
                                          </Badge>
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
                                    <span className="text-sm font-semibold text-foreground tabular-nums">
                                      {shown === null ? '—' : shown}
                                    </span>
                                    <span className="text-xs text-muted-foreground tabular-nums">
                                      / {component.max}
                                    </span>
                                  </div>
                                )}
                              </td>
                              <td className="py-2.5 text-right">
                                {component.manualAllowed ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 gap-1.5 text-xs text-primary"
                                    onClick={() => {
                                      setEditingComponent(component.id);
                                      setEditingValue(shown === null ? '' : String(shown));
                                    }}
                                  >
                                    <Pencil className="w-3 h-3" />
                                    {t('subscriptions.detail.compliance.profile.setScore')}
                                  </Button>
                                ) : (
                                  <span className="text-xs text-muted-foreground">
                                    {t('subscriptions.detail.compliance.profile.computed')}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </Card>

      {/* Screening et surveillance continue */}
      <Card className="shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground">
              {t('subscriptions.detail.compliance.screening.title')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('subscriptions.detail.compliance.screening.subtitle')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={
                untreatedHits.length > 0
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }
            >
              {tc('subscriptions.detail.compliance.screening.untreated', untreatedHits.length)}
            </Badge>
            {acceptedHits.length > 0 && (
              <Badge className="bg-red-50 text-red-700 border-red-200">
                {tc('subscriptions.detail.compliance.screening.accepted', acceptedHits.length)}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-8"
              onClick={() =>
                toast.success(t('subscriptions.detail.compliance.toast.exportScreening'), {
                  description: t('subscriptions.detail.compliance.toast.exportScreeningDesc'),
                })
              }
            >
              <Download className="w-3.5 h-3.5" />
              {t('subscriptions.detail.compliance.screening.export')}
            </Button>
          </div>
        </div>

        {pendingUpdates.length > 0 && (
          <div className="px-6 py-3 bg-amber-50 border-b border-amber-200">
            <div className="space-y-2">
              {pendingUpdates.map(update => {
                const entity = mockScreenedEntities.find(item => item.id === update.entityId);
                return (
                  <div key={update.id} className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-start gap-2 text-sm text-amber-700 min-w-0">
                      <Radar className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        {t('subscriptions.detail.compliance.monitoring.updateLine', {
                          name: entity?.name ?? '',
                          date: update.at,
                        })}{' '}
                        {t(update.labelKey)}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs h-7"
                      onClick={() => setAcknowledgedUpdates(prev => [...prev, update.id])}
                    >
                      <Check className="w-3 h-3" />
                      {t('subscriptions.detail.compliance.monitoring.acknowledge')}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="divide-y">
          {[...mockScreenedEntities]
            .sort((a, b) => PURPOSE_ORDER.indexOf(a.purpose) - PURPOSE_ORDER.indexOf(b.purpose))
            .map(entity => {
              const runs = [
                ...(extraRuns[entity.id] ?? []).map(run => ({
                  at: run.at,
                  by: run.by,
                  hitCount: entity.hits.length,
                  origin: 'manual' as const,
                })),
                ...entity.runs,
              ];
              const entityUntreated = entity.hits.filter(hit => {
                const decision = hitDecisions[hit.id];
                return !decision?.discarded && !decision?.accepted;
              }).length;
              const entityAccepted = entity.hits.filter(hit => hitDecisions[hit.id]?.accepted).length;
              const isOpen = openEntities.includes(entity.id);
              const EntityIcon = entity.kind === 'company' ? Building2 : User;

              return (
                <Collapsible key={entity.id} open={isOpen} onOpenChange={() => toggleEntity(entity.id)}>
                  <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                    <CollapsibleTrigger className="flex items-center gap-3 min-w-0 text-left">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <EntityIcon className="w-4 h-4 text-muted-foreground" />
                      </span>
                      <div className="min-w-0">
                        <div className="font-medium text-foreground truncate">{entity.name}</div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                          <span>
                            {t(`subscriptions.detail.compliance.purposes.${entity.purpose}`)}
                          </span>
                          <span className="h-1 w-1 rounded-full bg-border" />
                          <span>
                            {t(`subscriptions.detail.compliance.providers.${entity.provider}`)}
                          </span>
                          <span className="h-1 w-1 rounded-full bg-border" />
                          <span>
                            {t('subscriptions.detail.compliance.screening.lastRun', {
                              date: runs[0]?.at ?? '',
                            })}
                          </span>
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      {entity.hits.length === 0 ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {t('subscriptions.detail.compliance.screening.noHit')}
                        </Badge>
                      ) : (
                        <>
                          <Badge className="bg-muted text-muted-foreground text-xs">
                            {tc('subscriptions.detail.compliance.screening.hitCount', entity.hits.length)}
                          </Badge>
                          {entityUntreated > 0 && (
                            <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {tc('subscriptions.detail.compliance.screening.toTreat', entityUntreated)}
                            </Badge>
                          )}
                          {entityAccepted > 0 && (
                            <Badge className="bg-red-50 text-red-700 border-red-200 text-xs">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {tc('subscriptions.detail.compliance.screening.acceptedShort', entityAccepted)}
                            </Badge>
                          )}
                        </>
                      )}

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {t('subscriptions.detail.compliance.screening.monitoring')}
                        </span>
                        <Switch
                          checked={monitoring[entity.id]}
                          onCheckedChange={next => handleToggleMonitoring(entity.id, entity.name, next)}
                        />
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs h-8"
                        onClick={() => handleRerunScreening(entity.id, entity.name)}
                      >
                        <RefreshCw className="w-3 h-3" />
                        {t('subscriptions.detail.compliance.screening.rerun')}
                      </Button>

                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>

                  <CollapsibleContent>
                    <div className="px-6 pb-4 space-y-3">
                      {entity.hits.map(hit => {
                        const decision = hitDecisions[hit.id] ?? {};
                        const CategoryIcon = CATEGORY_ICONS[hit.category];
                        const isCommentOpen = openCommentFor === hit.id;
                        const treated = Boolean(decision.discarded || decision.accepted);

                        return (
                          <div
                            key={hit.id}
                            className={cn(
                              'rounded-lg border p-4',
                              decision.accepted
                                ? 'bg-red-50 border-red-200'
                                : decision.discarded
                                  ? 'bg-muted'
                                  : 'bg-amber-50 border-amber-200',
                            )}
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="flex items-start gap-3 min-w-0">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card">
                                  <CategoryIcon className="w-4 h-4 text-muted-foreground" />
                                </span>
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-medium text-foreground">{hit.name}</span>
                                    <Badge className="bg-card text-foreground text-xs">
                                      {t(`subscriptions.detail.compliance.hitCategories.${hit.category}`)}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground tabular-nums">
                                      {t('subscriptions.detail.compliance.screening.matchRate', {
                                        rate: hit.matchRate,
                                      })}
                                    </span>
                                  </div>
                                  <p className="text-sm text-foreground mt-1">{t(hit.summaryKey)}</p>
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                                    <span>{hit.country}</span>
                                    {hit.birthYear && (
                                      <span>
                                        {t('subscriptions.detail.compliance.screening.birthYear', {
                                          year: hit.birthYear,
                                        })}
                                      </span>
                                    )}
                                    <span>{t(hit.sourceKey)}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 shrink-0">
                                {decision.discarded && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge className="bg-card text-muted-foreground text-xs">
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
                                )}
                                {decision.accepted && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge className="bg-red-100 text-red-700 border-red-300 text-xs">
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
                                )}
                                {!treated && (
                                  <Badge className="bg-card text-amber-700 border-amber-300 text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {t('subscriptions.detail.compliance.screening.toTreatShort')}
                                  </Badge>
                                )}

                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1.5 text-xs h-7"
                                  onClick={() => setOpenCommentFor(isCommentOpen ? null : hit.id)}
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  {t('subscriptions.detail.compliance.screening.comment')}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1.5 text-xs h-7"
                                  onClick={() => handleDiscardHit(hit)}
                                >
                                  <Check className="w-3 h-3" />
                                  {t('subscriptions.detail.compliance.screening.discard')}
                                </Button>
                                <Button
                                  size="sm"
                                  className="gap-1.5 text-xs h-7 bg-red-600 text-white hover:opacity-90"
                                  onClick={() => handleAcceptHit(hit)}
                                >
                                  <AlertCircle className="w-3 h-3" />
                                  {t('subscriptions.detail.compliance.screening.accept')}
                                </Button>
                              </div>
                            </div>

                            {decision.comment && (
                              <div className="mt-3 rounded-lg bg-card p-3">
                                <p className="text-sm text-foreground">{decision.comment.text}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {t('subscriptions.detail.compliance.screening.commentBy', {
                                    name: decision.comment.by,
                                    date: decision.comment.at,
                                  })}
                                </p>
                              </div>
                            )}

                            {isCommentOpen && (
                              <div className="mt-3 space-y-2">
                                <Textarea
                                  value={commentDrafts[hit.id] ?? ''}
                                  onChange={event =>
                                    setCommentDrafts(prev => ({ ...prev, [hit.id]: event.target.value }))
                                  }
                                  placeholder={t('subscriptions.detail.compliance.screening.commentPlaceholder')}
                                  className="text-sm"
                                />
                                <p className="text-xs text-muted-foreground">
                                  {t('subscriptions.detail.compliance.screening.commentMandatory')}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      <div className="rounded-lg bg-muted p-3">
                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                          {t('subscriptions.detail.compliance.screening.history')}
                        </div>
                        <ul className="space-y-1">
                          {runs.map((run, index) => (
                            <li
                              key={`${entity.id}-run-${index}`}
                              className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground"
                            >
                              <span className="text-foreground">{run.at}</span>
                              <span>{run.by}</span>
                              <span>
                                {tc('subscriptions.detail.compliance.screening.historyHits', run.hitCount)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
        </div>
      </Card>

      {/* Adequation et journal */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-foreground">
                {t('subscriptions.detail.compliance.adequacy.title')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('subscriptions.detail.compliance.adequacy.subtitle')}
              </p>
            </div>
            <Badge
              className={
                adequacyBlocking
                  ? 'bg-red-100 text-red-700 border-red-300'
                  : adequacyWarning
                    ? 'bg-amber-100 text-amber-700 border-amber-300'
                    : 'bg-emerald-100 text-emerald-700 border-emerald-200'
              }
            >
              {adequacyBlocking
                ? t('subscriptions.detail.compliance.adequacy.verdictKo')
                : adequacyWarning
                  ? t('subscriptions.detail.compliance.adequacy.verdictWarning')
                  : t('subscriptions.detail.compliance.adequacy.verdictOk')}
            </Badge>
          </div>

          <div className="divide-y">
            {mockAdequacyCriteria.map(criterion => (
              <div key={criterion.id} className="flex items-center justify-between gap-3 px-6 py-3">
                <span className="text-sm text-foreground">{t(criterion.labelKey)}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm text-foreground">{criterion.answer}</span>
                  {criterion.verdict === 'ok' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  {criterion.verdict === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                  {criterion.verdict === 'ko' && <AlertCircle className="w-4 h-4 text-red-600" />}
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 border-t flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {t('subscriptions.detail.compliance.adequacy.documentHint')}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-8"
              onClick={() =>
                toast.success(t('subscriptions.detail.compliance.toast.adequacyGenerated'), {
                  description: t('subscriptions.detail.compliance.toast.adequacyGeneratedDesc'),
                })
              }
            >
              <FileCheck className="w-3.5 h-3.5" />
              {t('subscriptions.detail.compliance.adequacy.generate')}
            </Button>
          </div>
        </Card>

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
                    {entry.kind === 'score' && <Radar className="w-3.5 h-3.5 text-muted-foreground" />}
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

      {/* Validation finale du dossier */}
      <Card className="shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-foreground">
              {t('subscriptions.detail.compliance.final.title')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('subscriptions.detail.compliance.final.subtitle')}
            </p>
          </div>
          {status === 'validated' ? (
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
        </div>

        <div className="px-6 py-4">
          <OnboardingCompletionCard questions={questions} documents={documents} />
        </div>

        <div className="px-6 pb-4 space-y-2">
          {checklist.map(item => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                {item.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : item.blocking ? (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground">{t(item.labelKey)}</div>
                  <div className="text-xs text-muted-foreground">{item.detail}</div>
                </div>
              </div>
              {!item.done && !item.blocking && (
                <Badge className="bg-muted text-muted-foreground text-xs">
                  {t('subscriptions.detail.compliance.final.nonBlocking')}
                </Badge>
              )}
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t">
          {status === 'validated' ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  {t('subscriptions.detail.compliance.final.validatedBy', {
                    name: statusBy ?? '',
                    date: statusAt ?? '',
                  })}
                </span>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={handleReopenCompliance}>
                <RotateCcw className="w-3.5 h-3.5" />
                {t('subscriptions.detail.compliance.status.reopen')}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {blockingLeft.length > 0 && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                  <div className="flex items-start gap-2 text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">
                        {tc('subscriptions.detail.compliance.final.blocked', blockingLeft.length)}
                      </div>
                      <ul className="mt-1 space-y-0.5">
                        {blockingLeft.map(item => (
                          <li key={item.id} className="text-xs">
                            {t(item.labelKey)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <label className="mt-3 flex items-start gap-2 text-xs text-red-700">
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

              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button
                  className="gap-2 text-white hover:opacity-90"
                  style={{ background: PRIMARY_BUTTON_GRADIENT }}
                  disabled={!canValidate}
                  onClick={handleValidateCompliance}
                >
                  <ShieldCheck className="w-4 h-4" />
                  {t('subscriptions.detail.compliance.final.validate')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

interface ComplianceRecapCardProps {
  onOpenRiskTab: () => void;
}

/** Rappel de l'etat de conformite, affiche a l'etape Validation du parcours. */
export function ComplianceRecapCard({ onOpenRiskTab }: ComplianceRecapCardProps) {
  const { t } = useTranslation();
  const snapshot = computeComplianceSnapshot();
  const tone: RiskTone = snapshot.tier?.tone ?? 'medium';

  const rows = [
    {
      id: 'hits',
      label: t('subscriptions.detail.compliance.checklist.hits'),
      value: t(
        `subscriptions.detail.compliance.screening.untreated${
          snapshot.untreatedHits === 1 ? 'One' : 'Many'
        }`,
        { count: snapshot.untreatedHits },
      ),
      done: snapshot.untreatedHits === 0,
    },
    {
      id: 'score',
      label: t('subscriptions.detail.compliance.checklist.score'),
      value: snapshot.requiresValidation
        ? t('subscriptions.detail.compliance.checklist.scoreDetailRequired')
        : t('subscriptions.detail.compliance.checklist.scoreDetailOptional'),
      done: !snapshot.requiresValidation,
    },
    {
      id: 'categorisation',
      label: t('subscriptions.detail.compliance.checklist.categorisation'),
      value: t(`subscriptions.detail.compliance.categories.${snapshot.category}`),
      done: true,
    },
    {
      id: 'adequacy',
      label: t('subscriptions.detail.compliance.checklist.adequacy'),
      value: t(`subscriptions.detail.compliance.adequacy.verdict${
        snapshot.adequacy === 'ok' ? 'Ok' : snapshot.adequacy === 'warning' ? 'Warning' : 'Ko'
      }`),
      done: snapshot.adequacy !== 'ko',
    },
  ];

  return (
    <Card className="p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-foreground">
            {t('subscriptions.detail.compliance.recap.title')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('subscriptions.detail.compliance.recap.subtitle')}
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={onOpenRiskTab}>
          <ShieldAlert className="w-3.5 h-3.5" />
          {t('subscriptions.detail.compliance.recap.open')}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'flex h-14 w-14 shrink-0 items-center justify-center rounded-full',
              TONE_STYLES[tone].bar,
            )}
          >
            <span className="text-xl font-bold text-white tabular-nums">
              {snapshot.score ?? '—'}
            </span>
          </span>
          <div>
            <div className="text-xs text-muted-foreground">
              {t('subscriptions.detail.compliance.score.title')}
            </div>
            {snapshot.tier && <ToneBadge tone={tone} label={t(snapshot.tier.labelKey)} />}
          </div>
        </div>

        <div className="grid min-w-0 flex-1 grid-cols-2 gap-3">
          {rows.map(row => (
            <div key={row.id} className="flex items-start gap-2 min-w-0">
              {row.done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{row.label}</div>
                <div className="text-xs text-muted-foreground truncate">{row.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
