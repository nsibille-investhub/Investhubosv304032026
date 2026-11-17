import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { Users } from 'lucide-react';

import { useTranslation } from '../../utils/languageContext';
import type { CapitalCall } from '../../utils/capitalCallGenerator';
import { CALL_LINE_STATES, CapitalCallLine } from '../../utils/capitalCallLines';
import { ClickableText } from '../ClickableText';
import { ColumnConfig, DataTable } from '../DataTable';
import { EmptyState } from '../EmptyState';
import { FilterBar, FilterConfig } from '../FilterBar';
import { ListingCard, ListingColumnsMenu, ListingNameCell, ListingTruncatedText } from '../ui/listing';
import { StatusBadge } from '../StatusBadge';
import { Button } from '../ui/button';
import { LINE_STATE_VARIANT } from './CapitalCallPaymentSheet';
import { DataPagination } from '../ui/data-pagination';

const K = 'funds.capitalCalls.detail.lines';

type ColumnKey =
  | 'investor'
  | 'subscription'
  | 'share'
  | 'amount'
  | 'fees'
  | 'premium'
  | 'total'
  | 'status'
  | 'notifiedOn'
  | 'remindedOn'
  | 'paidOn'
  | 'createdAt'
  | 'updatedAt';

const COLUMN_KEYS: ColumnKey[] = [
  'investor',
  'subscription',
  'share',
  'amount',
  'fees',
  'premium',
  'total',
  'status',
  'notifiedOn',
  'remindedOn',
  'paidOn',
  'createdAt',
  'updatedAt',
];
const HIDDEN_BY_DEFAULT: ColumnKey[] = ['remindedOn', 'createdAt', 'updatedAt'];
const DEFAULT_COLUMNS = COLUMN_KEYS.filter(key => !HIDDEN_BY_DEFAULT.includes(key));
const COLUMNS_STORAGE_KEY = 'investhub-columns-capital-call-lines';
const LISTING_STORAGE_KEY = 'investhub-listing-capital-call-lines';

type SortConfig = { key: string; direction: 'asc' | 'desc' };
type ActiveFilters = Record<string, string | string[]>;

const DEFAULT_SORT: SortConfig = { key: 'investor', direction: 'asc' };

interface ListingState {
  activeFilters: ActiveFilters;
  sortConfig: SortConfig;
  page: number;
  pageSize: number;
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

/** Filtres, tri et page de la session pour un appel, retrouvés au retour d'une fiche. */
function readListingState(callId: number): Partial<ListingState> {
  try {
    return JSON.parse(window.sessionStorage.getItem(`${LISTING_STORAGE_KEY}-${callId}`) ?? '{}') as Partial<ListingState>;
  } catch {
    return {};
  }
}

function sortValue(line: CapitalCallLine, key: string): string | number {
  switch (key) {
    case 'investor':
      return line.investor.toLowerCase();
    case 'subscription':
      return line.subscription.toLowerCase();
    case 'share':
      return line.share.toLowerCase();
    case 'amount':
      return line.calledAmount;
    case 'fees':
      return line.fees;
    case 'premium':
      return line.premium;
    case 'total':
      return line.total;
    case 'status':
      return CALL_LINE_STATES.indexOf(line.state);
    case 'notifiedOn':
      return line.notifiedAt?.getTime() ?? 0;
    case 'remindedOn':
      return line.lastReminderAt?.getTime() ?? 0;
    case 'paidOn':
      return line.paidAt?.getTime() ?? 0;
    case 'createdAt':
      return line.createdAt.getTime();
    case 'updatedAt':
      return line.updatedAt.getTime();
    default:
      return 0;
  }
}

interface CapitalCallLinesTabProps {
  call: CapitalCall;
  lines: CapitalCallLine[];
  /** Parts du fonds, proposées par le filtre Part. */
  fundShares: string[];
}

export function CapitalCallLinesTab({ call, lines, fundShares }: CapitalCallLinesTabProps) {
  const { t, lang } = useTranslation();
  const [stored] = useState(() => readListingState(call.id));
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(stored.activeFilters ?? {});
  const [sortConfig, setSortConfig] = useState<SortConfig>(stored.sortConfig ?? DEFAULT_SORT);
  const [page, setPage] = useState(stored.page ?? 1);
  const [pageSize, setPageSize] = useState(stored.pageSize ?? 20);
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(readStoredColumns);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  useEffect(() => {
    try {
      const state: ListingState = { activeFilters, sortConfig, page, pageSize };
      window.sessionStorage.setItem(`${LISTING_STORAGE_KEY}-${call.id}`, JSON.stringify(state));
    } catch {
      // Sans stockage de session, l'onglet repart de son état par défaut.
    }
  }, [call.id, activeFilters, sortConfig, page, pageSize]);

  useEffect(() => {
    try {
      window.localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(visibleColumns));
    } catch {
      // Préférence de confort : sans stockage, les colonnes par défaut s'appliquent.
    }
  }, [visibleColumns]);

  const filterConfigs: FilterConfig[] = useMemo(() => {
    const distinct = (pick: (line: CapitalCallLine) => string) =>
      Array.from(new Set(lines.map(pick)))
        .sort((a, b) => a.localeCompare(b, lang))
        .map(value => ({ value, label: value }));
    return [
      { id: 'investor', label: t(`${K}.columns.investor`), type: 'multiselect', isPrimary: true, options: distinct(line => line.investor) },
      {
        id: 'subscription',
        label: t(`${K}.columns.subscription`),
        type: 'multiselect',
        isPrimary: true,
        options: distinct(line => line.subscription),
      },
      {
        id: 'share',
        label: t(`${K}.columns.share`),
        type: 'multiselect',
        isPrimary: true,
        options: fundShares.map(value => ({ value, label: t('funds.detail.sharePrefix', { name: value }) })),
      },
      {
        id: 'status',
        label: t(`${K}.columns.status`),
        type: 'multiselect',
        isPrimary: true,
        options: CALL_LINE_STATES.map(value => ({ value, label: t(`${K}.states.${value}`) })),
      },
    ];
  }, [lines, fundShares, lang, t]);

  const filtered = useMemo(() => {
    const pick = (id: string) => (Array.isArray(activeFilters[id]) ? (activeFilters[id] as string[]) : []);
    const investors = pick('investor');
    const subscriptions = pick('subscription');
    const shares = pick('share');
    const statuses = pick('status');
    return lines.filter(line => {
      if (investors.length > 0 && !investors.includes(line.investor)) return false;
      if (subscriptions.length > 0 && !subscriptions.includes(line.subscription)) return false;
      if (shares.length > 0 && !shares.includes(line.share)) return false;
      if (statuses.length > 0 && !statuses.includes(line.state)) return false;
      return true;
    });
  }, [lines, activeFilters]);

  const sorted = useMemo(() => {
    const factor = sortConfig.direction === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const left = sortValue(a, sortConfig.key);
      const right = sortValue(b, sortConfig.key);
      if (left < right) return -factor;
      if (left > right) return factor;
      return a.investor.localeCompare(b.investor, lang) || a.id - b.id;
    });
  }, [filtered, sortConfig, lang]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const hasFiltering = Object.keys(activeFilters).length > 0;

  const resetFilters = () => {
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

  const toggleColumn = (key: ColumnKey) => {
    setVisibleColumns(prev => {
      if (prev.includes(key)) return prev.length === 1 ? prev : prev.filter(item => item !== key);
      return COLUMN_KEYS.filter(item => item === key || prev.includes(item));
    });
  };

  const dateFormat = new Intl.DateTimeFormat(lang, { day: '2-digit', month: '2-digit', year: 'numeric' });
  const dateTimeFormat = new Intl.DateTimeFormat(lang, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const moneyFormat = new Intl.NumberFormat(lang, {
    style: 'currency',
    currency: call.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const empty = <span className="text-muted-foreground">-</span>;
  const date = (value: Date | null) =>
    value ? <span className="text-sm tabular-nums">{dateFormat.format(value)}</span> : empty;
  const dateTime = (value: Date) => <span className="text-sm tabular-nums">{dateTimeFormat.format(value)}</span>;
  const amount = (value: number) => (value > 0 ? <span className="text-sm">{moneyFormat.format(value)}</span> : empty);
  const notInMockup = (name: string) => toast.info(t('funds.capitalCalls.detail.toast.notInMockup', { name }));

  const columnDefinitions: Record<ColumnKey, ColumnConfig<CapitalCallLine>> = {
    investor: {
      key: 'investor',
      label: t(`${K}.columns.investor`),
      sortable: true,
      render: line => <ListingNameCell name={line.investor} />,
    },
    subscription: {
      key: 'subscription',
      label: t(`${K}.columns.subscription`),
      sortable: true,
      render: line => (
        <button
          type="button"
          onClick={event => {
            event.stopPropagation();
            notInMockup(line.subscription);
          }}
          className="text-left text-sm font-medium"
        >
          <ClickableText>
            <ListingTruncatedText text={line.subscription} />
          </ClickableText>
        </button>
      ),
    },
    share: {
      key: 'share',
      label: t(`${K}.columns.share`),
      sortable: true,
      render: line => (
        <span className="whitespace-nowrap text-sm">{t('funds.detail.sharePrefix', { name: line.share })}</span>
      ),
    },
    amount: {
      key: 'amount',
      label: t(`${K}.columns.amount`),
      sortable: true,
      align: 'right',
      render: line => <span className="text-sm">{moneyFormat.format(line.calledAmount)}</span>,
    },
    fees: {
      key: 'fees',
      label: t(`${K}.columns.fees`),
      sortable: true,
      align: 'right',
      render: line => amount(line.fees),
    },
    premium: {
      key: 'premium',
      label: t(`${K}.columns.premium`),
      sortable: true,
      align: 'right',
      render: line => amount(line.premium),
    },
    total: {
      key: 'total',
      label: t(`${K}.columns.total`),
      sortable: true,
      align: 'right',
      render: line => <span className="text-sm font-medium">{moneyFormat.format(line.total)}</span>,
    },
    status: {
      key: 'status',
      label: t(`${K}.columns.status`),
      sortable: true,
      render: line => <StatusBadge label={t(`${K}.states.${line.state}`)} variant={LINE_STATE_VARIANT[line.state]} />,
    },
    notifiedOn: {
      key: 'notifiedOn',
      label: t(`${K}.columns.notifiedOn`),
      sortable: true,
      render: line => date(line.notifiedAt),
    },
    remindedOn: {
      key: 'remindedOn',
      label: t(`${K}.columns.remindedOn`),
      sortable: true,
      render: line => date(line.lastReminderAt),
    },
    paidOn: {
      key: 'paidOn',
      label: t(`${K}.columns.paidOn`),
      sortable: true,
      render: line => date(line.paidAt),
    },
    createdAt: {
      key: 'createdAt',
      label: t(`${K}.columns.createdAt`),
      sortable: true,
      render: line => dateTime(line.createdAt),
    },
    updatedAt: {
      key: 'updatedAt',
      label: t(`${K}.columns.updatedAt`),
      sortable: true,
      render: line => dateTime(line.updatedAt),
    },
  };

  if (lines.length === 0) {
    return (
      <ListingCard>
        <EmptyState icon={Users} title={t(`${K}.empty.title`)} />
      </ListingCard>
    );
  }

  return (
    <ListingCard
      toolbar={
        <div className="flex items-start justify-between gap-3">
          <FilterBar
            className="flex-1"
            hideSearch
            searchValue=""
            onSearchChange={() => undefined}
            filters={filterConfigs}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onClearAll={resetFilters}
          />
          <ListingColumnsMenu
            columns={COLUMN_KEYS.map(key => ({ key, label: t(`${K}.columns.${key}`) }))}
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
            pageSizeOptions={[10, 20, 50]}
          />
        ) : undefined
      }
    >
      {sorted.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t(`${K}.empty.filteredTitle`)}
          description={t(`${K}.empty.filteredDescription`)}
          action={
            hasFiltering ? (
              <Button variant="outline" size="sm" onClick={resetFilters}>
                {t(`${K}.empty.reset`)}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <DataTable
          data={pageRows}
          columns={visibleColumns.map(key => columnDefinitions[key])}
          hoveredRow={hoveredRow}
          setHoveredRow={setHoveredRow}
          onRowClick={line => notInMockup(line.investor)}
          sortConfig={sortConfig}
          onSort={key =>
            setSortConfig(prev =>
              prev.key === key && prev.direction === 'asc' ? { key, direction: 'desc' } : { key, direction: 'asc' },
            )
          }
          compactMode
          hideSelection
          density="compact"
        />
      )}
    </ListingCard>
  );
}
