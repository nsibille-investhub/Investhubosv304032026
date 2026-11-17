import type { CapitalCall } from './capitalCallGenerator';
import type { CapitalCallEmail } from './capitalCallEmails';
import { balanceOf, receivedAmount, type CapitalCallLine } from './capitalCallLines';

export type CallState =
  | 'noticesGenerating'
  | 'settled'
  | 'partiallySettled'
  | 'notified'
  | 'partiallyNotified'
  | 'publishedWithoutSending'
  | 'notDistributed'
  | 'readyToNotify';

/**
 * Ordre de priorité : le premier état vrai l'emporte. Un avis en échec ou un envoi en cours ne change pas
 * l'état de l'appel : ils sont signalés en second plan, dans les colonnes Avis et Notification.
 */
export const CALL_STATES: CallState[] = [
  'noticesGenerating',
  'settled',
  'partiallySettled',
  'notified',
  'partiallyNotified',
  'publishedWithoutSending',
  'notDistributed',
  'readyToNotify',
];

export interface CallSummary {
  lines: number;
  entered: number;
  allocated: number;
  roundingGap: number;
  noticesAvailable: number;
  noticesGenerating: number;
  noticesFailed: number;
  noticesReplaced: number;
  notified: number;
  toNotify: number;
  reminded: number;
  emailsFailed: number;
  paid: number;
  overpaid: number;
  compensated: number;
  partiallyPaid: number;
  paymentDeclared: number;
  unpaid: number;
  cancelled: number;
  settled: number;
  received: number;
  remainingDue: number;
  /** Trop-perçus sans traitement décidé. */
  overpaidUntreated: number;
  overpaidAmount: number;
  state: CallState;
}

export type SettlementCategory =
  | 'paid'
  | 'overpaid'
  | 'compensated'
  | 'partiallyPaid'
  | 'paymentDeclared'
  | 'unpaid'
  | 'cancelled';
export const SETTLEMENT_CATEGORIES: SettlementCategory[] = [
  'paid',
  'overpaid',
  'compensated',
  'partiallyPaid',
  'paymentDeclared',
  'unpaid',
  'cancelled',
];

/** Lignes encore dues : celles qu'ouvre l'action "Suivre les paiements". */
export const OPEN_SETTLEMENT_CATEGORIES: SettlementCategory[] = ['partiallyPaid', 'paymentDeclared', 'unpaid'];

export type NotificationCategory = 'notified' | 'toNotify' | 'reminded';
export const NOTIFICATION_CATEGORIES: NotificationCategory[] = ['notified', 'toNotify', 'reminded'];

/** Règlement d'une ligne : une ligne est réglée si elle est payée, compensée ou annulée. */
export function settlementOf(line: CapitalCallLine): SettlementCategory {
  if (line.state === 'cancelled') return 'cancelled';
  if (line.state === 'paid') return 'paid';
  if (line.state === 'overpaid') return 'overpaid';
  if (line.compensated) return 'compensated';
  if (line.state === 'partiallyPaid') return 'partiallyPaid';
  if (line.state === 'paymentDeclared') return 'paymentDeclared';
  return 'unpaid';
}

export function isSettled(line: CapitalCallLine) {
  return !OPEN_SETTLEMENT_CATEGORIES.includes(settlementOf(line));
}

/** Une ligne relancée est aussi notifiée : le filtre retient les deux catégories. */
export function notificationCategoriesOf(line: CapitalCallLine): NotificationCategory[] {
  if (!line.notifiedAt) return ['toNotify'];
  return line.lastReminderAt ? ['notified', 'reminded'] : ['notified'];
}

const cents = (value: number) => Math.round(value * 100) / 100;

export function summarizeCall(call: CapitalCall, lines: CapitalCallLine[], emails: CapitalCallEmail[] = []): CallSummary {
  const count = (predicate: (line: CapitalCallLine) => boolean) => lines.filter(predicate).length;
  const allocated = cents(lines.reduce((sum, line) => sum + line.calledAmount, 0));
  const notified = count(line => line.notifiedAt !== null);
  const settled = count(isSettled);
  const noticesGenerating = count(line => line.noticeState === 'generating');
  const noticesFailed = count(line => line.noticeState === 'failed');

  let state: CallState = 'readyToNotify';
  if (noticesGenerating > 0) state = 'noticesGenerating';
  else if (lines.length > 0 && settled === lines.length) state = 'settled';
  else if (settled > 0) state = 'partiallySettled';
  else if (lines.length > 0 && notified === lines.length) state = 'notified';
  else if (notified > 0) state = 'partiallyNotified';
  else if (!call.diffusion.notify) {
    state = call.diffusion.portal || call.diffusion.documents ? 'publishedWithoutSending' : 'notDistributed';
  }

  return {
    lines: lines.length,
    entered: call.calledAmount,
    allocated,
    roundingGap: cents(call.calledAmount - allocated),
    noticesAvailable: count(line => line.noticeState === 'available'),
    noticesGenerating,
    noticesFailed,
    noticesReplaced: count(line => line.noticeState === 'replaced'),
    notified,
    toNotify: call.diffusion.notify ? count(line => line.notifiedAt === null) : 0,
    reminded: count(line => line.lastReminderAt !== null),
    emailsFailed: emails.filter(email => ['failed', 'spam', 'notFound'].includes(email.state)).length,
    paid: count(line => settlementOf(line) === 'paid'),
    overpaid: count(line => settlementOf(line) === 'overpaid'),
    compensated: count(line => settlementOf(line) === 'compensated'),
    partiallyPaid: count(line => settlementOf(line) === 'partiallyPaid'),
    paymentDeclared: count(line => settlementOf(line) === 'paymentDeclared'),
    unpaid: count(line => settlementOf(line) === 'unpaid'),
    cancelled: count(line => settlementOf(line) === 'cancelled'),
    settled,
    received: cents(lines.reduce((sum, line) => sum + receivedAmount(line), 0)),
    remainingDue: cents(lines.filter(line => !isSettled(line)).reduce((sum, line) => sum + balanceOf(line), 0)),
    overpaidUntreated: count(line => line.state === 'overpaid' && !line.overpaymentTreatment),
    overpaidAmount: cents(lines.filter(line => line.state === 'overpaid').reduce((sum, line) => sum - balanceOf(line), 0)),
    state,
  };
}

/** Étapes du traitement d'un appel, après sa création. */
export type CallStage = 'notices' | 'diffusion' | 'settlement' | 'closed';
export const CALL_STAGES: CallStage[] = ['notices', 'diffusion', 'settlement', 'closed'];

/**
 * Étape en cours d'un appel. Les avis bloquent la diffusion tant qu'ils sont en génération ;
 * un avis en échec ne bloque pas. Sans notification, l'appel passe directement au règlement.
 */
export function callStage(call: CapitalCall, summary: CallSummary): CallStage {
  if (summary.lines > 0 && summary.settled === summary.lines) return 'closed';
  if (summary.noticesGenerating > 0 && summary.notified === 0) return 'notices';
  if (call.diffusion.notify && summary.notified < summary.lines) return 'diffusion';
  return 'settlement';
}
