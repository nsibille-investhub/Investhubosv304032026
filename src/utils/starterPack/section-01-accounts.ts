import { centered, code, cta, html, quote } from './blocks';
import type { StarterPackTemplate } from './types';

/**
 * Section 1 : Comptes et accès — page Confluence 931069954.
 *
 * Création de compte, authentification et sécurité : premiers accès investisseur,
 * distributeur et back office, réinitialisation de mot de passe, double
 * authentification, connexion sans mot de passe, vérification et changement
 * d'adresse email, création et validation d'utilisateurs secondaires.
 */
export const SECTION_01_ACCOUNTS: StarterPackTemplate[] = [
  {
    slug: 'investor-initiate-password',
    name: "Création du mot de passe d'un investisseur",
    section: 'accounts',
    recipient: 'investor',
    trigger: 'manual',
    origin:
      "Création ou modification d'une fiche investisseur dans le back office avec la case d'envoi de mail cochée. Si un SSO investisseur est configuré, le lien pointe vers la page de connexion SSO",
    variables: ['$logo', '$appname', '$url', '$year', '$mirror', '$prenom', '$nom', '$reset_url'],
    proposedVariables: [],
    fr: {
      subject: 'Activez votre acces a votre espace investisseur $appname',
      html: html('fr', [
        '<p>Bonjour $prenom $nom,</p>',
        "<p>Votre espace investisseur <strong>$appname</strong> vient d'être créé. Pour y accéder, il ne vous reste qu'à définir votre mot de passe.</p>",
        cta('$reset_url', 'Créer mon mot de passe'),
        '<p>Ce lien est valable jusqu\'à la fin de la journée. Passé ce délai, vous pourrez demander un nouveau lien depuis la page "Mot de passe oublié" de votre espace.</p>',
        '<p>Vous pourrez ensuite consulter vos souscriptions, vos documents et suivre vos investissements.</p>',
        '<p>Si vous pensez avoir reçu ce message par erreur, contactez-nous à $mail_support.</p>',
      ]),
    },
    en: {
      subject: 'Activate your access to your $appname investor portal',
      html: html('en', [
        '<p>Dear $prenom $nom,</p>',
        '<p>Your <strong>$appname</strong> investor portal has been created. To access it, you simply need to set your password.</p>',
        cta('$reset_url', 'Set my password'),
        '<p>This link is valid until the end of the day. After that, you can request a new one from the "Forgotten password" page of the portal.</p>',
        '<p>You will then be able to review your subscriptions, access your documents and monitor your investments.</p>',
        '<p>If you believe you received this message in error, please contact us at $mail_support.</p>',
      ]),
    },
  },
  {
    slug: 'partner-initiate-password',
    name: "Création du mot de passe d'un distributeur",
    section: 'accounts',
    recipient: 'partner',
    trigger: 'manual',
    origin:
      "Création ou modification depuis le back office d'un utilisateur rattaché à un distributeur, avec la case d'envoi de mail cochée",
    variables: ['$logo', '$appname', '$url', '$year', '$mirror', '$prenom', '$nom', '$reset_url'],
    proposedVariables: [
      {
        name: '$partner_name',
        note: "nom du cabinet distributeur, connu au point d'appel via l'objet partneruser mais non passé",
      },
    ],
    fr: {
      subject: 'Activez votre acces a votre espace distributeur $appname',
      html: html('fr', [
        '<p>Bonjour $prenom $nom,</p>',
        "<p>Votre accès à l'espace distributeur <strong>$appname</strong> vient d'être créé. Pour l'activer, il ne vous reste qu'à définir votre mot de passe.</p>",
        cta('$reset_url', 'Créer mon mot de passe'),
        '<p>Ce lien est valable jusqu\'à la fin de la journée. Passé ce délai, vous pourrez demander un nouveau lien depuis la page "Mot de passe oublié" de l\'espace.</p>',
        '<p>Vous pourrez ensuite suivre vos investisseurs, leurs souscriptions et accéder aux documents mis à votre disposition.</p>',
        '<p>Si vous pensez avoir reçu ce message par erreur, contactez-nous à $mail_support.</p>',
      ]),
    },
    en: {
      subject: 'Activate your access to your $appname distributor portal',
      html: html('en', [
        '<p>Dear $prenom $nom,</p>',
        '<p>Your access to the <strong>$appname</strong> distributor portal has been created. To activate it, you simply need to set your password.</p>',
        cta('$reset_url', 'Set my password'),
        '<p>This link is valid until the end of the day. After that, you can request a new one from the "Forgotten password" page of the portal.</p>',
        '<p>You will then be able to monitor your investors, their subscriptions and access the documents made available to you.</p>',
        '<p>If you believe you received this message in error, please contact us at $mail_support.</p>',
      ]),
    },
  },
  {
    slug: 'user-initiate-password',
    name: "Création du mot de passe d'un utilisateur back office",
    section: 'accounts',
    recipient: 'team',
    trigger: 'manual',
    origin:
      "Création ou modification d'un utilisateur back office (Paramètres, Utilisateurs) avec la case d'envoi de mail cochée. Si un SSO est configuré pour les utilisateurs internes, le lien pointe vers la page de connexion SSO",
    variables: ['$logo', '$appname', '$url', '$year', '$mirror', '$prenom', '$nom', '$reset_url'],
    proposedVariables: [],
    fr: {
      subject: 'Activez votre acces a la plateforme de gestion $appname',
      html: html('fr', [
        '<p>Bonjour $prenom $nom,</p>',
        "<p>Votre compte utilisateur sur la plateforme de gestion <strong>$appname</strong> vient d'être créé. Pour l'activer, définissez votre mot de passe en cliquant sur le bouton ci-dessous.</p>",
        cta('$reset_url', 'Créer mon mot de passe'),
        '<p>Ce lien est valable jusqu\'à la fin de la journée. Passé ce délai, vous pourrez demander un nouveau lien depuis la page "Mot de passe oublié" de la plateforme.</p>',
        '<p>Si vous pensez avoir reçu ce message par erreur, contactez-nous à $mail_support.</p>',
      ]),
    },
    en: {
      subject: 'Activate your access to the $appname management platform',
      html: html('en', [
        '<p>Dear $prenom $nom,</p>',
        '<p>Your user account on the <strong>$appname</strong> management platform has been created. To activate it, set your password by clicking the button below.</p>',
        cta('$reset_url', 'Set my password'),
        '<p>This link is valid until the end of the day. After that, you can request a new one from the "Forgotten password" page of the platform.</p>',
        '<p>If you believe you received this message in error, please contact us at $mail_support.</p>',
      ]),
    },
  },
  {
    slug: 'password-adminsend',
    name: "Envoi d'un lien de mot de passe par le back office",
    section: 'accounts',
    recipient: 'investor',
    trigger: 'manual',
    origin:
      "Une équipe interne sélectionne un ou plusieurs investisseurs dans la liste des investisseurs et déclenche l'envoi d'un lien de réinitialisation. Non envoyé si l'authentification Auth0 est active, Auth0 envoyant alors son propre mail",
    variables: ['$logo', '$appname', '$url', '$year', '$mirror', '$prenom', '$nom', '$reset_url'],
    proposedVariables: [],
    fr: {
      subject: 'Réinitialisez votre mot de passe $appname',
      html: html('fr', [
        '<p>Bonjour $prenom $nom,</p>',
        "<p>L'équipe <strong>$appname</strong> vous a envoyé un lien pour définir un nouveau mot de passe sur votre espace investisseur.</p>",
        cta('$reset_url', 'Définir mon mot de passe'),
        '<p>Ce lien est valable jusqu\'à la fin de la journée. Passé ce délai, vous pourrez demander un nouveau lien depuis la page "Mot de passe oublié" de votre espace.</p>',
        "<p>Si vous n'êtes pas à l'origine de cette demande, ignorez ce message : votre mot de passe actuel reste inchangé.</p>",
      ]),
    },
    en: {
      subject: 'Reset your $appname password',
      html: html('en', [
        '<p>Dear $prenom $nom,</p>',
        '<p>The <strong>$appname</strong> team has sent you a link to set a new password for your investor portal.</p>',
        cta('$reset_url', 'Set my password'),
        '<p>This link is valid until the end of the day. After that, you can request a new one from the "Forgotten password" page of the portal.</p>',
        '<p>If you did not request this change, please ignore this message: your current password remains unchanged.</p>',
      ]),
    },
  },
  {
    slug: 'password-reset',
    name: 'Réinitialisation de mot de passe espace investisseur',
    section: 'accounts',
    recipient: 'investor',
    trigger: 'auto',
    origin:
      'Un investisseur ou un de ses contacts habilités demande la réinitialisation depuis la page "Mot de passe oublié" de l\'espace investisseur',
    variables: ['$logo', '$appname', '$url', '$year', '$mirror', '$prenom', '$nom', '$reset_url'],
    proposedVariables: [],
    fr: {
      subject: 'Réinitialisation de votre mot de passe $appname',
      html: html('fr', [
        '<p>Bonjour $prenom $nom,</p>',
        '<p>Nous avons reçu une demande de réinitialisation du mot de passe associé à cette adresse email sur votre espace investisseur <strong>$appname</strong>.</p>',
        cta('$reset_url', 'Réinitialiser mon mot de passe'),
        '<p>Ce lien est valable jusqu\'à la fin de la journée. Passé ce délai, il vous suffira de refaire une demande depuis la page "Mot de passe oublié".</p>',
        "<p>Si vous n'êtes pas à l'origine de cette demande, ignorez ce message : votre mot de passe actuel reste inchangé.</p>",
      ]),
    },
    en: {
      subject: 'Reset your $appname password',
      html: html('en', [
        '<p>Dear $prenom $nom,</p>',
        '<p>We received a request to reset the password associated with this email address on your <strong>$appname</strong> investor portal.</p>',
        cta('$reset_url', 'Reset my password'),
        '<p>This link is valid until the end of the day. After that, simply submit a new request from the "Forgotten password" page.</p>',
        '<p>If you did not request this change, please ignore this message: your current password remains unchanged.</p>',
      ]),
    },
  },
  {
    slug: 'password-reset-admin',
    name: 'Réinitialisation de mot de passe back office',
    section: 'accounts',
    recipient: 'team',
    trigger: 'auto',
    origin:
      'Un utilisateur du back office demande la réinitialisation depuis la page "Mot de passe oublié" de la plateforme de gestion. Bloqué si le domaine email de l\'utilisateur est couvert par un SSO',
    variables: ['$logo', '$appname', '$url', '$year', '$mirror', '$prenom', '$nom', '$reset_url'],
    proposedVariables: [],
    fr: {
      subject: 'Réinitialisation de votre mot de passe $appname',
      html: html('fr', [
        '<p>Bonjour $prenom $nom,</p>',
        '<p>Nous avons reçu une demande de réinitialisation de votre mot de passe sur la plateforme de gestion <strong>$appname</strong>.</p>',
        cta('$reset_url', 'Réinitialiser mon mot de passe'),
        '<p>Ce lien est valable jusqu\'à la fin de la journée. Passé ce délai, il vous suffira de refaire une demande depuis la page "Mot de passe oublié".</p>',
        "<p>Si vous n'êtes pas à l'origine de cette demande, ignorez ce message et signalez-le à $mail_support : votre mot de passe actuel reste inchangé.</p>",
      ]),
    },
    en: {
      subject: 'Reset your $appname password',
      html: html('en', [
        '<p>Dear $prenom $nom,</p>',
        '<p>We received a request to reset your password on the <strong>$appname</strong> management platform.</p>',
        cta('$reset_url', 'Reset my password'),
        '<p>This link is valid until the end of the day. After that, simply submit a new request from the "Forgotten password" page.</p>',
        '<p>If you did not request this change, please ignore this message and report it to $mail_support: your current password remains unchanged.</p>',
      ]),
    },
  },
  {
    slug: 'password-reset-partner',
    name: 'Réinitialisation de mot de passe espace distributeur',
    section: 'accounts',
    recipient: 'partner',
    trigger: 'auto',
    origin:
      'Un distributeur ou un de ses utilisateurs demande la réinitialisation depuis la page "Mot de passe oublié" de l\'espace distributeur. Soumis aux restrictions d\'accès par segment',
    variables: [
      '$logo',
      '$appname',
      '$url',
      '$year',
      '$mirror',
      '$prenom',
      '$nom',
      '$partner',
      '$reset_url',
    ],
    proposedVariables: [],
    fr: {
      subject: 'Réinitialisation de votre mot de passe $appname',
      html: html('fr', [
        '<p>Bonjour $prenom $nom,</p>',
        "<p>Nous avons reçu une demande de réinitialisation de votre mot de passe sur l'espace distributeur <strong>$appname</strong>, au titre de votre accès <strong>$partner</strong>.</p>",
        cta('$reset_url', 'Réinitialiser mon mot de passe'),
        '<p>Ce lien est valable jusqu\'à la fin de la journée. Passé ce délai, il vous suffira de refaire une demande depuis la page "Mot de passe oublié".</p>',
        "<p>Si vous n'êtes pas à l'origine de cette demande, ignorez ce message : votre mot de passe actuel reste inchangé.</p>",
      ]),
    },
    en: {
      subject: 'Reset your $appname password',
      html: html('en', [
        '<p>Dear $prenom $nom,</p>',
        '<p>We received a request to reset your password on the <strong>$appname</strong> distributor portal, for your <strong>$partner</strong> access.</p>',
        cta('$reset_url', 'Reset my password'),
        '<p>This link is valid until the end of the day. After that, simply submit a new request from the "Forgotten password" page.</p>',
        '<p>If you did not request this change, please ignore this message: your current password remains unchanged.</p>',
      ]),
    },
  },
  {
    slug: 'mfa-code',
    name: 'Code de connexion à usage unique espace investisseur',
    section: 'accounts',
    recipient: 'investor',
    trigger: 'auto',
    origin:
      "Connexion à l'espace investisseur avec double authentification par email active, pour un investisseur ou un de ses contacts habilités. Le code expire au bout de 10 minutes",
    variables: ['$logo', '$appname', '$url', '$year', '$mirror', '$code'],
    proposedVariables: [],
    fr: {
      subject: '$code est votre code de connexion $appname',
      html: html('fr', [
        '<p>Bonjour,</p>',
        '<p>Voici votre code de connexion à votre espace investisseur <strong>$appname</strong> :</p>',
        code(),
        "<p>Ce code est valable 10 minutes. Saisissez-le sur l'écran de connexion pour finaliser votre authentification.</p>",
        "<p>Si vous n'êtes pas à l'origine de cette demande de connexion, ne communiquez ce code à personne et signalez-le à $mail_support.</p>",
      ]),
    },
    en: {
      subject: '$code is your $appname login code',
      html: html('en', [
        '<p>Hello,</p>',
        '<p>Here is your login code for your <strong>$appname</strong> investor portal:</p>',
        code(),
        '<p>This code is valid for 10 minutes. Enter it on the login screen to complete your authentication.</p>',
        '<p>If you did not request this login, do not share this code with anyone and report it to $mail_support.</p>',
      ]),
    },
  },
  {
    slug: 'mfa-code-admin',
    name: 'Code de connexion à usage unique back office',
    section: 'accounts',
    recipient: 'team',
    trigger: 'auto',
    origin:
      "Connexion d'un utilisateur back office soumis à la double authentification, quand son format MFA est l'email. Le code expire au bout de 10 minutes",
    variables: ['$logo', '$appname', '$url', '$year', '$mirror', '$code'],
    proposedVariables: [],
    fr: {
      subject: '$code est votre code de connexion $appname',
      html: html('fr', [
        '<p>Bonjour,</p>',
        '<p>Voici votre code de connexion à la plateforme de gestion <strong>$appname</strong> :</p>',
        code(),
        "<p>Ce code est valable 10 minutes. Saisissez-le sur l'écran de connexion pour finaliser votre authentification.</p>",
        "<p>Si vous n'êtes pas à l'origine de cette demande de connexion, ne communiquez ce code à personne et signalez-le à $mail_support.</p>",
      ]),
    },
    en: {
      subject: '$code is your $appname login code',
      html: html('en', [
        '<p>Hello,</p>',
        '<p>Here is your login code for the <strong>$appname</strong> management platform:</p>',
        code(),
        '<p>This code is valid for 10 minutes. Enter it on the login screen to complete your authentication.</p>',
        '<p>If you did not request this login, do not share this code with anyone and report it to $mail_support.</p>',
      ]),
    },
  },
  {
    slug: 'magiclink',
    name: 'Lien de connexion sans mot de passe',
    section: 'accounts',
    recipient: 'investor',
    trigger: 'auto',
    origin:
      "Un investisseur, ou un autre profil éligible, saisit son email sur le formulaire de connexion sans mot de passe. Le lien expire au bout de 10 minutes, est à usage unique et n'est utilisable que depuis l'adresse IP qui l'a demandé, sauf paramétrage contraire",
    variables: ['$logo', '$appname', '$url', '$year', '$mirror', '$link'],
    proposedVariables: [
      {
        name: '$prenom',
        note: "identité du destinataire, connue de l'objet utilisateur au point d'appel mais non passée au gabarit",
      },
      {
        name: '$nom',
        note: "identité du destinataire, connue de l'objet utilisateur au point d'appel mais non passée au gabarit",
      },
    ],
    fr: {
      subject: 'Votre lien de connexion $appname',
      html: html('fr', [
        '<p>Bonjour,</p>',
        '<p>Vous avez demandé à vous connecter à votre espace <strong>$appname</strong> sans mot de passe. Cliquez sur le bouton ci-dessous pour accéder directement à votre espace.</p>',
        cta('$link', 'Me connecter'),
        "<p>Ce lien est valable 10 minutes et ne peut être utilisé qu'une seule fois, depuis l'appareil qui en a fait la demande.</p>",
        "<p>Si vous n'êtes pas à l'origine de cette demande, ignorez ce message : personne ne pourra accéder à votre compte sans ce lien.</p>",
      ]),
    },
    en: {
      subject: 'Your $appname login link',
      html: html('en', [
        '<p>Hello,</p>',
        '<p>You requested to sign in to your <strong>$appname</strong> portal without a password. Click the button below to access your portal directly.</p>',
        cta('$link', 'Sign me in'),
        '<p>This link is valid for 10 minutes and can only be used once, from the device that requested it.</p>',
        '<p>If you did not request this link, please ignore this message: no one can access your account without it.</p>',
      ]),
    },
  },
  {
    slug: 'mail-change',
    name: "Confirmation de changement d'adresse email",
    section: 'accounts',
    recipient: 'investor',
    trigger: 'auto',
    origin:
      "Un investisseur demande le changement de son adresse email depuis son profil. Le même gabarit part vers l'ancienne et vers la nouvelle adresse, chacune avec son propre lien de confirmation",
    variables: [
      '$logo',
      '$appname',
      '$url',
      '$year',
      '$mirror',
      '$prenom',
      '$nom',
      '$currentemail',
      '$newmail',
      '$link',
    ],
    proposedVariables: [],
    fr: {
      subject: 'Confirmez le changement de votre adresse email $appname',
      html: html('fr', [
        '<p>Bonjour $prenom $nom,</p>',
        "<p>Nous avons reçu une demande de changement de l'adresse email associée à votre compte <strong>$appname</strong> :</p>",
        centered(
          'Adresse actuelle : <strong>$currentemail</strong><br>Nouvelle adresse : <strong>$newmail</strong>',
        ),
        '<p>Ce message est envoyé à vos deux adresses. Pour confirmer le changement depuis cette adresse, cliquez sur le bouton ci-dessous.</p>',
        cta('$link', 'Confirmer le changement'),
        "<p>Si vous n'êtes pas à l'origine de cette demande, ne cliquez pas sur ce lien et signalez-le immédiatement à $mail_support.</p>",
      ]),
    },
    en: {
      subject: 'Confirm the change of your $appname email address',
      html: html('en', [
        '<p>Dear $prenom $nom,</p>',
        '<p>We received a request to change the email address associated with your <strong>$appname</strong> account:</p>',
        centered(
          'Current address: <strong>$currentemail</strong><br>New address: <strong>$newmail</strong>',
        ),
        '<p>This message is sent to both addresses. To confirm the change from this address, click the button below.</p>',
        cta('$link', 'Confirm the change'),
        '<p>If you did not request this change, do not click this link and report it immediately to $mail_support.</p>',
      ]),
    },
  },
  {
    slug: 'investor-valid-email',
    name: "Vérification de l'adresse email à l'inscription",
    section: 'accounts',
    recipient: 'investor',
    trigger: 'auto',
    origin:
      "Un investisseur finalise son inscription en ligne sur le portail et doit confirmer son adresse email. Tant que l'adresse n'est pas confirmée, l'investisseur peut se connecter mais ne peut pas souscrire",
    variables: [
      '$logo',
      '$appname',
      '$url',
      '$year',
      '$mirror',
      '$contact_firstname',
      '$contact_lastname',
      '$email',
      '$site',
      '$link',
    ],
    proposedVariables: [],
    fr: {
      subject: 'Confirmez votre adresse email pour finaliser votre inscription',
      html: html('fr', [
        '<p>Bonjour $contact_firstname $contact_lastname,</p>',
        "<p>Bienvenue sur <strong>$site</strong>. Votre compte a bien été créé avec l'adresse <strong>$email</strong>.</p>",
        "<p>Pour finaliser votre inscription, il ne vous reste qu'à confirmer votre adresse email.</p>",
        cta('$link', 'Confirmer mon adresse email'),
        "<p>Tant que votre adresse n'est pas confirmée, vous pouvez consulter votre espace mais vous ne pouvez pas souscrire.</p>",
        "<p>Si vous n'êtes pas à l'origine de cette inscription, ignorez ce message.</p>",
      ]),
    },
    en: {
      subject: 'Confirm your email address to complete your registration',
      html: html('en', [
        '<p>Dear $contact_firstname $contact_lastname,</p>',
        '<p>Welcome to <strong>$site</strong>. Your account has been created with the address <strong>$email</strong>.</p>',
        '<p>To complete your registration, you simply need to confirm your email address.</p>',
        cta('$link', 'Confirm my email address'),
        '<p>Until your address is confirmed, you can access your portal but you cannot subscribe.</p>',
        '<p>If you did not create this account, please ignore this message.</p>',
      ]),
    },
  },
  {
    slug: 'New-user',
    name: 'Création d\'un utilisateur secondaire côté investisseur',
    section: 'accounts',
    recipient: 'investor',
    trigger: 'auto',
    origin:
      "Un contact investisseur crée un nouvel utilisateur rattaché à son compte depuis l'espace investisseur, avec copie au contact créateur. L'utilisateur doit ensuite être validé par l'équipe interne avant de pouvoir se connecter",
    variables: [
      '$logo',
      '$appname',
      '$url',
      '$year',
      '$mirror',
      '$ParentUserName',
      '$ParentUserFamilyname',
      '$ChildUserName',
      '$ChildUserFamilyName',
      '$investor',
      '$subinvestor',
    ],
    proposedVariables: [],
    fr: {
      subject: 'Votre acces au compte investisseur $investor a ete cree',
      html: html('fr', [
        '<p>Bonjour $ChildUserName $ChildUserFamilyName,</p>',
        '<p>$ParentUserName $ParentUserFamilyname vous a ajouté comme utilisateur du compte investisseur <strong>$investor</strong> sur <strong>$appname</strong>.</p>',
        "<p>Votre accès doit d'abord être validé par l'équipe $appname. Vous recevrez un email de confirmation dès que votre compte sera actif ; vous pourrez alors vous connecter et définir votre mot de passe.</p>",
        "<p>Aucune action n'est attendue de votre part d'ici là.</p>",
      ]),
    },
    en: {
      subject: 'Your access to the investor account $investor has been created',
      html: html('en', [
        '<p>Dear $ChildUserName $ChildUserFamilyName,</p>',
        '<p>$ParentUserName $ParentUserFamilyname has added you as a user of the investor account <strong>$investor</strong> on <strong>$appname</strong>.</p>',
        '<p>Your access must first be validated by the $appname team. You will receive a confirmation email as soon as your account is active; you will then be able to sign in and set your password.</p>',
        '<p>No action is required from you in the meantime.</p>',
      ]),
    },
  },
  {
    slug: 'New-user-valid',
    name: 'Utilisateur investisseur à valider',
    section: 'accounts',
    recipient: 'team',
    trigger: 'auto',
    origin:
      "Envoi automatique à l'adresse de notifications interne quand un contact investisseur crée un utilisateur soumis à validation",
    variables: [
      '$logo',
      '$appname',
      '$url',
      '$year',
      '$mirror',
      '$ParentUserName',
      '$ParentUserFamilyname',
      '$ChildUserName',
      '$ChildUserFamilyName',
      '$investor',
      '$subinvestor',
      '$link',
    ],
    proposedVariables: [],
    fr: {
      subject: 'Utilisateur a valider sur le compte $investor : $ChildUserName $ChildUserFamilyName',
      html: html('fr', [
        '<p>Bonjour,</p>',
        '<p>$ParentUserName $ParentUserFamilyname a créé un nouvel utilisateur sur le compte investisseur <strong>$investor</strong> $subinvestor :</p>',
        '<p style="text-align:center;font-size:18px;margin:20px 0"><strong>$ChildUserName $ChildUserFamilyName</strong></p>',
        "<p>Cet utilisateur ne pourra pas se connecter tant que son accès n'a pas été validé. Sa pièce d'identité est consultable sur la fiche investisseur.</p>",
        cta('$link', 'Consulter la fiche investisseur'),
      ]),
    },
    en: {
      subject: 'User awaiting validation on account $investor: $ChildUserName $ChildUserFamilyName',
      html: html('en', [
        '<p>Hello,</p>',
        '<p>$ParentUserName $ParentUserFamilyname has created a new user on the investor account <strong>$investor</strong> $subinvestor:</p>',
        '<p style="text-align:center;font-size:18px;margin:20px 0"><strong>$ChildUserName $ChildUserFamilyName</strong></p>',
        '<p>This user will not be able to sign in until their access has been validated. Their identity document is available on the investor record.</p>',
        cta('$link', 'Open the investor record'),
      ]),
    },
  },
  {
    slug: 'New-user-notification',
    name: 'Validation d\'un utilisateur investisseur confirmée',
    section: 'accounts',
    recipient: 'investor',
    trigger: 'auto',
    origin:
      'Le back office valide un utilisateur secondaire rattaché à un investisseur, si le paramètre "Notification for investor contact validation" est actif. Copie au contact parent qui avait créé l\'utilisateur',
    variables: [
      '$logo',
      '$appname',
      '$url',
      '$year',
      '$mirror',
      '$ParentUserName',
      '$ParentUserFamilyname',
      '$ChildUserName',
      '$ChildUserFamilyName',
    ],
    proposedVariables: [
      {
        name: '$reset_url',
        note: "lien de création de mot de passe, non généré à ce point d'appel alors que l'utilisateur validé doit définir son accès",
      },
    ],
    fr: {
      subject: 'Votre acces investisseur $appname a ete valide',
      html: html('fr', [
        '<p>Bonjour $ChildUserName $ChildUserFamilyName,</p>',
        "<p>Votre compte utilisateur, créé par $ParentUserName $ParentUserFamilyname, a été validé par l'équipe <strong>$appname</strong>.</p>",
        '<p>Vous pouvez désormais vous connecter à votre espace investisseur.</p>',
        cta('$url', 'Accéder à mon espace'),
        "<p>Si vous avez besoin d'aide pour votre première connexion, contactez-nous à $mail_support.</p>",
      ]),
    },
    en: {
      subject: 'Your $appname investor access has been validated',
      html: html('en', [
        '<p>Dear $ChildUserName $ChildUserFamilyName,</p>',
        '<p>Your user account, created by $ParentUserName $ParentUserFamilyname, has been validated by the <strong>$appname</strong> team.</p>',
        '<p>You can now sign in to your investor portal.</p>',
        cta('$url', 'Access my portal'),
        '<p>If you need help with your first login, please contact us at $mail_support.</p>',
      ]),
    },
  },
  {
    slug: 'invitation-investor',
    name: "Invitation d'un investisseur par un distributeur",
    section: 'accounts',
    recipient: 'investor',
    trigger: 'manual',
    origin:
      "Un distributeur invite un de ses investisseurs à activer son espace depuis l'espace distributeur, avec un message personnel optionnel. L'envoi est tracé sur la fiche investisseur, avec la date d'invitation",
    variables: [
      '$logo',
      '$appname',
      '$url',
      '$year',
      '$mirror',
      '$prenom',
      '$nom',
      '$message',
      '$partner.name',
      '$reset_url',
    ],
    proposedVariables: [],
    fr: {
      subject: '$partner.name vous invite a activer votre espace investisseur $appname',
      html: html('fr', [
        '<p>Bonjour $prenom $nom,</p>',
        '<p>Votre partenaire <strong>$partner.name</strong> vous invite à activer votre espace investisseur sur <strong>$appname</strong>.</p>',
        quote('$message'),
        '<p>Pour activer votre espace, définissez votre mot de passe en cliquant sur le bouton ci-dessous. Vous y retrouverez vos souscriptions et vos documents.</p>',
        cta('$reset_url', 'Activer mon espace'),
        '<p>Ce lien est valable jusqu\'à la fin de la journée. Passé ce délai, vous pourrez demander un nouveau lien depuis la page "Mot de passe oublié" de l\'espace.</p>',
      ]),
    },
    en: {
      subject: '$partner.name invites you to activate your $appname investor portal',
      html: html('en', [
        '<p>Dear $prenom $nom,</p>',
        '<p>Your partner <strong>$partner.name</strong> invites you to activate your investor portal on <strong>$appname</strong>.</p>',
        quote('$message'),
        '<p>To activate your portal, set your password by clicking the button below. You will find your subscriptions and documents there.</p>',
        cta('$reset_url', 'Activate my portal'),
        '<p>This link is valid until the end of the day. After that, you can request a new one from the "Forgotten password" page of the portal.</p>',
      ]),
    },
  },
];
