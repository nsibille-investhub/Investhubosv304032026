// Générateur de dossiers KYC pour InvestHub

export type KYCRisk = 'Bloqué' | 'Élevé' | 'Moyen' | 'Faible';

export type KYCThirdPartyRole = 'Représentant' | 'Entreprise' | 'UBO';

export interface KYCThirdParty {
  id: string;
  fullName: string;
  role: KYCThirdPartyRole;
  type: 'Personne morale' | 'Personne physique';
  risk: KYCRisk;
  keyInfo: string;
}

export interface KYCFile {
  id: number;
  uid: string;
  status: 'Rejeté' | 'Brouillon' | 'Ouvert' | 'Approuvé';
  nextReview: { text: string; timestamp: number } | null;
  name: string;
  entityType: 'Investisseur' | 'Partenaire' | 'Participation';
  type: 'Personne morale' | 'Personne physique';
  progress: {
    status: 'En révision' | 'En collecte' | 'Recollecte' | 'Finalisation';
    percentage: number;
  };
  risk: KYCRisk | null;
  onboarding: 'KYC Simplifié' | 'KYC Standard' | 'KYC Renforcé';
  tags: string[];
  assignee: {
    name: string;
    avatar: string;
    initials: string;
  } | null;
  lastActivity: {
    text: string;
    timestamp: number;
  };
  thirdParties: KYCThirdParty[];
}

const investorsCorporate = [
  'VENTECH', 'KORELYA CAPITAL', 'HIGHLAND EUROPE', 'ACCEL PARTNERS', 'INDEX VENTURES',
  'BALDERTON CAPITAL', 'ATOMICO', 'NORTHZONE', 'CREANDUM', 'PARTECH',
  'IDINVEST PARTNERS', 'EURAZEO', 'IRIS CAPITAL', 'KERNEL INVESTMENTS'
];

const investorsIndividual = [
  'Jean Dault', 'Sophie Martin', 'Marc Dubois', 'Claire Rousseau', 'Thomas Bernard',
  'Emma Leroy', 'Pierre Moreau', 'Julie Fontaine', 'Maxime Petit', 'Céline Garnier'
];

const partnersCorporate = [
  'DELOITTE ADVISORY', 'PWC CONSULTING', 'EY PARTHENON', 'KPMG ADVISORY',
  'BNP PARIBAS', 'SOCIÉTÉ GÉNÉRALE', 'CRÉDIT AGRICOLE', 'NATIXIS',
  'LEMONWAY', 'MANGOPAY', 'STRIPE TREASURY'
];

const partnersIndividual = [
  'Romain Minaud', 'Anne-Sophie Ter Sakarian', 'Tom Chadwick', 'Maxime Pariaux',
  'Julie Martin', 'Pierre Dubois', 'Sophie Bernard'
];

const participationsCorporate = [
  'DATADOG', 'MIRAKL', 'CONTENTSQUARE', 'VESTIAIRE COLLECTIVE',
  'SHIFT TECHNOLOGY', 'ALAN', 'QONTO', 'LEDGER', 'LYDIA', 'EXOTEC',
  'DOCTOLIB', 'BLABLACAR', 'PAYFIT', 'SWILE', 'MANO MANO'
];

const participationsIndividual = [
  'Alexandre Prot', 'Steve Anavi', 'Olivier Pomel', 'Stanislas Niox-Château',
  'Guillaume Princen', 'Jean-Charles Samuelian', 'Pascal Gauthier'
];

const thirdPartyIndividualNames = [
  'Marie Bernard', 'Lucas Lefèvre', 'Camille Dupont', 'Antoine Garnier',
  'Léa Robin', 'Hugo Blanchard', 'Inès Mercier', 'Nathan Faure',
  'Chloé Renard', 'Adrien Carpentier', 'Sarah Lambert', 'Victor Roussel',
  'Manon Aubert', 'Raphaël Marchal', 'Elise Vidal', 'Quentin Noël'
];

const thirdPartyCorporateNames = [
  'HOLDING ALPHA SAS', 'INVEST GROUP SARL', 'CAPITAL HOLDINGS',
  'MERIDIAN PARTNERS', 'FINANCIÈRE BÉTA', 'GROUPE OMÉGA',
  'AURORA HOLDINGS', 'PRIMA INVEST', 'NORDIQUE SAS', 'AXIO CAPITAL'
];

const tagOptions = [
  'Démo', 'LP', 'Actif', 'EDD', 'Déclaration 4', 'Prioritaire',
  'Urgent', 'Révision requise', 'Compliance', 'Juridique'
];

const assignees = [
  { name: 'Anne-Sophie Ter Sakarian', initials: 'AS', avatar: '' },
  { name: 'Romain Minaud', initials: 'RM', avatar: '' },
  { name: 'Tom Chadwick', initials: 'TC', avatar: '' },
  { name: 'Maxime Pariaux', initials: 'MP', avatar: '' },
  { name: 'Julie Martin', initials: 'JM', avatar: '' },
  { name: 'Pierre Dubois', initials: 'PD', avatar: '' },
  { name: 'Sophie Bernard', initials: 'SB', avatar: '' },
];

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateUniqueId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const FR_MONTHS_SHORT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

function formatReviewDate(date: Date): string {
  return `${date.getDate()} ${FR_MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function generateNextReviewDate(status: string): { text: string; timestamp: number } | null {
  if (status === 'Brouillon' || status === 'Rejeté') return null;

  // Bucket distribution targeted at making the review-window cards meaningful.
  const r = Math.random();
  let offsetDays: number;
  if (status === 'Ouvert') {
    if (r < 0.1) offsetDays = -randomNumber(1, 20);            // 10% overdue
    else if (r < 0.25) offsetDays = randomNumber(0, 7);        // 15% within 1w
    else if (r < 0.55) offsetDays = randomNumber(8, 30);       // 30% within 1m
    else if (r < 0.8) offsetDays = randomNumber(31, 90);       // 25% within 3m
    else offsetDays = randomNumber(91, 180);                   // 20% within 6m
  } else if (status === 'Approuvé') {
    if (r < 0.05) offsetDays = -randomNumber(1, 30);           // 5% overdue
    else if (r < 0.1) offsetDays = randomNumber(0, 30);        // 5% within 1m
    else if (r < 0.25) offsetDays = randomNumber(31, 90);      // 15% within 3m
    else if (r < 0.5) offsetDays = randomNumber(91, 180);      // 25% within 6m
    else offsetDays = randomNumber(181, 730);                  // 50% later
  } else {
    return null;
  }

  const ts = Date.now() + offsetDays * DAY_MS;
  return { text: formatReviewDate(new Date(ts)), timestamp: ts };
}

function generateLastActivity(): { text: string; timestamp: number } {
  const now = Date.now();
  const activities = [
    { text: 'il y a 1 heure', hours: 1 },
    { text: 'il y a 13 jours', hours: 13 * 24 },
    { text: 'il y a 27 jours', hours: 27 * 24 },
    { text: 'il y a 29 jours', hours: 29 * 24 },
    { text: 'il y a 3 mois', hours: 90 * 24 },
    { text: 'il y a 5 mois', hours: 150 * 24 },
    { text: 'il y a 1 an', hours: 365 * 24 },
  ];

  const activity = randomElement(activities);
  return {
    text: activity.text,
    timestamp: now - activity.hours * 60 * 60 * 1000,
  };
}

function getOnboardingFromRisk(risk: KYCRisk | null): KYCFile['onboarding'] {
  if (risk === 'Bloqué' || risk === 'Élevé') return 'KYC Renforcé';
  if (risk === 'Faible') return 'KYC Simplifié';
  return 'KYC Standard';
}

const REPRESENTATIVE_TITLES = [
  'Président', 'Directeur Général', 'Mandataire social',
  'Représentant légal', 'Gérant', 'Co-fondateur',
];

const UBO_DETAILS = [
  '52% des parts', '34% des parts', '25% des parts',
  '18% des parts', '60% des parts', '11% des parts',
];

const COMPANY_DETAILS = [
  'SAS française', 'SARL française', 'Holding luxembourgeoise',
  'Société de gestion régulée AMF', 'Filiale 100% détenue',
  'Joint-venture',
];

function generateThirdParty(
  role: KYCThirdPartyRole,
  fileRisk: KYCRisk | null,
): KYCThirdParty {
  const isCorporate = role === 'Entreprise';
  const fullName = isCorporate
    ? randomElement(thirdPartyCorporateNames)
    : randomElement(thirdPartyIndividualNames);

  const riskPool: KYCRisk[] = (() => {
    if (fileRisk === 'Bloqué') return ['Bloqué', 'Élevé', 'Élevé', 'Moyen'];
    if (fileRisk === 'Élevé') return ['Élevé', 'Élevé', 'Moyen', 'Faible'];
    if (fileRisk === 'Moyen') return ['Moyen', 'Moyen', 'Faible', 'Élevé'];
    if (fileRisk === 'Faible') return ['Faible', 'Faible', 'Moyen'];
    return ['Faible', 'Moyen'];
  })();

  let keyInfo: string;
  if (role === 'Représentant') {
    keyInfo = randomElement(REPRESENTATIVE_TITLES);
  } else if (role === 'UBO') {
    keyInfo = randomElement(UBO_DETAILS);
  } else {
    keyInfo = randomElement(COMPANY_DETAILS);
  }

  return {
    id: generateUniqueId(),
    fullName,
    role,
    type: isCorporate ? 'Personne morale' : 'Personne physique',
    risk: randomElement(riskPool),
    keyInfo,
  };
}

function generateThirdParties(
  fileType: KYCFile['type'],
  fileRisk: KYCRisk | null,
): KYCThirdParty[] {
  const parties: KYCThirdParty[] = [];

  if (fileType === 'Personne morale') {
    const repCount = randomNumber(1, 2);
    for (let i = 0; i < repCount; i++) parties.push(generateThirdParty('Représentant', fileRisk));

    const uboCount = randomNumber(1, 3);
    for (let i = 0; i < uboCount; i++) parties.push(generateThirdParty('UBO', fileRisk));

    if (Math.random() > 0.4) {
      const companyCount = randomNumber(1, 2);
      for (let i = 0; i < companyCount; i++) parties.push(generateThirdParty('Entreprise', fileRisk));
    }
  } else {
    if (Math.random() > 0.5) {
      parties.push(generateThirdParty('Représentant', fileRisk));
    }
    if (Math.random() > 0.7) {
      parties.push(generateThirdParty('Entreprise', fileRisk));
    }
  }

  return parties;
}

export function generateKYCFiles(count: number = 100): KYCFile[] {
  const files: KYCFile[] = [];
  const statuses: KYCFile['status'][] = ['Rejeté', 'Brouillon', 'Ouvert', 'Approuvé'];

  for (let i = 0; i < count; i++) {
    const status = randomElement(statuses);
    const entityType = randomElement(['Investisseur', 'Partenaire', 'Participation'] as const);

    let entityName = '';
    let entityTypePerson: KYCFile['type'] = 'Personne morale';
    if (entityType === 'Investisseur') {
      if (Math.random() > 0.5) {
        entityName = randomElement(investorsCorporate);
      } else {
        entityName = randomElement(investorsIndividual);
        entityTypePerson = 'Personne physique';
      }
    } else if (entityType === 'Partenaire') {
      if (Math.random() > 0.5) {
        entityName = randomElement(partnersCorporate);
      } else {
        entityName = randomElement(partnersIndividual);
        entityTypePerson = 'Personne physique';
      }
    } else {
      if (Math.random() > 0.5) {
        entityName = randomElement(participationsCorporate);
      } else {
        entityName = randomElement(participationsIndividual);
        entityTypePerson = 'Personne physique';
      }
    }

    const name = `KYB - ${entityName}`;
    const nextReview = generateNextReviewDate(status);

    let progressStatus: KYCFile['progress']['status'] = 'En révision';
    let progressPercentage = 0;

    if (status === 'Ouvert' || status === 'Brouillon') {
      progressStatus = randomElement(['En révision', 'En collecte', 'Recollecte']);
      progressPercentage = randomNumber(10, 85);
    } else if (status === 'Approuvé') {
      progressStatus = randomElement(['Finalisation', 'En révision']);
      progressPercentage = 100;
    } else if (status === 'Rejeté') {
      progressStatus = 'En révision';
      progressPercentage = randomNumber(5, 40);
    }

    let risk: KYCRisk | null = null;
    if (status === 'Approuvé' || status === 'Ouvert') {
      risk = randomElement<KYCRisk | null>(['Élevé', 'Moyen', 'Faible', null]);
    } else if (status === 'Rejeté') {
      risk = Math.random() > 0.5 ? 'Bloqué' : 'Élevé';
    }

    const numTags = randomNumber(0, 3);
    const tags: string[] = [];
    for (let j = 0; j < numTags; j++) {
      const tag = randomElement(tagOptions);
      if (!tags.includes(tag)) tags.push(tag);
    }

    const assignee = Math.random() > 0.1 ? randomElement(assignees) : null;

    const file: KYCFile = {
      id: i + 1,
      uid: generateUniqueId(),
      status,
      nextReview,
      name,
      entityType,
      type: entityTypePerson,
      progress: { status: progressStatus, percentage: progressPercentage },
      risk,
      onboarding: getOnboardingFromRisk(risk),
      tags,
      assignee,
      lastActivity: generateLastActivity(),
      thirdParties: generateThirdParties(entityTypePerson, risk),
    };

    files.push(file);
  }

  return files;
}
