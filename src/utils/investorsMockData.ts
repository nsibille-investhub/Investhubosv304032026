// Single source of truth for investors / funds in the demo app — every
// list (Investor[], fund label map, segments) is derived from
// `gedFixtures.ts` so the mass upload wizard, the data room and the
// targeting badges can never drift apart.

import {
  COMMITMENTS,
  FUNDS,
  INVESTORS,
  getInvestorContacts,
} from './gedFixtures';

export interface Contact {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Investor {
  id: string;
  name: string;
  email: string;
  segment: string;
  fund: string;
  contacts: Contact[];
}

const primaryFundOf = (investorId: string): string => {
  const commits = COMMITMENTS.filter(c => c.investorId === investorId);
  if (commits.length === 0) return FUNDS[0].code;
  return [...commits].sort((a, b) => b.commitmentEur - a.commitmentEur)[0].fundCode;
};

// Distributors are exposed via a separate flow and are not part of the
// LP/investor universe surfaced here.
const KEPT_TYPOLOGIES = new Set([
  'Pension Fund', 'Insurance', 'Sovereign', 'Institutional',
  'Family Office', 'HNWI', 'UHNWI',
]);

export const availableInvestors: Investor[] = INVESTORS
  .filter(inv => KEPT_TYPOLOGIES.has(inv.typology))
  .map(inv => ({
    id: inv.id,
    name: inv.name,
    email: inv.email,
    segment: inv.typology,
    fund: primaryFundOf(inv.id),
    contacts: getInvestorContacts(inv.id).map(c => ({
      id: c.id, name: c.name, email: c.email, role: c.role,
    })),
  }));

// Maps fund codes to display labels. Legacy aliases are kept so older
// hardcoded callers (FolderDetailPanel, AddDocumentDialog, documentMockData)
// still render correct labels until they are migrated to canonical codes.
export const fundLabelMap: { [key: string]: string } = {
  ...Object.fromEntries(FUNDS.map(f => [f.code, f.name])),
  pere1: 'PERE 1',
  pere2: 'PERE 2',
  'fund-a': 'Fonds A - Innovation',
  'fund-b': 'Fonds B - Tech',
};

export const availableSegments = [
  'Pension Fund',
  'Insurance',
  'Sovereign',
  'Institutional',
  'Family Office',
  'HNWI',
  'UHNWI',
];
