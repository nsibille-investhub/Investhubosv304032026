// Viewer list driving the "View as LP" feature. Sourced from the unified
// gedFixtures so that:
//   - every LP shown in the picker exists in the GED (with documents
//     targeted to them), and
//   - their contacts mirror the same persons referenced in BirdView
//     activity events and the document relaunch modal.

import {
  INVESTORS,
  InvestorContact,
  InvestorProfile,
  commitmentsForFund,
  findFund,
  findInvestor,
  getAllInvestorContacts,
  getInvestorContacts,
  getSpaces,
} from './gedFixtures';

export interface Viewer {
  id: string;
  name: string;
  email: string;
  type: 'investor' | 'contact';
  investorId?: string;
  company?: string;
  role?: string;
  avatar?: string;
  /** Folders the viewer can access — derived from his fund commitments. */
  allowedFolders: string[];
  /** Specific documents the viewer can access (kept for compat — empty). */
  allowedDocuments: string[];
}

const initials = (name: string): string => {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const investorRole = (inv: InvestorProfile): string => {
  switch (inv.typology) {
    case 'Pension Fund':  return 'Pension Fund';
    case 'Insurance':     return 'Insurance Company';
    case 'Sovereign':     return 'Sovereign Wealth';
    case 'Institutional': return 'Institutional Investor';
    case 'Family Office': return 'Family Office';
    case 'HNWI':          return 'High Net Worth';
    case 'UHNWI':         return 'Ultra High Net Worth';
    case 'Distributor':   return 'Distributor / Private Bank';
  }
};

/** Spaces (= fund document spaces) accessible to a given LP. */
const allowedSpacesForInvestor = (investorId: string): string[] => {
  const allowed: string[] = [];
  for (const space of getSpaces()) {
    if (!space.fundCode) continue;
    const fundLPs = commitmentsForFund(space.fundCode);
    if (fundLPs.some((c) => c.investorId === investorId)) {
      allowed.push(space.id);
    }
  }
  return allowed;
};

const buildInvestorViewer = (inv: InvestorProfile): Viewer => ({
  id: inv.id,
  name: inv.name,
  email: inv.email,
  type: 'investor',
  company: inv.name,
  role: investorRole(inv),
  avatar: initials(inv.name),
  allowedFolders: allowedSpacesForInvestor(inv.id),
  allowedDocuments: [],
});

const MARKETING_SPACE_ID = 'space-marketing';

const buildContactViewer = (c: InvestorContact): Viewer => {
  const inv = findInvestor(c.investorId);
  let allowedFolders: string[];
  switch (c.accessLevel) {
    case 'revoked':
      allowedFolders = [];
      break;
    case 'commercial-only':
      // Intern profile: marketing space only, no fund-level access.
      allowedFolders = [MARKETING_SPACE_ID];
      break;
    case 'full':
    default:
      allowedFolders = [...allowedSpacesForInvestor(c.investorId), MARKETING_SPACE_ID];
      break;
  }
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    type: 'contact',
    investorId: c.investorId,
    company: inv?.name,
    role: c.role,
    avatar: initials(c.name),
    allowedFolders,
    allowedDocuments: [],
  };
};

export const mockViewers: Viewer[] = [
  ...INVESTORS.map(buildInvestorViewer),
  ...getAllInvestorContacts().map(buildContactViewer),
];

export const getViewerById = (id: string): Viewer | undefined =>
  mockViewers.find((v) => v.id === id);

export const getInvestors = (): Viewer[] =>
  mockViewers.filter((v) => v.type === 'investor');

export const getContactsForInvestor = (investorId: string): Viewer[] =>
  getInvestorContacts(investorId).map(buildContactViewer);

export const canViewFolder = (viewer: Viewer, folderId: string): boolean =>
  viewer.allowedFolders.includes(folderId);

export const canViewDocument = (
  viewer: Viewer,
  _documentId: string,
  folderIds: string[],
): boolean => folderIds.some((id) => viewer.allowedFolders.includes(id));

/** Returns the first fund (by space order) that the investor committed to. */
export const fundForInvestor = (investorId: string): string | undefined => {
  for (const space of getSpaces()) {
    if (!space.fundCode) continue;
    const fundLPs = commitmentsForFund(space.fundCode);
    if (fundLPs.some((c) => c.investorId === investorId)) {
      return findFund(space.fundCode)?.name;
    }
  }
  return undefined;
};
