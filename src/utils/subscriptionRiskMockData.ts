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
  | 'screening';

/** Reponse proposee pour une question manuelle, avec le score qu'elle porte. */
export interface RiskAnswerOption {
  label: string;
  score: number;
}

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
  /** Score saisi manuellement, prioritaire sur le score calcule. */
  manualScore?: number;
  manualBy?: string;
  manualAt?: string;
  /** Commentaire obligatoire qui motive la saisie manuelle. */
  manualComment?: string;
  /** Parametre "Score modifiable" de la composante. Sans effet sur une question manuelle. */
  scoreModifiable: boolean;
  /** Question manuelle : reponses parametrees et leur score. */
  answerOptions?: RiskAnswerOption[];
  /** Question manuelle sans saisie : la reponse par defaut s'applique. */
  defaultAnswer?: boolean;
  /** Screening : scores proposes a la correction, entre le minimum et le maximum, valeurs exclues retirees. */
  scoreValues?: number[];
}

export interface RiskClass {
  id: string;
  labelKey: string;
  /** Mode d'agregation des composantes. */
  aggregate: 'max' | 'avg';
  /** Poids de la classe dans le calcul du profil. */
  weight: number;
  components: RiskComponent[];
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
];

export const mockRiskProfile: RiskProfile = {
  name: 'Profil FIA - Personne physique',
  originOnboarding: 'Onboarding Impact Growth II',
  scaleId: 'profile',
  computedAt: '19/05/2026 16:24',
  classes: [
    {
      id: 'country',
      aggregate: 'max',
      weight: 3,
      labelKey: 'subscriptions.detail.compliance.classes.country',
      components: [
        {
          id: 'country-residence',
          scoreModifiable: true,
          labelKey: 'subscriptions.detail.compliance.components.taxResidence',
          source: 'onboardingAnswer',
          value: 'France',
          score: 1,
          min: 0,
          max: 10,
        },
        {
          id: 'country-nationality',
          scoreModifiable: false,
          labelKey: 'subscriptions.detail.compliance.components.nationality',
          source: 'onboardingAnswer',
          value: 'France',
          score: 1,
          min: 0,
          max: 10,
        },
        {
          id: 'country-bank',
          scoreModifiable: true,
          labelKey: 'subscriptions.detail.compliance.components.bankDomiciliation',
          source: 'onboardingAnswer',
          value: 'Suisse',
          score: 4.8,
          min: 0,
          max: 10,
        },
      ],
    },
    {
      id: 'screening',
      aggregate: 'max',
      weight: 5,
      labelKey: 'subscriptions.detail.compliance.classes.screening',
      components: [
        {
          id: 'screening-subscriber',
          scoreModifiable: true,
          scoreValues: [0, 2, 3, 4, 5, 6, 7, 8, 10],
          labelKey: 'subscriptions.detail.compliance.components.screeningSubscriber',
          source: 'screening',
          value: '2 correspondances',
          score: 8,
          min: 0,
          max: 10,
        },
        {
          id: 'screening-representative',
          scoreModifiable: true,
          scoreValues: [0, 2, 3, 4, 5, 6, 7, 8, 10],
          labelKey: 'subscriptions.detail.compliance.components.screeningRepresentative',
          source: 'screening',
          value: '1 correspondance',
          score: 6,
          min: 0,
          max: 10,
        },
        {
          id: 'screening-bo',
          scoreModifiable: false,
          labelKey: 'subscriptions.detail.compliance.components.screeningBeneficialOwners',
          source: 'screening',
          value: 'No matches',
          score: 0,
          min: 0,
          max: 10,
        },
      ],
    },
    {
      id: 'client',
      aggregate: 'avg',
      weight: 1,
      labelKey: 'subscriptions.detail.compliance.classes.clientProfile',
      components: [
        {
          id: 'client-category',
          scoreModifiable: false,
          labelKey: 'subscriptions.detail.compliance.components.investorCategory',
          source: 'onboardingAnswer',
          value: 'Professionnel par nature',
          score: 2,
          min: 0,
          max: 10,
        },
        {
          id: 'client-relation',
          scoreModifiable: false,
          labelKey: 'subscriptions.detail.compliance.components.relationOrigin',
          source: 'manualQuestion',
          value: 'Apport distributeur',
          defaultAnswer: true,
          answerOptions: [
            { label: 'Relation directe', score: 1 },
            { label: 'Recommandation', score: 2 },
            { label: 'Apport distributeur', score: 3 },
            { label: 'Sollicitation entrante', score: 6 },
          ],
          score: 3,
          min: 0,
          max: 10,
        },
        {
          id: 'client-funds',
          scoreModifiable: true,
          labelKey: 'subscriptions.detail.compliance.components.fundsOrigin',
          source: 'onboardingAnswer',
          value: 'Cession de participation',
          score: 5,
          min: 0,
          max: 10,
          manualScore: 6,
          manualBy: 'Marie Dubois',
          manualAt: '19/05/2026 16:31',
          manualComment: "Justificatif de cession reçu, montant supérieur au seuil de vigilance.",
        },
      ],
    },
    {
      id: 'operation',
      aggregate: 'avg',
      weight: 1,
      labelKey: 'subscriptions.detail.compliance.classes.operation',
      components: [
        {
          id: 'operation-amount',
          scoreModifiable: false,
          labelKey: 'subscriptions.detail.compliance.components.subscribedAmount',
          source: 'onboardingAnswer',
          value: '250 000 €',
          score: 4,
          min: 0,
          max: 10,
        },
        {
          id: 'operation-payment',
          scoreModifiable: true,
          labelKey: 'subscriptions.detail.compliance.components.paymentMode',
          source: 'onboardingAnswer',
          value: 'Virement - compte tiers',
          score: null,
          min: 0,
          max: 10,
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

/** Cle de la saisie manuelle qui force le score global du profil. */
export const PROFILE_SCORE_ID = 'profile';

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

/** Score du profil : le score force prime, sinon moyenne ponderee des classes ramenee sur 100. */
export function computeProfileScore(overrides: Record<string, number> = {}): number | null {
  if (typeof overrides[PROFILE_SCORE_ID] === 'number') return overrides[PROFILE_SCORE_ID];
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
    monitoringPending: mockMonitoringUpdates.filter(update => !update.acknowledged).length,
  };
}
