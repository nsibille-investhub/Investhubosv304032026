// Pending-validation test data — wired on top of the unified gedFixtures
// universe. Each document carries deterministic targeting tags that match
// the document's nature.

import {
  commitmentsForFund,
  findFund,
  findInvestor,
  type InvestorProfile,
} from './gedFixtures';

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

/** A reference to a translation key with optional interpolation variables. */
export interface I18nRef {
  key: string;
  vars?: Record<string, string | number>;
}

export interface NotificationRecipient {
  /** Display name. Either a literal (real investor name) or a translation ref. */
  name: string | I18nRef;
  email: string;
  /** Either a literal role or a translation ref for generic roles. */
  role?: string | I18nRef;
}

export type NotificationChannel = 'email' | 'portal' | 'both';

export interface ValidationNotification {
  channel: NotificationChannel;
  subject: I18nRef;
  greeting: I18nRef;
  paragraphs: I18nRef[];
  signature: I18nRef;
  recipients: NotificationRecipient[];
}

export interface ValidationBatch {
  id: string;
  name: string;
  /** Translation key for the kind label (e.g. "validation.fixtures.kind.capitalCall"). */
  kindKey: string;
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
  createdBy: { name: string; role: string };
  createdAt: string;
  targeting: TargetingTag[];
  /** Optional translation ref for the document comment. */
  comment?: I18nRef;
  /** Translation key for the document type label (e.g. "validation.fixtures.kind.taxCertificate"). */
  kindKey?: string;
  status: ValidationStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  batchId?: string;
  notification?: ValidationNotification;
  /** Optional GED space id used to route the document to the data room after validation. */
  gedSpaceId?: string;
}

const seg   = (label: string): TargetingTag => ({ kind: 'segment',     label });
const fund  = (label: string): TargetingTag => ({ kind: 'fund',        label });
const share = (label: string): TargetingTag => ({ kind: 'shareClass',  label });
const inv   = (label: string): TargetingTag => ({ kind: 'investor',    label });
const sub   = (label: string): TargetingTag => ({ kind: 'subscription',label });

const FUND_NW  = findFund('NWGC2')!;
const FUND_ATL = findFund('AIP1')!;

const NW_COMMITMENTS = commitmentsForFund(FUND_NW.code);
const ATL_COMMITMENTS = commitmentsForFund(FUND_ATL.code);

const LP_ALDEBARAN = findInvestor('INV-001')!;
const LP_BRUNSWICK = findInvestor('INV-002')!;
const LP_NORWOOD   = findInvestor('INV-014')!;
const LP_CAMBERWELL = findInvestor('INV-023')!;
const LP_GREYCLIFF = findInvestor('INV-007')!;
const LP_HARTWOOD  = findInvestor('INV-021')!;
const LP_KENS      = findInvestor('INV-011')!;

const subscriptionFor = (fundCode: string, investorId: string) => {
  const commitments = fundCode === FUND_NW.code ? NW_COMMITMENTS : ATL_COMMITMENTS;
  return commitments.find((c) => c.investorId === investorId)!;
};

const NW_BRUNSWICK_SUB = subscriptionFor(FUND_NW.code, LP_BRUNSWICK.id);
const NW_ALDEBARAN_SUB = subscriptionFor(FUND_NW.code, LP_ALDEBARAN.id);
const ATL_ALDEBARAN_SUB = subscriptionFor(FUND_ATL.code, LP_ALDEBARAN.id);
const ATL_BRUNSWICK_SUB = subscriptionFor(FUND_ATL.code, LP_BRUNSWICK.id);
const NW_NORWOOD_SUB = subscriptionFor(FUND_NW.code, LP_NORWOOD.id);
const ATL_NORWOOD_SUB = subscriptionFor(FUND_ATL.code, LP_NORWOOD.id);
const NW_CAMBERWELL_SUB = subscriptionFor(FUND_NW.code, LP_CAMBERWELL.id);
const NW_GREYCLIFF_SUB = subscriptionFor(FUND_NW.code, LP_GREYCLIFF.id);
const ATL_GREYCLIFF_SUB = subscriptionFor(FUND_ATL.code, LP_GREYCLIFF.id);
const NW_HARTWOOD_SUB = subscriptionFor(FUND_NW.code, LP_HARTWOOD.id);

/* --------------------------------------------------------------------- */
/* Batches                                                               */
/* --------------------------------------------------------------------- */

const NW_DRAWDOWN_DATE = '2026-05-12';
const NW_DRAWDOWN_NUM = 19;

/** Helper: builds a "tax pack" notification targeted at a single investor. */
const taxPackNotification = (investor: InvestorProfile): ValidationNotification => ({
  channel: 'both',
  subject: {
    key: 'validation.fixtures.taxCertificate.subject',
    vars: { investor: investor.name, fund: `${FUND_NW.name} + ${FUND_ATL.name}` },
  },
  greeting: { key: 'validation.fixtures.taxCertificate.greeting' },
  paragraphs: [
    { key: 'validation.fixtures.taxCertificate.p1', vars: { fund: `${FUND_NW.name} / ${FUND_ATL.name}` } },
  ],
  signature: { key: 'validation.fixtures.taxCertificate.signature' },
  recipients: [
    {
      name: investor.name,
      email: investor.email,
      role: { key: 'validation.fixtures.role.investor' },
    },
  ],
});

const BATCHES: ValidationBatch[] = [
  // Cap call campaign — used for 5 standalone notices (one per LP).
  {
    id: 'batch-capital-call-northwind',
    name: `Capital Call #${NW_DRAWDOWN_NUM} — ${FUND_NW.name}`,
    kindKey: 'validation.fixtures.kind.capitalCall',
    createdAt: '2026-04-27T11:15:00Z',
    createdBy: { name: 'Antoine Leblanc', role: 'Fund Accountant' },
    notification: {
      channel: 'both',
      subject: {
        key: 'validation.fixtures.capitalCall.subject',
        vars: { num: NW_DRAWDOWN_NUM, fund: FUND_NW.name },
      },
      greeting: { key: 'validation.fixtures.capitalCall.greeting' },
      paragraphs: [
        {
          key: 'validation.fixtures.capitalCall.p1',
          vars: { fund: FUND_NW.name, num: NW_DRAWDOWN_NUM },
        },
        { key: 'validation.fixtures.capitalCall.p2' },
        { key: 'validation.fixtures.capitalCall.p3' },
      ],
      signature: { key: 'validation.fixtures.capitalCall.signature' },
      recipients: NW_COMMITMENTS.map((c) => {
        const i = findInvestor(c.investorId)!;
        return {
          name: i.name,
          email: i.email,
          role: { key: 'validation.fixtures.role.investor' },
        };
      }),
    },
  },
  // Q1 reporting — fund-level notification (groups all LPs of the fund).
  {
    id: 'batch-quarterly-report-q1-atlas',
    name: `Q1 2026 Reporting — ${FUND_ATL.name}`,
    kindKey: 'validation.fixtures.kind.quarterlyReporting',
    createdAt: '2026-04-28T09:42:00Z',
    createdBy: { name: 'Maxime Dubois', role: 'Asset Manager' },
    notification: {
      channel: 'email',
      subject: {
        key: 'validation.fixtures.quarterlyReport.subject',
        vars: { fund: FUND_ATL.name },
      },
      greeting: { key: 'validation.fixtures.quarterlyReport.greeting' },
      paragraphs: [
        {
          key: 'validation.fixtures.quarterlyReport.p1',
          vars: { fund: FUND_ATL.name },
        },
        { key: 'validation.fixtures.quarterlyReport.p2' },
      ],
      signature: { key: 'validation.fixtures.quarterlyReport.signature' },
      recipients: [
        {
          name: {
            key: 'validation.fixtures.recipient.allLps',
            vars: { fund: FUND_ATL.name },
          },
          email: 'lp-aip1@investhub.io',
          role: { key: 'validation.fixtures.role.distributionList' },
        },
      ],
    },
  },
  // Silent batch — used for the standalone distribution agreement doc.
  {
    id: 'batch-distribution-agreement-kensington',
    name: `2026 Distribution Agreement — ${LP_KENS.name}`,
    kindKey: 'validation.fixtures.kind.distributorAgreement',
    createdAt: '2026-04-15T15:20:00Z',
    createdBy: { name: 'Julien Moreau', role: 'Legal Counsel' },
  },
  // Tax campaigns — one parent batch per investor so the publication center
  // groups the LP's documents into a single nominative bundle.
  {
    id: 'batch-tax-pack-aldebaran',
    name: `Pack fiscal 2025 — ${LP_ALDEBARAN.name}`,
    kindKey: 'validation.fixtures.kind.taxCertificate',
    createdAt: '2026-04-29T10:10:00Z',
    createdBy: { name: 'Sophie Bernard', role: 'Tax Specialist' },
    notification: taxPackNotification(LP_ALDEBARAN),
  },
  {
    id: 'batch-tax-pack-brunswick',
    name: `Pack fiscal 2025 — ${LP_BRUNSWICK.name}`,
    kindKey: 'validation.fixtures.kind.taxCertificate',
    createdAt: '2026-04-29T10:15:00Z',
    createdBy: { name: 'Sophie Bernard', role: 'Tax Specialist' },
    notification: taxPackNotification(LP_BRUNSWICK),
  },
  {
    id: 'batch-tax-pack-greycliff',
    name: `Pack fiscal 2025 — ${LP_GREYCLIFF.name}`,
    kindKey: 'validation.fixtures.kind.taxCertificate',
    createdAt: '2026-04-29T10:20:00Z',
    createdBy: { name: 'Sophie Bernard', role: 'Tax Specialist' },
    notification: taxPackNotification(LP_GREYCLIFF),
  },
  // Subscription onboarding pack for a new LP (3 docs).
  {
    id: 'batch-subscription-pack-norwood',
    name: `Souscription 2026 — ${LP_NORWOOD.name}`,
    kindKey: 'validation.fixtures.kind.subscription',
    createdAt: '2026-04-25T08:30:00Z',
    createdBy: { name: 'Julien Moreau', role: 'Legal Counsel' },
    notification: {
      channel: 'email',
      subject: {
        key: 'validation.fixtures.taxCertificate.subject',
        vars: { investor: LP_NORWOOD.name, fund: 'Souscription 2026' },
      },
      greeting: { key: 'validation.fixtures.taxCertificate.greeting' },
      paragraphs: [
        { key: 'validation.fixtures.taxCertificate.p1', vars: { fund: 'Souscription 2026' } },
      ],
      signature: { key: 'validation.fixtures.taxCertificate.signature' },
      recipients: [
        {
          name: LP_NORWOOD.name,
          email: LP_NORWOOD.email,
          role: { key: 'validation.fixtures.role.investor' },
        },
      ],
    },
  },
  // Camberwell quarterly statement pack (2 docs).
  {
    id: 'batch-statement-camberwell',
    name: `Relevés Q1 2026 — ${LP_CAMBERWELL.name}`,
    kindKey: 'validation.fixtures.kind.quarterlyReporting',
    createdAt: '2026-04-28T11:00:00Z',
    createdBy: { name: 'Maxime Dubois', role: 'Asset Manager' },
    notification: {
      channel: 'portal',
      subject: {
        key: 'validation.fixtures.quarterlyReport.subject',
        vars: { fund: LP_CAMBERWELL.name },
      },
      greeting: { key: 'validation.fixtures.quarterlyReport.greeting' },
      paragraphs: [
        { key: 'validation.fixtures.quarterlyReport.p1', vars: { fund: FUND_NW.name } },
      ],
      signature: { key: 'validation.fixtures.quarterlyReport.signature' },
      recipients: [
        {
          name: LP_CAMBERWELL.name,
          email: LP_CAMBERWELL.email,
          role: { key: 'validation.fixtures.role.investor' },
        },
      ],
    },
  },
];

/* --------------------------------------------------------------------- */
/* Documents                                                             */
/* --------------------------------------------------------------------- */

const nwCallPath = [FUND_NW.name, 'Capital Calls', '2026', `${NW_DRAWDOWN_DATE} - Drawdown #${NW_DRAWDOWN_NUM}`];
const atlReportPath = [FUND_ATL.name, 'Management Reports', '2026', 'Q1'];

const taxPackPath = (fund: string) => [fund, 'Other Communications', 'Tax Certificates 2025'];
const subscriptionPath = (fund: string) => [fund, 'Subscription Documents', '2026'];

/** Selected LPs used to seed the various scenarios. */
const SINGLE_CC_INVESTORS = ['INV-003', 'INV-008', 'INV-009', 'INV-013', 'INV-027'] as const;

const PENDING: Omit<ValidationDocument, 'id' | 'status'>[] = [
  // ============================================================
  // STANDALONE WITH NOTIFICATION (~12 docs — 80% of the 15 unitary)
  // ============================================================

  // 5 capital-call notices — one per LP, no group (each LP receives one).
  ...SINGLE_CC_INVESTORS.map((investorId, i) => {
    const investor = findInvestor(investorId)!;
    const commitment = NW_COMMITMENTS.find((c) => c.investorId === investorId)!;
    const minute = String(15 + i).padStart(2, '0');
    return {
      name: `${NW_DRAWDOWN_DATE} - ${FUND_NW.name} - Capital Call #${NW_DRAWDOWN_NUM} - ${investor.name} (${commitment.subscriptionId}).pdf`,
      format: 'pdf' as const,
      size: '180 KB',
      pathSegments: nwCallPath,
      createdBy: { name: 'Antoine Leblanc', role: 'Fund Accountant' },
      createdAt: `2026-04-27T11:${minute}:00Z`,
      targeting: [
        fund(FUND_NW.name),
        inv(investor.name),
        sub(commitment.subscriptionId),
        share(commitment.shareClass),
      ],
      comment:
        i === 0
          ? {
              key: 'validation.fixtures.comment.capitalCall',
              vars: { count: SINGLE_CC_INVESTORS.length },
            }
          : undefined,
      batchId: 'batch-capital-call-northwind',
    };
  }),

  // 3 Q1 reporting docs — fund-level (not nominative → stay unitary).
  {
    name: `2026-Q1 - ${FUND_ATL.name} - Quarterly Report.pdf`,
    format: 'pdf', size: '2.4 MB', pathSegments: atlReportPath,
    createdBy: { name: 'Maxime Dubois', role: 'Asset Manager' },
    createdAt: '2026-04-28T09:42:00Z',
    targeting: [fund(FUND_ATL.name)],
    comment: { key: 'validation.fixtures.comment.quarterlyReport' },
    batchId: 'batch-quarterly-report-q1-atlas',
  },
  {
    name: `2026-Q1 - ${FUND_ATL.name} - NAV Statement.pdf`,
    format: 'pdf', size: '780 KB', pathSegments: atlReportPath,
    createdBy: { name: 'Maxime Dubois', role: 'Asset Manager' },
    createdAt: '2026-04-28T09:45:00Z',
    targeting: [fund(FUND_ATL.name)],
    batchId: 'batch-quarterly-report-q1-atlas',
  },
  {
    name: `2026-Q1 - ${FUND_ATL.name} - Portfolio KPIs.xlsx`,
    format: 'xlsx', size: '420 KB', pathSegments: atlReportPath,
    createdBy: { name: 'Maxime Dubois', role: 'Asset Manager' },
    createdAt: '2026-04-28T09:50:00Z',
    targeting: [fund(FUND_ATL.name)],
    batchId: 'batch-quarterly-report-q1-atlas',
  },

  // 1 SFDR disclosure — fund-level, own notification.
  {
    name: `${FUND_ATL.name} - SFDR Article 9 - 2025 Disclosure.pdf`,
    format: 'pdf', size: '1.2 MB',
    pathSegments: [FUND_ATL.name, 'Asset Documents', 'ESG & Impact Reports', '2025'],
    createdBy: { name: 'Mathilde Garcia', role: 'ESG Officer' },
    createdAt: '2026-04-22T13:15:00Z',
    targeting: [fund(FUND_ATL.name)],
    comment: { key: 'validation.fixtures.comment.esgPending' },
    kindKey: 'validation.fixtures.kind.esgDisclosure',
    notification: {
      channel: 'portal',
      subject: {
        key: 'validation.fixtures.sfdrDisclosure.subject',
        vars: { fund: FUND_ATL.name },
      },
      greeting: { key: 'validation.fixtures.sfdrDisclosure.greeting' },
      paragraphs: [
        { key: 'validation.fixtures.sfdrDisclosure.p1', vars: { fund: FUND_ATL.name } },
      ],
      signature: { key: 'validation.fixtures.sfdrDisclosure.signature' },
      recipients: [
        {
          name: {
            key: 'validation.fixtures.recipient.allLps',
            vars: { fund: FUND_ATL.name },
          },
          email: 'portal-lp@investhub.io',
          role: { key: 'validation.fixtures.role.lpPortal' },
        },
      ],
    },
  },

  // 1 distribution agreement — single nominative doc, no group.
  {
    name: `Distribution Agreement - ${LP_KENS.name} - 2026.docx`,
    format: 'docx', size: '210 KB',
    pathSegments: ['Marketing & Distribution', 'Distributors & Private Banks', 'Distribution Agreements', '2026', LP_KENS.name],
    createdBy: { name: 'Julien Moreau', role: 'Legal Counsel' },
    createdAt: '2026-04-15T15:20:00Z',
    targeting: [seg('Distributor'), inv(LP_KENS.name)],
    comment: { key: 'validation.fixtures.comment.distributorLegal' },
    batchId: 'batch-distribution-agreement-kensington',
  },

  // 1 nominative tax certificate — single doc, stays unitary.
  {
    name: `2025 - ${FUND_NW.name} - Tax Certificate - ${LP_HARTWOOD.name}.pdf`,
    format: 'pdf', size: '1.1 MB',
    pathSegments: taxPackPath(FUND_NW.name),
    createdBy: { name: 'Sophie Bernard', role: 'Tax Specialist' },
    createdAt: '2026-04-26T14:22:00Z',
    targeting: [
      fund(FUND_NW.name),
      inv(LP_HARTWOOD.name),
      sub(NW_HARTWOOD_SUB.subscriptionId),
      share(NW_HARTWOOD_SUB.shareClass),
    ],
    comment: { key: 'validation.fixtures.comment.taxNominative' },
    kindKey: 'validation.fixtures.kind.taxCertificate',
    notification: {
      channel: 'both',
      subject: {
        key: 'validation.fixtures.taxCertificate.subject',
        vars: { investor: LP_HARTWOOD.name, fund: FUND_NW.name },
      },
      greeting: { key: 'validation.fixtures.taxCertificate.greeting' },
      paragraphs: [
        { key: 'validation.fixtures.taxCertificate.p1', vars: { fund: FUND_NW.name } },
      ],
      signature: { key: 'validation.fixtures.taxCertificate.signature' },
      recipients: [
        {
          name: LP_HARTWOOD.name,
          email: LP_HARTWOOD.email,
          role: { key: 'validation.fixtures.role.investor' },
        },
      ],
    },
  },

  // 1 annual letter — fund-level.
  {
    name: `${FUND_NW.name} - Lettre semestrielle 2026.pdf`,
    format: 'pdf', size: '320 KB',
    pathSegments: [FUND_NW.name, 'Management Reports', '2026', 'H1'],
    createdBy: { name: 'Léa Marchand', role: 'IR Manager' },
    createdAt: '2026-04-24T16:00:00Z',
    targeting: [fund(FUND_NW.name)],
    kindKey: 'validation.fixtures.kind.annualReport',
    notification: {
      channel: 'email',
      subject: {
        key: 'validation.fixtures.quarterlyReport.subject',
        vars: { fund: FUND_NW.name },
      },
      greeting: { key: 'validation.fixtures.quarterlyReport.greeting' },
      paragraphs: [
        { key: 'validation.fixtures.quarterlyReport.p1', vars: { fund: FUND_NW.name } },
      ],
      signature: { key: 'validation.fixtures.quarterlyReport.signature' },
      recipients: [
        {
          name: {
            key: 'validation.fixtures.recipient.allLps',
            vars: { fund: FUND_NW.name },
          },
          email: 'lp-nwgc2@investhub.io',
          role: { key: 'validation.fixtures.role.distributionList' },
        },
      ],
    },
  },

  // ============================================================
  // STANDALONE SILENT (3 docs — 20% of the 15 unitary)
  // ============================================================
  {
    name: `${FUND_NW.name} - Pitch Deck Roadshow 2026 (DRAFT).pptx`,
    format: 'pptx', size: '4.8 MB',
    pathSegments: ['Marketing & Distribution', 'Distributors & Private Banks', 'Sales Toolkit'],
    createdBy: { name: 'Mathilde Garcia', role: 'Marketing Manager' },
    createdAt: '2026-04-20T11:30:00Z',
    targeting: [seg('Distributor')],
    kindKey: 'validation.fixtures.kind.marketing',
  },
  {
    name: 'Note interne - Politique de valorisation 2026.docx',
    format: 'docx', size: '88 KB',
    pathSegments: [FUND_ATL.name, 'Legal Documents', 'Internal Notes'],
    createdBy: { name: 'Julien Moreau', role: 'Legal Counsel' },
    createdAt: '2026-04-19T17:10:00Z',
    targeting: [fund(FUND_ATL.name)],
    kindKey: 'validation.fixtures.kind.legal',
  },
  {
    name: 'Audit working papers - NWGC2 Q1 2026.xlsx',
    format: 'xlsx', size: '512 KB',
    pathSegments: [FUND_NW.name, 'Legal Documents', 'Audit'],
    createdBy: { name: 'Hugo Petit', role: 'Compliance Officer' },
    createdAt: '2026-04-18T09:00:00Z',
    targeting: [fund(FUND_NW.name)],
    kindKey: 'validation.fixtures.kind.other',
  },

  // ============================================================
  // GROUPED DOCS — 15 docs across 5 dynamic groups
  // (same investor + same template → publication center groups them)
  // ============================================================

  // G1 — Pack fiscal 2025 — Aldebaran Pension Fund (3 docs)
  {
    name: `IFU 2025 - ${FUND_NW.name} - ${LP_ALDEBARAN.name}.pdf`,
    format: 'pdf', size: '420 KB',
    pathSegments: taxPackPath(FUND_NW.name),
    createdBy: { name: 'Sophie Bernard', role: 'Tax Specialist' },
    createdAt: '2026-04-29T10:11:00Z',
    targeting: [
      fund(FUND_NW.name),
      inv(LP_ALDEBARAN.name),
      sub(NW_ALDEBARAN_SUB.subscriptionId),
      share(NW_ALDEBARAN_SUB.shareClass),
    ],
    batchId: 'batch-tax-pack-aldebaran',
  },
  {
    name: `IFU 2025 - ${FUND_ATL.name} - ${LP_ALDEBARAN.name}.pdf`,
    format: 'pdf', size: '440 KB',
    pathSegments: taxPackPath(FUND_ATL.name),
    createdBy: { name: 'Sophie Bernard', role: 'Tax Specialist' },
    createdAt: '2026-04-29T10:12:00Z',
    targeting: [
      fund(FUND_ATL.name),
      inv(LP_ALDEBARAN.name),
      sub(ATL_ALDEBARAN_SUB.subscriptionId),
      share(ATL_ALDEBARAN_SUB.shareClass),
    ],
    batchId: 'batch-tax-pack-aldebaran',
  },
  {
    name: `Annexe fiscale 2025 - ${LP_ALDEBARAN.name}.pdf`,
    format: 'pdf', size: '180 KB',
    pathSegments: taxPackPath(FUND_NW.name),
    createdBy: { name: 'Sophie Bernard', role: 'Tax Specialist' },
    createdAt: '2026-04-29T10:13:00Z',
    targeting: [
      inv(LP_ALDEBARAN.name),
      sub(NW_ALDEBARAN_SUB.subscriptionId),
    ],
    batchId: 'batch-tax-pack-aldebaran',
  },

  // G2 — Pack fiscal 2025 — Brunswick Family Office (3 docs)
  {
    name: `IFU 2025 - ${FUND_NW.name} - ${LP_BRUNSWICK.name}.pdf`,
    format: 'pdf', size: '410 KB',
    pathSegments: taxPackPath(FUND_NW.name),
    createdBy: { name: 'Sophie Bernard', role: 'Tax Specialist' },
    createdAt: '2026-04-29T10:16:00Z',
    targeting: [
      fund(FUND_NW.name),
      inv(LP_BRUNSWICK.name),
      sub(NW_BRUNSWICK_SUB.subscriptionId),
      share(NW_BRUNSWICK_SUB.shareClass),
    ],
    batchId: 'batch-tax-pack-brunswick',
  },
  {
    name: `IFU 2025 - ${FUND_ATL.name} - ${LP_BRUNSWICK.name}.pdf`,
    format: 'pdf', size: '430 KB',
    pathSegments: taxPackPath(FUND_ATL.name),
    createdBy: { name: 'Sophie Bernard', role: 'Tax Specialist' },
    createdAt: '2026-04-29T10:17:00Z',
    targeting: [
      fund(FUND_ATL.name),
      inv(LP_BRUNSWICK.name),
      sub(ATL_BRUNSWICK_SUB.subscriptionId),
      share(ATL_BRUNSWICK_SUB.shareClass),
    ],
    batchId: 'batch-tax-pack-brunswick',
  },
  {
    name: `Annexe fiscale 2025 - ${LP_BRUNSWICK.name}.pdf`,
    format: 'pdf', size: '175 KB',
    pathSegments: taxPackPath(FUND_NW.name),
    createdBy: { name: 'Sophie Bernard', role: 'Tax Specialist' },
    createdAt: '2026-04-29T10:18:00Z',
    targeting: [
      inv(LP_BRUNSWICK.name),
      sub(NW_BRUNSWICK_SUB.subscriptionId),
    ],
    batchId: 'batch-tax-pack-brunswick',
  },

  // G3 — Pack fiscal 2025 — Greycliff Wealth Partners (3 docs)
  {
    name: `IFU 2025 - ${FUND_NW.name} - ${LP_GREYCLIFF.name}.pdf`,
    format: 'pdf', size: '405 KB',
    pathSegments: taxPackPath(FUND_NW.name),
    createdBy: { name: 'Sophie Bernard', role: 'Tax Specialist' },
    createdAt: '2026-04-29T10:21:00Z',
    targeting: [
      fund(FUND_NW.name),
      inv(LP_GREYCLIFF.name),
      sub(NW_GREYCLIFF_SUB.subscriptionId),
      share(NW_GREYCLIFF_SUB.shareClass),
    ],
    batchId: 'batch-tax-pack-greycliff',
  },
  {
    name: `IFU 2025 - ${FUND_ATL.name} - ${LP_GREYCLIFF.name}.pdf`,
    format: 'pdf', size: '425 KB',
    pathSegments: taxPackPath(FUND_ATL.name),
    createdBy: { name: 'Sophie Bernard', role: 'Tax Specialist' },
    createdAt: '2026-04-29T10:22:00Z',
    targeting: [
      fund(FUND_ATL.name),
      inv(LP_GREYCLIFF.name),
      sub(ATL_GREYCLIFF_SUB.subscriptionId),
      share(ATL_GREYCLIFF_SUB.shareClass),
    ],
    batchId: 'batch-tax-pack-greycliff',
  },
  {
    name: `Cerfa 2561-bis 2025 - ${LP_GREYCLIFF.name}.pdf`,
    format: 'pdf', size: '95 KB',
    pathSegments: taxPackPath(FUND_NW.name),
    createdBy: { name: 'Sophie Bernard', role: 'Tax Specialist' },
    createdAt: '2026-04-29T10:23:00Z',
    targeting: [
      inv(LP_GREYCLIFF.name),
      sub(NW_GREYCLIFF_SUB.subscriptionId),
    ],
    batchId: 'batch-tax-pack-greycliff',
  },

  // G4 — Souscription 2026 — Norwood Pension Trust (3 docs)
  {
    name: `Bulletin de souscription - ${FUND_NW.name} - ${LP_NORWOOD.name}.pdf`,
    format: 'pdf', size: '260 KB',
    pathSegments: subscriptionPath(FUND_NW.name),
    createdBy: { name: 'Julien Moreau', role: 'Legal Counsel' },
    createdAt: '2026-04-25T08:31:00Z',
    targeting: [
      fund(FUND_NW.name),
      inv(LP_NORWOOD.name),
      sub(NW_NORWOOD_SUB.subscriptionId),
      share(NW_NORWOOD_SUB.shareClass),
    ],
    batchId: 'batch-subscription-pack-norwood',
  },
  {
    name: `Bulletin de souscription - ${FUND_ATL.name} - ${LP_NORWOOD.name}.pdf`,
    format: 'pdf', size: '275 KB',
    pathSegments: subscriptionPath(FUND_ATL.name),
    createdBy: { name: 'Julien Moreau', role: 'Legal Counsel' },
    createdAt: '2026-04-25T08:32:00Z',
    targeting: [
      fund(FUND_ATL.name),
      inv(LP_NORWOOD.name),
      sub(ATL_NORWOOD_SUB.subscriptionId),
      share(ATL_NORWOOD_SUB.shareClass),
    ],
    batchId: 'batch-subscription-pack-norwood',
  },
  {
    name: `Pack KYC 2026 - ${LP_NORWOOD.name}.pdf`,
    format: 'pdf', size: '1.4 MB',
    pathSegments: subscriptionPath(FUND_NW.name),
    createdBy: { name: 'Julien Moreau', role: 'Legal Counsel' },
    createdAt: '2026-04-25T08:33:00Z',
    targeting: [
      inv(LP_NORWOOD.name),
      sub(NW_NORWOOD_SUB.subscriptionId),
    ],
    batchId: 'batch-subscription-pack-norwood',
  },

  // G5 — Relevés Q1 2026 — Camberwell Allocators (3 docs)
  {
    name: `Relevé de compte Q1 2026 - ${FUND_NW.name} - ${LP_CAMBERWELL.name}.pdf`,
    format: 'pdf', size: '210 KB',
    pathSegments: [FUND_NW.name, 'Management Reports', '2026', 'Q1', LP_CAMBERWELL.name],
    createdBy: { name: 'Maxime Dubois', role: 'Asset Manager' },
    createdAt: '2026-04-28T11:01:00Z',
    targeting: [
      fund(FUND_NW.name),
      inv(LP_CAMBERWELL.name),
      sub(NW_CAMBERWELL_SUB.subscriptionId),
      share(NW_CAMBERWELL_SUB.shareClass),
    ],
    batchId: 'batch-statement-camberwell',
  },
  {
    name: `Allocation LP Q1 2026 - ${LP_CAMBERWELL.name}.pdf`,
    format: 'pdf', size: '195 KB',
    pathSegments: [FUND_NW.name, 'Management Reports', '2026', 'Q1', LP_CAMBERWELL.name],
    createdBy: { name: 'Maxime Dubois', role: 'Asset Manager' },
    createdAt: '2026-04-28T11:02:00Z',
    targeting: [
      inv(LP_CAMBERWELL.name),
      sub(NW_CAMBERWELL_SUB.subscriptionId),
    ],
    batchId: 'batch-statement-camberwell',
  },
  {
    name: `Performance attribution Q1 2026 - ${LP_CAMBERWELL.name}.xlsx`,
    format: 'xlsx', size: '120 KB',
    pathSegments: [FUND_NW.name, 'Management Reports', '2026', 'Q1', LP_CAMBERWELL.name],
    createdBy: { name: 'Maxime Dubois', role: 'Asset Manager' },
    createdAt: '2026-04-28T11:03:00Z',
    targeting: [
      inv(LP_CAMBERWELL.name),
      sub(NW_CAMBERWELL_SUB.subscriptionId),
    ],
    batchId: 'batch-statement-camberwell',
  },
];

const VALIDATED: Omit<ValidationDocument, 'id' | 'status'>[] = [
  {
    name: `${FUND_ATL.name} - Annual Letter 2025.pdf`,
    format: 'pdf', size: '1.3 MB',
    pathSegments: [FUND_ATL.name, 'Management Reports', '2025', 'Q4 / Annual'],
    createdBy: { name: 'Léa Marchand', role: 'IR Manager' },
    createdAt: '2026-03-12T10:00:00Z',
    targeting: [fund(FUND_ATL.name)],
    reviewedBy: 'Hugo Petit',
    reviewedAt: '2026-03-15T09:30:00Z',
  },
  {
    name: 'Roadshow 2026 - Master Presentation.pptx',
    format: 'pptx', size: '5.2 MB',
    pathSegments: ['Marketing & Distribution', 'Distributors & Private Banks', 'Roadshow 2026'],
    createdBy: { name: 'Antoine Leblanc', role: 'Distribution Lead' },
    createdAt: '2026-04-10T09:15:00Z',
    targeting: [seg('Distributor')],
    comment: { key: 'validation.fixtures.comment.roadshowApproved' },
    reviewedBy: 'Sophie Bernard',
    reviewedAt: '2026-04-11T16:42:00Z',
  },
];

const REJECTED: Omit<ValidationDocument, 'id' | 'status'>[] = [
  {
    name: `${FUND_NW.name} - Marketing Pitch Deck (DRAFT).pptx`,
    format: 'pptx', size: '4.6 MB',
    pathSegments: ['Marketing & Distribution', 'Distributors & Private Banks', 'Sales Toolkit'],
    createdBy: { name: 'Mathilde Garcia', role: 'Marketing Manager' },
    createdAt: '2026-04-20T11:30:00Z',
    targeting: [seg('Distributor')],
    comment: { key: 'validation.fixtures.comment.pitchRejected' },
    reviewedBy: 'Hugo Petit',
    reviewedAt: '2026-04-21T10:05:00Z',
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
