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

  '$partner.name': { family: 'partner', fr: 'Nom du cabinet distributeur', en: 'Distributor firm name' },
  '$partner.signatory': { family: 'partner', fr: 'Signataire du distributeur', en: 'Distributor signatory' },
  $partner: { family: 'partner', fr: 'Nom du cabinet distributeur', en: 'Distributor firm name' },
  $partneruser: { family: 'partner', fr: 'Utilisateur du distributeur', en: 'Distributor user' },

  $campaign: { family: 'campaign', fr: 'Nom du fonds', en: 'Fund name' },
  '$campaign.name': { family: 'campaign', fr: 'Nom du fonds', en: 'Fund name' },
  '$campaign.iban': { family: 'campaign', fr: 'IBAN du compte du fonds', en: 'Fund account IBAN' },
  '$campaign.bic': { family: 'campaign', fr: 'BIC du compte du fonds', en: 'Fund account BIC' },
  $fund: { family: 'campaign', fr: 'Nom du fonds', en: 'Fund name' },
  $fundname: { family: 'campaign', fr: 'Nom du fonds', en: 'Fund name' },
  $fund_type: { family: 'campaign', fr: 'Type de fonds', en: 'Fund type' },
  $partname: { family: 'campaign', fr: 'Nom de la part', en: 'Share name' },
  $share_name: { family: 'campaign', fr: 'Nom de la part', en: 'Share name' },

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

  $docname: { family: 'document', fr: 'Nom du document publié', en: 'Published document name' },
  $document_name: { family: 'document', fr: 'Nom du document', en: 'Document name' },
  $categname: { family: 'document', fr: 'Catégorie documentaire', en: 'Document category' },
  $creator: { family: 'document', fr: 'Déposant du document', en: 'Document uploader' },
  $validator: { family: 'document', fr: 'Valideur du document', en: 'Document approver' },
  $comment: { family: 'document', fr: 'Commentaire de validation, déjà préfixé', en: 'Validation comment, already prefixed' },
  $pending_documents_url: { family: 'document', fr: 'Lien vers les documents en attente', en: 'Link to pending documents' },
  $document_url: { family: 'document', fr: 'Lien direct vers le document', en: 'Direct link to the document' },

  $reset_url: { family: 'security', fr: 'Lien de création ou réinitialisation du mot de passe', en: 'Password creation or reset link' },
  $code: { family: 'security', fr: 'Code de connexion à usage unique', en: 'One-time login code' },
  $msg: { family: 'security', fr: 'Message renvoyé par le prestataire', en: 'Message returned by the provider' },
  $id_partner: { family: 'security', fr: 'Référence distributeur du dossier en échec', en: 'Distributor reference of the failed file' },
  $id_rebuy: { family: 'security', fr: 'Référence rachat du dossier en échec', en: 'Redemption reference of the failed file' },
  $id_kycrequest: { family: 'security', fr: 'Référence dossier KYC en échec', en: 'KYC file reference of the failed file' },
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

export interface PreviewContext {
  id: string;
  kind: TemplateRecipient;
  /** Nom affiché dans le sélecteur. */
  label: string;
  /** Précision affichée sous le nom. */
  sublabel: string;
  values: Record<string, string>;
}

const GP = {
  $appname: 'InvestHub Asset Management',
  $url: 'https://portail.investhub.cloud',
  $lurl: 'https://portail.investhub.cloud/fr',
  $year: '2026',
  $mirror: 'https://portail.investhub.cloud/mirror/2026-A14',
  $mail_support: 'support@investhub.cloud',
  $site: 'Portail InvestHub',
  $link: 'https://portail.investhub.cloud/souscriptions/2026-A14',
  $reset_url: 'https://portail.investhub.cloud/mot-de-passe/8f21c4',
  $code: '482914',
  $message: 'Message personnel de votre interlocuteur.',
  $content: 'Document soumis à signature dans le cadre du closing.',
  $pitch: 'Cette opération fait suite à la cession de deux participations.',
  $contact_firstname: 'Sofia',
  $contact_lastname: 'Marchand',
  $contact_mail: 'sofia.marchand@example.com',
  $creator: 'Sofia Marchand',
  $validator: 'Nicolas Berger',
  $comment: 'Commentaire : relecture faite.',
  $pending_documents_url: 'https://back.investhub.cloud/documents/en-attente',
  $document_url: 'https://back.investhub.cloud/documents/4821',
  $subscription_url: 'https://back.investhub.cloud/souscriptions/2026-A14',
  $docname: 'Reporting T2 2026',
  $document_name: 'Reporting T2 2026',
  $categname: 'Reportings',
  $name: 'Pacte associés 2026',
  $msg: 'HTTP 502 - provider unavailable',
  $id_partner: '0',
  $id_rebuy: '0',
  $id_kycrequest: '0',
};

const FUND_NORTHWIND = {
  $campaign: 'Northwind Growth III',
  '$campaign.name': 'Northwind Growth III',
  '$campaign.iban': 'FR76 3000 4000 5000 6000 7000 189',
  '$campaign.bic': 'BNPAFRPPXXX',
  $fund: 'Northwind Growth III',
  $fundname: 'Northwind Growth III',
  $fund_type: 'FPCI',
  $partname: 'A',
  $share_name: 'A',
};

const FUND_MERIDIAN = {
  $campaign: 'Meridian Infra Debt II',
  '$campaign.name': 'Meridian Infra Debt II',
  '$campaign.iban': 'FR14 2004 1010 0505 0001 3M02 606',
  '$campaign.bic': 'PSSTFRPPXXX',
  $fund: 'Meridian Infra Debt II',
  $fundname: 'Meridian Infra Debt II',
  $fund_type: 'SLP',
  $partname: 'I',
  $share_name: 'I',
};

const OPERATION = {
  $amount: '250 000,00 €',
  $amount_final: '243 040,00 €',
  $investamount: '250 000,00 €',
  $investpct: '25 %',
  $distrib_amount: '48 500,00 €',
  $distrib_total_amount: '92 300,00 €',
  $amount_per_share: '19,40 €',
  $charges: '1 200,00 €',
  $remaining_amount: '50 000,00 €',
  $vl_vente: '248,00 €',
  $vl_vente_date: '30/06/2026',
  $dateVL: '30/06/2026',
  $date: '30/09/2026',
  $date_added: '05/08/2026',
  $duedate: '30/09/2026',
  $debit_date: '30/09/2026',
  $payment_date: '15/10/2026',
  $submit_date: '05/08/2026',
  $call_reference: 'AF-2026-03-A14',
  $callname: 'Appel n°3',
  $caname: 'Capital account T2 2026',
  $distribname: 'Distribution n°2',
  $amtornb: '1 000 parts',
  $nbshares: '2 500',
  $nb: '1 000',
  $nb_parts: '1 000',
  $nb_real: '980',
  $part: 'A',
  $iban: 'FR76 3000 4000 5000 6000 7000 189',
};

function subscription(reference: string, amount: string) {
  return {
    $subscriptionname: reference,
    $subscription_name: reference,
    '$subscription.name': reference,
    $subscription: reference,
    $subscription_names: `${reference}, ${reference.replace(/\d+$/, (n) => String(Number(n) + 1))}`,
    '$subscription.amount': amount,
    $subscription_amount: amount,
    $id_souscription: reference,
  };
}

/** Contextes fictifs proposés pour générer l'aperçu. */
export const PREVIEW_CONTEXTS: PreviewContext[] = [
  {
    id: 'investor-durand',
    kind: 'investor',
    label: 'Camille Durand',
    sublabel: 'Personne physique · Northwind Growth III · SUB-2026-A14',
    values: {
      ...GP,
      ...FUND_NORTHWIND,
      ...OPERATION,
      ...subscription('SUB-2026-A14', '250 000,00 €'),
      $prenom: 'Camille',
      $nom: 'Durand',
      $firstname: 'Camille',
      $lastname: 'Durand',
      '$investor.firstname': 'Camille',
      '$investor.lastname': 'Durand',
      '$investor.name': 'Camille Durand',
      '$investor.fullname': 'Camille Durand',
      $investor: 'Camille Durand',
      $subinvestor: '',
      $company_name: '',
      $email: 'camille.durand@example.com',
      $currentemail: 'camille.durand@example.com',
      $newmail: 'c.durand@example.com',
      $ParentUserName: 'Camille',
      $ParentUserFamilyname: 'Durand',
      $ChildUserName: 'Alex',
      $ChildUserFamilyName: 'Durand',
      $partner: 'Cabinet Meridien',
      '$partner.name': 'Cabinet Meridien',
      '$partner.signatory': 'Léa Fontaine',
      $partneruser: 'Léa Fontaine',
    },
  },
  {
    id: 'investor-holding',
    kind: 'investor',
    label: 'Durand Holding',
    sublabel: 'Personne morale · Meridian Infra Debt II · SUB-2026-B07',
    values: {
      ...GP,
      ...FUND_MERIDIAN,
      ...OPERATION,
      ...subscription('SUB-2026-B07', '1 500 000,00 €'),
      $prenom: 'Alex',
      $nom: 'Durand',
      $firstname: 'Alex',
      $lastname: 'Durand',
      '$investor.firstname': 'Alex',
      '$investor.lastname': 'Durand',
      '$investor.name': 'Durand Holding',
      '$investor.fullname': 'Durand Holding',
      $investor: 'Durand Holding',
      $subinvestor: 'Durand Holding - Compartiment 2',
      $company_name: 'Durand Holding',
      $email: 'contact@durand-holding.example',
      $currentemail: 'contact@durand-holding.example',
      $newmail: 'finance@durand-holding.example',
      $ParentUserName: 'Alex',
      $ParentUserFamilyname: 'Durand',
      $ChildUserName: 'Inès',
      $ChildUserFamilyName: 'Roche',
      $amount: '1 500 000,00 €',
      $investamount: '450 000,00 €',
      $partner: '',
      '$partner.name': '',
      '$partner.signatory': '',
      $partneruser: '',
    },
  },
  {
    id: 'partner-meridien',
    kind: 'partner',
    label: 'Cabinet Meridien',
    sublabel: 'Distributeur · signataire Léa Fontaine',
    values: {
      ...GP,
      ...FUND_NORTHWIND,
      ...OPERATION,
      ...subscription('SUB-2026-A14', '250 000,00 €'),
      $prenom: 'Léa',
      $nom: 'Fontaine',
      $firstname: 'Léa',
      $lastname: 'Fontaine',
      $partner: 'Cabinet Meridien',
      '$partner.name': 'Cabinet Meridien',
      '$partner.signatory': 'Léa Fontaine',
      $partneruser: 'Léa Fontaine',
      $email: 'lea.fontaine@meridien.example',
      $currentemail: 'lea.fontaine@meridien.example',
      $newmail: 'l.fontaine@meridien.example',
      '$investor.firstname': 'Camille',
      '$investor.lastname': 'Durand',
      '$investor.name': 'Camille Durand',
      '$investor.fullname': 'Camille Durand',
      $investor: 'Camille Durand',
      $company_name: 'Cabinet Meridien',
    },
  },
  {
    id: 'partner-atlas',
    kind: 'partner',
    label: 'Atlas Patrimoine',
    sublabel: 'Distributeur · signataire Marc Ollivier',
    values: {
      ...GP,
      ...FUND_MERIDIAN,
      ...OPERATION,
      ...subscription('SUB-2026-B07', '1 500 000,00 €'),
      $prenom: 'Marc',
      $nom: 'Ollivier',
      $firstname: 'Marc',
      $lastname: 'Ollivier',
      $partner: 'Atlas Patrimoine',
      '$partner.name': 'Atlas Patrimoine',
      '$partner.signatory': 'Marc Ollivier',
      $partneruser: 'Marc Ollivier',
      $email: 'marc.ollivier@atlas.example',
      $currentemail: 'marc.ollivier@atlas.example',
      $newmail: 'm.ollivier@atlas.example',
      '$investor.firstname': 'Alex',
      '$investor.lastname': 'Durand',
      '$investor.name': 'Durand Holding',
      '$investor.fullname': 'Durand Holding',
      $investor: 'Durand Holding',
      $company_name: 'Atlas Patrimoine',
    },
  },
  {
    id: 'team-middle-office',
    kind: 'team',
    label: 'Middle office',
    sublabel: 'Adresse de notifications interne',
    values: {
      ...GP,
      ...FUND_NORTHWIND,
      ...OPERATION,
      ...subscription('SUB-2026-A14', '250 000,00 €'),
      $prenom: 'Sofia',
      $nom: 'Marchand',
      $firstname: 'Camille',
      $lastname: 'Durand',
      '$investor.firstname': 'Camille',
      '$investor.lastname': 'Durand',
      '$investor.name': 'Camille Durand',
      '$investor.fullname': 'Camille Durand',
      $investor: 'Camille Durand',
      $subinvestor: '',
      $company_name: '',
      $email: 'middle-office@investhub.cloud',
      $ParentUserName: 'Camille',
      $ParentUserFamilyname: 'Durand',
      $ChildUserName: 'Alex',
      $ChildUserFamilyName: 'Durand',
      $partner: 'Cabinet Meridien',
      '$partner.name': 'Cabinet Meridien',
      '$partner.signatory': 'Léa Fontaine',
      $partneruser: 'Léa Fontaine',
    },
  },
];

/** Contextes cohérents avec le destinataire du gabarit, le premier servant de défaut. */
export function contextsFor(recipient: TemplateRecipient): PreviewContext[] {
  const matching = PREVIEW_CONTEXTS.filter((context) => context.kind === recipient);
  const others = PREVIEW_CONTEXTS.filter((context) => context.kind !== recipient);
  return [...matching, ...others];
}
