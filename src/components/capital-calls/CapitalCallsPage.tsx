import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { Columns3, FilterX, FlaskConical, Loader2, Plus, ShieldX, Wallet } from 'lucide-react';

import { useTranslation } from '../../utils/languageContext';
import type { Fund } from '../../utils/fundGenerator';
import {
  CAPITAL_CALL_ORIGINS,
  CapitalCall,
  CapitalCallOrigin,
  generateCapitalCalls,
} from '../../utils/capitalCallGenerator';
import { ColumnConfig, DataTable } from '../DataTable';
import { EmptyState } from '../EmptyState';
import { PageHeader } from '../ui/page-header';
import { SearchInput } from '../ui/search-input';
import { ModernMultiSelect } from '../ui/modern-multiselect';
import { DateRangePicker } from '../ui/date-range-picker';
import { DataPagination } from '../ui/data-pagination';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { toneSurface } from '../ui/tone';
import { cn } from '../ui/utils';

const K = 'funds.capitalCalls';

type ColumnKey =
  | 'fund'
  | 'name'
  | 'dueDate'
  | 'calledAmount'
  | 'noticeDate'
  | 'origin'
  | 'compensation'
  | 'createdAt'
  | 'createdBy';

const COLUMN_KEYS: ColumnKey[] = [
  'fund',
  'name',
  'dueDate',
  'calledAmount',
  'noticeDate',
  'origin',
  'compensation',
  'createdAt',
  'createdBy',
];
const DEFAULT_COLUMNS: ColumnKey[] = ['fund', 'name', 'dueDate', 'calledAmount'];
const COLUMNS_STORAGE_KEY = 'investhub-columns-capital-calls';

type Queue = 'all' | 'sending';
type Scenario = 'default' | 'limitedScope' | 'noRight';
const SCENARIOS: Scenario[] = ['default', 'limitedScope', 'noRight'];
const ALL_ORIGINS = 'all';

type SortConfig = { key: string; direction: 'asc' | 'desc' };

function readStoredColumns(): ColumnKey[] {
  try {
    const raw = window.localStorage.getItem(COLUMNS_STORAGE_KEY);
    if (!raw) return DEFAULT_COLUMNS;
    const parsed = JSON.parse(raw) as string[];
    const valid = COLUMN_KEYS.filter(key => parsed.includes(key));
    return valid.length > 0 ? valid : DEFAULT_COLUMNS;
  } catch {
    return DEFAULT_COLUMNS;
  }
}

function defaultCompare(a: CapitalCall, b: CapitalCall) {
  return b.dueDate.getTime() - a.dueDate.getTime() || b.createdAt.getTime() - a.createdAt.getTime();
}

function sortValue(call: CapitalCall, key: string): string | number {
  switch (key) {
    case 'fund':
      return call.fundName.toLowerCase();
    case 'name':
      return call.name.toLowerCase();
    case 'dueDate':
      return call.dueDate.getTime();
    case 'calledAmount':
      return call.calledAmount;
    case 'noticeDate':
      return call.noticeDate?.getTime() ?? 0;
    case 'createdAt':
      return call.createdAt.getTime();
    case 'createdBy':
      return call.createdBy.toLowerCase();
    default:
      return 0;
  }
}

interface CapitalCallsPageProps {
  funds: Fund[];
  /** Filtre fonds appliqué à l'ouverture, depuis la fiche d'un fonds. */
  initialFundIds?: number[];
  onOpenFund: (fundId: number) => void;
}

export function CapitalCallsPage({ funds, initialFundIds, onOpenFund }: CapitalCallsPageProps) {
  const { t, lang } = useTranslation();
  const [scenario, setScenario] = useState<Scenario>('default');
  const [queue, setQueue] = useState<Queue>('all');
  const [search, setSearch] = useState('');
  const [fundIds, setFundIds] = useState<string[]>(() => (initialFundIds ?? []).map(String));
  const [dueFrom, setDueFrom] = useState<Date | undefined>();
  const [dueTo, setDueTo] = useState<Date | undefined>();
  const [origin, setOrigin] = useState<CapitalCallOrigin | typeof ALL_ORIGINS>(ALL_ORIGINS);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(readStoredColumns);

  const initialFundKey = (initialFundIds ?? []).join(',');
  useEffect(() => {
    setFundIds(initialFundKey ? initialFundKey.split(',') : []);
    setPage(1);
  }, [initialFundKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(visibleColumns));
    } catch {
      // Préférence de confort : sans stockage, les colonnes par défaut s'appliquent.
    }
  }, [visibleColumns]);

  const allCalls = useMemo(() => generateCapitalCalls(funds), [funds]);

  const scopeFundIds = useMemo(() => {
    const ids = Array.from(new Set(allCalls.map(call => call.fundId)));
    return new Set(scenario === 'limitedScope' ? ids.slice(0, 2) : ids);
  }, [allCalls, scenario]);

  const scopedCalls = useMemo(() => allCalls.filter(call => scopeFundIds.has(call.fundId)), [allCalls, scopeFundIds]);

  const fundOptions = useMemo(() => {
    const seen = new Map<number, string>();
    scopedCalls.forEach(call => seen.set(call.fundId, call.fundName));
    return Array.from(seen, ([id, name]) => ({ value: String(id), label: name })).sort((a, b) =>
      a.label.localeCompare(b.label, lang),
    );
  }, [scopedCalls, lang]);

  const sendingCount = scopedCalls.filter(call => call.sending).length;

  const hasFilters = fundIds.length > 0 || !!dueFrom || !!dueTo || origin !== ALL_ORIGINS;
  const hasSearch = search.trim().length > 0;

  const filteredCalls = useMemo(() => {
    const term = search.trim().toLowerCase();
    const to = dueTo ? new Date(dueTo.getFullYear(), dueTo.getMonth(), dueTo.getDate(), 23, 59, 59, 999) : undefined;
    return scopedCalls.filter(call => {
      if (queue === 'sending' && !call.sending) return false;
      if (term && !call.name.toLowerCase().includes(term) && !call.fundName.toLowerCase().includes(term)) return false;
      if (fundIds.length > 0 && !fundIds.includes(String(call.fundId))) return false;
      if (dueFrom && call.dueDate < dueFrom) return false;
      if (to && call.dueDate > to) return false;
      if (origin !== ALL_ORIGINS && call.origin !== origin) return false;
      return true;
    });
  }, [scopedCalls, queue, search, fundIds, dueFrom, dueTo, origin]);

  const sortedCalls = useMemo(() => {
    if (!sortConfig) return [...filteredCalls].sort(defaultCompare);
    const factor = sortConfig.direction === 'asc' ? 1 : -1;
    return [...filteredCalls].sort((a, b) => {
      const left = sortValue(a, sortConfig.key);
      const right = sortValue(b, sortConfig.key);
      if (left < right) return -factor;
      if (left > right) return factor;
      return defaultCompare(a, b);
    });
  }, [filteredCalls, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedCalls.length / pageSize));
  const pageRows = sortedCalls.slice((page - 1) * pageSize, page * pageSize);

  const dateFormat = useMemo(
    () => new Intl.DateTimeFormat(lang, { day: '2-digit', month: '2-digit', year: 'numeric' }),
    [lang],
  );
  const money = (call: CapitalCall) =>
    new Intl.NumberFormat(lang, { style: 'currency', currency: call.currency, maximumFractionDigits: 0 }).format(
      call.calledAmount,
    );
  const empty = <span className="text-muted-foreground">-</span>;

  const resetPage = () => setPage(1);

  const resetFilters = () => {
    setSearch('');
    setFundIds([]);
    setDueFrom(undefined);
    setDueTo(undefined);
    setOrigin(ALL_ORIGINS);
    setQueue('all');
    resetPage();
  };

  const toggleColumn = (key: ColumnKey) => {
    setVisibleColumns(prev => {
      if (prev.includes(key)) return prev.length === 1 ? prev : prev.filter(item => item !== key);
      return COLUMN_KEYS.filter(item => item === key || prev.includes(item));
    });
  };

  const columnDefinitions: Record<ColumnKey, ColumnConfig<CapitalCall>> = {
    fund: {
      key: 'fund',
      label: t(`${K}.columns.fund`),
      sortable: true,
      render: call => (
        <button
          type="button"
          onClick={event => {
            event.stopPropagation();
            onOpenFund(call.fundId);
          }}
          className="text-left text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {call.fundName}
        </button>
      ),
    },
    name: {
      key: 'name',
      label: t(`${K}.columns.name`),
      sortable: true,
      render: call => (
        <span className="inline-flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-foreground">{call.name}</span>
          {call.sending && (
            <span
              className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium"
              style={toneSurface('info')}
            >
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
              {t(`${K}.sendingBadge`)}
            </span>
          )}
        </span>
      ),
    },
    dueDate: {
      key: 'dueDate',
      label: t(`${K}.columns.dueDate`),
      sortable: true,
      render: call => <span className="text-sm tabular-nums">{dateFormat.format(call.dueDate)}</span>,
    },
    calledAmount: {
      key: 'calledAmount',
      label: t(`${K}.columns.calledAmount`),
      sortable: true,
      align: 'right',
      render: call => <span className="text-sm">{money(call)}</span>,
    },
    noticeDate: {
      key: 'noticeDate',
      label: t(`${K}.columns.noticeDate`),
      sortable: true,
      render: call =>
        call.noticeDate ? <span className="text-sm tabular-nums">{dateFormat.format(call.noticeDate)}</span> : empty,
    },
    origin: {
      key: 'origin',
      label: t(`${K}.columns.origin`),
      render: call => <span className="text-sm">{t(`${K}.origins.${call.origin}`)}</span>,
    },
    compensation: {
      key: 'compensation',
      label: t(`${K}.columns.compensation`),
      render: call =>
        call.compensations.length > 0 ? (
          <span className="text-sm">{call.compensations.map(item => item.name).join(', ')}</span>
        ) : (
          empty
        ),
    },
    createdAt: {
      key: 'createdAt',
      label: t(`${K}.columns.createdAt`),
      sortable: true,
      render: call => <span className="text-sm tabular-nums">{dateFormat.format(call.createdAt)}</span>,
    },
    createdBy: {
      key: 'createdBy',
      label: t(`${K}.columns.createdBy`),
      sortable: true,
      render: call => <span className="text-sm">{call.createdBy}</span>,
    },
  };

  const columns = visibleColumns.map(key => columnDefinitions[key]);

  const queues: { id: Queue; count: number }[] = [
    { id: 'all', count: scopedCalls.length },
    { id: 'sending', count: sendingCount },
  ];

  const scenarioBar = (
    <div
      className="flex flex-wrap items-center justify-end gap-3 border-b border-border px-6 py-2"
      style={toneSurface('info')}
    >
      <span className="inline-flex items-center gap-2 text-xs font-medium">
        <FlaskConical className="h-3.5 w-3.5" aria-hidden />
        {t(`${K}.scenario.label`)}
      </span>
      <Select
        value={scenario}
        onValueChange={value => {
          setScenario(value as Scenario);
          resetFilters();
        }}
      >
        <SelectTrigger size="sm" className="w-72 border-border bg-card" aria-label={t(`${K}.scenario.label`)}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SCENARIOS.map(item => (
            <SelectItem key={item} value={item}>
              {t(`${K}.scenario.options.${item}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  if (scenario === 'noRight') {
    return (
      <div className="flex min-h-screen flex-1 flex-col bg-muted">
        {scenarioBar}
        <div className="flex flex-1 items-center justify-center p-6">
          <EmptyState
            icon={ShieldX}
            title={t(`${K}.accessDenied.title`)}
            description={t(`${K}.accessDenied.description`)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-muted">
      {scenarioBar}

      <PageHeader
        hideBackButton
        title={t(`${K}.title`)}
        subtitle={t(`${K}.subtitle`)}
        primaryAction={{
          label: t(`${K}.actions.new`),
          icon: <Plus className="h-4 w-4" />,
          onClick: () => toast.info(t(`${K}.toast.creationComingSoon`)),
        }}
      />

      <div className="flex flex-1 flex-col gap-4 px-6 py-6">
        <div role="tablist" aria-label={t(`${K}.queues.label`)} className="flex flex-wrap items-center gap-2">
          {queues.map(item => {
            const active = queue === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setQueue(item.id);
                  resetPage();
                }}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'border-primary/40 bg-card text-foreground shadow-sm'
                    : 'border-border bg-card/60 text-muted-foreground hover:text-foreground',
                )}
              >
                {item.id === 'sending' && <Loader2 className="h-3.5 w-3.5" aria-hidden />}
                {t(`${K}.queues.${item.id}`)}
                <span
                  className="rounded-md border px-1.5 text-xs tabular-nums"
                  style={toneSurface(active ? 'info' : 'neutral')}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-start gap-3 border-b border-border p-4">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              <SearchInput
                value={search}
                onValueChange={value => {
                  setSearch(value);
                  resetPage();
                }}
                placeholder={t(`${K}.searchPlaceholder`)}
                aria-label={t(`${K}.searchPlaceholder`)}
                className="w-72"
              />
              <ModernMultiSelect
                options={fundOptions}
                value={fundIds}
                onChange={value => {
                  setFundIds(value);
                  resetPage();
                }}
                placeholder={t(`${K}.filters.funds`)}
                searchPlaceholder={t(`${K}.filters.fundsSearch`)}
                maxDisplay={1}
                className="w-56"
              />
              <DateRangePicker
                from={dueFrom}
                to={dueTo}
                onRangeChange={(from, to) => {
                  setDueFrom(from);
                  setDueTo(to);
                  resetPage();
                }}
                placeholder={t(`${K}.filters.duePeriod`)}
                clearLabel={t(`${K}.filters.clear`)}
                className="w-56"
              />
              <Select
                value={origin}
                onValueChange={value => {
                  setOrigin(value as CapitalCallOrigin | typeof ALL_ORIGINS);
                  resetPage();
                }}
              >
                <SelectTrigger className="w-44 border-border bg-card" aria-label={t(`${K}.filters.origin`)}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_ORIGINS}>{t(`${K}.filters.allOrigins`)}</SelectItem>
                  {CAPITAL_CALL_ORIGINS.map(item => (
                    <SelectItem key={item} value={item}>
                      {t(`${K}.origins.${item}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(hasFilters || hasSearch) && (
                <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1.5">
                  <FilterX className="h-4 w-4" />
                  {t(`${K}.filters.reset`)}
                </Button>
              )}
            </div>
            <div className="shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Columns3 className="h-4 w-4" />
                    {t(`${K}.columnsMenu.label`)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>{t(`${K}.columnsMenu.title`)}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {COLUMN_KEYS.map(key => (
                    <DropdownMenuCheckboxItem
                      key={key}
                      checked={visibleColumns.includes(key)}
                      disabled={visibleColumns.length === 1 && visibleColumns.includes(key)}
                      onSelect={event => event.preventDefault()}
                      onCheckedChange={() => toggleColumn(key)}
                    >
                      {t(`${K}.columns.${key}`)}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setVisibleColumns(DEFAULT_COLUMNS)}>
                    {t(`${K}.columnsMenu.reset`)}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {sortedCalls.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title={
                hasFilters || hasSearch || queue !== 'all' ? t(`${K}.empty.filteredTitle`) : t(`${K}.empty.title`)
              }
              description={
                hasFilters || hasSearch || queue !== 'all'
                  ? t(`${K}.empty.filteredDescription`)
                  : t(`${K}.empty.description`)
              }
              action={
                hasFilters || hasSearch || queue !== 'all' ? (
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    {t(`${K}.filters.reset`)}
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
                onRowClick={() => toast.info(t(`${K}.toast.detailComingSoon`))}
                sortConfig={sortConfig}
                onSort={key =>
                  setSortConfig(prev =>
                    prev?.key === key && prev.direction === 'asc' ? { key, direction: 'desc' } : { key, direction: 'asc' },
                  )
                }
                searchTerm={search}
                compactMode
                hideSelection
              />
              <DataPagination
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={sortedCalls.length}
                onPageChange={next => setPage(Math.min(Math.max(1, next), totalPages))}
                onPageSizeChange={size => {
                  setPageSize(size);
                  resetPage();
                }}
                pageSizeOptions={[10, 20, 50, 100]}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
