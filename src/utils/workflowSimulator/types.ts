// Schéma attendu de data/simulateur-workflow-etats.json.
// Le fichier n'était pas dans le dépôt au moment de l'écriture du moteur : les noms de clés
// suivent la description des spécifications (prompt 2). Les clés notées "attendue" sont
// vérifiées au chargement par validateSimulatorFile ; une clé optionnelle absente est signalée
// en console comme règle manquante, jamais comblée par le moteur.

export type EditabilityCode = 'O' | 'L' | 'O*' | 'E';

export interface SimLabelled {
  code: string;
  label: string;
}

export interface SimWorkflowBlock {
  /** Séquence alternative d'états, quand le bloc en définit une. */
  variant?: string[];
  note?: string;
  [key: string]: unknown;
}

export const WORKFLOW_OPTIONS = ['presignature', 'prevalidation', 'countersignature', 'backoffice_initiation'] as const;
export type WorkflowOption = (typeof WORKFLOW_OPTIONS)[number];
export type WorkflowFamily = 'A' | 'B' | 'C';

export interface SimWorkflow {
  id: string;
  label?: string;
  sequence: string[];
  reachable_states: string[];
  assisted_allowed?: boolean;
  blocks?: SimWorkflowBlock[];
  family?: WorkflowFamily;
  initiator?: string;
  channel?: string;
  /** Options actives : liste de codes ou drapeaux par code. */
  options?: WorkflowOption[] | Partial<Record<WorkflowOption, boolean>>;
  /** Souscription directe imposée par le workflow. */
  self_forced?: boolean;
  [key: string]: unknown;
}

export interface SimState extends SimLabelled {
  terminal?: boolean;
  /** Qui doit agir pour que le dossier avance (rôle ou libellé). */
  waiting_on?: string | string[];
  /** Statut V1 correspondant. */
  v1_mapping?: string;
  v1_label?: string;
  [key: string]: unknown;
}

export interface SimRole extends SimLabelled {
  right?: string;
}

export interface SimActionEntry {
  code: string;
  to?: string;
  note?: string;
  condition?: string;
  decision?: string;
  disabled?: boolean;
  reason?: string;
  role_required?: string;
}

/** Une entrée d'actions_by_state peut être un simple code ou un objet détaillé. */
export type SimRawActionEntry = string | (Partial<SimActionEntry> & { action?: string });

export type SimActionLabel = string | { label: string; [key: string]: unknown };

export interface SimTransition {
  from: string;
  to: string;
  trigger?: string;
  actor?: string;
  [key: string]: unknown;
}

export interface SimLock {
  code: string;
  label?: string;
  message?: string;
  /** Niveau imposé par groupe : L (lecture) ou E (sur demande). */
  effects?: Record<string, EditabilityCode>;
  /** Déclencheur depuis le contexte, s'il est décrit dans le fichier. */
  trigger?: SimContextCondition;
  [key: string]: unknown;
}

export interface SimEditability {
  groups: Array<SimLabelled | string>;
  matrix: Record<string, Record<string, EditabilityCode>>;
  locks: SimLock[];
  portal?: unknown;
  [key: string]: unknown;
}

/** Condition sur le contexte : nom de clé (vraie si la valeur est vraie) ou comparaison. */
export type SimContextCondition =
  | string
  | { key: string; equals?: ContextScalar; gt?: number; in?: ContextScalar[] };

export interface SimAxis {
  substates: Array<SimLabelled | string>;
  /** Liste d'états concernés, ou sous-états autorisés par état. */
  applies_to: string[] | Record<string, string[]>;
  condition?: SimContextCondition;
  [key: string]: unknown;
}

export type ContextScalar = string | number | boolean;
export type ContextValue = ContextScalar | Record<string, number>;

export interface SimContextSetting {
  values?: Array<ContextScalar | SimLabelled>;
  default?: ContextValue;
  label?: string;
  [key: string]: unknown;
}

export interface SimDecision {
  id: string;
  label?: string;
  [key: string]: unknown;
}

export interface SimulatorFile {
  workflows: SimWorkflow[];
  states: SimState[];
  roles: Array<SimRole | string>;
  actions: Record<string, SimActionLabel>;
  actions_by_state: Record<string, Record<string, SimRawActionEntry[]>>;
  transitions: SimTransition[];
  editability: SimEditability;
  axes: Record<'signature' | 'internal_validation' | 'payment', SimAxis> & Record<string, SimAxis>;
  context: Record<string, SimContextSetting> & { role: SimContextSetting };
  portal_labels_v1?: Record<string, Record<string, string> | string>;
  decisions: SimDecision[];
  workflow_prerequisites?: Partial<Record<WorkflowOption, string>>;
  meta?: { last_updated?: string; [key: string]: unknown };
}

export const AXIS_KEYS = ['signature', 'internal_validation', 'payment'] as const;
export type AxisKey = (typeof AXIS_KEYS)[number];

/** Valeur d'un axe hors de sa condition ou de son périmètre. */
export const AXIS_NOT_APPLICABLE = 'not_applicable';

export type DecisionChoice = 'default' | 'v1';

export interface WorkflowScenario {
  workflow: string;
  state: string;
  role: string;
  context: Record<string, ContextValue>;
  axes: Record<AxisKey, string>;
  /** Verrous cochés à la main ; les verrous issus du contexte sont recalculés. */
  manualLocks: string[];
  decisions: Record<string, DecisionChoice>;
  /** État mémorisé avant une annulation ou un refus, pour résoudre "*previous". */
  previousState: string | null;
}

export interface ScenarioHistoryEntry {
  id: string;
  from: string;
  to: string;
  trigger: string;
  actor: string;
  at: string;
  note?: string;
}

export interface ResolvedAction extends SimActionEntry {
  label: string;
}

export interface GroupEditability {
  group: string;
  label: string;
  value: EditabilityCode;
  /** Code du verrou qui a abaissé le groupe, sinon celui de l'état. */
  source: { kind: 'state' | 'lock'; code: string };
  message: string;
}
