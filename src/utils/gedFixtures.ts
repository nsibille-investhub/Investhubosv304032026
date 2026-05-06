// GED test fixtures — single source of truth for the document management
// system test data. Every space corresponds to a fund (with one transverse
// "Marketing & Distribution" space). The DataRoom view, the Bird View and
// the pending-validation page all derive their content from this file.
//
// All fund / investor / document names below are fictional but designed to
// look realistic. Default language: English.

export interface FundProfile {
  /** Stable id used to derive space ids etc. */
  code: string;
  /** Display name. */
  name: string;
  /** Vehicle type — kept verbatim on the marketing materials. */
  vehicle: 'FCPR' | 'FPCI' | 'SLP' | 'FCPI' | 'SCSp' | 'SICAV-RAIF';
  /** Investment strategy (drives folder flavour). */
  strategy:
    | 'Growth'
    | 'Buyout'
    | 'Venture'
    | 'Infrastructure'
    | 'Real Estate'
    | 'Private Debt'
    | 'Climate Impact'
    | 'Healthcare'
    | 'Mid-Market'
    | 'Secondaries';
  /** Year of first closing — used to populate yearly subfolders. */
  vintage: number;
  /** Lead Asset Manager (used as document owner). */
  manager: string;
  /** ISO country code of fund domicile, e.g. LU, FR. */
  domicile: 'LU' | 'FR' | 'IE' | 'NL';
  /** Currency. */
  currency: 'EUR' | 'USD';
  /** Whether the fund holds an Advisory Committee. */
  hasAdvisoryCommittee: boolean;
  /** Whether the fund publishes ESG / Impact reports as a dedicated chapter. */
  hasImpactCommittee: boolean;
  /** Share classes (kept short — Class A / Class B / …). */
  shareClasses: string[];
}

/* ----------------------------------------------------------------------- */
/* 1. Fund universe (10 funds)                                             */
/* ----------------------------------------------------------------------- */

export const FUNDS: FundProfile[] = [
  {
    code: 'NWGC2',
    name: 'Northwind Growth Capital II',
    vehicle: 'FPCI',
    strategy: 'Growth',
    vintage: 2021,
    manager: 'Camille Renard',
    domicile: 'FR',
    currency: 'EUR',
    hasAdvisoryCommittee: true,
    hasImpactCommittee: false,
    shareClasses: ['Class A', 'Class B', 'GP Class'],
  },
  {
    code: 'HBF3',
    name: 'Helios Buyout Fund III',
    vehicle: 'SCSp',
    strategy: 'Buyout',
    vintage: 2020,
    manager: 'Antoine Leblanc',
    domicile: 'LU',
    currency: 'EUR',
    hasAdvisoryCommittee: true,
    hasImpactCommittee: false,
    shareClasses: ['Class A', 'Class B'],
  },
  {
    code: 'AIP1',
    name: 'Atlas Infrastructure Partners I',
    vehicle: 'SLP',
    strategy: 'Infrastructure',
    vintage: 2019,
    manager: 'Maxime Dubois',
    domicile: 'FR',
    currency: 'EUR',
    hasAdvisoryCommittee: true,
    hasImpactCommittee: true,
    shareClasses: ['Class A', 'Class B'],
  },
  {
    code: 'LVF4',
    name: 'Lumen Venture Fund IV',
    vehicle: 'FPCI',
    strategy: 'Venture',
    vintage: 2022,
    manager: 'Léa Marchand',
    domicile: 'FR',
    currency: 'EUR',
    hasAdvisoryCommittee: true,
    hasImpactCommittee: false,
    shareClasses: ['Class A'],
  },
  {
    code: 'SREO',
    name: 'Sequana Real Estate Opportunities',
    vehicle: 'SCSp',
    strategy: 'Real Estate',
    vintage: 2020,
    manager: 'Julien Moreau',
    domicile: 'LU',
    currency: 'EUR',
    hasAdvisoryCommittee: false,
    hasImpactCommittee: false,
    shareClasses: ['Class A', 'Class I'],
  },
  {
    code: 'MPDF2',
    name: 'Meridian Private Debt Fund II',
    vehicle: 'SLP',
    strategy: 'Private Debt',
    vintage: 2021,
    manager: 'Sophie Bernard',
    domicile: 'FR',
    currency: 'EUR',
    hasAdvisoryCommittee: true,
    hasImpactCommittee: false,
    shareClasses: ['Class A', 'Class B', 'Class S'],
  },
  {
    code: 'PCTF',
    name: 'Polaris Climate Tech Fund',
    vehicle: 'SCSp',
    strategy: 'Climate Impact',
    vintage: 2022,
    manager: 'Mathilde Garcia',
    domicile: 'LU',
    currency: 'EUR',
    hasAdvisoryCommittee: true,
    hasImpactCommittee: true,
    shareClasses: ['Class A', 'Class I'],
  },
  {
    code: 'AHV',
    name: 'Aurora Healthcare Ventures',
    vehicle: 'FPCI',
    strategy: 'Healthcare',
    vintage: 2021,
    manager: 'Hugo Petit',
    domicile: 'FR',
    currency: 'EUR',
    hasAdvisoryCommittee: true,
    hasImpactCommittee: false,
    shareClasses: ['Class A'],
  },
  {
    code: 'CMM',
    name: 'Cedar Mid-Market Fund',
    vehicle: 'SCSp',
    strategy: 'Mid-Market',
    vintage: 2018,
    manager: 'Nathalie Bonnet',
    domicile: 'LU',
    currency: 'EUR',
    hasAdvisoryCommittee: true,
    hasImpactCommittee: false,
    shareClasses: ['Class A', 'Class B'],
  },
  {
    code: 'VS3',
    name: 'Vesta Secondaries III',
    vehicle: 'SLP',
    strategy: 'Secondaries',
    vintage: 2023,
    manager: 'Olivier Lambert',
    domicile: 'FR',
    currency: 'EUR',
    hasAdvisoryCommittee: false,
    hasImpactCommittee: false,
    shareClasses: ['Class A', 'Class B'],
  },
];

export const findFund = (code: string): FundProfile | undefined =>
  FUNDS.find((f) => f.code === code);

/* ----------------------------------------------------------------------- */
/* 2. Investor universe                                                    */
/* ----------------------------------------------------------------------- */

export type InvestorTypology =
  | 'Family Office'
  | 'HNWI'
  | 'UHNWI'
  | 'Institutional'
  | 'Insurance'
  | 'Pension Fund'
  | 'Sovereign'
  | 'Distributor';

export interface InvestorProfile {
  id: string;
  name: string;
  typology: InvestorTypology;
  email: string;
}

export const INVESTORS: InvestorProfile[] = [
  { id: 'INV-001', name: 'Aldebaran Pension Fund',         typology: 'Pension Fund',  email: 'lp-relations@aldebaran-pension.eu' },
  { id: 'INV-002', name: 'Brunswick Family Office',        typology: 'Family Office', email: 'office@brunswick-fo.com' },
  { id: 'INV-003', name: 'Caledonia Insurance Group',      typology: 'Insurance',     email: 'investments@caledonia-ins.eu' },
  { id: 'INV-004', name: 'Dunmore Sovereign Wealth',       typology: 'Sovereign',     email: 'capital@dunmore-swf.gov' },
  { id: 'INV-005', name: 'Everstone Family Trust',         typology: 'Family Office', email: 'trust@everstone-family.com' },
  { id: 'INV-006', name: 'Fairfield Endowment',            typology: 'Institutional', email: 'endowment@fairfield-edu.org' },
  { id: 'INV-007', name: 'Greycliff Wealth Partners',      typology: 'HNWI',          email: 'partners@greycliff.io' },
  { id: 'INV-008', name: 'Highbury Capital Allocators',    typology: 'Institutional', email: 'lp@highbury-capital.com' },
  { id: 'INV-009', name: 'Ibex Mountain Holdings',         typology: 'UHNWI',         email: 'mailbox@ibex-mountain.com' },
  { id: 'INV-010', name: 'Juniper Asset Management',       typology: 'Institutional', email: 'pe@juniper-am.com' },
  { id: 'INV-011', name: 'Kensington Private Bank',        typology: 'Distributor',   email: 'fund-selection@kensington-bank.co.uk' },
  { id: 'INV-012', name: 'Loira Patrimoine',               typology: 'Distributor',   email: 'selection@loira-patrimoine.fr' },
];

export const findInvestor = (id: string): InvestorProfile | undefined =>
  INVESTORS.find((i) => i.id === id);

/* ----------------------------------------------------------------------- */
/* 3. Internal owners (used as `uploadedBy`)                               */
/* ----------------------------------------------------------------------- */

export const INTERNAL_USERS = [
  'Camille Renard',
  'Antoine Leblanc',
  'Léa Marchand',
  'Sophie Bernard',
  'Julien Moreau',
  'Maxime Dubois',
  'Hugo Petit',
  'Mathilde Garcia',
  'Nathalie Bonnet',
  'Olivier Lambert',
] as const;

/* ----------------------------------------------------------------------- */
/* 4. Generic helpers                                                      */
/* ----------------------------------------------------------------------- */

const TODAY = new Date('2026-05-06');

const seedRand = (() => {
  let state = 42;
  return () => {
    // mulberry32-ish deterministic generator
    state = (state + 0x6d2b79f5) | 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
})();

export const pseudoRandom = () => seedRand();

export const pick = <T>(arr: readonly T[]): T => arr[Math.floor(seedRand() * arr.length)];

export const randomSize = (small = false): string => {
  if (small) return `${Math.floor(seedRand() * 900 + 60)} KB`;
  const r = seedRand();
  if (r < 0.6) return `${(seedRand() * 4 + 0.4).toFixed(1)} MB`;
  if (r < 0.95) return `${(seedRand() * 12 + 4).toFixed(1)} MB`;
  return `${(seedRand() * 40 + 12).toFixed(1)} MB`;
};

const pad2 = (n: number) => String(n).padStart(2, '0');

export const fmtDate = (d: Date) => `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/** Ordered list of years from `from` (inclusive) up to current year. */
export const yearsRange = (from: number, to: number = TODAY.getFullYear()): number[] => {
  const out: number[] = [];
  for (let y = to; y >= from; y--) out.push(y);
  return out;
};

/* ----------------------------------------------------------------------- */
/* 5. Classic fund folder structure                                        */
/* ----------------------------------------------------------------------- */
//
// Each fund space exposes the following top-level folders (English):
//   - Advisory Committees           (if hasAdvisoryCommittee)
//   - Impact Committees             (if hasImpactCommittee)
//   - Management Reports            (yearly + quarterly Q1..Q4)
//   - Financial Documents           (yearly — audited statements, NAV)
//   - Asset Documents               (portfolio updates, valuations, ESG, deal memos)
//   - Capital Calls                 (yearly with several drawdown notices per year)
//   - Distributions                 (yearly with proceeds notices)
//   - Account Statements            (semi-annual)
//   - Other Communications          ⇢ AMPERE Format Data, Banking & Financial, Misc
//   - Legal Documents               ⇢ Fund Regulations, Legal Information,
//                                       Side Letters, Subscription Forms

export interface DocumentSpec {
  /** Document filename (with extension). */
  name: string;
  /** Owner full name (uses INTERNAL_USERS or LP names for nominatif docs). */
  owner: string;
  /** Issue date (ISO yyyy-mm-dd). */
  date: string;
  /** Approximate size for display. */
  size: string;
  /** File extension class. */
  format: 'pdf' | 'docx' | 'xlsx' | 'pptx';
  /** Document business category (drives badges / filters). */
  category: DocCategory;
  /** Optional restriction at the document level. */
  investorId?: string;
  /** Optional subscription tag (free string). */
  subscription?: string;
  /** Optional share class restriction. */
  shareClass?: string;
  /** Tags. */
  tags?: string[];
}

export type DocCategory =
  | 'capitalCall'
  | 'distribution'
  | 'quarterlyReport'
  | 'annualReport'
  | 'subscription'
  | 'kyc'
  | 'legal'
  | 'tax'
  | 'marketing'
  | 'other';

export interface FolderSpec {
  name: string;
  /** Optional segment scope when the folder is segment-restricted. */
  segments?: string[];
  /** Optional fund scope (default: parent space's fund). */
  fund?: string;
  /** Optional share class scope. */
  shareClass?: string;
  /** Children folders. */
  folders?: FolderSpec[];
  /** Documents directly in the folder. */
  documents?: DocumentSpec[];
}

export interface SpaceSpec {
  /** Stable id (used by all consumers as the routing key). */
  id: string;
  /** Display name. */
  name: string;
  /** Fund linked to this space — undefined for transverse spaces. */
  fundCode?: string;
  /** Optional segment restriction at space level (transverse spaces). */
  segments?: string[];
  /** Optional kind tag for UI. */
  audience: 'Investor' | 'Distributor' | 'Mixed';
  /** Top-level folders. */
  folders: FolderSpec[];
}

/* ----------------------------------------------------------------------- */
/* 5.1 Builders                                                            */
/* ----------------------------------------------------------------------- */

const ownerOf = (fund: FundProfile, biased: 'manager' | 'finance' | 'legal' | 'ir' | 'esg' = 'manager'): string => {
  switch (biased) {
    case 'manager': return fund.manager;
    case 'finance': return 'Antoine Leblanc';
    case 'legal':   return 'Julien Moreau';
    case 'ir':      return 'Léa Marchand';
    case 'esg':     return 'Mathilde Garcia';
  }
};

const buildAdvisoryCommittees = (fund: FundProfile): FolderSpec => {
  const years = yearsRange(Math.max(fund.vintage, 2022));
  return {
    name: 'Advisory Committees',
    folders: years.map((year) => ({
      name: String(year),
      documents: [
        {
          name: `${year}-03-12 - ${fund.name} - Advisory Committee Minutes.pdf`,
          owner: ownerOf(fund, 'ir'),
          date: `${year}-03-12`, size: randomSize(), format: 'pdf',
          category: 'other', tags: ['Advisory', 'Minutes', `${year}`],
        },
        {
          name: `${year}-03-12 - ${fund.name} - Advisory Committee Pack.pdf`,
          owner: ownerOf(fund, 'ir'),
          date: `${year}-03-10`, size: randomSize(), format: 'pdf',
          category: 'other', tags: ['Advisory', `${year}`],
        },
        {
          name: `${year}-09-22 - ${fund.name} - Advisory Committee Minutes.pdf`,
          owner: ownerOf(fund, 'ir'),
          date: `${year}-09-22`, size: randomSize(), format: 'pdf',
          category: 'other', tags: ['Advisory', 'Minutes', `${year}`],
        },
        {
          name: `${year}-09-22 - ${fund.name} - Advisory Committee Pack.pdf`,
          owner: ownerOf(fund, 'ir'),
          date: `${year}-09-20`, size: randomSize(), format: 'pdf',
          category: 'other', tags: ['Advisory', `${year}`],
        },
      ],
    })),
  };
};

const buildImpactCommittees = (fund: FundProfile): FolderSpec => {
  const years = yearsRange(Math.max(fund.vintage, 2023));
  return {
    name: 'Impact Committees',
    folders: years.map((year) => ({
      name: String(year),
      documents: [
        {
          name: `${year}-06-18 - ${fund.name} - Impact Committee Minutes.pdf`,
          owner: ownerOf(fund, 'esg'),
          date: `${year}-06-18`, size: randomSize(), format: 'pdf',
          category: 'other', tags: ['Impact', 'ESG', 'Minutes'],
        },
        {
          name: `${year}-06-18 - ${fund.name} - Impact KPIs Pack.pdf`,
          owner: ownerOf(fund, 'esg'),
          date: `${year}-06-15`, size: randomSize(), format: 'pdf',
          category: 'other', tags: ['Impact', 'ESG', 'KPI'],
        },
      ],
    })),
  };
};

const buildManagementReports = (fund: FundProfile): FolderSpec => {
  const years = yearsRange(Math.max(fund.vintage, 2022));
  return {
    name: 'Management Reports',
    folders: years.map((year) => ({
      name: String(year),
      folders: [
        {
          name: 'Q1',
          documents: [
            { name: `${year}-Q1 - ${fund.name} - Quarterly Report.pdf`, owner: fund.manager, date: `${year}-04-22`, size: randomSize(), format: 'pdf', category: 'quarterlyReport', tags: ['Reporting', `Q1 ${year}`] },
            { name: `${year}-Q1 - ${fund.name} - NAV Statement.pdf`,    owner: ownerOf(fund, 'finance'), date: `${year}-04-22`, size: randomSize(true), format: 'pdf', category: 'quarterlyReport', tags: ['NAV', `Q1 ${year}`] },
            { name: `${year}-Q1 - ${fund.name} - Portfolio KPIs.xlsx`,   owner: fund.manager, date: `${year}-04-22`, size: randomSize(true), format: 'xlsx', category: 'quarterlyReport', tags: ['KPI', `Q1 ${year}`] },
          ],
        },
        {
          name: 'Q2',
          documents: [
            { name: `${year}-Q2 - ${fund.name} - Quarterly Report.pdf`, owner: fund.manager, date: `${year}-07-24`, size: randomSize(), format: 'pdf', category: 'quarterlyReport', tags: ['Reporting', `Q2 ${year}`] },
            { name: `${year}-Q2 - ${fund.name} - NAV Statement.pdf`,    owner: ownerOf(fund, 'finance'), date: `${year}-07-24`, size: randomSize(true), format: 'pdf', category: 'quarterlyReport', tags: ['NAV', `Q2 ${year}`] },
            { name: `${year}-Q2 - ${fund.name} - Portfolio KPIs.xlsx`,   owner: fund.manager, date: `${year}-07-24`, size: randomSize(true), format: 'xlsx', category: 'quarterlyReport', tags: ['KPI', `Q2 ${year}`] },
          ],
        },
        {
          name: 'Q3',
          documents: [
            { name: `${year}-Q3 - ${fund.name} - Quarterly Report.pdf`, owner: fund.manager, date: `${year}-10-21`, size: randomSize(), format: 'pdf', category: 'quarterlyReport', tags: ['Reporting', `Q3 ${year}`] },
            { name: `${year}-Q3 - ${fund.name} - NAV Statement.pdf`,    owner: ownerOf(fund, 'finance'), date: `${year}-10-21`, size: randomSize(true), format: 'pdf', category: 'quarterlyReport', tags: ['NAV', `Q3 ${year}`] },
          ],
        },
        {
          name: 'Q4 / Annual',
          documents: [
            { name: `${year} - ${fund.name} - Annual Report.pdf`,           owner: fund.manager, date: `${year + 1}-02-28`, size: randomSize(), format: 'pdf', category: 'annualReport', tags: ['Annual Report', `${year}`] },
            { name: `${year}-Q4 - ${fund.name} - Quarterly Report.pdf`,     owner: fund.manager, date: `${year + 1}-01-31`, size: randomSize(), format: 'pdf', category: 'quarterlyReport', tags: ['Reporting', `Q4 ${year}`] },
            { name: `${year}-Q4 - ${fund.name} - NAV Statement.pdf`,        owner: ownerOf(fund, 'finance'), date: `${year + 1}-01-31`, size: randomSize(true), format: 'pdf', category: 'quarterlyReport', tags: ['NAV', `Q4 ${year}`] },
            { name: `${year} - ${fund.name} - Manager Letter.pdf`,          owner: fund.manager, date: `${year + 1}-02-15`, size: randomSize(), format: 'pdf', category: 'annualReport', tags: ['Letter', `${year}`] },
          ],
        },
      ],
    })),
  };
};

const buildFinancialDocuments = (fund: FundProfile): FolderSpec => {
  const years = yearsRange(Math.max(fund.vintage, 2022));
  return {
    name: 'Financial Documents',
    folders: years.map((year) => ({
      name: String(year),
      documents: [
        { name: `${year} - ${fund.name} - Audited Financial Statements.pdf`, owner: ownerOf(fund, 'finance'), date: `${year + 1}-03-15`, size: randomSize(), format: 'pdf', category: 'annualReport', tags: ['Audit', 'Financials', `${year}`] },
        { name: `${year} - ${fund.name} - Auditor's Report (Mazars).pdf`,    owner: ownerOf(fund, 'finance'), date: `${year + 1}-03-15`, size: randomSize(true), format: 'pdf', category: 'annualReport', tags: ['Audit', `${year}`] },
        { name: `${year} - ${fund.name} - Tax Reporting Pack.pdf`,           owner: ownerOf(fund, 'finance'), date: `${year + 1}-04-30`, size: randomSize(), format: 'pdf', category: 'tax', tags: ['Tax', `${year}`] },
        { name: `${year} - ${fund.name} - Detailed P&L.xlsx`,                owner: ownerOf(fund, 'finance'), date: `${year + 1}-03-15`, size: randomSize(true), format: 'xlsx', category: 'annualReport', tags: ['P&L', `${year}`] },
      ],
    })),
  };
};

const buildAssetDocuments = (fund: FundProfile): FolderSpec => {
  const years = yearsRange(Math.max(fund.vintage, 2023));
  // Strategy-flavoured portfolio company / asset names
  const assetsByStrategy: Record<FundProfile['strategy'], string[]> = {
    'Growth':           ['Northpeak Robotics', 'Brightline Software', 'Camber Logistics', 'Delphi Analytics'],
    'Buyout':           ['Aether Industries', 'Briarwood Foods', 'Caspian Components', 'Drayton Services'],
    'Venture':          ['Lumio Health', 'Quanta Labs', 'Veridis AI', 'Synova Robotics'],
    'Infrastructure':   ['Aerolinea Toll Road', 'Bluewater Port Terminal', 'Helios Solar Farm', 'Verdant Wind Cluster'],
    'Real Estate':      ['Astoria Logistics Park', 'Belvedere Office Tower', 'Citadel Mixed-Use', 'Dunmore Residential Portfolio'],
    'Private Debt':     ['Beacon Industrial Loan', 'Crestline Receivables Facility', 'Drysdale Mezzanine Tranche', 'Evergreen Senior Note'],
    'Climate Impact':   ['BlueHydrogen Plant', 'CarbonForge Recycling', 'Helios PV Portfolio', 'Verdant Battery Storage'],
    'Healthcare':       ['Curio Therapeutics', 'Helix BioLabs', 'OncoNova Pharma', 'Vita Medical Devices'],
    'Mid-Market':       ['Ardenne Manufacturing', 'Brindille Cosmetics', 'Canyon Hospitality', 'Drystone Engineering'],
    'Secondaries':      ['Project Beacon (LP stake)', 'Project Cobalt (GP-led)', 'Project Drift (Tail-end)'],
  };
  const assets = assetsByStrategy[fund.strategy];

  return {
    name: 'Asset Documents',
    folders: [
      {
        name: 'Portfolio Updates',
        folders: years.map((year) => ({
          name: String(year),
          documents: assets.flatMap((asset) => ([
            { name: `${year}-Q2 - ${asset} - Portfolio Update.pdf`, owner: fund.manager, date: `${year}-07-12`, size: randomSize(), format: 'pdf' as const, category: 'quarterlyReport' as DocCategory, tags: ['Portfolio', asset] },
            { name: `${year}-Q4 - ${asset} - Portfolio Update.pdf`, owner: fund.manager, date: `${year + 1}-01-22`, size: randomSize(), format: 'pdf' as const, category: 'quarterlyReport' as DocCategory, tags: ['Portfolio', asset] },
          ])),
        })),
      },
      {
        name: 'Valuations',
        folders: years.map((year) => ({
          name: String(year),
          documents: [
            { name: `${year}-06-30 - ${fund.name} - Portfolio Valuation Report.pdf`, owner: ownerOf(fund, 'finance'), date: `${year}-08-15`, size: randomSize(), format: 'pdf', category: 'quarterlyReport', tags: ['Valuation', 'H1', `${year}`] },
            { name: `${year}-12-31 - ${fund.name} - Portfolio Valuation Report.pdf`, owner: ownerOf(fund, 'finance'), date: `${year + 1}-02-15`, size: randomSize(), format: 'pdf', category: 'annualReport', tags: ['Valuation', 'H2', `${year}`] },
            { name: `${year} - ${fund.name} - Valuation Methodology Memo.pdf`,        owner: ownerOf(fund, 'finance'), date: `${year}-12-20`, size: randomSize(true), format: 'pdf', category: 'legal', tags: ['Methodology', 'Valuation'] },
          ],
        })),
      },
      ...(fund.hasImpactCommittee ? [{
        name: 'ESG & Impact Reports',
        folders: years.map((year) => ({
          name: String(year),
          documents: [
            { name: `${year} - ${fund.name} - ESG Annual Report.pdf`,        owner: ownerOf(fund, 'esg'), date: `${year + 1}-03-31`, size: randomSize(), format: 'pdf' as const, category: 'annualReport' as DocCategory, tags: ['ESG', `${year}`] },
            { name: `${year} - ${fund.name} - SFDR Article 9 Disclosure.pdf`, owner: ownerOf(fund, 'esg'), date: `${year + 1}-03-31`, size: randomSize(true), format: 'pdf' as const, category: 'legal' as DocCategory, tags: ['SFDR', 'Regulatory'] },
            { name: `${year} - ${fund.name} - Carbon Footprint Assessment.pdf`, owner: ownerOf(fund, 'esg'), date: `${year + 1}-04-15`, size: randomSize(), format: 'pdf' as const, category: 'annualReport' as DocCategory, tags: ['Carbon', 'ESG'] },
          ],
        })),
      } as FolderSpec] : []),
      {
        name: 'Deal Memos & Investment Committee',
        documents: assets.map((asset, i) => ({
          name: `IC Memo - ${asset} - Investment Decision.pdf`,
          owner: fund.manager,
          date: `${fund.vintage + Math.min(i, 2)}-${pad2(((i + 1) * 3) % 12 || 1)}-15`,
          size: randomSize(),
          format: 'pdf' as const,
          category: 'other' as DocCategory,
          tags: ['IC Memo', asset],
        })),
      },
    ],
  };
};

const buildCapitalCalls = (fund: FundProfile): FolderSpec => {
  const years = yearsRange(fund.vintage);
  const callsPerYear: Record<number, { date: string; n: number }[]> = {};
  let counter = 1;
  for (const year of [...years].reverse()) {
    const months = year === fund.vintage
      ? [3, 9]
      : [2, 6, 9, 12];
    callsPerYear[year] = months.map((m) => ({
      date: `${year}-${pad2(m)}-${pad2(Math.floor(seedRand() * 27) + 1)}`,
      n: counter++,
    }));
  }
  return {
    name: 'Capital Calls',
    folders: years.map((year) => ({
      name: String(year),
      folders: (callsPerYear[year] ?? []).map((c) => ({
        name: `${c.date} - Drawdown #${c.n}`,
        documents: [
          { name: `${c.date} - ${fund.name} - Capital Call Notice #${c.n}.pdf`, owner: ownerOf(fund, 'finance'), date: c.date, size: randomSize(true), format: 'pdf', category: 'capitalCall', tags: ['Capital Call', `#${c.n}`] },
          { name: `${c.date} - ${fund.name} - Wire Instructions.pdf`,            owner: ownerOf(fund, 'finance'), date: c.date, size: randomSize(true), format: 'pdf', category: 'capitalCall', tags: ['Wire', `#${c.n}`] },
          { name: `${c.date} - ${fund.name} - LP Allocation Schedule.xlsx`,      owner: ownerOf(fund, 'finance'), date: c.date, size: randomSize(true), format: 'xlsx', category: 'capitalCall', tags: ['Allocation', `#${c.n}`] },
        ],
      })),
    })),
  };
};

const buildDistributions = (fund: FundProfile): FolderSpec => {
  const years = yearsRange(Math.max(fund.vintage + 2, 2023));
  let counter = 1;
  return {
    name: 'Distributions',
    folders: [...years].reverse().map((year) => {
      const dates = [`${year}-06-15`, `${year}-12-12`].slice(0, year === TODAY.getFullYear() ? 1 : 2);
      return {
        name: String(year),
        folders: dates.map((d) => {
          const n = counter++;
          return {
            name: `${d} - Distribution #${n}`,
            documents: [
              { name: `${d} - ${fund.name} - Distribution Notice #${n}.pdf`, owner: ownerOf(fund, 'finance'), date: d, size: randomSize(true), format: 'pdf' as const, category: 'distribution' as DocCategory, tags: ['Distribution', `#${n}`] },
              { name: `${d} - ${fund.name} - LP Proceeds Schedule.xlsx`,     owner: ownerOf(fund, 'finance'), date: d, size: randomSize(true), format: 'xlsx' as const, category: 'distribution' as DocCategory, tags: ['Proceeds'] },
              { name: `${d} - ${fund.name} - Tax Treatment Memo.pdf`,        owner: ownerOf(fund, 'finance'), date: d, size: randomSize(true), format: 'pdf' as const, category: 'tax' as DocCategory, tags: ['Tax', 'Distribution'] },
            ],
          };
        }),
      };
    }).reverse(), // restore newest-first for display
  };
};

const buildAccountStatements = (fund: FundProfile): FolderSpec => {
  const years = yearsRange(Math.max(fund.vintage, 2022));
  return {
    name: 'Account Statements',
    folders: years.map((year) => ({
      name: String(year),
      documents: [
        { name: `${year}-06-30 - ${fund.name} - LP Account Statement.pdf`, owner: ownerOf(fund, 'finance'), date: `${year}-07-15`, size: randomSize(true), format: 'pdf', category: 'other', tags: ['Account Statement', 'H1', `${year}`] },
        { name: `${year}-12-31 - ${fund.name} - LP Account Statement.pdf`, owner: ownerOf(fund, 'finance'), date: `${year + 1}-01-20`, size: randomSize(true), format: 'pdf', category: 'other', tags: ['Account Statement', 'H2', `${year}`] },
      ],
    })),
  };
};

const buildOtherCommunications = (fund: FundProfile): FolderSpec => ({
  name: 'Other Communications',
  folders: [
    {
      name: 'AMPERE Format Data',
      documents: [
        { name: `${fund.name} - AMPERE Investor Reporting 2025-Q4.xlsx`, owner: ownerOf(fund, 'finance'), date: '2026-01-15', size: randomSize(true), format: 'xlsx', category: 'other', tags: ['AMPERE'] },
        { name: `${fund.name} - AMPERE Investor Reporting 2026-Q1.xlsx`, owner: ownerOf(fund, 'finance'), date: '2026-04-15', size: randomSize(true), format: 'xlsx', category: 'other', tags: ['AMPERE'] },
      ],
    },
    {
      name: 'Banking & Financial Communications',
      documents: [
        { name: `${fund.name} - Depositary Bank Confirmation 2025.pdf`,   owner: ownerOf(fund, 'finance'), date: '2026-01-10', size: randomSize(true), format: 'pdf', category: 'other', tags: ['Depositary'] },
        { name: `${fund.name} - Custodian Statement 2025.pdf`,            owner: ownerOf(fund, 'finance'), date: '2026-01-12', size: randomSize(true), format: 'pdf', category: 'other', tags: ['Custodian'] },
      ],
    },
    {
      name: 'Misc',
      documents: [
        { name: `${fund.name} - Annual General Meeting Save-the-date.pdf`, owner: ownerOf(fund, 'ir'), date: '2026-03-04', size: randomSize(true), format: 'pdf', category: 'other', tags: ['AGM'] },
        { name: `${fund.name} - Manager's Newsletter Q1 2026.pdf`,         owner: ownerOf(fund, 'ir'), date: '2026-04-12', size: randomSize(true), format: 'pdf', category: 'marketing', tags: ['Newsletter'] },
      ],
    },
  ],
});

const buildLegalDocuments = (fund: FundProfile): FolderSpec => ({
  name: 'Legal Documents',
  folders: [
    {
      name: 'Fund Regulations',
      documents: [
        { name: `${fund.name} - Limited Partnership Agreement (LPA) - Consolidated ${fund.vintage}.pdf`, owner: ownerOf(fund, 'legal'), date: `${fund.vintage}-06-01`, size: randomSize(), format: 'pdf', category: 'legal', tags: ['LPA', 'Constitutive'] },
        { name: `${fund.name} - Private Placement Memorandum (PPM).pdf`,                                  owner: ownerOf(fund, 'legal'), date: `${fund.vintage}-05-12`, size: randomSize(), format: 'pdf', category: 'legal', tags: ['PPM'] },
        { name: `${fund.name} - LPA Amendment #1 - Investment Period Extension.pdf`,                       owner: ownerOf(fund, 'legal'), date: `${fund.vintage + 3}-09-01`, size: randomSize(true), format: 'pdf', category: 'legal', tags: ['Amendment', 'LPA'] },
      ],
    },
    {
      name: 'Legal Information',
      documents: [
        { name: `${fund.name} - AMF Authorization Certificate.pdf`,                  owner: ownerOf(fund, 'legal'), date: `${fund.vintage}-04-25`, size: randomSize(true), format: 'pdf', category: 'legal', tags: ['AMF'] },
        { name: `${fund.name} - AIFMD Regulatory Disclosure.pdf`,                    owner: ownerOf(fund, 'legal'), date: '2025-11-30', size: randomSize(true), format: 'pdf', category: 'legal', tags: ['AIFMD'] },
        { name: `${fund.name} - Key Information Document (KID PRIIPs).pdf`,          owner: ownerOf(fund, 'legal'), date: '2026-01-10', size: randomSize(true), format: 'pdf', category: 'legal', tags: ['KID', 'PRIIPs'] },
      ],
    },
    {
      name: 'Side Letters',
      documents: [
        { name: `Side Letter - ${INVESTORS[0].name} - ${fund.name}.pdf`, owner: ownerOf(fund, 'legal'), date: `${fund.vintage}-07-22`, size: randomSize(true), format: 'pdf', category: 'legal', tags: ['Side Letter'], investorId: INVESTORS[0].id },
        { name: `Side Letter - ${INVESTORS[3].name} - ${fund.name}.pdf`, owner: ownerOf(fund, 'legal'), date: `${fund.vintage}-08-04`, size: randomSize(true), format: 'pdf', category: 'legal', tags: ['Side Letter'], investorId: INVESTORS[3].id },
        { name: `Side Letter - ${INVESTORS[7].name} - ${fund.name}.pdf`, owner: ownerOf(fund, 'legal'), date: `${fund.vintage}-09-18`, size: randomSize(true), format: 'pdf', category: 'legal', tags: ['Side Letter'], investorId: INVESTORS[7].id },
      ],
    },
    {
      name: 'Subscription Forms',
      documents: INVESTORS.slice(0, 6).map((inv, i) => ({
        name: `Subscription Form - ${inv.name} - ${fund.name}.pdf`,
        owner: ownerOf(fund, 'legal'),
        date: `${fund.vintage}-${pad2(6 + (i % 4))}-${pad2(((i * 7) % 27) + 1)}`,
        size: randomSize(true),
        format: 'pdf',
        category: 'subscription',
        tags: ['Subscription', inv.typology],
        investorId: inv.id,
        shareClass: fund.shareClasses[i % fund.shareClasses.length],
      })),
    },
  ],
});

/* ----------------------------------------------------------------------- */
/* 5.2 Compose a fund space                                                */
/* ----------------------------------------------------------------------- */

export const buildFundSpace = (fund: FundProfile): SpaceSpec => {
  const folders: FolderSpec[] = [];
  if (fund.hasAdvisoryCommittee) folders.push(buildAdvisoryCommittees(fund));
  if (fund.hasImpactCommittee)   folders.push(buildImpactCommittees(fund));
  folders.push(buildManagementReports(fund));
  folders.push(buildFinancialDocuments(fund));
  folders.push(buildAssetDocuments(fund));
  folders.push(buildCapitalCalls(fund));
  folders.push(buildDistributions(fund));
  folders.push(buildAccountStatements(fund));
  folders.push(buildOtherCommunications(fund));
  folders.push(buildLegalDocuments(fund));
  return {
    id: `space-${fund.code.toLowerCase()}`,
    name: fund.name,
    fundCode: fund.code,
    audience: 'Investor',
    folders,
  };
};

/* ----------------------------------------------------------------------- */
/* 5.3 Marketing & Distribution transverse space                           */
/* ----------------------------------------------------------------------- */

const buildMarketingSpace = (): SpaceSpec => {
  const fundFlyer = (fund: FundProfile): DocumentSpec => ({
    name: `${fund.name} - Fund Brochure.pdf`,
    owner: ownerOf(fund, 'ir'),
    date: '2026-01-20',
    size: randomSize(),
    format: 'pdf',
    category: 'marketing',
    tags: ['Brochure', fund.strategy],
  });
  const teaser = (fund: FundProfile): DocumentSpec => ({
    name: `${fund.name} - 2-pager Teaser.pdf`,
    owner: ownerOf(fund, 'ir'),
    date: '2026-02-10',
    size: randomSize(true),
    format: 'pdf',
    category: 'marketing',
    tags: ['Teaser', fund.strategy],
  });
  const pitch = (fund: FundProfile): DocumentSpec => ({
    name: `${fund.name} - Pitch Deck.pptx`,
    owner: ownerOf(fund, 'ir'),
    date: '2026-02-12',
    size: randomSize(),
    format: 'pptx',
    category: 'marketing',
    tags: ['Pitch', fund.strategy],
  });

  return {
    id: 'space-marketing',
    name: 'Marketing & Distribution',
    audience: 'Mixed',
    folders: [
      {
        name: 'Family Offices & UHNWI',
        segments: ['Family Office', 'UHNWI'],
        folders: [
          {
            name: 'Fund Brochures',
            documents: FUNDS.flatMap((f) => [fundFlyer(f), teaser(f)]),
          },
          {
            name: 'Pitch Decks',
            documents: FUNDS.map(pitch),
          },
          {
            name: 'Co-Investment Opportunities',
            documents: [
              { name: 'Project Aurora - Co-Investment Teaser.pdf',          owner: 'Maxime Dubois', date: '2026-03-12', size: randomSize(),      format: 'pdf',  category: 'marketing', tags: ['Co-Invest', 'Healthcare'] },
              { name: 'Project Aurora - Confidentiality Agreement.pdf',     owner: 'Julien Moreau', date: '2026-03-12', size: randomSize(true), format: 'pdf',  category: 'legal',     tags: ['NDA', 'Co-Invest'] },
              { name: 'Project Aurora - Information Memorandum.pdf',        owner: 'Maxime Dubois', date: '2026-03-18', size: randomSize(),      format: 'pdf',  category: 'marketing', tags: ['IM', 'Co-Invest'] },
              { name: 'Project Bluefin - Secondary Opportunity Memo.pdf',   owner: 'Olivier Lambert', date: '2026-04-02', size: randomSize(),    format: 'pdf',  category: 'marketing', tags: ['Secondary'] },
            ],
          },
        ],
      },
      {
        name: 'HNWI',
        segments: ['HNWI'],
        folders: [
          {
            name: 'Fund Brochures',
            documents: FUNDS.filter((_, i) => i % 2 === 0).flatMap((f) => [fundFlyer(f), teaser(f)]),
          },
          {
            name: 'Educational Materials',
            documents: [
              { name: 'Introduction to Private Equity.pdf',     owner: 'Léa Marchand', date: '2026-01-08', size: randomSize(),      format: 'pdf',  category: 'marketing', tags: ['Education'] },
              { name: 'Understanding Capital Calls & Distributions.pdf', owner: 'Léa Marchand', date: '2026-01-08', size: randomSize(),      format: 'pdf',  category: 'marketing', tags: ['Education'] },
              { name: 'Tax Considerations for HNWI Investors.pdf',       owner: 'Sophie Bernard', date: '2026-02-10', size: randomSize(true), format: 'pdf',  category: 'tax',       tags: ['Education', 'Tax'] },
              { name: 'Glossary of Private Markets Terms.pdf',           owner: 'Léa Marchand', date: '2026-01-08', size: randomSize(true), format: 'pdf',  category: 'marketing', tags: ['Education'] },
            ],
          },
          {
            name: 'Webinars & Replays',
            documents: [
              { name: '2026-Q1 Outlook - Webinar Replay.pdf',  owner: 'Léa Marchand', date: '2026-02-25', size: randomSize(), format: 'pdf', category: 'marketing', tags: ['Webinar'] },
              { name: '2026-Q1 Outlook - Slides.pdf',          owner: 'Léa Marchand', date: '2026-02-25', size: randomSize(), format: 'pdf', category: 'marketing', tags: ['Webinar'] },
            ],
          },
        ],
      },
      {
        name: 'Institutional Investors',
        segments: ['Institutional', 'Insurance', 'Pension Fund', 'Sovereign'],
        folders: [
          {
            name: 'Due Diligence Questionnaires',
            documents: FUNDS.slice(0, 6).map((f) => ({
              name: `${f.name} - Standardized DDQ (ILPA Template).pdf`,
              owner: 'Sophie Bernard',
              date: '2026-02-04',
              size: randomSize(),
              format: 'pdf',
              category: 'marketing',
              tags: ['DDQ', 'ILPA', f.strategy],
            })),
          },
          {
            name: 'Track Record',
            documents: [
              { name: 'InvestHub - Consolidated Track Record 2026.pdf', owner: 'Léa Marchand', date: '2026-02-08', size: randomSize(),      format: 'pdf',  category: 'marketing', tags: ['Track Record'] },
              { name: 'InvestHub - Net IRR vs Benchmark.xlsx',          owner: 'Léa Marchand', date: '2026-02-08', size: randomSize(true), format: 'xlsx', category: 'marketing', tags: ['Performance'] },
            ],
          },
          {
            name: 'ESG / SFDR',
            documents: [
              { name: 'Firm-wide ESG Policy 2026.pdf',           owner: 'Mathilde Garcia', date: '2026-01-15', size: randomSize(true), format: 'pdf', category: 'legal',     tags: ['ESG', 'Policy'] },
              { name: 'PRI Transparency Report 2025.pdf',         owner: 'Mathilde Garcia', date: '2026-03-31', size: randomSize(),      format: 'pdf', category: 'annualReport', tags: ['PRI'] },
              { name: 'Diversity & Inclusion Statement.pdf',     owner: 'Mathilde Garcia', date: '2026-01-15', size: randomSize(true), format: 'pdf', category: 'legal',     tags: ['D&I'] },
            ],
          },
        ],
      },
      {
        name: 'Distributors & Private Banks',
        segments: ['Distributor'],
        folders: [
          {
            name: 'Distribution Agreements',
            documents: [
              { name: 'Master Distribution Agreement - Template 2026.docx', owner: 'Julien Moreau', date: '2026-01-20', size: randomSize(true), format: 'docx', category: 'legal',     tags: ['Agreement', 'Distribution'] },
              { name: 'Retrocession Grid 2026.xlsx',                         owner: 'Julien Moreau', date: '2026-01-20', size: randomSize(true), format: 'xlsx', category: 'legal',     tags: ['Retrocession'] },
              { name: 'Anti-Money Laundering Onboarding Pack.pdf',           owner: 'Sophie Bernard', date: '2026-01-25', size: randomSize(),      format: 'pdf',  category: 'kyc',       tags: ['AML', 'KYC'] },
            ],
          },
          {
            name: 'Sales Toolkit',
            documents: [
              ...FUNDS.map(pitch),
              { name: 'Objection Handling Playbook.pdf',          owner: 'Léa Marchand', date: '2026-02-12', size: randomSize(true), format: 'pdf', category: 'marketing', tags: ['Sales'] },
              { name: 'Q&A Sheet - Private Markets 2026.pdf',     owner: 'Léa Marchand', date: '2026-02-12', size: randomSize(true), format: 'pdf', category: 'marketing', tags: ['Q&A'] },
            ],
          },
          {
            name: 'Roadshow 2026',
            documents: [
              { name: 'Roadshow 2026 - Master Presentation.pptx', owner: 'Léa Marchand', date: '2026-04-10', size: randomSize(),      format: 'pptx', category: 'marketing', tags: ['Roadshow'] },
              { name: 'Roadshow 2026 - Talking Points.pdf',        owner: 'Léa Marchand', date: '2026-04-10', size: randomSize(true), format: 'pdf',  category: 'marketing', tags: ['Roadshow'] },
              { name: 'Roadshow 2026 - City Schedule.xlsx',        owner: 'Léa Marchand', date: '2026-04-10', size: randomSize(true), format: 'xlsx', category: 'marketing', tags: ['Roadshow'] },
            ],
          },
        ],
      },
    ],
  };
};

/* ----------------------------------------------------------------------- */
/* 6. Public space catalogue                                               */
/* ----------------------------------------------------------------------- */

let cachedSpaces: SpaceSpec[] | null = null;

export const getSpaces = (): SpaceSpec[] => {
  if (cachedSpaces) return cachedSpaces;
  cachedSpaces = [
    ...FUNDS.map(buildFundSpace),
    buildMarketingSpace(),
  ];
  return cachedSpaces;
};

export const getSpaceById = (id: string): SpaceSpec | undefined =>
  getSpaces().find((s) => s.id === id);

/* ----------------------------------------------------------------------- */
/* 7. Folder/document counters                                             */
/* ----------------------------------------------------------------------- */

export const countFolders = (folders: FolderSpec[] | undefined): number => {
  if (!folders) return 0;
  let n = 0;
  for (const f of folders) {
    n += 1 + countFolders(f.folders);
  }
  return n;
};

export const countDocuments = (folders: FolderSpec[] | undefined): number => {
  if (!folders) return 0;
  let n = 0;
  for (const f of folders) {
    n += (f.documents?.length ?? 0) + countDocuments(f.folders);
  }
  return n;
};
