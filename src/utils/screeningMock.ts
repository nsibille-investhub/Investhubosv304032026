import type { AlertItem, AlertListCategory, InvestorRole } from './alertsGenerator';
import type { Alert as MatchProfile } from './mockData';
import { generateEnrichedAlert } from './enrichedAlertDetails';
import type { AuditEvent as LegacyAuditEvent } from './auditMockData';
import type { EntityLink } from '../components/EntityLinks';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ScreeningSource = 'Membercheck' | 'ORIAS';
export type ScreeningProvider = 'MemberCheck' | 'WorldCheck';
export type EntityKind = 'Individual' | 'Corporate';
export type EntityStatus =
  | 'Pending'
  | 'New Hit'
  | 'True Hit'
  | 'Clear'
  | 'Validated'
  | 'Closed';
export type EntityRiskLevel = 'Low' | 'Medium' | 'High' | 'Pending';
export type MatchDecisionValue = 'true_hit' | 'false_hit' | 'unsure';
export type MatchChange = 'New' | 'Modified' | 'Reopened';
export type MatchAlertKind = 'new' | 'change' | 'reopened';
export type MatchOpenStatus = 'todo' | 'unsure' | 'confirmed' | 'rejected';
export type ParentType = 'Investor' | 'Partner' | 'Participation';
export type ScreeningRunKind = 'initial' | 'manual' | 'ongoing';

export type EntityAuditEventType =
  | 'screening_run'
  | 'match_created'
  | 'match_changed'
  | 'match_reopened'
  | 'decision'
  | 'decision_revised'
  | 'comment'
  | 'assignment'
  | 'monitoring'
  | 'status'
  | 'report'
  | 'export'
  | 'closed';

export interface MatchDecision {
  id: string;
  decision: MatchDecisionValue;
  comment: string;
  analyst: string;
  date: string;
  revision: number;
  supersedesId?: string;
}

export interface MatchAlertEvent {
  id: string;
  kind: MatchAlertKind;
  date: string;
  score: number;
}

export interface ScreeningMatch {
  id: string;
  entityId: number;
  profileName: string;
  score: number;
  categories: AlertListCategory[];
  source: ScreeningSource;
  change: MatchChange | null;
  currentDecision: MatchDecision | null;
  decisions: MatchDecision[];
  alerts: MatchAlertEvent[];
  firstSeen: string;
  lastUpdate: string;
  profile: MatchProfile;
}

export interface IndividualIdentity {
  kind: 'Individual';
  firstName: string;
  lastName: string;
  birthDate: string;
  birthPlace: string;
  nationality: string;
  countryOfResidence: string;
}

export interface CorporateIdentity {
  kind: 'Corporate';
  legalName: string;
  legalForm: string;
  registrationNumber: string;
  incorporationDate: string;
  country: string;
  headOffice: string;
}

export type EntityIdentity = IndividualIdentity | CorporateIdentity;

export interface ScreeningRun {
  id: string;
  kind: ScreeningRunKind;
  date: string;
  matchesFound: number;
  newMatches: number;
  by: string;
}

export interface EntityAuditEvent {
  id: string;
  type: EntityAuditEventType;
  timestamp: string;
  actorName: string;
  actorSublabel?: string;
  actorRole?: string;
  description: string;
  matchName?: string;
  before?: string;
  after?: string;
}

export interface EntityParent {
  type: ParentType;
  name: string;
  entityType: EntityKind;
}

export interface ScreeningEntity {
  id: number;
  uid: string;
  providerRef: string;
  name: string;
  type: EntityKind;
  identity: EntityIdentity;
  relation: InvestorRole;
  parent: EntityParent;
  links: EntityLink[];
  dossierRef: string;
  provider: ScreeningProvider;
  monitoring: boolean;
  analyst: string;
  riskLevel: EntityRiskLevel;
  closed: boolean;
  createdAt: string;
  runs: ScreeningRun[];
  auditTrail: EntityAuditEvent[];
  secondaryStatus: string | null;
}

export interface EntityCounters {
  total: number;
  todo: number;
  unsure: number;
  confirmed: number;
  rejected: number;
  pending: number;
}

/** Row shape consumed by the entities listing (superset of the legacy Entity). */
export interface EntityRow extends ScreeningEntity {
  status: EntityStatus;
  matchTypes: AlertListCategory[];
  hits: number;
  decisions: number;
  pendingMatches: number;
  counters: EntityCounters;
  lastUpdate: {
    timestamp: number;
    iso: string;
  };
  lastScreening: string | null;
  details: {
    alerts: MatchProfile[];
    auditTrail: LegacyAuditEvent[];
  };
}

export interface ScreeningDataset {
  entities: ScreeningEntity[];
  matches: ScreeningMatch[];
}

export interface Actor {
  name: string;
  email: string;
  role: string;
}

export const SYSTEM_ACTOR: Actor = {
  name: 'Système',
  email: 'screening-bot',
  role: 'Système',
};

// ---------------------------------------------------------------------------
// Seeded PRNG so the demo dataset is stable between reloads
// ---------------------------------------------------------------------------

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let rng = mulberry32(20260907);

const rand = () => rng();
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];
const chance = (p: number) => rand() < p;

function shuffle<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function uid(length = 24): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < length; i++) out += chars[Math.floor(rand() * chars.length)];
  return out;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = Date.now();

function daysAgoIso(days: number, hourJitter = true): string {
  const d = new Date(NOW - days * DAY_MS);
  if (hourJitter) {
    d.setHours(randInt(8, 18), randInt(0, 59), randInt(0, 59), 0);
  }
  return d.toISOString();
}

// ---------------------------------------------------------------------------
// Reference data (fictional)
// ---------------------------------------------------------------------------

const INDIVIDUAL_NAMES = [
  'John Smith', 'Sarah Connor', 'Michael Chen', 'Emma Wilson', 'David Rodriguez',
  'Maria Garcia', 'James Brown', 'Sophie Martin', 'Robert Taylor', 'Lisa Anderson',
  'William Martinez', 'Jennifer Lee', 'Richard White', 'Patricia Harris', 'Charles Clark',
  'Nancy Lewis', 'Thomas Walker', 'Betty Hall', 'Christopher Allen', 'Sandra Young',
  'Daniel King', 'Ashley Wright', 'Matthew Lopez', 'Jessica Hill', 'Anthony Scott',
  'Kimberly Green', 'Mark Adams', 'Michelle Baker', 'Paul Nelson', 'Laura Carter',
  'Steven Mitchell', 'Carol Perez', 'Andrew Roberts', 'Sharon Turner', 'Joshua Phillips',
  'Linda Campbell', 'Kevin Parker', 'Donna Evans', 'Brian Edwards', 'Ruth Collins',
  'George Stewart', 'Karen Morris', 'Edward Rogers', 'Susan Reed', 'Ronald Cook',
  'Margaret Morgan', 'Timothy Bell', 'Dorothy Murphy', 'Jason Bailey', 'Lisa Rivera',
];

const CORPORATE_NAMES = [
  'GlobalTrade Ltd.', 'FutureInvest Fund', 'TechNova Inc.', 'Capital Ventures Corp.',
  'Horizon Holdings', 'Summit Capital Partners', 'Evergreen Investments', 'Apex Trading Group',
  'Phoenix Capital Management', 'Sterling Financial Services', 'Meridian Investment Trust',
  'Atlas Global Partners', 'Nexus Capital Group', 'Quantum Asset Management', 'Vanguard Holdings Ltd.',
  'Beacon Investment Corp.', 'Titan Financial Group', 'Prosperity Capital Partners', 'Legacy Wealth Management',
  'Pioneer Investment Fund', 'Zenith Capital Corporation', 'Nova Financial Holdings', 'Omega Investment Trust',
  'Prestige Capital Group', 'Elite Asset Management', 'Prime Investment Partners', 'Royal Capital Holdings',
  'Sovereign Wealth Fund', 'Diamond Capital Corp.', 'Platinum Investment Group', 'Crown Financial Services',
  'Empire Capital Partners', 'Dynasty Investment Holdings', 'Majestic Capital Group', 'Noble Asset Management',
  'Regal Investment Trust', 'Supreme Capital Partners', 'Victory Financial Group', 'Triumph Capital Corp.',
  'Fortune Investment Holdings', 'Premier Asset Management', 'Excellence Capital Group', 'Pinnacle Investment Fund',
  'Summit Trading Corporation', 'Crest Capital Partners', 'Peak Financial Holdings', 'Vertex Investment Group',
  'Catalyst Capital Management', 'Momentum Investment Trust', 'Velocity Capital Partners', 'Synergy Financial Corp.',
];

const INVESTOR_LINK_SUFFIXES = [
  'Capital Fund', 'Investment Trust', 'Ventures LP', 'Partners LLC', 'Asset Management',
  'Holdings Inc.', 'Capital Partners', 'Investment Group', 'Wealth Fund', 'Private Equity',
  'Family Trust', 'Growth Fund', 'Capital Corporation', 'Investment Holdings', 'Equity Partners',
];

const DISTRIBUTOR_LINK_SUFFIXES = [
  'Distribution LLC', 'Trading Group', 'Services Corp.', 'Solutions Inc.', 'Network Partners',
  'Distribution Network', 'Global Distribution', 'Enterprises', 'Distribution Services', 'Trading Partners',
];

const PARTICIPATION_LINK_NAMES = [
  'Technologies Inc.', 'Solutions Ltd.', 'Innovations Corp.', 'Systems Group', 'Digital Services',
  'Tech Ventures', 'Software Solutions', 'Analytics Inc.', 'Cloud Systems', 'Data Services',
  'AI Technologies', 'Biotech Corp.', 'GreenTech Solutions', 'Energy Systems', 'MedTech Inc.',
];

const INVESTOR_PARENTS = [
  'John Smith Holdings',
  'Sarah Connor Family Trust',
  'Michael Chen Investment Fund',
  'Emma Wilson Capital',
  'David Rodriguez Ventures',
];

const PARTNER_PARENTS = [
  'GlobalPartners LLC',
  'Strategic Ventures Group',
  'Alliance Capital Partners',
  'Summit Advisory Services',
  'Premier Distribution Network',
];

const PARTICIPATION_PARENTS = [
  'TechCorp Industries',
  'Digital Solutions Ltd',
  'Innovation Systems Inc',
  'GreenTech Ventures',
  'BioMed Technologies',
];

export const ANALYSTS = [
  'Jean Dault',
  'Sophie Martin',
  'Marc Dubois',
  'Claire Rousseau',
  'Thomas Bernard',
  'Emma Leroy',
];

const RELATIONS: InvestorRole[] = ['source', 'beneficiary', 'coInvestor', 'legalRep', 'proxy'];

const CATEGORIES: AlertListCategory[] = [
  'PEP',
  'Watch List',
  'Sanctions',
  'Adverse Media',
  'Crime',
  'Financial Warning',
];

const ORIAS_CATEGORIES: AlertListCategory[] = ['Watch List', 'Financial Warning'];

const COUNTRIES = [
  'France', 'Belgique', 'Suisse', 'Luxembourg', 'Allemagne', 'Espagne', 'Italie',
  'Royaume-Uni', 'Pays-Bas', 'Portugal', 'Irlande', 'Canada', 'Émirats arabes unis', 'Singapour',
];

const CITIES: Record<string, string[]> = {
  France: ['Paris', 'Lyon', 'Bordeaux', 'Nantes', 'Lille'],
  Belgique: ['Bruxelles', 'Anvers'],
  Suisse: ['Genève', 'Zurich', 'Lausanne'],
  Luxembourg: ['Luxembourg'],
  Allemagne: ['Francfort', 'Munich', 'Berlin'],
  Espagne: ['Madrid', 'Barcelone'],
  Italie: ['Milan', 'Rome'],
  'Royaume-Uni': ['Londres', 'Édimbourg'],
  'Pays-Bas': ['Amsterdam', 'Rotterdam'],
  Portugal: ['Lisbonne', 'Porto'],
  Irlande: ['Dublin'],
  Canada: ['Montréal', 'Toronto'],
  'Émirats arabes unis': ['Dubaï', 'Abou Dabi'],
  Singapour: ['Singapour'],
};

const NATIONALITIES: Record<string, string> = {
  France: 'Française',
  Belgique: 'Belge',
  Suisse: 'Suisse',
  Luxembourg: 'Luxembourgeoise',
  Allemagne: 'Allemande',
  Espagne: 'Espagnole',
  Italie: 'Italienne',
  'Royaume-Uni': 'Britannique',
  'Pays-Bas': 'Néerlandaise',
  Portugal: 'Portugaise',
  Irlande: 'Irlandaise',
  Canada: 'Canadienne',
  'Émirats arabes unis': 'Émirienne',
  Singapour: 'Singapourienne',
};

const LEGAL_FORMS = ['SAS', 'SA', 'SARL', 'Ltd', 'LLC', 'GmbH', 'BV', 'LP', 'SCA'];

const HOMONYM_FIRST_NAMES = [
  'Jonathan', 'Johan', 'Jon', 'Sara', 'Sarah-Jane', 'Mikhail', 'Michel', 'Emmanuel', 'Emmy',
  'Davide', 'Mario', 'Jim', 'Sofia', 'Roberto', 'Elisa', 'Wilhelm', 'Jenna', 'Ricardo', 'Patrizia',
  'Carlos', 'Nancy-Anne', 'Tomas', 'Bettina', 'Kristof', 'Alexandra',
];

const HOMONYM_COMPANY_SUFFIXES = [
  'Holding', 'Group Ltd', 'International', 'Trading Co', 'Partners SA', 'Overseas', 'Capital LLC', 'FZE',
];

const DECISION_COMMENTS: Record<MatchDecisionValue, string[]> = {
  false_hit: [
    'Homonymie : la date de naissance et la nationalité du profil ne correspondent pas à celles de l\'entité.',
    'Profil sans lien avec l\'entité : pays de résidence différent, aucune activité commune identifiée.',
    'Faux positif confirmé après vérification de l\'identifiant d\'immatriculation et de l\'adresse du siège.',
    'Le profil répertorié concerne une personne décédée en 2009, sans rapport avec l\'entité contrôlée.',
  ],
  true_hit: [
    'Correspondance avérée : identifiants, secteur d\'activité et sources concordent. Dossier remonté au responsable conformité.',
    'Profil confirmé après recoupement des pièces d\'identité et des mentions de presse. Vigilance renforcée déclenchée.',
  ],
  unsure: [
    'Éléments insuffisants pour trancher : demande de justificatif d\'identité complémentaire envoyée.',
    'Similitude forte mais date de naissance manquante côté fournisseur. Investigation en cours.',
  ],
};

// ---------------------------------------------------------------------------
// Generation helpers
// ---------------------------------------------------------------------------

function buildIdentity(name: string, type: EntityKind): EntityIdentity {
  const country = pick(COUNTRIES);
  const city = pick(CITIES[country]);
  if (type === 'Individual') {
    const [firstName, ...rest] = name.split(' ');
    const birthYear = randInt(1952, 1994);
    const birthDate = `${birthYear}-${String(randInt(1, 12)).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}`;
    const residence = chance(0.75) ? country : pick(COUNTRIES);
    return {
      kind: 'Individual',
      firstName,
      lastName: rest.join(' '),
      birthDate,
      birthPlace: city,
      nationality: NATIONALITIES[country],
      countryOfResidence: residence,
    };
  }
  const year = randInt(1988, 2023);
  return {
    kind: 'Corporate',
    legalName: name,
    legalForm: pick(LEGAL_FORMS),
    registrationNumber: `${randInt(100, 999)} ${randInt(100, 999)} ${randInt(100, 999)}`,
    incorporationDate: `${year}-${String(randInt(1, 12)).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}`,
    country,
    headOffice: city,
  };
}

function buildLinks(name: string, type: EntityKind): EntityLink[] {
  const count = randInt(1, 4);
  const links: EntityLink[] = [];
  for (let i = 0; i < count; i++) {
    const linkType = pick(['investor', 'distributor', 'participation'] as const);
    let label = '';
    if (linkType === 'investor') {
      label =
        type === 'Individual'
          ? `${name} ${pick(INVESTOR_LINK_SUFFIXES)}`
          : `${name.split(' ')[0]} ${pick(INVESTOR_LINK_SUFFIXES)}`;
    } else if (linkType === 'distributor') {
      label =
        type === 'Individual'
          ? `${name.split(' ')[1] ?? name} ${pick(DISTRIBUTOR_LINK_SUFFIXES)}`
          : `${name.split(' ')[0]} ${pick(DISTRIBUTOR_LINK_SUFFIXES)}`;
    } else {
      label = pick(PARTICIPATION_LINK_NAMES);
    }
    const link: EntityLink = {
      id: `l${uid(9)}`,
      type: linkType,
      reference: `${linkType.charAt(0).toUpperCase() + linkType.slice(1)} #${randInt(100, 999)}`,
      name: label,
      amount: `$${randInt(500000, 50000000).toLocaleString('en-US')}`,
      date: `${randInt(2022, 2025)}-${String(randInt(1, 12)).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}`,
      status: pick(['Active', 'Pending', 'Inactive']),
    };
    if (linkType !== 'investor') {
      link.percentage = `${(rand() * 25 + 1).toFixed(1)}%`;
    }
    links.push(link);
  }
  return links;
}

function buildParent(): EntityParent {
  const type = pick(['Investor', 'Partner', 'Participation'] as const);
  if (type === 'Investor') {
    return { type, name: pick(INVESTOR_PARENTS), entityType: chance(0.5) ? 'Individual' : 'Corporate' };
  }
  if (type === 'Partner') {
    return { type, name: pick(PARTNER_PARENTS), entityType: 'Corporate' };
  }
  return { type, name: pick(PARTICIPATION_PARENTS), entityType: 'Corporate' };
}

function homonymFor(name: string, type: EntityKind, index: number): string {
  if (type === 'Individual') {
    const parts = name.split(' ');
    const last = parts[parts.length - 1];
    const variant = index % 3;
    if (variant === 0) return `${pick(HOMONYM_FIRST_NAMES)} ${last}`;
    if (variant === 1) return `${parts[0]} ${String.fromCharCode(65 + randInt(0, 25))}. ${last}`;
    return `${last.toUpperCase()} ${parts[0]}`;
  }
  const base = name.replace(/\b(Ltd\.|Inc\.|Corp\.|Fund|Group|Holdings|Partners|Trust|Management)\b/g, '').trim();
  const variant = index % 3;
  if (variant === 0) return `${base} ${pick(HOMONYM_COMPANY_SUFFIXES)}`;
  if (variant === 1) return `${base.split(' ')[0]} ${pick(HOMONYM_COMPANY_SUFFIXES)}`;
  return `${base.toUpperCase()} OOO`;
}

function decisionComment(decision: MatchDecisionValue): string {
  return pick(DECISION_COMMENTS[decision]);
}

interface MatchScenario {
  count: number;
}

function matchScenario(): MatchScenario {
  const roll = rand();
  if (roll < 0.3) return { count: 0 };
  if (roll < 0.7) return { count: randInt(1, 3) };
  if (roll < 0.95) return { count: randInt(4, 8) };
  return { count: randInt(9, 14) };
}

function shortActor(name: string): Actor {
  const [first, last] = name.split(' ');
  return {
    name,
    email: `${first.toLowerCase()}.${(last ?? '').toLowerCase()}@investhub.cloud`,
    role: 'Compliance officer',
  };
}

// ---------------------------------------------------------------------------
// Dataset generation
// ---------------------------------------------------------------------------

export function generateScreeningDataset(count = 100, seed = 20260907): ScreeningDataset {
  rng = mulberry32(seed);

  const individuals = shuffle(INDIVIDUAL_NAMES);
  const corporates = shuffle(CORPORATE_NAMES);
  const entities: ScreeningEntity[] = [];
  const matches: ScreeningMatch[] = [];

  let matchCounter = 0;
  let eventCounter = 0;
  const nextEventId = () => `evt-${++eventCounter}`;

  for (let i = 0; i < count; i++) {
    const type: EntityKind = i % 2 === 0 ? 'Individual' : 'Corporate';
    const pool = type === 'Individual' ? individuals : corporates;
    const baseName = pool[Math.floor(i / 2) % pool.length];
    const name = i >= pool.length * 2 ? `${baseName} (${Math.floor(i / (pool.length * 2)) + 1})` : baseName;

    const parent = buildParent();
    const analyst = pick(ANALYSTS);
    const createdDaysAgo = randInt(20, 420);
    const createdAt = daysAgoIso(createdDaysAgo);
    const monitoring = chance(0.8);
    const provider: ScreeningProvider = 'MemberCheck';
    const entityId = i + 1;
    const scenario = matchScenario();

    const runs: ScreeningRun[] = [];
    const audit: EntityAuditEvent[] = [];
    const actor = shortActor(analyst);

    audit.push({
      id: nextEventId(),
      type: 'status',
      timestamp: createdAt,
      actorName: SYSTEM_ACTOR.name,
      actorSublabel: SYSTEM_ACTOR.email,
      actorRole: SYSTEM_ACTOR.role,
      description: 'entity_created',
      after: parent.name,
    });

    // Initial run
    const initialRun: ScreeningRun = {
      id: `run-${entityId}-1`,
      kind: 'initial',
      date: createdAt,
      matchesFound: 0,
      newMatches: 0,
      by: SYSTEM_ACTOR.name,
    };
    runs.push(initialRun);

    // Manual rerun for some entities
    const manualRunDaysAgo = chance(0.35) ? randInt(5, Math.max(6, createdDaysAgo - 5)) : null;
    if (manualRunDaysAgo !== null) {
      runs.push({
        id: `run-${entityId}-2`,
        kind: 'manual',
        date: daysAgoIso(manualRunDaysAgo),
        matchesFound: 0,
        newMatches: 0,
        by: analyst,
      });
    }

    // Ongoing run for monitored entities
    const ongoingDaysAgo = monitoring && chance(0.55) ? randInt(1, Math.min(30, Math.max(2, createdDaysAgo - 2))) : null;
    if (ongoingDaysAgo !== null) {
      runs.push({
        id: `run-${entityId}-${runs.length + 1}`,
        kind: 'ongoing',
        date: daysAgoIso(ongoingDaysAgo),
        matchesFound: 0,
        newMatches: 0,
        by: SYSTEM_ACTOR.name,
      });
    }

    const entityMatches: ScreeningMatch[] = [];
    const usesOrias = parent.type === 'Partner' && chance(0.5);

    for (let m = 0; m < scenario.count; m++) {
      matchCounter += 1;
      const isOrias = usesOrias && chance(0.6);
      const source: ScreeningSource = isOrias ? 'ORIAS' : 'Membercheck';
      const categoryPool = isOrias ? ORIAS_CATEGORIES : CATEGORIES;
      const categoryCount = isOrias ? 1 : randInt(1, 3);
      const categories = shuffle(categoryPool).slice(0, categoryCount);

      // Where does the match come from: the initial run or the ongoing run?
      const ongoingRunRef = runs.find((r) => r.kind === 'ongoing');
      const fromOngoing = ongoingRunRef !== undefined && chance(0.3);
      const firstSeenDaysAgo = fromOngoing ? ongoingDaysAgo! : createdDaysAgo;
      const firstSeen = fromOngoing ? ongoingRunRef!.date : createdAt;

      const profile = generateEnrichedAlert(matchCounter, name, 'Pending');
      const profileName = homonymFor(name, type, matchCounter);
      const score = fromOngoing ? randInt(70, 97) : randInt(62, 99);

      const alerts: MatchAlertEvent[] = [
        { id: `${matchCounter}-a1`, kind: 'new', date: firstSeen, score },
      ];

      const decisions: MatchDecision[] = [];
      let currentDecision: MatchDecision | null = null;
      let change: MatchChange | null = fromOngoing ? 'New' : null;
      let lastUpdate = firstSeen;

      const decided = !fromOngoing && chance(0.62);
      if (decided) {
        const roll = rand();
        const value: MatchDecisionValue = roll < 0.68 ? 'false_hit' : roll < 0.88 ? 'true_hit' : 'unsure';
        const decisionDaysAgo = Math.max(1, firstSeenDaysAgo - randInt(1, 6));
        const decisionDate = daysAgoIso(decisionDaysAgo);
        const decision: MatchDecision = {
          id: `dec-${matchCounter}-1`,
          decision: value,
          comment: decisionComment(value),
          analyst,
          date: decisionDate,
          revision: 1,
        };
        decisions.push(decision);
        currentDecision = decision;
        lastUpdate = decisionDate;
        change = null;

        // Some rejected matches were revised or reopened by the ongoing screening
        if (value === 'false_hit' && ongoingRunRef && chance(0.18)) {
          const reopenDate = ongoingRunRef.date;
          alerts.push({ id: `${matchCounter}-a2`, kind: 'reopened', date: reopenDate, score: Math.min(99, score + randInt(4, 12)) });
          change = 'Reopened';
          lastUpdate = reopenDate;
        } else if (value === 'unsure' && chance(0.4)) {
          const revisedDaysAgo = Math.max(1, decisionDaysAgo - randInt(1, 5));
          const revised: MatchDecision = {
            id: `dec-${matchCounter}-2`,
            decision: chance(0.7) ? 'false_hit' : 'true_hit',
            comment: 'Réponse de l\'investisseur reçue : pièce d\'identité complémentaire analysée.',
            analyst: pick(ANALYSTS),
            date: daysAgoIso(revisedDaysAgo),
            revision: 2,
            supersedesId: decision.id,
          };
          decisions.push(revised);
          currentDecision = revised;
          lastUpdate = revised.date;
        }
      } else if (!fromOngoing && ongoingRunRef && chance(0.35)) {
        // Still open, and the ongoing screening changed the data
        const changeDate = ongoingRunRef.date;
        alerts.push({ id: `${matchCounter}-a2`, kind: 'change', date: changeDate, score: Math.min(99, score + randInt(1, 6)) });
        change = 'Modified';
        lastUpdate = changeDate;
      }

      const effectiveScore = alerts[alerts.length - 1].score;
      profile.name = profileName;
      profile.similarity = effectiveScore;
      profile.decision = currentDecision?.decision ?? null;
      profile.comment = currentDecision?.comment ?? '';
      profile.analyst = currentDecision?.analyst ?? '';
      profile.date = lastUpdate.split('T')[0];
      profile.id = `m-${matchCounter}`;

      const match: ScreeningMatch = {
        id: `m-${matchCounter}`,
        entityId,
        profileName,
        score: effectiveScore,
        categories,
        source,
        change,
        currentDecision,
        decisions,
        alerts,
        firstSeen,
        lastUpdate,
        profile,
      };
      entityMatches.push(match);
      matches.push(match);
    }

    // Fill run counters: a run "finds" every match first seen at or before it,
    // and "creates" the matches whose first alert carries its date.
    runs.forEach((run) => {
      const runTime = new Date(run.date).getTime();
      run.matchesFound = entityMatches.filter((mt) => new Date(mt.firstSeen).getTime() <= runTime).length;
      run.newMatches = entityMatches.filter((mt) => mt.firstSeen === run.date).length;
    });

    // Audit trail
    runs.forEach((run) => {
      audit.push({
        id: nextEventId(),
        type: 'screening_run',
        timestamp: run.date,
        actorName: run.by,
        actorSublabel: run.kind === 'manual' ? shortActor(run.by).email : SYSTEM_ACTOR.email,
        actorRole: run.kind === 'manual' ? 'Compliance officer' : SYSTEM_ACTOR.role,
        description: `run_${run.kind}`,
        after: String(run.matchesFound),
      });
    });

    audit.push({
      id: nextEventId(),
      type: 'assignment',
      timestamp: daysAgoIso(Math.max(1, createdDaysAgo - 1)),
      actorName: 'Jean Dault',
      actorSublabel: 'jean.dault@investhub.cloud',
      actorRole: 'Compliance lead',
      description: 'assigned',
      after: analyst,
    });

    if (!monitoring) {
      audit.push({
        id: nextEventId(),
        type: 'monitoring',
        timestamp: daysAgoIso(Math.max(1, createdDaysAgo - randInt(1, 3))),
        actorName: actor.name,
        actorSublabel: actor.email,
        actorRole: actor.role,
        description: 'monitoring_off',
      });
    }

    entityMatches.forEach((mt) => {
      mt.alerts.forEach((al) => {
        audit.push({
          id: nextEventId(),
          type: al.kind === 'new' ? 'match_created' : al.kind === 'change' ? 'match_changed' : 'match_reopened',
          timestamp: al.date,
          actorName: SYSTEM_ACTOR.name,
          actorSublabel: SYSTEM_ACTOR.email,
          actorRole: SYSTEM_ACTOR.role,
          description: al.kind,
          matchName: mt.profileName,
          after: `${al.score}%`,
        });
      });
      mt.decisions.forEach((dec) => {
        const who = shortActor(dec.analyst);
        audit.push({
          id: nextEventId(),
          type: dec.revision > 1 ? 'decision_revised' : 'decision',
          timestamp: dec.date,
          actorName: who.name,
          actorSublabel: who.email,
          actorRole: who.role,
          description: dec.decision,
          matchName: mt.profileName,
          before: dec.supersedesId ? mt.decisions.find((d) => d.id === dec.supersedesId)?.decision : undefined,
          after: dec.decision,
        });
        audit.push({
          id: nextEventId(),
          type: 'comment',
          timestamp: dec.date,
          actorName: who.name,
          actorSublabel: who.email,
          actorRole: who.role,
          description: dec.comment,
          matchName: mt.profileName,
        });
      });
    });

    audit.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const hasTrueHit = entityMatches.some((mt) => mt.currentDecision?.decision === 'true_hit');
    const hasOpen = entityMatches.some((mt) => matchOpenStatus(mt) === 'todo' || matchOpenStatus(mt) === 'unsure');
    const riskLevel: EntityRiskLevel = hasTrueHit
      ? 'High'
      : hasOpen
        ? pick(['Pending', 'Medium', 'Low'])
        : entityMatches.length === 0
          ? 'Low'
          : pick(['Low', 'Low', 'Medium']);

    entities.push({
      id: entityId,
      uid: uid(),
      providerRef: uid(25),
      name,
      type,
      identity: buildIdentity(name, type),
      relation: pick(RELATIONS),
      parent,
      links: buildLinks(name, type),
      dossierRef: `KYC-2026-${String(entityId).padStart(3, '0')}`,
      provider,
      monitoring,
      analyst,
      riskLevel,
      closed: false,
      createdAt,
      runs,
      auditTrail: audit,
      secondaryStatus: chance(0.15) ? pick(['rejected', 'archived', 'deleted', 'flagged']) : null,
    });
  }

  return { entities, matches };
}

// ---------------------------------------------------------------------------
// Derivations
// ---------------------------------------------------------------------------

export function matchOpenStatus(match: ScreeningMatch): MatchOpenStatus {
  if (match.change === 'Reopened') return 'todo';
  if (!match.currentDecision) return 'todo';
  if (match.currentDecision.decision === 'unsure') return 'unsure';
  if (match.currentDecision.decision === 'true_hit') return 'confirmed';
  return 'rejected';
}

export function matchNeedsAction(match: ScreeningMatch): boolean {
  const status = matchOpenStatus(match);
  return status === 'todo' || status === 'unsure';
}

export function computeCounters(entityMatches: ScreeningMatch[]): EntityCounters {
  const counters: EntityCounters = {
    total: entityMatches.length,
    todo: 0,
    unsure: 0,
    confirmed: 0,
    rejected: 0,
    pending: 0,
  };
  entityMatches.forEach((mt) => {
    const status = matchOpenStatus(mt);
    counters[status] += 1;
  });
  counters.pending = counters.todo + counters.unsure;
  return counters;
}

export function deriveEntityStatus(entity: ScreeningEntity, entityMatches: ScreeningMatch[]): EntityStatus {
  if (entity.closed) return 'Closed';
  if (entityMatches.length === 0) return 'Clear';
  const counters = computeCounters(entityMatches);
  const hasFreshHit = entityMatches.some(
    (mt) => matchOpenStatus(mt) === 'todo' && (mt.change === 'New' || mt.change === 'Reopened'),
  );
  if (hasFreshHit) return 'New Hit';
  if (counters.pending > 0) return 'Pending';
  if (counters.confirmed > 0) return 'True Hit';
  return 'Validated';
}

function toLegacyAuditEvent(event: EntityAuditEvent): LegacyAuditEvent {
  const typeMap: Record<EntityAuditEventType, LegacyAuditEvent['type']> = {
    screening_run: 'field_updated',
    match_created: 'alert_created',
    match_changed: 'alert_created',
    match_reopened: 'alert_created',
    decision: 'decision_change',
    decision_revised: 'decision_change',
    comment: 'comment_added',
    assignment: 'assignment_change',
    monitoring: 'field_updated',
    status: 'status_change',
    report: 'field_updated',
    export: 'field_updated',
    closed: 'status_change',
  };
  return {
    id: event.id,
    type: typeMap[event.type],
    timestamp: event.timestamp,
    user: {
      name: event.actorName,
      avatar: event.actorName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      email: event.actorSublabel ?? '',
    },
    action: event.description,
    alertName: event.matchName,
    details: event.before || event.after ? { before: event.before, after: event.after } : undefined,
    comment: event.type === 'comment' ? event.description : undefined,
  };
}

export function buildEntityRow(entity: ScreeningEntity, entityMatches: ScreeningMatch[]): EntityRow {
  const counters = computeCounters(entityMatches);
  const status = deriveEntityStatus(entity, entityMatches);
  const matchTypes = Array.from(new Set(entityMatches.flatMap((mt) => mt.categories)));
  const decisions = entityMatches.filter((mt) => mt.currentDecision !== null).length;
  const timestamps = [
    ...entityMatches.map((mt) => new Date(mt.lastUpdate).getTime()),
    ...entity.runs.map((r) => new Date(r.date).getTime()),
    ...(entity.auditTrail[0] ? [new Date(entity.auditTrail[0].timestamp).getTime()] : []),
  ];
  const lastTs = timestamps.length ? Math.max(...timestamps) : new Date(entity.createdAt).getTime();
  const lastRun = [...entity.runs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  return {
    ...entity,
    status,
    matchTypes,
    hits: entityMatches.length,
    decisions,
    pendingMatches: counters.pending,
    counters,
    lastUpdate: { timestamp: lastTs, iso: new Date(lastTs).toISOString() },
    lastScreening: lastRun?.date ?? null,
    details: {
      alerts: entityMatches.map((mt) => mt.profile),
      auditTrail: entity.auditTrail.map(toLegacyAuditEvent),
    },
  };
}

export function buildEntityRows(dataset: ScreeningDataset): EntityRow[] {
  const byEntity = groupMatchesByEntity(dataset.matches);
  return dataset.entities.map((entity) => buildEntityRow(entity, byEntity.get(entity.id) ?? []));
}

export function groupMatchesByEntity(matches: ScreeningMatch[]): Map<number, ScreeningMatch[]> {
  const map = new Map<number, ScreeningMatch[]>();
  matches.forEach((mt) => {
    const list = map.get(mt.entityId);
    if (list) list.push(mt);
    else map.set(mt.entityId, [mt]);
  });
  return map;
}

export function matchToAlertItem(
  match: ScreeningMatch,
  entity: ScreeningEntity,
  siblings: ScreeningMatch[],
): AlertItem {
  const status = matchOpenStatus(match);
  const daysAgo = Math.max(0, Math.floor((NOW - new Date(match.lastUpdate).getTime()) / DAY_MS));
  const previousFindings = Array.from(
    new Set(
      siblings
        .filter((mt) => mt.id !== match.id && mt.currentDecision && mt.currentDecision.decision !== 'unsure')
        .flatMap((mt) => mt.categories),
    ),
  );
  return {
    id: match.id,
    name: match.profileName,
    entityName: entity.name,
    entityUid: entity.uid,
    changes: match.change,
    match: match.score,
    status: status === 'confirmed' ? 'Confirmed' : status === 'rejected' ? 'Rejected' : 'Pending',
    date: match.lastUpdate.split('T')[0],
    alert: {
      ...match.profile,
      decision: match.currentDecision?.decision ?? null,
      comment: match.currentDecision?.comment ?? '',
      analyst: match.currentDecision?.analyst ?? '',
      similarity: match.score,
    },
    source: match.source,
    daysAgo,
    alertList: match.categories[0] ?? 'Watch List',
    alertTypes: match.categories,
    attachedInvestors: [
      { name: entity.parent.name, role: entity.relation },
      ...entity.links
        .filter((l) => l.type === 'investor')
        .slice(0, 2)
        .map((l) => ({ name: l.name, role: 'coInvestor' as InvestorRole })),
    ],
    previousFindings,
    monitoring: entity.monitoring,
    analyst: entity.analyst,
    dossier: `${entity.dossierRef} · ${entity.parent.name}`,
  };
}

export function buildAlertItems(dataset: ScreeningDataset): AlertItem[] {
  const byEntity = groupMatchesByEntity(dataset.matches);
  const entityById = new Map(dataset.entities.map((e) => [e.id, e]));
  return dataset.matches
    .map((mt) => {
      const entity = entityById.get(mt.entityId);
      if (!entity || entity.closed) return null;
      return matchToAlertItem(mt, entity, byEntity.get(mt.entityId) ?? []);
    })
    .filter((item): item is AlertItem => item !== null)
    .sort((a, b) => a.daysAgo - b.daysAgo);
}

export function createDecision(
  match: ScreeningMatch,
  decision: MatchDecisionValue,
  comment: string,
  analyst: string,
  date = new Date().toISOString(),
): MatchDecision {
  const previous = match.currentDecision;
  return {
    id: `dec-${match.id}-${match.decisions.length + 1}`,
    decision,
    comment,
    analyst,
    date,
    revision: (previous?.revision ?? 0) + 1,
    supersedesId: previous?.id,
  };
}
