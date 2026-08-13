/**
 * Gabarits de mails de la maquette.
 *
 * Le contenu (slug, libellé, origine, destinataire, variables, sujet et HTML
 * FR / EN) vient du Starter Pack Confluence, transcrit dans `starterPack/`.
 * Les champs d'exploitation que le référentiel ne porte pas — statut, nombre
 * d'envois, dernier envoi, dernière modification — sont dérivés de façon
 * déterministe pour que la maquette reste stable d'une session à l'autre.
 */
import {
  SECTION_NUMBER,
  SECTION_ORDER,
  STARTER_PACK_TEMPLATES,
  starterPackGaps,
  type StarterPackTemplate,
  type TemplateRecipient,
  type TemplateSectionKey,
  type TemplateTrigger,
} from './starterPack';

export { SECTION_NUMBER, SECTION_ORDER, starterPackGaps };
export type { TemplateRecipient, TemplateSectionKey, TemplateTrigger };

export type TemplateStatus = 'active' | 'draft' | 'archived';

export interface MailTemplate extends StarterPackTemplate {
  id: number;
  status: TemplateStatus;
  /** Langues pour lesquelles le gabarit est paramétré sur la plateforme. */
  languages: string[];
  usageCount: number;
  lastSentAt: string | null;
  updatedAt: string;
  updatedBy: string;
}

const AUTHORS = ['Camille', 'Nicolas', 'Sofia', 'Jean'];

/** Date de référence figée : les dates affichées ne bougent pas. */
const REFERENCE_DATE = new Date('2026-08-13T09:00:00Z').getTime();

function isoDaysAgo(days: number): string {
  return new Date(REFERENCE_DATE - days * 24 * 60 * 60 * 1000).toISOString();
}

function decorate(template: StarterPackTemplate, index: number): MailTemplate {
  const id = index + 1;

  // Un gabarit qui attend une variable proposée n'est pas prêt pour la production.
  const status: TemplateStatus =
    template.proposedVariables.length > 0 ? 'draft' : id % 19 === 0 ? 'archived' : 'active';

  const languages = id % 13 === 0 ? ['fr'] : ['fr', 'en'];
  const usageCount = status === 'draft' ? 0 : (id * 37) % 620;
  const daysSinceSend = (id * 5) % 90;
  const daysSinceEdit = 3 + ((id * 13) % 300);

  return {
    ...template,
    id,
    status,
    languages,
    usageCount,
    lastSentAt: usageCount === 0 ? null : isoDaysAgo(daysSinceSend),
    updatedAt: isoDaysAgo(daysSinceEdit),
    updatedBy: AUTHORS[id % AUTHORS.length],
  };
}

export const MAIL_TEMPLATES: MailTemplate[] = STARTER_PACK_TEMPLATES.map(decorate);

export const TEMPLATE_AUTHORS = AUTHORS;

/** Valeurs d'exemple pour l'aperçu : aucune donnée réelle d'investisseur. */
export const PREVIEW_VALUES: Record<string, string> = {
  $logo: 'https://placehold.co/180x56/0F323D/FFFFFF?text=InvestHub',
  $appname: 'InvestHub Asset Management',
  $url: 'https://portail.investhub.cloud',
  $lurl: 'https://portail.investhub.cloud/fr',
  $link: 'https://portail.investhub.cloud/souscriptions/2026-A14',
  $year: '2026',
  $mirror: 'https://portail.investhub.cloud/mirror/2026-A14',
  $mail_support: 'support@investhub.cloud',
  $prenom: 'Camille',
  $nom: 'Durand',
  '$investor.firstname': 'Camille',
  '$investor.lastname': 'Durand',
  '$investor.name': 'Camille Durand',
  '$partner.name': 'Cabinet Meridien',
  '$partner.signatory': 'Camille Durand',
  $campaign: 'Northwind Growth III',
  '$campaign.iban': 'FR76 3000 4000 5000 6000 7000 189',
  '$campaign.bic': 'BNPAFRPPXXX',
  $subscriptionname: 'SUB-2026-A14',
  '$subscription.amount': '250 000,00 €',
  $amount: '250 000,00 €',
  $duedate: '30/09/2026',
  $dateVL: '30/06/2026',
  $nbshares: '2 500',
  $site: 'Portail InvestHub',
  $email: 'camille.durand@example.com',
  $currentemail: 'camille.durand@example.com',
  $newmail: 'c.durand@example.com',
  $contact_firstname: 'Sofia',
  $contact_lastname: 'Marchand',
  $contact_mail: 'sofia.marchand@example.com',
  $reset_url: 'https://portail.investhub.cloud/mot-de-passe/xxxx',
  $code: '482914',
  $partner: 'Cabinet Meridien',
  $investor: 'Camille Durand',
  $subinvestor: '',
  $message: 'Message personnel de votre interlocuteur.',
  $ParentUserName: 'Camille',
  $ParentUserFamilyname: 'Durand',
  $ChildUserName: 'Alex',
  $ChildUserFamilyName: 'Durand',
  $firstname: 'Camille',
  $lastname: 'Durand',
  $company_name: 'Durand Holding',
  $fund: 'Northwind Growth III',
  $partname: 'A',
  $share_name: 'A',
  $fund_type: 'FPCI',
  $subscription: 'SUB-2026-A14',
  $subscription_name: 'SUB-2026-A14',
  $subscriptionname: 'SUB-2026-A14',
  $subscription_names: 'SUB-2026-A14, SUB-2026-A15',
  '$subscription.name': 'SUB-2026-A14',
  $subscription_amount: '250 000,00 €',
  $subscription_url: 'https://back.investhub.cloud/souscriptions/2026-A14',
  $id_souscription: '2026-A14',
  $id_partner: '0',
  $id_rebuy: '0',
  $id_kycrequest: '0',
  $name: 'Pacte associés 2026',
  $content: 'Document soumis à signature dans le cadre du closing.',
  $docname: 'Reporting T2 2026',
  $categname: 'Reportings',
  $document_name: 'Reporting T2 2026',
  $creator: 'Sofia Marchand',
  $validator: 'Nicolas Berger',
  $comment: 'Commentaire : relecture faite.',
  $pending_documents_url: 'https://back.investhub.cloud/documents/en-attente',
  $date: '30/09/2026',
  $callname: 'Appel n°3',
  $caname: 'Capital account T2 2026',
  $distribname: 'Distribution n°2',
  $distrib_amount: '48 500,00 €',
  $distrib_total_amount: '92 300,00 €',
  $amount_per_share: '19,40 €',
  $investamount: '250 000,00 €',
  $investpct: '25 %',
  $charges: '1 200,00 €',
  $pitch: 'Cette opération fait suite à la cession de deux participations.',
  $iban: 'FR76 3000 4000 5000 6000 7000 189',
  $part: 'A',
  $nb: '1 000',
  $nb_parts: '1 000',
  $nb_real: '980',
  $amtornb: '1 000 parts',
  $amount_final: '243 040,00 €',
  $vl_vente: '248,00 €',
  $vl_vente_date: '30/06/2026',
  $date_added: '05/08/2026',
  $payment_date: '15/10/2026',
  $submit_date: '05/08/2026',
  $debit_date: '30/09/2026',
  $call_reference: 'AF-2026-03-A14',
  $remaining_amount: '50 000,00 €',
  $msg: 'HTTP 502 - provider unavailable',
  $partneruser: 'Sofia Marchand',
  $quarter: 'T2 2026',
  $documentCount: '2',
  $dossierRef: 'SUB-2026-A14',
  $expiryDate: '31/12/2026',
  $eventDate: '15/10/2026',
  $changeDate: '01/08/2026',
  $rsvpUrl: 'https://portail.investhub.cloud/evenements/2026',
  $dataRoomUrl: 'https://portail.investhub.cloud/data-room',
  $signatureUrl: 'https://portail.investhub.cloud/signature/2026-A14',
  $loginUrl: 'https://portail.investhub.cloud/connexion',
};
