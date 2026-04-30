export type ValidationStatus = 'pending' | 'validated' | 'rejected';

export type TargetingKind =
  | 'segment'
  | 'fund'
  | 'shareClass'
  | 'investor'
  | 'subscription'
  | 'audience';

export interface TargetingTag {
  kind: TargetingKind;
  label: string;
}

export interface NotificationRecipient {
  name: string;
  email: string;
  role?: string;
}

export type NotificationChannel = 'email' | 'portal' | 'both';

export interface ValidationNotification {
  channel: NotificationChannel;
  subject: string;
  /** Greeting shown before the body. */
  greeting: string;
  /** Body paragraphs (already resolved variables). */
  paragraphs: string[];
  signature: string;
  recipients: NotificationRecipient[];
}

export interface ValidationBatch {
  id: string;
  /** Batch display name — usually the notification subject or a campaign name. */
  name: string;
  /** Human label hint (Reporting trimestriel, Capital call, …). */
  kind: string;
  /** Optional notification — undefined means "silent batch / validation interne". */
  notification?: ValidationNotification;
  createdAt: string;
  createdBy: { name: string; role: string };
}

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
  targeting: TargetingTag[];
  comment: string;
  status: ValidationStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  /** When set, the document is part of a notification batch (atomic validation). */
  batchId?: string;
  /** Standalone documents may carry their own notification (1 doc → 1 notification). Undefined = silent. */
  notification?: ValidationNotification;
}

const seg = (label: string): TargetingTag => ({ kind: 'segment', label });
const fund = (label: string): TargetingTag => ({ kind: 'fund', label });
const share = (label: string): TargetingTag => ({ kind: 'shareClass', label });
const inv = (label: string): TargetingTag => ({ kind: 'investor', label });
const sub = (label: string): TargetingTag => ({ kind: 'subscription', label });
const aud = (label: string): TargetingTag => ({ kind: 'audience', label });

// ---------------------------------------------------------------------------
// Batches
// ---------------------------------------------------------------------------

const BATCHES: ValidationBatch[] = [
  {
    id: 'batch-capital-call-beta-q2',
    name: 'Appel de fonds #07 — Beta Infrastructure',
    kind: 'Capital call',
    createdAt: '2026-04-27T11:15:00Z',
    createdBy: { name: 'Antoine Leblanc', role: 'Fund Accountant' },
    notification: {
      channel: 'both',
      subject: 'Appel de fonds n°7 — Beta Infrastructure (échéance 15 mai 2026)',
      greeting: 'Madame, Monsieur,',
      paragraphs: [
        "Dans le cadre de votre souscription au fonds **Beta Infrastructure** (subscription BETA-2024-0421), nous vous prions de bien vouloir trouver ci-joint l'appel de fonds n°7 d'un montant de **1 250 000 €**, à régler avant le **15 mai 2026**.",
        "Vous trouverez en pièces jointes : la lettre d'appel de fonds, l'instruction de virement bancaire, ainsi que la grille de répartition par investisseur.",
        "Pour toute question, votre interlocuteur Investor Relations reste à votre disposition.",
      ],
      signature: 'L\'équipe Investor Relations — InvestHub',
      recipients: [
        { name: 'Family Office Dupont', email: 'office@dupont-family.com', role: 'Investisseur' },
        { name: 'Pension Fund Helios', email: 'lp-relations@helios-pension.eu', role: 'Investisseur' },
        { name: 'Groupe Vauban Capital', email: 'capital@vauban.fr', role: 'Investisseur' },
      ],
    },
  },
  {
    id: 'batch-reporting-q1-alpha',
    name: 'Reporting Q1 2026 — Alpha Croissance',
    kind: 'Reporting trimestriel',
    createdAt: '2026-04-28T09:42:00Z',
    createdBy: { name: 'Camille Renard', role: 'Asset Manager' },
    notification: {
      channel: 'email',
      subject: 'Reporting trimestriel Q1 2026 — Fonds Alpha Croissance',
      greeting: 'Cher investisseur,',
      paragraphs: [
        "Nous avons le plaisir de partager avec vous le **reporting du premier trimestre 2026** du fonds Alpha Croissance.",
        "Au programme : performance vs benchmark, déploiement (3 nouveaux investissements), valorisation NAV au 31/03/2026 et perspectives Q2.",
        "L'annexe ESG et les commentaires de gérant complètent le rapport.",
      ],
      signature: 'Camille Renard — Asset Manager Alpha Croissance',
      recipients: [
        { name: 'Tous les LPs HNWI Alpha', email: 'lp-distribution@investhub.io', role: 'Liste de diffusion' },
      ],
    },
  },
  {
    id: 'batch-annual-letter-2025',
    name: 'Lettre annuelle 2025 — Alpha Croissance',
    kind: 'Communication LP',
    createdAt: '2026-03-12T10:00:00Z',
    createdBy: { name: 'Léa Marchand', role: 'IR Manager' },
    notification: {
      channel: 'portal',
      subject: 'Lettre annuelle 2025 et rapport ESG — Alpha Croissance',
      greeting: 'Chers porteurs,',
      paragraphs: [
        "L'année 2025 a été marquée par une **TRI net de 18,2 %** et le déploiement de 4 nouveaux investissements stratégiques.",
        "Vous trouverez en pièces jointes notre lettre annuelle ainsi que le rapport ESG validé par notre comité indépendant.",
      ],
      signature: 'Léa Marchand — Investor Relations',
      recipients: [
        { name: 'Tous les LPs Alpha Croissance', email: 'portail-lp@investhub.io', role: 'Portail LP' },
      ],
    },
  },
  {
    id: 'batch-convention-massena',
    name: 'Avenant convention 2026 — Masséna Wealth Management',
    kind: 'Convention partenaire (interne)',
    createdAt: '2026-04-15T15:20:00Z',
    createdBy: { name: 'Julien Moreau', role: 'Legal Counsel' },
    // Pas de notification — validation purement interne, le doc reste sur le portail BO
  },
];

// ---------------------------------------------------------------------------
// Documents (some rattachés à un batch via batchId)
// ---------------------------------------------------------------------------

const PENDING: Omit<ValidationDocument, 'id' | 'status'>[] = [
  // ── Batch capital call Beta Infrastructure (3 docs)
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
    targeting: [fund('Beta Infrastructure'), sub('Subscription BETA-2024-0421')],
    comment: 'Montant 1 250 000 € — à valider avant envoi.',
    batchId: 'batch-capital-call-beta-q2',
  },
  {
    name: 'Instructions de virement bancaire - Beta Infrastructure.pdf',
    format: 'pdf',
    size: '128 Ko',
    pathSegments: [
      'Espace LP - Beta Infrastructure',
      'Souscriptions',
      'BETA-2024-0421',
      'Appels de fonds',
    ],
    createdBy: { name: 'Antoine Leblanc', role: 'Fund Accountant' },
    createdAt: '2026-04-27T11:18:00Z',
    targeting: [fund('Beta Infrastructure')],
    comment: '',
    batchId: 'batch-capital-call-beta-q2',
  },
  {
    name: 'Grille de répartition par LP - Capital call #07.xlsx',
    format: 'xlsx',
    size: '92 Ko',
    pathSegments: [
      'Espace LP - Beta Infrastructure',
      'Souscriptions',
      'BETA-2024-0421',
      'Appels de fonds',
    ],
    createdBy: { name: 'Antoine Leblanc', role: 'Fund Accountant' },
    createdAt: '2026-04-27T11:20:00Z',
    targeting: [fund('Beta Infrastructure')],
    comment: 'Vérifier la quote-part Pension Fund Helios.',
    batchId: 'batch-capital-call-beta-q2',
  },

  // ── Batch reporting Q1 Alpha (2 docs)
  {
    name: 'Reporting trimestriel Q1 2026 - Fonds Alpha Croissance.pdf',
    format: 'pdf',
    size: '2.4 Mo',
    pathSegments: ['Investisseurs HNWI', 'Reportings', '2026', 'Q1', 'Alpha Croissance'],
    createdBy: { name: 'Camille Renard', role: 'Asset Manager' },
    createdAt: '2026-04-28T09:42:00Z',
    targeting: [seg('HNWI'), fund('Alpha Croissance'), share('Part A')],
    comment: 'Reporting Q1 prêt à diffuser, à valider avant publication portail LP.',
    batchId: 'batch-reporting-q1-alpha',
  },
  {
    name: 'Annexe ESG Q1 2026 - Alpha Croissance.pdf',
    format: 'pdf',
    size: '780 Ko',
    pathSegments: ['Investisseurs HNWI', 'Reportings', '2026', 'Q1', 'Alpha Croissance'],
    createdBy: { name: 'Camille Renard', role: 'Asset Manager' },
    createdAt: '2026-04-28T09:50:00Z',
    targeting: [seg('HNWI'), fund('Alpha Croissance')],
    comment: '',
    batchId: 'batch-reporting-q1-alpha',
  },

  // ── Batch silencieux : avenant convention Masséna (2 docs)
  {
    name: 'Avenant convention partenaire - Masséna 2026.docx',
    format: 'docx',
    size: '210 Ko',
    pathSegments: ['Distribution', 'Partenaires', 'Conventions', '2026', 'Masséna'],
    createdBy: { name: 'Julien Moreau', role: 'Legal Counsel' },
    createdAt: '2026-04-15T15:20:00Z',
    targeting: [seg('Partenaires distributeurs')],
    comment: 'Validation juridique à finaliser avant signature.',
    batchId: 'batch-convention-massena',
  },
  {
    name: 'Grille de rétrocession Masséna - 2026.xlsx',
    format: 'xlsx',
    size: '88 Ko',
    pathSegments: ['Distribution', 'Partenaires', 'Conventions', '2026', 'Masséna'],
    createdBy: { name: 'Julien Moreau', role: 'Legal Counsel' },
    createdAt: '2026-04-15T15:24:00Z',
    targeting: [seg('Partenaires distributeurs')],
    comment: '',
    batchId: 'batch-convention-massena',
  },

  // ── Documents standalone (non groupés)
  {
    name: 'Lettre aux investisseurs - Avril 2026.docx',
    format: 'docx',
    size: '480 Ko',
    pathSegments: ['Communication', 'Lettres trimestrielles', '2026', 'Avril'],
    createdBy: { name: 'Léa Marchand', role: 'IR Manager' },
    createdAt: '2026-04-27T16:08:00Z',
    targeting: [aud('Tous segments'), aud('Multi-fonds')],
    comment: 'Relecture juridique requise sur le paragraphe risques marché.',
    notification: {
      channel: 'email',
      subject: 'Lettre trimestrielle d\'avril 2026 — InvestHub',
      greeting: 'Chers investisseurs,',
      paragraphs: [
        "Veuillez trouver ci-joint notre **lettre trimestrielle d'avril 2026**, avec un focus sur la conjoncture macro et nos convictions pour le S2 2026.",
      ],
      signature: 'Léa Marchand — Investor Relations',
      recipients: [
        { name: 'Liste de diffusion HNWI', email: 'lp-hnwi@investhub.io', role: 'Liste de diffusion' },
        { name: 'Liste de diffusion Institutional', email: 'lp-instit@investhub.io', role: 'Liste de diffusion' },
        { name: 'Distributeurs partenaires', email: 'partenaires@investhub.io', role: 'Liste de diffusion' },
      ],
    },
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
    targeting: [inv('Family Office Dupont')],
    comment: 'Document nominatif - vérifier identité du destinataire.',
    notification: {
      channel: 'both',
      subject: 'Annexes fiscales 2025 — Family Office Dupont',
      greeting: 'Madame, Monsieur,',
      paragraphs: [
        "Vous trouverez en pièce jointe vos **annexes fiscales 2025** ainsi que les IFU correspondants.",
      ],
      signature: 'Sophie Bernard — Tax Specialist',
      recipients: [
        { name: 'Family Office Dupont', email: 'office@dupont-family.com', role: 'Investisseur' },
      ],
    },
  },
  {
    name: 'Term Sheet - Co-investissement Gamma Healthcare.pdf',
    format: 'pdf',
    size: '890 Ko',
    pathSegments: ['Deals', 'Pipeline 2026', 'Gamma Healthcare', 'Documentation'],
    createdBy: { name: 'Maxime Dubois', role: 'Investment Director' },
    createdAt: '2026-04-25T08:30:00Z',
    targeting: [seg('UHNWI'), seg('Institutional'), fund('Gamma Healthcare')],
    comment: 'Version 3 - intègre les commentaires du comité d\'investissement.',
    notification: {
      channel: 'email',
      subject: 'Opportunité de co-investissement — Gamma Healthcare',
      greeting: 'Chers partenaires,',
      paragraphs: [
        "Nous vous invitons à étudier la **term sheet** du co-investissement Gamma Healthcare (closing visé fin Q3 2026).",
      ],
      signature: 'Maxime Dubois — Investment Director',
      recipients: [
        { name: 'LPs UHNWI sélectionnés', email: 'select-uhnwi@investhub.io', role: 'Liste restreinte' },
        { name: 'Investisseurs institutionnels', email: 'institutional@investhub.io', role: 'Liste restreinte' },
      ],
    },
  },
  {
    name: 'Synthèse performance YTD - Tableau de bord.xlsx',
    format: 'xlsx',
    size: '1.7 Mo',
    pathSegments: ['Reporting interne', 'Performances', '2026', 'YTD'],
    createdBy: { name: 'Julien Moreau', role: 'Performance Analyst' },
    createdAt: '2026-04-24T17:50:00Z',
    targeting: [seg('Distributeurs'), aud('Multi-fonds')],
    comment: 'Chiffres consolidés à valider avec le middle-office.',
    // Pas de notification — usage interne, à publier sur le portail middle-office après validation
  },
];

const VALIDATED: Omit<ValidationDocument, 'id' | 'status'>[] = [
  // ── Batch annuel 2025 Alpha (2 docs validés)
  {
    name: 'Lettre annuelle 2025 - Alpha Croissance.pdf',
    format: 'pdf',
    size: '1.3 Mo',
    pathSegments: ['Communication', 'Lettres annuelles', '2025', 'Alpha Croissance'],
    createdBy: { name: 'Léa Marchand', role: 'IR Manager' },
    createdAt: '2026-03-12T10:00:00Z',
    targeting: [aud('Tous segments'), fund('Alpha Croissance')],
    comment: '',
    reviewedBy: 'Hugo Petit',
    reviewedAt: '2026-03-15T09:30:00Z',
    batchId: 'batch-annual-letter-2025',
  },
  {
    name: 'Rapport ESG 2025 - Alpha Croissance.pdf',
    format: 'pdf',
    size: '4.2 Mo',
    pathSegments: ['Communication', 'ESG', '2025', 'Alpha Croissance'],
    createdBy: { name: 'Léa Marchand', role: 'IR Manager' },
    createdAt: '2026-03-12T10:08:00Z',
    targeting: [aud('Tous segments'), fund('Alpha Croissance')],
    comment: 'Validé par le comité ESG indépendant.',
    reviewedBy: 'Hugo Petit',
    reviewedAt: '2026-03-15T09:30:00Z',
    batchId: 'batch-annual-letter-2025',
  },

  // ── Documents standalone validés
  {
    name: 'Note de marché - Tendances Private Equity 2026.pdf',
    format: 'pdf',
    size: '720 Ko',
    pathSegments: ['Communication', 'Notes de marché', '2026', 'PE'],
    createdBy: { name: 'Léa Marchand', role: 'IR Manager' },
    createdAt: '2026-02-20T14:00:00Z',
    targeting: [aud('Tous segments')],
    comment: '',
    reviewedBy: 'Hugo Petit',
    reviewedAt: '2026-02-21T11:18:00Z',
    notification: {
      channel: 'portal',
      subject: 'Note de marché — Tendances Private Equity 2026',
      greeting: 'Chers investisseurs,',
      paragraphs: [
        "Notre dernière **note de marché** est disponible sur votre portail LP.",
      ],
      signature: 'Léa Marchand — Investor Relations',
      recipients: [
        { name: 'Tous les LPs InvestHub', email: 'portail-lp@investhub.io', role: 'Portail LP' },
      ],
    },
  },
  {
    name: 'Présentation comité - Roadshow Q2.pptx',
    format: 'pptx',
    size: '5.2 Mo',
    pathSegments: ['Distribution', 'Roadshow', '2026', 'Q2', 'Supports'],
    createdBy: { name: 'Antoine Leblanc', role: 'Distribution Lead' },
    createdAt: '2026-04-10T09:15:00Z',
    targeting: [seg('Distributeurs'), aud('Multi-fonds')],
    comment: 'Validé après corrections mineures sur slides 12-14.',
    reviewedBy: 'Sophie Bernard',
    reviewedAt: '2026-04-11T16:42:00Z',
    // Pas de notification — support de roadshow, partagé en main propre
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
    targeting: [seg('Distributeurs'), seg('Retail')],
    comment: 'Refusé : termes promotionnels non conformes au cadre AMF, à reformuler.',
    reviewedBy: 'Hugo Petit',
    reviewedAt: '2026-04-21T10:05:00Z',
    notification: {
      channel: 'email',
      subject: '[Refusé] Lancement Delta Tech — communication marketing',
      greeting: 'Chers partenaires,',
      paragraphs: [
        "Découvrez la nouvelle opportunité **Delta Tech** dans notre dossier de présentation.",
      ],
      signature: 'Mathilde Garcia — Marketing Manager',
      recipients: [
        { name: 'Réseau distributeurs Retail', email: 'retail-network@investhub.io', role: 'Distributeurs' },
      ],
    },
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

export function getValidationBatches(): ValidationBatch[] {
  return BATCHES;
}
