export type ValidationStatus = 'pending' | 'validated' | 'rejected';

export interface ValidationDocument {
  id: number;
  name: string;
  format: 'pdf' | 'docx' | 'xlsx' | 'pptx';
  size?: string;
  pathSegments: string[];
  createdBy: {
    name: string;
    role: string;
  };
  createdAt: string;
  targeting: string[];
  comment: string;
  status: ValidationStatus;
  reviewedBy?: string;
  reviewedAt?: string;
}

const PENDING: Omit<ValidationDocument, 'id' | 'status'>[] = [
  {
    name: 'Reporting trimestriel Q1 2026 - Fonds Alpha Croissance.pdf',
    format: 'pdf',
    size: '2.4 Mo',
    pathSegments: ['Investisseurs HNWI', 'Reportings', '2026', 'Q1', 'Alpha Croissance'],
    createdBy: { name: 'Camille Renard', role: 'Asset Manager' },
    createdAt: '2026-04-28T09:42:00Z',
    targeting: ['HNWI', 'Alpha Croissance', 'Part A'],
    comment: 'Reporting Q1 prêt à diffuser, à valider avant publication portail LP.',
  },
  {
    name: 'Lettre aux investisseurs - Avril 2026.docx',
    format: 'docx',
    size: '480 Ko',
    pathSegments: ['Communication', 'Lettres trimestrielles', '2026', 'Avril'],
    createdBy: { name: 'Léa Marchand', role: 'IR Manager' },
    createdAt: '2026-04-27T16:08:00Z',
    targeting: ['Tous segments', 'Multi-fonds'],
    comment: 'Relecture juridique requise sur le paragraphe risques marché.',
  },
  {
    name: 'Capital call notice #07 - Beta Infrastructure.pdf',
    format: 'pdf',
    size: '312 Ko',
    pathSegments: [
      'Espace LP - Beta Infrastructure',
      'Souscriptions',
      'BETA-2024-0421',
      'Appels de fonds',
    ],
    createdBy: { name: 'Antoine Leblanc', role: 'Fund Accountant' },
    createdAt: '2026-04-27T11:15:00Z',
    targeting: ['Beta Infrastructure', 'Subscription BETA-2024-0421'],
    comment: 'Montant 1 250 000 € — à valider avant envoi.',
  },
  {
    name: 'Annexes fiscales 2025 - Family Office Dupont.pdf',
    format: 'pdf',
    size: '1.1 Mo',
    pathSegments: [
      'Espace nominatif',
      'Family Office Dupont',
      'Fiscal',
      '2025',
      'IFU et annexes',
    ],
    createdBy: { name: 'Sophie Bernard', role: 'Tax Specialist' },
    createdAt: '2026-04-26T14:22:00Z',
    targeting: ['Family Office Dupont'],
    comment: 'Document nominatif - vérifier identité du destinataire.',
  },
  {
    name: 'Term Sheet - Co-investissement Gamma Healthcare.pdf',
    format: 'pdf',
    size: '890 Ko',
    pathSegments: ['Deals', 'Pipeline 2026', 'Gamma Healthcare', 'Documentation'],
    createdBy: { name: 'Maxime Dubois', role: 'Investment Director' },
    createdAt: '2026-04-25T08:30:00Z',
    targeting: ['UHNWI', 'Institutional', 'Gamma Healthcare'],
    comment: 'Version 3 - intègre les commentaires du comité d\'investissement.',
  },
  {
    name: 'Synthèse performance YTD - Tableau de bord.xlsx',
    format: 'xlsx',
    size: '1.7 Mo',
    pathSegments: ['Reporting interne', 'Performances', '2026', 'YTD'],
    createdBy: { name: 'Julien Moreau', role: 'Performance Analyst' },
    createdAt: '2026-04-24T17:50:00Z',
    targeting: ['Distributeurs', 'Multi-fonds'],
    comment: 'Chiffres consolidés à valider avec le middle-office.',
  },
];

const VALIDATED: Omit<ValidationDocument, 'id' | 'status'>[] = [
  {
    name: 'Reporting annuel 2025 - Fonds Alpha Croissance.pdf',
    format: 'pdf',
    size: '3.8 Mo',
    pathSegments: [
      'Investisseurs HNWI',
      'Reportings',
      '2025',
      'Annuel',
      'Alpha Croissance',
    ],
    createdBy: { name: 'Camille Renard', role: 'Asset Manager' },
    createdAt: '2026-03-12T10:00:00Z',
    targeting: ['HNWI', 'UHNWI', 'Alpha Croissance'],
    comment: 'Rapport annuel — validé par le compliance officer.',
    reviewedBy: 'Hugo Petit',
    reviewedAt: '2026-03-15T09:30:00Z',
  },
  {
    name: 'Note de marché - Tendances Private Equity 2026.pdf',
    format: 'pdf',
    size: '720 Ko',
    pathSegments: ['Communication', 'Notes de marché', '2026', 'PE'],
    createdBy: { name: 'Léa Marchand', role: 'IR Manager' },
    createdAt: '2026-02-20T14:00:00Z',
    targeting: ['Tous segments'],
    comment: '',
    reviewedBy: 'Hugo Petit',
    reviewedAt: '2026-02-21T11:18:00Z',
  },
  {
    name: 'Présentation comité - Roadshow Q2.pptx',
    format: 'pptx',
    size: '5.2 Mo',
    pathSegments: ['Distribution', 'Roadshow', '2026', 'Q2', 'Supports'],
    createdBy: { name: 'Antoine Leblanc', role: 'Distribution Lead' },
    createdAt: '2026-04-10T09:15:00Z',
    targeting: ['Distributeurs', 'Multi-fonds'],
    comment: 'Validé après corrections mineures sur slides 12-14.',
    reviewedBy: 'Sophie Bernard',
    reviewedAt: '2026-04-11T16:42:00Z',
  },
  {
    name: 'Capital call notice #06 - Beta Infrastructure.pdf',
    format: 'pdf',
    size: '298 Ko',
    pathSegments: [
      'Espace LP - Beta Infrastructure',
      'Souscriptions',
      'BETA-2024-0421',
      'Appels de fonds',
    ],
    createdBy: { name: 'Antoine Leblanc', role: 'Fund Accountant' },
    createdAt: '2026-01-18T13:45:00Z',
    targeting: ['Beta Infrastructure'],
    comment: '',
    reviewedBy: 'Hugo Petit',
    reviewedAt: '2026-01-19T08:50:00Z',
  },
];

const REJECTED: Omit<ValidationDocument, 'id' | 'status'>[] = [
  {
    name: 'Communication marketing - Lancement Delta Tech.pptx',
    format: 'pptx',
    size: '4.6 Mo',
    pathSegments: ['Communication', 'Marketing', '2026', 'Lancements', 'Delta Tech'],
    createdBy: { name: 'Mathilde Garcia', role: 'Marketing Manager' },
    createdAt: '2026-04-20T11:30:00Z',
    targeting: ['Distributeurs', 'Retail'],
    comment: 'Refusé : termes promotionnels non conformes au cadre AMF, à reformuler.',
    reviewedBy: 'Hugo Petit',
    reviewedAt: '2026-04-21T10:05:00Z',
  },
  {
    name: 'Avenant convention partenaire - DRAFT.docx',
    format: 'docx',
    size: '210 Ko',
    pathSegments: ['Distribution', 'Partenaires', 'Conventions', '2026'],
    createdBy: { name: 'Julien Moreau', role: 'Legal Counsel' },
    createdAt: '2026-04-15T15:20:00Z',
    targeting: ['Partenaires distributeurs'],
    comment: 'Refusé : version brouillon, manque la grille de rétrocession finalisée.',
    reviewedBy: 'Sophie Bernard',
    reviewedAt: '2026-04-16T09:30:00Z',
  },
];

export function generateValidationDocuments(): ValidationDocument[] {
  let id = 1;
  const build = (
    items: Omit<ValidationDocument, 'id' | 'status'>[],
    status: ValidationStatus,
  ): ValidationDocument[] =>
    items.map((item) => ({ ...item, id: id++, status }));

  return [
    ...build(PENDING, 'pending'),
    ...build(VALIDATED, 'validated'),
    ...build(REJECTED, 'rejected'),
  ];
}
