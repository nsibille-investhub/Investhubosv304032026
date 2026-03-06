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

export const availableInvestors: Investor[] = [
  { 
    id: 'inv-1', 
    name: 'Jean Dupont', 
    email: 'jean.dupont@example.com',
    segment: 'Investisseurs Qualifiés',
    fund: 'pere1',
    contacts: [
      { id: 'c1-1', name: 'Maître Leblanc', email: 'leblanc@legal.com', role: 'Conseil Juridique' },
      { id: 'c1-2', name: 'Antoine Mercier', email: 'mercier@audit.fr', role: 'Expert Comptable' },
    ]
  },
  { 
    id: 'inv-2', 
    name: 'Marie Martin', 
    email: 'marie.martin@example.com',
    segment: 'Family Offices',
    fund: 'pere1',
    contacts: [
      { id: 'c2-1', name: 'Claire Dubois', email: 'claire@family-office.com', role: 'Family Office' },
      { id: 'c2-2', name: 'Jean Rousseau', email: 'rousseau@fiscalite.fr', role: 'Conseil Fiscal' },
      { id: 'c2-3', name: 'Marc Vincent', email: 'vincent@patrimoine.fr', role: 'Gestionnaire de Patrimoine' },
    ]
  },
  { 
    id: 'inv-3', 
    name: 'Pierre Durand', 
    email: 'pierre.durand@example.com',
    segment: 'Comité Stratégique',
    fund: 'pere2',
    contacts: [
      { id: 'c3-1', name: 'Sophie Lambert', email: 'lambert@legal.com', role: 'Représentant Légal' },
    ]
  },
  { 
    id: 'inv-4', 
    name: 'Sophie Bernard', 
    email: 'sophie.bernard@example.com',
    segment: 'Institutionnels',
    fund: 'fund-a',
    contacts: [
      { id: 'c4-1', name: 'Paul Girard', email: 'girard@bank.fr', role: 'Partenaire Bancaire' },
      { id: 'c4-2', name: 'Lucie Fontaine', email: 'fontaine@compliance.com', role: 'Compliance Officer' },
      { id: 'c4-3', name: 'Michel Roux', email: 'roux@trust.com', role: 'Trustee' },
    ]
  },
  { 
    id: 'inv-5', 
    name: 'Thomas Petit', 
    email: 'thomas.petit@example.com',
    segment: 'HNWI (High Net Worth)',
    fund: 'fund-b',
    contacts: [
      { id: 'c5-1', name: 'Émilie Moreau', email: 'moreau@wealth.com', role: 'Gestionnaire de Patrimoine' },
      { id: 'c5-2', name: 'David Laurent', email: 'laurent@legal.fr', role: 'Conseil Juridique' },
    ]
  },
  { 
    id: 'inv-6', 
    name: 'Julie Dubois', 
    email: 'julie.dubois@example.com',
    segment: 'Corporate Investors',
    fund: 'pere1',
    contacts: [
      { id: 'c6-1', name: 'François Petit', email: 'petit@corporate.com', role: 'Administrateur' },
      { id: 'c6-2', name: 'Isabelle Blanc', email: 'blanc@audit.com', role: 'Auditeur' },
    ]
  },
  { 
    id: 'inv-7', 
    name: 'Charles de Montfort', 
    email: 'charles.montfort@example.com',
    segment: 'HNWI (High Net Worth)',
    fund: 'pere1',
    contacts: [
      { id: 'c7-1', name: 'Valérie Deschamps', email: 'deschamps@wealth.fr', role: 'Gestionnaire de Patrimoine' },
      { id: 'c7-2', name: 'Philippe Arnaud', email: 'arnaud@fiscal.com', role: 'Conseil Fiscal' },
      { id: 'c7-3', name: 'Sandrine Roussel', email: 'roussel@legal.fr', role: 'Conseil Juridique' },
    ]
  },
  { 
    id: 'inv-8', 
    name: 'Alpha Investment Partners', 
    email: 'contact@alpha-investments.com',
    segment: 'HNWI (High Net Worth)',
    fund: 'pere2',
    contacts: [
      { id: 'c8-1', name: 'David Richardson', email: 'drichardson@alpha-investments.com', role: 'Managing Partner' },
      { id: 'c8-2', name: 'Sarah Mitchell', email: 'smitchell@alpha-investments.com', role: 'Investment Director' },
      { id: 'c8-3', name: 'Thomas Chen', email: 'tchen@alpha-investments.com', role: 'Legal Counsel' },
    ]
  },
  { 
    id: 'inv-8b', 
    name: 'Nathalie Beaumont', 
    email: 'nathalie.beaumont@example.com',
    segment: 'HNWI (High Net Worth)',
    fund: 'pere2',
    contacts: [
      { id: 'c8b-1', name: 'Olivier Blanchard', email: 'blanchard@family-office.com', role: 'Family Office' },
      { id: 'c8b-2', name: 'Caroline Mercier', email: 'mercier@patrimoine.com', role: 'Gestionnaire de Patrimoine' },
    ]
  },
  { 
    id: 'inv-9', 
    name: 'Alexandre Fontaine', 
    email: 'alexandre.fontaine@example.com',
    segment: 'HNWI (High Net Worth)',
    fund: 'fund-a',
    contacts: [
      { id: 'c9-1', name: 'Martine Leroy', email: 'leroy@trust.com', role: 'Trustee' },
      { id: 'c9-2', name: 'Laurent Gauthier', email: 'gauthier@legal.fr', role: 'Conseil Juridique' },
      { id: 'c9-3', name: 'Sylvie Renard', email: 'renard@compliance.com', role: 'Compliance Officer' },
    ]
  },
  { 
    id: 'inv-10', 
    name: 'Pension Fund Aquitaine', 
    email: 'contact@pension-aquitaine.fr',
    segment: 'Institutional',
    fund: 'fund-a',
    contacts: [
      { id: 'c10-1', name: 'Jacques Petit', email: 'petit@pension.fr', role: 'Fund Manager' },
      { id: 'c10-2', name: 'Anne Duval', email: 'duval@pension.fr', role: 'Investment Officer' },
    ]
  },
  { 
    id: 'inv-11', 
    name: 'Institutional Investors Group', 
    email: 'contact@iig.com',
    segment: 'Institutional',
    fund: 'pere1',
    contacts: [
      { id: 'c11-1', name: 'Robert Chen', email: 'chen@iig.com', role: 'Director' },
    ]
  },
  { 
    id: 'inv-12', 
    name: 'John Smith (Retail)', 
    email: 'john.smith@gmail.com',
    segment: 'Retail',
    fund: 'pere1',
    contacts: [
      { id: 'c12-1', name: 'John Smith', email: 'john.smith@gmail.com', role: 'Investisseur' },
    ]
  },
  { 
    id: 'inv-13', 
    name: 'Marie Rousseau (Retail)', 
    email: 'marie.rousseau@gmail.com',
    segment: 'Retail',
    fund: 'fund-b',
    contacts: [
      { id: 'c13-1', name: 'Marie Rousseau', email: 'marie.rousseau@gmail.com', role: 'Investisseur' },
    ]
  },
];

export const fundLabelMap: { [key: string]: string } = {
  'pere1': 'PERE 1',
  'pere2': 'PERE 2',
  'fund-a': 'Fonds A - Innovation',
  'fund-b': 'Fonds B - Tech',
};

export const availableSegments = [
  'Investisseurs Qualifiés',
  'Comité Stratégique',
  'Family Offices',
  'Institutionnels',
  'Institutional', // Anglais pour tester les conflits
  'Retail', // Pour tester les conflits
  'Particuliers',
  'Corporate Investors',
  'HNWI (High Net Worth)',
  'Distributeurs Partenaires'
];
