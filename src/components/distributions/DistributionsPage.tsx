import { useEffect, useMemo, useState } from 'react';
import { ArrowDownCircle, ShieldX } from 'lucide-react';

import { useTranslation } from '../../utils/languageContext';
import type { Fund } from '../../utils/fundGenerator';
import { generateCapitalCalls } from '../../utils/capitalCallGenerator';
import {
  type Distribution,
  distinctDistributionNoticeDate,
  generateDistributionLines,
  generateDistributions,
} from '../../utils/distributionGenerator';
import { getDetailIdFromHash, onHashChange } from '../../utils/routing';
import { ColumnConfig, DataTable } from '../DataTable';
import { EmptyState } from '../EmptyState';
import { FilterBar, FilterConfig } from '../FilterBar';
import { ClickableText } from '../ClickableText';
import { ListingCard, ListingColumnsMenu, ListingNameCell } from '../ui/listing';
import { DemoScenarioBar } from '../ui/demo-scenario-bar';
import { PageHeader } from '../ui/page-header';
import { DataPagination } from '../ui/data-pagination';
import { TableRowActions } from '../ui/row-actions';
import type { NoticeContext } from '../../utils/noticeActions';
import { DISTRIBUTION_RULES } from '../../utils/noticeFamilies';
import {
  NOTICE_PROGRESS_COLUMNS,
  isNoticeProgressColumn,
  useNoticeProgressColumns,
  useNoticeSelection,
  type NoticeProgressColumn,
} from '../notices/noticeListing';
import { useNoticeLineStore } from '../notices/useNoticeLineStore';
import { useNoticeParentActions } from '../notices/useNoticeParentActions';
import { Button } from '../ui/button';
import { DistributionDetailPage } from './DistributionDetailPage';

const K = 'funds.distributions';

const COLUMN_KEYS = [
  'name',
  'fund',
  'date',
  'noticeDate',
  'amount',
  'provisional',
  'fees',
  'refund',
  'capital',
  'interest',
  ...NOTICE_PROGRESS_COLUMNS,
  'externalId',
  'createdAt',
  'updatedAt',
] as const;
type ColumnKey = (typeof COLUMN_KEYS)[number];
type OwnColumnKey = Exclude<ColumnKey, NoticeProgressColumn>;
const DEFAULT_COLUMNS: ColumnKey[] = ['name', 'fund', 'date', 'amount', 'provisional', 'fees', ...NOTICE_PROGRESS_COLUMNS];
const COLUMNS_STORAGE_KEY = 'investhub-columns-distributions-v2';
const LISTING_STORAGE_KEY = 'investhub-listing-distributions';

type Scenario = 'default' | 'limitedScope' | 'noRight';
const SCENARIOS: Scenario[] = ['default', 'limitedScope', 'noRight'];

type SortConfig = { key: string; direction: 'asc' | 'desc' };
type ActiveFilters = Record<string, string | string[]>;

const DEFAULT_SORT: SortConfig = { key: 'date', direction: 'desc' };

interface ListingState {
  search: string;
  activeFilters: ActiveFilters;
  sortConfig: SortConfig;
  page: number;
  pageSize: number;
}

/** Recherche, filtres, tri et page de la session, retrouvés au retour d'une fiche. */
function readListingState(): Partial<ListingState> {
  try {
    return JSON.parse(window.sessionStorage.getItem(LISTING_STORAGE_KEY) ?? '{}') as Partial<ListingState>;
  } catch {
    return {};
  }
}

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

function parseIsoDay(iso: string | undefined, endOfDay = false) {
  if (!iso) return undefined;
  const [year, month, day] = iso.split('-').map(Number);
  return endOfDay ? new Date(year, month - 1, day, 23, 59, 59, 999) : new Date(year, month - 1, day);
}

function defaultCompare(a: Distribution, b: Distribution) {
  return b.date.getTime() - a.date.getTime() || b.createdAt.getTime() - a.createdAt.getTime();
}

function sortValue(distribution: Distribution, key: string): string | number {
  switch (key) {
    case 'name':
      return distribution.name.toLowerCase();
    case 'fund':
      return distribution.fundName.toLowerCase();
    case 'date':
      return distribution.date.getTime();
    case 'noticeDate':
      return distinctDistributionNoticeDate(distribution)?.getTime() ?? 0;
    case 'amount':
      return distribution.amount;
    case 'provisional':
      return distribution.provisionalAmount;
    case 'fees':
      return distribution.fees;
    case 'refund':
      return distribution.refundAmount;
    case 'capital':
      return distribution.capitalAmount;
    case 'interest':
      return distribution.interestAmount;
    case 'externalId':
      return (distribution.externalId ?? '').toLowerCase();
    case 'createdAt':
      return distribution.createdAt.getTime();
    case 'updatedAt':
      return distribution.updatedAt.getTime();
    default:
      return 0;
  }
}

interface DistributionsPageProps {
  funds: Fund[];
  onOpenFund: (fundId: number) => void;
  /** Nom de la distribution ouverte, pour le fil d'Ariane. */
  onSelectedDistributionChange?: (name: string | null) => void;
}

export function DistributionsPage({ funds, onOpenFund, onSelectedDistributionChange }: DistributionsPageProps) {
  const { t, lang } = useTranslation();
  const [scenario, setScenario] = useState<Scenario>('default');
  const [stored] = useState(readListingState);
  const [search, setSearch] = useState(stored.search ?? '');
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(stored.activeFilters ?? {});
  const [sortConfig, setSortConfig] = useState<SortConfig>(stored.sortConfig ?? DEFAULT_SORT);
  const [page, setPage] = useState(stored.page ?? 1);
  const [pageSize, setPageSize] = useState(stored.pageSize ?? 20);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(readStoredColumns);
  const [allDistributions, setAllDistributions] = useState<Distribution[]>(() => generateDistributions(funds, generateCapitalCalls(funds)));
  const [selectedId, setSelectedId] = useState<string | null>(getDetailIdFromHash);

  useEffect(() => onHashChange(() => setSelectedId(getDetailIdFromHash())), []);

  useEffect(() => {
    try {
      const state: ListingState = { search, activeFilters, sortConfig, page, pageSize };
      window.sessionStorage.setItem(LISTING_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Sans stockage de session, le listing repart de son état par défaut.
    }
  }, [search, activeFilters, sortConfig, page, pageSize]);

  useEffect(() => {
    try {
      window.localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(visibleColumns));
    } catch {
      // Préférence de confort : sans stockage, les colonnes par défaut s'appliquent.
    }
  }, [visibleColumns]);

  const scopeFundIds = useMemo(() => {
    const ids = Array.from(new Set(allDistributions.map(item => item.fundId))).sort((a, b) => a - b);
    return new Set(scenario === 'limitedScope' ? ids.slice(0, 2) : ids);
  }, [allDistributions, scenario]);

  const scoped = useMemo(
    () => allDistributions.filter(item => scopeFundIds.has(item.fundId)),
    [allDistributions, scopeFundIds],
  );

  const filterConfigs: FilterConfig[] = useMemo(() => {
    const seen = new Map<number, string>();
    scoped.forEach(item => seen.set(item.fundId, item.fundName));
    const fundOptions = Array.from(seen, ([id, name]) => ({ value: String(id), label: name })).sort((a, b) =>
      a.label.localeCompare(b.label, lang),
    );
    return [
      { id: 'fund', label: t(`${K}.filters.funds`), type: 'multiselect', isPrimary: true, options: fundOptions },
      { id: 'period', label: t(`${K}.filters.period`), type: 'dateRange', isPrimary: true },
    ];
  }, [scoped, lang, t]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const fundIds = Array.isArray(activeFilters.fund) ? activeFilters.fund : [];
    const [fromIso, toIso] = Array.isArray(activeFilters.period) ? activeFilters.period : [];
    const from = parseIsoDay(fromIso);
    const to = parseIsoDay(toIso, true);
    return scoped.filter(item => {
      if (term && !item.name.toLowerCase().includes(term) && String(item.id) !== term) return false;
      if (fundIds.length > 0 && !fundIds.includes(String(item.fundId))) return false;
      if (from && item.date < from) return false;
      if (to && item.date > to) return false;
      return true;
    });
  }, [scoped, search, activeFilters]);

  const selected = selectedId ? allDistributions.find(item => String(item.id) === selectedId) : undefined;
  const selectedInScope = Boolean(selected && scopeFundIds.has(selected.fundId) && scenario !== 'noRight');
  const breadcrumbName = selected && selectedInScope ? selected.name : null;
  useEffect(() => {
    onSelectedDistributionChange?.(breadcrumbName);
    return () => onSelectedDistributionChange?.(null);
  }, [breadcrumbName, onSelectedDistributionChange]);

  const selectedShares = useMemo(
    () => funds.find(fund => fund.id === selected?.fundId)?.shareClasses.map(item => item.name) ?? [],
    [funds, selected?.fundId],
  );
  const sharesOf = (fundId: number) => funds.find(fund => fund.id === fundId)?.shareClasses.map(item => item.name) ?? [];
  const store = useNoticeLineStore((item: Distribution) => generateDistributionLines(item, sharesOf(item.fundId)));
  const selectedLines = selected ? store.linesOf(selected) : [];
  const contextOf = (item: Distribution): NoticeContext => ({
    notify: item.notify,
    noticesShown: true,
    sending: store.isSending(item.id),
    canNotify: true,
    canDownload: true,
  });
  const progress = useNoticeProgressColumns({ rules: DISTRIBUTION_RULES, contextOf, linesOf: store.linesOf });
  const sortValueOf = (item: Distribution, key: string) =>
    isNoticeProgressColumn(key) ? progress.sortValue(item, key) : sortValue(item, key);
  const [checkedIds, setCheckedIds] = useState<Set<number>>(() => new Set());
  const parentActions = useNoticeParentActions({
    rules: DISTRIBUTION_RULES,
    contextOf,
    linesOf: store.linesOf,
    updateLines: store.updateLines,
    send: store.send,
    remove: items => {
      const ids = new Set(items.map(item => item.id));
      setAllDistributions(prev => prev.filter(item => !ids.has(item.id)));
    },
    onCompleted: () => setCheckedIds(new Set()),
  });
  const selection = useNoticeSelection(
    'distributions',
    checkedIds,
    setCheckedIds,
    parentActions.bulkActions(scoped.filter(item => checkedIds.has(item.id))),
  );

  const sorted = useMemo(() => {
    const factor = sortConfig.direction === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const left = sortValueOf(a, sortConfig.key);
      const right = sortValueOf(b, sortConfig.key);
      if (left < right) return -factor;
      if (left > right) return factor;
      return defaultCompare(a, b);
    });
  }, [filtered, sortConfig, store.overrides]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const dateFormat = useMemo(
    () => new Intl.DateTimeFormat(lang, { day: '2-digit', month: '2-digit', year: 'numeric' }),
    [lang],
  );
  const dateTimeFormat = useMemo(
    () => new Intl.DateTimeFormat(lang, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    [lang],
  );
  const empty = <span className="text-muted-foreground">-</span>;
  const money = (distribution: Distribution, value: number, strong = false) =>
    value > 0 || strong ? (
      <span className={strong ? 'text-sm font-medium' : 'text-sm'}>
        {new Intl.NumberFormat(lang, { style: 'currency', currency: distribution.currency, maximumFractionDigits: 0 }).format(value)}
      </span>
    ) : (
      empty
    );
  const dateTime = (value: Date) => <span className="text-sm tabular-nums">{dateTimeFormat.format(value)}</span>;

  const hasFiltering = Object.keys(activeFilters).length > 0 || search.trim().length > 0;

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

  const openListing = () => {
    window.location.hash = '#/distributions';
  };

  const toggleColumn = (key: ColumnKey) => {
    setVisibleColumns(prev => {
      if (prev.includes(key)) return prev.length === 1 ? prev : prev.filter(item => item !== key);
      return COLUMN_KEYS.filter(item => item === key || prev.includes(item));
    });
  };

  const renderers: Record<OwnColumnKey, ColumnConfig<Distribution>['render']> = {
    name: (item, term) => <ListingNameCell name={item.name} searchTerm={term} id={item.id} />,
    fund: item => (
      <button
        type="button"
        onClick={event => {
          event.stopPropagation();
          onOpenFund(item.fundId);
        }}
        className="text-left text-sm font-medium"
      >
        <ClickableText>{item.fundName}</ClickableText>
      </button>
    ),
    date: item => <span className="text-sm tabular-nums">{dateFormat.format(item.date)}</span>,
    noticeDate: item => {
      const noticeDate = distinctDistributionNoticeDate(item);
      return noticeDate ? <span className="text-sm tabular-nums">{dateFormat.format(noticeDate)}</span> : empty;
    },
    amount: item => money(item, item.amount, true),
    provisional: item => money(item, item.provisionalAmount),
    fees: item => money(item, item.fees),
    refund: item => money(item, item.refundAmount),
    capital: item => money(item, item.capitalAmount),
    interest: item => money(item, item.interestAmount),
    externalId: item => (item.externalId ? <span className="text-sm tabular-nums">{item.externalId}</span> : empty),
    createdAt: item => dateTime(item.createdAt),
    updatedAt: item => dateTime(item.updatedAt),
  };
  const RIGHT_ALIGNED: OwnColumnKey[] = ['amount', 'provisional', 'fees', 'refund', 'capital', 'interest'];
  const columns: ColumnConfig<Distribution>[] = [
    ...visibleColumns.map(key =>
      isNoticeProgressColumn(key)
        ? progress.columns[key]
        : {
            key,
            label: t(`${K}.columns.${key}`),
            sortable: true,
            align: RIGHT_ALIGNED.includes(key) ? 'right' : undefined,
            render: renderers[key],
          },
    ),
    {
      key: 'actions',
      label: t('funds.notices.common.columns.actions'),
      align: 'right' as const,
      render: (item: Distribution) => <TableRowActions actions={parentActions.rowActions(item)} />,
    },
  ];

  const scenarioBar = (
    <DemoScenarioBar
      label={t(`${K}.scenario.label`)}
      value={scenario}
      options={SCENARIOS.map(item => ({ value: item, label: t(`${K}.scenario.options.${item}`) }))}
      onChange={value => {
        setScenario(value);
        resetFilters();
      }}
    />
  );

  const deniedPage = (description: string, title = t(`${K}.accessDenied.title`)) => (
    <div className="flex min-h-screen flex-1 flex-col bg-muted">
      {scenarioBar}
      <div className="flex flex-1 items-center justify-center p-6">
        <EmptyState icon={ShieldX} title={title} description={description} />
      </div>
    </div>
  );

  if (scenario === 'noRight') return deniedPage(t(`${K}.accessDenied.description`));

  if (selectedId) {
    if (!selected) return deniedPage(t(`${K}.accessDenied.notFoundDescription`), t(`${K}.accessDenied.notFoundTitle`));
    if (!selectedInScope) return deniedPage(t(`${K}.accessDenied.outOfScopeDescription`));
    return (
      <div className="flex min-h-screen flex-1 flex-col bg-muted">
        <DistributionDetailPage
          key={selected.id}
          distribution={selected}
          lines={selectedLines}
          lineBindings={{
            context: contextOf(selected),
            onLinesChange: update => store.updateLines(selected, update),
            onSend: (apply, onDone) => store.send(selected, apply, onDone),
          }}
          fundShares={selectedShares}
          onOpenFund={onOpenFund}
          onOpenCall={callId => {
            window.location.hash = `#/capital-calls/${callId}`;
          }}
          onBack={openListing}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-muted">
      {scenarioBar}

      <PageHeader hideBackButton title={t(`${K}.title`)} subtitle={t(`${K}.subtitle`)} />

      {parentActions.dialogs}

      <div className="flex flex-1 flex-col gap-4 px-6 py-6">
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
              <ListingColumnsMenu
                columns={COLUMN_KEYS.map(key => ({
                  key,
                  label: isNoticeProgressColumn(key) ? progress.label(key) : t(`${K}.columns.${key}`),
                }))}
                visible={visibleColumns}
                onToggle={key => toggleColumn(key as ColumnKey)}
                onReset={() => setVisibleColumns(DEFAULT_COLUMNS)}
              />
            </div>
          }
          footer={
            sorted.length > 0 ? (
              <DataPagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={sorted.length}
                onPageChange={next => setPage(Math.min(Math.max(1, next), totalPages))}
                onPageSizeChange={size => {
                  setPageSize(size);
                  setPage(1);
                }}
                pageSizeOptions={[10, 20, 50, 100]}
              />
            ) : undefined
          }
        >
          {sorted.length === 0 ? (
            <EmptyState
              icon={ArrowDownCircle}
              title={hasFiltering ? t(`${K}.empty.filteredTitle`) : t(`${K}.empty.title`)}
              description={hasFiltering ? t(`${K}.empty.filteredDescription`) : t(`${K}.empty.description`)}
              action={
                hasFiltering ? (
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    {t(`${K}.filters.reset`)}
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <DataTable
              data={pageRows}
              columns={columns}
              allFilteredData={sorted}
              selection={selection}
              hoveredRow={hoveredRow}
              setHoveredRow={setHoveredRow}
              onRowClick={item => {
                window.location.hash = `#/distributions/${item.id}`;
              }}
              sortConfig={sortConfig}
              onSort={key =>
                setSortConfig(prev =>
                  prev.key === key && prev.direction === 'asc' ? { key, direction: 'desc' } : { key, direction: 'asc' },
                )
              }
              searchTerm={search}
              compactMode
              density="compact"
            />
          )}
        </ListingCard>
      </div>
    </div>
  );
}
