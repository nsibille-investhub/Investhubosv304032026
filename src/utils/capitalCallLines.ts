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

export const LINE_STATES: LineState[] = [
  'toNotify',
  'notified',
  'paymentDeclared',
  'partiallyPaid',
  'paid',
  'overpaid',
  'cancelled',
];

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

/** Geste daté d'un opérateur, tracé dans le journal de l'appel. */
export interface Stamped<T> {
  value: T;
  by: string;
  at: Date;
}
export const NOTICE_STATES: NoticeState[] = ['generating', 'available', 'failed', 'replaced'];

export interface CapitalCallLine {
  id: number;
  investor: string;
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
  payments: LinePayment[];
  /** Commentaire interne de l'opérateur, jamais visible de l'investisseur. */
  comment: Stamped<string> | null;
  overpaymentTreatment: Stamped<OverpaymentTreatment> | null;
  /** Ligne neutralisée, par exemple après l'annulation de la souscription. */
  cancellation: Stamped<string> | null;
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

/** Exemples de la maquette, saisis par la société de gestion. */
const LINE_COMMENTS = [
  'Virement reçu en deux fois, solde annoncé par l\'investisseur.',
  'Contact pris avec le conseiller, paiement prévu en fin de mois.',
  'Nouveau RIB transmis, à contrôler avant le prochain appel.',
];

const CANCELLATION_REASONS = ['Souscription annulée avant le premier appel.', 'Souscription transférée, appel porté par le cessionnaire.'];

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

/** Appel généré par titre : au moins une part saisie en montant par titre. */
export function isPerUnitCall(call: CapitalCall) {
  return call.shares.some(share => share.mode === 'perUnit');
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
    const total = Math.round((calledAmount + fees + premium) * 100) / 100;
    const payments: LinePayment[] = [];
    let paidAtValue = paidAt;
    if (state === 'paid' && paidAt && paymentOrigin) {
      // Situations réelles de règlement : virement incomplet ou montant reçu supérieur à l'appel.
      const settlementDraw = random();
      const amount =
        settlementDraw < 0.1
          ? Math.round(total * (0.4 + random() * 0.4) * 100) / 100
          : settlementDraw < 0.15
            ? total + Math.round(50 + random() * 450)
            : total;
      payments.push({
        id: `${call.id}-${index}-1`,
        amount,
        valueDate: paidAt,
        origin: paymentOrigin,
        comment: '',
        by: paymentOrigin === 'manual' ? call.createdBy : null,
      });
      state = paymentState(total, amount, state);
      if (state === 'partiallyPaid') paidAtValue = null;
    }
    const cancellation: Stamped<string> | null =
      state === 'notified' && random() < 0.1
        ? { value: CANCELLATION_REASONS[index % CANCELLATION_REASONS.length], by: call.createdBy, at: notifiedAt }
        : null;
    if (cancellation) state = 'cancelled';
    const comment: Stamped<string> | null =
      state === 'partiallyPaid' || random() < 0.06
        ? { value: LINE_COMMENTS[(call.id + index) % LINE_COMMENTS.length], by: call.createdBy, at: notifiedAt }
        : null;

    if (call.justCreated) {
      state = 'toNotify';
      noticeState = 'generating';
      noticeFailureReason = null;
      noticeRequestedAt = new Date(now);
      noticeEvents.splice(0, noticeEvents.length, { at: noticeRequestedAt, kind: 'requested' });
    }

    return {
      id: call.id * 1000 + index + 1,
      investor: INVESTORS[(call.id + index) % INVESTORS.length],
      subscription: `SUB-${String(call.fundId).padStart(2, '0')}${String(index + 1).padStart(3, '0')}`,
      share: share.share,
      units: Math.max(1, Math.round(calledAmount / NOMINAL)),
      amountPerUnit: share.mode === 'perUnit' ? share.value : null,
      calledAmount,
      fees,
      premium,
      total,
      state,
      paymentOrigin,
      noticeState,
      noticeFailureReason,
      noticeRequestedAt,
      noticeEvents,
      notifiedAt: notified ? notifiedAt : null,
      lastReminderAt:
        toRelaunch && random() < 0.6 ? new Date(Math.min(notifiedAt.getTime() + 15 * DAY, now)) : null,
      paidAt: paidAtValue,
      payments,
      comment,
      overpaymentTreatment: null,
      cancellation,
      combinedNotice,
      compensated: call.compensations.length > 0 && random() < 0.3,
      transferred: random() < 0.05,
      hiddenOnPortal: random() < 0.05,
    };
  });
}

const toCents = (value: number) => Math.round(value * 100) / 100;

export function receivedAmount(line: Pick<CapitalCallLine, 'payments'>): number {
  return toCents(line.payments.reduce((sum, payment) => sum + payment.amount, 0));
}

/** Reste dû sur la ligne ; négatif en cas de trop-perçu. */
export function balanceOf(line: Pick<CapitalCallLine, 'payments' | 'total'>): number {
  return toCents(line.total - receivedAmount(line));
}

/** État de règlement à partir du montant reçu ; sans paiement, l'état d'envoi est conservé. */
export function paymentState(total: number, received: number, fallback: LineState): LineState {
  if (received <= 0) return fallback === 'paid' || fallback === 'partiallyPaid' || fallback === 'overpaid' ? 'notified' : fallback;
  const gap = toCents(total - received);
  if (gap > 0) return 'partiallyPaid';
  return gap < 0 ? 'overpaid' : 'paid';
}

export function recordPayment(line: CapitalCallLine, payment: LinePayment): CapitalCallLine {
  const payments = [...line.payments, payment];
  const state = paymentState(line.total, receivedAmount({ payments }), line.state);
  return {
    ...line,
    payments,
    state,
    paymentOrigin: payment.origin,
    paidAt: state === 'paid' || state === 'overpaid' ? payment.valueDate : null,
    overpaymentTreatment: state === 'overpaid' ? line.overpaymentTreatment : null,
  };
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

export function noticeFailed(line: CapitalCallLine, reason: NoticeFailureReason, at = new Date()): CapitalCallLine {
  return {
    ...line,
    noticeState: 'failed',
    noticeFailureReason: reason,
    noticeRequestedAt: null,
    noticeEvents: [...line.noticeEvents, { at, kind: 'failed', reason }],
  };
}

export function noticeAvailable(line: CapitalCallLine, at = new Date()): CapitalCallLine {
  return {
    ...line,
    noticeState: 'available',
    noticeFailureReason: null,
    noticeRequestedAt: null,
    noticeEvents: [...line.noticeEvents, { at, kind: 'available' }],
  };
}

/** Relance ciblée : seuls les avis en échec repartent en génération. Un avis remplacé n'est jamais touché. */
export function relaunchFailedNotices(lines: CapitalCallLine[], by: string, at = new Date()): CapitalCallLine[] {
  return lines.map(line =>
    line.noticeState === 'failed'
      ? {
          ...line,
          noticeState: 'generating',
          noticeRequestedAt: at,
          noticeEvents: [...line.noticeEvents, { at, kind: 'relaunched', by }],
        }
      : line,
  );
}

export function lastFailure(line: CapitalCallLine): NoticeEvent | undefined {
  return [...line.noticeEvents].reverse().find(event => event.kind === 'failed');
}

export function relaunchCount(line: CapitalCallLine): number {
  return line.noticeEvents.filter(event => event.kind === 'relaunched').length;
}
