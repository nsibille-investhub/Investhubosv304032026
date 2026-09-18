/**
 * Donnees de maquette des panneaux d'historique et des changements de donnees
 * de la fiche souscription. Les libelles sont des cles de traduction : ces
 * tableaux vivent au niveau module, ou le hook de traduction n'existe pas.
 */

export type HistoryAuthorType = 'backoffice' | 'partner' | 'investor';

export interface InvestorHistoryEntry {
  id: string;
  at: string;
  authorType: HistoryAuthorType;
  author: string;
  labelKey: string;
}

export const mockInvestorHistory: InvestorHistoryEntry[] = [
  {
    id: 'ih-1',
    at: '03/09/2026 10:04',
    authorType: 'backoffice',
    author: 'Jean Dault',
    labelKey: 'subscriptions.detail.history.events.created',
  },
  {
    id: 'ih-2',
    at: '03/09/2026 10:06',
    authorType: 'backoffice',
    author: 'Jean Dault',
    labelKey: 'subscriptions.detail.history.events.invitationSent',
  },
  {
    id: 'ih-3',
    at: '05/09/2026 14:22',
    authorType: 'investor',
    author: 'Epsilon Fund',
    labelKey: 'subscriptions.detail.history.events.onboardingStarted',
  },
  {
    id: 'ih-4',
    at: '11/09/2026 09:41',
    authorType: 'partner',
    author: 'Masséna Wealth Management',
    labelKey: 'subscriptions.detail.history.events.documentUploaded',
  },
  {
    id: 'ih-5',
    at: '17/09/2026 16:30',
    authorType: 'investor',
    author: 'Epsilon Fund',
    labelKey: 'subscriptions.detail.history.events.onboardingSubmitted',
  },
  {
    id: 'ih-6',
    at: '17/09/2026 17:02',
    authorType: 'backoffice',
    author: 'Marie Dubois',
    labelKey: 'subscriptions.detail.history.events.answerRejected',
  },
  {
    id: 'ih-7',
    at: '18/09/2026 08:55',
    authorType: 'partner',
    author: 'Léa Chevalier',
    labelKey: 'subscriptions.detail.history.events.dataChangeRequested',
  },
];

export interface ComplianceHistoryEntry {
  id: string;
  at: string;
  author: string;
  labelKey: string;
}

export const mockComplianceHistory: ComplianceHistoryEntry[] = [
  {
    id: 'ch-1',
    at: '19/05/2026 16:10',
    author: 'Système',
    labelKey: 'subscriptions.detail.history.complianceEvents.screeningRun',
  },
  {
    id: 'ch-2',
    at: '19/05/2026 16:22',
    author: 'Marie Dubois',
    labelKey: 'subscriptions.detail.history.complianceEvents.matchDismissed',
  },
  {
    id: 'ch-3',
    at: '19/05/2026 16:24',
    author: 'Système',
    labelKey: 'subscriptions.detail.history.complianceEvents.scoreComputed',
  },
  {
    id: 'ch-4',
    at: '19/05/2026 16:31',
    author: 'Marie Dubois',
    labelKey: 'subscriptions.detail.history.complianceEvents.componentForced',
  },
  {
    id: 'ch-5',
    at: '19/05/2026 16:35',
    author: 'Marie Dubois',
    labelKey: 'subscriptions.detail.history.complianceEvents.categorisationSaved',
  },
];

export interface InvestorDocumentHistoryEntry {
  id: string;
  providedAt: string;
  nameKey: string;
  subscriptionRef: string;
  fundName: string;
}

export const mockInvestorDocumentsHistory: InvestorDocumentHistoryEntry[] = [
  {
    id: 'idh-1',
    providedAt: '11/09/2026',
    nameKey: 'subscriptions.detail.docs.idCard',
    subscriptionRef: 'SUB-15',
    fundName: 'Sustainable Growth',
  },
  {
    id: 'idh-2',
    providedAt: '11/09/2026',
    nameKey: 'subscriptions.detail.docs.addressProof',
    subscriptionRef: 'SUB-15',
    fundName: 'Sustainable Growth',
  },
  {
    id: 'idh-3',
    providedAt: '04/03/2026',
    nameKey: 'subscriptions.detail.docs.rib',
    subscriptionRef: 'SUB-08',
    fundName: 'Impact Growth II',
  },
  {
    id: 'idh-4',
    providedAt: '17/11/2025',
    nameKey: 'subscriptions.detail.docs.taxNotice',
    subscriptionRef: 'SUB-03',
    fundName: 'Infra Transition',
  },
];

export type DataChangeStatus = 'toValidate' | 'validated' | 'refused';

export interface DataChangeRequest {
  id: string;
  at: string;
  fieldKey: string;
  newValue: string;
  infoKey: string;
  status: DataChangeStatus;
  origin: 'investor' | 'partner';
  reason?: string;
}

export const mockDataChanges: DataChangeRequest[] = [
  {
    id: 'dc-1',
    at: '18/09/2026 08:55',
    fieldKey: 'subscriptions.detail.dataChanges.fields.address',
    newValue: '12 rue des Peupliers, 75013 Paris',
    infoKey: 'subscriptions.detail.dataChanges.info.movedIn',
    status: 'toValidate',
    origin: 'partner',
  },
  {
    id: 'dc-2',
    at: '16/09/2026 11:12',
    fieldKey: 'subscriptions.detail.dataChanges.fields.phone',
    newValue: '+33 6 12 34 56 78',
    infoKey: 'subscriptions.detail.dataChanges.info.newNumber',
    status: 'toValidate',
    origin: 'investor',
  },
  {
    id: 'dc-3',
    at: '12/09/2026 15:47',
    fieldKey: 'subscriptions.detail.dataChanges.fields.bankAccount',
    newValue: 'FR76 **** **** **** 4412',
    infoKey: 'subscriptions.detail.dataChanges.info.bankChange',
    status: 'validated',
    origin: 'investor',
  },
  {
    id: 'dc-4',
    at: '09/09/2026 09:03',
    fieldKey: 'subscriptions.detail.dataChanges.fields.email',
    newValue: 'contact@example.com',
    infoKey: 'subscriptions.detail.dataChanges.info.typo',
    status: 'refused',
    origin: 'partner',
    reason: 'Adresse déjà utilisée sur un autre dossier.',
  },
];
