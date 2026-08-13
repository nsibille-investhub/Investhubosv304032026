import { centeredSize, cta, highlight, html, quoteLeft } from './blocks';
import type { StarterPackTemplate } from './types';

/**
 * Section 12 : Communication et demandes de contact — page Confluence 931135490.
 *
 * Envois de masse et échanges entrants : communications sortantes, diffusion
 * d'actualités, campagnes de sondage, convocations aux assemblées et événements,
 * formulaires de contact des espaces investisseur et distributeur.
 */
export const SECTION_12_COMMUNICATION: StarterPackTemplate[] = [
  {
    slug: 'newsletter',
    name: 'Gabarit par défaut des communications de masse',
    section: 'communication',
    recipient: 'investor',
    trigger: 'manual',
    origin:
      "Envoi d'une communication sortante depuis le module Communication, quand aucun gabarit spécifique n'est sélectionné sur la communication",
    variables: ['$logo', '$appname', '$year', '$mirror', '$sujet', '$content'],
    proposedVariables: [],
    fr: {
      subject: '$sujet',
      html: html('fr', ['$content'], { signature: false }),
    },
    en: {
      subject: '$sujet',
      html: html('en', ['$content'], { signature: false }),
    },
  },
  {
    slug: 'mailing-news',
    name: "Diffusion d'une actualité par email",
    section: 'communication',
    recipient: 'investor',
    trigger: 'manual',
    origin:
      "Publication d'une actualité depuis le module Actualités avec la case d'envoi de mail cochée. Envoi à chaque cible de l'audience choisie",
    variables: [
      '$logo',
      '$appname',
      '$url',
      '$year',
      '$mirror',
      '$title',
      '$extract',
      '$content',
    ],
    proposedVariables: [
      {
        name: '$newslink',
        note: "lien direct vers l'actualité sur le portail, non passé au point d'appel",
      },
    ],
    fr: {
      subject: '$appname - $title',
      html: html('fr', [
        '<p>Bonjour,</p>',
        "<p>Une nouvelle actualité vient d'être publiée sur votre espace :</p>",
        highlight('$title', 20),
        '<p>$content</p>',
        cta('$url', 'Lire sur mon espace'),
      ]),
    },
    en: {
      subject: '$appname - $title',
      html: html('en', [
        '<p>Hello,</p>',
        '<p>A new update has just been published on your portal:</p>',
        highlight('$title', 20),
        '<p>$content</p>',
        cta('$url', 'Read on my portal'),
      ]),
    },
  },
  {
    slug: 'invitation-survey',
    name: 'Invitation à répondre à un sondage',
    section: 'communication',
    recipient: 'investor',
    trigger: 'manual',
    origin:
      "Lancement d'une campagne de sondage, ou envoi du bon à tirer, depuis le module Sondages. Chaque cible reçoit un lien de réponse personnel",
    variables: ['$logo', '$appname', '$year', '$mirror', '$subject', '$content', '$link'],
    proposedVariables: [],
    fr: {
      subject: '$subject',
      html: html('fr', [
        '<p>Bonjour,</p>',
        '<p>$content</p>',
        '<p>Votre réponse ne prend que quelques minutes et nous est précieuse. Ce lien de réponse vous est personnel :</p>',
        cta('$link', 'Répondre au sondage'),
        '<p>Merci par avance pour votre participation.</p>',
      ]),
    },
    en: {
      subject: '$subject',
      html: html('en', [
        '<p>Hello,</p>',
        '<p>$content</p>',
        '<p>Your answer only takes a few minutes and is valuable to us. This response link is personal to you:</p>',
        cta('$link', 'Answer the survey'),
        '<p>Thank you in advance for your participation.</p>',
      ]),
    },
  },
  {
    slug: 'remind-survey',
    name: 'Relance de sondage sans réponse',
    section: 'communication',
    recipient: 'investor',
    trigger: 'manual',
    origin:
      "Relance depuis le module Sondages des cibles déjà notifiées et n'ayant pas encore répondu",
    variables: ['$logo', '$appname', '$year', '$mirror', '$content', '$link'],
    proposedVariables: [
      {
        name: '$subject',
        note: "objet du sondage : passé à l'invitation mais pas à la relance, le sujet de relance doit donc être autoporteur",
      },
    ],
    fr: {
      subject: '$appname - Rappel : votre avis nous interesse',
      html: html('fr', [
        '<p>Bonjour,</p>',
        "<p>Sauf erreur de notre part, nous n'avons pas encore reçu votre réponse au sondage ci-dessous :</p>",
        '<p>$content</p>',
        '<p>Votre réponse ne prend que quelques minutes. Ce lien de réponse vous est personnel :</p>',
        cta('$link', 'Répondre au sondage'),
        '<p>Si vous avez déjà répondu entre-temps, merci de ne pas tenir compte de ce message.</p>',
      ]),
    },
    en: {
      subject: '$appname - Reminder: your feedback matters to us',
      html: html('en', [
        '<p>Hello,</p>',
        '<p>Unless we are mistaken, we have not yet received your answer to the survey below:</p>',
        '<p>$content</p>',
        '<p>Your answer only takes a few minutes. This response link is personal to you:</p>',
        cta('$link', 'Answer the survey'),
        '<p>If you have already answered in the meantime, please disregard this message.</p>',
      ]),
    },
  },
  {
    slug: 'invite-ag',
    name: 'Convocation à une assemblée',
    section: 'communication',
    recipient: 'investor',
    trigger: 'manual',
    origin:
      "Envoi de la convocation à un événement, assemblée, depuis le module Événements. Les documents de vote générés pour l'investisseur sont joints au message",
    variables: [
      '$logo',
      '$appname',
      '$year',
      '$mirror',
      '$name',
      '$campaign',
      '$date',
      '$heure',
      '$location',
      '$infos',
      '$prenom',
      '$nom',
      '$link',
      '$link_ok',
      '$link_ko',
      '$contact_firstname',
      '$contact_lastname',
      '$contact_mail',
    ],
    proposedVariables: [],
    fr: {
      subject: '$campaign - Convocation : $name le $date',
      html: html('fr', [
        '<p>Bonjour $prenom $nom,</p>',
        "<p>Dans le cadre du fonds <strong>$campaign</strong>, vous êtes invité(e) à l'événement suivant :</p>",
        centeredSize('<strong>$name</strong><br>le $date à $heure<br>$location', 20),
        '<p>$infos</p>',
        '<p>Les documents relatifs à cet événement, dont vos documents de vote, sont joints à ce message. Merci de nous indiquer votre participation :</p>',
        cta('$link', 'Répondre à la convocation'),
        '<p style="text-align:center">Ou répondez en un clic : <a href="$link_ok">je participe</a> &middot; <a href="$link_ko">je ne participe pas</a></p>',
        '<p>Pour toute question, votre contact est $contact_firstname $contact_lastname ($contact_mail).</p>',
      ]),
    },
    en: {
      subject: '$campaign - Notice of meeting: $name on $date',
      html: html('en', [
        '<p>Dear $prenom $nom,</p>',
        '<p>In connection with the fund <strong>$campaign</strong>, you are invited to the following event:</p>',
        centeredSize('<strong>$name</strong><br>on $date at $heure<br>$location', 20),
        '<p>$infos</p>',
        '<p>The documents relating to this event, including your voting documents, are attached to this message. Please let us know whether you will attend:</p>',
        cta('$link', 'Reply to the invitation'),
        '<p style="text-align:center">Or reply in one click: <a href="$link_ok">I will attend</a> &middot; <a href="$link_ko">I will not attend</a></p>',
        '<p>For any question, your contact is $contact_firstname $contact_lastname ($contact_mail).</p>',
      ]),
    },
  },
  {
    slug: 'confirm-event',
    name: 'Confirmation de participation à un événement',
    section: 'communication',
    recipient: 'investor',
    trigger: 'auto',
    origin:
      "L'investisseur répond au formulaire de participation depuis le lien de sa convocation. Un récapitulatif est envoyé à l'adresse saisie dans le formulaire",
    variables: [
      '$logo',
      '$appname',
      '$year',
      '$mirror',
      '$event',
      '$participation',
      '$config',
      '$additional_people',
      '$date',
      '$heure',
      '$lieu',
      '$address',
      '$additional_infos',
    ],
    proposedVariables: [],
    fr: {
      subject: '$event - Votre reponse a bien ete enregistree',
      html: html('fr', [
        '<p>Bonjour,</p>',
        "<p>Nous vous confirmons l'enregistrement de votre réponse pour l'événement <strong>$event</strong> du <strong>$date à $heure</strong> ($lieu).</p>",
        '<p><strong>Votre réponse :</strong> $participation<br><strong>Modalité :</strong> $config<br><strong>Accompagnants :</strong> $additional_people</p>',
        '<p>Adresse : $address<br>$additional_infos</p>',
        '<p>Si votre disponibilité évolue, vous pouvez modifier votre réponse depuis le lien de votre convocation.</p>',
      ]),
    },
    en: {
      subject: '$event - Your reply has been recorded',
      html: html('en', [
        '<p>Hello,</p>',
        '<p>We confirm that your reply for the event <strong>$event</strong> on <strong>$date at $heure</strong> ($lieu) has been recorded.</p>',
        '<p><strong>Your reply:</strong> $participation<br><strong>Format:</strong> $config<br><strong>Additional attendees:</strong> $additional_people</p>',
        '<p>Address: $address<br>$additional_infos</p>',
        '<p>If your availability changes, you can update your reply from the link in your invitation.</p>',
      ]),
    },
  },
  {
    slug: 'contactform',
    name: 'Question posée depuis la FAQ investisseur',
    section: 'communication',
    recipient: 'team',
    trigger: 'auto',
    origin:
      "Un investisseur envoie une question via le formulaire de la FAQ de son espace. Selon le paramétrage, la question part à l'adresse FAQ interne ou au conseiller ou distributeur référent de l'investisseur",
    variables: [
      '$logo',
      '$appname',
      '$year',
      '$mirror',
      '$investor',
      '$email',
      '$useremail',
      '$message',
    ],
    proposedVariables: [],
    fr: {
      subject: 'Nouvelle question depuis la FAQ : $investor',
      html: html('fr', [
        '<p>Bonjour,</p>',
        "<p>L'investisseur <strong>$investor</strong> ($email) a posé une question depuis la FAQ de son espace :</p>",
        quoteLeft('$message'),
        '<p>Adresse du contact connecté au moment de l\'envoi : $useremail. Vous pouvez lui répondre directement par email.</p>',
      ]),
    },
    en: {
      subject: 'New question from the FAQ: $investor',
      html: html('en', [
        '<p>Hello,</p>',
        '<p>The investor <strong>$investor</strong> ($email) has asked a question from the FAQ of their portal:</p>',
        quoteLeft('$message'),
        '<p>Email address of the contact logged in at the time of sending: $useremail. You can reply to them directly by email.</p>',
      ]),
    },
  },
  {
    slug: 'contactform-partner',
    name: 'Question posée depuis la FAQ distributeur',
    section: 'communication',
    recipient: 'team',
    trigger: 'auto',
    origin:
      "Un utilisateur distributeur envoie une question via le formulaire de la FAQ de son espace. La question part à l'adresse FAQ interne configurée",
    variables: [
      '$logo',
      '$appname',
      '$year',
      '$mirror',
      '$partner',
      '$email',
      '$useremail',
      '$message',
    ],
    proposedVariables: [],
    fr: {
      subject: 'Nouvelle question depuis la FAQ distributeur : $partner',
      html: html('fr', [
        '<p>Bonjour,</p>',
        '<p>Un utilisateur du distributeur <strong>$partner</strong> a posé une question depuis la FAQ de son espace :</p>',
        quoteLeft('$message'),
        '<p>Auteur de la question : $useremail<br>Adresse générique du distributeur : $email</p>',
        "<p>Vous pouvez répondre directement à l'auteur par email.</p>",
      ]),
    },
    en: {
      subject: 'New question from the distributor FAQ: $partner',
      html: html('en', [
        '<p>Hello,</p>',
        '<p>A user of the distributor <strong>$partner</strong> has asked a question from the FAQ of their portal:</p>',
        quoteLeft('$message'),
        "<p>Author of the question: $useremail<br>Distributor's main address: $email</p>",
        '<p>You can reply to the author directly by email.</p>',
      ]),
    },
  },
  {
    slug: 'new-contactrequest',
    name: 'Nouvelle demande de contact',
    section: 'communication',
    recipient: 'team',
    trigger: 'auto',
    origin:
      "Un investisseur soumet un formulaire de contact depuis son espace. Alerte envoyée à l'adresse du formulaire, ou à celle du sujet de demande si elle est renseignée",
    variables: [
      '$logo',
      '$appname',
      '$year',
      '$mirror',
      '$investorname',
      '$investoremail',
      '$investorid',
      '$link',
    ],
    proposedVariables: [
      {
        name: '$reason',
        note: "sujet de demande choisi par l'investisseur, connu au point d'appel mais non passé",
      },
    ],
    fr: {
      subject: 'Nouvelle demande de contact : $investorname',
      html: html('fr', [
        '<p>Bonjour,</p>',
        "<p>L'investisseur <strong>$investorname</strong> ($investoremail, référence $investorid) vient de soumettre une demande de contact depuis son espace.</p>",
        "<p>Le détail des réponses au formulaire est consultable depuis l'écran de traitement des demandes, où vous pourrez également suivre et clôturer la demande.</p>",
        cta('$link', 'Traiter la demande'),
      ]),
    },
    en: {
      subject: 'New contact request: $investorname',
      html: html('en', [
        '<p>Hello,</p>',
        '<p>The investor <strong>$investorname</strong> ($investoremail, reference $investorid) has just submitted a contact request from their portal.</p>',
        '<p>The detailed answers to the form are available on the request processing screen, where you can also follow up and close the request.</p>',
        cta('$link', 'Process the request'),
      ]),
    },
  },
];
