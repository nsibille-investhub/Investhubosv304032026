import { contextDefault, type SimulatorEngine } from './engine';
import type { ContextScalar, ContextValue, DecisionChoice, SimLabelled, WorkflowScenario } from './types';

export const PERMALINK_PARAM = 'sim';

const optionCode = (value: ContextScalar | SimLabelled): ContextScalar =>
  typeof value === 'object' && value !== null ? value.code : value;

/**
 * Scénario par défaut des spécifications : workflow D3, état À contrôler, rôle gp, appels de
 * fonds, pure (souscription non administrée, assisted false), sans validation interne. Le reste
 * du contexte prend la valeur de départ de chaque réglage du fichier.
 */
export function defaultScenario(engine: SimulatorEngine): WorkflowScenario {
  const { data } = engine;
  const context: Record<string, ContextValue> = {};
  Object.entries(data.context).forEach(([key, setting]) => {
    if (key !== 'role') context[key] = contextDefault(setting);
  });
  context.payment_mode = 'appels_de_fonds';
  context.assisted = false;
  context.internal_validation_enabled = false;

  const workflow = engine.workflow('D3') ? 'D3' : data.workflows[0]?.id ?? '';
  if (workflow !== 'D3') console.warn('[Simulateur] Workflow D3 introuvable, premier workflow utilisé');

  return normalizeScenario(engine, {
    workflow,
    state: 'a_controler',
    role: 'gp',
    context,
    axes: { signature: '', internal_validation: '', payment: '' },
    manualLocks: [],
    decisions: Object.fromEntries(data.decisions.map(d => [d.id, 'default' as DecisionChoice])),
    previousState: null,
  });
}

/** Applique toutes les contraintes du fichier ; toute modification du scénario repasse ici. */
export function normalizeScenario(engine: SimulatorEngine, scenario: WorkflowScenario): WorkflowScenario {
  const { data } = engine;
  const workflow = engine.workflow(scenario.workflow) ?? data.workflows[0];
  const reachable = workflow?.reachable_states ?? [];
  const state = reachable.includes(scenario.state) ? scenario.state : workflow?.sequence[0] ?? scenario.state;

  const roleSetting = data.context.role.values;
  const roleValues = (Array.isArray(roleSetting) ? roleSetting : []).map(v => String(optionCode(v)));
  const role = roleValues.includes(scenario.role) ? scenario.role : roleValues[0] ?? scenario.role;

  const context = { ...scenario.context };
  if (!workflow?.assisted_allowed) context.assisted = false;
  if (workflow && engine.selfForced(workflow.id)) context.self = true;

  const lockCodes = data.editability.locks.map(l => l.code);
  const decisionIds = data.decisions.map(d => d.id);

  return {
    workflow: workflow?.id ?? scenario.workflow,
    state,
    role,
    context,
    axes: engine.constrainAxes(scenario.axes, state, context, workflow?.id),
    manualLocks: scenario.manualLocks.filter(code => lockCodes.includes(code)),
    decisions: Object.fromEntries(
      decisionIds.map(id => [id, scenario.decisions[id] === 'v1' ? 'v1' : 'default']),
    ) as Record<string, DecisionChoice>,
    previousState: scenario.previousState,
  };
}

/** Verrous du contexte et verrous cochés à la main, sans doublon. */
export function activeLocks(engine: SimulatorEngine, scenario: WorkflowScenario): string[] {
  return Array.from(new Set([...engine.locksFromContext(scenario.context), ...scenario.manualLocks]));
}

interface SerializedScenario {
  w: string;
  s: string;
  r: string;
  c: Record<string, ContextValue>;
  a: WorkflowScenario['axes'];
  l: string[];
  d: string[];
}

export function serializeScenario(scenario: WorkflowScenario): string {
  const payload: SerializedScenario = {
    w: scenario.workflow,
    s: scenario.state,
    r: scenario.role,
    c: scenario.context,
    a: scenario.axes,
    l: scenario.manualLocks,
    d: Object.entries(scenario.decisions)
      .filter(([, choice]) => choice === 'v1')
      .map(([id]) => id),
  };
  return JSON.stringify(payload);
}

export function deserializeScenario(
  engine: SimulatorEngine,
  raw: string | undefined,
  fallback: WorkflowScenario,
): WorkflowScenario {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as Partial<SerializedScenario>;
    const v1 = new Set(parsed.d ?? []);
    return normalizeScenario(engine, {
      workflow: parsed.w ?? fallback.workflow,
      state: parsed.s ?? fallback.state,
      role: parsed.r ?? fallback.role,
      context: { ...fallback.context, ...parsed.c },
      axes: { ...fallback.axes, ...parsed.a },
      manualLocks: parsed.l ?? [],
      decisions: Object.fromEntries(
        Object.keys(fallback.decisions).map(id => [id, v1.has(id) ? 'v1' : 'default']),
      ) as Record<string, DecisionChoice>,
      previousState: null,
    });
  } catch {
    console.warn('[Simulateur] Permalien illisible, scénario par défaut utilisé');
    return fallback;
  }
}

/** Écrit le scénario dans le hash sans déclencher de navigation ni toucher aux autres paramètres. */
export function writePermalink(value: string | null) {
  const [path, query = ''] = window.location.hash.replace(/^#/, '').split('?');
  const params = new URLSearchParams(query);
  if (value) params.set(PERMALINK_PARAM, value);
  else params.delete(PERMALINK_PARAM);
  const qs = params.toString();
  const hash = qs ? `#${path}?${qs}` : `#${path}`;
  if (hash !== window.location.hash) window.history.replaceState(null, '', hash);
}

export function readPermalink(): string | undefined {
  const query = window.location.hash.split('?')[1];
  return query ? new URLSearchParams(query).get(PERMALINK_PARAM) ?? undefined : undefined;
}
