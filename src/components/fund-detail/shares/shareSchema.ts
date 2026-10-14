import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeftRight,
  BadgeEuro,
  CreditCard,
  Handshake,
  IdCard,
  Mail,
  Percent,
  Ruler,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  SHARE_EMAIL_TEMPLATES,
  type FundDetail,
  type FundShare,
  type ShareEmailTemplate,
} from '../../../utils/fundDetailMock';
import { mockCustomFields } from '../../../utils/customFieldsMock';

export type ShareSectionId =
  | 'identification'
  | 'pricing'
  | 'limits'
  | 'fees'
  | 'commissions'
  | 'access'
  | 'redemptions'
  | 'financial'
  | 'payment'
  | 'emails';

export type ShareValues = Record<string, unknown>;

export type ShareFieldKind =
  | 'text'
  | 'richtext'
  | 'amount'
  | 'percent'
  | 'number'
  | 'switch'
  | 'emails'
  | 'multiselect'
  | 'choice'
  | 'template'
  | 'allOrSome'
  | 'periodicity'
  | 'limits';

export interface ShareFieldDef {
  id: string;
  kind: ShareFieldKind;
  /** Libellé de donnée (champ personnalisé). Sinon : clé fields.<id>. */
  label?: string;
  options?: string[];
  /** Options de donnée affichées telles quelles (segments, opérateurs). */
  dataOptions?: boolean;
  required?: boolean;
  visible?: (ctx: ShareContext) => boolean;
}

export interface ShareSectionDef {
  id: ShareSectionId;
  icon: LucideIcon;
  fields: ShareFieldDef[];
  visible?: (ctx: ShareContext) => boolean;
}

export interface ShareContext {
  detail: FundDetail;
  values: ShareValues;
}

const on = (ctx: ShareContext, id: string) => ctx.values[id] === true;

export const SHARE_CUSTOM_FIELDS = mockCustomFields
  .filter(field => field.objet === 'Part' && !field.cacheBO)
  .sort((a, b) => a.rank - b.rank);

export const emailFieldId = (template: ShareEmailTemplate) => `email-${template}`;

export const SHARE_SECTIONS: ShareSectionDef[] = [
  {
    id: 'identification',
    icon: IdCard,
    fields: [
      { id: 'name', kind: 'text', required: true },
      { id: 'isin', kind: 'text' },
      { id: 'externalId', kind: 'text' },
      { id: 'description', kind: 'richtext' },
      ...SHARE_CUSTOM_FIELDS.map(field => ({
        id: `custom-${field.id}`,
        label: field.nomChamp,
        kind: field.type === 'checkbox' ? ('switch' as const) : ('text' as const),
        required: field.obligatoireBO,
      })),
    ],
  },
  {
    id: 'pricing',
    icon: BadgeEuro,
    fields: [
      { id: 'mode', kind: 'choice', options: ['perShare', 'perAmount'] },
      { id: 'nominalPrice', kind: 'amount', required: true },
      { id: 'referencePrice', kind: 'choice', options: ['nominal', 'lastNav'] },
      { id: 'showPriceOnPortals', kind: 'switch' },
    ],
  },
  {
    id: 'limits',
    icon: Ruler,
    fields: [{ id: 'limits', kind: 'limits' }],
  },
  {
    id: 'fees',
    icon: Percent,
    fields: [
      { id: 'managementFee', kind: 'percent' },
      { id: 'entryFee', kind: 'percent' },
      { id: 'minEntryFee', kind: 'amount' },
      { id: 'feeFreeThreshold', kind: 'amount' },
      { id: 'feeExemptSegments', kind: 'multiselect', dataOptions: true },
    ],
  },
  {
    id: 'commissions',
    icon: Handshake,
    visible: ctx => ctx.detail.modules.partners,
    fields: [
      { id: 'defaultCommission', kind: 'percent' },
      { id: 'commissionPeriodicity', kind: 'periodicity' },
    ],
  },
  {
    id: 'access',
    icon: ShieldCheck,
    fields: [
      { id: 'investorTypes', kind: 'multiselect', options: ['individual', 'entity'] },
      { id: 'segments', kind: 'allOrSome', dataOptions: true },
      { id: 'onlineSubscription', kind: 'switch' },
      { id: 'directSubscription', kind: 'switch' },
      { id: 'distributorSubscription', kind: 'switch', visible: ctx => ctx.detail.modules.partners },
      {
        id: 'onlineAgreementRequest',
        kind: 'switch',
        visible: ctx => ctx.detail.modules.partners && on(ctx, 'distributorSubscription'),
      },
      {
        id: 'openToAllNetwork',
        kind: 'switch',
        visible: ctx => ctx.detail.modules.partners && on(ctx, 'distributorSubscription'),
      },
      // Visible avec le droit "Restreindre une part" seulement.
      { id: 'operators', kind: 'allOrSome', dataOptions: true, visible: ctx => ctx.detail.rights.restrictShare },
    ],
  },
  {
    id: 'redemptions',
    icon: ArrowLeftRight,
    fields: [
      { id: 'freeRedemptionOnline', kind: 'switch' },
      { id: 'forceMajeureRedemption', kind: 'switch' },
      { id: 'redemptionUnit', kind: 'choice', options: ['shares', 'amount', 'choice'] },
      { id: 'periodicRedemption', kind: 'switch' },
    ],
  },
  {
    id: 'financial',
    icon: TrendingUp,
    fields: [
      { id: 'carried', kind: 'switch' },
      { id: 'equityPercent', kind: 'percent' },
      { id: 'navProrata', kind: 'choice', options: ['fund', 'yes', 'no'] },
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
      ...SHARE_EMAIL_TEMPLATES.map(template => ({ id: emailFieldId(template), kind: 'template' as const })),
      { id: 'validationCcEmail', kind: 'emails' },
    ],
  },
];

export const visibleSections = (ctx: ShareContext) =>
  SHARE_SECTIONS.filter(section => !section.visible || section.visible(ctx));

export const visibleShareFields = (section: ShareSectionDef, ctx: ShareContext) =>
  section.fields.filter(field => !field.visible || field.visible(ctx));

/** Champs qu'une section enregistre : les bornes portent la modalité et les quatre bornes. */
export const sectionValueIds = (section: ShareSectionDef): string[] =>
  section.id === 'limits'
    ? ['mode', 'minShares', 'maxShares', 'minAmount', 'maxAmount']
    : section.fields.map(field => field.id);

export function shareToValues(share: FundShare, currency: string): ShareValues {
  const { emailTemplates, customFields, ...rest } = share;
  return {
    ...rest,
    ...customFields,
    ...Object.fromEntries(SHARE_EMAIL_TEMPLATES.map(template => [emailFieldId(template), emailTemplates[template]])),
    currency,
  };
}

export function valuesToShare(share: FundShare, values: ShareValues): FundShare {
  const customFields = { ...share.customFields };
  const emailTemplates = { ...share.emailTemplates };
  const next: Record<string, unknown> = { ...share };
  Object.entries(values).forEach(([id, value]) => {
    if (id === 'currency') return;
    if (id.startsWith('custom-')) customFields[id] = value;
    else if (id.startsWith('email-')) emailTemplates[id.slice(6) as ShareEmailTemplate] = (value as string | null) ?? null;
    else next[id] = value;
  });
  const operators = (next.operators as string[]) ?? [];
  return { ...(next as unknown as FundShare), customFields, emailTemplates, restricted: operators.length > 0 };
}

type Translate = (key: string, vars?: Record<string, string | number>) => string;

const A = 'funds.detail.shares.page.audience';

function joinList(items: string[], t: Translate): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} ${t(`${A}.and`)} ${items[items.length - 1]}`;
}

export interface ShareAudience {
  sentence: string;
  investorTypes: string;
  segments: string;
  channels: string;
  distributors: string;
  operators: string;
}

/**
 * Phrase "Qui peut souscrire cette part", calculée par le serveur à partir des règles d'accès.
 * Reproduite ici pour la maquette.
 */
export function buildShareAudience(values: ShareValues, detail: FundDetail, t: Translate): ShareAudience {
  const types = (values.investorTypes as string[]) ?? [];
  const segments = (values.segments as string[]) ?? [];
  const operators = (values.operators as string[]) ?? [];
  const partners = detail.modules.partners;
  const distributorsOn = partners && values.distributorSubscription === true;
  const allNetwork = values.openToAllNetwork === true;

  const typesLabel =
    types.length === 2 ? t(`${A}.types.both`) : types.length === 1 ? t(`${A}.types.${types[0]}`) : '';
  const segmentsPhrase =
    segments.length === 0
      ? t(`${A}.segments.all`)
      : segments.length === 1
        ? t(`${A}.segments.one`, { name: segments[0] })
        : t(`${A}.segments.many`, { names: joinList(segments, t) });

  const distributorsPhrase = allNetwork ? t(`${A}.channels.distributorsAll`) : t(`${A}.channels.distributorsSigned`);
  const channels = [
    values.onlineSubscription === true ? t(`${A}.channels.online`) : null,
    values.directSubscription === true ? t(`${A}.channels.direct`) : null,
    distributorsOn ? distributorsPhrase : null,
  ].filter((item): item is string => item !== null);

  const count = operators.length;
  const countWord = count >= 1 && count <= 10 ? t(`${A}.numbers.${count}`) : String(count);
  const operatorsPhrase =
    count === 0
      ? t(`${A}.operators.all`)
      : count === 1
        ? t(`${A}.operators.one`)
        : t(`${A}.operators.many`, { count: countWord });

  let opening: string;
  if (values.closed === true) opening = t(`${A}.sentence.closed`);
  else if (!typesLabel) opening = t(`${A}.sentence.noType`);
  else if (channels.length === 0) opening = t(`${A}.sentence.noChannel`);
  else opening = t(`${A}.sentence.open`, { types: typesLabel, segments: segmentsPhrase, channels: joinList(channels, t) });

  return {
    sentence: `${opening} ${t(`${A}.sentence.visibility`, { operators: operatorsPhrase })}`,
    investorTypes: typesLabel ? capitalize(typesLabel) : t(`${A}.none`),
    segments: segments.length === 0 ? t(`${A}.segments.allShort`) : segments.join(', '),
    channels: channels.length === 0 ? t(`${A}.none`) : capitalize(joinList(channels.map(channel => (channel === distributorsPhrase ? t(`${A}.channels.distributorsShort`) : channel)), t)),
    distributors: !partners
      ? t(`${A}.distributors.noModule`)
      : !distributorsOn
        ? t(`${A}.distributors.none`)
        : allNetwork
          ? t(`${A}.distributors.all`)
          : t(`${A}.distributors.signed`),
    operators: count === 0 ? t(`${A}.operators.allShort`) : operators.join(', '),
  };
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
