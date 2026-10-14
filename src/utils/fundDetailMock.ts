import type { Fund } from './fundGenerator';
import type { FundStatus } from '../components/FundStatusBadge';
import type { DayMonthValue } from '../components/ui/day-month-picker';
import type { Frequency } from '../components/ui/frequency-day-field';

/**
 * Données de démonstration du détail d'un fonds (PRD Détail d'un fonds V3).
 * Tout ce qui relève d'une règle métier (statut, actions permises, manques de
 * configuration, valeurs attendues non saisies, blocages de suppression) est
 * fourni ici comme une réponse du serveur : la page l'affiche sans le recalculer.
 */

export type FundType = 'standalone' | 'parent' | 'compartment';
export type PaymentMode = 'calls' | 'direct';
export type SubscriptionChannel = 'online' | 'distributors' | 'direct';
export type InvestorSegment = 'professional' | 'wellInformed' | 'retail';
export type PendingSubscriptionStatus = 'onboarding' | 'compliance' | 'signature' | 'payment';
export type MissingConfigKey = 'sharePrice' | 'onboarding' | 'subscriptionContract' | 'signatory' | 'iban';

export type FundScenario =
  | 'default'
  | 'draft'
  | 'compartment'
  | 'master'
  | 'mirror'
  | 'evergreen'
  | 'archived'
  | 'locked'
  | 'sendingNotices'
  | 'readOnly';

export const FUND_SCENARIOS: FundScenario[] = [
  'default',
  'draft',
  'compartment',
  'master',
  'mirror',
  'evergreen',
  'archived',
  'locked',
  'sendingNotices',
  'readOnly',
];

export interface FundShare {
  id: string;
  name: string;
  isin: string;
  mode: 'perShare' | 'perAmount';
  nominalPrice: number | null;
  /** Prix utilisé pour calculer la souscription (PRD section 15.3). */
  referencePrice: 'nominal' | 'lastNav';
  managementFee: number;
  entryFee: number;
  subscribed: number;
  called: number;
  lastNav: { value: number; date: Date } | null;
  restricted: boolean;
  carried: boolean;
  lemonwayDebit: boolean;
  closed: boolean;
  allowsRedemption: boolean;
  /** Objets portés par la part : ils bloquent sa suppression (calcul serveur). */
  counts: { subscriptions: number; navs: number; operations: number };
}

/** Quatre parts de démonstration : A à la part, B au montant, C restreinte, D fermée. */
const SHARE_NAMES = ['A', 'B', 'C', 'D'];

/** Effets déjà produits par une valeur liquidative (PRD section 11.2). */
export type NavProducedEffect = 'redemptions' | 'subscriptions' | 'nominal' | 'secondary';

export interface NavEntryMeta {
  /** Nom du justificatif déposé, ou null. */
  proof: string | null;
  produced: NavProducedEffect[];
  /** Prix nominal avant remplacement par cette valeur, pour l'annulation. */
  previousNominal?: number | null;
}

export interface FundNavRow {
  date: Date;
  values: Record<string, number | null>;
  netAsset: number | null;
  /** Justificatif et effets produits, par part. */
  meta: Record<string, NavEntryMeta>;
}

/** Cible d'un lien "Configuration à compléter" : onglet, section et champ. */
export interface FieldTarget {
  tab: 'settings' | 'shares' | 'contracts';
  sectionId: string;
  fieldId: string;
}

export interface MissingConfigItem {
  key: MissingConfigKey;
  target: FieldTarget;
  /** Précision fournie par le serveur, par exemple le nom de la part. */
  detail?: string;
}

export interface FundRights {
  edit: boolean;
  publish: boolean;
  archive: boolean;
  delete: boolean;
  duplicate: boolean;
  /** Droit "Restreindre une part" à certains opérateurs. */
  restrictShare: boolean;
}

export interface FundDetail {
  id: number;
  name: string;
  adminName: string;
  initials: string;
  color: string;
  legalForm: string;
  managementCompany: string;
  depositary: string;
  fundType: FundType;
  parent: { id: number; name: string } | null;
  compartmentsCount: number;
  isMaster: boolean;
  mirrorsCount: number;
  mirrorOf: { id: number; name: string } | null;
  status: FundStatus;
  /** Statut à restaurer au désarchivage, calculé par le serveur. */
  statusBeforeArchive: FundStatus;
  currency: string;
  paymentMode: PaymentMode;
  collectionStart: Date | null;
  collectionEnd: Date | null;
  closingDate: Date | null;
  evergreen: boolean;
  liquidityWindow: { from: DayMonthValue; to: DayMonthValue } | null;
  nextCentralization: Date | null;
  navFrequency: Frequency;
  createdBy: string;
  createdAt: Date;
  archived: { date: Date; author: string } | null;
  locked: { date: Date; reason: string } | null;
  sendingNotices: boolean;
  rights: FundRights;
  /** Modules et droits qui conditionnent les onglets (PRD section 6.2). */
  modules: {
    partners: boolean;
    contracts: boolean;
    operations: boolean;
    secondaryMarket: boolean;
    lemonway: boolean;
    apiKey: boolean;
    salesforce: boolean;
    advancedSignature: boolean;
  };
  /** Langues de l'application : les champs riches s'éditent par langue. */
  languages: string[];
  // Vue d'ensemble
  subscribed: number;
  targetSize: number | null;
  investors: number;
  pendingSubscriptions: { status: PendingSubscriptionStatus; count: number }[];
  called: number;
  lastCall: { date: Date; amount: number } | null;
  distributed: number;
  lastDistribution: { date: Date; amount: number } | null;
  netAsset: { value: number; date: Date } | null;
  /** Parts dont la valeur attendue selon la fréquence n'a pas été saisie (calcul serveur). */
  expectedNavMissing: { shareId: string; expectedDate: Date }[];
  channels: SubscriptionChannel[];
  distributorsCount: number;
  segments: InvestorSegment[];
  /** Contrôles de configuration minimale (PRD section 7) : total et manques, calculés par le serveur. */
  configChecksTotal: number;
  missingConfig: MissingConfigItem[];
  /** Objets qui empêchent la suppression (PRD section 9.3), calculés par le serveur. */
  deleteBlockers: { subscriptions: number; operations: number; navs: number; contracts: number };
  shares: FundShare[];
  navs: FundNavRow[];
  counts: { documents: number; distributors: number; secondaryMarket: number; controls: number };
  settings: {
    externalId: string;
    countries: string[];
    onboarding: string | null;
    subscriptionContract: string | null;
    signatories: string[];
    iban: string | null;
    performanceIndicator: 'irr' | 'performance' | 'none';
  };
}

const FIRST_NAMES = ['Camille', 'Julien', 'Léa', 'Hugo', 'Inès', 'Paul', 'Chloé', 'Nathan'];
const COLORS_TOKENS = ['--chart-1', '--chart-2', '--chart-3', '--brand-primary-light', '--success'];
const PARENT_NAMES = ['Fonds Horizon Croissance', 'Fonds Atlas Patrimoine', 'Fonds Cèdre Innovation'];
const DEPOSITARIES = ['Banque Lumen', 'Dépositaire Arcadie', 'Banque Vauban Titres'];
const MANAGEMENT_COMPANIES = ['Orée Gestion', 'Lignes Capital', 'Sextant Partenaires'];

function seeded(seed: number) {
  let state = seed * 9301 + 49297;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

const addMonths = (date: Date, months: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

const endOfQuarter = (date: Date) => new Date(date.getFullYear(), Math.floor(date.getMonth() / 3) * 3 + 3, 0);

const readToken = (token: string) =>
  typeof document === 'undefined'
    ? ''
    : getComputedStyle(document.documentElement).getPropertyValue(token).trim();

export function buildFundDetail(fund: Fund, scenario: FundScenario, today = new Date()): FundDetail {
  const random = seeded(fund.id);
  const pick = <T,>(items: T[]) => items[Math.floor(random() * items.length)];
  const round = (value: number, step: number) => Math.round(value / step) * step;

  const shares: FundShare[] = SHARE_NAMES.map((name, index) => {
    const closed = index === 3;
    const subscribed = closed ? round(fund.totalCommitments * 0.05, 1000) : round((fund.totalCommitments * 0.95) / 3, 1000);
    return {
      id: `share-${index}`,
      name,
      isin: fund.shareClasses[index]?.isin ?? `FR00${String(fund.id).padStart(6, '0')}${index + 1}${index + 3}`,
      mode: index === 1 ? 'perAmount' : 'perShare',
      nominalPrice: index === 1 ? 1 : 100 * (index + 1),
      referencePrice: index === 0 ? 'lastNav' : 'nominal',
      managementFee: round(1.5 + random(), 0.05),
      entryFee: round(random() * 4, 0.5),
      subscribed,
      called: round(subscribed * (0.3 + random() * 0.5), 1000),
      lastNav: { value: round(100 * (index + 1) * (0.9 + random() * 0.4), 0.01), date: endOfQuarter(addMonths(today, -3)) },
      restricted: index === 2,
      carried: index === 2,
      lemonwayDebit: index === 0,
      closed,
      allowsRedemption: false,
      counts: { subscriptions: 8 + Math.floor(random() * 30), navs: 6, operations: 2 + Math.floor(random() * 4) },
    };
  });

  const navDates = Array.from({ length: 6 }, (_, index) => endOfQuarter(addMonths(today, -3 * (index + 1))));
  const navs: FundNavRow[] = navDates.map((date, rowIndex) => ({
    date,
    values: Object.fromEntries(
      shares.map(share => [share.id, round((share.lastNav?.value ?? 100) * (1 - rowIndex * 0.015), 0.01)]),
    ),
    netAsset: round(fund.aum * (1 - rowIndex * 0.02), 1000),
    meta: Object.fromEntries(
      shares.map(share => [
        share.id,
        {
          proof: `VL-${share.name}-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}.pdf`,
          // Part C : valeurs sans effet produit (pas de rachat ni de souscription en attente).
          produced: share.name === 'C' ? [] : rowIndex === 0 ? ['redemptions', 'subscriptions', 'secondary'] : ['redemptions', 'subscriptions'],
        } satisfies NavEntryMeta,
      ]),
    ),
  }));

  const paymentMode: PaymentMode = random() > 0.35 ? 'calls' : 'direct';
  const collectionStart = addMonths(today, -8);
  const collectionEnd = addMonths(today, 4);
  const createdBy = pick(FIRST_NAMES);

  const detail: FundDetail = {
    id: fund.id,
    name: fund.name,
    adminName: `${fund.name} SAS`,
    initials: fund.name
      .split(' ')
      .filter(word => /^[A-Za-zÀ-ÿ]/.test(word))
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase(),
    color: readToken(pick(COLORS_TOKENS)) || '#1a5666',
    legalForm: fund.type,
    managementCompany: pick(MANAGEMENT_COMPANIES),
    depositary: pick(DEPOSITARIES),
    fundType: 'standalone',
    parent: null,
    compartmentsCount: 0,
    isMaster: false,
    mirrorsCount: 0,
    mirrorOf: null,
    status: 'collecting',
    statusBeforeArchive: 'collecting',
    currency: fund.currency,
    paymentMode,
    collectionStart,
    collectionEnd,
    closingDate: addMonths(today, 96),
    evergreen: false,
    liquidityWindow: null,
    nextCentralization: null,
    navFrequency: 'quarterly',
    createdBy,
    createdAt: addMonths(today, -10),
    archived: null,
    locked: null,
    sendingNotices: false,
    rights: { edit: true, publish: true, archive: true, delete: true, duplicate: true, restrictShare: true },
    modules: {
      partners: true,
      contracts: true,
      operations: true,
      secondaryMarket: true,
      lemonway: true,
      apiKey: true,
      salesforce: true,
      advancedSignature: true,
    },
    languages: ['fr', 'en'],
    subscribed: fund.totalCommitments,
    targetSize: round(fund.totalCommitments * (1.2 + random() * 0.8), 1_000_000),
    investors: fund.investors,
    pendingSubscriptions: [
      { status: 'onboarding', count: 2 + Math.floor(random() * 8) },
      { status: 'compliance', count: 1 + Math.floor(random() * 5) },
      { status: 'signature', count: Math.floor(random() * 4) },
      { status: 'payment', count: 1 + Math.floor(random() * 3) },
    ],
    called: paymentMode === 'calls' ? fund.totalCalled : fund.totalCommitments,
    lastCall: paymentMode === 'calls' ? { date: addMonths(today, -2), amount: round(fund.totalCalled * 0.15, 1000) } : null,
    distributed: fund.totalDistributed,
    lastDistribution:
      fund.totalDistributed > 0 ? { date: addMonths(today, -5), amount: round(fund.totalDistributed * 0.3, 1000) } : null,
    netAsset: { value: navs[0].netAsset ?? fund.aum, date: navs[0].date },
    expectedNavMissing: [],
    channels: ['online', 'distributors'],
    distributorsCount: fund.distributors,
    segments: ['professional', 'wellInformed'],
    configChecksTotal: paymentMode === 'calls' ? 5 : 4,
    missingConfig: [
      {
        key: 'signatory',
        target: { tab: 'settings', sectionId: 'signature', fieldId: 'mainSignatory' },
      },
    ],
    deleteBlockers: {
      subscriptions: fund.subscriptions,
      operations: 3 + Math.floor(random() * 6),
      navs: navs.length * shares.length,
      contracts: 1 + Math.floor(random() * 2),
    },
    shares,
    navs,
    counts: {
      documents: 4 + Math.floor(random() * 10),
      distributors: fund.distributors,
      secondaryMarket: Math.floor(random() * 3),
      controls: 1 + Math.floor(random() * 4),
    },
    settings: {
      externalId: `SF-${String(fund.id).padStart(5, '0')}`,
      countries: ['France', 'Luxembourg'],
      onboarding: 'Onboarding particuliers 2026',
      subscriptionContract: 'Bulletin de souscription 2026',
      signatories: [],
      iban: paymentMode === 'calls' ? null : 'FR76 •••• •••• •••• •••• •••• 042',
      performanceIndicator: 'irr',
    },
  };

  if (detail.paymentMode === 'calls' && !detail.settings.iban) {
    detail.missingConfig.push({ key: 'iban', target: { tab: 'settings', sectionId: 'banking', fieldId: 'iban' } });
  }

  // Valeur attendue non saisie : le serveur compare la fréquence de valorisation à la dernière date saisie.
  if (shares.length > 0) {
    // Part B : la valeur attendue au dernier trimestre n'a pas été saisie.
    const lastShare = shares[1];
    detail.expectedNavMissing.push({ shareId: lastShare.id, expectedDate: navs[0].date });
    navs[0].values[lastShare.id] = null;
    delete navs[0].meta[lastShare.id];
    lastShare.lastNav = { value: navs[1].values[lastShare.id] ?? 100, date: navs[1].date };
  }

  return applyScenario(detail, scenario, today);
}

function applyScenario(detail: FundDetail, scenario: FundScenario, today: Date): FundDetail {
  switch (scenario) {
    case 'draft':
      detail.status = 'draft';
      detail.statusBeforeArchive = 'draft';
      detail.collectionStart = addMonths(today, 2);
      detail.collectionEnd = addMonths(today, 14);
      detail.subscribed = 0;
      detail.investors = 0;
      detail.called = 0;
      detail.lastCall = null;
      detail.distributed = 0;
      detail.lastDistribution = null;
      detail.netAsset = null;
      detail.navs = [];
      detail.expectedNavMissing = [];
      detail.pendingSubscriptions = detail.pendingSubscriptions.map(item => ({ ...item, count: 0 }));
      detail.shares = detail.shares.map((share, index) => ({
        ...share,
        subscribed: 0,
        called: 0,
        lastNav: null,
        nominalPrice: index === 1 ? null : share.nominalPrice,
        counts: { subscriptions: 0, navs: 0, operations: 0 },
      }));
      detail.settings.onboarding = null;
      detail.settings.subscriptionContract = null;
      detail.missingConfig = [
        {
          key: 'sharePrice',
          target: { tab: 'shares', sectionId: 'pricing', fieldId: detail.shares[1].id },
          detail: detail.shares[1].name,
        },
        { key: 'onboarding', target: { tab: 'settings', sectionId: 'subscription', fieldId: 'onboardingIndividuals' } },
        // Le contrat de souscription se gère dans l'onglet Contrats, pas dans les paramètres.
        { key: 'subscriptionContract', target: { tab: 'contracts', sectionId: 'contracts', fieldId: 'contracts' } },
        ...detail.missingConfig,
      ];
      detail.deleteBlockers = { subscriptions: 0, operations: 0, navs: 0, contracts: 0 };
      break;
    case 'compartment':
      detail.fundType = 'compartment';
      detail.parent = { id: 9001, name: PARENT_NAMES[0] };
      break;
    case 'master':
      detail.isMaster = true;
      detail.mirrorsCount = 2;
      break;
    case 'mirror':
      detail.mirrorOf = { id: 9002, name: PARENT_NAMES[1] };
      break;
    case 'evergreen':
      detail.evergreen = true;
      detail.paymentMode = 'direct';
      detail.called = detail.subscribed;
      detail.lastCall = null;
      detail.collectionEnd = null;
      detail.liquidityWindow = { from: { day: 1, month: 6 }, to: { day: 30, month: 6 } };
      detail.shares = detail.shares.map((share, index) => ({ ...share, allowsRedemption: index === 0 }));
      detail.nextCentralization = endOfQuarter(today);
      detail.settings.iban = 'FR76 •••• •••• •••• •••• •••• 042';
      detail.missingConfig = detail.missingConfig.filter(item => item.key !== 'iban');
      detail.configChecksTotal = 4;
      break;
    case 'archived':
      detail.statusBeforeArchive = 'closed';
      detail.status = 'archived';
      detail.archived = { date: addMonths(today, -1), author: 'Julien' };
      break;
    case 'locked':
      detail.locked = { date: addMonths(today, 0), reason: 'contrôle de cohérence des parts en cours' };
      break;
    case 'sendingNotices':
      detail.sendingNotices = true;
      break;
    case 'readOnly':
      detail.rights = { edit: false, publish: false, archive: false, delete: false, duplicate: false, restrictShare: false };
      break;
    default:
      break;
  }
  return detail;
}
