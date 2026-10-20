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
import type { CapitalCallRights } from '../../utils/capitalCallActions';
import {
  CapitalCallLine,
  expireStaleNotices,
  noticeAvailable,
  noticeFailed,
  relaunchFailedNotices,
} from '../../utils/capitalCallLines';
import { generateCapitalCallEmails } from '../../utils/capitalCallEmails';
import { summarizeCall } from '../../utils/capitalCallSummary';
import { CheckIndicator } from '../CheckIndicator';
import { CALL_STATE_VARIANT, CapitalCallSummaryWidgets, LinesPreset } from './CapitalCallSummaryWidgets';
import { CapitalCallEmailsTab } from './CapitalCallEmailsTab';
import { CapitalCallJournalTab } from './CapitalCallJournalTab';
import { CapitalCallLinesTab } from './CapitalCallLinesTab';
import { ColumnConfig, DataTable } from '../DataTable';
import { EmptyState } from '../EmptyState';
import { StatusBadge } from '../StatusBadge';
import { ListingCard } from '../ui/listing';
import { AttachmentRow } from '../ui/attachment-row';
import { DetailLink } from '../ui/detail-summary';
import { DetailTabsList } from '../ui/detail-tabs';
import { PageHeader, PageHeaderSubtitle, PageHeaderSubtitleItem, PageHeaderSubtitleSeparator } from '../ui/page-header';
import { SectionCard } from '../ui/section-card';
import { Tabs, TabsContent } from '../ui/tabs';

const K = 'funds.capitalCalls.detail';

type TabId = 'lines' | 'emails' | 'breakdown' | 'message' | 'journal';

interface CapitalCallDetailPageProps {
  call: CapitalCall;
  /** Lignes portées par la page : la fiche les met à jour et les remonte au listing. */
  initialLines: CapitalCallLine[];
  onLinesChange: (lines: CapitalCallLine[]) => void;
  rights: CapitalCallRights;
  onOpenFund: (fundId: number) => void;
}

/** Utilisateur connecté de la maquette, affiché dans l'en-tête. */
const CURRENT_USER = 'Jean Dault';

/** Durée simulée de production d'un avis. */
const PRODUCTION_DELAY = 3000;

export function CapitalCallDetailPage({ call, initialLines, onLinesChange, rights, onOpenFund }: CapitalCallDetailPageProps) {
  const { t, lang } = useTranslation();
  const [tab, setTab] = useState<TabId>('lines');
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
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

  const rows = call.shares.map((share, index) => ({ ...share, id: index + 1 }));
  const breakdownColumns: ColumnConfig<CapitalCallShare & { id: number }>[] = [
    {
      key: 'share',
      label: t(`${K}.breakdown.columns.share`),
      render: row => <span className="text-sm font-medium">{t('funds.detail.sharePrefix', { name: row.share })}</span>,
    },
    {
      key: 'mode',
      label: t(`${K}.breakdown.columns.mode`),
      render: row => <span className="text-sm">{t(`${K}.breakdown.modes.${row.mode}`)}</span>,
    },
    {
      key: 'value',
      label: t(`${K}.breakdown.columns.value`),
      align: 'right',
      render: row => <span className="text-sm">{enteredValue(row)}</span>,
    },
    {
      key: 'entryFees',
      label: t(`${K}.breakdown.columns.entryFees`),
      render: row => (
        <CheckIndicator
          checked={row.entryFeesCalled}
          checkedLabel={t(`${K}.breakdown.called`)}
          uncheckedLabel={t(`${K}.breakdown.notCalled`)}
        />
      ),
    },
    {
      key: 'premium',
      label: t(`${K}.breakdown.columns.premium`),
      render: row => (
        <CheckIndicator
          checked={row.premiumCalled}
          checkedLabel={t(`${K}.breakdown.called`)}
          uncheckedLabel={t(`${K}.breakdown.notCalled`)}
        />
      ),
    },
    {
      key: 'released',
      label: t(`${K}.breakdown.columns.released`),
      align: 'right',
      render: row => (row.releasedAmount > 0 ? <span className="text-sm">{money(row.releasedAmount)}</span> : empty),
    },
    {
      key: 'restriction',
      label: t(`${K}.breakdown.columns.restriction`),
      render: row => (
        <span className="text-sm">
          {row.restrictedTo === null
            ? t(`${K}.breakdown.noRestriction`)
            : t(row.restrictedTo === 1 ? `${K}.breakdown.restrictedOne` : `${K}.breakdown.restrictedMany`, {
                count: row.restrictedTo,
              })}
        </span>
      ),
    },
  ];

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
              icon={summary.state === 'sending' || summary.state === 'noticesGenerating' ? Loader2 : undefined}
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

      <div className="border-b border-border bg-card px-8 pb-6">
        <CapitalCallSummaryWidgets
          summary={summary}
          currency={call.currency}
          publication={call.publication}
          onOpenLines={openLines}
          onOpenFailedEmails={() => {
            setEmailsPreset({ values: ['failed', 'spam', 'notFound'], nonce: Date.now() });
            setTab('emails');
          }}
        />
      </div>

      <Tabs value={tab} onValueChange={value => setTab(value as TabId)} className="w-full gap-0">
        <div className="border-b border-border bg-card px-8">
          <DetailTabsList
            overflow="scroll"
            items={[
              { value: 'lines', icon: Users, label: t(`${K}.tabs.lines`), badge: call.lines },
              ...(hasEmails ? [{ value: 'emails', icon: Send, label: t(`${K}.tabs.emails`), badge: emails.length }] : []),
              { value: 'breakdown', icon: Layers, label: t(`${K}.tabs.breakdown`), badge: call.shares.length },
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
          <TabsContent value="breakdown">
            <ListingCard>
              <DataTable
                data={rows}
                columns={breakdownColumns}
                hoveredRow={hoveredRow}
                setHoveredRow={setHoveredRow}
                onRowClick={() => undefined}
                sortConfig={null}
                onSort={() => undefined}
                compactMode
                hideSelection
              />
            </ListingCard>
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
