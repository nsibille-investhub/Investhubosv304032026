import {
  DocumentSpec,
  FolderSpec,
  findFund,
  getSpaceById,
  getSpaces,
} from './gedFixtures';

export interface TreeNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: TreeNode[];
  size?: string;
  date?: string;
  owner?: string;
}

let counter = 0;
const nextId = (prefix: string) => `${prefix}-${++counter}`;

const documentNode = (doc: DocumentSpec, prefix: string): TreeNode => ({
  id: nextId(prefix),
  name: doc.name,
  type: 'file',
  size: doc.size,
  date: formatDate(doc.date),
  owner: doc.owner,
});

const folderNode = (folder: FolderSpec, prefix: string): TreeNode => {
  const node: TreeNode = {
    id: nextId(prefix),
    name: folder.name,
    type: 'folder',
    children: [],
  };
  for (const sub of folder.folders ?? []) {
    node.children!.push(folderNode(sub, prefix));
  }
  for (const doc of folder.documents ?? []) {
    node.children!.push(documentNode(doc, prefix));
  }
  return node;
};

const formatDate = (iso: string): string => {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const treeBySpaceId: Record<string, TreeNode[]> = {};

const buildTree = (spaceId: string): TreeNode[] => {
  const space = getSpaceById(spaceId);
  if (!space) return [];
  const prefix = spaceId;
  return space.folders.map((f) => folderNode(f, prefix));
};

export function getTreeForSpace(spaceId: string): TreeNode[] {
  if (!treeBySpaceId[spaceId]) {
    treeBySpaceId[spaceId] = buildTree(spaceId);
  }
  return treeBySpaceId[spaceId];
}

// Re-export the list of spaces for convenience (some consumers iterate trees).
export const dataRoomSpaceIds = getSpaces().map((s) => s.id);

// Convenience accessor: tree for the first fund space (used by storybook fallback).
export const defaultFundTree = (): TreeNode[] => {
  const first = getSpaces().find((s) => s.fundCode);
  return first ? getTreeForSpace(first.id) : [];
};

export const fundNameForSpace = (spaceId: string): string | undefined => {
  const space = getSpaceById(spaceId);
  if (!space?.fundCode) return undefined;
  return findFund(space.fundCode)?.name;
};
