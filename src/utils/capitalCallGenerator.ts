import type { Fund } from './fundGenerator';
import type { Stamped } from './capitalCallLines';

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

/** Diffusion d'un appel, choisie à la création : trois canaux indépendants. */
export interface CapitalCallDiffusion {
  /** Visible sur le portail investisseur, sur la souscription. */
  portal: boolean;
  /** Notification de l'avis par email. */
  notify: boolean;
  /** Dépôt de l'avis dans l'espace documentaire de l'investisseur. */
  documents: boolean;
  /** Visible et notifié : pré-publication immédiate sur le portail, ou publication à l'envoi de la notification. */
  portalTiming: 'immediate' | 'onNotification';
  /** Dossier de dépôt dans l'espace documentaire, obligatoire quand le dépôt est actif. */
  documentFolder?: string | null;
}

export const DEFAULT_DIFFUSION: CapitalCallDiffusion = {
  portal: true,
  notify: true,
  documents: true,
  portalTiming: 'onNotification',
  documentFolder: null,
};

/** Dossiers de l'espace documentaire éligibles au dépôt des avis d'un fonds (jeu de démonstration). */
export function fundDocumentFolders(fundName: string): string[] {
  return [`${fundName} / Appels de fonds`, `${fundName} / Avis aux investisseurs`, `${fundName} / Correspondance`];
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
  /** Commentaire interne de l'équipe de gestion : ni sur l'avis, ni dans l'email. */
  internalComment: Stamped<string> | null;
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
  diffusion: CapitalCallDiffusion;
  /** Appel créé dans la session : lignes à notifier, avis demandés à la création. */
  justCreated?: boolean;
}

const CREATORS = ['Camille', 'Thomas', 'Léa', 'Hugo', 'Inès', 'Julien'];

const MESSAGES = [
  "Madame, Monsieur,\n\nVous trouverez ci-joint votre avis d'appel de fonds. Nous vous remercions de bien vouloir procéder au virement avant la date d'échéance indiquée.\n\nL'équipe de gestion",
  "Bonjour,\n\nCet appel finance les deux investissements présentés lors du dernier comité. Le détail figure dans la lettre jointe.\n\nBien cordialement,",
  '',
];

const INTERNAL_COMMENTS = [
  'Échéance alignée sur le décaissement prévu pour la participation Atlas.',
  'Deux investisseurs institutionnels ont demandé un délai : relance à faire après le comité.',
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

/** Quelques appels non notifiés sont diffusés sans email, d'autres pré-publiés sur le portail. */
function demoDiffusion(draw: number, fundName: string): CapitalCallDiffusion {
  const base = { ...DEFAULT_DIFFUSION, documentFolder: fundDocumentFolders(fundName)[0] };
  if (draw < 0.1) return { ...base, notify: false };
  if (draw < 0.2) return { ...base, portalTiming: 'immediate' };
  return base;
}

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
      // Appel ciblé : une seule souscription appelée, par exemple un investisseur entré au dernier closing.
      const targeted = random() < 0.06;
      const callAmount = targeted ? Math.max(1000, Math.round(calledAmount / 25 / 1000) * 1000) : calledAmount;
      const allShares: CapitalCallShare[] = shareNames.map((share, shareIndex) => {
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
      const shares = targeted
        ? [{ ...allShares[0], mode: 'totalAmount' as const, value: callAmount, releasedAmount: 0, restrictedTo: 1 }]
        : allShares;
      const message = MESSAGES[Math.floor(random() * MESSAGES.length)];
      const createdBy = CREATORS[Math.floor(random() * CREATORS.length)];
      const internalComment: Stamped<string> | null =
        random() < 0.35
          ? { value: INTERNAL_COMMENTS[index % INTERNAL_COMMENTS.length], by: createdBy, at: new Date(createdAt.getTime() + DAY / 2) }
          : null;
      const attachments = ATTACHMENTS.slice(0, Math.floor(random() * 3));
      const isUpcoming = dueDate.getTime() > today.getTime();
      const sending = isUpcoming && random() < 0.08;
      const lines = targeted ? 1 : 4 + Math.floor(random() * 40);
      let notifiedLines: number;
      if (!isUpcoming) notifiedLines = lines;
      else if (sending) notifiedLines = Math.floor(lines * random() * 0.6);
      else notifiedLines = random() < 0.5 ? 0 : lines;
      const linesToRelaunch =
        notifiedLines > 0 && random() < (isUpcoming ? 0.6 : 0.25) ? 1 + Math.floor(random() * Math.min(5, notifiedLines)) : 0;

      calls.push({
        id: id++,
        fundId: fund.id,
        fundName: fund.name,
        currency,
        name: `Appel n°${index + 1}`,
        dueDate,
        noticeDate,
        calledAmount: callAmount,
        origin,
        compensations,
        forecast,
        shares,
        message,
        internalComment,
        attachments,
        createdAt,
        createdBy,
        sending,
        lines,
        notifiedLines,
        linesToRelaunch,
        diffusion: demoDiffusion(notifiedLines === 0 ? random() : 1, fund.name),
      });
    }
  });

  return calls;
}

/** Appel restreint à quelques souscriptions sur toutes ses parts : nombre de souscriptions appelées. */
export function targetedSubscriptions(call: Pick<CapitalCall, 'shares'>): number | null {
  if (call.shares.length === 0 || call.shares.some(share => share.restrictedTo === null)) return null;
  return call.shares.reduce((sum, share) => sum + (share.restrictedTo ?? 0), 0);
}

export function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Date de l'avis à afficher : absente quand elle est égale à la date d'échéance. */
export function distinctNoticeDate(call: CapitalCall): Date | null {
  return call.noticeDate && !sameDay(call.noticeDate, call.dueDate) ? call.noticeDate : null;
}
