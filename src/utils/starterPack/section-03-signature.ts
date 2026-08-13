import { centered, cta, html } from './blocks';
import type { StarterPackTemplate } from './types';

/**
 * Section 3 : Signature électronique — page Confluence 931168258.
 *
 * Envoi et relance du lien de signature du bulletin, cas particulier du marché
 * secondaire, mandat SEPA, signatures groupées et alerte interne en cas d'échec
 * d'envoi au prestataire.
 */
export const SECTION_03_SIGNATURE: StarterPackTemplate[] = [
  {
    slug: 'signature_doc',
    name: 'Renvoi du lien de signature du bulletin',
    section: 'signature',
    recipient: 'investor',
    trigger: 'mixed',
    origin:
      "Un utilisateur GP ou distributeur relance manuellement un signataire depuis la souscription, action Renvoyer le mail de signature. Ce gabarit sert aussi d'envoi initial par défaut quand aucun gabarit spécifique n'est paramétré sur la part",
    variables: [
      '$logo',
      '$appname',
      '$year',
      '$mirror',
      '$link',
      '$campaign',
      '$prenom',
      '$nom',
      '$subscriptionname',
      '$partname',
      '$fund_type',
    ],
    proposedVariables: [],
    fr: {
      subject: '$campaign - Votre bulletin de souscription est prêt à signer',
      html: html('fr', [
        '<p>Bonjour $prenom $nom,</p>',
        "<p>Les documents de votre souscription <strong>$subscriptionname</strong> sur le fonds <strong>$campaign</strong> ($fund_type, part $partname) sont prêts et n'attendent plus que votre signature électronique.</p>",
        '<p>La signature ne prend que quelques minutes : cliquez sur le bouton ci-dessous, vérifiez vos documents puis laissez-vous guider.</p>',
        cta('$link', 'Signer mes documents'),
        "<p>Une fois la signature complétée par l'ensemble des signataires, un exemplaire signé de vos documents vous sera transmis.</p>",
        '<p>Notre équipe se tient à votre disposition pour toute question sur votre souscription.</p>',
      ]),
    },
    en: {
      subject: '$campaign - Your subscription form is ready to sign',
      html: html('en', [
        '<p>Dear $prenom $nom,</p>',
        '<p>The documents for your subscription <strong>$subscriptionname</strong> in the fund <strong>$campaign</strong> ($fund_type, $partname share) are ready and awaiting your electronic signature.</p>',
        '<p>Signing only takes a few minutes: click the button below, review your documents and follow the guided steps.</p>',
        cta('$link', 'Sign my documents'),
        '<p>Once all signatories have completed the signature, a signed copy of your documents will be sent to you.</p>',
        '<p>Our team remains available for any question regarding your subscription.</p>',
      ]),
    },
  },
  {
    slug: 'signature_doc_secondary_market',
    name: 'Lien de signature pour une cession de parts',
    section: 'signature',
    recipient: 'investor',
    trigger: 'auto',
    origin:
      "Envoi automatique du lien de signature lors de l'envoi en signature d'une souscription issue du marché secondaire. Le gabarit remplace signature_doc quand la souscription vient d'une cession",
    variables: [
      '$logo',
      '$appname',
      '$year',
      '$mirror',
      '$link',
      '$campaign',
      '$prenom',
      '$nom',
      '$subscriptionname',
      '$partname',
      '$fund_type',
      '$contact_firstname',
      '$contact_lastname',
      '$contact_mail',
    ],
    proposedVariables: [],
    fr: {
      subject: '$campaign - Cession de parts : vos documents sont prêts à signer',
      html: html('fr', [
        '<p>Bonjour $prenom $nom,</p>',
        "<p>Dans le cadre de la cession de parts sur le fonds <strong>$campaign</strong> ($fund_type), les documents relatifs à la souscription <strong>$subscriptionname</strong> (part $partname) sont prêts et n'attendent plus que votre signature électronique.</p>",
        '<p>La signature ne prend que quelques minutes : cliquez sur le bouton ci-dessous, vérifiez vos documents puis laissez-vous guider.</p>',
        cta('$link', 'Signer mes documents'),
        "<p>Une fois la signature complétée par l'ensemble des signataires, la cession pourra être finalisée et un exemplaire signé de vos documents vous sera transmis.</p>",
        '<p>Pour toute question, votre contact $contact_firstname $contact_lastname se tient à votre disposition à l\'adresse <a href="mailto:$contact_mail">$contact_mail</a>.</p>',
      ]),
    },
    en: {
      subject: '$campaign - Share transfer: your documents are ready to sign',
      html: html('en', [
        '<p>Dear $prenom $nom,</p>',
        '<p>As part of the share transfer in the fund <strong>$campaign</strong> ($fund_type), the documents for the subscription <strong>$subscriptionname</strong> ($partname share) are ready and awaiting your electronic signature.</p>',
        '<p>Signing only takes a few minutes: click the button below, review your documents and follow the guided steps.</p>',
        cta('$link', 'Sign my documents'),
        '<p>Once all signatories have completed the signature, the transfer can be finalised and a signed copy of your documents will be sent to you.</p>',
        '<p>For any question, your contact $contact_firstname $contact_lastname is available at <a href="mailto:$contact_mail">$contact_mail</a>.</p>',
      ]),
    },
  },
  {
    slug: 'signature_mandat',
    name: 'Demande de signature du mandat SEPA',
    section: 'signature',
    recipient: 'investor',
    trigger: 'manual',
    origin:
      'Un utilisateur GP déclenche la demande de prélèvement depuis la souscription, action Demander le prélèvement, et envoie le mandat SEPA à signer',
    variables: [
      '$logo',
      '$appname',
      '$year',
      '$mirror',
      '$link',
      '$campaign',
      '$prenom',
      '$nom',
      '$contact_firstname',
      '$contact_lastname',
      '$contact_mail',
    ],
    proposedVariables: [],
    fr: {
      subject: '$campaign - Votre mandat de prélèvement SEPA est prêt à signer',
      html: html('fr', [
        '<p>Bonjour $prenom $nom,</p>',
        "<p>Dans le cadre de votre souscription au fonds <strong>$campaign</strong>, le règlement s'effectue par prélèvement SEPA. Pour l'autoriser, il vous suffit de signer électroniquement votre mandat de prélèvement.</p>",
        cta('$link', 'Signer mon mandat SEPA'),
        "<p>La signature ne prend que quelques minutes. Une fois le mandat signé, le prélèvement sera mis en place sur le compte bancaire indiqué lors de votre souscription : vous n'aurez aucune autre démarche à effectuer.</p>",
        '<p>Pour toute question, votre contact $contact_firstname $contact_lastname se tient à votre disposition à l\'adresse <a href="mailto:$contact_mail">$contact_mail</a>.</p>',
      ]),
    },
    en: {
      subject: '$campaign - Your SEPA direct debit mandate is ready to sign',
      html: html('en', [
        '<p>Dear $prenom $nom,</p>',
        '<p>As part of your subscription to the fund <strong>$campaign</strong>, payment is made by SEPA direct debit. To authorise it, simply sign your direct debit mandate electronically.</p>',
        cta('$link', 'Sign my SEPA mandate'),
        '<p>Signing only takes a few minutes. Once the mandate is signed, the direct debit will be set up on the bank account provided with your subscription: no further action will be required on your side.</p>',
        '<p>For any question, your contact $contact_firstname $contact_lastname is available at <a href="mailto:$contact_mail">$contact_mail</a>.</p>',
      ]),
    },
  },
  {
    slug: 'sepa-signed',
    name: 'Mandat SEPA signé, notification interne',
    section: 'signature',
    recipient: 'team',
    trigger: 'auto',
    origin:
      'Notification automatique au retour du prestataire de signature, quand le mandat SEPA rattaché à une souscription vient d\'être signé. Le destinataire est l\'adresse paramétrée dans "SEPA signed email"',
    variables: ['$logo', '$appname', '$year', '$mirror', '$prenom', '$nom', '$campaign'],
    proposedVariables: [
      {
        name: '$subscription.name',
        note: "référence de la souscription ; la famille n'est pas injectée à ce point d'appel car id_souscription n'est pas passé dans les options",
      },
      {
        name: '$subscription_url',
        note: "lien direct vers l'écran de la souscription au back office",
      },
    ],
    fr: {
      subject: 'Mandat SEPA signé - $prenom $nom sur $campaign',
      html: html('fr', [
        '<p>Bonjour,</p>',
        "<p>Le mandat de prélèvement SEPA de <strong>$prenom $nom</strong> vient d'être signé sur le fonds <strong>$campaign</strong> (souscription <strong>$subscription.name</strong>).</p>",
        '<p>Le mandat signé est disponible dans les documents de la souscription. Le prélèvement peut désormais être mis en place pour cette souscription.</p>',
        cta('$subscription_url', 'Consulter la souscription'),
      ]),
    },
    en: {
      subject: 'SEPA mandate signed - $prenom $nom on $campaign',
      html: html('en', [
        '<p>Hello,</p>',
        '<p>The SEPA direct debit mandate of <strong>$prenom $nom</strong> has just been signed for the fund <strong>$campaign</strong> (subscription <strong>$subscription.name</strong>).</p>',
        '<p>The signed mandate is available in the subscription documents. The direct debit can now be set up for this subscription.</p>',
        cta('$subscription_url', 'View the subscription'),
      ]),
    },
  },
  {
    slug: 'send-multisig',
    name: 'Invitation à signer un document groupé',
    section: 'signature',
    recipient: 'investor',
    trigger: 'manual',
    origin:
      'Activation d\'un lot de signatures groupées depuis le back office, Fonds puis Signatures multiples. Le mail part à chaque signataire du lot, ou seulement au premier puis au suivant quand les signatures sont séquencées',
    variables: [
      '$logo',
      '$appname',
      '$year',
      '$mirror',
      '$link',
      '$name',
      '$content',
      '$campaign',
      '$firstname',
      '$lastname',
    ],
    proposedVariables: [],
    fr: {
      subject: '$campaign - Invitation à signer : $name',
      html: html('fr', [
        '<p>Bonjour $firstname $lastname,</p>',
        '<p>Vous êtes invité(e) à signer électroniquement le document <strong>$name</strong> concernant le fonds <strong>$campaign</strong>.</p>',
        '<p>$content</p>',
        '<p>La signature ne prend que quelques minutes : cliquez sur le bouton ci-dessous, vérifiez le document puis laissez-vous guider.</p>',
        cta('$link', 'Signer le document'),
        "<p>Une fois la signature complétée par l'ensemble des signataires, un exemplaire signé vous sera transmis.</p>",
      ]),
    },
    en: {
      subject: '$campaign - Invitation to sign: $name',
      html: html('en', [
        '<p>Dear $firstname $lastname,</p>',
        '<p>You are invited to electronically sign the document <strong>$name</strong> relating to the fund <strong>$campaign</strong>.</p>',
        '<p>$content</p>',
        '<p>Signing only takes a few minutes: click the button below, review the document and follow the guided steps.</p>',
        cta('$link', 'Sign the document'),
        '<p>Once all signatories have completed the signature, a signed copy will be sent to you.</p>',
      ]),
    },
  },
  {
    slug: 'signature_error',
    name: "Échec d'envoi en signature, alerte interne",
    section: 'signature',
    recipient: 'team',
    trigger: 'auto',
    origin:
      'Notification automatique quand l\'envoi du dossier au prestataire de signature électronique échoue. Le destinataire est l\'adresse paramétrée dans "Signature error email"',
    variables: [
      '$logo',
      '$appname',
      '$url',
      '$year',
      '$mirror',
      '$msg',
      '$id_souscription',
      '$id_partner',
      '$id_rebuy',
      '$id_kycrequest',
    ],
    proposedVariables: [],
    fr: {
      subject: "Alerte : échec d'envoi en signature électronique",
      html: html('fr', [
        '<p>Bonjour,</p>',
        "<p>L'envoi d'un dossier au prestataire de signature électronique a échoué. Les documents n'ont pas été transmis aux signataires : le dossier devra être renvoyé en signature une fois le problème corrigé.</p>",
        '<p>Message renvoyé par le prestataire :</p>',
        centered('<strong>$msg</strong>'),
        '<p>Références du dossier concerné (0 = non concerné) : souscription <strong>$id_souscription</strong>, distributeur <strong>$id_partner</strong>, rachat <strong>$id_rebuy</strong>, dossier KYC <strong>$id_kycrequest</strong>.</p>',
        cta('$url', 'Accéder au back-office'),
      ]),
    },
    en: {
      subject: 'Alert: electronic signature request failed',
      html: html('en', [
        '<p>Hello,</p>',
        '<p>Sending a file to the electronic signature provider has failed. The documents were not delivered to the signatories: the file will need to be sent for signature again once the issue is resolved.</p>',
        '<p>Message returned by the provider:</p>',
        centered('<strong>$msg</strong>'),
        '<p>References of the file concerned (0 = not applicable): subscription <strong>$id_souscription</strong>, partner <strong>$id_partner</strong>, redemption <strong>$id_rebuy</strong>, KYC file <strong>$id_kycrequest</strong>.</p>',
        cta('$url', 'Open the back office'),
      ]),
    },
  },
];
