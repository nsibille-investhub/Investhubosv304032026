import type { Fund } from './fundGenerator';

export type CapitalCallOrigin = 'backOffice' | 'import' | 'api';

export const CAPITAL_CALL_ORIGINS: CapitalCallOrigin[] = ['backOffice', 'import', 'api'];

export interface LinkedDistribution {
  id: number;
  name: string;
}

export type ShareEntryMode = 'percent' | 'totalAmount' | 'perUnit';

export interface CapitalCallShare {
  share: string;
  mode: ShareEntryMode;
  /** Pourcentage du montant souscrit, montant total de la part ou montant par titre, selon le mode. */
  value: number;
  entryFeesCalled: boolean;
  premiumCalled: boolean;
  /** Rappel de distributions provisoires. */
  releasedAmount: number;
  /** Nombre de souscriptions retenues quand l'appel est restreint sur la part. */
  restrictedTo: number | null;
}

export interface CapitalCallAttachment {
  name: string;
  sizeKb: number;
}

export interface CapitalCall {
  id: number;
  fundId: number;
  fundName: string;
  currency: string;
  name: string;
  dueDate: Date;
  /** Date imprimée sur l'avis. Affichée seulement quand elle diffère de la date d'échéance. */
  noticeDate: Date | null;
  calledAmount: number;
  origin: CapitalCallOrigin;
  compensations: LinkedDistribution[];
  forecast: { id: number; name: string } | null;
  shares: CapitalCallShare[];
  message: string;
  attachments: CapitalCallAttachment[];
  createdAt: Date;
  createdBy: string;
  /** Verrou d'envoi actif. */
  sending: boolean;
  /** Nombre de lignes investisseurs. */
  lines: number;
  notifiedLines: number;
  /** Lignes notifiées ni payées ni compensées : celles qu'une relance cible. */
  linesToRelaunch: number;
  /** Appel créé dans la session : lignes à notifier, avis demandés à la création. */
  justCreated?: boolean;
}

const CREATORS = ['Camille', 'Thomas', 'Léa', 'Hugo', 'Inès', 'Julien'];

const MESSAGES = [
  "Madame, Monsieur,\n\nVous trouverez ci-joint votre avis d'appel de fonds. Nous vous remercions de bien vouloir procéder au virement avant la date d'échéance indiquée.\n\nL'équipe de gestion",
  "Bonjour,\n\nCet appel finance les deux investissements présentés lors du dernier comité. Le détail figure dans la lettre jointe.\n\nBien cordialement,",
  '',
];

const ATTACHMENTS: CapitalCallAttachment[] = [
  { name: 'Lettre aux investisseurs.pdf', sizeKb: 284 },
  { name: 'Présentation des investissements.pdf', sizeKb: 1650 },
];

const QUARTER_LABELS = ['T1', 'T2', 'T3', 'T4'];

function quarterLabel(date: Date) {
  return `${QUARTER_LABELS[Math.floor(date.getMonth() / 3)]} ${date.getFullYear()}`;
}

/** Quelques fonds de la maquette sont libellés hors euro pour illustrer la devise du fonds. */
export function capitalCallCurrency(fundId: number): string {
  if (fundId % 6 === 3) return 'USD';
  if (fundId % 11 === 0) return 'GBP';
  return 'EUR';
}

function seeded(seed: number) {
  let value = Math.abs(Math.imul(seed ^ 0x5bd1e995, 0x27d4eb2d)) % 2147483647 || 1;
  for (let i = 0; i < 5; i++) value = (value * 16807) % 2147483647;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

const DAY = 24 * 60 * 60 * 1000;

export function generateCapitalCalls(funds: Fund[], today = new Date()): CapitalCall[] {
  const calls: CapitalCall[] = [];
  let id = 1;
  let distributionId = 1;

  funds.forEach(fund => {
    const random = seeded(fund.id);
    const count = 2 + Math.floor(random() * 5);
    const currency = capitalCallCurrency(fund.id);
    const firstDue = today.getTime() - (count - 1) * 120 * DAY + Math.floor(random() * 60) * DAY;

    for (let index = 0; index < count; index++) {
      const dueDate = new Date(firstDue + index * (90 + Math.floor(random() * 60)) * DAY);
      const createdAt = new Date(
        Math.min(dueDate.getTime() - (20 + Math.floor(random() * 25)) * DAY, today.getTime() - (1 + index) * DAY),
      );
      const noticeDraw = random();
      const noticeDate =
        noticeDraw < 0.3 ? new Date(createdAt.getTime() + 2 * DAY) : noticeDraw < 0.45 ? new Date(dueDate) : null;
      const originDraw = random();
      const origin: CapitalCallOrigin = originDraw < 0.7 ? 'backOffice' : originDraw < 0.9 ? 'import' : 'api';
      const compensations: LinkedDistribution[] =
        random() < 0.2 ? [{ id: distributionId++, name: `Distribution ${quarterLabel(createdAt)}` }] : [];
      const forecast = random() < 0.5 ? { id: id, name: `Flux prévisionnel ${quarterLabel(dueDate)}` } : null;
      const calledAmount = Math.round((fund.totalCommitments * (0.05 + random() * 0.15)) / 1000) * 1000;
      const modeDraw = random();
      const mode: ShareEntryMode = modeDraw < 0.7 ? 'percent' : modeDraw < 0.9 ? 'totalAmount' : 'perUnit';
      const shareNames = fund.shareClasses.map(item => item.name);
      const shares: CapitalCallShare[] = shareNames.map((share, shareIndex) => {
        const value =
          mode === 'percent'
            ? [10, 5, 15, 7.5][shareIndex % 4]
            : mode === 'totalAmount'
              ? Math.round(calledAmount / shareNames.length / 1000) * 1000
              : Math.round((5 + random() * 20) * 100) / 100;
        return {
          share,
          mode,
          value,
          entryFeesCalled: shareIndex === 0,
          premiumCalled: random() < 0.25,
          releasedAmount: random() < 0.2 ? Math.round(calledAmount * 0.02 / 100) * 100 : 0,
          restrictedTo: random() < 0.15 ? 3 + Math.floor(random() * 10) : null,
        };
      });
      const message = MESSAGES[Math.floor(random() * MESSAGES.length)];
      const attachments = ATTACHMENTS.slice(0, Math.floor(random() * 3));
      const isUpcoming = dueDate.getTime() > today.getTime();
      const sending = isUpcoming && random() < 0.6;
      const lines = 4 + Math.floor(random() * 40);
      let notifiedLines: number;
      if (!isUpcoming) notifiedLines = lines;
      else if (sending) notifiedLines = Math.floor(lines * random() * 0.6);
      else notifiedLines = random() < 0.5 ? 0 : lines;
      const linesToRelaunch = notifiedLines > 0 && random() < 0.6 ? 1 + Math.floor(random() * Math.min(5, notifiedLines)) : 0;

      calls.push({
        id: id++,
        fundId: fund.id,
        fundName: fund.name,
        currency,
        name: `Appel n°${index + 1}`,
        dueDate,
        noticeDate,
        calledAmount,
        origin,
        compensations,
        forecast,
        shares,
        message,
        attachments,
        createdAt,
        createdBy: CREATORS[Math.floor(random() * CREATORS.length)],
        sending,
        lines,
        notifiedLines,
        linesToRelaunch,
      });
    }
  });

  return calls;
}

export function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Date de l'avis à afficher : absente quand elle est égale à la date d'échéance. */
export function distinctNoticeDate(call: CapitalCall): Date | null {
  return call.noticeDate && !sameDay(call.noticeDate, call.dueDate) ? call.noticeDate : null;
}
