import { Document } from './documentMockData';

export interface DocumentAuditEvent {
  id: string;
  type: 'upload' | 'edit' | 'status_change' | 'access_change' | 'targeting_change' | 'download' | 'share' | 'delete' | 'restore' | 'validation' | 'comment' | 'version_update' | 'metadata_change';
  timestamp: string;
  user: {
    name: string;
    avatar: string;
    email: string;
  };
  action: string;
  details?: {
    before?: any;
    after?: any;
    field?: string;
    description?: string;
  };
  comment?: string;
}

const users = [
  { name: 'Jean Dault', avatar: 'JD', email: 'jean.dault@investhub.com' },
  { name: 'Marie-Claire Denaclara', avatar: 'MD', email: 'marie.denaclara@investhub.com' },
  { name: 'Nicolas SIBILLE', avatar: 'NS', email: 'nicolas.sibille@investhub.com' },
  { name: 'Guillaume Didierjean', avatar: 'GD', email: 'guillaume.d@investhub.com' },
  { name: 'Sophie Martin', avatar: 'SM', email: 'sophie.martin@investhub.com' },
  { name: 'Thomas Bernard', avatar: 'TB', email: 'thomas.bernard@investhub.com' },
];

const eventTemplates = {
  upload: (doc: Document) => ({
    action: `Document "${doc.name}" uploadé`,
    details: {
      description: `Taille: ${doc.size || 'N/A'}, Format: ${doc.format || doc.type}`,
      after: { status: doc.status }
    }
  }),
  
  status_change: (doc: Document, fromStatus: string) => ({
    action: 'Statut modifié',
    details: {
      field: 'Status',
      before: fromStatus,
      after: doc.status === 'published' ? 'Publié' : 'Brouillon'
    }
  }),
  
  access_change: (doc: Document, changeType: string) => ({
    action: `Droits d'accès modifiés`,
    details: {
      field: changeType,
      description: changeType === 'watermark' 
        ? `Watermark ${doc.access.watermark ? 'activé' : 'désactivé'}`
        : changeType === 'downloadable'
        ? `Téléchargement ${doc.access.downloadable ? 'autorisé' : 'bloqué'}`
        : `Impression ${doc.access.printable ? 'autorisée' : 'bloquée'}`
    }
  }),
  
  targeting_change: (doc: Document) => ({
    action: 'Ciblage modifié',
    details: {
      field: 'Target',
      after: doc.target.type === 'all' 
        ? 'Tous les investisseurs'
        : doc.target.type === 'investor'
        ? `${doc.target.investors?.length || 0} investisseurs spécifiques`
        : doc.target.type === 'segment'
        ? `Segments: ${doc.target.segments?.join(', ')}`
        : doc.target.type
    }
  }),
  
  validation: (doc: Document, validator: string, approved: boolean) => ({
    action: approved ? 'Document validé' : 'Document rejeté',
    details: {
      description: `Validé par ${validator}`,
      after: { validated: approved }
    },
    comment: approved 
      ? 'Document conforme aux standards InvestHub' 
      : 'Révision nécessaire avant publication'
  }),
  
  metadata_change: (doc: Document, field: string, value: any) => ({
    action: 'Métadonnées mises à jour',
    details: {
      field: field,
      after: value,
      description: `${field}: ${value}`
    }
  }),
  
  version_update: (doc: Document, oldVersion: number) => ({
    action: 'Nouvelle version',
    details: {
      field: 'Version',
      before: `v${oldVersion}`,
      after: `v${doc.version}`
    }
  }),
  
  download: (doc: Document, investor: string) => ({
    action: 'Document téléchargé',
    details: {
      description: `Téléchargé par ${investor}`
    }
  }),
  
  share: (doc: Document, recipients: string[]) => ({
    action: 'Document partagé',
    details: {
      description: `Partagé avec ${recipients.length} destinataire(s)`,
      after: { recipients }
    }
  }),
};

export function generateDocumentAuditTrail(document: Document): DocumentAuditEvent[] {
  const events: DocumentAuditEvent[] = [];
  let eventId = 1;
  
  // Date de base (uploadedAt)
  const uploadDate = new Date(document.uploadedAt);
  const now = new Date();
  
  // 1. Événement d'upload initial
  const uploader = users.find(u => u.name === document.uploadedBy) || users[0];
  const uploadEvent = eventTemplates.upload(document);
  events.push({
    id: `evt-${eventId++}`,
    type: 'upload',
    timestamp: uploadDate.toISOString(),
    user: uploader,
    ...uploadEvent
  });
  
  // 2. Si le document n'est pas nouveau, générer des événements historiques
  if (!document.isNew) {
    let currentDate = new Date(uploadDate);
    
    // Ajout de métadonnées (2-5 jours après upload)
    if (document.tags && document.tags.length > 0) {
      currentDate = new Date(currentDate.getTime() + (2 + Math.random() * 3) * 24 * 60 * 60 * 1000);
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const metadataEvent = eventTemplates.metadata_change(document, 'Tags', document.tags.join(', '));
      events.push({
        id: `evt-${eventId++}`,
        type: 'metadata_change',
        timestamp: currentDate.toISOString(),
        user: randomUser,
        ...metadataEvent
      });
    }
    
    // Configuration du ciblage (3-7 jours après upload)
    if (document.target.type !== 'all') {
      currentDate = new Date(currentDate.getTime() + (1 + Math.random() * 4) * 24 * 60 * 60 * 1000);
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const targetingEvent = eventTemplates.targeting_change(document);
      events.push({
        id: `evt-${eventId++}`,
        type: 'targeting_change',
        timestamp: currentDate.toISOString(),
        user: randomUser,
        ...targetingEvent
      });
    }
    
    // Modifications des droits d'accès
    if (document.access.watermark || !document.access.downloadable || !document.access.printable) {
      currentDate = new Date(currentDate.getTime() + (1 + Math.random() * 2) * 24 * 60 * 60 * 1000);
      const randomUser = users[Math.floor(Math.random() * users.length)];
      
      const changeType = document.access.watermark 
        ? 'watermark' 
        : !document.access.downloadable 
        ? 'downloadable' 
        : 'printable';
      
      const accessEvent = eventTemplates.access_change(document, changeType);
      events.push({
        id: `evt-${eventId++}`,
        type: 'access_change',
        timestamp: currentDate.toISOString(),
        user: randomUser,
        ...accessEvent
      });
    }
    
    // Validation (si publié)
    if (document.status === 'published') {
      currentDate = new Date(currentDate.getTime() + (1 + Math.random() * 2) * 24 * 60 * 60 * 1000);
      const validator = users[Math.floor(Math.random() * 3)]; // Top 3 users are validators
      const validationEvent = eventTemplates.validation(document, validator.name, true);
      events.push({
        id: `evt-${eventId++}`,
        type: 'validation',
        timestamp: currentDate.toISOString(),
        user: validator,
        ...validationEvent
      });
      
      // Changement de statut vers publié
      currentDate = new Date(currentDate.getTime() + 5 * 60 * 1000); // 5 minutes après validation
      const statusEvent = eventTemplates.status_change(document, 'Brouillon');
      events.push({
        id: `evt-${eventId++}`,
        type: 'status_change',
        timestamp: currentDate.toISOString(),
        user: validator,
        ...statusEvent
      });
    }
    
    // Versions ultérieures
    if (document.version > 1) {
      for (let v = 2; v <= document.version; v++) {
        currentDate = new Date(currentDate.getTime() + (7 + Math.random() * 14) * 24 * 60 * 60 * 1000);
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const versionEvent = eventTemplates.version_update(document, v - 1);
        events.push({
          id: `evt-${eventId++}`,
          type: 'version_update',
          timestamp: currentDate.toISOString(),
          user: randomUser,
          ...versionEvent
        });
      }
    }
    
    // Activités de téléchargement (documents publiés uniquement)
    if (document.status === 'published' && document.downloads > 0) {
      const downloadCount = Math.min(document.downloads, 5); // Montrer les 5 derniers
      for (let i = 0; i < downloadCount; i++) {
        currentDate = new Date(currentDate.getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000);
        if (currentDate > now) currentDate = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000);
        
        const investor = `Investisseur ${['Alpha Capital', 'Beta Fund', 'Gamma Investment', 'Delta Partners', 'Epsilon Ventures'][i % 5]}`;
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const downloadEvent = eventTemplates.download(document, investor);
        events.push({
          id: `evt-${eventId++}`,
          type: 'download',
          timestamp: currentDate.toISOString(),
          user: randomUser,
          ...downloadEvent
        });
      }
    }
    
    // Partages récents
    if (document.notifyOnUpload && Math.random() > 0.5) {
      currentDate = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const recipients = ['investor1@fund.com', 'investor2@fund.com', 'investor3@fund.com'];
      const shareEvent = eventTemplates.share(document, recipients);
      events.push({
        id: `evt-${eventId++}`,
        type: 'share',
        timestamp: currentDate.toISOString(),
        user: randomUser,
        ...shareEvent
      });
    }
    
    // Commentaires (1-3 commentaires aléatoires)
    const commentCount = Math.floor(Math.random() * 3);
    for (let i = 0; i < commentCount; i++) {
      currentDate = new Date(currentDate.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000);
      if (currentDate > now) currentDate = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000);
      
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const comments = [
        'Document validé et conforme',
        'Merci pour cet upload',
        'Attention à la version du disclaimer',
        'Document mis à jour avec les dernières informations',
        'Excellent rapport trimestriel'
      ];
      
      events.push({
        id: `evt-${eventId++}`,
        type: 'comment',
        timestamp: currentDate.toISOString(),
        user: randomUser,
        action: 'Commentaire ajouté',
        comment: comments[i % comments.length]
      });
    }
  }
  
  // Trier par date décroissante (plus récent en premier)
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  return events;
}
