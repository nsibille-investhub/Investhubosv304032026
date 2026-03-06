// Générateur de données mock pour les investisseurs

// Noms pour Individual investors
const individualInvestorNames = [
  { firstName: 'Sophie', lastName: 'Martin' },
  { firstName: 'Jean', lastName: 'Dubois' },
  { firstName: 'Marie', lastName: 'Bernard' },
  { firstName: 'Pierre', lastName: 'Durand' },
  { firstName: 'Claire', lastName: 'Petit' },
  { firstName: 'Michel', lastName: 'Lambert' },
  { firstName: 'Anne', lastName: 'Rousseau' },
  { firstName: 'François', lastName: 'Moreau' },
  { firstName: 'Isabelle', lastName: 'Girard' },
  { firstName: 'Laurent', lastName: 'Simon' },
  { firstName: 'Nathalie', lastName: 'Blanc' },
  { firstName: 'Éric', lastName: 'Bonnet' },
  { firstName: 'Valérie', lastName: 'Dupont' },
  { firstName: 'Thierry', lastName: 'Laurent' },
  { firstName: 'Christine', lastName: 'Fournier' }
];

// Structures corporates
const corporateStructures = [
  'Alpha Capital Holding',
  'Global Invest SARL',
  'Horizon Partners SAS',
  'Meridian Group SA',
  'NextGen Ventures',
  'Pinnacle Holdings',
  'Strategic Capital Partners',
  'Titanium Investment Group',
  'Vertex Capital SA',
  'Zenith Investments',
  'Athena Capital',
  'Omega Holdings',
  'Phoenix Investments',
  'Quantum Capital',
  'Summit Partners'
];

// Partenaires - Cabinets de CGP / Distributeur
const partnerNames = [
  'Patrimoine Conseil & Associés',
  'CGP Excellence Partners',
  'Quintessence Gestion Privée',
  'Althéa Patrimoine',
  'Primonial CGP Network',
  'Groupe Amplitude Patrimoine',
  'Masséna Wealth Management',
  'Fidelis Gestion Privée',
  'Apollon Conseil Patrimoine',
  'Stratégis Family Office'
];

const types = ['Individual', 'Company'];

const statuses = [
  'Prospect',
  'En discussion',
  'En relation',
  'Archivé'
];

const analysts = ['Thomas', 'Sophie Martin', 'Marc Dubois', 'Claire Bernard', 'Alex Chen'];

const kycStatuses = ['En cours', 'En revue', 'À revoir', 'Validé', 'Expiré'];
const crmSegmentsList = [
  'HNWI',
  'UHNWI',
  'Retail',
  'Professional',
  'Institutional'
];

const countries = [
  'France',
  'Luxembourg',
  'Suisse',
  'Belgique',
  'Monaco',
  'Royaume-Uni',
  'Allemagne',
  'Pays-Bas'
];

// Fonctions pour les contacts
const contactFunctions = [
  'Directeur Général',
  'Directeur Financier',
  'Directeur Juridique',
  'Responsable Investissements',
  'Gérant',
  'Président',
  'Directeur des Opérations',
  'Responsable Compliance',
  'Conseiller Patrimonial',
  'Gestionnaire de Patrimoine'
];

export interface LegalStructure {
  id: string;
  name: string;
  type: 'SCI' | 'SARL' | 'SAS' | 'SA' | 'Trust' | 'Foundation' | 'Holding';
  participationId?: string;
  contactsCount?: number;
  subscriptionsCount?: number;
  totalInvested?: number; // Montant total investi en euros
  kycStatus?: 'Validé' | 'En cours' | 'À revoir' | 'Non commencé';
  riskScore?: number; // de 0 à 100
  legalRepresentative?: string; // Prénom et nom du représentant légal
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  function: string;
  email: string;
  phone: string;
  isPrimary: boolean;
  hasPortalAccess?: boolean;
  accessLevel?: 'Read Only' | 'Full Access' | 'Admin';
  language?: string;
}

export interface Signatory {
  id: string;
  firstName: string;
  lastName: 'string';
  function: string;
  email: string;
  phone: string;
  signatureLevel: 'Individual' | 'Joint' | 'Any';
  isPrimary: boolean;
}

export interface Note {
  id: string;
  author: string;
  date: Date;
  content: string;
  type: 'General' | 'KYC' | 'Risk' | 'Commercial' | 'Legal';
  isImportant: boolean;
}

export interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  date: Date;
  preview: string;
  hasAttachment: boolean;
  status: 'Sent' | 'Delivered' | 'Opened' | 'Replied';
}

export interface Investor {
  id: number;
  name: string;
  type: string;
  status: string;
  totalInvested: number;
  subscriptionsCount: number;
  registrationDate: Date;
  lastActivity: Date;
  kycStatus: string;
  kycExpiryDate: Date | null;
  crmSegment: string;
  analyst: string;
  partner: string | null;
  country: string;
  email: string;
  phone: string;
  monitoring: boolean;
  riskLevel: 'Low' | 'Medium' | 'High';
  amlScore: number;
  tags: string[];
  structures: LegalStructure[];
  contacts: Contact[];
  signatories: Signatory[];
  notes: Note[];
  emails: Email[];
  
  // Informations supplémentaires
  firstName?: string;
  lastName?: string;
  siren?: string;
  companyName?: string;
  parentInvestor?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  
  // Espace investisseur
  portalActive: boolean;
  lastLogin?: Date;
  portalV2Enabled: boolean;
  
  // Informations relationnelles
  relationshipStartDate: Date;
  referralSource: string;
  marketingOptIn: boolean;
  
  // Informations personnelles
  birthDate?: Date;
  birthPlace?: string;
  birthDepartment?: string;
  birthCountry?: string;
  nationality?: string;
  language: string;
  maritalStatus?: string;
  matrimonialRegime?: string;
  
  // Informations fiscales
  taxResidence?: string;
  taxAddress?: string;
  taxPostalCode?: string;
  taxCity?: string;
  taxCountry?: string;
  tin?: string;
  
  // Informations bancaires
  iban?: string;
  bic?: string;
  bankDetailsProvided: boolean;
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateInvestorName(type: string): string {
  if (type === 'Individual') {
    const person = getRandomElement(individualInvestorNames);
    return `${person.firstName} ${person.lastName}`;
  } else if (type === 'Company') {
    return getRandomElement(corporateStructures);
  } else if (type === 'Trust') {
    const person = getRandomElement(individualInvestorNames);
    return `${person.lastName} Family Trust`;
  } else {
    return `${getRandomElement(corporateStructures).split(' ')[0]} Foundation`;
  }
}

function generateEmail(name: string): string {
  const cleanName = name.toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, '.');
  const domains = ['gmail.com', 'outlook.com', 'yahoo.fr', 'hotmail.fr', 'protonmail.com'];
  return `${cleanName}@${getRandomElement(domains)}`;
}

function generatePhone(): string {
  return `+33 ${Math.floor(Math.random() * 9) + 1} ${String(Math.floor(Math.random() * 90000000) + 10000000).match(/.{1,2}/g)?.join(' ')}`;
}

function generateStructures(investorName: string, count: number): LegalStructure[] {
  const structureTypes: ('SCI' | 'SARL' | 'SAS' | 'SA' | 'Trust' | 'Foundation' | 'Holding')[] = 
    ['SCI', 'SARL', 'SAS', 'SA', 'Trust', 'Foundation', 'Holding'];
  
  const structures: LegalStructure[] = [];
  
  for (let i = 0; i < count; i++) {
    const structureType = getRandomElement(structureTypes);
    let structureName = '';
    
    // Générer un nom basé sur le type
    if (structureType === 'SCI') {
      structureName = `SCI ${investorName.split(' ')[0]} Patrimoine ${i + 1}`;
    } else if (structureType === 'Trust') {
      structureName = `${investorName.split(' ')[0]} Family Trust ${i > 0 ? i + 1 : ''}`.trim();
    } else if (structureType === 'Foundation') {
      structureName = `Fondation ${investorName.split(' ')[0]} ${i > 0 ? i + 1 : ''}`.trim();
    } else if (structureType === 'Holding') {
      structureName = `Holding ${investorName.split(' ')[0]} ${i > 0 ? i + 1 : ''}`.trim();
    } else {
      structureName = `${investorName.split(' ')[0]} ${structureType} ${i > 0 ? i + 1 : ''}`.trim();
    }
    
    structures.push({
      id: `STR${1000 + i}`,
      name: structureName,
      type: structureType,
      participationId: Math.random() > 0.5 ? `#${300 + i}` : undefined,
      contactsCount: Math.floor(Math.random() * 5) + 1,
      subscriptionsCount: Math.floor(Math.random() * 10) + 1,
      totalInvested: Math.floor(Math.random() * 4990000) + 10000, // Montant total investi en euros
      kycStatus: getRandomElement(['Validé', 'En cours', 'À revoir', 'Non commencé']),
      riskScore: Math.floor(Math.random() * 100),
      legalRepresentative: getRandomElement(individualInvestorNames).firstName + ' ' + getRandomElement(individualInvestorNames).lastName
    });
  }
  
  return structures;
}

function generateContacts(investorName: string, investorEmail: string, investorPhone: string, count: number): Contact[] {
  const contacts: Contact[] = [];
  const accessLevels: ('Read Only' | 'Full Access' | 'Admin')[] = ['Read Only', 'Full Access', 'Admin'];
  const languages = ['Français', 'English', 'Español', 'Deutsch', 'Italiano', 'Português'];
  
  for (let i = 0; i < count; i++) {
    const person = getRandomElement(individualInvestorNames);
    const isPrimary = i === 0;
    
    // Pour le contact principal, utiliser les coordonnées de l'investisseur si c'est un Individual
    const firstName = isPrimary && investorName.split(' ').length === 2 
      ? investorName.split(' ')[0] 
      : person.firstName;
    const lastName = isPrimary && investorName.split(' ').length === 2 
      ? investorName.split(' ')[1] 
      : person.lastName;
    const email = isPrimary && investorName.split(' ').length === 2 
      ? investorEmail 
      : generateEmail(`${firstName} ${lastName}`);
    const phone = isPrimary && investorName.split(' ').length === 2 
      ? investorPhone 
      : generatePhone();
    
    const hasAccess = Math.random() > 0.3;
    
    contacts.push({
      id: `CNT${1000 + i}`,
      firstName,
      lastName,
      function: getRandomElement(contactFunctions),
      email,
      phone,
      isPrimary,
      hasPortalAccess: hasAccess,
      accessLevel: hasAccess ? getRandomElement(accessLevels) : undefined,
      language: getRandomElement(languages)
    });
  }
  
  return contacts;
}

function generateSignatories(investorName: string, contacts: Contact[], count: number): Signatory[] {
  const signatories: Signatory[] = [];
  const signatureLevels: ('Individual' | 'Joint' | 'Any')[] = ['Individual', 'Joint', 'Any'];
  
  // Utiliser certains contacts comme signataires
  const availableContacts = [...contacts];
  
  for (let i = 0; i < count && i < availableContacts.length; i++) {
    const contact = availableContacts[i];
    
    signatories.push({
      id: `SIG${1000 + i}`,
      firstName: contact.firstName,
      lastName: contact.lastName,
      function: contact.function,
      email: contact.email,
      phone: contact.phone,
      signatureLevel: getRandomElement(signatureLevels),
      isPrimary: i === 0
    });
  }
  
  return signatories;
}

function generateNotes(investorId: number, count: number): Note[] {
  const notes: Note[] = [];
  const authors = ['Thomas', 'Sophie Martin', 'Marc Dubois', 'Claire Bernard', 'Alex Chen'];
  const noteTypes: ('General' | 'KYC' | 'Risk' | 'Commercial' | 'Legal')[] = ['General', 'KYC', 'Risk', 'Commercial', 'Legal'];
  
  const noteTemplates = {
    'General': [
      'Appel téléphonique avec l\'investisseur pour discuter des opportunités d\'investissement.',
      'Réunion planifiée pour le mois prochain concernant les nouvelles structures.',
      'Investisseur très satisfait du service client et de la transparence.',
      'Demande de documentation supplémentaire sur les fonds disponibles.'
    ],
    'KYC': [
      'Documents KYC reçus et vérifiés. Tout est en ordre.',
      'Mise à jour du KYC nécessaire dans 3 mois.',
      'Vérification de la source des fonds effectuée avec succès.',
      'Documents d\'identité expirés - relance envoyée.'
    ],
    'Risk': [
      'Profil de risque faible confirmé après analyse.',
      'Augmentation du score AML suite à nouvelle activité - à surveiller.',
      'Aucun élément suspicieux détecté lors du dernier screening.',
      'Révision du niveau de risque recommandée.'
    ],
    'Commercial': [
      'Intéressé par les opportunités de co-investissement.',
      'Discussion sur l\'augmentation du ticket d\'investissement.',
      'Recommandation de nouveaux investisseurs potentiels.',
      'Feedback positif sur les dernières opérations.'
    ],
    'Legal': [
      'Révision des contrats en cours avec le département juridique.',
      'Nouvelle procuration signée et archivée.',
      'Conformité aux nouvelles régulations vérifiée.',
      'Documents légaux mis à jour suite au changement de statut.'
    ]
  };
  
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const noteType = getRandomElement(noteTypes);
    const daysAgo = Math.floor(Math.random() * 180); // Notes sur les 6 derniers mois
    const noteDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    notes.push({
      id: `NOTE${investorId * 100 + i}`,
      author: getRandomElement(authors),
      date: noteDate,
      content: getRandomElement(noteTemplates[noteType]),
      type: noteType,
      isImportant: Math.random() > 0.7
    });
  }
  
  // Trier par date décroissante
  return notes.sort((a, b) => b.date.getTime() - a.date.getTime());
}

function generateEmails(investorName: string, investorEmail: string, count: number): Email[] {
  const emails: Email[] = [];
  const statuses: ('Sent' | 'Delivered' | 'Opened' | 'Replied')[] = ['Sent', 'Delivered', 'Opened', 'Replied'];
  
  const emailTemplates = [
    {
      subject: 'Bienvenue chez InvestHub',
      preview: 'Nous sommes ravis de vous compter parmi nos investisseurs...'
    },
    {
      subject: 'Nouvelle opportunité d\'investissement',
      preview: 'Découvrez notre dernière opportunité : Fonds Innovation Tech 2025...'
    },
    {
      subject: 'Mise à jour de votre KYC',
      preview: 'Il est temps de mettre à jour vos documents KYC...'
    },
    {
      subject: 'Rapport trimestriel Q1 2025',
      preview: 'Voici votre rapport de performance pour le premier trimestre...'
    },
    {
      subject: 'Confirmation de votre souscription',
      preview: 'Votre souscription a bien été enregistrée et est en cours de traitement...'
    },
    {
      subject: 'Invitation : Webinaire sur les tendances du marché',
      preview: 'Rejoignez-nous le 15 mars pour notre webinaire exclusif...'
    },
    {
      subject: 'Relevé de compte - Février 2025',
      preview: 'Veuillez trouver ci-joint votre relevé de compte mensuel...'
    },
    {
      subject: 'Demande de documents complémentaires',
      preview: 'Pour finaliser votre dossier, nous avons besoin de...'
    }
  ];
  
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 90); // Emails sur les 3 derniers mois
    const emailDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const template = getRandomElement(emailTemplates);
    
    emails.push({
      id: `EMAIL${1000 + i}`,
      from: 'contact@investhub.io',
      to: investorEmail,
      subject: template.subject,
      date: emailDate,
      preview: template.preview,
      hasAttachment: Math.random() > 0.6,
      status: getRandomElement(statuses)
    });
  }
  
  // Trier par date décroissante
  return emails.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function generateInvestors(count: number): Investor[] {
  const investors: Investor[] = [];
  const now = new Date();
  const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
  
  for (let i = 1; i <= count; i++) {
    const type = getRandomElement(types);
    const name = generateInvestorName(type);
    const status = getRandomElement(statuses);
    const kycStatus = getRandomElement(kycStatuses);
    const registrationDate = getRandomDate(fiveYearsAgo, now);
    const lastActivity = getRandomDate(registrationDate, now);
    const hasPartner = Math.random() > 0.3;
    const isMonitored = Math.random() > 0.5;
    const riskLevel = getRandomElement(['Low', 'Medium', 'High'] as const);
    
    // Générer le montant investi (entre 10k et 5M)
    // Les prospects n'ont pas encore investi, donc totalInvested = 0
    const totalInvested = status === 'Prospect' ? 0 : Math.floor(Math.random() * 4990000) + 10000;
    
    // Nombre de souscriptions (entre 1 et 15)
    // Les prospects n'ont pas encore de souscriptions
    const subscriptionsCount = status === 'Prospect' ? 0 : Math.floor(Math.random() * 15) + 1;
    
    // Score AML (entre 0 et 100)
    const amlScore = Math.floor(Math.random() * 100);
    
    // Segment CRM (peut être vide pour certains investisseurs - 30% de chance)
    const crmSegment = Math.random() > 0.3 ? getRandomElement(crmSegmentsList) : '';
    
    // Date d'expiration KYC
    const kycExpiryDate = kycStatus === 'Validé' 
      ? new Date(lastActivity.getFullYear() + 1, lastActivity.getMonth(), lastActivity.getDate())
      : null;
    
    // Tags aléatoires
    const allTags = ['VIP', 'High Volume', 'Newcomer', 'Frequent', 'Premium', 'Standard'];
    const tagCount = Math.floor(Math.random() * 3);
    const tags = [];
    for (let j = 0; j < tagCount; j++) {
      const tag = getRandomElement(allTags);
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    }
    
    // Générer les structures légales (entre 1 et 4 structures)
    const structuresCount = Math.floor(Math.random() * 4) + 1;
    const structures = generateStructures(name, structuresCount);
    
    // Générer l'email et le téléphone
    const email = generateEmail(name);
    const phone = generatePhone();
    
    // Générer les contacts (entre 1 et 5 contacts)
    const contactsCount = Math.floor(Math.random() * 5) + 1;
    const contacts = generateContacts(name, email, phone, contactsCount);
    
    // Générer les signataires (entre 1 et 3 signataires)
    const signatoriesCount = Math.min(Math.floor(Math.random() * 3) + 1, contacts.length);
    const signatories = generateSignatories(name, contacts, signatoriesCount);
    
    // Générer les notes (entre 2 et 8 notes)
    const notesCount = Math.floor(Math.random() * 7) + 2;
    const notes = generateNotes(i, notesCount);
    
    // Générer les emails (entre 5 et 20 emails)
    const emailsCount = Math.floor(Math.random() * 16) + 5;
    const emails = generateEmails(name, email, emailsCount);
    
    // Informations supplémentaires pour les Individual
    const firstName = type === 'Individual' && name.split(' ').length === 2 ? name.split(' ')[0] : undefined;
    const lastName = type === 'Individual' && name.split(' ').length === 2 ? name.split(' ')[1] : undefined;
    
    // SIREN pour les PM
    const siren = type === 'Company' ? `${Math.floor(Math.random() * 900000000) + 100000000}` : undefined;
    const companyName = type === 'Company' ? name : undefined;
    
    // Investisseur de rattachement (20% de chance)
    const parentInvestor = Math.random() > 0.8 ? getRandomElement(individualInvestorNames).firstName + ' ' + getRandomElement(individualInvestorNames).lastName : undefined;
    
    // Adresse
    const cityData = getRandomElement(countries);
    const address = `${Math.floor(Math.random() * 200) + 1} ${getRandomElement(['Rue', 'Avenue', 'Boulevard'])} ${getRandomElement(['de la République', 'Victor Hugo', 'des Champs-Élysées', 'Montaigne', 'Haussmann'])}`;
    const postalCode = `${Math.floor(Math.random() * 90000) + 10000}`;
    const city = getRandomElement(['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Bordeaux', 'Lille']);
    
    // Espace investisseur
    const portalActive = Math.random() > 0.3;
    const lastLogin = portalActive ? new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined;
    const portalV2Enabled = portalActive && Math.random() > 0.5;
    
    // Informations relationnelles
    const relationshipStartDate = registrationDate;
    const referralSources = ['Investisseur professionnel', 'Recommandation', 'Site web', 'Événement', 'Partenaire', 'Publicité', 'Réseau social'];
    const referralSource = getRandomElement(referralSources);
    const marketingOptIn = Math.random() > 0.4;
    
    // Informations personnelles (principalement pour Individual)
    const birthDate = type === 'Individual' ? new Date(1950 + Math.floor(Math.random() * 50), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1) : undefined;
    const birthPlace = type === 'Individual' ? city : undefined;
    const birthDepartment = type === 'Individual' ? `${Math.floor(Math.random() * 95) + 1}` : undefined;
    const birthCountry = type === 'Individual' ? getRandomElement(countries) : undefined;
    const nationality = type === 'Individual' ? getRandomElement(countries) : undefined;
    const languages = ['Français', 'English', 'Español', 'Deutsch', 'Italiano'];
    const language = getRandomElement(languages);
    const maritalStatuses = ['Célibataire', 'Marié(e)', 'Pacsé(e)', 'Divorcé(e)', 'Veuf(ve)'];
    const maritalStatus = type === 'Individual' ? getRandomElement(maritalStatuses) : undefined;
    const matrimonialRegimes = ['Communauté réduite aux acquêts', 'Séparation de biens', 'Communauté universelle', 'Participation aux acquêts'];
    const matrimonialRegime = type === 'Individual' && maritalStatus === 'Marié(e)' ? getRandomElement(matrimonialRegimes) : undefined;
    
    // Informations fiscales (60% complètes)
    const hasTaxInfo = Math.random() > 0.4;
    const taxResidence = hasTaxInfo ? getRandomElement(countries) : undefined;
    const taxAddress = hasTaxInfo ? address : undefined;
    const taxPostalCode = hasTaxInfo ? postalCode : undefined;
    const taxCity = hasTaxInfo ? city : undefined;
    const taxCountry = hasTaxInfo ? taxResidence : undefined;
    const tin = hasTaxInfo ? `${Math.floor(Math.random() * 900000000000) + 100000000000}` : undefined;
    
    // Informations bancaires (50% complètes)
    const bankDetailsProvided = Math.random() > 0.5;
    const iban = bankDetailsProvided ? `FR${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 90000000000) + 10000000000}` : undefined;
    const bic = bankDetailsProvided ? `${getRandomElement(['BNPA', 'SOGEFRPP', 'CEPAFRPP', 'CMCIFRPP', 'AGRIFRPP'])}XXX` : undefined;
    
    investors.push({
      id: i,
      name,
      type,
      status,
      totalInvested,
      subscriptionsCount,
      registrationDate,
      lastActivity,
      kycStatus,
      kycExpiryDate,
      crmSegment,
      analyst: getRandomElement(analysts),
      partner: hasPartner ? getRandomElement(partnerNames) : null,
      country: getRandomElement(countries),
      email,
      phone,
      monitoring: isMonitored,
      riskLevel,
      amlScore,
      tags,
      structures,
      contacts,
      signatories,
      notes,
      emails,
      
      // Informations supplémentaires
      firstName,
      lastName,
      siren,
      companyName,
      parentInvestor,
      address,
      postalCode,
      city,
      
      // Espace investisseur
      portalActive,
      lastLogin,
      portalV2Enabled,
      
      // Informations relationnelles
      relationshipStartDate,
      referralSource,
      marketingOptIn,
      
      // Informations personnelles
      birthDate,
      birthPlace,
      birthDepartment,
      birthCountry,
      nationality,
      language,
      maritalStatus,
      matrimonialRegime,
      
      // Informations fiscales
      taxResidence,
      taxAddress,
      taxPostalCode,
      taxCity,
      taxCountry,
      tin,
      
      // Informations bancaires
      iban,
      bic,
      bankDetailsProvided
    });
  }
  
  return investors;
}

// Fonction pour générer les souscriptions d'un investisseur spécifique
export function generateInvestorSubscriptions(investor: Investor, allSubscriptions: any[]): any[] {
  // Filtrer les souscriptions qui correspondent à l'investisseur
  // Pour simplifier, on va juste retourner un subset aléatoire
  const investorSubscriptions = allSubscriptions
    .filter(() => Math.random() < 0.1) // 10% de chance pour chaque souscription
    .slice(0, investor.subscriptionsCount); // Limiter au nombre de souscriptions de l'investisseur
  
  return investorSubscriptions;
}