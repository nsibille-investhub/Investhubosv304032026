export type CollectionRowStatus =
  | 'published'
  | 'draft'
  | 'unpublished'
  | 'changes';

export type IngestionMode =
  | 'manual'
  | 'file'
  | 'api-pull'
  | 'api-push'
  | 'mcp';

export type PivotTemporalType = 'timeseries' | 'reference' | 'event';

export type InvestHubPivotObject =
  | 'campaign'
  | 'subscription'
  | 'investor'
  | 'contact'
  | 'distributor'
  | 'capital-account'
  | 'commitment';

export type CollectionColumnType =
  | 'text'
  | 'number'
  | 'currency'
  | 'percentage'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'url'
  | 'select';

export interface CollectionColumn {
  id: string;
  technicalName: string;
  label: string;
  type: CollectionColumnType;
  unit?: string;
  required: boolean;
  isTemporalPivot?: boolean;
  isKeyToInvestHubObject?: InvestHubPivotObject;
}

export type PublicationWorkflow =
  | 'direct'
  | 'manual-validation'
  | 'ai-validation';

export interface CollectionStats {
  totalRows: number;
  publishedRows: number;
  draftRows: number;
  unpublishedRows: number;
  changesRows: number;
}

export interface Collection {
  id: string;
  technicalName: string;
  displayName: string;
  description?: string;
  ingestionMode: IngestionMode;
  pivotType: PivotTemporalType;
  linkedPivotObjects: InvestHubPivotObject[];
  columns: CollectionColumn[];
  publicationWorkflow: PublicationWorkflow;
  stats: CollectionStats;
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionRow {
  id: string;
  collectionId: string;
  status: CollectionRowStatus;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  version: number;
}

export interface WizardVisibility {
  lpPortal: boolean;
  autoFilterByInvestor: boolean;
  distributorPortal: boolean;
}

/**
 * How a Collection relates to InvestHub business objects.
 * - free: editorial, not linked to any business object
 * - link: rows reference existing InvestHub objects via a pivot key
 * - create: rows materialise new InvestHub objects on ingestion
 */
export type CollectionLinkStrategy = 'free' | 'link' | 'create';

export interface FieldMapping {
  id: string;
  /** Source column technicalName coming from the collection schema. */
  sourceColumn: string;
  /** Target attribute name on the InvestHub object. */
  targetField: string;
  /** Optional — which pivot object this mapping targets. */
  pivotObject?: InvestHubPivotObject;
}

/**
 * How a pivot key column resolves to an InvestHub internal id. Users can
 * either reuse a pre-existing referential (a saved ext_id ↔ int_id table)
 * or declare a new one inline.
 */
export interface PivotReferential {
  pivotObject: InvestHubPivotObject;
  mode: 'existing' | 'new';
  /** When mode === 'existing'. */
  referentialId?: string;
  /** When mode === 'new' — column carrying the external id. */
  externalKey?: string;
  /** When mode === 'new' — target InvestHub id attribute. */
  internalKey?: string;
}

export interface WizardData {
  // Step 1 (prompt 3.1)
  ingestionMode?: IngestionMode;
  // Step 2 (prompt 3.2)
  modeConfig?: Record<string, unknown>;
  // Step 3 (prompt 3.3)
  displayName?: string;
  technicalName?: string;
  description?: string;
  linkStrategy?: CollectionLinkStrategy;
  linkedPivotObjects?: InvestHubPivotObject[];
  pivotKeys?: Partial<Record<InvestHubPivotObject, string>>;
  fieldMappings?: FieldMapping[];
  pivotReferentials?: PivotReferential[];
  /** The id of an applied mapping template, if any. */
  mappingTemplateId?: string;
  visibility?: WizardVisibility;
  pivotType?: PivotTemporalType;
  pivotColumn?: string;
  // Step 4 (prompt 3.4)
  columns?: CollectionColumn[];
  publicationWorkflow?: PublicationWorkflow;
}
