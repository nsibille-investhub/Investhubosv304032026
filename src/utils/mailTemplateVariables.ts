/**
 * Catalogue des variables des gabarits de mails et contextes d'aperçu.
 *
 * Les descriptions sont portées ici en FR / EN plutôt que dans les fichiers de
 * locales : ce sont des fiches de référence des variables de la plateforme,
 * indexées par nom de variable, et elles servent aussi de matière au moteur de
 * recherche. Les libellés d'interface, eux, restent dans les locales.
 *
 * Les contextes d'aperçu sont des objets fictifs. Aucune donnée réelle
 * d'investisseur, de distributeur ou de fonds n'apparaît ici.
 */
import { STARTER_PACK_TEMPLATES, type TemplateRecipient } from './starterPack';

export type VariableFamily =
  | 'core'
  | 'investor'
  | 'partner'
  | 'campaign'
  | 'subscription'
  | 'operation'
  | 'document'
  | 'security';

export interface VariableDef {
  name: string;
  family: VariableFamily;
  description: { fr: string; en: string };
}

const DESCRIPTIONS: Record<string, { family: VariableFamily; fr: string; en: string }> = {
  $logo: { family: 'core', fr: 'Logo de la plateforme, résolu à l\'envoi', en: 'Platform logo, resolved at send time' },
  $appname: { family: 'core', fr: 'Nom de la société de gestion', en: 'Management company name' },
  $url: { family: 'core', fr: 'URL du portail', en: 'Portal URL' },
  $lurl: { family: 'core', fr: 'URL du portail avec la langue', en: 'Portal URL with language' },
  $year: { family: 'core', fr: 'Année courante', en: 'Current year' },
  $mirror: { family: 'core', fr: 'Lien miroir du message', en: 'Message mirror link' },
  $mail_support: { family: 'core', fr: 'Adresse de support technique', en: 'Technical support address' },
  $site: { family: 'core', fr: 'Nom du site', en: 'Site name' },
  $link: { family: 'core', fr: 'Lien contextuel de l\'action attendue', en: 'Contextual link for the expected action' },
  $message: { family: 'core', fr: 'Message libre saisi à l\'envoi', en: 'Free-form message entered at send time' },
  $content: { family: 'core', fr: 'Contenu libre du document à signer', en: 'Free-form content of the document to sign' },
  $pitch: { family: 'core', fr: 'Texte de contexte de l\'opération', en: 'Context text for the operation' },
  $checklink: { family: 'core', fr: 'Lien de reprise du dossier à compléter', en: 'Link to resume the file to complete' },
  $link_ok: { family: 'core', fr: 'Lien de réponse « je participe »', en: 'Link for the "I will attend" answer' },
  $link_ko: { family: 'core', fr: 'Lien de réponse « je ne participe pas »', en: 'Link for the "I will not attend" answer' },
  $acceptation_link: { family: 'core', fr: 'Lien d\'acceptation de la mise en vente', en: 'Link to accept the sale offer' },
  $declination_link: { family: 'core', fr: 'Lien de refus de la mise en vente', en: 'Link to decline the sale offer' },
  $newslink: { family: 'core', fr: 'Lien vers l\'actualité sur le portail', en: 'Link to the news item on the portal' },
  $sujet: { family: 'core', fr: 'Objet de la newsletter', en: 'Newsletter subject' },
  $subject: { family: 'core', fr: 'Objet du sondage', en: 'Survey subject' },
  $title: { family: 'core', fr: 'Titre de l\'actualité', en: 'News item title' },
  $extract: { family: 'core', fr: 'Chapô de l\'actualité', en: 'News item lead-in' },
  $infos: { family: 'core', fr: 'Informations pratiques de l\'événement', en: 'Practical information about the event' },
  $additional_infos: { family: 'core', fr: 'Précisions d\'accès au lieu', en: 'Additional directions to the venue' },
  $event: { family: 'core', fr: 'Nom de l\'événement', en: 'Event name' },
  $participation: { family: 'core', fr: 'Réponse de participation enregistrée', en: 'Recorded attendance answer' },
  $config: { family: 'core', fr: 'Modalité de participation choisie', en: 'Chosen attendance format' },
  $additional_people: { family: 'core', fr: 'Accompagnants annoncés', en: 'Announced guests' },
  $heure: { family: 'core', fr: 'Heure de l\'événement', en: 'Event time' },
  $lieu: { family: 'core', fr: 'Ville de l\'événement', en: 'Event city' },
  $location: { family: 'core', fr: 'Lieu de l\'événement', en: 'Event venue' },
  $address: { family: 'core', fr: 'Adresse complète du lieu', en: 'Full address of the venue' },
  $reason: { family: 'core', fr: 'Sujet de la demande de contact', en: 'Topic of the contact request' },
  $questions: { family: 'core', fr: 'Questions et pièces à revoir, liste mise en forme', en: 'Questions and documents to review, formatted list' },
  $info: { family: 'core', fr: 'Nature de la donnée concernée par la demande', en: 'Type of data covered by the request' },
  $submitter: { family: 'core', fr: 'Utilisateur ayant soumis le dossier', en: 'User who submitted the file' },
  $asker_name: { family: 'core', fr: 'Utilisateur demandeur de la validation', en: 'User requesting the validation' },
  $validator_name: { family: 'core', fr: 'Valideur ayant statué sur le dossier', en: 'Validator who decided on the file' },
  $fullname: { family: 'core', fr: 'Identité de l\'utilisateur à l\'origine de l\'action', en: 'Identity of the user behind the action' },
  $useremail: { family: 'core', fr: 'Adresse du contact connecté au moment de l\'envoi', en: 'Address of the signed-in contact at send time' },

  $prenom: { family: 'investor', fr: 'Prénom du destinataire', en: 'Recipient first name' },
  $nom: { family: 'investor', fr: 'Nom du destinataire', en: 'Recipient last name' },
  $firstname: { family: 'investor', fr: 'Prénom du destinataire', en: 'Recipient first name' },
  $lastname: { family: 'investor', fr: 'Nom du destinataire', en: 'Recipient last name' },
  '$investor.firstname': { family: 'investor', fr: 'Prénom du contact investisseur', en: 'Investor contact first name' },
  '$investor.lastname': { family: 'investor', fr: 'Nom du contact investisseur', en: 'Investor contact last name' },
  '$investor.name': { family: 'investor', fr: 'Nom du compte investisseur', en: 'Investor account name' },
  '$investor.fullname': { family: 'investor', fr: 'Identité complète de l\'investisseur', en: 'Investor full identity' },
  $investor: { family: 'investor', fr: 'Nom du compte investisseur', en: 'Investor account name' },
  $subinvestor: { family: 'investor', fr: 'Nom du sous-compte, vide sinon', en: 'Sub-account name, empty otherwise' },
  $company_name: { family: 'investor', fr: 'Raison sociale de l\'investisseur', en: 'Investor company name' },
  $email: { family: 'investor', fr: 'Adresse email du compte', en: 'Account email address' },
  $currentemail: { family: 'investor', fr: 'Adresse email actuelle', en: 'Current email address' },
  $newmail: { family: 'investor', fr: 'Nouvelle adresse email demandée', en: 'Requested new email address' },
  $contact_firstname: { family: 'investor', fr: 'Prénom du contact de suivi', en: 'Follow-up contact first name' },
  $contact_lastname: { family: 'investor', fr: 'Nom du contact de suivi', en: 'Follow-up contact last name' },
  $contact_mail: { family: 'investor', fr: 'Email du contact de suivi', en: 'Follow-up contact email' },
  $iban: { family: 'investor', fr: 'IBAN de règlement du destinataire', en: 'Recipient payment IBAN' },
  $ParentUserName: { family: 'investor', fr: 'Prénom du contact créateur', en: 'Creating contact first name' },
  $ParentUserFamilyname: { family: 'investor', fr: 'Nom du contact créateur', en: 'Creating contact last name' },
  $ChildUserName: { family: 'investor', fr: 'Prénom de l\'utilisateur créé', en: 'Created user first name' },
  $ChildUserFamilyName: { family: 'investor', fr: 'Nom de l\'utilisateur créé', en: 'Created user last name' },
  '$investor.iban': { family: 'investor', fr: 'IBAN de prélèvement de l\'investisseur', en: 'Investor direct debit IBAN' },
  '$investor.parent.name': { family: 'investor', fr: 'Nom de l\'entité mère de l\'investisseur', en: 'Investor parent entity name' },
  $investorname: { family: 'investor', fr: 'Nom du compte investisseur', en: 'Investor account name' },
  $investoremail: { family: 'investor', fr: 'Adresse email de l\'investisseur', en: 'Investor email address' },
  $investorid: { family: 'investor', fr: 'Référence de l\'investisseur', en: 'Investor reference' },
  $investor_firstname: { family: 'investor', fr: 'Prénom de l\'investisseur', en: 'Investor first name' },
  $investor_lastname: { family: 'investor', fr: 'Nom de l\'investisseur', en: 'Investor last name' },
  $investor_fullname: { family: 'investor', fr: 'Identité complète de l\'investisseur', en: 'Investor full identity' },
  $buyer_fullname: { family: 'investor', fr: 'Identité de l\'acheteur', en: 'Buyer identity' },

  '$partner.name': { family: 'partner', fr: 'Nom du cabinet distributeur', en: 'Distributor firm name' },
  '$partner.signatory': { family: 'partner', fr: 'Signataire du distributeur', en: 'Distributor signatory' },
  $partner: { family: 'partner', fr: 'Nom du cabinet distributeur', en: 'Distributor firm name' },
  $partneruser: { family: 'partner', fr: 'Utilisateur du distributeur', en: 'Distributor user' },
  $partnername: { family: 'partner', fr: 'Nom du distributeur', en: 'Distributor name' },
  $partner_name: { family: 'partner', fr: 'Nom du cabinet distributeur', en: 'Distributor firm name' },
  $nom_partenaire: { family: 'partner', fr: 'Nom du partenaire distributeur', en: 'Distributor partner name' },
  '$partner.contact_firstname': { family: 'partner', fr: 'Prénom du contact du distributeur', en: 'Distributor contact first name' },
  '$partner.contact_lastname': { family: 'partner', fr: 'Nom du contact du distributeur', en: 'Distributor contact last name' },
  '$partner.email': { family: 'partner', fr: 'Email du distributeur', en: 'Distributor email' },
  '$partner.orias': { family: 'partner', fr: 'Numéro ORIAS du distributeur', en: 'Distributor ORIAS number' },
  '$partner.siren': { family: 'partner', fr: 'SIREN du distributeur', en: 'Distributor SIREN' },
  $orias: { family: 'partner', fr: 'Numéro ORIAS du distributeur', en: 'Distributor ORIAS number' },
  $type: { family: 'partner', fr: 'Rôle de l\'utilisateur dans le réseau', en: 'User role within the network' },
  $retro: { family: 'partner', fr: 'Référence du décompte de rétrocessions', en: 'Retrocession statement reference' },
  $numero: { family: 'partner', fr: 'Numéro de la facture du distributeur', en: 'Distributor invoice number' },

  $campaign: { family: 'campaign', fr: 'Nom du fonds', en: 'Fund name' },
  '$campaign.name': { family: 'campaign', fr: 'Nom du fonds', en: 'Fund name' },
  '$campaign.iban': { family: 'campaign', fr: 'IBAN du compte du fonds', en: 'Fund account IBAN' },
  '$campaign.bic': { family: 'campaign', fr: 'BIC du compte du fonds', en: 'Fund account BIC' },
  $fund: { family: 'campaign', fr: 'Nom du fonds', en: 'Fund name' },
  $fundname: { family: 'campaign', fr: 'Nom du fonds', en: 'Fund name' },
  $fund_type: { family: 'campaign', fr: 'Type de fonds', en: 'Fund type' },
  $partname: { family: 'campaign', fr: 'Nom de la part', en: 'Share name' },
  $share_name: { family: 'campaign', fr: 'Nom de la part', en: 'Share name' },
  '$fund.name': { family: 'campaign', fr: 'Nom du fonds', en: 'Fund name' },
  $fund_name: { family: 'campaign', fr: 'Nom du fonds', en: 'Fund name' },
  $fond: { family: 'campaign', fr: 'Nom du fonds', en: 'Fund name' },
  $part_name: { family: 'campaign', fr: 'Nom de la part', en: 'Share name' },

  $subscriptionname: { family: 'subscription', fr: 'Référence de la souscription', en: 'Subscription reference' },
  $subscription_name: { family: 'subscription', fr: 'Référence de la souscription', en: 'Subscription reference' },
  '$subscription.name': { family: 'subscription', fr: 'Référence de la souscription', en: 'Subscription reference' },
  $subscription_names: { family: 'subscription', fr: 'Liste des souscriptions couvertes', en: 'List of subscriptions covered' },
  $subscription: { family: 'subscription', fr: 'Identifiant de la souscription', en: 'Subscription identifier' },
  '$subscription.amount': { family: 'subscription', fr: 'Montant souscrit', en: 'Subscribed amount' },
  $subscription_amount: { family: 'subscription', fr: 'Montant souscrit', en: 'Subscribed amount' },
  $subscription_url: { family: 'subscription', fr: 'Lien vers la souscription au back office', en: 'Back office link to the subscription' },
  $id_souscription: { family: 'subscription', fr: 'Identifiant technique de la souscription', en: 'Technical subscription identifier' },
  $nbshares: { family: 'subscription', fr: 'Nombre de parts', en: 'Number of shares' },
  $nb: { family: 'subscription', fr: 'Nombre de parts demandé', en: 'Requested number of shares' },
  $nb_parts: { family: 'subscription', fr: 'Nombre de parts demandé', en: 'Requested number of shares' },
  $nb_real: { family: 'subscription', fr: 'Nombre de parts définitif', en: 'Final number of shares' },
  $part: { family: 'subscription', fr: 'Part concernée', en: 'Share concerned' },
  $parts: { family: 'subscription', fr: 'Nombre de parts attribuées', en: 'Number of shares allotted' },
  $shares_count: { family: 'subscription', fr: 'Nombre de parts concernées par l\'offre', en: 'Number of shares covered by the offer' },
  $subscription_reference: { family: 'subscription', fr: 'Référence de la souscription', en: 'Subscription reference' },
  $subscriptionid: { family: 'subscription', fr: 'Identifiant de la souscription', en: 'Subscription identifier' },
  $subscription_date: { family: 'subscription', fr: 'Date de création de la souscription', en: 'Subscription creation date' },

  $amount: { family: 'operation', fr: 'Montant de l\'opération', en: 'Operation amount' },
  $amount_final: { family: 'operation', fr: 'Montant définitif', en: 'Final amount' },
  $investamount: { family: 'operation', fr: 'Montant appelé', en: 'Amount called' },
  $investpct: { family: 'operation', fr: 'Part de l\'engagement appelée', en: 'Share of commitment called' },
  $distrib_amount: { family: 'operation', fr: 'Montant distribué', en: 'Amount distributed' },
  $distrib_total_amount: { family: 'operation', fr: 'Total distribué toutes souscriptions', en: 'Total distributed across subscriptions' },
  $amount_per_share: { family: 'operation', fr: 'Montant par part', en: 'Amount per share' },
  $charges: { family: 'operation', fr: 'Frais de l\'opération', en: 'Operation fees' },
  $remaining_amount: { family: 'operation', fr: 'Solde restant à régler', en: 'Remaining amount due' },
  $vl_vente: { family: 'operation', fr: 'Valeur liquidative retenue', en: 'Net asset value applied' },
  $vl_vente_date: { family: 'operation', fr: 'Date de la valeur liquidative', en: 'Net asset value date' },
  $dateVL: { family: 'operation', fr: 'Date de la valeur liquidative appliquée', en: 'Applied net asset value date' },
  $date: { family: 'operation', fr: 'Date de l\'opération', en: 'Operation date' },
  $date_added: { family: 'operation', fr: 'Date de la demande initiale', en: 'Initial request date' },
  $duedate: { family: 'operation', fr: 'Date limite de règlement', en: 'Payment deadline' },
  $debit_date: { family: 'operation', fr: 'Date prévue du prélèvement', en: 'Scheduled direct debit date' },
  $payment_date: { family: 'operation', fr: 'Date prévisionnelle de règlement', en: 'Expected payment date' },
  $submit_date: { family: 'operation', fr: 'Date de soumission', en: 'Submission date' },
  $call_reference: { family: 'operation', fr: 'Référence de virement attendue', en: 'Expected transfer reference' },
  $callname: { family: 'operation', fr: 'Nom de l\'appel de fonds', en: 'Capital call name' },
  $caname: { family: 'operation', fr: 'Nom du capital account', en: 'Capital account name' },
  $distribname: { family: 'operation', fr: 'Nom de la distribution', en: 'Distribution name' },
  $amtornb: { family: 'operation', fr: 'Demande initiale, montant ou nombre de parts', en: 'Initial request, amount or number of shares' },
  $name: { family: 'operation', fr: 'Nom de l\'opération ou du document', en: 'Operation or document name' },
  $fees: { family: 'operation', fr: 'Frais de souscription', en: 'Subscription fees' },
  $totalAmt: { family: 'operation', fr: 'Montant total à régler, frais compris', en: 'Total amount payable, fees included' },
  $bid_amount: { family: 'operation', fr: 'Montant de l\'intention d\'achat', en: 'Amount of the purchase intent' },
  $bid_shares_count: { family: 'operation', fr: 'Nombre de parts visé par l\'intention d\'achat', en: 'Number of shares targeted by the purchase intent' },
  $transfer_amount: { family: 'operation', fr: 'Montant de la cession', en: 'Transfer amount' },
  $transfer_shares_count: { family: 'operation', fr: 'Nombre de parts cédées', en: 'Number of shares transferred' },

  $docname: { family: 'document', fr: 'Nom du document publié', en: 'Published document name' },
  $document_name: { family: 'document', fr: 'Nom du document', en: 'Document name' },
  $categname: { family: 'document', fr: 'Catégorie documentaire', en: 'Document category' },
  $creator: { family: 'document', fr: 'Déposant du document', en: 'Document uploader' },
  $validator: { family: 'document', fr: 'Valideur du document', en: 'Document approver' },
  $comment: { family: 'document', fr: 'Commentaire de validation, déjà préfixé', en: 'Validation comment, already prefixed' },
  $pending_documents_url: { family: 'document', fr: 'Lien vers les documents en attente', en: 'Link to pending documents' },
  $document_url: { family: 'document', fr: 'Lien direct vers le document', en: 'Direct link to the document' },
  $docs: { family: 'document', fr: 'Liste des documents joints ou mis à disposition', en: 'List of attached or provided documents' },
  $creator_firstname: { family: 'document', fr: 'Prénom de l\'auteur de l\'opération', en: 'First name of the user who created the operation' },
  $creator_lastname: { family: 'document', fr: 'Nom de l\'auteur de l\'opération', en: 'Last name of the user who created the operation' },

  $reset_url: { family: 'security', fr: 'Lien de création ou réinitialisation du mot de passe', en: 'Password creation or reset link' },
  $code: { family: 'security', fr: 'Code de connexion à usage unique', en: 'One-time login code' },
  $msg: { family: 'security', fr: 'Message renvoyé par le prestataire', en: 'Message returned by the provider' },
  $id_partner: { family: 'security', fr: 'Référence distributeur du dossier en échec', en: 'Distributor reference of the failed file' },
  $id_rebuy: { family: 'security', fr: 'Référence rachat du dossier en échec', en: 'Redemption reference of the failed file' },
  $id_kycrequest: { family: 'security', fr: 'Référence dossier KYC en échec', en: 'KYC file reference of the failed file' },
  $alerts: { family: 'security', fr: 'Détail des alertes de screening', en: 'Details of the screening alerts' },
  $nb_alerts: { family: 'security', fr: 'Nombre de nouvelles alertes de screening', en: 'Number of new screening alerts' },
  $risk_score: { family: 'security', fr: 'Score de risque calculé de la souscription', en: 'Calculated risk score of the subscription' },
};

function familyFromName(name: string): VariableFamily {
  if (name.startsWith('$investor')) return 'investor';
  if (name.startsWith('$partner')) return 'partner';
  if (name.startsWith('$campaign')) return 'campaign';
  if (name.startsWith('$subscription')) return 'subscription';
  return 'core';
}

/** Toutes les variables déclarées par le référentiel, décrites quand elles le sont. */
export const VARIABLE_CATALOG: VariableDef[] = (() => {
  const names = new Set<string>(Object.keys(DESCRIPTIONS));
  STARTER_PACK_TEMPLATES.forEach((template) => {
    template.variables.forEach((name) => names.add(name));
    template.proposedVariables.forEach((variable) => names.add(variable.name));
  });
  return Array.from(names)
    .map((name) => {
      const entry = DESCRIPTIONS[name];
      return {
        name,
        family: entry?.family ?? familyFromName(name),
        description: entry ? { fr: entry.fr, en: entry.en } : { fr: '', en: '' },
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
})();

export const VARIABLE_FAMILY_ORDER: VariableFamily[] = [
  'investor',
  'partner',
  'campaign',
  'subscription',
  'operation',
  'document',
  'security',
  'core',
];

/**
 * Score de pertinence : préfixe exact, puis sous-chaîne, puis sous-séquence sur
 * le nom, enfin correspondance dans la description. Zéro signifie exclu.
 */
export function scoreVariable(def: VariableDef, query: string, lang: 'fr' | 'en'): number {
  const q = query.trim().toLowerCase().replace(/^\$/, '');
  if (!q) return 1;

  const name = def.name.toLowerCase().replace(/^\$/, '');
  if (name === q) return 1000;
  if (name.startsWith(q)) return 800 - name.length;

  const idx = name.indexOf(q);
  if (idx >= 0) return 600 - idx - name.length / 100;

  // sous-séquence : "cbic" retrouve campaign.bic
  let cursor = 0;
  for (const char of q) {
    cursor = name.indexOf(char, cursor);
    if (cursor === -1) break;
    cursor += 1;
  }
  if (cursor !== -1) return 300 - name.length / 100;

  const description = def.description[lang].toLowerCase();
  if (description.includes(q)) return 150;

  return 0;
}

export function searchVariables(
  query: string,
  lang: 'fr' | 'en',
  allowed?: string[],
): VariableDef[] {
  const pool = allowed
    ? VARIABLE_CATALOG.filter((def) => allowed.includes(def.name))
    : VARIABLE_CATALOG;
  return pool
    .map((def) => ({ def, score: scoreVariable(def, query, lang) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.def.name.localeCompare(b.def.name))
    .map((row) => row.def);
}

/** Famille pour laquelle on peut choisir l'élément servant de valeurs d'exemple. */
export type SelectableFamily = 'investor' | 'partner' | 'campaign' | 'subscription' | 'operation';

export const SELECTABLE_FAMILIES: SelectableFamily[] = [
  'investor',
  'partner',
  'campaign',
  'subscription',
  'operation',
];

export interface ContextOption {
  id: string;
  label: string;
  sublabel: string;
  values: Record<string, string>;
}

/** Valeurs toujours présentes : plateforme, documents, accès. Aucun choix à faire. */
export const PLATFORM_VALUES: Record<string, string> = {
  $appname: 'InvestHub Asset Management',
  $url: 'https://portail.investhub.cloud',
  $lurl: 'https://portail.investhub.cloud/fr',
  $year: '2026',
  $mirror: 'https://portail.investhub.cloud/mirror/2026-A14',
  $mail_support: 'support@investhub.cloud',
  $site: 'Portail InvestHub',
  $link: 'https://portail.investhub.cloud/souscriptions/2026-A14',
  $link_ok: 'https://portail.investhub.cloud/evenements/2026/oui',
  $link_ko: 'https://portail.investhub.cloud/evenements/2026/non',
  $acceptation_link: 'https://portail.investhub.cloud/secondaire/offre/accepter',
  $declination_link: 'https://portail.investhub.cloud/secondaire/offre/refuser',
  $reset_url: 'https://portail.investhub.cloud/mot-de-passe/8f21c4',
  $code: '482914',
  $message: 'Message personnel de votre interlocuteur.',
  $content: 'Le corps de la communication saisi à l’envoi.',
  $pitch: 'Cette opération fait suite à la cession de deux participations.',
  $sujet: 'Point trimestriel sur vos investissements',
  $subject: 'Enquête de satisfaction 2026',
  $title: 'Ouverture du closing 3',
  $extract: 'Le closing 3 est ouvert jusqu’au 30 septembre.',
  $infos: 'Un émargement est prévu à partir de 9h30.',
  $contact_firstname: 'Sofia',
  $contact_lastname: 'Marchand',
  $contact_mail: 'sofia.marchand@example.com',
  $creator: 'Sofia Marchand',
  $creator_firstname: 'Sofia',
  $creator_lastname: 'Marchand',
  $validator: 'Nicolas Berger',
  $comment: 'Commentaire : relecture faite.',
  $pending_documents_url: 'https://back.investhub.cloud/documents/en-attente',
  $document_url: 'https://back.investhub.cloud/documents/4821',
  $subscription_url: 'https://back.investhub.cloud/souscriptions/2026-A14',
  $docname: 'Reporting T2 2026',
  $document_name: 'Reporting T2 2026',
  $categname: 'Reportings',
  $msg: 'HTTP 502 - provider unavailable',
  $id_partner: '0',
  $id_rebuy: '0',
  $id_kycrequest: '0',
  $useremail: 'contact@example.com',
  $event: 'Assemblée générale annuelle',
  $participation: 'Je participe',
  $config: 'En présentiel',
  $additional_people: '1 accompagnant',
  $heure: '10h00',
  $lieu: 'Paris',
  $location: '12 rue de la Bourse, Paris',
  $address: '12 rue de la Bourse, 75002 Paris',
  $additional_infos: 'Accès par la porte principale.',
  $currentemail: 'camille.durand@example.com',
  $newmail: 'c.durand@example.com',
  $checklink: 'https://portail.investhub.cloud/dossier/2026-A14/completer',
  $newslink: 'https://portail.investhub.cloud/actualites/closing-3',
  $questions:
    '<ul><li>Justificatif de domicile de moins de 3 mois</li><li>Origine des fonds à préciser</li></ul>',
  $docs: '<ul><li>Bulletin de souscription signé</li><li>Conditions générales</li></ul>',
  $info: 'Adresse de correspondance',
  $reason: 'Question sur mon reporting',
  $alerts: '<ul><li>Homonymie sur une liste de sanctions, à lever</li><li>Statut PEP à confirmer</li></ul>',
  $nb_alerts: '2',
  $risk_score: 'Élevé (72/100)',
  $submitter: 'Camille Legrand',
  $asker_name: 'Camille Legrand',
  $validator_name: 'Nicolas Berger',
  $fullname: 'Léa Fontaine',
};

/** Éléments proposés pour chaque famille, le premier servant de valeur par défaut. */
export const CONTEXT_SOURCES: Record<SelectableFamily, ContextOption[]> = {
  investor: [
    {
      id: 'durand',
      label: 'Camille Durand',
      sublabel: 'Personne physique',
      values: {
        $prenom: 'Camille',
        $nom: 'Durand',
        $firstname: 'Camille',
        $lastname: 'Durand',
        '$investor.firstname': 'Camille',
        '$investor.lastname': 'Durand',
        '$investor.name': 'Camille Durand',
        '$investor.fullname': 'Camille Durand',
        $investor: 'Camille Durand',
        $investorname: 'Camille Durand',
        $investoremail: 'camille.durand@example.com',
        $investorid: 'INV-4821',
        $investor_firstname: 'Camille',
        $investor_lastname: 'Durand',
        $investor_fullname: 'Camille Durand',
        $buyer_fullname: 'Inès Roche',
        $subinvestor: '',
        $company_name: '',
        $email: 'camille.durand@example.com',
        $contact_firstname: 'Camille',
        $contact_lastname: 'Durand',
        $ParentUserName: 'Camille',
        $ParentUserFamilyname: 'Durand',
        $ChildUserName: 'Alex',
        $ChildUserFamilyName: 'Durand',
        $iban: 'FR76 3000 4000 5000 6000 7000 189',
        '$investor.iban': 'FR76 3000 4000 5000 6000 7000 189',
        '$investor.parent.name': '',
      },
    },
    {
      id: 'holding',
      label: 'Durand Holding',
      sublabel: 'Personne morale',
      values: {
        $prenom: 'Alex',
        $nom: 'Durand',
        $firstname: 'Alex',
        $lastname: 'Durand',
        '$investor.firstname': 'Alex',
        '$investor.lastname': 'Durand',
        '$investor.name': 'Durand Holding',
        '$investor.fullname': 'Durand Holding',
        $investor: 'Durand Holding',
        $investorname: 'Durand Holding',
        $investoremail: 'contact@durand-holding.example',
        $investorid: 'INV-5107',
        $investor_firstname: 'Alex',
        $investor_lastname: 'Durand',
        $investor_fullname: 'Durand Holding',
        $buyer_fullname: 'Camille Durand',
        $subinvestor: 'Durand Holding - Compartiment 2',
        $company_name: 'Durand Holding',
        $email: 'contact@durand-holding.example',
        $contact_firstname: 'Alex',
        $contact_lastname: 'Durand',
        $ParentUserName: 'Alex',
        $ParentUserFamilyname: 'Durand',
        $ChildUserName: 'Inès',
        $ChildUserFamilyName: 'Roche',
        $iban: 'FR14 2004 1010 0505 0001 3M02 606',
        '$investor.iban': 'FR14 2004 1010 0505 0001 3M02 606',
        '$investor.parent.name': 'Durand Participations',
      },
    },
  ],
  partner: [
    {
      id: 'meridien',
      label: 'Cabinet Meridien',
      sublabel: 'Signataire Léa Fontaine',
      values: {
        $partner: 'Cabinet Meridien',
        '$partner.name': 'Cabinet Meridien',
        '$partner.signatory': 'Léa Fontaine',
        $partneruser: 'Léa Fontaine',
        $partner_name: 'Cabinet Meridien',
        $partnername: 'Cabinet Meridien',
        $nom_partenaire: 'Cabinet Meridien',
        '$partner.contact_firstname': 'Léa',
        '$partner.contact_lastname': 'Fontaine',
        '$partner.email': 'contact@cabinet-meridien.example',
        '$partner.orias': '07 012 345',
        '$partner.siren': '812 345 678',
        $orias: '07 012 345',
        $type: 'Conseiller',
        $retro: 'RETRO-2026-T2-MER',
        $numero: 'FA-2026-0147',
      },
    },
    {
      id: 'atlas',
      label: 'Atlas Patrimoine',
      sublabel: 'Signataire Marc Ollivier',
      values: {
        $partner: 'Atlas Patrimoine',
        '$partner.name': 'Atlas Patrimoine',
        '$partner.signatory': 'Marc Ollivier',
        $partneruser: 'Marc Ollivier',
        $partner_name: 'Atlas Patrimoine',
        $partnername: 'Atlas Patrimoine',
        $nom_partenaire: 'Atlas Patrimoine',
        '$partner.contact_firstname': 'Marc',
        '$partner.contact_lastname': 'Ollivier',
        '$partner.email': 'contact@atlas-patrimoine.example',
        '$partner.orias': '11 067 890',
        '$partner.siren': '903 221 456',
        $orias: '11 067 890',
        $type: 'Responsable réseau',
        $retro: 'RETRO-2026-T2-ATL',
        $numero: 'FA-2026-0152',
      },
    },
    {
      id: 'direct',
      label: 'Souscription directe',
      sublabel: 'Aucun distributeur',
      values: {
        $partner: '',
        '$partner.name': '',
        '$partner.signatory': '',
        $partneruser: '',
        $partner_name: '',
        $partnername: '',
        $nom_partenaire: '',
        '$partner.contact_firstname': '',
        '$partner.contact_lastname': '',
        '$partner.email': '',
        '$partner.orias': '',
        '$partner.siren': '',
        $orias: '',
        $type: '',
        $retro: '',
        $numero: '',
      },
    },
  ],
  campaign: [
    {
      id: 'northwind',
      label: 'Northwind Growth III',
      sublabel: 'FPCI · part A',
      values: {
        $campaign: 'Northwind Growth III',
        '$campaign.name': 'Northwind Growth III',
        '$campaign.iban': 'FR76 3000 4000 5000 6000 7000 189',
        '$campaign.bic': 'BNPAFRPPXXX',
        $fund: 'Northwind Growth III',
        $fundname: 'Northwind Growth III',
        $fund_name: 'Northwind Growth III',
        '$fund.name': 'Northwind Growth III',
        $fond: 'Northwind Growth III',
        $fund_type: 'FPCI',
        $partname: 'A',
        $share_name: 'A',
        $part_name: 'A',
        $part: 'A',
      },
    },
    {
      id: 'meridian',
      label: 'Meridian Infra Debt II',
      sublabel: 'SLP · part I',
      values: {
        $campaign: 'Meridian Infra Debt II',
        '$campaign.name': 'Meridian Infra Debt II',
        '$campaign.iban': 'FR14 2004 1010 0505 0001 3M02 606',
        '$campaign.bic': 'PSSTFRPPXXX',
        $fund: 'Meridian Infra Debt II',
        $fundname: 'Meridian Infra Debt II',
        $fund_name: 'Meridian Infra Debt II',
        '$fund.name': 'Meridian Infra Debt II',
        $fond: 'Meridian Infra Debt II',
        $fund_type: 'SLP',
        $partname: 'I',
        $share_name: 'I',
        $part_name: 'I',
        $part: 'I',
      },
    },
  ],
  subscription: [
    {
      id: 'a14',
      label: 'SUB-2026-A14',
      sublabel: '250 000,00 € · 1 000 parts',
      values: {
        $subscriptionname: 'SUB-2026-A14',
        $subscription_name: 'SUB-2026-A14',
        '$subscription.name': 'SUB-2026-A14',
        $subscription: 'SUB-2026-A14',
        $subscription_reference: 'SUB-2026-A14',
        $subscription_names: 'SUB-2026-A14, SUB-2026-A15',
        '$subscription.amount': '250 000,00 €',
        $subscription_amount: '250 000,00 €',
        $id_souscription: 'SUB-2026-A14',
        $subscriptionid: 'SUB-2026-A14',
        $dossierRef: 'SUB-2026-A14',
        $subscription_date: '05/08/2026',
        $nbshares: '1 000',
        $nb: '1 000',
        $nb_parts: '1 000',
        $parts: '1 000',
        $shares_count: '1 000',
        $fees: '7 500,00 €',
        $totalAmt: '257 500,00 €',
      },
    },
    {
      id: 'b07',
      label: 'SUB-2026-B07',
      sublabel: '1 500 000,00 € · 6 000 parts',
      values: {
        $subscriptionname: 'SUB-2026-B07',
        $subscription_name: 'SUB-2026-B07',
        '$subscription.name': 'SUB-2026-B07',
        $subscription: 'SUB-2026-B07',
        $subscription_reference: 'SUB-2026-B07',
        $subscription_names: 'SUB-2026-B07, SUB-2026-B08',
        '$subscription.amount': '1 500 000,00 €',
        $subscription_amount: '1 500 000,00 €',
        $id_souscription: 'SUB-2026-B07',
        $subscriptionid: 'SUB-2026-B07',
        $dossierRef: 'SUB-2026-B07',
        $subscription_date: '22/07/2026',
        $nbshares: '6 000',
        $nb: '6 000',
        $nb_parts: '6 000',
        $parts: '6 000',
        $shares_count: '6 000',
        $fees: '30 000,00 €',
        $totalAmt: '1 530 000,00 €',
      },
    },
  ],
  operation: [
    {
      id: 'call',
      label: 'Appel de fonds n°3',
      sublabel: '250 000,00 € · échéance 30/09/2026',
      values: {
        $amount: '250 000,00 €',
        $amount_final: '250 000,00 €',
        $investamount: '250 000,00 €',
        $investpct: '25 %',
        $callname: 'Appel n°3',
        $date: '30/09/2026',
        $duedate: '30/09/2026',
        $debit_date: '30/09/2026',
        $payment_date: '15/10/2026',
        $call_reference: 'AF-2026-03-A14',
        $remaining_amount: '50 000,00 €',
        $charges: '0,00 €',
        $name: 'Appel de fonds n°3',
      },
    },
    {
      id: 'distribution',
      label: 'Distribution n°2',
      sublabel: '48 500,00 € · 19,40 € par part',
      values: {
        $amount: '48 500,00 €',
        $amount_final: '48 500,00 €',
        $distrib_amount: '48 500,00 €',
        $distrib_total_amount: '92 300,00 €',
        $amount_per_share: '19,40 €',
        $distribname: 'Distribution n°2',
        $caname: 'Capital account T2 2026',
        $date: '30/06/2026',
        $dateVL: '30/06/2026',
        $charges: '1 200,00 €',
        $name: 'Distribution n°2',
      },
    },
    {
      id: 'redemption',
      label: 'Rachat 980 parts',
      sublabel: '243 040,00 € · VL 248,00 €',
      values: {
        $amount: '243 040,00 €',
        $amount_final: '243 040,00 €',
        $amtornb: '1 000 parts',
        $nb_real: '980',
        $vl_vente: '248,00 €',
        $vl_vente_date: '30/06/2026',
        $date_added: '05/08/2026',
        $submit_date: '05/08/2026',
        $date: '30/09/2026',
        $payment_date: '15/10/2026',
        $transfer_shares_count: '980',
        $transfer_amount: '243 040,00 €',
        $bid_shares_count: '500',
        $bid_amount: '124 000,00 €',
        $charges: '0,00 €',
        $name: 'Rachat 980 parts',
      },
    },
  ],
};

/** Élément retenu pour chaque famille. */
export type ContextSelection = Record<SelectableFamily, string>;

export function defaultSelection(): ContextSelection {
  return SELECTABLE_FAMILIES.reduce((acc, family) => {
    acc[family] = CONTEXT_SOURCES[family][0].id;
    return acc;
  }, {} as ContextSelection);
}

export function optionFor(family: SelectableFamily, id: string): ContextOption {
  const options = CONTEXT_SOURCES[family];
  return options.find((option) => option.id === id) ?? options[0];
}

/**
 * Valeurs d'exemple résultant de la sélection.
 *
 * L'ordre des familles compte : la souscription porte le nombre de parts, que
 * l'opération peut préciser ensuite. La plateforme est posée en premier, elle
 * n'écrase rien.
 */
export function resolveValues(selection: ContextSelection): Record<string, string> {
  return SELECTABLE_FAMILIES.reduce<Record<string, string>>(
    (acc, family) => Object.assign(acc, optionFor(family, selection[family]).values),
    { ...PLATFORM_VALUES },
  );
}
