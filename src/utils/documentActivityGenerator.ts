// Single source of truth for a document's activity timeline AND its
// aggregated engagement stats. Every consumer (BirdView tree
// engagement, BirdView document activity panel, Relaunch modal) reads
// the same audience and the same recipient statuses derived from a
// deterministic per-document hash. No randomization at consumption
// time means the numbers shown in the tree never disagree with the
// numbers shown in the panel.

import {
  COMMITMENTS,
  INVESTORS,
  canContactAccessDoc,
  findFund,
  findInvestor,
  getInvestorContacts,
  type DocCategory,
  type DocTargeting,
  type InvestorContact,
  type InvestorProfile,
} from './gedFixtures';

/* ----------------------------------------------------------------------- */
/* Public types                                                            */
/* ----------------------------------------------------------------------- */

/**
 * Minimum context needed to compute a document's audience and status.
 * `docKey` is what seeds the deterministic hash — must be stable across
 * renders (we use the document file name).
 */
export interface DocActivityContext {
  docKey: string;
  isNominatif: boolean;
  documentCategory?: DocCategory;
  investorRestriction?: string;
  fundRestriction?: string;
  segmentRestrictions?: string[];
  subscriptionRestriction?: string;
}

export interface RecipientStatus {
  delivered: boolean;
  opened: boolean;
  clicked: boolean;
  viewed: boolean;
  downloaded: boolean;
  validated: boolean;
  failed: boolean;
  complained: boolean;
}

export interface ActivityRecipient {
  type: 'Investor' | 'Contact';
  /** Parent investor name (for contacts). */
  primaryInvestor?: string;
  primaryInvestorId?: string;
  name: string;
  email: string;
  role?: string;
  status: RecipientStatus;
  /** Stable hash bucket 0..99 used to derive status timestamps. */
  bucket: number;
}

export interface ActivityEvent {
  id: string;
  type:
    | 'notification_send_initiated'
    | 'notification_sent'
    | 'notification_delivered'
    | 'notification_failed'
    | 'notification_opened'
    | 'notification_clicked'
    | 'notification_complained'
    | 'document_viewed'
    | 'document_downloaded'
    | 'document_validated';
  userName: string;
  userEmail: string;
  userType: 'Investor' | 'Contact';
  primaryInvestor?: string;
  /** ISO datetime. */
  timestamp: string;
}

export interface DocumentEngagement {
  /** All recipients (investor + accessible contacts) of the document. */
  audience: ActivityRecipient[];
  /** Number of LP audiences who consulted (LP themselves OR any of their contacts). */
  investorsViewed: number;
  /** Total LPs in audience. */
  totalInvestors: number;
  /** Number of distinct recipients (investors + contacts) who viewed. */
  recipientsViewed: number;
  totalRecipients: number;
}

/* ----------------------------------------------------------------------- */
/* Deterministic hash + percentile buckets                                 */
/* ----------------------------------------------------------------------- */

const hash = (s: string): number => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
};

/** Returns an integer in [0, 100). */
const bucket = (s: string): number => hash(s) % 100;

/* ----------------------------------------------------------------------- */
/* Audience resolution                                                     */
/* ----------------------------------------------------------------------- */

const FUND_CODES = ['NWGC2', 'AIP1'] as const;

const fundCodeFromName = (fundName: string | undefined): string | undefined => {
  if (!fundName) return undefined;
  return FUND_CODES.find((c) => findFund(c)?.name === fundName);
};

/**
 * Builds a synthetic doc descriptor — used by `canContactAccessDoc` to
 * decide if a contact (Intern…) can receive this document.
 */
const docDescriptor = (
  ctx: DocActivityContext,
): { category: DocCategory; targeting: DocTargeting } => {
  if (ctx.segmentRestrictions?.length) {
    return {
      category: ctx.documentCategory ?? 'marketing',
      targeting: { mode: 'segment', segments: ctx.segmentRestrictions },
    };
  }
  if (ctx.investorRestriction) {
    return {
      category: ctx.documentCategory ?? 'other',
      targeting: { mode: 'investor', investorId: '', subscriptionId: '' },
    };
  }
  return {
    category: ctx.documentCategory ?? 'other',
    targeting: { mode: 'fund' },
  };
};

const investorsForContext = (ctx: DocActivityContext): InvestorProfile[] => {
  if (ctx.isNominatif && ctx.investorRestriction) {
    const inv = INVESTORS.find((i) => i.name === ctx.investorRestriction);
    return inv ? [inv] : [];
  }
  const fundCode = fundCodeFromName(ctx.fundRestriction);
  if (fundCode) {
    return COMMITMENTS
      .filter((c) => c.fundCode === fundCode)
      .map((c) => findInvestor(c.investorId))
      .filter((x): x is InvestorProfile => Boolean(x));
  }
  if (ctx.segmentRestrictions?.length) {
    return INVESTORS.filter((inv) =>
      ctx.segmentRestrictions!.includes(inv.typology),
    );
  }
  return [];
};

/* ----------------------------------------------------------------------- */
/* Status derivation (deterministic per recipient)                         */
/* ----------------------------------------------------------------------- */

const buildStatus = (docKey: string, recipientEmail: string): RecipientStatus => {
  const b = bucket(`${docKey}|${recipientEmail}|status`);
  // 4% bounce, 1% spam
  if (b < 4) {
    return {
      delivered: false, opened: false, clicked: false, viewed: false,
      downloaded: false, validated: false, failed: true, complained: false,
    };
  }
  if (b < 5) {
    return {
      delivered: true, opened: true, clicked: false, viewed: false,
      downloaded: false, validated: false, failed: false, complained: true,
    };
  }
  // Engagement ladder:
  //  - delivered: always
  //  - opened   : b >= 17 (~83%)
  //  - clicked  : b >= 38
  //  - viewed   : b >= 50
  //  - downloaded: b >= 73
  //  - validated: b >= 88 (only meaningful for nominatif docs)
  return {
    delivered: true,
    opened: b >= 17,
    clicked: b >= 38,
    viewed: b >= 50,
    downloaded: b >= 73,
    validated: b >= 88,
    failed: false,
    complained: false,
  };
};

/* ----------------------------------------------------------------------- */
/* Audience construction                                                   */
/* ----------------------------------------------------------------------- */

export const buildAudience = (ctx: DocActivityContext): ActivityRecipient[] => {
  const investors = investorsForContext(ctx);
  if (investors.length === 0) return [];

  const desc = docDescriptor(ctx);
  const out: ActivityRecipient[] = [];

  for (const inv of investors) {
    out.push({
      type: 'Investor',
      primaryInvestor: inv.name,
      primaryInvestorId: inv.id,
      name: inv.name,
      email: inv.email,
      status: buildStatus(ctx.docKey, inv.email),
      bucket: bucket(`${ctx.docKey}|${inv.email}|ts`),
    });
    for (const c of getInvestorContacts(inv.id)) {
      if (!canContactAccessDoc(c, desc)) continue;
      out.push({
        type: 'Contact',
        primaryInvestor: inv.name,
        primaryInvestorId: inv.id,
        name: c.name,
        email: c.email,
        role: c.role,
        status: buildStatus(ctx.docKey, c.email),
        bucket: bucket(`${ctx.docKey}|${c.email}|ts`),
      });
    }
  }

  return out;
};

/* ----------------------------------------------------------------------- */
/* Engagement aggregation                                                  */
/* ----------------------------------------------------------------------- */

export const buildEngagement = (ctx: DocActivityContext): DocumentEngagement => {
  const audience = buildAudience(ctx);
  const investorsByName = new Map<string, ActivityRecipient[]>();
  for (const r of audience) {
    const key = r.primaryInvestor ?? r.name;
    if (!investorsByName.has(key)) investorsByName.set(key, []);
    investorsByName.get(key)!.push(r);
  }
  let investorsViewed = 0;
  for (const recipients of investorsByName.values()) {
    if (recipients.some((r) => r.status.viewed || r.status.downloaded || r.status.validated)) {
      investorsViewed++;
    }
  }
  const recipientsViewed = audience.filter((r) =>
    r.status.viewed || r.status.downloaded || r.status.validated,
  ).length;

  return {
    audience,
    totalInvestors: investorsByName.size,
    investorsViewed,
    totalRecipients: audience.length,
    recipientsViewed,
  };
};

/* ----------------------------------------------------------------------- */
/* Activity events                                                         */
/* ----------------------------------------------------------------------- */

const TODAY = new Date('2026-05-06T18:00:00.000Z');

const tsAt = (daysAgo: number, hour: number, minute: number): string => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

/**
 * Emits a realistic timeline for the document. Same pattern for every
 * recipient: send → delivered → (failed | opened → clicked → viewed →
 * downloaded → validated). The exact set of events depends on the
 * recipient's status, the timestamps spread over the past 3 days using
 * the recipient's own bucket so two LPs don't open at the same minute.
 */
export const buildActivityEvents = (ctx: DocActivityContext): ActivityEvent[] => {
  const audience = buildAudience(ctx);
  if (audience.length === 0) return [];

  const events: ActivityEvent[] = [];
  let id = 0;
  const next = () => `evt-${++id}`;

  for (const r of audience) {
    const b = r.bucket; // 0..99
    const minOffset = b % 60; // minutes
    const hourOffset = (b * 13) % 8; // 0..7
    const dayInitiated = 2;
    const daySent = 2;
    const dayDelivered = 2;
    const dayOpened = 1;
    const dayClicked = 1;
    const dayViewed = 1;
    const dayDownloaded = 0;
    const dayValidated = 0;

    const meta = {
      userName: r.name,
      userEmail: r.email,
      userType: r.type,
      primaryInvestor: r.type === 'Contact' ? r.primaryInvestor : undefined,
    };

    // Send chain — always emit initiated + sent for every audience entry
    events.push({ id: next(), type: 'notification_send_initiated', timestamp: tsAt(dayInitiated, 9, 12 + (minOffset % 4)), ...meta });
    events.push({ id: next(), type: 'notification_sent',           timestamp: tsAt(daySent,      9, 14 + (minOffset % 4)), ...meta });

    if (r.status.failed) {
      events.push({ id: next(), type: 'notification_failed', timestamp: tsAt(dayDelivered, 9, 17 + (minOffset % 5)), ...meta });
      continue;
    }

    events.push({ id: next(), type: 'notification_delivered', timestamp: tsAt(dayDelivered, 9, 18 + (minOffset % 5)), ...meta });

    if (r.status.complained) {
      events.push({ id: next(), type: 'notification_opened',     timestamp: tsAt(dayOpened, 10 + hourOffset, minOffset), ...meta });
      events.push({ id: next(), type: 'notification_complained', timestamp: tsAt(dayOpened, 11 + hourOffset, minOffset), ...meta });
      continue;
    }

    if (r.status.opened) {
      events.push({ id: next(), type: 'notification_opened', timestamp: tsAt(dayOpened, 10 + hourOffset, minOffset), ...meta });
    }
    if (r.status.clicked) {
      events.push({ id: next(), type: 'notification_clicked', timestamp: tsAt(dayClicked, 11 + hourOffset, minOffset), ...meta });
    }
    if (r.status.viewed) {
      events.push({ id: next(), type: 'document_viewed', timestamp: tsAt(dayViewed, 14 + (hourOffset % 4), minOffset), ...meta });
    }
    if (r.status.downloaded) {
      events.push({ id: next(), type: 'document_downloaded', timestamp: tsAt(dayDownloaded, 9 + (hourOffset % 6), minOffset), ...meta });
    }
    if (r.status.validated && ctx.isNominatif) {
      // Validation only really makes sense on nominatif docs (acknowledgement of receipt).
      events.push({ id: next(), type: 'document_validated', timestamp: tsAt(dayValidated, 11 + (hourOffset % 4), minOffset), ...meta });
    }
  }

  // Most recent first.
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return events;
};

/* ----------------------------------------------------------------------- */
/* Convenience: derive a context from a DocumentSpec/DataRoomDocument-ish  */
/* ----------------------------------------------------------------------- */

export const contextFromDoc = (input: {
  name: string;
  documentCategory?: DocCategory;
  isNominatif?: boolean;
  investorRestriction?: string;
  fundRestriction?: string;
  segmentRestrictions?: string[];
  subscriptionRestriction?: string;
}): DocActivityContext => ({
  docKey: input.name,
  isNominatif: !!input.isNominatif,
  documentCategory: input.documentCategory,
  investorRestriction: input.investorRestriction,
  fundRestriction: input.fundRestriction,
  segmentRestrictions: input.segmentRestrictions,
  subscriptionRestriction: input.subscriptionRestriction,
});
