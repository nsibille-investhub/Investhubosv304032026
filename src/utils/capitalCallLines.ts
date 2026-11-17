import type { CapitalCall } from './capitalCallGenerator';

export type LineState =
  | 'toNotify'
  | 'notified'
  | 'paymentDeclared'
  | 'partiallyPaid'
  | 'paid'
  | 'overpaid'
  | 'cancelled';
export type NoticeState = 'generating' | 'available' | 'failed' | 'replaced';
export type PaymentOrigin = 'bankReconciliation' | 'directDebit' | 'manual';
export type NoticeFailureReason = 'combinedTemplateMissing' | 'productionError' | 'timeout';

export interface NoticeEvent {
  at: Date;
  kind: 'requested' | 'failed' | 'relaunched' | 'available';
  reason?: NoticeFailureReason;
  /** Auteur d'une relance. Les autres événements sont produits par le système. */
  by?: string;
}

/** Délai maximal de production d'un avis avant "En échec". Valeur provisoire : question ouverte d'IC-5589. */
export const NOTICE_TIMEOUT_MINUTES = 30;

/** États de règlement suivis sur la fiche d'une souscription. */
export const LINE_STATES: LineState[] = [
  'toNotify',
  'notified',
  'paymentDeclared',
  'partiallyPaid',
  'paid',
  'overpaid',
  'cancelled',
];

/** Statuts enregistrés sur une ligne d'appel, dans l'ordre du cycle. */
export const CALL_LINE_STATES: LineState[] = ['toNotify', 'notified', 'paymentDeclared', 'paid'];

/** Paiement reçu sur une ligne : une ligne peut être réglée en plusieurs fois. */
export interface LinePayment {
  id: string;
  amount: number;
  valueDate: Date;
  origin: PaymentOrigin;
  comment: string;
  /** Null : rapprochement bancaire ou prélèvement, sans geste de l'opérateur. */
  by: string | null;
}

/** Trop-perçu : remboursé à l'investisseur ou gardé en avance sur son prochain appel. */
export type OverpaymentTreatment = 'refund' | 'carryForward';
export const OVERPAYMENT_TREATMENTS: OverpaymentTreatment[] = ['refund', 'carryForward'];

/** Geste daté d'un opérateur. */
export interface Stamped<T> {
  value: T;
  by: string;
  at: Date;
}

export interface CapitalCallLine {
  id: number;
  investor: string;
  /** Nom de la souscription. */
  subscription: string;
  share: string;
  units: number;
  /** Renseigné seulement quand l'appel est généré par titre. */
  amountPerUnit: number | null;
  calledAmount: number;
  fees: number;
  premium: number;
  total: number;
  state: LineState;
  paymentOrigin: PaymentOrigin | null;
  noticeState: NoticeState;
  noticeFailureReason: NoticeFailureReason | null;
  /** Dernière demande de production, pour le contrôle du délai maximal. */
  noticeRequestedAt: Date | null;
  /** Trace des demandes, échecs et relances de l'avis. */
  noticeEvents: NoticeEvent[];
  notifiedAt: Date | null;
  lastReminderAt: Date | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  combinedNotice: boolean;
  compensated: boolean;
  transferred: boolean;
  hiddenOnPortal: boolean;
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

const DAY = 24 * 60 * 60 * 1000;
const MINUTE = 60 * 1000;
const NOMINAL = 100;

function seeded(seed: number) {
  let value = Math.abs(Math.imul(seed ^ 0x2c1b3c6d, 0x297a2d39)) % 2147483647 || 1;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

const CURRENCY_SYMBOLS: Record<string, string> = { EUR: '€', USD: '$', GBP: '£' };

/** Nom généré par défaut pour une souscription : investisseur, montant souscrit, fonds et part. */
function defaultSubscriptionName(investor: string, committed: number, call: CapitalCall, share: string) {
  const thousands = Math.max(10, Math.round(committed / 10000) * 10);
  return `${investor} - ${CURRENCY_SYMBOLS[call.currency] ?? call.currency}${thousands}K - ${call.fundName} Part ${share}`;
}

/**
 * Lignes investisseurs d'un appel, cohérentes avec ses compteurs : lignes notifiées
 * et lignes à relancer. Les autres lignes notifiées sont payées ou déclarées payées.
 */
export function generateCapitalCallLines(call: CapitalCall): CapitalCallLine[] {
  const random = seeded(call.id);
  const weights = Array.from({ length: call.lines }, () => 0.5 + random());
  const weightSum = weights.reduce((sum, value) => sum + value, 0);
  const now = Date.now();
  const notifiedAt = new Date(Math.min(call.createdAt.getTime() + 3 * DAY, now));
  const pastDue = call.dueDate.getTime() < now;
  // La plupart des appels échus sont soldés ; les autres gardent quelques lignes non réglées.
  const fullySettled = pastDue && call.linesToRelaunch === 0 && random() < 0.8;
  // Incident de production rare : seuls quelques appels ont des avis en génération prolongée ou en échec.
  const noticeIncidents = call.id % 9 === 0;

  return weights.map((weight, index) => {
    const share = call.shares[index % call.shares.length];
    // Répartition au centime inférieur, comme le calcul de l'assistant : l'écart d'arrondi reste sur l'appel.
    const calledAmount = Math.floor((call.calledAmount * weight * 100) / weightSum) / 100;
    const fees = share.entryFeesCalled ? Math.round(calledAmount * 2) / 100 : 0;
    const premium = share.premiumCalled ? Math.round(calledAmount) / 100 : 0;
    const notified = index < call.notifiedLines;
    const toRelaunch = notified && index < call.linesToRelaunch;

    let state: LineState = 'toNotify';
    if (notified) {
      if (toRelaunch) state = 'notified';
      else state = fullySettled || random() < (pastDue ? 0.85 : 0.5) ? 'paid' : 'paymentDeclared';
    }

    const combinedNotice = random() < 0.3;
    const requestedAt = new Date(Math.min(call.createdAt.getTime() + 30 * MINUTE, now - 3 * 60 * MINUTE));
    let noticeState: NoticeState = 'available';
    let noticeFailureReason: NoticeFailureReason | null = null;
    let noticeRequestedAt: Date | null = null;
    const noticeEvents: NoticeEvent[] = [{ at: requestedAt, kind: 'requested' }];
    const failedAt = new Date(requestedAt.getTime() + 2 * MINUTE);
    if (!notified) {
      const draw = noticeIncidents ? random() : 0.36 + random() * 0.64;
      if (draw < 0.08) {
        // Demande restée sans réponse : passe en échec au contrôle du délai maximal.
        noticeState = 'generating';
        noticeRequestedAt = requestedAt;
      } else if (draw < 0.16) {
        noticeState = 'generating';
        noticeRequestedAt = new Date(now - MINUTE);
        noticeEvents.push({ at: noticeRequestedAt, kind: 'relaunched', by: 'Camille' });
      } else if (draw < 0.3) {
        noticeState = 'failed';
        noticeFailureReason = combinedNotice ? 'combinedTemplateMissing' : 'productionError';
        noticeEvents.push({ at: failedAt, kind: 'failed', reason: noticeFailureReason });
      } else if (draw < 0.36) {
        noticeState = 'replaced';
        noticeEvents.push({ at: failedAt, kind: 'failed', reason: 'productionError' });
      } else {
        noticeEvents.push({ at: failedAt, kind: 'available' });
      }
    } else if (random() < 0.08) {
      noticeState = 'replaced';
    } else {
      noticeEvents.push({ at: failedAt, kind: 'available' });
    }

    const paidAt =
      state === 'paid'
        ? new Date(
            Math.max(
              notifiedAt.getTime(),
              Math.min(call.dueDate.getTime() - Math.floor(random() * 10) * DAY, now),
            ),
          )
        : null;
    const originDraw = random();
    const paymentOrigin: PaymentOrigin | null =
      state === 'paid' ? (originDraw < 0.6 ? 'bankReconciliation' : originDraw < 0.8 ? 'directDebit' : 'manual') : null;

    if (call.justCreated) {
      state = 'toNotify';
      noticeState = 'generating';
      noticeFailureReason = null;
      noticeRequestedAt = new Date(now);
      noticeEvents.splice(0, noticeEvents.length, { at: noticeRequestedAt, kind: 'requested' });
    }

    const investor = INVESTORS[(call.id + index) % INVESTORS.length];
    const lastReminderAt =
      toRelaunch && random() < 0.6 ? new Date(Math.min(notifiedAt.getTime() + 15 * DAY, now)) : null;

    return {
      id: call.id * 1000 + index + 1,
      investor,
      subscription: defaultSubscriptionName(investor, calledAmount * 4, call, share.share),
      share: share.share,
      units: Math.max(1, Math.round(calledAmount / NOMINAL)),
      amountPerUnit: share.mode === 'perUnit' ? share.value : null,
      calledAmount,
      fees,
      premium,
      total: Math.round((calledAmount + fees + premium) * 100) / 100,
      state,
      paymentOrigin,
      noticeState,
      noticeFailureReason,
      noticeRequestedAt,
      noticeEvents,
      notifiedAt: notified ? notifiedAt : null,
      lastReminderAt,
      paidAt,
      createdAt: call.createdAt,
      updatedAt: paidAt ?? lastReminderAt ?? (notified ? notifiedAt : call.createdAt),
      combinedNotice,
      compensated: call.compensations.length > 0 && random() < 0.3,
      transferred: random() < 0.05,
      hiddenOnPortal: random() < 0.05,
    };
  });
}

/** Contrôle du délai maximal : un avis encore en génération au-delà passe en échec. */
export function expireStaleNotices(lines: CapitalCallLine[], now = new Date()): CapitalCallLine[] {
  const limit = now.getTime() - NOTICE_TIMEOUT_MINUTES * MINUTE;
  return lines.map(line =>
    line.noticeState === 'generating' && line.noticeRequestedAt && line.noticeRequestedAt.getTime() < limit
      ? noticeFailed(line, 'timeout', now)
      : line,
  );
}

function noticeFailed(line: CapitalCallLine, reason: NoticeFailureReason, at = new Date()): CapitalCallLine {
  return {
    ...line,
    noticeState: 'failed',
    noticeFailureReason: reason,
    noticeRequestedAt: null,
    noticeEvents: [...line.noticeEvents, { at, kind: 'failed', reason }],
  };
}

/** État de règlement à partir du montant reçu ; sans paiement, l'état d'envoi est conservé. */
export function paymentState(total: number, received: number, fallback: LineState): LineState {
  if (received <= 0) return fallback === 'paid' || fallback === 'partiallyPaid' || fallback === 'overpaid' ? 'notified' : fallback;
  const gap = Math.round((total - received) * 100) / 100;
  if (gap > 0) return 'partiallyPaid';
  return gap < 0 ? 'overpaid' : 'paid';
}
