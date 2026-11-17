import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner@2.0.3';
import {
  BellRing,
  CalendarX,
  FileArchive,
  FileSpreadsheet,
  List,
  Pencil,
  Plus,
  Send,
  ShieldX,
  Trash2,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

import { useTranslation } from '../../utils/languageContext';
import type { Fund } from '../../utils/fundGenerator';
import {
  CapitalCall,
  distinctNoticeDate,
  generateCapitalCalls,
} from '../../utils/capitalCallGenerator';
import { getDetailIdFromHash, onHashChange } from '../../utils/routing';
import {
  CapitalCallWizardSession,
  clearWizardSession,
  readWizardSession,
  writeWizardSession,
} from '../../utils/capitalCallWizardSession';
import { expireStaleNotices, generateCapitalCallLines } from '../../utils/capitalCallLines';
import { summarizeCall } from '../../utils/capitalCallSummary';
import { fundCallSettings } from '../../utils/capitalCallWizard';
import {
  CapitalCallAction,
  CapitalCallRights,
  FULL_RIGHTS,
  capitalCallBlocker,
} from '../../utils/capitalCallActions';
import { ColumnConfig, DataTable } from '../DataTable';
import { EmptyState } from '../EmptyState';
import { FilterBar, FilterConfig } from '../FilterBar';
import { ClickableText } from '../ClickableText';
import { HighlightText } from '../HighlightText';
import { ListingCard, ListingColumnsMenu, ListingNameCell } from '../ui/listing';
import { TableRowActions } from '../ui/row-actions';
import { DemoScenarioBar } from '../ui/demo-scenario-bar';
import { FilterCard, FilterCardGroup } from '../ui/filter-card';
import { PageHeader } from '../ui/page-header';
import { PageStateBanner } from '../ui/page-state-banner';
import { DataPagination } from '../ui/data-pagination';
import { Button } from '../ui/button';
import { ConfirmDialog } from '../ui/confirm-dialog';
import { CapitalCallDetailPage } from './CapitalCallDetailPage';
import { CapitalCallDraft, CapitalCallWizard, WIZARD_STEPS } from './wizard/CapitalCallWizard';

const K = 'funds.capitalCalls';

type ColumnKey = 'name' | 'fund' | 'dueDate' | 'noticeDate' | 'amount' | 'externalId' | 'createdAt' | 'updatedAt';

const COLUMN_KEYS: ColumnKey[] = ['name', 'fund', 'dueDate', 'noticeDate', 'amount', 'externalId', 'createdAt', 'updatedAt'];
const DEFAULT_COLUMNS: ColumnKey[] = ['name', 'fund', 'dueDate', 'amount'];
const COLUMNS_STORAGE_KEY = 'investhub-columns-capital-calls-v4';
const LISTING_STORAGE_KEY = 'investhub-listing-capital-calls';

type Queue = 'all' | 'toNotify' | 'overdue';

/** Identifiant d'URL de l'assistant de création. */
const NEW_CALL_ID = 'new';


type Scenario = 'default' | 'limitedScope' | 'noNotifyRight' | 'subscriptionActivated' | 'noRight';
const SCENARIOS: Scenario[] = ['default', 'limitedScope', 'noNotifyRight', 'subscriptionActivated', 'noRight'];

const SCENARIO_RIGHTS: Record<Scenario, CapitalCallRights> = {
  default: FULL_RIGHTS,
  limitedScope: FULL_RIGHTS,
  noNotifyRight: { ...FULL_RIGHTS, notify: false },
  subscriptionActivated: FULL_RIGHTS,
  noRight: FULL_RIGHTS,
};

/** Ordre des actions de ligne : les trois premières en boutons, les suivantes dans le menu ⋮. */
const ROW_ACTIONS: { action: CapitalCallAction; icon: LucideIcon; separatorBefore?: boolean }[] = [
  { action: 'notify', icon: Send },
  { action: 'relaunch', icon: BellRing },
  { action: 'edit', icon: Pencil },
  { action: 'exportTarget', icon: Users },
  { action: 'exportNotices', icon: FileArchive },
  { action: 'exportLines', icon: FileSpreadsheet },
  { action: 'delete', icon: Trash2, separatorBefore: true },
];

/** Utilisateur connecté de la maquette, affiché dans l'en-tête. */
const CURRENT_USER = 'Jean Dault';

const NOTIFY_DURATION = 6000;
const RELAUNCH_DURATION = 4000;

type SortConfig = { key: string; direction: 'asc' | 'desc' };
type ActiveFilters = Record<string, string | string[]>;

const DEFAULT_SORT: SortConfig = { key: 'dueDate', direction: 'desc' };

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

function fundFilter(fundIds: number[] | undefined): ActiveFilters {
  return fundIds && fundIds.length > 0 ? { fund: fundIds.map(String) } : {};
}

function parseIsoDay(iso: string | undefined, endOfDay = false) {
  if (!iso) return undefined;
  const [year, month, day] = iso.split('-').map(Number);
  return endOfDay ? new Date(year, month - 1, day, 23, 59, 59, 999) : new Date(year, month - 1, day);
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
    case 'noticeDate':
      return distinctNoticeDate(call)?.getTime() ?? 0;
    case 'amount':
      return call.calledAmount;
    case 'externalId':
      return (call.externalId ?? '').toLowerCase();
    case 'createdAt':
      return call.createdAt.getTime();
    case 'updatedAt':
      return call.updatedAt.getTime();
    default:
      return 0;
  }
}

interface CapitalCallsPageProps {
  funds: Fund[];
  /** Filtre fonds appliqué à l'ouverture, depuis la fiche d'un fonds. */
  initialFundIds?: number[];
  onOpenFund: (fundId: number) => void;
  /** Nom de l'appel ouvert, pour le fil d'Ariane. */
  onSelectedCallChange?: (name: string | null) => void;
}

export function CapitalCallsPage({ funds, initialFundIds, onOpenFund, onSelectedCallChange }: CapitalCallsPageProps) {
  const { t, lang } = useTranslation();
  const [scenario, setScenario] = useState<Scenario>('default');
  const [queue, setQueue] = useState<Queue>('all');
  const [stored] = useState(readListingState);
  const openedFromFund = Boolean(initialFundIds && initialFundIds.length > 0);
  const [search, setSearch] = useState(openedFromFund ? '' : stored.search ?? '');
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(() =>
    openedFromFund ? fundFilter(initialFundIds) : stored.activeFilters ?? {},
  );
  const [sortConfig, setSortConfig] = useState<SortConfig>(stored.sortConfig ?? DEFAULT_SORT);
  const [page, setPage] = useState(openedFromFund ? 1 : stored.page ?? 1);
  const [pageSize, setPageSize] = useState(stored.pageSize ?? 20);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(readStoredColumns);
  const [allCalls, setAllCalls] = useState<CapitalCall[]>(() => generateCapitalCalls(funds));
  const [pendingDelete, setPendingDelete] = useState<CapitalCall | null>(null);
  /** Une seule préparation en attente par utilisateur, comme une session d'envoi en masse. */
  const [wizardSession, setWizardSession] = useState<CapitalCallWizardSession | null>(() => readWizardSession(CURRENT_USER));
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const timers = useRef<number[]>([]);
  const rights = SCENARIO_RIGHTS[scenario];

  const [selectedId, setSelectedId] = useState<string | null>(getDetailIdFromHash);

  useEffect(() => () => timers.current.forEach(id => window.clearTimeout(id)), []);
  useEffect(() => onHashChange(() => setSelectedId(getDetailIdFromHash())), []);

  const initialFundKey = (initialFundIds ?? []).join(',');
  const appliedFundKey = useRef(initialFundKey);
  useEffect(() => {
    if (appliedFundKey.current === initialFundKey) return;
    appliedFundKey.current = initialFundKey;
    setActiveFilters(fundFilter(initialFundKey ? initialFundKey.split(',').map(Number) : []));
    setPage(1);
  }, [initialFundKey]);

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
    const ids = Array.from(new Set(allCalls.map(call => call.fundId))).sort((a, b) => a - b);
    return new Set(scenario === 'limitedScope' ? ids.slice(0, 2) : ids);
  }, [allCalls, scenario]);

  const scopedCalls = useMemo(() => allCalls.filter(call => scopeFundIds.has(call.fundId)), [allCalls, scopeFundIds]);

  const linesByCall = useMemo(
    () => new Map(allCalls.map(call => [call.id, expireStaleNotices(generateCapitalCallLines(call))])),
    [allCalls],
  );
  const summaries = useMemo(
    () => new Map(allCalls.map(call => [call.id, summarizeCall(call, linesByCall.get(call.id) ?? [])])),
    [allCalls, linesByCall],
  );
  const summaryOf = (call: CapitalCall) => summaries.get(call.id)!;
  const today = new Date();
  const inQueue = (call: CapitalCall, id: Queue) => {
    const summary = summaryOf(call);
    if (id === 'toNotify') return summary.toNotify > 0;
    if (id === 'overdue') return call.dueDate < today && summary.settled < summary.lines;
    return true;
  };

  const filterConfigs: FilterConfig[] = useMemo(() => {
    const seen = new Map<number, string>();
    scopedCalls.forEach(call => seen.set(call.fundId, call.fundName));
    const fundOptions = Array.from(seen, ([id, name]) => ({ value: String(id), label: name })).sort((a, b) =>
      a.label.localeCompare(b.label, lang),
    );
    return [
      { id: 'fund', label: t(`${K}.filters.funds`), type: 'multiselect', isPrimary: true, options: fundOptions },
      { id: 'duePeriod', label: t(`${K}.filters.duePeriod`), type: 'dateRange', isPrimary: true },
    ];
  }, [scopedCalls, lang, t]);

  const filteredCalls = useMemo(() => {
    const term = search.trim().toLowerCase();
    const fundIds = Array.isArray(activeFilters.fund) ? activeFilters.fund : [];
    const [fromIso, toIso] = Array.isArray(activeFilters.duePeriod) ? activeFilters.duePeriod : [];
    const from = parseIsoDay(fromIso);
    const to = parseIsoDay(toIso, true);
    return scopedCalls.filter(call => {
      if (!inQueue(call, queue)) return false;
      if (term && !call.name.toLowerCase().includes(term) && String(call.id) !== term) return false;
      if (fundIds.length > 0 && !fundIds.includes(String(call.fundId))) return false;
      if (from && call.dueDate < from) return false;
      if (to && call.dueDate > to) return false;
      return true;
    });
  }, [scopedCalls, queue, search, activeFilters, summaries]);

  const selectedCall = selectedId ? allCalls.find(call => String(call.id) === selectedId) : undefined;
  const selectedInScope = Boolean(selectedCall && scopeFundIds.has(selectedCall.fundId) && scenario !== 'noRight');
  const creatingCall = selectedId === NEW_CALL_ID;
  const breadcrumbName = creatingCall ? t(`${K}.wizard.title`) : selectedCall && selectedInScope ? selectedCall.name : null;
  useEffect(() => {
    onSelectedCallChange?.(breadcrumbName);
    return () => onSelectedCallChange?.(null);
  }, [breadcrumbName, onSelectedCallChange]);

  const sortedCalls = useMemo(() => {
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
  const dateTimeFormat = useMemo(
    () => new Intl.DateTimeFormat(lang, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    [lang],
  );
  const money = (call: CapitalCall) =>
    new Intl.NumberFormat(lang, { style: 'currency', currency: call.currency, maximumFractionDigits: 0 }).format(
      call.calledAmount,
    );
  const empty = <span className="text-muted-foreground">-</span>;

  const hasFiltering = Object.keys(activeFilters).length > 0 || search.trim().length > 0 || queue !== 'all';

  const resetFilters = () => {
    setSearch('');
    setActiveFilters({});
    setQueue('all');
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

  const blockerReason = (call: CapitalCall, action: CapitalCallAction) => {
    const blocker = capitalCallBlocker(call, action, rights);
    return blocker ? t(`${K}.blockers.${blocker}`) : null;
  };

  const updateCall = (id: number, patch: (call: CapitalCall) => Partial<CapitalCall>) =>
    setAllCalls(prev => prev.map(call => (call.id === id ? { ...call, ...patch(call) } : call)));

  const later = (delay: number, run: () => void) => {
    timers.current.push(window.setTimeout(run, delay));
  };

  /** Point d'entrée unique des actions : le contrôle serveur est refait quelle que soit l'origine du geste. */
  const runAction = (callId: number, action: CapitalCallAction) => {
    const call = allCalls.find(item => item.id === callId);
    if (!call) return;
    const reason = blockerReason(call, action);
    if (reason) {
      toast.error(t(`${K}.toast.refused`, { name: call.name }), { description: reason });
      return;
    }
    switch (action) {
      case 'notify':
        updateCall(call.id, () => ({ sending: true }));
        toast.info(t(`${K}.toast.notifyStarted`, { name: call.name }));
        later(NOTIFY_DURATION, () => {
          // Les lignes notifiées et non réglées deviennent relançables.
          updateCall(call.id, current => ({ sending: false, notifiedLines: current.lines, linesToRelaunch: current.lines }));
          toast.success(t(`${K}.toast.notifyDone`, { name: call.name }));
        });
        break;
      case 'relaunch':
        updateCall(call.id, () => ({ sending: true }));
        toast.info(t(`${K}.toast.relaunchStarted`, { name: call.name, count: call.linesToRelaunch }));
        later(RELAUNCH_DURATION, () => {
          updateCall(call.id, () => ({ sending: false }));
          toast.success(t(`${K}.toast.relaunchDone`, { name: call.name }));
        });
        break;
      case 'delete':
        setPendingDelete(call);
        break;
      case 'edit':
        toast.info(t(`${K}.toast.editComingSoon`));
        break;
      default:
        toast.info(t(`${K}.toast.exportComingSoon`, { action: t(`${K}.actions.${action}`) }));
    }
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const current = allCalls.find(item => item.id === pendingDelete.id);
    const reason = current ? blockerReason(current, 'delete') : null;
    setPendingDelete(null);
    if (!current) return;
    if (reason) {
      toast.error(t(`${K}.toast.refused`, { name: current.name }), { description: reason });
      return;
    }
    setAllCalls(prev => prev.filter(item => item.id !== current.id));
    toast.success(t(`${K}.toast.deleted`, { name: current.name }));
  };

  const createCall = (draft: CapitalCallDraft) => {
    const id = allCalls.reduce((max, call) => Math.max(max, call.id), 0) + 1;
    const call: CapitalCall = {
      id,
      fundId: draft.fund.id,
      fundName: draft.fund.name,
      currency: draft.currency,
      name: draft.name,
      dueDate: draft.dueDate,
      noticeDate: draft.noticeDate,
      calledAmount: draft.calledAmount,
      releasedAmount: draft.shares.reduce((sum, share) => sum + share.releasedAmount, 0),
      netCashFlow: draft.shares.some(share => share.netCashFlow !== null)
        ? draft.shares.reduce((sum, share) => sum + (share.netCashFlow ?? 0), 0)
        : null,
      origin: 'backOffice',
      compensations: draft.compensations,
      forecast: draft.forecast,
      shares: draft.shares,
      message: draft.message,
      attachments: draft.attachments,
      externalId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      sending: false,
      lines: draft.lines,
      notifiedLines: 0,
      linesToRelaunch: 0,
      diffusion: draft.diffusion,
      justCreated: true,
    };
    setAllCalls(prev => [call, ...prev]);
    toast.success(t(`${K}.toast.created`, { name: call.name, count: call.lines }));
    window.location.hash = `#/capital-calls/${id}`;
  };

  const updateWizardSession = (session: CapitalCallWizardSession) => {
    setWizardSession(session);
    writeWizardSession(CURRENT_USER, session);
  };

  const discardWizardSession = () => {
    setWizardSession(null);
    clearWizardSession(CURRENT_USER);
  };

  const openListing = () => {
    window.location.hash = '#/capital-calls';
  };

  const simulateDirectNotify = () => {
    const target = scopedCalls.find(call => call.notifiedLines < call.lines && !call.sending) ?? scopedCalls[0];
    if (target) runAction(target.id, 'notify');
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
      render: (call, term) => (
        <button
          type="button"
          onClick={event => {
            event.stopPropagation();
            onOpenFund(call.fundId);
          }}
          className="text-left text-sm font-medium"
        >
          <ClickableText>
            <HighlightText text={call.fundName} searchTerm={term} />
          </ClickableText>
        </button>
      ),
    },
    name: {
      key: 'name',
      label: t(`${K}.columns.name`),
      sortable: true,
      render: (call, term) => <ListingNameCell name={call.name} searchTerm={term} id={call.id} />,
    },
    dueDate: {
      key: 'dueDate',
      label: t(`${K}.columns.dueDate`),
      sortable: true,
      render: call => <span className="text-sm tabular-nums">{dateFormat.format(call.dueDate)}</span>,
    },
    noticeDate: {
      key: 'noticeDate',
      label: t(`${K}.columns.noticeDate`),
      sortable: true,
      render: call => {
        const noticeDate = distinctNoticeDate(call);
        return noticeDate ? <span className="text-sm tabular-nums">{dateFormat.format(noticeDate)}</span> : empty;
      },
    },
    amount: {
      key: 'amount',
      label: t(`${K}.columns.amount`),
      sortable: true,
      align: 'right',
      render: call => <span className="text-sm">{money(call)}</span>,
    },
    externalId: {
      key: 'externalId',
      label: t(`${K}.columns.externalId`),
      sortable: true,
      render: call => (call.externalId ? <span className="text-sm tabular-nums">{call.externalId}</span> : empty),
    },
    createdAt: {
      key: 'createdAt',
      label: t(`${K}.columns.createdAt`),
      sortable: true,
      render: call => <span className="text-sm tabular-nums">{dateTimeFormat.format(call.createdAt)}</span>,
    },
    updatedAt: {
      key: 'updatedAt',
      label: t(`${K}.columns.updatedAt`),
      sortable: true,
      render: call => <span className="text-sm tabular-nums">{dateTimeFormat.format(call.updatedAt)}</span>,
    },
  };

  const actionsColumn: ColumnConfig<CapitalCall> = {
    key: 'actions',
    label: t(`${K}.columns.actions`),
    align: 'right',
    render: call => (
      <TableRowActions
        actions={ROW_ACTIONS.map(({ action, icon, separatorBefore }) => ({
          label: t(`${K}.actions.${action}`),
          icon,
          intent: action === 'delete' ? 'danger' : 'neutral',
          separatorBefore,
          disabledReason: blockerReason(call, action) ?? undefined,
          onClick: () => runAction(call.id, action),
        }))}
      />
    ),
  };

  const columns = [...visibleColumns.map(key => columnDefinitions[key]), actionsColumn];

  const queueCard = (id: Queue, icon: typeof List, calls: CapitalCall[]) => {
    const fundCount = new Set(calls.map(call => call.fundId)).size;
    const perFund = fundCount > 0 ? calls.length / fundCount : 0;
    return (
      <FilterCard
        status={id}
        activeStatus={queue}
        onStatusChange={status => {
          setQueue(status as Queue);
          setPage(1);
        }}
        label={t(`${K}.queues.${id}`)}
        icon={icon}
        total={calls.length}
        metricLabel={t(`${K}.queues.fundsMetric`)}
        metricValue={String(fundCount)}
        averageValue={t(`${K}.queues.perFund`, {
          count: new Intl.NumberFormat(lang, { maximumFractionDigits: 1 }).format(perFund),
        })}
      />
    );
  };

  const columnsMenu = (
    <ListingColumnsMenu
      columns={COLUMN_KEYS.map(key => ({ key, label: t(`${K}.columns.${key}`) }))}
      visible={visibleColumns}
      onToggle={key => toggleColumn(key as ColumnKey)}
      onReset={() => setVisibleColumns(DEFAULT_COLUMNS)}
    />
  );

  const scenarioBar = (
    <DemoScenarioBar
      label={t(`${K}.scenario.label`)}
      value={scenario}
      options={SCENARIOS.map(item => ({ value: item, label: t(`${K}.scenario.options.${item}`) }))}
      onChange={value => {
        setScenario(value);
        resetFilters();
      }}
      action={
        scenario === 'noNotifyRight' ? (
          <Button variant="outline" size="sm" className="bg-card" onClick={simulateDirectNotify}>
            {t(`${K}.scenario.simulateDirectNotify`)}
          </Button>
        ) : undefined
      }
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

  const deleteDialog = (
    <ConfirmDialog
      open={Boolean(pendingDelete)}
      onOpenChange={open => !open && setPendingDelete(null)}
      title={t(`${K}.deleteDialog.title`, { name: pendingDelete?.name ?? '' })}
      description={t(`${K}.deleteDialog.description`, { fund: pendingDelete?.fundName ?? '' })}
      confirmLabel={t(`${K}.deleteDialog.confirm`)}
      destructive
      onConfirm={confirmDelete}
    />
  );

  if (creatingCall) {
    if (!rights.manage) return deniedPage(t(`${K}.blockers.missingRight`));
    return (
      <div className="flex min-h-screen flex-1 flex-col bg-muted">
        {scenarioBar}
        <CapitalCallWizard
          funds={funds.filter(fund => scopeFundIds.has(fund.id))}
          session={wizardSession}
          subscriptionActivatedMeanwhile={scenario === 'subscriptionActivated'}
          onSessionChange={updateWizardSession}
          onSessionClear={discardWizardSession}
          onCreate={createCall}
          onExit={openListing}
        />
      </div>
    );
  }

  if (selectedId) {
    if (!selectedCall) return deniedPage(t(`${K}.accessDenied.notFoundDescription`), t(`${K}.accessDenied.notFoundTitle`));
    if (!selectedInScope) return deniedPage(t(`${K}.accessDenied.outOfScopeDescription`));
    return (
      <div className="flex min-h-screen flex-1 flex-col bg-muted">
        <CapitalCallDetailPage
          key={selectedCall.id}
          call={selectedCall}
          lines={linesByCall.get(selectedCall.id) ?? []}
          fundShares={funds.find(fund => fund.id === selectedCall.fundId)?.shareClasses.map(item => item.name) ?? []}
          settings={fundCallSettings({ id: selectedCall.fundId })}
          onOpenFund={onOpenFund}
          onBack={openListing}
        />
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
          label: wizardSession ? t(`${K}.actions.resumePreparation`) : t(`${K}.actions.new`),
          icon: <Plus className="h-4 w-4" />,
          onClick: () => {
            window.location.hash = `#/capital-calls/${NEW_CALL_ID}`;
          },
          disabledReason: rights.manage ? undefined : t(`${K}.blockers.missingRight`),
        }}
      />

      {deleteDialog}

      <ConfirmDialog
        open={confirmDiscard}
        onOpenChange={setConfirmDiscard}
        title={t(`${K}.wizard.abandon.title`)}
        description={t(`${K}.wizard.abandon.description`)}
        confirmLabel={t(`${K}.wizard.abandon.confirm`)}
        cancelLabel={t(`${K}.wizard.abandon.keep`)}
        destructive
        onConfirm={() => {
          setConfirmDiscard(false);
          discardWizardSession();
        }}
      />

      <div className="flex flex-1 flex-col gap-4 px-6 py-6">
        {wizardSession && rights.manage && (
          <PageStateBanner
            variant="pendingWizard"
            title={t(`${K}.pendingWizard.title`, {
              name: wizardSession.name.trim() || t(`${K}.wizard.title`),
            })}
            description={t(`${K}.pendingWizard.description`, {
              fund: funds.find(fund => fund.id === wizardSession.fundId)?.name ?? t(`${K}.pendingWizard.noFund`),
              step: t(`${K}.wizard.steps.${WIZARD_STEPS[wizardSession.step] ?? WIZARD_STEPS[0]}`),
              date: dateTimeFormat.format(new Date(wizardSession.savedAt)),
            })}
            resumeLabel={t(`${K}.pendingWizard.resume`)}
            discardLabel={t(`${K}.pendingWizard.discard`)}
            onResume={() => {
              window.location.hash = `#/capital-calls/${NEW_CALL_ID}`;
            }}
            onDiscard={() => setConfirmDiscard(true)}
          />
        )}
        <FilterCardGroup title={t(`${K}.queues.label`)} hint={t(`${K}.queues.clickToFilter`)} columns={3}>
            {queueCard('all', List, scopedCalls)}
            {queueCard('toNotify', Send, scopedCalls.filter(call => inQueue(call, 'toNotify')))}
            {queueCard('overdue', CalendarX, scopedCalls.filter(call => inQueue(call, 'overdue')))}
        </FilterCardGroup>

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
              {columnsMenu}
            </div>
          }
          footer={
            sortedCalls.length > 0 ? (
              <DataPagination
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={sortedCalls.length}
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
          {sortedCalls.length === 0 ? (
            <EmptyState
              icon={Wallet}
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
            <>
              <DataTable
                data={pageRows}
                columns={columns}
                hoveredRow={hoveredRow}
                setHoveredRow={setHoveredRow}
                onRowClick={call => {
                  window.location.hash = `#/capital-calls/${call.id}`;
                }}
                sortConfig={sortConfig}
                onSort={key =>
                  setSortConfig(prev =>
                    prev.key === key && prev.direction === 'asc' ? { key, direction: 'desc' } : { key, direction: 'asc' },
                  )
                }
                searchTerm={search}
                compactMode
                hideSelection
                density="compact"
              />
            </>
          )}
        </ListingCard>
      </div>
    </div>
  );
}
