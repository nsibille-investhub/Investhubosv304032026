import {
  User,
  Shield,
  DollarSign,
  FileText,
  TrendingUp,
} from 'lucide-react';

export interface MockQuestion {
  question: string;
  response: string;
  verified: boolean;
  hasAlert?: boolean;
  /** Piece jointe a la reponse, consultable depuis la ligne. */
  documentKey?: string;
}

export interface MockSection {
  id: string;
  titleKey: string;
  icon: any;
  questions: MockQuestion[];
  /** Section conditionnelle : elle n'est rendue que si elle s'applique au dossier. */
  conditional?: boolean;
  applicable?: boolean;
  /** Section interne : visible du back-office seul, rendue en fin d'ecran. */
  internal?: boolean;
}

export interface MockRequiredDocument {
  nameKey: string;
  dateSent: string;
  issueDate: string;
  expiration: string;
  hasFile: boolean;
  /** La piece exige une date d'emission : son absence bloque la validation. */
  requiresIssueDate?: boolean;
  /** Marqueurs V1 conserves a l'ecran. */
  certified?: boolean;
  forced?: boolean;
  internal?: boolean;
  additional?: boolean;
  replacedBy?: 'partner' | 'admin';
}

export type MockDocumentFamily = 'toSign' | 'postSubscription' | 'other' | 'specific';

export interface MockDocument {
  id: number;
  date: string;
  name: string;
  language: string;
  type: string;
  status: string;
  file: string;
  family: MockDocumentFamily;
  /** Version a signer, disponible avant le retour de signature. */
  unsignedFile?: string;
}

/** Document specifique ajoute au dossier, avec ses coordonnees de signature. */
export interface MockSpecificDocument {
  id: string;
  name: string;
  file: string;
  signatureCoordinates: string;
  counterSignatureCoordinates: string;
  signaturePages: string;
  counterSignaturePages: string;
}

export interface MockNote {
  id: number;
  attachment?: string;
  type: string;
  sectionKey: string;
  fieldKey: string;
  author: string;
  date: string;
  contentKey: string;
  status: string;
  priority: string;
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

export interface MockCapitalCall {
  id: number;
  date: string;
  call: string;
  amount: number;
  subscription: number;
  entryFees: number;
  subscriptionPremium: number;
  percentage: number;
  status: string;
}

export const mockSections: MockSection[] = [
  {
    id: 'identity',
    titleKey: 'subscriptions.detail.sections.identity',
    icon: User,
    questions: [
      { question: "Civilité*", response: "Madame", verified: true },
      { question: "Nom*", response: "Wadouachi", verified: true },
      { question: "Nom de naissance (si différent)", response: "", verified: true },
      { question: "Prénom*", response: "Inès", verified: true },
      { question: "L'investisseur est-il mineur ?*", response: "Non", verified: true, hasAlert: true },
      { question: "Date de naissance*", response: "14/05/2025", verified: true, documentKey: 'subscriptions.detail.docs.idCard' },
      { question: "Pays de naissance*", response: "France", verified: true },
      { question: "Code postal de naissance*", response: "75008", verified: true },
      { question: "Commune de naissance*", response: "Paris", verified: true },
      { question: "Nationalité*", response: "France", verified: true, hasAlert: true },
      { question: "E-mail*", response: "iwadouachi+testPM@eurazeo.com", verified: true },
      { question: "Numéro de téléphone mobile*", response: "+33622653352", verified: true },
      { question: "Numéro et nom de rue*", response: "66 Rue Pierre Charron", verified: true },
      { question: "Ville*", response: "Paris", verified: true },
      { question: "Code postal*", response: "75008", verified: true },
      { question: "Pays*", response: "France", verified: true },
      { question: "Mon adresse de résidence est différente de mon adresse fiscale*", response: "Non", verified: true },
      { question: "Numéro d'identification Fiscale (NIF)*", response: "9739373633839", verified: true, documentKey: 'subscriptions.detail.docs.taxNotice' },
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
      { question: "Pays de résidence fiscale*", response: "France", verified: true },
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
      { question: "Le compte bancaire utilisé pour cette souscription est-il un compte individuel ou un compte joint ?*", response: "Compte joint", verified: true },
      { question: "Quel est le régime matrimonial des titulaires du compte joint ?*", response: "Communauté universelle", verified: false },
      { question: "Je confirme avoir pris connaissance du fait que le versement de l'engagement n'est possible que par prélèvement automatique.*", response: "Oui", verified: true },
      { question: "Nom de votre établissement bancaire", response: "BNP Paribas", verified: true },
      { question: "Adresse de la banque", response: "16 Boulevard des Italiens, 75009 Paris", verified: true },
      { question: "IBAN*", response: "FR76 4061 8803 1200 0407 6100 201", verified: true },
      { question: "BIC*", response: "BNPAFRPPXXX", verified: true },
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
      { question: "Exercez-vous ou avez-vous exercé une fonction politiquement exposée ?*", response: "Non", verified: true },
      { question: "Une personne de votre entourage exerce-t-elle ou a-t-elle exercé depuis moins d'un an une fonction politiquement exposée ?*", response: "Non", verified: true }
    ]
  },
  {
    id: 'financial',
    titleKey: 'subscriptions.detail.sections.financial',
    icon: TrendingUp,
    questions: [
      { question: "Quels sont les revenus annuels nets de votre foyer ?*", response: "800 000,00 EUR", verified: true },
      { question: "Statut de votre résidence principale*", response: "Hébergé à titre gratuit", verified: true },
      { question: "Avez-vous un ou plusieurs engagement(s) financier(s) régulier(s) ?*", response: "Oui", verified: false },
      { question: "Montant*", response: "1 000,00 EUR", verified: true },
      { question: "Fréquence*", response: "Mensuel", verified: true },
      { question: "Quel est le montant estimé de votre patrimoine financier ?*", response: "1 999 999,00 EUR", verified: true },
      { question: "Part du patrimoine financier dans votre patrimoine global :*", response: ">50%", verified: true },
      { question: "Part des titres non cotés (comme les FCPi/FIP/FCPR) dans ce portefeuille financier :*", response: "<10%", verified: true },
      { question: "Montant global du patrimoine :*", response: "200 000,00 EUR", verified: true }
    ]
  },
  {
    id: 'usPerson',
    titleKey: 'subscriptions.detail.sections.usPerson',
    icon: Shield,
    conditional: true,
    applicable: false,
    questions: [
      { question: "Numéro de sécurité sociale américain (SSN)*", response: "", verified: false },
      { question: "Formulaire W-9 signé*", response: "", verified: false },
    ],
  },
  {
    id: 'internalReview',
    titleKey: 'subscriptions.detail.sections.internalReview',
    icon: Shield,
    internal: true,
    questions: [
      { question: "Origine du dossier vérifiée par le middle office*", response: "Oui", verified: true },
      { question: "Dossier soumis à vigilance renforcée*", response: "Non", verified: true },
      { question: "Commentaire interne", response: "", verified: false },
    ],
  },
  {
    id: 'documents',
    titleKey: 'subscriptions.detail.sections.documents',
    icon: FileText,
    questions: []
  }
];

export const mockRequiredDocuments: MockRequiredDocument[] = [
  { nameKey: 'subscriptions.detail.docs.passport', dateSent: "19/05/2026 16:10", issueDate: "12/03/2019", expiration: "12/03/2029", hasFile: true, requiresIssueDate: true, certified: true },
  { nameKey: 'subscriptions.detail.docs.idCard', dateSent: "19/05/2026 16:10", issueDate: "04/07/2021", expiration: "04/07/2031", hasFile: true, requiresIssueDate: true, replacedBy: 'partner' },
  { nameKey: 'subscriptions.detail.docs.driverLicense', dateSent: "", issueDate: "", expiration: "", hasFile: false },
  { nameKey: 'subscriptions.detail.docs.residencePermit', dateSent: "", issueDate: "", expiration: "", hasFile: false },
  { nameKey: 'subscriptions.detail.docs.taxNotice', dateSent: "19/05/2026 16:10", issueDate: "15/09/2025", expiration: "", hasFile: true, requiresIssueDate: true, forced: true },
  { nameKey: 'subscriptions.detail.docs.addressProof', dateSent: "19/05/2026 16:10", issueDate: "02/04/2026", expiration: "", hasFile: true, requiresIssueDate: true, replacedBy: 'admin' },
  { nameKey: 'subscriptions.detail.docs.fundsOrigin', dateSent: "", issueDate: "", expiration: "", hasFile: false, internal: true },
  { nameKey: 'subscriptions.detail.docs.rib', dateSent: "19/05/2026 16:10", issueDate: "", expiration: "", hasFile: true, requiresIssueDate: true, additional: true }
];

export const mockDocuments: MockDocument[] = [
  { id: 1, date: '26/11/2025', name: 'Certificat DocuSign', language: '', type: '', status: 'signed', file: 'certificat-docusign.pdf' , family: 'other' },
  { id: 2, date: '26/11/2025', name: 'ESMI II - Declaration of Investment Type', language: '', type: 'Document contractuel', status: 'signed', file: 'declaration-investment-type.pdf' , family: 'other' },
  { id: 3, date: '26/11/2025', name: 'ESMI II - Schedule 10 BEPS questionnaire', language: '', type: 'Document contractuel', status: 'signed', file: 'schedule-10-beps.pdf' , family: 'toSign' },
  { id: 4, date: '26/11/2025', name: 'ESMI II - Schedule 9 Tax compliancy declaration', language: '', type: 'Document contractuel', status: 'signed', file: 'schedule-9-tax.pdf' , family: 'toSign' },
  { id: 5, date: '26/11/2025', name: 'ESMI II - Schedule 8 Ultimate beneficial owner', language: '', type: 'Document contractuel', status: 'signed', file: 'schedule-8-ubo.pdf' , family: 'toSign' },
  { id: 6, date: '26/11/2025', name: 'ESMI II - Schedule 7 Entity self-certification for FATCA and CRS', language: '', type: 'Document contractuel', status: 'signed', file: 'schedule-7-fatca.pdf' , family: 'toSign' },
  { id: 7, date: '26/11/2025', name: 'ESMI II - Schedule 6 Bank account details of the Investor', language: '', type: 'Document contractuel', status: 'signed', file: 'schedule-6-bank.pdf' , family: 'toSign' },
  { id: 8, date: '26/11/2025', name: 'ESMI II - Schedule 4 Professional client status', language: '', type: 'Document contractuel', status: 'signed', file: 'schedule-4-professional.pdf' , family: 'toSign' },
  { id: 9, date: '26/11/2025', name: 'ESMI II - Schedule 2 - Commitment', language: '', type: 'Document contractuel', status: 'signed', file: 'schedule-2-commitment.pdf' , family: 'toSign' },
  { id: 10, date: '26/11/2025', name: 'ESMI II - Schedule 3 Well-informed Investor', language: '', type: 'Document contractuel', status: 'signed', file: 'schedule-3-well-informed.pdf' , family: 'toSign' },
  { id: 11, date: '26/11/2025', name: 'ESMI II - Schedule 1 Identity details of the Investor', language: '', type: 'Document contractuel', status: 'signed', file: 'schedule-1-identity.pdf' , family: 'toSign' },
  { id: 12, date: '26/11/2025', name: 'ESMI II - Subscription Agreement - Non US', language: '', type: 'Document contractuel', status: 'signed', file: 'subscription-agreement.pdf', family: 'toSign', unsignedFile: 'subscription-agreement-a-signer.pdf' },
  { id: 13, date: '04/12/2025', name: 'Attestation de souscription', language: 'FR', type: 'Document post-souscription', status: 'available', file: 'attestation-souscription.pdf', family: 'postSubscription' },
  { id: 14, date: '04/12/2025', name: 'Reçu de versement', language: 'FR', type: 'Document post-souscription', status: 'available', file: 'recu-versement.pdf', family: 'postSubscription' },
  { id: 15, date: '08/12/2025', name: 'Avenant de co-investissement', language: 'FR', type: 'Document spécifique', status: 'toSign', file: 'avenant-co-investissement.pdf', family: 'specific', unsignedFile: 'avenant-co-investissement-a-signer.pdf' }
];

export const mockSpecificDocuments: MockSpecificDocument[] = [
  {
    id: 'spec-1',
    name: 'Avenant de co-investissement',
    file: 'avenant-co-investissement.pdf',
    signatureCoordinates: 'x: 120 / y: 640',
    counterSignatureCoordinates: 'x: 360 / y: 640',
    signaturePages: '3',
    counterSignaturePages: '3',
  },
];

export const mockNotes: MockNote[] = [
  { id: 1, type: 'field', sectionKey: 'subscriptions.detail.sections.identity', fieldKey: 'Nationalité', author: 'Marie Dubois', date: '28/12/2025 14:32', contentKey: 'subscriptions.detail.notes.mock1', status: 'open', priority: 'high', attachment: 'note-nationalite.pdf' },
  { id: 2, type: 'field', sectionKey: 'subscriptions.detail.sections.identity', fieldKey: "L'investisseur est-il mineur ?", author: 'Jean Dupont', date: '27/12/2025 16:45', contentKey: 'subscriptions.detail.notes.mock2', status: 'open', priority: 'medium' },
  { id: 3, type: 'general', sectionKey: '', fieldKey: '', author: 'Pierre Martin', date: '26/12/2025 10:15', contentKey: 'subscriptions.detail.notes.mock3', status: 'resolved', priority: 'low' },
  { id: 4, type: 'field', sectionKey: 'subscriptions.detail.sections.banking', fieldKey: 'Quel est le régime matrimonial des titulaires du compte joint ?', author: 'Sophie Laurent', date: '25/12/2025 09:20', contentKey: 'subscriptions.detail.notes.mock4', status: 'open', priority: 'high' },
  { id: 5, type: 'general', sectionKey: '', fieldKey: '', author: 'Marie Dubois', date: '24/12/2025 17:30', contentKey: 'subscriptions.detail.notes.mock5', status: 'resolved', priority: 'medium' },
  { id: 6, type: 'field', sectionKey: 'subscriptions.detail.sections.documents', fieldKey: "Justificatif d'origine des fonds", author: 'Jean Dupont', date: '23/12/2025 11:00', contentKey: 'subscriptions.detail.notes.mock6', status: 'open', priority: 'high' },
  { id: 7, type: 'general', sectionKey: '', fieldKey: '', author: 'Pierre Martin', date: '22/12/2025 14:45', contentKey: 'subscriptions.detail.notes.mock7', status: 'open', priority: 'medium' }
];

export const mockEmails: MockEmail[] = [
  { id: 1, date: '12/12/2025 11:59:45', type: 'Signature documents_par', recipients: 'serge.lagavennefr@gail.com', cc: 'cc_grandmaisonleFR@fnac.net, benoit.beauliufr@fnac.net', subject: 'Vos documents Privés Assets Convexités 2026 à signer', receivedAt: '12/12/2025 11:59:46', openedAt: '12/12/2025 12:05:23', clickedAt: '12/12/2025 12:06:15' },
  { id: 2, date: '12/12/2025 11:59:45', type: 'Onboarding à valider', recipients: 'pasboutsupers@gailcom', cc: '', subject: 'Onboarding à valider pour Serge LAGAVENNE', receivedAt: '12/12/2025 11:59:47', openedAt: '12/12/2025 14:22:10', clickedAt: '' },
  { id: 3, date: '12/12/2025 11:59:41', type: 'Onboarding à valider', recipients: 'genson_premiululFR@fnac.net', cc: '', subject: 'Onboarding à valider pour Serge LAGAVENNE', receivedAt: '12/12/2025 11:59:42', openedAt: '', clickedAt: '' }
];

export const mockCapitalCalls: MockCapitalCall[] = [
  { id: 1, date: '31/10/2025', call: 'PAC 2026 - Closing 1', amount: 10000.00, subscription: 0.00, entryFees: 3000.00, subscriptionPremium: 1500.00, percentage: 10, status: 'paid' }
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
