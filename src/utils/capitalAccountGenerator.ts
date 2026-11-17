import type { Fund } from './fundGenerator';
import { capitalCallCurrency, sameDay } from './capitalCallGenerator';

export interface CapitalAccount {
  id: number;
  fundId: number;
  fundName: string;
  currency: string;
  name: string;
  date: Date;
  /** Date portée sur l'avis ("Date de notice" en V1). Absente si elle n'a pas été saisie. */
  noticeDate: Date | null;
  /** Notification des investisseurs, telle que cochée à la création. */
  notify: boolean;
  /** Parts concernées. Vide : toutes les parts du fonds. */
  shares: string[];
  /** Montants saisis sur le capital account, absents quand l'instance ne les saisit pas. */
  capitalGains: number | null;
  unrealizedGains: number | null;
  netResult: number | null;
  createdAt: Date;
  updatedAt: Date;
  /** Nombre de lignes investisseurs. */
  lines: number;
}

/** Statuts enregistrés sur une ligne de capital account, dans l'ordre du cycle. */
export const CAPITAL_ACCOUNT_LINE_STATES = ['created', 'notified'] as const;
export type CapitalAccountLineState = (typeof CAPITAL_ACCOUNT_LINE_STATES)[number];

export interface CapitalAccountLine {
  id: number;
  investor: string;
  /** Nom de la souscription. */
  subscription: string;
  /** Identifiant affiché de la souscription. */
  subscriptionRef: string;
  share: string;
  capitalGains: number | null;
  unrealizedGains: number | null;
  netResult: number | null;
  state: CapitalAccountLineState;
  notifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
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

const CURRENCY_SYMBOLS: Record<string, string> = { EUR: '€', USD: '$', GBP: '£' };
const DAY = 24 * 60 * 60 * 1000;

function seeded(seed: number) {
  let value = Math.abs(Math.imul(seed ^ 0x6a09e667, 0x3c6ef372)) % 2147483647 || 1;
  for (let i = 0; i < 5; i++) value = (value * 16807) % 2147483647;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

const thousands = (value: number) => Math.round(value / 1000) * 1000;

/** Derniers jours de trimestre, du plus récent au plus ancien, à partir d'aujourd'hui. */
function pastQuarterEnds(today: Date, count: number): Date[] {
  const ends: Date[] = [];
  let year = today.getFullYear();
  let quarter = Math.floor(today.getMonth() / 3);
  while (ends.length < count) {
    quarter -= 1;
    if (quarter < 0) {
      quarter = 3;
      year -= 1;
    }
    ends.push(new Date(year, quarter * 3 + 3, 0));
  }
  return ends;
}

/** Capital accounts des fonds de la maquette : un relevé par trimestre échu. */
export function generateCapitalAccounts(funds: Fund[], today = new Date()): CapitalAccount[] {
  const accounts: CapitalAccount[] = [];
  let id = 1;

  funds.forEach(fund => {
    const random = seeded(fund.id);
    const count = Math.floor(random() * 5);
    const currency = capitalCallCurrency(fund.id);
    const fundShares = fund.shareClasses.map(item => item.name);
    // En V1, la saisie des montants dépend du paramétrage de l'instance.
    const withAmounts = fund.id % 3 !== 0;

    pastQuarterEnds(today, count).forEach((date, index) => {
      const createdAt = new Date(Math.min(date.getTime() + (8 + Math.floor(random() * 20)) * DAY, today.getTime() - DAY));
      const noticeDraw = random();
      const noticeDate =
        noticeDraw < 0.2
          ? null
          : noticeDraw < 0.4
            ? new Date(date)
            : new Date(Math.min(createdAt.getTime() + (1 + Math.floor(noticeDraw * 6)) * DAY, today.getTime()));
      const restricted = fundShares.length > 1 && random() < 0.3;
      const capitalGains = thousands(fund.totalCommitments * (0.01 + random() * 0.05));
      const unrealizedGains = thousands(fund.totalCommitments * (0.02 + random() * 0.1));
      const netResult = thousands(capitalGains * (0.4 + random() * 0.5));
      // Quelques capital accounts restent sans ligne investisseur.
      const lines = fund.id % 4 === 2 && index === 0 ? 0 : 4 + Math.floor(random() * 36);

      accounts.push({
        id: id++,
        fundId: fund.id,
        fundName: fund.name,
        currency,
        name: `Relevé T${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`,
        date,
        noticeDate,
        notify: random() < 0.85,
        shares: restricted ? fundShares.slice(0, Math.max(1, fundShares.length - 1)) : [],
        capitalGains: withAmounts ? capitalGains : null,
        unrealizedGains: withAmounts ? unrealizedGains : null,
        netResult: withAmounts ? netResult : null,
        createdAt,
        updatedAt:
          index % 3 === 1 ? new Date(Math.min(createdAt.getTime() + 2 * DAY + 4 * 3600000, today.getTime())) : createdAt,
        lines,
      });
    });
  });

  return accounts;
}

/** Date de l'avis à afficher dans le listing : absente quand elle est égale à la date du capital account. */
export function distinctCapitalAccountNoticeDate(account: CapitalAccount): Date | null {
  return account.noticeDate && !sameDay(account.noticeDate, account.date) ? account.noticeDate : null;
}

/** Lignes investisseurs d'un capital account : montants répartis au centime, statut enregistré sur la ligne. */
export function generateCapitalAccountLines(account: CapitalAccount, fundShares: string[]): CapitalAccountLine[] {
  const random = seeded(account.id * 37 + 11);
  const shares = account.shares.length > 0 ? account.shares : fundShares.length > 0 ? fundShares : ['A'];
  const weights = Array.from({ length: account.lines }, () => 0.5 + random());
  const weightSum = weights.reduce((sum, value) => sum + value, 0);
  const now = Date.now();
  const notifiedAt = new Date(Math.min(account.createdAt.getTime() + 2 * DAY, now));
  const symbol = CURRENCY_SYMBOLS[account.currency] ?? account.currency;
  // Un capital account sur quatre n'est pas encore entièrement notifié.
  const notifiedShare = !account.notify ? 0 : account.id % 4 === 0 ? 0.6 : 1;

  return weights.map((weight, index) => {
    const ratio = weight / weightSum;
    const part = (total: number | null) => (total === null ? null : Math.floor(total * ratio * 100) / 100);
    const share = shares[index % shares.length];
    const investor = INVESTORS[(account.id * 7 + index) % INVESTORS.length];
    const notified = random() < notifiedShare;
    const committed = 50 + Math.floor(random() * 95) * 10;

    return {
      id: account.id * 1000 + index + 1,
      investor,
      subscription: `${investor} - ${symbol}${committed}K - ${account.fundName} Part ${share}`,
      subscriptionRef: `SUB-${String(account.fundId * 1000 + ((account.id * 13 + index * 17) % 900) + 100).padStart(6, '0')}`,
      share,
      capitalGains: part(account.capitalGains),
      unrealizedGains: part(account.unrealizedGains),
      netResult: part(account.netResult),
      state: notified ? 'notified' : 'created',
      notifiedAt: notified ? notifiedAt : null,
      createdAt: account.createdAt,
      updatedAt: notified ? notifiedAt : account.createdAt,
    };
  });
}
