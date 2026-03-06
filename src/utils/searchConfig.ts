/**
 * Configuration centralisée des champs de recherche pour tous les tableaux
 * 
 * Ce fichier définit les champs searchables pour chaque type de tableau dans l'application.
 * Utilisé avec le hook useTableSearch pour une recherche multi-champs standardisée.
 */

/**
 * Champs de recherche pour le tableau des souscriptions
 */
export const SUBSCRIPTION_SEARCH_FIELDS = [
  'name',
  'contrepartie.name',
  'contrepartie.structure', // Pour les Corporate
  'type',
  'amount',
  'fund.name',
  'fund.shareClass',
  'status',
  'partenaire.name',
] as const;

/**
 * Champs de recherche pour le tableau des entités (Alerts)
 */
export const ENTITY_SEARCH_FIELDS = [
  'entityName',
  'entityId',
  'entityType',
  'country',
  'alertType',
  'riskLevel',
  'analyst',
] as const;

/**
 * Champs de recherche pour le tableau des documents
 */
export const DOCUMENT_SEARCH_FIELDS = [
  'name',
  'type',
  'category',
  'tags',
  'uploadedBy',
  'entity',
] as const;

/**
 * Champs de recherche pour le tableau des alertes
 */
export const ALERT_SEARCH_FIELDS = [
  'name',
  'entityName',
  'status',
  'changes',
  'source',
] as const;

/**
 * Champs de recherche pour le tableau des investisseurs
 */
export const INVESTOR_SEARCH_FIELDS = [
  'name',
  'type',
  'status',
  'email',
  'phone',
  'country',
  'crmSegment',
  'analyst',
  'partner',
  'kycStatus',
  'structures', // Recherche dans tous les champs des structures
] as const;

/**
 * Champs de recherche pour le tableau des partenaires
 */
export const PARTNER_SEARCH_FIELDS = [
  'name',
  'type',
  'status',
  'contractType',
  'analyst',
  'country',
  'city',
  'siret',
  'email',
  'phone',
  'contacts', // Recherche dans tous les champs des contacts
] as const;

/**
 * Champs de recherche pour le tableau des fonds
 */
export const FUND_SEARCH_FIELDS = [
  'name',
  'lei',
  'type',
  'status',
  'strategy',
  'manager',
  'domicile',
] as const;

/**
 * Type helper pour extraire les champs de recherche
 */
export type SearchableField<T> = T extends ReadonlyArray<infer U> ? U : never;

/**
 * Exemple d'utilisation :
 * 
 * ```tsx
 * import { useTableSearch } from '../utils/useTableSearch';
 * import { SUBSCRIPTION_SEARCH_FIELDS } from '../utils/searchConfig';
 * 
 * const { searchTerm, setSearchTerm, filteredData, hasActiveSearch } = 
 *   useTableSearch(data, SUBSCRIPTION_SEARCH_FIELDS);
 * ```
 */