// Générateur de données mock pour les partenaires (CGP, Distributeurs)

const partnerCompanyNames = [
  'Patrimoine Conseil & Associés',
  'CGP Excellence Partners',
  'Quintessence Gestion Privée',
  'Althéa Patrimoine',
  'Primonial CGP Network',
  'Groupe Amplitude Patrimoine',
  'Masséna Wealth Management',
  'Fidelis Gestion Privée',
  'Apollon Conseil Patrimoine',
  'Stratégis Family Office',
  'Élysée Patrimoine Conseil',
  'Capitale Wealth Partners',
  'Héraclès Gestion Privée',
  'Renaissance Family Office',
  'Olympe Conseil Patrimoine',
  'Dynastie Gestion Privée',
  'Héritage Wealth Management',
  'Synergy Partners Group',
  'Prestige Patrimoine Conseil',
  'Excellence Private Banking'
];

const partnerTypes = [
  'CGP Indépendant',
  'Cabinet de Gestion de Patrimoine',
  'Family Office',
  'Courtier',
  'Banque Privée',
  'Multi-Family Office',
  'Plateforme de Distribution'
];

const statuses = [
  'Actif',
  'En cours d\'agrément',
  'Inactif',
  'Suspendu'
];

const contractTypes = [
  'Mandat de Commercialisation',
  'Accord de Distribution',
  'Partenariat Exclusif',
  'Partenariat Non-Exclusif',
  'Convention de Placement'
];

const analysts = ['Thomas', 'Sophie Martin', 'Marc Dubois', 'Claire Bernard', 'Alex Chen'];

const segments = ['HNWI', 'UHNWI', 'Retail', 'Professional', 'Institutional'];

const fundNames = [
  'InvestHub Innovation Fund',
  'European Growth Equity',
  'Sustainable Tech Fund',
  'Global Private Equity',
  'Real Estate Opportunities',
  'Infrastructure & Energy',
  'Healthcare Innovation',
  'Asia Pacific Growth',
  'Fixed Income Plus',
  'Emerging Markets Fund'
];

const cityCountryMap: Record<string, string> = {
  'Paris': 'France',
  'Lyon': 'France',
  'Marseille': 'France',
  'Bordeaux': 'France',
  'Toulouse': 'France',
  'Nice': 'France',
  'Nantes': 'France',
  'Strasbourg': 'France',
  'Lille': 'France',
  'Rennes': 'France',
  'Genève': 'Suisse',
  'Zurich': 'Suisse',
  'Lausanne': 'Suisse',
  'Luxembourg': 'Luxembourg',
  'Monaco': 'Monaco',
  'Bruxelles': 'Belgique',
  'Anvers': 'Belgique'
};

const cities = Object.keys(cityCountryMap);

// Fonctions pour les contacts
const contactFunctions = [
  'Directeur Général',
  'Directeur Commercial',
  'Responsable Partenariats',
  'Gérant',
  'Président',
  'Directeur du Développement',
  'Conseiller en Gestion de Patrimoine',
  'Responsable des Investissements',
  'Directeur des Relations Investisseurs'
];

export interface PartnerContact {
  id: number;
  firstName: string;
  lastName: string;
  function: string;
  email: string;
  phone: string;
  mobile?: string;
  language?: string;
}

export interface PartnerFund {
  fundId: number;
  fundName: string;
  shares: number;
  commissionRate: number; // Taux de rétrocession spécifique pour ce fonds
  status?: 'En collecte' | 'Actif' | 'Clôturé' | 'Suspendu'; // Statut du fonds
  shareClassName?: string; // Nom de la part
}

export interface Partner {
  id: number;
  name: string;
  type: string;
  status: string;
  contractType: string;
  registrationDate: Date;
  totalVolumeGenerated: number; // Volume total généré
  volumeInProgress: number; // Volume en cours (pas encore signé)
  volumeSigned: number; // Volume signé (finalisé)
  activeInvestors: number; // Nombre d'investisseurs actifs apportés
  subscriptionsCount: number;
  commissionRate: number; // Taux de rétrocession en %
  analyst: string;
  lastActivity: Date;
  country: string;
  city: string;
  siret?: string;
  orias?: string; // Numéro ORIAS
  segments: string[]; // Liste des segments (HNWI, UHNWI, etc.)
  funds: PartnerFund[]; // Liste des fonds avec parts et taux
  address?: string;
  contacts: PartnerContact[];
  email: string;
  phone: string;
  parentGroup?: string; // Nom du groupe/partenaire parent
  contractStatus?: 'Signé' | 'En attente' | 'À relancer' | 'Expiré' | 'Aucun'; // Statut de la convention
}

// Fonction pour générer un email
function generateEmail(name: string): string {
  const domain = ['patrimoine', 'cgp', 'wealth', 'partners', 'gestion'][Math.floor(Math.random() * 5)];
  const cleanName = name.toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ç]/g, 'c')
    .replace(/[\s&']/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  return `contact@${cleanName.substring(0, 15)}-${domain}.fr`;
}

// Fonction pour générer un téléphone
function generatePhone(): string {
  return `+33 1 ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)}`;
}

// Fonction pour générer un mobile
function generateMobile(): string {
  return `+33 6 ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)}`;
}

// Fonction pour générer un SIRET
function generateSiret(): string {
  let siret = '';
  for (let i = 0; i < 14; i++) {
    siret += Math.floor(Math.random() * 10);
  }
  return siret;
}

// Fonction pour générer un ORIAS
function generateOrias(): string {
  let orias = '';
  for (let i = 0; i < 10; i++) {
    orias += Math.floor(Math.random() * 10);
  }
  return orias;
}

// Fonction pour générer des contacts
function generateContacts(count: number, partnerId: number): PartnerContact[] {
  const firstNames = ['Sophie', 'Jean', 'Marie', 'Pierre', 'Claire', 'Michel', 'Anne', 'François', 'Laurent', 'Nathalie', 'Éric', 'Valérie'];
  const lastNames = ['Martin', 'Dubois', 'Bernard', 'Durand', 'Petit', 'Lambert', 'Rousseau', 'Moreau', 'Girard', 'Simon'];
  const languages = ['Français', 'English', 'Español', 'Deutsch', 'Italiano'];
  
  const contacts: PartnerContact[] = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    contacts.push({
      id: partnerId * 100 + i,
      firstName,
      lastName,
      function: contactFunctions[Math.floor(Math.random() * contactFunctions.length)],
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@partner${partnerId}.fr`,
      phone: generatePhone(),
      mobile: Math.random() > 0.3 ? generateMobile() : undefined,
      language: languages[Math.floor(Math.random() * languages.length)],
    });
  }
  
  return contacts;
}

// Fonction pour générer une date aléatoire
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Fonction principale pour générer les partenaires
export function generatePartners(count: number = 20): Partner[] {
  const partners: Partner[] = [];
  
  // Ajouter quelques exemples riches pour démonstration
  const richExamples = [
    {
      name: 'CGP Excellence Partners',
      fundsData: [
        { name: 'InvestHub Innovation Fund', status: 'En collecte' as const, shares: ['Part A', 'Part B', 'Part C'], rates: [2.85, 2.15, 1.65] },
        { name: 'European Growth Equity', status: 'En collecte' as const, shares: ['Part A', 'Part B', 'Part C', 'Part D'], rates: [3.15, 2.45, 1.95, 1.25] },
        { name: 'Sustainable Tech Fund', status: 'En collecte' as const, shares: ['Part B', 'Part C'], rates: [2.75, 2.05] },
        { name: 'Global Private Equity', status: 'Clôturé' as const, shares: ['Part C'], rates: [1.85] },
        { name: 'Real Estate Opportunities', status: 'Clôturé' as const, shares: ['Part A', 'Part B'], rates: [2.95, 2.25] },
      ],
    },
    {
      name: 'Quintessence Gestion Privée',
      fundsData: [
        { name: 'Asia Pacific Growth', status: 'En collecte' as const, shares: ['Part A', 'Part B', 'Part C'], rates: [3.25, 2.55, 1.95] },
        { name: 'Healthcare Innovation', status: 'En collecte' as const, shares: ['Part A', 'Part C'], rates: [2.95, 2.15] },
        { name: 'Emerging Markets Fund', status: 'Clôturé' as const, shares: ['Part B', 'Part C'], rates: [2.35, 1.75] },
      ],
    },
  ];

  richExamples.forEach((example, idx) => {
    const city = cities[idx];
    const funds: PartnerFund[] = [];
    
    example.fundsData.forEach((fundData, fundIdx) => {
      fundData.shares.forEach((shareClass, shareIdx) => {
        funds.push({
          fundId: (idx + 1) * 1000 + fundIdx * 10 + shareIdx,
          fundName: fundData.name,
          shares: Math.floor(Math.random() * 1000000) + 100000,
          commissionRate: fundData.rates[shareIdx],
          status: fundData.status,
          shareClassName: shareClass,
        });
      });
    });

    const totalVolume = Math.floor(Math.random() * 10000000) + 5000000;
    const volumeSigned = Math.floor(totalVolume * (0.5 + Math.random() * 0.4)); // 50-90% du total
    const volumeInProgress = totalVolume - volumeSigned; // Le reste

    partners.push({
      id: idx + 1,
      name: example.name,
      type: 'Cabinet de Gestion de Patrimoine',
      status: 'Actif',
      contractType: 'Partenariat Exclusif',
      registrationDate: new Date(2020, 3, 15),
      totalVolumeGenerated: totalVolume,
      volumeInProgress: volumeInProgress,
      volumeSigned: volumeSigned,
      activeInvestors: Math.floor(Math.random() * 50) + 30,
      subscriptionsCount: Math.floor(Math.random() * 100) + 50,
      commissionRate: 2.5,
      analyst: analysts[0],
      lastActivity: new Date(),
      country: cityCountryMap[city],
      city,
      siret: generateSiret(),
      orias: generateOrias(),
      segments: ['HNWI', 'UHNWI', 'Professional'],
      funds,
      address: `${Math.floor(Math.random() * 200) + 1} Avenue de la République, ${city}`,
      contacts: generateContacts(2, idx + 1),
      email: generateEmail(example.name),
      phone: generatePhone(),
      contractStatus: 'Signé',
      parentGroup: undefined, // Ces exemples sont des parents, donc pas de parentGroup
    });
  });
  
  // Générer des cabinets enfants pour les 2 gros partenaires
  const childCabinetsForParent1 = [
    'Cabinet Patrimoine Sud',
    'Cabinet Patrimoine Nord',
    'Cabinet Patrimoine Est',
    'Cabinet Patrimoine Ouest',
    'Cabinet Patrimoine Centre',
    'Cabinet Patrimoine Atlantique',
    'Cabinet Patrimoine Méditerranée',
    'Cabinet Patrimoine Alpes',
    'Cabinet Patrimoine Bretagne',
    'Cabinet Patrimoine Provence',
    'Cabinet Patrimoine Lyon',
    'Cabinet Patrimoine Bordeaux',
  ];

  const childCabinetsForParent2 = [
    'Quintessence Paris 8',
    'Quintessence Neuilly',
    'Quintessence La Défense',
    'Quintessence Versailles',
    'Quintessence Saint-Germain',
    'Quintessence Cannes',
    'Quintessence Monaco',
    'Quintessence Genève',
    'Quintessence Lausanne',
    'Quintessence Luxembourg',
  ];

  let currentId = richExamples.length + 1;

  // Créer les enfants pour le premier gros partenaire
  childCabinetsForParent1.forEach((childName, childIdx) => {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const funds: PartnerFund[] = [];
    
    // 1-3 fonds par cabinet enfant
    const fundCount = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < fundCount; j++) {
      const fundId = Math.floor(Math.random() * fundNames.length);
      const fundName = fundNames[fundId];
      const fundStatus = ['En collecte', 'Actif', 'Clôturé'][Math.floor(Math.random() * 3)] as 'En collecte' | 'Actif' | 'Clôturé';
      
      const shareCount = Math.floor(Math.random() * 2) + 1;
      const shareClasses = ['Part A', 'Part B', 'Part C'];
      
      for (let k = 0; k < shareCount; k++) {
        funds.push({
          fundId: currentId * 10 + j * 3 + k,
          fundName: fundName,
          shares: Math.floor(Math.random() * 500000) + 50000,
          commissionRate: parseFloat((Math.random() * 2 + 1).toFixed(2)),
          status: fundStatus,
          shareClassName: shareClasses[k],
        });
      }
    }

    const totalVolume = Math.floor(Math.random() * 3000000) + 500000;
    const volumeSigned = Math.floor(totalVolume * (0.5 + Math.random() * 0.4));
    const volumeInProgress = totalVolume - volumeSigned;

    partners.push({
      id: currentId,
      name: childName,
      type: 'Cabinet de Gestion de Patrimoine',
      status: 'Actif',
      contractType: 'Partenariat Standard',
      registrationDate: randomDate(new Date(2021, 0, 1), new Date(2024, 10, 1)),
      totalVolumeGenerated: totalVolume,
      volumeInProgress: volumeInProgress,
      volumeSigned: volumeSigned,
      activeInvestors: Math.floor(Math.random() * 20) + 5,
      subscriptionsCount: Math.floor(Math.random() * 40) + 10,
      commissionRate: parseFloat((Math.random() * 2 + 1.5).toFixed(2)),
      analyst: analysts[Math.floor(Math.random() * analysts.length)],
      lastActivity: randomDate(new Date(2024, 0, 1), new Date()),
      country: cityCountryMap[city],
      city,
      siret: generateSiret(),
      orias: Math.random() > 0.3 ? generateOrias() : undefined,
      segments: ['HNWI', 'Retail'],
      funds,
      address: `${Math.floor(Math.random() * 200) + 1} Avenue de la République, ${city}`,
      contacts: generateContacts(Math.floor(Math.random() * 2) + 1, currentId),
      email: generateEmail(childName),
      phone: generatePhone(),
      contractStatus: 'Signé',
      parentGroup: 'CGP Excellence Partners',
    });
    currentId++;
  });

  // Créer les enfants pour le deuxième gros partenaire
  childCabinetsForParent2.forEach((childName, childIdx) => {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const funds: PartnerFund[] = [];
    
    const fundCount = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < fundCount; j++) {
      const fundId = Math.floor(Math.random() * fundNames.length);
      const fundName = fundNames[fundId];
      const fundStatus = ['En collecte', 'Actif', 'Clôturé'][Math.floor(Math.random() * 3)] as 'En collecte' | 'Actif' | 'Clôturé';
      
      const shareCount = Math.floor(Math.random() * 2) + 1;
      const shareClasses = ['Part A', 'Part B', 'Part C'];
      
      for (let k = 0; k < shareCount; k++) {
        funds.push({
          fundId: currentId * 10 + j * 3 + k,
          fundName: fundName,
          shares: Math.floor(Math.random() * 500000) + 50000,
          commissionRate: parseFloat((Math.random() * 2 + 1).toFixed(2)),
          status: fundStatus,
          shareClassName: shareClasses[k],
        });
      }
    }

    const totalVolume = Math.floor(Math.random() * 3000000) + 500000;
    const volumeSigned = Math.floor(totalVolume * (0.5 + Math.random() * 0.4));
    const volumeInProgress = totalVolume - volumeSigned;

    partners.push({
      id: currentId,
      name: childName,
      type: 'Cabinet de Gestion de Patrimoine',
      status: 'Actif',
      contractType: 'Partenariat Standard',
      registrationDate: randomDate(new Date(2021, 0, 1), new Date(2024, 10, 1)),
      totalVolumeGenerated: totalVolume,
      volumeInProgress: volumeInProgress,
      volumeSigned: volumeSigned,
      activeInvestors: Math.floor(Math.random() * 20) + 5,
      subscriptionsCount: Math.floor(Math.random() * 40) + 10,
      commissionRate: parseFloat((Math.random() * 2 + 1.5).toFixed(2)),
      analyst: analysts[Math.floor(Math.random() * analysts.length)],
      lastActivity: randomDate(new Date(2024, 0, 1), new Date()),
      country: cityCountryMap[city],
      city,
      siret: generateSiret(),
      orias: Math.random() > 0.3 ? generateOrias() : undefined,
      segments: ['HNWI', 'UHNWI', 'Professional'],
      funds,
      address: `${Math.floor(Math.random() * 200) + 1} Avenue de la République, ${city}`,
      contacts: generateContacts(Math.floor(Math.random() * 2) + 1, currentId),
      email: generateEmail(childName),
      phone: generatePhone(),
      contractStatus: 'Signé',
      parentGroup: 'Quintessence Gestion Privée',
    });
    currentId++;
  });
  
  for (let i = currentId - 1; i < count; i++) {
    const name = partnerCompanyNames[i % partnerCompanyNames.length] + (i >= partnerCompanyNames.length ? ` ${Math.floor(i / partnerCompanyNames.length) + 1}` : '');
    const registrationDate = randomDate(new Date(2018, 0, 1), new Date(2024, 10, 1));
    const city = cities[Math.floor(Math.random() * cities.length)];
    
    const funds: PartnerFund[] = [];
    const fundCount = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < fundCount; j++) {
      const fundId = Math.floor(Math.random() * fundNames.length);
      const fundName = fundNames[fundId];
      const fundStatus = ['En collecte', 'Actif', 'Clôturé', 'Suspendu'][Math.floor(Math.random() * 4)] as 'En collecte' | 'Actif' | 'Clôturé' | 'Suspendu';
      
      // Générer 1 à 4 parts par fonds avec des taux différents
      const shareCount = Math.floor(Math.random() * 3) + 1; // 1 à 3 parts
      const shareClasses = ['Part A', 'Part B', 'Part C', 'Part D'];
      
      for (let k = 0; k < shareCount; k++) {
        funds.push({
          fundId: fundId * 10 + k, // ID unique pour chaque part
          fundName: fundName,
          shares: Math.floor(Math.random() * 1000000) + 100000, // 100k à 1.1M
          commissionRate: parseFloat((Math.random() * 3 + 0.5).toFixed(2)), // 0.5% à 3.5%
          status: fundStatus, // Même statut pour toutes les parts d'un même fonds
          shareClassName: shareClasses[k],
        });
      }
    }
    
    // Générer 1 à 3 segments aléatoires
    const segmentCount = Math.floor(Math.random() * 3) + 1;
    const shuffledSegments = [...segments].sort(() => Math.random() - 0.5);
    const selectedSegments = shuffledSegments.slice(0, segmentCount);
    
    // Générer un statut de contract
    const contractStatusOptions: Array<'Signé' | 'En attente' | 'À relancer' | 'Expiré' | 'Aucun'> = ['Signé', 'En attente', 'À relancer', 'Expiré', 'Aucun'];
    const selectedContractStatus = contractStatusOptions[Math.floor(Math.random() * contractStatusOptions.length)];
    
    // Générer un partenaire parent (30% de chances d'avoir un parent)
    const selectedParentGroup = Math.random() > 0.7 ? partnerCompanyNames[Math.floor(Math.random() * partnerCompanyNames.length)] : undefined;
    
    const totalVolume = Math.floor(Math.random() * 10000000) + 500000; // 500k à 10.5M
    const volumeSigned = Math.floor(totalVolume * (0.5 + Math.random() * 0.4)); // 50-90% du total
    const volumeInProgress = totalVolume - volumeSigned; // Le reste

    partners.push({
      id: i + 1,
      name,
      type: partnerTypes[Math.floor(Math.random() * partnerTypes.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      contractType: contractTypes[Math.floor(Math.random() * contractTypes.length)],
      registrationDate,
      totalVolumeGenerated: totalVolume,
      volumeInProgress: volumeInProgress,
      volumeSigned: volumeSigned,
      activeInvestors: Math.floor(Math.random() * 50) + 5, // 5 à 55 investisseurs
      subscriptionsCount: Math.floor(Math.random() * 100) + 10, // 10 à 110 souscriptions
      commissionRate: parseFloat((Math.random() * 3 + 0.5).toFixed(2)), // 0.5% à 3.5%
      analyst: analysts[Math.floor(Math.random() * analysts.length)],
      lastActivity: randomDate(new Date(2024, 0, 1), new Date()),
      country: cityCountryMap[city],
      city,
      siret: Math.random() > 0.2 ? generateSiret() : undefined,
      orias: Math.random() > 0.2 ? generateOrias() : undefined,
      segments: selectedSegments,
      funds,
      address: `${Math.floor(Math.random() * 200) + 1} Avenue de la République, ${city}`,
      contacts: generateContacts(Math.floor(Math.random() * 3) + 1, i + 1),
      email: generateEmail(name),
      phone: generatePhone(),
      parentGroup: selectedParentGroup,
      contractStatus: selectedContractStatus,
    });
  }
  
  return partners;
}