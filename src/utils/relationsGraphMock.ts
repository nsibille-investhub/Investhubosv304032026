export type EntityType = 'person' | 'company' | 'holding' | 'fund';

export type RelationType =
  | 'president'
  | 'directeur_general'
  | 'gerant'
  | 'administrateur'
  | 'ubo_direct'
  | 'ubo_indirect'
  | 'actionnaire'
  | 'filiale'
  | 'commissaire_aux_comptes'
  | 'conseil';

export interface GraphEntity {
  id: string;
  name: string;
  type: EntityType;
  subtitle?: string;
  siren?: string;
  address?: string;
  capital?: string;
  revenue?: string;
  incorporationDate?: string;
  birthYear?: number;
  nationality?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  status?: 'active' | 'inactive' | 'dissolved';
  mandatesCount?: number;
}

export interface GraphRelation {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationType;
  ownership?: number;
  since?: string;
}

export const RELATION_LABELS: Record<RelationType, { fr: string; en: string }> = {
  president: { fr: 'Président', en: 'President' },
  directeur_general: { fr: 'Directeur Général', en: 'CEO' },
  gerant: { fr: 'Gérant', en: 'Manager' },
  administrateur: { fr: 'Administrateur', en: 'Board Member' },
  ubo_direct: { fr: 'UBO Direct', en: 'Direct UBO' },
  ubo_indirect: { fr: 'UBO Indirect', en: 'Indirect UBO' },
  actionnaire: { fr: 'Actionnaire', en: 'Shareholder' },
  filiale: { fr: 'Filiale', en: 'Subsidiary' },
  commissaire_aux_comptes: { fr: 'CAC', en: 'Auditor' },
  conseil: { fr: 'Conseil', en: 'Advisor' },
};

export const ENTITY_TYPE_LABELS: Record<EntityType, { fr: string; en: string }> = {
  person: { fr: 'Personne physique', en: 'Individual' },
  company: { fr: 'Entreprise', en: 'Company' },
  holding: { fr: 'Holding', en: 'Holding' },
  fund: { fr: 'Fonds', en: 'Fund' },
};

const entities: GraphEntity[] = [
  {
    id: 'e-1',
    name: 'CAPITAL PARTNERS HOLDING',
    type: 'holding',
    subtitle: 'Société de participation',
    siren: '912 345 678',
    address: '12 Avenue Hoche, 75008 Paris',
    capital: '5 000 000 €',
    revenue: '12 400 000 €',
    incorporationDate: '2015-03-12',
    status: 'active',
  },
  {
    id: 'e-2',
    name: 'Jean-Marc DELACROIX',
    type: 'person',
    birthYear: 1968,
    nationality: 'Française',
    mandatesCount: 5,
    riskLevel: 'medium',
  },
  {
    id: 'e-3',
    name: 'IMMO INVEST SAS',
    type: 'company',
    subtitle: 'Gestion immobilière (6820A)',
    siren: '823 456 789',
    address: '45 Rue de la Boétie, 75008 Paris',
    capital: '1 200 000 €',
    revenue: '3 800 000 €',
    incorporationDate: '2018-06-20',
    status: 'active',
    riskLevel: 'low',
  },
  {
    id: 'e-4',
    name: 'Sophie MARTIN-LEROY',
    type: 'person',
    birthYear: 1975,
    nationality: 'Française',
    mandatesCount: 3,
    riskLevel: 'low',
  },
  {
    id: 'e-5',
    name: 'FINTECH VENTURES SAS',
    type: 'company',
    subtitle: 'Capital-risque (6430Z)',
    siren: '834 567 890',
    address: '8 Place de l\'Opéra, 75009 Paris',
    capital: '3 500 000 €',
    revenue: '8 200 000 €',
    incorporationDate: '2019-01-15',
    status: 'active',
    riskLevel: 'low',
  },
  {
    id: 'e-6',
    name: 'Pierre VAUBAN',
    type: 'person',
    birthYear: 1982,
    nationality: 'Française',
    mandatesCount: 2,
    riskLevel: 'high',
  },
  {
    id: 'e-7',
    name: 'GRAND HOTEL MANAGEMENT',
    type: 'company',
    subtitle: 'Hôtellerie (5510Z)',
    siren: '845 678 901',
    address: '22 Boulevard Haussmann, 75009 Paris',
    capital: '800 000 €',
    revenue: '2 100 000 €',
    incorporationDate: '2020-09-01',
    status: 'active',
    riskLevel: 'medium',
  },
  {
    id: 'e-8',
    name: 'EUROFIDUCIE SARL',
    type: 'company',
    subtitle: 'Commissariat aux comptes (6920Z)',
    siren: '856 789 012',
    address: '3 Rue Scribe, 75009 Paris',
    capital: '150 000 €',
    status: 'active',
  },
  {
    id: 'e-9',
    name: 'Marie-Claire FONTAINE',
    type: 'person',
    birthYear: 1970,
    nationality: 'Belge',
    mandatesCount: 4,
    riskLevel: 'low',
  },
  {
    id: 'e-10',
    name: 'NORTHWIND GROWTH CAPITAL II',
    type: 'fund',
    subtitle: 'FPCI — 2021 vintage',
    siren: '867 890 123',
    capital: '50 000 000 €',
    incorporationDate: '2021-04-01',
    status: 'active',
  },
  {
    id: 'e-11',
    name: 'Alexandre DUBOIS',
    type: 'person',
    birthYear: 1965,
    nationality: 'Suisse',
    mandatesCount: 7,
    riskLevel: 'medium',
  },
  {
    id: 'e-12',
    name: 'MERIDIAN PROPERTIES SA',
    type: 'company',
    subtitle: 'Promotion immobilière (4110A)',
    siren: '878 901 234',
    address: '15 Quai André Citroën, 75015 Paris',
    capital: '2 500 000 €',
    revenue: '6 300 000 €',
    incorporationDate: '2016-11-08',
    status: 'active',
    riskLevel: 'low',
  },
  {
    id: 'e-13',
    name: 'PACIFIC TRUST LTD',
    type: 'holding',
    subtitle: 'Trust — Jersey',
    address: 'St Helier, Jersey',
    status: 'active',
    riskLevel: 'high',
  },
  {
    id: 'e-14',
    name: 'Thomas CHEN',
    type: 'person',
    birthYear: 1978,
    nationality: 'Singapourienne',
    mandatesCount: 3,
    riskLevel: 'medium',
  },
  {
    id: 'e-15',
    name: 'VAUBAN CONSEIL SAS',
    type: 'company',
    subtitle: 'Conseil en gestion (7022Z)',
    siren: '889 012 345',
    address: '60 Avenue Kléber, 75016 Paris',
    capital: '50 000 €',
    incorporationDate: '2022-02-14',
    status: 'active',
    riskLevel: 'low',
  },
];

const relations: GraphRelation[] = [
  { id: 'r-1', sourceId: 'e-2', targetId: 'e-1', type: 'president', since: '2015-03-12' },
  { id: 'r-2', sourceId: 'e-2', targetId: 'e-1', type: 'ubo_direct', ownership: 45 },
  { id: 'r-3', sourceId: 'e-4', targetId: 'e-3', type: 'directeur_general', since: '2018-06-20' },
  { id: 'r-4', sourceId: 'e-1', targetId: 'e-3', type: 'actionnaire', ownership: 70 },
  { id: 'r-5', sourceId: 'e-1', targetId: 'e-5', type: 'actionnaire', ownership: 55 },
  { id: 'r-6', sourceId: 'e-2', targetId: 'e-5', type: 'president', since: '2019-01-15' },
  { id: 'r-7', sourceId: 'e-6', targetId: 'e-7', type: 'gerant', since: '2020-09-01' },
  { id: 'r-8', sourceId: 'e-6', targetId: 'e-7', type: 'ubo_direct', ownership: 80 },
  { id: 'r-9', sourceId: 'e-1', targetId: 'e-7', type: 'actionnaire', ownership: 20 },
  { id: 'r-10', sourceId: 'e-8', targetId: 'e-1', type: 'commissaire_aux_comptes', since: '2016-01-01' },
  { id: 'r-11', sourceId: 'e-8', targetId: 'e-3', type: 'commissaire_aux_comptes', since: '2019-01-01' },
  { id: 'r-12', sourceId: 'e-9', targetId: 'e-1', type: 'administrateur', since: '2017-06-15' },
  { id: 'r-13', sourceId: 'e-9', targetId: 'e-1', type: 'ubo_direct', ownership: 25 },
  { id: 'r-14', sourceId: 'e-11', targetId: 'e-10', type: 'president', since: '2021-04-01' },
  { id: 'r-15', sourceId: 'e-1', targetId: 'e-10', type: 'actionnaire', ownership: 30 },
  { id: 'r-16', sourceId: 'e-11', targetId: 'e-12', type: 'president', since: '2016-11-08' },
  { id: 'r-17', sourceId: 'e-11', targetId: 'e-12', type: 'ubo_direct', ownership: 60 },
  { id: 'r-18', sourceId: 'e-13', targetId: 'e-1', type: 'actionnaire', ownership: 30 },
  { id: 'r-19', sourceId: 'e-14', targetId: 'e-13', type: 'ubo_indirect', ownership: 100 },
  { id: 'r-20', sourceId: 'e-14', targetId: 'e-5', type: 'administrateur', since: '2020-03-01' },
  { id: 'r-21', sourceId: 'e-6', targetId: 'e-15', type: 'president', since: '2022-02-14' },
  { id: 'r-22', sourceId: 'e-6', targetId: 'e-15', type: 'ubo_direct', ownership: 100 },
  { id: 'r-23', sourceId: 'e-15', targetId: 'e-7', type: 'conseil', since: '2022-06-01' },
  { id: 'r-24', sourceId: 'e-4', targetId: 'e-3', type: 'ubo_direct', ownership: 30 },
  { id: 'r-25', sourceId: 'e-9', targetId: 'e-12', type: 'administrateur', since: '2018-01-01' },
  { id: 'r-26', sourceId: 'e-10', targetId: 'e-12', type: 'actionnaire', ownership: 15 },
];

export function getRelationsForEntity(entityId: string): {
  entities: GraphEntity[];
  relations: GraphRelation[];
} {
  const relatedRelations = relations.filter(
    (r) => r.sourceId === entityId || r.targetId === entityId,
  );
  const relatedEntityIds = new Set<string>([entityId]);
  relatedRelations.forEach((r) => {
    relatedEntityIds.add(r.sourceId);
    relatedEntityIds.add(r.targetId);
  });
  return {
    entities: entities.filter((e) => relatedEntityIds.has(e.id)),
    relations: relatedRelations,
  };
}

export function expandEntity(
  currentEntities: GraphEntity[],
  currentRelations: GraphRelation[],
  entityId: string,
): { entities: GraphEntity[]; relations: GraphRelation[] } {
  const existingIds = new Set(currentEntities.map((e) => e.id));
  const existingRelIds = new Set(currentRelations.map((r) => r.id));

  const newRelations = relations.filter(
    (r) =>
      !existingRelIds.has(r.id) &&
      (r.sourceId === entityId || r.targetId === entityId),
  );

  const newEntityIds = new Set<string>();
  newRelations.forEach((r) => {
    if (!existingIds.has(r.sourceId)) newEntityIds.add(r.sourceId);
    if (!existingIds.has(r.targetId)) newEntityIds.add(r.targetId);
  });

  const newEntities = entities.filter((e) => newEntityIds.has(e.id));

  return {
    entities: [...currentEntities, ...newEntities],
    relations: [...currentRelations, ...newRelations],
  };
}

export function getFullGraph(): {
  entities: GraphEntity[];
  relations: GraphRelation[];
} {
  return { entities: [...entities], relations: [...relations] };
}

export function getEntityById(id: string): GraphEntity | undefined {
  return entities.find((e) => e.id === id);
}

export const DEFAULT_ROOT_ENTITY_ID = 'e-1';
