// GED test fixtures — single source of truth for the document management
// system test data. Every space corresponds to a fund (with one transverse
// "Marketing & Distribution" space). The DataRoom view, the Bird View and
// the pending-validation page all derive their content from this file.
//
// Each document carries its own `targeting` so that the consumer code can
// render the right nominatif / fund-level / segment / share-class
// indicators without having to re-randomize anything.
//
// All fund / investor / document names are fictional.

export interface FundProfile {
  code: string;
  name: string;
  vehicle: 'FCPR' | 'FPCI' | 'SLP' | 'FCPI' | 'SCSp' | 'SICAV-RAIF';
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
  vintage: number;
  manager: string;
  domicile: 'LU' | 'FR' | 'IE' | 'NL';
  currency: 'EUR' | 'USD';
  hasAdvisoryCommittee: boolean;
  hasImpactCommittee: boolean;
  shareClasses: string[];
}

/* ----------------------------------------------------------------------- */
/* 1. Fund universe                                                        */
/* ----------------------------------------------------------------------- */

export const FUNDS: FundProfile[] = [
  { code: 'NWGC2', name: 'Northwind Growth Capital II',     vehicle: 'FPCI', strategy: 'Growth',         vintage: 2021, manager: 'Camille Renard', domicile: 'FR', currency: 'EUR', hasAdvisoryCommittee: true, hasImpactCommittee: false, shareClasses: ['Class A', 'Class B', 'GP Class'] },
  { code: 'AIP1',  name: 'Atlas Infrastructure Partners I', vehicle: 'SLP',  strategy: 'Infrastructure', vintage: 2019, manager: 'Maxime Dubois',  domicile: 'FR', currency: 'EUR', hasAdvisoryCommittee: true, hasImpactCommittee: true,  shareClasses: ['Class A', 'Class B'] },
];

export const findFund = (code: string): FundProfile | undefined =>
  FUNDS.find((f) => f.code === code);

/* ----------------------------------------------------------------------- */
/* 2. Investors                                                            */
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
  // Pension funds
  { id: 'INV-001', name: 'Aldebaran Pension Fund',         typology: 'Pension Fund',  email: 'lp-relations@aldebaran-pension.eu' },
  { id: 'INV-014', name: 'Norwood Pension Trust',          typology: 'Pension Fund',  email: 'investments@norwood-pension.uk' },
  { id: 'INV-021', name: 'Hartwood Retirement Plan',       typology: 'Pension Fund',  email: 'capital@hartwood-retirement.eu' },
  { id: 'INV-031', name: 'Brentley Pension Scheme',        typology: 'Pension Fund',  email: 'lp@brentley-pension.com' },
  // Insurance & Re
  { id: 'INV-003', name: 'Caledonia Insurance Group',      typology: 'Insurance',     email: 'investments@caledonia-ins.eu' },
  { id: 'INV-017', name: 'Stratton Mutual Insurance',      typology: 'Insurance',     email: 'pe@stratton-mutual.com' },
  { id: 'INV-019', name: 'Vellington Re',                  typology: 'Insurance',     email: 'capital@vellington-re.eu' },
  { id: 'INV-024', name: 'Drumhill Reinsurance',           typology: 'Insurance',     email: 'allocations@drumhill-re.lu' },
  { id: 'INV-035', name: 'Northpoint Insurance',           typology: 'Insurance',     email: 'lp-relations@northpoint-ins.com' },
  // Sovereign
  { id: 'INV-004', name: 'Dunmore Sovereign Wealth',       typology: 'Sovereign',     email: 'capital@dunmore-swf.gov' },
  { id: 'INV-018', name: 'Tanvir Investment Authority',    typology: 'Sovereign',     email: 'lp@tanvir-ia.gov' },
  { id: 'INV-032', name: 'Suvarna Reserve Fund',           typology: 'Sovereign',     email: 'investments@suvarna-reserve.gov' },
  // Institutional / endowments / foundations
  { id: 'INV-006', name: 'Fairfield Endowment',            typology: 'Institutional', email: 'endowment@fairfield-edu.org' },
  { id: 'INV-008', name: 'Highbury Capital Allocators',    typology: 'Institutional', email: 'lp@highbury-capital.com' },
  { id: 'INV-010', name: 'Juniper Asset Management',       typology: 'Institutional', email: 'pe@juniper-am.com' },
  { id: 'INV-022', name: 'Helmsford Foundation',           typology: 'Institutional', email: 'allocations@helmsford-foundation.org' },
  { id: 'INV-023', name: 'Camberwell Allocators',          typology: 'Institutional', email: 'pe@camberwell-allocators.com' },
  { id: 'INV-025', name: 'Saint-Gaudens Endowment',        typology: 'Institutional', email: 'investments@stgaudens-endowment.org' },
  // Family Offices
  { id: 'INV-002', name: 'Brunswick Family Office',        typology: 'Family Office', email: 'office@brunswick-fo.com' },
  { id: 'INV-005', name: 'Everstone Family Trust',         typology: 'Family Office', email: 'trust@everstone-family.com' },
  { id: 'INV-013', name: 'Marston Family Office',          typology: 'Family Office', email: 'office@marston-fo.eu' },
  { id: 'INV-015', name: 'Pemberton House',                typology: 'Family Office', email: 'allocations@pemberton-house.com' },
  { id: 'INV-016', name: 'Rosendale Wealth Office',        typology: 'Family Office', email: 'office@rosendale-wo.com' },
  { id: 'INV-026', name: 'Avalon Heritage Trust',          typology: 'Family Office', email: 'trust@avalon-heritage.com' },
  { id: 'INV-028', name: 'Stenmark Capital',               typology: 'Family Office', email: 'office@stenmark-capital.se' },
  // HNWI / UHNWI
  { id: 'INV-007', name: 'Greycliff Wealth Partners',      typology: 'HNWI',          email: 'partners@greycliff.io' },
  { id: 'INV-009', name: 'Ibex Mountain Holdings',         typology: 'UHNWI',         email: 'mailbox@ibex-mountain.com' },
  { id: 'INV-020', name: 'Westbrook Investments',          typology: 'UHNWI',         email: 'office@westbrook-investments.com' },
  { id: 'INV-027', name: 'Carrington Private Wealth',      typology: 'HNWI',          email: 'wealth@carrington-pw.com' },
  { id: 'INV-033', name: 'Linden Holdings',                typology: 'UHNWI',         email: 'office@linden-holdings.lu' },
  // Distributors
  { id: 'INV-011', name: 'Kensington Private Bank',        typology: 'Distributor',   email: 'fund-selection@kensington-bank.co.uk' },
  { id: 'INV-012', name: 'Loira Patrimoine',               typology: 'Distributor',   email: 'selection@loira-patrimoine.fr' },
  { id: 'INV-029', name: 'Banque Saint-Augustin',          typology: 'Distributor',   email: 'gestion@banque-staugustin.fr' },
  { id: 'INV-030', name: 'Hartwell Wealth Advisors',       typology: 'Distributor',   email: 'advisory@hartwell-wa.com' },
];

export const findInvestor = (id: string): InvestorProfile | undefined =>
  INVESTORS.find((i) => i.id === id);

/* ----------------------------------------------------------------------- */
/* 2.bis Contacts attached to investors                                    */
/* ----------------------------------------------------------------------- */
//
// Each investor exposes a deterministic set of 2-3 contacts whose roles
// match the investor's typology. These are used by the "View as LP"
// selector, the BirdView activity panel, the document relaunch modal,
// and the engagement statistics — all of which therefore reference the
// same coherent population of contacts.

/**
 * Access scope of a contact:
 *  - `full`            : sees every document the LP receives
 *  - `commercial-only` : only sees marketing / commercial materials
 *                        (typically the Intern profile)
 *  - `revoked`         : access has been removed (no doc visible)
 */
export type ContactAccessLevel = 'full' | 'commercial-only' | 'revoked';

export interface InvestorContact {
  id: string;
  investorId: string;
  name: string;
  role: string;
  email: string;
  accessLevel: ContactAccessLevel;
  /**
   * Backwards-compatible flag. Kept for existing call sites that ask
   * "can this contact see anything?". Equivalent to accessLevel !== 'revoked'.
   */
  canAccess: boolean;
}

const CONTACT_ROLES_BY_TYPOLOGY: Record<InvestorTypology, string[]> = {
  'Pension Fund':  ['CIO', 'Senior Portfolio Manager', 'Risk Officer'],
  'Insurance':     ['Head of Private Markets', 'Investment Officer', 'Compliance Officer'],
  'Sovereign':     ['Head of Alternatives', 'Senior Investment Officer', 'Legal Counsel'],
  'Institutional': ['Head of Private Equity', 'Senior Investment Analyst', 'Operations Manager'],
  'Family Office': ['Head of Investments', 'Investment Analyst', 'Tax & Estate Advisor'],
  'HNWI':          ['Wealth Advisor', 'Personal Assistant'],
  'UHNWI':         ['Family Office Manager', 'Tax Advisor', 'Personal Assistant'],
  'Distributor':   ['Head of Fund Selection', 'Senior Analyst', 'Compliance Officer'],
};

const CONTACT_FIRST_NAMES = [
  'Marc', 'Sophie', 'Thomas', 'Camille', 'Olivier', 'Isabelle', 'Antoine', 'Nathalie',
  'Pierre', 'Émilie', 'Julien', 'Claire', 'Vincent', 'Hélène', 'Laurent', 'Caroline',
  'Mathieu', 'Sandrine', 'Nicolas', 'Stéphanie', 'David', 'Aurélie', 'Benoît', 'Marion',
  'Patrick', 'Élise', 'Frédéric', 'Anne-Sophie', 'Christophe', 'Valérie',
] as const;

const CONTACT_LAST_NAMES = [
  'Lefèvre', 'Moreau', 'Lambert', 'Roux', 'Fontaine', 'Garnier', 'Faure', 'Mercier',
  'Blanchard', 'Renard', 'Henry', 'Marchal', 'Vasseur', 'Charpentier', 'Legrand',
  'Berger', 'Dumas', 'Lemoine', 'Brunet', 'Pasquier', 'Lacroix', 'Bourgeois',
  'Chevalier', 'Carpentier', 'Marchand', 'Dupré', 'Rolland', 'Schneider', 'Klein',
  'Becker', 'Müller', 'Andersson', 'Lindqvist', 'O\'Connor', 'Ahmadi',
] as const;

const investorEmailDomain = (inv: InvestorProfile): string => {
  const at = inv.email.indexOf('@');
  return at >= 0 ? inv.email.slice(at + 1) : 'investhub.io';
};

const slugify = (name: string): string =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.|\.$/g, '');

const investorSeed = (id: string): number => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
};

const cachedContacts: Record<string, InvestorContact[]> = {};

/** Returns 3-4 deterministic contacts attached to the given investor. */
export const getInvestorContacts = (investorId: string): InvestorContact[] => {
  if (cachedContacts[investorId]) return cachedContacts[investorId];
  const inv = findInvestor(investorId);
  if (!inv) return [];

  const seed = investorSeed(investorId);
  const roles = CONTACT_ROLES_BY_TYPOLOGY[inv.typology];
  const numStandard = Math.min(roles.length, 2 + (seed % 2)); // 2 or 3 standard contacts
  const domain = investorEmailDomain(inv);

  const out: InvestorContact[] = [];

  // 1. Standard role-based contacts. ~20% chance the last one had its
  // access revoked (still listed but inaccessible).
  for (let i = 0; i < numStandard; i++) {
    const fn = CONTACT_FIRST_NAMES[(seed + i * 7) % CONTACT_FIRST_NAMES.length];
    const ln = CONTACT_LAST_NAMES[(seed + i * 13 + 3) % CONTACT_LAST_NAMES.length];
    const isRevoked = i === numStandard - 1 && seed % 5 === 0;
    const accessLevel: ContactAccessLevel = isRevoked ? 'revoked' : 'full';
    out.push({
      id: `${investorId}-C${i + 1}`,
      investorId,
      name: `${fn} ${ln}`,
      role: roles[i],
      email: `${slugify(fn)}.${slugify(ln)}@${domain}`,
      accessLevel,
      canAccess: accessLevel !== 'revoked',
    });
  }

  // 2. Systematic Intern profile — restricted to commercial documents
  // only. Useful to demonstrate audience filtering on strategic docs.
  const internFn = CONTACT_FIRST_NAMES[(seed + 19) % CONTACT_FIRST_NAMES.length];
  const internLn = CONTACT_LAST_NAMES[(seed + 23) % CONTACT_LAST_NAMES.length];
  out.push({
    id: `${investorId}-INTERN`,
    investorId,
    name: `${internFn} ${internLn}`,
    role: 'Intern',
    email: `${slugify(internFn)}.${slugify(internLn)}.intern@${domain}`,
    accessLevel: 'commercial-only',
    canAccess: true,
  });

  cachedContacts[investorId] = out;
  return out;
};

/** All contacts across all investors (cached). */
export const getAllInvestorContacts = (): InvestorContact[] =>
  INVESTORS.flatMap((inv) => getInvestorContacts(inv.id));

/* ----------------------------------------------------------------------- */
/* 3. Commitments — which investors invested in which fund                 */
/* ----------------------------------------------------------------------- */

export interface Commitment {
  fundCode: string;
  investorId: string;
  /** Stable subscription id, e.g. "SUB-NWGC2-001". */
  subscriptionId: string;
  /** Share class taken by the LP. */
  shareClass: string;
  /** Commitment amount (EUR). */
  commitmentEur: number;
}

const mkCommitments = (
  fundCode: string,
  rows: { investor: string; sc: string; amount: number }[],
): Commitment[] =>
  rows.map((r, i) => ({
    fundCode,
    investorId: r.investor,
    subscriptionId: `SUB-${fundCode}-${String(i + 1).padStart(3, '0')}`,
    shareClass: r.sc,
    commitmentEur: r.amount,
  }));

export const COMMITMENTS: Commitment[] = [
  ...mkCommitments('NWGC2', [
    // Class A — institutionnels (gros tickets)
    { investor: 'INV-001', sc: 'Class A',  amount: 25_000_000 }, // Aldebaran Pension Fund
    { investor: 'INV-014', sc: 'Class A',  amount: 18_000_000 }, // Norwood Pension Trust
    { investor: 'INV-021', sc: 'Class A',  amount: 22_000_000 }, // Hartwood Retirement Plan
    { investor: 'INV-031', sc: 'Class A',  amount: 15_000_000 }, // Brentley Pension Scheme
    { investor: 'INV-003', sc: 'Class A',  amount: 30_000_000 }, // Caledonia Insurance Group
    { investor: 'INV-017', sc: 'Class A',  amount: 12_000_000 }, // Stratton Mutual Insurance
    { investor: 'INV-008', sc: 'Class A',  amount: 20_000_000 }, // Highbury Capital Allocators
    { investor: 'INV-023', sc: 'Class A',  amount: 14_000_000 }, // Camberwell Allocators
    { investor: 'INV-022', sc: 'Class A',  amount:  8_000_000 }, // Helmsford Foundation
    // Class B — Family Offices et HNWI/UHNWI
    { investor: 'INV-002', sc: 'Class B',  amount:  8_000_000 }, // Brunswick Family Office
    { investor: 'INV-005', sc: 'Class B',  amount:  6_000_000 }, // Everstone Family Trust
    { investor: 'INV-013', sc: 'Class B',  amount:  5_000_000 }, // Marston Family Office
    { investor: 'INV-015', sc: 'Class B',  amount:  7_000_000 }, // Pemberton House
    { investor: 'INV-026', sc: 'Class B',  amount:  4_000_000 }, // Avalon Heritage Trust
    { investor: 'INV-007', sc: 'Class B',  amount:  3_000_000 }, // Greycliff Wealth Partners
    { investor: 'INV-009', sc: 'Class B',  amount: 12_000_000 }, // Ibex Mountain Holdings
    { investor: 'INV-020', sc: 'Class B',  amount:  9_000_000 }, // Westbrook Investments
    { investor: 'INV-027', sc: 'Class B',  amount:  2_500_000 }, // Carrington Private Wealth
  ]),
  ...mkCommitments('AIP1', [
    // Class A — gros institutionnels (typique pour Infra)
    { investor: 'INV-001', sc: 'Class A',  amount: 40_000_000 }, // Aldebaran Pension Fund
    { investor: 'INV-014', sc: 'Class A',  amount: 35_000_000 }, // Norwood Pension Trust
    { investor: 'INV-031', sc: 'Class A',  amount: 28_000_000 }, // Brentley Pension Scheme
    { investor: 'INV-021', sc: 'Class A',  amount: 30_000_000 }, // Hartwood Retirement Plan
    { investor: 'INV-004', sc: 'Class A',  amount: 60_000_000 }, // Dunmore Sovereign Wealth
    { investor: 'INV-018', sc: 'Class A',  amount: 50_000_000 }, // Tanvir Investment Authority
    { investor: 'INV-032', sc: 'Class A',  amount: 45_000_000 }, // Suvarna Reserve Fund
    { investor: 'INV-003', sc: 'Class A',  amount: 35_000_000 }, // Caledonia Insurance Group
    { investor: 'INV-017', sc: 'Class A',  amount: 25_000_000 }, // Stratton Mutual Insurance
    { investor: 'INV-019', sc: 'Class A',  amount: 18_000_000 }, // Vellington Re
    { investor: 'INV-024', sc: 'Class A',  amount: 20_000_000 }, // Drumhill Reinsurance
    { investor: 'INV-035', sc: 'Class A',  amount: 15_000_000 }, // Northpoint Insurance
    { investor: 'INV-008', sc: 'Class A',  amount: 22_000_000 }, // Highbury Capital Allocators
    { investor: 'INV-010', sc: 'Class A',  amount: 20_000_000 }, // Juniper Asset Management
    { investor: 'INV-006', sc: 'Class A',  amount: 12_000_000 }, // Fairfield Endowment
    { investor: 'INV-022', sc: 'Class A',  amount: 10_000_000 }, // Helmsford Foundation
    { investor: 'INV-025', sc: 'Class A',  amount: 14_000_000 }, // Saint-Gaudens Endowment
    // Class B — Family Offices / UHNWI
    { investor: 'INV-002', sc: 'Class B',  amount: 10_000_000 }, // Brunswick Family Office
    { investor: 'INV-016', sc: 'Class B',  amount:  8_000_000 }, // Rosendale Wealth Office
    { investor: 'INV-028', sc: 'Class B',  amount:  6_000_000 }, // Stenmark Capital
    { investor: 'INV-009', sc: 'Class B',  amount: 15_000_000 }, // Ibex Mountain Holdings
    { investor: 'INV-033', sc: 'Class B',  amount: 12_000_000 }, // Linden Holdings
  ]),
];

export const commitmentsForFund = (code: string): Commitment[] =>
  COMMITMENTS.filter((c) => c.fundCode === code);

/* ----------------------------------------------------------------------- */
/* 4. Targeting model                                                      */
/* ----------------------------------------------------------------------- */

/**
 * A document's intrinsic targeting. Consumers (BirdView, DataRoom,
 * Validation page) read it directly — there is no randomization.
 */
export type DocTargeting =
  /** Fund-level document — all LPs of the parent space's fund. */
  | { mode: 'fund' }
  /** Internal / back-office only (still scoped to the fund). */
  | { mode: 'fund-internal' }
  /** Restricted to a share class within the parent fund. */
  | { mode: 'shareClass'; shareClass: string }
  /** Nominatif — bound to a single investor + subscription. */
  | { mode: 'investor'; investorId: string; subscriptionId: string; shareClass?: string }
  /** Segment-targeted (used in the Marketing & Distribution space). */
  | { mode: 'segment'; segments: string[] };

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

export interface DocumentSpec {
  name: string;
  owner: string;
  /** ISO yyyy-mm-dd. */
  date: string;
  size: string;
  format: 'pdf' | 'docx' | 'xlsx' | 'pptx';
  category: DocCategory;
  targeting: DocTargeting;
  tags?: string[];
}

/**
 * Whether a document is "commercial" — i.e. brochures, pitch decks,
 * sales toolkit, roadshow… anything that interns and prospect-facing
 * audiences can legitimately receive. Strategic documents (capital
 * calls, distributions, NAV, reports, legal) are NOT commercial.
 */
export const isCommercialDocCategory = (category: DocCategory): boolean =>
  category === 'marketing';

/**
 * Returns true when a contact is allowed to receive / open the given
 * document. Centralised so every consumer (BirdView events, Activity
 * Panel, Relaunch Modal, View-as) applies the same rule.
 */
export const canContactAccessDoc = (
  contact: InvestorContact,
  doc: { category: DocCategory; targeting: DocTargeting },
): boolean => {
  switch (contact.accessLevel) {
    case 'revoked':
      return false;
    case 'full':
      return true;
    case 'commercial-only':
      return isCommercialDocCategory(doc.category) || doc.targeting.mode === 'segment';
  }
};

export interface FolderSpec {
  name: string;
  /** Optional segment scope at folder level (used in Marketing space). */
  segments?: string[];
  /** Optional share-class scope at folder level. */
  shareClass?: string;
  /** Optional explicit fund override (default: parent space's fund). */
  fund?: string;
  folders?: FolderSpec[];
  documents?: DocumentSpec[];
}

export interface SpaceSpec {
  id: string;
  name: string;
  /** Fund linked to this space — undefined for transverse spaces. */
  fundCode?: string;
  /** Optional segment restriction at space level. */
  segments?: string[];
  audience: 'Investor' | 'Distributor' | 'Mixed';
  folders: FolderSpec[];
}

/* ----------------------------------------------------------------------- */
/* 5. Helpers                                                              */
/* ----------------------------------------------------------------------- */

const TODAY = new Date('2026-05-06');

const seedRand = (() => {
  let state = 42;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
})();

export const pseudoRandom = () => seedRand();
export const pick = <T>(arr: readonly T[]): T => arr[Math.floor(seedRand() * arr.length)];

const pad2 = (n: number) => String(n).padStart(2, '0');

const randomSize = (small = false): string => {
  if (small) return `${Math.floor(seedRand() * 900 + 60)} KB`;
  const r = seedRand();
  if (r < 0.6) return `${(seedRand() * 4 + 0.4).toFixed(1)} MB`;
  if (r < 0.95) return `${(seedRand() * 12 + 4).toFixed(1)} MB`;
  return `${(seedRand() * 40 + 12).toFixed(1)} MB`;
};

const yearsRange = (from: number, to: number = TODAY.getFullYear()): number[] => {
  const out: number[] = [];
  for (let y = to; y >= from; y--) out.push(y);
  return out;
};

const ownerOf = (
  fund: FundProfile,
  role: 'manager' | 'finance' | 'legal' | 'ir' | 'esg' = 'manager',
): string => {
  switch (role) {
    case 'manager': return fund.manager;
    case 'finance': return 'Antoine Leblanc';
    case 'legal':   return 'Julien Moreau';
    case 'ir':      return 'Léa Marchand';
    case 'esg':     return 'Mathilde Garcia';
  }
};

const lpShortName = (investorId: string): string => {
  const inv = findInvestor(investorId);
  return inv?.name ?? investorId;
};

const T = {
  fund: (): DocTargeting => ({ mode: 'fund' }),
  internal: (): DocTargeting => ({ mode: 'fund-internal' }),
  shareClass: (sc: string): DocTargeting => ({ mode: 'shareClass', shareClass: sc }),
  investor: (c: Commitment): DocTargeting => ({
    mode: 'investor',
    investorId: c.investorId,
    subscriptionId: c.subscriptionId,
    shareClass: c.shareClass,
  }),
  segment: (segments: string[]): DocTargeting => ({ mode: 'segment', segments }),
};

/* ----------------------------------------------------------------------- */
/* 6. Per-fund document builders                                           */
/* ----------------------------------------------------------------------- */

const buildAdvisoryCommittees = (fund: FundProfile): FolderSpec => {
  const years = yearsRange(Math.max(fund.vintage, 2022));
  return {
    name: 'Advisory Committees',
    folders: years.map((year) => ({
      name: String(year),
      documents: [
        { name: `${year}-03-12 - ${fund.name} - Advisory Committee Minutes.pdf`, owner: ownerOf(fund, 'ir'), date: `${year}-03-12`, size: randomSize(),     format: 'pdf', category: 'other', targeting: T.fund(), tags: ['Advisory', 'Minutes', `${year}`] },
        { name: `${year}-03-12 - ${fund.name} - Advisory Committee Pack.pdf`,    owner: ownerOf(fund, 'ir'), date: `${year}-03-10`, size: randomSize(),     format: 'pdf', category: 'other', targeting: T.fund(), tags: ['Advisory', `${year}`] },
        { name: `${year}-09-22 - ${fund.name} - Advisory Committee Minutes.pdf`, owner: ownerOf(fund, 'ir'), date: `${year}-09-22`, size: randomSize(),     format: 'pdf', category: 'other', targeting: T.fund(), tags: ['Advisory', 'Minutes', `${year}`] },
        { name: `${year}-09-22 - ${fund.name} - Advisory Committee Pack.pdf`,    owner: ownerOf(fund, 'ir'), date: `${year}-09-20`, size: randomSize(),     format: 'pdf', category: 'other', targeting: T.fund(), tags: ['Advisory', `${year}`] },
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
        { name: `${year}-06-18 - ${fund.name} - Impact Committee Minutes.pdf`, owner: ownerOf(fund, 'esg'), date: `${year}-06-18`, size: randomSize(), format: 'pdf', category: 'other', targeting: T.fund(), tags: ['Impact', 'ESG', 'Minutes'] },
        { name: `${year}-06-18 - ${fund.name} - Impact KPIs Pack.pdf`,         owner: ownerOf(fund, 'esg'), date: `${year}-06-15`, size: randomSize(), format: 'pdf', category: 'other', targeting: T.fund(), tags: ['Impact', 'ESG', 'KPI'] },
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
            { name: `${year}-Q1 - ${fund.name} - Quarterly Report.pdf`,  owner: fund.manager,           date: `${year}-04-22`, size: randomSize(),     format: 'pdf',  category: 'quarterlyReport', targeting: T.fund(), tags: ['Reporting', `Q1 ${year}`] },
            { name: `${year}-Q1 - ${fund.name} - NAV Statement.pdf`,     owner: ownerOf(fund, 'finance'), date: `${year}-04-22`, size: randomSize(true), format: 'pdf',  category: 'quarterlyReport', targeting: T.fund(), tags: ['NAV', `Q1 ${year}`] },
            { name: `${year}-Q1 - ${fund.name} - Portfolio KPIs.xlsx`,    owner: fund.manager,           date: `${year}-04-22`, size: randomSize(true), format: 'xlsx', category: 'quarterlyReport', targeting: T.fund(), tags: ['KPI', `Q1 ${year}`] },
          ],
        },
        {
          name: 'Q2',
          documents: [
            { name: `${year}-Q2 - ${fund.name} - Quarterly Report.pdf`,  owner: fund.manager,           date: `${year}-07-24`, size: randomSize(),     format: 'pdf',  category: 'quarterlyReport', targeting: T.fund(), tags: ['Reporting', `Q2 ${year}`] },
            { name: `${year}-Q2 - ${fund.name} - NAV Statement.pdf`,     owner: ownerOf(fund, 'finance'), date: `${year}-07-24`, size: randomSize(true), format: 'pdf',  category: 'quarterlyReport', targeting: T.fund(), tags: ['NAV', `Q2 ${year}`] },
            { name: `${year}-Q2 - ${fund.name} - Portfolio KPIs.xlsx`,    owner: fund.manager,           date: `${year}-07-24`, size: randomSize(true), format: 'xlsx', category: 'quarterlyReport', targeting: T.fund(), tags: ['KPI', `Q2 ${year}`] },
          ],
        },
        {
          name: 'Q3',
          documents: [
            { name: `${year}-Q3 - ${fund.name} - Quarterly Report.pdf`,  owner: fund.manager,           date: `${year}-10-21`, size: randomSize(),     format: 'pdf',  category: 'quarterlyReport', targeting: T.fund(), tags: ['Reporting', `Q3 ${year}`] },
            { name: `${year}-Q3 - ${fund.name} - NAV Statement.pdf`,     owner: ownerOf(fund, 'finance'), date: `${year}-10-21`, size: randomSize(true), format: 'pdf',  category: 'quarterlyReport', targeting: T.fund(), tags: ['NAV', `Q3 ${year}`] },
          ],
        },
        {
          name: 'Q4 / Annual',
          documents: [
            { name: `${year} - ${fund.name} - Annual Report.pdf`,        owner: fund.manager,           date: `${year + 1}-02-28`, size: randomSize(),     format: 'pdf', category: 'annualReport',    targeting: T.fund(), tags: ['Annual Report', `${year}`] },
            { name: `${year}-Q4 - ${fund.name} - Quarterly Report.pdf`,  owner: fund.manager,           date: `${year + 1}-01-31`, size: randomSize(),     format: 'pdf', category: 'quarterlyReport', targeting: T.fund(), tags: ['Reporting', `Q4 ${year}`] },
            { name: `${year}-Q4 - ${fund.name} - NAV Statement.pdf`,     owner: ownerOf(fund, 'finance'), date: `${year + 1}-01-31`, size: randomSize(true), format: 'pdf', category: 'quarterlyReport', targeting: T.fund(), tags: ['NAV', `Q4 ${year}`] },
            { name: `${year} - ${fund.name} - Manager Letter.pdf`,        owner: fund.manager,           date: `${year + 1}-02-15`, size: randomSize(),     format: 'pdf', category: 'annualReport',    targeting: T.fund(), tags: ['Letter', `${year}`] },
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
        { name: `${year} - ${fund.name} - Audited Financial Statements.pdf`, owner: ownerOf(fund, 'finance'), date: `${year + 1}-03-15`, size: randomSize(),     format: 'pdf',  category: 'annualReport', targeting: T.fund(), tags: ['Audit', 'Financials', `${year}`] },
        { name: `${year} - ${fund.name} - Auditor's Report (Mazars).pdf`,    owner: ownerOf(fund, 'finance'), date: `${year + 1}-03-15`, size: randomSize(true), format: 'pdf',  category: 'annualReport', targeting: T.fund(), tags: ['Audit', `${year}`] },
        { name: `${year} - ${fund.name} - Tax Reporting Pack.pdf`,           owner: ownerOf(fund, 'finance'), date: `${year + 1}-04-30`, size: randomSize(),     format: 'pdf',  category: 'tax',          targeting: T.fund(), tags: ['Tax', `${year}`] },
        { name: `${year} - ${fund.name} - Detailed P&L.xlsx`,                owner: ownerOf(fund, 'finance'), date: `${year + 1}-03-15`, size: randomSize(true), format: 'xlsx', category: 'annualReport', targeting: T.internal(), tags: ['P&L', `${year}`, 'Internal'] },
      ],
    })),
  };
};

const ASSETS_BY_STRATEGY: Record<FundProfile['strategy'], string[]> = {
  'Growth':         ['Northpeak Robotics', 'Brightline Software', 'Camber Logistics', 'Delphi Analytics'],
  'Buyout':         ['Aether Industries', 'Briarwood Foods', 'Caspian Components', 'Drayton Services'],
  'Venture':        ['Lumio Health', 'Quanta Labs', 'Veridis AI', 'Synova Robotics'],
  'Infrastructure': ['Aerolinea Toll Road', 'Bluewater Port Terminal', 'Helios Solar Farm', 'Verdant Wind Cluster'],
  'Real Estate':    ['Astoria Logistics Park', 'Belvedere Office Tower', 'Citadel Mixed-Use', 'Dunmore Residential Portfolio'],
  'Private Debt':   ['Beacon Industrial Loan', 'Crestline Receivables Facility', 'Drysdale Mezzanine Tranche', 'Evergreen Senior Note'],
  'Climate Impact': ['BlueHydrogen Plant', 'CarbonForge Recycling', 'Helios PV Portfolio', 'Verdant Battery Storage'],
  'Healthcare':     ['Curio Therapeutics', 'Helix BioLabs', 'OncoNova Pharma', 'Vita Medical Devices'],
  'Mid-Market':     ['Ardenne Manufacturing', 'Brindille Cosmetics', 'Canyon Hospitality', 'Drystone Engineering'],
  'Secondaries':    ['Project Beacon (LP stake)', 'Project Cobalt (GP-led)', 'Project Drift (Tail-end)'],
};

const buildAssetDocuments = (fund: FundProfile): FolderSpec => {
  const years = yearsRange(Math.max(fund.vintage, 2023));
  const assets = ASSETS_BY_STRATEGY[fund.strategy];

  return {
    name: 'Asset Documents',
    folders: [
      {
        name: 'Portfolio Updates',
        folders: years.map((year) => ({
          name: String(year),
          documents: assets.flatMap((asset) => [
            { name: `${year}-Q2 - ${asset} - Portfolio Update.pdf`, owner: fund.manager, date: `${year}-07-12`,     size: randomSize(), format: 'pdf' as const, category: 'quarterlyReport' as DocCategory, targeting: T.fund(), tags: ['Portfolio', asset] },
            { name: `${year}-Q4 - ${asset} - Portfolio Update.pdf`, owner: fund.manager, date: `${year + 1}-01-22`, size: randomSize(), format: 'pdf' as const, category: 'quarterlyReport' as DocCategory, targeting: T.fund(), tags: ['Portfolio', asset] },
          ]),
        })),
      },
      {
        name: 'Valuations',
        folders: years.map((year) => ({
          name: String(year),
          documents: [
            { name: `${year}-06-30 - ${fund.name} - Portfolio Valuation Report.pdf`, owner: ownerOf(fund, 'finance'), date: `${year}-08-15`,     size: randomSize(),     format: 'pdf', category: 'quarterlyReport', targeting: T.fund(),     tags: ['Valuation', 'H1', `${year}`] },
            { name: `${year}-12-31 - ${fund.name} - Portfolio Valuation Report.pdf`, owner: ownerOf(fund, 'finance'), date: `${year + 1}-02-15`, size: randomSize(),     format: 'pdf', category: 'annualReport',    targeting: T.fund(),     tags: ['Valuation', 'H2', `${year}`] },
            { name: `${year} - ${fund.name} - Valuation Methodology Memo.pdf`,        owner: ownerOf(fund, 'finance'), date: `${year}-12-20`,     size: randomSize(true), format: 'pdf', category: 'legal',           targeting: T.internal(), tags: ['Methodology', 'Internal'] },
          ],
        })),
      },
      ...(fund.hasImpactCommittee ? [{
        name: 'ESG & Impact Reports',
        folders: years.map((year) => ({
          name: String(year),
          documents: [
            { name: `${year} - ${fund.name} - ESG Annual Report.pdf`,         owner: ownerOf(fund, 'esg'), date: `${year + 1}-03-31`, size: randomSize(),      format: 'pdf' as const, category: 'annualReport' as DocCategory, targeting: T.fund(), tags: ['ESG', `${year}`] },
            { name: `${year} - ${fund.name} - SFDR Article 9 Disclosure.pdf`,  owner: ownerOf(fund, 'esg'), date: `${year + 1}-03-31`, size: randomSize(true),  format: 'pdf' as const, category: 'legal'        as DocCategory, targeting: T.fund(), tags: ['SFDR', 'Regulatory'] },
            { name: `${year} - ${fund.name} - Carbon Footprint Assessment.pdf`, owner: ownerOf(fund, 'esg'), date: `${year + 1}-04-15`, size: randomSize(),      format: 'pdf' as const, category: 'annualReport' as DocCategory, targeting: T.fund(), tags: ['Carbon', 'ESG'] },
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
          targeting: T.internal(),
          tags: ['IC Memo', asset, 'Internal'],
        })),
      },
    ],
  };
};

/** Capital calls — one folder per drawdown, with master + per-LP nominatives. */
const buildCapitalCalls = (fund: FundProfile): FolderSpec => {
  const years = yearsRange(fund.vintage);
  const lpCommitments = commitmentsForFund(fund.code);
  let drawdownNum = 1;
  type Drawdown = { date: string; n: number };
  const drawdownsByYear: Record<number, Drawdown[]> = {};

  // Build draw-down dates (oldest → newest) so that #N is chronological.
  for (const year of [...years].reverse()) {
    const months = year === fund.vintage ? [3, 9] : [2, 6, 9, 12];
    drawdownsByYear[year] = months.map((m) => ({
      date: `${year}-${pad2(m)}-${pad2(((m * 7) % 27) + 1)}`,
      n: drawdownNum++,
    }));
  }

  return {
    name: 'Capital Calls',
    folders: years.map((year) => ({
      name: String(year),
      folders: (drawdownsByYear[year] ?? []).map((d) => ({
        name: `${d.date} - Drawdown #${d.n}`,
        // Capital call notices are inherently nominative: one per LP of the fund.
        documents: lpCommitments.map((c) => ({
          name: `${d.date} - ${fund.name} - Capital Call #${d.n} - ${lpShortName(c.investorId)} (${c.subscriptionId}).pdf`,
          owner: ownerOf(fund, 'finance'),
          date: d.date,
          size: randomSize(true),
          format: 'pdf' as const,
          category: 'capitalCall' as DocCategory,
          targeting: T.investor(c),
          tags: ['Capital Call', `#${d.n}`, findInvestor(c.investorId)?.typology ?? 'LP'],
        })),
      })),
    })),
  };
};

/** Distributions — same structure as Capital Calls. */
const buildDistributions = (fund: FundProfile): FolderSpec => {
  const years = yearsRange(Math.max(fund.vintage + 2, 2023));
  const lpCommitments = commitmentsForFund(fund.code);
  let distNum = 1;
  type Dist = { date: string; n: number };
  const distByYear: Record<number, Dist[]> = {};

  for (const year of [...years].reverse()) {
    const dates = year === TODAY.getFullYear()
      ? [`${year}-03-18`]
      : [`${year}-06-15`, `${year}-12-12`];
    distByYear[year] = dates.map((d) => ({ date: d, n: distNum++ }));
  }

  return {
    name: 'Distributions',
    folders: years.map((year) => ({
      name: String(year),
      folders: (distByYear[year] ?? []).map((d) => ({
        name: `${d.date} - Distribution #${d.n}`,
        // Distribution notices are inherently nominative: one per LP.
        documents: lpCommitments.map((c) => ({
          name: `${d.date} - ${fund.name} - Distribution #${d.n} - ${lpShortName(c.investorId)} (${c.subscriptionId}).pdf`,
          owner: ownerOf(fund, 'finance'),
          date: d.date,
          size: randomSize(true),
          format: 'pdf' as const,
          category: 'distribution' as DocCategory,
          targeting: T.investor(c),
          tags: ['Distribution', `#${d.n}`, findInvestor(c.investorId)?.typology ?? 'LP'],
        })),
      })),
    })),
  };
};

/** Account statements — one document per LP per period. */
const buildAccountStatements = (fund: FundProfile): FolderSpec => {
  const years = yearsRange(Math.max(fund.vintage, 2022));
  const lpCommitments = commitmentsForFund(fund.code);

  return {
    name: 'Account Statements',
    folders: years.map((year) => ({
      name: String(year),
      folders: [
        {
          name: 'H1',
          documents: lpCommitments.map((c) => ({
            name: `${year}-06-30 - ${fund.name} - Account Statement - ${lpShortName(c.investorId)}.pdf`,
            owner: ownerOf(fund, 'finance'),
            date: `${year}-07-15`,
            size: randomSize(true),
            format: 'pdf' as const,
            category: 'other' as DocCategory,
            targeting: T.investor(c),
            tags: ['Account Statement', `H1 ${year}`, findInvestor(c.investorId)?.typology ?? 'LP'],
          })),
        },
        {
          name: 'H2',
          documents: lpCommitments.map((c) => ({
            name: `${year}-12-31 - ${fund.name} - Account Statement - ${lpShortName(c.investorId)}.pdf`,
            owner: ownerOf(fund, 'finance'),
            date: `${year + 1}-01-20`,
            size: randomSize(true),
            format: 'pdf' as const,
            category: 'other' as DocCategory,
            targeting: T.investor(c),
            tags: ['Account Statement', `H2 ${year}`, findInvestor(c.investorId)?.typology ?? 'LP'],
          })),
        },
      ],
    })),
  };
};

const buildOtherCommunications = (fund: FundProfile): FolderSpec => {
  const lpCommitments = commitmentsForFund(fund.code);
  return {
    name: 'Other Communications',
    folders: [
      {
        name: 'AMPERE Format Data',
        documents: [
          { name: `${fund.name} - AMPERE Investor Reporting 2025-Q4.xlsx`, owner: ownerOf(fund, 'finance'), date: '2026-01-15', size: randomSize(true), format: 'xlsx', category: 'other', targeting: T.internal(), tags: ['AMPERE', 'Internal'] },
          { name: `${fund.name} - AMPERE Investor Reporting 2026-Q1.xlsx`, owner: ownerOf(fund, 'finance'), date: '2026-04-15', size: randomSize(true), format: 'xlsx', category: 'other', targeting: T.internal(), tags: ['AMPERE', 'Internal'] },
        ],
      },
      {
        name: 'Banking & Financial Communications',
        documents: [
          { name: `${fund.name} - Depositary Bank Confirmation 2025.pdf`, owner: ownerOf(fund, 'finance'), date: '2026-01-10', size: randomSize(true), format: 'pdf', category: 'other', targeting: T.fund(), tags: ['Depositary'] },
          { name: `${fund.name} - Custodian Statement 2025.pdf`,           owner: ownerOf(fund, 'finance'), date: '2026-01-12', size: randomSize(true), format: 'pdf', category: 'other', targeting: T.fund(), tags: ['Custodian'] },
        ],
      },
      {
        name: 'Tax Certificates 2025',
        // Per-LP nominative tax certificates
        documents: lpCommitments.map((c) => ({
          name: `2025 - ${fund.name} - Tax Certificate - ${lpShortName(c.investorId)}.pdf`,
          owner: ownerOf(fund, 'finance'),
          date: '2026-04-15',
          size: randomSize(true),
          format: 'pdf' as const,
          category: 'tax' as DocCategory,
          targeting: T.investor(c),
          tags: ['Tax Certificate', '2025', findInvestor(c.investorId)?.typology ?? 'LP'],
        })),
      },
      {
        name: 'Misc',
        documents: [
          { name: `${fund.name} - Annual General Meeting Save-the-date.pdf`, owner: ownerOf(fund, 'ir'), date: '2026-03-04', size: randomSize(true), format: 'pdf', category: 'other',     targeting: T.fund(), tags: ['AGM'] },
          { name: `${fund.name} - Manager's Newsletter Q1 2026.pdf`,         owner: ownerOf(fund, 'ir'), date: '2026-04-12', size: randomSize(true), format: 'pdf', category: 'marketing', targeting: T.fund(), tags: ['Newsletter'] },
        ],
      },
    ],
  };
};

const buildLegalDocuments = (fund: FundProfile): FolderSpec => {
  const lpCommitments = commitmentsForFund(fund.code);
  // Side letters: only the larger LPs negotiate them
  const sideLetterLps = [...lpCommitments]
    .sort((a, b) => b.commitmentEur - a.commitmentEur)
    .slice(0, Math.min(3, lpCommitments.length));

  return {
    name: 'Legal Documents',
    folders: [
      {
        name: 'Fund Regulations',
        documents: [
          { name: `${fund.name} - Limited Partnership Agreement (LPA) - Consolidated ${fund.vintage}.pdf`, owner: ownerOf(fund, 'legal'), date: `${fund.vintage}-06-01`,    size: randomSize(),     format: 'pdf', category: 'legal', targeting: T.fund(), tags: ['LPA', 'Constitutive'] },
          { name: `${fund.name} - Private Placement Memorandum (PPM).pdf`,                                  owner: ownerOf(fund, 'legal'), date: `${fund.vintage}-05-12`,    size: randomSize(),     format: 'pdf', category: 'legal', targeting: T.fund(), tags: ['PPM'] },
          { name: `${fund.name} - LPA Amendment #1 - Investment Period Extension.pdf`,                       owner: ownerOf(fund, 'legal'), date: `${fund.vintage + 3}-09-01`, size: randomSize(true), format: 'pdf', category: 'legal', targeting: T.fund(), tags: ['Amendment', 'LPA'] },
        ],
      },
      {
        name: 'Legal Information',
        documents: [
          { name: `${fund.name} - AMF Authorization Certificate.pdf`,                  owner: ownerOf(fund, 'legal'), date: `${fund.vintage}-04-25`, size: randomSize(true), format: 'pdf', category: 'legal', targeting: T.fund(), tags: ['AMF'] },
          { name: `${fund.name} - AIFMD Regulatory Disclosure.pdf`,                    owner: ownerOf(fund, 'legal'), date: '2025-11-30',           size: randomSize(true), format: 'pdf', category: 'legal', targeting: T.fund(), tags: ['AIFMD'] },
          { name: `${fund.name} - Key Information Document (KID PRIIPs).pdf`,          owner: ownerOf(fund, 'legal'), date: '2026-01-10',           size: randomSize(true), format: 'pdf', category: 'legal', targeting: T.fund(), tags: ['KID', 'PRIIPs'] },
        ],
      },
      {
        name: 'Side Letters',
        documents: sideLetterLps.map((c, i) => ({
          name: `Side Letter - ${lpShortName(c.investorId)} - ${fund.name}.pdf`,
          owner: ownerOf(fund, 'legal'),
          date: `${fund.vintage}-${pad2(7 + i)}-${pad2(((i + 1) * 9) % 27 + 1)}`,
          size: randomSize(true),
          format: 'pdf' as const,
          category: 'legal' as DocCategory,
          targeting: T.investor(c),
          tags: ['Side Letter', findInvestor(c.investorId)?.typology ?? 'LP'],
        })),
      },
      {
        name: 'Subscription Forms',
        documents: lpCommitments.map((c, i) => ({
          name: `Subscription Form - ${lpShortName(c.investorId)} - ${fund.name}.pdf`,
          owner: ownerOf(fund, 'legal'),
          date: `${fund.vintage}-${pad2(6 + (i % 4))}-${pad2(((i * 7) % 27) + 1)}`,
          size: randomSize(true),
          format: 'pdf' as const,
          category: 'subscription' as DocCategory,
          targeting: T.investor(c),
          tags: ['Subscription', findInvestor(c.investorId)?.typology ?? 'LP'],
        })),
      },
    ],
  };
};

/* ----------------------------------------------------------------------- */
/* 7. Compose a fund space                                                 */
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
/* 8. Marketing & Distribution transverse space                            */
/* ----------------------------------------------------------------------- */

const buildMarketingSpace = (): SpaceSpec => {
  const fundFlyer = (fund: FundProfile, segments: string[]): DocumentSpec => ({
    name: `${fund.name} - Fund Brochure.pdf`,
    owner: ownerOf(fund, 'ir'), date: '2026-01-20', size: randomSize(), format: 'pdf', category: 'marketing',
    targeting: T.segment(segments), tags: ['Brochure', fund.strategy],
  });
  const teaser = (fund: FundProfile, segments: string[]): DocumentSpec => ({
    name: `${fund.name} - 2-pager Teaser.pdf`,
    owner: ownerOf(fund, 'ir'), date: '2026-02-10', size: randomSize(true), format: 'pdf', category: 'marketing',
    targeting: T.segment(segments), tags: ['Teaser', fund.strategy],
  });
  const pitch = (fund: FundProfile, segments: string[]): DocumentSpec => ({
    name: `${fund.name} - Pitch Deck.pptx`,
    owner: ownerOf(fund, 'ir'), date: '2026-02-12', size: randomSize(), format: 'pptx', category: 'marketing',
    targeting: T.segment(segments), tags: ['Pitch', fund.strategy],
  });

  const FO_UHNWI = ['Family Office', 'UHNWI'];
  const HNWI = ['HNWI'];
  const INSTIT = ['Institutional', 'Insurance', 'Pension Fund', 'Sovereign'];
  const DISTRIB = ['Distributor'];

  return {
    id: 'space-marketing',
    name: 'Marketing & Distribution',
    audience: 'Mixed',
    folders: [
      {
        name: 'Family Offices & UHNWI',
        segments: FO_UHNWI,
        folders: [
          { name: 'Fund Brochures', documents: FUNDS.flatMap((f) => [fundFlyer(f, FO_UHNWI), teaser(f, FO_UHNWI)]) },
          { name: 'Pitch Decks',    documents: FUNDS.map((f) => pitch(f, FO_UHNWI)) },
          {
            name: 'Co-Investment Opportunities',
            documents: [
              { name: 'Project Aurora - Co-Investment Teaser.pdf',          owner: 'Maxime Dubois',    date: '2026-03-12', size: randomSize(),     format: 'pdf',  category: 'marketing', targeting: T.segment(FO_UHNWI), tags: ['Co-Invest', 'Healthcare'] },
              { name: 'Project Aurora - Confidentiality Agreement.pdf',     owner: 'Julien Moreau',    date: '2026-03-12', size: randomSize(true), format: 'pdf',  category: 'legal',     targeting: T.segment(FO_UHNWI), tags: ['NDA', 'Co-Invest'] },
              { name: 'Project Aurora - Information Memorandum.pdf',        owner: 'Maxime Dubois',    date: '2026-03-18', size: randomSize(),     format: 'pdf',  category: 'marketing', targeting: T.segment(FO_UHNWI), tags: ['IM', 'Co-Invest'] },
              { name: 'Project Bluefin - Secondary Opportunity Memo.pdf',   owner: 'Olivier Lambert',  date: '2026-04-02', size: randomSize(),     format: 'pdf',  category: 'marketing', targeting: T.segment(FO_UHNWI), tags: ['Secondary'] },
            ],
          },
        ],
      },
      {
        name: 'HNWI',
        segments: HNWI,
        folders: [
          { name: 'Fund Brochures', documents: FUNDS.filter((_, i) => i % 2 === 0).flatMap((f) => [fundFlyer(f, HNWI), teaser(f, HNWI)]) },
          {
            name: 'Educational Materials',
            documents: [
              { name: 'Introduction to Private Equity.pdf',              owner: 'Léa Marchand',  date: '2026-01-08', size: randomSize(),     format: 'pdf', category: 'marketing', targeting: T.segment(HNWI), tags: ['Education'] },
              { name: 'Understanding Capital Calls & Distributions.pdf', owner: 'Léa Marchand',  date: '2026-01-08', size: randomSize(),     format: 'pdf', category: 'marketing', targeting: T.segment(HNWI), tags: ['Education'] },
              { name: 'Tax Considerations for HNWI Investors.pdf',       owner: 'Sophie Bernard',date: '2026-02-10', size: randomSize(true), format: 'pdf', category: 'tax',       targeting: T.segment(HNWI), tags: ['Education', 'Tax'] },
              { name: 'Glossary of Private Markets Terms.pdf',           owner: 'Léa Marchand',  date: '2026-01-08', size: randomSize(true), format: 'pdf', category: 'marketing', targeting: T.segment(HNWI), tags: ['Education'] },
            ],
          },
          {
            name: 'Webinars & Replays',
            documents: [
              { name: '2026-Q1 Outlook - Webinar Replay.pdf', owner: 'Léa Marchand', date: '2026-02-25', size: randomSize(), format: 'pdf', category: 'marketing', targeting: T.segment(HNWI), tags: ['Webinar'] },
              { name: '2026-Q1 Outlook - Slides.pdf',         owner: 'Léa Marchand', date: '2026-02-25', size: randomSize(), format: 'pdf', category: 'marketing', targeting: T.segment(HNWI), tags: ['Webinar'] },
            ],
          },
        ],
      },
      {
        name: 'Institutional Investors',
        segments: INSTIT,
        folders: [
          {
            name: 'Due Diligence Questionnaires',
            documents: FUNDS.slice(0, 6).map((f) => ({
              name: `${f.name} - Standardized DDQ (ILPA Template).pdf`,
              owner: 'Sophie Bernard', date: '2026-02-04', size: randomSize(), format: 'pdf' as const, category: 'marketing' as DocCategory,
              targeting: T.segment(INSTIT), tags: ['DDQ', 'ILPA', f.strategy],
            })),
          },
          {
            name: 'Track Record',
            documents: [
              { name: 'InvestHub - Consolidated Track Record 2026.pdf', owner: 'Léa Marchand', date: '2026-02-08', size: randomSize(),     format: 'pdf',  category: 'marketing', targeting: T.segment(INSTIT), tags: ['Track Record'] },
              { name: 'InvestHub - Net IRR vs Benchmark.xlsx',          owner: 'Léa Marchand', date: '2026-02-08', size: randomSize(true), format: 'xlsx', category: 'marketing', targeting: T.segment(INSTIT), tags: ['Performance'] },
            ],
          },
          {
            name: 'ESG / SFDR',
            documents: [
              { name: 'Firm-wide ESG Policy 2026.pdf',          owner: 'Mathilde Garcia', date: '2026-01-15', size: randomSize(true), format: 'pdf', category: 'legal',        targeting: T.segment(INSTIT), tags: ['ESG', 'Policy'] },
              { name: 'PRI Transparency Report 2025.pdf',        owner: 'Mathilde Garcia', date: '2026-03-31', size: randomSize(),     format: 'pdf', category: 'annualReport', targeting: T.segment(INSTIT), tags: ['PRI'] },
              { name: 'Diversity & Inclusion Statement.pdf',    owner: 'Mathilde Garcia', date: '2026-01-15', size: randomSize(true), format: 'pdf', category: 'legal',        targeting: T.segment(INSTIT), tags: ['D&I'] },
            ],
          },
        ],
      },
      {
        name: 'Distributors & Private Banks',
        segments: DISTRIB,
        folders: [
          {
            name: 'Distribution Agreements',
            documents: [
              { name: 'Master Distribution Agreement - Template 2026.docx', owner: 'Julien Moreau',  date: '2026-01-20', size: randomSize(true), format: 'docx', category: 'legal', targeting: T.segment(DISTRIB), tags: ['Agreement', 'Distribution'] },
              { name: 'Retrocession Grid 2026.xlsx',                         owner: 'Julien Moreau',  date: '2026-01-20', size: randomSize(true), format: 'xlsx', category: 'legal', targeting: T.segment(DISTRIB), tags: ['Retrocession'] },
              { name: 'Anti-Money Laundering Onboarding Pack.pdf',           owner: 'Sophie Bernard', date: '2026-01-25', size: randomSize(),     format: 'pdf',  category: 'kyc',   targeting: T.segment(DISTRIB), tags: ['AML', 'KYC'] },
            ],
          },
          {
            name: 'Sales Toolkit',
            documents: [
              ...FUNDS.map((f) => pitch(f, DISTRIB)),
              { name: 'Objection Handling Playbook.pdf',      owner: 'Léa Marchand', date: '2026-02-12', size: randomSize(true), format: 'pdf', category: 'marketing', targeting: T.segment(DISTRIB), tags: ['Sales'] },
              { name: 'Q&A Sheet - Private Markets 2026.pdf', owner: 'Léa Marchand', date: '2026-02-12', size: randomSize(true), format: 'pdf', category: 'marketing', targeting: T.segment(DISTRIB), tags: ['Q&A'] },
            ],
          },
          {
            name: 'Roadshow 2026',
            documents: [
              { name: 'Roadshow 2026 - Master Presentation.pptx', owner: 'Léa Marchand', date: '2026-04-10', size: randomSize(),     format: 'pptx', category: 'marketing', targeting: T.segment(DISTRIB), tags: ['Roadshow'] },
              { name: 'Roadshow 2026 - Talking Points.pdf',        owner: 'Léa Marchand', date: '2026-04-10', size: randomSize(true), format: 'pdf',  category: 'marketing', targeting: T.segment(DISTRIB), tags: ['Roadshow'] },
              { name: 'Roadshow 2026 - City Schedule.xlsx',        owner: 'Léa Marchand', date: '2026-04-10', size: randomSize(true), format: 'xlsx', category: 'marketing', targeting: T.segment(DISTRIB), tags: ['Roadshow'] },
            ],
          },
        ],
      },
    ],
  };
};

/* ----------------------------------------------------------------------- */
/* 9. Public space catalogue                                               */
/* ----------------------------------------------------------------------- */

let cachedSpaces: SpaceSpec[] | null = null;

export const getSpaces = (): SpaceSpec[] => {
  if (cachedSpaces) return cachedSpaces;
  cachedSpaces = [...FUNDS.map(buildFundSpace), buildMarketingSpace()];
  return cachedSpaces;
};

export const getSpaceById = (id: string): SpaceSpec | undefined =>
  getSpaces().find((s) => s.id === id);

/* ----------------------------------------------------------------------- */
/* 10. Folder/document counters                                            */
/* ----------------------------------------------------------------------- */

export const countFolders = (folders: FolderSpec[] | undefined): number => {
  if (!folders) return 0;
  let n = 0;
  for (const f of folders) n += 1 + countFolders(f.folders);
  return n;
};

export const countDocuments = (folders: FolderSpec[] | undefined): number => {
  if (!folders) return 0;
  let n = 0;
  for (const f of folders) n += (f.documents?.length ?? 0) + countDocuments(f.folders);
  return n;
};
