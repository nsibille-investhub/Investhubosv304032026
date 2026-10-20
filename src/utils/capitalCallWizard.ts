import type { Fund } from './fundGenerator';
import { capitalCallCurrency } from './capitalCallGenerator';

/** Paramètres d'application qui pilotent l'assistant, déduits du fonds pour la démonstration. */
export interface FundCallSettings {
  hasNoticeTemplate: boolean;
  combinedNotices: boolean;
  hasCombinedTemplate: boolean;
  perUnit: boolean;
  netFlow: boolean;
  capAt100: boolean;
  allocation: 'subscribedAmount' | 'units';
}

export interface WizardSubscription {
  id: string;
  investor: string;
  share: string;
  committed: number;
  units: number;
  /** Cumul appelé hors frais et prime, y compris les appels reçus par import ou par l'API. */
  calledGross: number;
  /** Rappels de distributions provisoires inclus dans le cumul appelé. */
  recalled: number;
  availableAt: Date;
}

export interface PendingForecast {
  id: number;
  name: string;
  amount: number;
}

export interface FundDistribution {
  id: number;
  name: string;
  amount: number;
}

const DAY = 24 * 60 * 60 * 1000;

const INVESTORS = [
  'Camille R.',
  'Thomas L.',
  'Holding Arcadia',
  'Léa M.',
  'SCI Les Tilleuls',
  'Hugo B.',
  'Fondation Horizon',
  'Inès D.',
  'Family Office Vega',
  'Julien P.',
  'Mutuelle Atlas',
  'Sarah K.',
];

function seeded(seed: number) {
  let value = Math.abs(Math.imul(seed ^ 0x6a09e667, 0x3c6ef372)) % 2147483647 || 1;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

export function fundCallSettings(fund: Fund): FundCallSettings {
  return {
    hasNoticeTemplate: fund.id % 4 !== 0,
    combinedNotices: fund.id % 5 === 0 || fund.id % 7 === 0,
    hasCombinedTemplate: fund.id % 5 !== 0,
    perUnit: fund.id % 6 === 1,
    netFlow: fund.id % 3 === 0,
    capAt100: fund.id % 2 === 0,
    allocation: fund.id % 4 === 1 ? 'units' : 'subscribedAmount',
  };
}

export function fundCurrency(fund: Fund) {
  return capitalCallCurrency(fund.id);
}

export function pendingForecasts(fund: Fund, today = new Date()): PendingForecast[] {
  const random = seeded(fund.id * 31);
  const count = Math.floor(random() * 3);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today.getTime() + (index + 1) * 90 * DAY);
    const quarter = `T${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
    return {
      id: fund.id * 100 + index + 1,
      name: `Flux prévisionnel ${quarter}`,
      amount: Math.round((fund.totalCommitments * (0.05 + random() * 0.1)) / 10000) * 10000,
    };
  });
}

export function fundDistributions(fund: Fund): FundDistribution[] {
  const random = seeded(fund.id * 47);
  const count = Math.floor(random() * 3);
  return Array.from({ length: count }, (_, index) => ({
    id: fund.id * 100 + index + 1,
    name: `Distribution T${index + 2} 2026`,
    amount: Math.round((fund.totalCommitments * (0.01 + random() * 0.03)) / 1000) * 1000,
  }));
}

/** Souscriptions actives du fonds, par part. Quelques-unes deviennent disponibles tardivement. */
export function fundSubscriptions(fund: Fund, today = new Date()): WizardSubscription[] {
  const random = seeded(fund.id * 13);
  const subscriptions: WizardSubscription[] = [];
  const shares = fund.shareClasses.map(item => item.name);
  const perShare = Math.max(4, Math.round(24 / shares.length));
  shares.forEach((share, shareIndex) => {
    for (let index = 0; index < perShare; index++) {
      const committed = Math.round((fund.totalCommitments / shares.length / perShare) * (0.5 + random()) / 1000) * 1000;
      const calledGross = Math.round((committed * random() * 0.6) / 100) * 100;
      const recalled = random() < 0.2 ? Math.round((calledGross * 0.3) / 100) * 100 : 0;
      subscriptions.push({
        id: `SUB-${String(fund.id).padStart(2, '0')}${shareIndex + 1}${String(index + 1).padStart(2, '0')}`,
        investor: INVESTORS[(fund.id + shareIndex * 5 + index) % INVESTORS.length],
        share,
        committed,
        units: Math.round(committed / 100),
        calledGross,
        recalled,
        availableAt: new Date(today.getTime() + (random() < 0.12 ? 120 : -30) * DAY),
      });
    }
  });
  return subscriptions;
}

/** Déjà appelé, net des rappels de distributions provisoires. */
export function alreadyCalled(subscription: WizardSubscription) {
  return subscription.calledGross - subscription.recalled;
}

export function remainingToCall(subscription: WizardSubscription) {
  return subscription.committed - alreadyCalled(subscription);
}

export type AmountKind = 'percent' | 'amount';

export interface ShareInput {
  kind: AmountKind;
  /** Vide : la part n'est pas appelée. */
  value: string;
  recall: string;
  netFlow: string;
  callEntryFees: boolean;
  callPremium: boolean;
  /** Null : aucune restriction. */
  restriction: string[] | null;
}

export function emptyShareInput(): ShareInput {
  return { kind: 'percent', value: '', recall: '', netFlow: '', callEntryFees: false, callPremium: false, restriction: null };
}

export function parseNumber(value: string): number | null {
  if (value.trim() === '') return null;
  const parsed = Number(value.replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

/** Montant appelé sur une part, à partir du pourcentage de l'engagement, d'un montant ou d'un montant par titre. */
export function shareAmount(input: ShareInput, subscriptions: WizardSubscription[], settings: FundCallSettings) {
  const value = parseNumber(input.value);
  if (value === null || value <= 0) return 0;
  if (settings.perUnit) return value * subscriptions.reduce((sum, item) => sum + item.units, 0);
  if (input.kind === 'amount') return value;
  return (value / 100) * subscriptions.reduce((sum, item) => sum + item.committed, 0);
}

export type ExclusionReason = 'availableAfterDueDate' | 'outsideRestriction' | 'zeroShare';

export interface SimulatedLine {
  subscription: WizardSubscription;
  amount: number;
}

export interface SimulatedExclusion {
  subscription: WizardSubscription;
  reason: ExclusionReason;
}

export interface ShareSimulation {
  share: string;
  entered: number;
  linesTotal: number;
  roundingGap: number;
}

export type SimulationBlocker = 'noLines' | 'combinedTemplateMissing' | 'overRemaining';

export interface Simulation {
  lines: SimulatedLine[];
  exclusions: SimulatedExclusion[];
  shares: ShareSimulation[];
  overRemaining: SimulatedLine[];
  blockers: SimulationBlocker[];
  total: number;
}

const toCents = (value: number) => Math.round(value * 100) / 100;

/**
 * Simulation du calcul : rien n'est enregistré. Une souscription est retenue si elle est active
 * sur la part, comprise dans la restriction et disponible au plus tard à la date d'échéance.
 */
export function simulateCall(
  subscriptions: WizardSubscription[],
  inputs: Record<string, ShareInput>,
  dueDate: Date,
  settings: FundCallSettings,
): Simulation {
  const lines: SimulatedLine[] = [];
  const exclusions: SimulatedExclusion[] = [];
  const shares: ShareSimulation[] = [];

  Object.entries(inputs).forEach(([share, input]) => {
    const shareSubscriptions = subscriptions.filter(item => item.share === share);
    const entered = toCents(shareAmount(input, shareSubscriptions, settings));
    if (entered <= 0) return;

    const retained: WizardSubscription[] = [];
    shareSubscriptions.forEach(subscription => {
      if (input.restriction && !input.restriction.includes(subscription.id)) {
        exclusions.push({ subscription, reason: 'outsideRestriction' });
      } else if (subscription.availableAt.getTime() > dueDate.getTime()) {
        exclusions.push({ subscription, reason: 'availableAfterDueDate' });
      } else {
        retained.push(subscription);
      }
    });

    const weight = (item: WizardSubscription) => (settings.allocation === 'units' ? item.units : item.committed);
    const weightTotal = retained.reduce((sum, item) => sum + weight(item), 0);
    let linesTotal = 0;
    retained.forEach(subscription => {
      const amount = weightTotal > 0 ? Math.floor((entered * weight(subscription) * 100) / weightTotal) / 100 : 0;
      if (amount <= 0) {
        exclusions.push({ subscription, reason: 'zeroShare' });
        return;
      }
      linesTotal = toCents(linesTotal + amount);
      lines.push({ subscription, amount });
    });
    shares.push({ share, entered, linesTotal, roundingGap: toCents(entered - linesTotal) });
  });

  const overRemaining = lines.filter(line => line.amount > remainingToCall(line.subscription));
  const blockers: SimulationBlocker[] = [];
  if (lines.length === 0) blockers.push('noLines');
  if (settings.combinedNotices && !settings.hasCombinedTemplate) blockers.push('combinedTemplateMissing');
  if (settings.capAt100 && overRemaining.length > 0) blockers.push('overRemaining');

  return {
    lines,
    exclusions,
    shares,
    overRemaining,
    blockers,
    total: toCents(lines.reduce((sum, line) => sum + line.amount, 0)),
  };
}

/** Pourcentage unique de l'engagement proposé pour un montant à lever, arrondi à deux décimales. */
export function proposedPercent(amountToRaise: number, subscriptions: WizardSubscription[]) {
  const committed = subscriptions.reduce((sum, item) => sum + item.committed, 0);
  return committed > 0 ? Math.round((amountToRaise / committed) * 10000) / 100 : 0;
}
