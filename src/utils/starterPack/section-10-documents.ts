import { cta, html } from './blocks';
import type { StarterPackTemplate } from './types';

/**
 * Section 10 : Documents et data room — page Confluence 930545678.
 *
 * Publication d'un document à destination des investisseurs ou des
 * distributeurs, et circuit de validation interne des documents avant diffusion.
 */

/** Nom du document mis en avant, avec sa catégorie en second niveau. */
function docBlock(name: string, categoryLabel: string): string {
  return `<p style="text-align:center;font-size:18px;margin:20px 0"><strong>${name}</strong><br><span style="font-size:14px;color:#555555">${categoryLabel}</span></p>`;
}

export const SECTION_10_DOCUMENTS: StarterPackTemplate[] = [
  {
    slug: 'new-doc',
    name: 'Nouveau document investisseur',
    section: 'documents',
    recipient: 'investor',
    trigger: 'manual',
    origin:
      "Publication d'une pièce dans un espace documentaire investisseur avec la notification cochée. Selon le rattachement du document (souscription, part, fonds ou tout le portefeuille), le mail part à l'investisseur de chaque souscription concernée, ou à son distributeur si la souscription est intermédiée",
    variables: [
      '$logo',
      '$appname',
      '$url',
      '$year',
      '$mirror',
      '$docname',
      '$categname',
      '$subscriptionname',
      '$firstname',
      '$lastname',
      '$campaign.name',
    ],
    proposedVariables: [],
    fr: {
      subject: 'Un nouveau document est disponible : $docname',
      html: html('fr', [
        '<p>Bonjour,</p>',
        "<p>Un nouveau document est disponible dans l'espace documentaire de la souscription <strong>$subscriptionname</strong> au fonds <strong>$campaign.name</strong> :</p>",
        docBlock('$docname', 'Catégorie : $categname'),
        cta('$url', 'Consulter le document'),
        '<p>Ce document reste disponible à tout moment dans la rubrique Documents de votre espace.</p>',
      ]),
    },
    en: {
      subject: 'A new document is available: $docname',
      html: html('en', [
        '<p>Hello,</p>',
        '<p>A new document is available in the document space of the subscription <strong>$subscriptionname</strong> to the fund <strong>$campaign.name</strong>:</p>',
        docBlock('$docname', 'Category: $categname'),
        cta('$url', 'View the document'),
        '<p>This document remains available at any time in the Documents section of your portal.</p>',
      ]),
    },
  },
  {
    slug: 'new-doc-partner',
    name: 'Nouveau document partenaire',
    section: 'documents',
    recipient: 'partner',
    trigger: 'manual',
    origin:
      "Publication d'une pièce dans une catégorie documentaire de type partenaire avec la notification cochée. Les destinataires dépendent du rattachement du document (distributeur précis, part, fonds ou tous les distributeurs) et des restrictions par segment. Le gabarit peut être remplacé par un gabarit personnalisé choisi sur le document",
    variables: ['$logo', '$appname', '$url', '$year', '$mirror', '$docname', '$categname'],
    proposedVariables: [],
    fr: {
      subject: 'Un nouveau document est disponible dans votre espace distributeur : $docname',
      html: html('fr', [
        '<p>Bonjour,</p>',
        '<p>Un nouveau document a été mis à votre disposition dans votre espace distributeur <strong>$appname</strong> :</p>',
        docBlock('$docname', 'Catégorie : $categname'),
        cta('$url', 'Accéder à mon espace distributeur'),
        '<p>Ce document reste disponible à tout moment dans la rubrique Documents de votre espace.</p>',
      ]),
    },
    en: {
      subject: 'A new document is available in your distributor portal: $docname',
      html: html('en', [
        '<p>Hello,</p>',
        '<p>A new document has been made available in your <strong>$appname</strong> distributor portal:</p>',
        docBlock('$docname', 'Category: $categname'),
        cta('$url', 'Access my distributor portal'),
        '<p>This document remains available at any time in the Documents section of your portal.</p>',
      ]),
    },
  },
  {
    slug: 'document-validation-pending',
    name: 'Document en attente de validation',
    section: 'documents',
    recipient: 'team',
    trigger: 'auto',
    origin:
      "Dépôt ou modification d'un document par un utilisateur non habilité à valider, quand le circuit de validation documentaire est actif. Un mail part à chaque valideur désigné. Le document n'est pas diffusé tant qu'il n'est pas validé",
    variables: [
      '$logo',
      '$appname',
      '$url',
      '$year',
      '$mirror',
      '$firstname',
      '$lastname',
      '$document_name',
      '$creator',
      '$date',
      '$pending_documents_url',
    ],
    proposedVariables: [],
    fr: {
      subject: 'Document a valider : $document_name',
      html: html('fr', [
        '<p>Bonjour $firstname $lastname,</p>',
        '<p>Le document <strong>$document_name</strong>, déposé par $creator le $date, est en attente de votre validation.</p>',
        "<p>Tant qu'il n'est pas validé, ce document n'est pas visible de ses destinataires et aucune notification ne leur est envoyée.</p>",
        cta('$pending_documents_url', 'Consulter les documents en attente'),
      ]),
    },
    en: {
      subject: 'Document awaiting validation: $document_name',
      html: html('en', [
        '<p>Dear $firstname $lastname,</p>',
        '<p>The document <strong>$document_name</strong>, uploaded by $creator on $date, is awaiting your validation.</p>',
        '<p>Until it is validated, this document is not visible to its recipients and no notification is sent to them.</p>',
        cta('$pending_documents_url', 'Review pending documents'),
      ]),
    },
  },
  {
    slug: 'document-validated',
    name: 'Document validé',
    section: 'documents',
    recipient: 'team',
    trigger: 'auto',
    origin:
      "Un valideur approuve un document en attente dans le circuit de validation documentaire. Si le valideur a coché la notification, les destinataires du document sont notifiés en parallèle, via new-doc ou new-doc-partner",
    variables: [
      '$logo',
      '$appname',
      '$url',
      '$year',
      '$mirror',
      '$firstname',
      '$lastname',
      '$document_name',
      '$validator',
      '$date',
      '$comment',
    ],
    proposedVariables: [
      {
        name: '$document_url',
        note: "lien direct vers le document dans le back office, non passé au point d'appel",
      },
    ],
    fr: {
      subject: 'Votre document $document_name a ete valide',
      html: html('fr', [
        '<p>Bonjour $firstname $lastname,</p>',
        '<p>Votre document <strong>$document_name</strong> a été validé par $validator le $date.</p>',
        '<p>$comment</p>',
        '<p>Il est désormais disponible pour ses destinataires dans leur espace documentaire.</p>',
        cta('$url', 'Accéder à la plateforme'),
      ]),
    },
    en: {
      subject: 'Your document $document_name has been validated',
      html: html('en', [
        '<p>Dear $firstname $lastname,</p>',
        '<p>Your document <strong>$document_name</strong> was validated by $validator on $date.</p>',
        '<p>$comment</p>',
        '<p>It is now available to its recipients in their document space.</p>',
        cta('$url', 'Access the platform'),
      ]),
    },
  },
  {
    slug: 'document-rejected',
    name: 'Document rejeté',
    section: 'documents',
    recipient: 'team',
    trigger: 'auto',
    origin:
      "Un valideur refuse un document en attente, avec un motif optionnel. Le document n'est pas diffusé et reste modifiable par le déposant",
    variables: [
      '$logo',
      '$appname',
      '$url',
      '$year',
      '$mirror',
      '$firstname',
      '$lastname',
      '$document_name',
      '$validator',
      '$date',
      '$comment',
    ],
    proposedVariables: [
      {
        name: '$document_url',
        note: "lien direct vers le document dans le back office, non passé au point d'appel",
      },
    ],
    fr: {
      subject: 'Votre document $document_name a ete rejete',
      html: html('fr', [
        '<p>Bonjour $firstname $lastname,</p>',
        '<p>Votre document <strong>$document_name</strong> a été rejeté par $validator le $date.</p>',
        '<p>$comment</p>',
        "<p>Ce document n'a pas été diffusé à ses destinataires. Vous pouvez le corriger et le soumettre à nouveau à validation depuis la plateforme.</p>",
        cta('$url', 'Accéder à la plateforme'),
      ]),
    },
    en: {
      subject: 'Your document $document_name has been rejected',
      html: html('en', [
        '<p>Dear $firstname $lastname,</p>',
        '<p>Your document <strong>$document_name</strong> was rejected by $validator on $date.</p>',
        '<p>$comment</p>',
        '<p>This document has not been released to its recipients. You can amend it and submit it for validation again from the platform.</p>',
        cta('$url', 'Access the platform'),
      ]),
    },
  },
];
