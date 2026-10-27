import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner@2.0.3';
import {
  ArrowDownCircle,
  Calendar,
  CalendarClock,
  Coins,
  FileText,
  History,
  Landmark,
  Layers,
  Loader2,
  Mail,
  MessageSquareText,
  Paperclip,
  Tag,
  Send,
  TrendingDown,
  Users,
} from 'lucide-react';

import { useTranslation } from '../../utils/languageContext';
import { CapitalCall, CapitalCallShare, distinctNoticeDate } from '../../utils/capitalCallGenerator';
import type { CapitalCallAction, CapitalCallRights } from '../../utils/capitalCallActions';
import {
  CapitalCallLine,
  expireStaleNotices,
  noticeAvailable,
  noticeFailed,
  relaunchFailedNotices,
} from '../../utils/capitalCallLines';
import { generateCapitalCallEmails } from '../../utils/capitalCallEmails';
import { CALL_STAGES, callStage, summarizeCall } from '../../utils/capitalCallSummary';
import { CALL_STATE_VARIANT, CapitalCallSummaryWidgets, LinesPreset } from './CapitalCallSummaryWidgets';
import { CapitalCallEmailsTab } from './CapitalCallEmailsTab';
import { CapitalCallJournalTab } from './CapitalCallJournalTab';
import { CapitalCallLinesTab } from './CapitalCallLinesTab';
import { EmptyState } from '../EmptyState';
import { StatusBadge } from '../StatusBadge';
import { FilterCard, FilterCardGroup } from '../ui/filter-card';
import { AttachmentRow } from '../ui/attachment-row';
import { DetailLink } from '../ui/detail-summary';
import { DetailTabsList } from '../ui/detail-tabs';
import { PageHeader, PageHeaderSubtitle, PageHeaderSubtitleItem, PageHeaderSubtitleSeparator } from '../ui/page-header';
import { SectionCard } from '../ui/section-card';
import { Tabs, TabsContent } from '../ui/tabs';
import { Button } from '../ui/button';
import { DisabledReason } from '../ui/disabled-reason';
import { ProcessStepsBar } from '../ui/wizard-steps';

const K = 'funds.capitalCalls.detail';

type TabId = 'lines' | 'emails' | 'message' | 'journal';

interface CapitalCallDetailPageProps {
  call: CapitalCall;
  /** Lignes portées par la page : la fiche les met à jour et les remonte au listing. */
  initialLines: CapitalCallLine[];
  onLinesChange: (lines: CapitalCallLine[]) => void;
  rights: CapitalCallRights;
  onOpenFund: (fundId: number) => void;
  /** Action lancée depuis l'étape en cours, contrôlée comme depuis le listing. */
  onRunAction: (action: CapitalCallAction) => void;
  /** Motif d'indisponibilité d'une action, calculé par le serveur. */
  actionBlocker: (action: CapitalCallAction) => string | null;
}

/** Utilisateur connecté de la maquette, affiché dans l'en-tête. */
const CURRENT_USER = 'Jean Dault';

/** Durée simulée de production d'un avis. */
const PRODUCTION_DELAY = 3000;

export function CapitalCallDetailPage({
  call,
  initialLines,
  onLinesChange,
  rights,
  onOpenFund,
  onRunAction,
  actionBlocker,
}: CapitalCallDetailPageProps) {
  const { t, lang } = useTranslation();
  const [tab, setTab] = useState<TabId>('lines');
  // Le délai maximal est contrôlé à l'ouverture de la fiche.
  const [lines, setLines] = useState<CapitalCallLine[]>(() => expireStaleNotices(initialLines));
  const [linesPreset, setLinesPreset] = useState<(LinesPreset & { nonce: number }) | null>(null);
  const [emailsPreset, setEmailsPreset] = useState<{ values: string[]; nonce: number } | null>(null);

  useEffect(() => {
    onLinesChange(lines);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines]);
  const scheduled = useRef(new Set<string>());
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(id => window.clearTimeout(id)), []);

  // Production simulée : chaque avis en génération aboutit à un état connu.
  useEffect(() => {
    lines.forEach(line => {
      if (line.noticeState !== 'generating' || !line.noticeRequestedAt) return;
      const key = `${line.id}-${line.noticeRequestedAt.getTime()}`;
      if (scheduled.current.has(key)) return;
      scheduled.current.add(key);
      const templateMissing = line.combinedNotice && line.noticeFailureReason === 'combinedTemplateMissing';
      const succeeds = !templateMissing && Math.random() > 0.25;
      timers.current.push(
        window.setTimeout(() => {
          setLines(prev =>
            prev.map(item => {
              if (item.id !== line.id || item.noticeState !== 'generating') return item;
              if (templateMissing) return noticeFailed(item, 'combinedTemplateMissing');
              return succeeds ? noticeAvailable(item) : noticeFailed(item, 'productionError');
            }),
          );
        }, PRODUCTION_DELAY + Math.random() * 2000),
      );
    });
  }, [lines]);

  // Fin d'envoi : les lignes encore à notifier passent à l'état notifié.
  useEffect(() => {
    if (call.sending || call.notifiedLines < call.lines) return;
    setLines(prev =>
      prev.some(line => line.notifiedAt === null)
        ? prev.map(line => (line.notifiedAt ? line : { ...line, notifiedAt: new Date(), state: 'notified' }))
        : prev,
    );
  }, [call.sending, call.notifiedLines, call.lines]);

  const failedCount = lines.filter(line => line.noticeState === 'failed').length;
  const emails = useMemo(() => generateCapitalCallEmails(call.id, lines), [call.id, lines]);
  const summary = useMemo(() => summarizeCall(call, lines, emails), [call, lines, emails]);

  const openLines = (preset: LinesPreset | null) => {
    setLinesPreset(preset ? { ...preset, nonce: Date.now() } : { filter: 'noticeState', values: [], nonce: Date.now() });
    setTab('lines');
  };
  // L'onglet Envois apparaît dès le premier envoi de l'appel.
  const hasEmails = emails.length > 0;
  const relaunchReason = call.sending
    ? t('funds.capitalCalls.blockers.sending')
    : !rights.manage
      ? t('funds.capitalCalls.blockers.missingRight')
      : failedCount === 0
        ? t(`${K}.lines.relaunch.noneFailed`)
        : null;

  const relaunchFailed = () => {
    if (relaunchReason) {
      toast.error(t(`${K}.lines.relaunch.refused`), { description: relaunchReason });
      return;
    }
    setLines(prev => relaunchFailedNotices(prev, CURRENT_USER));
    toast.info(t(failedCount === 1 ? `${K}.lines.relaunch.startedOne` : `${K}.lines.relaunch.startedMany`, { count: failedCount }));
  };

  const dateFormat = new Intl.DateTimeFormat(lang, { day: '2-digit', month: '2-digit', year: 'numeric' });
  const money = (value: number, digits = 0) =>
    new Intl.NumberFormat(lang, {
      style: 'currency',
      currency: call.currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  const percent = (value: number) =>
    new Intl.NumberFormat(lang, { style: 'percent', maximumFractionDigits: 2 }).format(value / 100);
  const noticeDate = distinctNoticeDate(call);
  const empty = <span className="text-muted-foreground">-</span>;

  const notInMockup = (name: string) => toast.info(t(`${K}.toast.notInMockup`, { name }));

  const enteredValue = (share: CapitalCallShare) => {
    if (share.mode === 'percent') return percent(share.value);
    if (share.mode === 'perUnit') return t(`${K}.breakdown.perUnitValue`, { amount: money(share.value, 2) });
    return money(share.value);
  };

  const stage = callStage(call, summary);
  // Une étape close est franchie : la dernière étape atteinte est cochée elle aussi.
  const stageIndex = stage === 'closed' ? CALL_STAGES.length : CALL_STAGES.indexOf(stage);
  const stageButton = (action: CapitalCallAction, label: string, variant: 'default' | 'outline' = 'default') => {
    const reason = actionBlocker(action);
    return (
      <DisabledReason reason={reason}>
        <Button size="sm" variant={variant} onClick={() => onRunAction(action)} disabled={Boolean(reason)}>
          {label}
        </Button>
      </DisabledReason>
    );
  };
  const stageDescription = {
    notices: t(`${K}.stages.notices.description`, { done: summary.noticesAvailable + summary.noticesReplaced, total: summary.lines }),
    diffusion: call.sending
      ? t(`${K}.stages.diffusion.sending`)
      : t(`${K}.stages.diffusion.description`, { count: summary.toNotify, total: summary.lines }),
    settlement: t(`${K}.stages.settlement.description`, {
      count: summary.lines - summary.settled,
      total: summary.lines,
      amount: money(summary.remainingDue, 2),
    }),
    closed: t(`${K}.stages.closed.description`, { total: summary.lines }),
  }[stage];
  const stageAction = {
    notices: null,
    diffusion: stageButton('notify', t(`${K}.stages.diffusion.action`, { count: summary.toNotify })),
    settlement: (
      <>
        {call.diffusion.notify && stageButton('relaunch', t(`${K}.stages.settlement.relaunch`), 'outline')}
        <Button size="sm" onClick={() => openLines({ filter: 'settlement', values: ['paymentDeclared', 'unpaid'] })}>
          {t(`${K}.stages.settlement.action`)}
        </Button>
      </>
    ),
    closed: null,
  }[stage];

  const allShares = 'all';
  const [activeShare, setActiveShare] = useState(allShares);
  const filterShare = (share: string) => {
    setActiveShare(share);
    setLinesPreset({ filter: 'share', values: share === allShares ? [] : [share], nonce: Date.now() });
    setTab('lines');
  };
  const shareOptions = (share: CapitalCallShare) =>
    [
      share.entryFeesCalled && t(`${K}.breakdown.entryFeesShort`),
      share.premiumCalled && t(`${K}.breakdown.premiumShort`),
      share.releasedAmount > 0 && t(`${K}.breakdown.releasedShort`, { amount: money(share.releasedAmount) }),
      share.restrictedTo !== null &&
        t(share.restrictedTo === 1 ? `${K}.breakdown.restrictedOne` : `${K}.breakdown.restrictedMany`, { count: share.restrictedTo }),
    ].filter(Boolean).join(' · ') || t(`${K}.breakdown.noOption`);

  return (
    <>
      <PageHeader
        hideBackButton
        title={
          <span className="inline-flex items-center gap-3">
            {call.name}
            <StatusBadge
              label={t(`funds.capitalCalls.callStates.${summary.state}`)}
              variant={CALL_STATE_VARIANT[summary.state]}
              icon={summary.state === 'noticesGenerating' ? Loader2 : undefined}
            />
          </span>
        }
        subtitle={
          <PageHeaderSubtitle>
            <DetailLink icon={Landmark} className="text-sm" onClick={() => onOpenFund(call.fundId)}>
              {call.fundName}
            </DetailLink>
            <PageHeaderSubtitleSeparator />
            <PageHeaderSubtitleItem icon={CalendarClock}>
              {t(`${K}.header.dueDate`, { date: dateFormat.format(call.dueDate) })}
            </PageHeaderSubtitleItem>
            {noticeDate && (
              <>
                <PageHeaderSubtitleSeparator />
                <PageHeaderSubtitleItem icon={FileText}>
                  {t(`${K}.header.noticeDate`, { date: dateFormat.format(noticeDate) })}
                </PageHeaderSubtitleItem>
              </>
            )}
            <PageHeaderSubtitleSeparator />
            <PageHeaderSubtitleItem icon={Coins}>
              {t(`${K}.header.calledAmount`, { amount: money(call.calledAmount) })}
            </PageHeaderSubtitleItem>
            <PageHeaderSubtitleSeparator />
            <PageHeaderSubtitleItem icon={Tag}>
              {t(`${K}.header.origin`, { origin: t(`funds.capitalCalls.origins.${call.origin}`) })}
            </PageHeaderSubtitleItem>
            {call.compensations.length > 0 && (
              <>
                <PageHeaderSubtitleSeparator />
                <PageHeaderSubtitleItem icon={ArrowDownCircle}>
                  {t(`${K}.header.compensatedBy`)}
                  {call.compensations.map(item => (
                    <DetailLink key={item.id} className="text-sm" onClick={() => notInMockup(item.name)}>
                      {item.name}
                    </DetailLink>
                  ))}
                </PageHeaderSubtitleItem>
              </>
            )}
            {call.forecast && (
              <>
                <PageHeaderSubtitleSeparator />
                <DetailLink icon={TrendingDown} className="text-sm" onClick={() => notInMockup(call.forecast!.name)}>
                  {call.forecast.name}
                </DetailLink>
              </>
            )}
            <PageHeaderSubtitleSeparator />
            <PageHeaderSubtitleItem icon={Calendar}>
              {t(`${K}.header.createdOn`, { date: dateFormat.format(call.createdAt), author: call.createdBy })}
            </PageHeaderSubtitleItem>
          </PageHeaderSubtitle>
        }
      />

      <ProcessStepsBar
        steps={CALL_STAGES.map(item => t(`${K}.stages.${item}.label`))}
        current={stageIndex}
        ariaLabel={t(`${K}.stages.ariaLabel`)}
        title={t(`${K}.stages.${stage}.title`)}
        description={stageDescription}
        action={stageAction}
      />

      <div className="border-b border-border bg-card px-8 pb-6">
        <CapitalCallSummaryWidgets
          summary={summary}
          currency={call.currency}
          diffusion={call.diffusion}
          onOpenLines={openLines}
          onOpenFailedEmails={() => {
            setEmailsPreset({ values: ['failed', 'spam', 'notFound'], nonce: Date.now() });
            setTab('emails');
          }}
        />
      </div>

      <div className="border-b border-border bg-card px-8 pb-6">
        <FilterCardGroup
          title={t(`${K}.breakdown.title`)}
          hint={t(`${K}.breakdown.hint`)}
          columns={Math.min(6, Math.max(3, call.shares.length + 1)) as 3 | 4 | 5 | 6}
          className="pb-0"
        >
          <FilterCard
            status={allShares}
            activeStatus={activeShare}
            onStatusChange={filterShare}
            label={t(`${K}.breakdown.allShares`)}
            icon={Layers}
            total={lines.length}
            metricLabel={t(`${K}.breakdown.calledTotal`)}
            metricValue={money(call.calledAmount)}
            averageLabel={t(`${K}.breakdown.sharesLabel`)}
            averageValue={String(call.shares.length)}
          />
          {call.shares.map(share => (
            <FilterCard
              key={share.share}
              status={share.share}
              activeStatus={activeShare}
              onStatusChange={filterShare}
              label={t('funds.detail.sharePrefix', { name: share.share })}
              icon={Layers}
              total={lines.filter(line => line.share === share.share).length}
              metricLabel={t(`${K}.breakdown.modesShort.${share.mode}`)}
              metricValue={enteredValue(share)}
              averageLabel={t(`${K}.breakdown.optionsLabel`)}
              averageValue={shareOptions(share)}
            />
          ))}
        </FilterCardGroup>
      </div>

      <Tabs value={tab} onValueChange={value => setTab(value as TabId)} className="w-full gap-0">
        <div className="border-b border-border bg-card px-8">
          <DetailTabsList
            overflow="scroll"
            items={[
              { value: 'lines', icon: Users, label: t(`${K}.tabs.lines`), badge: call.lines },
              ...(hasEmails ? [{ value: 'emails', icon: Send, label: t(`${K}.tabs.emails`), badge: emails.length }] : []),
              { value: 'message', icon: Mail, label: t(`${K}.tabs.message`), badge: call.attachments.length || undefined },
              { value: 'journal', icon: History, label: t(`${K}.tabs.journal`) },
            ]}
          />
        </div>
        <div className="px-8 py-6">
          {hasEmails && (
            <TabsContent value="emails">
              <CapitalCallEmailsTab emails={emails} preset={emailsPreset} />
            </TabsContent>
          )}
          <TabsContent value="lines">
            <CapitalCallLinesTab
              preset={linesPreset}
              call={call}
              lines={lines}
              failedCount={failedCount}
              relaunchDisabledReason={relaunchReason}
              onRelaunchFailed={relaunchFailed}
            />
          </TabsContent>
          <TabsContent value="journal">
            <CapitalCallJournalTab call={call} lines={lines} />
          </TabsContent>
          <TabsContent value="message" className="space-y-4">
            <SectionCard mode="read" icon={MessageSquareText} title={t(`${K}.message.title`)}>
              {call.message ? (
                <p className="whitespace-pre-line px-5 py-4 text-sm text-foreground">{call.message}</p>
              ) : (
                <EmptyState icon={MessageSquareText} title={t(`${K}.message.empty`)} />
              )}
            </SectionCard>
            <SectionCard
              mode="read"
              icon={Paperclip}
              title={t(`${K}.attachments.title`)}
              summary={t(`${K}.attachments.summary`, { count: call.attachments.length })}
            >
              {call.attachments.length === 0 ? (
                <EmptyState icon={Paperclip} title={t(`${K}.attachments.empty`)} />
              ) : (
                <div className="divide-y divide-border px-5">
                  {call.attachments.map(file => (
                    <AttachmentRow
                      key={file.name}
                      name={file.name}
                      size={t(`${K}.attachments.size`, {
                        size: new Intl.NumberFormat(lang, { maximumFractionDigits: 1 }).format(
                          file.sizeKb >= 1000 ? file.sizeKb / 1000 : file.sizeKb,
                        ),
                        unit: file.sizeKb >= 1000 ? t(`${K}.attachments.mb`) : t(`${K}.attachments.kb`),
                      })}
                      downloadLabel={t(`${K}.attachments.download`)}
                      onDownload={() => toast.info(t(`${K}.toast.download`, { name: file.name }))}
                    />
                  ))}
                </div>
              )}
            </SectionCard>
          </TabsContent>
        </div>
      </Tabs>
    </>
  );
}
