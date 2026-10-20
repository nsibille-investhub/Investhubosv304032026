import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, ArrowLeftRight, CheckCircle2, EyeOff, Layers, Loader2, Repeat, RotateCw, Users } from 'lucide-react';

import { useTranslation } from '../../utils/languageContext';
import type { CapitalCall } from '../../utils/capitalCallGenerator';
import {
  CapitalCallLine,
  LINE_STATES,
  LineState,
  NOTICE_STATES,
  NoticeState,
  isPerUnitCall,
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
import { HighlightText } from '../HighlightText';
import { StatusBadge, StatusVariant } from '../StatusBadge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { DataPagination } from '../ui/data-pagination';
import { DisabledReason } from '../ui/disabled-reason';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

const K = 'funds.capitalCalls.detail.lines';

const LINE_STATE_VARIANT: Record<LineState, StatusVariant> = {
  toNotify: 'neutral',
  notified: 'info',
  paymentDeclared: 'warning',
  paid: 'success',
};

const NOTICE_STATE_VARIANT: Record<NoticeState, StatusVariant> = {
  generating: 'info',
  available: 'success',
  failed: 'danger',
  replaced: 'outline',
};

type ActiveFilters = Record<string, string | string[]>;

function WithTooltip({ content, children }: { content: string | null; children: ReactNode }) {
  if (!content) return <>{children}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0} className="inline-flex">
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <span className="text-xs">{content}</span>
      </TooltipContent>
    </Tooltip>
  );
}

interface CapitalCallLinesTabProps {
  call: CapitalCall;
  lines: CapitalCallLine[];
  failedCount: number;
  relaunchDisabledReason: string | null;
  onRelaunchFailed: () => void;
  /** Filtre appliqué depuis un compteur de la synthèse ; sans valeur, tous les filtres sont retirés. */
  preset?: (LinesPreset & { nonce: number }) | null;
}

export function CapitalCallLinesTab({
  call,
  lines,
  failedCount,
  relaunchDisabledReason,
  onRelaunchFailed,
  preset,
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

  const lineStateTooltip = (line: CapitalCallLine) =>
    line.state === 'paid' && line.paymentOrigin
      ? t(`${K}.paidTooltip`, {
          origin: t(`${K}.paymentOrigins.${line.paymentOrigin}`),
          date: line.paidAt ? dateFormat.format(line.paidAt) : '',
        })
      : null;

  const indicators = (line: CapitalCallLine) =>
    (
      [
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
        <span className="inline-flex items-center gap-2 whitespace-nowrap">
          <HighlightText text={line.investor} searchTerm={term} className="text-sm font-medium text-foreground" />
          {indicators(line).map(([, Icon, key]) => (
            <WithTooltip key={key} content={t(`${K}.indicators.${key}`)}>
              <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-label={t(`${K}.indicators.${key}`)} />
            </WithTooltip>
          ))}
        </span>
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
      key: 'state',
      label: t(`${K}.columns.state`),
      render: line => (
        <WithTooltip content={lineStateTooltip(line)}>
          <StatusBadge
            label={t(`${K}.states.${line.state}`)}
            variant={LINE_STATE_VARIANT[line.state]}
            icon={line.state === 'paid' ? CheckCircle2 : undefined}
          />
        </WithTooltip>
      ),
    },
    {
      key: 'noticeState',
      label: t(`${K}.columns.noticeState`),
      render: line => (
        <WithTooltip content={noticeTooltip(line)}>
          <StatusBadge
            label={t(`${K}.noticeStates.${line.noticeState}`)}
            variant={NOTICE_STATE_VARIANT[line.noticeState]}
            icon={line.noticeState === 'failed' ? AlertTriangle : line.noticeState === 'generating' ? Loader2 : undefined}
          />
        </WithTooltip>
      ),
    },
    { key: 'notifiedAt', label: t(`${K}.columns.notifiedAt`), render: line => date(line.notifiedAt) },
    { key: 'lastReminderAt', label: t(`${K}.columns.lastReminderAt`), render: line => date(line.lastReminderAt) },
    { key: 'paidAt', label: t(`${K}.columns.paidAt`), render: line => date(line.paidAt) },
  ];

  const hasFiltering = Object.keys(activeFilters).length > 0 || search.trim().length > 0;

  return (
    <Card className="shadow-sm">
      <div className="relative z-10 border-b border-border p-4">
        <FilterBar
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
          actions={
            <DisabledReason reason={relaunchDisabledReason}>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={onRelaunchFailed}
                disabled={Boolean(relaunchDisabledReason)}
              >
                <RotateCw className="h-4 w-4" />
                {t(`${K}.relaunch.label`, { count: failedCount })}
              </Button>
            </DisabledReason>
          }
        />
      </div>
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
            }}
          />
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
        </>
      )}
    </Card>
  );
}
