import type { Document } from './documentMockData';

/**
 * Manual rank of folders and documents (GED+).
 *
 * The rank is the position of an item among the siblings of the same nature
 * (folders together, documents together) inside its parent. The tree keeps
 * folders before documents in every children array, so the array order is the
 * source of truth for the rank.
 */

export type RankKind = 'folder' | 'file';
export type GedSortKey = 'rank' | 'name' | 'added';
export type GedDefaultSort = GedSortKey;

export interface GedSort {
  key: GedSortKey;
  /** 1 = ascending, -1 = descending. Ignored for the defined order. */
  dir: 1 | -1;
}

export const RANK_SORT: GedSort = { key: 'rank', dir: 1 };

export const kindOf = (item: Document): RankKind => (item.type === 'folder' ? 'folder' : 'file');

/** First click direction: name A to Z, date most recent first. */
export const firstDirection = (key: GedSortKey): 1 | -1 => (key === 'added' ? -1 : 1);

export const sortFromDefault = (value: GedDefaultSort): GedSort =>
  value === 'rank' ? RANK_SORT : { key: value, dir: firstDirection(value) };

export const isSameSort = (a: GedSort, b: GedSort) =>
  a.key === b.key && (a.key === 'rank' || a.dir === b.dir);

/** Header click cycle: first direction, reversed, then back to the defined order. */
export function nextSort(current: GedSort, key: Exclude<GedSortKey, 'rank'>): GedSort {
  if (current.key !== key) return { key, dir: firstDirection(key) };
  if (current.dir === firstDirection(key)) return { key, dir: (current.dir * -1) as 1 | -1 };
  return RANK_SORT;
}

const nameCollator = new Intl.Collator('fr', { numeric: true, sensitivity: 'base' });

export function compareItems(sort: GedSort) {
  return (a: Document, b: Document) => {
    if (sort.key === 'name') return nameCollator.compare(a.name, b.name) * sort.dir;
    if (sort.key === 'added') {
      const da = new Date(a.uploadedAt).getTime();
      const db = new Date(b.uploadedAt).getTime();
      return (da - db) * sort.dir;
    }
    return 0;
  };
}

/** Items of one level, folders first, each nature ordered by the given sort. */
export function orderLevel(items: Document[], sort: GedSort): { folders: Document[]; files: Document[] } {
  const folders = items.filter((i) => i.type === 'folder');
  const files = items.filter((i) => i.type !== 'folder');
  if (sort.key === 'rank') return { folders, files };
  const cmp = compareItems(sort);
  return { folders: [...folders].sort(cmp), files: [...files].sort(cmp) };
}

export interface RankEntry {
  parentId: string | null;
  kind: RankKind;
  /** 1-based rank among the siblings of the same nature. */
  rank: number;
  /** Number of siblings of the same nature, the item included. */
  total: number;
}

export function buildRankIndex(tree: Document[]): Map<string, RankEntry> {
  const index = new Map<string, RankEntry>();
  const visit = (items: Document[], parentId: string | null) => {
    const folders = items.filter((i) => i.type === 'folder');
    const files = items.filter((i) => i.type !== 'folder');
    folders.forEach((f, i) => index.set(f.id, { parentId, kind: 'folder', rank: i + 1, total: folders.length }));
    files.forEach((f, i) => index.set(f.id, { parentId, kind: 'file', rank: i + 1, total: files.length }));
    folders.forEach((f) => visit(f.children ?? [], f.id));
  };
  visit(tree, null);
  return index;
}

/** Siblings of the same nature, in rank order. */
export function siblingsOf(tree: Document[], parentId: string | null, kind: RankKind): Document[] {
  const level = parentId ? findItem(tree, parentId)?.children ?? [] : tree;
  return level.filter((i) => kindOf(i) === kind);
}

export function findItem(tree: Document[], id: string): Document | null {
  for (const item of tree) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findItem(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

/** Replace the children of one level (null = root) and keep folders first. */
function updateLevel(
  tree: Document[],
  parentId: string | null,
  update: (items: Document[]) => Document[],
): Document[] {
  const normalize = (items: Document[]) => {
    const next = update(items);
    return [...next.filter((i) => i.type === 'folder'), ...next.filter((i) => i.type !== 'folder')];
  };
  if (!parentId) return normalize(tree);
  return tree.map((item) => {
    if (item.id === parentId) return { ...item, children: normalize(item.children ?? []) };
    if (item.children) return { ...item, children: updateLevel(item.children, parentId, update) };
    return item;
  });
}

/**
 * Move an item to a 0-based position among its siblings of the same nature.
 * Returns null when the move changes nothing.
 */
export function moveWithinKind(
  tree: Document[],
  id: string,
  toIndex: number,
): { tree: Document[]; item: Document; rank: number } | null {
  const entry = buildRankIndex(tree).get(id);
  const item = findItem(tree, id);
  if (!entry || !item) return null;
  const siblings = siblingsOf(tree, entry.parentId, entry.kind);
  const from = siblings.findIndex((s) => s.id === id);
  const to = Math.max(0, Math.min(siblings.length - 1, toIndex));
  if (from === to || from < 0) return null;
  const reordered = [...siblings];
  reordered.splice(from, 1);
  reordered.splice(to, 0, item);
  const next = updateLevel(tree, entry.parentId, (items) => {
    const others = items.filter((i) => kindOf(i) !== entry.kind);
    return entry.kind === 'folder' ? [...reordered, ...others] : [...others, ...reordered];
  });
  return { tree: next, item, rank: to + 1 };
}

/** Insert a new item at rank 1 of its nature in the given parent (null = root). */
export function insertAtTop(tree: Document[], parentId: string | null, item: Document): Document[] {
  return updateLevel(tree, parentId, (items) => [item, ...items]);
}
