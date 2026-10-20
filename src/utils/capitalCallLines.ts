import type { CapitalCall } from './capitalCallGenerator';

export type LineState = 'toNotify' | 'notified' | 'paymentDeclared' | 'paid';
export type NoticeState = 'generating' | 'available' | 'failed' | 'replaced';
export type PaymentOrigin = 'bankReconciliation' | 'directDebit' | 'manual';
export type NoticeFailureReason = 'combinedTemplateMissing' | 'productionError' | 'timeout';

export interface NoticeEvent {
  at: Date;
  kind: 'requested' | 'failed' | 'relaunched' | 'available';
  reason?: NoticeFailureReason;
}

/** Délai maximal de production d'un avis avant "En échec". Valeur provisoire : question ouverte d'IC-5589. */
export const NOTICE_TIMEOUT_MINUTES = 30;

export const LINE_STATES: LineState[] = ['toNotify', 'notified', 'paymentDeclared', 'paid'];
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

  return weights.map((weight, index) => {
    const share = call.shares[index % call.shares.length];
    const calledAmount = Math.round((call.calledAmount * weight) / weightSum / 100) * 100;
    const fees = share.entryFeesCalled ? Math.round(calledAmount * 0.02) : 0;
    const premium = share.premiumCalled ? Math.round(calledAmount * 0.01) : 0;
    const notified = index < call.notifiedLines;
    const toRelaunch = notified && index < call.linesToRelaunch;

    let state: LineState = 'toNotify';
    if (notified) {
      if (toRelaunch) state = 'notified';
      else state = random() < (pastDue ? 0.85 : 0.5) ? 'paid' : 'paymentDeclared';
    }

    const combinedNotice = random() < 0.3;
    const requestedAt = new Date(Math.min(call.createdAt.getTime() + 30 * MINUTE, now - 3 * 60 * MINUTE));
    let noticeState: NoticeState = 'available';
    let noticeFailureReason: NoticeFailureReason | null = null;
    let noticeRequestedAt: Date | null = null;
    const noticeEvents: NoticeEvent[] = [{ at: requestedAt, kind: 'requested' }];
    const failedAt = new Date(requestedAt.getTime() + 2 * MINUTE);
    if (!notified) {
      const draw = random();
      if (draw < 0.08) {
        // Demande restée sans réponse : passe en échec au contrôle du délai maximal.
        noticeState = 'generating';
        noticeRequestedAt = requestedAt;
      } else if (draw < 0.16) {
        noticeState = 'generating';
        noticeRequestedAt = new Date(now - MINUTE);
        noticeEvents.push({ at: noticeRequestedAt, kind: 'relaunched' });
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
      total: calledAmount + fees + premium,
      state,
      paymentOrigin,
      noticeState,
      noticeFailureReason,
      noticeRequestedAt,
      noticeEvents,
      notifiedAt: notified ? notifiedAt : null,
      lastReminderAt:
        toRelaunch && random() < 0.6 ? new Date(Math.min(notifiedAt.getTime() + 15 * DAY, now)) : null,
      paidAt,
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
export function relaunchFailedNotices(lines: CapitalCallLine[], at = new Date()): CapitalCallLine[] {
  return lines.map(line =>
    line.noticeState === 'failed'
      ? {
          ...line,
          noticeState: 'generating',
          noticeRequestedAt: at,
          noticeEvents: [...line.noticeEvents, { at, kind: 'relaunched' }],
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
