// Schéma de data/simulateur-workflow-etats.json (version du 2026-10-21). Les clés obligatoires
// sont vérifiées au chargement par validateSimulatorFile ; une clé optionnelle absente est
// signalée en console comme règle manquante, jamais comblée par le moteur.

export type EditabilityCode = 'O' | 'L' | 'O*' | 'E';

export interface SimLabelled {
  code: string;
  label: string;
}

export interface SimWorkflowBlock {
  label?: string;
  sequence?: string[];
  /** Séquence alternative d'états, quand le bloc en définit une. */
  variant?: string[];
  /** Note de la variante (variant_note dans le fichier). */
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
  /** Noms des blocs de blocks[] qui composent la séquence. */
  blocks?: string[];
  family?: WorkflowFamily;
  family_label?: string;
  initiator?: string;
  channel?: string;
  presign?: boolean;
  prevalidation?: boolean;
  countersign?: boolean;
  bo_invitation?: boolean;
  /** Souscription directe imposée par le workflow. */
  self_forced?: boolean;
  [key: string]: unknown;
}

export interface SimState extends SimLabelled {
  terminal?: boolean;
  /** Qui doit agir pour que le dossier avance, en phrase. */
  waiting_on?: string;
  reversible?: boolean;
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
  scope?: string;
  axis?: string;
  prerequisites?: string;
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
  /** Condition et effet sont décrits en texte dans le fichier. */
  condition?: string;
  effect?: string;
  [key: string]: unknown;
}

export interface SimEditability {
  legend?: Record<string, string>;
  /** Groupes par code ; libellé "Titre : champs". */
  groups: Record<string, string>;
  /** Code par groupe, ou texte composite ("conseiller O, partenaire E"), plus note et decision. */
  matrix: Record<string, Record<string, string>>;
  locks: SimLock[];
  portal?: unknown;
  [key: string]: unknown;
}

/** Condition sur le contexte : nom de clé (vraie si la valeur est vraie) ou comparaison. */
export type SimContextCondition =
  | string
  | { key: string; equals?: ContextScalar; gt?: number; in?: ContextScalar[] };

export interface SimSubstate extends SimLabelled {
  /** États où le sous-état est possible, s'il est restreint. */
  states?: string[];
  condition?: string;
  [key: string]: unknown;
}

export interface SimAxis {
  substates: SimSubstate[];
  applies_to?: string[];
  /** Condition en texte ("fonds à validation interne"). */
  condition?: string;
  send_prerequisites?: string[];
  [key: string]: unknown;
}

export type ContextScalar = string | number | boolean | null;
export type ContextValue = ContextScalar | Record<string, number>;

export interface SimContextSetting {
  /** Liste de valeurs, ou description en texte ("0..n", "date ou null", "compteur investisseur, compteur partenaire"). */
  values?: Array<ContextScalar | SimLabelled> | string;
  default?: ContextValue;
  label?: string;
  families?: string[];
  effect?: string;
  [key: string]: unknown;
}

export interface SimDecision {
  id: string;
  question?: string;
  v1?: string;
  default?: string;
  [key: string]: unknown;
}

export interface SimPortalLabel {
  states: string[];
  investor: string | null;
  distributor: string | null;
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
  portal_labels_v1?: SimPortalLabel[];
  blocks?: Record<string, SimWorkflowBlock & { variant_note?: string }>;
  common_branches?: Record<string, unknown>;
  always_available_gp?: string[];
  decisions: SimDecision[];
  workflow_prerequisites?: Record<string, string>;
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
  /** Champs du groupe, tels que le fichier les énumère. */
  description?: string;
  value: EditabilityCode;
  /** Valeur composite par élément ("conseiller O, partenaire E"), clés normalisées. */
  detail?: Record<string, EditabilityCode>;
  /** Code du verrou qui a abaissé le groupe, sinon celui de l'état. */
  source: { kind: 'state' | 'lock'; code: string };
  message: string;
}
