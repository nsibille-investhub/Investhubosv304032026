import { generateEntityDetails } from './mockData';
import { EntityLink } from '../components/EntityLinks';

// Noms d'individus variés
const individualNames = [
  'John Smith', 'Sarah Connor', 'Michael Chen', 'Emma Wilson', 'David Rodriguez',
  'Maria Garcia', 'James Brown', 'Sophie Martin', 'Robert Taylor', 'Lisa Anderson',
  'William Martinez', 'Jennifer Lee', 'Richard White', 'Patricia Harris', 'Charles Clark',
  'Nancy Lewis', 'Thomas Walker', 'Betty Hall', 'Christopher Allen', 'Sandra Young',
  'Daniel King', 'Ashley Wright', 'Matthew Lopez', 'Jessica Hill', 'Anthony Scott',
  'Kimberly Green', 'Mark Adams', 'Michelle Baker', 'Paul Nelson', 'Laura Carter',
  'Steven Mitchell', 'Carol Perez', 'Andrew Roberts', 'Sharon Turner', 'Joshua Phillips',
  'Linda Campbell', 'Kevin Parker', 'Donna Evans', 'Brian Edwards', 'Ruth Collins',
  'George Stewart', 'Karen Morris', 'Edward Rogers', 'Susan Reed', 'Ronald Cook',
  'Margaret Morgan', 'Timothy Bell', 'Dorothy Murphy', 'Jason Bailey', 'Lisa Rivera'
];

// Noms d'entreprises variés
const corporateNames = [
  'GlobalTrade Ltd.', 'FutureInvest Fund', 'TechNova Inc.', 'Capital Ventures Corp.',
  'Horizon Holdings', 'Summit Capital Partners', 'Evergreen Investments', 'Apex Trading Group',
  'Phoenix Capital Management', 'Sterling Financial Services', 'Meridian Investment Trust',
  'Atlas Global Partners', 'Nexus Capital Group', 'Quantum Asset Management', 'Vanguard Holdings Ltd.',
  'Beacon Investment Corp.', 'Titan Financial Group', 'Prosperity Capital Partners', 'Legacy Wealth Management',
  'Pioneer Investment Fund', 'Zenith Capital Corporation', 'Nova Financial Holdings', 'Omega Investment Trust',
  'Prestige Capital Group', 'Elite Asset Management', 'Prime Investment Partners', 'Royal Capital Holdings',
  'Sovereign Wealth Fund', 'Diamond Capital Corp.', 'Platinum Investment Group', 'Crown Financial Services',
  'Empire Capital Partners', 'Dynasty Investment Holdings', 'Majestic Capital Group', 'Noble Asset Management',
  'Regal Investment Trust', 'Supreme Capital Partners', 'Victory Financial Group', 'Triumph Capital Corp.',
  'Fortune Investment Holdings', 'Premier Asset Management', 'Excellence Capital Group', 'Pinnacle Investment Fund',
  'Summit Trading Corporation', 'Crest Capital Partners', 'Peak Financial Holdings', 'Vertex Investment Group',
  'Catalyst Capital Management', 'Momentum Investment Trust', 'Velocity Capital Partners', 'Synergy Financial Corp.'
];

// Noms pour les liens d'investisseurs
const investorNames = [
  'Capital Fund', 'Investment Trust', 'Ventures LP', 'Partners LLC', 'Asset Management',
  'Holdings Inc.', 'Capital Partners', 'Investment Group', 'Wealth Fund', 'Private Equity',
  'Family Trust', 'Growth Fund', 'Capital Corporation', 'Investment Holdings', 'Equity Partners'
];

// Noms pour les distributeurs
const distributorNames = [
  'Distribution LLC', 'Trading Group', 'Services Corp.', 'Solutions Inc.', 'Network Partners',
  'Distribution Network', 'Global Distribution', 'Enterprises', 'Distribution Services', 'Trading Partners'
];

// Noms pour les participations
const participationNames = [
  'Technologies Inc.', 'Solutions Ltd.', 'Innovations Corp.', 'Systems Group', 'Digital Services',
  'Tech Ventures', 'Software Solutions', 'Analytics Inc.', 'Cloud Systems', 'Data Services',
  'AI Technologies', 'Biotech Corp.', 'GreenTech Solutions', 'Energy Systems', 'MedTech Inc.'
];

const statuses = ['Pending', 'Clear', 'True Hit', 'New Hit'];
const types = ['Individual', 'Corporate'];
const analysts = ['Jean Dault', 'Sophie Martin', 'Marc Dubois', 'Claire Rousseau', 'Thomas Bernard', 'Emma Leroy'];
const riskLevels = ['Low', 'Medium', 'High', 'Pending'];

// Types de parents possibles
const parentTypes = ['Investor', 'Partner', 'Participation'];

// Noms d'investisseurs parents
const investorParents = [
  'John Smith Holdings',
  'Sarah Connor Family Trust',
  'Michael Chen Investment Fund',
  'Emma Wilson Capital',
  'David Rodriguez Ventures'
];

// Noms de partenaires
const partnerParents = [
  'GlobalPartners LLC',
  'Strategic Ventures Group',
  'Alliance Capital Partners',
  'Summit Advisory Services',
  'Premier Distribution Network'
];

// Noms de participations
const participationParents = [
  'TechCorp Industries',
  'Digital Solutions Ltd',
  'Innovation Systems Inc',
  'GreenTech Ventures',
  'BioMed Technologies'
];

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomAmount(): string {
  const amount = randomNumber(500000, 50000000);
  return `$${amount.toLocaleString()}`;
}

function randomPercentage(): string {
  const pct = (Math.random() * 25 + 1).toFixed(1);
  return `${pct}%`;
}

// Générer un ID unique type MongoDB-like
function generateUniqueId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 24; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function randomDate(): string {
  const year = randomNumber(2022, 2024);
  const month = String(randomNumber(1, 12)).padStart(2, '0');
  const day = String(randomNumber(1, 28)).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Générer une date de mise à jour récente (entre 1 et 90 jours dans le passé)
function randomRecentDate(): Date {
  const now = new Date();
  const daysAgo = randomNumber(1, 90);
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

// Formater la date pour l'affichage élégant
function formatLastUpdate(date: Date): { 
  fullDate: string; 
  relativeTime: string;
  timestamp: number;
} {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  
  let relativeTime = '';
  if (diffInMinutes < 60) {
    relativeTime = `Il y a ${diffInMinutes} min`;
  } else if (diffInHours < 24) {
    relativeTime = `Il y a ${diffInHours}h`;
  } else if (diffInDays === 1) {
    relativeTime = 'Hier';
  } else if (diffInDays < 7) {
    relativeTime = `Il y a ${diffInDays}j`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    relativeTime = `Il y a ${weeks} sem`;
  } else {
    const months = Math.floor(diffInDays / 30);
    relativeTime = `Il y a ${months} mois`;
  }
  
  const fullDate = date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return {
    fullDate,
    relativeTime,
    timestamp: date.getTime()
  };
}

function generateEntityLinks(entityName: string, entityType: string): EntityLink[] {
  const linkCount = randomNumber(1, 4);
  const links: EntityLink[] = [];
  
  for (let i = 0; i < linkCount; i++) {
    const linkType = randomElement(['investor', 'distributor', 'participation']);
    const linkId = `l${Math.random().toString(36).substr(2, 9)}`;
    
    let name = '';
    if (linkType === 'investor') {
      name = entityType === 'Individual' 
        ? `${entityName} ${randomElement(investorNames)}`
        : `${entityName.split(' ')[0]} ${randomElement(investorNames)}`;
    } else if (linkType === 'distributor') {
      name = entityType === 'Individual'
        ? `${entityName.split(' ')[1]} ${randomElement(distributorNames)}`
        : `${entityName.split(' ')[0]} ${randomElement(distributorNames)}`;
    } else {
      name = randomElement(participationNames);
    }
    
    const link: EntityLink = {
      id: linkId,
      type: linkType as 'investor' | 'distributor' | 'participation',
      reference: `${linkType.charAt(0).toUpperCase() + linkType.slice(1)} #${randomNumber(100, 999)}`,
      name: name,
      amount: randomAmount(),
      date: randomDate(),
      status: randomElement(['Active', 'Pending', 'Inactive'])
    };
    
    if (linkType === 'distributor' || linkType === 'participation') {
      link.percentage = randomPercentage();
    }
    
    links.push(link);
  }
  
  return links;
}

export function generateEntities(count: number): any[] {
  const entities = [];
  
  for (let i = 0; i < count; i++) {
    const type = randomElement(types);
    const name = type === 'Individual' 
      ? randomElement(individualNames)
      : randomElement(corporateNames);
    
    const status = randomElement(statuses);
    const hasExposure = status === 'Pending' || status === 'True Hit' || status === 'New Hit';
    
    // Déterminer si l'entité a un statut secondaire (rejected, archived, deleted, flagged)
    let secondaryStatus = null;
    if (Math.random() < 0.15) { // 15% de chance d'avoir un statut secondaire
      secondaryStatus = randomElement(['rejected', 'archived', 'deleted', 'flagged']);
    }
    
    const lastUpdateDate = randomRecentDate();
    const lastUpdateFormatted = formatLastUpdate(lastUpdateDate);
    
    const entityName = `${name} ${i > 49 ? `(${Math.floor(i / 50)})` : ''}`.trim();
    
    // Déterminer le nombre d'alertes en fonction du statut
    let alertCount = 0;
    if (status === 'Clear') {
      alertCount = 0;
    } else if (status === 'Pending') {
      alertCount = randomNumber(1, 8);
    } else if (status === 'True Hit') {
      alertCount = randomNumber(1, 5);
    } else if (status === 'New Hit') {
      alertCount = randomNumber(1, 4);
    }
    
    // Générer les détails de l'entité avec alertes
    const details = generateEntityDetails(name, type, status, alertCount);
    
    // Calculer le nombre de matches sans décision (pendingMatches)
    const pendingMatches = details.alerts.filter(alert => !alert.decision).length;
    
    // Générer un parent aléatoire
    const parentType = randomElement(parentTypes);
    let parentName = '';
    let parentEntityType: 'Individual' | 'Corporate' = 'Corporate';
    
    if (parentType === 'Investor') {
      parentName = randomElement(investorParents);
      // Les investisseurs peuvent être Individual ou Corporate
      parentEntityType = Math.random() > 0.5 ? 'Individual' : 'Corporate';
    } else if (parentType === 'Partner') {
      parentName = randomElement(partnerParents);
      parentEntityType = 'Corporate'; // Les partenaires sont toujours Corporate
    } else {
      parentName = randomElement(participationParents);
      parentEntityType = 'Corporate'; // Les participations sont toujours Corporate
    }
    
    // Générer les types de matches (PEP, Sanctions, Media)
    const matchTypes: ('PEP' | 'Sanctions' | 'Media')[] = [];
    if (hasExposure || status !== 'Clear') {
      // Si l'entité a une exposition ou n'est pas Clear, ajouter des matches
      if (Math.random() > 0.6) matchTypes.push('PEP');
      if (Math.random() > 0.7) matchTypes.push('Sanctions');
      if (Math.random() > 0.5) matchTypes.push('Media');
      
      // S'assurer qu'il y a au moins un match si pas Clear
      if (matchTypes.length === 0 && status !== 'Clear') {
        matchTypes.push(randomElement(['PEP', 'Sanctions', 'Media'] as const));
      }
    }
    
    const entity = {
      id: i + 1,
      uid: generateUniqueId(), // ID unique copiable
      name: entityName,
      type,
      links: generateEntityLinks(name, type),
      status,
      secondaryStatus,
      exposure: hasExposure ? (Math.random() > 0.5 ? 'PPE' : 'Sanctions') : null,
      riskLevel: status === 'Clear' && alertCount === 0 ? 'Low' : (status === 'Clear' ? 'Low' : (status === 'Pending' ? randomElement(['Pending', 'Low']) : randomElement(['Medium', 'High']))),
      matchTypes, // Types de matches (PEP, Sanctions, Media)
      monitoring: Math.random() > 0.2, // 80% de chance d'avoir le monitoring activé
      hits: alertCount, // Le nombre de hits correspond au nombre d'alertes
      decisions: alertCount === 0 ? 0 : (status === 'Pending' ? 0 : randomNumber(1, alertCount)), // Si pas d'alertes, 0 décisions
      pendingMatches, // Nombre de matches restant à traiter
      analyst: randomElement(analysts),
      parent: {
        type: parentType,
        name: parentName,
        entityType: parentEntityType
      },
      lastUpdate: lastUpdateFormatted,
      details: details
    };
    
    entities.push(entity);
  }
  
  return entities;
}