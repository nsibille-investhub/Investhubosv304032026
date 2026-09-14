import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, CheckCircle2, ExternalLink, Eye, HelpCircle, History, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { BulkActionBar } from './ui/bulk-action-bar';
import { WIDGET_TITLE_CLASS } from './ui/utils';
import { StatusBadge } from './StatusBadge';
import { Tag } from './Tag';
import { AlertDetailDrawer } from './AlertDetailDrawer';
import { AlertBulkActionDialog } from './AlertBulkActionDialog';
import type { AlertBulkAction } from './AlertDataTable';
import { DecisionRevisionDialog } from './entity-detail/DecisionRevisionDialog';
import { MatchQuickAction } from './entity-detail/MatchQuickAction';
import {
  CATEGORY_KEY,
  CHANGE_KEY,
  DECISION_KEY,
  OPEN_STATUS_KEY,
  OPEN_STATUS_VARIANT,
  ROLE_KEY,
  formatDate,
  openEntityDetail,
} from './entity-detail/entityDetailShared';
import { useBulkSelection } from '../hooks/useBulkSelection';
import { useCompliance } from '../utils/complianceContext';
import { useTranslation } from '../utils/languageContext';
import { navigateToPage } from '../utils/routing';
import type { AlertItem } from '../utils/alertsGenerator';
import {
  matchNeedsAction,
  matchOpenStatus,
  matchToAlertItem,
  type EntityRow,
  type MatchDecisionValue,
  type ScreeningMatch,
} from '../utils/screeningMock';

/** Tiers contrôlé de la souscription et ses correspondances de screening. */
export interface ScreeningParty {
  entity: EntityRow;
  matches: ScreeningMatch[];
}

export interface SubscriptionScreening {
  parties: ScreeningParty[];
  matches: ScreeningMatch[];
  /** Correspondances sans décision ou marquées incertaines. */
  pending: number;
  treated: number;
  confirmed: number;
  partiesWithMatch: number;
  clearParties: number;
}

const PARTIES_WITH_PENDING = 2;
const PARTIES_DECIDED = 1;
const PARTIES_CLEAR = 2;

const toDecision = (action: AlertBulkAction): MatchDecisionValue =>
  action === 'escalate' ? 'unsure' : action;

function seedOffset(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pick(rows: EntityRow[], count: number, offset: number): EntityRow[] {
  if (rows.length === 0) return [];
  return Array.from({ length: Math.min(count, rows.length) }, (_, index) => rows[(offset + index) % rows.length]);
}

/**
 * Tiers rattachés à la souscription : sélection déterministe (par souscription)
 * dans le référentiel entités partagé avec les sections Entités et Alertes.
 */
function pickPartyIds(entityRows: EntityRow[], seed: string): number[] {
  const open = entityRows.filter(row => !row.closed);
  const offset = seedOffset(seed);
  const selection = [
    ...pick(open.filter(row => row.counters.pending > 0), PARTIES_WITH_PENDING, offset),
    ...pick(open.filter(row => row.counters.pending === 0 && row.hits > 0), PARTIES_DECIDED, offset),
    ...pick(open.filter(row => row.hits === 0), PARTIES_CLEAR, offset),
  ];
  return Array.from(new Set(selection.map(row => row.id)));
}

/**
 * Expose les tiers screenés de la souscription à partir du référentiel
 * compliance : les décisions prises ici sont celles des sections Entités et
 * Alertes.
 */
export function useSubscriptionScreening(seed: string): SubscriptionScreening {
  const { entityRows, getEntityMatches } = useCompliance();

  const [partyIds, setPartyIds] = useState<number[]>(() => pickPartyIds(entityRows, seed));
  const seedRef = useRef(seed);

  useEffect(() => {
    if (seedRef.current === seed && partyIds.length > 0) return;
    seedRef.current = seed;
    setPartyIds(pickPartyIds(entityRows, seed));
  }, [seed, entityRows, partyIds.length]);

  return useMemo(() => {
    const parties: ScreeningParty[] = partyIds
      .map(id => entityRows.find(row => row.id === id))
      .filter((row): row is EntityRow => row !== undefined)
      .map(entity => ({ entity, matches: getEntityMatches(entity.id) }));

    const matches = parties.flatMap(party => party.matches);
    const pending = matches.filter(matchNeedsAction).length;
    const confirmed = matches.filter(mt => matchOpenStatus(mt) === 'confirmed').length;

    return {
      parties,
      matches,
      pending,
      treated: matches.length - pending,
      confirmed,
      partiesWithMatch: parties.filter(party => party.matches.length > 0).length,
      clearParties: parties.filter(party => party.matches.length === 0).length,
    };
  }, [partyIds, entityRows, getEntityMatches]);
}

interface SubscriptionScreeningWidgetProps {
  screening: SubscriptionScreening;
  /** Dossier validé : les décisions ne sont plus modifiables. */
  locked: boolean;
}

/**
 * Screening de la souscription : qualification des correspondances avec le
 * panneau latéral et les dialogues de décision des sections Entités / Alertes.
 */
export function SubscriptionScreeningWidget({ screening, locked }: SubscriptionScreeningWidgetProps) {
  const { t } = useTranslation();
  const { qualifyMatches } = useCompliance();

  const [tab, setTab] = useState<'todo' | 'all'>('todo');
  const [drawerMatchId, setDrawerMatchId] = useState<string | null>(null);
  const [bulkAction, setBulkAction] = useState<AlertBulkAction | null>(null);
  const [singleQualify, setSingleQualify] = useState<{ matchId: string; action: AlertBulkAction } | null>(null);
  const [reviseMatchId, setReviseMatchId] = useState<string | null>(null);

  const partyByMatch = useMemo(() => {
    const map = new Map<string, ScreeningParty>();
    screening.parties.forEach(party => {
      party.matches.forEach(mt => map.set(mt.id, party));
    });
    return map;
  }, [screening.parties]);

  const sortedMatches = useMemo(() => {
    const order: Record<string, number> = { todo: 0, unsure: 1, confirmed: 2, rejected: 3 };
    return [...screening.matches].sort((a, b) => {
      const byStatus = order[matchOpenStatus(a)] - order[matchOpenStatus(b)];
      if (byStatus !== 0) return byStatus;
      return b.score - a.score;
    });
  }, [screening.matches]);

  const visibleMatches = useMemo(
    () => (tab === 'todo' ? sortedMatches.filter(matchNeedsAction) : sortedMatches),
    [sortedMatches, tab],
  );

  const {
    selectedIds,
    selectAllFiltered,
    toggleRow,
    selectAllFilteredItems,
    clearSelection,
    selectedCount,
    selectedItems,
  } = useBulkSelection({
    allFilteredItems: visibleMatches,
    pageItems: visibleMatches,
    getId: mt => mt.id,
    canSelect: mt => !locked && matchNeedsAction(mt),
  });

  useEffect(() => {
    clearSelection();
  }, [tab]);

  const toAlertItem = (mt: ScreeningMatch): AlertItem | null => {
    const party = partyByMatch.get(mt.id);
    if (!party) return null;
    return matchToAlertItem(mt, party.entity, party.matches);
  };

  const drawerMatch = drawerMatchId ? screening.matches.find(mt => mt.id === drawerMatchId) ?? null : null;
  const drawerAlert = useMemo(() => (drawerMatch ? toAlertItem(drawerMatch) : null), [drawerMatch, partyByMatch]);
  const reviseMatch = reviseMatchId ? screening.matches.find(mt => mt.id === reviseMatchId) ?? null : null;
  const singleQualifyAlerts = useMemo(() => {
    if (!singleQualify) return [];
    const mt = screening.matches.find(item => item.id === singleQualify.matchId);
    const alert = mt ? toAlertItem(mt) : null;
    return alert ? [alert] : [];
  }, [singleQualify, partyByMatch]);
  const selectedAlertItems = useMemo(
    () => selectedItems.map(toAlertItem).filter((item): item is AlertItem => item !== null),
    [selectedItems, partyByMatch],
  );

  const applyDecision = (ids: string[], decision: MatchDecisionValue, comments: Record<string, string>) => {
    const result = qualifyMatches(ids, decision, comments);
    toast.success(t('complianceEntities.matches.toast.qualified', { count: result.qualified + result.revised }), {
      description: t(DECISION_KEY[decision]),
    });
    clearSelection();
  };

  const handleBulkConfirm = (alertIds: string[], action: AlertBulkAction, comments: Record<string, string>) => {
    applyDecision(alertIds, toDecision(action), comments);
    setBulkAction(null);
    setSingleQualify(null);
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

  return (
    <Card className="shadow-sm overflow-hidden p-0 gap-0">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b">
        <h3 className={WIDGET_TITLE_CLASS}>{t('subscriptions.detail.compliance.screening.title')}</h3>

        <div className="flex items-center gap-2 shrink-0">
          {screening.pending > 0 ? (
            <StatusBadge
              label={t(
                `subscriptions.detail.compliance.screening.untreated${screening.pending === 1 ? 'One' : 'Many'}`,
                { count: screening.pending },
              )}
              variant="warning"
            />
          ) : (
            <StatusBadge label={t('subscriptions.detail.compliance.screening.allTreated')} variant="success" />
          )}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-muted-foreground"
            onClick={() => navigateToPage('monitoring')}
          >
            {t('subscriptions.detail.compliance.screening.openAlerts')}
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="px-4 py-2.5 border-b">
        <Tabs value={tab} onValueChange={value => setTab(value as 'todo' | 'all')}>
          <TabsList>
            <TabsTrigger value="todo" className="gap-2">
              {t('complianceEntities.matches.cards.todo')}
              <Badge variant="secondary" className="text-[10px] px-1.5">
                {screening.pending}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2">
              {t('complianceEntities.matches.cards.all')}
              <Badge variant="secondary" className="text-[10px] px-1.5">
                {screening.matches.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <BulkActionBar
        selectedCount={selectedCount}
        totalFilteredCount={visibleMatches.filter(matchNeedsAction).length}
        selectAllFiltered={selectAllFiltered}
        onSelectAllFiltered={selectAllFilteredItems}
        onClearSelection={clearSelection}
        actions={bulkActions}
        unitOneKey="complianceEntities.matches.selection.one"
        unitManyKey="complianceEntities.matches.selection.many"
      />

      {visibleMatches.length === 0 ? (
        <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-muted-foreground">
          <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--success)' }} />
          {t('subscriptions.detail.compliance.screening.allTreated')}
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {visibleMatches.map(mt => {
            const entity = partyByMatch.get(mt.id)?.entity;
            if (!entity) return null;
            return (
              <ScreeningMatchRow
                key={mt.id}
                match={mt}
                entity={entity}
                locked={locked}
                selected={selectedIds.has(mt.id)}
                onToggleSelect={() => toggleRow(mt.id)}
                onOpen={() => setDrawerMatchId(mt.id)}
                onQuickAction={action => setSingleQualify({ matchId: mt.id, action })}
                onRevise={() => setReviseMatchId(mt.id)}
              />
            );
          })}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 border-t bg-muted/30 px-4 py-2.5">
        <span className="text-xs text-muted-foreground">
          {t(
            `subscriptions.detail.compliance.screening.partiesScreened${
              screening.parties.length === 1 ? 'One' : 'Many'
            }`,
            { count: screening.parties.length },
          )}
        </span>
        {screening.parties.map(party => (
          <Tooltip key={party.entity.id}>
            <TooltipTrigger asChild>
              <button type="button" onClick={() => openEntityDetail(party.entity.uid)} className="min-w-0">
                <Tag
                  icon={party.matches.length === 0 ? CheckCircle2 : undefined}
                  label={
                    party.entity.counters.pending > 0
                      ? `${party.entity.name} · ${party.entity.counters.pending}`
                      : party.entity.name
                  }
                />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {t(ROLE_KEY[party.entity.relation])} · {t('complianceAlerts.table.openEntity')}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      <AlertDetailDrawer
        alert={drawerAlert}
        isOpen={!!drawerAlert}
        onClose={() => setDrawerMatchId(null)}
        onDecision={
          locked
            ? undefined
            : (alertId, decision, comment) => {
                applyDecision([alertId], decision, { [alertId]: comment ?? '' });
                setDrawerMatchId(null);
              }
        }
        onEntityClick={alert => openEntityDetail(alert.entityUid)}
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

      <DecisionRevisionDialog
        match={reviseMatch}
        onClose={() => setReviseMatchId(null)}
        onConfirm={(decision, comment) => {
          if (!reviseMatch) return;
          applyDecision([reviseMatch.id], decision, { [reviseMatch.id]: comment });
          setReviseMatchId(null);
        }}
      />
    </Card>
  );
}

interface ScreeningMatchRowProps {
  match: ScreeningMatch;
  entity: EntityRow;
  locked: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
  onQuickAction: (action: AlertBulkAction) => void;
  onRevise: () => void;
}

function ScreeningMatchRow({
  match,
  entity,
  locked,
  selected,
  onToggleSelect,
  onOpen,
  onQuickAction,
  onRevise,
}: ScreeningMatchRowProps) {
  const { t, lang } = useTranslation();
  const status = matchOpenStatus(match);
  const needsAction = matchNeedsAction(match);
  const decision = match.currentDecision;

  return (
    <li className={`px-4 py-3 transition-colors ${selected ? 'bg-primary/5' : 'hover:bg-muted/30'}`}>
      <div className="flex items-start gap-3">
        {!locked && (
          <div className="pt-1">
            {needsAction ? (
              <Checkbox
                checked={selected}
                onCheckedChange={onToggleSelect}
                aria-label={t('complianceAlerts.selection.selectRow')}
              />
            ) : (
              <Checkbox checked={false} disabled aria-label={t('complianceEntities.matches.selection.onlyPending')} />
            )}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onOpen}
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
            <button
              type="button"
              onClick={() => openEntityDetail(entity.uid)}
              title={t('complianceAlerts.table.openEntity')}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:underline underline-offset-2"
            >
              {entity.name}
              <ExternalLink className="w-3 h-3 opacity-60" />
            </button>
            <span className="text-xs text-muted-foreground">· {t(ROLE_KEY[entity.relation])}</span>
            {match.categories.map(category => (
              <Tag key={category} label={t(CATEGORY_KEY[category])} />
            ))}
          </div>

          {!needsAction && decision && (
            <p className="mt-1.5 text-xs text-muted-foreground truncate">
              {t('complianceEntities.matches.decidedBy', { name: decision.analyst })}{' '}
              {t('complianceEntities.matches.decidedOn', { date: formatDate(decision.date, lang) })}
              {decision.comment && ` · ${decision.comment}`}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!locked &&
            (needsAction ? (
              <>
                <MatchQuickAction
                  label={t('complianceEntities.matches.actions.confirm')}
                  icon={Check}
                  tone="danger"
                  onClick={() => onQuickAction('true_hit')}
                />
                <MatchQuickAction
                  label={t('complianceEntities.matches.actions.unsure')}
                  icon={HelpCircle}
                  tone="warning"
                  onClick={() => onQuickAction('unsure')}
                />
                <MatchQuickAction
                  label={t('complianceEntities.matches.actions.reject')}
                  icon={X}
                  tone="success"
                  onClick={() => onQuickAction('false_hit')}
                />
              </>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRevise}
                    aria-label={t('complianceEntities.matches.actions.revise')}
                  >
                    <History className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t('complianceEntities.matches.actions.revise')}</TooltipContent>
              </Tooltip>
            ))}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onOpen} aria-label={t('complianceEntities.matches.actions.view')}>
                <Eye className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('complianceEntities.matches.actions.view')}</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </li>
  );
}
