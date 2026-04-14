// Générateur de données réalistes pour Bird View - Private Equity

export interface DataRoomDocument {
  id: string;
  name: string;
  format: 'pdf' | 'docx' | 'xlsx' | 'pptx';
  size: string;
  date: string;
  isNominatif: boolean;
  stats: {
    sent: number;
    opened: number;
    viewed: number;
    downloaded: number;
  };
  engagement: {
    viewedBy: number;
    totalViewers: number;
  };
  // Nominatif : rattaché à un investisseur ou une souscription
  investorRestriction?: string;
  subscriptionRestriction?: string;
  // Générique : ciblage fonds ou segment (ou rien)
  fundRestriction?: string;
  segmentRestrictions?: string[];
}

export interface DataRoomFolder {
  id: string;
  name: string;
  children: (DataRoomFolder | DataRoomDocument)[];
  fundRestriction?: string;
  shareClassRestriction?: string;
  segmentRestrictions?: string[];
}

export interface DataRoomSpace {
  id: string;
  name: string;
  fundRestriction?: string;
  segmentRestrictions?: string[];
  folders: DataRoomFolder[];
}

const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const randomSize = () => {
  const sizes = [
    () => `${(Math.random() * 2 + 0.1).toFixed(1)} MB`,
    () => `${(Math.random() * 10 + 2).toFixed(1)} MB`,
    () => `${(Math.random() * 50 + 10).toFixed(1)} MB`,
  ];
  return sizes[Math.floor(Math.random() * sizes.length)]();
};

const randomStats = () => ({
  sent: Math.floor(Math.random() * 20),
  opened: Math.floor(Math.random() * 15),
  viewed: Math.floor(Math.random() * 12),
  downloaded: Math.floor(Math.random() * 8),
});

const randomEngagement = () => {
  const totalViewers = Math.floor(Math.random() * 8) + 5;
  const isFullEngagement = Math.random() < 0.8;
  const viewedBy = isFullEngagement
    ? totalViewers
    : Math.floor(Math.random() * totalViewers);
  return { viewedBy, totalViewers };
};

let docCounter = 0;
let folderCounter = 0;

// Investisseurs réalistes
const INVESTORS = [
  'Jean Dault', 'Sophie Martin', 'ARDIAN SA', 'BPI France', 'Marc Lefèvre',
  'Natixis Investment', 'Pierre Durand', 'Isabelle Moreau', 'Axa Invest',
  'Laurent Bernard', 'Crédit Agricole PE', 'Catherine Petit',
];

// Souscriptions réalistes
const SUBSCRIPTIONS = [
  'SOSC-2024-001', 'SOSC-2024-002', 'SOSC-2024-003', 'SOSC-2024-004',
  'SOSC-2024-005', 'SOSC-2024-006', 'SOSC-2024-007', 'SOSC-2024-008',
  'SOSC-2023-012', 'SOSC-2023-015', 'SOSC-2023-018',
];

const FUNDS = ['KORELYA CAPITAL II', 'LP Investors', 'Fund Alpha', 'Fund Beta'];
const SEGMENTS = ['HNWI', 'UHNWI', 'Retail', 'Professional', 'Institutional'];

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/**
 * Crée un document avec le bon ratio de ciblage :
 * - 85% nominatif (investisseur + souscription optionnelle)
 * - 10% générique sans ciblage
 * - 3% générique ciblage fonds
 * - 2% générique ciblage segment
 */
const createDocument = (name: string, format: 'pdf' | 'docx' | 'xlsx' | 'pptx' = 'pdf'): DataRoomDocument => {
  docCounter++;
  const roll = Math.random();

  const base = {
    id: `doc-${docCounter}`,
    name,
    format,
    size: randomSize(),
    date: randomDate(new Date(2023, 0, 1), new Date()).toLocaleDateString('fr-FR'),
    stats: randomStats(),
    engagement: randomEngagement(),
  };

  if (roll < 0.85) {
    // Nominatif (85%)
    return {
      ...base,
      isNominatif: true,
      investorRestriction: pick(INVESTORS),
      subscriptionRestriction: Math.random() < 0.6 ? pick(SUBSCRIPTIONS) : undefined,
    };
  } else if (roll < 0.95) {
    // Générique sans ciblage (10%)
    return { ...base, isNominatif: false };
  } else if (roll < 0.98) {
    // Générique ciblage fonds (3%)
    return {
      ...base,
      isNominatif: false,
      fundRestriction: pick(FUNDS),
    };
  } else {
    // Générique ciblage segment (2%)
    const count = Math.floor(Math.random() * 2) + 1;
    const selected = new Set<string>();
    while (selected.size < count) selected.add(pick(SEGMENTS));
    return {
      ...base,
      isNominatif: false,
      segmentRestrictions: Array.from(selected),
    };
  }
};

interface FolderOpts {
  fund?: string;
  shareClass?: string;
  segments?: string[];
}

const createFolder = (
  name: string,
  children: (DataRoomFolder | DataRoomDocument)[],
  opts: FolderOpts = {},
): DataRoomFolder => {
  folderCounter++;
  return {
    id: `folder-${folderCounter}`,
    name,
    children,
    fundRestriction: opts.fund,
    shareClassRestriction: opts.shareClass,
    segmentRestrictions: opts.segments,
  };
};

// ─── ESPACE 1 : Due Diligence - KORELYA CAPITAL II (Fund: KORELYA CAPITAL II) ───
const dueDiligenceFolders = (): DataRoomFolder[] => [
  createFolder('1. Executive Summary', [
    createDocument('Executive Summary - KORELYA II.pdf'),
    createDocument('Investment Thesis.pdf'),
    createDocument('Key Metrics Dashboard.xlsx', 'xlsx'),
    createDocument('Management Presentation.pptx', 'pptx'),
  ], { fund: 'KORELYA CAPITAL II', shareClass: 'Parts A' }),
  createFolder('2. Legal & Corporate', [
    createFolder('2.1 Corporate Structure', [
      createDocument('Cap Table - Current.xlsx', 'xlsx'),
      createDocument('Shareholders Agreement.pdf'),
      createDocument('Articles of Association.pdf'),
      createDocument('Corporate Organigram.pdf'),
      createDocument('Board Composition.pdf'),
    ], { fund: 'KORELYA CAPITAL II' }),
    createFolder('2.2 Contracts & Agreements', [
      createDocument('Material Contracts Summary.xlsx', 'xlsx'),
      createDocument('LPA - Limited Partnership Agreement.pdf'),
      createDocument('Management Agreement.pdf'),
      createDocument('Advisory Agreement.pdf'),
      createDocument('Fund Formation Documents.pdf'),
    ], { fund: 'KORELYA CAPITAL II' }),
    createFolder('2.3 Compliance & Regulatory', [
      createDocument('AMF Registration.pdf'),
      createDocument('AIFM Directive Compliance.pdf'),
      createDocument('ESMA Reporting.pdf'),
      createDocument('Regulatory Correspondence.pdf'),
    ], { fund: 'KORELYA CAPITAL II' }),
  ], { fund: 'KORELYA CAPITAL II' }),
  createFolder('3. Financial Analysis', [
    createFolder('3.1 Historical Financials', [
      createDocument('Audited Accounts 2021.pdf'),
      createDocument('Audited Accounts 2022.pdf'),
      createDocument('Audited Accounts 2023.pdf'),
      createDocument('Management Accounts Q1 2024.xlsx', 'xlsx'),
      createDocument('Management Accounts Q2 2024.xlsx', 'xlsx'),
    ], { fund: 'KORELYA CAPITAL II', shareClass: 'Parts A' }),
    createFolder('3.2 Financial Projections', [
      createDocument('5-Year Financial Model.xlsx', 'xlsx'),
      createDocument('Base Case Scenario.xlsx', 'xlsx'),
      createDocument('Bull Case Scenario.xlsx', 'xlsx'),
      createDocument('Bear Case Scenario.xlsx', 'xlsx'),
      createDocument('Sensitivity Analysis.xlsx', 'xlsx'),
    ], { fund: 'KORELYA CAPITAL II', shareClass: 'Parts B' }),
    createFolder('3.3 Valuation', [
      createDocument('Valuation Report - DCF.pdf'),
      createDocument('Comparable Transactions.xlsx', 'xlsx'),
      createDocument('Market Multiples Analysis.xlsx', 'xlsx'),
      createDocument('Fairness Opinion.pdf'),
    ], { fund: 'KORELYA CAPITAL II' }),
  ], { fund: 'KORELYA CAPITAL II' }),
  createFolder('4. Commercial Due Diligence', [
    createFolder('4.1 Market Analysis', [
      createDocument('Market Size & Growth.pdf'),
      createDocument('Competitive Landscape.pdf'),
      createDocument('Industry Trends Report.pdf'),
      createDocument('Customer Segmentation.xlsx', 'xlsx'),
    ], { fund: 'KORELYA CAPITAL II' }),
    createFolder('4.2 Business Model', [
      createDocument('Revenue Streams Analysis.pdf'),
      createDocument('Pricing Strategy.pdf'),
      createDocument('Customer Acquisition Cost.xlsx', 'xlsx'),
      createDocument('Unit Economics.xlsx', 'xlsx'),
    ], { fund: 'KORELYA CAPITAL II' }),
    createFolder('4.3 Commercial Contracts', [
      createDocument('Top 10 Customers.xlsx', 'xlsx'),
      createDocument('Customer Contracts Sample.pdf'),
      createDocument('Supplier Agreements.pdf'),
      createDocument('Distribution Agreements.pdf'),
    ], { fund: 'KORELYA CAPITAL II' }),
  ], { fund: 'KORELYA CAPITAL II' }),
  createFolder('5. Operational Due Diligence', [
    createFolder('5.1 Management Team', [
      createDocument('Management Biographies.pdf'),
      createDocument('Organization Chart.pdf'),
      createDocument('Key Man Provisions.pdf'),
      createDocument('Compensation Structure.xlsx', 'xlsx'),
    ], { fund: 'KORELYA CAPITAL II' }),
    createFolder('5.2 IT & Technology', [
      createDocument('IT Infrastructure Assessment.pdf'),
      createDocument('Cybersecurity Report.pdf'),
      createDocument('Technology Stack Overview.pdf'),
    ], { fund: 'KORELYA CAPITAL II' }),
    createFolder('5.3 HR & Social', [
      createDocument('Headcount Evolution.xlsx', 'xlsx'),
      createDocument('Turnover Analysis.pdf'),
      createDocument('Compensation Benchmarking.pdf'),
      createDocument('Social Audit Report.pdf'),
    ], { fund: 'KORELYA CAPITAL II' }),
  ], { fund: 'KORELYA CAPITAL II' }),
  createFolder('6. Tax & Accounting', [
    createFolder('6.1 Tax Structure', [
      createDocument('Tax Structuring Memo.pdf'),
      createDocument('Transfer Pricing Report.pdf'),
      createDocument('Tax Opinions.pdf'),
      createDocument('Withholding Tax Analysis.pdf'),
    ], { fund: 'KORELYA CAPITAL II' }),
    createFolder('6.2 Tax Returns', [
      createDocument('Corporate Tax Return 2021.pdf'),
      createDocument('Corporate Tax Return 2022.pdf'),
      createDocument('Corporate Tax Return 2023.pdf'),
      createDocument('VAT Returns 2023.pdf'),
    ], { fund: 'KORELYA CAPITAL II' }),
  ], { fund: 'KORELYA CAPITAL II' }),
  createFolder('7. ESG & Sustainability', [
    createDocument('ESG Questionnaire Response.pdf'),
    createDocument('Carbon Footprint Assessment.pdf'),
    createDocument('Diversity & Inclusion Report.pdf'),
    createDocument('Sustainability Action Plan.pdf'),
  ], { fund: 'KORELYA CAPITAL II' }),
  createFolder('8. Insurance & Risk', [
    createDocument('Insurance Schedule.xlsx', 'xlsx'),
    createDocument('D&O Insurance Policy.pdf'),
    createDocument('Professional Indemnity.pdf'),
    createDocument('Risk Register.xlsx', 'xlsx'),
  ], { fund: 'KORELYA CAPITAL II' }),
];

// ─── ESPACE 2 : Reporting Trimestriel LP (Fund: LP Investors) ───
const quarterlyReportingFolders = (): DataRoomFolder[] => [
  createFolder('Q1 2024', [
    createFolder('Fund Performance', [
      createDocument('Q1 2024 - Performance Report.pdf'),
      createDocument('Q1 2024 - NAV Statement.pdf'),
      createDocument('Q1 2024 - Portfolio Valuation.xlsx', 'xlsx'),
      createDocument('Q1 2024 - IRR Analysis.xlsx', 'xlsx'),
    ], { fund: 'LP Investors', shareClass: 'Parts A' }),
    createFolder('Portfolio Companies', [
      createDocument('Q1 2024 - Portfolio Overview.pdf'),
      createDocument('Q1 2024 - Company A Update.pdf'),
      createDocument('Q1 2024 - Company B Update.pdf'),
      createDocument('Q1 2024 - Company C Update.pdf'),
      createDocument('Q1 2024 - Portfolio KPIs.xlsx', 'xlsx'),
    ], { fund: 'LP Investors' }),
    createFolder('Capital Activity', [
      createDocument('Q1 2024 - Capital Calls.pdf'),
      createDocument('Q1 2024 - Distributions.pdf'),
      createDocument('Q1 2024 - Cash Flow Statement.xlsx', 'xlsx'),
    ], { fund: 'LP Investors', shareClass: 'Parts B' }),
  ], { fund: 'LP Investors' }),
  createFolder('Q2 2024', [
    createFolder('Fund Performance', [
      createDocument('Q2 2024 - Performance Report.pdf'),
      createDocument('Q2 2024 - NAV Statement.pdf'),
      createDocument('Q2 2024 - Portfolio Valuation.xlsx', 'xlsx'),
      createDocument('Q2 2024 - IRR Analysis.xlsx', 'xlsx'),
    ], { fund: 'LP Investors', shareClass: 'Parts A' }),
    createFolder('Portfolio Companies', [
      createDocument('Q2 2024 - Portfolio Overview.pdf'),
      createDocument('Q2 2024 - Company A Update.pdf'),
      createDocument('Q2 2024 - Company B Update.pdf'),
      createDocument('Q2 2024 - Company C Update.pdf'),
      createDocument('Q2 2024 - Portfolio KPIs.xlsx', 'xlsx'),
    ], { fund: 'LP Investors' }),
    createFolder('Capital Activity', [
      createDocument('Q2 2024 - Capital Calls.pdf'),
      createDocument('Q2 2024 - Distributions.pdf'),
      createDocument('Q2 2024 - Cash Flow Statement.xlsx', 'xlsx'),
    ], { fund: 'LP Investors' }),
  ], { fund: 'LP Investors' }),
  createFolder('Q3 2024', [
    createFolder('Fund Performance', [
      createDocument('Q3 2024 - Performance Report.pdf'),
      createDocument('Q3 2024 - NAV Statement.pdf'),
      createDocument('Q3 2024 - Portfolio Valuation.xlsx', 'xlsx'),
      createDocument('Q3 2024 - IRR Analysis.xlsx', 'xlsx'),
    ], { fund: 'LP Investors' }),
    createFolder('Portfolio Companies', [
      createDocument('Q3 2024 - Portfolio Overview.pdf'),
      createDocument('Q3 2024 - Company A Update.pdf'),
      createDocument('Q3 2024 - Company B Update.pdf'),
      createDocument('Q3 2024 - Company C Update.pdf'),
      createDocument('Q3 2024 - Exit Pipeline.pdf'),
    ], { fund: 'LP Investors' }),
  ], { fund: 'LP Investors' }),
  createFolder('Annual Reports', [
    createDocument('Annual Report 2023.pdf'),
    createDocument('Audited Financial Statements 2023.pdf'),
    createDocument('Tax Package 2023.pdf'),
    createDocument('ESG Annual Report 2023.pdf'),
  ], { fund: 'LP Investors' }),
  createFolder('Investor Letters', [
    createDocument('Investor Letter - Q1 2024.pdf'),
    createDocument('Investor Letter - Q2 2024.pdf'),
    createDocument('Investor Letter - Q3 2024.pdf'),
    createDocument('Special Update - Exit Company D.pdf'),
  ], { fund: 'LP Investors' }),
];

// ─── ESPACE 3 : Documents Légaux (Fund: KORELYA CAPITAL II) ───
const legalDocumentsFolders = (): DataRoomFolder[] => [
  createFolder('Fund Documentation', [
    createFolder('Formation Documents', [
      createDocument('Private Placement Memorandum.pdf'),
      createDocument('Limited Partnership Agreement.pdf'),
      createDocument('Subscription Agreement Template.pdf'),
      createDocument('Side Letter Template.pdf'),
      createDocument('Management Company Articles.pdf'),
    ], { fund: 'KORELYA CAPITAL II' }),
    createFolder('Amendments & Supplements', [
      createDocument('PPM Amendment 1 - 2022.pdf'),
      createDocument('PPM Amendment 2 - 2023.pdf'),
      createDocument('LPA Amendment - Extension Period.pdf'),
      createDocument('Supplement - ESG Policy.pdf'),
    ], { fund: 'KORELYA CAPITAL II' }),
  ], { fund: 'KORELYA CAPITAL II' }),
  createFolder('Regulatory Filings', [
    createFolder('AMF Filings', [
      createDocument('AMF Registration Certificate.pdf'),
      createDocument('Annual AMF Report 2023.pdf'),
      createDocument('Quarterly AMF Reporting Q1 2024.pdf'),
      createDocument('Quarterly AMF Reporting Q2 2024.pdf'),
    ], { fund: 'KORELYA CAPITAL II' }),
    createFolder('AIFMD Compliance', [
      createDocument('AIFMD Compliance Manual.pdf'),
      createDocument('Annual Report to AMF.pdf'),
      createDocument('Remuneration Policy.pdf'),
      createDocument('Valuation Policy.pdf'),
    ], { fund: 'KORELYA CAPITAL II' }),
  ], { fund: 'KORELYA CAPITAL II' }),
  createFolder('Service Provider Agreements', [
    createFolder('Audit & Tax', [
      createDocument('Engagement Letter - Deloitte.pdf'),
      createDocument('Audit Plan 2024.pdf'),
      createDocument('Tax Advisory Agreement - EY.pdf'),
    ], { fund: 'KORELYA CAPITAL II' }),
    createFolder('Legal & Compliance', [
      createDocument('Legal Counsel Agreement - Clifford Chance.pdf'),
      createDocument('Compliance Advisor Agreement.pdf'),
      createDocument('Fund Administrator Agreement.pdf'),
    ], { fund: 'KORELYA CAPITAL II' }),
    createFolder('Depositary & Custodian', [
      createDocument('Depositary Agreement - BNP Paribas.pdf'),
      createDocument('Custody Agreement.pdf'),
      createDocument('Cash Management Agreement.pdf'),
    ], { fund: 'KORELYA CAPITAL II' }),
  ], { fund: 'KORELYA CAPITAL II' }),
  createFolder('Insurance Policies', [
    createDocument('D&O Insurance Policy 2024.pdf'),
    createDocument('Professional Indemnity Insurance.pdf'),
    createDocument('Crime Insurance Policy.pdf'),
    createDocument('Insurance Certificate Summary.xlsx', 'xlsx'),
  ], { fund: 'KORELYA CAPITAL II' }),
  createFolder('Board & Governance', [
    createFolder('Board Minutes', [
      createDocument('Board Minutes - January 2024.pdf'),
      createDocument('Board Minutes - March 2024.pdf'),
      createDocument('Board Minutes - June 2024.pdf'),
      createDocument('Board Minutes - September 2024.pdf'),
    ], { fund: 'KORELYA CAPITAL II' }),
    createFolder('Advisory Board', [
      createDocument('Advisory Board Charter.pdf'),
      createDocument('Advisory Board Minutes Q1 2024.pdf'),
      createDocument('Advisory Board Minutes Q2 2024.pdf'),
    ], { fund: 'KORELYA CAPITAL II' }),
  ], { fund: 'KORELYA CAPITAL II' }),
];

// ─── ESPACE 4 : KYC / AML (Fund: Fund Alpha) ───
const kycAmlFolders = (): DataRoomFolder[] => [
  createFolder('Investor Onboarding', [
    createFolder('HNWI Investors', [
      createDocument('KYC Form - Jean Dault.pdf'),
      createDocument('Proof of Identity - Jean Dault.pdf'),
      createDocument('Proof of Address - Jean Dault.pdf'),
      createDocument('Source of Wealth - Jean Dault.pdf'),
      createDocument('KYC Form - Sophie Martin.pdf'),
      createDocument('Proof of Identity - Sophie Martin.pdf'),
    ], { fund: 'Fund Alpha', shareClass: 'Parts A' }),
    createFolder('Institutional Investors', [
      createDocument('KYC Form - ARDIAN.pdf'),
      createDocument('Certificate of Incorporation - ARDIAN.pdf'),
      createDocument('Beneficial Ownership - ARDIAN.pdf'),
      createDocument('AML Questionnaire - ARDIAN.pdf'),
      createDocument('KYC Form - BPI France.pdf'),
      createDocument('Certificate of Incorporation - BPI.pdf'),
    ], { fund: 'Fund Alpha', shareClass: 'Parts B' }),
  ], { fund: 'Fund Alpha' }),
  createFolder('AML Screening', [
    createFolder('Sanctions Lists', [
      createDocument('OFAC Screening Report - Batch 1.pdf'),
      createDocument('EU Sanctions Screening.pdf'),
      createDocument('PEP Screening Report.pdf'),
      createDocument('Adverse Media Check.pdf'),
    ], { fund: 'Fund Alpha' }),
    createFolder('Enhanced Due Diligence', [
      createDocument('EDD Report - High Risk Investor 1.pdf'),
      createDocument('EDD Report - PEP Investor.pdf'),
      createDocument('Country Risk Assessment - UAE.pdf'),
    ], { fund: 'Fund Alpha' }),
  ], { fund: 'Fund Alpha' }),
  createFolder('Compliance Procedures', [
    createDocument('AML-CFT Policy.pdf'),
    createDocument('KYC Procedures Manual.pdf'),
    createDocument('Transaction Monitoring Policy.pdf'),
    createDocument('Suspicious Activity Reporting Procedure.pdf'),
  ], { fund: 'Fund Alpha' }),
  createFolder('Regulatory Reporting', [
    createDocument('TRACFIN Annual Declaration 2023.pdf'),
    createDocument('SAR Filing - Case 2024-001.pdf'),
    createDocument('Compliance Officer Report Q1 2024.pdf'),
    createDocument('Compliance Officer Report Q2 2024.pdf'),
  ], { fund: 'Fund Alpha' }),
  createFolder('Training & Awareness', [
    createDocument('AML Training Materials 2024.pdf'),
    createDocument('Training Attendance Register.xlsx', 'xlsx'),
    createDocument('Compliance Newsletter Q1 2024.pdf'),
    createDocument('Compliance Newsletter Q2 2024.pdf'),
  ], { fund: 'Fund Alpha' }),
];

// ─── ESPACE 5 : Investment Committee (Fund: Fund Beta) ───
const investmentCommitteeFolders = (): DataRoomFolder[] => [
  createFolder('2024 Meetings', [
    createFolder('IC Meeting - January 2024', [
      createDocument('IC Agenda - Jan 2024.pdf'),
      createDocument('IC Minutes - Jan 2024.pdf'),
      createDocument('Deal Memo - Target Company X.pdf'),
      createDocument('Investment Proposal - Company X.pptx', 'pptx'),
      createDocument('Financial Model - Company X.xlsx', 'xlsx'),
    ], { fund: 'Fund Beta' }),
    createFolder('IC Meeting - March 2024', [
      createDocument('IC Agenda - Mar 2024.pdf'),
      createDocument('IC Minutes - Mar 2024.pdf'),
      createDocument('Deal Memo - Target Company Y.pdf'),
      createDocument('Investment Proposal - Company Y.pptx', 'pptx'),
      createDocument('Valuation Analysis - Company Y.xlsx', 'xlsx'),
    ], { fund: 'Fund Beta' }),
    createFolder('IC Meeting - June 2024', [
      createDocument('IC Agenda - Jun 2024.pdf'),
      createDocument('IC Minutes - Jun 2024.pdf'),
      createDocument('Exit Proposal - Portfolio Company A.pdf'),
      createDocument('Exit Valuation - Company A.xlsx', 'xlsx'),
      createDocument('Buyer Analysis.pdf'),
    ], { fund: 'Fund Beta' }),
    createFolder('IC Meeting - September 2024', [
      createDocument('IC Agenda - Sep 2024.pdf'),
      createDocument('IC Minutes - Sep 2024.pdf'),
      createDocument('Follow-on Investment - Company B.pdf'),
      createDocument('Bridge Financing Proposal.pdf'),
    ], { fund: 'Fund Beta' }),
  ], { fund: 'Fund Beta' }),
  createFolder('Deal Pipeline', [
    createFolder('Active Deals', [
      createDocument('Pipeline Tracker Q3 2024.xlsx', 'xlsx'),
      createDocument('Target Alpha - Teaser.pdf'),
      createDocument('Target Beta - CIM.pdf'),
      createDocument('Target Gamma - Management Presentation.pptx', 'pptx'),
    ], { fund: 'Fund Beta' }),
    createFolder('Passed Opportunities', [
      createDocument('Pass Memo - Company Delta.pdf'),
      createDocument('Pass Memo - Company Epsilon.pdf'),
      createDocument('Lessons Learned Summary.pdf'),
    ], { fund: 'Fund Beta' }),
  ], { fund: 'Fund Beta' }),
  createFolder('Investment Criteria', [
    createDocument('Investment Policy Statement.pdf'),
    createDocument('Target Sector Guidelines.pdf'),
    createDocument('ESG Investment Criteria.pdf'),
    createDocument('Geographic Focus.pdf'),
  ], { fund: 'Fund Beta' }),
  createFolder('Portfolio Monitoring', [
    createFolder('Monthly Reports', [
      createDocument('Portfolio Dashboard - August 2024.xlsx', 'xlsx'),
      createDocument('Portfolio Dashboard - September 2024.xlsx', 'xlsx'),
      createDocument('Red Flag Report Q3 2024.pdf'),
    ], { fund: 'Fund Beta', shareClass: 'Parts A' }),
    createFolder('Value Creation Plans', [
      createDocument('Value Creation Plan - Company A.pdf'),
      createDocument('Value Creation Plan - Company B.pdf'),
      createDocument('100 Days Plan - Company C.pdf'),
    ], { fund: 'Fund Beta' }),
  ], { fund: 'Fund Beta' }),
];

// ─── ESPACE 6 : Fundraising (Segment-based example - pas de fonds) ───
const fundraisingFolders = (): DataRoomFolder[] => [
  createFolder('Marketing Materials', [
    createFolder('Fund Presentations', [
      createDocument('Fund III Pitch Deck.pptx', 'pptx'),
      createDocument('Track Record Presentation.pptx', 'pptx'),
      createDocument('Team Presentation.pdf'),
      createDocument('ESG Approach.pdf'),
    ], { segments: ['HNWI', 'UHNWI'] }),
    createFolder('Data Room Materials', [
      createDocument('Placement Memorandum - Fund III.pdf'),
      createDocument('Historical Performance.xlsx', 'xlsx'),
      createDocument('Reference Letters.pdf'),
      createDocument('Team Biographies.pdf'),
    ], { segments: ['Institutional'] }),
  ], { segments: ['HNWI', 'UHNWI', 'Institutional'] }),
  createFolder('Fundraising Pipeline', [
    createFolder('Prospect Tracking', [
      createDocument('LP Prospect List.xlsx', 'xlsx'),
      createDocument('Meeting Notes - Prospect A.pdf'),
      createDocument('Meeting Notes - Prospect B.pdf'),
      createDocument('Due Diligence Questionnaire Responses.docx', 'docx'),
    ], { segments: ['HNWI', 'UHNWI'] }),
    createFolder('Commitments', [
      createDocument('Commitment Letters - Batch 1.pdf'),
      createDocument('Commitment Letters - Batch 2.pdf'),
      createDocument('Fundraising Tracker.xlsx', 'xlsx'),
    ], { segments: ['Institutional'] }),
  ], { segments: ['HNWI', 'UHNWI', 'Institutional'] }),
  createFolder('LP Communications', [
    createFolder('AGM Materials', [
      createDocument('AGM 2024 - Invitation.pdf'),
      createDocument('AGM 2024 - Agenda.pdf'),
      createDocument('AGM 2024 - Presentation.pptx', 'pptx'),
      createDocument('AGM 2024 - Minutes.pdf'),
    ], { segments: ['HNWI', 'UHNWI'] }),
    createFolder('LP Queries', [
      createDocument('LP Query Log Q1 2024.xlsx', 'xlsx'),
      createDocument('LP Query Log Q2 2024.xlsx', 'xlsx'),
      createDocument('Response Template - Tax Queries.docx', 'docx'),
    ], { segments: ['Institutional'] }),
  ], { segments: ['HNWI', 'UHNWI', 'Institutional'] }),
  createFolder('Investor Reporting Portal', [
    createDocument('Portal User Guide.pdf'),
    createDocument('Data Access Matrix.xlsx', 'xlsx'),
    createDocument('Reporting Calendar 2024.pdf'),
  ], { segments: ['HNWI', 'UHNWI', 'Institutional'] }),
];

export const generateDataRoomSpaces = (): DataRoomSpace[] => {
  docCounter = 0;
  folderCounter = 0;

  return [
    {
      id: 'space-1',
      name: 'Due Diligence - KORELYA CAPITAL II',
      fundRestriction: 'KORELYA CAPITAL II',
      folders: dueDiligenceFolders(),
    },
    {
      id: 'space-2',
      name: 'Quarterly Reporting - LP Investors',
      fundRestriction: 'LP Investors',
      folders: quarterlyReportingFolders(),
    },
    {
      id: 'space-3',
      name: 'Legal Documentation - Fonds',
      fundRestriction: 'KORELYA CAPITAL II',
      folders: legalDocumentsFolders(),
    },
    {
      id: 'space-4',
      name: 'KYC / AML Compliance',
      fundRestriction: 'Fund Alpha',
      folders: kycAmlFolders(),
    },
    {
      id: 'space-5',
      name: 'Investment Committee',
      fundRestriction: 'Fund Beta',
      folders: investmentCommitteeFolders(),
    },
    {
      // Espace basé sur les segments (pas de fonds) – exemple unique
      id: 'space-6',
      name: 'Fundraising & Investor Relations',
      segmentRestrictions: ['HNWI', 'UHNWI', 'Institutional'],
      folders: fundraisingFolders(),
    },
  ];
};
