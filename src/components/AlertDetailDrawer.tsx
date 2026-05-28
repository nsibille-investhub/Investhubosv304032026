import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Hash,
  KeyRound,
  Link2,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
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
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { StatusBadge } from './StatusBadge';
import { AnalystSelector } from './AnalystSelector';
import { AlertItem, AlertListCategory, InvestorRole } from '../utils/alertsGenerator';
import { useTranslation } from '../utils/languageContext';

type Decision = 'unsure' | 'false_hit' | 'true_hit';

interface AlertDetailDrawerProps {
  alert: AlertItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDecision?: (alertId: string, decision: 'true_hit' | 'false_hit') => void;
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

const ROLE_LABEL_KEY: Record<InvestorRole, string> = {
  source: 'complianceAlerts.investorRole.source',
  beneficiary: 'complianceAlerts.investorRole.beneficiary',
  coInvestor: 'complianceAlerts.investorRole.coInvestor',
  legalRep: 'complianceAlerts.investorRole.legalRep',
  proxy: 'complianceAlerts.investorRole.proxy',
};

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
}: AlertDetailDrawerProps) {
  const { t } = useTranslation();
  const [decision, setDecision] = useState<Decision | null>(null);
  const [comment, setComment] = useState('');
  const [monitoring, setMonitoring] = useState(true);
  const [analyst, setAnalyst] = useState<string | null>(null);

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
      setMonitoring(alert.monitoring);
      setAnalyst(alert.analyst);
    }
  }, [alert?.id]);

  const enrichedDescription = useMemo(
    () => alert?.alert?.enrichedDetails?.fullDescription ?? '',
    [alert],
  );

  if (!alert) return null;

  const handleConfirm = () => {
    if (!decision) {
      toast.error(t('complianceAlerts.drawer.missingDecision'));
      return;
    }
    if (!comment.trim()) {
      toast.error(t('complianceAlerts.drawer.missingComment'));
      return;
    }
    if (decision === 'true_hit' || decision === 'false_hit') {
      onDecision?.(alert.id, decision);
    } else {
      toast.success(t('complianceAlerts.drawer.confirm'));
      onClose();
    }
  };

  const handleAiAnalysis = () => {
    toast.success(t('complianceAlerts.drawer.aiToastTitle'), {
      description: t('complianceAlerts.drawer.aiToastBody', { name: alert.entityName }),
    });
  };

  const statusLabel = t(STATUS_LABEL_KEY[alert.status]);
  const statusVariant = STATUS_VARIANT[alert.status];
  const isPending = alert.status === 'Pending';

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="!w-[92vw] sm:!w-[60vw] lg:!w-[40vw] !max-w-none h-full p-0 gap-0"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b bg-white">
          <div className="pr-8">
            <div className="flex items-center gap-2 flex-wrap">
              <SheetTitle className="text-[22px] leading-7">
                {alert.entityName}
              </SheetTitle>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-xs font-medium tabular-nums">
                <Sparkles className="w-3 h-3" />
                {alert.match}%
              </span>
              <StatusBadge label={statusLabel} variant={statusVariant} />
            </div>
            <SheetDescription className="mt-1 text-sm">
              <span className="font-medium text-foreground/70">
                {t('complianceAlerts.drawer.nameAlert')}:
              </span>{' '}
              {alert.name} · {alert.source}
            </SheetDescription>
          </div>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* CONTEXT SECTION */}
          <section
            className="space-y-3 rounded-2xl p-4 border"
            style={SECTION_STYLE}
          >
            <div>
              <p
                className="font-semibold flex items-center gap-2"
                style={{ color: ACCENT_COLOR }}
              >
                <ShieldCheck className="w-5 h-5" style={{ color: ACCENT_COLOR }} />
                {t('complianceAlerts.drawer.context')}
              </p>
              <p className="text-sm text-slate-600">
                {alert.entityName} · {alert.source}
              </p>
            </div>

            <div
              className="rounded-2xl border bg-white p-4 md:p-5 space-y-4"
              style={INNER_CARD_STYLE}
            >
              <div>
                <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  {t('complianceAlerts.drawer.analyst')}
                </div>
                <AnalystSelector
                  currentAnalyst={analyst}
                  onAnalystChange={(name) => setAnalyst(name)}
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600">
                  {t('complianceAlerts.drawer.monitoring')}:
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={monitoring}
                        onCheckedChange={setMonitoring}
                      />
                      <span
                        className={`text-sm font-medium ${
                          monitoring ? 'text-blue-600' : 'text-slate-500'
                        }`}
                      >
                        {monitoring
                          ? t('complianceAlerts.drawer.active')
                          : t('complianceAlerts.drawer.inactive')}
                      </span>
                      {monitoring ? (
                        <Eye className="w-4 h-4 text-blue-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {monitoring
                      ? t('complianceAlerts.drawer.active')
                      : t('complianceAlerts.drawer.inactive')}
                  </TooltipContent>
                </Tooltip>
              </div>

              <div>
                <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  <Users className="w-3 h-3" />
                  {t('complianceAlerts.drawer.attachedInvestors')}
                </div>
                {alert.attachedInvestors.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    {t('complianceAlerts.drawer.noAttachedInvestors')}
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {alert.attachedInvestors.map((inv, idx) => (
                      <li
                        key={`${inv.name}-${idx}`}
                        className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs"
                      >
                        <span className="font-medium text-slate-900 truncate">
                          {inv.name}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] font-medium shrink-0 bg-white"
                        >
                          {t(ROLE_LABEL_KEY[inv.role])}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  {t('complianceAlerts.drawer.previousFindings')}
                </div>
                {alert.previousFindings.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    {t('complianceAlerts.drawer.noPreviousFindings')}
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {alert.previousFindings.map((cat, idx) => (
                      <Badge
                        key={`${cat}-${idx}`}
                        variant="outline"
                        className="text-[11px] font-medium bg-white"
                      >
                        {t(ALERT_LIST_LABEL_KEY[cat])}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
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
                  className="h-7 gap-1.5 text-xs"
                >
                  <Sparkles className="w-3 h-3" />
                  {t('complianceAlerts.drawer.aiAnalysis')}
                </Button>
              </div>

              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
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
            <div>
              <p
                className="font-semibold flex items-center gap-2"
                style={{ color: ACCENT_COLOR }}
              >
                <AlertTriangle className="w-5 h-5" style={{ color: ACCENT_COLOR }} />
                {t('complianceAlerts.drawer.alertDetails')}
              </p>
              <p className="text-sm text-slate-600">
                {t('complianceAlerts.drawer.alertTypes')}
              </p>
            </div>
            <div
              className="rounded-2xl border bg-white p-4 md:p-5 space-y-3"
              style={INNER_CARD_STYLE}
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
            </div>
          </section>

          {/* KEYWORDS */}
          {alert.alert?.details?.keywords?.length ? (
            <section
              className="space-y-3 rounded-2xl p-4 border"
              style={SECTION_STYLE}
            >
              <div>
                <p
                  className="font-semibold flex items-center gap-2"
                  style={{ color: ACCENT_COLOR }}
                >
                  <KeyRound className="w-5 h-5" style={{ color: ACCENT_COLOR }} />
                  {t('complianceAlerts.drawer.keywords')}
                </p>
              </div>
              <div
                className="rounded-2xl border bg-white p-4 md:p-5"
                style={INNER_CARD_STYLE}
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
              </div>
            </section>
          ) : null}

          {/* IDENTIFICATION */}
          {alert.alert?.details?.identification?.length ? (
            <section
              className="space-y-3 rounded-2xl p-4 border"
              style={SECTION_STYLE}
            >
              <div>
                <p
                  className="font-semibold flex items-center gap-2"
                  style={{ color: ACCENT_COLOR }}
                >
                  <Hash className="w-5 h-5" style={{ color: ACCENT_COLOR }} />
                  {t('complianceAlerts.drawer.identification')}
                </p>
              </div>
              <div
                className="rounded-2xl border bg-white p-4 md:p-5"
                style={INNER_CARD_STYLE}
              >
                <dl className="space-y-2">
                  {alert.alert.details.identification.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm">
                      <dt className="min-w-[180px] text-slate-500">{item.label}</dt>
                      <dd className="font-medium text-slate-900 break-all">
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>
          ) : null}

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

        </div>
      </SheetContent>
    </Sheet>
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
