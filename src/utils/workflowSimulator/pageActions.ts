import { normalizeText, toLabelled, type SimulatorEngine } from './engine';
import type { ResolvedAction, WorkflowScenario } from './types';

type Translate = (key: string, vars?: Record<string, string | number>) => string;

const A = 'subscriptions.workflowSimulator.actions';

// Action principale attendue par état (spécifications, prompt 5), par code d'état et d'action.
// null : aucune action principale, le dossier n'attend pas le gestionnaire.
const PRIMARY_BY_STATE: Record<string, string | null> = {
  brouillon: 'invite',
  invitee: 'reinvite',
  en_cours: 'reinvite',
  prete_a_soumettre: 'reinvite',
  en_prevalidation_partenaire: null,
  a_controler: 'validate_kyc',
  en_correction: 'reinvite',
  validee_a_envoyer: 'send_signature',
  en_signature: 'resend_signature_mail',
  validee_en_presignature: 'resend_signature_mail',
  en_presignature: 'validate_kyc',
  presignee_a_controler: 'validate_kyc',
  active: null,
  transferee: 'transfer_rollback',
  annulee: 'reactivate',
  refusee: 'refusal_rollback',
  expiree: 'reinvite',
};

// Actions déjà portées par un bouton dédié de la page : Modifier (edit) et always_available_gp
// (Exporter, consulter, documents). Elles ne sont pas répétées dans le menu "Plus".
const DEDICATED_BUTTONS = ['edit'];

// Le fichier ne relie pas les codes d'action aux transitions quand l'entrée n'a pas de "to".
// Branches communes reprises de common_branches et transitions : annuler vers annulee,
// rouvrir vers en_correction, refuser définitivement vers refusee, transférer vers transferee.
const BRANCH_BY_ACTION: Record<string, string> = {
  cancel: 'annulee',
  reopen: 'en_correction',
  refuse_final: 'refusee',
  transfer: 'transferee',
};

/** Où les actions d'un rôle s'affichent. */
export type ActionPlacement = 'page' | 'none' | 'compliance' | 'signature' | 'card';

const WIDGET_ROLES = new Set(['validator', 'risk_validator']);
const CARD_ROLES = new Set(['investor', 'distributor', 'delegated_partner', 'fund_signer', 'platform']);

export type ConfirmationKind =
  | 'cancel'
  | 'exceptional'
  | 'reopen'
  | 'sendSignature'
  | 'validateWithoutSignature'
  | 'validateKyc'
  | 'refuseFinal'
  | 'restore'
  | 'delete'
  | 'comingSoon'
  | 'simple';

// Confirmation par code d'action (spécifications, prompt 5).
const KIND_BY_CODE: Record<string, ConfirmationKind> = {
  cancel: 'cancel',
  validate_exceptional: 'exceptional',
  reopen: 'reopen',
  prevalidate_reopen: 'reopen',
  send_signature: 'sendSignature',
  validate_no_signature: 'validateWithoutSignature',
  validate_kyc: 'validateKyc',
  refuse_final: 'refuseFinal',
  reactivate: 'restore',
  refusal_rollback: 'restore',
  delete: 'delete',
  transfer: 'comingSoon',
  merge: 'comingSoon',
  reduce: 'comingSoon',
};

export interface MenuAction extends ResolvedAction {
  kind: ConfirmationKind;
  /** Droit dédié (role_required gp_exceptional). */
  dedicated: boolean;
  destructive: boolean;
  separatorBefore: boolean;
  /** Motif d'indisponibilité, prêt à afficher. */
  disabledReason?: string;
  /** État d'arrivée résolu ; absent si l'action ne change pas l'état. */
  target?: string;
}

export interface ActionMenu {
  placement: ActionPlacement;
  primary: MenuAction | null;
  more: MenuAction[];
  /** Actions visibles du rôle, pour les widgets Conformité et Suivi des signatures. */
  all: MenuAction[];
}

export function confirmationKind(code: string): ConfirmationKind {
  return KIND_BY_CODE[code] ?? 'simple';
}

export function placementFor(role: string): ActionPlacement {
  if (role === 'gp_readonly') return 'none';
  if (WIDGET_ROLES.has(role)) return 'compliance';
  if (CARD_ROLES.has(role)) return 'card';
  return 'page';
}

/** Les actions du validateur qui touchent la signature vont dans le widget Suivi des signatures. */
export function widgetFor(action: MenuAction): 'compliance' | 'signature' {
  return action.code.includes('signature') ? 'signature' : 'compliance';
}

/**
 * Résout l'état d'arrivée d'une action. "*previous" renvoie à l'état mémorisé ; un choix
 * multiple "a | b" se résout avec le workflow (spécifications, prompt 5) : pré-validation
 * active, puis pré-signature active, sinon À contrôler.
 */
export function resolveTarget(engine: SimulatorEngine, scenario: WorkflowScenario, to?: string): string | undefined {
  if (!to) return undefined;
  // "*previous" dans transitions, "état précédent" dans actions_by_state.
  if (to === '*previous' || normalizeText(to).includes('precedent')) return scenario.previousState ?? undefined;
  const choices = to.split('|').map(code => code.trim()).filter(Boolean);
  if (choices.length < 2) return choices[0];
  const options = engine.optionsOf(scenario.workflow);
  const pick = (needle: string) => choices.find(code => normalizeText(`${code} ${engine.stateLabel(code)}`).includes(needle));
  if (options.includes('prevalidation')) {
    const found = pick('pre-validation') ?? pick('prevalidation');
    if (found) return found;
  }
  if (options.includes('presignature')) {
    const found = pick('pre-sign') ?? pick('presign');
    if (found) return found;
  }
  return choices.find(code => code === 'a_controler') ?? choices[0];
}

function internalValidationPending(engine: SimulatorEngine, scenario: WorkflowScenario): boolean {
  if (!scenario.context.internal_validation_enabled) return false;
  if (!engine.allowedSubstates('internal_validation', scenario.state, scenario.context, scenario.workflow).length) return false;
  // Validation rendue : sous-état approuvee de axes.internal_validation.
  return scenario.axes.internal_validation !== 'approuvee';
}

export function buildActionMenu(
  engine: SimulatorEngine,
  scenario: WorkflowScenario,
  actions: ResolvedAction[],
  t: Translate,
): ActionMenu {
  const placement = placementFor(scenario.role);
  const stateLabel = engine.stateLabel(scenario.state);
  const notOffered = t(`${A}.notOffered`, { state: stateLabel });
  const isDraft = scenario.state === 'brouillon';

  const decorate = (action: ResolvedAction, available: boolean): MenuAction => {
    const kind = confirmationKind(action.code);
    let disabledReason: string | undefined;
    if (!available) disabledReason = action.reason ?? (kind === 'delete' && !isDraft ? t(`${A}.deleteInstead`) : notOffered);
    else if (action.disabled) disabledReason = action.reason ?? notOffered;
    else if (kind === 'validateKyc' && internalValidationPending(engine, scenario)) disabledReason = t(`${A}.internalValidationPending`);
    return {
      ...action,
      kind,
      dedicated: action.role_required === 'gp_exceptional',
      destructive: ['cancel', 'refuseFinal', 'delete'].includes(kind),
      separatorBefore: ['refuseFinal', 'delete'].includes(kind),
      disabled: Boolean(disabledReason),
      disabledReason,
      target: resolveTarget(engine, scenario, action.to) ?? branchTarget(action.code),
    };
  };

  if (placement === 'none' || placement === 'card') return { placement, primary: null, more: [], all: [] };

  const reachable = engine.workflow(scenario.workflow)?.reachable_states ?? [];
  const branchTargets = new Set(engine.transitionsFrom(scenario.state, scenario.previousState).map(tr => tr.to));
  function branchTarget(code: string): string | undefined {
    const target = BRANCH_BY_ACTION[code];
    return target && reachable.includes(target) && branchTargets.has(target) ? target : undefined;
  }
  const hidden = new Set([...DEDICATED_BUTTONS, ...(engine.data.always_available_gp ?? [])]);

  const offered = actions.filter(a => !hidden.has(a.code)).map(a => decorate(a, true));
  const offeredCodes = new Set(offered.map(a => a.code));
  const unavailable = engine
    .actionCodesForRole(scenario.role)
    .filter(code => !offeredCodes.has(code) && !hidden.has(code))
    .map(code => decorate({ code, label: engine.actionLabel(code) }, false));
  const all = [...offered, ...unavailable];

  if (placement === 'compliance') return { placement, primary: null, more: [], all: offered };

  const wanted = PRIMARY_BY_STATE[scenario.state];
  const primary = wanted ? offered.find(a => a.code === wanted) ?? null : null;
  if (wanted && !primary) console.warn(`[Simulateur] Action principale "${wanted}" absente des actions de ${scenario.role} sur ${stateLabel}`);
  return { placement, primary, more: all.filter(a => a !== primary), all };
}
