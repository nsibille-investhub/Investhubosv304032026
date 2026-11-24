import type { Fund } from './fundGenerator';
import { capitalCallCurrency, sameDay, type CapitalCall } from './capitalCallGenerator';
import { investorDemoId, subscriptionDemoId } from './capitalCallLines';
import { generatedDocument, type NoticeDocument } from './noticeActions';

export interface DistributionLink {
  id: number;
  name: string;
}

export interface Distribution {
  id: number;
  fundId: number;
  fundName: string;
  currency: string;
  name: string;
  /** Date de la distribution ("Date" en V1). */
  date: Date;
  /** Date portée sur l'avis ("Date de notice" en V1). Absente si elle n'a pas été saisie. */
  noticeDate: Date | null;
  /** Notification des investisseurs, telle que cochée à la création. */
  notify: boolean;
  amount: number;
  provisionalAmount: number;
  fees: number;
  refundAmount: number;
  capitalAmount: number;
  interestAmount: number;
  /** Appels de fonds compensés par la distribution. */
  linkedCalls: DistributionLink[];
  /** Flux planifié consommé par la distribution. */
  forecast: DistributionLink | null;
  /** Identifiant de la distribution dans un système tiers. */
  externalId: string | null;
  createdAt: Date;
  updatedAt: Date;
  /** Nombre de lignes investisseurs. */
  lines: number;
}

/** Statuts enregistrés sur une ligne de distribution, dans l'ordre du cycle. */
export const DISTRIBUTION_LINE_STATES = ['created', 'notified', 'initiated', 'paid'] as const;
export type DistributionLineState = (typeof DISTRIBUTION_LINE_STATES)[number];

export interface DistributionLine {
  id: number;
  investor: string;
  investorId: number;
  /** Nom de la souscription. */
  subscription: string;
  subscriptionId: number;
  share: string;
  amount: number;
  provisionalAmount: number;
  fees: number;
  refundAmount: number;
  capitalAmount: number;
  interestAmount: number;
  /** Coordonnées bancaires figées sur la ligne au calcul de la distribution. */
  iban: string;
  bic: string;
  state: DistributionLineState;
  notifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  hiddenOnPortal: boolean;
  /** Avis de la ligne : source, fichiers complémentaires et dates. */
  document: NoticeDocument;
}

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

/** Banques fictives du jeu de démonstration. */
const BANKS = [
  { code: '30004', bic: 'DEMOFRPPXXX' },
  { code: '30003', bic: 'TESTFRPPXXX' },
  { code: '20041', bic: 'FICTFRP1XXX' },
  { code: '10278', bic: 'MOCKFR2AXXX' },
];

const QUARTER_LABELS = ['T1', 'T2', 'T3', 'T4'];
const CURRENCY_SYMBOLS: Record<string, string> = { EUR: '€', USD: '$', GBP: '£' };
const DAY = 24 * 60 * 60 * 1000;

function seeded(seed: number) {
  let value = Math.abs(Math.imul(seed ^ 0x3f4a9c1b, 0x1b873593)) % 2147483647 || 1;
  for (let i = 0; i < 5; i++) value = (value * 16807) % 2147483647;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

const cents = (value: number) => Math.round(value * 100) / 100;
const thousands = (value: number) => Math.round(value / 1000) * 1000;

function quarterLabel(date: Date) {
  return `${QUARTER_LABELS[Math.floor(date.getMonth() / 3)]} ${date.getFullYear()}`;
}

function digits(random: () => number, length: number) {
  return Array.from({ length }, () => Math.floor(random() * 10)).join('');
}

/** IBAN fictif au format français, groupé par quatre. */
function demoIban(random: () => number, bankCode: string) {
  const raw = `FR76${bankCode}${digits(random, 18)}`;
  return raw.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Distributions des fonds de la maquette. Les appels liés sont pris parmi les appels
 * du même fonds, pour que leurs liens ouvrent une fiche existante.
 */
export function generateDistributions(funds: Fund[], calls: CapitalCall[] = [], today = new Date()): Distribution[] {
  const distributions: Distribution[] = [];
  let id = 1;

  funds.forEach(fund => {
    const random = seeded(fund.id);
    const count = Math.floor(random() * 5);
    const currency = capitalCallCurrency(fund.id);
    const fundCalls = calls.filter(call => call.fundId === fund.id);
    const first = today.getTime() - count * 100 * DAY + Math.floor(random() * 80) * DAY;

    for (let index = 0; index < count; index++) {
      const date = new Date(first + index * (80 + Math.floor(random() * 50)) * DAY);
      const createdAt = new Date(
        Math.min(date.getTime() - (10 + Math.floor(random() * 20)) * DAY, today.getTime() - (1 + index) * DAY),
      );
      const noticeDraw = random();
      const noticeDate =
        noticeDraw < 0.2
          ? null
          : noticeDraw < 0.4
            ? new Date(date)
            : new Date(createdAt.getTime() + (1 + Math.floor(noticeDraw * 6)) * DAY);
      const amount = thousands(fund.totalCommitments * (0.02 + random() * 0.08));
      const provisionalAmount = random() < 0.45 ? thousands(amount * (0.1 + random() * 0.2)) : 0;
      const fees = random() < 0.4 ? Math.round((amount * 0.004) / 100) * 100 : 0;
      const refundAmount = random() < 0.3 ? thousands(amount * 0.15) : 0;
      const interestAmount = thousands((amount - refundAmount) * (0.1 + random() * 0.25));
      const capitalAmount = amount - refundAmount - interestAmount;
      const linkedCall = fundCalls.length > 0 && random() < 0.35 ? fundCalls[Math.floor(random() * fundCalls.length)] : null;
      const forecast = random() < 0.4 ? { id, name: `Flux prévisionnel ${quarterLabel(date)}` } : null;
      const imported = random() < 0.25;
      // Quelques distributions restent sans ligne investisseur.
      const lines = fund.id % 4 === 1 && index === 0 ? 0 : 4 + Math.floor(random() * 36);

      distributions.push({
        id: id++,
        fundId: fund.id,
        fundName: fund.name,
        currency,
        name: `Distribution ${index + 1}`,
        date,
        noticeDate,
        notify: random() < 0.85,
        amount,
        provisionalAmount,
        fees,
        refundAmount,
        capitalAmount,
        interestAmount,
        linkedCalls: linkedCall ? [{ id: linkedCall.id, name: linkedCall.name }] : [],
        forecast,
        externalId: imported ? `DIS-${date.getFullYear()}-${String(fund.id * 10 + index + 1).padStart(4, '0')}` : null,
        createdAt,
        updatedAt:
          index % 3 === 1 ? new Date(Math.min(createdAt.getTime() + 2 * DAY + 4 * 3600000, today.getTime())) : createdAt,
        lines,
      });
    }
  });

  return distributions;
}

/** Date de l'avis à afficher dans le listing : absente quand elle est égale à la date de distribution. */
export function distinctDistributionNoticeDate(distribution: Distribution): Date | null {
  return distribution.noticeDate && !sameDay(distribution.noticeDate, distribution.date) ? distribution.noticeDate : null;
}

/** Lignes investisseurs d'une distribution : montants répartis au centime, statut enregistré sur la ligne. */
export function generateDistributionLines(distribution: Distribution, fundShares: string[]): DistributionLine[] {
  const random = seeded(distribution.id * 31 + 7);
  const shares = fundShares.length > 0 ? fundShares : ['A'];
  const weights = Array.from({ length: distribution.lines }, () => 0.5 + random());
  const weightSum = weights.reduce((sum, value) => sum + value, 0);
  const now = Date.now();
  const past = distribution.date.getTime() < now;
  const notifiedAt = new Date(Math.min(distribution.createdAt.getTime() + 2 * DAY, now));
  const symbol = CURRENCY_SYMBOLS[distribution.currency] ?? distribution.currency;

  return weights.map((weight, index) => {
    const ratio = weight / weightSum;
    const part = (total: number) => Math.floor(total * ratio * 100) / 100;
    const amount = part(distribution.amount);
    const refundAmount = part(distribution.refundAmount);
    const interestAmount = part(distribution.interestAmount);
    const share = shares[index % shares.length];
    const investor = INVESTORS[(distribution.id * 5 + index) % INVESTORS.length];
    const bank = BANKS[Math.floor(random() * BANKS.length)];

    const draw = random();
    let state: DistributionLineState;
    if (past) state = draw < 0.75 ? 'paid' : draw < 0.92 ? 'initiated' : 'notified';
    else state = draw < 0.5 ? 'created' : draw < 0.9 ? 'notified' : 'initiated';
    if (!distribution.notify && state === 'notified') state = 'created';
    const notified = distribution.notify && state !== 'created';
    const paidAt = state === 'paid' ? new Date(Math.min(distribution.date.getTime() + DAY, now)) : null;
    const committed = Math.max(10, Math.round((amount * 12) / 10000) * 10);

    const subscription = `${investor} - ${symbol}${committed}K - ${distribution.fundName} Part ${share}`;

    return {
      id: distribution.id * 1000 + index + 1,
      investor,
      investorId: investorDemoId(investor),
      subscription,
      subscriptionId: subscriptionDemoId(subscription),
      share,
      amount,
      provisionalAmount: part(distribution.provisionalAmount),
      fees: part(distribution.fees),
      refundAmount,
      capitalAmount: cents(amount - refundAmount - interestAmount),
      interestAmount,
      iban: demoIban(random, bank.code),
      bic: bank.bic,
      state,
      notifiedAt: notified ? notifiedAt : null,
      createdAt: distribution.createdAt,
      updatedAt: paidAt ?? (notified ? notifiedAt : distribution.createdAt),
      hiddenOnPortal: random() < 0.05,
      document: generatedDocument(distribution.createdAt),
    };
  });
}
