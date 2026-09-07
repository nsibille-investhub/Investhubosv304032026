import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Check,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileDown,
  FileText,
  History,
  Link2,
  Lock,
  LockOpen,
  Network,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Table as TableIcon,
  User,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { StatusBadge } from '../StatusBadge';
import { AnalystSelector } from '../AnalystSelector';
import { RelationsGraph } from '../RelationsGraph';
import { EntitySummaryTab } from './EntitySummaryTab';
import { EntityMatchesTab, type MatchFilter } from './EntityMatchesTab';
import { EntityAuditTab } from './EntityAuditTab';
import { useTranslation } from '../../utils/languageContext';
import { CURRENT_USER, useCompliance } from '../../utils/complianceContext';
import { copyToClipboard } from '../../utils/clipboard';
import { exportEntityAuditCsv, exportEntityMatchesCsv, openEntityReport } from '../../utils/entityReport';
import type { AlertListCategory } from '../../utils/alertsGenerator';
import type { MatchOpenStatus } from '../../utils/screeningMock';
import {
  ENTITY_STATUS_KEY,
  ENTITY_STATUS_VARIANT,
  ENTITY_TYPE_KEY,
  PARENT_TYPE_KEY,
  RISK_KEY,
  RISK_VARIANT,
  ROLE_KEY,
  formatDateTime,
  formatRelativeTime,
  openDossierPage,
  openParentPage,
} from './entityDetailShared';

type DetailTab = 'summary' | 'matches' | 'relations' | 'audit';

interface EntityDetailPageProps {
  uid: string;
  onBack: () => void;
}

export function EntityDetailPage({ uid, onBack }: EntityDetailPageProps) {
  const { t, lang } = useTranslation();
  const {
    getEntityRowByUid,
    getEntityMatches,
    toggleMonitoring,
    assignAnalyst,
    rerunScreening,
    closeEntity,
    reopenEntity,
    logEntityEvent,
  } = useCompliance();

  const entity = getEntityRowByUid(uid);
  const matches = useMemo(() => (entity ? getEntityMatches(entity.id) : []), [entity, getEntityMatches]);

  const [activeTab, setActiveTab] = useState<DetailTab>('summary');
  const [requestedFilter, setRequestedFilter] = useState<{ filter: MatchFilter; category?: AlertListCategory; seq: number }>();
  const [focusPendingSignal, setFocusPendingSignal] = useState(0);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [rerunning, setRerunning] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!entity) {
    return (
      <div className="flex-1 flex items-center justify-center p-10">
        <Card className="max-w-md w-full">
          <CardContent className="py-10 text-center space-y-3">
            <ShieldAlert className="w-10 h-10 mx-auto text-muted-foreground/50" />
            <p className="font-semibold text-foreground">{t('complianceEntities.detail.notFound')}</p>
            <p className="text-sm text-muted-foreground">{t('complianceEntities.detail.notFoundBody')}</p>
            <Button variant="secondary" onClick={onBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t('complianceEntities.detail.backToList')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const counters = entity.counters;
  const pendingCount = counters.pending;
  const isIndividual = entity.type === 'Individual';
  const HeaderIcon = isIndividual ? User : Building2;
  const sources = Array.from(new Set(matches.map((mt) => mt.source)));

  const goToMatches = (filter: MatchFilter, category?: AlertListCategory) => {
    setActiveTab('matches');
    setRequestedFilter((prev) => ({ filter, category, seq: (prev?.seq ?? 0) + 1 }));
  };

  const handleTreatPending = () => {
    setActiveTab('matches');
    setFocusPendingSignal((n) => n + 1);
  };

  const handleCopyId = async () => {
    const ok = await copyToClipboard(entity.uid);
    if (ok) {
      setCopied(true);
      toast.success(t('complianceEntities.list.toast.idCopied'), { description: entity.uid });
      window.setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error(t('complianceEntities.list.toast.copyError'), {
        description: t('complianceEntities.list.toast.copyErrorBody'),
      });
    }
  };

  const handleRerun = () => {
    setRerunning(true);
    window.setTimeout(() => {
      const result = rerunScreening(entity.id);
      setRerunning(false);
      toast.success(t('complianceEntities.toast.rerun'), {
        description: t('complianceEntities.toast.rerunBody', { count: result.matchesFound }),
      });
    }, 900);
  };

  const handleMonitoring = (value: boolean) => {
    toggleMonitoring(entity.id, value);
    toast.success(value ? t('complianceEntities.toast.monitoringOn') : t('complianceEntities.toast.monitoringOff'));
  };

  const handleAnalyst = (name: string) => {
    assignAnalyst(entity.id, name);
    toast.success(t('complianceEntities.toast.analystAssigned'), {
      description: t('complianceEntities.toast.analystAssignedBody', { name }),
    });
  };

  const handleClose = () => {
    closeEntity(entity.id);
    setCloseDialogOpen(false);
    toast.success(t('complianceEntities.toast.closed'));
  };

  const handleReopen = () => {
    reopenEntity(entity.id);
    toast.success(t('complianceEntities.toast.reopened'));
  };

  const handleReport = () => {
    const result = openEntityReport({
      entity,
      matches,
      t,
      lang,
      generatedBy: { name: CURRENT_USER.name, email: CURRENT_USER.email },
    });
    if (!result.ok) {
      toast.error(t('complianceEntities.report.toast.popupBlocked'), {
        description: t('complianceEntities.report.toast.popupBlockedBody'),
      });
      return;
    }
    logEntityEvent(entity.id, 'report', 'report', result.reference);
    toast.success(t('complianceEntities.report.toast.generated'), {
      description: t('complianceEntities.report.toast.generatedBody'),
    });
  };

  const handleExportAudit = () => {
    exportEntityAuditCsv(entity, t, lang);
    logEntityEvent(entity.id, 'export', 'export', t('complianceEntities.detail.actions.exportAudit'));
    toast.success(t('complianceEntities.report.toast.auditExported'));
  };

  const handleExportMatches = () => {
    exportEntityMatchesCsv(entity, matches, t, lang);
    logEntityEvent(entity.id, 'export', 'export', t('complianceEntities.detail.actions.exportMatches'));
    toast.success(t('complianceEntities.report.toast.matchesExported'));
  };

  const counterRows: Array<{ key: MatchOpenStatus; label: string; value: number; tone: string }> = [
    { key: 'todo', label: t('complianceEntities.detail.rail.todo'), value: counters.todo, tone: 'var(--warning)' },
    { key: 'unsure', label: t('complianceEntities.detail.rail.unsure'), value: counters.unsure, tone: 'var(--warning)' },
    { key: 'confirmed', label: t('complianceEntities.detail.rail.confirmed'), value: counters.confirmed, tone: 'var(--danger)' },
    { key: 'rejected', label: t('complianceEntities.detail.rail.rejected'), value: counters.rejected, tone: 'var(--success)' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-muted/30">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-5 border-b border-border bg-card"
      >
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex items-start gap-4 min-w-0">
            <Button variant="ghost" size="sm" onClick={onBack} aria-label={t('complianceEntities.detail.back')} className="mt-1">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Avatar className="size-12 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary">
                <HeaderIcon className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-semibold text-foreground tracking-tight truncate">{entity.name}</h1>
                <Badge variant="secondary" className="text-xs">
                  {t(ENTITY_TYPE_KEY[entity.type])}
                </Badge>
                <StatusBadge label={t(ENTITY_STATUS_KEY[entity.status])} variant={ENTITY_STATUS_VARIANT[entity.status]} />
                <StatusBadge label={t(RISK_KEY[entity.riskLevel])} variant={RISK_VARIANT[entity.riskLevel]} />
              </div>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-muted-foreground">
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                  title={t('complianceEntities.list.copyId')}
                >
                  {t('complianceEntities.list.idLabel')} {entity.uid}
                  {copied ? <Check className="w-3 h-3" style={{ color: 'var(--success)' }} /> : <Copy className="w-3 h-3" />}
                </button>
                <Separator orientation="vertical" className="h-4" />
                <span>
                  {t('complianceEntities.detail.providerRef')} {entity.providerRef}
                </span>
                <Separator orientation="vertical" className="h-4" />
                <button
                  type="button"
                  onClick={() => openParentPage(entity.parent, t)}
                  className="inline-flex items-center gap-1 hover:text-foreground hover:underline transition-colors"
                >
                  <Link2 className="w-3 h-3" />
                  {t(PARENT_TYPE_KEY[entity.parent.type])} · {entity.parent.name}
                </button>
                <Separator orientation="vertical" className="h-4" />
                <button
                  type="button"
                  onClick={openDossierPage}
                  className="inline-flex items-center gap-1 hover:text-foreground hover:underline transition-colors"
                >
                  <FileText className="w-3 h-3" />
                  {entity.dossierRef}
                </button>
                <Separator orientation="vertical" className="h-4" />
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {t('complianceEntities.list.columns.updated')} {formatRelativeTime(entity.lastUpdate.timestamp, t)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button variant="secondary" size="sm" onClick={handleRerun} disabled={rerunning || entity.closed} className="gap-2">
              <RefreshCw className={`w-4 h-4 ${rerunning ? 'animate-spin' : ''}`} />
              {rerunning ? t('complianceEntities.detail.actions.rerunning') : t('complianceEntities.detail.actions.rerun')}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  {t('complianceEntities.detail.actions.export')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleReport} className="cursor-pointer gap-2">
                  <FileDown className="w-4 h-4" />
                  {t('complianceEntities.detail.actions.exportReport')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExportAudit} className="cursor-pointer gap-2">
                  <History className="w-4 h-4" />
                  {t('complianceEntities.detail.actions.exportAudit')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportMatches} className="cursor-pointer gap-2">
                  <TableIcon className="w-4 h-4" />
                  {t('complianceEntities.detail.actions.exportMatches')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {entity.closed ? (
              <Button variant="secondary" size="sm" onClick={handleReopen} className="gap-2">
                <LockOpen className="w-4 h-4" />
                {t('complianceEntities.detail.actions.reopen')}
              </Button>
            ) : (
              <Button variant="danger" size="sm" onClick={() => setCloseDialogOpen(true)} className="gap-2">
                <Lock className="w-4 h-4" />
                {t('complianceEntities.detail.actions.close')}
              </Button>
            )}

            {pendingCount > 0 && !entity.closed && (
              <Button variant="primary" size="sm" onClick={handleTreatPending} className="gap-2">
                <ShieldCheck className="w-4 h-4" />
                {t('complianceEntities.detail.actions.treatPending', { count: pendingCount })}
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Banners */}
      {entity.closed ? (
        <div className="px-6 pt-5">
          <div className="rounded-xl border border-border bg-muted px-4 py-3 flex items-start gap-3">
            <Lock className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">{t('complianceEntities.detail.closedBanner.title')}</p>
              <p className="text-sm text-muted-foreground">{t('complianceEntities.detail.closedBanner.body')}</p>
            </div>
          </div>
        </div>
      ) : pendingCount > 0 ? (
        <div className="px-6 pt-5">
          <div
            className="rounded-xl border px-4 py-3 flex items-start gap-3"
            style={{
              backgroundColor: 'var(--warning-soft)',
              borderColor: 'color-mix(in oklab, var(--warning) 35%, transparent)',
            }}
          >
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--warning)' }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {pendingCount === 1
                  ? t('complianceEntities.detail.banner.titleOne')
                  : t('complianceEntities.detail.banner.title', { count: pendingCount })}
              </p>
              <p className="text-sm text-muted-foreground">{t('complianceEntities.detail.banner.body')}</p>
            </div>
            <Button size="sm" onClick={handleTreatPending} className="shrink-0">
              {t('complianceEntities.detail.banner.cta')}
            </Button>
          </div>
        </div>
      ) : null}

      {/* Body */}
      <div className="flex-1 px-6 py-6">
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DetailTab)}>
              <TabsList className="h-auto p-1 flex flex-wrap gap-1 bg-muted">
                <TabsTrigger value="summary" className="gap-2">
                  <User className="w-4 h-4" /> {t('complianceEntities.detail.tabs.summary')}
                </TabsTrigger>
                <TabsTrigger value="matches" className="gap-2">
                  <ShieldAlert className="w-4 h-4" /> {t('complianceEntities.detail.tabs.matches')}
                  <Badge variant="secondary" className="text-[10px] px-1.5">
                    {counters.total}
                  </Badge>
                  {pendingCount > 0 && (
                    <span
                      className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-semibold px-1 text-primary-foreground"
                      style={{ backgroundColor: 'var(--danger)' }}
                    >
                      {pendingCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="relations" className="gap-2">
                  <Network className="w-4 h-4" /> {t('complianceEntities.detail.tabs.relations')}
                </TabsTrigger>
                <TabsTrigger value="audit" className="gap-2">
                  <History className="w-4 h-4" /> {t('complianceEntities.detail.tabs.audit')}
                  <Badge variant="secondary" className="text-[10px] px-1.5">
                    {entity.auditTrail.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="mt-4">
                <EntitySummaryTab
                  entity={entity}
                  matches={matches}
                  onOpenAudit={() => setActiveTab('audit')}
                  onOpenMatches={(category) => goToMatches('all', category)}
                />
              </TabsContent>

              <TabsContent value="matches" className="mt-4">
                <EntityMatchesTab
                  entity={entity}
                  matches={matches}
                  requestedFilter={requestedFilter}
                  focusPendingSignal={focusPendingSignal}
                />
              </TabsContent>

              <TabsContent value="relations" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t('complianceEntities.relations.title')}</CardTitle>
                    <CardDescription>{t('complianceEntities.relations.hint')}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => openParentPage(entity.parent, t)}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 text-left hover:bg-muted/40 transition-colors group"
                    >
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">{t('complianceEntities.relations.parent')}</p>
                        <p className="text-sm font-medium text-foreground truncate group-hover:underline">{entity.parent.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t(PARENT_TYPE_KEY[entity.parent.type])} · {t(ROLE_KEY[entity.relation])}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                    </button>
                    <button
                      type="button"
                      onClick={openDossierPage}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 text-left hover:bg-muted/40 transition-colors group"
                    >
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">{t('complianceEntities.relations.dossier')}</p>
                        <p className="text-sm font-medium text-foreground truncate group-hover:underline">{entity.dossierRef}</p>
                        <p className="text-xs text-muted-foreground">{t('complianceEntities.relations.openDossier')}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                    </button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t('complianceEntities.relations.graph')}</CardTitle>
                    <CardDescription>{t('complianceEntities.relations.graphHint')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RelationsGraph />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="audit" className="mt-4">
                <EntityAuditTab entity={entity} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right rail */}
          <aside className="space-y-4 lg:sticky lg:top-6 self-start">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('complianceEntities.detail.rail.decisions')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {counterRows.map((row) => (
                  <button
                    key={row.key}
                    type="button"
                    onClick={() => goToMatches(row.key)}
                    className="w-full flex items-center justify-between gap-3 rounded-md px-2 py-1.5 hover:bg-muted/50 transition-colors"
                  >
                    <span className="flex items-center gap-2 text-sm text-foreground">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: row.tone }} />
                      {row.label}
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-foreground">{row.value}</span>
                  </button>
                ))}
                <Separator className="my-2" />
                <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
                  <span>{t('complianceEntities.matches.cards.allMetric')}</span>
                  <span className="font-semibold tabular-nums text-foreground">{counters.total}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('complianceEntities.detail.rail.risk')}</CardTitle>
                <CardDescription>{t('complianceEntities.detail.rail.riskHint')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <StatusBadge label={t(RISK_KEY[entity.riskLevel])} variant={RISK_VARIANT[entity.riskLevel]} />
                <Button variant="link" size="sm" onClick={openDossierPage} className="px-0 gap-1.5 h-auto">
                  {t('complianceEntities.detail.rail.riskLink')}
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('complianceEntities.detail.rail.tracking')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">{t('complianceEntities.detail.rail.analyst')}</p>
                  <AnalystSelector currentAnalyst={entity.analyst} onAnalystChange={handleAnalyst} />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-foreground">{t('complianceEntities.detail.rail.monitoring')}</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <Switch checked={entity.monitoring} disabled={entity.closed} onCheckedChange={handleMonitoring} />
                        {entity.monitoring ? (
                          <Eye className="w-4 h-4 text-primary" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {entity.monitoring
                        ? t('complianceEntities.detail.rail.monitoringOn')
                        : t('complianceEntities.detail.rail.monitoringOff')}
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Separator />
                <dl className="space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">{t('complianceEntities.detail.rail.provider')}</dt>
                    <dd className="font-medium text-foreground">{entity.provider}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">{t('complianceEntities.detail.rail.source')}</dt>
                    <dd className="flex items-center gap-1 flex-wrap justify-end">
                      {sources.length === 0 ? (
                        <span className="text-muted-foreground">-</span>
                      ) : (
                        sources.map((s) => (
                          <Badge key={s} variant="secondary" className="text-[11px]">
                            {s}
                          </Badge>
                        ))
                      )}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">{t('complianceEntities.detail.rail.lastScreening')}</dt>
                    <dd className="font-medium text-foreground text-right">{formatDateTime(entity.lastScreening, lang)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">{t('complianceEntities.detail.createdAt')}</dt>
                    <dd className="font-medium text-foreground text-right">{formatDateTime(entity.createdAt, lang)}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('complianceEntities.detail.rail.quickActions')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full gap-2" onClick={handleReport}>
                  <FileDown className="w-4 h-4" />
                  {t('complianceEntities.detail.actions.exportReport')}
                </Button>
                {pendingCount > 0 && !entity.closed && (
                  <Button variant="secondary" className="w-full gap-2" onClick={handleTreatPending}>
                    <ShieldCheck className="w-4 h-4" />
                    {t('complianceEntities.detail.actions.treatPending', { count: pendingCount })}
                  </Button>
                )}
                <Button variant="secondary" className="w-full gap-2" onClick={() => goToMatches('all')}>
                  <ShieldAlert className="w-4 h-4" />
                  {t('complianceEntities.detail.actions.viewMatches')}
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      <AlertDialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('complianceEntities.detail.closeDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('complianceEntities.detail.closeDialog.body')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('complianceEntities.detail.closeDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleClose}>{t('complianceEntities.detail.closeDialog.confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
