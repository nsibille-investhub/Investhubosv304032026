import {
  AXIS_KEYS,
  AXIS_NOT_APPLICABLE,
  type AxisKey,
  type ContextScalar,
  type ContextValue,
  type EditabilityCode,
  type GroupEditability,
  type ResolvedAction,
  type SimActionEntry,
  type SimContextCondition,
  type SimLabelled,
  type SimRawActionEntry,
  type SimState,
  type SimTransition,
  type SimWorkflow,
  type SimWorkflowBlock,
  type SimulatorFile,
} from './types';

type Translate = (key: string, vars?: Record<string, string | number>) => string;

const T = 'subscriptions.workflowSimulator';

// Correspondances de rôles données par les spécifications (prompt 2, actionsFor) : ces
// profils lisent la liste d'actions de gp. Le fichier ne les décrit pas lui-même.
const ROLE_BASE: Record<string, string> = {
  gp_readonly: 'gp',
  gp_exceptional: 'gp',
  gp_fastadd: 'gp',
};
const READ_ONLY_ROLES = new Set(['gp_readonly']);

// Déclencheurs de verrous cités en exemple par les spécifications (prompt 2, locks). Ils ne
// servent que si le verrou n'a pas de champ "trigger" dans le fichier.
const LOCK_TRIGGERS_FROM_SPEC: Record<string, SimContextCondition> = {
  sepa_mandate_approved: { key: 'sepa_mandate', in: ['approuve', 'approved'] },
  pending_subchange: { key: 'pending_changes', gt: 0 },
  transferred_in: 'transferred_in',
};

// Un verrou en L l'emporte sur tout ; un verrou en E l'emporte sur O et O* mais pas sur L.
// Le rang de O* face à E n'est pas précisé : il est traité comme O.
const RESTRICTION: Record<EditabilityCode, number> = { O: 0, 'O*': 0, E: 1, L: 2 };

const toLabelled = (item: SimLabelled | string): SimLabelled =>
  typeof item === 'string' ? { code: item, label: item } : item;

function counterTotal(value: ContextValue | undefined): number {
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object') return Object.values(value).reduce((sum, n) => sum + n, 0);
  return 0;
}

export function evaluateCondition(
  condition: SimContextCondition | undefined,
  context: Record<string, ContextValue>,
): boolean {
  if (condition === undefined) return true;
  if (typeof condition === 'string') {
    const value = context[condition];
    return typeof value === 'object' ? counterTotal(value) > 0 : Boolean(value);
  }
  const value = context[condition.key];
  if (condition.equals !== undefined) return value === condition.equals;
  if (condition.in) return condition.in.includes(value as ContextScalar);
  if (condition.gt !== undefined) return counterTotal(value) > condition.gt;
  return Boolean(value);
}

export function createSimulatorEngine(data: SimulatorFile, t: Translate) {
  const warned = new Set<string>();
  const warnMissing = (rule: string) => {
    if (warned.has(rule)) return;
    warned.add(rule);
    console.warn(`[Simulateur] Règle absente du fichier de scénarios : ${rule}`);
  };

  const stateByCode = new Map<string, SimState>(data.states.map(s => [s.code, s]));
  const workflowById = new Map<string, SimWorkflow>(data.workflows.map(w => [w.id, w]));
  const groups = data.editability.groups.map(toLabelled);
  const roles = data.roles.map(toLabelled);
  const activeIndex = data.states.findIndex(s => s.code === 'active');

  const stateLabel = (code: string) => stateByCode.get(code)?.label ?? code;

  function actionLabel(code: string): string {
    const entry = data.actions[code];
    if (entry === undefined) {
      warnMissing(`actions.${code}`);
      return code;
    }
    return typeof entry === 'string' ? entry : entry.label;
  }

  function normalizeEntry(raw: SimRawActionEntry): SimActionEntry {
    if (typeof raw === 'string') return { code: raw };
    const { action, ...rest } = raw;
    return { ...rest, code: rest.code ?? action ?? '' };
  }

  function actionsFor(state: string, role: string): ResolvedAction[] {
    const byRole = data.actions_by_state[state];
    if (!byRole) {
      warnMissing(`actions_by_state.${state}`);
      return [];
    }
    const baseRole = ROLE_BASE[role] ?? role;
    const entries = (byRole[baseRole] ?? [])
      .map(normalizeEntry)
      .filter(entry => !entry.role_required || entry.role_required === role);

    if (role !== baseRole) {
      const seen = new Set(entries.map(e => e.code));
      Object.values(byRole).forEach(list =>
        list.map(normalizeEntry).forEach(entry => {
          if (entry.role_required === role && !seen.has(entry.code)) {
            seen.add(entry.code);
            entries.push(entry);
          }
        }),
      );
    }

    const readOnlyReason = READ_ONLY_ROLES.has(role)
      ? t(`${T}.readOnlyReason`, { state: stateLabel(state) })
      : null;

    return entries.map(entry => ({
      ...entry,
      label: actionLabel(entry.code),
      ...(readOnlyReason ? { disabled: true, reason: entry.reason ?? readOnlyReason } : {}),
    }));
  }

  function lockTrigger(code: string): SimContextCondition | undefined {
    return data.editability.locks.find(l => l.code === code)?.trigger ?? LOCK_TRIGGERS_FROM_SPEC[code];
  }

  /** Verrous actifs du fait du contexte, limités à ceux que le fichier déclare. */
  function locksFromContext(context: Record<string, ContextValue>): string[] {
    return data.editability.locks
      .filter(lock => {
        const trigger = lockTrigger(lock.code);
        return trigger !== undefined && evaluateCondition(trigger, context);
      })
      .map(lock => lock.code);
  }

  function editabilityFor(state: string, locks: string[]): GroupEditability[] {
    const row = data.editability.matrix[state];
    if (!row) warnMissing(`editability.matrix.${state}`);
    const label = stateLabel(state);
    const activeLocks = data.editability.locks.filter(l => locks.includes(l.code));

    return groups.map(group => {
      let value = row?.[group.code];
      if (!value) {
        warnMissing(`editability.matrix.${state}.${group.code}`);
        value = 'L';
      }
      let result: GroupEditability = {
        group: group.code,
        label: group.label,
        value,
        source: { kind: 'state', code: state },
        message: t(`${T}.editability.${value === 'O*' ? 'conditional' : value}`, { state: label }),
      };
      activeLocks.forEach(lock => {
        const imposed = lock.effects?.[group.code];
        if (!imposed || RESTRICTION[imposed] <= RESTRICTION[result.value]) return;
        result = {
          ...result,
          value: imposed,
          source: { kind: 'lock', code: lock.code },
          message: lock.message ?? t(`${T}.editability.lock`, { lock: lock.label ?? lock.code }),
        };
      });
      return result;
    });
  }

  function isPreActive(state: string): boolean {
    if (activeIndex < 0) {
      warnMissing('states.active (nécessaire pour résoudre *pre_active)');
      return false;
    }
    const index = data.states.findIndex(s => s.code === state);
    return index >= 0 && index < activeIndex && !stateByCode.get(state)?.terminal;
  }

  function transitionsFrom(state: string, previousState: string | null): SimTransition[] {
    return data.transitions
      .filter(tr => tr.from === state || (tr.from === '*pre_active' && isPreActive(state)))
      .flatMap(tr => {
        if (tr.to !== '*previous') return [tr];
        return previousState ? [{ ...tr, to: previousState }] : [];
      });
  }

  function sequenceOf(workflowId: string): { sequence: string[]; variants: SimWorkflowBlock[] } {
    const wf = workflowById.get(workflowId);
    if (!wf) return { sequence: [], variants: [] };
    return { sequence: wf.sequence, variants: (wf.blocks ?? []).filter(b => Array.isArray(b.variant)) };
  }

  function waitingOn(state: string): string[] {
    const value = stateByCode.get(state)?.waiting_on;
    if (value === undefined) warnMissing(`states.${state}.waiting_on`);
    return value === undefined ? [] : Array.isArray(value) ? value : [value];
  }

  function v1Mapping(state: string): string | null {
    const value = stateByCode.get(state)?.v1_mapping;
    if (value === undefined) warnMissing(`states.${state}.v1_mapping`);
    return value ?? null;
  }

  function portalLabel(state: string, audience: string): string | null {
    const entry = data.portal_labels_v1?.[state];
    if (entry === undefined) {
      warnMissing(`portal_labels_v1.${state}`);
      return null;
    }
    return typeof entry === 'string' ? entry : entry[audience] ?? null;
  }

  function allowedSubstates(axis: AxisKey, state: string, context: Record<string, ContextValue>): string[] {
    const def = data.axes[axis];
    if (!def || !evaluateCondition(def.condition, context)) return [];
    const all = def.substates.map(s => toLabelled(s).code);
    if (Array.isArray(def.applies_to)) return def.applies_to.includes(state) ? all : [];
    return (def.applies_to[state] ?? []).filter(code => all.includes(code));
  }

  function constrainAxes(
    axes: Partial<Record<AxisKey, string>>,
    state: string,
    context: Record<string, ContextValue>,
  ): Record<AxisKey, string> {
    return Object.fromEntries(
      AXIS_KEYS.map(axis => {
        const allowed = allowedSubstates(axis, state, context);
        const current = axes[axis];
        const value = current && allowed.includes(current) ? current : allowed[0] ?? AXIS_NOT_APPLICABLE;
        return [axis, value];
      }),
    ) as Record<AxisKey, string>;
  }

  return {
    data,
    roles,
    groups,
    stateLabel,
    actionLabel,
    workflow: (id: string) => workflowById.get(id),
    state: (code: string) => stateByCode.get(code),
    actionsFor,
    editabilityFor,
    locksFromContext,
    transitionsFrom,
    sequenceOf,
    waitingOn,
    v1Mapping,
    portalLabel,
    allowedSubstates,
    constrainAxes,
  };
}

export type SimulatorEngine = ReturnType<typeof createSimulatorEngine>;
