import { normalizeText, type SimulatorEngine } from './engine';
import type { EditabilityCode, GroupEditability, WorkflowScenario } from './types';

type Translate = (key: string, vars?: Record<string, string | number>) => string;

const E = 'subscriptions.workflowSimulator.edit';

// Rattachement d'un champ de la fiche à un groupe d'éditabilité, à défaut de liste "fields"
// dans editability.groups : mots repérés dans le titre du groupe, du plus précis au plus large.
// Le fichier de scénarios ne dit pas quels champs composent chaque groupe.
const FIELD_GROUP_HINTS: Record<string, string[]> = {
  subscriberTitle: ['type de souscripteur', 'souscripteur', 'identite'],
  legalName: ['identite', 'souscripteur'],
  lastName: ['identite', 'souscripteur'],
  firstName: ['identite', 'souscripteur'],
  birthDate: ['identite', 'souscripteur'],
  nationality: ['identite', 'souscripteur'],
  email: ['coordonnees', 'contact', 'identite'],
  phone: ['coordonnees', 'contact', 'identite'],
  address1: ['adresse', 'coordonnees', 'identite'],
  address2: ['adresse', 'coordonnees', 'identite'],
  postalCode: ['adresse', 'coordonnees', 'identite'],
  city: ['adresse', 'coordonnees', 'identite'],
  country: ['adresse', 'coordonnees', 'identite'],
  iban: ['banc', 'iban', 'reglement', 'paiement'],
  bic: ['banc', 'iban', 'reglement', 'paiement'],
  partnerName: ['distribution', 'distributeur'],
  advisor: ['distribution', 'conseiller'],
  commissionRate: ['distribution', 'commission', 'retrocession'],
  excludeRetrocessions: ['distribution', 'retrocession'],
  entryFeesRate: ['frais', 'distribution', 'montant'],
  amount: ['montant', 'part'],
  quantity: ['montant', 'part'],
  share: ['montant', 'part'],
  sharePrice: ['montant', 'part'],
  premium: ['montant', 'prime'],
  holdingMode: ['detention'],
  subscriptionType: ['type de souscription', 'parametre', 'souscription'],
  externalId: ['parametre', 'reference', 'souscription'],
  language: ['langue', 'parametre', 'souscription'],
  depositary: ['depositaire', 'parametre', 'souscription'],
  sepa: ['sepa', 'banc', 'paiement'],
  sideLetter: ['side letter', 'personnalis'],
};

export const UNASSIGNED_GROUP = 'unassigned';

/** Champs de chaque groupe, dans l'ordre du fichier ; les champs non rattachés à part. */
export function assignFields(engine: SimulatorEngine, fieldIds: string[]): Record<string, string[]> {
  const result: Record<string, string[]> = Object.fromEntries(engine.groups.map(g => [g.code, []]));
  result[UNASSIGNED_GROUP] = [];
  const declared = new Map<string, string>();
  engine.data.editability.groups.forEach(group => {
    if (typeof group === 'object' && Array.isArray((group as { fields?: unknown }).fields)) {
      ((group as { fields: string[] }).fields).forEach(field => declared.set(field, group.code));
    }
  });
  fieldIds.forEach(id => {
    const fromFile = declared.get(id);
    if (fromFile) {
      result[fromFile].push(id);
      return;
    }
    const hints = FIELD_GROUP_HINTS[id] ?? [];
    const match = hints
      .map(hint => engine.groups.find(g => normalizeText(g.label).includes(hint)))
      .find(Boolean);
    result[match ? match.code : UNASSIGNED_GROUP].push(id);
  });
  return result;
}

export type LockFlavor = 'pendingRequest' | 'sepaApproved' | 'onboardingStarted' | null;

/** Comportements de verrous de contexte décrits par les spécifications (prompt 7), repérés par code. */
export function lockFlavor(code: string): LockFlavor {
  const key = normalizeText(code);
  if (key.includes('pending')) return 'pendingRequest';
  if (key.includes('sepa')) return 'sepaApproved';
  if (key.includes('onboarding')) return 'onboardingStarted';
  return null;
}

export interface GroupView extends GroupEditability {
  /** Modifiable dans la modale, compte tenu de la correction exceptionnelle et de l'état terminal. */
  editable: boolean;
  /** Renvois "Réduction d'engagement" et "Transfert" à la place des champs (Active). */
  amountsOnActive: boolean;
  pendingRequest: boolean;
}

export function groupViews(
  engine: SimulatorEngine,
  scenario: WorkflowScenario,
  editability: GroupEditability[],
  exceptionalOn: boolean,
  t: Translate,
): GroupView[] {
  const terminal = Boolean(engine.state(scenario.state)?.terminal) && scenario.state !== 'active';
  const stateLabel = engine.stateLabel(scenario.state);
  return editability.map(group => {
    const value: EditabilityCode = group.value;
    const editable = !terminal && (value === 'O' || value === 'O*' || (value === 'E' && exceptionalOn));
    let message = group.message;
    if (terminal) message = t(`${E}.terminalField`, { state: stateLabel });
    return {
      ...group,
      message,
      editable,
      amountsOnActive: scenario.state === 'active' && normalizeText(group.label).includes('montant'),
      pendingRequest: group.source.kind === 'lock' && lockFlavor(group.source.code) === 'pendingRequest',
    };
  });
}

/** Phrase de tête de la modale : ce que l'état autorise, construite depuis la matrice. */
export function summarize(engine: SimulatorEngine, scenario: WorkflowScenario, views: GroupView[], t: Translate): string {
  const state = engine.stateLabel(scenario.state);
  const terminal = Boolean(engine.state(scenario.state)?.terminal) && scenario.state !== 'active';
  if (terminal) return t(`${E}.summary.terminal`, { state });
  const list = (codes: EditabilityCode[]) =>
    views.filter(v => codes.includes(v.value)).map(v => v.label.toLowerCase()).join(', ');
  const locked = list(['L']);
  const resetting = list(['O*']);
  const onRequest = list(['E']);
  const parts = [
    locked && t(`${E}.summary.locked`, { groups: locked }),
    resetting && t(`${E}.summary.resetsSignature`, { groups: resetting }),
    onRequest && t(`${E}.summary.onRequest`, { groups: onRequest }),
  ].filter(Boolean);
  return parts.length
    ? t(`${E}.summary.withParts`, { state, parts: parts.join(', ') })
    : t(`${E}.summary.allOpen`, { state });
}
