import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { astorgCollections } from '../seed/collections';
import type {
  Collection,
  CollectionColumn,
  WizardData,
} from '../types';

interface CollectionsContextValue {
  /** Collections persisted in-memory for this session (created via the wizard). */
  createdCollections: Collection[];
  /** Merge of seed + in-memory, sorted by newest first for created ones. */
  allCollections: Collection[];
  /** Create a Collection from a fully-filled WizardData payload. */
  createCollection: (data: WizardData) => Collection;
}

const CollectionsContext = createContext<CollectionsContextValue | null>(null);

function newId(): string {
  return `col_${Math.random().toString(36).slice(2, 10)}`;
}

function buildCollectionFromWizard(data: WizardData): Collection {
  const now = new Date().toISOString();
  const columns: CollectionColumn[] = (data.columns ?? []).map((c) => ({ ...c }));

  return {
    id: newId(),
    technicalName: data.technicalName ?? 'untitled_collection',
    displayName: data.displayName ?? 'Untitled',
    description: data.description,
    ingestionMode: data.ingestionMode ?? 'manual',
    pivotType: data.pivotType ?? 'reference',
    linkedPivotObjects: data.linkedPivotObjects ?? [],
    columns,
    publicationWorkflow: data.publicationWorkflow ?? 'manual-validation',
    stats: {
      totalRows: 0,
      publishedRows: 0,
      draftRows: 0,
      unpublishedRows: 0,
      changesRows: 0,
    },
    lastSyncAt: undefined,
    createdAt: now,
    updatedAt: now,
  };
}

export function CollectionsProvider({ children }: { children: ReactNode }) {
  const [createdCollections, setCreatedCollections] = useState<Collection[]>([]);

  const createCollection = useCallback((data: WizardData) => {
    const collection = buildCollectionFromWizard(data);
    setCreatedCollections((prev) => [collection, ...prev]);
    return collection;
  }, []);

  const allCollections = useMemo(
    () => [...createdCollections, ...astorgCollections],
    [createdCollections],
  );

  const value = useMemo<CollectionsContextValue>(
    () => ({ createdCollections, allCollections, createCollection }),
    [createdCollections, allCollections, createCollection],
  );

  return (
    <CollectionsContext.Provider value={value}>
      {children}
    </CollectionsContext.Provider>
  );
}

export function useCollections() {
  const ctx = useContext(CollectionsContext);
  if (!ctx) {
    throw new Error('useCollections must be used within a CollectionsProvider');
  }
  return ctx;
}
