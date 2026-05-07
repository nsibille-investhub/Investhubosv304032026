export type ValidationStatus = 'pending' | 'validated' | 'rejected';

export type TargetingKind =
  | 'segment'
  | 'fund'
  | 'shareClass'
  | 'investor'
  | 'subscription'
  | 'audience';

export interface TargetingTag {
  kind: TargetingKind;
  label: string;
}

export interface NotificationRecipient {
  name: string;
  email: string;
  role?: string;
}

export type NotificationChannel = 'email' | 'portal' | 'both';

export interface ValidationNotification {
  channel: NotificationChannel;
  subject: string;
  /** Greeting shown before the body. */
  greeting: string;
  /** Body paragraphs (already resolved variables). */
  paragraphs: string[];
  signature: string;
  recipients: NotificationRecipient[];
}

export interface ValidationBatch {
  id: string;
  /** Batch display name — usually the notification subject or a campaign name. */
  name: string;
  /** Human label hint (Quarterly reporting, Capital call, …). */
  kind: string;
  /** Optional notification — undefined means "silent batch / internal validation". */
  notification?: ValidationNotification;
  createdAt: string;
  createdBy: { name: string; role: string };
}

export interface ValidationDocument {
  id: number;
  name: string;
  format: 'pdf' | 'docx' | 'xlsx' | 'pptx';
  size?: string;
  pathSegments: string[];
  createdBy: {
    name: string;
    role: string;
  };
  createdAt: string;
  targeting: TargetingTag[];
  comment: string;
  status: ValidationStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  /** When set, the document is part of a notification batch (atomic validation). */
  batchId?: string;
  /** Standalone documents may carry their own notification (1 doc → 1 notification). Undefined = silent. */
  notification?: ValidationNotification;
}

const seg = (label: string): TargetingTag => ({ kind: 'segment', label });
const fund = (label: string): TargetingTag => ({ kind: 'fund', label });
const share = (label: string): TargetingTag => ({ kind: 'shareClass', label });
const inv = (label: string): TargetingTag => ({ kind: 'investor', label });
const sub = (label: string): TargetingTag => ({ kind: 'subscription', label });
const aud = (label: string): TargetingTag => ({ kind: 'audience', label });

// ---------------------------------------------------------------------------
// Batches
// ---------------------------------------------------------------------------

const BATCHES: ValidationBatch[] = [
  {
    id: 'batch-capital-call-beta-q2',
    name: 'Capital Call #07 — Beta Infrastructure',
    kind: 'Capital call',
    createdAt: '2026-04-27T11:15:00Z',
    createdBy: { name: 'Antoine Leblanc', role: 'Fund Accountant' },
    notification: {
      channel: 'both',
      subject: 'Capital Call #07 — Beta Infrastructure (due 15 May 2026)',
      greeting: 'Dear Sir or Madam,',
      paragraphs: [
        "As part of your subscription to the **Beta Infrastructure** fund (subscription BETA-2024-0421), please find enclosed Capital Call #07 for an amount of **€1,250,000**, payable by **15 May 2026**.",
        "Attached you will find: the capital call letter, the wire transfer instructions, and the per-investor allocation schedule.",
        "Should you have any question, your Investor Relations contact remains at your disposal.",
      ],
      signature: 'The Investor Relations team — InvestHub',
      recipients: [
        { name: 'Family Office Dupont', email: 'office@dupont-family.com', role: 'Investor' },
        { name: 'Pension Fund Helios', email: 'lp-relations@helios-pension.eu', role: 'Investor' },
        { name: 'Vauban Capital Group', email: 'capital@vauban.fr', role: 'Investor' },
      ],
    },
  },
  {
    id: 'batch-reporting-q1-alpha',
    name: 'Q1 2026 Reporting — Alpha Growth',
    kind: 'Quarterly reporting',
    createdAt: '2026-04-28T09:42:00Z',
    createdBy: { name: 'Camille Renard', role: 'Asset Manager' },
    notification: {
      channel: 'email',
      subject: 'Q1 2026 Quarterly Report — Alpha Growth Fund',
      greeting: 'Dear investor,',
      paragraphs: [
        "We are pleased to share the **Q1 2026 reporting** for the Alpha Growth fund.",
        "Inside: performance vs. benchmark, deployment update (3 new investments), NAV at 31/03/2026 and Q2 outlook.",
        "The ESG appendix and the manager commentary complete the report.",
      ],
      signature: 'Camille Renard — Asset Manager, Alpha Growth',
      recipients: [
        { name: 'All Alpha HNWI LPs', email: 'lp-distribution@investhub.io', role: 'Mailing list' },
      ],
    },
  },
  {
    id: 'batch-annual-letter-2025',
    name: '2025 Annual Letter — Alpha Growth',
    kind: 'LP communication',
    createdAt: '2026-03-12T10:00:00Z',
    createdBy: { name: 'Léa Marchand', role: 'IR Manager' },
    notification: {
      channel: 'portal',
      subject: '2025 Annual Letter and ESG Report — Alpha Growth',
      greeting: 'Dear shareholders,',
      paragraphs: [
        "2025 delivered a **net IRR of 18.2%** alongside the deployment of 4 new strategic investments.",
        "Attached you will find our annual letter together with the ESG report validated by our independent committee.",
      ],
      signature: 'Léa Marchand — Investor Relations',
      recipients: [
        { name: 'All Alpha Growth LPs', email: 'portail-lp@investhub.io', role: 'LP Portal' },
      ],
    },
  },
  {
    id: 'batch-convention-massena',
    name: '2026 Partnership Amendment — Masséna Wealth Management',
    kind: 'Partner agreement (internal)',
    createdAt: '2026-04-15T15:20:00Z',
    createdBy: { name: 'Julien Moreau', role: 'Legal Counsel' },
    // No notification — purely internal validation, the document stays on the BO portal
  },
];

// ---------------------------------------------------------------------------
// Documents (some attached to a batch via batchId)
// ---------------------------------------------------------------------------

const PENDING: Omit<ValidationDocument, 'id' | 'status'>[] = [
  // ── Capital call Beta Infrastructure batch (3 docs)
  {
    name: 'Capital Call notice #07 - Beta Infrastructure.pdf',
    format: 'pdf',
    size: '312 KB',
    pathSegments: [
      'LP Space - Beta Infrastructure',
      'Subscriptions',
      'BETA-2024-0421',
      'Capital calls',
    ],
    createdBy: { name: 'Antoine Leblanc', role: 'Fund Accountant' },
    createdAt: '2026-04-27T11:15:00Z',
    targeting: [fund('Beta Infrastructure'), sub('Subscription BETA-2024-0421')],
    comment: 'Amount €1,250,000 — to validate before sending.',
    batchId: 'batch-capital-call-beta-q2',
  },
  {
    name: 'Wire transfer instructions - Beta Infrastructure.pdf',
    format: 'pdf',
    size: '128 KB',
    pathSegments: [
      'LP Space - Beta Infrastructure',
      'Subscriptions',
      'BETA-2024-0421',
      'Capital calls',
    ],
    createdBy: { name: 'Antoine Leblanc', role: 'Fund Accountant' },
    createdAt: '2026-04-27T11:18:00Z',
    targeting: [fund('Beta Infrastructure')],
    comment: '',
    batchId: 'batch-capital-call-beta-q2',
  },
  {
    name: 'Per-LP allocation schedule - Capital Call #07.xlsx',
    format: 'xlsx',
    size: '92 KB',
    pathSegments: [
      'LP Space - Beta Infrastructure',
      'Subscriptions',
      'BETA-2024-0421',
      'Capital calls',
    ],
    createdBy: { name: 'Antoine Leblanc', role: 'Fund Accountant' },
    createdAt: '2026-04-27T11:20:00Z',
    targeting: [fund('Beta Infrastructure')],
    comment: 'Double-check Pension Fund Helios share.',
    batchId: 'batch-capital-call-beta-q2',
  },

  // ── Q1 Alpha reporting batch (2 docs)
  {
    name: 'Q1 2026 Quarterly Report - Alpha Growth Fund.pdf',
    format: 'pdf',
    size: '2.4 MB',
    pathSegments: ['HNWI Investors', 'Reports', '2026', 'Q1', 'Alpha Growth'],
    createdBy: { name: 'Camille Renard', role: 'Asset Manager' },
    createdAt: '2026-04-28T09:42:00Z',
    targeting: [seg('HNWI'), fund('Alpha Growth'), share('Class A')],
    comment: 'Q1 reporting ready to distribute, awaiting validation before LP portal publication.',
    batchId: 'batch-reporting-q1-alpha',
  },
  {
    name: 'Q1 2026 ESG Appendix - Alpha Growth.pdf',
    format: 'pdf',
    size: '780 KB',
    pathSegments: ['HNWI Investors', 'Reports', '2026', 'Q1', 'Alpha Growth'],
    createdBy: { name: 'Camille Renard', role: 'Asset Manager' },
    createdAt: '2026-04-28T09:50:00Z',
    targeting: [seg('HNWI'), fund('Alpha Growth')],
    comment: '',
    batchId: 'batch-reporting-q1-alpha',
  },

  // ── Silent batch: Masséna partnership amendment (2 docs)
  {
    name: 'Partner agreement amendment - Masséna 2026.docx',
    format: 'docx',
    size: '210 KB',
    pathSegments: ['Distribution', 'Partners', 'Agreements', '2026', 'Masséna'],
    createdBy: { name: 'Julien Moreau', role: 'Legal Counsel' },
    createdAt: '2026-04-15T15:20:00Z',
    targeting: [seg('Distribution partners')],
    comment: 'Legal review to finalise before signature.',
    batchId: 'batch-convention-massena',
  },
  {
    name: 'Masséna retrocession schedule - 2026.xlsx',
    format: 'xlsx',
    size: '88 KB',
    pathSegments: ['Distribution', 'Partners', 'Agreements', '2026', 'Masséna'],
    createdBy: { name: 'Julien Moreau', role: 'Legal Counsel' },
    createdAt: '2026-04-15T15:24:00Z',
    targeting: [seg('Distribution partners')],
    comment: '',
    batchId: 'batch-convention-massena',
  },

  // ── Standalone documents (not grouped)
  {
    name: 'Investor letter - April 2026.docx',
    format: 'docx',
    size: '480 KB',
    pathSegments: ['Communications', 'Quarterly letters', '2026', 'April'],
    createdBy: { name: 'Léa Marchand', role: 'IR Manager' },
    createdAt: '2026-04-27T16:08:00Z',
    targeting: [aud('All segments'), aud('Multi-fund')],
    comment: 'Legal review required on the market-risk paragraph.',
    notification: {
      channel: 'email',
      subject: 'April 2026 Quarterly Letter — InvestHub',
      greeting: 'Dear investors,',
      paragraphs: [
        "Please find enclosed our **April 2026 quarterly letter**, focused on the macro environment and our convictions for H2 2026.",
      ],
      signature: 'Léa Marchand — Investor Relations',
      recipients: [
        { name: 'HNWI mailing list', email: 'lp-hnwi@investhub.io', role: 'Mailing list' },
        { name: 'Institutional mailing list', email: 'lp-instit@investhub.io', role: 'Mailing list' },
        { name: 'Distribution partners', email: 'partenaires@investhub.io', role: 'Mailing list' },
      ],
    },
  },
  {
    name: '2025 Tax Appendices - Family Office Dupont.pdf',
    format: 'pdf',
    size: '1.1 MB',
    pathSegments: [
      'Nominative space',
      'Family Office Dupont',
      'Tax',
      '2025',
      'Tax forms and appendices',
    ],
    createdBy: { name: 'Sophie Bernard', role: 'Tax Specialist' },
    createdAt: '2026-04-26T14:22:00Z',
    targeting: [inv('Family Office Dupont')],
    comment: 'Nominative document — double-check the recipient identity.',
    notification: {
      channel: 'both',
      subject: '2025 Tax Appendices — Family Office Dupont',
      greeting: 'Dear Sir or Madam,',
      paragraphs: [
        "Please find enclosed your **2025 tax appendices** along with the corresponding tax forms.",
      ],
      signature: 'Sophie Bernard — Tax Specialist',
      recipients: [
        { name: 'Family Office Dupont', email: 'office@dupont-family.com', role: 'Investor' },
      ],
    },
  },
  {
    name: 'Term Sheet - Gamma Healthcare Co-investment.pdf',
    format: 'pdf',
    size: '890 KB',
    pathSegments: ['Deals', '2026 pipeline', 'Gamma Healthcare', 'Documentation'],
    createdBy: { name: 'Maxime Dubois', role: 'Investment Director' },
    createdAt: '2026-04-25T08:30:00Z',
    targeting: [seg('UHNWI'), seg('Institutional'), fund('Gamma Healthcare')],
    comment: 'Version 3 - incorporates investment committee feedback.',
    notification: {
      channel: 'email',
      subject: 'Co-investment opportunity — Gamma Healthcare',
      greeting: 'Dear partners,',
      paragraphs: [
        "We invite you to review the **term sheet** for the Gamma Healthcare co-investment (target closing late Q3 2026).",
      ],
      signature: 'Maxime Dubois — Investment Director',
      recipients: [
        { name: 'Selected UHNWI LPs', email: 'select-uhnwi@investhub.io', role: 'Restricted list' },
        { name: 'Institutional investors', email: 'institutional@investhub.io', role: 'Restricted list' },
      ],
    },
  },
  {
    name: 'YTD performance summary - Dashboard.xlsx',
    format: 'xlsx',
    size: '1.7 MB',
    pathSegments: ['Internal reporting', 'Performance', '2026', 'YTD'],
    createdBy: { name: 'Julien Moreau', role: 'Performance Analyst' },
    createdAt: '2026-04-24T17:50:00Z',
    targeting: [seg('Distributors'), aud('Multi-fund')],
    comment: 'Consolidated figures to validate with the middle office.',
    // No notification — internal use, to be published on the middle-office portal after validation
  },
];

const VALIDATED: Omit<ValidationDocument, 'id' | 'status'>[] = [
  // ── 2025 Alpha annual batch (2 validated docs)
  {
    name: '2025 Annual Letter - Alpha Growth.pdf',
    format: 'pdf',
    size: '1.3 MB',
    pathSegments: ['Communications', 'Annual letters', '2025', 'Alpha Growth'],
    createdBy: { name: 'Léa Marchand', role: 'IR Manager' },
    createdAt: '2026-03-12T10:00:00Z',
    targeting: [aud('All segments'), fund('Alpha Growth')],
    comment: '',
    reviewedBy: 'Hugo Petit',
    reviewedAt: '2026-03-15T09:30:00Z',
    batchId: 'batch-annual-letter-2025',
  },
  {
    name: '2025 ESG Report - Alpha Growth.pdf',
    format: 'pdf',
    size: '4.2 MB',
    pathSegments: ['Communications', 'ESG', '2025', 'Alpha Growth'],
    createdBy: { name: 'Léa Marchand', role: 'IR Manager' },
    createdAt: '2026-03-12T10:08:00Z',
    targeting: [aud('All segments'), fund('Alpha Growth')],
    comment: 'Validated by the independent ESG committee.',
    reviewedBy: 'Hugo Petit',
    reviewedAt: '2026-03-15T09:30:00Z',
    batchId: 'batch-annual-letter-2025',
  },

  // ── Standalone validated documents
  {
    name: 'Market note - 2026 Private Equity Trends.pdf',
    format: 'pdf',
    size: '720 KB',
    pathSegments: ['Communications', 'Market notes', '2026', 'PE'],
    createdBy: { name: 'Léa Marchand', role: 'IR Manager' },
    createdAt: '2026-02-20T14:00:00Z',
    targeting: [aud('All segments')],
    comment: '',
    reviewedBy: 'Hugo Petit',
    reviewedAt: '2026-02-21T11:18:00Z',
    notification: {
      channel: 'portal',
      subject: 'Market note — 2026 Private Equity Trends',
      greeting: 'Dear investors,',
      paragraphs: [
        "Our latest **market note** is now available on your LP portal.",
      ],
      signature: 'Léa Marchand — Investor Relations',
      recipients: [
        { name: 'All InvestHub LPs', email: 'portail-lp@investhub.io', role: 'LP Portal' },
      ],
    },
  },
  {
    name: 'Committee deck - Q2 Roadshow.pptx',
    format: 'pptx',
    size: '5.2 MB',
    pathSegments: ['Distribution', 'Roadshow', '2026', 'Q2', 'Decks'],
    createdBy: { name: 'Antoine Leblanc', role: 'Distribution Lead' },
    createdAt: '2026-04-10T09:15:00Z',
    targeting: [seg('Distributors'), aud('Multi-fund')],
    comment: 'Validated after minor corrections on slides 12-14.',
    reviewedBy: 'Sophie Bernard',
    reviewedAt: '2026-04-11T16:42:00Z',
    // No notification — roadshow deck, shared in person
  },
];

const REJECTED: Omit<ValidationDocument, 'id' | 'status'>[] = [
  {
    name: 'Marketing communication - Delta Tech Launch.pptx',
    format: 'pptx',
    size: '4.6 MB',
    pathSegments: ['Communications', 'Marketing', '2026', 'Launches', 'Delta Tech'],
    createdBy: { name: 'Mathilde Garcia', role: 'Marketing Manager' },
    createdAt: '2026-04-20T11:30:00Z',
    targeting: [seg('Distributors'), seg('Retail')],
    comment: 'Rejected: promotional wording not compliant with AMF guidelines, to be reworded.',
    reviewedBy: 'Hugo Petit',
    reviewedAt: '2026-04-21T10:05:00Z',
    notification: {
      channel: 'email',
      subject: '[Rejected] Delta Tech Launch — marketing communication',
      greeting: 'Dear partners,',
      paragraphs: [
        "Discover the new **Delta Tech** opportunity in our presentation pack.",
      ],
      signature: 'Mathilde Garcia — Marketing Manager',
      recipients: [
        { name: 'Retail distribution network', email: 'retail-network@investhub.io', role: 'Distributors' },
      ],
    },
  },
];

export function generateValidationDocuments(): ValidationDocument[] {
  let id = 1;
  const build = (
    items: Omit<ValidationDocument, 'id' | 'status'>[],
    status: ValidationStatus,
  ): ValidationDocument[] =>
    items.map((item) => ({ ...item, id: id++, status }));

  return [
    ...build(PENDING, 'pending'),
    ...build(VALIDATED, 'validated'),
    ...build(REJECTED, 'rejected'),
  ];
}

export function getValidationBatches(): ValidationBatch[] {
  return BATCHES;
}
