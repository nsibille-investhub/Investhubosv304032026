// Mock data pour les investisseurs et leurs contacts qui peuvent voir la Data Room

export interface Viewer {
  id: string;
  name: string;
  email: string;
  type: 'investor' | 'contact';
  investorId?: string; // Pour les contacts, référence à l'investisseur parent
  company?: string;
  role?: string;
  avatar?: string;
  // Permissions - quels dossiers/documents ce viewer peut voir
  allowedFolders: string[]; // IDs des dossiers accessibles
  allowedDocuments: string[]; // IDs des documents spécifiques accessibles
}

export const mockViewers: Viewer[] = [
  // Investisseurs
  {
    id: 'inv-1',
    name: 'Sophie Martin',
    email: 'sophie.martin@alphaventures.com',
    type: 'investor',
    company: 'Alpha Ventures',
    role: 'General Partner',
    avatar: 'SM',
    allowedFolders: ['cat-1', 'cat-1-1', 'cat-1-2'], // PERE 1, Comités consultatifs, 2024-11-27
    allowedDocuments: []
  },
  {
    id: 'inv-2',
    name: 'Thomas Dubois',
    email: 'thomas.dubois@betalp.fr',
    type: 'investor',
    company: 'Beta LP',
    role: 'Managing Director',
    avatar: 'TD',
    allowedFolders: ['cat-1', 'cat-pere2'], // PERE 1 et PERE 2
    allowedDocuments: []
  },
  {
    id: 'inv-3',
    name: 'Claire Rousseau',
    email: 'claire.rousseau@gammapartners.com',
    type: 'investor',
    company: 'Gamma Partners',
    role: 'Investment Manager',
    avatar: 'CR',
    allowedFolders: ['cat-1', 'cat-1-1'], // PERE 1 et Comités consultatifs
    allowedDocuments: []
  },
  {
    id: 'inv-4',
    name: 'Marc Lefebvre',
    email: 'marc.lefebvre@deltacapital.fr',
    type: 'investor',
    company: 'Delta Capital',
    role: 'Senior Partner',
    avatar: 'ML',
    allowedFolders: ['cat-1', 'cat-1-1', 'cat-1-2', 'cat-pere2'], // Tout
    allowedDocuments: []
  },
  {
    id: 'inv-5',
    name: 'Isabelle Moreau',
    email: 'isabelle.moreau@epsiloninvest.com',
    type: 'investor',
    company: 'Epsilon Invest',
    role: 'Partner',
    avatar: 'IM',
    allowedFolders: ['cat-1'], // Seulement PERE 1
    allowedDocuments: []
  },
  
  // Contacts de Sophie Martin (Alpha Ventures)
  {
    id: 'contact-1',
    name: 'Jean Durand',
    email: 'jean.durand@alphaventures.com',
    type: 'contact',
    investorId: 'inv-1',
    company: 'Alpha Ventures',
    role: 'Analyst',
    avatar: 'JD',
    allowedFolders: ['cat-1', 'cat-1-1'], // PERE 1 et Comités consultatifs
    allowedDocuments: []
  },
  {
    id: 'contact-2',
    name: 'Marie Lambert',
    email: 'marie.lambert@alphaventures.com',
    type: 'contact',
    investorId: 'inv-1',
    company: 'Alpha Ventures',
    role: 'Associate',
    avatar: 'ML',
    allowedFolders: ['cat-1'], // Seulement PERE 1
    allowedDocuments: []
  },
  
  // Contacts de Thomas Dubois (Beta LP)
  {
    id: 'contact-3',
    name: 'Pierre Blanc',
    email: 'pierre.blanc@betalp.fr',
    type: 'contact',
    investorId: 'inv-2',
    company: 'Beta LP',
    role: 'Legal Counsel',
    avatar: 'PB',
    allowedFolders: ['cat-pere2'], // Seulement PERE 2
    allowedDocuments: []
  },
  {
    id: 'contact-4',
    name: 'Camille Petit',
    email: 'camille.petit@betalp.fr',
    type: 'contact',
    investorId: 'inv-2',
    company: 'Beta LP',
    role: 'Financial Analyst',
    avatar: 'CP',
    allowedFolders: ['cat-1', 'cat-pere2'], // PERE 1 et PERE 2
    allowedDocuments: []
  },
  
  // Contacts de Claire Rousseau (Gamma Partners)
  {
    id: 'contact-5',
    name: 'Lucas Bernard',
    email: 'lucas.bernard@gammapartners.com',
    type: 'contact',
    investorId: 'inv-3',
    company: 'Gamma Partners',
    role: 'Junior Analyst',
    avatar: 'LB',
    allowedFolders: ['cat-1'], // Seulement PERE 1
    allowedDocuments: []
  },
  {
    id: 'contact-6',
    name: 'Emma Roux',
    email: 'emma.roux@gammapartners.com',
    type: 'contact',
    investorId: 'inv-3',
    company: 'Gamma Partners',
    role: 'Operations Manager',
    avatar: 'ER',
    allowedFolders: ['cat-1-1'], // Seulement Comités consultatifs
    allowedDocuments: []
  },
  
  // Contacts de Marc Lefebvre (Delta Capital)
  {
    id: 'contact-7',
    name: 'Antoine Girard',
    email: 'antoine.girard@deltacapital.fr',
    type: 'contact',
    investorId: 'inv-4',
    company: 'Delta Capital',
    role: 'Vice President',
    avatar: 'AG',
    allowedFolders: ['cat-1', 'cat-1-1', 'cat-1-2'], // PERE 1 complet
    allowedDocuments: []
  },
  {
    id: 'contact-8',
    name: 'Léa Fournier',
    email: 'lea.fournier@deltacapital.fr',
    type: 'contact',
    investorId: 'inv-4',
    company: 'Delta Capital',
    role: 'Compliance Officer',
    avatar: 'LF',
    allowedFolders: ['cat-pere2'], // Seulement PERE 2
    allowedDocuments: []
  },
];

// Helper function pour récupérer un viewer par ID
export const getViewerById = (id: string): Viewer | undefined => {
  return mockViewers.find(v => v.id === id);
};

// Helper function pour récupérer tous les investisseurs
export const getInvestors = (): Viewer[] => {
  return mockViewers.filter(v => v.type === 'investor');
};

// Helper function pour récupérer les contacts d'un investisseur
export const getContactsForInvestor = (investorId: string): Viewer[] => {
  return mockViewers.filter(v => v.type === 'contact' && v.investorId === investorId);
};

// Helper function pour vérifier si un viewer peut accéder à un dossier
export const canViewFolder = (viewer: Viewer, folderId: string): boolean => {
  return viewer.allowedFolders.includes(folderId);
};

// Helper function pour vérifier si un viewer peut accéder à un document
export const canViewDocument = (viewer: Viewer, documentId: string, folderIds: string[]): boolean => {
  // Le viewer peut voir le document s'il peut voir au moins un des dossiers parents
  return folderIds.some(folderId => viewer.allowedFolders.includes(folderId));
};
