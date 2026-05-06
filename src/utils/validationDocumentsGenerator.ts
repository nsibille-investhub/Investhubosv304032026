// Pending-validation test data — wired on top of the unified gedFixtures
// universe so the funds / investors / share classes match the DataRoom and
// the Bird View. Default language: English.

import { findFund, findInvestor } from './gedFixtures';

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
  greeting: string;
  paragraphs: string[];
  signature: string;
  recipients: NotificationRecipient[];
}

export interface ValidationBatch {
  id: string;
  name: string;
  kind: string;
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
  comment: string;
  status: ValidationStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  batchId?: string;
  notification?: ValidationNotification;
}

const seg = (label: string): TargetingTag => ({ kind: 'segment', label });
const fundTag = (label: string): TargetingTag => ({ kind: 'fund', label });
const share = (label: string): TargetingTag => ({ kind: 'shareClass', label });
const inv = (label: string): TargetingTag => ({ kind: 'investor', label });
const sub = (label: string): TargetingTag => ({ kind: 'subscription', label });
const aud = (label: string): TargetingTag => ({ kind: 'audience', label });

const FUND_NW   = findFund('NWGC2')!;   // Northwind Growth Capital II
const FUND_HEL  = findFund('HBF3')!;    // Helios Buyout Fund III
const FUND_ATL  = findFund('AIP1')!;    // Atlas Infrastructure Partners I
const FUND_LUM  = findFund('LVF4')!;    // Lumen Venture Fund IV
const FUND_POL  = findFund('PCTF')!;    // Polaris Climate Tech Fund
const FUND_AUR  = findFund('AHV')!;     // Aurora Healthcare Ventures
const FUND_VES  = findFund('VS3')!;     // Vesta Secondaries III

const LP_BRUNSWICK = findInvestor('INV-002')!; // Brunswick Family Office
const LP_DUNMORE   = findInvestor('INV-004')!; // Dunmore Sovereign
const LP_ALDEBARAN = findInvestor('INV-001')!; // Aldebaran Pension Fund
const LP_KENS      = findInvestor('INV-011')!; // Kensington Private Bank

/* --------------------------------------------------------------------- */
/* Batches                                                               */
/* --------------------------------------------------------------------- */

const BATCHES: ValidationBatch[] = [
  {
    id: 'batch-capital-call-helios-q2',
    name: `Capital Call #08 — ${FUND_HEL.name}`,
    kind: 'Capital Call',
    createdAt: '2026-04-27T11:15:00Z',
    createdBy: { name: 'Antoine Leblanc', role: 'Fund Accountant' },
    notification: {
      channel: 'both',
      subject: `Capital Call notice #08 — ${FUND_HEL.name} (due 22 May 2026)`,
      greeting: 'Dear Limited Partner,',
      paragraphs: [
        `In connection with your commitment to **${FUND_HEL.name}**, please find attached drawdown notice #08 for an aggregate amount of **EUR 18,500,000** (your pro-rata share is detailed in the LP allocation schedule).`,
        'Funds must be wired to the depositary account before **22 May 2026, 12:00 CET**.',
        'For any question please contact your dedicated Investor Relations representative.',
      ],
      signature: 'Investor Relations — InvestHub',
      recipients: [
        { name: LP_ALDEBARAN.name, email: LP_ALDEBARAN.email, role: 'Investor' },
        { name: LP_BRUNSWICK.name, email: LP_BRUNSWICK.email, role: 'Investor' },
        { name: LP_DUNMORE.name,   email: LP_DUNMORE.email,   role: 'Investor' },
      ],
    },
  },
  {
    id: 'batch-quarterly-report-q1-northwind',
    name: `Q1 2026 Reporting — ${FUND_NW.name}`,
    kind: 'Quarterly Reporting',
    createdAt: '2026-04-28T09:42:00Z',
    createdBy: { name: 'Camille Renard', role: 'Asset Manager' },
    notification: {
      channel: 'email',
      subject: `Q1 2026 Reporting Pack — ${FUND_NW.name}`,
      greeting: 'Dear Investor,',
      paragraphs: [
        `Please find enclosed the **Q1 2026 Reporting Pack** for ${FUND_NW.name}: quarterly report, NAV statement at 31/03/2026 and detailed portfolio KPIs.`,
        'New investments closed during the quarter (3) and exit pipeline updates are summarised in the manager letter.',
      ],
      signature: 'Camille Renard — Asset Manager',
      recipients: [
        { name: 'All LPs Northwind Growth Capital II', email: 'lp-nwgc2@investhub.io', role: 'Distribution list' },
      ],
    },
  },
  {
    id: 'batch-annual-letter-2025-atlas',
    name: `Annual Letter 2025 — ${FUND_ATL.name}`,
    kind: 'LP Communication',
    createdAt: '2026-03-12T10:00:00Z',
    createdBy: { name: 'Léa Marchand', role: 'IR Manager' },
    notification: {
      channel: 'portal',
      subject: `Annual Letter 2025 and ESG Report — ${FUND_ATL.name}`,
      greeting: 'Dear LPs,',
      paragraphs: [
        '2025 was marked by a **net IRR of 14.8%**, the closing of two greenfield assets (Bluewater Port Terminal and Verdant Wind Cluster) and the successful refinancing of Aerolinea Toll Road.',
        'The Annual Letter and the SFDR Article 9 disclosure have been published on the LP Portal.',
      ],
      signature: 'Léa Marchand — Investor Relations',
      recipients: [
        { name: `All LPs ${FUND_ATL.name}`, email: 'portal-lp@investhub.io', role: 'LP Portal' },
      ],
    },
  },
  {
    id: 'batch-distribution-agreement-kensington',
    name: `2026 Distribution Agreement — ${LP_KENS.name}`,
    kind: 'Distributor Agreement (internal)',
    createdAt: '2026-04-15T15:20:00Z',
    createdBy: { name: 'Julien Moreau', role: 'Legal Counsel' },
    // No notification — purely internal validation, document remains on the BO portal
  },
];

/* --------------------------------------------------------------------- */
/* Documents                                                             */
/* --------------------------------------------------------------------- */

const PENDING: Omit<ValidationDocument, 'id' | 'status'>[] = [
  // ── Capital Call batch — Helios Buyout Fund III (3 docs)
  {
    name: `${FUND_HEL.name} - Capital Call Notice #08.pdf`,
    format: 'pdf',
    size: '312 KB',
    pathSegments: [FUND_HEL.name, 'Capital Calls', '2026', '2026-05-12 - Drawdown #08'],
    createdBy: { name: 'Antoine Leblanc', role: 'Fund Accountant' },
    createdAt: '2026-04-27T11:15:00Z',
    targeting: [fundTag(FUND_HEL.name), share('Class A')],
    comment: 'EUR 18.5M aggregate — to be approved before LP dispatch.',
    batchId: 'batch-capital-call-helios-q2',
  },
  {
    name: `${FUND_HEL.name} - Wire Instructions.pdf`,
    format: 'pdf',
    size: '128 KB',
    pathSegments: [FUND_HEL.name, 'Capital Calls', '2026', '2026-05-12 - Drawdown #08'],
    createdBy: { name: 'Antoine Leblanc', role: 'Fund Accountant' },
    createdAt: '2026-04-27T11:18:00Z',
    targeting: [fundTag(FUND_HEL.name)],
    comment: '',
    batchId: 'batch-capital-call-helios-q2',
  },
  {
    name: `${FUND_HEL.name} - LP Allocation Schedule #08.xlsx`,
    format: 'xlsx',
    size: '92 KB',
    pathSegments: [FUND_HEL.name, 'Capital Calls', '2026', '2026-05-12 - Drawdown #08'],
    createdBy: { name: 'Antoine Leblanc', role: 'Fund Accountant' },
    createdAt: '2026-04-27T11:20:00Z',
    targeting: [fundTag(FUND_HEL.name)],
    comment: 'Double-check Aldebaran Pension Fund pro-rata before dispatch.',
    batchId: 'batch-capital-call-helios-q2',
  },

  // ── Q1 reporting batch — Northwind Growth Capital II (3 docs)
  {
    name: `2026-Q1 - ${FUND_NW.name} - Quarterly Report.pdf`,
    format: 'pdf',
    size: '2.4 MB',
    pathSegments: [FUND_NW.name, 'Management Reports', '2026', 'Q1'],
    createdBy: { name: 'Camille Renard', role: 'Asset Manager' },
    createdAt: '2026-04-28T09:42:00Z',
    targeting: [fundTag(FUND_NW.name), share('Class A')],
    comment: 'Reporting Q1 ready for dispatch — to validate before LP Portal publication.',
    batchId: 'batch-quarterly-report-q1-northwind',
  },
  {
    name: `2026-Q1 - ${FUND_NW.name} - NAV Statement.pdf`,
    format: 'pdf',
    size: '780 KB',
    pathSegments: [FUND_NW.name, 'Management Reports', '2026', 'Q1'],
    createdBy: { name: 'Camille Renard', role: 'Asset Manager' },
    createdAt: '2026-04-28T09:45:00Z',
    targeting: [fundTag(FUND_NW.name)],
    comment: '',
    batchId: 'batch-quarterly-report-q1-northwind',
  },
  {
    name: `2026-Q1 - ${FUND_NW.name} - Portfolio KPIs.xlsx`,
    format: 'xlsx',
    size: '420 KB',
    pathSegments: [FUND_NW.name, 'Management Reports', '2026', 'Q1'],
    createdBy: { name: 'Camille Renard', role: 'Asset Manager' },
    createdAt: '2026-04-28T09:50:00Z',
    targeting: [fundTag(FUND_NW.name)],
    comment: '',
    batchId: 'batch-quarterly-report-q1-northwind',
  },

  // ── Silent batch — Kensington distribution agreement (2 docs)
  {
    name: `Distribution Agreement - ${LP_KENS.name} - 2026.docx`,
    format: 'docx',
    size: '210 KB',
    pathSegments: ['Marketing & Distribution', 'Distributors & Private Banks', 'Distribution Agreements', '2026', LP_KENS.name],
    createdBy: { name: 'Julien Moreau', role: 'Legal Counsel' },
    createdAt: '2026-04-15T15:20:00Z',
    targeting: [seg('Distributor'), inv(LP_KENS.name)],
    comment: 'Legal review pending before signature.',
    batchId: 'batch-distribution-agreement-kensington',
  },
  {
    name: `Retrocession Grid - ${LP_KENS.name} - 2026.xlsx`,
    format: 'xlsx',
    size: '88 KB',
    pathSegments: ['Marketing & Distribution', 'Distributors & Private Banks', 'Distribution Agreements', '2026', LP_KENS.name],
    createdBy: { name: 'Julien Moreau', role: 'Legal Counsel' },
    createdAt: '2026-04-15T15:24:00Z',
    targeting: [seg('Distributor'), inv(LP_KENS.name)],
    comment: '',
    batchId: 'batch-distribution-agreement-kensington',
  },

  // ── Standalone documents
  {
    name: `${FUND_LUM.name} - April 2026 LP Newsletter.docx`,
    format: 'docx',
    size: '480 KB',
    pathSegments: [FUND_LUM.name, 'Other Communications', 'Misc'],
    createdBy: { name: 'Léa Marchand', role: 'IR Manager' },
    createdAt: '2026-04-27T16:08:00Z',
    targeting: [aud('All segments'), fundTag(FUND_LUM.name)],
    comment: 'Legal review needed on the “market risks” paragraph.',
    notification: {
      channel: 'email',
      subject: `${FUND_LUM.name} — April 2026 LP Newsletter`,
      greeting: 'Dear Investors,',
      paragraphs: [
        `Please find attached the **April 2026 newsletter** for ${FUND_LUM.name} with a focus on H2 2026 deployment plans.`,
      ],
      signature: 'Léa Marchand — Investor Relations',
      recipients: [
        { name: 'HNWI distribution list',         email: 'lp-hnwi@investhub.io',  role: 'Distribution list' },
        { name: 'Institutional distribution list', email: 'lp-instit@investhub.io', role: 'Distribution list' },
      ],
    },
  },
  {
    name: `Tax Annexes 2025 - ${LP_BRUNSWICK.name}.pdf`,
    format: 'pdf',
    size: '1.1 MB',
    pathSegments: [FUND_NW.name, 'Financial Documents', '2025', 'Tax'],
    createdBy: { name: 'Sophie Bernard', role: 'Tax Specialist' },
    createdAt: '2026-04-26T14:22:00Z',
    targeting: [inv(LP_BRUNSWICK.name), fundTag(FUND_NW.name), sub('SUB-2024-0012')],
    comment: 'Nominative document — verify recipient identity.',
    notification: {
      channel: 'both',
      subject: `Tax Annexes 2025 — ${LP_BRUNSWICK.name}`,
      greeting: 'Dear Sir or Madam,',
      paragraphs: [
        'Please find enclosed your **2025 tax annexes** as well as the corresponding tax certificates.',
      ],
      signature: 'Sophie Bernard — Tax Specialist',
      recipients: [
        { name: LP_BRUNSWICK.name, email: LP_BRUNSWICK.email, role: 'Investor' },
      ],
    },
  },
  {
    name: `${FUND_AUR.name} - Co-Investment Term Sheet (Project Aurora).pdf`,
    format: 'pdf',
    size: '890 KB',
    pathSegments: ['Marketing & Distribution', 'Family Offices & UHNWI', 'Co-Investment Opportunities'],
    createdBy: { name: 'Maxime Dubois', role: 'Investment Director' },
    createdAt: '2026-04-25T08:30:00Z',
    targeting: [seg('UHNWI'), seg('Institutional'), fundTag(FUND_AUR.name)],
    comment: 'Version 3 — incorporates Investment Committee comments.',
    notification: {
      channel: 'email',
      subject: `Co-Investment Opportunity — Project Aurora (${FUND_AUR.name})`,
      greeting: 'Dear Partners,',
      paragraphs: [
        `Please find enclosed the **term sheet** for the Project Aurora co-investment alongside ${FUND_AUR.name} (closing targeted Q3 2026).`,
      ],
      signature: 'Maxime Dubois — Investment Director',
      recipients: [
        { name: 'Selected UHNWI LPs',     email: 'select-uhnwi@investhub.io',   role: 'Restricted list' },
        { name: 'Institutional investors', email: 'institutional@investhub.io', role: 'Restricted list' },
      ],
    },
  },
  {
    name: `${FUND_VES.name} - Secondary Opportunity Memo (Project Bluefin).pdf`,
    format: 'pdf',
    size: '1.7 MB',
    pathSegments: [FUND_VES.name, 'Asset Documents', 'Deal Memos & Investment Committee'],
    createdBy: { name: 'Olivier Lambert', role: 'Performance Analyst' },
    createdAt: '2026-04-24T17:50:00Z',
    targeting: [fundTag(FUND_VES.name), aud('Multi-fund')],
    comment: 'Pricing assumptions to be cross-checked with middle-office before circulation.',
    // No notification — internal use, posted to the middle-office portal once approved
  },
  {
    name: `${FUND_POL.name} - SFDR Article 9 - 2025 Disclosure.pdf`,
    format: 'pdf',
    size: '1.2 MB',
    pathSegments: [FUND_POL.name, 'Asset Documents', 'ESG & Impact Reports', '2025'],
    createdBy: { name: 'Mathilde Garcia', role: 'ESG Officer' },
    createdAt: '2026-04-22T13:15:00Z',
    targeting: [fundTag(FUND_POL.name), aud('All segments')],
    comment: 'Awaiting confirmation of the carbon footprint figures by external auditor.',
    notification: {
      channel: 'portal',
      subject: `${FUND_POL.name} — SFDR Article 9 Disclosure 2025`,
      greeting: 'Dear LPs,',
      paragraphs: [
        `Our SFDR Article 9 disclosure for ${FUND_POL.name} is now available on the LP Portal alongside the 2025 ESG report.`,
      ],
      signature: 'Mathilde Garcia — ESG Officer',
      recipients: [
        { name: `All LPs ${FUND_POL.name}`, email: 'portal-lp@investhub.io', role: 'LP Portal' },
      ],
    },
  },
];

const VALIDATED: Omit<ValidationDocument, 'id' | 'status'>[] = [
  // ── Annual letter batch — Atlas Infrastructure Partners I (2 docs)
  {
    name: `${FUND_ATL.name} - Annual Letter 2025.pdf`,
    format: 'pdf',
    size: '1.3 MB',
    pathSegments: [FUND_ATL.name, 'Management Reports', '2025', 'Q4 / Annual'],
    createdBy: { name: 'Léa Marchand', role: 'IR Manager' },
    createdAt: '2026-03-12T10:00:00Z',
    targeting: [aud('All segments'), fundTag(FUND_ATL.name)],
    comment: '',
    reviewedBy: 'Hugo Petit',
    reviewedAt: '2026-03-15T09:30:00Z',
    batchId: 'batch-annual-letter-2025-atlas',
  },
  {
    name: `${FUND_ATL.name} - ESG Annual Report 2025.pdf`,
    format: 'pdf',
    size: '4.2 MB',
    pathSegments: [FUND_ATL.name, 'Asset Documents', 'ESG & Impact Reports', '2025'],
    createdBy: { name: 'Léa Marchand', role: 'IR Manager' },
    createdAt: '2026-03-12T10:08:00Z',
    targeting: [aud('All segments'), fundTag(FUND_ATL.name)],
    comment: 'Approved by the independent ESG committee.',
    reviewedBy: 'Hugo Petit',
    reviewedAt: '2026-03-15T09:30:00Z',
    batchId: 'batch-annual-letter-2025-atlas',
  },

  // ── Validated standalone docs
  {
    name: 'Market Note — Private Equity Trends 2026.pdf',
    format: 'pdf',
    size: '720 KB',
    pathSegments: ['Marketing & Distribution', 'Institutional Investors', 'Track Record'],
    createdBy: { name: 'Léa Marchand', role: 'IR Manager' },
    createdAt: '2026-02-20T14:00:00Z',
    targeting: [aud('All segments')],
    comment: '',
    reviewedBy: 'Hugo Petit',
    reviewedAt: '2026-02-21T11:18:00Z',
    notification: {
      channel: 'portal',
      subject: 'Market Note — Private Equity Trends 2026',
      greeting: 'Dear Investors,',
      paragraphs: [
        'Our latest **market note** is now available on your LP Portal.',
      ],
      signature: 'Léa Marchand — Investor Relations',
      recipients: [
        { name: 'All InvestHub LPs', email: 'portal-lp@investhub.io', role: 'LP Portal' },
      ],
    },
  },
  {
    name: 'Roadshow 2026 - Master Presentation.pptx',
    format: 'pptx',
    size: '5.2 MB',
    pathSegments: ['Marketing & Distribution', 'Distributors & Private Banks', 'Roadshow 2026'],
    createdBy: { name: 'Antoine Leblanc', role: 'Distribution Lead' },
    createdAt: '2026-04-10T09:15:00Z',
    targeting: [seg('Distributor'), aud('Multi-fund')],
    comment: 'Approved with minor edits on slides 12 to 14.',
    reviewedBy: 'Sophie Bernard',
    reviewedAt: '2026-04-11T16:42:00Z',
  },
];

const REJECTED: Omit<ValidationDocument, 'id' | 'status'>[] = [
  {
    name: `${FUND_LUM.name} - Marketing Pitch Deck (DRAFT).pptx`,
    format: 'pptx',
    size: '4.6 MB',
    pathSegments: ['Marketing & Distribution', 'Distributors & Private Banks', 'Sales Toolkit'],
    createdBy: { name: 'Mathilde Garcia', role: 'Marketing Manager' },
    createdAt: '2026-04-20T11:30:00Z',
    targeting: [seg('Distributor'), seg('HNWI')],
    comment: 'Rejected: promotional language not compliant with AMF guidelines — to be reworded.',
    reviewedBy: 'Hugo Petit',
    reviewedAt: '2026-04-21T10:05:00Z',
    notification: {
      channel: 'email',
      subject: `[Rejected] ${FUND_LUM.name} — Marketing Pitch Deck`,
      greeting: 'Dear Partners,',
      paragraphs: [
        `Discover our latest investment opportunity: **${FUND_LUM.name}** — please find enclosed our pitch deck.`,
      ],
      signature: 'Mathilde Garcia — Marketing Manager',
      recipients: [
        { name: 'Retail distributor network', email: 'retail-network@investhub.io', role: 'Distributors' },
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
