export interface SpaceTargeting {
  userTypes: string[];
  segments: string[];
  funds: string[];
}

export interface DataRoomSpace {
  id: string;
  name: string;
  targeting: SpaceTargeting;
  documentCount: number;
  folderCount: number;
}

export const mockDataRoomSpaces: DataRoomSpace[] = [
  {
    id: 'space-1',
    name: 'Investisseurs LP',
    targeting: {
      userTypes: ['Investisseur'],
      segments: [],
      funds: []
    },
    documentCount: 127,
    folderCount: 18
  },
  {
    id: 'space-2',
    name: 'VENTECH I - LP Documents',
    targeting: {
      userTypes: ['Investisseur'],
      segments: [],
      funds: ['VENTECH I']
    },
    documentCount: 45,
    folderCount: 8
  },
  {
    id: 'space-3',
    name: 'VENTECH II - Rapports Trimestriels',
    targeting: {
      userTypes: ['Investisseur'],
      segments: ['HNWI'],
      funds: ['VENTECH II']
    },
    documentCount: 38,
    folderCount: 6
  },
  {
    id: 'space-4',
    name: 'KORELYA I - Due Diligence',
    targeting: {
      userTypes: ['Partenaire'],
      segments: [],
      funds: ['KORELYA I']
    },
    documentCount: 92,
    folderCount: 15
  },
  {
    id: 'space-5',
    name: 'Participations Portfolio',
    targeting: {
      userTypes: ['Participation'],
      segments: [],
      funds: ['VENTECH I']
    },
    documentCount: 134,
    folderCount: 22
  },
  {
    id: 'space-6',
    name: 'ARDIAN GROWTH - Investisseurs',
    targeting: {
      userTypes: ['Investisseur'],
      segments: ['Institutional'],
      funds: ['ARDIAN GROWTH']
    },
    documentCount: 67,
    folderCount: 11
  },
  {
    id: 'space-7',
    name: 'Partenaires Services',
    targeting: {
      userTypes: ['Partenaire'],
      segments: [],
      funds: []
    },
    documentCount: 54,
    folderCount: 8
  },
  {
    id: 'space-8',
    name: 'Multi-Fonds HNWI',
    targeting: {
      userTypes: ['Investisseur'],
      segments: ['HNWI', 'UHNWI'],
      funds: ['VENTECH II']
    },
    documentCount: 156,
    folderCount: 24
  }
];
