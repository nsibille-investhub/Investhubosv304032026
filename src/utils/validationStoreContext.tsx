import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  ValidationBatch,
  ValidationDocument,
  ValidationStatus,
} from './validationDocumentsGenerator';
import { getSpaces } from './gedFixtures';

/**
 * Cross-feature store wiring the mass-upload wizard, the validation page
 * and the GED data room together so newly imported documents flow
 * end-to-end during a demo session:
 *
 *   wizard.handleFinish() ──► addUploadResults()
 *      └─► appears in ValidationPage as "pending"
 *           └─► validation toggles status via promoteToGed()
 *                └─► appears in DocumentsPage (GED) at the right space
 */

export interface GedExtraDocument {
  id: string;
  name: string;
  format: ValidationDocument['format'];
  size?: string;
  pathSegments: string[];
  uploadedBy: string;
  uploadedAt: string;
  spaceId: string;
  status: ValidationStatus;
  kindKey?: string;
}

interface ValidationStoreContextValue {
  dynamicDocuments: ValidationDocument[];
  dynamicBatches: ValidationBatch[];
  gedExtras: GedExtraDocument[];
  /** Add new documents and (optionally) a batch to the validation listing. */
  addUploadResults: (
    batch: ValidationBatch | null,
    docs: ValidationDocument[],
  ) => void;
  /** Update the status of a document already known to the store (dynamic). */
  setDynamicDocumentStatus: (docId: number, status: ValidationStatus) => void;
  /** Update the status of every document of a dynamic batch. */
  setDynamicBatchStatus: (batchId: string, status: ValidationStatus) => void;
  /** Push (or remove) one document into the GED. Idempotent on (id). */
  promoteToGed: (
    docs: ValidationDocument[],
    status: ValidationStatus,
  ) => void;
}

const ValidationStoreContext = createContext<ValidationStoreContextValue | undefined>(
  undefined,
);

let nextDynamicId = 1_000_000;

/** Resolve the GED space for a document, using its explicit gedSpaceId
 * first, then falling back to a name match against the first path segment
 * (this matches the convention used by gedFixtures, where each fund space
 * is named after the fund). */
const resolveSpaceId = (doc: ValidationDocument): string | undefined => {
  if (doc.gedSpaceId) return doc.gedSpaceId;
  const firstSeg = doc.pathSegments[0];
  if (!firstSeg) return undefined;
  const spaces = getSpaces();
  const match = spaces.find((s) => s.name === firstSeg);
  return match?.id;
};

const docToGedExtra = (
  doc: ValidationDocument,
  status: ValidationStatus,
): GedExtraDocument | null => {
  const spaceId = resolveSpaceId(doc);
  if (!spaceId) return null;
  return {
    id: `dyn-${doc.id}`,
    name: doc.name,
    format: doc.format,
    size: doc.size,
    pathSegments: doc.pathSegments,
    uploadedBy: doc.createdBy.name,
    uploadedAt: doc.createdAt,
    spaceId,
    status,
    kindKey: doc.kindKey,
  };
};

export function ValidationStoreProvider({ children }: { children: ReactNode }) {
  const [dynamicDocuments, setDynamicDocuments] = useState<ValidationDocument[]>([]);
  const [dynamicBatches, setDynamicBatches] = useState<ValidationBatch[]>([]);
  const [gedExtras, setGedExtras] = useState<GedExtraDocument[]>([]);

  const addUploadResults = useCallback(
    (batch: ValidationBatch | null, docs: ValidationDocument[]) => {
      if (batch) {
        setDynamicBatches((prev) => [batch, ...prev]);
      }
      const reified = docs.map((d) => ({
        ...d,
        id: d.id || nextDynamicId++,
      }));
      setDynamicDocuments((prev) => [...reified, ...prev]);
    },
    [],
  );

  const setDynamicDocumentStatus = useCallback(
    (docId: number, status: ValidationStatus) => {
      setDynamicDocuments((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, status } : d)),
      );
    },
    [],
  );

  const setDynamicBatchStatus = useCallback(
    (batchId: string, status: ValidationStatus) => {
      setDynamicDocuments((prev) =>
        prev.map((d) => (d.batchId === batchId ? { ...d, status } : d)),
      );
    },
    [],
  );

  const promoteToGed = useCallback(
    (docs: ValidationDocument[], status: ValidationStatus) => {
      if (status === 'pending') {
        const ids = new Set(docs.map((d) => `dyn-${d.id}`));
        setGedExtras((g) => g.filter((e) => !ids.has(e.id)));
        return;
      }
      const extras = docs
        .map((d) => docToGedExtra(d, status))
        .filter((e): e is GedExtraDocument => e !== null);
      if (extras.length === 0) return;
      setGedExtras((g) => {
        const incoming = new Set(extras.map((e) => e.id));
        const remaining = g.filter((e) => !incoming.has(e.id));
        return [...remaining, ...extras];
      });
    },
    [],
  );

  const value = useMemo<ValidationStoreContextValue>(
    () => ({
      dynamicDocuments,
      dynamicBatches,
      gedExtras,
      addUploadResults,
      setDynamicDocumentStatus,
      setDynamicBatchStatus,
      promoteToGed,
    }),
    [
      dynamicDocuments,
      dynamicBatches,
      gedExtras,
      addUploadResults,
      setDynamicDocumentStatus,
      setDynamicBatchStatus,
      promoteToGed,
    ],
  );

  return (
    <ValidationStoreContext.Provider value={value}>
      {children}
    </ValidationStoreContext.Provider>
  );
}

export function useValidationStore(): ValidationStoreContextValue {
  const ctx = useContext(ValidationStoreContext);
  if (!ctx) {
    throw new Error('useValidationStore must be used within a ValidationStoreProvider');
  }
  return ctx;
}

export function nextValidationDocId(): number {
  return nextDynamicId++;
}
