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
  type SimContextSetting,
  type SimLabelled,
  type SimRole,
  type SimRawActionEntry,
  type SimState,
  type SimTransition,
  type SimWorkflow,
  type SimWorkflowBlock,
  type SimulatorFile,
  type WorkflowFamily,
  type WorkflowOption,
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

export const baseRole = (role: string) => ROLE_BASE[role] ?? role;

// Le fichier décrit les verrous en texte (condition, effect) sans lien avec le contexte.
// Déclencheurs repris des spécifications (prompt 2) et de context.*.effect ; les autres verrous
// se cochent à la main dans le panneau.
const LOCK_TRIGGERS_FROM_SPEC: Record<string, SimContextCondition> = {
  sepa_mandate_approved: { key: 'sepa_mandate', equals: 'approuve' },
  sepa_mandate_pending: { key: 'sepa_mandate', equals: 'en_attente' },
  pending_subchange: { key: 'pending_changes', gt: 0 },
  transferred_in: 'transferred_in',
};

// Les effets des verrous sont du texte ("G6c en lecture, partenaire en E", "G3 en E").
// Lecture : "Gn en lecture" donne L, "Gn en E" donne E ; "type de souscripteur ...
// déverrouillable" (onboarding_started) vise G2 en E. Le reste du texte n'est pas interprété.
function parseLockEffects(effect: string | undefined): Record<string, EditabilityCode> {
  const result: Record<string, EditabilityCode> = {};
  if (!effect) return result;
  for (const match of effect.matchAll(/\b(G\d+[a-z]?) en (lecture|E)\b/g)) {
    result[match[1]] = match[2] === 'E' ? 'E' : 'L';
  }
  if (/type de souscripteur/.test(effect) && /déverrouillable/.test(effect)) result.G2 = 'E';
  return result;
}

// Codes d'éditabilité possibles ; une valeur composite ("conseiller O, partenaire E") est
// ramenée à son code le plus restrictif pour le groupe, le détail restant disponible.
const EDIT_CODES: EditabilityCode[] = ['O', 'O*', 'E', 'L'];

// Options du workflow : drapeau du fichier et clé de workflow_prerequisites.
const OPTION_FLAGS: Record<WorkflowOption, { flag: 'presign' | 'prevalidation' | 'countersign' | 'bo_invitation'; prerequisite: string }> = {
  presignature: { flag: 'presign', prerequisite: 'presign' },
  prevalidation: { flag: 'prevalidation', prerequisite: 'prevalidation' },
  countersignature: { flag: 'countersign', prerequisite: 'countersign' },
  backoffice_initiation: { flag: 'bo_invitation', prerequisite: 'bo_invitation' },
};

// Souscription directe automatique sur D1 et D2 (spécifications, prompt 3 ; context.self.effect).
const SELF_FORCED_FROM_SPEC = ['D1', 'D2'];

// Un verrou en L l'emporte sur tout ; un verrou en E l'emporte sur O et O* mais pas sur L.
// Le rang de O* face à E n'est pas précisé : il est traité comme O.
const RESTRICTION: Record<EditabilityCode, number> = { O: 0, 'O*': 0, E: 1, L: 2 };

export const toLabelled = <T extends SimLabelled>(item: T | string): T =>
  typeof item === 'string' ? ({ code: item, label: item } as T) : item;

export const normalizeText = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

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

export type ContextKind = 'boolean' | 'select' | 'counter' | 'counters' | 'date';

/**
 * Nature d'un réglage de contexte. Le fichier donne soit une liste de valeurs, soit une
 * description en texte : "0..n" (compteur), "date ou null", "compteur investisseur,
 * compteur partenaire" (compteurs nommés).
 */
export function contextKind(setting: SimContextSetting | undefined): { kind: ContextKind; counters?: string[] } {
  const values = setting?.values;
  if (Array.isArray(values)) {
    return { kind: values.every(v => typeof v === 'boolean') ? 'boolean' : 'select' };
  }
  const text = normalizeText(String(values ?? ''));
  if (text.includes('compteur')) {
    return { kind: 'counters', counters: text.split(',').map(part => part.replace('compteur', '').trim()).filter(Boolean) };
  }
  if (text.includes('date')) return { kind: 'date' };
  return { kind: 'counter' };
}

/** Valeur de départ d'un réglage : "default" du fichier, sinon la première valeur ou le neutre. */
export function contextDefault(setting: SimContextSetting | undefined): ContextValue {
  if (setting?.default !== undefined) return setting.default;
  const { kind, counters } = contextKind(setting);
  if (kind === 'boolean' || kind === 'select') {
    const first = (setting?.values as Array<ContextScalar | SimLabelled>)[0];
    return typeof first === 'object' && first !== null ? first.code : first;
  }
  if (kind === 'counters') return Object.fromEntries((counters ?? []).map(name => [name, 0]));
  if (kind === 'date') return null;
  return 0;
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
  // Libellé de groupe "Titre : champs" : le titre sert d'intitulé, les champs de description.
  const groups = Object.entries(data.editability.groups).map(([code, text]) => {
    const [title, ...rest] = text.split(' : ');
    return { code, label: title, description: rest.join(' : ') || undefined, text };
  });
  const roles = data.roles.map(r => toLabelled<SimRole>(r));
  const activeIndex = data.states.findIndex(s => s.code === 'active');

  const stateLabel = (code: string) => stateByCode.get(code)?.label ?? code;

  function actionLabel(code: string): string {
    const entry = data.actions[code];
    if (entry === undefined) {
      warnMissing(`actions.${code}`);
      return code;
    }
    // Les libellés portent parfois une précision entre parenthèses ("Annuler (motif)",
    // "Modifier une réponse (IC-5616)") : elle est retirée de l'interface.
    const label = typeof entry === 'string' ? entry : entry.label;
    return label.replace(/\s*\([^)]*\)\s*$/, '');
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

  /** Codes d'action que le rôle possède dans au moins un état, dans l'ordre du fichier. */
  function actionCodesForRole(role: string): string[] {
    const codes: string[] = [];
    Object.values(data.actions_by_state).forEach(byRole => {
      (byRole[baseRole(role)] ?? []).map(normalizeEntry).forEach(entry => {
        if (entry.role_required && entry.role_required !== role) return;
        if (!codes.includes(entry.code)) codes.push(entry.code);
      });
      if (role !== baseRole(role)) {
        Object.values(byRole).forEach(list =>
          list.map(normalizeEntry).forEach(entry => {
            if (entry.role_required === role && !codes.includes(entry.code)) codes.push(entry.code);
          }),
        );
      }
    });
    return codes;
  }

  function lockTrigger(code: string): SimContextCondition | undefined {
    return LOCK_TRIGGERS_FROM_SPEC[code];
  }

  function lockEffects(code: string): Record<string, EditabilityCode> {
    return parseLockEffects(data.editability.locks.find(l => l.code === code)?.effect);
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
      const raw = row?.[group.code];
      let value: EditabilityCode;
      let detail: Record<string, EditabilityCode> | undefined;
      if (!raw) {
        warnMissing(`editability.matrix.${state}.${group.code}`);
        value = 'L';
      } else if ((EDIT_CODES as string[]).includes(raw)) {
        value = raw as EditabilityCode;
      } else {
        detail = Object.fromEntries(
          Array.from(raw.matchAll(/([\p{L}]+) (O\*?|L|E)\b/gu)).map(m => [normalizeText(m[1]), m[2] as EditabilityCode]),
        );
        value = Object.values(detail).reduce<EditabilityCode>((worst, code) => (RESTRICTION[code] > RESTRICTION[worst] ? code : worst), 'O');
      }
      let result: GroupEditability = {
        group: group.code,
        label: group.label,
        description: group.description,
        value,
        detail,
        source: { kind: 'state', code: state },
        message: t(`${T}.editability.${value === 'O*' ? 'conditional' : value}`, { state: label }),
      };
      activeLocks.forEach(lock => {
        const imposed = lockEffects(lock.code)[group.code];
        if (!imposed || RESTRICTION[imposed] <= RESTRICTION[result.value]) return;
        result = {
          ...result,
          value: imposed,
          source: { kind: 'lock', code: lock.code },
          message: t(`${T}.editability.lock`, { lock: lock.label ?? lock.code }),
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

  function blocksOf(workflowId: string): SimWorkflowBlock[] {
    const wf = workflowById.get(workflowId);
    return (wf?.blocks ?? []).map(name => {
      const block = data.blocks?.[name];
      if (!block) warnMissing(`blocks.${name}`);
      return block ? { ...block, note: block.variant_note ?? block.note } : {};
    });
  }

  function sequenceOf(workflowId: string): { sequence: string[]; variants: SimWorkflowBlock[] } {
    const wf = workflowById.get(workflowId);
    if (!wf) return { sequence: [], variants: [] };
    return { sequence: wf.sequence, variants: blocksOf(workflowId).filter(b => Array.isArray(b.variant)) };
  }

  function waitingOn(state: string): string[] {
    const value = stateByCode.get(state)?.waiting_on;
    if (value === undefined) warnMissing(`states.${state}.waiting_on`);
    return value ? [value] : [];
  }

  function v1Mapping(state: string): string | null {
    const value = stateByCode.get(state)?.v1_mapping;
    if (value === undefined) warnMissing(`states.${state}.v1_mapping`);
    return value ?? null;
  }

  function portalLabel(state: string, audience: 'investor' | 'distributor'): string | null {
    const entry = data.portal_labels_v1?.find(row => row.states.includes(state));
    if (!entry) {
      warnMissing(`portal_labels_v1 pour ${state}`);
      return null;
    }
    return entry[audience] ?? null;
  }

  function familyOf(workflowId: string): WorkflowFamily | null {
    return workflowById.get(workflowId)?.family ?? null;
  }

  function optionsOf(workflowId: string): WorkflowOption[] {
    const wf = workflowById.get(workflowId);
    if (!wf) return [];
    return (Object.keys(OPTION_FLAGS) as WorkflowOption[]).filter(option => wf[OPTION_FLAGS[option].flag]);
  }

  /** Pré-requis du fonds : ceux des options actives, puis celui de la famille. */
  function prerequisitesOf(workflowId: string): string[] {
    const prerequisites = data.workflow_prerequisites ?? {};
    const family = familyOf(workflowId);
    const familyKey = family === 'A' ? 'family_A' : family ? 'family_B_C' : null;
    return [
      ...optionsOf(workflowId).map(option => prerequisites[OPTION_FLAGS[option].prerequisite]),
      familyKey ? prerequisites[familyKey] : undefined,
    ].filter((p): p is string => Boolean(p));
  }

  function selfForced(workflowId: string): boolean {
    const wf = workflowById.get(workflowId);
    if (!wf) return false;
    return SELF_FORCED_FROM_SPEC.includes(wf.id);
  }

  function v1Label(state: string): string | null {
    return stateByCode.get(state)?.v1_label ?? null;
  }

  /** Retrouve un état par code ou par libellé (casse et accents ignorés). */
  function findState(codeOrLabel: string): SimState | undefined {
    const key = normalizeText(codeOrLabel);
    return stateByCode.get(codeOrLabel) ?? data.states.find(s => normalizeText(s.label) === key);
  }

  /**
   * Conditions des axes, données en texte par le fichier et traduites ici :
   * internal_validation "fonds à validation interne", payment "fonds à paiement direct,
   * état active" ; un sous-état "C-sig. oui" exige un workflow à contresignature.
   */
  function axisApplies(axis: AxisKey, state: string, context: Record<string, ContextValue>): boolean {
    const def = data.axes[axis];
    if (!def) return false;
    if (axis === 'payment') return context.payment_mode === 'paiement_direct' && state === 'active';
    if (axis === 'internal_validation' && !context.internal_validation_enabled) return false;
    return (def.applies_to ?? []).includes(state);
  }

  function allowedSubstates(
    axis: AxisKey,
    state: string,
    context: Record<string, ContextValue>,
    workflowId?: string,
  ): string[] {
    if (!axisApplies(axis, state, context)) return [];
    const countersign = workflowId ? Boolean(workflowById.get(workflowId)?.countersign) : true;
    return data.axes[axis].substates
      .filter(sub => !sub.states || sub.states.includes(state))
      .filter(sub => !(sub.condition && /c-sig/i.test(sub.condition)) || countersign)
      .map(sub => sub.code);
  }

  function constrainAxes(
    axes: Partial<Record<AxisKey, string>>,
    state: string,
    context: Record<string, ContextValue>,
    workflowId?: string,
  ): Record<AxisKey, string> {
    return Object.fromEntries(
      AXIS_KEYS.map(axis => {
        const allowed = allowedSubstates(axis, state, context, workflowId);
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
    actionCodesForRole,
    editabilityFor,
    locksFromContext,
    transitionsFrom,
    sequenceOf,
    waitingOn,
    v1Mapping,
    portalLabel,
    allowedSubstates,
    constrainAxes,
    familyOf,
    optionsOf,
    prerequisitesOf,
    selfForced,
    v1Label,
    findState,
  };
}

export type SimulatorEngine = ReturnType<typeof createSimulatorEngine>;
