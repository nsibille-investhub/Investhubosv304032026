// Générateur de fausses données pour les logs système

interface LogEntry {
  id: number;
  timestamp: string;
  timestampFull: string;
  timestampRelative: string;
  user: string;
  userEmail: string;
  userAvatar: string | null;
  controller: string;
  controllerLabel: string;
  action: string;
  actionLabel: string;
  ipAddress: string;
  userAgent: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  statusCode: number;
  responseTime: number; // en ms
  targetEntity: string | null;
  targetEntityType: string | null;
  params: Record<string, any> | null;
  sessionId: string;
  url: string;
  entityType: string | null;
  entityId: string | null;
  payload: Record<string, any> | null;
}

// Mapping contrôleurs - LISTE COMPLÈTE
const CONTROLLERS = [
  { tech: 'account', label: 'Compte' },
  { tech: 'accounting', label: 'Comptabilité' },
  { tech: 'ajax', label: 'Requêtes techniques (AJAX)' },
  { tech: 'auth', label: 'Authentification' },
  { tech: 'communication', label: 'Communications' },
  { tech: 'contactforms', label: 'Formulaires de contact' },
  { tech: 'content', label: 'Contenus' },
  { tech: 'dashboard', label: 'Tableau de bord' },
  { tech: 'distribution', label: 'Distributions' },
  { tech: 'documents', label: 'Documents' },
  { tech: 'funds', label: 'Fonds' },
  { tech: 'investors', label: 'Investisseurs' },
  { tech: 'investorspace', label: 'Espace investisseur' },
  { tech: 'kycs', label: 'KYC' },
  { tech: 'onboardings', label: 'Onboarding' },
  { tech: 'participations', label: 'Participations' },
  { tech: 'reporting', label: 'Reporting' },
  { tech: 'reporting_xhr', label: 'Reporting (technique)' },
  { tech: 'root', label: 'Système' },
  { tech: 'screening', label: 'Screening / Conformité' },
  { tech: 'settings', label: 'Paramètres' },
  { tech: 'subscriptions', label: 'Souscriptions' },
  { tech: 'user', label: 'Profil utilisateur' },
];

// Mapping actions par contrôleur - LISTE COMPLÈTE
const ACTIONS_BY_CONTROLLER: Record<string, Array<{ tech: string; label: string }>> = {
  account: [
    { tech: 'default', label: 'Vue compte' },
  ],
  accounting: [
    { tech: 'bills', label: 'Factures' },
    { tech: 'delDoc', label: 'Suppression document' },
    { tech: 'doc', label: 'Consultation document' },
    { tech: 'docupload', label: 'Upload document' },
    { tech: 'pending', label: 'En attente' },
    { tech: 'showDoc', label: 'Voir document' },
    { tech: 'sortAcc', label: 'Tri comptable' },
    { tech: 'default', label: 'Vue par défaut' },
  ],
  ajax: [
    { tech: 'default', label: 'Requête AJAX' },
  ],
  auth: [
    { tech: 'zohologin', label: 'Login Zoho' },
    { tech: 'login', label: 'Connexion' },
    { tech: 'logout', label: 'Déconnexion' },
    { tech: 'reset', label: 'Réinitialisation mot de passe' },
    { tech: 'checkPassword', label: 'Vérification mot de passe' },
    { tech: 'default', label: 'Action par défaut' },
  ],
  communication: [
    { tech: 'bat', label: 'Envoi batch' },
    { tech: 'cloneCommunication', label: 'Duplication communication' },
    { tech: 'communication', label: 'Gestion communication' },
    { tech: 'delAttachment', label: 'Suppression pièce jointe' },
    { tech: 'outbound', label: 'Envoi sortant' },
    { tech: 'sendcomm', label: 'Envoi communication' },
    { tech: 'surveys', label: 'Enquêtes' },
    { tech: 'triggeredcampaigns', label: 'Campagnes automatiques' },
    { tech: 'default', label: 'Vue par défaut' },
  ],
  contactforms: [
    { tech: 'default', label: 'Formulaires de contact' },
  ],
  content: [
    { tech: 'default', label: 'Vue contenu' },
    { tech: 'editDefaultWidgetModal', label: 'Edition widget' },
    { tech: 'page', label: 'Page contenu' },
  ],
  dashboard: [
    { tech: '2fa', label: 'Double authentification' },
    { tech: 'quickSearch', label: 'Recherche rapide' },
    { tech: 'search', label: 'Recherche' },
    { tech: 'switchCampaign', label: 'Changement campagne' },
    { tech: 'default', label: 'Accueil dashboard' },
  ],
  distribution: [
    { tech: 'contractrequests', label: 'Demandes de contrat' },
    { tech: 'mailContent', label: 'Contenu email' },
    { tech: 'partnermenus', label: 'Menus partenaires' },
    { tech: 'partners', label: 'Partenaires' },
    { tech: 'default', label: 'Vue distributions' },
  ],
  documents: [
    { tech: 'deleteCampaigndoc', label: 'Suppression document campagne' },
    { tech: 'downloadCampaigndoc', label: 'Téléchargement document' },
    { tech: 'editCampaigndoc', label: 'Edition document' },
    { tech: 'editDocucateg', label: 'Edition catégorie' },
    { tech: 'get_documents_list', label: 'Liste documents' },
    { tech: 'get_document_count', label: 'Nombre documents' },
    { tech: 'loadDestinataires', label: 'Chargement destinataires' },
    { tech: 'preupload', label: 'Pré-upload' },
    { tech: 'showCampaigndoc', label: 'Voir document' },
    { tech: 'sortCampaigndocs', label: 'Tri documents' },
    { tech: 'sortDocucategs', label: 'Tri catégories' },
    { tech: 'updateParent', label: 'Mise à jour parent' },
    { tech: 'default', label: 'Vue documents' },
  ],
  funds: [
    { tech: 'addShare', label: 'Ajout part' },
    { tech: 'calls', label: 'Appels de fonds' },
    { tech: 'contract', label: 'Contrat' },
    { tech: 'duplicateContract', label: 'Duplication contrat' },
    { tech: 'exportcall', label: 'Export appel' },
    { tech: 'exportdistrib', label: 'Export distribution' },
    { tech: 'futureflows', label: 'Flux futurs' },
    { tech: 'investors', label: 'Investisseurs fonds' },
    { tech: 'portfolio', label: 'Portefeuille' },
    { tech: 'viewCall', label: 'Voir appel' },
    { tech: 'viewDistrib', label: 'Voir distribution' },
    { tech: 'delContract', label: 'Suppression contrat' },
    { tech: 'default', label: 'Vue fonds' },
  ],
  investors: [
    { tech: 'addInvestorContact', label: 'Ajout contact' },
    { tech: 'impersonate', label: 'Impersonation' },
    { tech: 'investor', label: 'Fiche investisseur' },
    { tech: 'investorspace', label: 'Accès espace investisseur' },
    { tech: 'kycCheck', label: 'Vérification KYC' },
    { tech: 'notifyRequest', label: 'Notification' },
    { tech: 'resetPass', label: 'Reset mot de passe' },
    { tech: 'validSection', label: 'Validation section' },
    { tech: 'default', label: 'Vue investisseurs' },
  ],
  investorspace: [
    { tech: 'autofill', label: 'Pré-remplissage' },
    { tech: 'checkStatus', label: 'Vérification statut' },
    { tech: 'docCheck', label: 'Vérification document' },
    { tech: 'docReport', label: 'Rapport document' },
    { tech: 'onboardingStep1', label: 'Etape onboarding' },
    { tech: 'onboardingValidation', label: 'Validation onboarding' },
    { tech: 'performance', label: 'Performance' },
    { tech: 'portfolio', label: 'Portefeuille' },
    { tech: 'previewDoc', label: 'Prévisualisation doc' },
    { tech: 'readDoc', label: 'Lecture document' },
    { tech: 'searchDoc', label: 'Recherche document' },
    { tech: 'showDocument', label: 'Affichage document' },
    { tech: 'subscription', label: 'Souscription' },
    { tech: 'default', label: 'Vue espace investisseur' },
  ],
  kycs: [
    { tech: 'modalNeedVerif', label: 'Demande vérification' },
    { tech: 'default', label: 'Vue KYC' },
  ],
  onboardings: [
    { tech: 'getAnswers', label: 'Récupération réponses' },
    { tech: 'questions', label: 'Questions' },
    { tech: 'reloadDefaultValue', label: 'Rechargement valeur' },
    { tech: 'reOrderSections', label: 'Réordonnancement sections' },
    { tech: 'sections', label: 'Sections' },
    { tech: 'default', label: 'Vue onboarding' },
  ],
  participations: [
    { tech: 'participationspace', label: 'Espace participation' },
    { tech: 'default', label: 'Vue participations' },
  ],
  reporting: [
    { tech: 'getReport', label: 'Génération rapport' },
    { tech: 'reportings', label: 'Liste rapports' },
    { tech: 'reporting_executions', label: 'Exécutions reporting' },
    { tech: 'reporting_form', label: 'Formulaire reporting' },
    { tech: 'default', label: 'Vue reporting' },
  ],
  reporting_xhr: [
    { tech: 'reporting_item_form', label: 'Formulaire item' },
    { tech: 'reporting_sub_item_form', label: 'Sous-item' },
    { tech: 'sort_sub_items', label: 'Tri sous-éléments' },
    { tech: 'default', label: 'Reporting technique' },
  ],
  root: [
    { tech: 'appSidebarPic', label: 'Image sidebar' },
    { tech: 'asset', label: 'Asset' },
    { tech: 'campaignphoto', label: 'Photo campagne' },
    { tech: 'components', label: 'Chargement composants' },
    { tech: 'connect', label: 'Connexion' },
    { tech: 'load360viewContent', label: 'Chargement vue 360' },
    { tech: 'newWcReport', label: 'Nouveau rapport WC' },
    { tech: 'default', label: 'Action système' },
  ],
  screening: [
    { tech: 'alerts', label: 'Alertes' },
    { tech: 'delCase', label: 'Suppression dossier' },
    { tech: 'worldcheckDetails', label: 'Détails WorldCheck' },
    { tech: 'default', label: 'Vue screening' },
  ],
  settings: [
    { tech: 'attachment', label: 'Pièces jointes' },
    { tech: 'harvestLogs', label: 'Collecte logs' },
    { tech: 'hostedassets', label: 'Assets hébergés' },
    { tech: 'logs', label: 'Consultation logs' },
    { tech: 'mailHistory', label: 'Historique emails' },
    { tech: 'mailTemplates', label: 'Templates emails' },
    { tech: 'reloadAction', label: 'Rechargement action' },
    { tech: 'smsHistory', label: 'Historique SMS' },
    { tech: 'suppliers', label: 'Fournisseurs' },
    { tech: 'tools', label: 'Outils' },
    { tech: 'users', label: 'Utilisateurs' },
    { tech: 'default', label: 'Paramètres' },
  ],
  subscriptions: [
    { tech: 'addDocument', label: 'Ajout document' },
    { tech: 'check', label: 'Vérification' },
    { tech: 'chgStatus', label: 'Changement statut' },
    { tech: 'previewDoc', label: 'Prévisualisation doc' },
    { tech: 'resendSignMail', label: 'Renvoyer email signature' },
    { tech: 'sendSign', label: 'Envoi signature' },
    { tech: 'signedDoc', label: 'Document signé' },
    { tech: 'submitRisk', label: 'Soumission risque' },
    { tech: 'transfer', label: 'Transfert' },
    { tech: 'validQuest', label: 'Validation questionnaire' },
    { tech: 'default', label: 'Vue souscriptions' },
  ],
  user: [
    { tech: 'getConfig', label: 'Récupération config' },
    { tech: 'saveConfig', label: 'Sauvegarde config' },
    { tech: 'default', label: 'Profil utilisateur' },
  ],
};

// Utilisateurs
const USERS = [
  { name: 'Jean Dault', email: 'jean.dault@investhub.com' },
  { name: 'Sophie Martin', email: 'sophie.martin@investhub.com' },
  { name: 'Marc Dubois', email: 'marc.dubois@investhub.com' },
  { name: 'Claire Rousseau', email: 'claire.rousseau@investhub.com' },
  { name: 'Thomas Bernard', email: 'thomas.bernard@investhub.com' },
  { name: 'Emma Leroy', email: 'emma.leroy@investhub.com' },
  { name: 'Pierre Moreau', email: 'pierre.moreau@investhub.com' },
  { name: 'Julie Petit', email: 'julie.petit@investhub.com' },
];

// Adresses IP
const IP_ADDRESSES = [
  '192.168.1.100',
  '192.168.1.101',
  '192.168.1.102',
  '10.0.0.45',
  '10.0.0.67',
  '172.16.0.12',
  '172.16.0.34',
  '82.125.34.56',
  '91.167.23.89',
];

// User agents
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
];

// Méthodes HTTP
const METHODS: Array<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'> = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

// Codes de statut HTTP
const STATUS_CODES = [200, 201, 204, 400, 401, 403, 404, 500];

// Types d'entités cibles
const ENTITY_TYPES = ['Investor', 'Fund', 'Document', 'Subscription', 'Partner', null];

function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
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

export function generateLogs(count: number): LogEntry[] {
  const logs: LogEntry[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    // Générer une date aléatoire dans les 30 derniers jours
    const daysAgo = Math.random() * 30;
    const hoursAgo = Math.random() * 24;
    const minutesAgo = Math.random() * 60;
    const timestamp = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000) - (minutesAgo * 60 * 1000));

    // Sélectionner un contrôleur aléatoire
    const controller = CONTROLLERS[Math.floor(Math.random() * CONTROLLERS.length)];
    
    // Sélectionner une action pour ce contrôleur
    const actions = ACTIONS_BY_CONTROLLER[controller.tech] || [{ tech: 'default', label: 'Action par défaut' }];
    const action = actions[Math.floor(Math.random() * actions.length)];

    // Sélectionner un utilisateur
    const user = USERS[Math.floor(Math.random() * USERS.length)];

    // Générer le reste des données
    const method = METHODS[Math.floor(Math.random() * METHODS.length)];
    const statusCode = STATUS_CODES[Math.floor(Math.random() * STATUS_CODES.length)];
    const entityType = ENTITY_TYPES[Math.floor(Math.random() * ENTITY_TYPES.length)];

    logs.push({
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
      user: user.name,
      userEmail: user.email,
      userAvatar: null,
      controller: controller.tech,
      controllerLabel: controller.label,
      action: action.tech,
      actionLabel: action.label,
      ipAddress: IP_ADDRESSES[Math.floor(Math.random() * IP_ADDRESSES.length)],
      userAgent: USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
      method,
      statusCode,
      responseTime: Math.floor(Math.random() * 2000) + 10,
      targetEntity: entityType ? `${entityType} #${Math.floor(Math.random() * 1000) + 1}` : null,
      targetEntityType: entityType,
      params: method !== 'GET' ? { data: 'sample' } : null,
      sessionId: generateSessionId(),
      url: `/${controller.tech}/${action.tech}`,
      entityType: entityType,
      entityId: entityType ? `${Math.floor(Math.random() * 1000) + 1}` : null,
      payload: method !== 'GET' ? { data: 'sample' } : null,
    });
  }

  // Trier par date décroissante
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// Export de la liste des contrôleurs pour les filtres
export { CONTROLLERS, ACTIONS_BY_CONTROLLER };

export type { LogEntry };