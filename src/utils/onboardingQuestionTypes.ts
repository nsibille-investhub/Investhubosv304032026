export type OnboardingQuestionType =
  | 'text'
  | 'list'
  | 'multiChoice'
  | 'rankedChoice'
  | 'date'
  | 'amount'
  | 'country'
  | 'percentage'
  | 'number';

/** Contraintes du portail, appliquées aussi à une modification en back-office. */
export interface OnboardingQuestionConstraints {
  required?: boolean;
  requiredIfFirstSubscription?: boolean;
  min?: number;
  max?: number;
  maxLength?: number;
  /** Format jj/mm/aaaa. */
  minDate?: string;
  maxDate?: string;
  /** La date saisie doit donner un âge d'au moins 18 ans. */
  adult?: boolean;
  integer?: boolean;
}

export const AMOUNT_CURRENCIES = ['EUR', 'USD', 'CHF', 'GBP'] as const;

export const COUNTRY_OPTIONS = [
  'France',
  'Belgique',
  'Luxembourg',
  'Suisse',
  'Monaco',
  'Allemagne',
  'Italie',
  'Espagne',
  'Royaume-Uni',
  'États-Unis',
];

/** Valeur éditée : texte brut pour la plupart des types, liste pour les choix, montant + devise. */
export interface OnboardingDraftValue {
  text: string;
  items: string[];
  currency: string;
}

const MULTI_SEPARATOR = ', ';
const RANK_SEPARATOR = ' > ';

const parseNumber = (raw: string) => {
  const cleaned = raw.replace(/\s/g, '').replace(/[A-Z%]+$/i, '').replace(',', '.');
  if (cleaned === '') return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
};

const formatNumberFr = (value: number) =>
  value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const displayToIsoDate = (display: string) => {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(display);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : '';
};

const isoToDisplay = (iso: string) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

export function toDraft(type: OnboardingQuestionType, value: string): OnboardingDraftValue {
  switch (type) {
    case 'multiChoice':
      return { text: '', items: value ? value.split(MULTI_SEPARATOR) : [], currency: '' };
    case 'rankedChoice':
      return { text: '', items: value ? value.split(RANK_SEPARATOR) : [], currency: '' };
    case 'amount': {
      const currency = AMOUNT_CURRENCIES.find(c => value.trim().endsWith(c)) ?? 'EUR';
      const amount = parseNumber(value.replace(currency, ''));
      return { text: amount === null ? '' : String(amount), items: [], currency };
    }
    case 'percentage': {
      const pct = parseNumber(value);
      return { text: pct === null ? '' : String(pct), items: [], currency: '' };
    }
    case 'date':
      return { text: displayToIsoDate(value), items: [], currency: '' };
    default:
      return { text: value, items: [], currency: '' };
  }
}

export function fromDraft(type: OnboardingQuestionType, draft: OnboardingDraftValue): string {
  switch (type) {
    case 'multiChoice':
      return draft.items.join(MULTI_SEPARATOR);
    case 'rankedChoice':
      return draft.items.join(RANK_SEPARATOR);
    case 'amount': {
      const amount = parseNumber(draft.text);
      return amount === null ? '' : `${formatNumberFr(amount)} ${draft.currency}`;
    }
    case 'percentage':
      return draft.text.trim() === '' ? '' : `${draft.text.trim()} %`;
    case 'date':
      return isoToDisplay(draft.text);
    default:
      return draft.text.trim();
  }
}

/** Contrainte violée : clé de traduction et variables du message. */
export interface ConstraintViolation {
  key: string;
  vars?: Record<string, string | number>;
}

const yearsSince = (iso: string) => {
  const birth = new Date(iso);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return age;
};

const K = 'subscriptions.detail.answerEdit.constraints';

export function validateDraft(
  type: OnboardingQuestionType,
  draft: OnboardingDraftValue,
  constraints: OnboardingQuestionConstraints = {},
  isFirstSubscription = true,
): ConstraintViolation | null {
  const isEmpty =
    type === 'multiChoice' || type === 'rankedChoice' ? draft.items.length === 0 : draft.text.trim() === '';

  if (isEmpty) {
    if (constraints.required) return { key: `${K}.required` };
    if (constraints.requiredIfFirstSubscription && isFirstSubscription) {
      return { key: `${K}.requiredIfFirstSubscription` };
    }
    return null;
  }

  if (type === 'amount' || type === 'percentage' || type === 'number') {
    const value = parseNumber(draft.text);
    if (value === null) return { key: `${K}.number` };
    if (constraints.integer && !Number.isInteger(value)) return { key: `${K}.integer` };
    if (constraints.min !== undefined && value < constraints.min) return { key: `${K}.min`, vars: { min: constraints.min } };
    if (constraints.max !== undefined && value > constraints.max) return { key: `${K}.max`, vars: { max: constraints.max } };
  }

  if (type === 'text' && constraints.maxLength !== undefined && draft.text.trim().length > constraints.maxLength) {
    return { key: `${K}.maxLength`, vars: { max: constraints.maxLength } };
  }

  if (type === 'date') {
    if (constraints.minDate && draft.text < displayToIsoDate(constraints.minDate)) {
      return { key: `${K}.minDate`, vars: { date: constraints.minDate } };
    }
    if (constraints.maxDate && draft.text > displayToIsoDate(constraints.maxDate)) {
      return { key: `${K}.maxDate`, vars: { date: constraints.maxDate } };
    }
    if (constraints.adult && yearsSince(draft.text) < 18) return { key: `${K}.adult` };
  }

  return null;
}

/** Rappel des contraintes sous le champ. */
export function describeConstraints(constraints: OnboardingQuestionConstraints = {}): ConstraintViolation[] {
  const items: ConstraintViolation[] = [];
  if (constraints.required) items.push({ key: `${K}.hint.required` });
  if (constraints.requiredIfFirstSubscription) items.push({ key: `${K}.hint.requiredIfFirstSubscription` });
  if (constraints.min !== undefined) items.push({ key: `${K}.hint.min`, vars: { min: constraints.min } });
  if (constraints.max !== undefined) items.push({ key: `${K}.hint.max`, vars: { max: constraints.max } });
  if (constraints.maxLength !== undefined) items.push({ key: `${K}.hint.maxLength`, vars: { max: constraints.maxLength } });
  if (constraints.minDate) items.push({ key: `${K}.hint.minDate`, vars: { date: constraints.minDate } });
  if (constraints.maxDate) items.push({ key: `${K}.hint.maxDate`, vars: { date: constraints.maxDate } });
  if (constraints.adult) items.push({ key: `${K}.hint.adult` });
  if (constraints.integer) items.push({ key: `${K}.hint.integer` });
  return items;
}
