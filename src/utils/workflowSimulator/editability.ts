import { normalizeText, type SimulatorEngine } from './engine';
import type { EditabilityCode, GroupEditability, WorkflowScenario } from './types';

type Translate = (key: string, vars?: Record<string, string | number>) => string;

const E = 'subscriptions.workflowSimulator.edit';

// Rattachement d'un champ de la fiche à un groupe : editability.groups énumère les champs en
// texte ("Montants et parts : part, nombre de parts, montant, frais, prime"). Chaque champ de
// la fiche est cherché par ces mots dans le texte du groupe, le premier mot trouvé l'emporte.
const FIELD_GROUP_HINTS: Record<string, string[]> = {
  externalId: ['identifiant externe'],
  language: ['langue'],
  subscriberTitle: ['type de souscripteur'],
  amount: ['montant'],
  quantity: ['nombre de parts'],
  share: ['montants et parts'],
  sharePrice: ['montants et parts'],
  entryFeesRate: ['frais'],
  premium: ['prime'],
  legalName: ['identite du souscripteur'],
  lastName: ['identite du souscripteur'],
  firstName: ['identite du souscripteur'],
  birthDate: ['identite du souscripteur'],
  nationality: ['identite du souscripteur'],
  email: ['identite du souscripteur'],
  phone: ['identite du souscripteur'],
  address1: ['identite du souscripteur'],
  address2: ['identite du souscripteur'],
  postalCode: ['identite du souscripteur'],
  city: ['identite du souscripteur'],
  country: ['identite du souscripteur'],
  iban: ['bancaires'],
  bic: ['bancaires'],
  partnerName: ['partenaire et conseiller'],
  advisor: ['partenaire et conseiller'],
  commissionRate: ['commission'],
  excludeRetrocessions: ['retrocession'],
  holdingMode: ['detention'],
  sepa: ['sepa'],
  depositary: ['conservation'],
  subscriptionType: ['type de souscription'],
  sideLetter: ['side letter'],
};

// Mot d'une valeur composite ou d'un effet de verrou ("conseiller O, partenaire E") qui
// désigne un champ précis.
const FIELD_BY_WORD: Record<string, string> = { conseiller: 'advisor', partenaire: 'partnerName' };

// Champs qu'une demande de modification en attente met en lecture : "champ ou groupe
// (adresse, IBAN) en lecture" (verrou pending_subchange).
const PENDING_REQUEST_FIELDS = ['address1', 'address2', 'postalCode', 'city', 'country', 'iban', 'bic'];

export const UNASSIGNED_GROUP = 'unassigned';

/** Champs de chaque groupe, dans l'ordre du fichier ; les champs non rattachés à part. */
export function assignFields(engine: SimulatorEngine, fieldIds: string[]): Record<string, string[]> {
  const result: Record<string, string[]> = Object.fromEntries(engine.groups.map(g => [g.code, []]));
  result[UNASSIGNED_GROUP] = [];
  fieldIds.forEach(id => {
    const match = (FIELD_GROUP_HINTS[id] ?? [])
      .map(hint => engine.groups.find(g => normalizeText(g.text).includes(hint)))
      .find(Boolean);
    result[match ? match.code : UNASSIGNED_GROUP].push(id);
  });
  return result;
}

export type LockFlavor = 'pendingRequest' | 'sepaApproved' | 'onboardingStarted' | 'linked' | null;

/** Comportements de verrous de contexte décrits par les spécifications (prompt 7), par code. */
export function lockFlavor(code: string): LockFlavor {
  if (code === 'pending_subchange') return 'pendingRequest';
  if (code === 'sepa_mandate_approved') return 'sepaApproved';
  if (code === 'onboarding_started') return 'onboardingStarted';
  if (code === 'linked_subscriptions') return 'linked';
  return null;
}

export interface FieldOverride {
  value: EditabilityCode;
  message: string;
  pendingRequest?: boolean;
}

export interface GroupView extends GroupEditability {
  /** Modifiable dans la modale, compte tenu de la correction exceptionnelle et de l'état terminal. */
  editable: boolean;
  /** Renvois "Réduction d'engagement" et "Transfert" à la place des champs (Active). */
  amountsOnActive: boolean;
  /** Avertissement non bloquant (souscription parente ou liée). */
  warning?: string;
  /** Éditabilité propre à certains champs du groupe. */
  fields: Record<string, FieldOverride>;
}

const isEditable = (value: EditabilityCode, exceptionalOn: boolean) =>
  value === 'O' || value === 'O*' || (value === 'E' && exceptionalOn);

export function groupViews(
  engine: SimulatorEngine,
  scenario: WorkflowScenario,
  editability: GroupEditability[],
  locks: string[],
  exceptionalOn: boolean,
  t: Translate,
): GroupView[] {
  const terminal = Boolean(engine.state(scenario.state)?.terminal);
  const stateLabel = engine.stateLabel(scenario.state);
  const lockLabel = (code: string) => engine.data.editability.locks.find(l => l.code === code)?.label ?? code;
  const lockWordEffects = locks.flatMap(code => {
    const effect = engine.data.editability.locks.find(l => l.code === code)?.effect ?? '';
    return Array.from(effect.matchAll(/\b(conseiller|partenaire) en (lecture|E)\b/g)).map(m => ({
      code,
      field: FIELD_BY_WORD[m[1]],
      value: (m[2] === 'E' ? 'E' : 'L') as EditabilityCode,
    }));
  });

  return editability.map(group => {
    const fields: Record<string, FieldOverride> = {};
    Object.entries(group.detail ?? {}).forEach(([word, value]) => {
      const field = FIELD_BY_WORD[word];
      if (field) fields[field] = { value, message: t(`${E}.fieldState.${value === 'O*' ? 'conditional' : value}`, { state: stateLabel }) };
    });
    lockWordEffects.forEach(effect => {
      if (!effect.field) return;
      fields[effect.field] = { value: effect.value, message: t('subscriptions.workflowSimulator.editability.lock', { lock: lockLabel(effect.code) }) };
    });
    if (locks.includes('pending_subchange')) {
      PENDING_REQUEST_FIELDS.forEach(field => {
        fields[field] = { value: 'L', message: t(`${E}.pendingRequest`), pendingRequest: true };
      });
    }
    if (terminal) {
      const message = t(`${E}.terminalField`, { state: stateLabel });
      Object.keys(fields).forEach(field => (fields[field] = { value: 'L', message }));
    }
    return {
      ...group,
      message: terminal ? t(`${E}.terminalField`, { state: stateLabel }) : group.message,
      editable: !terminal && isEditable(group.value, exceptionalOn),
      amountsOnActive: scenario.state === 'active' && group.group === 'G3',
      warning: locks.includes('linked_subscriptions') && group.group === 'G3' ? t(`${E}.linkedWarning`) : undefined,
      fields,
    };
  });
}

/** Éditabilité d'un champ : celle de son groupe, sauf règle propre au champ. */
export function fieldState(view: GroupView | null, fieldId: string, exceptionalOn: boolean) {
  if (!view) return { editable: false, pendingRequest: false, message: '' };
  const own = view.fields[fieldId];
  if (!own) return { editable: view.editable, pendingRequest: false, message: view.message };
  return { editable: isEditable(own.value, exceptionalOn), pendingRequest: Boolean(own.pendingRequest), message: own.message };
}

/** Phrase de tête de la modale : ce que l'état autorise, construite depuis la matrice. */
export function summarize(engine: SimulatorEngine, scenario: WorkflowScenario, views: GroupView[], t: Translate): string {
  const state = engine.stateLabel(scenario.state);
  if (engine.state(scenario.state)?.terminal) return t(`${E}.summary.terminal`, { state });
  const list = (codes: EditabilityCode[]) =>
    views
      .filter(v => codes.includes(v.value))
      .map(v => (/^[A-ZÀ-Ý][a-zà-ÿ]/.test(v.label) ? v.label.charAt(0).toLowerCase() + v.label.slice(1) : v.label))
      .join(', ');
  const locked = list(['L']);
  const resetting = list(['O*']);
  const onRequest = list(['E']);
  const parts = [
    locked && t(`${E}.summary.locked`, { groups: locked }),
    resetting && t(`${E}.summary.resetsSignature`, { groups: resetting }),
    onRequest && t(`${E}.summary.onRequest`, { groups: onRequest }),
  ].filter(Boolean);
  const note = engine.data.editability.matrix[scenario.state]?.note;
  const sentence = parts.length
    ? t(`${E}.summary.withParts`, { state, parts: parts.join(' ; ') })
    : t(`${E}.summary.allOpen`, { state });
  return note ? `${sentence} ${t(`${E}.summary.note`, { note })}` : sentence;
}
