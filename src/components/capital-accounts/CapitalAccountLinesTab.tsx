import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { Users } from 'lucide-react';

import { useTranslation } from '../../utils/languageContext';
import {
  CAPITAL_ACCOUNT_LINE_STATES,
  type CapitalAccount,
  type CapitalAccountLine,
  type CapitalAccountLineState,
} from '../../utils/capitalAccountGenerator';
import { ClickableText } from '../ClickableText';
import { ColumnConfig, DataTable } from '../DataTable';
import { EmptyState } from '../EmptyState';
import { FilterBar, FilterConfig } from '../FilterBar';
import { ListingCard, ListingColumnsMenu, ListingNameCell, ListingTruncatedText } from '../ui/listing';
import { StatusBadge, type StatusVariant } from '../StatusBadge';
import { Button } from '../ui/button';
import { DataPagination } from '../ui/data-pagination';

const K = 'funds.capitalAccounts.detail.lines';

const COLUMN_KEYS = [
  'investor',
  'subscription',
  'share',
  'capitalGains',
  'unrealizedGains',
  'netResult',
  'status',
  'notifiedOn',
  'createdAt',
  'updatedAt',
] as const;
type ColumnKey = (typeof COLUMN_KEYS)[number];

const HIDDEN_BY_DEFAULT: ColumnKey[] = ['capitalGains', 'unrealizedGains', 'netResult', 'createdAt', 'updatedAt'];
const DEFAULT_COLUMNS: ColumnKey[] = COLUMN_KEYS.filter(key => !HIDDEN_BY_DEFAULT.includes(key));
const COLUMNS_STORAGE_KEY = 'investhub-columns-capital-account-lines';
const LISTING_STORAGE_KEY = 'investhub-listing-capital-account-lines';

const STATE_VARIANT: Record<CapitalAccountLineState, StatusVariant> = {
  created: 'neutral',
  notified: 'info',
};

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

/** Filtres, tri et page de la session pour un capital account, retrouvés au retour d'une fiche. */
function readListingState(accountId: number): Partial<ListingState> {
  try {
    return JSON.parse(
      window.sessionStorage.getItem(`${LISTING_STORAGE_KEY}-${accountId}`) ?? '{}',
    ) as Partial<ListingState>;
  } catch {
    return {};
  }
}

function sortValue(line: CapitalAccountLine, key: string): string | number {
  switch (key) {
    case 'investor':
      return line.investor.toLowerCase();
    case 'subscription':
      return line.subscription.toLowerCase();
    case 'share':
      return line.share.toLowerCase();
    case 'capitalGains':
      return line.capitalGains ?? 0;
    case 'unrealizedGains':
      return line.unrealizedGains ?? 0;
    case 'netResult':
      return line.netResult ?? 0;
    case 'status':
      return CAPITAL_ACCOUNT_LINE_STATES.indexOf(line.state);
    case 'notifiedOn':
      return line.notifiedAt?.getTime() ?? 0;
    case 'createdAt':
      return line.createdAt.getTime();
    case 'updatedAt':
      return line.updatedAt.getTime();
    default:
      return 0;
  }
}

interface CapitalAccountLinesTabProps {
  account: CapitalAccount;
  lines: CapitalAccountLine[];
  /** Parts du fonds, proposées par le filtre Part. */
  fundShares: string[];
}

export function CapitalAccountLinesTab({ account, lines, fundShares }: CapitalAccountLinesTabProps) {
  const { t, lang } = useTranslation();
  const [stored] = useState(() => readListingState(account.id));
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(stored.activeFilters ?? {});
  const [sortConfig, setSortConfig] = useState<SortConfig>(stored.sortConfig ?? DEFAULT_SORT);
  const [page, setPage] = useState(stored.page ?? 1);
  const [pageSize, setPageSize] = useState(stored.pageSize ?? 20);
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(readStoredColumns);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  useEffect(() => {
    try {
      const state: ListingState = { activeFilters, sortConfig, page, pageSize };
      window.sessionStorage.setItem(`${LISTING_STORAGE_KEY}-${account.id}`, JSON.stringify(state));
    } catch {
      // Sans stockage de session, l'onglet repart de son état par défaut.
    }
  }, [account.id, activeFilters, sortConfig, page, pageSize]);

  useEffect(() => {
    try {
      window.localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(visibleColumns));
    } catch {
      // Préférence de confort : sans stockage, les colonnes par défaut s'appliquent.
    }
  }, [visibleColumns]);

  const filterConfigs: FilterConfig[] = useMemo(() => {
    const distinct = (pick: (line: CapitalAccountLine) => string) =>
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
        options: CAPITAL_ACCOUNT_LINE_STATES.map(value => ({ value, label: t(`${K}.states.${value}`) })),
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
    currency: account.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const empty = <span className="text-muted-foreground">-</span>;
  const dateTime = (value: Date) => <span className="text-sm tabular-nums">{dateTimeFormat.format(value)}</span>;
  const amount = (value: number | null) => (value !== null ? <span className="text-sm">{moneyFormat.format(value)}</span> : empty);
  const notInMockup = (name: string) => toast.info(t('funds.capitalAccounts.detail.toast.notInMockup', { name }));

  const renderers: Record<ColumnKey, ColumnConfig<CapitalAccountLine>['render']> = {
    investor: line => <ListingNameCell name={line.investor} />,
    subscription: line => (
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
    share: line => <span className="whitespace-nowrap text-sm">{t('funds.detail.sharePrefix', { name: line.share })}</span>,
    capitalGains: line => amount(line.capitalGains),
    unrealizedGains: line => amount(line.unrealizedGains),
    netResult: line => amount(line.netResult),
    status: line => <StatusBadge label={t(`${K}.states.${line.state}`)} variant={STATE_VARIANT[line.state]} />,
    notifiedOn: line =>
      line.notifiedAt ? <span className="text-sm tabular-nums">{dateFormat.format(line.notifiedAt)}</span> : empty,
    createdAt: line => dateTime(line.createdAt),
    updatedAt: line => dateTime(line.updatedAt),
  };
  const RIGHT_ALIGNED: ColumnKey[] = ['capitalGains', 'unrealizedGains', 'netResult'];
  const columns: ColumnConfig<CapitalAccountLine>[] = visibleColumns.map(key => ({
    key,
    label: t(`${K}.columns.${key}`),
    sortable: true,
    align: RIGHT_ALIGNED.includes(key) ? 'right' : undefined,
    render: renderers[key],
  }));

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
          columns={columns}
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
