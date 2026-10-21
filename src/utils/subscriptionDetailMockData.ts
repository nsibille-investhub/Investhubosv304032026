import {
  User,
  Shield,
  DollarSign,
  FileText,
  TrendingUp,
  Compass,
  Repeat,
} from 'lucide-react';
import type { OnboardingQuestionConstraints, OnboardingQuestionType } from './onboardingQuestionTypes';

export interface MockQuestion {
  question: string;
  response: string;
  verified: boolean;
  hasAlert?: boolean;
  /** Type de saisie, texte par défaut. */
  type?: OnboardingQuestionType;
  options?: string[];
  constraints?: OnboardingQuestionConstraints;
  /** Champ composé, calculé à partir d'autres réponses : non modifiable. */
  computed?: boolean;
  /** Élément sans réponse (titre, texte d'information). */
  info?: boolean;
  /** Question non posée à l'investisseur (condition d'affichage non remplie). */
  notAsked?: boolean;
  /** Itération d'une section répétable, à partir de 1. */
  iteration?: number;
  /** Données alimentées par la réponse (IC-5619). */
  targets?: MockLinkedTarget[];
  /** Réponses déclenchées par cette question (IC-5619). */
  triggers?: MockTrigger[];
  /** Réponse de prélèvement : à "Oui", la soumission crée une référence de mandat (IC-5269). */
  createsMandate?: boolean;
}

export type MockLinkedObject = 'subscription' | 'investor' | 'partner' | 'participation';

export interface MockLinkedTarget {
  object: MockLinkedObject;
  /** Clé de traduction du champ, sous subscriptions.detail.answerEffects.fields. */
  field: string;
  /** Valeur de la donnée avant la soumission, écrasée par le report (IC-5269). */
  previousValue?: string;
}

export interface MockTrigger {
  /** Intitulé exact de la question déclenchée, dans la même section. */
  question: string;
  /** Valeur posée selon la nouvelle réponse ; absente de la table : `otherwise`, sinon inchangée. */
  values: Record<string, string>;
  otherwise?: string;
}

export interface MockSection {
  id: string;
  titleKey: string;
  icon: any;
  questions: MockQuestion[];
  /** Section du préonboarding configuré au niveau de l'application, contrôlée avec le dossier. */
  preonboarding?: boolean;
  /** Section répétable : clé du libellé d'une itération ("Engagement {{n}}"). */
  iterationLabelKey?: string;
}

export interface MockRequiredDocument {
  nameKey: string;
  /** Libellé libre d'une pièce ajoutée hors nomenclature (prioritaire sur nameKey). */
  name?: string;
  /** Le type de document exige une date d'émission : vide, la pièce bloque la validation. */
  requiresIssueDate?: boolean;
  /** Ajout manuel de l'opérateur, hors nomenclature. */
  manual?: boolean;
  /** Motif du refus, visible de l'investisseur. */
  rejectionReason?: string;
  dateSent: string;
  issueDate: string;
  expiration: string;
  hasFile: boolean;
}

export type SubscriptionDocumentCategory = 'subscriptionForm' | 'contractual' | 'regulatory' | 'evidence';

/**
 * Cycle de signature d'un document de souscription. Les documents remis pour
 * information (DIC, règlement) ne se signent pas : leur lecture est attestée.
 */
export type SubscriptionDocumentStatus =
  | 'draft'
  | 'awaitingSignature'
  | 'awaitingCounterSignature'
  | 'completed'
  | 'acknowledged'
  | 'issued';

export interface MockSubscriptionDocument {
  id: number;
  nameKey: string;
  file: string;
  category: SubscriptionDocumentCategory;
  status: SubscriptionDocumentStatus;
  language: 'FR' | 'EN';
  version: number;
  /** Signataires attendus sur le document ; absent pour un document non signable. */
  signers?: { signed: number; total: number };
  /** Dernier événement : génération, envoi, signature. Décalage en jours par rapport à aujourd'hui. */
  updatedDaysAgo: number;
}

export type KycDocumentCategory = 'identity' | 'address' | 'tax' | 'funds' | 'bank' | 'company' | 'ubo' | 'compliance';
export type KycDocumentStatus = 'validated' | 'toReview' | 'rejected' | 'missing';
export type KycHolderRole = 'investor' | 'entity' | 'legalRepresentative' | 'beneficialOwners';

export interface MockKycDocument {
  id: number;
  nameKey: string;
  category: KycDocumentCategory;
  holder: KycHolderRole;
  status: KycDocumentStatus;
  /** 'investorFile' : pièce du dossier investisseur, reprise d'une souscription à l'autre. */
  origin: 'investorFile' | 'subscription';
  file?: string;
  /** Décalages en jours par rapport à aujourd'hui (négatif = passé). */
  issuedInDays?: number;
  expiresInDays?: number;
  /** Validité réglementaire depuis la date d'émission (Kbis, justificatif de domicile : 3 mois). */
  maxAgeDays?: number;
  rejectionReasonKey?: string;
  /** Motif saisi par l'opérateur au refus. */
  rejectionReason?: string;
}

export interface MockNote {
  id: string;
  titleKey: string;
  contentKey: string;
  author: string;
  date: string;
  reminderDate?: string;
  attachment?: string;
}

export interface MockEmail {
  id: number;
  date: string;
  type: string;
  recipients: string;
  cc: string;
  subject: string;
  receivedAt: string;
  openedAt: string;
  clickedAt: string;
}

/** États d'une ligne d'appel, alignés sur le module Appels de fonds. */
export type CapitalCallLineState = 'toNotify' | 'notified' | 'paymentDeclared' | 'paid';

export interface MockCapitalCall {
  id: number;
  /** Libellé de l'appel, saisi par la société de gestion. */
  name: string;
  reference: string;
  /** Part de l'engagement appelée, en %. */
  calledPercent: number;
  /** Frais d'entrée et prime de souscription prélevés sur cet appel. */
  includesEntryCosts: boolean;
  state: CapitalCallLineState;
  /** Décalages en jours par rapport à aujourd'hui (négatif = passé). */
  notifiedInDays: number | null;
  dueInDays: number;
  paidInDays: number | null;
  lastReminderInDays: number | null;
  paymentOrigin: 'bankReconciliation' | 'directDebit' | 'manual' | null;
}

export const mockSections: MockSection[] = [
  {
    id: 'investorProfile',
    titleKey: 'subscriptions.detail.sections.investorProfile',
    icon: Compass,
    preonboarding: true,
    questions: [
      { question: "Êtes-vous un investisseur professionnel au sens de la directive MIF II ?*", response: "Non", verified: true },
      { question: "Avez-vous déjà investi dans un fonds non coté ?*", response: "Oui", verified: true },
      { question: "Horizon d'investissement envisagé*", response: "Plus de 8 ans", verified: true },
      { question: "J'ai pris connaissance du risque de perte totale ou partielle du capital investi*", response: "Oui", verified: true },
    ]
  },
  {
    id: 'identity',
    titleKey: 'subscriptions.detail.sections.identity',
    icon: User,
    questions: [
      { question: "Les informations ci-dessous doivent correspondre à votre pièce d'identité.", response: "", verified: true, info: true },
      { question: "Civilité*", response: "Madame", verified: true, type: 'list', options: ['Madame', 'Monsieur'], constraints: { required: true } },
      { question: "Nom*", response: "Wadouachi", verified: true, constraints: { required: true, maxLength: 50 } },
      { question: "Nom de naissance (si différent)", response: "", verified: true },
      { question: "Prénom*", response: "Inès", verified: true, constraints: { required: true, maxLength: 50 } },
      { question: "Nom complet", response: "Inès Wadouachi", verified: true, computed: true },
      { question: "L'investisseur est-il mineur ?*", response: "Non", verified: true, hasAlert: true, type: 'list', options: ['Oui', 'Non'], constraints: { required: true } },
      { question: "Date de naissance*", response: "14/05/2025", verified: true, type: 'date', constraints: { required: true, adult: true, minDate: '01/01/1900' } },
      { question: "Pays de naissance*", response: "France", verified: true, type: 'country', constraints: { required: true } },
      { question: "Code postal de naissance*", response: "75008", verified: true },
      { question: "Commune de naissance*", response: "Paris", verified: true },
      { question: "Nationalité*", response: "France", verified: true, hasAlert: true, type: 'country', constraints: { required: true }, targets: [{ object: 'investor', field: 'nationality' }] },
      { question: "E-mail*", response: "iwadouachi+testPM@eurazeo.com", verified: true, targets: [{ object: 'investor', field: 'email' }, { object: 'partner', field: 'investorEmail' }] },
      { question: "Numéro de téléphone mobile*", response: "+33622653352", verified: true, targets: [{ object: 'investor', field: 'phone' }] },
      { question: "Numéro et nom de rue*", response: "66 Rue Pierre Charron", verified: true, targets: [{ object: 'subscription', field: 'address' }, { object: 'investor', field: 'address' }] },
      { question: "Ville*", response: "Paris", verified: true, targets: [{ object: 'subscription', field: 'city' }, { object: 'investor', field: 'city' }] },
      { question: "Code postal*", response: "75008", verified: true, targets: [{ object: 'subscription', field: 'postalCode' }, { object: 'investor', field: 'postalCode' }] },
      { question: "Pays*", response: "France", verified: true, type: 'country', constraints: { required: true }, targets: [{ object: 'subscription', field: 'country' }, { object: 'investor', field: 'country' }] },
      { question: "Mon adresse de résidence est différente de mon adresse fiscale*", response: "Non", verified: true },
      { question: "Numéro d'identification Fiscale (NIF)*", response: "9739373633839", verified: true },
      { question: "Je possède un deuxième Numéro d'Identification Fiscale (NIF/TIN) *", response: "Non", verified: true },
      { question: "Citoyen(ne) et/ou résident fiscal(e) des États-Unis d'Amérique*", response: "Non", verified: true },
      { question: "Je certifie que les informations relatives à ma résidence fiscale déclarées ci-dessus sont correctes.*", response: "Oui", verified: true },
    ]
  },
  {
    id: 'fiscal',
    titleKey: 'subscriptions.detail.sections.fiscal',
    icon: Shield,
    questions: [
      { question: "Pays de résidence fiscale*", response: "France", verified: true, type: 'country', constraints: { required: true },
        targets: [{ object: 'investor', field: 'taxResidence' }, { object: 'participation', field: 'taxResidence' }],
        triggers: [{ question: "Citoyen(ne) et/ou résident fiscal(e) des États-Unis d'Amérique*", values: { 'États-Unis': 'Oui' }, otherwise: 'Non' }] },
      { question: "Pays de votre seconde résidence fiscale", response: "", verified: true, type: 'country', notAsked: true },
      { question: "Mon adresse de résidence est différente de mon adresse fiscale*", response: "Non", verified: true },
      { question: "Numéro d'identification Fiscale (NIF)*", response: "9739373633839", verified: true },
      { question: "Je possède un deuxième Numéro d'identification Fiscale (NIF/TIN)", response: "Non", verified: false },
      { question: "Citoyen(ne) et/ou résident fiscal(e) des États-Unis d'Amérique*", response: "Non", verified: true },
      { question: "Je certifie que les informations relatives à ma résidence fiscale déclarées ci-dessus sont correctes.*", response: "Oui", verified: true }
    ]
  },
  {
    id: 'banking',
    titleKey: 'subscriptions.detail.sections.banking',
    icon: DollarSign,
    questions: [
      { question: "Type*", response: "Compte courant", verified: true },
      { question: "Le compte bancaire utilisé pour cette souscription est-il un compte individuel ou un compte joint ?*", response: "Compte joint", verified: true, type: 'list', options: ['Compte individuel', 'Compte joint'], constraints: { required: true },
        triggers: [{ question: "Quel est le régime matrimonial des titulaires du compte joint ?*", values: { 'Compte individuel': '' } }] },
      { question: "Quel est le régime matrimonial des titulaires du compte joint ?*", response: "Communauté universelle", verified: false },
      { question: "Je confirme avoir pris connaissance du fait que le versement de l'engagement n'est possible que par prélèvement automatique.*", response: "Oui", verified: true, type: 'list', options: ['Oui', 'Non'], createsMandate: true },
      { question: "Nom de votre établissement bancaire", response: "BNP Paribas", verified: true },
      { question: "Adresse de la banque", response: "16 Boulevard des Italiens, 75009 Paris", verified: true },
      { question: "IBAN*", response: "FR76 4061 8803 1200 0407 6100 201", verified: true, constraints: { required: true, maxLength: 34 },
        targets: [{ object: 'subscription', field: 'iban' }, { object: 'investor', field: 'iban', previousValue: 'FR76 3000 4000 0312 3456 7890 143' }] },
      { question: "BIC*", response: "BNPAFRPPXXX", verified: true, targets: [{ object: 'subscription', field: 'bic' }] },
      { question: "Numéro de compte", response: "00407610020", verified: true }
    ]
  },
  {
    id: 'professional',
    titleKey: 'subscriptions.detail.sections.professional',
    icon: FileText,
    questions: [
      { question: "Vous êtes*", response: "Demandeur d'emploi", verified: true },
      { question: "Catégorie socio-professionnelle", response: "Artisans", verified: true },
      { question: "Secteur d'activité*", response: "banque", verified: true },
      { question: "Profession*", response: "banquier", verified: false },
      { question: "Avez vous exercé une profession financière durant plus d'un an ? *", response: "Oui", verified: true },
      { question: "Avez vous des liens avec des société cotées ? *", response: "Oui", verified: true },
      { question: "Pouvez-vous préciser ? *", response: "Actionnaire minoritaire", verified: true },
      { question: "Détenez-vous des parts ou actions dans des sociétés (< de 25 %) ? *", response: "Non", verified: true },
      { question: "Exercez-vous ou avez-vous exercé une fonction politiquement exposée ?*", response: "Non", verified: true, type: 'list', options: ['Oui', 'Non'], constraints: { required: true }, targets: [{ object: 'investor', field: 'pep' }] },
      { question: "Une personne de votre entourage exerce-t-elle ou a-t-elle exercé depuis moins d'un an une fonction politiquement exposée ?*", response: "Non", verified: true }
    ]
  },
  {
    id: 'financial',
    titleKey: 'subscriptions.detail.sections.financial',
    icon: TrendingUp,
    questions: [
      { question: "Quels sont les revenus annuels nets de votre foyer ?*", response: "800 000,00 EUR", verified: true, type: 'amount', constraints: { required: true, min: 0 } },
      { question: "Statut de votre résidence principale*", response: "Hébergé à titre gratuit", verified: true },
      { question: "Avez-vous un ou plusieurs engagement(s) financier(s) régulier(s) ?*", response: "Oui", verified: false, type: 'list', options: ['Oui', 'Non'], constraints: { required: true },
        triggers: [{ question: "Montant*", values: { Non: '' } }, { question: "Fréquence*", values: { Non: '' } }] },
      { question: "Montant*", response: "1 000,00 EUR", verified: true, type: 'amount', constraints: { required: true, min: 0 } },
      { question: "Fréquence*", response: "Mensuel", verified: true, type: 'list', options: ['Mensuel', 'Trimestriel', 'Annuel'], constraints: { required: true } },
      { question: "Quel est le montant estimé de votre patrimoine financier ?*", response: "1 999 999,00 EUR", verified: true, type: 'amount', constraints: { required: true, min: 0 }, targets: [{ object: 'investor', field: 'financialAssets', previousValue: '1 500 000,00 EUR' }] },
      { question: "Part de votre patrimoine financier investie dans ce fonds (%)*", response: "12 %", verified: true, type: 'percentage', constraints: { required: true, min: 0, max: 100 } },
      { question: "Nombre de personnes à charge", response: "2", verified: true, type: 'number', constraints: { min: 0, max: 20, integer: true } },
      { question: "Objectifs de votre investissement*", response: "Diversification, Transmission", verified: true, type: 'multiChoice', options: ['Diversification', 'Transmission', 'Revenus complémentaires', 'Optimisation fiscale', 'Valorisation du capital'], constraints: { required: true } },
      { question: "Classez vos priorités d'investissement*", response: "Valorisation du capital > Liquidité > Risque limité", verified: true, type: 'rankedChoice', options: ['Valorisation du capital', 'Liquidité', 'Risque limité'], constraints: { required: true } },
      { question: "Montant de vos placements à l'étranger", response: "", verified: true, type: 'amount', notAsked: true, constraints: { requiredIfFirstSubscription: true, min: 0 } },
      { question: "Part du patrimoine financier dans votre patrimoine global :*", response: ">50%", verified: true },
      { question: "Part des titres non cotés (comme les FCPi/FIP/FCPR) dans ce portefeuille financier :*", response: "<10%", verified: true },
      { question: "Montant global du patrimoine :*", response: "200 000,00 EUR", verified: true, type: 'amount', constraints: { required: true, min: 0 } }
    ]
  },
  {
    id: 'commitments',
    titleKey: 'subscriptions.detail.sections.commitments',
    icon: Repeat,
    iterationLabelKey: 'subscriptions.detail.onboarding.iteration.commitment',
    questions: [1, 2, 3].flatMap((iteration) => {
      const values = [
        ['Crédit immobilier', '1 850,00 EUR', '31/12/2041'],
        ['Crédit à la consommation', '320,00 EUR', '30/06/2028'],
        ['Pension alimentaire', '600,00 EUR', ''],
      ][iteration - 1];
      return [
        { question: "Nature de l'engagement*", response: values[0], verified: true, iteration, type: 'list' as const, options: ['Crédit immobilier', 'Crédit à la consommation', 'Pension alimentaire', 'Autre'], constraints: { required: true } },
        { question: "Montant mensuel*", response: values[1], verified: true, iteration, type: 'amount' as const, constraints: { required: true, min: 0 } },
        { question: "Date de fin", response: values[2], verified: true, iteration, type: 'date' as const, constraints: { minDate: '01/01/2026' } },
      ];
    }),
  },
  {
    id: 'documents',
    titleKey: 'subscriptions.detail.sections.documents',
    icon: FileText,
    questions: []
  }
];

export const mockRequiredDocuments: MockRequiredDocument[] = [
  { nameKey: 'subscriptions.detail.docs.passport', requiresIssueDate: true, dateSent: "19/05/2026 16:10", issueDate: "12/03/2019", expiration: "12/03/2029", hasFile: true },
  { nameKey: 'subscriptions.detail.docs.idCard', requiresIssueDate: true, dateSent: "19/05/2026 16:10", issueDate: "04/07/2021", expiration: "04/07/2031", hasFile: true },
  { nameKey: 'subscriptions.detail.docs.driverLicense', dateSent: "", issueDate: "", expiration: "", hasFile: false },
  { nameKey: 'subscriptions.detail.docs.residencePermit', dateSent: "", issueDate: "", expiration: "", hasFile: false },
  { nameKey: 'subscriptions.detail.docs.taxNotice', requiresIssueDate: true, rejectionReason: 'Document illisible, merci de transmettre une copie complète', dateSent: "19/05/2026 16:10", issueDate: "15/09/2025", expiration: "", hasFile: true },
  { nameKey: 'subscriptions.detail.docs.addressProof', requiresIssueDate: true, dateSent: "19/05/2026 16:10", issueDate: "", expiration: "", hasFile: true },
  { nameKey: 'subscriptions.detail.docs.fundsOrigin', dateSent: "", issueDate: "", expiration: "", hasFile: false },
  { nameKey: 'subscriptions.detail.docs.rib', dateSent: "19/05/2026 16:10", issueDate: "", expiration: "", hasFile: true }
];

export const mockSubscriptionDocuments: MockSubscriptionDocument[] = [
  { id: 1, nameKey: 'subscriptions.detail.documentsTab.subscription.docs.subscriptionForm', file: 'bulletin-souscription.pdf', category: 'subscriptionForm', status: 'completed', language: 'FR', version: 2, signers: { signed: 3, total: 3 }, updatedDaysAgo: 6 },
  { id: 2, nameKey: 'subscriptions.detail.documentsTab.subscription.docs.subscriptionAgreement', file: 'subscription-agreement.pdf', category: 'contractual', status: 'awaitingCounterSignature', language: 'EN', version: 1, signers: { signed: 2, total: 3 }, updatedDaysAgo: 6 },
  { id: 3, nameKey: 'subscriptions.detail.documentsTab.subscription.docs.investorStatus', file: 'declaration-statut-investisseur.pdf', category: 'contractual', status: 'completed', language: 'FR', version: 1, signers: { signed: 1, total: 1 }, updatedDaysAgo: 6 },
  { id: 4, nameKey: 'subscriptions.detail.documentsTab.subscription.docs.suitability', file: 'questionnaire-adequation.pdf', category: 'contractual', status: 'completed', language: 'FR', version: 1, signers: { signed: 1, total: 1 }, updatedDaysAgo: 7 },
  { id: 5, nameKey: 'subscriptions.detail.documentsTab.subscription.docs.fatcaCrs', file: 'auto-certification-fatca-crs.pdf', category: 'contractual', status: 'awaitingSignature', language: 'FR', version: 1, signers: { signed: 0, total: 1 }, updatedDaysAgo: 4 },
  { id: 6, nameKey: 'subscriptions.detail.documentsTab.subscription.docs.sepaMandate', file: 'mandat-sepa.pdf', category: 'contractual', status: 'awaitingSignature', language: 'FR', version: 1, signers: { signed: 0, total: 1 }, updatedDaysAgo: 4 },
  { id: 7, nameKey: 'subscriptions.detail.documentsTab.subscription.docs.sideLetter', file: 'side-letter.pdf', category: 'contractual', status: 'draft', language: 'EN', version: 1, signers: { signed: 0, total: 2 }, updatedDaysAgo: 2 },
  { id: 8, nameKey: 'subscriptions.detail.documentsTab.subscription.docs.kid', file: 'dic-priips.pdf', category: 'regulatory', status: 'acknowledged', language: 'FR', version: 3, updatedDaysAgo: 7 },
  { id: 9, nameKey: 'subscriptions.detail.documentsTab.subscription.docs.fundRegulation', file: 'reglement-fonds.pdf', category: 'regulatory', status: 'acknowledged', language: 'FR', version: 2, updatedDaysAgo: 7 },
  { id: 10, nameKey: 'subscriptions.detail.documentsTab.subscription.docs.signatureCertificate', file: 'certificat-preuve-signature.pdf', category: 'evidence', status: 'issued', language: 'EN', version: 1, updatedDaysAgo: 6 },
];

/** Pièces LCB-FT attendues pour une personne physique. */
export const mockIndividualKycDocuments: MockKycDocument[] = [
  { id: 1, nameKey: 'subscriptions.detail.documentsTab.kyc.docs.idDocument', category: 'identity', holder: 'investor', status: 'validated', origin: 'investorFile', file: 'piece-identite.pdf', issuedInDays: -3500, expiresInDays: 45 },
  { id: 2, nameKey: 'subscriptions.detail.documentsTab.kyc.docs.addressProof', category: 'address', holder: 'investor', status: 'toReview', origin: 'subscription', file: 'justificatif-domicile.pdf', issuedInDays: -40, maxAgeDays: 90 },
  { id: 3, nameKey: 'subscriptions.detail.documentsTab.kyc.docs.taxNotice', category: 'tax', holder: 'investor', status: 'validated', origin: 'investorFile', file: 'avis-imposition.pdf', issuedInDays: -400 },
  { id: 4, nameKey: 'subscriptions.detail.documentsTab.kyc.docs.fatcaCrsIndividual', category: 'tax', holder: 'investor', status: 'validated', origin: 'subscription', file: 'auto-certification-fatca-crs.pdf', issuedInDays: -7 },
  { id: 5, nameKey: 'subscriptions.detail.documentsTab.kyc.docs.fundsOrigin', category: 'funds', holder: 'investor', status: 'missing', origin: 'subscription' },
  { id: 6, nameKey: 'subscriptions.detail.documentsTab.kyc.docs.bankDetails', category: 'bank', holder: 'investor', status: 'validated', origin: 'investorFile', file: 'rib.pdf', issuedInDays: -200 },
  { id: 7, nameKey: 'subscriptions.detail.documentsTab.kyc.docs.pepDeclaration', category: 'compliance', holder: 'investor', status: 'rejected', origin: 'subscription', file: 'declaration-ppe.pdf', issuedInDays: -7, rejectionReasonKey: 'subscriptions.detail.documentsTab.kyc.rejectionReasons.unsigned' },
];

/** Pièces LCB-FT attendues pour une personne morale. */
export const mockCorporateKycDocuments: MockKycDocument[] = [
  { id: 1, nameKey: 'subscriptions.detail.documentsTab.kyc.docs.kbis', category: 'company', holder: 'entity', status: 'validated', origin: 'subscription', file: 'extrait-kbis.pdf', issuedInDays: -30, maxAgeDays: 90 },
  { id: 2, nameKey: 'subscriptions.detail.documentsTab.kyc.docs.articles', category: 'company', holder: 'entity', status: 'validated', origin: 'investorFile', file: 'statuts.pdf', issuedInDays: -900 },
  { id: 3, nameKey: 'subscriptions.detail.documentsTab.kyc.docs.financialStatements', category: 'company', holder: 'entity', status: 'validated', origin: 'investorFile', file: 'comptes-annuels.pdf', issuedInDays: -180 },
  { id: 4, nameKey: 'subscriptions.detail.documentsTab.kyc.docs.signatoryPowers', category: 'company', holder: 'legalRepresentative', status: 'validated', origin: 'subscription', file: 'pouvoir-signataire.pdf', issuedInDays: -10 },
  { id: 5, nameKey: 'subscriptions.detail.documentsTab.kyc.docs.legalRepId', category: 'identity', holder: 'legalRepresentative', status: 'validated', origin: 'investorFile', file: 'piece-identite-representant.pdf', issuedInDays: -3400, expiresInDays: 45 },
  { id: 6, nameKey: 'subscriptions.detail.documentsTab.kyc.docs.uboRegister', category: 'ubo', holder: 'entity', status: 'toReview', origin: 'subscription', file: 'registre-beneficiaires-effectifs.pdf', issuedInDays: -20 },
  { id: 7, nameKey: 'subscriptions.detail.documentsTab.kyc.docs.uboIds', category: 'ubo', holder: 'beneficialOwners', status: 'missing', origin: 'subscription' },
  { id: 8, nameKey: 'subscriptions.detail.documentsTab.kyc.docs.fatcaCrsEntity', category: 'tax', holder: 'entity', status: 'rejected', origin: 'subscription', file: 'auto-certification-fatca-crs-entite.pdf', issuedInDays: -7, rejectionReasonKey: 'subscriptions.detail.documentsTab.kyc.rejectionReasons.wrongForm' },
  { id: 9, nameKey: 'subscriptions.detail.documentsTab.kyc.docs.fundsOrigin', category: 'funds', holder: 'entity', status: 'toReview', origin: 'subscription', file: 'origine-fonds.pdf', issuedInDays: -7 },
  { id: 10, nameKey: 'subscriptions.detail.documentsTab.kyc.docs.bankDetailsEntity', category: 'bank', holder: 'entity', status: 'validated', origin: 'investorFile', file: 'rib-societe.pdf', issuedInDays: -300 },
];

export const mockNotes: MockNote[] = [
  { id: 'sub-note-1', titleKey: 'subscriptions.detail.notes.mockTitle1', contentKey: 'subscriptions.detail.notes.mock1', author: 'Marie Dubois', date: '2025-12-28T14:32:00', reminderDate: '2026-01-05T09:00:00' },
  { id: 'sub-note-2', titleKey: 'subscriptions.detail.notes.mockTitle2', contentKey: 'subscriptions.detail.notes.mock2', author: 'Jean Dault', date: '2025-12-27T16:45:00' },
  { id: 'sub-note-3', titleKey: 'subscriptions.detail.notes.mockTitle3', contentKey: 'subscriptions.detail.notes.mock3', author: 'Pierre Martin', date: '2025-12-26T10:15:00' },
  { id: 'sub-note-4', titleKey: 'subscriptions.detail.notes.mockTitle4', contentKey: 'subscriptions.detail.notes.mock4', author: 'Sophie Laurent', date: '2025-12-25T09:20:00', reminderDate: '2026-01-02T09:00:00' },
  { id: 'sub-note-5', titleKey: 'subscriptions.detail.notes.mockTitle5', contentKey: 'subscriptions.detail.notes.mock5', author: 'Marie Dubois', date: '2025-12-24T17:30:00', attachment: 'dossier-kyc.pdf' },
  { id: 'sub-note-6', titleKey: 'subscriptions.detail.notes.mockTitle6', contentKey: 'subscriptions.detail.notes.mock6', author: 'Jean Dupont', date: '2025-12-23T11:00:00', attachment: 'releve-bancaire.pdf' },
  { id: 'sub-note-7', titleKey: 'subscriptions.detail.notes.mockTitle7', contentKey: 'subscriptions.detail.notes.mock7', author: 'Pierre Martin', date: '2025-12-22T14:45:00' }
];

export const mockEmails: MockEmail[] = [
  { id: 1, date: '12/12/2025 11:59:45', type: 'Signature documents_par', recipients: 'serge.lagavennefr@gail.com', cc: 'cc_grandmaisonleFR@fnac.net, benoit.beauliufr@fnac.net', subject: 'Vos documents Privés Assets Convexités 2026 à signer', receivedAt: '12/12/2025 11:59:46', openedAt: '12/12/2025 12:05:23', clickedAt: '12/12/2025 12:06:15' },
  { id: 2, date: '12/12/2025 11:59:45', type: 'Onboarding à valider', recipients: 'pasboutsupers@gailcom', cc: '', subject: 'Onboarding à valider pour Serge LAGAVENNE', receivedAt: '12/12/2025 11:59:47', openedAt: '12/12/2025 14:22:10', clickedAt: '' },
  { id: 3, date: '12/12/2025 11:59:41', type: 'Onboarding à valider', recipients: 'genson_premiululFR@fnac.net', cc: '', subject: 'Onboarding à valider pour Serge LAGAVENNE', receivedAt: '12/12/2025 11:59:42', openedAt: '', clickedAt: '' }
];

export const mockCapitalCalls: MockCapitalCall[] = [
  { id: 1, name: 'Closing 1 - Appel n°1', reference: 'AF-2026-001', calledPercent: 10, includesEntryCosts: true, state: 'paid', notifiedInDays: -120, dueInDays: -105, paidInDays: -107, lastReminderInDays: null, paymentOrigin: 'bankReconciliation' },
  { id: 2, name: 'Appel n°2', reference: 'AF-2026-002', calledPercent: 15, includesEntryCosts: false, state: 'paid', notifiedInDays: -45, dueInDays: -30, paidInDays: -30, lastReminderInDays: null, paymentOrigin: 'directDebit' },
  { id: 3, name: 'Appel n°3', reference: 'AF-2026-003', calledPercent: 10, includesEntryCosts: false, state: 'notified', notifiedInDays: -6, dueInDays: 12, paidInDays: null, lastReminderInDays: -2, paymentOrigin: null },
];

export interface MockInitEmail {
  id: string;
  slug: string;
  templateKey: string;
  audience: 'investor' | 'partner' | 'manager';
  sentAt: string | null;
  receivedAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
}

export const mockInitEmails: MockInitEmail[] = [
  {
    id: 'onboarding-link',
    slug: 'onboarding-link',
    templateKey: 'subscriptions.detail.initStep.templates.onboardingLink',
    audience: 'investor',
    sentAt: '12/12/2025 09:14',
    receivedAt: '12/12/2025 09:14',
    openedAt: '12/12/2025 09:41',
    clickedAt: '12/12/2025 09:42',
  },
  {
    id: 'invitation',
    slug: 'invitation',
    templateKey: 'subscriptions.detail.initStep.templates.invitation',
    audience: 'investor',
    sentAt: '12/12/2025 09:15',
    receivedAt: '12/12/2025 09:15',
    openedAt: null,
    clickedAt: null,
  },
  {
    id: 'new-subscription-notification',
    slug: 'new-subscription-notification',
    templateKey: 'subscriptions.detail.initStep.templates.newSubscription',
    audience: 'manager',
    sentAt: '12/12/2025 09:14',
    receivedAt: '12/12/2025 09:14',
    openedAt: '12/12/2025 10:02',
    clickedAt: null,
  },
];

export type SignaturePackDocumentKind = 'toSign' | 'annex';

export interface MockSignaturePackDocument {
  id: string;
  name: string;
  file: string;
  kind: SignaturePackDocumentKind;
  /** 'bulletin' : prevu par le bulletin de souscription, non retirable. 'manual' : ajoute par l'operateur. */
  source: 'bulletin' | 'manual';
}

/** Pack de signature propose par defaut : documents du bulletin a signer, annexes du fonds. */
export const mockSignaturePack: MockSignaturePackDocument[] = [
  { id: 'pack-bs', name: 'Bulletin de souscription', file: 'bulletin-souscription.pdf', kind: 'toSign', source: 'bulletin' },
  { id: 'pack-declaration', name: 'Déclaration de statut professionnel', file: 'declaration-statut-professionnel.pdf', kind: 'toSign', source: 'bulletin' },
  { id: 'pack-fatca', name: 'Auto-certification FATCA / CRS', file: 'auto-certification-fatca-crs.pdf', kind: 'toSign', source: 'bulletin' },
  { id: 'pack-side-letter', name: 'Side letter', file: 'side-letter.pdf', kind: 'toSign', source: 'manual' },
  { id: 'pack-dici', name: 'DICI', file: 'dici.pdf', kind: 'annex', source: 'bulletin' },
  { id: 'pack-statuts', name: 'Statuts du fonds', file: 'statuts.pdf', kind: 'annex', source: 'bulletin' },
  { id: 'pack-reglement', name: 'Règlement du fonds', file: 'reglement.pdf', kind: 'annex', source: 'manual' },
];

export interface MockCounterSignatory {
  id: string;
  name: string;
  roleKey: string;
  email: string;
}

/** Contre-signataires definis au niveau du fonds (societe de gestion). */
export const mockFundCounterSignatories: MockCounterSignatory[] = [
  {
    id: 'fund-cs-1',
    name: 'Laurent Dupuis',
    roleKey: 'subscriptions.detail.signatureStep.roles.managingDirector',
    email: 'laurent.dupuis@example.com',
  },
  {
    id: 'fund-cs-2',
    name: 'Claire Moreau',
    roleKey: 'subscriptions.detail.signatureStep.roles.middleOffice',
    email: 'claire.moreau@example.com',
  },
];

export interface MockBeneficialOwner {
  id: string;
  name: string;
  ownership: number;
  /** Clé de traduction du type de contrôle. */
  controlTypeKey: string;
  nationality: string;
  birthDate: string;
}

export const mockBeneficialOwners: MockBeneficialOwner[] = [
  { id: 'bo-1', name: 'Hélène Marchand', ownership: 42, controlTypeKey: 'subscriptions.detail.beneficialOwners.control.capital', nationality: 'France', birthDate: '03/02/1968' },
  { id: 'bo-2', name: 'Thomas Keller', ownership: 31, controlTypeKey: 'subscriptions.detail.beneficialOwners.control.votingRights', nationality: 'Suisse', birthDate: '21/11/1974' },
  { id: 'bo-3', name: 'Lucie Garnier', ownership: 0, controlTypeKey: 'subscriptions.detail.beneficialOwners.control.otherMeans', nationality: 'France', birthDate: '09/06/1981' },
];

/** Report des données du dossier à la soumission (IC-5269). */
export const MOCK_SUBMISSION_REPORT = {
  submittedAt: '19/05/2026 16:10',
  mandateReference: 'RUM-2026-000184',
  /** Documents mappés, copiés sur la fiche investisseur. */
  documents: [
    { nameKey: 'subscriptions.detail.docs.passport', field: 'identityDocument' },
    { nameKey: 'subscriptions.detail.docs.addressProof', field: 'addressProofDocument' },
  ],
};
