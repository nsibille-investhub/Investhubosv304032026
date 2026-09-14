import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronRight, ExternalLink, HelpCircle, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

import { Button } from './ui/button';
import { Card } from './ui/card';
import { Collapsible, CollapsibleContent } from './ui/collapsible';
import { BulkActionBar } from './ui/bulk-action-bar';
import { WIDGET_TITLE_CLASS } from './ui/utils';
import { StatusBadge } from './StatusBadge';
import { AlertDetailDrawer } from './AlertDetailDrawer';
import { AlertBulkActionDialog } from './AlertBulkActionDialog';
import { AlertDataTable, type AlertBulkAction } from './AlertDataTable';
import { DECISION_KEY, ROLE_KEY, openEntityDetail } from './entity-detail/entityDetailShared';
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
 * Screening de la souscription : un groupe repliable par tiers contrôlé,
 * chacun gérant ses alertes avec le tableau, les dialogues de décision et le
 * panneau latéral des sections Entités / Alertes.
 */
export function SubscriptionScreeningWidget({ screening, locked }: SubscriptionScreeningWidgetProps) {
  const { t } = useTranslation();
  const { qualifyMatches } = useCompliance();

  const [drawerAlert, setDrawerAlert] = useState<AlertItem | null>(null);
  const [dialog, setDialog] = useState<{ alerts: AlertItem[]; action: AlertBulkAction } | null>(null);

  const applyDecision = (ids: string[], decision: MatchDecisionValue, comments: Record<string, string>) => {
    const result = qualifyMatches(ids, decision, comments);
    toast.success(t('complianceEntities.matches.toast.qualified', { count: result.qualified + result.revised }), {
      description: t(DECISION_KEY[decision]),
    });
  };

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

      <div className="divide-y divide-border">
        {screening.parties.map(party => (
          <EntityAlertGroup
            key={party.entity.id}
            party={party}
            locked={locked}
            onOpenAlert={setDrawerAlert}
            onQualify={(alerts, action) => setDialog({ alerts, action })}
          />
        ))}
      </div>

      <AlertDetailDrawer
        alert={drawerAlert}
        isOpen={!!drawerAlert}
        onClose={() => setDrawerAlert(null)}
        onDecision={
          locked
            ? undefined
            : (alertId, decision, comment) => {
                applyDecision([alertId], decision, { [alertId]: comment ?? '' });
                setDrawerAlert(null);
              }
        }
        onEntityClick={alert => openEntityDetail(alert.entityUid)}
      />

      <AlertBulkActionDialog
        open={dialog !== null}
        alerts={dialog?.alerts ?? []}
        action={dialog?.action ?? null}
        onClose={() => setDialog(null)}
        onConfirm={(alertIds, action, comments) => {
          applyDecision(alertIds, toDecision(action), comments);
          setDialog(null);
        }}
      />
    </Card>
  );
}

interface EntityAlertGroupProps {
  party: ScreeningParty;
  locked: boolean;
  onOpenAlert: (alert: AlertItem) => void;
  onQualify: (alerts: AlertItem[], action: AlertBulkAction) => void;
}

/** Groupe repliable : un tiers contrôlé et le tableau de ses alertes. */
function EntityAlertGroup({ party, locked, onOpenAlert, onQualify }: EntityAlertGroupProps) {
  const { t } = useTranslation();
  const { entity, matches } = party;

  const alerts = useMemo(() => matches.map(mt => matchToAlertItem(mt, entity, matches)), [matches, entity]);
  const pending = alerts.filter(alert => alert.status === 'Pending').length;

  const [open, setOpen] = useState(pending > 0);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const sortedAlerts = useMemo(() => {
    if (!sortConfig) {
      return [...alerts].sort((a, b) => {
        if (a.status !== b.status) return a.status === 'Pending' ? -1 : 1;
        return b.match - a.match;
      });
    }
    return [...alerts].sort((a, b) => {
      const left = a[sortConfig.key as keyof AlertItem];
      const right = b[sortConfig.key as keyof AlertItem];
      if (typeof left === 'string' && typeof right === 'string') {
        return sortConfig.direction === 'asc' ? left.localeCompare(right) : right.localeCompare(left);
      }
      if (typeof left === 'number' && typeof right === 'number') {
        return sortConfig.direction === 'asc' ? left - right : right - left;
      }
      return 0;
    });
  }, [alerts, sortConfig]);

  const {
    selectedIds,
    selectAllFiltered,
    toggleRow,
    togglePageAll,
    selectAllFilteredItems,
    clearSelection,
    allPageSelected,
    somePageSelected,
    selectedCount,
    selectedItems,
  } = useBulkSelection({
    allFilteredItems: sortedAlerts,
    pageItems: sortedAlerts,
    getId: alert => alert.id,
    canSelect: alert => !locked && alert.status === 'Pending',
  });

  useEffect(() => {
    clearSelection();
  }, [matches]);

  const bulkActions = useMemo(
    () => [
      {
        labelKey: 'complianceAlerts.selection.actionConfirm',
        icon: <Check className="w-4 h-4" />,
        onClick: () => onQualify(selectedItems, 'true_hit'),
        color: 'var(--danger)',
        borderColor: 'color-mix(in oklab, var(--danger) 35%, transparent)',
        bgColor: 'var(--danger-soft)',
      },
      {
        labelKey: 'complianceAlerts.selection.actionUnsure',
        icon: <HelpCircle className="w-4 h-4" />,
        onClick: () => onQualify(selectedItems, 'unsure'),
        color: 'var(--warning)',
        borderColor: 'color-mix(in oklab, var(--warning) 35%, transparent)',
        bgColor: 'var(--warning-soft)',
      },
      {
        labelKey: 'complianceAlerts.selection.actionReject',
        icon: <X className="w-4 h-4" />,
        onClick: () => onQualify(selectedItems, 'false_hit'),
        color: 'var(--success)',
        borderColor: 'color-mix(in oklab, var(--success) 35%, transparent)',
        bgColor: 'var(--success-soft)',
      },
    ],
    [selectedItems, onQualify],
  );

  const hasMatches = alerts.length > 0;
  const toggleLabel = t(
    open
      ? 'subscriptions.detail.compliance.screening.collapseGroup'
      : 'subscriptions.detail.compliance.screening.expandGroup',
    { name: entity.name },
  );

  const toggle = () => {
    if (hasMatches) setOpen(current => !current);
  };

  return (
    <Collapsible open={hasMatches && open} onOpenChange={setOpen}>
      <div
        role="button"
        tabIndex={hasMatches ? 0 : -1}
        aria-expanded={hasMatches && open}
        aria-label={toggleLabel}
        onClick={toggle}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggle();
          }
        }}
        className={`flex flex-wrap items-center gap-2 px-4 py-2.5 ${hasMatches ? 'cursor-pointer hover:bg-muted/30' : ''}`}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center text-muted-foreground">
          {hasMatches ? (
            open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          ) : null}
        </span>

        <button
          type="button"
          onClick={event => {
            event.stopPropagation();
            openEntityDetail(entity.uid);
          }}
          title={t('complianceAlerts.table.openEntity')}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground hover:underline underline-offset-2"
        >
          {entity.name}
          <ExternalLink className="w-3.5 h-3.5 opacity-50" />
        </button>
        <span className="text-xs text-muted-foreground">{t(ROLE_KEY[entity.relation])}</span>

        <div className="ml-auto flex items-center gap-1.5 shrink-0">
          {!hasMatches ? (
            <StatusBadge label={t('subscriptions.detail.compliance.screening.noHit')} variant="success" />
          ) : pending > 0 ? (
            <StatusBadge
              label={t(
                `subscriptions.detail.compliance.final.matchesToTreat${pending === 1 ? 'One' : 'Many'}`,
                { count: pending },
              )}
              variant="warning"
            />
          ) : (
            <StatusBadge
              label={t(
                `subscriptions.detail.compliance.final.matchesTreated${alerts.length === 1 ? 'One' : 'Many'}`,
                { count: alerts.length },
              )}
              variant="success"
            />
          )}
        </div>
      </div>

      <CollapsibleContent>
        <BulkActionBar
          selectedCount={selectedCount}
          totalFilteredCount={pending}
          selectAllFiltered={selectAllFiltered}
          onSelectAllFiltered={selectAllFilteredItems}
          onClearSelection={clearSelection}
          actions={bulkActions}
          unitOneKey="complianceEntities.matches.selection.one"
          unitManyKey="complianceEntities.matches.selection.many"
        />

        <AlertDataTable
          data={sortedAlerts}
          showEntityName={false}
          compact
          hoveredRow={hoveredRow}
          setHoveredRow={setHoveredRow}
          onRowClick={onOpenAlert}
          sortConfig={sortConfig}
          onSort={key =>
            setSortConfig(current => {
              if (!current || current.key !== key) return { key, direction: 'asc' };
              if (current.direction === 'asc') return { key, direction: 'desc' };
              return null;
            })
          }
          onDecision={
            locked
              ? undefined
              : (alertId, action) => {
                  const alert = sortedAlerts.find(item => item.id === alertId);
                  if (alert) onQualify([alert], action);
                }
          }
          selectedIds={locked ? undefined : selectedIds}
          onToggleSelectRow={locked ? undefined : toggleRow}
          onToggleSelectAll={locked ? undefined : togglePageAll}
          allPendingSelected={allPageSelected}
          somePendingSelected={somePageSelected}
        />
      </CollapsibleContent>
    </Collapsible>
  );
}
