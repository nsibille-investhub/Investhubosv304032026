import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from './languageContext';
import { createSimulatorEngine, type SimulatorEngine } from './workflowSimulator/engine';
import { loadSimulatorFile, type SimulatorLoadResult } from './workflowSimulator/load';
import {
  activeLocks,
  defaultScenario,
  deserializeScenario,
  normalizeScenario,
  readPermalink,
  serializeScenario,
  writePermalink,
} from './workflowSimulator/scenario';
import { runSimulatorSelfCheck } from './workflowSimulator/selfCheck';
import type {
  GroupEditability,
  ResolvedAction,
  ScenarioHistoryEntry,
  SimTransition,
  WorkflowScenario,
} from './workflowSimulator/types';

// Horodatage fictif de l'historique : une heure entre deux transitions jouées.
const HISTORY_ORIGIN = Date.UTC(2026, 2, 2, 8, 0);
const HISTORY_STEP_MS = 60 * 60 * 1000;

interface ReadyValue {
  status: 'ready';
  engine: SimulatorEngine;
  scenario: WorkflowScenario;
  locks: string[];
  actions: ResolvedAction[];
  editability: GroupEditability[];
  transitions: SimTransition[];
  history: ScenarioHistoryEntry[];
  update: (patch: Partial<WorkflowScenario> | ((current: WorkflowScenario) => WorkflowScenario)) => void;
  playTransition: (to: string, trigger: string) => void;
  reset: () => void;
}

export type WorkflowScenarioValue =
  | { status: 'loading' }
  | { status: 'unavailable'; reason: 'missing' | 'invalid' }
  | ReadyValue;

const WorkflowScenarioContext = createContext<WorkflowScenarioValue>({ status: 'loading' });

export function WorkflowScenarioProvider({ children }: { children: React.ReactNode }) {
  // t change à chaque rendu : on passe par une référence et on ne recrée le moteur qu'au changement de langue.
  const { t, lang } = useTranslation();
  const tRef = useRef(t);
  tRef.current = t;
  const [load, setLoad] = useState<SimulatorLoadResult | null>(null);
  const [scenario, setScenario] = useState<WorkflowScenario | null>(null);
  const [history, setHistory] = useState<ScenarioHistoryEntry[]>([]);

  useEffect(() => {
    let alive = true;
    loadSimulatorFile().then(result => {
      if (!alive) return;
      if (result.status === 'ready') runSimulatorSelfCheck(result.data);
      else if (result.reason === 'missing') console.warn('[Simulateur] data/simulateur-workflow-etats.json introuvable');
      else console.error('[Simulateur] Fichier de scénarios invalide', result.errors);
      setLoad(result);
    });
    return () => {
      alive = false;
    };
  }, []);

  const engine = useMemo(
    () =>
      load?.status === 'ready'
        ? createSimulatorEngine(load.data, (key, vars) => tRef.current(key, vars))
        : null,
    [load, lang],
  );

  useEffect(() => {
    if (!engine || scenario) return;
    setScenario(deserializeScenario(engine, readPermalink(), defaultScenario(engine)));
  }, [engine, scenario]);

  useEffect(() => {
    if (scenario) writePermalink(serializeScenario(scenario));
  }, [scenario]);

  const update = useCallback<ReadyValue['update']>(
    patch => {
      if (!engine) return;
      setScenario(current => {
        if (!current) return current;
        const next = typeof patch === 'function' ? patch(current) : { ...current, ...patch };
        return normalizeScenario(engine, next);
      });
    },
    [engine],
  );

  const playTransition = useCallback<ReadyValue['playTransition']>(
    (to, trigger) => {
      if (!engine || !scenario) return;
      const from = scenario.state;
      setHistory(entries => [
        ...entries,
        {
          id: `h${entries.length + 1}`,
          from,
          to,
          trigger,
          actor: scenario.role,
          at: new Date(HISTORY_ORIGIN + entries.length * HISTORY_STEP_MS).toISOString(),
        },
      ]);
      update(current => ({ ...current, state: to, previousState: from }));
    },
    [engine, scenario, update],
  );

  const reset = useCallback(() => {
    if (!engine) return;
    setHistory([]);
    setScenario(defaultScenario(engine));
  }, [engine]);

  const value = useMemo<WorkflowScenarioValue>(() => {
    if (!load) return { status: 'loading' };
    if (load.status === 'unavailable') return { status: 'unavailable', reason: load.reason };
    if (!engine || !scenario) return { status: 'loading' };
    const locks = activeLocks(engine, scenario);
    return {
      status: 'ready',
      engine,
      scenario,
      locks,
      actions: engine.actionsFor(scenario.state, scenario.role),
      editability: engine.editabilityFor(scenario.state, locks),
      transitions: engine.transitionsFrom(scenario.state, scenario.previousState),
      history,
      update,
      playTransition,
      reset,
    };
  }, [load, engine, scenario, history, update, playTransition, reset]);

  return <WorkflowScenarioContext.Provider value={value}>{children}</WorkflowScenarioContext.Provider>;
}

export function useWorkflowScenario(): WorkflowScenarioValue {
  return useContext(WorkflowScenarioContext);
}
