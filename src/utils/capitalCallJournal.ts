import type { CapitalCall } from './capitalCallGenerator';
import type { CapitalCallLine, NoticeFailureReason, PaymentOrigin } from './capitalCallLines';

export type JournalEventType =
  | 'created'
  | 'edited'
  | 'noticeFailed'
  | 'noticeRelaunched'
  | 'notified'
  | 'reminded'
  | 'paymentValidated'
  | 'paymentCancelled'
  | 'noticeReplaced'
  | 'notificationCancelled';

export const JOURNAL_EVENT_TYPES: JournalEventType[] = [
  'created',
  'edited',
  'noticeFailed',
  'noticeRelaunched',
  'notified',
  'reminded',
  'paymentValidated',
  'paymentCancelled',
  'noticeReplaced',
  'notificationCancelled',
];

/** Mise en service de la V3 : le journal d'un appel plus ancien commence à cette date. */
export const V3_GO_LIVE = new Date(2026, 5, 1);

export type JournalDetail =
  | { kind: 'reason'; reason: NoticeFailureReason }
  | { kind: 'change'; field: 'dueDate'; from: Date; to: Date }
  | { kind: 'paymentOrigin'; origin: PaymentOrigin };

export interface JournalEntry {
  id: string;
  type: JournalEventType;
  at: Date;
  /** Null : événement produit par le système. */
  author: string | null;
  lineCount: number;
  detail?: JournalDetail;
}

const DAY = 24 * 60 * 60 * 1000;

function groupBy<T>(items: T[], key: (item: T) => string) {
  const groups = new Map<string, T[]>();
  items.forEach(item => groups.set(key(item), [...(groups.get(key(item)) ?? []), item]));
  return groups;
}

/**
 * Journal d'un appel, en lecture seule, du plus récent au plus ancien.
 * Les gestes sur plusieurs lignes au même instant forment une seule entrée.
 */
export function buildCapitalCallJournal(call: CapitalCall, lines: CapitalCallLine[]) {
  const entries: JournalEntry[] = [
    { id: 'created', type: 'created', at: call.createdAt, author: call.createdBy, lineCount: call.lines },
  ];

  if (call.id % 3 === 0) {
    entries.push({
      id: 'edited',
      type: 'edited',
      at: new Date(call.createdAt.getTime() + DAY),
      author: call.createdBy,
      lineCount: call.lines,
      detail: { kind: 'change', field: 'dueDate', from: new Date(call.dueDate.getTime() - 15 * DAY), to: call.dueDate },
    });
  }

  const noticeEvents = lines.flatMap(line => line.noticeEvents.map(event => ({ line, event })));
  groupBy(
    noticeEvents.filter(({ event }) => event.kind === 'failed'),
    ({ event }) => `${event.at.getTime()}-${event.reason}`,
  ).forEach((group, key) =>
    entries.push({
      id: `failed-${key}`,
      type: 'noticeFailed',
      at: group[0].event.at,
      author: null,
      lineCount: group.length,
      detail: group[0].event.reason ? { kind: 'reason', reason: group[0].event.reason } : undefined,
    }),
  );
  groupBy(
    noticeEvents.filter(({ event }) => event.kind === 'relaunched'),
    ({ event }) => `${event.at.getTime()}-${event.by}`,
  ).forEach((group, key) =>
    entries.push({
      id: `relaunched-${key}`,
      type: 'noticeRelaunched',
      at: group[0].event.at,
      author: group[0].event.by ?? null,
      lineCount: group.length,
    }),
  );

  groupBy(
    lines.filter(line => line.notifiedAt),
    line => String(line.notifiedAt!.getTime()),
  ).forEach((group, key) =>
    entries.push({ id: `notified-${key}`, type: 'notified', at: group[0].notifiedAt!, author: call.createdBy, lineCount: group.length }),
  );
  groupBy(
    lines.filter(line => line.lastReminderAt),
    line => String(line.lastReminderAt!.getTime()),
  ).forEach((group, key) =>
    entries.push({ id: `reminded-${key}`, type: 'reminded', at: group[0].lastReminderAt!, author: call.createdBy, lineCount: group.length }),
  );
  groupBy(
    lines.filter(line => line.paidAt && line.paymentOrigin),
    line => `${line.paidAt!.getTime()}-${line.paymentOrigin}`,
  ).forEach((group, key) =>
    entries.push({
      id: `paid-${key}`,
      type: 'paymentValidated',
      at: group[0].paidAt!,
      author: group[0].paymentOrigin === 'manual' ? call.createdBy : null,
      lineCount: group.length,
      detail: { kind: 'paymentOrigin', origin: group[0].paymentOrigin! },
    }),
  );
  const replaced = lines.filter(line => line.noticeState === 'replaced');
  if (replaced.length > 0) {
    const lastFailure = replaced
      .flatMap(line => line.noticeEvents)
      .reduce((latest, event) => Math.max(latest, event.at.getTime()), call.createdAt.getTime());
    entries.push({
      id: 'replaced',
      type: 'noticeReplaced',
      at: new Date(Math.min(lastFailure + 60 * 60 * 1000, Date.now())),
      author: call.createdBy,
      lineCount: replaced.length,
    });
  }

  const startsAtGoLive = call.createdAt < V3_GO_LIVE;
  return {
    startsAtGoLive,
    entries: entries
      .filter(entry => !startsAtGoLive || entry.at >= V3_GO_LIVE)
      .sort((a, b) => b.at.getTime() - a.at.getTime()),
  };
}
