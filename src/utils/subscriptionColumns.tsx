import { ReactNode } from 'react';

export type SubscriptionWorkflowStatus = 'created' | 'onboarding' | 'signature' | 'counter_signature' | 'active' | 'all';

export interface ColumnConfig {
  id: string;
  label: string;
  width?: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

// 🟦 ÉTAT : CRÉÉES - Objectif : qualifier et prioriser avant onboarding
const CREATED_COLUMNS: ColumnConfig[] = [
  { id: 'name', label: 'Name', width: '300px', sortable: true },
  { id: 'investor', label: 'Investisseur', width: '250px', sortable: true },
  { id: 'amount', label: 'Montant engagé', width: '150px', sortable: true, align: 'right' },
  { id: 'quantity', label: 'Quantité', width: '120px', sortable: true, align: 'right' },
  { id: 'fundShare', label: 'Fonds / Part', sortable: true, width: 'auto' },
  { id: 'language', label: 'Langue', width: '100px', sortable: true, align: 'center' },
  { id: 'partner', label: 'Partenaire', sortable: false, width: 'auto' },
  { id: 'createdAt', label: 'Date de création', width: '140px', sortable: true },
  { id: 'source', label: 'Origine', width: '140px', sortable: true },
  { id: 'analyst', label: 'Responsable', width: '140px', sortable: true },
];

// 🟨 ÉTAT : ONBOARDING - Objectif : identifier immédiatement les blocages
const ONBOARDING_COLUMNS: ColumnConfig[] = [
  { id: 'name', label: 'Name', width: '300px', sortable: true },
  { id: 'investor', label: 'Investisseur', width: '250px', sortable: true },
  { id: 'amount', label: 'Montant engagé', width: '150px', sortable: true, align: 'right' },
  { id: 'quantity', label: 'Quantité', width: '120px', sortable: true, align: 'right' },
  { id: 'fundShare', label: 'Fonds / Part', sortable: true, width: 'auto' },
  { id: 'language', label: 'Langue', width: '100px', sortable: true, align: 'center' },
  { id: 'onboardingStatus', label: 'Statut onboarding', width: '180px', sortable: true },
  { id: 'blockageReason', label: 'Motif de blocage', width: '200px', sortable: false },
  { id: 'completionRate', label: 'Complétion (%)', width: '130px', sortable: true, align: 'center' },
  { id: 'lastAction', label: 'Dernière action', width: '140px', sortable: true },
  { id: 'analyst', label: 'Responsable', width: '140px', sortable: true },
];

// 🟧 ÉTAT : SIGNATURE - Objectif : suivi et relance des signatures
const SIGNATURE_COLUMNS: ColumnConfig[] = [
  { id: 'name', label: 'Name', width: '300px', sortable: true },
  { id: 'investor', label: 'Investisseur', width: '250px', sortable: true },
  { id: 'amount', label: 'Montant engagé', width: '150px', sortable: true, align: 'right' },
  { id: 'quantity', label: 'Quantité', width: '120px', sortable: true, align: 'right' },
  { id: 'fundShare', label: 'Fonds / Part', sortable: true, width: 'auto' },
  { id: 'language', label: 'Langue', width: '100px', sortable: true, align: 'center' },
  { id: 'statut', label: 'Statut', width: '140px', sortable: true },
  { id: 'signatures', label: 'Signatures', width: '180px', sortable: false },
  { id: 'sentAt', label: 'Envoi à signature', width: '140px', sortable: true },
  { id: 'lastReminder', label: 'Dernière relance', width: '140px', sortable: true },
  { id: 'signatureChannel', label: 'Canal', width: '120px', sortable: true },
];

// 🟥 ÉTAT : CONTRE-SIGNATURE - Objectif : finalisation interne rapide
const COUNTER_SIGNATURE_COLUMNS: ColumnConfig[] = [
  { id: 'investor', label: 'Investisseur', width: '250px', sortable: true },
  { id: 'amount', label: 'Montant engagé', width: '150px', sortable: true, align: 'right' },
  { id: 'quantity', label: 'Quantité', width: '120px', sortable: true, align: 'right' },
  { id: 'fund', label: 'Fonds', sortable: true, width: 'auto' },
  { id: 'compartment', label: 'Part', sortable: false, width: 'auto' },
  { id: 'language', label: 'Langue', width: '100px', sortable: true, align: 'center' },
  { id: 'counterSignatureStatus', label: 'Statut contre-signature', width: '180px', sortable: true },
  { id: 'counterSignatureOwner', label: 'Responsable', width: '160px', sortable: true },
  { id: 'investorSignedAt', label: 'Signature investisseur', width: '160px', sortable: true },
  { id: 'daysSinceSignature', label: 'Jours écoulés', width: '130px', sortable: true, align: 'center' },
];

// 🟩 ÉTAT : ACTIVES - Objectif : suivi financier et opérationnel
const ACTIVE_COLUMNS: ColumnConfig[] = [
  { id: 'investor', label: 'Investisseur', width: '250px', sortable: true },
  { id: 'fund', label: 'Fonds', sortable: true, width: 'auto' },
  { id: 'compartment', label: 'Part', sortable: false, width: 'auto' },
  { id: 'amount', label: 'Montant engagé', width: '150px', sortable: true, align: 'right' },
  { id: 'quantity', label: 'Quantité', width: '120px', sortable: true, align: 'right' },
  { id: 'language', label: 'Langue', width: '100px', sortable: true, align: 'center' },
  { id: 'called-amounts', label: 'Montant appelé', width: '150px', sortable: true, align: 'right' },
  { id: 'remainingAmount', label: 'Restant à appeler', width: '150px', sortable: true, align: 'right' },
  { id: 'distributedAmount', label: 'Montant distribué', width: '150px', sortable: true, align: 'right' },
  { id: 'entryFees', label: 'Frais d\'entrée (%)', width: '140px', sortable: true, align: 'right' },
  { id: 'entryFeesAmount', label: 'Frais d\'entrée (montant)', width: '180px', sortable: true, align: 'right' },
  { id: 'depositary', label: 'Dépositaire', width: '120px', sortable: true, align: 'center' },
  { id: 'activatedAt', label: 'Date d\'activation', width: '140px', sortable: true },
];

// ⬛ ÉTAT : TOUTES - Objectif : vision globale, recherche et export
const ALL_COLUMNS: ColumnConfig[] = [
  // Identification
  { id: 'name', label: 'Name', width: '300px', sortable: true },
  { id: 'investor', label: 'Investisseur', width: '250px', sortable: true },
  
  // Montants et produits
  { id: 'amount', label: 'Montant engagé', width: '150px', sortable: true, align: 'right' },
  { id: 'quantity', label: 'Quantité', width: '120px', sortable: true, align: 'right' },
  { id: 'called-amounts', label: 'Montant appelé', width: '150px', sortable: true, align: 'right' },
  { id: 'remainingAmount', label: 'Restant à appeler', width: '150px', sortable: true, align: 'right' },
  { id: 'distributedAmount', label: 'Montant distribué', width: '150px', sortable: true, align: 'right' },
  { id: 'entryFees', label: 'Frais d\'entrée (%)', width: '140px', sortable: true, align: 'right' },
  { id: 'entryFeesAmount', label: 'Frais d\'entrée (montant)', width: '180px', sortable: true, align: 'right' },
  { id: 'fund', label: 'Fonds', sortable: true, width: 'auto' },
  { id: 'compartment', label: 'Part', sortable: false, width: 'auto' },
  
  // Distribution et partenariat
  { id: 'partner', label: 'Partenaire', sortable: true, width: 'auto' },
  { id: 'source', label: 'Source', width: '140px', sortable: true },
  { id: 'depositary', label: 'Dépositaire', width: '140px', sortable: true },
  
  // Configuration et paramètres
  { id: 'language', label: 'Langue', width: '120px', sortable: true },
  { id: 'sepaEnabled', label: 'SEPA activé', width: '120px', sortable: true, align: 'center' },
  { id: 'pendingCalls', label: 'Appels en attente', width: '140px', sortable: true, align: 'center' },
  
  // Gestion et responsabilité
  { id: 'analyst', label: 'Responsable', width: '140px', sortable: true },
  { id: 'globalStatus', label: 'Statut global', width: '160px', sortable: true },
  
  // Onboarding
  { id: 'onboardingStatus', label: 'Statut onboarding', width: '180px', sortable: true },
  { id: 'blockageReason', label: 'Motif de blocage', width: '200px', sortable: false },
  { id: 'completionRate', label: 'Complétion (%)', width: '130px', sortable: true, align: 'center' },
  { id: 'onboardingReopened', label: 'Nb réouvertures', width: '140px', sortable: true, align: 'center' },
  { id: 'notes', label: 'Notes', width: '200px', sortable: false },
  
  // Signatures
  { id: 'signatures', label: 'Signatures', width: '180px', sortable: false },
  { id: 'sentAt', label: 'Envoi à signature', width: '140px', sortable: true },
  { id: 'lastReminder', label: 'Dernière relance', width: '140px', sortable: true },
  { id: 'signatureChannel', label: 'Canal', width: '120px', sortable: true },
  { id: 'counterSignatureStatus', label: 'Statut contre-signature', width: '180px', sortable: true },
  { id: 'counterSignatureOwner', label: 'Responsable contre-signature', width: '180px', sortable: true },
  { id: 'investorSignedAt', label: 'Signature investisseur', width: '160px', sortable: true },
  { id: 'daysSinceSignature', label: 'Jours écoulés', width: '130px', sortable: true, align: 'center' },
  
  // Dates et historique
  { id: 'createdAt', label: 'Date de création', width: '140px', sortable: true },
  { id: 'updatedAt', label: 'Dernière MAJ', width: '140px', sortable: true },
  { id: 'lastAction', label: 'Dernière action', width: '140px', sortable: true },
  { id: 'activatedAt', label: 'Date d\'activation', width: '140px', sortable: true },
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

// Helper pour obtenir les colonnes selon le statut
export function getColumnsForStatus(status: SubscriptionWorkflowStatus): ColumnConfig[] {
  return COLUMNS_BY_STATUS[status] || ALL_COLUMNS;
}

// Helper pour mapper les labels de statut normalisés
export function getGlobalStatus(rawStatus: string): string {
  if (rawStatus === 'Draft') return 'Créée';
  if (rawStatus === 'Onboarding') return 'Onboarding';
  if (rawStatus === 'À signer') return 'Signature';
  if (rawStatus === 'Investisseur signé') return 'Contre-signature';
  if (['Exécuté', 'En attente de fonds', 'Active'].includes(rawStatus)) return 'Active';
  return rawStatus;
}

// Helper pour obtenir le statut synthétique d'onboarding
export function getSyntheticOnboardingStatus(completionRate: number, hasBlockage: boolean): string {
  if (hasBlockage) return 'Bloqué';
  if (completionRate === 100) return 'Complété';
  if (completionRate >= 75) return 'En cours avancé';
  if (completionRate >= 50) return 'En cours';
  if (completionRate >= 25) return 'Démarré';
  return 'Non démarré';
}
