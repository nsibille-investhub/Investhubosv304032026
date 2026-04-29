import { Document } from './documentMockData';
import type { SpaceTargeting } from './dataRoomSpacesData';

export interface InheritedRestrictions {
  fund?: string;
  shareClass?: string;
  segments: string[];
}

export type RestrictionsMap = Record<string, { fund?: string; segments?: string[]; shareClass?: string }>;

export function countDescendantDocuments(folder: Document): number {
  if (!folder.children) return 0;
  return folder.children.reduce((acc, child) => {
    if (child.type === 'folder') return acc + countDescendantDocuments(child);
    return acc + 1;
  }, 0);
}

export function collectDescendantDocuments(folder: Document): Document[] {
  const out: Document[] = [];
  const visit = (f: Document) => {
    f.children?.forEach((child) => {
      if (child.type === 'folder') visit(child);
      else out.push(child);
    });
  };
  visit(folder);
  return out;
}

export function collectFolderIds(folder: Document): Set<string> {
  const ids = new Set<string>([folder.id]);
  const visit = (f: Document) => {
    f.children?.forEach((child) => {
      if (child.type === 'folder') {
        ids.add(child.id);
        visit(child);
      }
    });
  };
  visit(folder);
  return ids;
}

export function getDocEffectiveRestrictions(doc: Document): InheritedRestrictions {
  const fund = doc.metadata?.fund || doc.navigatorTargeting?.fund;
  const shareClass = doc.navigatorTargeting?.shareClass;
  const segments = new Set<string>();
  doc.metadata?.segments?.forEach((s) => segments.add(s));
  if (doc.navigatorTargeting?.segment) segments.add(doc.navigatorTargeting.segment);
  return {
    fund: fund && fund.length > 0 ? fund : undefined,
    shareClass: shareClass && shareClass.length > 0 ? shareClass : undefined,
    segments: Array.from(segments),
  };
}

export function normalizeInheritedRestrictions(
  entry?: { fund?: string; shareClass?: string; segments?: string[] },
): InheritedRestrictions {
  return {
    fund: entry?.fund && entry.fund.length > 0 ? entry.fund : undefined,
    shareClass: entry?.shareClass && entry.shareClass.length > 0 ? entry.shareClass : undefined,
    segments: entry?.segments ?? [],
  };
}

/**
 * A destination is compatible with a document if every constraint the doc
 * carries is satisfied by the destination. Empty (undefined / [] ) on either
 * side means "no restriction".
 */
export function isDestinationCompatibleWithDoc(
  dest: InheritedRestrictions,
  doc: InheritedRestrictions,
): boolean {
  if (dest.fund && doc.fund && dest.fund !== doc.fund) return false;
  if (dest.shareClass && doc.shareClass && dest.shareClass !== doc.shareClass) return false;

  if (dest.segments.length > 0 && doc.segments.length > 0) {
    const allowed = new Set(dest.segments);
    if (!doc.segments.every((s) => allowed.has(s))) return false;
  }

  return true;
}

export interface DestinationCheck {
  compatible: boolean;
  blockingDocs: Document[];
}

export function checkDestinationForDocs(
  destInherited: InheritedRestrictions,
  docs: Document[],
): DestinationCheck {
  const blockingDocs = docs.filter((doc) => {
    const r = getDocEffectiveRestrictions(doc);
    return !isDestinationCompatibleWithDoc(destInherited, r);
  });
  return { compatible: blockingDocs.length === 0, blockingDocs };
}

/**
 * Recursively remove a folder by id from a document tree, returning a new
 * tree. Documents marked for migration are appended to the destination
 * folder's children (or to the root if `migrateToFolderId === 'root'`).
 *
 * Returns the new tree and the list of moved documents.
 */
export function deleteFolderFromTree(
  tree: Document[],
  folderId: string,
  migrateToFolderId: string | null,
  docsToMigrate: Document[],
): Document[] {
  const moveSet = new Set(docsToMigrate.map((d) => d.id));

  const stripFolder = (nodes: Document[]): Document[] => {
    const filtered = nodes.filter((n) => n.id !== folderId);
    return filtered.map((n) => {
      if (n.type !== 'folder' || !n.children) return n;
      return { ...n, children: stripFolder(n.children) };
    });
  };

  const insertInto = (nodes: Document[]): Document[] => {
    if (migrateToFolderId === null || docsToMigrate.length === 0) return nodes;

    if (migrateToFolderId === 'root') {
      const existingIds = new Set(nodes.map((n) => n.id));
      const newDocs = docsToMigrate.filter((d) => !existingIds.has(d.id));
      return [...nodes, ...newDocs];
    }

    return nodes.map((n) => {
      if (n.id === migrateToFolderId && n.type === 'folder') {
        const existingIds = new Set((n.children ?? []).map((c) => c.id));
        const newDocs = docsToMigrate.filter((d) => !existingIds.has(d.id));
        return { ...n, children: [...(n.children ?? []), ...newDocs] };
      }
      if (n.type === 'folder' && n.children) {
        return { ...n, children: insertInto(n.children) };
      }
      return n;
    });
  };

  // Avoid double-counting docs already collected from inside the deleted folder
  void moveSet;

  const stripped = stripFolder(tree);
  return insertInto(stripped);
}

/**
 * Returns true when the destination space's targeting is permissive enough
 * to host the source space's contents — i.e. a doc whose audience is implied
 * by the source's restrictions would not be silently dropped by the
 * destination's own restrictions.
 *
 * For each dimension (funds, segments, userTypes):
 * - empty on dest = no restriction = accepts anything
 * - non-empty on dest = source must list only values dest allows AND must
 *   itself be non-empty (otherwise source could contain values dest rejects).
 */
export function isSpaceCompatibleSource(
  dest: SpaceTargeting,
  source: SpaceTargeting,
): boolean {
  const checkDimension = (destValues: string[], sourceValues: string[]): boolean => {
    if (destValues.length === 0) return true;
    if (sourceValues.length === 0) return false;
    return sourceValues.every((v) => destValues.includes(v));
  };

  return (
    checkDimension(dest.funds, source.funds) &&
    checkDimension(dest.segments, source.segments) &&
    checkDimension(dest.userTypes, source.userTypes)
  );
}

