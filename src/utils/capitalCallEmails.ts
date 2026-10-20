import type { CapitalCallLine } from './capitalCallLines';

export type EmailType = 'notification' | 'reminder';
export type EmailState = 'sent' | 'delivered' | 'opened' | 'softBounce' | 'failed' | 'spam' | 'notFound';

export const EMAIL_TYPES: EmailType[] = ['notification', 'reminder'];
export const EMAIL_STATES: EmailState[] = ['sent', 'delivered', 'opened', 'softBounce', 'failed', 'spam', 'notFound'];

export interface CapitalCallEmail {
  id: number;
  type: EmailType;
  /** Absent quand aucun email n'a été retrouvé pour une ligne notifiée. */
  recipient: string | null;
  copies: string[];
  combined: boolean;
  /** Souscriptions des lignes couvertes par l'avis joint. */
  subscriptions: string[];
  sentAt: Date | null;
  state: EmailState;
}

function seeded(seed: number) {
  let value = Math.abs(Math.imul(seed ^ 0x1b873593, 0x5d588b65)) % 2147483647 || 1;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

/** Adresse fictive de démonstration, sur le domaine réservé example.com. */
function demoAddress(investor: string) {
  const slug = investor
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.|\.$/g, '');
  return `${slug}@example.com`;
}

function drawState(random: () => number): EmailState {
  const draw = random();
  if (draw < 0.55) return 'delivered';
  if (draw < 0.8) return 'opened';
  if (draw < 0.86) return 'sent';
  if (draw < 0.9) return 'softBounce';
  if (draw < 0.96) return 'failed';
  return 'spam';
}

/**
 * Emails d'un appel, une ligne par email : notification puis relance éventuelle.
 * Avec un avis combiné, un seul email couvre toutes les lignes combinées d'un même investisseur.
 */
export function generateCapitalCallEmails(callId: number, lines: CapitalCallLine[]): CapitalCallEmail[] {
  const random = seeded(callId);
  const emails: CapitalCallEmail[] = [];
  let id = 1;

  (['notification', 'reminder'] as const).forEach(type => {
    const concerned = lines.filter(line => (type === 'notification' ? line.notifiedAt : line.lastReminderAt));
    const groups = new Map<string, CapitalCallLine[]>();
    concerned.forEach(line => {
      const key = line.combinedNotice ? `combined-${line.investor}` : `single-${line.id}`;
      groups.set(key, [...(groups.get(key) ?? []), line]);
    });

    groups.forEach(group => {
      const first = group[0];
      const sentAt = type === 'notification' ? first.notifiedAt : first.lastReminderAt;
      if (type === 'notification' && random() < 0.04) {
        emails.push({
          id: id++,
          type,
          recipient: null,
          copies: [],
          combined: first.combinedNotice,
          subscriptions: group.map(line => line.subscription),
          sentAt: null,
          state: 'notFound',
        });
        return;
      }
      emails.push({
        id: id++,
        type,
        recipient: demoAddress(first.investor),
        copies: random() < 0.3 ? ['conseiller@example.com'] : [],
        combined: first.combinedNotice,
        subscriptions: group.map(line => line.subscription),
        sentAt,
        state: drawState(random),
      });
    });
  });

  return emails.sort((a, b) => (b.sentAt?.getTime() ?? Infinity) - (a.sentAt?.getTime() ?? Infinity));
}
