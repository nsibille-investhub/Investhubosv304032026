import {
  countDocuments,
  countFolders,
  findFund,
  getSpaces,
} from './gedFixtures';

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
  disclaimer?: {
    enabled: boolean;
    type: 'standard' | 'confidential' | 'restricted';
  };
}

// `userTypes` keeps the legacy French labels because they drive icon /
// section dispatch in DataRoomSpaceSelector and DataRoomSpacesView.
export const mockDataRoomSpaces: DataRoomSpace[] = getSpaces().map((space) => {
  const fund = space.fundCode ? findFund(space.fundCode) : undefined;
  const userTypes =
    space.audience === 'Distributor'
      ? ['Partenaire']
      : space.audience === 'Mixed'
      ? ['Investisseur', 'Partenaire']
      : ['Investisseur'];
  return {
    id: space.id,
    name: space.name,
    targeting: {
      userTypes,
      segments: space.segments ?? [],
      funds: fund ? [fund.name] : [],
    },
    documentCount: countDocuments(space.folders),
    folderCount: countFolders(space.folders),
  };
});
