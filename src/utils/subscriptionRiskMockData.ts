/**
 * Donnees de maquette du dispositif de conformite d'une souscription :
 * profil de risque (profil > classes > composantes), echelles et paliers,
 * entites screenees et leurs correspondances, journal de conformite.
 *
 * Le vocabulaire suit les regles metier du wiki : cinq finalites de screening,
 * sept categories de resultat, deux decisions par correspondance (ecarter /
 * accepter) qui ne s'excluent pas, trois etats de dossier de conformite.
 */

export type RiskComponentSource =
  | 'onboardingAnswer'
  | 'manualQuestion'
  | 'countryList'
  | 'screening'
  | 'externalService';

export interface RiskComponent {
  id: string;
  labelKey: string;
  source: RiskComponentSource;
  /** Reponse ou valeur ayant servi au calcul (donnee de maquette, non traduite). */
  value: string;
  /** Score retenu. null quand la composante n'a pas pu etre evaluee. */
  score: number | null;
  min: number;
  max: number;
  /** La composante autorise la saisie manuelle d'un score par un operateur. */
  manualAllowed: boolean;
  /** Score saisi manuellement, prioritaire sur le score calcule. */
  manualScore?: number;
  manualBy?: string;
  manualAt?: string;
}

export interface RiskClass {
  id: string;
  labelKey: string;
  formula: string;
  formulaKind: 'standard' | 'custom';
  /** Mode d'agregation des composantes, coherent avec la formule affichee. */
  aggregate: 'max' | 'avg';
  /** Poids de la classe dans la formule du profil. */
  weight: number;
  components: RiskComponent[];
  scaleId: string;
}

export type RiskTone = 'low' | 'medium' | 'high' | 'critical';

export interface RiskTier {
  min: number;
  max: number;
  labelKey: string;
  tone: RiskTone;
  /** Palier qui impose une validation humaine par la conformite. */
  requiresValidation: boolean;
}

export interface RiskScale {
  id: string;
  labelKey: string;
  tiers: RiskTier[];
}

export interface RiskProfile {
  name: string;
  /** Onboarding d'ou vient le profil : le profil applique vient de l'onboarding. */
  originOnboarding: string;
  formula: string;
  formulaKind: 'standard' | 'custom';
  scaleId: string;
  classes: RiskClass[];
  computedAt: string;
}

export const mockRiskScales: RiskScale[] = [
  {
    id: 'profile',
    labelKey: 'subscriptions.detail.compliance.scales.profile',
    tiers: [
      { min: 0, max: 39, labelKey: 'subscriptions.detail.compliance.tone.low', tone: 'low', requiresValidation: false },
      { min: 40, max: 59, labelKey: 'subscriptions.detail.compliance.tone.medium', tone: 'medium', requiresValidation: false },
      { min: 60, max: 79, labelKey: 'subscriptions.detail.compliance.tone.high', tone: 'high', requiresValidation: true },
      { min: 80, max: 100, labelKey: 'subscriptions.detail.compliance.tone.critical', tone: 'critical', requiresValidation: true },
    ],
  },
  {
    id: 'class',
    labelKey: 'subscriptions.detail.compliance.scales.class',
    tiers: [
      { min: 0, max: 3.9, labelKey: 'subscriptions.detail.compliance.tone.low', tone: 'low', requiresValidation: false },
      { min: 4, max: 6.9, labelKey: 'subscriptions.detail.compliance.tone.medium', tone: 'medium', requiresValidation: false },
      { min: 7, max: 8.9, labelKey: 'subscriptions.detail.compliance.tone.high', tone: 'high', requiresValidation: true },
      { min: 9, max: 10, labelKey: 'subscriptions.detail.compliance.tone.critical', tone: 'critical', requiresValidation: true },
    ],
  },
];

export const mockRiskProfile: RiskProfile = {
  name: 'Profil FIA - Personne physique',
  originOnboarding: 'Onboarding Impact Growth II',
  formula: '(pays * 3 + screening * 5 + profil_client + operation) / 10',
  formulaKind: 'standard',
  scaleId: 'profile',
  computedAt: '19/05/2026 16:24',
  classes: [
    {
      id: 'country',
      aggregate: 'max',
      weight: 3,
      labelKey: 'subscriptions.detail.compliance.classes.country',
      formula: 'max(residence, nationalite, domiciliation_bancaire)',
      formulaKind: 'standard',
      scaleId: 'class',
      components: [
        {
          id: 'country-residence',
          labelKey: 'subscriptions.detail.compliance.components.taxResidence',
          source: 'countryList',
          value: 'France',
          score: 1,
          min: 0,
          max: 10,
          manualAllowed: false,
        },
        {
          id: 'country-nationality',
          labelKey: 'subscriptions.detail.compliance.components.nationality',
          source: 'countryList',
          value: 'France',
          score: 1,
          min: 0,
          max: 10,
          manualAllowed: false,
        },
        {
          id: 'country-bank',
          labelKey: 'subscriptions.detail.compliance.components.bankDomiciliation',
          source: 'countryList',
          value: 'Suisse',
          score: 4.8,
          min: 0,
          max: 10,
          manualAllowed: false,
        },
      ],
    },
    {
      id: 'screening',
      aggregate: 'max',
      weight: 5,
      labelKey: 'subscriptions.detail.compliance.classes.screening',
      formula: 'max(souscripteur, representant, beneficiaires)',
      formulaKind: 'standard',
      scaleId: 'class',
      components: [
        {
          id: 'screening-subscriber',
          labelKey: 'subscriptions.detail.compliance.components.screeningSubscriber',
          source: 'screening',
          value: '2 correspondances',
          score: 8,
          min: 0,
          max: 10,
          manualAllowed: true,
        },
        {
          id: 'screening-representative',
          labelKey: 'subscriptions.detail.compliance.components.screeningRepresentative',
          source: 'screening',
          value: '1 correspondance',
          score: 6,
          min: 0,
          max: 10,
          manualAllowed: true,
        },
        {
          id: 'screening-bo',
          labelKey: 'subscriptions.detail.compliance.components.screeningBeneficialOwners',
          source: 'screening',
          value: '0 correspondance',
          score: 0,
          min: 0,
          max: 10,
          manualAllowed: true,
        },
      ],
    },
    {
      id: 'client',
      aggregate: 'avg',
      weight: 1,
      labelKey: 'subscriptions.detail.compliance.classes.clientProfile',
      formula: '(categorie + origine_relation + origine_fonds) / 3',
      formulaKind: 'standard',
      scaleId: 'class',
      components: [
        {
          id: 'client-category',
          labelKey: 'subscriptions.detail.compliance.components.investorCategory',
          source: 'onboardingAnswer',
          value: 'Professionnel par nature',
          score: 2,
          min: 0,
          max: 10,
          manualAllowed: false,
        },
        {
          id: 'client-relation',
          labelKey: 'subscriptions.detail.compliance.components.relationOrigin',
          source: 'onboardingAnswer',
          value: 'Apport distributeur',
          score: 3,
          min: 0,
          max: 10,
          manualAllowed: false,
        },
        {
          id: 'client-funds',
          labelKey: 'subscriptions.detail.compliance.components.fundsOrigin',
          source: 'manualQuestion',
          value: 'Cession de participation',
          score: 5,
          min: 0,
          max: 10,
          manualAllowed: true,
          manualScore: 6,
          manualBy: 'Marie Dubois',
          manualAt: '19/05/2026 16:31',
        },
      ],
    },
    {
      id: 'operation',
      aggregate: 'avg',
      weight: 1,
      labelKey: 'subscriptions.detail.compliance.classes.operation',
      formula: 'service_externe(montant, mode_reglement)',
      formulaKind: 'custom',
      scaleId: 'class',
      components: [
        {
          id: 'operation-amount',
          labelKey: 'subscriptions.detail.compliance.components.subscribedAmount',
          source: 'onboardingAnswer',
          value: '250 000 €',
          score: 4,
          min: 0,
          max: 10,
          manualAllowed: false,
        },
        {
          id: 'operation-payment',
          labelKey: 'subscriptions.detail.compliance.components.paymentMode',
          source: 'externalService',
          value: 'Virement - compte tiers',
          score: null,
          min: 0,
          max: 10,
          manualAllowed: true,
        },
      ],
    },
  ],
};

export type ScreeningPurpose =
  | 'beneficialOwner'
  | 'subscriber'
  | 'signatory'
  | 'representative'
  | 'other';

export type ScreeningCategory =
  | 'sanctions'
  | 'lawEnforcement'
  | 'regulatoryEnforcement'
  | 'otherBodies'
  | 'pep'
  | 'specialInterest'
  | 'adverseMedia';

export interface ScreeningDecision {
  by: string;
  at: string;
}

export interface ScreeningHit {
  id: string;
  name: string;
  category: ScreeningCategory;
  /** Type de rapprochement renvoye par le prestataire. */
  matchType: 'exact' | 'partial';
  /** Taux de correspondance renvoye par le prestataire. */
  matchRate: number;
  country: string;
  birthYear?: string;
  sourceKey: string;
  summaryKey: string;
  discarded?: ScreeningDecision;
  accepted?: ScreeningDecision;
  comment?: { text: string; by: string; at: string };
}

export interface ScreeningRun {
  at: string;
  by: string;
  hitCount: number;
  origin: 'manual' | 'automatic' | 'monitoring';
}

export interface ScreenedEntity {
  id: string;
  name: string;
  kind: 'person' | 'company';
  purpose: ScreeningPurpose;
  provider: 'worldcheck' | 'membercheck' | 'orias';
  /** Reference du dossier chez le prestataire. */
  providerRef: string;
  /** Perimetre interroge, tel que renvoye par le prestataire. */
  screeningList: string;
  monitoring: boolean;
  runs: ScreeningRun[];
  hits: ScreeningHit[];
}

export const mockScreenedEntities: ScreenedEntity[] = [
  {
    id: 'entity-subscriber',
    name: 'Jean-Pierre Durand',
    kind: 'person',
    purpose: 'subscriber',
    provider: 'worldcheck',
    providerRef: '5jb6y2oyuii91jokrw6nvf1ml',
    screeningList: 'WATCHLIST',
    monitoring: true,
    runs: [
      { at: '19/05/2026 16:10', by: 'Automatique', hitCount: 2, origin: 'automatic' },
      { at: '02/04/2026 09:12', by: 'Marie Dubois', hitCount: 1, origin: 'manual' },
    ],
    hits: [
      {
        id: 'hit-1',
        name: 'Jean-Pierre DURAND',
        category: 'pep',
        matchType: 'exact',
        matchRate: 92,
        country: 'France',
        birthYear: '1968',
        sourceKey: 'subscriptions.detail.compliance.sources.acpr',
        summaryKey: 'subscriptions.detail.compliance.hits.pepMandate',
      },
      {
        id: 'hit-2',
        name: 'J.P. Durand',
        category: 'adverseMedia',
        matchType: 'partial',
        matchRate: 64,
        country: 'Belgique',
        birthYear: '1971',
        sourceKey: 'subscriptions.detail.compliance.sources.press',
        summaryKey: 'subscriptions.detail.compliance.hits.commercialDispute',
        discarded: { by: 'Marie Dubois', at: '19/05/2026 16:22' },
        comment: {
          text: 'Homonyme, date de naissance et pays de residence differents du souscripteur.',
          by: 'Marie Dubois',
          at: '19/05/2026 16:22',
        },
      },
    ],
  },
  {
    id: 'entity-representative',
    name: 'Durand Patrimoine SAS',
    kind: 'company',
    purpose: 'representative',
    provider: 'worldcheck',
    providerRef: '5jb6p90zpoey1jokrw8mq6sch',
    screeningList: 'WATCHLIST',
    monitoring: false,
    runs: [{ at: '19/05/2026 16:10', by: 'Automatique', hitCount: 1, origin: 'automatic' }],
    hits: [
      {
        id: 'hit-3',
        name: 'DURAND PATRIMOINE',
        category: 'regulatoryEnforcement',
        matchType: 'partial',
        matchRate: 78,
        country: 'France',
        sourceKey: 'subscriptions.detail.compliance.sources.amf',
        summaryKey: 'subscriptions.detail.compliance.hits.regulatoryNotice',
      },
    ],
  },
  {
    id: 'entity-bo-1',
    name: 'Claire Durand',
    kind: 'person',
    purpose: 'beneficialOwner',
    provider: 'worldcheck',
    providerRef: '5jb7ghm7am7f1j5k9d5t19g22',
    screeningList: 'WATCHLIST',
    monitoring: true,
    runs: [{ at: '19/05/2026 16:10', by: 'Automatique', hitCount: 0, origin: 'automatic' }],
    hits: [],
  },
  {
    id: 'entity-signatory',
    name: 'Paul Mercier',
    kind: 'person',
    purpose: 'signatory',
    provider: 'membercheck',
    providerRef: '66305218',
    screeningList: 'WATCHLIST',
    monitoring: false,
    runs: [{ at: '19/05/2026 16:10', by: 'Automatique', hitCount: 0, origin: 'automatic' }],
    hits: [],
  },
];

export interface MonitoringUpdate {
  id: string;
  entityId: string;
  at: string;
  labelKey: string;
  acknowledged: boolean;
}

export const mockMonitoringUpdates: MonitoringUpdate[] = [
  {
    id: 'update-1',
    entityId: 'entity-subscriber',
    at: '28/08/2026 07:05',
    labelKey: 'subscriptions.detail.compliance.monitoring.pepListUpdate',
    acknowledged: false,
  },
  {
    id: 'update-2',
    entityId: 'entity-bo-1',
    at: '12/07/2026 07:05',
    labelKey: 'subscriptions.detail.compliance.monitoring.noChange',
    acknowledged: true,
  },
];

export type InvestorCategory =
  | 'nonProfessional'
  | 'professionalByNature'
  | 'professionalOnRequest'
  | 'eligibleCounterparty';

export interface InvestorCategorisation {
  category: InvestorCategory;
  justificationKey: string;
  decidedBy: string;
  decidedAt: string;
  /** Prochaine revue de la categorisation. */
  reviewDueAt: string;
}

export const mockCategorisation: InvestorCategorisation = {
  category: 'professionalByNature',
  justificationKey: 'subscriptions.detail.compliance.categorisation.justificationFinancialInstitution',
  decidedBy: 'Marie Dubois',
  decidedAt: '19/05/2026 16:35',
  reviewDueAt: '19/05/2028',
};

export interface AdequacyCriterion {
  id: string;
  labelKey: string;
  answer: string;
  verdict: 'ok' | 'warning' | 'ko';
}

export const mockAdequacyCriteria: AdequacyCriterion[] = [
  {
    id: 'adequacy-knowledge',
    labelKey: 'subscriptions.detail.compliance.adequacy.knowledge',
    answer: 'Plus de 5 ans',
    verdict: 'ok',
  },
  {
    id: 'adequacy-horizon',
    labelKey: 'subscriptions.detail.compliance.adequacy.horizon',
    answer: '10 ans',
    verdict: 'ok',
  },
  {
    id: 'adequacy-liquidity',
    labelKey: 'subscriptions.detail.compliance.adequacy.liquidity',
    answer: 'Aucun besoin de liquidite',
    verdict: 'ok',
  },
  {
    id: 'adequacy-lossCapacity',
    labelKey: 'subscriptions.detail.compliance.adequacy.lossCapacity',
    answer: '25 % du patrimoine',
    verdict: 'warning',
  },
  {
    id: 'adequacy-concentration',
    labelKey: 'subscriptions.detail.compliance.adequacy.concentration',
    answer: '12 % du patrimoine financier',
    verdict: 'ok',
  },
];

export interface ComplianceJournalEntry {
  id: string;
  at: string;
  by: string;
  kind: 'screening' | 'decision' | 'score' | 'status' | 'note' | 'categorisation';
  labelKey: string;
}

export const mockComplianceJournal: ComplianceJournalEntry[] = [
  {
    id: 'journal-1',
    at: '19/05/2026 16:10',
    by: 'Automatique',
    kind: 'screening',
    labelKey: 'subscriptions.detail.compliance.journal.screeningRun',
  },
  {
    id: 'journal-2',
    at: '19/05/2026 16:22',
    by: 'Marie Dubois',
    kind: 'decision',
    labelKey: 'subscriptions.detail.compliance.journal.hitDiscarded',
  },
  {
    id: 'journal-3',
    at: '19/05/2026 16:24',
    by: 'Automatique',
    kind: 'score',
    labelKey: 'subscriptions.detail.compliance.journal.scoreComputed',
  },
  {
    id: 'journal-4',
    at: '19/05/2026 16:31',
    by: 'Marie Dubois',
    kind: 'score',
    labelKey: 'subscriptions.detail.compliance.journal.manualScore',
  },
  {
    id: 'journal-5',
    at: '19/05/2026 16:35',
    by: 'Marie Dubois',
    kind: 'categorisation',
    labelKey: 'subscriptions.detail.compliance.journal.categorisationSet',
  },
  {
    id: 'journal-6',
    at: '19/05/2026 16:40',
    by: 'Systeme',
    kind: 'status',
    labelKey: 'subscriptions.detail.compliance.journal.pendingValidation',
  },
];

/** Correspondances sans decision au chargement, utilisee pour le badge de l'onglet. */
export const countUntreatedScreeningHits = () =>
  mockScreenedEntities.reduce(
    (total, entity) =>
      total + entity.hits.filter(hit => !hit.discarded && !hit.accepted).length,
    0,
  );

const round1 = (value: number) => Math.round(value * 10) / 10;

/** Palier de l'echelle dans lequel tombe le score. null quand le score sort de l'echelle. */
export function findRiskTier(scaleId: string, score: number | null): RiskTier | null {
  if (score === null) return null;
  const scale = mockRiskScales.find(item => item.id === scaleId);
  if (!scale) return null;
  return scale.tiers.find(tier => score >= tier.min && score <= tier.max) ?? null;
}

/** Score effectif d'une composante : la saisie manuelle prime sur le calcul. */
export function componentScore(
  component: RiskComponent,
  overrides: Record<string, number> = {},
): number | null {
  if (typeof overrides[component.id] === 'number') return overrides[component.id];
  if (typeof component.manualScore === 'number') return component.manualScore;
  return component.score;
}

/** Score d'une classe, calcule depuis ses composantes evaluables. */
export function aggregateClassScore(
  riskClass: RiskClass,
  overrides: Record<string, number> = {},
): number | null {
  const scores = riskClass.components
    .map(component => componentScore(component, overrides))
    .filter((value): value is number => typeof value === 'number');
  if (scores.length === 0) return null;
  if (riskClass.aggregate === 'max') return round1(Math.max(...scores));
  return round1(scores.reduce((sum, value) => sum + value, 0) / scores.length);
}

/** Score du profil, moyenne ponderee des classes ramenee sur 100. */
export function computeProfileScore(overrides: Record<string, number> = {}): number | null {
  const weighted = mockRiskProfile.classes.reduce(
    (acc, riskClass) => {
      const score = aggregateClassScore(riskClass, overrides);
      return score === null
        ? acc
        : { sum: acc.sum + score * riskClass.weight, weight: acc.weight + riskClass.weight };
    },
    { sum: 0, weight: 0 },
  );
  if (weighted.weight === 0) return null;
  return Math.round((weighted.sum / weighted.weight) * 10);
}

export type AdequacyVerdict = 'ok' | 'warning' | 'ko';

export function adequacyVerdict(): AdequacyVerdict {
  if (mockAdequacyCriteria.some(criterion => criterion.verdict === 'ko')) return 'ko';
  if (mockAdequacyCriteria.some(criterion => criterion.verdict === 'warning')) return 'warning';
  return 'ok';
}

/** Instantane du dispositif de conformite, pour les recapitulatifs hors onglet Risque. */
export function computeComplianceSnapshot() {
  const score = computeProfileScore();
  const tier = findRiskTier(mockRiskProfile.scaleId, score);
  return {
    score,
    tier,
    requiresValidation: tier?.requiresValidation ?? false,
    untreatedHits: countUntreatedScreeningHits(),
    acceptedHits: mockScreenedEntities.reduce(
      (total, entity) => total + entity.hits.filter(hit => Boolean(hit.accepted)).length,
      0,
    ),
    category: mockCategorisation.category,
    adequacy: adequacyVerdict(),
    monitoringPending: mockMonitoringUpdates.filter(update => !update.acknowledged).length,
  };
}
