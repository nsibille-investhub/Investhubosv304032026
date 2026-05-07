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
} from './gedFixtures';
import { DocumentCategory } from './documentMockData';
import {
  buildEngagement,
  contextFromDoc,
} from './documentActivityGenerator';

export interface DataRoomDocument {
  id: string;
  name: string;
  format: 'pdf' | 'docx' | 'xlsx' | 'pptx';
  size: string;
  date: string;
  isNominatif: boolean;
  /**
   * Internal / back-office documents (LP allocation schedule, IC memos,
   * methodology memos, AMPERE feeds, internal P&L). Never visible to LPs
   * — the BirdView hides them as soon as a viewer scope is selected.
   */
  isInternal?: boolean;
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

/**
 * Stats / engagement are now derived from the same audience+status hash
 * the activity panel uses. The numbers shown in the BirdView tree
 * therefore match exactly what the panel displays once opened.
 */
const computeStatsAndEngagement = (
  doc: DocumentSpec,
  fundName: string | undefined,
): { stats: DataRoomDocument['stats']; engagement: DataRoomDocument['engagement'] } => {
  const inv = doc.targeting.mode === 'investor' ? findInvestor(doc.targeting.investorId) : undefined;
  const ctx = contextFromDoc({
    name: doc.name,
    documentCategory: doc.category as DocumentCategory,
    isNominatif: doc.targeting.mode === 'investor',
    investorRestriction: inv?.name,
    fundRestriction: fundName,
    segmentRestrictions: doc.targeting.mode === 'segment' ? doc.targeting.segments : undefined,
  });
  const eng = buildEngagement(ctx);
  // For nominatif docs the "viewed" panel ratio is at recipient level
  // (investor + their accessible contacts). For generic docs we expose
  // the LP-level ratio (X / N investisseurs).
  const isNominatif = doc.targeting.mode === 'investor';
  const totalViewers = isNominatif ? eng.totalRecipients : eng.totalInvestors;
  const viewedBy = isNominatif ? eng.recipientsViewed : eng.investorsViewed;

  // Notification stats: derive from audience statuses
  let sent = 0, opened = 0, viewed = 0, downloaded = 0;
  for (const r of eng.audience) {
    sent += 1; // every recipient gets a notification attempt
    if (r.status.opened) opened += 1;
    if (r.status.viewed) viewed += 1;
    if (r.status.downloaded) downloaded += 1;
  }

  return {
    stats: { sent, opened, viewed, downloaded },
    engagement: { viewedBy, totalViewers },
  };
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
  const { stats, engagement } = computeStatsAndEngagement(doc, context.fundName);
  const base: DataRoomDocument = {
    id: `bv-doc-${docCounter}`,
    name: doc.name,
    format: doc.format,
    size: doc.size,
    date: formatDate(doc.date),
    isNominatif: false,
    documentCategory: categoryMap(doc.category),
    stats,
    engagement,
  };

  switch (doc.targeting.mode) {
    case 'fund':
      return { ...base, fundRestriction: context.fundName };
    case 'fund-internal':
      return { ...base, fundRestriction: context.fundName, isInternal: true };
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
