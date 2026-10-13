import type { FundDetail, MissingConfigItem } from '../../../utils/fundDetailMock';
import type { SettingsValues } from './settingsSchema';

const iso = (date: Date | null) => (date ? date.toISOString().slice(0, 10) : '');
const fromIso = (value: unknown) => (typeof value === 'string' && value ? new Date(`${value}T12:00:00`) : null);

const richText = (fr: string, en: string) => ({ fr, en });

/** Valeurs de démonstration des paramètres, telles que le serveur les renverrait. */
export function buildSettingsValues(detail: FundDetail): SettingsValues {
  const calls = detail.paymentMode === 'calls';
  return {
    name: detail.name,
    adminName: detail.adminName,
    subscriptionPrefix: detail.initials,
    managementCompany: detail.managementCompany,
    fundType: detail.fundType,
    parentFund: detail.parent?.name ?? '',
    externalId: detail.settings.externalId,
    color: detail.color,
    logo: '',
    displayOrder: 1,
    legalForm: detail.legalForm,
    depositary: detail.depositary,
    currency: detail.currency,
    countries: ['FR', 'LU'],
    targetSize: detail.targetSize,
    displayedTargetSize: detail.targetSize ? `${Math.round(detail.targetSize / 1_000_000)} M€` : '',
    lifetime: '8 ans',
    strategy: 'Capital-développement',
    marketing: 'France et Luxembourg',
    pitch: richText(
      '<p>Un fonds qui accompagne des <strong>entreprises de croissance</strong> européennes.</p>',
      '<p>A fund backing European <strong>growth companies</strong>.</p>',
    ),
    advantages: richText('<ul><li>Équipe dédiée</li><li>Reporting trimestriel</li></ul>', ''),
    introduction: richText('', ''),
    description: richText('<p>Stratégie, équipe et calendrier de déploiement.</p>', ''),
    subscriptionImage: '',
    video: '',
    bannerContent: '',
    onboardingIndividuals: detail.settings.onboarding ?? '',
    onboardingEntities: detail.settings.onboarding ? 'Onboarding personnes morales 2026' : '',
    redemptionOnboarding: '',
    paymentMode: detail.paymentMode,
    shareDecimals: 3,
    aggregation: false,
    onlineInvestors: detail.channels.includes('online'),
    onlineDistributors: detail.channels.includes('distributors'),
    investorSegments: detail.segments,
    distributorSegments: ['independentAdvisors'],
    confirmationEmail: true,
    minimumExemption: 'none',
    collectionStart: iso(detail.collectionStart),
    collectionEnd: iso(detail.collectionEnd),
    hideCollectionEnd: false,
    closingDate: iso(detail.closingDate),
    commissionEnd: '',
    evergreen: detail.evergreen,
    liquidityWindow: detail.liquidityWindow,
    liquidityPercent: detail.evergreen ? 10 : null,
    centralization: detail.evergreen ? { frequency: 'quarterly', day: 'last' } : null,
    navFrequency: detail.navFrequency,
    redemptionDateRecalc: false,
    preValidation: true,
    preValidationEmails: 'conformite@fonds-demo.fr',
    distributorSignature: true,
    autoOpenNetwork: false,
    exclusiveDistributor: '',
    distributionAgreementRequired: true,
    commissionPeriodicity: 'quarterly',
    billCommissions: true,
    notBilledMessage: '',
    signatureProvider: 'application',
    mainSignatory: detail.settings.signatories[0] ?? '',
    secondarySignatory: '',
    redemptionSignatory: '',
    signatoryChoice: false,
    groupedSignature: true,
    advancedSignature: false,
    manualSignature: true,
    preSignature: false,
    ccContacts: [],
    internalValidation: true,
    validators: ['Léa'],
    redemptionSignatureOnCreation: false,
    iban: detail.settings.iban ?? '',
    bic: calls ? '' : 'BLUMFRPP',
    sepaCreditorId: '',
    directDebit: false,
    entryFeeBillingAddress: '',
    feesBillingAddress: '',
    vatEntryFee: '',
    vatFees: '',
    invoiceFooter: '',
    feeInvoicePrefix: 'FR-',
    billingEmailEntryFee: '',
    billingEmailFees: '',
    ccEmails: '',
    validationEmailsOnboarding: 'conformite@fonds-demo.fr',
    validationEmailsRedemption: '',
    validationEmailsRisk: '',
    dataChangeEmails: '',
    onboardingNotifiedContact: 'Camille',
    abandonedReminder: '48',
    paymentReminder: true,
    performanceIndicator: detail.settings.performanceIndicator,
    performanceDisplayMode: 'default',
    includeDistributions: false,
    hideCurrentYear: false,
    alignFirstCall: false,
    valuationMethod: 'lastNav',
    navProrata: false,
    allocationBase: 'subscribed',
    distributionSubscriptions: 'allActive',
    callsPerShare: false,
    netCashflow: false,
    capitalInterest: false,
    refundInDistributions: false,
    capitalAccountsStatic: false,
    rebuyInDistributions: false,
    callAmountsInMillions: false,
    combinedNotices: 'disabled',
    combinedDeposit: 'both',
    combinedGrouping: 'investor',
    fileNameCall: '',
    fileNameCombinedCall: '',
    fileNameDistribution: '',
    fileNameCombinedDistribution: '',
    fileNameCapitalAccount: '',
    fileNameCombinedCapitalAccount: '',
    fileNameRelease: '',
    flowForecastGrace: 30,
    flowForecastRounding: 'unit',
    lemonwayWallet: '',
    apiKey: 'ih_live_••••••••••••7f2a',
    salesforceSync: true,
    salesforceLastSync: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    'custom-20': `INT-${String(detail.id).padStart(4, '0')}`,
    'custom-21': 2026,
    'custom-22': false,
    'custom-23': '',
    exportData: ['subscriptions', 'investors'],
  };
}

/**
 * Manques de configuration après un enregistrement des paramètres.
 * Règle serveur simulée (PRD section 7, widget "Configuration à compléter") :
 * aucun onboarding, aucun signataire principal, IBAN absent pour un fonds à appels.
 * Les manques portés par les parts et les contrats restent ceux du serveur.
 */
export function computeMissingConfig(detail: FundDetail, values: SettingsValues): MissingConfigItem[] {
  const kept = detail.missingConfig.filter(item => item.key === 'sharePrice' || item.key === 'subscriptionContract');
  const missing: MissingConfigItem[] = [...kept];
  if (!values.onboardingIndividuals && !values.onboardingEntities) {
    missing.push({ key: 'onboarding', target: { tab: 'settings', sectionId: 'subscription', fieldId: 'onboardingIndividuals' } });
  }
  if (!values.mainSignatory) {
    missing.push({ key: 'signatory', target: { tab: 'settings', sectionId: 'signature', fieldId: 'mainSignatory' } });
  }
  if (values.paymentMode === 'calls' && !values.iban) {
    missing.push({ key: 'iban', target: { tab: 'settings', sectionId: 'banking', fieldId: 'iban' } });
  }
  return missing;
}

/** Report des paramètres enregistrés sur les attributs affichés ailleurs dans la page. */
export function applySettingsToDetail(detail: FundDetail, values: SettingsValues): FundDetail {
  const paymentMode = values.paymentMode === 'direct' ? 'direct' : 'calls';
  return {
    ...detail,
    name: String(values.name ?? detail.name),
    adminName: String(values.adminName ?? ''),
    color: typeof values.color === 'string' && values.color ? values.color : detail.color,
    legalForm: String(values.legalForm ?? detail.legalForm),
    currency: String(values.currency ?? detail.currency),
    fundType: (values.fundType as FundDetail['fundType']) ?? detail.fundType,
    parent:
      values.fundType === 'compartment' && values.parentFund
        ? { id: detail.parent?.id ?? 9001, name: String(values.parentFund) }
        : null,
    paymentMode,
    configChecksTotal: paymentMode === 'calls' ? 5 : 4,
    evergreen: values.evergreen === true,
    collectionStart: fromIso(values.collectionStart),
    collectionEnd: fromIso(values.collectionEnd),
    closingDate: fromIso(values.closingDate),
    targetSize: typeof values.targetSize === 'number' ? values.targetSize : detail.targetSize,
    missingConfig: computeMissingConfig(detail, values),
  };
}
