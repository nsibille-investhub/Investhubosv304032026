import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Eye, EyeOff, ExternalLink, Sparkles, Users } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
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
        className="!w-[92vw] sm:!w-[60vw] lg:!w-[35vw] !max-w-none p-0 flex flex-col gap-0"
      >
        {/* Header */}
        <SheetHeader className="shrink-0 border-b border-border bg-white px-6 py-5 dark:bg-gray-950">
          <div className="flex items-center gap-2 flex-wrap pr-8">
            <SheetTitle className="text-lg leading-snug">{alert.entityName}</SheetTitle>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-xs font-medium tabular-nums">
              <Sparkles className="w-3 h-3" />
              {alert.match}%
            </span>
            <StatusBadge label={statusLabel} variant={statusVariant} />
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground/70">
              {t('complianceAlerts.drawer.nameAlert')}:
            </span>{' '}
            {alert.name} · {alert.source}
          </div>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="px-6 py-5 space-y-5">

              {/* Context Card */}
              <Card className="gap-4 py-5">
                <CardHeader className="px-5 pt-0 pb-0">
                  <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {t('complianceAlerts.drawer.context')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 space-y-4">
                  <div>
                    <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {t('complianceAlerts.drawer.analyst')}
                    </div>
                    <AnalystSelector
                      currentAnalyst={analyst}
                      onAnalystChange={(name) => setAnalyst(name)}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {t('complianceAlerts.drawer.monitoring')}:
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2">
                          <Switch checked={monitoring} onCheckedChange={setMonitoring} />
                          <span
                            className={`text-sm font-medium ${
                              monitoring ? 'text-blue-600' : 'text-muted-foreground'
                            }`}
                          >
                            {monitoring
                              ? t('complianceAlerts.drawer.active')
                              : t('complianceAlerts.drawer.inactive')}
                          </span>
                          {monitoring ? (
                            <Eye className="w-4 h-4 text-blue-600" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
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
                    <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      <Users className="w-3 h-3" />
                      {t('complianceAlerts.drawer.attachedInvestors')}
                    </div>
                    {alert.attachedInvestors.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        {t('complianceAlerts.drawer.noAttachedInvestors')}
                      </p>
                    ) : (
                      <ul className="space-y-1.5">
                        {alert.attachedInvestors.map((inv, idx) => (
                          <li
                            key={`${inv.name}-${idx}`}
                            className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/30 px-2.5 py-1.5 text-xs"
                          >
                            <span className="font-medium text-foreground truncate">
                              {inv.name}
                            </span>
                            <Badge variant="outline" className="text-[10px] font-medium shrink-0">
                              {t(ROLE_LABEL_KEY[inv.role])}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {t('complianceAlerts.drawer.previousFindings')}
                    </div>
                    {alert.previousFindings.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        {t('complianceAlerts.drawer.noPreviousFindings')}
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {alert.previousFindings.map((cat, idx) => (
                          <Badge
                            key={`${cat}-${idx}`}
                            variant="outline"
                            className="text-[11px] font-medium"
                          >
                            {t(ALERT_LIST_LABEL_KEY[cat])}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Decision Card */}
              <Card className="gap-3 py-5">
                <CardContent className="px-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
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
                    className="min-h-[72px] resize-none bg-white"
                  />
                  <div className="-mt-2 flex justify-end">
                    <span className="text-[11px] text-muted-foreground">
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
                </CardContent>
              </Card>

              {/* Alert Details Card */}
              <Card className="gap-3 py-5 border-amber-200 bg-amber-50/40 dark:bg-amber-950/10">
                <CardHeader className="px-5 pt-0 pb-0">
                  <CardTitle className="text-xs font-semibold uppercase tracking-widest text-amber-900 dark:text-amber-200">
                    {t('complianceAlerts.drawer.alertDetails')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 space-y-3">
                  <div>
                    <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-amber-900/80 dark:text-amber-200/80">
                      {t('complianceAlerts.drawer.alertTypes')}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {alert.alertTypes.map((cat) => (
                        <span
                          key={cat}
                          className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200"
                        >
                          {t(ALERT_LIST_LABEL_KEY[cat])}
                        </span>
                      ))}
                    </div>
                  </div>

                  {enrichedDescription && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-md border border-amber-200 bg-white/70 p-3 dark:bg-gray-950/40"
                    >
                      <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-foreground">
                        {enrichedDescription}
                      </pre>
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              {/* Keywords */}
              {alert.alert?.details?.keywords?.length ? (
                <Card className="gap-3 py-5">
                  <CardHeader className="px-5 pt-0 pb-0">
                    <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {t('complianceAlerts.drawer.keywords')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5">
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
                  </CardContent>
                </Card>
              ) : null}

              {/* Identification */}
              {alert.alert?.details?.identification?.length ? (
                <Card className="gap-3 py-5">
                  <CardHeader className="px-5 pt-0 pb-0">
                    <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {t('complianceAlerts.drawer.identification')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5">
                    <dl className="space-y-2">
                      {alert.alert.details.identification.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-sm">
                          <dt className="min-w-[180px] text-muted-foreground">
                            {item.label}
                          </dt>
                          <dd className="font-medium text-foreground break-all">
                            {item.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </CardContent>
                </Card>
              ) : null}

              {/* Sources */}
              {alert.alert?.details?.sources?.length ? (
                <Card className="gap-3 py-5">
                  <CardHeader className="px-5 pt-0 pb-0">
                    <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {t('complianceAlerts.drawer.sources')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5">
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
                  </CardContent>
                </Card>
              ) : null}

            </div>
          </ScrollArea>
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
        : 'bg-muted text-foreground border-border'
    : 'bg-white text-muted-foreground border-border hover:bg-muted/50';

  const dotColor = active
    ? tone === 'warning'
      ? 'bg-amber-500'
      : tone === 'danger'
        ? 'bg-red-500'
        : 'bg-gray-500'
    : 'bg-gray-300';

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
