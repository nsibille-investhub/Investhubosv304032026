import type { SimulatorFile } from './types';

// Import paresseux par glob : si le fichier est absent, la liste est vide et la build passe.
const SOURCES = import.meta.glob<unknown>('/data/simulateur-workflow-etats.json', { import: 'default' });

export type SimulatorLoadResult =
  | { status: 'ready'; data: SimulatorFile }
  | { status: 'unavailable'; reason: 'missing' | 'invalid'; errors: string[] };

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export function validateSimulatorFile(raw: unknown): string[] {
  const errors: string[] = [];
  if (!isObject(raw)) return ['racine : objet attendu'];

  const arrays = ['workflows', 'states', 'roles', 'transitions', 'decisions'] as const;
  const objects = ['actions', 'actions_by_state', 'editability', 'axes', 'context'] as const;
  arrays.forEach(key => {
    if (!Array.isArray(raw[key])) errors.push(`${key} : tableau attendu`);
  });
  objects.forEach(key => {
    if (!isObject(raw[key])) errors.push(`${key} : objet attendu`);
  });
  if (errors.length) return errors;

  (raw.workflows as unknown[]).forEach((wf, i) => {
    if (!isObject(wf) || typeof wf.id !== 'string') errors.push(`workflows[${i}].id manquant`);
    else {
      if (!Array.isArray(wf.sequence)) errors.push(`workflows[${wf.id}].sequence manquante`);
      if (!Array.isArray(wf.reachable_states)) errors.push(`workflows[${wf.id}].reachable_states manquant`);
    }
  });
  (raw.states as unknown[]).forEach((st, i) => {
    if (!isObject(st) || typeof st.code !== 'string' || typeof st.label !== 'string') {
      errors.push(`states[${i}] : code et label attendus`);
    }
  });
  const editability = raw.editability as Record<string, unknown>;
  if (!Array.isArray(editability.groups)) errors.push('editability.groups : tableau attendu');
  if (!isObject(editability.matrix)) errors.push('editability.matrix : objet attendu');
  if (!Array.isArray(editability.locks)) errors.push('editability.locks : tableau attendu');
  const context = raw.context as Record<string, unknown>;
  if (!isObject(context.role) || !Array.isArray(context.role.values)) {
    errors.push('context.role.values : tableau attendu');
  }
  const axes = raw.axes as Record<string, unknown>;
  ['signature', 'internal_validation', 'payment'].forEach(key => {
    const axis = axes[key];
    if (!isObject(axis) || !Array.isArray(axis.substates)) errors.push(`axes.${key}.substates : tableau attendu`);
  });
  return errors;
}

let pending: Promise<SimulatorLoadResult> | null = null;

/** Charge le fichier une seule fois par session de page. */
export function loadSimulatorFile(): Promise<SimulatorLoadResult> {
  if (pending) return pending;
  const loader = Object.values(SOURCES)[0];
  if (!loader) {
    pending = Promise.resolve({ status: 'unavailable', reason: 'missing', errors: [] });
    return pending;
  }
  pending = loader()
    .then((raw): SimulatorLoadResult => {
      const errors = validateSimulatorFile(raw);
      return errors.length
        ? { status: 'unavailable', reason: 'invalid', errors }
        : { status: 'ready', data: raw as SimulatorFile };
    })
    .catch((error: unknown): SimulatorLoadResult => ({
      status: 'unavailable',
      reason: 'invalid',
      errors: [String(error)],
    }));
  return pending;
}
