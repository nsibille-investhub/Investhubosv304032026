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
  | 'readOnly'
  | 'noRestrictRight';

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
  'noRestrictRight',
];

export type ShareMode = 'perShare' | 'perAmount';
export type ShareInvestorType = 'individual' | 'entity';
export type ShareReferencePrice = 'nominal' | 'lastNav';
export type ShareRedemptionUnit = 'shares' | 'amount' | 'choice';
export type ShareNavProrata = 'fund' | 'yes' | 'no';
export type ShareEmailTemplate = 'invitation' | 'confirmation' | 'adminConfirmation' | 'reopening' | 'signature';

export interface FundShare {
  id: string;
  name: string;
  isin: string;
  externalId: string;
  description: Record<string, string>;
  customFields: Record<string, unknown>;
  mode: ShareMode;
  nominalPrice: number | null;
  referencePrice: ShareReferencePrice;
  showPriceOnPortals: boolean;
  minShares: number | null;
  maxShares: number | null;
  minAmount: number | null;
  maxAmount: number | null;
  managementFee: number;
  entryFee: number;
  minEntryFee: number | null;
  feeFreeThreshold: number | null;
  feeExemptSegments: string[];
  defaultCommission: number | null;
  /** Vide : la part suit la périodicité du fonds. */
  commissionPeriodicity: Frequency | null;
  investorTypes: ShareInvestorType[];
  /** Vide : tous les segments. */
  segments: string[];
  onlineSubscription: boolean;
  directSubscription: boolean;
  distributorSubscription: boolean;
  onlineAgreementRequest: boolean;
  openToAllNetwork: boolean;
  /** Vide : tous les opérateurs voient les souscriptions de la part. */
  operators: string[];
  freeRedemptionOnline: boolean;
  forceMajeureRedemption: boolean;
  redemptionUnit: ShareRedemptionUnit;
  periodicRedemption: boolean;
  carried: boolean;
  equityPercent: number | null;
  navProrata: ShareNavProrata;
  noPaymentReminder: boolean;
  lemonwayDebit: boolean;
  emailTemplates: Record<ShareEmailTemplate, string | null>;
  validationCcEmail: string;
  subscribed: number;
  called: number;
  lastNav: { value: number; date: Date } | null;
  restricted: boolean;
  closed: boolean;
  allowsRedemption: boolean;
  /** Objets qui empêchent la suppression, comptés par le serveur. */
  deleteBlockers: { subscriptions: number; navs: number; operations: number };
}

/** Segments d'investisseurs de l'application (données du paramétrage). */
export const SHARE_SEGMENTS = ['Retail', 'Premium', 'Banque privée', 'Institutionnels'];
/** Opérateurs du back-office. Camille est l'utilisateur connecté de la maquette. */
export const SHARE_OPERATORS = ['Camille', 'Julien', 'Léa', 'Hugo', 'Inès', 'Paul'];
export const CURRENT_OPERATOR = 'Camille';
export const SHARE_EMAIL_TEMPLATES: ShareEmailTemplate[] = [
  'invitation',
  'confirmation',
  'adminConfirmation',
  'reopening',
  'signature',
];
export const MAIL_TEMPLATE_OPTIONS = [
  'Invitation part institutionnelle',
  'Confirmation souscription part B',
  'Confirmation administrée 2026',
  'Réouverture de souscription',
  'Signature électronique standard',
];

const NO_TEMPLATES: Record<ShareEmailTemplate, string | null> = {
  invitation: null,
  confirmation: null,
  adminConfirmation: null,
  reopening: null,
  signature: null,
};

export interface FundNavRow {
  date: Date;
  values: Record<string, number | null>;
  netAsset: number | null;
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
  /** Droit "Restreindre une part" : choisir les opérateurs qui voient les souscriptions d'une part. */
  restrictShare: boolean;
  publish: boolean;
  archive: boolean;
  delete: boolean;
  duplicate: boolean;
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

  const subscribedTotal = round(fund.totalCommitments, 1000);
  const navDate = endOfQuarter(addMonths(today, -3));
  const share = (overrides: Partial<FundShare> & Pick<FundShare, 'id' | 'name'>): FundShare => ({
    isin: '',
    externalId: '',
    description: { fr: '', en: '' },
    customFields: {},
    mode: 'perShare',
    nominalPrice: 100,
    referencePrice: 'nominal',
    showPriceOnPortals: true,
    minShares: null,
    maxShares: null,
    minAmount: null,
    maxAmount: null,
    managementFee: 0,
    entryFee: 0,
    minEntryFee: null,
    feeFreeThreshold: null,
    feeExemptSegments: [],
    defaultCommission: null,
    commissionPeriodicity: null,
    investorTypes: ['individual', 'entity'],
    segments: [],
    onlineSubscription: true,
    directSubscription: false,
    distributorSubscription: true,
    onlineAgreementRequest: true,
    openToAllNetwork: false,
    operators: [],
    freeRedemptionOnline: false,
    forceMajeureRedemption: true,
    redemptionUnit: 'shares',
    periodicRedemption: false,
    carried: false,
    equityPercent: null,
    navProrata: 'fund',
    noPaymentReminder: false,
    lemonwayDebit: false,
    emailTemplates: { ...NO_TEMPLATES },
    validationCcEmail: '',
    subscribed: 0,
    called: 0,
    lastNav: null,
    restricted: false,
    closed: false,
    allowsRedemption: false,
    deleteBlockers: { subscriptions: 0, navs: 0, operations: 0 },
    ...overrides,
  });
  const calledShare = (subscribed: number, ratio: number) => round(subscribed * ratio, 1000);
  const subscribedA = round(subscribedTotal * 0.55, 1000);
  const subscribedB = round(subscribedTotal * 0.3, 1000);
  const subscribedD = subscribedTotal - subscribedA - subscribedB;

  // Quatre parts de démonstration : A à la part, B au montant, C restreinte à deux opérateurs, D fermée.
  const shares: FundShare[] = [
    share({
      id: 'share-0',
      name: 'A',
      isin: fund.shareClasses[0]?.isin ?? 'FR0014003LX1',
      externalId: `SF-PART-${fund.id}-A`,
      description: {
        fr: '<p>Part destinée aux investisseurs particuliers, accessible dès 1 000 €.</p>',
        en: '<p>Share for retail investors, available from €1,000.</p>',
      },
      customFields: { 'custom-30': 'PA-01', 'custom-31': true },
      mode: 'perShare',
      nominalPrice: 100,
      minShares: 10,
      maxShares: 5000,
      managementFee: 2.2,
      entryFee: 3,
      minEntryFee: 50,
      feeFreeThreshold: 500000,
      feeExemptSegments: ['Banque privée'],
      defaultCommission: 1.5,
      investorTypes: ['individual'],
      segments: ['Retail', 'Premium'],
      operators: ['Camille', 'Julien', 'Léa'],
      restricted: true,
      freeRedemptionOnline: true,
      allowsRedemption: true,
      emailTemplates: { ...NO_TEMPLATES, confirmation: 'Confirmation souscription part B' },
      subscribed: subscribedA,
      called: calledShare(subscribedA, 0.6),
      lastNav: { value: 112.35, date: navDate },
      deleteBlockers: { subscriptions: Math.max(1, Math.round(fund.subscriptions * 0.6)), navs: 6, operations: 4 },
    }),
    share({
      id: 'share-1',
      name: 'B',
      isin: fund.shareClasses[1]?.isin ?? 'FR0014003LX2',
      externalId: `SF-PART-${fund.id}-B`,
      mode: 'perAmount',
      nominalPrice: 1,
      referencePrice: 'lastNav',
      minAmount: 100000,
      maxAmount: 5000000,
      managementFee: 1.5,
      entryFee: 0.5,
      defaultCommission: 0.75,
      commissionPeriodicity: 'semiannual',
      investorTypes: ['individual', 'entity'],
      segments: ['Banque privée', 'Institutionnels'],
      directSubscription: true,
      openToAllNetwork: true,
      redemptionUnit: 'choice',
      navProrata: 'yes',
      validationCcEmail: 'conformite@oree-gestion.fr',
      subscribed: subscribedB,
      called: calledShare(subscribedB, 0.45),
      lastNav: { value: 1.08, date: navDate },
      deleteBlockers: { subscriptions: Math.max(1, Math.round(fund.subscriptions * 0.3)), navs: 6, operations: 2 },
    }),
    share({
      id: 'share-2',
      name: 'C',
      isin: fund.shareClasses[2]?.isin ?? 'FR0014003LX3',
      externalId: `SF-PART-${fund.id}-C`,
      mode: 'perShare',
      nominalPrice: 10,
      showPriceOnPortals: false,
      minShares: 1,
      managementFee: 0,
      entryFee: 0,
      investorTypes: ['individual', 'entity'],
      segments: ['Institutionnels'],
      onlineSubscription: false,
      directSubscription: true,
      distributorSubscription: false,
      onlineAgreementRequest: false,
      operators: ['Julien', 'Hugo'],
      restricted: true,
      forceMajeureRedemption: false,
      carried: true,
      equityPercent: 20,
      navProrata: 'no',
      noPaymentReminder: true,
    }),
    share({
      id: 'share-3',
      name: 'D',
      isin: fund.shareClasses[3]?.isin ?? 'FR0014003LX4',
      externalId: `SF-PART-${fund.id}-D`,
      mode: 'perShare',
      nominalPrice: 500,
      minShares: 2,
      maxShares: 200,
      managementFee: 1.95,
      entryFee: 2.5,
      minEntryFee: 100,
      defaultCommission: 1,
      segments: ['Retail'],
      lemonwayDebit: true,
      closed: true,
      emailTemplates: { ...NO_TEMPLATES, reopening: 'Réouverture de souscription' },
      subscribed: subscribedD,
      called: calledShare(subscribedD, 0.7),
      lastNav: { value: 538.4, date: navDate },
      deleteBlockers: { subscriptions: Math.max(1, Math.round(fund.subscriptions * 0.1)), navs: 6, operations: 1 },
    }),
  ];

  const navDates = Array.from({ length: 6 }, (_, index) => endOfQuarter(addMonths(today, -3 * (index + 1))));
  const navs: FundNavRow[] = navDates.map((date, rowIndex) => ({
    date,
    values: Object.fromEntries(
      shares.map(share => [share.id, share.lastNav ? round(share.lastNav.value * (1 - rowIndex * 0.015), 0.01) : null]),
    ),
    netAsset: round(fund.aum * (1 - rowIndex * 0.02), 1000),
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
    rights: { edit: true, restrictShare: true, publish: true, archive: true, delete: true, duplicate: true },
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
    const lastShare = shares.find(item => item.id === 'share-1') ?? shares[shares.length - 1];
    detail.expectedNavMissing.push({ shareId: lastShare.id, expectedDate: navs[0].date });
    navs[0].values[lastShare.id] = null;
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
        nominalPrice: index === detail.shares.length - 1 ? null : share.nominalPrice,
        deleteBlockers: { subscriptions: 0, navs: 0, operations: 0 },
      }));
      detail.settings.onboarding = null;
      detail.settings.subscriptionContract = null;
      detail.missingConfig = [
        {
          key: 'sharePrice',
          target: { tab: 'shares', sectionId: 'shares', fieldId: detail.shares[detail.shares.length - 1].id },
          detail: detail.shares[detail.shares.length - 1].name,
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
    case 'noRestrictRight':
      detail.rights = { ...detail.rights, restrictShare: false };
      break;
    case 'readOnly':
      detail.rights = { edit: false, restrictShare: false, publish: false, archive: false, delete: false, duplicate: false };
      break;
    default:
      break;
  }
  return detail;
}
