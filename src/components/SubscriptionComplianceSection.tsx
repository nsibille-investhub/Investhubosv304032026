import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  FileCheck,
  Globe,
  History,
  ListChecks,
  MessageSquare,
  Pencil,
  Radar,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '../utils/languageContext';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { DisabledReason } from './ui/disabled-reason';
import { FormField } from './ui/form-field';
import { Input } from './ui/input';
import { RowActionButton } from './ui/row-actions';
import { Textarea } from './ui/textarea';
import { DecisionTimeline, type DecisionTimelineEntry } from './ui/decision-timeline';
import { StatusBadge } from './StatusBadge';
import { Sheet, SheetContent } from './ui/sheet';
import {
  SIDE_PANEL_WIDE_STYLE,
  SidePanelCard,
  SidePanelFooter,
  SidePanelHeader,
  SidePanelSection,
} from './ui/side-panel';
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
  type InvestorCategory,
  type RiskClass,
  type RiskComponent,
  type RiskComponentSource,
  type RiskTone,
} from '../utils/subscriptionRiskMockData';
import {
  SubscriptionScreeningWidget,
  useSubscriptionScreening,
  type SubscriptionScreening,
} from './SubscriptionScreeningWidget';
import type { LiveAuditInput } from '../utils/subscriptionAuditMock';
import { matchOpenStatus } from '../utils/screeningMock';

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

const now = () => {
  const date = new Date();
  return `${date.toLocaleDateString('fr-FR')} ${date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

const round1 = (value: number) => Math.round(value * 10) / 10;

/** Valeur triable d'un horodatage "jj/mm/aaaa hh:mm". */
const stampValue = (stamp: string) => {
  const [day, month, year, hour = '0', minute = '0'] = stamp.split(/[/ :]/);
  return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)).getTime();
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

/** Tiers contrôlés par chaque question de screening : souscripteur, représentant, puis bénéficiaires effectifs. */
function screeningParties(componentId: string, screening: SubscriptionScreening) {
  if (componentId === 'screening-subscriber') return screening.parties.slice(0, 1);
  if (componentId === 'screening-representative') return screening.parties.slice(1, 2);
  if (componentId === 'screening-bo') return screening.parties.slice(2);
  return null;
}

/** Nom de chaque tiers contrôlé et nombre de correspondances problématiques : en attente ou confirmées. */
function useAnswerLabel(screening: SubscriptionScreening) {
  const { t } = useTranslation();
  const S = 'subscriptions.detail.compliance.profile.screening';
  const problematic = (party: SubscriptionScreening['parties'][number]) =>
    party.matches.filter(match => matchOpenStatus(match) !== 'rejected').length;
  return (component: RiskComponent, short = false): string => {
    const parties = screeningParties(component.id, screening);
    if (parties === null) return component.value;
    if (parties.length === 0) return t(`${S}.none`);
    if (short) {
      // Résumé du widget : un nom ou un nombre de tiers, puis le total des alertes.
      const count = parties.reduce((sum, party) => sum + problematic(party), 0);
      const alerts = t(`${S}.${count === 0 ? 'alertsZero' : count === 1 ? 'alertsOne' : 'alertsMany'}`, { count });
      const who = parties.length === 1 ? parties[0].entity.name : t(`${S}.parties`, { count: parties.length });
      return t(`${S}.short`, { who, alerts });
    }
    return parties
      .map(party => {
        const count = problematic(party);
        const key = count === 0 ? 'problematicZero' : count === 1 ? 'problematicOne' : 'problematicMany';
        return t(`${S}.party`, { name: party.entity.name, matches: t(`${S}.${key}`, { count }) });
      })
      .join(' · ');
  };
}

export interface ScoreComment {
  id: string;
  labelKey: string;
  previous: number | null;
  /** null : retour au score calculé. */
  next: number | null;
  /** Vide pour un changement de réponse sans commentaire. */
  comment: string;
  by: string;
  at: string;
  /** Instant exact de l'action, pour l'ordre de l'historique. Absent : `at` fait foi. */
  ts?: number;
  /** Réponse retenue au moment de la modification. */
  answer?: string;
  /** Réponse précédente, quand c'est le changement de réponse qui a fait bouger le score. */
  previousAnswer?: string;
}

/** Validation ou réouverture du score global. */
export interface ScoreValidationEvent {
  id: string;
  type: 'validated' | 'reopened';
  /** Score global au moment de l'action. */
  score: number | null;
  by: string;
  at: string;
  /** Instant exact de l'action, pour l'ordre de l'historique. */
  ts: number;
}

/** Historique du score, du plus récent au plus ancien : modifications, validations et réouvertures. */
function ScoreHistory({ comments, events = [] }: { comments: ScoreComment[]; events?: ScoreValidationEvent[] }) {
  const { t } = useTranslation();
  const H = 'subscriptions.detail.compliance.profile.history';
  const format = (value: number | null) =>
    value === null ? t('subscriptions.detail.compliance.profile.comments.computedValue') : String(value);
  const answers = new Map(
    mockRiskProfile.classes.flatMap(item => item.components).map(component => [component.labelKey, component.value]),
  );
  const seen = new Set<string>();
  const timeOf = (item: { ts?: number; at: string }) => item.ts ?? stampValue(item.at);
  const changeEntries = comments.map(item => {
    // La modification la plus récente d'une question porte son score en vigueur.
    const current = !seen.has(item.labelKey);
    seen.add(item.labelKey);
    const rising = item.previous !== null && item.next !== null && item.next > item.previous;
    const falling = item.previous !== null && item.next !== null && item.next < item.previous;
    const answer = item.answer ?? answers.get(item.labelKey);
    const entry: DecisionTimelineEntry = {
      id: item.id,
      badge: (
        <StatusBadge
          label={t(`${H}.change`, {
            previous: item.previous === null ? t(`${H}.notEvaluated`) : String(item.previous),
            next: format(item.next),
          })}
          variant={rising ? 'warning' : falling ? 'success' : 'neutral'}
          className="tabular-nums"
        />
      ),
      dotClassName: rising ? 'bg-amber-500' : falling ? 'bg-emerald-500' : 'bg-gray-400',
      current,
      meta: t(item.labelKey),
      date: item.at,
      author: item.by,
      detail: !answer
        ? undefined
        : item.previousAnswer
          ? t(`${H}.answerChange`, { previous: item.previousAnswer, value: answer })
          : t(`${H}.answer`, { value: answer }),
      comment: item.comment || undefined,
    };
    return { entry, time: timeOf(item) };
  });
  const eventEntries = events.map(event => {
    const tier = findRiskTier(mockRiskProfile.scaleId, event.score);
    const entry: DecisionTimelineEntry = {
      id: event.id,
      badge: (
        <StatusBadge label={t(`${H}.${event.type}`)} variant={event.type === 'validated' ? 'success' : 'info'} />
      ),
      dotClassName: event.type === 'validated' ? 'bg-emerald-500' : 'bg-blue-500',
      meta: t(`${H}.globalScore`, {
        score: event.score ?? '-',
        tier: tier ? t(tier.labelKey) : t('subscriptions.detail.compliance.score.unavailable'),
      }),
      date: event.at,
      author: event.by,
    };
    return { entry, time: timeOf(event) };
  });
  const entries = [...eventEntries, ...changeEntries].sort((a, b) => b.time - a.time).map(item => item.entry);
  return <DecisionTimeline entries={entries} currentLabel={t(`${H}.current`)} emptyLabel={t(`${H}.empty`)} />;
}


export interface ScoreChange {
  id: string;
  labelKey: string;
  previous: number | null;
  value: number;
}

/** Portée du détail : tout le profil, une section, ou une seule question. */
type ScoreDetailScope =
  | { kind: 'profile' }
  | { kind: 'section'; classId: string }
  | { kind: 'question'; classId: string; componentId: string };

const DETAIL_COMMENT_FIELD_ID = 'risk-detail-comment';

/**
 * Détail d'un score dans le panneau latéral : les questions qui le composent, modifiables d'une traite.
 * Le score d'une section n'est jamais saisi, il se recalcule à partir de ses questions.
 */
function ScoreDetailPanel({
  scope,
  manualScores,
  comments,
  validationEvents,
  answerLabel,
  readOnlyReason,
  onClose,
  onSave,
}: {
  /** Réponse affichée sous chaque question. */
  answerLabel: (component: RiskComponent, short?: boolean) => string;
  scope: ScoreDetailScope | null;
  manualScores: Record<string, number>;
  /** Toutes les modifications de score ; le panneau garde celles de sa portée. */
  comments: ScoreComment[];
  /** Validations et réouvertures du score global, affichées dans l'historique du profil. */
  validationEvents: ScoreValidationEvent[];
  /** Score validé ou dossier verrouillé : consultation seule. */
  readOnlyReason?: string;
  onClose: () => void;
  onSave: (changes: ScoreChange[], comment: string) => void;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [comment, setComment] = useState('');
  const scopeKey = !scope
    ? null
    : scope.kind === 'profile'
      ? 'profile'
      : scope.kind === 'section'
        ? scope.classId
        : scope.componentId;
  const [openedFor, setOpenedFor] = useState<string | null>(null);

  if (scopeKey !== openedFor) {
    setOpenedFor(scopeKey);
    setDraft({});
    setComment('');
  }

  const D = 'subscriptions.detail.compliance.profile.detail';
  const classes: RiskClass[] = !scope
    ? []
    : scope.kind === 'profile'
      ? mockRiskProfile.classes
      : mockRiskProfile.classes
          .filter(item => item.id === scope.classId)
          .map(item =>
            scope.kind === 'question'
              ? { ...item, components: item.components.filter(component => component.id === scope.componentId) }
              : item,
          );
  const components = classes.flatMap(item => item.components);
  // Le score de la section tient compte de toutes ses questions, même quand une seule est affichée.
  const fullClass = (riskClass: RiskClass) => mockRiskProfile.classes.find(item => item.id === riskClass.id) ?? riskClass;
  const scopeLabels = new Set(components.map(component => component.labelKey));
  const scopeHistory = comments.filter(item => scopeLabels.has(item.labelKey));

  const parse = (text: string) => (text.trim() === '' ? Number.NaN : Number(text.replace(',', '.')));
  const entries = components.map(component => {
    const current = componentScore(component, manualScores);
    const text = draft[component.id] ?? (current === null ? '' : String(current));
    const parsed = parse(text);
    // Une question non évaluée peut rester vide.
    const untouchedEmpty = current === null && text.trim() === '';
    const valid = untouchedEmpty || (!Number.isNaN(parsed) && parsed >= component.min && parsed <= component.max);
    const value = untouchedEmpty || !valid ? current : round1(parsed);
    return { component, current, text, valid, value, changed: valid && value !== current };
  });
  const byId = new Map(entries.map(entry => [entry.component.id, entry]));

  const liveScores = { ...manualScores };
  entries.forEach(entry => {
    if (typeof entry.value === 'number') liveScores[entry.component.id] = entry.value;
  });
  const liveProfile = computeProfileScore(liveScores);
  const liveTier = findRiskTier(mockRiskProfile.scaleId, liveProfile);

  const changes: ScoreChange[] = entries
    .filter(entry => entry.changed && typeof entry.value === 'number')
    .map(entry => ({
      id: entry.component.id,
      labelKey: entry.component.labelKey,
      previous: entry.current,
      value: entry.value as number,
    }));
  const invalid = entries.some(entry => !entry.valid);
  const saveReason =
    readOnlyReason ??
    (invalid
      ? t(`${D}.invalid`)
      : changes.length === 0
        ? t(`${D}.noChange`)
        : comment.trim() === ''
          ? t('subscriptions.detail.compliance.profile.edit.commentRequired')
          : undefined);

  const format = (score: number | null) => (score === null ? '-' : score.toFixed(2));

  return (
    <Sheet open={Boolean(scope)} onOpenChange={open => !open && onClose()}>
      <SheetContent side="right" style={SIDE_PANEL_WIDE_STYLE} className="h-full p-0 gap-0">
        <SidePanelHeader
          title={
            scope?.kind === 'question' && components[0]
              ? t(`${D}.titleSection`, { name: t(components[0].labelKey) })
              : scope?.kind === 'section' && classes[0]
                ? t(`${D}.titleSection`, { name: t(classes[0].labelKey) })
                : t(`${D}.titleGlobal`)
          }
          description={readOnlyReason ?? t(scope?.kind === 'question' ? `${D}.descriptionQuestion` : `${D}.description`)}
        >
          {scope?.kind === 'profile' && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold text-foreground tabular-nums">
                {t(`${D}.globalScore`, { score: liveProfile ?? '-' })}
              </span>
              {liveTier && <ToneBadge tone={liveTier.tone} label={t(liveTier.labelKey)} />}
            </div>
          )}
        </SidePanelHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">
          {classes.map(riskClass => (
            <SidePanelSection
              key={riskClass.id}
              icon={ListChecks}
              title={t(riskClass.labelKey)}
              description={t(`${D}.sectionScore`, { score: format(aggregateClassScore(fullClass(riskClass), liveScores)) })}
            >
              <SidePanelCard>
                <div className="flex flex-col gap-4">
                  {riskClass.components.map(component => {
                    const entry = byId.get(component.id)!;
                    const fieldId = `risk-detail-${component.id}`;
                    return (
                      <FormField
                        key={component.id}
                        id={fieldId}
                        label={t(component.labelKey)}
                        hint={t(`${D}.fieldHint`, { value: answerLabel(component), min: component.min, max: component.max })}
                        error={
                          entry.valid
                            ? undefined
                            : t('subscriptions.detail.compliance.profile.edit.scoreHint', {
                                min: component.min,
                                max: component.max,
                              })
                        }
                      >
                        <Input
                          id={fieldId}
                          inputMode="decimal"
                          value={entry.text}
                          disabled={Boolean(readOnlyReason)}
                          onChange={event => setDraft(prev => ({ ...prev, [component.id]: event.target.value }))}
                          className="h-11 tabular-nums"
                        />
                      </FormField>
                    );
                  })}
                </div>
              </SidePanelCard>
            </SidePanelSection>
          ))}

          {!readOnlyReason && (
            <SidePanelSection icon={MessageSquare} title={t('subscriptions.detail.compliance.profile.edit.comment')}>
              <SidePanelCard>
                <FormField
                  id={DETAIL_COMMENT_FIELD_ID}
                  label={t('subscriptions.detail.compliance.profile.edit.comment')}
                  required
                  hint={t(`${D}.commentHint`)}
                >
                  <Textarea
                    id={DETAIL_COMMENT_FIELD_ID}
                    value={comment}
                    onChange={event => setComment(event.target.value)}
                    placeholder={t('subscriptions.detail.compliance.profile.edit.commentPlaceholder')}
                    rows={3}
                  />
                </FormField>
              </SidePanelCard>
            </SidePanelSection>
          )}

          <SidePanelSection icon={History} title={t('subscriptions.detail.compliance.profile.history.title')}>
            <SidePanelCard>
              <ScoreHistory comments={scopeHistory} events={scope?.kind === 'profile' ? validationEvents : []} />
            </SidePanelCard>
          </SidePanelSection>
        </div>

        <SidePanelFooter>
          <Button variant="ghost" size="sm" className="h-9" onClick={onClose}>
            {t(`${D}.cancel`)}
          </Button>
          <DisabledReason reason={saveReason}>
            <Button
              variant="primary"
              size="sm"
              className="h-9"
              disabled={Boolean(saveReason)}
              onClick={() => onSave(changes, comment.trim())}
            >
              {changes.length > 1
                ? t(`${D}.saveMany`, { count: changes.length })
                : t('subscriptions.detail.compliance.profile.edit.save')}
            </Button>
          </DisabledReason>
        </SidePanelFooter>
      </SheetContent>
    </Sheet>
  );
}

interface RiskProfileWidgetProps {
  /** Tiers contrôlés de la souscription, pour le détail des questions de screening. */
  screening: SubscriptionScreening;
  /** Dossier valide : les decisions ne sont plus modifiables. */
  locked: boolean;
  /** Scores saisis à la main, par question. Une section ne se saisit jamais. */
  manualScores: Record<string, number>;
  /** Enregistrement groupé depuis le détail d'un score : un seul commentaire pour toutes les questions modifiées. */
  onScoresSave: (changes: ScoreChange[], comment: string) => void;
  comments: ScoreComment[];
  validationEvents: ScoreValidationEvent[];
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
  screening,
  locked,
  manualScores,
  onScoresSave,
  comments,
  validationEvents,
  computedAt,
  onRecompute,
  scoreValidated,
  scoreValidatedBy,
  scoreValidatedAt,
  onValidateScore,
  onReopenScore,
}: RiskProfileWidgetProps) {
  const { t } = useTranslation();
  const [detailScope, setDetailScope] = useState<ScoreDetailScope | null>(null);
  const answerLabel = useAnswerLabel(screening);

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

  const editLockedReason = scoreValidated
    ? t('subscriptions.detail.compliance.score.editLockedReason')
    : undefined;

  const lastChange = (labelKey: string) => comments.find(item => item.labelKey === labelKey);

  const manualMarker = (labelKey: string) => {
    const change = lastChange(labelKey);
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
            icon={Eye}
            tooltip={t('subscriptions.detail.compliance.profile.detail.openGlobal')}
            onClick={() => setDetailScope({ kind: 'profile' })}
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
            </div>
          )}
        </div>
      </div>

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
                <RowActionButton
                  icon={Eye}
                  tooltip={t('subscriptions.detail.compliance.profile.detail.openSection')}
                  onClick={() => setDetailScope({ kind: 'section', classId: riskClass.id })}
                />
              </div>
            </div>

            <ul>
              {riskClass.components.map(component => {
                const SourceIcon = SOURCE_ICONS[component.source];
                const shown = componentScore(component, manualScores);
                const manual =
                  typeof manualScores[component.id] === 'number' ||
                  typeof component.manualScore === 'number';

                return (
                  <li key={component.id} className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-1.5 text-xs">
                      <SourceIcon className="w-3 h-3 shrink-0 text-muted-foreground" />
                      <span className="shrink-0 text-foreground">{t(component.labelKey)}</span>
                      <span className="truncate text-muted-foreground" title={answerLabel(component)}>
                        {answerLabel(component, true)}
                      </span>
                    </span>

                    <span className="flex items-center gap-1.5 shrink-0">
                      {manual && manualMarker(component.labelKey)}
                      <span className="text-xs font-semibold text-foreground tabular-nums">
                        {shown === null ? '-' : shown.toFixed(2)}
                      </span>
                      <RowActionButton
                        icon={Eye}
                        tooltip={t('subscriptions.detail.compliance.profile.detail.openQuestion')}
                        onClick={() =>
                          setDetailScope({ kind: 'question', classId: riskClass.id, componentId: component.id })
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

      <ScoreDetailPanel
        scope={detailScope}
        manualScores={manualScores}
        comments={comments}
        validationEvents={validationEvents}
        answerLabel={answerLabel}
        readOnlyReason={locked ? t('subscriptions.detail.compliance.profile.detail.locked') : editLockedReason}
        onClose={() => setDetailScope(null)}
        onSave={(changes, comment) => {
          onScoresSave(changes, comment);
          setDetailScope(null);
        }}
      />
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
  const [scoreComments, setScoreComments] = useState<ScoreComment[]>(() => {
    const components = mockRiskProfile.classes.flatMap(item => item.components);
    const manual: ScoreComment[] = components
      .filter(component => typeof component.manualScore === 'number' && component.manualComment)
      .map(component => ({
        id: `seed-${component.id}`,
        labelKey: component.labelKey,
        previous: component.score,
        next: component.manualScore ?? null,
        comment: component.manualComment ?? '',
        by: component.manualBy ?? CURRENT_OPERATOR,
        at: component.manualAt ?? mockRiskProfile.computedAt,
        answer: component.value,
      }));
    const answers: ScoreComment[] = components.flatMap(component =>
      (component.answerHistory ?? []).map((change, index) => ({
        id: `answer-${component.id}-${index}`,
        labelKey: component.labelKey,
        previous: change.previousScore,
        next: change.score,
        comment: change.comment ?? '',
        by: change.by,
        at: change.at,
        answer: change.value,
        previousAnswer: change.previousValue,
      })),
    );
    return [...manual, ...answers].sort((a, b) => stampValue(b.at) - stampValue(a.at));
  });

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

  const profileScore = computeProfileScore(manualScores);
  const profileTier = findRiskTier(mockRiskProfile.scaleId, profileScore);
  const validationRequired = profileTier?.requiresValidation ?? false;

  const makeScoreEvent = (type: ScoreValidationEvent['type'], by: string): ScoreValidationEvent => ({
    id: `score-${type}-${Date.now()}`,
    type,
    score: profileScore,
    by,
    at: now(),
    ts: Date.now(),
  });
  // Une validation déjà faite avant l'affichage de l'étape ouvre l'historique.
  const [scoreEvents, setScoreEvents] = useState<ScoreValidationEvent[]>(() =>
    scoreValidated ? [makeScoreEvent('validated', scoreValidatedBy ?? CURRENT_OPERATOR)] : [],
  );
  const scoreState = useRef({ validated: scoreValidated, by: scoreValidatedBy ?? CURRENT_OPERATOR });
  useEffect(() => {
    if (scoreValidated === scoreState.current.validated) return;
    const by = scoreValidated ? scoreValidatedBy ?? CURRENT_OPERATOR : scoreState.current.by;
    scoreState.current = { validated: scoreValidated, by };
    setScoreEvents(prev => [makeScoreEvent(scoreValidated ? 'validated' : 'reopened', by), ...prev]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scoreValidated]);

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

  const handleScoresSave = (changes: ScoreChange[], comment: string) => {
    const stamp = now();
    changes.forEach(change =>
      logAudit({
        type: 'manualScoreSet',
        subject: t(change.labelKey),
        previousValue: change.previous === null ? undefined : String(change.previous),
        newValue: String(change.value),
        reason: comment,
      }),
    );
    setManualScores(prev => ({ ...prev, ...Object.fromEntries(changes.map(change => [change.id, change.value])) }));
    setScoreComments(prev => [
      ...changes.map(change => ({
        id: `${change.id}-${Date.now()}`,
        labelKey: change.labelKey,
        previous: change.previous,
        next: change.value,
        comment,
        by: CURRENT_OPERATOR,
        at: stamp,
        ts: Date.now(),
        answer: mockRiskProfile.classes.flatMap(item => item.components).find(item => item.id === change.id)?.value,
      })),
      ...prev,
    ]);
    setComputedAt(stamp);
    toast.success(tc('subscriptions.detail.compliance.toast.scoresSaved', changes.length), {
      description: t('subscriptions.detail.compliance.toast.manualScoreSavedDesc'),
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
          onScoresSave={handleScoresSave}
          validationEvents={scoreEvents}
          screening={screening}
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
