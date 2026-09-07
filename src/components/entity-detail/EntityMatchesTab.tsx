import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  Bell,
  BellRing,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  HelpCircle,
  History,
  List,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  X,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { FilterCard } from '../ui/filter-card';
import { BulkActionBar } from '../ui/bulk-action-bar';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { FilterBar, type FilterConfig } from '../FilterBar';
import { StatusBadge } from '../StatusBadge';
import { Tag } from '../Tag';
import { AlertDetailDrawer } from '../AlertDetailDrawer';
import { AlertBulkActionDialog } from '../AlertBulkActionDialog';
import type { AlertBulkAction } from '../AlertDataTable';
import { DecisionRevisionDialog } from './DecisionRevisionDialog';
import { useBulkSelection } from '../../hooks/useBulkSelection';
import { useTranslation } from '../../utils/languageContext';
import { useCompliance } from '../../utils/complianceContext';
import type { AlertItem, AlertListCategory } from '../../utils/alertsGenerator';
import {
  matchNeedsAction,
  matchOpenStatus,
  matchToAlertItem,
  type EntityRow,
  type MatchAlertKind,
  type MatchDecisionValue,
  type MatchOpenStatus,
  type ScreeningMatch,
} from '../../utils/screeningMock';
import {
  CATEGORY_KEY,
  CHANGE_KEY,
  DECISION_KEY,
  DECISION_VARIANT,
  OPEN_STATUS_KEY,
  OPEN_STATUS_VARIANT,
  formatDate,
  formatDateTime,
  formatRelativeTime,
} from './entityDetailShared';

export type MatchFilter = MatchOpenStatus | 'all';

interface EntityMatchesTabProps {
  entity: EntityRow;
  matches: ScreeningMatch[];
  /** Requested filter (changes reset the view). */
  requestedFilter?: { filter: MatchFilter; category?: AlertListCategory; seq: number };
  /** Increment to select every pending match and show the bulk bar. */
  focusPendingSignal?: number;
}

const FILTER_ORDER: MatchFilter[] = ['todo', 'unsure', 'confirmed', 'rejected', 'all'];

const CATEGORY_OPTIONS: AlertListCategory[] = [
  'PEP',
  'Watch List',
  'Sanctions',
  'Adverse Media',
  'Crime',
  'Financial Warning',
];

const HISTORY_ICON: Record<MatchAlertKind, typeof Bell> = {
  new: Bell,
  change: RefreshCw,
  reopened: BellRing,
};

const toDecision = (action: AlertBulkAction): MatchDecisionValue =>
  action === 'escalate' ? 'unsure' : action;

export function EntityMatchesTab({ entity, matches, requestedFilter, focusPendingSignal = 0 }: EntityMatchesTabProps) {
  const { t, lang } = useTranslation();
  const { qualifyMatches } = useCompliance();

  const [activeFilter, setActiveFilter] = useState<MatchFilter>('all');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [drawerMatchId, setDrawerMatchId] = useState<string | null>(null);
  const [bulkAction, setBulkAction] = useState<AlertBulkAction | null>(null);
  const [singleQualify, setSingleQualify] = useState<{ matchId: string; action: AlertBulkAction } | null>(null);
  const [reviseMatchId, setReviseMatchId] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<{ name: string; count: number } | null>(null);
  const [pendingSelectAll, setPendingSelectAll] = useState(false);

  useEffect(() => {
    if (!requestedFilter) return;
    setActiveFilter(requestedFilter.filter);
    setSearch('');
    setFilters(requestedFilter.category ? { category: requestedFilter.category } : {});
  }, [requestedFilter?.seq]);

  useEffect(() => {
    if (focusPendingSignal > 0) {
      setActiveFilter('all');
      setSearch('');
      setFilters({});
      setPendingSelectAll(true);
    }
  }, [focusPendingSignal]);

  const counters = entity.counters;

  const filterConfigs = useMemo<FilterConfig[]>(
    () => [
      {
        id: 'source',
        label: t('complianceEntities.matches.filters.source'),
        type: 'select',
        isPrimary: true,
        placeholder: t('complianceEntities.matches.filters.source'),
        options: [
          { value: 'Membercheck', label: 'Membercheck' },
          { value: 'ORIAS', label: 'ORIAS' },
        ],
      },
      {
        id: 'category',
        label: t('complianceEntities.matches.filters.category'),
        type: 'select',
        isPrimary: true,
        placeholder: t('complianceEntities.matches.filters.category'),
        options: CATEGORY_OPTIONS.map((c) => ({ value: c, label: t(CATEGORY_KEY[c]) })),
      },
      {
        id: 'change',
        label: t('complianceEntities.matches.filters.change'),
        type: 'select',
        isPrimary: false,
        placeholder: t('complianceEntities.matches.filters.change'),
        options: [
          { value: 'New', label: t('complianceAlerts.changes.new') },
          { value: 'Modified', label: t('complianceAlerts.changes.modified') },
          { value: 'Reopened', label: t('complianceAlerts.changes.reopened') },
          { value: 'none', label: t('complianceEntities.matches.filters.changeNone') },
        ],
      },
    ],
    [t],
  );

  const filteredMatches = useMemo(() => {
    const term = search.trim().toLowerCase();
    const order: Record<MatchOpenStatus, number> = { todo: 0, unsure: 1, confirmed: 2, rejected: 3 };
    return matches
      .filter((mt) => {
        const status = matchOpenStatus(mt);
        if (activeFilter !== 'all' && status !== activeFilter) return false;
        if (term && !mt.profileName.toLowerCase().includes(term)) return false;
        if (filters.source && mt.source !== filters.source) return false;
        if (filters.category && !mt.categories.includes(filters.category as AlertListCategory)) return false;
        if (filters.change) {
          if (filters.change === 'none' && mt.change !== null) return false;
          if (filters.change !== 'none' && mt.change !== filters.change) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const byStatus = order[matchOpenStatus(a)] - order[matchOpenStatus(b)];
        if (byStatus !== 0) return byStatus;
        return new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime();
      });
  }, [matches, activeFilter, search, filters]);

  const {
    selectedIds,
    selectAllFiltered,
    toggleRow,
    selectAllFilteredItems,
    clearSelection,
    selectedCount,
    selectedItems,
  } = useBulkSelection({
    allFilteredItems: filteredMatches,
    pageItems: filteredMatches,
    getId: (mt) => mt.id,
    canSelect: matchNeedsAction,
  });

  useEffect(() => {
    if (pendingSelectAll) {
      selectAllFilteredItems();
      setPendingSelectAll(false);
    }
  }, [pendingSelectAll, selectAllFilteredItems]);

  useEffect(() => {
    clearSelection();
  }, [activeFilter]);

  const pendingFilteredCount = filteredMatches.filter(matchNeedsAction).length;

  const toAlertItem = (mt: ScreeningMatch): AlertItem => matchToAlertItem(mt, entity, matches);

  const drawerMatch = drawerMatchId ? matches.find((mt) => mt.id === drawerMatchId) ?? null : null;
  const drawerAlert = useMemo(() => (drawerMatch ? toAlertItem(drawerMatch) : null), [drawerMatch, entity, matches]);
  const reviseMatch = reviseMatchId ? matches.find((mt) => mt.id === reviseMatchId) ?? null : null;
  const singleQualifyAlerts = useMemo(() => {
    if (!singleQualify) return [];
    const mt = matches.find((x) => x.id === singleQualify.matchId);
    return mt ? [toAlertItem(mt)] : [];
  }, [singleQualify, matches, entity]);
  const selectedAlertItems = useMemo(() => selectedItems.map(toAlertItem), [selectedItems, entity, matches]);

  const applyDecision = (ids: string[], decision: MatchDecisionValue, comments: Record<string, string>) => {
    const firstMatch = matches.find((mt) => mt.id === ids[0]);
    const result = qualifyMatches(ids, decision, comments);
    if (result.revised > 0 && result.qualified === 0) {
      toast.success(t('complianceEntities.matches.toast.revised'), {
        description: firstMatch
          ? t('complianceEntities.matches.toast.revisedBody', {
              name: firstMatch.profileName,
              decision: t(DECISION_KEY[decision]),
            })
          : undefined,
      });
    } else {
      toast.success(t('complianceEntities.matches.toast.qualified', { count: result.qualified + result.revised }), {
        description: t(DECISION_KEY[decision]),
      });
    }
    if (decision === 'true_hit' && result.remainingPending > 0 && firstMatch) {
      setSuggestion({ name: firstMatch.profileName, count: result.remainingPending });
    } else if (decision === 'true_hit') {
      setSuggestion(null);
    }
    clearSelection();
  };

  const handleBulkConfirm = (alertIds: string[], action: AlertBulkAction, comments: Record<string, string>) => {
    applyDecision(alertIds, toDecision(action), comments);
    setBulkAction(null);
    setSingleQualify(null);
  };

  const handleDrawerDecision = (alertId: string, decision: MatchDecisionValue, comment?: string) => {
    applyDecision([alertId], decision, { [alertId]: comment ?? '' });
    setDrawerMatchId(null);
  };

  const handleRevise = (decision: MatchDecisionValue, comment: string) => {
    if (!reviseMatch) return;
    applyDecision([reviseMatch.id], decision, { [reviseMatch.id]: comment });
    setReviseMatchId(null);
  };

  const handleRejectOthers = () => {
    const pendingIds = matches.filter(matchNeedsAction).map((mt) => mt.id);
    if (pendingIds.length === 0) {
      setSuggestion(null);
      return;
    }
    setActiveFilter('all');
    setFilters({});
    setSearch('');
    setPendingSelectAll(true);
    setSuggestion(null);
    window.setTimeout(() => setBulkAction('false_hit'), 0);
  };

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleFilterChange = (filterId: string, value: string | string[] | null) => {
    setFilters((prev) => {
      const next = { ...prev };
      const v = value === null ? null : Array.isArray(value) ? value[0] ?? null : value;
      if (!v) delete next[filterId];
      else next[filterId] = v;
      return next;
    });
  };

  const bulkActions = useMemo(
    () => [
      {
        labelKey: 'complianceAlerts.selection.actionConfirm',
        icon: <Check className="w-4 h-4" />,
        onClick: () => setBulkAction('true_hit'),
        color: 'var(--danger)',
        borderColor: 'color-mix(in oklab, var(--danger) 35%, transparent)',
        bgColor: 'var(--danger-soft)',
      },
      {
        labelKey: 'complianceAlerts.selection.actionUnsure',
        icon: <HelpCircle className="w-4 h-4" />,
        onClick: () => setBulkAction('unsure'),
        color: 'var(--warning)',
        borderColor: 'color-mix(in oklab, var(--warning) 35%, transparent)',
        bgColor: 'var(--warning-soft)',
      },
      {
        labelKey: 'complianceAlerts.selection.actionReject',
        icon: <X className="w-4 h-4" />,
        onClick: () => setBulkAction('false_hit'),
        color: 'var(--success)',
        borderColor: 'color-mix(in oklab, var(--success) 35%, transparent)',
        bgColor: 'var(--success-soft)',
      },
    ],
    [],
  );

  const ratio = (count: number) => (counters.total > 0 ? `${Math.round((count / counters.total) * 100)}%` : '0%');

  const cardMeta: Record<MatchFilter, { label: string; metric: string; icon: typeof List; count: number; iconClass?: string }> = {
    todo: {
      label: t('complianceEntities.matches.cards.todo'),
      metric: t('complianceEntities.matches.cards.todoMetric'),
      icon: AlertCircle,
      count: counters.todo,
      iconClass: 'text-amber-600',
    },
    unsure: {
      label: t('complianceEntities.matches.cards.unsure'),
      metric: t('complianceEntities.matches.cards.unsureMetric'),
      icon: HelpCircle,
      count: counters.unsure,
      iconClass: 'text-amber-600',
    },
    confirmed: {
      label: t('complianceEntities.matches.cards.confirmed'),
      metric: t('complianceEntities.matches.cards.confirmedMetric'),
      icon: CheckCircle2,
      count: counters.confirmed,
      iconClass: 'text-red-600',
    },
    rejected: {
      label: t('complianceEntities.matches.cards.rejected'),
      metric: t('complianceEntities.matches.cards.rejectedMetric'),
      icon: XCircle,
      count: counters.rejected,
      iconClass: 'text-emerald-600',
    },
    all: {
      label: t('complianceEntities.matches.cards.all'),
      metric: t('complianceEntities.matches.cards.allMetric'),
      icon: List,
      count: counters.total,
    },
  };

  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-7 h-7 text-emerald-600" />
          </div>
          <p className="font-semibold text-foreground">{t('complianceEntities.matches.emptyNoMatch')}</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            {t('complianceEntities.matches.emptyNoMatchBody')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-1.5">
        {FILTER_ORDER.map((key) => {
          const meta = cardMeta[key];
          return (
            <FilterCard
              key={key}
              status={key}
              activeStatus={activeFilter}
              onStatusChange={(next) => setActiveFilter((cur) => (cur === next ? 'all' : (next as MatchFilter)))}
              label={meta.label}
              icon={meta.icon}
              total={meta.count}
              metricLabel={meta.metric}
              metricValue={`${meta.count}`}
              averageValue={key === 'all' ? '100%' : ratio(meta.count)}
              iconActiveClassName={meta.iconClass}
            />
          );
        })}
      </div>

      <AnimatePresence>
        {suggestion && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="rounded-xl border px-4 py-3 flex items-start gap-3"
            style={{
              backgroundColor: 'var(--danger-soft)',
              borderColor: 'color-mix(in oklab, var(--danger) 30%, transparent)',
            }}
          >
            <Sparkles className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--danger)' }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {t('complianceEntities.matches.suggestion.title', { name: suggestion.name })}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('complianceEntities.matches.suggestion.body', { count: suggestion.count })}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" variant="secondary" onClick={() => setSuggestion(null)}>
                {t('complianceEntities.matches.suggestion.dismiss')}
              </Button>
              <Button size="sm" onClick={handleRejectOthers}>
                {t('complianceEntities.matches.suggestion.cta')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="overflow-hidden p-0 gap-0">
        <div className="px-6 py-4 border-b border-border bg-card">
          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder={t('complianceEntities.matches.search')}
            filters={filterConfigs}
            activeFilters={filters}
            onFilterChange={handleFilterChange}
            onClearAll={() => {
              setFilters({});
              setSearch('');
              setActiveFilter('all');
            }}
          />
        </div>

        <BulkActionBar
          selectedCount={selectedCount}
          totalFilteredCount={pendingFilteredCount}
          selectAllFiltered={selectAllFiltered}
          onSelectAllFiltered={selectAllFilteredItems}
          onClearSelection={clearSelection}
          actions={bulkActions}
          unitOneKey="complianceEntities.matches.selection.one"
          unitManyKey="complianceEntities.matches.selection.many"
        />

        <CardContent className="p-0">
          {filteredMatches.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-sm text-muted-foreground">{t('complianceEntities.matches.empty')}</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {filteredMatches.map((mt) => (
                <MatchRow
                  key={mt.id}
                  match={mt}
                  selected={selectedIds.has(mt.id)}
                  expanded={expanded.has(mt.id)}
                  onToggleSelect={() => toggleRow(mt.id)}
                  onToggleExpand={() => toggleExpanded(mt.id)}
                  onView={() => setDrawerMatchId(mt.id)}
                  onQuickAction={(action) => setSingleQualify({ matchId: mt.id, action })}
                  onRevise={() => setReviseMatchId(mt.id)}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <AlertDetailDrawer
        alert={drawerAlert}
        isOpen={!!drawerAlert}
        onClose={() => setDrawerMatchId(null)}
        onDecision={handleDrawerDecision}
      />

      <AlertBulkActionDialog
        open={bulkAction !== null && selectedAlertItems.length > 0}
        alerts={selectedAlertItems}
        action={bulkAction}
        onClose={() => setBulkAction(null)}
        onConfirm={handleBulkConfirm}
      />

      <AlertBulkActionDialog
        open={singleQualify !== null && singleQualifyAlerts.length === 1}
        alerts={singleQualifyAlerts}
        action={singleQualify?.action ?? null}
        onClose={() => setSingleQualify(null)}
        onConfirm={handleBulkConfirm}
      />

      <DecisionRevisionDialog match={reviseMatch} onClose={() => setReviseMatchId(null)} onConfirm={handleRevise} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Match row
// ---------------------------------------------------------------------------

interface MatchRowProps {
  match: ScreeningMatch;
  selected: boolean;
  expanded: boolean;
  onToggleSelect: () => void;
  onToggleExpand: () => void;
  onView: () => void;
  onQuickAction: (action: AlertBulkAction) => void;
  onRevise: () => void;
}

function MatchRow({
  match,
  selected,
  expanded,
  onToggleSelect,
  onToggleExpand,
  onView,
  onQuickAction,
  onRevise,
}: MatchRowProps) {
  const { t, lang } = useTranslation();
  const status = matchOpenStatus(match);
  const needsAction = matchNeedsAction(match);
  const decision = match.currentDecision;

  return (
    <li className={`px-6 py-4 transition-colors ${selected ? 'bg-primary/5' : 'hover:bg-muted/30'}`}>
      <div className="flex items-start gap-4">
        <div className="pt-1">
          {needsAction ? (
            <Checkbox
              checked={selected}
              onCheckedChange={onToggleSelect}
              aria-label={t('complianceAlerts.selection.selectRow')}
            />
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <Checkbox checked={false} disabled aria-label={t('complianceEntities.matches.selection.onlyPending')} />
                </span>
              </TooltipTrigger>
              <TooltipContent>{t('complianceEntities.matches.selection.onlyPending')}</TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onView}
              className="text-sm font-semibold text-foreground hover:underline underline-offset-2 text-left"
            >
              {match.profileName}
            </button>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-xs font-medium tabular-nums">
              <Sparkles className="w-3 h-3" />
              {match.score}%
            </span>
            <StatusBadge label={t(OPEN_STATUS_KEY[status])} variant={OPEN_STATUS_VARIANT[status]} />
            {match.change && (
              <Badge variant="outline" className="text-[11px] font-medium">
                {t(CHANGE_KEY[match.change])}
              </Badge>
            )}
          </div>

          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
            {match.categories.map((c) => (
              <Tag key={c} label={t(CATEGORY_KEY[c])} />
            ))}
            <Badge variant="secondary" className="text-[11px]">
              {match.source}
            </Badge>
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            {t('complianceEntities.matches.firstSeen')} {formatDate(match.firstSeen, lang)} ·{' '}
            {t('complianceEntities.matches.lastUpdate')} {formatRelativeTime(new Date(match.lastUpdate).getTime(), t)}
            {decision && (
              <>
                {' · '}
                {t('complianceEntities.matches.decidedBy', { name: decision.analyst })}{' '}
                {t('complianceEntities.matches.decidedOn', { date: formatDate(decision.date, lang) })}
                {decision.revision > 1 && ` · ${t('complianceEntities.matches.revision', { n: decision.revision })}`}
              </>
            )}
          </p>

          {decision?.comment && (
            <p className="mt-2 text-sm text-foreground/80 italic border-l-2 border-border pl-3">{decision.comment}</p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {needsAction ? (
            <>
              <QuickAction
                label={t('complianceEntities.matches.actions.confirm')}
                icon={Check}
                tone="danger"
                onClick={() => onQuickAction('true_hit')}
              />
              <QuickAction
                label={t('complianceEntities.matches.actions.unsure')}
                icon={HelpCircle}
                tone="warning"
                onClick={() => onQuickAction('unsure')}
              />
              <QuickAction
                label={t('complianceEntities.matches.actions.reject')}
                icon={X}
                tone="success"
                onClick={() => onQuickAction('false_hit')}
              />
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={onRevise} className="gap-1.5 text-muted-foreground">
              <History className="w-4 h-4" />
              {t('complianceEntities.matches.actions.revise')}
            </Button>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onView} aria-label={t('complianceEntities.matches.actions.view')}>
                <Eye className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('complianceEntities.matches.actions.view')}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleExpand}
                aria-label={expanded ? t('complianceEntities.matches.actions.hideHistory') : t('complianceEntities.matches.actions.history')}
              >
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {expanded ? t('complianceEntities.matches.actions.hideHistory') : t('complianceEntities.matches.actions.history')}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <MatchHistory match={match} />
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function QuickAction({
  label,
  icon: Icon,
  tone,
  onClick,
}: {
  label: string;
  icon: typeof Check;
  tone: 'danger' | 'warning' | 'success';
  onClick: () => void;
}) {
  const color = tone === 'danger' ? 'var(--danger)' : tone === 'warning' ? 'var(--warning)' : 'var(--success)';
  const soft = tone === 'danger' ? 'var(--danger-soft)' : tone === 'warning' ? 'var(--warning-soft)' : 'var(--success-soft)';
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold transition-colors hover:opacity-80"
      style={{ color, backgroundColor: soft, borderColor: `color-mix(in oklab, ${color} 35%, transparent)` }}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

function MatchHistory({ match }: { match: ScreeningMatch }) {
  const { t, lang } = useTranslation();
  const alerts = [...match.alerts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const decisions = [...match.decisions].sort((a, b) => b.revision - a.revision);

  return (
    <div className="mt-4 ml-10 grid gap-4 md:grid-cols-2 rounded-xl border border-border bg-muted/30 p-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
          {t('complianceEntities.matches.history.alerts')}
        </p>
        <ul className="space-y-2">
          {alerts.map((al) => {
            const Icon = HISTORY_ICON[al.kind];
            return (
              <li key={al.id} className="flex items-start gap-2 text-sm">
                <Icon className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-foreground">{t(`complianceEntities.matches.history.${al.kind}`)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(al.date, lang)} · {t('complianceEntities.matches.history.scoreAt', { score: al.score })}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
          {t('complianceEntities.matches.history.decisions')}
        </p>
        {decisions.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('complianceEntities.matches.history.noDecision')}</p>
        ) : (
          <ul className="space-y-2">
            {decisions.map((dec) => (
              <li key={dec.id} className="rounded-lg border border-border bg-card p-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <StatusBadge label={t(DECISION_KEY[dec.decision])} variant={DECISION_VARIANT[dec.decision]} />
                  <span className="text-xs text-muted-foreground">
                    {t('complianceEntities.matches.revision', { n: dec.revision })} · {dec.analyst} ·{' '}
                    {formatDateTime(dec.date, lang)}
                  </span>
                </div>
                {dec.comment && <p className="mt-1.5 text-sm text-foreground/80">{dec.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
