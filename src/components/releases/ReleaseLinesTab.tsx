import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { Users } from 'lucide-react';

import { useTranslation } from '../../utils/languageContext';
import type { Release, ReleaseLine } from '../../utils/releaseGenerator';
import { ColumnConfig, DataTable } from '../DataTable';
import { EmptyState } from '../EmptyState';
import { FilterBar, FilterConfig } from '../FilterBar';
import { ListingCard, ListingColumnsMenu, ListingNameCell } from '../ui/listing';
import { Button } from '../ui/button';
import { DataPagination } from '../ui/data-pagination';
import { TableRowActions } from '../ui/row-actions';
import type { NoticeContext } from '../../utils/noticeActions';
import { RELEASE_RULES } from '../../utils/noticeFamilies';
import {
  NOTICE_DOCUMENT_COLUMNS,
  NOTICE_DOCUMENT_HIDDEN,
  isNoticeDocumentColumn,
  useNoticeDocumentColumns,
  useNoticeSelection,
} from '../notices/noticeListing';
import { useNoticeLineActions } from '../notices/useNoticeLineActions';

const K = 'funds.releases.detail.lines';

const COLUMN_KEYS = [
  'investor',
  'share',
  'subscription',
  'amount',
  'fees',
  'iban',
  'bic',
  'notified',
  'notifiedOn',
  ...NOTICE_DOCUMENT_COLUMNS,
] as const;
type ColumnKey = (typeof COLUMN_KEYS)[number];

const HIDDEN_BY_DEFAULT: ColumnKey[] = ['fees', 'bic', 'notifiedOn', ...NOTICE_DOCUMENT_HIDDEN];
const DEFAULT_COLUMNS: ColumnKey[] = COLUMN_KEYS.filter(key => !HIDDEN_BY_DEFAULT.includes(key));
const UNSORTABLE: ColumnKey[] = ['iban', 'bic', 'notified'];
const RIGHT_ALIGNED: ColumnKey[] = ['amount', 'fees'];
const COLUMNS_STORAGE_KEY = 'investhub-columns-release-lines-v2';
const LISTING_STORAGE_KEY = 'investhub-listing-release-lines';

type NoticeDocumentColumnKey = (typeof NOTICE_DOCUMENT_COLUMNS)[number];
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

/** Filtres, tri et page de la session pour un déblocage, retrouvés au retour d'une fiche. */
function readListingState(releaseId: number): Partial<ListingState> {
  try {
    return JSON.parse(window.sessionStorage.getItem(`${LISTING_STORAGE_KEY}-${releaseId}`) ?? '{}') as Partial<ListingState>;
  } catch {
    return {};
  }
}

function sortValue(line: ReleaseLine, key: string): string | number {
  switch (key) {
    case 'investor':
      return line.investor.toLowerCase();
    case 'subscription':
      return line.subscription.toLowerCase();
    case 'share':
      return line.share.toLowerCase();
    case 'amount':
      return line.amount;
    case 'fees':
      return line.fees;
    case 'notifiedOn':
      return line.notifiedAt?.getTime() ?? 0;
    default:
      return 0;
  }
}

interface ReleaseLinesTabProps {
  release: Release;
  lines: ReleaseLine[];
  /** Parts du fonds, proposées par le filtre Part. */
  fundShares: string[];
  /** Réglages de l'objet et droits de l'utilisateur, pour la disponibilité des actions. */
  context: NoticeContext;
  onLinesChange: (update: (lines: ReleaseLine[]) => ReleaseLine[]) => void;
  onSend: (apply: (lines: ReleaseLine[]) => ReleaseLine[], onDone: () => void) => void;
}

export function ReleaseLinesTab({ release, lines, fundShares, context, onLinesChange, onSend }: ReleaseLinesTabProps) {
  const { t, lang } = useTranslation();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set());
  const documentColumns = useNoticeDocumentColumns<ReleaseLine>(RELEASE_RULES.documentKind);
  const lineActions = useNoticeLineActions({
    rules: RELEASE_RULES,
    context,
    parentName: release.name,
    fundName: release.fundName,
    lines,
    onLinesChange,
    onSend,
    onCompleted: () => setSelectedIds(new Set()),
  });
  const selection = useNoticeSelection(
    'lines',
    selectedIds,
    setSelectedIds,
    lineActions.bulkActions(lines.filter(line => selectedIds.has(line.id))),
  );
  const columnLabel = (key: ColumnKey) => (isNoticeDocumentColumn(key) ? documentColumns.label(key) : t(`${K}.columns.${key}`));
  const [stored] = useState(() => readListingState(release.id));
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(stored.activeFilters ?? {});
  const [sortConfig, setSortConfig] = useState<SortConfig>(stored.sortConfig ?? DEFAULT_SORT);
  const [page, setPage] = useState(stored.page ?? 1);
  const [pageSize, setPageSize] = useState(stored.pageSize ?? 20);
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(readStoredColumns);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  useEffect(() => {
    try {
      const state: ListingState = { activeFilters, sortConfig, page, pageSize };
      window.sessionStorage.setItem(`${LISTING_STORAGE_KEY}-${release.id}`, JSON.stringify(state));
    } catch {
      // Sans stockage de session, l'onglet repart de son état par défaut.
    }
  }, [release.id, activeFilters, sortConfig, page, pageSize]);

  useEffect(() => {
    try {
      window.localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(visibleColumns));
    } catch {
      // Préférence de confort : sans stockage, les colonnes par défaut s'appliquent.
    }
  }, [visibleColumns]);

  const filterConfigs: FilterConfig[] = useMemo(() => {
    const distinct = (pick: (line: ReleaseLine) => string) =>
      Array.from(new Set(lines.map(pick)))
        .sort((a, b) => a.localeCompare(b, lang))
        .map(value => ({ value, label: value }));
    return [
      { id: 'investor', label: t(`${K}.columns.investor`), type: 'multiselect', isPrimary: true, options: distinct(line => line.investor) },
      {
        id: 'share',
        label: t(`${K}.columns.share`),
        type: 'multiselect',
        isPrimary: true,
        options: fundShares.map(value => ({ value, label: t('funds.detail.sharePrefix', { name: value }) })),
      },
      {
        id: 'subscription',
        label: t(`${K}.columns.subscription`),
        type: 'multiselect',
        isPrimary: true,
        options: distinct(line => line.subscription),
      },
      {
        id: 'notified',
        label: t(`${K}.columns.notified`),
        type: 'select',
        isPrimary: true,
        options: [
          { value: 'yes', label: t(`${K}.yes`) },
          { value: 'no', label: t(`${K}.no`) },
        ],
      },
      documentColumns.filter,
    ];
  }, [lines, fundShares, lang, t]);

  const filtered = useMemo(() => {
    const pick = (id: string) => (Array.isArray(activeFilters[id]) ? (activeFilters[id] as string[]) : []);
    const investors = pick('investor');
    const subscriptions = pick('subscription');
    const shares = pick('share');
    const notified = typeof activeFilters.notified === 'string' ? activeFilters.notified : '';
    const sources = pick('documentSource');
    return lines.filter(line => {
      if (!documentColumns.matches(line, sources)) return false;
      if (investors.length > 0 && !investors.includes(line.investor)) return false;
      if (subscriptions.length > 0 && !subscriptions.includes(line.subscription)) return false;
      if (shares.length > 0 && !shares.includes(line.share)) return false;
      if (notified && (notified === 'yes') !== line.notified) return false;
      return true;
    });
  }, [lines, activeFilters]);

  const sorted = useMemo(() => {
    const factor = sortConfig.direction === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const value = (line: ReleaseLine) =>
        isNoticeDocumentColumn(sortConfig.key) ? documentColumns.sortValue(line, sortConfig.key) : sortValue(line, sortConfig.key);
      const left = value(a);
      const right = value(b);
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
  const moneyFormat = new Intl.NumberFormat(lang, { style: 'currency', currency: release.currency });
  const empty = <span className="text-muted-foreground">-</span>;
  const notInMockup = (name: string) => toast.info(t('funds.releases.detail.toast.notInMockup', { name }));

  const renderers: Record<Exclude<ColumnKey, NoticeDocumentColumnKey>, ColumnConfig<ReleaseLine>['render']> = {
    investor: line => <ListingNameCell name={line.investor} id={line.investorId} />,
    share: line => <span className="whitespace-nowrap text-sm">{t('funds.detail.sharePrefix', { name: line.share })}</span>,
    subscription: line => (
      <div
        onClick={event => {
          event.stopPropagation();
          notInMockup(line.subscription);
        }}
      >
        <ListingNameCell name={line.subscription} id={line.subscriptionId} />
      </div>
    ),
    amount: line => <span className="text-sm font-medium">{moneyFormat.format(line.amount)}</span>,
    fees: line => (line.fees > 0 ? <span className="text-sm">{moneyFormat.format(line.fees)}</span> : empty),
    iban: line => <span className="whitespace-nowrap text-sm tabular-nums">{line.iban}</span>,
    bic: line => <span className="whitespace-nowrap text-sm tabular-nums">{line.bic}</span>,
    notified: line => <span className="text-sm">{t(line.notified ? `${K}.yes` : `${K}.no`)}</span>,
    notifiedOn: line =>
      line.notifiedAt ? <span className="text-sm tabular-nums">{dateFormat.format(line.notifiedAt)}</span> : empty,
  };
  const actionsColumn: ColumnConfig<ReleaseLine> = {
    key: 'actions',
    label: t('funds.notices.common.columns.actions'),
    align: 'right',
    render: line => <TableRowActions actions={lineActions.rowActions(line)} />,
  };
  const columns: ColumnConfig<ReleaseLine>[] = [
    ...visibleColumns.map(key =>
      isNoticeDocumentColumn(key)
        ? documentColumns.columns[key]
        : {
            key,
            label: t(`${K}.columns.${key}`),
            sortable: !UNSORTABLE.includes(key),
            align: RIGHT_ALIGNED.includes(key) ? 'right' : undefined,
            render: renderers[key],
          },
    ),
    actionsColumn,
  ];

  if (lines.length === 0) {
    return (
      <ListingCard>
        <EmptyState icon={Users} title={t(`${K}.empty.title`)} />
      </ListingCard>
    );
  }

  return (
    <>
    {lineActions.dialogs}
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
            columns={COLUMN_KEYS.map(key => ({ key, label: columnLabel(key) }))}
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
          allFilteredData={sorted}
          selection={selection}
          hoveredRow={hoveredRow}
          setHoveredRow={setHoveredRow}
          onRowClick={line => notInMockup(line.investor)}
          isRowMuted={line => line.transferred}
          sortConfig={sortConfig}
          onSort={key =>
            setSortConfig(prev =>
              prev.key === key && prev.direction === 'asc' ? { key, direction: 'desc' } : { key, direction: 'asc' },
            )
          }
          compactMode
          density="compact"
        />
      )}
    </ListingCard>
    </>
  );
}
