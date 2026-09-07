import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { AlertItem } from './alertsGenerator';
import {
  buildAlertItems,
  buildEntityRow,
  buildEntityRows,
  createDecision,
  generateScreeningDataset,
  groupMatchesByEntity,
  matchOpenStatus,
  SYSTEM_ACTOR,
  type Actor,
  type EntityAuditEvent,
  type EntityAuditEventType,
  type EntityRow,
  type MatchDecisionValue,
  type ScreeningDataset,
  type ScreeningEntity,
  type ScreeningMatch,
} from './screeningMock';

export const CURRENT_USER: Actor = {
  name: 'Jean Dault',
  email: 'jean.dault@investhub.cloud',
  role: 'Compliance officer',
};

export interface QualifyResult {
  qualified: number;
  revised: number;
  remainingPending: number;
}

interface ComplianceContextValue {
  entities: ScreeningEntity[];
  matches: ScreeningMatch[];
  entityRows: EntityRow[];
  alertItems: AlertItem[];
  isLoading: boolean;
  pendingAlertsCount: number;
  getEntityByUid: (uid: string) => ScreeningEntity | undefined;
  getEntityRow: (entityId: number) => EntityRow | undefined;
  getEntityRowByUid: (uid: string) => EntityRow | undefined;
  getEntityMatches: (entityId: number) => ScreeningMatch[];
  getMatch: (matchId: string) => ScreeningMatch | undefined;
  qualifyMatches: (
    matchIds: string[],
    decision: MatchDecisionValue,
    comments: Record<string, string>,
  ) => QualifyResult;
  toggleMonitoring: (entityId: number, value: boolean) => void;
  assignAnalyst: (entityId: number, analyst: string) => void;
  rerunScreening: (entityId: number) => { matchesFound: number; newMatches: number };
  closeEntity: (entityId: number) => void;
  reopenEntity: (entityId: number) => void;
  logEntityEvent: (
    entityId: number,
    type: Extract<EntityAuditEventType, 'report' | 'export' | 'comment'>,
    description: string,
    after?: string,
  ) => void;
}

const ComplianceContext = createContext<ComplianceContextValue | undefined>(undefined);

let eventSeq = 100000;
const nextEventId = () => `evt-live-${++eventSeq}`;

function makeEvent(
  type: EntityAuditEventType,
  actor: Actor,
  description: string,
  extra: Partial<Pick<EntityAuditEvent, 'matchName' | 'before' | 'after'>> = {},
): EntityAuditEvent {
  return {
    id: nextEventId(),
    type,
    timestamp: new Date().toISOString(),
    actorName: actor.name,
    actorSublabel: actor.email,
    actorRole: actor.role,
    description,
    ...extra,
  };
}

function withAudit(entity: ScreeningEntity, events: EntityAuditEvent[]): ScreeningEntity {
  return { ...entity, auditTrail: [...events, ...entity.auditTrail] };
}

export function ComplianceProvider({ children }: { children: React.ReactNode }) {
  const [dataset, setDataset] = useState<ScreeningDataset>(() => generateScreeningDataset(100));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 800);
    return () => window.clearTimeout(timer);
  }, []);

  const matchesByEntity = useMemo(() => groupMatchesByEntity(dataset.matches), [dataset.matches]);
  const entityRows = useMemo(() => buildEntityRows(dataset), [dataset]);
  const alertItems = useMemo(() => buildAlertItems(dataset), [dataset]);
  const pendingAlertsCount = useMemo(
    () => alertItems.filter((a) => a.status === 'Pending').length,
    [alertItems],
  );

  const getEntityByUid = useCallback(
    (uid: string) => dataset.entities.find((e) => e.uid === uid),
    [dataset.entities],
  );

  const getEntityRow = useCallback(
    (entityId: number) => entityRows.find((row) => row.id === entityId),
    [entityRows],
  );

  const getEntityRowByUid = useCallback(
    (uid: string) => entityRows.find((row) => row.uid === uid),
    [entityRows],
  );

  const getEntityMatches = useCallback(
    (entityId: number) => matchesByEntity.get(entityId) ?? [],
    [matchesByEntity],
  );

  const getMatch = useCallback(
    (matchId: string) => dataset.matches.find((mt) => mt.id === matchId),
    [dataset.matches],
  );

  const qualifyMatches = useCallback(
    (matchIds: string[], decision: MatchDecisionValue, comments: Record<string, string>): QualifyResult => {
      const ids = new Set(matchIds);
      let qualified = 0;
      let revised = 0;
      const eventsByEntity = new Map<number, EntityAuditEvent[]>();
      const touchedEntities = new Set<number>();
      const now = new Date().toISOString();

      const nextMatches = dataset.matches.map((mt) => {
        if (!ids.has(mt.id)) return mt;
        const comment = (comments[mt.id] ?? '').trim();
        const nextDecision = createDecision(mt, decision, comment, CURRENT_USER.name, now);
        const isRevision = mt.currentDecision !== null && mt.change !== 'Reopened';
        if (isRevision) revised += 1;
        else qualified += 1;
        touchedEntities.add(mt.entityId);

        const events = eventsByEntity.get(mt.entityId) ?? [];
        events.push(
          makeEvent(isRevision ? 'decision_revised' : 'decision', CURRENT_USER, decision, {
            matchName: mt.profileName,
            before: mt.currentDecision?.decision,
            after: decision,
          }),
        );
        if (comment) {
          events.push(makeEvent('comment', CURRENT_USER, comment, { matchName: mt.profileName }));
        }
        eventsByEntity.set(mt.entityId, events);

        return {
          ...mt,
          currentDecision: nextDecision,
          decisions: [...mt.decisions, nextDecision],
          change: null,
          lastUpdate: now,
          profile: {
            ...mt.profile,
            decision,
            comment,
            analyst: CURRENT_USER.name,
            date: now.split('T')[0],
          },
        };
      });

      const nextEntities = dataset.entities.map((entity) => {
        const events = eventsByEntity.get(entity.id);
        return events ? withAudit(entity, events.reverse()) : entity;
      });

      setDataset({ entities: nextEntities, matches: nextMatches });

      const remainingPending = nextMatches.filter(
        (mt) => touchedEntities.has(mt.entityId) && (matchOpenStatus(mt) === 'todo' || matchOpenStatus(mt) === 'unsure'),
      ).length;

      return { qualified, revised, remainingPending };
    },
    [dataset],
  );

  const updateEntity = useCallback(
    (entityId: number, updater: (entity: ScreeningEntity) => ScreeningEntity) => {
      setDataset((prev) => ({
        ...prev,
        entities: prev.entities.map((e) => (e.id === entityId ? updater(e) : e)),
      }));
    },
    [],
  );

  const toggleMonitoring = useCallback(
    (entityId: number, value: boolean) => {
      updateEntity(entityId, (entity) =>
        withAudit({ ...entity, monitoring: value }, [
          makeEvent('monitoring', CURRENT_USER, value ? 'monitoring_on' : 'monitoring_off'),
        ]),
      );
    },
    [updateEntity],
  );

  const assignAnalyst = useCallback(
    (entityId: number, analyst: string) => {
      updateEntity(entityId, (entity) =>
        withAudit({ ...entity, analyst }, [
          makeEvent('assignment', CURRENT_USER, 'assigned', { before: entity.analyst, after: analyst }),
        ]),
      );
    },
    [updateEntity],
  );

  const rerunScreening = useCallback(
    (entityId: number) => {
      const found = (matchesByEntity.get(entityId) ?? []).length;
      updateEntity(entityId, (entity) => {
        const run = {
          id: `run-${entityId}-${entity.runs.length + 1}`,
          kind: 'manual' as const,
          date: new Date().toISOString(),
          matchesFound: found,
          newMatches: 0,
          by: CURRENT_USER.name,
        };
        return withAudit({ ...entity, runs: [...entity.runs, run] }, [
          makeEvent('screening_run', CURRENT_USER, 'run_manual', { after: String(found) }),
        ]);
      });
      return { matchesFound: found, newMatches: 0 };
    },
    [matchesByEntity, updateEntity],
  );

  const closeEntity = useCallback(
    (entityId: number) => {
      updateEntity(entityId, (entity) =>
        withAudit({ ...entity, closed: true, monitoring: false }, [
          makeEvent('closed', CURRENT_USER, 'closed'),
          ...(entity.monitoring ? [makeEvent('monitoring', SYSTEM_ACTOR, 'monitoring_off')] : []),
        ]),
      );
    },
    [updateEntity],
  );

  const reopenEntity = useCallback(
    (entityId: number) => {
      updateEntity(entityId, (entity) =>
        withAudit({ ...entity, closed: false }, [makeEvent('status', CURRENT_USER, 'reopened')]),
      );
    },
    [updateEntity],
  );

  const logEntityEvent = useCallback(
    (
      entityId: number,
      type: Extract<EntityAuditEventType, 'report' | 'export' | 'comment'>,
      description: string,
      after?: string,
    ) => {
      updateEntity(entityId, (entity) =>
        withAudit(entity, [makeEvent(type, CURRENT_USER, description, { after })]),
      );
    },
    [updateEntity],
  );

  const value = useMemo<ComplianceContextValue>(
    () => ({
      entities: dataset.entities,
      matches: dataset.matches,
      entityRows,
      alertItems,
      isLoading,
      pendingAlertsCount,
      getEntityByUid,
      getEntityRow,
      getEntityRowByUid,
      getEntityMatches,
      getMatch,
      qualifyMatches,
      toggleMonitoring,
      assignAnalyst,
      rerunScreening,
      closeEntity,
      reopenEntity,
      logEntityEvent,
    }),
    [
      dataset,
      entityRows,
      alertItems,
      isLoading,
      pendingAlertsCount,
      getEntityByUid,
      getEntityRow,
      getEntityRowByUid,
      getEntityMatches,
      getMatch,
      qualifyMatches,
      toggleMonitoring,
      assignAnalyst,
      rerunScreening,
      closeEntity,
      reopenEntity,
      logEntityEvent,
    ],
  );

  return <ComplianceContext.Provider value={value}>{children}</ComplianceContext.Provider>;
}

export function useCompliance(): ComplianceContextValue {
  const ctx = useContext(ComplianceContext);
  if (!ctx) {
    throw new Error('useCompliance must be used within a ComplianceProvider');
  }
  return ctx;
}

export { buildEntityRow };
