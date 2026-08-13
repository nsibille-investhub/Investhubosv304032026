import { cta, highlight, html } from './blocks';
import type { StarterPackTemplate } from './types';

/**
 * Section 11 : Partenaires et rétrocessions — page Confluence 930217986.
 *
 * Cycle de vie du distributeur : création et onboarding, signature de la
 * convention de distribution, validation des souscriptions apportées par le
 * réseau, puis facturation des rétrocessions (décomptes, factures, paiements,
 * contestations).
 */
export const SECTION_11_PARTNERS: StarterPackTemplate[] = [
  {
    slug: 'new-partner',
    name: 'Nouveau partenaire créé, alerte interne',
    section: 'partners',
    recipient: 'team',
    trigger: 'auto',
    origin:
      'Un partenaire s\'inscrit via le formulaire public d\'inscription partenaire. Alerte envoyée à l\'adresse configurée dans le réglage "Mail notification nouveau partenaire"',
    variables: [
      '$logo',
      '$appname',
      '$year',
      '$mirror',
      '$name',
      '$link',
      '$partner.email',
      '$partner.contact_firstname',
      '$partner.contact_lastname',
      '$partner.orias',
      '$partner.siren',
    ],
    proposedVariables: [],
    fr: {
      subject: 'Nouveau partenaire inscrit : $name',
      html: html('fr', [
        '<p>Bonjour,</p>',
        "<p>Un nouveau partenaire vient de s'inscrire sur $appname :</p>",
        highlight('$name', 18),
        '<p>Contact : $partner.contact_firstname $partner.contact_lastname ($partner.email)<br>ORIAS : $partner.orias<br>SIREN : $partner.siren</p>',
        '<p>Son dossier attend votre revue : verifiez les informations declarees, completez sa segmentation et lancez son onboarding le cas echeant.</p>',
        cta('$link', 'Consulter la fiche partenaire'),
      ]),
    },
    en: {
      subject: 'New partner registered: $name',
      html: html('en', [
        '<p>Hello,</p>',
        '<p>A new partner has just registered on $appname:</p>',
        highlight('$name', 18),
        '<p>Contact: $partner.contact_firstname $partner.contact_lastname ($partner.email)<br>ORIAS: $partner.orias<br>SIREN: $partner.siren</p>',
        '<p>Their file is awaiting your review: check the declared information, complete their segmentation and start their onboarding if applicable.</p>',
        cta('$link', 'Open the partner record'),
      ]),
    },
  },
  {
    slug: 'onboarding-partenaire-a-valider',
    name: 'Onboarding partenaire à contrôler',
    section: 'partners',
    recipient: 'team',
    trigger: 'auto',
    origin:
      'Le partenaire termine son parcours d\'onboarding KYD depuis son espace. Alerte envoyée à l\'adresse du réglage "Mail Onboarding Partenaire a valider"',
    variables: ['$logo', '$appname', '$year', '$mirror', '$nom_partenaire', '$orias', '$link'],
    proposedVariables: [],
    fr: {
      subject: 'Onboarding partenaire a controler : $nom_partenaire',
      html: html('fr', [
        '<p>Bonjour,</p>',
        "<p>Le partenaire <strong>$nom_partenaire</strong> (ORIAS : $orias) vient de terminer son parcours d'onboarding.</p>",
        "<p>Son dossier est complet et attend votre contrôle : vérifiez les réponses et les documents transmis, puis validez ou réouvrez le dossier depuis l'écran de contrôle.</p>",
        cta('$link', 'Contrôler le dossier'),
      ]),
    },
    en: {
      subject: 'Partner onboarding awaiting review: $nom_partenaire',
      html: html('en', [
        '<p>Hello,</p>',
        '<p>The partner <strong>$nom_partenaire</strong> (ORIAS: $orias) has just completed their onboarding process.</p>',
        '<p>Their file is complete and awaiting your review: check the answers and documents provided, then approve or reopen the file from the review screen.</p>',
        cta('$link', 'Review the file'),
      ]),
    },
  },
  {
    slug: 'valid-onboarding-partenaire',
    name: 'Onboarding partenaire validé',
    section: 'partners',
    recipient: 'team',
    trigger: 'manual',
    origin:
      "Un utilisateur GP valide l'onboarding du partenaire depuis l'écran de contrôle. Envoyé à l'adresse saisie dans le formulaire de validation",
    variables: [
      '$logo',
      '$appname',
      '$year',
      '$mirror',
      '$name',
      '$orias',
      '$link',
      '$partner.email',
    ],
    proposedVariables: [],
    fr: {
      subject: 'Onboarding partenaire valide : $name',
      html: html('fr', [
        '<p>Bonjour,</p>',
        "<p>L'onboarding du partenaire <strong>$name</strong> (ORIAS : $orias) vient d'être validé depuis l'écran de contrôle.</p>",
        '<p>Le dossier du partenaire est désormais conforme. Vous pouvez poursuivre les étapes suivantes de la relation : envoi de la convention de distribution et ouverture des fonds concernés.</p>',
        cta('$link', 'Consulter la fiche partenaire'),
      ]),
    },
    en: {
      subject: 'Partner onboarding approved: $name',
      html: html('en', [
        '<p>Hello,</p>',
        '<p>The onboarding of the partner <strong>$name</strong> (ORIAS: $orias) has just been approved from the review screen.</p>',
        "<p>The partner's file is now compliant. You can proceed with the next steps of the relationship: sending the distribution agreement and opening the relevant funds.</p>",
        cta('$link', 'Open the partner record'),
      ]),
    },
  },
  {
    slug: 'contrat-intermediaire',
    name: 'Convention de distribution à signer',
    section: 'partners',
    recipient: 'partner',
    trigger: 'mixed',
    origin:
      'Envoi de la convention de distribution en signature électronique depuis la fiche partenaire, tour de signature suivant ou relance. Chaque signataire reçoit son lien de signature personnel',
    variables: [
      '$logo',
      '$appname',
      '$year',
      '$mirror',
      '$prenom',
      '$nom',
      '$link',
      '$partner.name',
    ],
    proposedVariables: [],
    fr: {
      subject: '$appname - Votre convention de distribution est prete a signer',
      html: html('fr', [
        '<p>Bonjour $prenom $nom,</p>',
        '<p>Dans le cadre du partenariat entre <strong>$appname</strong> et <strong>$partner.name</strong>, votre convention de distribution est prête pour signature électronique.</p>',
        "<p>La signature s'effectue en ligne, en quelques minutes, via un lien sécurisé qui vous est personnel. Vous pourrez relire l'intégralité de la convention avant de signer.</p>",
        cta('$link', 'Signer la convention'),
        "<p>Une fois la convention signée par l'ensemble des signataires, les fonds prévus au contrat seront ouverts à la distribution sur votre espace.</p>",
      ]),
    },
    en: {
      subject: '$appname - Your distribution agreement is ready for signature',
      html: html('en', [
        '<p>Dear $prenom $nom,</p>',
        '<p>As part of the partnership between <strong>$appname</strong> and <strong>$partner.name</strong>, your distribution agreement is ready for electronic signature.</p>',
        '<p>Signing takes place online, in a few minutes, through a secure link that is personal to you. You will be able to review the full agreement before signing.</p>',
        cta('$link', 'Sign the agreement'),
        '<p>Once the agreement has been signed by all signatories, the funds covered by the contract will be open for distribution on your portal.</p>',
      ]),
    },
  },
  {
    slug: 'confirm-partner-signed',
    name: 'Contrat partenaire signé',
    section: 'partners',
    recipient: 'team',
    trigger: 'auto',
    origin:
      'Le dernier signataire finalise la signature électronique de la convention de distribution. Alerte envoyée aux adresses du réglage "Mail contrat partenaire signe"',
    variables: ['$logo', '$appname', '$year', '$mirror', '$partner'],
    proposedVariables: [
      {
        name: '$link',
        note: "lien direct vers la fiche partenaire, connu au point d'appel mais non passé",
      },
    ],
    fr: {
      subject: 'Convention de distribution signee : $partner',
      html: html('fr', [
        '<p>Bonjour,</p>',
        '<p>Le partenaire <strong>$partner</strong> a finalisé la signature de sa convention de distribution.</p>',
        '<p>Les parts prévues à la convention sont désormais ouvertes à la distribution pour ce partenaire, et la convention signée est archivée sur sa fiche.</p>',
        cta('$link', 'Consulter la fiche partenaire'),
      ]),
    },
    en: {
      subject: 'Distribution agreement signed: $partner',
      html: html('en', [
        '<p>Hello,</p>',
        '<p>The partner <strong>$partner</strong> has completed the signature of their distribution agreement.</p>',
        '<p>The shares covered by the agreement are now open for distribution for this partner, and the signed agreement is archived on their record.</p>',
        cta('$link', 'Open the partner record'),
      ]),
    },
  },
  {
    slug: 'notification-prevalid-partner',
    name: 'Souscription prévalidée par le distributeur',
    section: 'partners',
    recipient: 'team',
    trigger: 'auto',
    origin:
      "Le distributeur, ou l'un de ses conseillers, prévalide un dossier de souscription sur un fonds où la prévalidation est activée. Alerte envoyée aux adresses configurées sur le fonds",
    variables: [
      '$logo',
      '$appname',
      '$year',
      '$mirror',
      '$link',
      '$prenom',
      '$nom',
      '$campaign',
      '$amount',
      '$subscriptionname',
      '$subscriptionid',
      '$partnername',
      '$fullname',
      '$type',
    ],
    proposedVariables: [],
    fr: {
      subject: '$campaign - Souscription prevalidee par le distributeur : $subscriptionname',
      html: html('fr', [
        '<p>Bonjour,</p>',
        "<p>La souscription <strong>$subscriptionname</strong> (référence $subscriptionid) de $prenom $nom sur le fonds <strong>$campaign</strong>, d'un montant de <strong>$amount</strong>, vient d'être prévalidée par $fullname ($type du réseau $partnername).</p>",
        '<p>Le dossier attend maintenant votre contrôle : vérifiez les réponses et les documents, puis validez la souscription ou réouvrez le dossier.</p>',
        cta('$link', 'Contrôler la souscription'),
      ]),
    },
    en: {
      subject: '$campaign - Subscription pre-approved by the distributor: $subscriptionname',
      html: html('en', [
        '<p>Hello,</p>',
        '<p>The subscription <strong>$subscriptionname</strong> (reference $subscriptionid) of $prenom $nom in the fund <strong>$campaign</strong>, for an amount of <strong>$amount</strong>, has just been pre-approved by $fullname ($type, network $partnername).</p>',
        '<p>The file is now awaiting your review: check the answers and documents, then approve the subscription or reopen the file.</p>',
        cta('$link', 'Review the subscription'),
      ]),
    },
  },
  {
    slug: 'partner-reopen',
    name: 'Souscription réouverte à valider',
    section: 'partners',
    recipient: 'partner',
    trigger: 'manual',
    origin:
      "Un utilisateur GP réouvre pour correction une souscription déjà validée par le distributeur, depuis l'écran de contrôle de la souscription. Le validateur côté distributeur est notifié",
    variables: [
      '$logo',
      '$appname',
      '$year',
      '$mirror',
      '$prenom',
      '$nom',
      '$campaign',
      '$amount',
      '$subscriptionname',
      '$message',
      '$questions',
      '$checklink',
      '$contact_firstname',
      '$contact_lastname',
      '$contact_mail',
    ],
    proposedVariables: [],
    fr: {
      subject: '$campaign - Souscription reouverte : $subscriptionname est a valider de nouveau',
      html: html('fr', [
        '<p>Bonjour,</p>',
        "<p>La souscription <strong>$subscriptionname</strong> de $prenom $nom sur le fonds <strong>$campaign</strong>, d'un montant de $amount, que vous aviez validée, vient d'être réouverte pour correction.</p>",
        '<p><strong>Motif :</strong><br>$message</p>',
        '<p><strong>Éléments concernés :</strong><br>$questions</p>',
        '<p>Une fois les corrections apportées, le dossier vous sera de nouveau présenté pour validation.</p>',
        cta('$checklink', 'Consulter le dossier'),
        '<p>Pour toute question, votre contact reste $contact_firstname $contact_lastname ($contact_mail).</p>',
      ]),
    },
    en: {
      subject: '$campaign - Subscription reopened: $subscriptionname requires your approval again',
      html: html('en', [
        '<p>Hello,</p>',
        '<p>The subscription <strong>$subscriptionname</strong> of $prenom $nom in the fund <strong>$campaign</strong>, for an amount of $amount, which you had approved, has just been reopened for correction.</p>',
        '<p><strong>Reason:</strong><br>$message</p>',
        '<p><strong>Items concerned:</strong><br>$questions</p>',
        '<p>Once the corrections have been made, the file will be submitted to you again for approval.</p>',
        cta('$checklink', 'Open the file'),
        '<p>For any question, your contact remains $contact_firstname $contact_lastname ($contact_mail).</p>',
      ]),
    },
  },
  {
    slug: 'notification-decompte-frais',
    name: 'Publication du décompte de rétrocessions',
    section: 'partners',
    recipient: 'partner',
    trigger: 'manual',
    origin:
      "Le GP publie le décompte de rétrocessions depuis l'écran des rétrocessions, action Notifier, et invite le distributeur à facturer",
    variables: [
      '$logo',
      '$appname',
      '$year',
      '$mirror',
      '$retro',
      '$campaign',
      '$amount',
      '$date',
      '$url',
    ],
    proposedVariables: [],
    fr: {
      subject: '$campaign - Votre decompte de retrocessions est disponible : $amount',
      html: html('fr', [
        '<p>Bonjour,</p>',
        "<p>Votre décompte de rétrocessions ($retro) sur le fonds <strong>$campaign</strong>, arrêté au $date, vient d'être publié. Il s'élève à :</p>",
        highlight('$amount'),
        '<p>Pour recevoir votre règlement, connectez-vous à votre espace, vérifiez le détail du décompte, puis transmettez votre facture correspondante (ou faites-la générer directement depuis la plateforme).</p>',
        cta('$url', 'Consulter mon décompte'),
        '<p>En cas de désaccord sur les montants, vous pouvez contester le décompte directement depuis ce même écran.</p>',
      ]),
    },
    en: {
      subject: '$campaign - Your retrocession statement is available: $amount',
      html: html('en', [
        '<p>Hello,</p>',
        '<p>Your retrocession statement ($retro) for the fund <strong>$campaign</strong>, closed as of $date, has just been published. It amounts to:</p>',
        highlight('$amount'),
        '<p>To receive your payment, log in to your portal, check the details of the statement, then submit your corresponding invoice (or have it generated directly from the platform).</p>',
        cta('$url', 'View my statement'),
        '<p>If you disagree with the amounts, you can dispute the statement directly from the same screen.</p>',
      ]),
    },
  },
  {
    slug: 'notification-decompte-paid',
    name: 'Décompte de rétrocessions payé',
    section: 'partners',
    recipient: 'partner',
    trigger: 'manual',
    origin:
      "Le GP marque comme payée la facture liée au décompte, depuis l'écran des rétrocessions, action Payer, ou validation avec paiement immédiat",
    variables: [
      '$logo',
      '$appname',
      '$year',
      '$mirror',
      '$retro',
      '$campaign',
      '$numero',
      '$amount',
      '$date',
      '$payment_date',
      '$url',
    ],
    proposedVariables: [],
    fr: {
      subject: '$campaign - Votre facture $numero a ete reglee',
      html: html('fr', [
        '<p>Bonjour,</p>',
        '<p>Votre facture <strong>$numero</strong>, relative au décompte de rétrocessions ($retro) du $date sur le fonds <strong>$campaign</strong>, a été réglée le <strong>$payment_date</strong>.</p>',
        highlight('$amount'),
        '<p>Le virement a été émis sur les coordonnées bancaires enregistrées sur votre espace. Le décompte et la facture restent consultables à tout moment.</p>',
        cta('$url', 'Consulter mes décomptes'),
      ]),
    },
    en: {
      subject: '$campaign - Your invoice $numero has been paid',
      html: html('en', [
        '<p>Hello,</p>',
        '<p>Your invoice <strong>$numero</strong>, related to the retrocession statement ($retro) dated $date for the fund <strong>$campaign</strong>, was paid on <strong>$payment_date</strong>.</p>',
        highlight('$amount'),
        '<p>The wire transfer was issued to the bank details registered on your portal. The statement and the invoice remain available at any time.</p>',
        cta('$url', 'View my statements'),
      ]),
    },
  },
  {
    slug: 'notification-decompte-refuse',
    name: 'Décompte contesté par le distributeur',
    section: 'partners',
    recipient: 'team',
    trigger: 'auto',
    origin:
      "Le distributeur refuse le décompte reçu depuis son espace et transmet un motif de contestation. Alerte envoyée à l'adresse de facturation configurée sur le fonds",
    variables: [
      '$logo',
      '$appname',
      '$url',
      '$year',
      '$mirror',
      '$retro',
      '$campaign',
      '$numero',
      '$date',
      '$partner',
      '$message',
    ],
    proposedVariables: [
      {
        name: '$link',
        note: "lien direct vers l'écran des rétrocessions du back office, non passé au point d'appel",
      },
      {
        name: '$amount',
        note: 'montant du décompte contesté, connu du décompte mais non passé',
      },
    ],
    fr: {
      subject: '$campaign - Decompte conteste par $partner',
      html: html('fr', [
        '<p>Bonjour,</p>',
        '<p>Le distributeur <strong>$partner</strong> conteste le décompte de rétrocessions ($retro) référence <strong>$numero</strong> sur le fonds <strong>$campaign</strong>, le $date.</p>',
        '<p><strong>Motif transmis :</strong><br>$message</p>',
        '<p>Le décompte est en attente de votre arbitrage : vérifiez les lignes concernées, corrigez le décompte si nécessaire, puis publiez-le de nouveau au distributeur.</p>',
        cta('$url', 'Accéder au portail'),
      ]),
    },
    en: {
      subject: '$campaign - Statement disputed by $partner',
      html: html('en', [
        '<p>Hello,</p>',
        '<p>The distributor <strong>$partner</strong> disputes the retrocession statement ($retro) reference <strong>$numero</strong> for the fund <strong>$campaign</strong>, on $date.</p>',
        '<p><strong>Reason provided:</strong><br>$message</p>',
        '<p>The statement is awaiting your decision: check the lines concerned, correct the statement if necessary, then publish it again to the distributor.</p>',
        cta('$url', 'Access the portal'),
      ]),
    },
  },
  {
    slug: 'refus-decompte-frais',
    name: 'Facture de rétrocession refusée',
    section: 'partners',
    recipient: 'partner',
    trigger: 'manual',
    origin:
      "Un utilisateur GP refuse la facture soumise par le distributeur depuis l'écran des rétrocessions. Le décompte est réouvert et le motif transmis au distributeur",
    variables: ['$logo', '$appname', '$year', '$mirror', '$retro', '$campaign', '$message', '$url'],
    proposedVariables: [
      {
        name: '$numero',
        note: 'numéro de la facture refusée, connu de la facture mais non passé au gabarit',
      },
    ],
    fr: {
      subject: '$campaign - Votre facture de retrocessions a ete refusee',
      html: html('fr', [
        '<p>Bonjour,</p>',
        "<p>Votre facture relative au décompte de rétrocessions ($retro) sur le fonds <strong>$campaign</strong> n'a pas pu être acceptée.</p>",
        '<p><strong>Motif du refus :</strong><br>$message</p>',
        '<p>Le décompte a été réouvert sur votre espace : merci de soumettre une nouvelle facture tenant compte de ce motif afin que votre règlement puisse être effectué.</p>',
        cta('$url', 'Soumettre une nouvelle facture'),
        '<p>Notre équipe reste à votre disposition pour toute question sur ce décompte.</p>',
      ]),
    },
    en: {
      subject: '$campaign - Your retrocession invoice has been rejected',
      html: html('en', [
        '<p>Hello,</p>',
        '<p>Your invoice related to the retrocession statement ($retro) for the fund <strong>$campaign</strong> could not be accepted.</p>',
        '<p><strong>Rejection reason:</strong><br>$message</p>',
        '<p>The statement has been reopened on your portal: please submit a new invoice taking this reason into account so that your payment can be processed.</p>',
        cta('$url', 'Submit a new invoice'),
        '<p>Our team remains available for any question regarding this statement.</p>',
      ]),
    },
  },
  {
    slug: 'notification-facture-soumise',
    name: 'Facture de rétrocession soumise',
    section: 'partners',
    recipient: 'team',
    trigger: 'auto',
    origin:
      "Le distributeur soumet sa facture, ou la fait générer, sur un décompte publié depuis son espace. Alerte envoyée à l'adresse de facturation configurée sur le fonds, avec la facture et le RIB du distributeur en pièces jointes",
    variables: [
      '$logo',
      '$appname',
      '$url',
      '$year',
      '$mirror',
      '$retro',
      '$campaign',
      '$numero',
      '$date',
      '$partner',
    ],
    proposedVariables: [
      {
        name: '$amount',
        note: 'montant du décompte facturé, connu du décompte mais non passé',
      },
      {
        name: '$link',
        note: "lien direct vers l'écran des rétrocessions du back office, non passé au point d'appel",
      },
    ],
    fr: {
      subject: '$campaign - Facture de retrocessions soumise par $partner',
      html: html('fr', [
        '<p>Bonjour,</p>',
        '<p>Le distributeur <strong>$partner</strong> a soumis le $date la facture <strong>$numero</strong> relative à son décompte de rétrocessions ($retro) sur le fonds <strong>$campaign</strong>.</p>',
        '<p>La facture et les coordonnées bancaires du distributeur sont jointes à ce message. La facture est en attente de votre validation avant mise en paiement.</p>',
        cta('$url', 'Accéder au portail'),
      ]),
    },
    en: {
      subject: '$campaign - Retrocession invoice submitted by $partner',
      html: html('en', [
        '<p>Hello,</p>',
        '<p>The distributor <strong>$partner</strong> submitted on $date the invoice <strong>$numero</strong> related to their retrocession statement ($retro) for the fund <strong>$campaign</strong>.</p>',
        "<p>The invoice and the distributor's bank details are attached to this message. The invoice is awaiting your approval before payment.</p>",
        cta('$url', 'Access the portal'),
      ]),
    },
  },
];
