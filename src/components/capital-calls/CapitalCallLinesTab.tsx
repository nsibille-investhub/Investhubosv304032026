import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeftRight,
  Ban,
  Banknote,
  CheckCircle2,
  EyeOff,
  Layers,
  Loader2,
  MessageSquareText,
  Repeat,
  RotateCw,
  Scale,
  Users,
} from 'lucide-react';

import { CapitalCallNotificationPanel } from './CapitalCallNotificationPanel';
import { CapitalCallPaymentSheet, LINE_STATE_VARIANT, PaymentSheetResult } from './CapitalCallPaymentSheet';
import { useTranslation } from '../../utils/languageContext';
import type { CapitalCall } from '../../utils/capitalCallGenerator';
import {
  CapitalCallLine,
  LINE_STATES,
  NOTICE_STATES,
  NoticeState,
  balanceOf,
  isPerUnitCall,
  receivedAmount,
  lastFailure,
  relaunchCount,
} from '../../utils/capitalCallLines';
import {
  NOTIFICATION_CATEGORIES,
  SETTLEMENT_CATEGORIES,
  notificationCategoriesOf,
  settlementOf,
} from '../../utils/capitalCallSummary';
import type { LinesPreset } from './CapitalCallSummaryWidgets';
import { ColumnConfig, DataTable } from '../DataTable';
import { EmptyState } from '../EmptyState';
import { FilterBar, FilterConfig } from '../FilterBar';
import { ListingCard, ListingIndicator, ListingNameCell } from '../ui/listing';
import { StatusBadge, StatusVariant } from '../StatusBadge';
import { Button } from '../ui/button';
import { DataPagination } from '../ui/data-pagination';
import { DisabledReason } from '../ui/disabled-reason';
import { ConfirmDialog } from '../ui/confirm-dialog';
import { FormField } from '../ui/form-field';
import { TableRowActions, TableRowAction } from '../ui/row-actions';
import { Textarea } from '../ui/textarea';

const K = 'funds.capitalCalls.detail.lines';

const NOTICE_STATE_VARIANT: Record<NoticeState, StatusVariant> = {
  generating: 'info',
  available: 'success',
  failed: 'danger',
  replaced: 'outline',
};

type ActiveFilters = Record<string, string | string[]>;

interface CapitalCallLinesTabProps {
  call: CapitalCall;
  lines: CapitalCallLine[];
  failedCount: number;
  relaunchDisabledReason: string | null;
  onRelaunchFailed: () => void;
  /** Filtre appliqué depuis un compteur de la synthèse ; sans valeur, tous les filtres sont retirés. */
  preset?: (LinesPreset & { nonce: number }) | null;
  /** Gestes de règlement indisponibles (droit manquant, envoi en cours). */
  actionsDisabledReason: string | null;
  onRecordPayment: (lineId: number, result: PaymentSheetResult) => void;
  onCommentLine: (lineId: number, comment: string) => void;
  onCancelLine: (lineId: number, reason: string) => void;
}

export function CapitalCallLinesTab({
  call,
  lines,
  failedCount,
  relaunchDisabledReason,
  onRelaunchFailed,
  preset,
  actionsDisabledReason,
  onRecordPayment,
  onCommentLine,
  onCancelLine,
}: CapitalCallLinesTabProps) {
  const { t, lang } = useTranslation();
  const perUnit = isPerUnitCall(call);
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!preset) return;
    setSearch('');
    setActiveFilters(preset.values.length > 0 ? { [preset.filter]: preset.values } : {});
    setPage(1);
  }, [preset]);
  const [pageSize, setPageSize] = useState(20);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [paymentLineId, setPaymentLineId] = useState<number | null>(null);
  const [commentDraft, setCommentDraft] = useState<{ lineId: number; text: string } | null>(null);
  const [cancelDraft, setCancelDraft] = useState<{ lineId: number; reason: string } | null>(null);
  const paymentLine = lines.find(line => line.id === paymentLineId) ?? null;
  const commentLine = lines.find(line => line.id === commentDraft?.lineId) ?? null;
  const cancelLine = lines.find(line => line.id === cancelDraft?.lineId) ?? null;

  const dateFormat = new Intl.DateTimeFormat(lang, { day: '2-digit', month: '2-digit', year: 'numeric' });
  const money = (value: number, digits = 2) =>
    new Intl.NumberFormat(lang, {
      style: 'currency',
      currency: call.currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  const integer = new Intl.NumberFormat(lang);
  const empty = <span className="text-muted-foreground">-</span>;
  const date = (value: Date | null) =>
    value ? <span className="text-sm tabular-nums">{dateFormat.format(value)}</span> : empty;

  const filterConfigs: FilterConfig[] = [
    {
      id: 'state',
      label: t(`${K}.filters.state`),
      type: 'multiselect',
      isPrimary: true,
      options: LINE_STATES.map(value => ({ value, label: t(`${K}.states.${value}`) })),
    },
    {
      id: 'noticeState',
      label: t(`${K}.filters.noticeState`),
      type: 'multiselect',
      isPrimary: true,
      options: NOTICE_STATES.map(value => ({ value, label: t(`${K}.noticeStates.${value}`) })),
    },
    {
      id: 'share',
      label: t(`${K}.filters.share`),
      type: 'multiselect',
      isPrimary: true,
      options: call.shares.map(item => ({ value: item.share, label: t('funds.detail.sharePrefix', { name: item.share }) })),
    },
    {
      id: 'notification',
      label: t(`${K}.filters.notification`),
      type: 'multiselect',
      isPrimary: false,
      options: NOTIFICATION_CATEGORIES.map(value => ({ value, label: t(`${K}.notificationCategories.${value}`) })),
    },
    {
      id: 'settlement',
      label: t(`${K}.filters.settlement`),
      type: 'multiselect',
      isPrimary: false,
      options: SETTLEMENT_CATEGORIES.map(value => ({ value, label: t(`${K}.settlementCategories.${value}`) })),
    },
  ];

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const pick = (id: string) => (Array.isArray(activeFilters[id]) ? (activeFilters[id] as string[]) : []);
    const states = pick('state');
    const noticeStates = pick('noticeState');
    const shares = pick('share');
    const notification = pick('notification');
    const settlement = pick('settlement');
    return lines.filter(line => {
      if (notification.length > 0 && !notificationCategoriesOf(line).some(item => notification.includes(item))) return false;
      if (settlement.length > 0 && !settlement.includes(settlementOf(line))) return false;
      if (term && !line.investor.toLowerCase().includes(term)) return false;
      if (states.length > 0 && !states.includes(line.state)) return false;
      if (noticeStates.length > 0 && !noticeStates.includes(line.noticeState)) return false;
      if (shares.length > 0 && !shares.includes(line.share)) return false;
      return true;
    });
  }, [lines, search, activeFilters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const sum = (key: 'calledAmount' | 'fees' | 'premium' | 'total') =>
    filtered.reduce((total, line) => total + line[key], 0);
  const receivedTotal = filtered.reduce((total, line) => total + receivedAmount(line), 0);
  const balanceTotal = filtered
    .filter(line => line.state !== 'cancelled')
    .reduce((total, line) => total + Math.max(0, balanceOf(line)), 0);

  const resetFilters = () => {
    setSearch('');
    setActiveFilters({});
    setPage(1);
  };

  const handleFilterChange = (filterId: string, value: string | string[] | null) => {
    setActiveFilters(prev => {
      const next = { ...prev };
      if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) delete next[filterId];
      else next[filterId] = value;
      return next;
    });
    setPage(1);
  };

  const dateTime = (value: Date) =>
    t(`${K}.dateTime`, {
      date: dateFormat.format(value),
      time: new Intl.DateTimeFormat(lang, { hour: '2-digit', minute: '2-digit' }).format(value),
    });

  const noticeTooltip = (line: CapitalCallLine) => {
    const failure = lastFailure(line);
    const relaunches = relaunchCount(line);
    const parts: string[] = [];
    if (line.noticeState === 'failed' && line.noticeFailureReason) {
      parts.push(
        t(`${K}.noticeTooltip.failed`, {
          reason: t(`${K}.failureReasons.${line.noticeFailureReason}`),
          at: failure ? dateTime(failure.at) : '',
        }),
      );
    }
    if (line.noticeState === 'generating' && line.noticeRequestedAt) {
      parts.push(t(`${K}.noticeTooltip.requested`, { at: dateTime(line.noticeRequestedAt) }));
    }
    if (line.noticeState === 'replaced') {
      parts.push(t(`${K}.noticeTooltip.replaced`));
      if (failure?.reason) {
        parts.push(t(`${K}.noticeTooltip.previousFailure`, { reason: t(`${K}.failureReasons.${failure.reason}`) }));
      }
    }
    if (relaunches > 0 && line.noticeState !== 'available') {
      parts.push(t(relaunches === 1 ? `${K}.noticeTooltip.relaunchedOne` : `${K}.noticeTooltip.relaunchedMany`, { count: relaunches }));
    }
    return parts.length > 0 ? parts.join(' · ') : null;
  };

  const lineStateTooltip = (line: CapitalCallLine) => {
    if (line.state === 'cancelled' && line.cancellation) {
      return t(`${K}.cancelledTooltip`, { reason: line.cancellation.value, author: line.cancellation.by });
    }
    if (line.state === 'partiallyPaid') {
      return t(line.payments.length === 1 ? `${K}.partialTooltipOne` : `${K}.partialTooltipMany`, {
        received: money(receivedAmount(line)),
        total: money(line.total),
        count: line.payments.length,
      });
    }
    if (line.state === 'overpaid') {
      return t(`${K}.overpaidTooltip`, {
        amount: money(-balanceOf(line)),
        treatment: line.overpaymentTreatment
          ? t(`${K}.treatments.${line.overpaymentTreatment.value}`)
          : t(`${K}.treatments.undecided`),
      });
    }
    return line.state === 'paid' && line.paymentOrigin
      ? t(`${K}.paidTooltip`, {
          origin: t(`${K}.paymentOrigins.${line.paymentOrigin}`),
          date: line.paidAt ? dateFormat.format(line.paidAt) : '',
        })
      : null;
  };

  const rowActions = (line: CapitalCallLine): TableRowAction[] => {
    const cancelled = line.state === 'cancelled';
    const paymentReason =
      actionsDisabledReason ??
      (cancelled ? t(`${K}.actions.cancelledReason`) : line.state === 'paid' ? t(`${K}.actions.settledReason`) : undefined);
    const actions: TableRowAction[] = [
      {
        label: t(`${K}.actions.recordPayment`),
        icon: Banknote,
        intent: 'success',
        disabledReason: paymentReason ?? undefined,
        onClick: () => setPaymentLineId(line.id),
      },
      {
        label: line.comment ? t(`${K}.actions.editComment`) : t(`${K}.actions.comment`),
        icon: MessageSquareText,
        disabledReason: actionsDisabledReason ?? undefined,
        onClick: () => setCommentDraft({ lineId: line.id, text: line.comment?.value ?? '' }),
      },
    ];
    if (line.state === 'overpaid') {
      actions.push({
        label: t(`${K}.actions.treatOverpayment`),
        icon: Scale,
        disabledReason: actionsDisabledReason ?? undefined,
        onClick: () => setPaymentLineId(line.id),
      });
    }
    actions.push({
      label: t(`${K}.actions.cancelLine`),
      icon: Ban,
      intent: 'danger',
      separatorBefore: true,
      disabledReason:
        actionsDisabledReason ??
        (cancelled
          ? t(`${K}.actions.cancelledReason`)
          : line.payments.length > 0
            ? t(`${K}.actions.cancelWithPaymentsReason`)
            : undefined),
      onClick: () => setCancelDraft({ lineId: line.id, reason: '' }),
    });
    return actions;
  };

  const indicators = (line: CapitalCallLine) =>
    (
      [
        [Boolean(line.comment), MessageSquareText, 'comment'],
        [line.combinedNotice, Layers, 'combinedNotice'],
        [line.compensated, ArrowLeftRight, 'compensated'],
        [line.transferred, Repeat, 'transferred'],
        [line.hiddenOnPortal, EyeOff, 'hiddenOnPortal'],
      ] as const
    ).filter(([active]) => active);

  const columns: ColumnConfig<CapitalCallLine>[] = [
    {
      key: 'investor',
      label: t(`${K}.columns.investor`),
      render: (line, term) => (
        <ListingNameCell
          name={line.investor}
          searchTerm={term}
          adornment={indicators(line).map(([, Icon, key]) => (
            <ListingIndicator
              key={key}
              icon={Icon}
              label={key === 'comment' && line.comment ? t(`${K}.indicators.comment`, { text: line.comment.value }) : t(`${K}.indicators.${key}`)}
            />
          ))}
        />
      ),
    },
    {
      key: 'subscription',
      label: t(`${K}.columns.subscription`),
      render: line => <span className="text-sm tabular-nums">{line.subscription}</span>,
    },
    {
      key: 'share',
      label: t(`${K}.columns.share`),
      render: line => (
        <span className="whitespace-nowrap text-sm">{t('funds.detail.sharePrefix', { name: line.share })}</span>
      ),
    },
    {
      key: 'units',
      label: t(`${K}.columns.units`),
      align: 'right',
      render: line => <span className="text-sm">{integer.format(line.units)}</span>,
    },
    ...(perUnit
      ? [
          {
            key: 'amountPerUnit',
            label: t(`${K}.columns.amountPerUnit`),
            align: 'right' as const,
            render: (line: CapitalCallLine) =>
              line.amountPerUnit !== null ? <span className="text-sm">{money(line.amountPerUnit, 2)}</span> : empty,
          },
        ]
      : []),
    {
      key: 'calledAmount',
      label: t(`${K}.columns.calledAmount`),
      align: 'right',
      render: line => <span className="text-sm">{money(line.calledAmount)}</span>,
    },
    {
      key: 'fees',
      label: t(`${K}.columns.fees`),
      align: 'right',
      render: line => (line.fees > 0 ? <span className="text-sm">{money(line.fees)}</span> : empty),
    },
    {
      key: 'premium',
      label: t(`${K}.columns.premium`),
      align: 'right',
      render: line => (line.premium > 0 ? <span className="text-sm">{money(line.premium)}</span> : empty),
    },
    {
      key: 'total',
      label: t(`${K}.columns.total`),
      align: 'right',
      render: line => <span className="text-sm font-medium">{money(line.total)}</span>,
    },
    {
      key: 'received',
      label: t(`${K}.columns.received`),
      align: 'right',
      render: line => (line.payments.length > 0 ? <span className="text-sm">{money(receivedAmount(line))}</span> : empty),
    },
    {
      key: 'balance',
      label: t(`${K}.columns.balance`),
      align: 'right',
      render: line => {
        if (line.state === 'cancelled') return empty;
        const balance = balanceOf(line);
        if (balance < 0) {
          return <span className="whitespace-nowrap text-sm text-muted-foreground">{t(`${K}.overpaidBalance`, { amount: money(-balance) })}</span>;
        }
        return balance > 0 ? <span className="text-sm">{money(balance)}</span> : empty;
      },
    },
    {
      key: 'state',
      label: t(`${K}.columns.state`),
      render: line => (
        <StatusBadge
          label={t(`${K}.states.${line.state}`)}
          variant={LINE_STATE_VARIANT[line.state]}
          icon={line.state === 'paid' || line.state === 'overpaid' ? CheckCircle2 : undefined}
          tooltip={lineStateTooltip(line)}
        />
      ),
    },
    {
      key: 'noticeState',
      label: t(`${K}.columns.noticeState`),
      render: line => (
        <StatusBadge
          label={t(`${K}.noticeStates.${line.noticeState}`)}
          variant={NOTICE_STATE_VARIANT[line.noticeState]}
          icon={line.noticeState === 'failed' ? AlertTriangle : line.noticeState === 'generating' ? Loader2 : undefined}
          tooltip={noticeTooltip(line)}
        />
      ),
    },
    { key: 'notifiedAt', label: t(`${K}.columns.notifiedAt`), render: line => date(line.notifiedAt) },
    { key: 'lastReminderAt', label: t(`${K}.columns.lastReminderAt`), render: line => date(line.lastReminderAt) },
    { key: 'paidAt', label: t(`${K}.columns.paidAt`), render: line => date(line.paidAt) },
    { key: 'actions', label: '', align: 'right', render: line => <TableRowActions actions={rowActions(line)} /> },
  ];

  const hasFiltering = Object.keys(activeFilters).length > 0 || search.trim().length > 0;

  return (
    <div className="space-y-4">
    <CapitalCallNotificationPanel
      fundName={call.fundName}
      shares={call.shares.map(item => item.share)}
      restrictedTo={call.shares.some(item => item.restrictedTo !== null) ? call.shares.reduce((sum, item) => sum + (item.restrictedTo ?? 0), 0) : null}
      lines={lines}
      diffusion={call.diffusion}
      combinedNotices={lines.some(line => line.combinedNotice)}
      dueDate={call.dueDate}
      message={call.message}
      attachments={call.attachments}
      callName={call.name}
    />
    <ListingCard
      toolbar={
        <div className="flex items-start justify-between gap-3">
          <FilterBar
            className="flex-1"
            searchValue={search}
            onSearchChange={value => {
              setSearch(value);
              setPage(1);
            }}
            searchPlaceholder={t(`${K}.searchPlaceholder`)}
            filters={filterConfigs}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onClearAll={resetFilters}
          />
          {failedCount > 0 && (
            <DisabledReason reason={relaunchDisabledReason} className="shrink-0">
              <Button
                variant="ghost"
                className="gap-1.5"
                onClick={onRelaunchFailed}
                disabled={Boolean(relaunchDisabledReason)}
              >
                <RotateCw className="h-4 w-4" />
                {t(`${K}.relaunch.label`, { count: failedCount })}
              </Button>
            </DisabledReason>
          )}
        </div>
      }
      footer={
        filtered.length > 0 ? (
          <DataPagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filtered.length}
            onPageChange={next => setPage(Math.min(Math.max(1, next), totalPages))}
            onPageSizeChange={size => {
              setPageSize(size);
              setPage(1);
            }}
            pageSizeOptions={[10, 20, 50]}
          />
        ) : undefined
      }
    >
      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={hasFiltering ? t(`${K}.empty.filteredTitle`) : t(`${K}.empty.title`)}
          description={hasFiltering ? t(`${K}.empty.filteredDescription`) : undefined}
          action={
            hasFiltering ? (
              <Button variant="outline" size="sm" onClick={resetFilters}>
                {t(`${K}.empty.reset`)}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <DataTable
            data={pageRows}
            columns={columns}
            hoveredRow={hoveredRow}
            setHoveredRow={setHoveredRow}
            onRowClick={() => undefined}
            sortConfig={null}
            onSort={() => undefined}
            searchTerm={search}
            compactMode
            hideSelection
            density="compact"
            footer={{
              investor: t(`${K}.totals`, { count: filtered.length }),
              calledAmount: money(sum('calledAmount')),
              fees: money(sum('fees')),
              premium: money(sum('premium')),
              total: money(sum('total')),
              received: money(receivedTotal),
              balance: money(balanceTotal),
            }}
          />
        </>
      )}
    </ListingCard>

    <CapitalCallPaymentSheet
      line={
        paymentLine && {
          investor: paymentLine.investor,
          subscription: paymentLine.subscription,
          callName: call.name,
          total: paymentLine.total,
          payments: paymentLine.payments,
          state: paymentLine.state,
          overpaymentTreatment: paymentLine.overpaymentTreatment?.value ?? null,
        }
      }
      currency={call.currency}
      onClose={() => setPaymentLineId(null)}
      onSave={result => {
        if (paymentLine) onRecordPayment(paymentLine.id, result);
        setPaymentLineId(null);
      }}
    />

    <ConfirmDialog
      open={Boolean(commentDraft && commentLine)}
      onOpenChange={open => !open && setCommentDraft(null)}
      icon={MessageSquareText}
      title={t(`${K}.commentDialog.title`)}
      description={commentLine ? t(`${K}.commentDialog.description`, { investor: commentLine.investor }) : undefined}
      confirmLabel={t(`${K}.commentDialog.confirm`)}
      cancelLabel={t(`${K}.commentDialog.cancel`)}
      onConfirm={() => {
        if (commentDraft) onCommentLine(commentDraft.lineId, commentDraft.text.trim());
        setCommentDraft(null);
      }}
    >
      <FormField id="line-comment" label={t(`${K}.commentDialog.label`)} hint={t(`${K}.commentDialog.hint`)}>
        <Textarea
          id="line-comment"
          rows={3}
          value={commentDraft?.text ?? ''}
          onChange={event => setCommentDraft(prev => (prev ? { ...prev, text: event.target.value } : prev))}
        />
      </FormField>
    </ConfirmDialog>

    <ConfirmDialog
      open={Boolean(cancelDraft && cancelLine)}
      onOpenChange={open => !open && setCancelDraft(null)}
      destructive
      title={t(`${K}.cancelDialog.title`)}
      description={cancelLine ? t(`${K}.cancelDialog.description`, { investor: cancelLine.investor, amount: money(cancelLine.total) }) : undefined}
      confirmLabel={t(`${K}.cancelDialog.confirm`)}
      cancelLabel={t(`${K}.cancelDialog.cancel`)}
      confirmDisabledReason={cancelDraft && !cancelDraft.reason.trim() ? t(`${K}.cancelDialog.reasonRequired`) : undefined}
      onConfirm={() => {
        if (!cancelDraft?.reason.trim()) return;
        onCancelLine(cancelDraft.lineId, cancelDraft.reason.trim());
        setCancelDraft(null);
      }}
    >
      <FormField id="line-cancel-reason" label={t(`${K}.cancelDialog.reason`)} required>
        <Textarea
          id="line-cancel-reason"
          rows={3}
          value={cancelDraft?.reason ?? ''}
          onChange={event => setCancelDraft(prev => (prev ? { ...prev, reason: event.target.value } : prev))}
          placeholder={t(`${K}.cancelDialog.placeholder`)}
        />
      </FormField>
    </ConfirmDialog>
    </div>
  );
}
