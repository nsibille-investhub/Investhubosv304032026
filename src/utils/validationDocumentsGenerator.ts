// Pending-validation test data — wired on top of the unified gedFixtures
// universe. Each document carries deterministic targeting tags that match
// the document's nature.

import { commitmentsForFund, findFund, findInvestor } from './gedFixtures';

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

const LP_BRUNSWICK = findInvestor('INV-002')!;
const LP_KENS      = findInvestor('INV-011')!;

const NW_BRUNSWICK_SUB = NW_COMMITMENTS.find((c) => c.investorId === LP_BRUNSWICK.id)!;

/* --------------------------------------------------------------------- */
/* Batches                                                               */
/* --------------------------------------------------------------------- */

const NW_DRAWDOWN_DATE = '2026-05-12';
const NW_DRAWDOWN_NUM = 19;

const BATCHES: ValidationBatch[] = [
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
  {
    id: 'batch-distribution-agreement-kensington',
    name: `2026 Distribution Agreement — ${LP_KENS.name}`,
    kindKey: 'validation.fixtures.kind.distributorAgreement',
    createdAt: '2026-04-15T15:20:00Z',
    createdBy: { name: 'Julien Moreau', role: 'Legal Counsel' },
  },
];

/* --------------------------------------------------------------------- */
/* Documents                                                             */
/* --------------------------------------------------------------------- */

const nwCallPath = [FUND_NW.name, 'Capital Calls', '2026', `${NW_DRAWDOWN_DATE} - Drawdown #${NW_DRAWDOWN_NUM}`];
const atlReportPath = [FUND_ATL.name, 'Management Reports', '2026', 'Q1'];

const PENDING: Omit<ValidationDocument, 'id' | 'status'>[] = [
  // ── Capital Call batch — Northwind Growth Capital II
  // Capital call notices are inherently nominative: one per LP of the fund.
  ...NW_COMMITMENTS.map((c, i) => {
    const investor = findInvestor(c.investorId)!;
    const minute = String(15 + i).padStart(2, '0');
    return {
      name: `${NW_DRAWDOWN_DATE} - ${FUND_NW.name} - Capital Call #${NW_DRAWDOWN_NUM} - ${investor.name} (${c.subscriptionId}).pdf`,
      format: 'pdf' as const,
      size: '180 KB',
      pathSegments: nwCallPath,
      createdBy: { name: 'Antoine Leblanc', role: 'Fund Accountant' },
      createdAt: `2026-04-27T11:${minute}:00Z`,
      targeting: [fund(FUND_NW.name), inv(investor.name), sub(c.subscriptionId), share(c.shareClass)],
      comment:
        i === 0
          ? {
              key: 'validation.fixtures.comment.capitalCall',
              vars: { count: NW_COMMITMENTS.length },
            }
          : undefined,
      batchId: 'batch-capital-call-northwind',
    };
  }),

  // ── Q1 reporting batch — Atlas (3 fund-level docs)
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

  // ── Silent batch — Kensington distribution agreement
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
  {
    name: `Retrocession Grid - ${LP_KENS.name} - 2026.xlsx`,
    format: 'xlsx', size: '88 KB',
    pathSegments: ['Marketing & Distribution', 'Distributors & Private Banks', 'Distribution Agreements', '2026', LP_KENS.name],
    createdBy: { name: 'Julien Moreau', role: 'Legal Counsel' },
    createdAt: '2026-04-15T15:24:00Z',
    targeting: [seg('Distributor'), inv(LP_KENS.name)],
    batchId: 'batch-distribution-agreement-kensington',
  },

  // ── Standalone documents
  {
    name: `2025 - ${FUND_NW.name} - Tax Certificate - ${LP_BRUNSWICK.name}.pdf`,
    format: 'pdf', size: '1.1 MB',
    pathSegments: [FUND_NW.name, 'Other Communications', 'Tax Certificates 2025'],
    createdBy: { name: 'Sophie Bernard', role: 'Tax Specialist' },
    createdAt: '2026-04-26T14:22:00Z',
    targeting: [
      fund(FUND_NW.name),
      inv(LP_BRUNSWICK.name),
      sub(NW_BRUNSWICK_SUB.subscriptionId),
      share(NW_BRUNSWICK_SUB.shareClass),
    ],
    comment: { key: 'validation.fixtures.comment.taxNominative' },
    kindKey: 'validation.fixtures.kind.taxCertificate',
    notification: {
      channel: 'both',
      subject: {
        key: 'validation.fixtures.taxCertificate.subject',
        vars: { investor: LP_BRUNSWICK.name, fund: FUND_NW.name },
      },
      greeting: { key: 'validation.fixtures.taxCertificate.greeting' },
      paragraphs: [
        {
          key: 'validation.fixtures.taxCertificate.p1',
          vars: { fund: FUND_NW.name },
        },
      ],
      signature: { key: 'validation.fixtures.taxCertificate.signature' },
      recipients: [
        {
          name: LP_BRUNSWICK.name,
          email: LP_BRUNSWICK.email,
          role: { key: 'validation.fixtures.role.investor' },
        },
      ],
    },
  },
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
        {
          key: 'validation.fixtures.sfdrDisclosure.p1',
          vars: { fund: FUND_ATL.name },
        },
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
