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
  /** Every collection known in this session (seed + created), newest first. */
  allCollections: Collection[];
  /** Create a Collection from a fully-filled WizardData payload. */
  createCollection: (data: WizardData) => Collection;
  /** Shallow-merge patch into the collection with the given id. */
  updateCollection: (id: string, patch: Partial<Collection>) => void;
  /** Find a collection by id in the current session state. */
  getCollection: (id: string) => Collection | undefined;
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
  // Seed collections are cloned into state on mount so they can be mutated
  // uniformly alongside the ones created via the wizard.
  const [collections, setCollections] = useState<Collection[]>(() =>
    astorgCollections.map((c) => ({ ...c })),
  );

  const createCollection = useCallback((data: WizardData) => {
    const collection = buildCollectionFromWizard(data);
    setCollections((prev) => [collection, ...prev]);
    return collection;
  }, []);

  const updateCollection = useCallback(
    (id: string, patch: Partial<Collection>) => {
      setCollections((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      );
    },
    [],
  );

  const getCollection = useCallback(
    (id: string) => collections.find((c) => c.id === id),
    [collections],
  );

  const value = useMemo<CollectionsContextValue>(
    () => ({
      allCollections: collections,
      createCollection,
      updateCollection,
      getCollection,
    }),
    [collections, createCollection, updateCollection, getCollection],
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
