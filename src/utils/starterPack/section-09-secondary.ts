import { cta, html, table } from './blocks';
import type { ProposedVariable, StarterPackTemplate } from './types';

/**
 * Section 9 : Marché secondaire — page Confluence 931102722.
 *
 * Création et acceptation d'une offre de vente, dépôt et annulation d'intentions
 * d'achat, puis validation de la cession par la société de gestion avec transfert
 * des parts du vendeur vers l'acheteur.
 */

const TRANSFER_COUNT: ProposedVariable = {
  name: '$transfer_shares_count',
  note: 'nombre de parts effectivement cédées si la cession est partielle',
};

export const SECTION_09_SECONDARY: StarterPackTemplate[] = [
  {
    slug: 'secondary-market-offer-acceptance',
    name: "Mise en vente à valider par l'investisseur",
    section: 'secondary',
    recipient: 'investor',
    trigger: 'auto',
    origin:
      "Création ou modification d'une offre de vente pour le compte de l'investisseur par un distributeur ou un utilisateur GP. L'offre ne devient active qu'après accord de l'investisseur",
    variables: [
      '$logo',
      '$appname',
      '$year',
      '$mirror',
      '$investor_firstname',
      '$investor_lastname',
      '$creator_firstname',
      '$creator_lastname',
      '$subscription_reference',
      '$share_name',
      '$acceptation_link',
      '$declination_link',
      '$campaign.name',
    ],
    proposedVariables: [
      {
        name: '$shares_count',
        note: "nombre de parts mises en vente, connu de l'offre mais non passé à ce gabarit alors qu'il l'est aux autres gabarits du module",
      },
    ],
    fr: {
      subject: 'Mise en vente de vos parts $share_name : votre accord est requis',
      html: html('fr', [
        '<p>Bonjour $investor_firstname $investor_lastname,</p>',
        '<p>$creator_firstname $creator_lastname a préparé pour votre compte une offre de vente de vos parts <strong>$share_name</strong>, au titre de votre souscription <strong>$subscription_reference</strong>, sur le marché secondaire du fonds <strong>$campaign.name</strong>.</p>',
        "<p>Cette mise en vente ne sera publiée qu'avec votre accord. Sans action de votre part, elle reste en attente.</p>",
        cta('$acceptation_link', 'Accepter la mise en vente'),
        '<p>Si vous ne souhaitez pas vendre vos parts, vous pouvez <a href="$declination_link">refuser cette mise en vente</a> : l\'offre sera alors supprimée et son créateur en sera informé.</p>',
      ]),
    },
    en: {
      subject: 'Sale of your $share_name shares: your approval is required',
      html: html('en', [
        '<p>Dear $investor_firstname $investor_lastname,</p>',
        '<p>$creator_firstname $creator_lastname has prepared on your behalf a sale offer for your <strong>$share_name</strong> shares, under your subscription <strong>$subscription_reference</strong>, on the secondary market of the fund <strong>$campaign.name</strong>.</p>',
        '<p>This sale offer will only be published with your approval. Without action on your side, it remains pending.</p>',
        cta('$acceptation_link', 'Approve the sale offer'),
        '<p>If you do not wish to sell your shares, you can <a href="$declination_link">decline this sale offer</a>: the offer will then be deleted and its creator notified.</p>',
      ]),
    },
  },
  {
    slug: 'secondary-market-offer-decline',
    name: "Mise en vente refusée par l'investisseur",
    section: 'secondary',
    recipient: 'partner',
    trigger: 'auto',
    origin:
      "Refus par l'investisseur de l'offre de vente créée pour son compte. L'offre est supprimée et son créateur notifié",
    variables: [
      '$logo',
      '$appname',
      '$url',
      '$year',
      '$mirror',
      '$investor_fullname',
      '$shares_count',
      '$fund_name',
    ],
    proposedVariables: [],
    fr: {
      subject: 'Mise en vente refusée par $investor_fullname - $fund_name',
      html: html('fr', [
        '<p>Bonjour,</p>',
        "<p><strong>$investor_fullname</strong> a refusé l'offre de vente que vous aviez créée pour son compte sur le marché secondaire du fonds <strong>$fund_name</strong>, portant sur <strong>$shares_count parts</strong>.</p>",
        "<p>L'offre a été supprimée. Aucune action n'est requise de votre part.</p>",
        "<p>Si la mise en vente reste d'actualité, nous vous invitons à échanger avec l'investisseur avant de créer une nouvelle offre.</p>",
        cta('$url', 'Accéder à la plateforme'),
      ]),
    },
    en: {
      subject: 'Sale offer declined by $investor_fullname - $fund_name',
      html: html('en', [
        '<p>Hello,</p>',
        '<p><strong>$investor_fullname</strong> has declined the sale offer you created on their behalf on the secondary market of the fund <strong>$fund_name</strong>, covering <strong>$shares_count shares</strong>.</p>',
        '<p>The offer has been deleted. No action is required on your side.</p>',
        '<p>If the sale is still relevant, we suggest discussing it with the investor before creating a new offer.</p>',
        cta('$url', 'Access the platform'),
      ]),
    },
  },
  {
    slug: 'secondary-market-new-offer-notification-seller',
    name: 'Confirmation de mise en vente',
    section: 'secondary',
    recipient: 'investor',
    trigger: 'auto',
    origin:
      "Création d'une offre de vente par l'investisseur depuis son espace. L'offre est publiée sur le marché secondaire du fonds",
    variables: [
      '$logo',
      '$appname',
      '$url',
      '$year',
      '$mirror',
      '$investor_fullname',
      '$shares_count',
      '$fund_name',
    ],
    proposedVariables: [
      {
        name: '$share_name',
        note: "nom de la part mise en vente, connu au point d'appel mais non passé au gabarit",
      },
    ],
    fr: {
      subject: 'Votre offre de vente sur $fund_name est publiée',
      html: html('fr', [
        '<p>Bonjour $investor_fullname,</p>',
        '<p>Votre offre de vente portant sur <strong>$shares_count parts</strong> du fonds <strong>$fund_name</strong> a bien été enregistrée. Elle est désormais visible des acheteurs potentiels sur le marché secondaire.</p>',
        "<p>Vous serez notifié par email à chaque intention d'achat déposée sur votre offre. La cession ne sera définitive qu'après validation par la société de gestion.</p>",
        cta('$url', 'Suivre mon offre'),
        "<p>Vous pouvez modifier ou retirer votre offre à tout moment depuis votre espace, tant qu'aucune cession n'a été validée.</p>",
      ]),
    },
    en: {
      subject: 'Your sale offer on $fund_name is published',
      html: html('en', [
        '<p>Dear $investor_fullname,</p>',
        '<p>Your sale offer covering <strong>$shares_count shares</strong> of the fund <strong>$fund_name</strong> has been registered. It is now visible to potential buyers on the secondary market.</p>',
        '<p>You will be notified by email each time a purchase intent is placed on your offer. The transfer will only be final once validated by the management company.</p>',
        cta('$url', 'Track my offer'),
        '<p>You can update or withdraw your offer at any time from your portal, as long as no transfer has been validated.</p>',
      ]),
    },
  },
  {
    slug: 'secondary-market-new-offer-notification-onboarding-contact',
    name: 'Nouvelle offre publiée, alerte gestionnaire',
    section: 'secondary',
    recipient: 'team',
    trigger: 'auto',
    origin:
      "Publication d'une offre de vente sur le marché secondaire du fonds. Envoi au contact de notification paramétré sur le fonds",
    variables: [
      '$logo',
      '$appname',
      '$url',
      '$year',
      '$mirror',
      '$investor_fullname',
      '$shares_count',
      '$fund_name',
      '$subscription.name',
    ],
    proposedVariables: [
      {
        name: '$link',
        note: "lien direct vers l'écran Marché secondaire du back office, non passé au gabarit",
      },
    ],
    fr: {
      subject: 'Nouvelle offre de vente sur $fund_name - $investor_fullname',
      html: html('fr', [
        '<p>Bonjour,</p>',
        "<p>Une nouvelle offre de vente vient d'être publiée sur le marché secondaire du fonds <strong>$fund_name</strong> :</p>",
        table([
          ['Vendeur', '<strong>$investor_fullname</strong>'],
          ['Souscription', '$subscription.name'],
          ['Nombre de parts mises en vente', '<strong>$shares_count</strong>'],
        ]),
        "<p>Les intentions d'achat déposées sur cette offre devront être validées avant que la cession ne soit actée.</p>",
        cta('$url', 'Consulter le marché secondaire'),
      ]),
    },
    en: {
      subject: 'New sale offer on $fund_name - $investor_fullname',
      html: html('en', [
        '<p>Hello,</p>',
        '<p>A new sale offer has just been published on the secondary market of the fund <strong>$fund_name</strong>:</p>',
        table([
          ['Seller', '<strong>$investor_fullname</strong>'],
          ['Subscription', '$subscription.name'],
          ['Number of shares for sale', '<strong>$shares_count</strong>'],
        ]),
        '<p>Purchase intents placed on this offer will require validation before the transfer is completed.</p>',
        cta('$url', 'View the secondary market'),
      ]),
    },
  },
  {
    slug: 'secondary-market-new-bid-notification-seller',
    name: "Nouvelle intention d'achat reçue",
    section: 'secondary',
    recipient: 'investor',
    trigger: 'auto',
    origin:
      "Dépôt d'une intention d'achat par un acheteur sur l'offre de vente de l'investisseur",
    variables: [
      '$logo',
      '$appname',
      '$url',
      '$year',
      '$mirror',
      '$investor_fullname',
      '$buyer_fullname',
      '$shares_count',
      '$fund_name',
    ],
    proposedVariables: [
      {
        name: '$bid_shares_count',
        note: "nombre de parts visé par l'intention d'achat, qui peut différer du total de l'offre",
      },
      { name: '$bid_amount', note: "montant proposé par l'acheteur" },
    ],
    fr: {
      subject: "Nouvelle intention d'achat sur votre offre $fund_name",
      html: html('fr', [
        '<p>Bonjour $investor_fullname,</p>',
        "<p><strong>$buyer_fullname</strong> vient de déposer une intention d'achat sur votre offre de vente portant sur <strong>$shares_count parts</strong> du fonds <strong>$fund_name</strong>.</p>",
        "<p>La cession devra être validée par la société de gestion avant que le transfert de vos parts ne soit acté. Vous serez informé par email de la suite donnée à cette intention d'achat.</p>",
        cta('$url', 'Consulter mon offre'),
        '<p>Notre équipe se tient à votre disposition pour toute question sur cette opération.</p>',
      ]),
    },
    en: {
      subject: 'New purchase intent on your $fund_name sale offer',
      html: html('en', [
        '<p>Dear $investor_fullname,</p>',
        '<p><strong>$buyer_fullname</strong> has just placed a purchase intent on your sale offer covering <strong>$shares_count shares</strong> of the fund <strong>$fund_name</strong>.</p>',
        '<p>The transfer must be validated by the management company before your shares are actually transferred. You will be informed by email of the outcome of this purchase intent.</p>',
        cta('$url', 'View my offer'),
        '<p>Our team remains available for any question regarding this transaction.</p>',
      ]),
    },
  },
  {
    slug: 'secondary-market-cancel-bid-notification-seller',
    name: "Intention d'achat annulée, avis au vendeur",
    section: 'secondary',
    recipient: 'investor',
    trigger: 'auto',
    origin:
      "Annulation d'une intention d'achat déposée sur l'offre de l'investisseur. Les parts concernées sont remises à disposition sur le marché",
    variables: [
      '$logo',
      '$appname',
      '$url',
      '$year',
      '$mirror',
      '$investor_fullname',
      '$shares_count',
      '$fund_name',
    ],
    proposedVariables: [
      {
        name: '$buyer_fullname',
        note: "identité de l'acheteur, passée au gabarit de nouvelle intention mais pas à celui-ci",
      },
    ],
    fr: {
      subject: "Une intention d'achat sur votre offre $fund_name a été annulée",
      html: html('fr', [
        '<p>Bonjour $investor_fullname,</p>',
        "<p>Une intention d'achat déposée sur votre offre de vente portant sur <strong>$shares_count parts</strong> du fonds <strong>$fund_name</strong> vient d'être annulée.</p>",
        '<p>Les parts concernées sont de nouveau disponibles à la vente sur le marché secondaire. Votre offre reste publiée et visible des acheteurs potentiels.</p>',
        cta('$url', 'Consulter mon offre'),
        "<p>Aucune action n'est requise de votre part.</p>",
      ]),
    },
    en: {
      subject: 'A purchase intent on your $fund_name sale offer has been cancelled',
      html: html('en', [
        '<p>Dear $investor_fullname,</p>',
        '<p>A purchase intent placed on your sale offer covering <strong>$shares_count shares</strong> of the fund <strong>$fund_name</strong> has just been cancelled.</p>',
        '<p>The corresponding shares are available for sale again on the secondary market. Your offer remains published and visible to potential buyers.</p>',
        cta('$url', 'View my offer'),
        '<p>No action is required on your side.</p>',
      ]),
    },
  },
  {
    slug: 'secondary-market-cancel-bid-notification-buyer',
    name: "Intention d'achat annulée, avis à l'acheteur",
    section: 'secondary',
    recipient: 'investor',
    trigger: 'auto',
    origin:
      "Annulation d'une intention d'achat. La souscription en cours associée est retirée",
    variables: [
      '$logo',
      '$appname',
      '$url',
      '$year',
      '$mirror',
      '$investor_fullname',
      '$shares_count',
      '$fund_name',
    ],
    proposedVariables: [],
    fr: {
      subject: 'Votre intention d\'achat sur $fund_name a été annulée',
      html: html('fr', [
        '<p>Bonjour $investor_fullname,</p>',
        "<p>Votre intention d'achat déposée sur une offre de vente du fonds <strong>$fund_name</strong>, portant sur <strong>$shares_count parts</strong>, vient d'être annulée.</p>",
        "<p>La souscription en cours associée à cette intention d'achat a été retirée. Aucun montant ne vous sera prélevé.</p>",
        "<p>Vous pouvez consulter les offres disponibles sur le marché secondaire et déposer une nouvelle intention d'achat à tout moment.</p>",
        cta('$url', 'Consulter le marché secondaire'),
      ]),
    },
    en: {
      subject: 'Your purchase intent on $fund_name has been cancelled',
      html: html('en', [
        '<p>Dear $investor_fullname,</p>',
        '<p>Your purchase intent placed on a sale offer of the fund <strong>$fund_name</strong>, covering <strong>$shares_count shares</strong>, has just been cancelled.</p>',
        '<p>The pending subscription linked to this purchase intent has been withdrawn. No amount will be charged to you.</p>',
        '<p>You can browse the offers available on the secondary market and place a new purchase intent at any time.</p>',
        cta('$url', 'View the secondary market'),
      ]),
    },
  },
  {
    slug: 'secondary-market-validate-bid-notification-seller',
    name: 'Cession validée, confirmation au vendeur',
    section: 'secondary',
    recipient: 'investor',
    trigger: 'manual',
    origin:
      "Validation de l'intention d'achat par la société de gestion. Le transfert des parts du vendeur vers l'acheteur est acté",
    variables: [
      '$logo',
      '$appname',
      '$url',
      '$year',
      '$mirror',
      '$investor_fullname',
      '$shares_count',
      '$fund_name',
    ],
    proposedVariables: [TRANSFER_COUNT, { name: '$transfer_amount', note: 'montant de la cession' }],
    fr: {
      subject: 'Cession validée : vos parts $fund_name ont été transférées',
      html: html('fr', [
        '<p>Bonjour $investor_fullname,</p>',
        "<p>La société de gestion a validé l'intention d'achat déposée sur votre offre de vente portant sur <strong>$shares_count parts</strong> du fonds <strong>$fund_name</strong>.</p>",
        "<p>La cession est actée : le transfert des parts vers l'acheteur a été enregistré et votre position a été mise à jour dans votre espace.</p>",
        cta('$url', 'Consulter mon espace investisseur'),
        '<p>Notre équipe se tient à votre disposition pour toute question sur cette cession.</p>',
      ]),
    },
    en: {
      subject: 'Transfer validated: your $fund_name shares have been transferred',
      html: html('en', [
        '<p>Dear $investor_fullname,</p>',
        '<p>The management company has validated the purchase intent placed on your sale offer covering <strong>$shares_count shares</strong> of the fund <strong>$fund_name</strong>.</p>',
        '<p>The transfer is complete: the shares have been transferred to the buyer and your position has been updated in your portal.</p>',
        cta('$url', 'Access my investor portal'),
        '<p>Our team remains available for any question regarding this transfer.</p>',
      ]),
    },
  },
  {
    slug: 'secondary-market-validate-bid-notification-buyer',
    name: "Acquisition validée, confirmation à l'acheteur",
    section: 'secondary',
    recipient: 'investor',
    trigger: 'manual',
    origin:
      "Validation de l'intention d'achat par la société de gestion. Le transfert des parts du vendeur vers l'acheteur est acté",
    variables: [
      '$logo',
      '$appname',
      '$url',
      '$year',
      '$mirror',
      '$investor_fullname',
      '$buyer_fullname',
      '$shares_count',
      '$fund_name',
    ],
    proposedVariables: [
      {
        name: '$transfer_shares_count',
        note: 'nombre de parts effectivement acquises si la cession est partielle',
      },
      { name: '$transfer_amount', note: "montant de l'acquisition" },
    ],
    fr: {
      subject: 'Votre acquisition de parts $fund_name est validée',
      html: html('fr', [
        '<p>Bonjour $buyer_fullname,</p>',
        "<p>La société de gestion a validé votre intention d'achat portant sur les parts mises en vente par <strong>$investor_fullname</strong> sur le marché secondaire du fonds <strong>$fund_name</strong> (offre de <strong>$shares_count parts</strong>).</p>",
        '<p>La cession est actée : les parts acquises ont été transférées à votre nom et votre souscription est désormais visible dans votre espace investisseur.</p>',
        cta('$url', 'Consulter mon espace investisseur'),
        '<p>Notre équipe se tient à votre disposition pour toute question sur cette acquisition.</p>',
      ]),
    },
    en: {
      subject: 'Your purchase of $fund_name shares is validated',
      html: html('en', [
        '<p>Dear $buyer_fullname,</p>',
        '<p>The management company has validated your purchase intent regarding the shares put up for sale by <strong>$investor_fullname</strong> on the secondary market of the fund <strong>$fund_name</strong> (offer of <strong>$shares_count shares</strong>).</p>',
        '<p>The transfer is complete: the acquired shares have been registered in your name and your subscription is now visible in your investor portal.</p>',
        cta('$url', 'Access my investor portal'),
        '<p>Our team remains available for any question regarding this purchase.</p>',
      ]),
    },
  },
];
