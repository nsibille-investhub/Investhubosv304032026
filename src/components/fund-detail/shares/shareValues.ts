import type { FundDetail, FundShare } from '../../../utils/fundDetailMock';
import type { SettingsValues } from '../settings/settingsSchema';
import { SHARE_PREFIX } from './shareSchema';

type Translate = (key: string, vars?: Record<string, string | number>) => string;

/** Valeurs de démonstration de la fiche part, telles que le serveur les renverrait. */
export function buildShareValues(share: FundShare): SettingsValues {
  const restrictedOperators = share.restricted ? ['Camille', 'Léa'] : [];
  return {
    name: share.name,
    isin: share.isin,
    externalId: share.isin ? `SF-PART-${share.name}` : '',
    description: { fr: '', en: '' },
    'custom-30': share.isin ? `706-${share.name}` : '',
    'custom-31': 5,
    mode: share.mode,
    nominalPrice: share.nominalPrice,
    referencePrice: share.referencePrice,
    showPrice: true,
    minShares: share.mode === 'perShare' ? 10 : null,
    maxShares: null,
    minAmount: share.mode === 'perAmount' ? 5000 : null,
    maxAmount: share.mode === 'perAmount' ? 500000 : null,
    managementFee: share.managementFee,
    entryFee: share.entryFee,
    minEntryFee: null,
    freeThreshold: null,
    exemptSegments: [],
    defaultCommission: 1,
    shareCommissionPeriodicity: share.name === 'B' ? 'annual' : 'fund',
    investorTypes: share.name === 'C' ? ['entities'] : ['individuals'],
    segments: share.name === 'A' ? ['retail', 'premium'] : share.name === 'C' ? ['professional'] : [],
    onlineSubscription: share.name !== 'C',
    directSubscription: true,
    distributorSubscription: share.name !== 'C',
    onlineAgreementRequest: true,
    openToNetwork: false,
    operators: restrictedOperators,
    freeOnlineRedemption: false,
    forceMajeureRedemption: true,
    redemptionUnit: 'shares',
    periodicRedemption: false,
    carried: share.carried,
    equityShare: share.carried ? 20 : null,
    shareNavProrata: 'fund',
    noPaymentReminder: false,
    lemonwayDebit: share.lemonwayDebit,
    templateInvitation: '',
    templateConfirmation: '',
    templateAdminConfirmation: '',
    templateReopening: '',
    templateSignature: '',
    validationCcEmail: '',
  };
}

/** Report des valeurs enregistrées sur la ligne du tableau des parts. */
export function applyShareValues(share: FundShare, values: SettingsValues): FundShare {
  const number = (value: unknown, fallback: number) => (typeof value === 'number' ? value : fallback);
  return {
    ...share,
    name: String(values.name ?? share.name),
    isin: String(values.isin ?? ''),
    mode: values.mode === 'perAmount' ? 'perAmount' : 'perShare',
    nominalPrice: typeof values.nominalPrice === 'number' ? values.nominalPrice : null,
    referencePrice: values.referencePrice === 'lastNav' ? 'lastNav' : 'nominal',
    managementFee: number(values.managementFee, 0),
    entryFee: number(values.entryFee, 0),
    restricted: Array.isArray(values.operators) && values.operators.length > 0,
    carried: values.carried === true,
    lemonwayDebit: values.lemonwayDebit === true,
  };
}

/** Duplication (PRD section 10.4) : nom suffixé, sans code ISIN ni valeur liquidative. */
export function duplicateShare(share: FundShare, values: SettingsValues, id: string, suffix: string) {
  const copy: FundShare = {
    ...share,
    id,
    name: `${share.name} ${suffix}`,
    isin: '',
    lastNav: null,
    subscribed: 0,
    called: 0,
    closed: false,
    counts: { subscriptions: 0, navs: 0, operations: 0 },
  };
  return { share: copy, values: { ...values, name: copy.name, isin: '', externalId: '' } };
}

export function newShare(id: string, name: string): { share: FundShare; values: SettingsValues } {
  const share: FundShare = {
    id,
    name,
    isin: '',
    mode: 'perShare',
    nominalPrice: null,
    referencePrice: 'nominal',
    managementFee: 0,
    entryFee: 0,
    subscribed: 0,
    called: 0,
    lastNav: null,
    restricted: false,
    carried: false,
    lemonwayDebit: false,
    closed: false,
    allowsRedemption: false,
    counts: { subscriptions: 0, navs: 0, operations: 0 },
  };
  return { share, values: { ...buildShareValues(share), externalId: '', 'custom-30': '' } };
}

export interface WhoCanSubscribe {
  sentence: string;
  rows: { id: 'investorTypes' | 'segments' | 'channels' | 'distributors' | 'operators'; value: string; fieldId: string }[];
}

/**
 * Synthèse "Qui peut souscrire cette part".
 * Règle serveur simulée pour la maquette (PRD section 10.3) : types d'investisseurs, segments,
 * canaux ouverts, convention de distribution du fonds et opérateurs autorisés.
 */
export function whoCanSubscribe(
  share: FundShare,
  values: SettingsValues,
  detail: FundDetail,
  fundValues: SettingsValues,
  t: Translate,
  lang: string,
): WhoCanSubscribe {
  const W = `${SHARE_PREFIX}.who`;
  const list = (items: string[]) => new Intl.ListFormat(lang, { type: 'conjunction' }).format(items);
  const array = (value: unknown) => (Array.isArray(value) ? (value as string[]) : []);

  const types = array(values.investorTypes);
  const segments = array(values.segments);
  const operators = array(values.operators);
  const agreementRequired = fundValues.distributionAgreementRequired !== false;
  const distributorsOpen = detail.modules.partners && values.distributorSubscription === true;

  const channels: string[] = [];
  if (values.onlineSubscription === true) channels.push(t(`${W}.channels.online`));
  if (values.directSubscription === true) channels.push(t(`${W}.channels.direct`));
  if (distributorsOpen) channels.push(t(agreementRequired ? `${W}.channels.distributorsAgreement` : `${W}.channels.distributors`));

  const typesText =
    types.length === 0 ? t(`${W}.types.none`) : t(`${W}.types.${types.length === 2 ? 'both' : types[0]}`);
  const segmentLabels = segments.map(segment => t(`${SHARE_PREFIX}.options.segments.${segment}`));
  const segmentsText =
    segments.length > 0 ? t(segments.length === 1 ? `${W}.segmentsOne` : `${W}.segments`, { list: list(segmentLabels) }) : '';
  const channelsText = channels.length > 0 ? list(channels) : t(`${W}.noChannel`);
  const count = (value: number) => (value <= 10 ? t(`${W}.numbers.${value}`) : String(value));
  const operatorsText =
    operators.length === 0
      ? t(`${W}.operatorsAll`)
      : t(operators.length === 1 ? `${W}.operatorsOne` : `${W}.operatorsMany`, { count: count(operators.length) });

  const sentence = share.closed
    ? t(`${W}.closed`)
    : t(`${W}.sentence`, { types: typesText, segments: segmentsText, channels: channelsText, operators: operatorsText });

  return {
    sentence,
    rows: [
      { id: 'investorTypes', fieldId: 'investorTypes', value: types.length ? list(types.map(type => t(`${SHARE_PREFIX}.options.investorTypes.${type}`))) : t(`${W}.none`) },
      { id: 'segments', fieldId: 'segments', value: segments.length ? list(segmentLabels) : t(`${W}.allSegments`) },
      { id: 'channels', fieldId: 'onlineSubscription', value: channels.length ? list(channels) : t(`${W}.noChannel`) },
      {
        id: 'distributors',
        fieldId: 'distributorSubscription',
        value: distributorsOpen
          ? t(agreementRequired ? `${W}.distributorsAgreement` : `${W}.distributorsCount`, { count: detail.distributorsCount })
          : t(`${W}.distributorsClosed`),
      },
      { id: 'operators', fieldId: 'operators', value: operators.length ? list(operators) : t(`${W}.allOperators`) },
    ],
  };
}
