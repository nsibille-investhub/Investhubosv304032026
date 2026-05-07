import {
  DocCategory,
  DocTargeting,
  DocumentSpec,
  FolderSpec,
  findFund,
  findInvestor,
  getSpaceById,
  getSpaces,
} from './gedFixtures';

/**
 * TreeNode is the shape consumed by the DataRoom tree views and the
 * DocumentsPage. It carries enough information so that the UI can render
 * the right targeting / category badges *deterministically* (no random
 * fallback when the node comes from gedFixtures).
 */
export interface TreeNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: TreeNode[];
  size?: string;
  date?: string;
  owner?: string;

  // Doc category drives the "Nature" badge.
  category?: DocCategory;
  // Underlying targeting (kept for consumers that want to inspect it).
  targeting?: DocTargeting;
  // Resolved labels — already looked up so the consumer doesn't need to.
  isNominative?: boolean;
  investorName?: string;
  subscriptionId?: string;
  shareClass?: string;
  fundName?: string;
  segmentRestrictions?: string[];
}

let counter = 0;
const nextId = (prefix: string) => `${prefix}-${++counter}`;

const formatDate = (iso: string): string => {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const documentNode = (
  doc: DocumentSpec,
  prefix: string,
  inherited: { fundName?: string; segments?: string[]; shareClass?: string },
): TreeNode => {
  const node: TreeNode = {
    id: nextId(prefix),
    name: doc.name,
    type: 'file',
    size: doc.size,
    date: formatDate(doc.date),
    owner: doc.owner,
    category: doc.category,
    targeting: doc.targeting,
  };

  switch (doc.targeting.mode) {
    case 'investor': {
      const inv = findInvestor(doc.targeting.investorId);
      node.isNominative = true;
      node.investorName = inv?.name ?? doc.targeting.investorId;
      node.subscriptionId = doc.targeting.subscriptionId;
      node.shareClass = doc.targeting.shareClass;
      node.fundName = inherited.fundName;
      break;
    }
    case 'fund':
    case 'fund-internal':
      node.isNominative = false;
      node.fundName = inherited.fundName;
      // No share class restriction at doc level — leave undefined unless
      // the parent folder restricts it.
      node.shareClass = inherited.shareClass;
      break;
    case 'shareClass':
      node.isNominative = false;
      node.fundName = inherited.fundName;
      node.shareClass = doc.targeting.shareClass;
      break;
    case 'segment':
      node.isNominative = false;
      node.segmentRestrictions = doc.targeting.segments;
      node.fundName = inherited.fundName;
      break;
  }
  return node;
};

const folderNode = (
  folder: FolderSpec,
  prefix: string,
  inherited: { fundName?: string; segments?: string[]; shareClass?: string },
): TreeNode => {
  const fundName = folder.fund ?? inherited.fundName;
  const segments = folder.segments ?? inherited.segments;
  const shareClass = folder.shareClass ?? inherited.shareClass;
  const node: TreeNode = {
    id: nextId(prefix),
    name: folder.name,
    type: 'folder',
    children: [],
    fundName,
    segmentRestrictions: segments,
    shareClass,
  };
  for (const sub of folder.folders ?? []) {
    node.children!.push(folderNode(sub, prefix, { fundName, segments, shareClass }));
  }
  for (const doc of folder.documents ?? []) {
    node.children!.push(documentNode(doc, prefix, { fundName, segments, shareClass }));
  }
  return node;
};

const treeBySpaceId: Record<string, TreeNode[]> = {};

const buildTree = (spaceId: string): TreeNode[] => {
  const space = getSpaceById(spaceId);
  if (!space) return [];
  const fund = space.fundCode ? findFund(space.fundCode) : undefined;
  return space.folders.map((f) =>
    folderNode(f, spaceId, { fundName: fund?.name, segments: space.segments }),
  );
};

export function getTreeForSpace(spaceId: string): TreeNode[] {
  if (!treeBySpaceId[spaceId]) {
    treeBySpaceId[spaceId] = buildTree(spaceId);
  }
  return treeBySpaceId[spaceId];
}

export const dataRoomSpaceIds = getSpaces().map((s) => s.id);

export const defaultFundTree = (): TreeNode[] => {
  const first = getSpaces().find((s) => s.fundCode);
  return first ? getTreeForSpace(first.id) : [];
};

export const fundNameForSpace = (spaceId: string): string | undefined => {
  const space = getSpaceById(spaceId);
  if (!space?.fundCode) return undefined;
  return findFund(space.fundCode)?.name;
};
