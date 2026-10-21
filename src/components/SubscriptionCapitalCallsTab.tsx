import { useMemo, useState } from 'react';
import { Banknote, CalendarX, CheckCircle2, Clock, Download, Eye, List, Send, Wallet, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '../utils/languageContext';
import { mockCapitalCalls, type CapitalCallLineState, type MockCapitalCall } from '../utils/subscriptionDetailMockData';
import { DataTable, type ColumnConfig } from './DataTable';
import { EmptyState } from './EmptyState';
import { FilterBar, type FilterConfig } from './FilterBar';
import { StatusBadge, type StatusVariant } from './StatusBadge';
import { Button } from './ui/button';
import { ListingCard, ListingNameCell } from './ui/listing';
import { TableRowActions, type TableRowAction } from './ui/row-actions';
import { FilterCard, FilterCardGroup } from './ui/filter-card';

const K = 'subscriptions.detail.capitalCallsTab';
/** Vocabulaire partagé avec le module Appels de fonds. */
const LINES = 'funds.capitalCalls.detail.lines';
const DAY_MS = 86_400_000;

const LINE_STATES: CapitalCallLineState[] = ['toNotify', 'notified', 'paymentDeclared', 'paid'];
const LINE_STATE_VARIANT: Record<CapitalCallLineState, StatusVariant> = {
  toNotify: 'neutral',
  notified: 'info',
  paymentDeclared: 'warning',
  paid: 'success',
};

interface Row extends MockCapitalCall {
  calledAmount: number;
  fees: number;
  premium: number;
  total: number;
}

type Filters = Record<string, string | string[]>;

type Queue = 'all' | 'awaitingPayment' | 'overdue' | 'paid';
const inQueue = (row: MockCapitalCall, queue: Queue) => {
  if (queue === 'all') return true;
  if (queue === 'paid') return row.state === 'paid';
  if (queue === 'overdue') return row.state !== 'paid' && row.dueInDays < 0;
  return row.state !== 'paid';
};

const toRow = (call: MockCapitalCall, commitment: number, entryFeesRate: number, premium: number): Row => {
  const calledAmount = (commitment * call.calledPercent) / 100;
  const fees = call.includesEntryCosts ? (commitment * entryFeesRate) / 100 : 0;
  const callPremium = call.includesEntryCosts ? premium : 0;
  return { ...call, calledAmount, fees, premium: callPremium, total: calledAmount + fees + callPremium };
};

interface SubscriptionCapitalCallsTabProps {
  subscription: any;
}

export function SubscriptionCapitalCallsTab({ subscription }: SubscriptionCapitalCallsTabProps) {
  const { t, lang } = useTranslation();
  const [calls, setCalls] = useState<MockCapitalCall[]>(mockCapitalCalls);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>({});
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [queue, setQueue] = useState<Queue>('all');

  const commitment: number = subscription?.amount ?? 0;
  const money = (value: number) =>
    new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  const percent = (value: number) => new Intl.NumberFormat(lang, { maximumFractionDigits: 1 }).format(value) + ' %';
  const dateFormat = new Intl.DateTimeFormat(lang, { day: '2-digit', month: '2-digit', year: 'numeric' });
  const date = (days: number | null) => (days === null ? null : dateFormat.format(new Date(Date.now() + days * DAY_MS)));
  const empty = <span className="text-sm text-muted-foreground">-</span>;

  const allRows = useMemo(
    () => calls.map((call) => toRow(call, commitment, subscription?.entryFees ?? 0, subscription?.subscriptionPremium ?? 0)),
    [calls, commitment, subscription?.entryFees, subscription?.subscriptionPremium],
  );

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const states = (filters.state as string[] | undefined) ?? [];
    return allRows.filter((row) => {
      if (!inQueue(row, queue)) return false;
      if (term && ![row.name, row.reference].some((value) => value.toLowerCase().includes(term))) return false;
      if (states.length > 0 && !states.includes(row.state)) return false;
      return true;
    });
  }, [allRows, queue, search, filters]);


  const setState = (row: Row, state: CapitalCallLineState) =>
    setCalls((prev) =>
      prev.map((call) =>
        call.id === row.id ? { ...call, state, paidInDays: state === 'paid' ? 0 : call.paidInDays, paymentOrigin: 'manual' } : call,
      ),
    );

  const actionsFor = (row: Row): TableRowAction[] => {
    const actions: TableRowAction[] = [
      { label: t(`${K}.actions.viewNotice`), icon: Eye, onClick: () => toast.info(t(`${K}.toast.viewNotice`, { name: row.name })) },
      {
        label: t(`${K}.actions.downloadNotice`),
        icon: Download,
        onClick: () => toast.success(t(`${K}.toast.noticeDownloaded`, { name: row.name })),
      },
    ];
    if (row.state !== 'paid') {
      actions.push(
        {
          label: t(`${K}.actions.remind`),
          icon: Send,
          disabledReason: row.state === 'toNotify' ? t(`${K}.remindNotNotified`) : undefined,
          onClick: () => toast.success(t(`${K}.toast.reminded`, { name: row.name })),
        },
        {
          label: t(`${K}.actions.recordPayment`),
          icon: Banknote,
          intent: 'success',
          onClick: () => {
            setState(row, 'paid');
            toast.success(t(`${K}.toast.paymentRecorded`, { name: row.name, amount: money(row.total) }));
          },
        },
      );
    }
    return actions;
  };

  const stateTooltip = (row: Row) => {
    if (row.state === 'paid' && row.paymentOrigin) {
      return t(`${LINES}.paidTooltip`, { origin: t(`${LINES}.paymentOrigins.${row.paymentOrigin}`), date: date(row.paidInDays) ?? '' });
    }
    if (row.lastReminderInDays !== null) return t(`${K}.lastReminder`, { date: date(row.lastReminderInDays) });
    return null;
  };

  const dueCell = (row: Row) => {
    const label = date(row.dueInDays);
    if (row.state !== 'paid' && row.dueInDays < 0) return <StatusBadge variant="danger" label={t(`${K}.overdue`, { date: label })} />;
    return <span className="text-sm tabular-nums whitespace-nowrap">{label}</span>;
  };

  const columns: ColumnConfig<Row>[] = [
    {
      key: 'name',
      label: t(`${K}.columns.call`),
      render: (row, term) => <ListingNameCell name={row.name} searchTerm={term} secondary={row.reference} />,
    },
    {
      key: 'notifiedAt',
      label: t(`${LINES}.columns.notifiedAt`),
      render: (row) =>
        row.notifiedInDays === null ? empty : <span className="text-sm tabular-nums whitespace-nowrap">{date(row.notifiedInDays)}</span>,
    },
    { key: 'dueAt', label: t(`${K}.columns.dueAt`), render: dueCell },
    {
      key: 'calledPercent',
      label: t(`${K}.columns.calledPercent`),
      align: 'right',
      render: (row) => <span className="text-sm">{percent(row.calledPercent)}</span>,
    },
    {
      key: 'calledAmount',
      label: t(`${LINES}.columns.calledAmount`),
      align: 'right',
      render: (row) => <span className="text-sm whitespace-nowrap">{money(row.calledAmount)}</span>,
    },
    {
      key: 'fees',
      label: t(`${K}.columns.entryFees`),
      align: 'right',
      render: (row) => (row.fees > 0 ? <span className="text-sm whitespace-nowrap">{money(row.fees)}</span> : empty),
    },
    {
      key: 'premium',
      label: t(`${K}.columns.premium`),
      align: 'right',
      render: (row) => (row.premium > 0 ? <span className="text-sm whitespace-nowrap">{money(row.premium)}</span> : empty),
    },
    {
      key: 'total',
      label: t(`${LINES}.columns.total`),
      align: 'right',
      render: (row) => <span className="text-sm font-medium whitespace-nowrap">{money(row.total)}</span>,
    },
    {
      key: 'state',
      label: t(`${LINES}.columns.state`),
      render: (row) => (
        <StatusBadge
          label={t(`${LINES}.states.${row.state}`)}
          variant={LINE_STATE_VARIANT[row.state]}
          icon={row.state === 'paid' ? CheckCircle2 : undefined}
          tooltip={stateTooltip(row)}
        />
      ),
    },
    { key: 'actions', label: '', align: 'right', render: (row) => <TableRowActions actions={actionsFor(row)} /> },
  ];

  const sum = (key: 'calledAmount' | 'fees' | 'premium' | 'total') => rows.reduce((total, row) => total + row[key], 0);
  const footer = {
    name: t(`${K}.totalRow`),
    calledPercent: percent(rows.reduce((total, row) => total + row.calledPercent, 0)),
    calledAmount: money(sum('calledAmount')),
    fees: money(sum('fees')),
    premium: money(sum('premium')),
    total: money(sum('total')),
  };

  const filterConfigs: FilterConfig[] = [
    {
      id: 'state',
      label: t(`${LINES}.columns.state`),
      type: 'multiselect',
      isPrimary: true,
      options: LINE_STATES.map((value) => ({ value, label: t(`${LINES}.states.${value}`) })),
    },
  ];

  const exportCsv = () => {
    const headers = columns.filter((column) => column.key !== 'actions').map((column) => column.label);
    const lines = rows.map((row) => [
      `${row.name} (${row.reference})`,
      date(row.notifiedInDays) ?? '',
      date(row.dueInDays) ?? '',
      percent(row.calledPercent),
      money(row.calledAmount),
      money(row.fees),
      money(row.premium),
      money(row.total),
      t(`${LINES}.states.${row.state}`),
    ]);
    const content = [headers, ...lines].map((line) => line.join(';')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8;' }));
    link.download = `capital-calls-${subscription?.id ?? 'subscription'}.csv`;
    link.click();
    toast.success(t(`${K}.exportSuccess`), { description: t(`${K}.exportSuccessDesc`) });
  };

  const hasFilters = Object.keys(filters).length > 0 || queue !== 'all';

  const queueCard = (id: Queue, icon: LucideIcon) => {
    const items = allRows.filter((row) => inQueue(row, id));
    const amount = items.reduce((sum, row) => sum + row.total, 0);
    return (
      <FilterCard
        status={id}
        activeStatus={queue}
        onStatusChange={(status) => setQueue(status as Queue)}
        label={t(`${K}.queues.${id}`)}
        icon={icon}
        total={items.length}
        metricLabel={t(`${K}.queues.amountMetric`)}
        metricValue={money(amount)}
        averageValue={t(`${K}.queues.perCall`, { amount: money(items.length > 0 ? amount / items.length : 0) })}
      />
    );
  };

  return (
    <div className="space-y-4">
      <FilterCardGroup
        title={t('subscriptions.detail.queues.title')}
        hint={t('subscriptions.detail.queues.hint')}
        columns={4}
      >
        {queueCard('all', List)}
        {queueCard('awaitingPayment', Clock)}
        {queueCard('overdue', CalendarX)}
        {queueCard('paid', CheckCircle2)}
      </FilterCardGroup>

      <ListingCard
        toolbar={
          <div className="flex items-start justify-between gap-3">
            <FilterBar
              className="flex-1"
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder={t(`${K}.searchPlaceholder`)}
              filters={filterConfigs}
              activeFilters={filters}
              onFilterChange={(id, value) =>
                setFilters((prev) => {
                  const next = { ...prev };
                  if (value === null || (Array.isArray(value) && value.length === 0)) delete next[id];
                  else next[id] = value;
                  return next;
                })
              }
              onClearAll={() => setFilters({})}
            />
            <Button variant="outline" className="shrink-0" onClick={exportCsv}>
              <Download className="w-4 h-4" />
              {t(`${K}.exportCsv`)}
            </Button>
          </div>
        }
      >
        {rows.length === 0 ? (
          <EmptyState
            icon={Wallet}
            hasFilters={hasFilters}
            hasSearch={Boolean(search.trim())}
            entityName={t(`${K}.entity`)}
            onReset={() => {
              setSearch('');
              setFilters({});
              setQueue('all');
            }}
          />
        ) : (
          <DataTable
            data={rows}
            columns={columns}
            hoveredRow={hoveredRow}
            setHoveredRow={setHoveredRow}
            onRowClick={(row) => toast.info(t(`${K}.toast.viewNotice`, { name: row.name }))}
            sortConfig={null}
            onSort={() => undefined}
            compactMode
            hideSelection
            density="compact"
            searchTerm={search}
            footer={footer}
          />
        )}
      </ListingCard>
    </div>
  );
}
