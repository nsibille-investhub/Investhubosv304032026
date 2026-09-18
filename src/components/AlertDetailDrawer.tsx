import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileText,
  Fingerprint,
  Gauge,
  Hash,
  HelpCircle,
  History,
  Info,
  KeyRound,
  Link2,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from './ui/sheet';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { StatusBadge } from './StatusBadge';
import {
  DECISION_KEY,
  DECISION_VARIANT,
  formatDateTime,
} from './entity-detail/entityDetailShared';
import { useCompliance } from '../utils/complianceContext';
import type { MatchDecisionValue } from '../utils/screeningMock';
import { AlertItem, AlertListCategory } from '../utils/alertsGenerator';
import {
  generateAiAnalysis,
  proposalToDecision,
  type AiScreeningAnalysis,
  type AiProposal,
} from '../utils/aiComplianceScreening';
import { useTranslation } from '../utils/languageContext';

type Decision = 'unsure' | 'false_hit' | 'true_hit';

interface AlertDetailDrawerProps {
  alert: AlertItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDecision?: (
    alertId: string,
    decision: 'true_hit' | 'false_hit' | 'unsure',
    comment?: string,
  ) => void;
  onEntityClick?: (alert: AlertItem) => void;
}

const STATUS_VARIANT: Record<
  AlertItem['status'],
  'warning' | 'danger' | 'neutral'
> = {
  Pending: 'warning',
  Confirmed: 'danger',
  Rejected: 'neutral',
};

const STATUS_LABEL_KEY: Record<AlertItem['status'], string> = {
  Pending: 'complianceAlerts.status.pending',
  Confirmed: 'complianceAlerts.status.confirmed',
  Rejected: 'complianceAlerts.status.rejected',
};

const ALERT_LIST_LABEL_KEY: Record<AlertListCategory, string> = {
  PEP: 'complianceAlerts.list.pep',
  'Watch List': 'complianceAlerts.list.watchList',
  Sanctions: 'complianceAlerts.list.sanctions',
  'Adverse Media': 'complianceAlerts.list.adverseMedia',
  Crime: 'complianceAlerts.list.crime',
  'Financial Warning': 'complianceAlerts.list.financialWarning',
};

const CHANGE_LABEL_KEY: Record<
  NonNullable<AlertItem['changes']>,
  string
> = {
  New: 'complianceAlerts.changes.new',
  Modified: 'complianceAlerts.changes.modified',
  Reopened: 'complianceAlerts.changes.reopened',
};

type Strength = 'low' | 'medium' | 'high';

const STRENGTH_LABEL_KEY: Record<Strength, string> = {
  low: 'complianceAlerts.drawer.strengthLow',
  medium: 'complianceAlerts.drawer.strengthMedium',
  high: 'complianceAlerts.drawer.strengthHigh',
};

const STRENGTH_TEXT: Record<Strength, string> = {
  low: 'text-slate-600',
  medium: 'text-amber-600',
  high: 'text-rose-600',
};

const STRENGTH_FILL: Record<Strength, string> = {
  low: 'bg-gray-400',
  medium: 'bg-amber-500',
  high: 'bg-red-500',
};

const STRENGTH_STEPS: Record<Strength, number> = { low: 1, medium: 2, high: 3 };

const DECISION_DOT: Record<MatchDecisionValue, string> = {
  true_hit: 'bg-red-500',
  false_hit: 'bg-gray-400',
  unsure: 'bg-amber-500',
};

function strengthFromScore(score: number): Strength {
  if (score >= 90) return 'high';
  if (score >= 80) return 'medium';
  return 'low';
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

const SECTION_STYLE = {
  backgroundColor: '#EEF1F7',
  borderColor: '#000E2B1F',
} as const;

const INNER_CARD_STYLE = { borderColor: '#000E2B33' } as const;

const ACCENT_COLOR = '#000E2B';

export function AlertDetailDrawer({
  alert,
  isOpen,
  onClose,
  onDecision,
  onEntityClick,
}: AlertDetailDrawerProps) {
  const { t, lang } = useTranslation();
  const { getMatch } = useCompliance();
  const [decision, setDecision] = useState<Decision | null>(null);
  const [comment, setComment] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<AiScreeningAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (alert) {
      const initial =
        alert.status === 'Confirmed'
          ? 'true_hit'
          : alert.status === 'Rejected'
            ? 'false_hit'
            : null;
      setDecision(initial);
      setComment(alert.alert?.comment ?? '');
      setAiAnalysis(null);
      setAiLoading(false);
    }
  }, [alert?.id]);

  const match = alert ? getMatch(alert.id) : undefined;

  const decisionHistory = useMemo(
    () => [...(match?.decisions ?? [])].sort((a, b) => b.revision - a.revision),
    [match],
  );

  const strength = strengthFromScore(alert?.match ?? 0);

  const enrichedDescription = useMemo(
    () => alert?.alert?.enrichedDetails?.fullDescription ?? '',
    [alert],
  );

  const handleConfirm = () => {
    if (!alert) return;
    if (!decision) {
      toast.error(t('complianceAlerts.drawer.missingDecision'));
      return;
    }
    if (!comment.trim()) {
      toast.error(t('complianceAlerts.drawer.missingComment'));
      return;
    }
    onDecision?.(alert.id, decision, comment.trim());
  };

  const handleAiAnalysis = () => {
    if (!alert) return;
    setAiLoading(true);
    window.setTimeout(() => {
      const analysis = generateAiAnalysis(alert);
      setAiAnalysis(analysis);
      setDecision(proposalToDecision(analysis.proposal));
      setComment(analysis.proposedComment);
      setAiLoading(false);
      toast.success(t('complianceAlerts.aiPanel.appliedTitle'), {
        description: t('complianceAlerts.aiPanel.appliedBody', {
          confidence: Math.round(analysis.confidence * 100),
        }),
      });
    }, 700);
  };

  const statusLabel = alert ? t(STATUS_LABEL_KEY[alert.status]) : '';
  const statusVariant = alert ? STATUS_VARIANT[alert.status] : 'neutral';
  const isPending = alert?.status === 'Pending';

  return (
    <Sheet open={isOpen && !!alert} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        style={{
          width: 'min(720px, 92vw)',
          maxWidth: 'none',
          ['--tw-enter-translate-x' as never]: '100%',
          ['--tw-exit-translate-x' as never]: '100%',
        }}
        className="h-full p-0 gap-0"
      >
        {alert ? (
        <>
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b bg-white">
          <div className="pr-8 flex items-center gap-2 flex-wrap">
            <SheetTitle className="text-[22px] leading-7">
              {t('complianceAlerts.drawer.title')}
            </SheetTitle>
            <StatusBadge label={statusLabel} variant={statusVariant} />
          </div>
          <SheetDescription className="sr-only">
            {t('complianceAlerts.drawer.titleHint')}
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* CONTEXT SECTION */}
          <section
            className="space-y-3 rounded-2xl p-4 border"
            style={SECTION_STYLE}
          >
            <p
              className="font-semibold flex items-center gap-2"
              style={{ color: ACCENT_COLOR }}
            >
              <ShieldCheck className="w-5 h-5" style={{ color: ACCENT_COLOR }} />
              {t('complianceAlerts.drawer.context')}
            </p>

            <div
              className="rounded-2xl border bg-white p-4 md:p-5"
              style={INNER_CARD_STYLE}
            >
              <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                <ContextField label={t('complianceAlerts.drawer.attachedDossier')}>
                  {alert.dossier}
                </ContextField>
                <ContextField label={t('complianceAlerts.drawer.screenedEntity')}>
                  {onEntityClick ? (
                    <button
                      type="button"
                      onClick={() => onEntityClick(alert)}
                      title={t('complianceAlerts.table.openEntity')}
                      className="inline-flex items-center gap-1.5 text-left hover:underline underline-offset-4"
                    >
                      {alert.entityName}
                      <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                    </button>
                  ) : (
                    alert.entityName
                  )}
                </ContextField>
                <ContextField label={t('complianceAlerts.drawer.matchedHit')}>
                  {alert.name}
                </ContextField>
                <ContextField label={t('complianceAlerts.drawer.matchScore')}>
                  <span className="tabular-nums">{alert.match}%</span>
                </ContextField>
                <ContextField label={t('complianceAlerts.drawer.alertType')}>
                  {alert.changes ? t(CHANGE_LABEL_KEY[alert.changes]) : '—'}
                </ContextField>
              </dl>
            </div>
          </section>

          {/* DECISION SECTION */}
          <section
            className="space-y-3 rounded-2xl p-4 border"
            style={SECTION_STYLE}
          >
            <div>
              <p
                className="font-semibold flex items-center gap-2"
                style={{ color: ACCENT_COLOR }}
              >
                <FileText className="w-5 h-5" style={{ color: ACCENT_COLOR }} />
                {t('complianceAlerts.drawer.confirm')}
              </p>
              <p className="text-sm text-slate-600">
                {t('complianceAlerts.drawer.commentPlaceholder')}
              </p>
            </div>
            <div
              className="rounded-2xl border bg-white p-4 md:p-5 space-y-3"
              style={INNER_CARD_STYLE}
            >
              <div className="flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{alert.date}</span>
                </div>
                <Button
                  size="sm"
                  type="button"
                  onClick={handleAiAnalysis}
                  disabled={aiLoading}
                  className="h-7 gap-1.5 text-xs"
                >
                  <Sparkles className="w-3 h-3" />
                  {aiLoading
                    ? t('complianceAlerts.aiPanel.analyzing')
                    : t('complianceAlerts.drawer.aiAnalysis')}
                </Button>
              </div>

              {(aiLoading || aiAnalysis) && (
                <AiInlineBadge
                  loading={aiLoading}
                  analysis={aiAnalysis}
                  onClear={() => setAiAnalysis(null)}
                />
              )}

              <Textarea
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  if (aiAnalysis && e.target.value !== aiAnalysis.proposedComment) {
                    setAiAnalysis(null);
                  }
                }}
                placeholder={t('complianceAlerts.drawer.commentPlaceholder')}
                className="min-h-[80px] resize-none"
              />
              <div className="-mt-1 flex justify-end">
                <span className="text-[11px] text-slate-500">
                  {comment.length} / 1,234
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <DecisionPill
                  label={t('complianceAlerts.drawer.decisionUnsure')}
                  active={decision === 'unsure'}
                  tone="warning"
                  onClick={() => setDecision('unsure')}
                />
                <DecisionPill
                  label={t('complianceAlerts.drawer.decisionFalseHit')}
                  active={decision === 'false_hit'}
                  tone="neutral"
                  onClick={() => setDecision('false_hit')}
                />
                <DecisionPill
                  label={t('complianceAlerts.drawer.decisionTrueHit')}
                  active={decision === 'true_hit'}
                  tone="danger"
                  onClick={() => setDecision('true_hit')}
                />
                <div className="flex-1" />
                <Button
                  size="sm"
                  type="button"
                  disabled={!isPending}
                  onClick={handleConfirm}
                  className="h-8 px-4"
                >
                  {t('complianceAlerts.drawer.confirm')}
                </Button>
              </div>
            </div>
          </section>

          {/* ALERT DETAILS SECTION */}
          <section
            className="space-y-3 rounded-2xl p-4 border"
            style={SECTION_STYLE}
          >
            <p
              className="font-semibold flex items-center gap-2"
              style={{ color: ACCENT_COLOR }}
            >
              <AlertTriangle className="w-5 h-5" style={{ color: ACCENT_COLOR }} />
              {t('complianceAlerts.drawer.alertDetails')}
            </p>

            <div
              className="rounded-2xl border bg-white px-4 divide-y divide-gray-200"
              style={INNER_CARD_STYLE}
            >
              <DetailBlock
                icon={AlertTriangle}
                label={t('complianceAlerts.drawer.alertTypes')}
              >
                <div className="flex flex-wrap gap-1.5">
                  {alert.alertTypes.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900"
                    >
                      {t(ALERT_LIST_LABEL_KEY[cat])}
                    </span>
                  ))}
                </div>

                {enrichedDescription && (
                  <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-slate-800 bg-slate-50 border border-slate-200 rounded-md p-3">
                    {enrichedDescription}
                  </pre>
                )}
              </DetailBlock>

              {alert.alert?.details?.keywords?.length ? (
                <DetailBlock
                  icon={KeyRound}
                  label={t('complianceAlerts.drawer.keywords')}
                >
                  <div className="flex flex-wrap gap-2">
                    {alert.alert.details.keywords.map((keyword, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-[11px] font-medium"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </DetailBlock>
              ) : null}

              {alert.alert?.details?.identification?.length ? (
                <DetailBlock
                  icon={Hash}
                  label={t('complianceAlerts.drawer.identification')}
                >
                  <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                    {alert.alert.details.identification.map((item, idx) => (
                      <div key={idx} className="min-w-0">
                        <dt className="text-xs text-slate-500">{item.label}</dt>
                        <dd className="text-sm font-medium text-slate-900 break-all">
                          {item.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </DetailBlock>
              ) : null}
            </div>
          </section>

          {/* SOURCES */}
          {alert.alert?.details?.sources?.length ? (
            <section
              className="space-y-3 rounded-2xl p-4 border"
              style={SECTION_STYLE}
            >
              <div>
                <p
                  className="font-semibold flex items-center gap-2"
                  style={{ color: ACCENT_COLOR }}
                >
                  <Link2 className="w-5 h-5" style={{ color: ACCENT_COLOR }} />
                  {t('complianceAlerts.drawer.sources')}
                </p>
              </div>
              <div
                className="rounded-2xl border bg-white p-4 md:p-5"
                style={INNER_CARD_STYLE}
              >
                <div className="space-y-2">
                  {alert.alert.details.sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.url}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                      <span>{source.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {/* INFORMATION SECTION */}
          <section
            className="space-y-3 rounded-2xl p-4 border"
            style={SECTION_STYLE}
          >
            <p
              className="font-semibold flex items-center gap-2"
              style={{ color: ACCENT_COLOR }}
            >
              <Info className="w-5 h-5" style={{ color: ACCENT_COLOR }} />
              {t('complianceAlerts.drawer.information')}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoTile
                icon={Building2}
                label={t('complianceAlerts.drawer.provider')}
                value={alert.source}
              />
              <InfoTile
                icon={Fingerprint}
                label={t('complianceAlerts.drawer.reference')}
                value={<span className="font-mono text-[13px]">{alert.id}</span>}
              />
              <InfoTile
                icon={Gauge}
                label={t('complianceAlerts.drawer.strength')}
                value={
                  <span className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${STRENGTH_TEXT[strength]}`}>
                      {t(STRENGTH_LABEL_KEY[strength])}
                    </span>
                    <StrengthMeter level={strength} />
                  </span>
                }
              />
              <InfoTile
                icon={Calendar}
                label={t('complianceAlerts.drawer.createdAt')}
                value={formatDateTime(match?.firstSeen ?? alert.date, lang)}
              />
            </div>
          </section>

          {/* DECISION HISTORY SECTION */}
          <section
            className="space-y-3 rounded-2xl p-4 border"
            style={SECTION_STYLE}
          >
            <p
              className="font-semibold flex items-center gap-2"
              style={{ color: ACCENT_COLOR }}
            >
              <History className="w-5 h-5" style={{ color: ACCENT_COLOR }} />
              {t('complianceAlerts.drawer.decisionHistory')}
            </p>

            <div
              className="rounded-2xl border bg-white p-4 md:p-5"
              style={INNER_CARD_STYLE}
            >
              {decisionHistory.length === 0 ? (
                <p className="text-sm text-slate-500">
                  {t('complianceAlerts.drawer.noDecisionYet')}
                </p>
              ) : (
                <div className="relative">
                  <span
                    aria-hidden
                    className="absolute left-2 top-3 bottom-0 w-px bg-gray-200"
                  />
                  <ol className="space-y-4">
                    {decisionHistory.map((entry, idx) => (
                      <li key={entry.id} className="relative pl-7">
                        <span
                          aria-hidden
                          className={`absolute left-1 top-1.5 w-2 h-2 rounded-full ring-2 ring-white ${
                            DECISION_DOT[entry.decision]
                          }`}
                        />
                        <div className="flex items-center gap-2 flex-wrap">
                          <StatusBadge
                            label={t(DECISION_KEY[entry.decision])}
                            variant={DECISION_VARIANT[entry.decision]}
                          />
                          {idx === 0 && (
                            <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                              {t('complianceAlerts.drawer.currentDecision')}
                            </span>
                          )}
                          <span className="text-xs text-slate-500">
                            {t('complianceEntities.matches.revision', {
                              n: entry.revision,
                            })}
                          </span>
                          <span className="flex-1" />
                          <span className="text-xs text-slate-500 tabular-nums">
                            {formatDateTime(entry.date, lang)}
                          </span>
                        </div>

                        <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-600">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[9px] font-semibold text-slate-600">
                            {initials(entry.analyst)}
                          </span>
                          <span className="font-medium text-slate-700">
                            {entry.analyst}
                          </span>
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
              )}
            </div>
          </section>

        </div>
        </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function ContextField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        {label}
      </dt>
      <dd className="text-sm font-medium text-slate-900 break-words">
        {children}
      </dd>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
}) {
  return (
    <div
      className="flex items-start gap-3 rounded-xl border bg-white px-3 py-3"
      style={INNER_CARD_STYLE}
    >
      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
        <Icon className="h-4 w-4 text-slate-600" />
      </span>
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          {label}
        </div>
        <div className="mt-0.5 text-sm font-medium text-slate-900 break-words">
          {value}
        </div>
      </div>
    </div>
  );
}

function StrengthMeter({ level }: { level: Strength }) {
  const steps = STRENGTH_STEPS[level];
  return (
    <span aria-hidden className="inline-flex items-center gap-0.5">
      {[1, 2, 3].map((step) => (
        <span
          key={step}
          className={`h-3 w-1 rounded-full ${
            step <= steps ? STRENGTH_FILL[level] : 'bg-gray-200'
          }`}
        />
      ))}
    </span>
  );
}

function DetailBlock({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="py-4 space-y-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      {children}
    </div>
  );
}

function DecisionPill({
  label,
  active,
  tone,
  onClick,
}: {
  label: string;
  active: boolean;
  tone: 'warning' | 'neutral' | 'danger';
  onClick: () => void;
}) {
  const activeStyle = active
    ? tone === 'warning'
      ? 'bg-amber-50 text-amber-700 border-amber-300'
      : tone === 'danger'
        ? 'bg-red-50 text-red-700 border-red-300'
        : 'bg-slate-100 text-slate-800 border-slate-300'
    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50';

  const dotColor = active
    ? tone === 'warning'
      ? 'bg-amber-500'
      : tone === 'danger'
        ? 'bg-red-500'
        : 'bg-slate-500'
    : 'bg-slate-300';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all text-xs font-semibold border ${activeStyle}`}
    >
      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      <span>{label}</span>
    </button>
  );
}

const PROPOSAL_META: Record<
  AiProposal,
  {
    labelKey: string;
    icon: typeof CheckCircle2;
    colorVar: string;
    softVar: string;
  }
> = {
  ACCEPT: {
    labelKey: 'complianceAlerts.aiPanel.proposalAccept',
    icon: CheckCircle2,
    colorVar: 'var(--success)',
    softVar: 'var(--success-soft)',
  },
  REJECT: {
    labelKey: 'complianceAlerts.aiPanel.proposalReject',
    icon: XCircle,
    colorVar: 'var(--danger)',
    softVar: 'var(--danger-soft)',
  },
  UNSURE: {
    labelKey: 'complianceAlerts.aiPanel.proposalUnsure',
    icon: HelpCircle,
    colorVar: 'var(--warning)',
    softVar: 'var(--warning-soft)',
  },
};

function AiInlineBadge({
  loading,
  analysis,
  onClear,
}: {
  loading: boolean;
  analysis: AiScreeningAnalysis | null;
  onClear: () => void;
}) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div
        className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border text-xs"
        style={{
          borderColor: 'color-mix(in oklab, #000E2B 18%, transparent)',
          backgroundColor: '#F5F7FB',
          color: '#000E2B',
        }}
      >
        <Sparkles className="w-3 h-3 animate-pulse" />
        <span>{t('complianceAlerts.aiPanel.analyzing')}</span>
      </div>
    );
  }

  if (!analysis) return null;

  const meta = PROPOSAL_META[analysis.proposal];
  const ProposalIcon = meta.icon;
  const confidencePct = Math.round(analysis.confidence * 100);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-semibold"
        style={{
          color: meta.colorVar,
          backgroundColor: meta.softVar,
          borderColor: `color-mix(in oklab, ${meta.colorVar} 35%, transparent)`,
        }}
      >
        <Sparkles className="w-3 h-3" />
        {t('complianceAlerts.aiPanel.prefilledBy')}
        <ProposalIcon className="w-3 h-3" />
        {t(meta.labelKey)}
        <span className="opacity-70">·</span>
        <span className="tabular-nums">{confidencePct}%</span>
      </span>
      <button
        type="button"
        onClick={onClear}
        className="text-[11px] text-slate-500 hover:text-slate-700 underline underline-offset-2"
      >
        {t('complianceAlerts.aiPanel.dismiss')}
      </button>
    </div>
  );
}
