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
