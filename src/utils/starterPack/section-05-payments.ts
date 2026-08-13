import type { StarterPackTemplate } from './types';

/**
 * Section 5 : Paiements — page Confluence 930971672.
 *
 * Mails du cycle de règlement d'une souscription : relance du versement attendu,
 * confirmation de la réception des fonds, puis envoi des documents définitifs une
 * fois la valeur liquidative appliquée.
 */
export const SECTION_05_PAYMENTS: StarterPackTemplate[] = [
  {
    slug: 'relance-versement',
    name: 'Relance de versement',
    section: 'payments',
    recipient: 'investor',
    trigger: 'mixed',
    origin:
      "Relance manuelle ou automatique du versement d'une souscription en attente de règlement, envoyée depuis l'écran Souscriptions ou par l'automate de relance, avec les documents de souscription en pièce jointe",
    variables: [
      '$logo',
      '$appname',
      '$year',
      '$mirror',
      '$prenom',
      '$nom',
      '$campaign',
      '$amount',
      '$link',
      '$campaign.iban',
      '$campaign.bic',
    ],
    proposedVariables: [
      { name: '$duedate', note: 'date limite de versement, non passée au point d\'appel' },
    ],
    fr: {
      subject: '$campaign - Votre versement de $amount est attendu',
      html: `<p style="text-align:center;margin:0 0 24px"><img src="$logo" alt="$appname" style="max-height:56px"></p>
<p>Bonjour $prenom $nom,</p>
<p>Votre souscription au fonds <strong>$campaign</strong> est en attente de règlement. Le montant à verser s'élève à :</p>
<p style="text-align:center;font-size:22px;margin:20px 0"><strong>$amount</strong></p>
<p>Nous vous remercions de procéder au virement avant le <strong>$duedate</strong> sur le compte du fonds :</p>
<p style="text-align:center;margin:20px 0"><strong>IBAN : $campaign.iban<br>BIC : $campaign.bic</strong></p>
<p>Vos documents de souscription, joints à ce message, rappellent ces instructions de règlement. Dès réception de votre versement, vous recevrez une confirmation par email.</p>
<p style="text-align:center;margin:24px 0"><a href="$link" style="background:#1a1a2e;color:#ffffff;padding:12px 28px;border-radius:4px;text-decoration:none;display:inline-block">Accéder à mon espace investisseur</a></p>
<p>Notre équipe se tient à votre disposition pour toute question sur votre souscription.</p>
<p>Cordialement,<br>L'équipe $appname</p>
<hr style="border:none;border-top:1px solid #e0e0e0;margin:24px 0 12px">
<p style="font-size:12px;color:#888888">&copy; $year $appname &middot; <a href="$mirror" style="color:#888888">Voir ce message dans votre navigateur</a></p>`,
    },
    en: {
      subject: '$campaign - Your payment of $amount is pending',
      html: `<p style="text-align:center;margin:0 0 24px"><img src="$logo" alt="$appname" style="max-height:56px"></p>
<p>Dear $prenom $nom,</p>
<p>Your subscription to the fund <strong>$campaign</strong> is awaiting payment. The amount due is:</p>
<p style="text-align:center;font-size:22px;margin:20px 0"><strong>$amount</strong></p>
<p>Please arrange the wire transfer by <strong>$duedate</strong> to the fund's account:</p>
<p style="text-align:center;margin:20px 0"><strong>IBAN: $campaign.iban<br>BIC: $campaign.bic</strong></p>
<p>Your subscription documents, attached to this message, contain these payment instructions. You will receive a confirmation by email once your payment has been received.</p>
<p style="text-align:center;margin:24px 0"><a href="$link" style="background:#1a1a2e;color:#ffffff;padding:12px 28px;border-radius:4px;text-decoration:none;display:inline-block">Access my investor portal</a></p>
<p>Our team remains available for any question regarding your subscription.</p>
<p>Best regards,<br>The $appname team</p>
<hr style="border:none;border-top:1px solid #e0e0e0;margin:24px 0 12px">
<p style="font-size:12px;color:#888888">&copy; $year $appname &middot; <a href="$mirror" style="color:#888888">View this message in your browser</a></p>`,
    },
  },
  {
    slug: 'confirmation-virement',
    name: 'Confirmation de réception des fonds',
    section: 'payments',
    recipient: 'investor',
    trigger: 'auto',
    origin:
      "Envoi automatique quand le paiement de la souscription est confirmé et que la date de valeur liquidative est saisie (écran de contrôle du versement), ou à la réception du prélèvement SEPA",
    variables: [
      '$logo',
      '$appname',
      '$url',
      '$year',
      '$mirror',
      '$investor.firstname',
      '$investor.lastname',
      '$campaign',
      '$subscriptionname',
      '$dateVL',
      '$subscription.amount',
    ],
    proposedVariables: [],
    fr: {
      subject: '$campaign - Nous avons bien reçu votre versement',
      html: `<p style="text-align:center;margin:0 0 24px"><img src="$logo" alt="$appname" style="max-height:56px"></p>
<p>Bonjour $investor.firstname $investor.lastname,</p>
<p>Nous vous confirmons la bonne réception de votre versement de <strong>$subscription.amount</strong> au titre de votre souscription <strong>$subscriptionname</strong> au fonds <strong>$campaign</strong>.</p>
<p>La valeur liquidative du <strong>$dateVL</strong> sera appliquée à votre souscription. Le nombre de parts définitif vous sera communiqué avec vos documents de souscription, dans un prochain message.</p>
<p>Aucune action n'est attendue de votre part.</p>
<p style="text-align:center;margin:24px 0"><a href="$url" style="background:#1a1a2e;color:#ffffff;padding:12px 28px;border-radius:4px;text-decoration:none;display:inline-block">Consulter mon espace investisseur</a></p>
<p>Cordialement,<br>L'équipe $appname</p>
<hr style="border:none;border-top:1px solid #e0e0e0;margin:24px 0 12px">
<p style="font-size:12px;color:#888888">&copy; $year $appname &middot; <a href="$mirror" style="color:#888888">Voir ce message dans votre navigateur</a></p>`,
    },
    en: {
      subject: '$campaign - We have received your payment',
      html: `<p style="text-align:center;margin:0 0 24px"><img src="$logo" alt="$appname" style="max-height:56px"></p>
<p>Dear $investor.firstname $investor.lastname,</p>
<p>We confirm the receipt of your payment of <strong>$subscription.amount</strong> under your subscription <strong>$subscriptionname</strong> to the fund <strong>$campaign</strong>.</p>
<p>The net asset value dated <strong>$dateVL</strong> will be applied to your subscription. The final number of shares will be communicated with your subscription documents in a follow-up message.</p>
<p>No action is required on your side.</p>
<p style="text-align:center;margin:24px 0"><a href="$url" style="background:#1a1a2e;color:#ffffff;padding:12px 28px;border-radius:4px;text-decoration:none;display:inline-block">Access my investor portal</a></p>
<p>Best regards,<br>The $appname team</p>
<hr style="border:none;border-top:1px solid #e0e0e0;margin:24px 0 12px">
<p style="font-size:12px;color:#888888">&copy; $year $appname &middot; <a href="$mirror" style="color:#888888">View this message in your browser</a></p>`,
    },
  },
  {
    slug: 'confirmation-paiement',
    name: 'Envoi des documents après paiement',
    section: 'payments',
    recipient: 'investor',
    trigger: 'auto',
    origin:
      "Envoi automatique quand la valeur liquidative est appliquée et que le nombre de parts définitif est arrêté, avec les documents post-paiement en pièce jointe (désactivable fonds par fonds)",
    variables: [
      '$logo',
      '$appname',
      '$url',
      '$year',
      '$mirror',
      '$investor.firstname',
      '$investor.lastname',
      '$campaign',
      '$subscriptionname',
    ],
    proposedVariables: [
      {
        name: '$dateVL',
        note: 'date de la valeur liquidative appliquée, non passée à ce point d\'appel',
      },
      {
        name: '$nbshares',
        note: 'nombre de parts définitif, connu de la souscription mais non passé',
      },
    ],
    fr: {
      subject: '$campaign - Vos documents de souscription sont disponibles',
      html: `<p style="text-align:center;margin:0 0 24px"><img src="$logo" alt="$appname" style="max-height:56px"></p>
<p>Bonjour $investor.firstname $investor.lastname,</p>
<p>Votre souscription <strong>$subscriptionname</strong> au fonds <strong>$campaign</strong> est finalisée. La valeur liquidative du <strong>$dateVL</strong> a été appliquée et votre nombre de parts définitif s'élève à <strong>$nbshares</strong>.</p>
<p>Vos documents définitifs sont joints à ce message. Ils restent disponibles à tout moment dans votre espace investisseur.</p>
<p style="text-align:center;margin:24px 0"><a href="$url" style="background:#1a1a2e;color:#ffffff;padding:12px 28px;border-radius:4px;text-decoration:none;display:inline-block">Consulter mes documents</a></p>
<p>Nous vous remercions de votre confiance.</p>
<p>Cordialement,<br>L'équipe $appname</p>
<hr style="border:none;border-top:1px solid #e0e0e0;margin:24px 0 12px">
<p style="font-size:12px;color:#888888">&copy; $year $appname &middot; <a href="$mirror" style="color:#888888">Voir ce message dans votre navigateur</a></p>`,
    },
    en: {
      subject: '$campaign - Your subscription documents are available',
      html: `<p style="text-align:center;margin:0 0 24px"><img src="$logo" alt="$appname" style="max-height:56px"></p>
<p>Dear $investor.firstname $investor.lastname,</p>
<p>Your subscription <strong>$subscriptionname</strong> to the fund <strong>$campaign</strong> is now complete. The net asset value dated <strong>$dateVL</strong> has been applied and your final number of shares is <strong>$nbshares</strong>.</p>
<p>Your final documents are attached to this message. They remain available at any time in your investor portal.</p>
<p style="text-align:center;margin:24px 0"><a href="$url" style="background:#1a1a2e;color:#ffffff;padding:12px 28px;border-radius:4px;text-decoration:none;display:inline-block">View my documents</a></p>
<p>Thank you for your trust.</p>
<p>Best regards,<br>The $appname team</p>
<hr style="border:none;border-top:1px solid #e0e0e0;margin:24px 0 12px">
<p style="font-size:12px;color:#888888">&copy; $year $appname &middot; <a href="$mirror" style="color:#888888">View this message in your browser</a></p>`,
    },
  },
];
