import {
  BadgeEuro,
  Coins,
  CreditCard,
  IdCard,
  Mail,
  Percent,
  Ruler,
  ShieldCheck,
  Undo2,
  Wallet,
} from 'lucide-react';
import { mockCustomFields } from '../../../utils/customFieldsMock';
import type { FieldDef, FieldOption, SectionDef, SettingsContext } from '../settings/settingsSchema';

/**
 * Schéma de la fiche part (PRD Détail d'un fonds V3, sections 10.2 et 15.3).
 * Obligatoire, bloquant, condition d'affichage et ancien setting sont des réponses du serveur,
 * déclarées ici pour la maquette.
 */

export const SHARE_PREFIX = 'funds.detail.shareSheet';

const keys = (...values: string[]): FieldOption[] => values.map(value => ({ value }));
const data = (...labels: string[]): FieldOption[] => labels.map(label => ({ value: label, label }));

/** Utilisateur connecté de la maquette : sert à l'avertissement de restriction. */
export const CURRENT_OPERATOR = 'Jean';
export const OPERATORS = data('Jean', 'Camille', 'Léa', 'Hugo', 'Inès');

const isMode = (mode: 'perShare' | 'perAmount') => (ctx: SettingsContext) => ctx.values.mode === mode;
const yes = (id: string) => (ctx: SettingsContext) => ctx.values[id] === true;

const template = (id: string, ...names: string[]): FieldDef => ({
  id,
  kind: 'select',
  options: data(...names),
  hint: true,
});

export const SHARE_SECTIONS: SectionDef[] = [
  {
    id: 'identification',
    icon: IdCard,
    fields: [
      { id: 'name', kind: 'text', required: true, blocking: true },
      { id: 'isin', kind: 'text' },
      { id: 'externalId', kind: 'text' },
      { id: 'description', kind: 'richtext' },
      ...mockCustomFields
        .filter(field => field.objet === 'Part' && !field.cacheBO)
        .sort((a, b) => a.rank - b.rank)
        .map(field => ({
          id: `custom-${field.id}`,
          label: field.nomChamp,
          required: field.obligatoireBO,
          kind: field.type === 'number' ? ('number' as const) : ('text' as const),
        })),
    ],
  },
  {
    id: 'pricing',
    icon: BadgeEuro,
    fields: [
      { id: 'mode', kind: 'select', options: keys('perShare', 'perAmount'), required: true },
      { id: 'nominalPrice', kind: 'amount', required: true, blocking: true },
      { id: 'referencePrice', kind: 'select', options: keys('nominal', 'lastNav'), legacy: true },
      { id: 'showPrice', kind: 'switch', legacy: true },
    ],
  },
  {
    id: 'bounds',
    icon: Ruler,
    fields: [
      // La modalité est rappelée ici : la basculer change les bornes affichées.
      { id: 'mode', kind: 'select', options: keys('perShare', 'perAmount'), required: true },
      { id: 'minShares', kind: 'number', visible: isMode('perShare') },
      { id: 'maxShares', kind: 'number', visible: isMode('perShare') },
      { id: 'minAmount', kind: 'amount', visible: isMode('perAmount') },
      { id: 'maxAmount', kind: 'amount', visible: isMode('perAmount') },
    ],
  },
  {
    id: 'fees',
    icon: Percent,
    fields: [
      { id: 'managementFee', kind: 'percent', required: true },
      { id: 'entryFee', kind: 'percent' },
      { id: 'minEntryFee', kind: 'amount' },
      { id: 'freeThreshold', kind: 'amount', hint: true },
      { id: 'exemptSegments', kind: 'multiselect', options: keys('retail', 'premium', 'professional', 'employees') },
    ],
  },
  {
    id: 'commissions',
    icon: Coins,
    visible: ctx => ctx.detail.modules.partners,
    fields: [
      { id: 'defaultCommission', kind: 'percent' },
      {
        id: 'shareCommissionPeriodicity',
        kind: 'select',
        options: keys('fund', 'monthly', 'quarterly', 'semiannual', 'annual'),
        hint: true,
        // Valeur du fonds rappelée ; "Surcharge" quand la part s'en écarte.
        hintVars: (ctx, t) => ({
          value: t(`common.frequencyDayField.frequencies.${String(ctx.fundValues?.commissionPeriodicity ?? 'quarterly')}`),
        }),
        badgeKey: ctx => {
          const value = ctx.values.shareCommissionPeriodicity;
          return value && value !== 'fund' && value !== ctx.fundValues?.commissionPeriodicity ? 'override' : undefined;
        },
      },
    ],
  },
  {
    id: 'access',
    icon: ShieldCheck,
    fields: [
      { id: 'investorTypes', kind: 'multiselect', options: keys('individuals', 'entities'), required: true, blocking: true },
      { id: 'segments', kind: 'multiselect', options: keys('retail', 'premium', 'professional') },
      { id: 'onlineSubscription', kind: 'switch' },
      { id: 'directSubscription', kind: 'switch' },
      { id: 'distributorSubscription', kind: 'switch', visible: ctx => ctx.detail.modules.partners },
      { id: 'onlineAgreementRequest', kind: 'switch', visible: yes('distributorSubscription') },
      { id: 'openToNetwork', kind: 'switch', legacy: true, visible: yes('distributorSubscription') },
      // Visible avec le droit "Restreindre une part" seulement (PRD section 10.3).
      { id: 'operators', kind: 'multiselect', options: OPERATORS, hint: true, visible: ctx => ctx.detail.rights.restrictShare },
    ],
  },
  {
    id: 'redemptions',
    icon: Undo2,
    fields: [
      { id: 'freeOnlineRedemption', kind: 'switch' },
      { id: 'forceMajeureRedemption', kind: 'switch' },
      { id: 'redemptionUnit', kind: 'select', options: keys('shares', 'amount', 'choice'), legacy: true },
      { id: 'periodicRedemption', kind: 'switch', legacy: true },
    ],
  },
  {
    id: 'financial',
    icon: Wallet,
    fields: [
      { id: 'carried', kind: 'switch' },
      { id: 'equityShare', kind: 'percent' },
      {
        id: 'shareNavProrata',
        kind: 'select',
        options: keys('fund', 'yes', 'no'),
        legacy: true,
        visible: ctx => ctx.detail.paymentMode === 'calls',
      },
    ],
  },
  {
    id: 'payment',
    icon: CreditCard,
    fields: [
      { id: 'noPaymentReminder', kind: 'switch' },
      { id: 'lemonwayDebit', kind: 'switch', visible: ctx => ctx.detail.modules.lemonway },
    ],
  },
  {
    id: 'emails',
    icon: Mail,
    fields: [
      template('templateInvitation', 'Invitation standard', 'Invitation investisseurs professionnels'),
      template('templateConfirmation', 'Confirmation standard', 'Confirmation avec attestation'),
      template('templateAdminConfirmation', 'Confirmation administrée standard'),
      template('templateReopening', 'Réouverture standard'),
      template('templateSignature', 'Signature standard', 'Signature avec pièces jointes'),
      { id: 'validationCcEmail', kind: 'emails' },
    ],
  },
];
