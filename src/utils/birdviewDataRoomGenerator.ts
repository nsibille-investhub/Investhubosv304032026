// Bird View data — derived from the unified gedFixtures. Each document's
// `targeting` field maps deterministically to the BirdView restrictions
// (no randomization).

import {
  DocumentSpec,
  FolderSpec,
  SpaceSpec,
  findFund,
  findInvestor,
  getSpaces,
  pseudoRandom,
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
  shareClassRestriction?: string;
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
  const viewedBy = pseudoRandom() < 0.78 ? totalViewers : Math.floor(pseudoRandom() * totalViewers);
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

const toDocument = (
  doc: DocumentSpec,
  context: { fundName?: string; segments?: string[] },
): DataRoomDocument => {
  docCounter++;
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

  switch (doc.targeting.mode) {
    case 'fund':
    case 'fund-internal':
      return { ...base, fundRestriction: context.fundName };
    case 'shareClass':
      return {
        ...base,
        fundRestriction: context.fundName,
        shareClassRestriction: doc.targeting.shareClass,
      };
    case 'investor': {
      const inv = findInvestor(doc.targeting.investorId);
      return {
        ...base,
        isNominatif: true,
        investorRestriction: inv?.name ?? doc.targeting.investorId,
        subscriptionRestriction: doc.targeting.subscriptionId,
        fundRestriction: context.fundName,
        shareClassRestriction: doc.targeting.shareClass,
      };
    }
    case 'segment':
      return {
        ...base,
        segmentRestrictions: doc.targeting.segments,
        fundRestriction: context.fundName,
      };
  }
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
    node.children.push(toDocument(doc, { fundName, segments }));
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
