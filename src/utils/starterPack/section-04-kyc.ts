import { centered, cta, highlight, html } from './blocks';
import type { StarterPackTemplate } from './types';

/**
 * Section 4 : KYC / AML et conformité — page Confluence 931201026.
 *
 * Demandes KYC et relances côté investisseur et distributeur, soumission et
 * réouverture des dossiers, signature des documents KYC, alertes de screening
 * et circuit de validation interne des souscriptions.
 */
export const SECTION_04_KYC: StarterPackTemplate[] = [
  {
    slug: 'kyc-request',
    name: 'Demande KYC à compléter',
    section: 'kyc',
    recipient: 'investor',
    trigger: 'manual',
    origin:
      "Première notification d'une demande KYC investisseur, envoyée depuis le back-office (Investisseurs, Campagnes KYC, action Notifier, ou notification unitaire d'une demande)",
    variables: ['$logo', '$appname', '$year', '$mirror', '$mail_support', '$link'],
    proposedVariables: [
      {
        name: '$investor.firstname',
        note: "famille investisseur non injectée à ce point d'appel : id_investor n'est pas passé au moteur d'envoi alors que l'investisseur y est connu",
      },
      {
        name: '$investor.lastname',
        note: "famille investisseur non injectée à ce point d'appel : id_investor n'est pas passé au moteur d'envoi alors que l'investisseur y est connu",
      },
    ],
    fr: {
      subject: '$appname - Votre dossier KYC est à compléter',
      html: html('fr', [
        '<p>Bonjour $investor.firstname $investor.lastname,</p>',
        '<p>Dans le cadre de nos obligations réglementaires de connaissance client (KYC), nous vous invitons à compléter ou mettre à jour votre dossier.</p>',
        "<p>Le questionnaire se remplit en ligne, en quelques minutes. Munissez-vous de vos justificatifs habituels (pièce d'identité, justificatif de domicile) : ils pourront vous être demandés au fil du parcours.</p>",
        cta('$link', 'Compléter mon dossier KYC'),
        "<p>Une fois votre dossier soumis, nos équipes l'examineront et reviendront vers vous si un complément est nécessaire.</p>",
        '<p>Pour toute question, vous pouvez nous écrire à <a href="mailto:$mail_support">$mail_support</a>.</p>',
      ]),
    },
    en: {
      subject: '$appname - Your KYC file needs to be completed',
      html: html('en', [
        '<p>Dear $investor.firstname $investor.lastname,</p>',
        '<p>As part of our regulatory know-your-customer (KYC) obligations, we invite you to complete or update your file.</p>',
        '<p>The questionnaire is filled in online and only takes a few minutes. Please have your usual supporting documents at hand (identity document, proof of address): they may be requested during the process.</p>',
        cta('$link', 'Complete my KYC file'),
        '<p>Once your file is submitted, our team will review it and contact you if anything further is needed.</p>',
        '<p>For any question, you can reach us at <a href="mailto:$mail_support">$mail_support</a>.</p>',
      ]),
    },
  },
  {
    slug: 'kyc-request-reminder',
    name: 'Relance de demande KYC investisseur',
    section: 'kyc',
    recipient: 'investor',
    trigger: 'manual',
    origin:
      "Relance d'une demande KYC investisseur déjà notifiée ; le slug est construit par concaténation (kyc-request + -reminder) au même point d'appel que la première notification, quand la demande a déjà été notifiée",
    variables: ['$logo', '$appname', '$year', '$mirror', '$mail_support', '$link'],
    proposedVariables: [
      {
        name: '$investor.firstname',
        note: "famille investisseur non injectée à ce point d'appel : id_investor n'est pas passé au moteur d'envoi alors que l'investisseur y est connu",
      },
      {
        name: '$investor.lastname',
        note: "famille investisseur non injectée à ce point d'appel : id_investor n'est pas passé au moteur d'envoi alors que l'investisseur y est connu",
      },
    ],
    fr: {
      subject: 'Rappel - Votre dossier KYC est toujours en attente',
      html: html('fr', [
        '<p>Bonjour $investor.firstname $investor.lastname,</p>',
        "<p>Sauf erreur de notre part, votre dossier KYC n'a pas encore été complété. Cette mise à jour est nécessaire pour rester en conformité avec nos obligations réglementaires.</p>",
        '<p>Nous vous remercions de le compléter dès que possible : cela ne prend que quelques minutes.</p>',
        cta('$link', 'Compléter mon dossier KYC'),
        '<p>Si vous rencontrez une difficulté, écrivez-nous à <a href="mailto:$mail_support">$mail_support</a>.</p>',
      ]),
    },
    en: {
      subject: 'Reminder - Your KYC file is still pending',
      html: html('en', [
        '<p>Dear $investor.firstname $investor.lastname,</p>',
        '<p>Unless we are mistaken, your KYC file has not yet been completed. This update is required to remain compliant with our regulatory obligations.</p>',
        '<p>We kindly ask you to complete it as soon as possible: it only takes a few minutes.</p>',
        cta('$link', 'Complete my KYC file'),
        '<p>If you experience any difficulty, please write to us at <a href="mailto:$mail_support">$mail_support</a>.</p>',
      ]),
    },
  },
  {
    slug: 'kyc-request-partner',
    name: 'Demande KYC à compléter par le distributeur',
    section: 'kyc',
    recipient: 'partner',
    trigger: 'manual',
    origin:
      "Ouverture d'une demande KYC sur un distributeur, notifiée depuis le back-office (Distribution, Campagnes KYC distributeurs)",
    variables: ['$logo', '$appname', '$year', '$mirror', '$mail_support', '$link'],
    proposedVariables: [
      {
        name: '$partner.name',
        note: "famille partenaire non injectée à ce point d'appel : id_partner n'est pas passé au moteur d'envoi alors que le distributeur y est connu",
      },
    ],
    fr: {
      subject: '$appname - Votre dossier KYC distributeur est à compléter',
      html: html('fr', [
        '<p>Bonjour,</p>',
        '<p>Dans le cadre de nos obligations réglementaires, nous vous invitons à compléter ou mettre à jour le dossier KYC de <strong>$partner.name</strong>.</p>',
        "<p>Le questionnaire se remplit en ligne. Munissez-vous des documents de votre société (extrait d'immatriculation, justificatifs des dirigeants et bénéficiaires effectifs) : ils pourront vous être demandés au fil du parcours.</p>",
        cta('$link', 'Compléter le dossier KYC'),
        "<p>Une fois le dossier soumis, nos équipes l'examineront et reviendront vers vous si un complément est nécessaire.</p>",
        '<p>Pour toute question, vous pouvez nous écrire à <a href="mailto:$mail_support">$mail_support</a>.</p>',
      ]),
    },
    en: {
      subject: '$appname - Your distributor KYC file needs to be completed',
      html: html('en', [
        '<p>Hello,</p>',
        '<p>As part of our regulatory obligations, we invite you to complete or update the KYC file of <strong>$partner.name</strong>.</p>',
        '<p>The questionnaire is filled in online. Please have your company documents at hand (registration extract, supporting documents for directors and beneficial owners): they may be requested during the process.</p>',
        cta('$link', 'Complete the KYC file'),
        '<p>Once the file is submitted, our team will review it and contact you if anything further is needed.</p>',
        '<p>For any question, you can reach us at <a href="mailto:$mail_support">$mail_support</a>.</p>',
      ]),
    },
  },
  {
    slug: 'kyc-request-partner-reminder',
    name: 'Relance de demande KYC distributeur',
    section: 'kyc',
    recipient: 'partner',
    trigger: 'manual',
    origin:
      "Relance d'une demande KYC distributeur déjà notifiée ; le slug est construit par concaténation (kyc-request-partner + -reminder) au même point d'appel que la première notification, quand la demande a déjà été notifiée",
    variables: ['$logo', '$appname', '$year', '$mirror', '$mail_support', '$link'],
    proposedVariables: [
      {
        name: '$partner.name',
        note: "famille partenaire non injectée à ce point d'appel : id_partner n'est pas passé au moteur d'envoi alors que le distributeur y est connu",
      },
    ],
    fr: {
      subject: 'Rappel - Le dossier KYC de votre société est toujours en attente',
      html: html('fr', [
        '<p>Bonjour,</p>',
        "<p>Sauf erreur de notre part, le dossier KYC de <strong>$partner.name</strong> n'a pas encore été complété. Cette mise à jour est nécessaire pour poursuivre notre collaboration en conformité avec nos obligations réglementaires.</p>",
        '<p>Nous vous remercions de le compléter dès que possible.</p>',
        cta('$link', 'Compléter le dossier KYC'),
        '<p>Si vous rencontrez une difficulté, écrivez-nous à <a href="mailto:$mail_support">$mail_support</a>.</p>',
      ]),
    },
    en: {
      subject: "Reminder - Your company's KYC file is still pending",
      html: html('en', [
        '<p>Hello,</p>',
        '<p>Unless we are mistaken, the KYC file of <strong>$partner.name</strong> has not yet been completed. This update is required to continue our relationship in compliance with our regulatory obligations.</p>',
        '<p>We kindly ask you to complete it as soon as possible.</p>',
        cta('$link', 'Complete the KYC file'),
        '<p>If you experience any difficulty, please write to us at <a href="mailto:$mail_support">$mail_support</a>.</p>',
      ]),
    },
  },
  {
    slug: 'kyc-request-submission',
    name: 'Demande KYC soumise à instruire',
    section: 'kyc',
    recipient: 'team',
    trigger: 'auto',
    origin:
      'Notification automatique quand l\'investisseur soumet sa demande KYC ou de mise à jour depuis son espace ; le destinataire est l\'adresse paramétrée dans le setting "Email for KYC submission"',
    variables: [
      '$logo',
      '$appname',
      '$url',
      '$year',
      '$mirror',
      '$firstname',
      '$lastname',
      '$company_name',
      '$partnername',
    ],
    proposedVariables: [
      {
        name: '$link',
        note: "lien direct vers le dossier KYC à instruire au back-office, non passé au point d'appel",
      },
    ],
    fr: {
      subject: 'Dossier KYC soumis à instruire - $firstname $lastname $company_name',
      html: html('fr', [
        '<p>Bonjour,</p>',
        "<p>Un dossier KYC vient d'être soumis et attend d'être instruit.</p>",
        centered('<strong>$firstname $lastname $company_name</strong>'),
        '<p>Distributeur rattaché : <strong>$partnername</strong>.</p>',
        "<p>Le dossier est à examiner dans le back-office ; l'investisseur sera automatiquement notifié en cas de réouverture pour compléments.</p>",
        cta('$link', 'Instruire le dossier KYC'),
      ]),
    },
    en: {
      subject: 'KYC file submitted for review - $firstname $lastname $company_name',
      html: html('en', [
        '<p>Hello,</p>',
        '<p>A KYC file has just been submitted and is awaiting review.</p>',
        centered('<strong>$firstname $lastname $company_name</strong>'),
        '<p>Related distributor: <strong>$partnername</strong>.</p>',
        '<p>The file is to be reviewed in the back office; the investor will automatically be notified if it is reopened for additional information.</p>',
        cta('$link', 'Review the KYC file'),
      ]),
    },
  },
  {
    slug: 'reopen-kyc-investor',
    name: 'Réouverture de dossier KYC investisseur',
    section: 'kyc',
    recipient: 'investor',
    trigger: 'manual',
    origin:
      "Un utilisateur GP rouvre un dossier KYC investisseur depuis l'écran d'instruction, en indiquant les questions et documents à revoir et un message d'accompagnement ; le slug est construit par concaténation (reopen-kyc + -investor)",
    variables: [
      '$logo',
      '$appname',
      '$year',
      '$mirror',
      '$nom',
      '$campaign',
      '$message',
      '$questions',
      '$link',
      '$contact_firstname',
      '$contact_lastname',
      '$contact_mail',
    ],
    proposedVariables: [],
    fr: {
      subject: 'Votre dossier KYC nécessite des compléments',
      html: html('fr', [
        '<p>Bonjour $nom,</p>',
        '<p>Après examen de votre dossier KYC, certains éléments nécessitent un complément ou une correction de votre part. Votre dossier a été rouvert pour vous permettre de le mettre à jour.</p>',
        '<p>$message</p>',
        '<p>Éléments à revoir :</p>',
        '<p>$questions</p>',
        cta('$link', 'Mettre à jour mon dossier KYC'),
        "<p>Une fois vos compléments soumis, nos équipes reprendront l'instruction de votre dossier.</p>",
        '<p>Pour toute question, votre contact $contact_firstname $contact_lastname se tient à votre disposition à l\'adresse <a href="mailto:$contact_mail">$contact_mail</a>.</p>',
      ]),
    },
    en: {
      subject: 'Your KYC file requires additional information',
      html: html('en', [
        '<p>Dear $nom,</p>',
        '<p>Following the review of your KYC file, some items require additional information or a correction on your side. Your file has been reopened so you can update it.</p>',
        '<p>$message</p>',
        '<p>Items to review:</p>',
        '<p>$questions</p>',
        cta('$link', 'Update my KYC file'),
        '<p>Once your additions are submitted, our team will resume the review of your file.</p>',
        '<p>For any question, your contact $contact_firstname $contact_lastname is available at <a href="mailto:$contact_mail">$contact_mail</a>.</p>',
      ]),
    },
  },
  {
    slug: 'reopen-kyc-partner',
    name: 'Réouverture de dossier KYC distributeur',
    section: 'kyc',
    recipient: 'partner',
    trigger: 'manual',
    origin:
      "Un utilisateur GP rouvre un dossier KYC rattaché à un distributeur depuis l'écran d'instruction, en indiquant les questions et documents à revoir et un message d'accompagnement ; le slug est construit par concaténation (reopen-kyc + -partner)",
    variables: [
      '$logo',
      '$appname',
      '$year',
      '$mirror',
      '$nom',
      '$campaign',
      '$message',
      '$questions',
      '$link',
      '$contact_firstname',
      '$contact_lastname',
      '$contact_mail',
    ],
    proposedVariables: [],
    fr: {
      subject: 'Le dossier KYC de votre société nécessite des compléments',
      html: html('fr', [
        '<p>Bonjour,</p>',
        '<p>Après examen du dossier KYC de <strong>$nom</strong>, certains éléments nécessitent un complément ou une correction de votre part. Le dossier a été rouvert pour vous permettre de le mettre à jour.</p>',
        '<p>$message</p>',
        '<p>Éléments à revoir :</p>',
        '<p>$questions</p>',
        cta('$link', 'Mettre à jour le dossier KYC'),
        "<p>Une fois vos compléments soumis, nos équipes reprendront l'instruction du dossier.</p>",
        '<p>Pour toute question, votre contact $contact_firstname $contact_lastname se tient à votre disposition à l\'adresse <a href="mailto:$contact_mail">$contact_mail</a>.</p>',
      ]),
    },
    en: {
      subject: "Your company's KYC file requires additional information",
      html: html('en', [
        '<p>Hello,</p>',
        '<p>Following the review of the KYC file of <strong>$nom</strong>, some items require additional information or a correction on your side. The file has been reopened so you can update it.</p>',
        '<p>$message</p>',
        '<p>Items to review:</p>',
        '<p>$questions</p>',
        cta('$link', 'Update the KYC file'),
        '<p>Once your additions are submitted, our team will resume the review of the file.</p>',
        '<p>For any question, your contact $contact_firstname $contact_lastname is available at <a href="mailto:$contact_mail">$contact_mail</a>.</p>',
      ]),
    },
  },
  {
    slug: 'signature-doc-kyc',
    name: 'Relance de signature des documents KYC',
    section: 'kyc',
    recipient: 'investor',
    trigger: 'manual',
    origin:
      "Un utilisateur GP renvoie manuellement le mail de signature d'une demande KYC depuis l'écran du dossier (action Renvoyer l'email de signature). Attention : bug au point d'appel, $prenom reçoit actuellement le lien de signature au lieu du prénom",
    variables: ['$logo', '$appname', '$year', '$mirror', '$link', '$prenom', '$nom'],
    proposedVariables: [],
    fr: {
      subject: 'Rappel - Vos documents KYC sont en attente de signature',
      html: html('fr', [
        '<p>Bonjour $prenom $nom,</p>',
        '<p>Les documents de votre dossier KYC sont toujours en attente de votre signature électronique. Sans cette signature, le dossier ne peut pas être finalisé.</p>',
        '<p>La signature ne prend que quelques minutes : cliquez sur le bouton ci-dessous, vérifiez les documents puis laissez-vous guider.</p>',
        cta('$link', 'Signer mes documents KYC'),
        '<p>Une fois la signature complétée, nos équipes finaliseront le traitement de votre dossier.</p>',
      ]),
    },
    en: {
      subject: 'Reminder - Your KYC documents are awaiting signature',
      html: html('en', [
        '<p>Dear $prenom $nom,</p>',
        '<p>The documents of your KYC file are still awaiting your electronic signature. Without this signature, the file cannot be finalised.</p>',
        '<p>Signing only takes a few minutes: click the button below, review the documents and follow the guided steps.</p>',
        cta('$link', 'Sign my KYC documents'),
        '<p>Once the signature is completed, our team will finalise the processing of your file.</p>',
      ]),
    },
  },
  {
    slug: 'new-alerts',
    name: 'Alertes de screening à traiter',
    section: 'kyc',
    recipient: 'team',
    trigger: 'auto',
    origin:
      'Notification automatique quand le contrôle des listes de sanctions et de PEP (screening) détecte de nouvelles alertes ; le destinataire est l\'adresse paramétrée dans le setting "Email address for screening alerts"',
    variables: ['$logo', '$appname', '$url', '$year', '$mirror', '$alerts', '$nb_alerts'],
    proposedVariables: [],
    fr: {
      subject: 'Screening - $nb_alerts nouvelle(s) alerte(s) à traiter',
      html: html('fr', [
        '<p>Bonjour,</p>',
        '<p>Le contrôle des listes de sanctions a détecté de nouvelles alertes de screening :</p>',
        highlight('$nb_alerts alerte(s)', 20),
        '<p>$alerts</p>',
        "<p>Chaque alerte est à examiner puis à lever ou à confirmer depuis l'écran des alertes du back-office.</p>",
        cta('$url', 'Traiter les alertes'),
      ]),
    },
    en: {
      subject: 'Screening - $nb_alerts new alert(s) to review',
      html: html('en', [
        '<p>Hello,</p>',
        '<p>The sanctions list screening has detected new alerts:</p>',
        highlight('$nb_alerts alert(s)', 20),
        '<p>$alerts</p>',
        '<p>Each alert must be reviewed and then cleared or confirmed from the alerts screen in the back office.</p>',
        cta('$url', 'Review the alerts'),
      ]),
    },
  },
  {
    slug: 'risk-validation-required',
    name: 'Validation du score de risque requise',
    section: 'kyc',
    recipient: 'team',
    trigger: 'auto',
    origin:
      'Notification automatique quand le score de risque calculé d\'une souscription atteint un niveau exigeant une validation manuelle ; les destinataires sont les adresses paramétrées sur le fonds ou, à défaut, dans le setting "Risk validation emails"',
    variables: [
      '$logo',
      '$appname',
      '$year',
      '$mirror',
      '$fund.name',
      '$investor.name',
      '$investor.parent.name',
      '$subscriptionname',
      '$submitter',
      '$link',
    ],
    proposedVariables: [
      {
        name: '$risk_score',
        note: "score de risque calculé, connu au point d'appel mais non passé au gabarit",
      },
    ],
    fr: {
      subject: 'Validation risque requise - $subscriptionname sur $fund.name',
      html: html('fr', [
        '<p>Bonjour,</p>',
        '<p>Le score de risque calculé pour la souscription <strong>$subscriptionname</strong> sur le fonds <strong>$fund.name</strong> atteint un niveau qui requiert une validation manuelle.</p>',
        '<p>Investisseur : <strong>$investor.name</strong> (entité mère : $investor.parent.name)<br>Score calculé : <strong>$risk_score</strong><br>Soumis par : $submitter</p>',
        "<p>Merci d'examiner le profil de risque de cette souscription puis de valider ou d'ajuster le score depuis l'écran de la souscription.</p>",
        cta('$link', 'Examiner la souscription'),
      ]),
    },
    en: {
      subject: 'Risk validation required - $subscriptionname on $fund.name',
      html: html('en', [
        '<p>Hello,</p>',
        '<p>The risk score calculated for the subscription <strong>$subscriptionname</strong> in the fund <strong>$fund.name</strong> has reached a level that requires manual validation.</p>',
        '<p>Investor: <strong>$investor.name</strong> (parent entity: $investor.parent.name)<br>Calculated score: <strong>$risk_score</strong><br>Submitted by: $submitter</p>',
        '<p>Please review the risk profile of this subscription and validate or adjust the score from the subscription screen.</p>',
        cta('$link', 'Review the subscription'),
      ]),
    },
  },
  {
    slug: 'internal-validation-asked',
    name: 'Validation interne de souscription demandée',
    section: 'kyc',
    recipient: 'team',
    trigger: 'manual',
    origin:
      'Un utilisateur GP envoie la souscription en validation interne ; le mail part à chacun des valideurs internes paramétrés sur le fonds',
    variables: [
      '$logo',
      '$appname',
      '$year',
      '$mirror',
      '$subscriptionname',
      '$investor.firstname',
      '$investor.lastname',
      '$campaign.name',
      '$partner.name',
      '$subscription.amount',
      '$link',
    ],
    proposedVariables: [
      {
        name: '$asker_name',
        note: "nom de l'utilisateur GP demandeur de la validation, connu au point d'appel mais non passé au gabarit",
      },
    ],
    fr: {
      subject: 'Validation interne demandée - $subscriptionname sur $campaign.name',
      html: html('fr', [
        '<p>Bonjour,</p>',
        "<p>Le dossier de souscription <strong>$subscriptionname</strong> sur le fonds <strong>$campaign.name</strong> vient d'être soumis à votre validation interne par $asker_name.</p>",
        '<p>Investisseur : <strong>$investor.firstname $investor.lastname</strong><br>Montant : <strong>$subscription.amount</strong><br>Distributeur : $partner.name</p>',
        "<p>Merci d'examiner le dossier puis de l'approuver ou de le refuser depuis l'écran de la souscription. Le demandeur sera notifié de votre décision.</p>",
        cta('$link', 'Examiner le dossier'),
      ]),
    },
    en: {
      subject: 'Internal validation requested - $subscriptionname on $campaign.name',
      html: html('en', [
        '<p>Hello,</p>',
        '<p>The subscription file <strong>$subscriptionname</strong> in the fund <strong>$campaign.name</strong> has just been submitted for your internal validation by $asker_name.</p>',
        '<p>Investor: <strong>$investor.firstname $investor.lastname</strong><br>Amount: <strong>$subscription.amount</strong><br>Distributor: $partner.name</p>',
        '<p>Please review the file and approve or reject it from the subscription screen. The requester will be notified of your decision.</p>',
        cta('$link', 'Review the file'),
      ]),
    },
  },
  {
    slug: 'internal-validation-approved',
    name: 'Validation interne approuvée',
    section: 'kyc',
    recipient: 'team',
    trigger: 'auto',
    origin:
      "Notification automatique quand un valideur interne approuve le dossier de souscription ; le mail part à l'utilisateur GP qui avait demandé la validation",
    variables: [
      '$logo',
      '$appname',
      '$year',
      '$mirror',
      '$subscriptionname',
      '$investor.firstname',
      '$investor.lastname',
      '$campaign.name',
      '$partner.name',
      '$subscription.amount',
      '$link',
    ],
    proposedVariables: [
      {
        name: '$validator_name',
        note: "nom du valideur qui a approuvé le dossier, connu au point d'appel mais non passé au gabarit",
      },
    ],
    fr: {
      subject: 'Validation interne approuvée - $subscriptionname sur $campaign.name',
      html: html('fr', [
        '<p>Bonjour,</p>',
        '<p>Le dossier de souscription <strong>$subscriptionname</strong> sur le fonds <strong>$campaign.name</strong> a été <strong>approuvé</strong> en validation interne par $validator_name.</p>',
        '<p>Investisseur : <strong>$investor.firstname $investor.lastname</strong><br>Montant : <strong>$subscription.amount</strong><br>Distributeur : $partner.name</p>',
        '<p>Vous pouvez poursuivre le traitement de la souscription.</p>',
        cta('$link', 'Consulter la souscription'),
      ]),
    },
    en: {
      subject: 'Internal validation approved - $subscriptionname on $campaign.name',
      html: html('en', [
        '<p>Hello,</p>',
        '<p>The subscription file <strong>$subscriptionname</strong> in the fund <strong>$campaign.name</strong> has been <strong>approved</strong> through internal validation by $validator_name.</p>',
        '<p>Investor: <strong>$investor.firstname $investor.lastname</strong><br>Amount: <strong>$subscription.amount</strong><br>Distributor: $partner.name</p>',
        '<p>You can now proceed with the processing of the subscription.</p>',
        cta('$link', 'View the subscription'),
      ]),
    },
  },
  {
    slug: 'internal-validation-refused',
    name: 'Validation interne refusée',
    section: 'kyc',
    recipient: 'team',
    trigger: 'auto',
    origin:
      "Notification automatique quand un valideur interne refuse le dossier de souscription avec un motif ; le mail part à l'utilisateur GP qui avait demandé la validation",
    variables: [
      '$logo',
      '$appname',
      '$year',
      '$mirror',
      '$subscriptionname',
      '$investor.firstname',
      '$investor.lastname',
      '$campaign.name',
      '$partner.name',
      '$subscription.amount',
      '$message',
      '$link',
    ],
    proposedVariables: [
      {
        name: '$validator_name',
        note: "nom du valideur qui a refusé le dossier, connu au point d'appel mais non passé au gabarit",
      },
    ],
    fr: {
      subject: 'Validation interne refusée - $subscriptionname sur $campaign.name',
      html: html('fr', [
        '<p>Bonjour,</p>',
        '<p>Le dossier de souscription <strong>$subscriptionname</strong> sur le fonds <strong>$campaign.name</strong> a été <strong>refusé</strong> en validation interne par $validator_name.</p>',
        '<p>Investisseur : <strong>$investor.firstname $investor.lastname</strong><br>Montant : <strong>$subscription.amount</strong><br>Distributeur : $partner.name</p>',
        '<p>Motif du refus :</p>',
        centered('<strong>$message</strong>'),
        "<p>Après correction du dossier, vous pourrez le renvoyer en validation interne depuis l'écran de la souscription.</p>",
        cta('$link', 'Consulter la souscription'),
      ]),
    },
    en: {
      subject: 'Internal validation rejected - $subscriptionname on $campaign.name',
      html: html('en', [
        '<p>Hello,</p>',
        '<p>The subscription file <strong>$subscriptionname</strong> in the fund <strong>$campaign.name</strong> has been <strong>rejected</strong> through internal validation by $validator_name.</p>',
        '<p>Investor: <strong>$investor.firstname $investor.lastname</strong><br>Amount: <strong>$subscription.amount</strong><br>Distributor: $partner.name</p>',
        '<p>Reason for rejection:</p>',
        centered('<strong>$message</strong>'),
        '<p>Once the file has been corrected, you can submit it for internal validation again from the subscription screen.</p>',
        cta('$link', 'View the subscription'),
      ]),
    },
  },
];
