// Générateur de dossiers KYC pour InvestHub

export interface KYCFile {
  id: number;
  uid: string;
  status: 'Rejeté' | 'Brouillon' | 'Ouvert' | 'Approuvé';
  nextReview: string | null; // Date ou null
  name: string;
  entityType: 'Investisseur' | 'Partenaire' | 'Participation';
  type: 'Personne morale' | 'Personne physique';
  progress: {
    status: 'En révision' | 'En collecte' | 'Recollecte' | 'Finalisation';
    percentage: number;
  };
  risk: 'Prohibé' | 'Élevé' | 'Moyen' | 'Faible' | null;
  template: string;
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
}

// Investisseurs - Personnes morales
const investorsCorporate = [
  'VENTECH', 'KORELYA CAPITAL', 'HIGHLAND EUROPE', 'ACCEL PARTNERS', 'INDEX VENTURES',
  'BALDERTON CAPITAL', 'ATOMICO', 'NORTHZONE', 'CREANDUM', 'PARTECH',
  'IDINVEST PARTNERS', 'EURAZEO', 'IRIS CAPITAL', 'KERNEL INVESTMENTS'
];

// Investisseurs - Personnes physiques
const investorsIndividual = [
  'Jean Dault', 'Sophie Martin', 'Marc Dubois', 'Claire Rousseau', 'Thomas Bernard',
  'Emma Leroy', 'Pierre Moreau', 'Julie Fontaine', 'Maxime Petit', 'Céline Garnier'
];

// Partenaires - Personnes morales
const partnersCorporate = [
  'DELOITTE ADVISORY', 'PWC CONSULTING', 'EY PARTHENON', 'KPMG ADVISORY',
  'BNP PARIBAS', 'SOCIÉTÉ GÉNÉRALE', 'CRÉDIT AGRICOLE', 'NATIXIS',
  'LEMONWAY', 'MANGOPAY', 'STRIPE TREASURY'
];

// Partenaires - Personnes physiques
const partnersIndividual = [
  'Romain Minaud', 'Anne-Sophie Ter Sakarian', 'Tom Chadwick', 'Maxime Pariaux',
  'Julie Martin', 'Pierre Dubois', 'Sophie Bernard'
];

// Participations - Personnes morales
const participationsCorporate = [
  'DATADOG', 'MIRAKL', 'CONTENTSQUARE', 'VESTIAIRE COLLECTIVE',
  'SHIFT TECHNOLOGY', 'ALAN', 'QONTO', 'LEDGER', 'LYDIA', 'EXOTEC',
  'DOCTOLIB', 'BLABLACAR', 'PAYFIT', 'SWILE', 'MANO MANO'
];

// Participations - Personnes physiques (fondateurs)
const participationsIndividual = [
  'Alexandre Prot', 'Steve Anavi', 'Olivier Pomel', 'Stanislas Niox-Château',
  'Guillaume Princen', 'Jean-Charles Samuelian', 'Pascal Gauthier'
];

const templates = [
  'KYC Standard [Ne pas supprimer]',
  'KYC Simplifié',
  'Unzer - KYC',
  'KYC Renforcé',
  'KYC Accéléré'
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

const progressStatuses: ('En révision' | 'En collecte' | 'Recollecte' | 'Finalisation')[] = [
  'En révision', 'En collecte', 'Recollecte', 'Finalisation'
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

function generateNextReviewDate(status: string): string | null {
  if (status === 'Brouillon' || status === 'Rejeté') {
    return null;
  }
  
  if (status === 'Approuvé') {
    // Dates dans le futur
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const month = randomElement(months);
    const day = randomNumber(1, 28);
    const year = randomNumber(2027, 2028);
    return `${day} ${month} ${year}`;
  }
  
  if (status === 'Ouvert') {
    // Dates dans le futur proche
    const months = ['Mar', 'Avr', 'Mai', 'Juin'];
    const month = randomElement(months);
    const day = randomNumber(1, 28);
    return `${day} ${month} 2026`;
  }
  
  return null;
}

function generateLastActivity(status: string): { text: string; timestamp: number } {
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
    timestamp: now - (activity.hours * 60 * 60 * 1000)
  };
}

export function generateKYCFiles(count: number = 100): KYCFile[] {
  const files: KYCFile[] = [];
  const statuses: ('Rejeté' | 'Brouillon' | 'Ouvert' | 'Approuvé')[] = ['Rejeté', 'Brouillon', 'Ouvert', 'Approuvé'];
  const riskLevels: ('Prohibé' | 'Élevé' | 'Moyen' | 'Faible' | null)[] = ['Prohibé', 'Élevé', 'Moyen', 'Faible', null];
  
  for (let i = 0; i < count; i++) {
    const status = randomElement(statuses);
    const entityType = randomElement(['Investisseur', 'Partenaire', 'Participation'] as const);
    
    let entityName = '';
    let entityTypePerson = 'Personne morale';
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
    
    // Progress
    let progressStatus: 'En révision' | 'En collecte' | 'Recollecte' | 'Finalisation' = 'En révision';
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
    
    // Risk
    let risk: 'Prohibé' | 'Élevé' | 'Moyen' | 'Faible' | null = null;
    if (status === 'Approuvé' || status === 'Ouvert') {
      risk = randomElement(['Élevé', 'Moyen', 'Faible', null]);
    } else if (status === 'Rejeté') {
      risk = Math.random() > 0.5 ? 'Prohibé' : 'Élevé';
    }
    
    // Tags
    const numTags = randomNumber(0, 3);
    const tags: string[] = [];
    for (let j = 0; j < numTags; j++) {
      const tag = randomElement(tagOptions);
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    }
    
    // Assignee
    const assignee = Math.random() > 0.1 ? randomElement(assignees) : null;
    
    const file: KYCFile = {
      id: i + 1,
      uid: generateUniqueId(),
      status,
      nextReview,
      name,
      entityType,
      type: entityTypePerson,
      progress: {
        status: progressStatus,
        percentage: progressPercentage
      },
      risk,
      template: randomElement(templates),
      tags,
      assignee,
      lastActivity: generateLastActivity(status)
    };
    
    files.push(file);
  }
  
  return files;
}