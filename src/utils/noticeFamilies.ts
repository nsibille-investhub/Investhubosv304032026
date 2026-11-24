import type { CapitalAccountLine } from './capitalAccountGenerator';
import type { CapitalCallLine } from './capitalCallLines';
import type { DistributionLine } from './distributionGenerator';
import type { NoticeRules } from './noticeActions';
import type { ReleaseLine } from './releaseGenerator';

/** Appels de fonds : notification, puis relance tant que la ligne n'est pas payée. */
export const CAPITAL_CALL_RULES: NoticeRules<CapitalCallLine> = {
  family: 'capitalCalls',
  hasReminder: true,
  documentKind: 'document',
  sendKind: line => (line.notifiedAt === null ? 'notification' : line.state === 'paid' ? null : 'reminder'),
  isHidden: line => line.hiddenOnPortal,
  documentMissing: line => line.noticeState === 'failed' || line.noticeState === 'generating',
  // Le statut de la ligne ne change pas : seule la date d'envoi est renseignée.
  applySend: (line, kind, at) =>
    kind === 'notification' ? { ...line, notifiedAt: at, updatedAt: at } : { ...line, lastReminderAt: at, updatedAt: at },
  syncDocument: line => ({
    ...line,
    noticeState: line.document.manualFile ? 'replaced' : 'available',
    noticeFailureReason: null,
    noticeRequestedAt: null,
  }),
  payment: {
    isPaid: line => line.state === 'paid',
    paidAt: line => line.paidAt,
    validate: (line, receivedOn) => ({
      ...line,
      state: 'paid',
      paidAt: receivedOn,
      paymentOrigin: 'manual',
      updatedAt: new Date(),
    }),
    editDate: (line, receivedOn) => ({ ...line, paidAt: receivedOn, updatedAt: new Date() }),
    // La déclaration de paiement de l'investisseur n'est pas restaurée.
    invalidate: line => ({
      ...line,
      state: line.notifiedAt || line.lastReminderAt ? 'notified' : 'toNotify',
      paidAt: null,
      paymentOrigin: null,
      updatedAt: new Date(),
    }),
  },
};

/** Distributions : une seule notification, sans relance. */
export const DISTRIBUTION_RULES: NoticeRules<DistributionLine> = {
  family: 'distributions',
  hasReminder: false,
  documentKind: 'document',
  sendKind: line => (line.notifiedAt === null ? 'notification' : null),
  isHidden: line => line.hiddenOnPortal,
  documentMissing: () => false,
  applySend: (line, _kind, at) => ({ ...line, notifiedAt: at, updatedAt: at }),
};

/** Capital accounts : la notification passe la ligne à Notifié, la relance reste possible sans limite. */
export const CAPITAL_ACCOUNT_RULES: NoticeRules<CapitalAccountLine> = {
  family: 'capitalAccounts',
  hasReminder: true,
  documentKind: 'document',
  sendKind: line => (line.notifiedAt === null ? 'notification' : 'reminder'),
  isHidden: () => false,
  documentMissing: () => false,
  applySend: (line, kind, at) =>
    kind === 'notification'
      ? { ...line, state: 'notified', notifiedAt: at, updatedAt: at }
      : { ...line, remindedAt: at, updatedAt: at },
};

/** Déblocages : une ligne n'a pas de statut, seulement Notifiée Oui ou Non. */
export const RELEASE_RULES: NoticeRules<ReleaseLine> = {
  family: 'releases',
  hasReminder: false,
  documentKind: 'letter',
  sendKind: line => (line.notifiedAt === null ? 'notification' : null),
  isHidden: () => false,
  documentMissing: () => false,
  applySend: (line, _kind, at) => ({ ...line, notified: true, notifiedAt: at }),
};
