import type { LucideIcon } from 'lucide-react';
import {
  BadgeEuro,
  Bell,
  CalendarDays,
  Database,
  FileDown,
  FileSignature,
  Handshake,
  IdCard,
  Landmark,
  LineChart,
  ListPlus,
  Megaphone,
  PenLine,
  Plug,
  Receipt,
  RefreshCcw,
  Scale,
} from 'lucide-react';
import type { FundDetail } from '../../../utils/fundDetailMock';
import { mockCustomFields } from '../../../utils/customFieldsMock';

/**
 * Schéma de l'onglet Paramètres (PRD Détail d'un fonds V3, sections 8 et 15.2).
 * Obligatoire, bloquant pour la publication, condition d'affichage, champ reçu du fonds
 * maître et ancien setting sont des réponses du serveur, déclarées ici pour la maquette.
 */

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'number'
  | 'amount'
  | 'percent'
  | 'select'
  | 'multiselect'
  | 'switch'
  | 'date'
  | 'color'
  | 'image'
  | 'richtext'
  | 'video'
  | 'emails'
  | 'dayMonthRange'
  | 'frequencyDay'
  | 'secret'
  | 'readonly';

export type SettingsValues = Record<string, unknown>;

export interface SettingsContext {
  detail: FundDetail;
  values: SettingsValues;
}

export interface FieldOption {
  value: string;
  /** Libellé de donnée (nom d'onboarding, prénom...). Sinon : clé options.<champ>.<valeur>. */
  label?: string;
}

export interface FieldDef {
  id: string;
  kind: FieldKind;
  options?: FieldOption[] | ((ctx: SettingsContext) => FieldOption[]);
  required?: boolean;
  /** Le manque empêche la publication du fonds. */
  blocking?: boolean;
  /** Issu d'un ancien setting de l'application : mention "Paramètre du fonds" et effet au survol. */
  legacy?: boolean;
  /** Reçu du fonds maître : en lecture seule sur un fonds miroir. */
  fromMaster?: boolean;
  /** Aide sous le champ. */
  hint?: boolean;
  /** Clé de libellé alternative selon le contexte. */
  labelKey?: (ctx: SettingsContext) => string | undefined;
  visible?: (ctx: SettingsContext) => boolean;
  /** Motif de verrouillage calculé par le serveur, sous forme de clé de traduction. */
  lockedKey?: (ctx: SettingsContext) => string | undefined;
  /** Le changement de valeur passe par une confirmation. */
  confirmChange?: boolean;
  /** Libellé de donnée pour un champ personnalisé. */
  label?: string;
}

export interface SectionDef {
  id: string;
  icon: LucideIcon;
  fields: FieldDef[];
  visible?: (ctx: SettingsContext) => boolean;
}

export interface SubTabDef {
  id: 'profile' | 'subscription' | 'management' | 'integrations';
  sections: SectionDef[];
}

const yes = (ctx: SettingsContext, id: string) => ctx.values[id] === true;
const isCalls = (ctx: SettingsContext) => ctx.values.paymentMode === 'calls';
const allowsRedemptions = (ctx: SettingsContext) => ctx.detail.shares.some(share => share.allowsRedemption);
const combinedOn = (ctx: SettingsContext) => ctx.values.combinedNotices !== 'disabled';

const keys = (...values: string[]): FieldOption[] => values.map(value => ({ value }));
const data = (...labels: string[]): FieldOption[] => labels.map(label => ({ value: label, label }));

const CONTACTS = data('Camille', 'Julien', 'Léa', 'Hugo', 'Inès', 'Paul');
const COUNTRIES = keys('FR', 'LU', 'BE', 'CH', 'DE', 'IT', 'ES');

export const NOTICE_FILE_VARIABLES = '{fund}, {share}, {investor}, {structure}, {operation}, {date}, {number}';

export const SETTINGS_SCHEMA: SubTabDef[] = [
  {
    id: 'profile',
    sections: [
      {
        id: 'identity',
        icon: IdCard,
        fields: [
          { id: 'name', kind: 'text', required: true, blocking: true },
          { id: 'adminName', kind: 'text' },
          { id: 'subscriptionPrefix', kind: 'text' },
          {
            id: 'managementCompany',
            kind: 'select',
            options: data('Orée Gestion', 'Lignes Capital', 'Sextant Partenaires'),
          },
          { id: 'fundType', kind: 'select', options: keys('standalone', 'parent', 'compartment'), required: true },
          {
            id: 'parentFund',
            kind: 'select',
            options: data('Fonds Horizon Croissance', 'Fonds Atlas Patrimoine', 'Fonds Cèdre Innovation'),
            required: true,
            blocking: true,
            visible: ctx => ctx.values.fundType === 'compartment',
          },
          {
            id: 'externalId',
            kind: 'text',
            // Le libellé indique Salesforce si la synchronisation est active (PRD section 8.2).
            labelKey: ctx => (yes(ctx, 'salesforceSync') ? 'externalIdSalesforce' : undefined),
          },
          { id: 'color', kind: 'color' },
          { id: 'logo', kind: 'image' },
          { id: 'displayOrder', kind: 'number' },
        ],
      },
      {
        id: 'legal',
        icon: Scale,
        fields: [
          {
            id: 'legalForm',
            kind: 'select',
            options: data('FCPR', 'FCPI', 'FIP', 'FPCI', 'SLP', 'SICAV', 'FCP'),
            required: true,
            fromMaster: true,
          },
          {
            id: 'depositary',
            kind: 'select',
            options: data('Banque Lumen', 'Dépositaire Arcadie', 'Banque Vauban Titres'),
          },
          {
            id: 'currency',
            kind: 'select',
            options: data('EUR', 'USD', 'CHF', 'GBP'),
            required: true,
            blocking: true,
            // Règle serveur simulée (PRD section 8.2, D6) : verrouillée dès la première souscription.
            lockedKey: ctx => (ctx.detail.subscribed > 0 ? 'currencyLocked' : undefined),
          },
          { id: 'countries', kind: 'multiselect', options: COUNTRIES, fromMaster: true },
          { id: 'targetSize', kind: 'amount', fromMaster: true },
        ],
      },
      {
        id: 'portal',
        icon: Megaphone,
        fields: [
          { id: 'displayedTargetSize', kind: 'text', fromMaster: true },
          { id: 'lifetime', kind: 'text', fromMaster: true },
          { id: 'strategy', kind: 'text', fromMaster: true },
          { id: 'marketing', kind: 'text', fromMaster: true },
          { id: 'pitch', kind: 'richtext', fromMaster: true },
          { id: 'advantages', kind: 'richtext', fromMaster: true },
          { id: 'introduction', kind: 'richtext', fromMaster: true },
          { id: 'description', kind: 'richtext', fromMaster: true },
          { id: 'subscriptionImage', kind: 'image', fromMaster: true },
          { id: 'video', kind: 'video', fromMaster: true, hint: true },
          { id: 'bannerContent', kind: 'textarea', fromMaster: true },
        ],
      },
    ],
  },
  {
    id: 'subscription',
    sections: [
      {
        id: 'subscription',
        icon: FileSignature,
        fields: [
          {
            id: 'onboardingIndividuals',
            kind: 'select',
            options: data('Onboarding particuliers 2026', 'Onboarding particuliers simplifié'),
            required: true,
            blocking: true,
          },
          {
            id: 'onboardingEntities',
            kind: 'select',
            options: data('Onboarding personnes morales 2026'),
            required: true,
          },
          {
            id: 'redemptionOnboarding',
            kind: 'select',
            options: data('Onboarding de rachat standard'),
            visible: allowsRedemptions,
          },
          {
            id: 'paymentMode',
            kind: 'select',
            options: keys('calls', 'direct'),
            required: true,
            blocking: true,
            confirmChange: true,
            fromMaster: true,
          },
          { id: 'shareDecimals', kind: 'number', required: true, blocking: true, hint: true, fromMaster: true },
          { id: 'aggregation', kind: 'switch', hint: true },
          { id: 'onlineInvestors', kind: 'switch' },
          { id: 'onlineDistributors', kind: 'switch' },
          { id: 'investorSegments', kind: 'multiselect', options: keys('professional', 'wellInformed', 'retail') },
          {
            id: 'distributorSegments',
            kind: 'multiselect',
            options: keys('independentAdvisors', 'privateBanks', 'familyOffices'),
          },
          { id: 'confirmationEmail', kind: 'switch' },
          { id: 'minimumExemption', kind: 'select', options: keys('none', 'sameFund', 'sameShare'), legacy: true },
        ],
      },
      {
        id: 'calendar',
        icon: CalendarDays,
        fields: [
          { id: 'collectionStart', kind: 'date', required: true, fromMaster: true },
          { id: 'collectionEnd', kind: 'date', fromMaster: true },
          { id: 'hideCollectionEnd', kind: 'switch', fromMaster: true },
          { id: 'closingDate', kind: 'date', hint: true, fromMaster: true },
          { id: 'commissionEnd', kind: 'date' },
          // Sur un fonds non evergreen, la bascule vit ici : la section Evergreen n'apparaît qu'ensuite.
          { id: 'evergreen', kind: 'switch', visible: ctx => !ctx.detail.evergreen, fromMaster: true },
        ],
      },
      {
        id: 'evergreen',
        icon: RefreshCcw,
        visible: ctx => ctx.detail.evergreen,
        fields: [
          { id: 'evergreen', kind: 'switch', fromMaster: true },
          { id: 'liquidityWindow', kind: 'dayMonthRange', required: true, visible: ctx => yes(ctx, 'evergreen'), fromMaster: true },
          { id: 'liquidityPercent', kind: 'percent', visible: ctx => yes(ctx, 'evergreen'), fromMaster: true },
          { id: 'centralization', kind: 'frequencyDay', required: true, visible: ctx => yes(ctx, 'evergreen'), fromMaster: true },
          {
            id: 'navFrequency',
            kind: 'select',
            options: keys('daily', 'weekly', 'monthly', 'quarterly', 'semiannual', 'annual'),
            fromMaster: true,
          },
          { id: 'redemptionDateRecalc', kind: 'switch', legacy: true, visible: ctx => yes(ctx, 'evergreen') },
        ],
      },
      {
        id: 'distribution',
        icon: Handshake,
        visible: ctx => ctx.detail.modules.partners,
        fields: [
          { id: 'preValidation', kind: 'switch' },
          { id: 'preValidationEmails', kind: 'emails', visible: ctx => yes(ctx, 'preValidation') },
          { id: 'distributorSignature', kind: 'switch' },
          { id: 'autoOpenNetwork', kind: 'switch', hint: true },
          {
            id: 'exclusiveDistributor',
            kind: 'select',
            options: data('Cabinet Aurore', 'Lignes Patrimoine', 'Sextant Conseil'),
          },
          { id: 'distributionAgreementRequired', kind: 'switch', legacy: true },
          {
            id: 'commissionPeriodicity',
            kind: 'select',
            options: keys('monthly', 'quarterly', 'semiannual', 'annual'),
            required: true,
          },
          { id: 'billCommissions', kind: 'switch' },
          { id: 'notBilledMessage', kind: 'textarea', visible: ctx => ctx.values.billCommissions === false },
        ],
      },
      {
        id: 'signature',
        icon: PenLine,
        fields: [
          { id: 'signatureProvider', kind: 'select', options: keys('application', 'alternative'), required: true, blocking: true, legacy: true },
          { id: 'mainSignatory', kind: 'select', options: CONTACTS, required: true, blocking: true },
          { id: 'secondarySignatory', kind: 'select', options: CONTACTS },
          { id: 'redemptionSignatory', kind: 'select', options: CONTACTS, visible: allowsRedemptions },
          { id: 'signatoryChoice', kind: 'switch' },
          { id: 'groupedSignature', kind: 'switch' },
          // Affichée si l'option est ouverte sur l'application (PRD section 8.2).
          { id: 'advancedSignature', kind: 'switch', visible: ctx => ctx.detail.modules.advancedSignature },
          { id: 'manualSignature', kind: 'switch' },
          { id: 'preSignature', kind: 'switch' },
          // Affichés si le prestataire le permet : simulé, seul le prestataire de l'application le permet.
          { id: 'ccContacts', kind: 'multiselect', options: CONTACTS, visible: ctx => ctx.values.signatureProvider === 'application' },
          { id: 'internalValidation', kind: 'switch' },
          { id: 'validators', kind: 'multiselect', options: CONTACTS, visible: ctx => yes(ctx, 'internalValidation') },
          { id: 'redemptionSignatureOnCreation', kind: 'switch', legacy: true },
        ],
      },
    ],
  },
  {
    id: 'management',
    sections: [
      {
        id: 'banking',
        icon: Landmark,
        fields: [
          { id: 'iban', kind: 'text', required: true, blocking: true },
          { id: 'bic', kind: 'text', required: true },
          { id: 'sepaCreditorId', kind: 'text', hint: true },
          {
            id: 'directDebit',
            kind: 'switch',
            legacy: true,
            // Exige un identifiant créancier SEPA (PRD section 15.2).
            lockedKey: ctx => (!ctx.values.sepaCreditorId ? 'sepaRequired' : undefined),
          },
          { id: 'entryFeeBillingAddress', kind: 'textarea' },
          { id: 'feesBillingAddress', kind: 'textarea' },
          { id: 'vatEntryFee', kind: 'text' },
          { id: 'vatFees', kind: 'text' },
          { id: 'invoiceFooter', kind: 'textarea' },
          { id: 'feeInvoicePrefix', kind: 'text' },
          { id: 'billingEmailEntryFee', kind: 'emails' },
          { id: 'billingEmailFees', kind: 'emails' },
        ],
      },
      {
        id: 'notifications',
        icon: Bell,
        fields: [
          { id: 'ccEmails', kind: 'emails' },
          { id: 'validationEmailsOnboarding', kind: 'emails' },
          { id: 'validationEmailsRedemption', kind: 'emails' },
          { id: 'validationEmailsRisk', kind: 'emails' },
          { id: 'dataChangeEmails', kind: 'emails' },
          { id: 'onboardingNotifiedContact', kind: 'select', options: CONTACTS },
          { id: 'abandonedReminder', kind: 'select', options: keys('none', '12', '24', '48', '72') },
          { id: 'paymentReminder', kind: 'switch', hint: true },
        ],
      },
      {
        id: 'performance',
        icon: LineChart,
        fields: [
          { id: 'performanceIndicator', kind: 'select', options: keys('irr', 'performance', 'none'), required: true, legacy: true, fromMaster: true },
          { id: 'performanceDisplayMode', kind: 'select', options: keys('default', 'annualized', 'cumulative', 'yearly'), fromMaster: true },
          { id: 'includeDistributions', kind: 'switch', legacy: true, fromMaster: true },
          { id: 'hideCurrentYear', kind: 'switch', legacy: true, fromMaster: true },
          { id: 'alignFirstCall', kind: 'switch', legacy: true, fromMaster: true },
          { id: 'valuationMethod', kind: 'select', options: keys('lastNav', 'adjusted'), legacy: true, fromMaster: true },
          { id: 'navProrata', kind: 'switch', legacy: true, visible: isCalls, fromMaster: true },
        ],
      },
      {
        id: 'operations',
        icon: Receipt,
        visible: ctx => ctx.detail.modules.operations,
        fields: [
          { id: 'allocationBase', kind: 'select', options: keys('subscribed', 'shares'), required: true, legacy: true, fromMaster: true },
          { id: 'distributionSubscriptions', kind: 'select', options: keys('allActive', 'paidOnly'), legacy: true, fromMaster: true },
          { id: 'callsPerShare', kind: 'switch', legacy: true, fromMaster: true },
          { id: 'netCashflow', kind: 'switch', legacy: true, fromMaster: true },
          { id: 'capitalInterest', kind: 'switch', legacy: true, fromMaster: true },
          { id: 'refundInDistributions', kind: 'switch', legacy: true, fromMaster: true },
          { id: 'capitalAccountsStatic', kind: 'switch', legacy: true, fromMaster: true },
          { id: 'rebuyInDistributions', kind: 'switch', legacy: true, fromMaster: true },
          { id: 'callAmountsInMillions', kind: 'switch', legacy: true, fromMaster: true },
          { id: 'combinedNotices', kind: 'select', options: keys('disabled', 'complement', 'only'), legacy: true, fromMaster: true },
          { id: 'combinedDeposit', kind: 'select', options: keys('both', 'combinedOnly'), legacy: true, visible: combinedOn, fromMaster: true },
          {
            id: 'combinedGrouping',
            kind: 'select',
            options: keys('investor', 'investorStructure', 'investorShare', 'investorStructureShare'),
            legacy: true,
            visible: combinedOn,
            fromMaster: true,
          },
          ...[
            'fileNameCall',
            'fileNameCombinedCall',
            'fileNameDistribution',
            'fileNameCombinedDistribution',
            'fileNameCapitalAccount',
            'fileNameCombinedCapitalAccount',
            'fileNameRelease',
          ].map(id => ({ id, kind: 'text' as const, legacy: true, hint: true, fromMaster: true })),
          { id: 'flowForecastGrace', kind: 'number', legacy: true, fromMaster: true },
          { id: 'flowForecastRounding', kind: 'select', options: keys('none', 'unit', 'thousand'), legacy: true, fromMaster: true },
        ],
      },
    ],
  },
  {
    id: 'integrations',
    sections: [
      {
        id: 'integrations',
        icon: Plug,
        fields: [
          { id: 'lemonwayWallet', kind: 'text', visible: ctx => ctx.detail.modules.lemonway },
          { id: 'apiKey', kind: 'secret', hint: true, visible: ctx => ctx.detail.modules.apiKey },
          { id: 'salesforceSync', kind: 'switch', visible: ctx => ctx.detail.modules.salesforce },
          { id: 'salesforceLastSync', kind: 'readonly', visible: ctx => ctx.detail.modules.salesforce },
        ],
      },
      {
        id: 'customFields',
        icon: ListPlus,
        // Champs de l'objet Fonds, champs masqués au back-office exclus (PRD section 8.2).
        fields: mockCustomFields
          .filter(field => field.objet === 'Fonds' && !field.cacheBO)
          .sort((a, b) => a.rank - b.rank)
          .map(field => ({
            id: `custom-${field.id}`,
            label: field.nomChamp,
            required: field.obligatoireBO,
            kind:
              field.type === 'checkbox'
                ? ('switch' as const)
                : field.type === 'number'
                  ? ('number' as const)
                  : field.type === 'date'
                    ? ('date' as const)
                    : field.type === 'textarea'
                      ? ('textarea' as const)
                      : ('text' as const),
          })),
      },
      {
        id: 'exports',
        icon: FileDown,
        fields: [
          {
            id: 'exportData',
            kind: 'multiselect',
            options: keys('subscriptions', 'investors', 'shares', 'navs', 'operations', 'capitalAccounts'),
          },
        ],
      },
    ],
  },
];

export const SUB_TAB_ICONS: Record<SubTabDef['id'], LucideIcon> = {
  profile: IdCard,
  subscription: BadgeEuro,
  management: Database,
  integrations: Plug,
};

export function findSection(sectionId: string) {
  for (const subTab of SETTINGS_SCHEMA) {
    const section = subTab.sections.find(item => item.id === sectionId);
    if (section) return { subTab, section };
  }
  return null;
}

export function visibleFields(section: SectionDef, ctx: SettingsContext) {
  return section.fields.filter(field => !field.visible || field.visible(ctx));
}

export function isSectionVisible(section: SectionDef, ctx: SettingsContext) {
  if (section.visible && !section.visible(ctx)) return false;
  return visibleFields(section, ctx).length > 0;
}

export function isFilled(value: unknown) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.values(value as Record<string, unknown>).some(isFilled);
  return true;
}

export function isRequired(field: FieldDef, ctx: SettingsContext) {
  // L'IBAN et le BIC ne sont obligatoires que pour un fonds à appels (PRD section 7).
  if (field.id === 'iban' || field.id === 'bic') return isCalls(ctx);
  return Boolean(field.required);
}

/** Compteur d'une section : champs obligatoires renseignés et présence d'un manque bloquant. */
export function sectionCompletion(section: SectionDef, ctx: SettingsContext) {
  const required = visibleFields(section, ctx).filter(field => isRequired(field, ctx));
  const filled = required.filter(field => isFilled(ctx.values[field.id]));
  const blockingMissing = required.some(
    field => field.blocking && !isFilled(ctx.values[field.id]),
  );
  return { total: required.length, filled: filled.length, blockingMissing };
}

