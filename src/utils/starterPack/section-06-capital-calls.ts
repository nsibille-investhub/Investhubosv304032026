import { cta, highlight, html } from './blocks';
import type { StarterPackTemplate } from './types';

/**
 * Section 6 : Appels de fonds — page Confluence 931233794.
 *
 * Notification de l'appel (virement ou prélèvement, souscription unique ou
 * regroupée), relance des appels non réglés, puis confirmation de la réception
 * du paiement.
 */

const CALL_REF: { name: string; note: string } = {
  name: '$call_reference',
  note: 'référence de virement attendue',
};

const REMAINING: { name: string; note: string } = {
  name: '$remaining_amount',
  note: 'solde restant à régler en cas de paiement partiel',
};

export const SECTION_06_CAPITAL_CALLS: StarterPackTemplate[] = [
  {
    slug: 'new_call',
    name: "Avis d'appel de fonds",
    section: 'capitalCalls',
    recipient: 'investor',
    trigger: 'manual',
    origin:
      "Notification d'un appel de fonds aux investisseurs depuis le back office, Fonds puis Appels de fonds, action Notifier, avec l'avis PDF en pièce jointe",
    variables: [
      '$logo',
      '$appname',
      '$url',
      '$year',
      '$mirror',
      '$investor.firstname',
      '$investor.lastname',
      '$campaign',
      '$subscription_name',
      '$share_name',
      '$investamount',
      '$investpct',
      '$nbshares',
      '$date',
    ],
    proposedVariables: [CALL_REF],
    fr: {
      subject: '$campaign - Appel de fonds : $investamount à régler',
      html: html('fr', [
        '<p>Bonjour $investor.firstname $investor.lastname,</p>',
        "<p>Le fonds <strong>$campaign</strong> procède à un appel de fonds. Au titre de votre souscription <strong>$subscription_name</strong>, le montant appelé s'élève à :</p>",
        highlight('$investamount'),
        "<p>Ce montant représente $investpct de votre engagement. Votre avis d'appel de fonds, joint à ce message, détaille le calcul et les instructions de règlement.</p>",
        '<p>Nous vous remercions de procéder au virement avant le <strong>$date</strong>, en indiquant la référence <strong>$call_reference</strong>.</p>',
        cta('$url', 'Consulter mon espace investisseur'),
        '<p>Notre équipe se tient à votre disposition pour toute question sur cet appel de fonds.</p>',
      ]),
    },
    en: {
      subject: '$campaign - Capital call: $investamount due',
      html: html('en', [
        '<p>Dear $investor.firstname $investor.lastname,</p>',
        '<p>The fund <strong>$campaign</strong> is issuing a capital call. Under your subscription <strong>$subscription_name</strong>, the amount called is:</p>',
        highlight('$investamount'),
        '<p>This amount represents $investpct of your commitment. Your capital call notice, attached to this message, details the calculation and the payment instructions.</p>',
        '<p>Please arrange the wire transfer by <strong>$date</strong>, quoting the reference <strong>$call_reference</strong>.</p>',
        cta('$url', 'Access my investor portal'),
        '<p>Our team remains available for any question regarding this capital call.</p>',
      ]),
    },
  },
  {
    slug: 'new_call_bulk',
    name: "Avis d'appel de fonds regroupé",
    section: 'capitalCalls',
    recipient: 'investor',
    trigger: 'manual',
    origin:
      "Notification d'un appel de fonds depuis le back office quand plusieurs souscriptions du même investisseur sont regroupées dans un même envoi : un email unique, avec un avis PDF par souscription ou une notice combinée selon paramétrage",
    variables: [
      '$logo',
      '$appname',
      '$url',
      '$year',
      '$mirror',
      '$prenom',
      '$nom',
      '$campaign',
      '$subscription_name',
      '$share_name',
      '$investamount',
      '$nbshares',
      '$date',
      '$pitch',
    ],
    proposedVariables: [CALL_REF],
    fr: {
      subject: '$campaign - Appel de fonds : $investamount à régler sur vos souscriptions',
      html: html('fr', [
        '<p>Bonjour $prenom $nom,</p>',
        "<p>Le fonds <strong>$campaign</strong> procède à un appel de fonds. Cet appel couvre plusieurs de vos souscriptions ($subscription_name) et le montant total appelé s'élève à :</p>",
        highlight('$investamount'),
        "<p>$pitch Les avis d'appel de fonds joints à ce message détaillent, pour chacune de vos souscriptions, le montant appelé et les instructions de règlement.</p>",
        '<p>Nous vous remercions de procéder au virement avant le <strong>$date</strong>, en indiquant la référence <strong>$call_reference</strong>.</p>',
        cta('$url', 'Consulter mon espace investisseur'),
        '<p>Notre équipe se tient à votre disposition pour toute question sur cet appel de fonds.</p>',
      ]),
    },
    en: {
      subject: '$campaign - Capital call: $investamount due across your subscriptions',
      html: html('en', [
        '<p>Dear $prenom $nom,</p>',
        '<p>The fund <strong>$campaign</strong> is issuing a capital call. This call covers several of your subscriptions ($subscription_name) and the total amount called is:</p>',
        highlight('$investamount'),
        '<p>$pitch The capital call notices attached to this message detail, for each of your subscriptions, the amount called and the payment instructions.</p>',
        '<p>Please arrange the wire transfer by <strong>$date</strong>, quoting the reference <strong>$call_reference</strong>.</p>',
        cta('$url', 'Access my investor portal'),
        '<p>Our team remains available for any question regarding this capital call.</p>',
      ]),
    },
  },
  {
    slug: 'new-call-debit',
    name: "Avis d'appel de fonds avec prélèvement",
    section: 'capitalCalls',
    recipient: 'investor',
    trigger: 'manual',
    origin:
      "Notification d'un appel de fonds depuis le back office quand la souscription porte un mandat de prélèvement SEPA actif : le montant est prélevé automatiquement, aucun virement n'est demandé",
    variables: [
      '$logo',
      '$appname',
      '$url',
      '$year',
      '$mirror',
      '$prenom',
      '$nom',
      '$campaign',
      '$subscription_name',
      '$investamount',
      '$investpct',
    ],
    proposedVariables: [
      { name: '$debit_date', note: 'date prévue du prélèvement, non passée au gabarit' },
    ],
    fr: {
      subject: '$campaign - Appel de fonds : prélèvement à venir de $investamount',
      html: html('fr', [
        '<p>Bonjour $prenom $nom,</p>',
        "<p>Le fonds <strong>$campaign</strong> procède à un appel de fonds. Au titre de votre souscription <strong>$subscription_name</strong>, le montant appelé s'élève à :</p>",
        highlight('$investamount'),
        '<p>Ce montant représente $investpct de votre engagement. Il sera prélevé automatiquement sur le compte bancaire associé à votre mandat de prélèvement SEPA, à la date du <strong>$debit_date</strong>.</p>',
        "<p>Aucune action n'est attendue de votre part : veillez simplement à ce que votre compte soit suffisamment approvisionné. Votre avis d'appel de fonds, joint à ce message, détaille le calcul de ce montant.</p>",
        cta('$url', 'Consulter mon espace investisseur'),
        '<p>Notre équipe se tient à votre disposition pour toute question sur cet appel de fonds.</p>',
      ]),
    },
    en: {
      subject: '$campaign - Capital call: upcoming direct debit of $investamount',
      html: html('en', [
        '<p>Dear $prenom $nom,</p>',
        '<p>The fund <strong>$campaign</strong> is issuing a capital call. Under your subscription <strong>$subscription_name</strong>, the amount called is:</p>',
        highlight('$investamount'),
        '<p>This amount represents $investpct of your commitment. It will be automatically collected by SEPA direct debit from the bank account linked to your mandate, on <strong>$debit_date</strong>.</p>',
        '<p>No action is required on your side: please simply ensure your account holds sufficient funds. Your capital call notice, attached to this message, details the calculation of this amount.</p>',
        cta('$url', 'Access my investor portal'),
        '<p>Our team remains available for any question regarding this capital call.</p>',
      ]),
    },
  },
  {
    slug: 'new-call-debit_bulk',
    name: "Avis d'appel de fonds avec prélèvement regroupé",
    section: 'capitalCalls',
    recipient: 'investor',
    trigger: 'manual',
    origin:
      "Notification groupée d'un appel de fonds réglé par prélèvement SEPA, quand plusieurs souscriptions du même investisseur sont regroupées dans un même envoi",
    variables: [
      '$logo',
      '$appname',
      '$url',
      '$year',
      '$mirror',
      '$prenom',
      '$nom',
      '$campaign',
      '$subscription_name',
      '$investamount',
      '$pitch',
    ],
    proposedVariables: [
      { name: '$debit_date', note: 'date prévue du prélèvement, non passée au gabarit' },
    ],
    fr: {
      subject:
        '$campaign - Appel de fonds : prélèvement à venir de $investamount sur vos souscriptions',
      html: html('fr', [
        '<p>Bonjour $prenom $nom,</p>',
        "<p>Le fonds <strong>$campaign</strong> procède à un appel de fonds. Cet appel couvre plusieurs de vos souscriptions ($subscription_name) et le montant total appelé s'élève à :</p>",
        highlight('$investamount'),
        '<p>$pitch Ce montant sera prélevé automatiquement sur le compte bancaire associé à votre mandat de prélèvement SEPA, à la date du <strong>$debit_date</strong>.</p>',
        "<p>Aucune action n'est attendue de votre part : veillez simplement à ce que votre compte soit suffisamment approvisionné. Les avis joints à ce message détaillent le montant appelé pour chacune de vos souscriptions.</p>",
        cta('$url', 'Consulter mon espace investisseur'),
        '<p>Notre équipe se tient à votre disposition pour toute question sur cet appel de fonds.</p>',
      ]),
    },
    en: {
      subject:
        '$campaign - Capital call: upcoming direct debit of $investamount across your subscriptions',
      html: html('en', [
        '<p>Dear $prenom $nom,</p>',
        '<p>The fund <strong>$campaign</strong> is issuing a capital call. This call covers several of your subscriptions ($subscription_name) and the total amount called is:</p>',
        highlight('$investamount'),
        '<p>$pitch This amount will be automatically collected by SEPA direct debit from the bank account linked to your mandate, on <strong>$debit_date</strong>.</p>',
        '<p>No action is required on your side: please simply ensure your account holds sufficient funds. The notices attached to this message detail the amount called for each of your subscriptions.</p>',
        cta('$url', 'Access my investor portal'),
        '<p>Our team remains available for any question regarding this capital call.</p>',
      ]),
    },
  },
  {
    slug: 'relance_call',
    name: "Relance de paiement d'appel de fonds",
    section: 'capitalCalls',
    recipient: 'investor',
    trigger: 'manual',
    origin:
      "Relance manuelle d'un appel de fonds déjà notifié et non réglé, Fonds puis Appels de fonds, action Relancer, avec l'avis de nouveau en pièce jointe",
    variables: [
      '$logo',
      '$appname',
      '$url',
      '$year',
      '$mirror',
      '$prenom',
      '$nom',
      '$campaign',
      '$subscription_name',
      '$investamount',
      '$date',
    ],
    proposedVariables: [REMAINING, CALL_REF],
    fr: {
      subject: '$campaign - Rappel : appel de fonds de $investamount en attente de règlement',
      html: html('fr', [
        '<p>Bonjour $prenom $nom,</p>',
        "<p>Sauf erreur de notre part, le règlement de l'appel de fonds du fonds <strong>$campaign</strong>, au titre de votre souscription <strong>$subscription_name</strong>, reste en attente. Le montant appelé s'élève à :</p>",
        highlight('$investamount'),
        "<p>La date limite de règlement était fixée au <strong>$date</strong>. Nous vous remercions de procéder au virement dans les meilleurs délais, en indiquant la référence <strong>$call_reference</strong>. Votre avis d'appel de fonds, joint de nouveau à ce message, rappelle les instructions de règlement.</p>",
        '<p>Si votre virement a été émis récemment, veuillez ne pas tenir compte de ce message.</p>',
        cta('$url', 'Consulter mon espace investisseur'),
        '<p>Notre équipe se tient à votre disposition pour toute question sur cet appel de fonds.</p>',
      ]),
    },
    en: {
      subject: '$campaign - Reminder: capital call of $investamount awaiting payment',
      html: html('en', [
        '<p>Dear $prenom $nom,</p>',
        '<p>According to our records, the payment of the capital call issued by the fund <strong>$campaign</strong>, under your subscription <strong>$subscription_name</strong>, is still pending. The amount called is:</p>',
        highlight('$investamount'),
        '<p>The payment deadline was set to <strong>$date</strong>. Please arrange the wire transfer as soon as possible, quoting the reference <strong>$call_reference</strong>. Your capital call notice, attached again to this message, contains the payment instructions.</p>',
        '<p>If your transfer has been issued recently, please disregard this message.</p>',
        cta('$url', 'Access my investor portal'),
        '<p>Our team remains available for any question regarding this capital call.</p>',
      ]),
    },
  },
  {
    slug: 'relance_call_bulk',
    name: "Relance d'appel de fonds regroupée",
    section: 'capitalCalls',
    recipient: 'investor',
    trigger: 'manual',
    origin:
      "Relance d'un appel de fonds non réglé quand plusieurs souscriptions du même investisseur sont regroupées dans un même envoi, avec les avis de nouveau en pièce jointe",
    variables: [
      '$logo',
      '$appname',
      '$url',
      '$year',
      '$mirror',
      '$prenom',
      '$nom',
      '$campaign',
      '$subscription_name',
      '$investamount',
      '$date',
    ],
    proposedVariables: [REMAINING, CALL_REF],
    fr: {
      subject: '$campaign - Rappel : appel de fonds de $investamount en attente sur vos souscriptions',
      html: html('fr', [
        '<p>Bonjour $prenom $nom,</p>',
        "<p>Sauf erreur de notre part, le règlement de l'appel de fonds du fonds <strong>$campaign</strong>, qui couvre plusieurs de vos souscriptions ($subscription_name), reste en attente. Le montant total appelé s'élève à :</p>",
        highlight('$investamount'),
        '<p>La date limite de règlement était fixée au <strong>$date</strong>. Nous vous remercions de procéder au virement dans les meilleurs délais, en indiquant la référence <strong>$call_reference</strong>. Les avis joints à ce message rappellent, pour chacune de vos souscriptions, le montant appelé et les instructions de règlement.</p>',
        '<p>Si votre virement a été émis récemment, veuillez ne pas tenir compte de ce message.</p>',
        cta('$url', 'Consulter mon espace investisseur'),
        '<p>Notre équipe se tient à votre disposition pour toute question sur cet appel de fonds.</p>',
      ]),
    },
    en: {
      subject:
        '$campaign - Reminder: capital call of $investamount awaiting payment across your subscriptions',
      html: html('en', [
        '<p>Dear $prenom $nom,</p>',
        '<p>According to our records, the payment of the capital call issued by the fund <strong>$campaign</strong>, covering several of your subscriptions ($subscription_name), is still pending. The total amount called is:</p>',
        highlight('$investamount'),
        '<p>The payment deadline was set to <strong>$date</strong>. Please arrange the wire transfer as soon as possible, quoting the reference <strong>$call_reference</strong>. The notices attached to this message detail, for each of your subscriptions, the amount called and the payment instructions.</p>',
        '<p>If your transfer has been issued recently, please disregard this message.</p>',
        cta('$url', 'Access my investor portal'),
        '<p>Our team remains available for any question regarding this capital call.</p>',
      ]),
    },
  },
  {
    slug: 'confirmation-appel',
    name: 'Confirmation de réception du paiement',
    section: 'capitalCalls',
    recipient: 'investor',
    trigger: 'auto',
    origin:
      "Envoi automatique quand le gestionnaire valide le paiement d'un appel de fonds, saisie de la date de paiement à l'unité ou en masse, ou à l'encaissement du prélèvement",
    variables: [
      '$logo',
      '$appname',
      '$url',
      '$year',
      '$mirror',
      '$investor.firstname',
      '$investor.lastname',
      '$callname',
      '$campaign',
      '$subscription_name',
    ],
    proposedVariables: [
      { name: '$investamount', note: "montant reçu, non passé à ce point d'appel" },
      {
        name: '$payment_date',
        note: "date de paiement saisie par le gestionnaire, connue au point d'appel mais non passée",
      },
    ],
    fr: {
      subject: "$campaign - Votre paiement d'appel de fonds est bien reçu",
      html: html('fr', [
        '<p>Bonjour $investor.firstname $investor.lastname,</p>',
        "<p>Nous vous confirmons la bonne réception de votre paiement de <strong>$investamount</strong> au titre de l'appel de fonds <strong>$callname</strong> du fonds <strong>$campaign</strong>, pour votre souscription <strong>$subscription_name</strong>.</p>",
        "<p>Votre situation a été mise à jour dans votre espace investisseur. Aucune action n'est attendue de votre part.</p>",
        cta('$url', 'Consulter mon espace investisseur'),
        '<p>Nous vous remercions de votre confiance.</p>',
      ]),
    },
    en: {
      subject: '$campaign - Your capital call payment has been received',
      html: html('en', [
        '<p>Dear $investor.firstname $investor.lastname,</p>',
        '<p>We confirm the receipt of your payment of <strong>$investamount</strong> under the capital call <strong>$callname</strong> issued by the fund <strong>$campaign</strong>, for your subscription <strong>$subscription_name</strong>.</p>',
        '<p>Your position has been updated in your investor portal. No action is required on your side.</p>',
        cta('$url', 'Access my investor portal'),
        '<p>Thank you for your trust.</p>',
      ]),
    },
  },
];
