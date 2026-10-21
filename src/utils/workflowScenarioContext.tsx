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
import { loadDemoFile, resolveDossier, type DemoDossier, type DemoFile, type ResolvedDossier } from './workflowSimulator/dossiers';
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
  dossiers: ResolvedDossier[];
  /** Dossier de démonstration chargé, jusqu'à la prochaine réinitialisation. */
  activeDossier: DemoDossier | null;
  /** Données fictives de la ligne de titre : défauts du fichier, surchargés par le dossier chargé. */
  demo: Pick<DemoFile, 'headerDefaults' | 'statusRenaming' | 'editSideEffects'>;
  loadDossier: (id: string) => void;
  update: (patch: Partial<WorkflowScenario> | ((current: WorkflowScenario) => WorkflowScenario)) => void;
  /** Joue une transition : historique, état d'arrivée, état précédent mémorisé ; patch ajuste le reste du scénario. */
  playTransition: (
    to: string,
    trigger: string,
    options?: { note?: string; patch?: (scenario: WorkflowScenario) => WorkflowScenario },
  ) => void;
  /** Rétablit un scénario antérieur sans toucher à l'historique affiché (annuler une simulation). */
  restore: (snapshot: WorkflowScenario) => void;
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
  const [demoFile, setDemoFile] = useState<DemoFile>({ dossiers: [], headerDefaults: {}, statusRenaming: {}, editSideEffects: {} });
  const [activeDossier, setActiveDossier] = useState<DemoDossier | null>(null);

  useEffect(() => {
    let alive = true;
    loadDemoFile().then(file => alive && setDemoFile(file));
    return () => {
      alive = false;
    };
  }, []);

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
    (to, trigger, options) => {
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
          note: options?.note,
        },
      ]);
      update(current => {
        const next = { ...current, state: to, previousState: from };
        return options?.patch ? options.patch(next) : next;
      });
    },
    [engine, scenario, update],
  );

  const restore = useCallback<ReadyValue['restore']>(snapshot => update(() => snapshot), [update]);

  const reset = useCallback(() => {
    if (!engine) return;
    setHistory([]);
    setActiveDossier(null);
    setScenario(defaultScenario(engine));
  }, [engine]);

  const dossiers = useMemo(() => {
    if (!engine) return [];
    const base = defaultScenario(engine);
    return demoFile.dossiers.map(d => resolveDossier(engine, d, base));
  }, [engine, demoFile]);

  const loadDossier = useCallback(
    (id: string) => {
      const resolved = dossiers.find(d => d.dossier.id === id);
      if (!resolved?.ok) return;
      const { scenario: next, dossier } = resolved;
      setScenario(next);
      setActiveDossier(dossier);
      setHistory(
        next.previousState
          ? [
              {
                id: 'h1',
                from: next.previousState,
                to: next.state,
                trigger: 'demo_dossier',
                actor: next.role,
                at: new Date(HISTORY_ORIGIN).toISOString(),
                note: dossier.data.reason,
              },
            ]
          : [],
      );
    },
    [dossiers],
  );

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
      dossiers,
      activeDossier,
      demo: {
        headerDefaults: { ...demoFile.headerDefaults, ...activeDossier?.data.header },
        statusRenaming: demoFile.statusRenaming,
        editSideEffects: demoFile.editSideEffects,
      },
      loadDossier,
      update,
      playTransition,
      restore,
      reset,
    };
  }, [load, engine, scenario, history, dossiers, activeDossier, demoFile, loadDossier, update, playTransition, restore, reset]);

  return <WorkflowScenarioContext.Provider value={value}>{children}</WorkflowScenarioContext.Provider>;
}

export function useWorkflowScenario(): WorkflowScenarioValue {
  return useContext(WorkflowScenarioContext);
}
