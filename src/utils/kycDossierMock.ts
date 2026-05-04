import type {
  AuditEvent,
  DocumentItem,
  DossierComment,
  IdentityEntity,
  IdentityIndividual,
  KYCDossierDetail,
  RiskScoring,
  UBO,
  WorkflowState,
} from '../components/KYCDossierDetail.types';

const baseAuditEvents: AuditEvent[] = [
  {
    id: 'evt-1',
    type: 'document_uploaded',
    timestamp: '2026-04-28T14:32:00Z',
    actorName: 'Jean Dault',
    actorSublabel: 'jean.dault@investhub.eu',
    actorRole: 'Compliance officer',
    description: 'Pièce d’identité (CNI recto/verso) déposée.',
  },
  {
    id: 'evt-2',
    type: 'screening_run',
    timestamp: '2026-04-28T14:35:18Z',
    actorName: 'Système',
    actorSublabel: 'screening-bot',
    actorRole: 'Système',
    description: 'Screening PEP / sanctions / médias négatifs lancé.',
  },
  {
    id: 'evt-3',
    type: 'screening_hit',
    timestamp: '2026-04-28T14:35:42Z',
    actorName: 'Système',
    actorSublabel: 'screening-bot',
    actorRole: 'Système',
    description: '1 hit PEP probable — score de pertinence 86 %.',
  },
  {
    id: 'evt-4',
    type: 'comment_added',
    timestamp: '2026-04-29T09:12:00Z',
    actorName: 'Sophie Bernard',
    actorSublabel: 'sophie.bernard@investhub.eu',
    actorRole: 'Compliance lead',
    description: 'Demande de précisions sur l’origine des fonds.',
  },
  {
    id: 'evt-5',
    type: 'document_verified',
    timestamp: '2026-04-30T11:04:21Z',
    actorName: 'Romain Minaud',
    actorSublabel: 'romain.minaud@investhub.eu',
    actorRole: 'Compliance officer',
    description: 'Justificatif de domicile validé manuellement.',
  },
  {
    id: 'evt-6',
    type: 'status_changed',
    timestamp: '2026-05-02T16:48:09Z',
    actorName: 'Sophie Bernard',
    actorSublabel: 'sophie.bernard@investhub.eu',
    actorRole: 'Compliance lead',
    description: 'Statut du dossier passé en "En revue".',
  },
];

const baseComments: DossierComment[] = [
  {
    id: 'c-1',
    author: { name: 'Sophie Bernard', sublabel: 'Compliance lead' },
    timestamp: '2026-04-29T09:12:00Z',
    body: '@Romain Minaud peux-tu vérifier la cohérence entre la profession déclarée et la source des fonds ? Le profil semble plus exposé que ce qui est annoncé.',
    pinned: true,
  },
  {
    id: 'c-2',
    author: { name: 'Romain Minaud', sublabel: 'Compliance officer' },
    timestamp: '2026-04-29T15:46:00Z',
    body: 'J’ai relancé l’investisseur ce matin. Réponse attendue sous 48 h. Je rouvrirai la sous-tâche EDD au retour.',
  },
  {
    id: 'c-3',
    author: { name: 'Anne-Sophie Ter Sakarian', sublabel: 'AML analyst' },
    timestamp: '2026-04-30T11:18:00Z',
    body: 'Le hit PEP correspond à un homonyme — différence date de naissance. Je clôture le faux positif après seconde passe.',
  },
];

const individualIdentity: IdentityIndividual = {
  firstName: 'Camille',
  lastName: 'Lefèvre',
  birthDate: '1984-06-12',
  birthPlace: 'Lyon, France',
  nationality: 'Française',
  address: '24 rue du Faubourg Saint-Honoré, 75008 Paris, France',
  email: 'camille.lefevre@example.com',
  phone: '+33 6 12 34 56 78',
  profession: 'Directrice financière — secteur SaaS',
};

const entityIdentity: IdentityEntity = {
  legalName: 'MERIDIAN PARTNERS SAS',
  legalForm: 'SAS — Société par actions simplifiée',
  registrationNumber: 'RCS Paris 893 412 567',
  incorporationDate: '2018-09-04',
  headOffice: '14 boulevard Haussmann, 75009 Paris, France',
  sector: 'Société de gestion — Capital-investissement',
  legalRepresentatives: [
    { name: 'Olivier Pomel', role: 'Président' },
    { name: 'Marie Bernard', role: 'Directrice générale' },
  ],
};

const individualDocuments: DocumentItem[] = [
  {
    id: 'doc-1',
    type: 'Carte nationale d’identité',
    uploadedAt: '2026-04-28T14:32:00Z',
    expiresAt: '2031-02-15',
    status: 'verified',
    uploader: { name: 'Camille Lefèvre', sublabel: 'Investisseur' },
    fileSize: '1.4 MB',
  },
  {
    id: 'doc-2',
    type: 'Justificatif de domicile',
    uploadedAt: '2026-04-28T14:34:00Z',
    expiresAt: '2026-07-28',
    status: 'verified',
    uploader: { name: 'Camille Lefèvre', sublabel: 'Investisseur' },
    fileSize: '720 KB',
  },
  {
    id: 'doc-3',
    type: 'Justificatif de l’origine des fonds',
    uploadedAt: '2026-04-29T09:00:00Z',
    status: 'pending',
    uploader: { name: 'Camille Lefèvre', sublabel: 'Investisseur' },
    fileSize: '2.1 MB',
  },
  {
    id: 'doc-4',
    type: 'RIB',
    uploadedAt: '2026-04-28T14:36:00Z',
    status: 'verified',
    uploader: { name: 'Camille Lefèvre', sublabel: 'Investisseur' },
    fileSize: '320 KB',
  },
];

const entityDocuments: DocumentItem[] = [
  {
    id: 'doc-1',
    type: 'Extrait Kbis (< 3 mois)',
    uploadedAt: '2026-04-22T10:14:00Z',
    expiresAt: '2026-07-22',
    status: 'verified',
    uploader: { name: 'Olivier Pomel', sublabel: 'Président' },
    fileSize: '880 KB',
  },
  {
    id: 'doc-2',
    type: 'Statuts à jour',
    uploadedAt: '2026-04-22T10:16:00Z',
    status: 'verified',
    uploader: { name: 'Olivier Pomel', sublabel: 'Président' },
    fileSize: '3.4 MB',
  },
  {
    id: 'doc-3',
    type: 'Registre des bénéficiaires effectifs',
    uploadedAt: '2026-04-23T09:02:00Z',
    expiresAt: '2026-04-23',
    status: 'expired',
    uploader: { name: 'Marie Bernard', sublabel: 'Directrice générale' },
    fileSize: '610 KB',
  },
  {
    id: 'doc-4',
    type: 'CNI du représentant légal',
    uploadedAt: '2026-04-22T10:18:00Z',
    expiresAt: '2029-11-04',
    status: 'verified',
    uploader: { name: 'Olivier Pomel', sublabel: 'Président' },
    fileSize: '1.2 MB',
  },
  {
    id: 'doc-5',
    type: 'RIB société',
    uploadedAt: '2026-04-22T10:22:00Z',
    status: 'verified',
    uploader: { name: 'Marie Bernard', sublabel: 'Directrice générale' },
    fileSize: '290 KB',
  },
  {
    id: 'doc-6',
    type: 'Liasse fiscale 2025',
    uploadedAt: '2026-04-25T16:08:00Z',
    status: 'rejected',
    uploader: { name: 'Marie Bernard', sublabel: 'Directrice générale' },
    fileSize: '5.6 MB',
  },
];

const entityUbos: UBO[] = [
  {
    id: 'ubo-1',
    name: 'Olivier Pomel',
    ownership: 42,
    controlType: 'direct',
    nationality: 'Française',
    isPep: false,
    kycStatus: 'approved',
  },
  {
    id: 'ubo-2',
    name: 'Marie Bernard',
    ownership: 28,
    controlType: 'direct',
    nationality: 'Française',
    isPep: false,
    kycStatus: 'approved',
  },
  {
    id: 'ubo-3',
    name: 'James Whitfield',
    ownership: 18,
    controlType: 'indirect',
    nationality: 'Britannique',
    isPep: true,
    kycStatus: 'in_review',
  },
  {
    id: 'ubo-4',
    name: 'HOLDING ALPHA SAS',
    ownership: 12,
    controlType: 'indirect',
    nationality: 'France (siège)',
    isPep: false,
    kycStatus: 'to_review',
  },
];

const individualRisk: RiskScoring = {
  level: 'medium',
  globalScore: 58,
  subscores: {
    geography: { level: 'low', score: 18 },
    activity: { level: 'medium', score: 54 },
    politicalExposure: { level: 'medium', score: 62 },
    sanctions: { level: 'low', score: 8 },
  },
  screenings: [
    { type: 'pep', status: 'hit', hits: 1, lastChecked: '2026-04-28T14:35:42Z' },
    { type: 'sanctions', status: 'clear', hits: 0, lastChecked: '2026-04-28T14:35:42Z' },
    { type: 'adverse_media', status: 'clear', hits: 0, lastChecked: '2026-04-28T14:35:42Z' },
  ],
};

const entityRisk: RiskScoring = {
  level: 'high',
  globalScore: 78,
  subscores: {
    geography: { level: 'medium', score: 48 },
    activity: { level: 'high', score: 81 },
    politicalExposure: { level: 'high', score: 74 },
    sanctions: { level: 'medium', score: 36 },
  },
  screenings: [
    { type: 'pep', status: 'hit', hits: 2, lastChecked: '2026-05-01T08:11:00Z' },
    { type: 'sanctions', status: 'clear', hits: 0, lastChecked: '2026-05-01T08:11:00Z' },
    { type: 'adverse_media', status: 'hit', hits: 1, lastChecked: '2026-05-01T08:11:00Z' },
  ],
};

const individualWorkflow: WorkflowState = {
  currentStep: 'screening',
  steps: [
    { key: 'collection', label: 'Collecte', status: 'done' },
    { key: 'document_check', label: 'Vérification documentaire', status: 'done' },
    { key: 'screening', label: 'Screening', status: 'current' },
    { key: 'decision', label: 'Décision', status: 'todo' },
  ],
  assignee: { name: 'Romain Minaud', sublabel: 'Compliance officer' },
};

const entityWorkflow: WorkflowState = {
  currentStep: 'document_check',
  steps: [
    { key: 'collection', label: 'Collecte', status: 'done' },
    { key: 'document_check', label: 'Vérification documentaire', status: 'current' },
    { key: 'screening', label: 'Screening', status: 'todo' },
    { key: 'decision', label: 'Décision', status: 'todo' },
  ],
  assignee: { name: 'Sophie Bernard', sublabel: 'Compliance lead' },
};

export const mockIndividualDossier: KYCDossierDetail = {
  id: 'kyc-9f2c7a',
  reference: '6L1AQSVU',
  subjectType: 'individual',
  displayName: 'Camille Lefèvre',
  status: 'in_review',
  riskLevel: individualRisk.level,
  createdAt: '2026-04-22T08:14:00Z',
  updatedAt: '2026-05-02T16:48:09Z',
  identity: individualIdentity,
  documents: individualDocuments,
  ubos: undefined,
  risk: individualRisk,
  workflow: individualWorkflow,
  auditEvents: baseAuditEvents,
  comments: baseComments,
};

export const mockEntityDossier: KYCDossierDetail = {
  id: 'kyc-3b7e21',
  reference: 'P9L0WULA',
  subjectType: 'entity',
  displayName: 'MERIDIAN PARTNERS SAS',
  status: 'to_review',
  riskLevel: entityRisk.level,
  createdAt: '2026-04-22T10:00:00Z',
  updatedAt: '2026-05-03T09:21:00Z',
  identity: entityIdentity,
  documents: entityDocuments,
  ubos: entityUbos,
  risk: entityRisk,
  workflow: entityWorkflow,
  auditEvents: baseAuditEvents,
  comments: baseComments,
};
