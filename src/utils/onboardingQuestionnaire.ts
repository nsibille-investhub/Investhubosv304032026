import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  DollarSign,
  FileText,
  Globe,
  Landmark,
  Layers3,
  Shield,
  ShieldAlert,
  User,
  Users,
  Wallet,
} from 'lucide-react';

/**
 * Questionnaire d'onboarding de démonstration pour le détail de souscription.
 * Tout ce qui est décrit ici existe dans le moteur du back-office : filtres de
 * public, conditions d'affichage, déclenchements de réponses, autocomplétion
 * greffe, champs composés, sous-sections répétées, blocages et alertes.
 * Les dossiers, personnes et sociétés sont fictifs.
 */

export type QuestionType =
  | 'singleChoice'
  | 'dropdown'
  | 'multiDropdown'
  | 'multiChoice'
  | 'checkbox'
  | 'openText'
  | 'country'
  | 'multiCountry'
  | 'date'
  | 'amount'
  | 'percentage'
  | 'comments'
  | 'adminInput'
  | 'composite'
  | 'innerSection'
  | 'title'
  | 'text';

export type QuestionNature = 'question' | 'admin' | 'composite' | 'innerSection' | 'presentation';

export type Answer = string | string[];

export type Visibility = 'all' | 'individual' | 'corporate';

export interface TriggerCondition {
  /** Question déclencheur (identifiant de question, ou d'une sous-question dans la même itération). */
  parentId: string;
  /** Réponses attendues. Pour une case à cocher : ['Oui'] = cochée, ['Non'] = non cochée. */
  expected: string[];
  /** 'notIn' : la condition est remplie quand la réponse n'est PAS dans la liste (ex. tout pays sauf France). */
  mode?: 'in' | 'notIn';
}

/** Filtres de public, communs aux questions, sections et documents. */
export interface AudienceFilters {
  visibility?: Visibility;
  distributorOnly?: boolean;
  directOnly?: boolean;
  investorSegments?: string[];
  investorSegmentsExcluded?: string[];
  partnerSegments?: string[];
  partnerSegmentsExcluded?: string[];
  participationSegments?: string[];
  participationSegmentsExcluded?: string[];
  shares?: string[];
  kyc?: 'all' | 'first' | 'refresh';
  transfer?: 'all' | 'original' | 'transfer';
  secondary?: 'all' | 'original' | 'secondary';
}

/** Déclenchement de réponses : une réponse à cette question pose une valeur sur une autre question. */
export interface AnswerTrigger {
  targetId: string;
  /** Réponses qui déclenchent. Absent = toute réponse renseignée (copie). */
  when?: string[];
  /** Valeur posée. Absent = copie de la réponse de la question source. */
  value?: string;
  overwrite: boolean;
}

export interface BlockRule {
  /** Blocage si la réponse est vide. */
  whenEmpty?: boolean;
  /** Blocage si la réponse est l'une de ces valeurs. */
  whenValues?: string[];
  /** Blocage avancé : doit être identique à la réponse de cette question. */
  equalsTo?: string;
  /** Blocage avancé : doit différer de la réponse de cette question. */
  differsFrom?: string;
  /** Blocage à deux questions : bloqué si la réponse vaut `value` alors que `otherId` vaut `otherValue`. */
  combined?: { value: string; otherId: string; otherValue: string };
  /** Le blocage est levé quand cette question porte cette valeur. */
  liftedBy?: { questionId: string; value: string };
  message: string;
}

export interface CompositeField {
  kind: 'fees' | 'insert' | 'trigger';
  /** Gabarit affiché tel que paramétré. */
  template: string;
  /** kind = insert : questions insérées. */
  insertIds?: string[];
  /** kind = trigger : déclencheur et branches. */
  trigger?: TriggerCondition;
  whenValue?: string;
  elseValue?: string;
}

export interface QuestionDef extends AudienceFilters {
  id: string;
  label: string;
  type: QuestionType;
  nature?: QuestionNature;
  options?: string[];
  /** true = obligatoire ; 'firstSubscription' = obligatoire à la première souscription seulement. */
  mandatory?: boolean | 'firstSubscription';
  trigger?: TriggerCondition;
  /** Déclencheur pointant vers une question supprimée : la question n'est jamais posée. */
  orphanTrigger?: string;
  /** Déclencheur porté par une question d'un autre onboarding. */
  externalOnboardingTrigger?: string;
  disabled?: boolean;
  hiddenLabel?: boolean;
  answerTriggers?: AnswerTrigger[];
  /** Cette question déclenche l'autocomplétion greffe des questions marquées `registryField`. */
  registryTrigger?: boolean;
  registryField?: string;
  alertWhen?: string[];
  block?: BlockRule;
  composite?: CompositeField;
  /** Sous-questions répétées (type innerSection). */
  subQuestions?: QuestionDef[];
  subSectionLabel?: string;
  /** Rattachements de données. */
  subscriptionData?: string;
  investorData?: string;
  partnerData?: string;
  dataType?: 'iban' | 'siren' | 'orias';
  pasteForbidden?: boolean;
  contracts?: string[];
  /** Question ouverte avec réponse exacte obligatoire utilisant les variables du bulletin. */
  exactAnswerTemplate?: string;
}

export interface SectionDef extends AudienceFilters {
  id: string;
  titleKey: string;
  icon: LucideIcon;
  trigger?: TriggerCondition;
  questions: QuestionDef[];
}

export interface DocumentDef extends AudienceFilters {
  id: string;
  label: string;
  trigger?: TriggerCondition;
  /** Document rattaché à une sous-section répétée : une demande par itération, au plus `maxTargets`. */
  innerSectionId?: string;
  maxTargets?: number;
}

export interface DemoDossier {
  id: 'A' | 'B' | 'C';
  subscriberName: string;
  subscriberFirstName: string;
  subscriberType: 'individual' | 'corporate';
  assisted: boolean;
  distributorName?: string;
  distributorSegment?: string;
  share: string;
  investorSegments: string[];
  participationSegments: string[];
  kycContext: 'first' | 'refresh';
  transfer: boolean;
  secondary: boolean;
  fees: { pct: string; amount: string } | null;
  firstSubscription: boolean;
  situationKey: string;
  answers: Record<string, Answer>;
  /** Réponses d'une sous-section répétée, une entrée par itération. */
  iterations: Record<string, Array<Record<string, Answer>>>;
  /** Réponses conservées sur des questions qui ne sont plus posées. */
  retainedAnswers: Record<string, Answer>;
  providedDocuments: Record<string, { dateSent: string; issueDate: string; expiration: string }>;
}

const YES_NO = ['Oui', 'Non'];

export const BLOCKED_COUNTRIES = [
  'Afghanistan',
  'Biélorussie',
  'Corée du Nord',
  'Iran',
  'Libye',
  'Myanmar',
  'Somalie',
  'Soudan',
  'Syrie',
  'Venezuela',
  'Yémen',
];

export const GAFI_COUNTRIES = ['Afghanistan', 'Corée du Nord', 'Iran', 'Myanmar', 'Syrie', 'Yémen'];

export const NON_EU_COUNTRIES = [
  'Australie',
  'Canada',
  'Émirats arabes unis',
  'États-Unis',
  'Hong Kong',
  'Israël',
  'Japon',
  'Liban',
  'Maroc',
  'Monaco',
  'Norvège',
  'Royaume-Uni',
  'Singapour',
  'Suisse',
  'Tunisie',
];

export const SEGMENT_PRIVATE_BANK = 'Clientèle banque privée';
export const SEGMENT_EMPLOYEES = 'Salariés du groupe';
export const SEGMENT_BANK_NETWORK = 'Réseau bancaire';
export const SEGMENT_CGP_NETWORK = 'Réseau CGP';

export const ONBOARDING_SECTIONS: SectionDef[] = [
  {
    id: 'identity',
    titleKey: 'subscriptions.detail.sections.identity',
    icon: User,
    questions: [
      { id: 'id.title', label: 'Vos coordonnées', type: 'title', nature: 'presentation' },
      { id: 'id.civility', label: 'Civilité', type: 'singleChoice', options: ['Madame', 'Monsieur'], mandatory: true, visibility: 'individual' },
      { id: 'id.lastName', label: 'Nom', type: 'openText', mandatory: true, visibility: 'individual', investorData: 'nom' },
      { id: 'id.firstName', label: 'Prénom', type: 'openText', mandatory: true, visibility: 'individual', investorData: 'prénom' },
      {
        id: 'id.country',
        label: 'Pays de résidence',
        type: 'country',
        mandatory: true,
        answerTriggers: [{ targetId: 'fiscal.mainCountry', overwrite: false }],
      },
      { id: 'id.street', label: 'Numéro et rue', type: 'openText', mandatory: true },
      { id: 'id.complement', label: "Complément d'adresse", type: 'openText' },
      { id: 'id.zip', label: 'Code postal', type: 'openText', mandatory: true },
      { id: 'id.city', label: 'Ville', type: 'openText', mandatory: true },
      {
        id: 'id.correspondence',
        label: 'Adresse de correspondance',
        type: 'composite',
        nature: 'composite',
        composite: {
          kind: 'insert',
          template: "[ifnotempty][q-Complément d'adresse] [q-Numéro et rue] [q-Code postal] [q-Ville]",
          insertIds: ['id.complement', 'id.street', 'id.zip', 'id.city'],
        },
      },
      {
        id: 'id.email',
        label: 'Adresse e-mail du souscripteur',
        type: 'openText',
        mandatory: true,
        investorData: 'e-mail',
      },
      {
        id: 'id.coEmail',
        label: 'Adresse e-mail du co-souscripteur',
        type: 'openText',
        trigger: { parentId: 'bank.jointAccount', expected: ['Compte joint'] },
        block: {
          differsFrom: 'id.email',
          message: "L'adresse du co-souscripteur doit être différente de la vôtre.",
        },
      },
      { id: 'id.phonePP', label: 'Numéro de téléphone', type: 'openText', visibility: 'individual' },
      { id: 'id.phonePM', label: 'Numéro de téléphone', type: 'openText', visibility: 'corporate' },
      {
        id: 'id.internalRef',
        label: 'Référence interne du dossier',
        type: 'openText',
        hiddenLabel: true,
        contracts: ["Bulletin de souscription - Part A", "Bulletin de souscription - Part I"],
      },
      {
        id: 'id.engagement',
        label: 'Je souscris [nbparts] parts [partname] pour un montant de [amount].',
        type: 'openText',
        mandatory: true,
        exactAnswerTemplate: 'Je souscris [nbparts] parts [partname] pour un montant de [amount].',
        contracts: ["Bulletin de souscription - Part A", "Bulletin de souscription - Part I"],
      },
      { id: 'id.fax', label: 'Numéro de fax', type: 'openText', disabled: true },
      {
        id: 'id.nonEuNotice',
        label: 'Information relative aux résidents hors Union européenne',
        type: 'text',
        nature: 'presentation',
        trigger: { parentId: 'comp.nonEU', expected: ['Oui'] },
      },
    ],
  },
  {
    id: 'personal',
    titleKey: 'subscriptions.detail.sections.personal',
    icon: Users,
    visibility: 'individual',
    questions: [
      {
        id: 'pers.marital',
        label: 'Situation matrimoniale',
        type: 'dropdown',
        options: ['Célibataire', 'Marié(e)', 'Pacsé(e)', 'Divorcé(e)', 'Veuf(ve)'],
        mandatory: true,
        answerTriggers: [{ targetId: 'bank.jointAccount', when: ['Marié(e)'], value: 'Compte joint', overwrite: false }],
      },
      {
        id: 'pers.spouseJob',
        label: 'Profession du conjoint',
        type: 'openText',
        trigger: { parentId: 'pers.marital', expected: ['Marié(e)', 'Pacsé(e)'] },
      },
      { id: 'pers.dependents', label: 'Nombre de personnes à charge', type: 'openText' },
    ],
  },
  {
    id: 'bank',
    titleKey: 'subscriptions.detail.sections.banking',
    icon: DollarSign,
    questions: [
      {
        id: 'bank.type',
        label: 'Type',
        type: 'dropdown',
        options: ['Compte courant', 'Compte-titres ordinaire', 'PEA-PME'],
        mandatory: true,
      },
      {
        id: 'bank.securitiesNumber',
        label: 'Numéro du compte-titres',
        type: 'openText',
        trigger: { parentId: 'bank.type', expected: ['Compte-titres ordinaire', 'PEA-PME'] },
      },
      {
        id: 'bank.custodian',
        label: 'Établissement teneur de compte',
        type: 'openText',
        trigger: { parentId: 'bank.type', expected: ['Compte-titres ordinaire', 'PEA-PME'] },
      },
      {
        id: 'bank.jointAccount',
        label: 'Le compte bancaire utilisé pour cette souscription est-il un compte individuel ou un compte joint ?',
        type: 'singleChoice',
        options: ['Compte individuel', 'Compte joint'],
        mandatory: true,
      },
      {
        id: 'bank.regime',
        label: 'Quel est le régime matrimonial des titulaires du compte joint ?',
        type: 'dropdown',
        options: ['Communauté réduite aux acquêts', 'Communauté universelle', 'Séparation de biens', 'Participation aux acquêts'],
        trigger: { parentId: 'bank.jointAccount', expected: ['Compte joint'] },
      },
      {
        id: 'bank.marriageDate',
        label: 'Date du contrat de mariage',
        type: 'date',
        trigger: { parentId: 'bank.regime', expected: ['Séparation de biens', 'Participation aux acquêts'] },
      },
      {
        id: 'bank.directDebit',
        label: "Je confirme avoir pris connaissance du fait que le versement de l'engagement n'est possible que par prélèvement automatique.",
        type: 'checkbox',
        mandatory: true,
        block: { whenEmpty: true, message: 'Le prélèvement automatique est la seule modalité de versement sur ce fonds.' },
      },
      { id: 'bank.name', label: 'Nom de votre établissement bancaire', type: 'openText', subscriptionData: 'banque' },
      {
        id: 'bank.iban',
        label: 'IBAN',
        type: 'openText',
        dataType: 'iban',
        mandatory: true,
        pasteForbidden: true,
        subscriptionData: 'IBAN',
      },
      {
        id: 'bank.ibanConfirm',
        label: 'Confirmez votre IBAN',
        type: 'openText',
        dataType: 'iban',
        mandatory: true,
        block: { equalsTo: 'bank.iban', message: 'Les deux IBAN saisis ne correspondent pas.' },
      },
      {
        id: 'bank.beneficiary',
        label: 'Bénéficiaire des distributions',
        type: 'dropdown',
        options: ['Le souscripteur', 'Un tiers'],
        block: {
          combined: { value: 'Un tiers', otherId: 'bank.jointAccount', otherValue: 'Compte individuel' },
          message: 'Un compte individuel ne peut pas désigner un tiers bénéficiaire.',
        },
      },
    ],
  },
  {
    id: 'fiscal',
    titleKey: 'subscriptions.detail.sections.fiscal',
    icon: Shield,
    visibility: 'individual',
    questions: [
      {
        id: 'fiscal.mainCountry',
        label: 'Pays de résidence fiscale principale',
        type: 'country',
        mandatory: true,
        block: {
          whenValues: BLOCKED_COUNTRIES,
          liftedBy: { questionId: 'ctx.mifCategory', value: 'Professionnel' },
          message: 'Nous ne pouvons pas accepter de souscription depuis ce pays.',
        },
        answerTriggers: [{ targetId: 'ppe.vigilance', when: GAFI_COUNTRIES, value: 'Renforcée', overwrite: false }],
      },
      { id: 'fiscal.otherRes', label: "Avez-vous d'autres résidences fiscales ?", type: 'checkbox' },
      {
        id: 'fiscal.otherCountries',
        label: 'Pays de vos autres résidences fiscales',
        type: 'multiCountry',
        trigger: { parentId: 'fiscal.otherRes', expected: ['Oui'] },
      },
      {
        id: 'fiscal.otherNif',
        label: "Numéro d'identification fiscale dans ces pays",
        type: 'comments',
        trigger: { parentId: 'fiscal.otherCountries', expected: ['France'], mode: 'notIn' },
      },
      {
        id: 'fiscal.usPerson',
        label: 'Êtes-vous une US Person au sens de la réglementation FATCA ?',
        type: 'singleChoice',
        options: YES_NO,
        mandatory: true,
        alertWhen: ['Oui'],
      },
      {
        id: 'fiscal.tin',
        label: 'Numéro TIN américain',
        type: 'openText',
        trigger: { parentId: 'fiscal.usPerson', expected: ['Oui'] },
      },
    ],
  },
  {
    id: 'ppe',
    titleKey: 'subscriptions.detail.sections.ppe',
    icon: ShieldAlert,
    visibility: 'individual',
    questions: [
      {
        id: 'ppe.self',
        label: 'Exercez-vous ou avez-vous exercé au cours des douze derniers mois une fonction politique, juridictionnelle ou administrative importante ?',
        type: 'singleChoice',
        options: YES_NO,
        mandatory: true,
        alertWhen: ['Oui'],
        answerTriggers: [{ targetId: 'ppe.vigilance', when: ['Oui'], value: 'Renforcée', overwrite: false }],
      },
      {
        id: 'ppe.nature',
        label: 'Nature de la fonction exercée',
        type: 'dropdown',
        options: ["Chef d'État ou de gouvernement", 'Parlementaire', 'Magistrat', 'Ambassadeur', "Dirigeant d'entreprise publique", 'Autre'],
        trigger: { parentId: 'ppe.self', expected: ['Oui'] },
      },
      {
        id: 'ppe.country',
        label: "Pays d'exercice de la fonction",
        type: 'country',
        trigger: { parentId: 'ppe.self', expected: ['Oui'] },
      },
      {
        id: 'ppe.relative',
        label: 'Un membre de votre famille proche ou une personne qui vous est étroitement associée est-elle dans cette situation ?',
        type: 'singleChoice',
        options: YES_NO,
        alertWhen: ['Oui'],
        answerTriggers: [{ targetId: 'ppe.vigilance', when: ['Oui'], value: 'Renforcée', overwrite: false }],
      },
      {
        id: 'ppe.link',
        label: 'Lien avec la personne concernée',
        type: 'openText',
        trigger: { parentId: 'ppe.relative', expected: ['Oui'] },
      },
      {
        id: 'ppe.vigilance',
        label: 'Niveau de vigilance',
        type: 'adminInput',
        nature: 'admin',
        options: ['Standard', 'Renforcée'],
      },
    ],
  },
  {
    id: 'vigilance',
    titleKey: 'subscriptions.detail.sections.vigilance',
    icon: Layers3,
    trigger: { parentId: 'ppe.vigilance', expected: ['Renforcée'] },
    questions: [
      { id: 'vig.origin', label: 'Origine du patrimoine', type: 'comments', mandatory: true },
      { id: 'vig.amount', label: 'Montant estimé du patrimoine', type: 'amount', mandatory: true },
    ],
  },
  {
    id: 'funds',
    titleKey: 'subscriptions.detail.sections.funds',
    icon: Wallet,
    questions: [
      {
        id: 'funds.origin',
        label: 'Origine des fonds investis',
        type: 'multiChoice',
        options: ['Épargne', 'Revenus professionnels', 'Héritage ou donation', "Cession d'entreprise", 'Cession immobilière', 'Autre'],
        mandatory: true,
      },
      {
        id: 'funds.inheritance',
        label: 'Date et montant de la succession ou donation',
        type: 'openText',
        trigger: { parentId: 'funds.origin', expected: ['Héritage ou donation'] },
      },
      {
        id: 'funds.company',
        label: 'Dénomination de la société cédée',
        type: 'openText',
        trigger: { parentId: 'funds.origin', expected: ["Cession d'entreprise"] },
      },
      {
        id: 'funds.saleDate',
        label: 'Date de la cession',
        type: 'date',
        trigger: { parentId: 'funds.origin', expected: ["Cession d'entreprise"] },
      },
      {
        id: 'funds.property',
        label: 'Adresse du bien cédé',
        type: 'openText',
        trigger: { parentId: 'funds.origin', expected: ['Cession immobilière'] },
      },
      {
        id: 'funds.over10',
        label: 'Cet investissement représente-t-il plus de 10 % de votre patrimoine financier ?',
        type: 'singleChoice',
        options: YES_NO,
        alertWhen: ['Oui'],
      },
      {
        id: 'funds.riskConfirm',
        label: "Je confirme avoir conscience du risque de perte en capital et de l'absence de liquidité pendant la durée de vie du fonds.",
        type: 'checkbox',
        trigger: { parentId: 'funds.over10', expected: ['Oui'] },
        block: { whenEmpty: true, message: 'Cette confirmation est indispensable pour poursuivre.' },
      },
    ],
  },
  {
    id: 'corporate',
    titleKey: 'subscriptions.detail.sections.corporate',
    icon: Building2,
    visibility: 'corporate',
    questions: [
      { id: 'corp.siren', label: 'Numéro SIREN', type: 'openText', dataType: 'siren', mandatory: true, registryTrigger: true },
      { id: 'corp.name', label: 'Dénomination sociale', type: 'openText', registryField: 'dénomination', investorData: 'raison sociale' },
      { id: 'corp.legalForm', label: 'Forme juridique', type: 'dropdown', options: ['SAS', 'SA', 'SARL', 'SCI', 'Association'], registryField: 'forme juridique' },
      {
        id: 'corp.beCount',
        label: 'Nombre de bénéficiaires effectifs détenant, directement ou indirectement, plus de 25 % du capital ou des droits de vote',
        type: 'innerSection',
        nature: 'innerSection',
        mandatory: true,
        registryField: 'bénéficiaires effectifs',
        subSectionLabel: 'Bénéficiaire effectif',
        subQuestions: [
          { id: 'be.lastName', label: 'Nom', type: 'openText', mandatory: true },
          { id: 'be.firstName', label: 'Prénom', type: 'openText', mandatory: true },
          { id: 'be.birthDate', label: 'Date de naissance', type: 'date', mandatory: true },
          { id: 'be.nationality', label: 'Nationalité', type: 'country', mandatory: true },
          { id: 'be.pct', label: 'Pourcentage de détention', type: 'percentage', mandatory: true },
          {
            id: 'be.ppe',
            label: 'Le bénéficiaire est-il une personne politiquement exposée ?',
            type: 'singleChoice',
            options: YES_NO,
            mandatory: true,
            alertWhen: ['Oui'],
          },
          { id: 'be.function', label: 'Fonction exercée', type: 'openText', trigger: { parentId: 'be.ppe', expected: ['Oui'] } },
        ],
      },
      {
        id: 'corp.fi',
        label: 'La société est-elle une institution financière au sens de la norme CRS ?',
        type: 'singleChoice',
        options: YES_NO,
        mandatory: true,
      },
      { id: 'corp.giin', label: 'Numéro GIIN', type: 'openText', trigger: { parentId: 'corp.fi', expected: ['Oui'] } },
      {
        id: 'corp.nfe',
        label: "S'agit-il d'une entité non financière active ou passive ?",
        type: 'singleChoice',
        options: ['Active', 'Passive'],
        trigger: { parentId: 'corp.fi', expected: ['Non'] },
      },
      {
        id: 'corp.controlNonFr',
        label: 'Une des personnes détenant le contrôle est-elle résidente fiscale hors de France ?',
        type: 'singleChoice',
        options: YES_NO,
        trigger: { parentId: 'corp.nfe', expected: ['Passive'] },
      },
      {
        id: 'corp.controlCountries',
        label: 'Pays de résidence fiscale des personnes détenant le contrôle',
        type: 'multiCountry',
        trigger: { parentId: 'corp.controlNonFr', expected: ['Oui'] },
      },
      {
        id: 'corp.controlNif',
        label: "Numéro d'identification fiscale des personnes détenant le contrôle",
        type: 'comments',
        trigger: { parentId: 'corp.controlCountries', expected: ['France'], mode: 'notIn' },
      },
    ],
  },
  {
    id: 'context',
    titleKey: 'subscriptions.detail.sections.context',
    icon: Globe,
    questions: [
      { id: 'ctx.orias', label: 'Numéro ORIAS du conseiller', type: 'openText', dataType: 'orias', distributorOnly: true, partnerData: 'ORIAS' },
      {
        id: 'ctx.source',
        label: 'Comment avez-vous connu ce fonds ?',
        type: 'dropdown',
        options: ['Presse', 'Recommandation', 'Site internet', 'Événement'],
        directOnly: true,
        investorSegmentsExcluded: [SEGMENT_EMPLOYEES],
        shares: ['A'],
      },
      { id: 'ctx.bankRef', label: 'Référence client banque privée', type: 'openText', investorSegments: [SEGMENT_PRIVATE_BANK] },
      { id: 'ctx.partnerCode', label: 'Code apporteur interne', type: 'openText', partnerSegments: [SEGMENT_BANK_NETWORK] },
      { id: 'ctx.employeeAgreement', label: 'Référence de l\'accord de participation salariée', type: 'openText', participationSegmentsExcluded: [SEGMENT_EMPLOYEES] },
      {
        id: 'ctx.mifPro',
        label: 'Confirmez-vous être un investisseur professionnel au sens de la directive MIF ?',
        type: 'singleChoice',
        options: YES_NO,
        shares: ['I', 'S'],
        block: { whenValues: ['Non'], message: 'Cette part est réservée aux investisseurs professionnels.' },
        answerTriggers: [{ targetId: 'ctx.mifCategory', when: ['Oui'], value: 'Professionnel', overwrite: false }],
      },
      {
        id: 'ctx.mifCategory',
        label: 'Catégorie MIF',
        type: 'adminInput',
        nature: 'admin',
        options: ['Non professionnel', 'Professionnel', 'Contrepartie éligible'],
        investorData: "type d'investisseur",
      },
      {
        id: 'ctx.transferReason',
        label: 'Motif du transfert',
        type: 'dropdown',
        options: ['Succession', 'Donation', 'Cession de gré à gré'],
        transfer: 'transfer',
        mandatory: true,
      },
      { id: 'ctx.secondaryPrice', label: 'Acceptez-vous le prix de cession proposé ?', type: 'checkbox', secondary: 'secondary' },
      {
        id: 'ctx.kycChanged',
        label: 'Votre situation personnelle ou patrimoniale a-t-elle évolué depuis votre dernière déclaration ?',
        type: 'singleChoice',
        options: YES_NO,
        kyc: 'refresh',
      },
      {
        id: 'ctx.kid',
        label: "J'atteste avoir pris connaissance du document d'informations clés.",
        type: 'checkbox',
        mandatory: 'firstSubscription',
      },
      {
        id: 'ctx.distributorCode',
        label: "Code d'accès distributeur",
        type: 'openText',
        externalOnboardingTrigger: 'KYC Distributeur',
      },
      {
        id: 'ctx.amountJustification',
        label: 'Justification du montant souscrit',
        type: 'comments',
        orphanTrigger: 'Montant supérieur au seuil de vigilance',
      },
    ],
  },
  {
    id: 'composite',
    titleKey: 'subscriptions.detail.sections.composite',
    icon: Landmark,
    questions: [
      {
        id: 'comp.fees',
        label: "Mention relative aux droits d'entrée",
        type: 'composite',
        nature: 'composite',
        composite: {
          kind: 'fees',
          template: "[ifhasfees]Je reconnais que des droits d'entrée de [fees_amount], soit [fees_pct] % de mon engagement, s'appliquent à cette souscription.",
        },
      },
      {
        id: 'comp.nonEU',
        label: 'Résident hors Union européenne',
        type: 'composite',
        nature: 'composite',
        composite: {
          kind: 'trigger',
          template: '[iftrigger]Oui[else]Non',
          trigger: { parentId: 'fiscal.mainCountry', expected: NON_EU_COUNTRIES },
          whenValue: 'Oui',
          elseValue: 'Non',
        },
      },
      {
        id: 'comp.crossBorder',
        label: 'Attestation relative aux règles de commercialisation transfrontalière',
        type: 'checkbox',
        mandatory: true,
        trigger: { parentId: 'comp.nonEU', expected: ['Oui'] },
      },
    ],
  },
];

export const ONBOARDING_DOCUMENTS: DocumentDef[] = [
  { id: 'doc.id', label: "Pièce d'identité du souscripteur", visibility: 'individual' },
  { id: 'doc.kbis', label: 'Extrait Kbis de moins de trois mois', visibility: 'corporate' },
  { id: 'doc.coHolderId', label: "Pièce d'identité du co-titulaire", trigger: { parentId: 'bank.jointAccount', expected: ['Compte joint'] } },
  { id: 'doc.marriageContract', label: 'Contrat de mariage', trigger: { parentId: 'bank.regime', expected: ['Séparation de biens', 'Participation aux acquêts'] } },
  { id: 'doc.w9', label: 'Formulaire W-9 signé', trigger: { parentId: 'fiscal.usPerson', expected: ['Oui'] } },
  { id: 'doc.w8ben', label: 'Formulaire W-8BEN signé', trigger: { parentId: 'fiscal.usPerson', expected: ['Non'] } },
  { id: 'doc.fundsOrigin', label: "Justificatif de l'origine des fonds", trigger: { parentId: 'ppe.vigilance', expected: ['Renforcée'] } },
  { id: 'doc.notary', label: 'Acte notarié', trigger: { parentId: 'funds.origin', expected: ['Héritage ou donation'] } },
  { id: 'doc.saleDeed', label: 'Acte de cession', trigger: { parentId: 'funds.origin', expected: ["Cession d'entreprise"] } },
  { id: 'doc.beId', label: "Pièce d'identité du bénéficiaire effectif", innerSectionId: 'corp.beCount', maxTargets: 4, visibility: 'corporate' },
  { id: 'doc.w8bene', label: 'Formulaire W-8BEN-E', trigger: { parentId: 'corp.fi', expected: ['Oui'] } },
  { id: 'doc.residenceProof', label: 'Justificatif de résidence', trigger: { parentId: 'comp.nonEU', expected: ['Oui'] } },
];

const IBAN_A = 'FR76 3000 6000 0112 3456 7890 189';

export const DEMO_DOSSIERS: DemoDossier[] = [
  {
    id: 'A',
    subscriberName: 'Camille',
    subscriberFirstName: 'Camille',
    subscriberType: 'individual',
    assisted: false,
    share: 'A',
    investorSegments: [],
    participationSegments: [],
    kycContext: 'first',
    transfer: false,
    secondary: false,
    fees: null,
    firstSubscription: true,
    situationKey: 'subscriptions.detail.onboarding.q.dossier.situationA',
    answers: {
      'id.civility': 'Madame',
      'id.lastName': 'Exemple',
      'id.firstName': 'Camille',
      'id.country': 'France',
      'id.street': '12 rue des Lilas',
      'id.zip': '69003',
      'id.city': 'Lyon',
      'id.email': 'camille@exemple.fr',
      'id.coEmail': 'co-souscripteur@exemple.fr',
      'id.phonePP': '+33 6 00 00 00 01',
      'id.internalRef': 'DOS-2026-0417',
      'id.engagement': 'Je souscris 10 parts A pour un montant de 100 000,00 EUR.',
      'pers.marital': 'Marié(e)',
      'pers.spouseJob': 'Architecte',
      'pers.dependents': '2',
      'bank.type': 'Compte courant',
      'bank.jointAccount': 'Compte joint',
      'bank.regime': 'Communauté universelle',
      'bank.directDebit': 'Oui',
      'bank.name': 'Banque Exemple',
      'bank.iban': IBAN_A,
      'bank.ibanConfirm': IBAN_A,
      'bank.beneficiary': 'Le souscripteur',
      'fiscal.mainCountry': 'France',
      'fiscal.usPerson': 'Non',
      'ppe.self': 'Non',
      'ppe.relative': 'Non',
      'funds.origin': ['Épargne', 'Héritage ou donation'],
      'funds.inheritance': 'Donation du 12/01/2025, 150 000 EUR',
      'funds.over10': 'Non',
      'ctx.source': 'Recommandation',
      'ctx.kid': 'Oui',
    },
    iterations: {},
    retainedAnswers: {},
    providedDocuments: {
      'doc.id': { dateSent: '19/05/2026 16:10', issueDate: '04/07/2021', expiration: '04/07/2031' },
      'doc.coHolderId': { dateSent: '19/05/2026 16:12', issueDate: '12/03/2019', expiration: '12/03/2029' },
      'doc.w8ben': { dateSent: '19/05/2026 16:15', issueDate: '19/05/2026', expiration: '' },
    },
  },
  {
    id: 'B',
    subscriberName: 'Alizé Holding SAS',
    subscriberFirstName: 'Alizé Holding SAS',
    subscriberType: 'corporate',
    assisted: true,
    distributorName: 'Cabinet Horizon Patrimoine',
    distributorSegment: SEGMENT_CGP_NETWORK,
    share: 'I',
    investorSegments: [SEGMENT_PRIVATE_BANK],
    participationSegments: [],
    kycContext: 'first',
    transfer: false,
    secondary: false,
    fees: { pct: '2', amount: '20 000,00 EUR' },
    firstSubscription: true,
    situationKey: 'subscriptions.detail.onboarding.q.dossier.situationB',
    answers: {
      'id.country': 'France',
      'id.street': '4 avenue du Port',
      'id.complement': 'Bâtiment C',
      'id.zip': '44000',
      'id.city': 'Nantes',
      'id.email': 'contact@alize-holding.example',
      'id.phonePM': '+33 2 00 00 00 02',
      'id.internalRef': 'DOS-2026-0522',
      'id.engagement': 'Je souscris 100 parts I pour un montant de 1 000 000,00 EUR.',
      'bank.type': 'Compte courant',
      'bank.jointAccount': 'Compte individuel',
      'bank.directDebit': 'Oui',
      'bank.name': 'Banque Exemple Entreprises',
      'bank.iban': 'FR76 1234 5678 9012 3456 7890 123',
      'bank.ibanConfirm': 'FR76 1234 5678 9012 3456 7890 123',
      'bank.beneficiary': 'Le souscripteur',
      'funds.origin': ['Revenus professionnels'],
      'funds.over10': 'Non',
      'corp.siren': '123 456 789',
      'corp.name': 'Alizé Holding SAS',
      'corp.legalForm': 'SAS',
      'corp.beCount': '3',
      'corp.fi': 'Non',
      'corp.nfe': 'Passive',
      'corp.controlNonFr': 'Oui',
      'corp.controlCountries': ['Luxembourg', 'Belgique'],
      'corp.controlNif': 'LU 1234 5678 901 ; BE 0123.456.789',
      'ctx.orias': '26 000 001',
      'ctx.bankRef': 'BP-77120',
      'ctx.mifPro': 'Oui',
      'ctx.mifCategory': 'Professionnel',
      'ctx.kid': 'Oui',
    },
    iterations: {
      'corp.beCount': [
        { 'be.lastName': 'Exemple', 'be.firstName': 'Anne', 'be.birthDate': '03/02/1971', 'be.nationality': 'France', 'be.pct': '40', 'be.ppe': 'Non' },
        { 'be.lastName': 'Exemple', 'be.firstName': 'Paul', 'be.birthDate': '17/09/1968', 'be.nationality': 'Luxembourg', 'be.pct': '35', 'be.ppe': 'Oui', 'be.function': 'Parlementaire' },
        { 'be.lastName': 'Exemple', 'be.firstName': 'Léa', 'be.birthDate': '28/11/1990', 'be.nationality': 'Belgique', 'be.pct': '25', 'be.ppe': 'Non' },
      ],
    },
    retainedAnswers: {},
    providedDocuments: {
      'doc.kbis': { dateSent: '02/06/2026 09:40', issueDate: '15/05/2026', expiration: '15/08/2026' },
      'doc.beId#1': { dateSent: '02/06/2026 09:41', issueDate: '10/01/2020', expiration: '10/01/2030' },
      'doc.beId#2': { dateSent: '02/06/2026 09:42', issueDate: '22/06/2018', expiration: '22/06/2028' },
    },
  },
  {
    id: 'C',
    subscriberName: 'Lucas',
    subscriberFirstName: 'Lucas',
    subscriberType: 'individual',
    assisted: false,
    share: 'A',
    investorSegments: [SEGMENT_EMPLOYEES],
    participationSegments: [SEGMENT_EMPLOYEES],
    kycContext: 'first',
    transfer: true,
    secondary: false,
    fees: null,
    firstSubscription: false,
    situationKey: 'subscriptions.detail.onboarding.q.dossier.situationC',
    answers: {
      'id.civility': 'Monsieur',
      'id.lastName': 'Exemple',
      'id.firstName': 'Lucas',
      'id.country': 'France',
      'id.street': '8 place de la Mairie',
      'id.zip': '33000',
      'id.city': 'Bordeaux',
      'id.email': 'lucas@exemple.fr',
      'id.phonePP': '+33 6 00 00 00 03',
      'id.internalRef': 'DOS-2026-0603',
      'id.engagement': 'Je souscris 5 parts A pour un montant de 50 000,00 EUR.',
      'pers.marital': 'Célibataire',
      'pers.dependents': '0',
      'bank.type': 'Compte courant',
      'bank.jointAccount': 'Compte individuel',
      'bank.directDebit': 'Oui',
      'bank.name': 'Banque Exemple',
      'bank.iban': 'FR76 9876 5432 1098 7654 3210 987',
      'bank.ibanConfirm': 'FR76 9876 5432 1098 7654 3210 987',
      'bank.beneficiary': 'Le souscripteur',
      'fiscal.mainCountry': 'France',
      'fiscal.otherRes': 'Oui',
      'fiscal.otherCountries': ['États-Unis'],
      'fiscal.otherNif': 'US 123-45-6789',
      'fiscal.usPerson': 'Oui',
      'fiscal.tin': '123-45-6789',
      'ppe.self': 'Non',
      'ppe.relative': 'Oui',
      'ppe.link': 'Frère, député',
      'ppe.vigilance': 'Renforcée',
      'vig.origin': "Cession de l'entreprise familiale en 2024",
      'vig.amount': '850 000,00 EUR',
      'funds.origin': ["Cession d'entreprise"],
      'funds.company': 'Exemple Industries SAS',
      'funds.saleDate': '14/03/2024',
      'funds.over10': 'Oui',
      'funds.riskConfirm': 'Oui',
      'ctx.transferReason': 'Donation',
      'ctx.kid': 'Oui',
    },
    iterations: {},
    retainedAnswers: {
      'pers.spouseJob': 'Enseignant',
    },
    providedDocuments: {
      'doc.id': { dateSent: '11/06/2026 10:05', issueDate: '02/02/2023', expiration: '02/02/2033' },
      'doc.w9': { dateSent: '11/06/2026 10:08', issueDate: '11/06/2026', expiration: '' },
      'doc.saleDeed': { dateSent: '11/06/2026 10:12', issueDate: '14/03/2024', expiration: '' },
    },
  },
];

/** Dossier de démonstration par défaut selon le type de souscripteur de la souscription ouverte. */
export function defaultDossierFor(subscriberType?: string): DemoDossier['id'] {
  return subscriberType === 'corporate' || subscriberType === 'structure' ? 'B' : 'A';
}
