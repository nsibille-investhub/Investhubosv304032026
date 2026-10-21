import { normalizeText, toLabelled, type SimulatorEngine } from './engine';
import { normalizeScenario } from './scenario';
import { AXIS_KEYS, type AxisKey, type ContextScalar, type ContextValue, type WorkflowScenario } from './types';

const SOURCES = import.meta.glob<unknown>('/data/simulateur-dossiers-demo.json', { import: 'default' });

export interface DemoDossierData {
  fund: string;
  share: string;
  investor: string;
  distributor: string | null;
  parent_distributor?: string | null;
  amount: number;
  summary?: string;
  reason?: string;
}

export interface DemoDossier {
  id: string;
  workflow: string;
  /** Code ou libellé d'état. */
  state: string;
  previous_state?: string;
  /** Valeurs de contexte : code ou libellé de l'option. */
  context?: Record<string, ContextValue>;
  /** Sous-états par axe : code ou libellé. */
  axes?: Partial<Record<AxisKey, string>>;
  locks?: string[];
  data: DemoDossierData;
}

export type ResolvedDossier =
  | { ok: true; dossier: DemoDossier; scenario: WorkflowScenario }
  | { ok: false; dossier: DemoDossier; missing: string[] };

export async function loadDemoDossiers(): Promise<DemoDossier[]> {
  const loader = Object.values(SOURCES)[0];
  if (!loader) {
    console.warn('[Simulateur] data/simulateur-dossiers-demo.json introuvable');
    return [];
  }
  try {
    const raw = (await loader()) as { dossiers?: DemoDossier[] };
    return Array.isArray(raw.dossiers) ? raw.dossiers : [];
  } catch (error) {
    console.error('[Simulateur] Dossiers de démonstration illisibles', error);
    return [];
  }
}

/**
 * Traduit un dossier de démonstration en scénario. Tout ce qui ne se retrouve pas dans le
 * fichier de scénarios est listé dans "missing" : le dossier reste visible, non chargeable.
 */
export function resolveDossier(
  engine: SimulatorEngine,
  dossier: DemoDossier,
  base: WorkflowScenario,
): ResolvedDossier {
  const missing: string[] = [];
  const { data } = engine;

  if (!engine.workflow(dossier.workflow)) missing.push(`workflow ${dossier.workflow}`);
  const state = engine.findState(dossier.state);
  if (!state) missing.push(`état "${dossier.state}"`);
  const previous = dossier.previous_state ? engine.findState(dossier.previous_state) : undefined;
  if (dossier.previous_state && !previous) missing.push(`état "${dossier.previous_state}"`);

  const context: Record<string, ContextValue> = { ...base.context };
  Object.entries(dossier.context ?? {}).forEach(([key, value]) => {
    const setting = data.context[key];
    if (!setting) {
      missing.push(`contexte ${key}`);
      return;
    }
    if (typeof value !== 'string' || !setting.values?.length) {
      context[key] = value;
      return;
    }
    const match = setting.values.find(option => {
      const { code, label } = toLabelled(typeof option === 'object' ? option : { code: String(option), label: String(option) });
      return code === value || normalizeText(label) === normalizeText(value);
    });
    if (match === undefined) missing.push(`valeur "${value}" de ${key}`);
    else context[key] = (typeof match === 'object' ? match.code : match) as ContextScalar;
  });

  const axes = { ...base.axes };
  AXIS_KEYS.forEach(axis => {
    const wanted = dossier.axes?.[axis];
    if (!wanted) return;
    const found = data.axes[axis]?.substates
      .map(s => toLabelled(s))
      .find(s => s.code === wanted || normalizeText(s.label) === normalizeText(wanted));
    if (!found) missing.push(`sous-état "${wanted}" de ${axis}`);
    else axes[axis] = found.code;
  });

  if (missing.length || !state) return { ok: false, dossier, missing };

  const scenario = normalizeScenario(engine, {
    ...base,
    workflow: dossier.workflow,
    state: state.code,
    context,
    axes,
    manualLocks: dossier.locks ?? [],
    previousState: previous?.code ?? null,
  });
  if (scenario.state !== state.code) {
    return { ok: false, dossier, missing: [`état "${dossier.state}" hors reachable_states de ${dossier.workflow}`] };
  }
  return { ok: true, dossier, scenario };
}
