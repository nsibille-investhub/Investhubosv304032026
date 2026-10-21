import { normalizeText, toLabelled, type SimulatorEngine } from './engine';
import type { ResolvedAction, WorkflowScenario } from './types';

type Translate = (key: string, vars?: Record<string, string | number>) => string;

const A = 'subscriptions.workflowSimulator.actions';

// Action principale attendue par état (spécifications, prompt 5), en libellés normalisés.
// null : aucune action principale, le dossier n'attend pas le gestionnaire.
const PRIMARY_BY_STATE_LABEL: Record<string, string | null> = {
  brouillon: 'inviter',
  invitee: "renvoyer l'invitation",
  'en cours': "renvoyer l'invitation",
  'prete a soumettre': "renvoyer l'invitation",
  'en pre-validation partenaire': null,
  'a controler': 'valider le kyc',
  'en correction': "renvoyer l'invitation",
  'validee a envoyer': 'envoyer en signature',
  'en signature': 'renvoyer le mail de signature',
  'validee en pre-signature': 'renvoyer le mail de signature',
  'en pre-signature': 'valider le kyc',
  'pre-signee a controler': 'valider le kyc',
  active: null,
  transferee: 'annuler le transfert',
  annulee: 'reactiver',
  refusee: 'annuler le refus',
  expiree: "renvoyer l'invitation",
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

// Confirmation par libellé d'action (spécifications, prompt 5) ; préfixes normalisés.
const KIND_BY_LABEL: Array<[string, ConfirmationKind]> = [
  ['annuler le refus', 'restore'],
  ['annuler le transfert', 'simple'],
  ['annuler', 'cancel'],
  ['validation exceptionnelle', 'exceptional'],
  ['correction exceptionnelle', 'exceptional'],
  ['rouvrir', 'reopen'],
  ['envoyer en signature', 'sendSignature'],
  ['valider sans signature', 'validateWithoutSignature'],
  ['valider le kyc', 'validateKyc'],
  ['refuser definitivement', 'refuseFinal'],
  ['reactiver', 'restore'],
  ['supprimer', 'delete'],
  ['transferer', 'comingSoon'],
  ['fusionner', 'comingSoon'],
  ["reduction d'engagement", 'comingSoon'],
];

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

export function confirmationKind(label: string): ConfirmationKind {
  const key = normalizeText(label);
  return KIND_BY_LABEL.find(([prefix]) => key.startsWith(prefix))?.[1] ?? 'simple';
}

export function placementFor(role: string): ActionPlacement {
  if (role === 'gp_readonly') return 'none';
  if (WIDGET_ROLES.has(role)) return 'compliance';
  if (CARD_ROLES.has(role)) return 'card';
  return 'page';
}

/** Les actions du validateur qui touchent la signature vont dans le widget Suivi des signatures. */
export function widgetFor(action: MenuAction): 'compliance' | 'signature' {
  return normalizeText(action.label).includes('signature') ? 'signature' : 'compliance';
}

/**
 * Résout l'état d'arrivée d'une action. "*previous" renvoie à l'état mémorisé ; un choix
 * multiple "a | b" se résout avec le workflow (spécifications, prompt 5) : pré-validation
 * active, puis pré-signature active, sinon À contrôler.
 */
export function resolveTarget(engine: SimulatorEngine, scenario: WorkflowScenario, to?: string): string | undefined {
  if (!to) return undefined;
  if (to === '*previous') return scenario.previousState ?? undefined;
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
  return choices.find(code => normalizeText(engine.stateLabel(code)) === 'a controler') ?? choices[0];
}

function internalValidationPending(engine: SimulatorEngine, scenario: WorkflowScenario): boolean {
  if (!scenario.context.internal_validation_enabled) return false;
  if (!engine.allowedSubstates('internal_validation', scenario.state, scenario.context).length) return false;
  const sub = (engine.data.axes.internal_validation?.substates ?? [])
    .map(s => toLabelled(s))
    .find(s => s.code === scenario.axes.internal_validation);
  // Validation rendue : sous-état dont le code ou le libellé dit "validée", "rendue" ou "approuvée".
  const text = normalizeText(`${sub?.code ?? ''} ${sub?.label ?? ''}`);
  return !/(done|valide|rendu|approuv)/.test(text);
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
  const isDraft = normalizeText(stateLabel) === 'brouillon';

  const decorate = (action: ResolvedAction, available: boolean): MenuAction => {
    const kind = confirmationKind(action.label);
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
      target: resolveTarget(engine, scenario, action.to),
    };
  };

  if (placement === 'none' || placement === 'card') return { placement, primary: null, more: [], all: [] };

  const offered = actions.map(a => decorate(a, true));
  const offeredCodes = new Set(offered.map(a => a.code));
  const unavailable = engine
    .actionCodesForRole(scenario.role)
    .filter(code => !offeredCodes.has(code))
    .map(code => decorate({ code, label: engine.actionLabel(code) }, false));
  const all = [...offered, ...unavailable];

  if (placement === 'compliance') return { placement, primary: null, more: [], all: offered };

  const wanted = PRIMARY_BY_STATE_LABEL[normalizeText(stateLabel)];
  const primary = wanted ? offered.find(a => normalizeText(a.label) === wanted) ?? null : null;
  if (wanted && !primary) console.warn(`[Simulateur] Action principale "${wanted}" absente des actions de ${scenario.role} sur ${stateLabel}`);
  return { placement, primary, more: all.filter(a => a !== primary), all };
}
