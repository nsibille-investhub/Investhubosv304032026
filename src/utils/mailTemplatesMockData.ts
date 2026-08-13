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
