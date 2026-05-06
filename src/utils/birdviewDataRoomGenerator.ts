// Bird View data — sourced from the unified gedFixtures so DataRoom and
// Bird View stay in sync. Engagement / stats are synthesised here since
// they are pure UI noise and not part of the document model.

import {
  DocumentSpec,
  FolderSpec,
  SpaceSpec,
  findFund,
  findInvestor,
  getSpaces,
  pseudoRandom,
  pick,
} from './gedFixtures';
import { DocumentCategory } from './documentMockData';

export interface DataRoomDocument {
  id: string;
  name: string;
  format: 'pdf' | 'docx' | 'xlsx' | 'pptx';
  size: string;
  date: string;
  isNominatif: boolean;
  documentCategory: DocumentCategory;
  stats: {
    sent: number;
    opened: number;
    viewed: number;
    downloaded: number;
  };
  engagement: {
    viewedBy: number;
    totalViewers: number;
  };
  investorRestriction?: string;
  subscriptionRestriction?: string;
  fundRestriction?: string;
  segmentRestrictions?: string[];
}

export interface DataRoomFolder {
  id: string;
  name: string;
  children: (DataRoomFolder | DataRoomDocument)[];
  fundRestriction?: string;
  shareClassRestriction?: string;
  segmentRestrictions?: string[];
}

export interface DataRoomSpace {
  id: string;
  name: string;
  fundRestriction?: string;
  segmentRestrictions?: string[];
  folders: DataRoomFolder[];
}

let docCounter = 0;
let folderCounter = 0;

const SUBSCRIPTIONS_BY_INVESTOR: Record<string, string> = {
  'INV-001': 'SUB-2024-0011',
  'INV-002': 'SUB-2024-0012',
  'INV-003': 'SUB-2024-0014',
  'INV-004': 'SUB-2024-0017',
  'INV-005': 'SUB-2024-0021',
  'INV-006': 'SUB-2024-0024',
  'INV-007': 'SUB-2024-0027',
  'INV-008': 'SUB-2024-0029',
  'INV-009': 'SUB-2024-0033',
  'INV-010': 'SUB-2024-0036',
  'INV-011': 'SUB-2024-0042',
  'INV-012': 'SUB-2024-0045',
};

const allInvestors = Object.keys(SUBSCRIPTIONS_BY_INVESTOR);

const formatDate = (iso: string): string => {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const randomStats = () => ({
  sent: Math.floor(pseudoRandom() * 35) + 5,
  opened: Math.floor(pseudoRandom() * 25),
  viewed: Math.floor(pseudoRandom() * 22),
  downloaded: Math.floor(pseudoRandom() * 18),
});

const randomEngagement = () => {
  const totalViewers = Math.floor(pseudoRandom() * 12) + 6;
  const viewedBy = pseudoRandom() < 0.78
    ? totalViewers
    : Math.floor(pseudoRandom() * totalViewers);
  return { viewedBy, totalViewers };
};

const categoryMap = (cat: string): DocumentCategory => {
  switch (cat) {
    case 'capitalCall':
    case 'distribution':
    case 'quarterlyReport':
    case 'annualReport':
    case 'subscription':
    case 'kyc':
    case 'legal':
    case 'tax':
    case 'marketing':
    case 'other':
      return cat;
    default:
      return 'other';
  }
};

const ALL_SEGMENTS = ['HNWI', 'UHNWI', 'Family Office', 'Institutional', 'Insurance', 'Pension Fund', 'Sovereign', 'Distributor'];

const toDocument = (
  doc: DocumentSpec,
  context: { fundName?: string; segments?: string[]; shareClass?: string },
): DataRoomDocument => {
  docCounter++;
  // Targeting ratio: ~85% nominatif, 10% generic, 3% fund-only, 2% segment-only
  const roll = pseudoRandom();
  const base: DataRoomDocument = {
    id: `bv-doc-${docCounter}`,
    name: doc.name,
    format: doc.format,
    size: doc.size,
    date: formatDate(doc.date),
    isNominatif: false,
    documentCategory: categoryMap(doc.category),
    stats: randomStats(),
    engagement: randomEngagement(),
  };

  // Document-level explicit nominatif (subscription, side letter, statement…)
  if (doc.investorId) {
    const inv = findInvestor(doc.investorId);
    return {
      ...base,
      isNominatif: true,
      investorRestriction: inv?.name ?? doc.investorId,
      subscriptionRestriction: SUBSCRIPTIONS_BY_INVESTOR[doc.investorId],
      fundRestriction: context.fundName,
    };
  }

  if (doc.category === 'capitalCall' || doc.category === 'distribution' || doc.category === 'subscription' || doc.category === 'tax') {
    const investorId = pick(allInvestors);
    const inv = findInvestor(investorId);
    return {
      ...base,
      isNominatif: true,
      investorRestriction: inv?.name,
      subscriptionRestriction: SUBSCRIPTIONS_BY_INVESTOR[investorId],
      fundRestriction: context.fundName,
    };
  }

  if (roll < 0.7) {
    return { ...base, fundRestriction: context.fundName, segmentRestrictions: context.segments };
  }
  if (roll < 0.85) {
    const investorId = pick(allInvestors);
    const inv = findInvestor(investorId);
    return {
      ...base,
      isNominatif: true,
      investorRestriction: inv?.name,
      fundRestriction: context.fundName,
    };
  }
  if (roll < 0.95) {
    return { ...base, segmentRestrictions: context.segments ?? [pick(ALL_SEGMENTS)] };
  }
  return base; // pure generic, no restriction
};

const toFolder = (
  folder: FolderSpec,
  inherited: { fundName?: string; segments?: string[] },
): DataRoomFolder => {
  folderCounter++;
  const fundName = folder.fund ?? inherited.fundName;
  const segments = folder.segments ?? inherited.segments;
  const node: DataRoomFolder = {
    id: `bv-folder-${folderCounter}`,
    name: folder.name,
    children: [],
    fundRestriction: fundName,
    shareClassRestriction: folder.shareClass,
    segmentRestrictions: segments,
  };
  for (const sub of folder.folders ?? []) {
    node.children.push(toFolder(sub, { fundName, segments }));
  }
  for (const doc of folder.documents ?? []) {
    node.children.push(toDocument(doc, { fundName, segments, shareClass: folder.shareClass }));
  }
  return node;
};

const toSpace = (space: SpaceSpec): DataRoomSpace => {
  const fund = space.fundCode ? findFund(space.fundCode) : undefined;
  return {
    id: space.id,
    name: space.name,
    fundRestriction: fund?.name,
    segmentRestrictions: space.segments,
    folders: space.folders.map((f) =>
      toFolder(f, { fundName: fund?.name, segments: space.segments }),
    ),
  };
};

export const generateDataRoomSpaces = (): DataRoomSpace[] => {
  docCounter = 0;
  folderCounter = 0;
  return getSpaces().map(toSpace);
};
