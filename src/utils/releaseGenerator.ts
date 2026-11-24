import type { Fund } from './fundGenerator';
import { capitalCallCurrency } from './capitalCallGenerator';
import { investorDemoId, subscriptionDemoId } from './capitalCallLines';
import { generatedDocument, type NoticeDocument } from './noticeActions';

/** Déblocage d'un fonds. */
export interface Release {
  id: number;
  fundId: number;
  fundName: string;
  currency: string;
  name: string;
  date: Date;
  /** Commentaires saisis à la création. */
  comments: string;
  createdAt: Date;
  updatedAt: Date;
  /** Nombre de lignes investisseurs. */
  lines: number;
}

export interface ReleaseLine {
  id: number;
  investor: string;
  investorId: number;
  /** Nom de la souscription. */
  subscription: string;
  subscriptionId: number;
  share: string;
  amount: number;
  fees: number;
  /** Coordonnées bancaires enregistrées sur la ligne à la création du déblocage. */
  iban: string;
  bic: string;
  notified: boolean;
  notifiedAt: Date | null;
  /** Souscription transférée après la date du déblocage : la ligne s'affiche grisée. */
  transferred: boolean;
  /** Courrier conservé sur la ligne : source, fichiers complémentaires et dates. */
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

const MONTHS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

const COMMENTS = [
  '',
  '',
  'Déblocage anticipé demandé par les investisseurs concernés.',
  'Souscriptions retenues après validation du comité.',
  'Déblocage exceptionnel, justificatifs reçus.',
];

const CURRENCY_SYMBOLS: Record<string, string> = { EUR: '€', USD: '$', GBP: '£' };
const DAY = 24 * 60 * 60 * 1000;

function seeded(seed: number) {
  let value = Math.abs(Math.imul(seed ^ 0x51ed270b, 0x2545f491)) % 2147483647 || 1;
  for (let i = 0; i < 5; i++) value = (value * 16807) % 2147483647;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function digits(random: () => number, length: number) {
  return Array.from({ length }, () => Math.floor(random() * 10)).join('');
}

/** IBAN fictif au format français, groupé par quatre. */
function demoIban(random: () => number, bankCode: string) {
  return `FR76${bankCode}${digits(random, 18)}`.replace(/(.{4})/g, '$1 ').trim();
}

/** Déblocages des fonds de la maquette, tous passés. */
export function generateReleases(funds: Fund[], today = new Date()): Release[] {
  const releases: Release[] = [];
  let id = 1;

  funds.forEach(fund => {
    const random = seeded(fund.id);
    const count = Math.floor(random() * 4);
    const currency = capitalCallCurrency(fund.id);
    let cursor = today.getTime() - (5 + Math.floor(random() * 40)) * DAY;

    for (let index = 0; index < count; index++) {
      const date = new Date(cursor);
      cursor -= (70 + Math.floor(random() * 90)) * DAY;
      const createdAt = new Date(date.getTime() - (1 + Math.floor(random() * 6)) * DAY + Math.floor(random() * 8) * 3600000);
      const comments = COMMENTS[Math.floor(random() * COMMENTS.length)];
      // Quelques déblocages restent sans ligne investisseur.
      const lines = fund.id % 4 === 3 && index === 0 ? 0 : 2 + Math.floor(random() * 14);

      releases.push({
        id: id++,
        fundId: fund.id,
        fundName: fund.name,
        currency,
        name: `Déblocage ${MONTHS[date.getMonth()]} ${date.getFullYear()}`,
        date,
        comments,
        createdAt,
        updatedAt: index % 3 === 1 ? new Date(Math.min(createdAt.getTime() + DAY + 3 * 3600000, today.getTime())) : createdAt,
        lines,
      });
    }
  });

  return releases;
}

/** Lignes investisseurs d'un déblocage : montant, coordonnées bancaires et notification enregistrés sur la ligne. */
export function generateReleaseLines(release: Release, fundShares: string[]): ReleaseLine[] {
  const random = seeded(release.id * 41 + 3);
  const shares = fundShares.length > 0 ? fundShares : ['A'];
  const now = Date.now();
  const notifiedAt = new Date(Math.min(release.date.getTime(), now));
  const symbol = CURRENCY_SYMBOLS[release.currency] ?? release.currency;
  // Un déblocage sur trois n'est pas encore entièrement notifié.
  const notifiedShare = release.id % 3 === 0 ? 0.5 : 1;

  return Array.from({ length: release.lines }, (_, index) => {
    const share = shares[Math.floor(random() * shares.length)];
    const investor = INVESTORS[(release.id * 5 + index) % INVESTORS.length];
    const bank = BANKS[Math.floor(random() * BANKS.length)];
    const amount = Math.round((5000 + random() * 45000) * 100) / 100;
    const notified = random() < notifiedShare;
    const committed = 50 + Math.floor(random() * 95) * 10;
    const subscription = `${investor} - ${symbol}${committed}K - ${release.fundName} Part ${share}`;

    return {
      id: release.id * 1000 + index + 1,
      investor,
      investorId: investorDemoId(investor),
      subscription,
      subscriptionId: subscriptionDemoId(subscription),
      share,
      amount,
      fees: random() < 0.35 ? Math.round(amount * 0.5) / 100 : 0,
      iban: demoIban(random, bank.code),
      bic: bank.bic,
      notified,
      notifiedAt: notified ? notifiedAt : null,
      transferred: random() < 0.08,
      document: generatedDocument(release.createdAt),
    };
  });
}
