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

// Canonical investor universe — mirrors the LP list defined in
// `gedFixtures.ts` so demo data, the wizard and the Targeting badges all
// reference the same names. `fund` here is the investor's primary fund
// (largest commitment); investors active on both funds are flagged via
// subscriptions, not via this field.
export const availableInvestors: Investor[] = [
  // Pension funds
  { id: 'INV-001', name: 'Aldebaran Pension Fund', email: 'lp-relations@aldebaran-pension.eu', segment: 'Pension Fund', fund: 'AIP1',
    contacts: [
      { id: 'INV-001-c1', name: 'Helena Krause', email: 'h.krause@aldebaran-pension.eu', role: 'Head of Private Markets' },
      { id: 'INV-001-c2', name: 'Lars Nilsson', email: 'l.nilsson@aldebaran-pension.eu', role: 'Investment Officer' },
    ],
  },
  { id: 'INV-014', name: 'Norwood Pension Trust', email: 'investments@norwood-pension.uk', segment: 'Pension Fund', fund: 'AIP1',
    contacts: [
      { id: 'INV-014-c1', name: 'Margaret Holloway', email: 'm.holloway@norwood-pension.uk', role: 'Director of Alternatives' },
    ],
  },
  { id: 'INV-021', name: 'Hartwood Retirement Plan', email: 'capital@hartwood-retirement.eu', segment: 'Pension Fund', fund: 'AIP1',
    contacts: [
      { id: 'INV-021-c1', name: 'Étienne Vasseur', email: 'e.vasseur@hartwood-retirement.eu', role: 'Senior Investment Officer' },
    ],
  },
  { id: 'INV-031', name: 'Brentley Pension Scheme', email: 'lp@brentley-pension.com', segment: 'Pension Fund', fund: 'AIP1',
    contacts: [
      { id: 'INV-031-c1', name: 'Daniel Foster', email: 'd.foster@brentley-pension.com', role: 'Investment Manager' },
    ],
  },
  // Insurance & Re
  { id: 'INV-003', name: 'Caledonia Insurance Group', email: 'investments@caledonia-ins.eu', segment: 'Insurance', fund: 'AIP1',
    contacts: [
      { id: 'INV-003-c1', name: 'Iona Mackenzie', email: 'i.mackenzie@caledonia-ins.eu', role: 'Head of Investments' },
      { id: 'INV-003-c2', name: 'Cameron Hughes', email: 'c.hughes@caledonia-ins.eu', role: 'Compliance Officer' },
    ],
  },
  { id: 'INV-017', name: 'Stratton Mutual Insurance', email: 'pe@stratton-mutual.com', segment: 'Insurance', fund: 'AIP1',
    contacts: [
      { id: 'INV-017-c1', name: 'Patricia Lowell', email: 'p.lowell@stratton-mutual.com', role: 'PE Portfolio Manager' },
    ],
  },
  { id: 'INV-019', name: 'Vellington Re', email: 'capital@vellington-re.eu', segment: 'Insurance', fund: 'AIP1',
    contacts: [
      { id: 'INV-019-c1', name: 'Maya Bergmann', email: 'm.bergmann@vellington-re.eu', role: 'Capital Allocator' },
    ],
  },
  { id: 'INV-024', name: 'Drumhill Reinsurance', email: 'allocations@drumhill-re.lu', segment: 'Insurance', fund: 'AIP1',
    contacts: [
      { id: 'INV-024-c1', name: 'Olivier Janssen', email: 'o.janssen@drumhill-re.lu', role: 'Head of Allocations' },
    ],
  },
  { id: 'INV-035', name: 'Northpoint Insurance', email: 'lp-relations@northpoint-ins.com', segment: 'Insurance', fund: 'AIP1',
    contacts: [
      { id: 'INV-035-c1', name: 'Erik Sandstrom', email: 'e.sandstrom@northpoint-ins.com', role: 'LP Relations' },
    ],
  },
  // Sovereign
  { id: 'INV-004', name: 'Dunmore Sovereign Wealth', email: 'capital@dunmore-swf.gov', segment: 'Sovereign', fund: 'AIP1',
    contacts: [
      { id: 'INV-004-c1', name: 'Aiden Calder', email: 'a.calder@dunmore-swf.gov', role: 'Director, Private Markets' },
      { id: 'INV-004-c2', name: 'Ravi Subramanian', email: 'r.subramanian@dunmore-swf.gov', role: 'Senior Analyst' },
    ],
  },
  { id: 'INV-018', name: 'Tanvir Investment Authority', email: 'lp@tanvir-ia.gov', segment: 'Sovereign', fund: 'AIP1',
    contacts: [
      { id: 'INV-018-c1', name: 'Salima Karim', email: 's.karim@tanvir-ia.gov', role: 'Head of Alternatives' },
    ],
  },
  { id: 'INV-032', name: 'Suvarna Reserve Fund', email: 'investments@suvarna-reserve.gov', segment: 'Sovereign', fund: 'AIP1',
    contacts: [
      { id: 'INV-032-c1', name: 'Aarav Mehta', email: 'a.mehta@suvarna-reserve.gov', role: 'Investment Director' },
    ],
  },
  // Institutional / endowments / foundations
  { id: 'INV-006', name: 'Fairfield Endowment', email: 'endowment@fairfield-edu.org', segment: 'Institutional', fund: 'AIP1',
    contacts: [
      { id: 'INV-006-c1', name: 'Catherine Whitman', email: 'c.whitman@fairfield-edu.org', role: 'CIO' },
    ],
  },
  { id: 'INV-008', name: 'Highbury Capital Allocators', email: 'lp@highbury-capital.com', segment: 'Institutional', fund: 'AIP1',
    contacts: [
      { id: 'INV-008-c1', name: 'Marcus Bellamy', email: 'm.bellamy@highbury-capital.com', role: 'Managing Director' },
    ],
  },
  { id: 'INV-010', name: 'Juniper Asset Management', email: 'pe@juniper-am.com', segment: 'Institutional', fund: 'AIP1',
    contacts: [
      { id: 'INV-010-c1', name: 'Théo Renard', email: 't.renard@juniper-am.com', role: 'Head of PE' },
    ],
  },
  { id: 'INV-022', name: 'Helmsford Foundation', email: 'allocations@helmsford-foundation.org', segment: 'Institutional', fund: 'AIP1',
    contacts: [
      { id: 'INV-022-c1', name: 'Ophelia Beckett', email: 'o.beckett@helmsford-foundation.org', role: 'Allocations Officer' },
    ],
  },
  { id: 'INV-023', name: 'Camberwell Allocators', email: 'pe@camberwell-allocators.com', segment: 'Institutional', fund: 'NWGC2',
    contacts: [
      { id: 'INV-023-c1', name: 'Jonas Lindqvist', email: 'j.lindqvist@camberwell-allocators.com', role: 'Senior Allocator' },
    ],
  },
  { id: 'INV-025', name: 'Saint-Gaudens Endowment', email: 'investments@stgaudens-endowment.org', segment: 'Institutional', fund: 'AIP1',
    contacts: [
      { id: 'INV-025-c1', name: 'Eleanor Voss', email: 'e.voss@stgaudens-endowment.org', role: 'Director of Investments' },
    ],
  },
  // Family Offices
  { id: 'INV-002', name: 'Brunswick Family Office', email: 'office@brunswick-fo.com', segment: 'Family Office', fund: 'AIP1',
    contacts: [
      { id: 'INV-002-c1', name: 'William Brunswick', email: 'w.brunswick@brunswick-fo.com', role: 'Principal' },
      { id: 'INV-002-c2', name: 'Hugo Caron', email: 'h.caron@brunswick-fo.com', role: 'Head of Investments' },
    ],
  },
  { id: 'INV-005', name: 'Everstone Family Trust', email: 'trust@everstone-family.com', segment: 'Family Office', fund: 'NWGC2',
    contacts: [
      { id: 'INV-005-c1', name: 'Vivienne Everstone', email: 'v.everstone@everstone-family.com', role: 'Trustee' },
    ],
  },
  { id: 'INV-013', name: 'Marston Family Office', email: 'office@marston-fo.eu', segment: 'Family Office', fund: 'NWGC2',
    contacts: [
      { id: 'INV-013-c1', name: 'Antoine Marston', email: 'a.marston@marston-fo.eu', role: 'Principal' },
    ],
  },
  { id: 'INV-015', name: 'Pemberton House', email: 'allocations@pemberton-house.com', segment: 'Family Office', fund: 'NWGC2',
    contacts: [
      { id: 'INV-015-c1', name: 'Charlotte Pemberton', email: 'c.pemberton@pemberton-house.com', role: 'Head of Allocations' },
    ],
  },
  { id: 'INV-016', name: 'Rosendale Wealth Office', email: 'office@rosendale-wo.com', segment: 'Family Office', fund: 'AIP1',
    contacts: [
      { id: 'INV-016-c1', name: 'Sebastian Rosendale', email: 's.rosendale@rosendale-wo.com', role: 'Principal' },
    ],
  },
  { id: 'INV-026', name: 'Avalon Heritage Trust', email: 'trust@avalon-heritage.com', segment: 'Family Office', fund: 'NWGC2',
    contacts: [
      { id: 'INV-026-c1', name: 'Iris Avalon', email: 'i.avalon@avalon-heritage.com', role: 'Trustee' },
    ],
  },
  { id: 'INV-028', name: 'Stenmark Capital', email: 'office@stenmark-capital.se', segment: 'Family Office', fund: 'AIP1',
    contacts: [
      { id: 'INV-028-c1', name: 'Annika Stenmark', email: 'a.stenmark@stenmark-capital.se', role: 'Principal' },
    ],
  },
  // HNWI / UHNWI
  { id: 'INV-007', name: 'Greycliff Wealth Partners', email: 'partners@greycliff.io', segment: 'HNWI', fund: 'NWGC2',
    contacts: [
      { id: 'INV-007-c1', name: 'Theodore Greycliff', email: 't.greycliff@greycliff.io', role: 'Managing Partner' },
    ],
  },
  { id: 'INV-009', name: 'Ibex Mountain Holdings', email: 'mailbox@ibex-mountain.com', segment: 'UHNWI', fund: 'AIP1',
    contacts: [
      { id: 'INV-009-c1', name: 'Mateo Lambert', email: 'm.lambert@ibex-mountain.com', role: 'Investment Lead' },
    ],
  },
  { id: 'INV-020', name: 'Westbrook Investments', email: 'office@westbrook-investments.com', segment: 'UHNWI', fund: 'NWGC2',
    contacts: [
      { id: 'INV-020-c1', name: 'Jessica Westbrook', email: 'j.westbrook@westbrook-investments.com', role: 'Family Principal' },
    ],
  },
  { id: 'INV-027', name: 'Carrington Private Wealth', email: 'wealth@carrington-pw.com', segment: 'HNWI', fund: 'NWGC2',
    contacts: [
      { id: 'INV-027-c1', name: 'Beatrice Carrington', email: 'b.carrington@carrington-pw.com', role: 'Director' },
    ],
  },
  { id: 'INV-033', name: 'Linden Holdings', email: 'office@linden-holdings.lu', segment: 'UHNWI', fund: 'AIP1',
    contacts: [
      { id: 'INV-033-c1', name: 'Mathieu Linden', email: 'm.linden@linden-holdings.lu', role: 'Family Principal' },
    ],
  },
];

// Maps fund codes to display labels. NWGC2 / AIP1 are the canonical funds
// shared with `gedFixtures.ts`. The legacy keys are kept for backward
// compatibility with components that still hardcode them (FolderDetailPanel,
// AddDocumentDialog, documentMockData) until they are migrated.
export const fundLabelMap: { [key: string]: string } = {
  NWGC2: 'Northwind Growth Capital II',
  AIP1: 'Atlas Infrastructure Partners I',
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
