import type { NoticeContext, NoticeLine, NoticeRules } from './noticeActions';

/** `immediate` : objet créé sans notification, publié sans envoi. */
export type NoticeNotificationState = 'immediate' | 'none' | 'partial' | 'full';
export type NoticePaymentState = 'none' | 'partial' | 'full';

/** Avancement d'une opération, recalculé sur ses lignes à chaque affichage. */
export interface NoticeProgress {
  lines: number;
  /** Lignes dont le document est présent. */
  documents: number;
  notified: number;
  lastNotifiedAt: Date | null;
  notification: NoticeNotificationState;
}

/** Aucune ligne : jamais "totalement" notifié ni payé. */
export function progressState(done: number, total: number): NoticePaymentState {
  if (done === 0 || total === 0) return 'none';
  return done === total ? 'full' : 'partial';
}

export function noticeProgress<L extends NoticeLine>(
  rules: NoticeRules<L>,
  context: Pick<NoticeContext, 'notify'>,
  lines: L[],
): NoticeProgress {
  const notifiedLines = lines.filter(line => line.notifiedAt !== null);
  const lastNotification = notifiedLines.reduce((latest, line) => Math.max(latest, line.notifiedAt!.getTime()), 0);
  return {
    lines: lines.length,
    documents: lines.filter(line => !rules.documentMissing(line)).length,
    notified: notifiedLines.length,
    lastNotifiedAt: lastNotification > 0 ? new Date(lastNotification) : null,
    notification: context.notify ? progressState(notifiedLines.length, lines.length) : 'immediate',
  };
}

/** Rang de tri d'un état : du moins avancé au plus avancé, à égalité par nombre de lignes traitées. */
export function progressRank(state: NoticeNotificationState, done: number, total: number): number {
  const base = { immediate: 0, none: 1, partial: 2, full: 3 }[state];
  return base + (total > 0 ? done / total / 10 : 0);
}
