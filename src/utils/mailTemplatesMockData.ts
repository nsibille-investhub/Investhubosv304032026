/**
 * Jeu de données de démonstration pour l'écran Gabarits des mails.
 *
 * Structure (12 sections, 112 gabarits) et volumétrie reprises du Starter Pack
 * gabarits de mails. Les slugs, libellés et sujets de la section Paiements sont
 * ceux du référentiel ; les autres sections utilisent des libellés
 * représentatifs pour la maquette.
 */

export type TemplateSectionKey =
  | 'accounts'
  | 'onboarding'
  | 'signature'
  | 'kyc'
  | 'payments'
  | 'capitalCalls'
  | 'distributions'
  | 'redemptions'
  | 'secondary'
  | 'documents'
  | 'partners'
  | 'communication';

export type TemplateRecipient = 'investor' | 'partner' | 'team';
export type TemplateTrigger = 'auto' | 'manual' | 'mixed';
export type TemplateStatus = 'active' | 'draft' | 'archived';

export interface MailTemplate {
  id: number;
  slug: string;
  name: string;
  section: TemplateSectionKey;
  recipient: TemplateRecipient;
  trigger: TemplateTrigger;
  status: TemplateStatus;
  languages: string[];
  subjectFr: string;
  subjectEn: string;
  bodyFr: string;
  bodyEn: string;
  variables: string[];
  usageCount: number;
  lastSentAt: string | null;
  updatedAt: string;
  updatedBy: string;
}

export const SECTION_ORDER: TemplateSectionKey[] = [
  'accounts',
  'onboarding',
  'signature',
  'kyc',
  'payments',
  'capitalCalls',
  'distributions',
  'redemptions',
  'secondary',
  'documents',
  'partners',
  'communication',
];

/** Numéro de section du Starter Pack, utilisé comme repère dans le rail. */
export const SECTION_NUMBER: Record<TemplateSectionKey, number> = {
  accounts: 1,
  onboarding: 2,
  signature: 3,
  kyc: 4,
  payments: 5,
  capitalCalls: 6,
  distributions: 7,
  redemptions: 8,
  secondary: 9,
  documents: 10,
  partners: 11,
  communication: 12,
};

/** [slug, libellé, destinataire, déclencheur, sujet FR, sujet EN] */
type Row = [string, string, TemplateRecipient, TemplateTrigger, string, string];

const SECTION_ROWS: Record<TemplateSectionKey, Row[]> = {
  accounts: [
    ['creation-compte', 'Création de compte', 'investor', 'auto', '$appname - Votre compte a été créé', '$appname - Your account has been created'],
    ['invitation-espace', 'Invitation à l\'espace investisseur', 'investor', 'manual', '$appname - Accédez à votre espace investisseur', '$appname - Access your investor portal'],
    ['activation-compte', 'Activation du compte', 'investor', 'auto', '$appname - Activez votre accès', '$appname - Activate your access'],
    ['premiere-connexion', 'Première connexion', 'investor', 'auto', '$appname - Bienvenue sur votre espace', '$appname - Welcome to your portal'],
    ['code-connexion', 'Code de connexion', 'investor', 'auto', '$appname - Votre code de connexion', '$appname - Your login code'],
    ['reinitialisation-mot-de-passe', 'Réinitialisation du mot de passe', 'investor', 'auto', '$appname - Réinitialisation de votre mot de passe', '$appname - Reset your password'],
    ['mot-de-passe-modifie', 'Mot de passe modifié', 'investor', 'auto', '$appname - Votre mot de passe a été modifié', '$appname - Your password has been changed'],
    ['double-authentification', 'Activation de la double authentification', 'investor', 'auto', '$appname - Double authentification activée', '$appname - Two-factor authentication enabled'],
    ['nouvel-appareil', 'Connexion depuis un nouvel appareil', 'investor', 'auto', '$appname - Nouvelle connexion détectée', '$appname - New sign-in detected'],
    ['compte-verrouille', 'Compte verrouillé', 'investor', 'auto', '$appname - Votre compte est temporairement verrouillé', '$appname - Your account is temporarily locked'],
    ['email-modifie', 'Adresse email modifiée', 'investor', 'auto', '$appname - Votre adresse email a été modifiée', '$appname - Your email address has been changed'],
    ['coordonnees-modifiees', 'Coordonnées modifiées', 'investor', 'auto', '$appname - Vos coordonnées ont été mises à jour', '$appname - Your contact details have been updated'],
    ['creation-utilisateur-interne', 'Création d\'un utilisateur interne', 'team', 'auto', '$appname - Votre compte collaborateur est prêt', '$appname - Your team account is ready'],
    ['acces-revoque', 'Accès révoqué', 'investor', 'manual', '$appname - Votre accès a été désactivé', '$appname - Your access has been deactivated'],
    ['invitation-mandataire', 'Invitation d\'un mandataire', 'investor', 'manual', '$appname - Vous avez été désigné mandataire', '$appname - You have been designated as a proxy'],
    ['rappel-compte-inactif', 'Rappel de compte inactif', 'investor', 'auto', '$appname - Votre espace vous attend', '$appname - Your portal is waiting for you'],
  ],
  onboarding: [
    ['debut-souscription', 'Début de souscription', 'investor', 'auto', '$campaign - Votre souscription est ouverte', '$campaign - Your subscription is open'],
    ['souscription-a-completer', 'Souscription à compléter', 'investor', 'auto', '$campaign - Finalisez votre souscription', '$campaign - Complete your subscription'],
    ['relance-souscription', 'Relance de souscription', 'investor', 'mixed', '$campaign - Votre souscription est en attente', '$campaign - Your subscription is pending'],
    ['souscription-soumise', 'Souscription soumise', 'investor', 'auto', '$campaign - Votre souscription a été transmise', '$campaign - Your subscription has been submitted'],
    ['souscription-en-revue', 'Souscription en revue', 'investor', 'auto', '$campaign - Votre dossier est en cours d\'examen', '$campaign - Your file is under review'],
    ['souscription-validee', 'Souscription validée', 'investor', 'auto', '$campaign - Votre souscription est validée', '$campaign - Your subscription is approved'],
    ['souscription-refusee', 'Souscription refusée', 'investor', 'manual', '$campaign - Votre souscription n\'a pas été retenue', '$campaign - Your subscription was not accepted'],
    ['souscription-annulee', 'Souscription annulée', 'investor', 'manual', '$campaign - Votre souscription a été annulée', '$campaign - Your subscription has been cancelled'],
    ['documents-manquants', 'Documents manquants', 'investor', 'mixed', '$campaign - Documents manquants pour votre dossier', '$campaign - Missing documents for your file'],
    ['piece-refusee', 'Pièce refusée', 'investor', 'manual', '$campaign - Une pièce doit être remplacée', '$campaign - A document must be replaced'],
    ['montant-a-confirmer', 'Montant à confirmer', 'investor', 'manual', '$campaign - Confirmez votre montant de souscription', '$campaign - Confirm your subscription amount'],
    ['bulletin-disponible', 'Bulletin de souscription disponible', 'investor', 'auto', '$campaign - Votre bulletin de souscription', '$campaign - Your subscription form'],
    ['notification-gestion-nouvelle-souscription', 'Nouvelle souscription à traiter', 'team', 'auto', '$campaign - Nouvelle souscription à traiter', '$campaign - New subscription to process'],
    ['notification-gestion-dossier-complet', 'Dossier complet à valider', 'team', 'auto', '$campaign - Dossier complet à valider', '$campaign - Complete file to approve'],
    ['souscription-distributeur-initiee', 'Souscription initiée par le distributeur', 'partner', 'auto', '$campaign - Souscription initiée pour votre client', '$campaign - Subscription initiated for your client'],
    ['souscription-distributeur-validee', 'Souscription du distributeur validée', 'partner', 'auto', '$campaign - Souscription validée', '$campaign - Subscription approved'],
    ['minimum-non-atteint', 'Minimum de souscription non atteint', 'investor', 'auto', '$campaign - Montant inférieur au minimum requis', '$campaign - Amount below the required minimum'],
    ['cloture-periode-souscription', 'Clôture de la période de souscription', 'investor', 'auto', '$campaign - La période de souscription se termine', '$campaign - The subscription period is closing'],
  ],
  signature: [
    ['demande-signature', 'Demande de signature', 'investor', 'auto', '$campaign - Votre signature est attendue', '$campaign - Your signature is required'],
    ['relance-signature', 'Relance de signature', 'investor', 'mixed', '$campaign - Rappel : votre signature est attendue', '$campaign - Reminder: your signature is required'],
    ['signature-effectuee', 'Signature effectuée', 'investor', 'auto', '$campaign - Votre document est signé', '$campaign - Your document is signed'],
    ['contre-signature-attendue', 'Contre-signature attendue', 'team', 'auto', '$campaign - Contre-signature attendue', '$campaign - Counter-signature required'],
    ['signature-refusee', 'Signature refusée', 'team', 'auto', '$campaign - Signature refusée par l\'investisseur', '$campaign - Signature declined by the investor'],
    ['signature-expiree', 'Demande de signature expirée', 'investor', 'auto', '$campaign - Votre demande de signature a expiré', '$campaign - Your signature request has expired'],
  ],
  kyc: [
    ['demande-kyc', 'Demande de pièces KYC', 'investor', 'mixed', '$appname - Pièces justificatives à fournir', '$appname - Supporting documents required'],
    ['relance-kyc', 'Relance KYC', 'investor', 'mixed', '$appname - Rappel : pièces justificatives à fournir', '$appname - Reminder: supporting documents required'],
    ['kyc-valide', 'Dossier KYC validé', 'investor', 'auto', '$appname - Votre dossier de conformité est validé', '$appname - Your compliance file is approved'],
    ['kyc-incomplet', 'Dossier KYC incomplet', 'investor', 'manual', '$appname - Votre dossier de conformité est incomplet', '$appname - Your compliance file is incomplete'],
    ['piece-expiree', 'Pièce justificative expirée', 'investor', 'auto', '$appname - Une pièce arrive à expiration', '$appname - A document is about to expire'],
    ['revue-periodique', 'Revue périodique du dossier', 'investor', 'auto', '$appname - Revue périodique de votre dossier', '$appname - Periodic review of your file'],
    ['questionnaire-connaissance', 'Questionnaire de connaissance client', 'investor', 'mixed', '$appname - Questionnaire à compléter', '$appname - Questionnaire to complete'],
    ['profil-investisseur-a-mettre-a-jour', 'Profil investisseur à mettre à jour', 'investor', 'auto', '$appname - Mettez à jour votre profil investisseur', '$appname - Update your investor profile'],
    ['alerte-conformite-gestion', 'Alerte de conformité', 'team', 'auto', '$appname - Alerte de conformité à traiter', '$appname - Compliance alert to review'],
    ['controle-a-realiser', 'Contrôle à réaliser', 'team', 'auto', '$appname - Contrôle de conformité à réaliser', '$appname - Compliance check to perform'],
    ['declaration-beneficiaire-effectif', 'Déclaration de bénéficiaire effectif', 'investor', 'mixed', '$appname - Déclaration de bénéficiaire effectif', '$appname - Beneficial owner declaration'],
    ['auto-certification-fiscale', 'Auto-certification fiscale', 'investor', 'mixed', '$appname - Auto-certification fiscale à signer', '$appname - Tax self-certification to sign'],
    ['kyc-distributeur', 'Dossier de conformité du distributeur', 'partner', 'mixed', '$appname - Votre dossier de conformité', '$appname - Your compliance file'],
  ],
  payments: [
    ['relance-versement', 'Relance de versement', 'investor', 'mixed', '$campaign - Votre versement de $amount est attendu', '$campaign - Your payment of $amount is pending'],
    ['confirmation-virement', 'Confirmation de réception des fonds', 'investor', 'auto', '$campaign - Nous avons bien reçu votre versement', '$campaign - We have received your payment'],
    ['confirmation-paiement', 'Envoi des documents après paiement', 'investor', 'auto', '$campaign - Vos documents de souscription sont disponibles', '$campaign - Your subscription documents are available'],
  ],
  capitalCalls: [
    ['notice-appel-de-fonds', 'Notice d\'appel de fonds', 'investor', 'auto', '$campaign - Appel de fonds du $duedate', '$campaign - Capital call dated $duedate'],
    ['relance-appel-de-fonds', 'Relance d\'appel de fonds', 'investor', 'mixed', '$campaign - Rappel : appel de fonds en attente', '$campaign - Reminder: capital call pending'],
    ['appel-de-fonds-regle', 'Appel de fonds réglé', 'investor', 'auto', '$campaign - Votre appel de fonds est réglé', '$campaign - Your capital call is settled'],
    ['appel-de-fonds-en-retard', 'Appel de fonds en retard', 'investor', 'auto', '$campaign - Votre appel de fonds est en retard', '$campaign - Your capital call is overdue'],
    ['appel-de-fonds-modifie', 'Appel de fonds modifié', 'investor', 'manual', '$campaign - Modification de votre appel de fonds', '$campaign - Change to your capital call'],
    ['appel-de-fonds-annule', 'Appel de fonds annulé', 'investor', 'manual', '$campaign - Appel de fonds annulé', '$campaign - Capital call cancelled'],
    ['synthese-appels-gestion', 'Synthèse des appels de fonds', 'team', 'auto', '$campaign - Synthèse des appels de fonds', '$campaign - Capital calls summary'],
  ],
  distributions: [
    ['notice-distribution', 'Notice de distribution', 'investor', 'auto', '$campaign - Distribution du $duedate', '$campaign - Distribution dated $duedate'],
    ['distribution-versee', 'Distribution versée', 'investor', 'auto', '$campaign - Votre distribution a été versée', '$campaign - Your distribution has been paid'],
    ['capital-account-disponible', 'Capital account disponible', 'investor', 'auto', '$campaign - Votre capital account est disponible', '$campaign - Your capital account is available'],
    ['deblocage-anticipe-demande', 'Demande de déblocage anticipé', 'investor', 'auto', '$campaign - Votre demande de déblocage anticipé', '$campaign - Your early release request'],
    ['deblocage-anticipe-valide', 'Déblocage anticipé validé', 'investor', 'auto', '$campaign - Votre déblocage anticipé est validé', '$campaign - Your early release is approved'],
    ['deblocage-anticipe-refuse', 'Déblocage anticipé refusé', 'investor', 'manual', '$campaign - Votre déblocage anticipé n\'a pas été retenu', '$campaign - Your early release was not approved'],
    ['notification-gestion-deblocage', 'Déblocage à instruire', 'team', 'auto', '$campaign - Déblocage à instruire', '$campaign - Release request to process'],
  ],
  redemptions: [
    ['demande-rachat-recue', 'Demande de rachat reçue', 'investor', 'auto', '$campaign - Votre demande de rachat est enregistrée', '$campaign - Your redemption request is registered'],
    ['rachat-a-completer', 'Demande de rachat à compléter', 'investor', 'auto', '$campaign - Complétez votre demande de rachat', '$campaign - Complete your redemption request'],
    ['rachat-valide', 'Rachat validé', 'investor', 'auto', '$campaign - Votre rachat est validé', '$campaign - Your redemption is approved'],
    ['rachat-refuse', 'Rachat refusé', 'investor', 'manual', '$campaign - Votre demande de rachat n\'a pas été retenue', '$campaign - Your redemption request was not approved'],
    ['rachat-regle', 'Rachat réglé', 'investor', 'auto', '$campaign - Le produit de votre rachat a été versé', '$campaign - Your redemption proceeds have been paid'],
    ['rachat-partiel', 'Rachat partiellement servi', 'investor', 'auto', '$campaign - Votre rachat a été partiellement servi', '$campaign - Your redemption was partially executed'],
    ['notification-gestion-rachat', 'Rachat à instruire', 'team', 'auto', '$campaign - Demande de rachat à instruire', '$campaign - Redemption request to process'],
  ],
  secondary: [
    ['annonce-publiee', 'Annonce publiée', 'investor', 'auto', '$campaign - Votre annonce est publiée', '$campaign - Your listing is published'],
    ['annonce-a-valider', 'Annonce à valider', 'team', 'auto', '$campaign - Annonce à valider', '$campaign - Listing to approve'],
    ['annonce-refusee', 'Annonce refusée', 'investor', 'manual', '$campaign - Votre annonce n\'a pas été publiée', '$campaign - Your listing was not published'],
    ['offre-recue', 'Offre reçue', 'investor', 'auto', '$campaign - Vous avez reçu une offre', '$campaign - You have received an offer'],
    ['offre-acceptee', 'Offre acceptée', 'investor', 'auto', '$campaign - Votre offre a été acceptée', '$campaign - Your offer has been accepted'],
    ['offre-refusee', 'Offre refusée', 'investor', 'auto', '$campaign - Votre offre n\'a pas été retenue', '$campaign - Your offer was not accepted'],
    ['transfert-a-instruire', 'Transfert de parts à instruire', 'team', 'auto', '$campaign - Transfert de parts à instruire', '$campaign - Share transfer to process'],
    ['transfert-finalise', 'Transfert de parts finalisé', 'investor', 'auto', '$campaign - Votre transfert de parts est finalisé', '$campaign - Your share transfer is complete'],
    ['droit-preemption', 'Exercice du droit de préemption', 'investor', 'manual', '$campaign - Exercice du droit de préemption', '$campaign - Exercise of pre-emption right'],
  ],
  documents: [
    ['nouveau-document', 'Nouveau document disponible', 'investor', 'auto', '$appname - Un nouveau document est disponible', '$appname - A new document is available'],
    ['reporting-disponible', 'Reporting disponible', 'investor', 'auto', '$campaign - Votre reporting est disponible', '$campaign - Your report is available'],
    ['acces-data-room', 'Accès à la data room', 'investor', 'manual', '$appname - Accès à la data room', '$appname - Data room access'],
    ['document-a-consulter', 'Document à consulter', 'investor', 'mixed', '$appname - Un document requiert votre attention', '$appname - A document requires your attention'],
    ['publication-massive', 'Publication de documents', 'investor', 'manual', '$appname - Nouveaux documents publiés', '$appname - New documents published'],
  ],
  partners: [
    ['invitation-distributeur', 'Invitation du distributeur', 'partner', 'manual', '$appname - Accédez à votre espace distributeur', '$appname - Access your distributor portal'],
    ['convention-a-signer', 'Convention à signer', 'partner', 'auto', '$appname - Votre convention est prête à être signée', '$appname - Your agreement is ready for signature'],
    ['convention-signee', 'Convention signée', 'partner', 'auto', '$appname - Votre convention est signée', '$appname - Your agreement is signed'],
    ['convention-a-renouveler', 'Convention à renouveler', 'partner', 'auto', '$appname - Votre convention arrive à échéance', '$appname - Your agreement is expiring'],
    ['droits-distribution-ouverts', 'Droits de distribution ouverts', 'partner', 'manual', '$appname - Nouveaux droits de distribution', '$appname - New distribution rights'],
    ['releve-retrocessions', 'Relevé de rétrocessions', 'partner', 'auto', '$appname - Votre relevé de rétrocessions', '$appname - Your retrocession statement'],
    ['retrocession-versee', 'Rétrocession versée', 'partner', 'auto', '$appname - Votre rétrocession a été versée', '$appname - Your retrocession has been paid'],
    ['facture-retrocession', 'Facture de rétrocession', 'partner', 'auto', '$appname - Votre facture de rétrocession', '$appname - Your retrocession invoice'],
    ['nouveau-client-rattache', 'Nouveau client rattaché', 'partner', 'auto', '$appname - Un nouvel investisseur vous est rattaché', '$appname - A new investor has been assigned to you'],
    ['collecte-mensuelle', 'Point de collecte mensuel', 'partner', 'auto', '$appname - Votre point de collecte du mois', '$appname - Your monthly inflow summary'],
    ['notification-gestion-convention', 'Convention à valider', 'team', 'auto', '$appname - Convention à valider', '$appname - Agreement to approve'],
    ['acces-distributeur-revoque', 'Accès distributeur révoqué', 'partner', 'manual', '$appname - Votre accès a été désactivé', '$appname - Your access has been deactivated'],
  ],
  communication: [
    ['message-libre', 'Message libre', 'investor', 'manual', '$appname - Message de votre société de gestion', '$appname - Message from your management company'],
    ['invitation-reunion-porteurs', 'Invitation à la réunion des porteurs', 'investor', 'manual', '$appname - Invitation à la réunion annuelle', '$appname - Invitation to the annual meeting'],
    ['confirmation-presence', 'Confirmation de présence', 'investor', 'auto', '$appname - Votre présence est confirmée', '$appname - Your attendance is confirmed'],
    ['demande-contact-recue', 'Demande de contact reçue', 'team', 'auto', '$appname - Nouvelle demande de contact', '$appname - New contact request'],
    ['accuse-demande-contact', 'Accusé de réception de la demande', 'investor', 'auto', '$appname - Nous avons bien reçu votre demande', '$appname - We have received your request'],
    ['reponse-demande-contact', 'Réponse à la demande de contact', 'investor', 'manual', '$appname - Réponse à votre demande', '$appname - Reply to your request'],
    ['newsletter-investisseurs', 'Lettre d\'information', 'investor', 'manual', '$appname - Votre lettre d\'information', '$appname - Your newsletter'],
    ['enquete-satisfaction', 'Enquête de satisfaction', 'investor', 'manual', '$appname - Votre avis nous intéresse', '$appname - We value your feedback'],
    ['information-reglementaire', 'Information réglementaire', 'investor', 'manual', '$appname - Information réglementaire importante', '$appname - Important regulatory information'],
  ],
};

const BASE_VARIABLES = ['$logo', '$appname', '$year', '$mirror'];

const RECIPIENT_VARIABLES: Record<TemplateRecipient, string[]> = {
  investor: ['$investor.firstname', '$investor.lastname', '$url', '$link'],
  partner: ['$partner.name', '$partner.signatory', '$url'],
  team: ['$appname', '$url', '$mail_support'],
};

const SECTION_VARIABLES: Record<TemplateSectionKey, string[]> = {
  accounts: ['$lurl'],
  onboarding: ['$campaign', '$subscriptionname', '$subscription.amount'],
  signature: ['$campaign', '$subscriptionname', '$link'],
  kyc: ['$investor.name', '$duedate'],
  payments: ['$campaign', '$amount', '$campaign.iban', '$campaign.bic'],
  capitalCalls: ['$campaign', '$amount', '$duedate', '$campaign.iban'],
  distributions: ['$campaign', '$amount', '$duedate'],
  redemptions: ['$campaign', '$subscriptionname', '$amount'],
  secondary: ['$campaign', '$amount', '$link'],
  documents: ['$campaign', '$link'],
  partners: ['$partner.name', '$amount', '$link'],
  communication: ['$link'],
};

const AUTHORS = ['Camille', 'Nicolas', 'Sofia', 'Jean'];

/** Corps de mail construit sur l'enveloppe standard du référentiel. */
function buildBody(row: Row, section: TemplateSectionKey, lang: 'fr' | 'en'): string {
  const [, name, recipient] = row;
  const greeting =
    lang === 'fr'
      ? recipient === 'partner'
        ? 'Bonjour $partner.signatory,'
        : recipient === 'team'
          ? 'Bonjour,'
          : 'Bonjour $investor.firstname $investor.lastname,'
      : recipient === 'partner'
        ? 'Dear $partner.signatory,'
        : recipient === 'team'
          ? 'Hello,'
          : 'Dear $investor.firstname $investor.lastname,';

  const lead =
    lang === 'fr'
      ? `Objet du message : ${name.toLowerCase()}.`
      : `Subject of this message: ${name.toLowerCase()}.`;

  const detail =
    lang === 'fr'
      ? section === 'payments' || section === 'capitalCalls' || section === 'distributions'
        ? 'Le montant concerné s\'élève à $amount. Les instructions de règlement figurent ci-dessous.'
        : 'Le détail de cette opération est disponible dans votre espace, avec les documents associés.'
      : section === 'payments' || section === 'capitalCalls' || section === 'distributions'
        ? 'The amount concerned is $amount. Settlement instructions are set out below.'
        : 'The details of this operation are available in your portal, together with the related documents.';

  const cta = lang === 'fr' ? 'Accéder à mon espace : $url' : 'Access my portal: $url';
  const signature = lang === 'fr' ? 'Cordialement,\nL\'équipe $appname' : 'Best regards,\nThe $appname team';
  const footer =
    lang === 'fr'
      ? '© $year $appname · Voir ce message dans votre navigateur : $mirror'
      : '© $year $appname · View this message in your browser: $mirror';

  return `[$logo]\n\n${greeting}\n\n${lead}\n\n${detail}\n\n${cta}\n\n${signature}\n\n---\n${footer}`;
}

function buildTemplates(): MailTemplate[] {
  const templates: MailTemplate[] = [];
  let id = 0;

  SECTION_ORDER.forEach((section) => {
    SECTION_ROWS[section].forEach((row) => {
      const [slug, name, recipient, trigger, subjectFr, subjectEn] = row;
      id += 1;

      // Répartition déterministe : la maquette reste stable d'un rendu à l'autre.
      const status: TemplateStatus = id % 17 === 0 ? 'archived' : id % 9 === 0 ? 'draft' : 'active';
      const languages = id % 11 === 0 ? ['fr'] : id % 7 === 0 ? ['fr', 'en', 'es'] : ['fr', 'en'];
      const usageCount = status === 'draft' ? 0 : (id * 37) % 620;
      const daysSinceSend = (id * 5) % 90;
      const daysSinceEdit = 3 + ((id * 13) % 300);

      templates.push({
        id,
        slug,
        name,
        section,
        recipient,
        trigger,
        status,
        languages,
        subjectFr,
        subjectEn,
        bodyFr: buildBody(row, section, 'fr'),
        bodyEn: buildBody(row, section, 'en'),
        variables: Array.from(
          new Set([
            ...BASE_VARIABLES,
            ...RECIPIENT_VARIABLES[recipient],
            ...SECTION_VARIABLES[section],
          ]),
        ),
        usageCount,
        lastSentAt: usageCount === 0 ? null : isoDaysAgo(daysSinceSend),
        updatedAt: isoDaysAgo(daysSinceEdit),
        updatedBy: AUTHORS[id % AUTHORS.length],
      });
    });
  });

  return templates;
}

/** Date de référence figée : la maquette ne bouge pas d'une session à l'autre. */
const REFERENCE_DATE = new Date('2026-08-13T09:00:00Z').getTime();

function isoDaysAgo(days: number): string {
  return new Date(REFERENCE_DATE - days * 24 * 60 * 60 * 1000).toISOString();
}

export const MAIL_TEMPLATES: MailTemplate[] = buildTemplates();

export const TEMPLATE_AUTHORS = AUTHORS;
