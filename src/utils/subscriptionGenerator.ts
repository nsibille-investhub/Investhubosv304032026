// Générateur de données mock pour les souscriptions avec la même structure que les entités

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
  { firstName: 'Laurent', lastName: 'Simon' }
];

// Structures pour Individual (PP) - Holdings, SCI, etc.
const individualStructures = [
  'SCI Patrimoine Martin',
  'Holding Dubois Investissement',
  'SCI Immobilière Bernard',
  'Holding Familiale Durand',
  'SCI Petit & Associés',
  'Holding Lambert Capital',
  'SCI Rousseau Patrimoine',
  'Family Office Moreau',
  'SCI Girard Investissement',
  'Holding Simon Family'
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
  'Zenith Investments'
];

// Contacts principaux (personnes physiques)
const contactNames = [
  { firstName: 'Thomas', lastName: 'Lefebvre' },
  { firstName: 'Emma', lastName: 'Roux' },
  { firstName: 'Alexandre', lastName: 'Petit' },
  { firstName: 'Camille', lastName: 'Mercier' },
  { firstName: 'Lucas', lastName: 'Fontaine' },
  { firstName: 'Léa', lastName: 'Chevalier' },
  { firstName: 'Hugo', lastName: 'Blanc' },
  { firstName: 'Chloé', lastName: 'Garnier' },
  { firstName: 'Maxime', lastName: 'Faure' },
  { firstName: 'Julie', lastName: 'André' }
];

// Signataires possibles avec leurs rôles
const signatoriesPool = [
  { firstName: 'Jacques', lastName: 'Durand', role: 'Directeur Général' },
  { firstName: 'Sophie', lastName: 'Laurent', role: 'Directrice Financière' },
  { firstName: 'Marc', lastName: 'Bernard', role: 'Président' },
  { firstName: 'Élodie', lastName: 'Morel', role: 'Responsable Juridique' },
  { firstName: 'Pierre', lastName: 'Fontaine', role: 'Administrateur' },
  { firstName: 'Céline', lastName: 'Garnier', role: 'Trésorière' },
  { firstName: 'Antoine', lastName: 'Rousseau', role: 'Mandataire' },
  { firstName: 'Nathalie', lastName: 'Blanc', role: 'Co-signataire' },
  { firstName: 'Olivier', lastName: 'Mercier', role: 'Représentant légal' },
  { firstName: 'Isabelle', lastName: 'Dubois', role: 'Directrice Générale Déléguée' }
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

const fundNames = [
  'FutureInvest Fund',
  'Alpha Growth Fund',
  'Euro Dynamic Fund',
  'Global Opportunities',
  'Tech Innovation Fund',
  'Sustainable Growth',
  'Value Creation Fund',
  'Strategic Alpha'
];

const shareClasses = ['A', 'B', 'C', 'I', 'R'];

const types = ['Individual', 'Corporate', 'Trust', 'Foundation'];

// 8 états vivants
const activeStatuses = [
  'Draft',
  'Onboarding',
  'À signer',
  'Investisseur signé',
  'Exécuté',
  'En attente de fonds',
  'En attente de paiement',
  'Active'
];

// 4 états inactifs (fin de vie / exception)
const inactiveStatuses = [
  'Rejected',
  'Cancelled',
  'Expired',
  'Archived'
];

const allStatuses = [...activeStatuses, ...inactiveStatuses];

const analysts = ['Thomas', 'Sophie Martin', 'Marc Dubois', 'Claire Bernard', 'Alex Chen'];

const kycStatuses = ['in progress', 'in review', 'to review', 'validated'];
const crmSegmentsList = [
  'HNWI', // High Net Worth Individual
  'UHNWI', // Ultra High Net Worth Individual
  'Institutional',
  'Family Office',
  'Corporate',
  'Retail',
  'Professional',
  'VIP',
  'Strategic'
];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomAmount(): number {
  const amounts = [50000, 100000, 250000, 500000, 750000, 1000000, 1500000, 2000000];
  return randomElement(amounts);
}

function randomDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - randomNumber(1, daysAgo));
  return date;
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString('en-GB');
}

export interface Subscription {
  id: number;
  name: string;
  status: string;
  type: string;
  contrepartie: {
    name: string;
    id: string;
    type: 'individual' | 'corporate';
    // Pour Corporate
    structure?: string; // Nom de l'entreprise qui souscrit
    investor?: string; // Nom de l'investisseur (entreprise ou personne)
    investorType?: 'corporate' | 'individual'; // Type d'investisseur
    mainContact?: string; // Nom du contact principal (personne physique)
    // Pour Individual (investorName suffit)
    country?: string;
    riskLevel?: string;
    // KYC Status
    kycStatus: 'in progress' | 'in review' | 'to review' | 'validated';
    // Segments CRM
    crmSegments: string[];
  };
  exposure: string;
  riskLevel: string;
  monitoring: boolean;
  hits: number;
  decisions: number;
  analyst: string;
  fund: {
    name: string;
    shareClass: string;
  };
  amount: number;
  quantity: number;
  completionOnboarding: number;
  createdAt: Date;
  updatedAt: Date;
  partenaire: {
    name: string;
    id: string;
    type: 'corporate';
  } | null;
  // Signatures
  signatures: {
    required: number;
    completed: number;
    signatories: {
      name: string;
      role: string;
      status: 'signed' | 'pending';
      signedAt?: Date;
    }[];
  };
  lastUpdate: {
    relativeTime: string;
    timestamp: number;
  };
  // Propriétés supplémentaires pour compatibilité avec les entités
  secondaryStatus?: 'rejected' | 'archived' | 'deleted' | 'flagged';
  details?: any;
  // Propriétés raccourcies pour affichage facile
  product?: string; // Alias pour fund.name
  shareClass?: string; // Alias pour fund.shareClass
  structure?: string | null; // Alias pour contrepartie.structure (null si Individual)
  createdDate?: Date; // Alias pour createdAt
  partner?: string; // Alias pour partenaire.name
  
  // 🆕 Nouveaux champs pour colonnes dynamiques
  source?: 'campagne' | 'manuel' | 'import' | 'api'; // Origine de la souscription
  onboardingStatus?: string; // Statut synthétique onboarding
  blockageReason?: string | null; // Motif de blocage principal
  lastActionDate?: Date; // Date de dernière action
  signatureStatus?: string; // Statut synthétique de signature
  missingSigners?: number; // Nombre de signataires manquants
  sentToSignatureAt?: Date | null; // Date d'envoi à signature
  lastReminderAt?: Date | null; // Date de dernière relance
  signatureChannel?: 'e-signature' | 'papier'; // Canal de signature
  counterSignatureStatus?: string; // Statut de contre-signature
  counterSignatureOwner?: string; // Responsable de la contre-signature
  investorSignedAt?: Date | null; // Date de signature investisseur
  daysSinceSignature?: number | null; // Jours écoulés depuis signature investisseur
  calledAmount?: number; // Montant appelé (déjà versé)
  pendingCallAmount?: number; // Montant appelé en attente
  remainingAmount?: number; // Montant restant à appeler
  distributedAmount?: number; // Montant distribué
  hasDepositary?: boolean; // Dépositaire oui/non
  activatedAt?: Date | null; // Date d'activation
  notes?: string | null; // Notes supplémentaires
  entryFees?: number; // Frais d'entrée en %
  language?: 'fr' | 'en' | 'de' | 'it' | 'es'; // Langue de la souscription
  sepaEnabled?: boolean; // Prélèvement SEPA activé
  pendingCalls?: boolean; // Appels en attente
  onboardingReopened?: number; // Nombre de réouvertures de l'onboarding
}

export function generateSubscriptions(count: number): Subscription[] {
  const subscriptions: Subscription[] = [];
  
  for (let i = 0; i < count; i++) {
    const createdDate = randomDate(60);
    const updatedDate = randomDate(30);
    
    // 80% actives, 20% inactifs
    const isActive = Math.random() > 0.2;
    const status = isActive ? randomElement(activeStatuses) : randomElement(inactiveStatuses);
    const type = randomElement(types);
    
    // Générer les hits et décisions en fonction du statut
    let hits = 0;
    let decisions = 0;
    
    // Pour les statuts actifs, on génère des hits/décisions
    if (isActive) {
      hits = randomNumber(2, 10);
      decisions = randomNumber(0, hits);
    } else {
      // Pour les inactifs, généralement tous traités
      hits = randomNumber(1, 5);
      decisions = hits;
    }
    
    // Completion onboarding selon le statut
    let completionOnboarding = 0;
    switch (status) {
      case 'Draft':
        completionOnboarding = randomNumber(0, 30);
        break;
      case 'Onboarding':
        completionOnboarding = randomNumber(30, 70);
        break;
      case 'À signer':
        completionOnboarding = randomNumber(70, 85);
        break;
      case 'Investisseur signé':
        completionOnboarding = randomNumber(85, 95);
        break;
      case 'Exécuté':
      case 'En attente de fonds':
      case 'Active':
        completionOnboarding = 100;
        break;
      case 'Rejected':
      case 'Cancelled':
      case 'Expired':
        completionOnboarding = randomNumber(20, 80);
        break;
      case 'Archived':
        completionOnboarding = 100;
        break;
      default:
        completionOnboarding = randomNumber(10, 90);
    }
    
    // Générer la contrepartie selon le type
    let contrepartie;
    const riskLevel = randomElement(['Low', 'Medium', 'High']);
    const country = randomElement(['France', 'Luxembourg', 'Switzerland', 'Belgium', 'Monaco']);
    const kycStatus = randomElement(kycStatuses);
    
    // Générer 1 à 3 segments CRM
    const numSegments = randomNumber(1, 3);
    const crmSegments: string[] = [];
    const availableSegments = [...crmSegmentsList];
    for (let j = 0; j < numSegments; j++) {
      if (availableSegments.length > 0) {
        const segmentIndex = randomNumber(0, availableSegments.length - 1);
        crmSegments.push(availableSegments[segmentIndex]);
        availableSegments.splice(segmentIndex, 1);
      }
    }
    
    // Générer les signatures - toutes les souscriptions en ont (minimum 1, maximum 2)
    const numSignatories = randomNumber(1, 2);
    const requiredSignatures = numSignatories;
    const availableSignatories = [...signatoriesPool];
    const signatoriesList = [];
    
    for (let j = 0; j < numSignatories; j++) {
      if (availableSignatories.length > 0) {
        const signatoryIndex = randomNumber(0, availableSignatories.length - 1);
        const signatory = availableSignatories[signatoryIndex];
        availableSignatories.splice(signatoryIndex, 1);
        
        // Déterminer si ce signataire a signé ou non
        // Plus le statut est avancé, plus il y a de signatures complétées
        let hasSigned = false;
        if (status === 'Exécuté' || status === 'En attente de fonds' || status === 'Active' || status === 'Archived') {
          hasSigned = true; // Tous signé pour ces statuts
        } else if (status === 'Investisseur signé') {
          hasSigned = Math.random() > 0.3; // 70% des signatures
        } else if (status === 'À signer') {
          hasSigned = Math.random() > 0.7; // 30% des signatures
        }
        
        signatoriesList.push({
          name: `${signatory.firstName} ${signatory.lastName}`,
          role: signatory.role,
          status: hasSigned ? 'signed' as const : 'pending' as const,
          signedAt: hasSigned ? randomDate(20) : undefined
        });
      }
    }
    
    const completedSignatures = signatoriesList.filter(s => s.status === 'signed').length;
    
    const signatures = {
      required: requiredSignatures,
      completed: completedSignatures,
      signatories: signatoriesList
    };
    
    /**
     * GÉNÉRATION DE LA CONTREPARTIE - 4 CAS D'USAGE
     * 
     * CAS 1: Individu (PP) investit EN DIRECT (40%)
     *        - type: 'individual', structure: undefined
     *        - Affichage: "Sophie Martin" + badge "Individual"
     * 
     * CAS 2: Individu (PP) investit VIA STRUCTURE (60%)
     *        - type: 'individual', structure: "SCI Patrimoine Martin"
     *        - Affichage: "Sophie Martin" + lien "SCI Patrimoine Martin"
     * 
     * CAS 3: Entreprise (PM) investit EN DIRECT (30%)
     *        - type: 'corporate', structure: undefined
     *        - Affichage: "Alpha Group" + badge "Company"
     * 
     * CAS 4: Entreprise (PM) investit VIA STRUCTURE (70%)
     *        - type: 'corporate', structure: "Alpha Capital Holding"
     *        - Affichage: "Alpha Group" + lien "Alpha Capital Holding"
     */
    
    if (type === 'Individual') {
      // Pour Individual : 60% via structure, 40% en direct
      const investor = randomElement(individualInvestorNames);
      const hasStructure = Math.random() > 0.4;
      
      contrepartie = {
        name: `${investor.firstName} ${investor.lastName}`,
        id: `INV-${randomNumber(1000, 9999)}`,
        type: 'individual' as const,
        structure: hasStructure ? randomElement(individualStructures) : undefined,
        country,
        riskLevel,
        kycStatus: kycStatus as 'in progress' | 'in review' | 'to review' | 'validated',
        crmSegments
      };
    } else {
      // Pour Corporate : 70% via structure, 30% en direct
      const hasStructure = Math.random() > 0.3;
      const structure = hasStructure ? randomElement(corporateStructures) : undefined;
      const investorType = Math.random() > 0.5 ? 'corporate' : 'individual';
      
      let investorName;
      if (investorType === 'corporate') {
        investorName = randomElement(['Alpha Group', 'Beta Ventures', 'Gamma Capital', 'Delta Partners', 'Epsilon Fund']);
      } else {
        const inv = randomElement(individualInvestorNames);
        investorName = `${inv.firstName} ${inv.lastName}`;
      }
      
      const contact = randomElement(contactNames);
      
      contrepartie = {
        name: hasStructure ? structure! : investorName, // Le nom principal affiché sera la structure ou l'investisseur
        id: `INV-${randomNumber(1000, 9999)}`,
        type: 'corporate' as const,
        structure: hasStructure ? structure : undefined,
        investor: investorName,
        investorType,
        mainContact: `${contact.firstName} ${contact.lastName}`,
        country,
        riskLevel,
        kycStatus: kycStatus as 'in progress' | 'in review' | 'to review' | 'validated',
        crmSegments
      };
    }
    
    const fund = randomElement(fundNames);
    const shareClass = randomElement(shareClasses);
    
    // Générer le nom de la souscription : nom investisseur, montant, fond part
    const amount = randomAmount();
    const investorDisplayName = type === 'Individual' ? contrepartie.name : contrepartie.investor;
    const subscriptionName = `${investorDisplayName} - €${(amount / 1000)}K - ${fund} Part ${shareClass}`;

    // 30% de souscriptions directes (sans partenaire), 70% via partenaire
    const isDirect = Math.random() > 0.7;
    const partnerName = isDirect ? null : randomElement(partnerNames);
    
    // 🆕 Générer les nouveaux champs selon le statut
    const source = randomElement(['campagne', 'manuel', 'import', 'api'] as const);
    const signatureChannel = randomElement(['e-signature', 'papier'] as const);
    
    // Onboarding status
    const hasBlockage = completionOnboarding < 100 && Math.random() > 0.7;
    let onboardingStatus = 'Non démarré';
    if (completionOnboarding === 100) onboardingStatus = 'Complété';
    else if (hasBlockage) onboardingStatus = 'Bloqué';
    else if (completionOnboarding >= 75) onboardingStatus = 'En cours avancé';
    else if (completionOnboarding >= 50) onboardingStatus = 'En cours';
    else if (completionOnboarding >= 25) onboardingStatus = 'Démarré';
    
    const blockageReasons = [
      'Document manquant',
      'Identité non vérifiée',
      'Adresse incomplète',
      'Justificatif de domicile',
      'Preuve de fonds',
      null
    ];
    const blockageReason = hasBlockage ? randomElement(blockageReasons.slice(0, -1)) : null;
    
    const lastActionDate = randomDate(10);
    
    // Signature status
    const missingSigners = signatures.required - signatures.completed;
    let signatureStatus = 'Non envoyée';
    if (status === 'À signer' || status === 'Investisseur signé') {
      if (signatures.completed === 0) signatureStatus = 'En attente';
      else if (signatures.completed < signatures.required) signatureStatus = 'Partiellement signée';
      else signatureStatus = 'Complétée';
    } else if (status === 'Exécuté' || status === 'Active') {
      signatureStatus = 'Complétée';
    }
    
    const sentToSignatureAt = ['À signer', 'Investisseur signé', 'Exécuté', 'Active'].includes(status)
      ? randomDate(15)
      : null;
    const lastReminderAt = sentToSignatureAt && Math.random() > 0.5 ? randomDate(5) : null;
    
    // Counter-signature
    const counterSignatureOwners = ['Jean Dupont', 'Marie Laurent', 'Pierre Bernard'];
    const counterSignatureOwner = status === 'Investisseur signé' ? randomElement(counterSignatureOwners) : '';
    let counterSignatureStatus = 'Non requis';
    if (status === 'Investisseur signé') {
      counterSignatureStatus = Math.random() > 0.5 ? 'En attente' : 'En cours';
    } else if (status === 'Exécuté' || status === 'Active') {
      counterSignatureStatus = 'Complétée';
    }
    
    const investorSignedAt = status === 'Investisseur signé' || status === 'Exécuté' || status === 'Active'
      ? randomDate(20)
      : null;
    const daysSinceSignature = investorSignedAt
      ? Math.floor((new Date().getTime() - investorSignedAt.getTime()) / (1000 * 60 * 60 * 24))
      : null;
    
    // Active status fields
    const calledAmount = status === 'Active' ? Math.floor(amount * (randomNumber(20, 80) / 100)) : 0;
    const pendingCallAmount = status === 'Active' ? Math.floor(amount * (randomNumber(5, 20) / 100)) : 0;
    const remainingAmount = status === 'Active' ? amount - calledAmount - pendingCallAmount : amount;
    const distributedAmount = status === 'Active' && Math.random() > 0.3 ? Math.floor(calledAmount * (randomNumber(10, 40) / 100)) : 0;
    const hasDepositary = Math.random() > 0.5;
    const activatedAt = status === 'Active' ? randomDate(30) : null;
    
    // Notes
    const possibleNotes = [
      'Investisseur VIP - Priorité haute',
      'Dossier en attente de validation compliance',
      'Contact préférentiel par email',
      'Nouveau client - traiter avec attention',
      'Renouvellement d\'investissement',
      null,
      null,
      null
    ];
    const notes = Math.random() > 0.7 ? randomElement(possibleNotes) : null;
    
    // Frais d'entrée (0%, 2%, 3%, 5%)
    const entryFeesOptions = [0, 2, 3, 5];
    const entryFees = randomElement(entryFeesOptions);
    
    // Langue de la souscription
    const languages = ['fr', 'en', 'de', 'it', 'es'];
    const language = randomElement(languages);
    
    // SEPA activé (70% activé)
    const sepaEnabled = Math.random() > 0.3;
    
    // Appels en attente (uniquement pour les souscriptions actives, 30% de chances)
    const pendingCalls = status === 'Active' && Math.random() > 0.7;
    
    // Nombre de réouvertures de l'onboarding (0-3)
    const onboardingReopened = Math.random() > 0.8 ? randomNumber(1, 3) : 0;
    
    const subscription: Subscription = {
      id: i + 1,
      name: subscriptionName,
      status,
      type,
      contrepartie,
      exposure: randomElement(['PEP', 'Sanctions', 'Adverse Media', 'None']),
      riskLevel,
      monitoring: Math.random() > 0.5,
      hits,
      decisions,
      analyst: status !== 'Draft' ? randomElement(analysts) : '',
      fund: {
        name: fund,
        shareClass
      },
      amount,
      quantity: randomNumber(1, 10),
      completionOnboarding,
      createdAt: createdDate,
      updatedAt: updatedDate,
      partenaire: partnerName ? {
        name: partnerName,
        id: `PART-${randomNumber(100, 999)}`,
        type: 'corporate'
      } : null,
      signatures,
      lastUpdate: {
        relativeTime: getRelativeTime(updatedDate),
        timestamp: updatedDate.getTime()
      },
      details: {
        alerts: []
      },
      // Propriétés raccourcies pour affichage facile
      product: fund,
      shareClass: shareClass,
      structure: type === 'Corporate' ? contrepartie.structure : null,
      createdDate: createdDate,
      partner: partnerName,
      // 🆕 Nouveaux champs
      source,
      onboardingStatus,
      blockageReason,
      lastActionDate,
      signatureStatus,
      missingSigners,
      sentToSignatureAt,
      lastReminderAt,
      signatureChannel,
      counterSignatureStatus,
      counterSignatureOwner,
      investorSignedAt,
      daysSinceSignature,
      calledAmount,
      pendingCallAmount,
      remainingAmount,
      distributedAmount,
      hasDepositary,
      activatedAt,
      notes,
      entryFees,
      language,
      sepaEnabled,
      pendingCalls,
      onboardingReopened
    };
    
    subscriptions.push(subscription);
  }
  
  return subscriptions;
}

// Fonction pour obtenir la couleur du badge de statut
export function getStatusColor(status: string): string {
  switch (status) {
    // États actifs
    case 'Draft':
      return 'bg-gray-50 text-gray-700 border-gray-300';
    case 'Onboarding':
      return 'bg-purple-50 text-purple-700 border-purple-300';
    case 'À signer':
      return 'bg-blue-50 text-blue-700 border-blue-300';
    case 'Investisseur signé':
      return 'bg-cyan-50 text-cyan-700 border-cyan-300';
    case 'Exécuté':
      return 'bg-indigo-50 text-indigo-700 border-indigo-300';
    case 'En attente de fonds':
      return 'bg-amber-50 text-amber-700 border-amber-300';
    case 'Active':
      return 'bg-emerald-50 text-emerald-700 border-emerald-300';
    // États inactifs
    case 'Rejected':
      return 'bg-red-50 text-red-700 border-red-300';
    case 'Cancelled':
      return 'bg-orange-50 text-orange-700 border-orange-300';
    case 'Expired':
      return 'bg-rose-50 text-rose-700 border-rose-300';
    case 'Archived':
      return 'bg-slate-50 text-slate-700 border-slate-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

// Fonction pour obtenir la couleur de la barre de complétion
export function getCompletionColor(completion: number): string {
  if (completion === 0) return 'bg-gray-200';
  if (completion < 50) return 'bg-red-500';
  if (completion < 75) return 'bg-orange-500';
  if (completion < 100) return 'bg-blue-500';
  return 'bg-emerald-500';
}

// Fonction pour obtenir la couleur du risk level
export function getRiskColor(risk: string): string {
  switch (risk) {
    case 'Low':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'High':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-amber-50 text-amber-700 border-amber-200';
  }
}
