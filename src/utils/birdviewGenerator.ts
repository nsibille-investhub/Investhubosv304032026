// Générateur de fausses données pour GED+ Birdview

export interface BirdviewEvent {
  id: number;
  timestamp: string;
  timestampFull: string;
  timestampRelative: string;
  eventType: 'notification_sent' | 'notification_opened' | 'document_viewed' | 'document_downloaded';
  eventTypeLabel: string;
  investor: string;
  contact: string;
  contactRole: 'Investisseur' | 'Contact' | 'Conseiller';
  email: string;
  document: string;
  documentId: number;
  space: string;
  folder: string;
  notificationOpened: boolean;
  documentViewed: boolean;
}

export interface BirdviewInvestor {
  id: number;
  name: string;
  type: 'HNWI' | 'UHNWI' | 'Institutional' | 'Professional';
  email: string;
  contacts: BirdviewContact[];
  totalDocuments: number;
  viewedDocuments: number;
  downloadedDocuments: number;
  engagementRate: number;
}

export interface BirdviewContact {
  id: number;
  name: string;
  role: 'Investisseur' | 'Contact' | 'Conseiller';
  relationLabel: string; // "Épouse", "Fils", "Conseiller financier", etc.
  email: string;
  canAccess: boolean;
}

export interface BirdviewSpace {
  id: number;
  name: string;
  investors: string[];
  folders: number;
  documents: number;
  engagementRate: number;
}

const INVESTORS = [
  { name: 'Jean Dault', type: 'HNWI' as const, email: 'jean.dault@investhub.com' },
  { name: 'Sophie Martin', type: 'UHNWI' as const, email: 'sophie.martin@investhub.com' },
  { name: 'ARDIAN GROWTH', type: 'Institutional' as const, email: 'contact@ardian.com' },
  { name: 'Marc Dubois', type: 'HNWI' as const, email: 'marc.dubois@investhub.com' },
  { name: 'VENTECH II', type: 'Institutional' as const, email: 'contact@ventech.fr' },
];

const SPACES = [
  'ARDIAN GROWTH - Main',
  'Investisseurs LP',
  'KORELYA I - Due Diligence',
  'Multi-Fonds HNWI',
  'Partenaires Services',
  'Participations Portfolio',
  'VENTECH I - LP Documents',
  'VENTECH II - Rapports',
];

const DOCUMENTS = [
  'Rapport Trimestriel Q1 2024.pdf',
  'Rapport Trimestriel Q2 2024.pdf',
  'Rapport Annuel 2023.pdf',
  'Due Diligence - Synthèse.pdf',
  'Présentation Investisseurs.pdf',
  'KYC - Formulaire.pdf',
  'Contrat de souscription.pdf',
  'Annexe fiscale.pdf',
  'Performance Report Mars 2024.pdf',
  'NAV Statement.pdf',
  'Audit Report 2023.pdf',
  'Prospectus Fonds.pdf',
  'Règlement AIFM.pdf',
  'Capital Call Notice.pdf',
  'Distribution Notice.pdf',
];

// Contacts pour personnes physiques (HNWI/UHNWI)
const CONTACTS_PHYSICAL = [
  { name: 'Marie Dault', relation: 'Épouse', role: 'Contact' as const },
  { name: 'Thomas Dault', relation: 'Fils', role: 'Contact' as const },
  { name: 'Camille Dault', relation: 'Fille', role: 'Contact' as const },
  { name: 'Alexandre Martin', relation: 'Frère', role: 'Contact' as const },
  { name: 'Claire Dubois', relation: 'Mère', role: 'Contact' as const },
  { name: 'Julien Dault', relation: 'Fils', role: 'Contact' as const },
  { name: 'Sophie Dault', relation: 'Épouse', role: 'Contact' as const },
];

// Contacts pour personnes morales (Institutional)
const CONTACTS_INSTITUTIONAL = [
  { name: 'Laurent Mercier', relation: 'Représentant légal', role: 'Contact' as const },
  { name: 'Isabelle Rousseau', relation: 'Directrice financière', role: 'Contact' as const },
  { name: 'Philippe Bernard', relation: 'Comptable', role: 'Contact' as const },
  { name: 'Caroline Petit', relation: 'Juriste', role: 'Contact' as const },
  { name: 'Vincent Leroy', relation: 'Assistant de direction', role: 'Contact' as const },
  { name: 'Nathalie Moreau', relation: 'Responsable conformité', role: 'Contact' as const },
  { name: 'Éric Fontaine', relation: 'DAF', role: 'Contact' as const },
  { name: 'Sylvie Lambert', relation: 'Secrétaire générale', role: 'Contact' as const },
];

const EVENT_TYPES = [
  { value: 'notification_sent' as const, label: 'Notification envoyée' },
  { value: 'notification_opened' as const, label: 'Notification ouverte' },
  { value: 'document_viewed' as const, label: 'Document consulté' },
  { value: 'document_downloaded' as const, label: 'Document téléchargé' },
];

function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

export function generateBirdviewEvents(count: number): BirdviewEvent[] {
  const events: BirdviewEvent[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.random() * 30;
    const hoursAgo = Math.random() * 24;
    const minutesAgo = Math.random() * 60;
    const timestamp = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000) - (minutesAgo * 60 * 1000));

    const investor = INVESTORS[Math.floor(Math.random() * INVESTORS.length)];
    const document = DOCUMENTS[Math.floor(Math.random() * DOCUMENTS.length)];
    const space = SPACES[Math.floor(Math.random() * SPACES.length)];
    const eventType = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];

    // Générer un contact aléatoire
    const isInvestorHimself = Math.random() > 0.3;
    let contactName = investor.name;
    let contactRole: 'Investisseur' | 'Contact' | 'Conseiller' = 'Investisseur';
    let contactEmail = investor.email;

    if (!isInvestorHimself) {
      const isInstitutional = investor.type === 'Institutional';
      const contactPool = isInstitutional ? CONTACTS_INSTITUTIONAL : CONTACTS_PHYSICAL;
      const contact = contactPool[Math.floor(Math.random() * contactPool.length)];
      contactName = contact.name;
      contactRole = contact.role;
      contactEmail = `${contact.name.toLowerCase().replace(/\s/g, '.')}@${investor.email.split('@')[1]}`;
    }

    events.push({
      id: i + 1,
      timestamp: timestamp.toISOString(),
      timestampFull: timestamp.toLocaleString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }),
      timestampRelative: getRelativeTime(timestamp),
      eventType: eventType.value,
      eventTypeLabel: eventType.label,
      investor: investor.name,
      contact: contactName,
      contactRole,
      email: contactEmail,
      document,
      documentId: Math.floor(Math.random() * 100) + 1,
      space,
      folder: `Dossier ${Math.floor(Math.random() * 10) + 1}`,
      notificationOpened: Math.random() > 0.3,
      documentViewed: Math.random() > 0.4,
    });
  }

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function generateBirdviewInvestors(): BirdviewInvestor[] {
  return INVESTORS.map((inv, idx) => {
    const totalDocuments = Math.floor(Math.random() * 30) + 10;
    const viewedDocuments = Math.floor(Math.random() * totalDocuments * 0.8);
    const downloadedDocuments = Math.floor(viewedDocuments * 0.6);

    // Générer des contacts en fonction du type d'investisseur
    const isInstitutional = inv.type === 'Institutional';
    const contactPool = isInstitutional ? CONTACTS_INSTITUTIONAL : CONTACTS_PHYSICAL;
    const numContacts = Math.floor(Math.random() * 3) + 2; // 2 à 4 contacts
    const contacts: BirdviewContact[] = [];

    // Sélectionner des contacts uniques
    const selectedContacts = [...contactPool]
      .sort(() => Math.random() - 0.5)
      .slice(0, numContacts);

    selectedContacts.forEach((contact, i) => {
      contacts.push({
        id: idx * 10 + i,
        name: contact.name,
        role: contact.role,
        relationLabel: contact.relation,
        email: `${contact.name.toLowerCase().replace(/\s/g, '.')}@${inv.email.split('@')[1]}`,
        canAccess: Math.random() > 0.2,
      });
    });

    return {
      id: idx + 1,
      name: inv.name,
      type: inv.type,
      email: inv.email,
      contacts,
      totalDocuments,
      viewedDocuments,
      downloadedDocuments,
      engagementRate: Math.round((viewedDocuments / totalDocuments) * 100),
    };
  });
}

export function generateBirdviewSpaces(): BirdviewSpace[] {
  return SPACES.map((space, idx) => ({
    id: idx + 1,
    name: space,
    investors: INVESTORS.slice(0, Math.floor(Math.random() * 3) + 1).map(i => i.name),
    folders: Math.floor(Math.random() * 20) + 5,
    documents: Math.floor(Math.random() * 100) + 20,
    engagementRate: Math.floor(Math.random() * 40) + 50,
  }));
}

export { INVESTORS, SPACES, DOCUMENTS, CONTACTS_PHYSICAL, CONTACTS_INSTITUTIONAL, EVENT_TYPES };
