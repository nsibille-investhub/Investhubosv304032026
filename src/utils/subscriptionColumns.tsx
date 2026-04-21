import { ReactNode } from 'react';

export type SubscriptionWorkflowStatus = 'created' | 'onboarding' | 'signature' | 'counter_signature' | 'active' | 'all';

export interface ColumnConfig {
  id: string;
  /** Translation key resolved at render time via t() */
  label: string;
  width?: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

const COL = (id: string, label: string, rest: Partial<ColumnConfig> = {}): ColumnConfig => ({ id, label, ...rest });

const CREATED_COLUMNS: ColumnConfig[] = [
  COL('name', 'subscriptions.columns.name', { width: '300px', sortable: true }),
  COL('investor', 'subscriptions.columns.investor', { width: '250px', sortable: true }),
  COL('amount', 'subscriptions.columns.amount', { width: '150px', sortable: true, align: 'right' }),
  COL('quantity', 'subscriptions.columns.quantity', { width: '120px', sortable: true, align: 'right' }),
  COL('fundShare', 'subscriptions.columns.fundShare', { sortable: true, width: 'auto' }),
  COL('language', 'subscriptions.columns.language', { width: '100px', sortable: true, align: 'center' }),
  COL('partner', 'subscriptions.columns.partner', { sortable: false, width: 'auto' }),
  COL('createdAt', 'subscriptions.columns.createdAt', { width: '140px', sortable: true }),
  COL('source', 'subscriptions.columns.source', { width: '140px', sortable: true }),
  COL('analyst', 'subscriptions.columns.analyst', { width: '140px', sortable: true }),
];

const ONBOARDING_COLUMNS: ColumnConfig[] = [
  COL('name', 'subscriptions.columns.name', { width: '300px', sortable: true }),
  COL('investor', 'subscriptions.columns.investor', { width: '250px', sortable: true }),
  COL('amount', 'subscriptions.columns.amount', { width: '150px', sortable: true, align: 'right' }),
  COL('quantity', 'subscriptions.columns.quantity', { width: '120px', sortable: true, align: 'right' }),
  COL('fundShare', 'subscriptions.columns.fundShare', { sortable: true, width: 'auto' }),
  COL('language', 'subscriptions.columns.language', { width: '100px', sortable: true, align: 'center' }),
  COL('onboardingStatus', 'subscriptions.columns.onboardingStatus', { width: '180px', sortable: true }),
  COL('blockageReason', 'subscriptions.columns.blockageReason', { width: '200px', sortable: false }),
  COL('completionRate', 'subscriptions.columns.completionRate', { width: '130px', sortable: true, align: 'center' }),
  COL('lastAction', 'subscriptions.columns.lastAction', { width: '140px', sortable: true }),
  COL('analyst', 'subscriptions.columns.analyst', { width: '140px', sortable: true }),
];

const SIGNATURE_COLUMNS: ColumnConfig[] = [
  COL('name', 'subscriptions.columns.name', { width: '300px', sortable: true }),
  COL('investor', 'subscriptions.columns.investor', { width: '250px', sortable: true }),
  COL('amount', 'subscriptions.columns.amount', { width: '150px', sortable: true, align: 'right' }),
  COL('quantity', 'subscriptions.columns.quantity', { width: '120px', sortable: true, align: 'right' }),
  COL('fundShare', 'subscriptions.columns.fundShare', { sortable: true, width: 'auto' }),
  COL('language', 'subscriptions.columns.language', { width: '100px', sortable: true, align: 'center' }),
  COL('statut', 'subscriptions.columns.statut', { width: '140px', sortable: true }),
  COL('signatures', 'subscriptions.columns.signatures', { width: '180px', sortable: false }),
  COL('sentAt', 'subscriptions.columns.sentAt', { width: '140px', sortable: true }),
  COL('lastReminder', 'subscriptions.columns.lastReminder', { width: '140px', sortable: true }),
  COL('signatureChannel', 'subscriptions.columns.signatureChannel', { width: '120px', sortable: true }),
];

const COUNTER_SIGNATURE_COLUMNS: ColumnConfig[] = [
  COL('investor', 'subscriptions.columns.investor', { width: '250px', sortable: true }),
  COL('amount', 'subscriptions.columns.amount', { width: '150px', sortable: true, align: 'right' }),
  COL('quantity', 'subscriptions.columns.quantity', { width: '120px', sortable: true, align: 'right' }),
  COL('fund', 'subscriptions.columns.fund', { sortable: true, width: 'auto' }),
  COL('compartment', 'subscriptions.columns.compartment', { sortable: false, width: 'auto' }),
  COL('language', 'subscriptions.columns.language', { width: '100px', sortable: true, align: 'center' }),
  COL('counterSignatureStatus', 'subscriptions.columns.counterSignatureStatus', { width: '180px', sortable: true }),
  COL('counterSignatureOwner', 'subscriptions.columns.counterSignatureOwner', { width: '160px', sortable: true }),
  COL('investorSignedAt', 'subscriptions.columns.investorSignedAt', { width: '160px', sortable: true }),
  COL('daysSinceSignature', 'subscriptions.columns.daysSinceSignature', { width: '130px', sortable: true, align: 'center' }),
];

const ACTIVE_COLUMNS: ColumnConfig[] = [
  COL('investor', 'subscriptions.columns.investor', { width: '250px', sortable: true }),
  COL('fund', 'subscriptions.columns.fund', { sortable: true, width: 'auto' }),
  COL('compartment', 'subscriptions.columns.compartment', { sortable: false, width: 'auto' }),
  COL('amount', 'subscriptions.columns.amount', { width: '150px', sortable: true, align: 'right' }),
  COL('quantity', 'subscriptions.columns.quantity', { width: '120px', sortable: true, align: 'right' }),
  COL('language', 'subscriptions.columns.language', { width: '100px', sortable: true, align: 'center' }),
  COL('calledAmount', 'subscriptions.columns.calledAmount', { width: '150px', sortable: true, align: 'right' }),
  COL('remainingAmount', 'subscriptions.columns.remainingAmount', { width: '150px', sortable: true, align: 'right' }),
  COL('distributedAmount', 'subscriptions.columns.distributedAmount', { width: '150px', sortable: true, align: 'right' }),
  COL('entryFees', 'subscriptions.columns.entryFees', { width: '140px', sortable: true, align: 'right' }),
  COL('entryFeesAmount', 'subscriptions.columns.entryFeesAmount', { width: '180px', sortable: true, align: 'right' }),
  COL('depositary', 'subscriptions.columns.depositary', { width: '120px', sortable: true, align: 'center' }),
  COL('activatedAt', 'subscriptions.columns.activatedAt', { width: '140px', sortable: true }),
];

const ALL_COLUMNS: ColumnConfig[] = [
  // Identification
  COL('name', 'subscriptions.columns.name', { width: '300px', sortable: true }),
  COL('investor', 'subscriptions.columns.investor', { width: '250px', sortable: true }),

  // Amounts & products
  COL('amount', 'subscriptions.columns.amount', { width: '150px', sortable: true, align: 'right' }),
  COL('quantity', 'subscriptions.columns.quantity', { width: '120px', sortable: true, align: 'right' }),
  COL('calledAmount', 'subscriptions.columns.calledAmount', { width: '150px', sortable: true, align: 'right' }),
  COL('remainingAmount', 'subscriptions.columns.remainingAmount', { width: '150px', sortable: true, align: 'right' }),
  COL('distributedAmount', 'subscriptions.columns.distributedAmount', { width: '150px', sortable: true, align: 'right' }),
  COL('entryFees', 'subscriptions.columns.entryFees', { width: '140px', sortable: true, align: 'right' }),
  COL('entryFeesAmount', 'subscriptions.columns.entryFeesAmount', { width: '180px', sortable: true, align: 'right' }),
  COL('fund', 'subscriptions.columns.fund', { sortable: true, width: 'auto' }),
  COL('compartment', 'subscriptions.columns.compartment', { sortable: false, width: 'auto' }),

  // Distribution & partnership
  COL('partner', 'subscriptions.columns.partner', { sortable: true, width: 'auto' }),
  COL('source', 'subscriptions.columns.sourceAll', { width: '140px', sortable: true }),
  COL('depositary', 'subscriptions.columns.depositary', { width: '140px', sortable: true }),

  // Config & settings
  COL('language', 'subscriptions.columns.language', { width: '120px', sortable: true }),
  COL('sepaEnabled', 'subscriptions.columns.sepaEnabled', { width: '120px', sortable: true, align: 'center' }),
  COL('pendingCalls', 'subscriptions.columns.pendingCalls', { width: '140px', sortable: true, align: 'center' }),

  // Management
  COL('analyst', 'subscriptions.columns.analyst', { width: '140px', sortable: true }),
  COL('globalStatus', 'subscriptions.columns.globalStatus', { width: '160px', sortable: true }),

  // Onboarding
  COL('onboardingStatus', 'subscriptions.columns.onboardingStatus', { width: '180px', sortable: true }),
  COL('blockageReason', 'subscriptions.columns.blockageReason', { width: '200px', sortable: false }),
  COL('completionRate', 'subscriptions.columns.completionRate', { width: '130px', sortable: true, align: 'center' }),
  COL('onboardingReopened', 'subscriptions.columns.onboardingReopened', { width: '140px', sortable: true, align: 'center' }),
  COL('notes', 'subscriptions.columns.notes', { width: '200px', sortable: false }),

  // Signatures
  COL('signatures', 'subscriptions.columns.signatures', { width: '180px', sortable: false }),
  COL('sentAt', 'subscriptions.columns.sentAt', { width: '140px', sortable: true }),
  COL('lastReminder', 'subscriptions.columns.lastReminder', { width: '140px', sortable: true }),
  COL('signatureChannel', 'subscriptions.columns.signatureChannel', { width: '120px', sortable: true }),
  COL('counterSignatureStatus', 'subscriptions.columns.counterSignatureStatus', { width: '180px', sortable: true }),
  COL('counterSignatureOwner', 'subscriptions.columns.counterSignatureOwnerLong', { width: '180px', sortable: true }),
  COL('investorSignedAt', 'subscriptions.columns.investorSignedAt', { width: '160px', sortable: true }),
  COL('daysSinceSignature', 'subscriptions.columns.daysSinceSignature', { width: '130px', sortable: true, align: 'center' }),

  // Dates & history
  COL('createdAt', 'subscriptions.columns.createdAt', { width: '140px', sortable: true }),
  COL('updatedAt', 'subscriptions.columns.updatedAt', { width: '140px', sortable: true }),
  COL('lastAction', 'subscriptions.columns.lastAction', { width: '140px', sortable: true }),
  COL('activatedAt', 'subscriptions.columns.activatedAt', { width: '140px', sortable: true }),
];

// Mapping des colonnes par statut
export const COLUMNS_BY_STATUS: Record<SubscriptionWorkflowStatus, ColumnConfig[]> = {
  created: CREATED_COLUMNS,
  onboarding: ONBOARDING_COLUMNS,
  signature: SIGNATURE_COLUMNS,
  counter_signature: COUNTER_SIGNATURE_COLUMNS,
  active: ACTIVE_COLUMNS,
  all: ALL_COLUMNS,
};

export function getColumnsForStatus(status: SubscriptionWorkflowStatus): ColumnConfig[] {
  return COLUMNS_BY_STATUS[status] || ALL_COLUMNS;
}

// Mapping raw workflow status → translation key for global status label
export function getGlobalStatusKey(rawStatus: string): string {
  if (rawStatus === 'Draft') return 'subscriptions.globalStatus.created';
  if (rawStatus === 'Onboarding') return 'subscriptions.globalStatus.onboarding';
  if (rawStatus === 'À signer') return 'subscriptions.globalStatus.signature';
  if (rawStatus === 'Investisseur signé') return 'subscriptions.globalStatus.counterSignature';
  if (['Exécuté', 'En attente de fonds', 'Active'].includes(rawStatus)) return 'subscriptions.globalStatus.active';
  return rawStatus;
}

/** Back-compat: returns the translation key instead of a French label. Callers should translate via t(). */
export function getGlobalStatus(rawStatus: string): string {
  return getGlobalStatusKey(rawStatus);
}

export function getSyntheticOnboardingStatusKey(completionRate: number, hasBlockage: boolean): string {
  if (hasBlockage) return 'subscriptions.onboardingStatus.blocked';
  if (completionRate === 100) return 'subscriptions.onboardingStatus.completed';
  if (completionRate >= 75) return 'subscriptions.onboardingStatus.advanced';
  if (completionRate >= 50) return 'subscriptions.onboardingStatus.inProgress';
  if (completionRate >= 25) return 'subscriptions.onboardingStatus.started';
  return 'subscriptions.onboardingStatus.notStarted';
}

/** Back-compat: returns a translation key. */
export function getSyntheticOnboardingStatus(completionRate: number, hasBlockage: boolean): string {
  return getSyntheticOnboardingStatusKey(completionRate, hasBlockage);
}
