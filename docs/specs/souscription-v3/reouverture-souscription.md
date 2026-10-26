# Souscription v3 : Rouvrir une souscription pour correction

**Type** : Epic + 8 stories · **Programme** : Souscription V3 (IC-4938) · **Liens** : IC-5261 (contrôle du dossier), IC-5241 (communications), IC-5248 (réouverture et reprise en main), IC-5210 (statuts)
**Module** : Investhub Onboarding · **Composant** : Souscriptions

> En tant qu'opérateur back-office, je veux renvoyer une souscription à l'investisseur avec la liste précise des réponses et des pièces à corriger, afin d'obtenir un dossier complet sans échanges hors plateforme.

Objectif : **iso V1**. Source de vérité : pages WIH "Ré-ouverture d'une souscription" (433618946), "Souscriptions - Sous-modules et règles métier" (931266561, sous-module 6) et "Déclencheurs détaillés - Souscription et onboarding" (942178305, gabarit `reopen`). Les écarts volontaires avec la V1 sont listés en section 3.

Maquette : bouton **Rouvrir pour correction** dans l'en-tête du détail d'une souscription (`SubscriptionDetailPage`), modale `SubscriptionReopenDialog` avec le choix **Qui corrige le dossier ?** (l'investisseur, ou je corrige moi-même), bandeaux `PageStateBanner variant="reopened"` et `variant="takenOver"`, statut **Rouvert**. Le bouton de démonstration **Simuler la nouvelle soumission** rejoue le retour de l'investisseur.

---

## 1. Constat sur la maquette avant cette epic

La maquette V3 sait invalider une réponse ou une pièce, mais rien ne renvoie le dossier à l'investisseur. Les éléments invalidés restent "à corriger" sans destinataire. Le seul bouton "Rouvrir le KYC" de la maquette est dans l'étape Conformité : il rouvre les décisions de conformité (score, correspondances, catégorisation), ce qui correspond en V1 à la réouverture du profil de risque, pas à la réouverture de la souscription.

## 2. Comportement V1 de référence

| Sujet | V1 |
| --- | --- |
| Point d'entrée | Modale de réouverture depuis la fiche de contrôle de la souscription |
| Conditions | `status = 0` sans validation interne en cours (`validation_status != 1`), ou `status = 1` avec `docsent = 0`. Plus proposé une fois le pack envoyé en signature |
| Éléments proposés | Toutes les réponses invalidées (`check = -1`) et toutes les pièces refusées (`managercheck = -1`), sections de préonboarding comprises. Un commentaire par élément, un message général |
| Pièces | Supprimées du dossier, sauf réglage `Keep docs at subscription reopen` |
| Remise à zéro | `is_complete = 0`, `status = 0`, `reopened = 1`, `reopen_date`, `reopen_count + 1`. Avec `Clear all subscription on reopen` : type de souscription, validation interne et statut du profil de risque remis à zéro |
| Non modifié | Signature, `docsent`, refus de validation interne, `date_completed`, `date_validated`, `has_validated` |
| Email | Gabarit `reopen`, ou gabarit choisi dans le champ Mail de réouverture de la part. Lien de reprise avec connexion automatique, sauf `No autologin for reopen` |
| Destinataire | Contact de la souscription, sinon investisseur. Dossier intermédié : distributeur seul, sauf distributeur sans onboarding, case Réouverture investisseur cochée, ou `Send reopen mail to investor` |
| Partenaire délégué ayant déjà validé | `partner_validation` repasse de 2 à 1, compteur partenaire incrémenté, gabarit `partner-reopen` au validateur partenaire. Statut et complétion inchangés |
| Webhook | Événement `reopen` avec message et liste des éléments, si le distributeur a un accès API |
| Affichage | Statut "Rouvert" quand `reopened = 1`, `is_complete = 0`, `status = 0`. Compteur et date de dernière réouverture sur la fiche. Statut `kycreopened` côté onboarding |
| Réouverture silencieuse | `reopenQuest` : remet `is_complete` et `status` à 0, sans email, sans compteur, sans webhook |
| Après l'action | Retour au listing, ou maintien sur la fiche avec `Stay on subscription page` |

## 3. Écarts proposés avec la V1

| Écart | Raison |
| --- | --- |
| L'opérateur reste toujours sur la fiche après la réouverture. `Stay on subscription page` est sans objet | Comportement du détail V3 pour toutes les actions |
| La modale affiche le destinataire effectif et le gabarit avant l'envoi | IC-5244 |
| La réouverture silencieuse (`reopenQuest`) devient la reprise en main, choisie dans la même modale | IC-5248 : deux actions distinctes et nommées, une seule notifie. La reprise en main porte en plus la liste des éléments à corriger et une note interne, absentes en V1 |
| Libellé "Rouvrir pour correction" pour l'action sur la souscription | Lever la confusion avec "Rouvrir le KYC" de l'étape Conformité, voir section 5 |

---

## 4. Stories

### Story 1 : Rouvrir une souscription depuis son détail

**En tant qu'** opérateur back-office
**Je veux** rouvrir une souscription depuis l'en-tête de son détail
**Afin de** renvoyer le dossier en correction quelle que soit l'étape où je me trouve

Règles métier

- Action **Rouvrir pour correction** en action secondaire de l'en-tête, visible à toutes les étapes.
- Droit `campaigns-investors`, fonds dans le périmètre de l'opérateur, part non restreinte à d'autres opérateurs. Contrôles revérifiés côté serveur.
- Action disponible si la souscription est en onboarding sans validation interne en cours, ou validée sans pack envoyé en signature.
- Action indisponible : bouton visible, grisé, motif au survol. Motifs : droit manquant, pack de signature envoyé, validation interne en cours, onboarding non commencé.

```
Given une souscription en onboarding et un opérateur avec le droit campaigns-investors
When l'opérateur ouvre le détail
Then l'action "Rouvrir pour correction" est active

Given une souscription dont le pack a été envoyé en signature
When l'opérateur survole "Rouvrir pour correction"
Then l'action est grisée
And le motif indique que le pack de signature est envoyé

Given un opérateur en lecture seule
When il ouvre le détail
Then l'action est grisée avec le motif de droit manquant
```

### Story 2 : Sélectionner et commenter les éléments à corriger

**En tant qu'** opérateur back-office
**Je veux** choisir les réponses et les pièces à corriger et expliquer chaque correction
**Afin que** l'investisseur sache exactement quoi reprendre

Règles métier

- La modale liste toutes les réponses invalidées et toutes les pièces refusées, préonboarding compris, groupées par nature (réponse, pièce) avec leur section.
- Tous les éléments sont présélectionnés. L'opérateur peut en décocher.
- Un commentaire par élément sélectionné. Pour une pièce, le motif de refus saisi au contrôle est repris par défaut.
- Un message général, repris en tête de l'email.
- Confirmation possible dès qu'au moins un élément est sélectionné ou qu'un message est saisi. Sinon bouton grisé avec motif.
- Rappel de l'effet sur les pièces selon `Keep docs at subscription reopen` : retirées du dossier, ou conservées jusqu'à remplacement.

```
Given une souscription avec 1 réponse invalidée et 1 pièce refusée avec motif
When l'opérateur ouvre la modale de réouverture
Then les 2 éléments sont listés et cochés
And le commentaire de la pièce reprend son motif de refus

Given aucun élément coché et aucun message
When l'opérateur veut confirmer
Then le bouton est grisé avec le motif "Sélectionnez au moins un élément ou saisissez un message"
```

### Story 2 bis : Reprendre la main sur le dossier sans notifier

**En tant qu'** opérateur back-office
**Je veux** corriger moi-même les éléments pointés sans solliciter l'investisseur
**Afin de** traiter une erreur de saisie ou une pièce reçue hors plateforme sans email de correction

Équivalent V3 de la réouverture silencieuse V1 (`reopenQuest`). Lien IC-5248.

Règles métier

- Premier choix de la modale, "Qui corrige le dossier ?" : **L'investisseur corrige** (réouverture pour correction, stories 2 à 4) ou **Je corrige moi-même** (reprise en main). Le partenaire remplace l'investisseur dans le libellé quand le dossier lui revient (story 5).
- Reprise en main : mêmes éléments proposés et présélectionnés, commentaire par élément remplacé par une note interne facultative. Pas de message général, pas d'email.
- Effets : complétion et statut remis en onboarding, validation de conformité retirée, étape Onboarding, sections des éléments pointés dépliées.
- Pas d'indicateur de réouverture, pas de statut "Rouvert", pas d'incrément du compteur, pas de webhook, pas de ligne au journal des communications.
- Les pièces pointées ne sont jamais supprimées, quel que soit `Keep docs at subscription reopen` : l'opérateur les remplace depuis la section Pièces justificatives.
- Journal : événement "Dossier repris en main" avec l'auteur et la liste des éléments et des notes.
- Bandeau d'état à l'étape Onboarding : auteur, date, nombre d'éléments, mention qu'aucun email n'a été envoyé. Il disparaît au passage à la validation.
- La modale annonce explicitement "Aucun email envoyé" à la place du bloc destinataire.

```
Given une souscription avec 1 réponse invalidée et 1 pièce refusée
When l'opérateur choisit "Je corrige moi-même" et confirme "Reprendre la main"
Then aucun email n'est envoyé et aucun webhook n'est émis
And le compteur de réouvertures ne change pas
And le statut n'est pas "Rouvert"
And la pièce refusée reste au dossier
And la piste d'audit contient "Dossier repris en main"

Given un dossier repris en main
When l'opérateur passe à la validation
Then le bandeau de reprise en main disparaît

Given la matrice des notifications
When l'administrateur en consulte les événements
Then la reprise en main n'y figure pas
```

### Story 3 : Appliquer les effets de la réouverture sur le dossier

**En tant qu'** opérateur back-office
**Je veux** que la réouverture remette le dossier en onboarding de façon tracée
**Afin de** reprendre le contrôle à la nouvelle soumission sans perdre l'historique

Règles métier

- Complétion et statut remis en onboarding, indicateur de réouverture posé, date de réouverture, compteur incrémenté.
- Une validation KYC déjà donnée est retirée : le dossier repasse à valider.
- Pièces pointées supprimées, sauf `Keep docs at subscription reopen`.
- Avec `Clear all subscription on reopen` : type de souscription, validation interne et statut du profil de risque remis à zéro. Les réponses et les pièces non pointées ne sont jamais effacées.
- Inchangés : signature, pack, refus de validation interne, dates de complétion et de validation historiques.
- Journal : événement "Dossier rouvert" avec l'auteur, le message, le destinataire et la liste des éléments commentés.
- Webhook `reopen` (message et éléments) si le distributeur a un accès API.
- L'opérateur reste sur le détail, ramené à l'étape Onboarding.

```
Given une souscription validée, pack non envoyé, rouverte 0 fois
When l'opérateur confirme la réouverture de 2 éléments
Then le statut passe à "Rouvert" et l'étape courante est Onboarding
And le compteur de réouvertures vaut 1
And la validation de conformité repasse en attente
And la piste d'audit contient "Dossier rouvert" avec les 2 éléments

Given le réglage Keep docs at subscription reopen inactif
When une pièce pointée est rouverte
Then la pièce est retirée du dossier et repasse à fournir
```

### Story 4 : Envoyer l'email de réouverture au bon destinataire

**En tant qu'** opérateur back-office
**Je veux** voir avant l'envoi qui reçoit l'email de réouverture et avec quel gabarit
**Afin de** ne pas solliciter la mauvaise personne

Dépend de IC-5242 (matrice), IC-5243 (règle de destinataire), IC-5244 (destinataire visible avant envoi), IC-5248.

Règles métier

- Gabarit `reopen`, remplacé par le gabarit choisi dans le champ Gabarit de réouverture de la part.
- Variables : message général, liste HTML des éléments avec leur commentaire, fonds, prénom et nom de l'investisseur, montant, coordonnées du contact GP, lien de reprise, nom de la souscription.
- Lien de reprise avec connexion automatique, sauf `No autologin for reopen`.
- Destinataire : contact de la souscription, sinon investisseur.
- Dossier intermédié : distributeur (son conseiller s'il existe) seul, sauf distributeur sans onboarding, case Réouverture investisseur cochée sur le distributeur, ou `Send reopen mail to investor`. Dans ces cas l'investisseur est aussi destinataire.
- La modale affiche le destinataire effectif, les copies et le gabarit, avec la règle appliquée sur un dossier intermédié.
- L'envoi apparaît dans l'onglet Emails de la souscription et dans le journal des communications.

```
Given une souscription directe avec un contact de souscription
When l'opérateur ouvre la modale
Then le destinataire affiché est le contact de la souscription

Given une souscription intermédiée, distributeur avec onboarding, réglage Send reopen mail to investor inactif
When l'opérateur ouvre la modale
Then le destinataire affiché est le distributeur
And l'investisseur n'est pas destinataire

Given une part avec un gabarit de réouverture spécifique
When la réouverture est confirmée
Then l'email part avec ce gabarit
```

### Story 5 : Renvoyer au partenaire un dossier qu'il a déjà validé

**En tant qu'** opérateur back-office
**Je veux** que la réouverture d'un dossier déjà validé par le partenaire délégué lui revienne
**Afin que** le partenaire refasse son contrôle avant l'investisseur

Lien IC-5633 et IC-5218.

Règles métier

- Si le partenaire délégué a validé, la réouverture repasse la validation partenaire en attente, pose l'indicateur et la date de réouverture partenaire, incrémente le compteur partenaire.
- Statut et complétion de la souscription inchangés, l'indicateur de réouverture de la souscription n'est pas posé.
- Email `partner-reopen` au validateur partenaire, sinon au distributeur.
- Modale titrée "Renvoyer le dossier au partenaire", destinataire partenaire affiché.
- Indicateur et date de réouverture partenaire remis à zéro quand le partenaire revalide.

```
Given un circuit de pré-validation partenaire et un dossier validé par le partenaire
When l'opérateur confirme la réouverture
Then la validation partenaire repasse en attente
And le statut de la souscription ne change pas
And l'email "partner-reopen" part au validateur partenaire
```

### Story 6 : Rendre visible l'état Rouvert

**En tant qu'** opérateur back-office
**Je veux** repérer en un coup d'œil une souscription rouverte et son historique de réouvertures
**Afin de** savoir que j'attends l'investisseur et pas l'inverse

Lien IC-5212 (statut unique), IC-4871 (colonne Nb réouvertures).

Règles métier

- Statut "Rouvert" quand la souscription est rouverte, non complète et en onboarding. Badge orange dans l'en-tête et dans le listing.
- Filtre "Rouvert" dans le listing des souscriptions. La colonne Nb réouvertures existe déjà.
- En-tête du détail : "Rouvert N fois, dernière le JJ/MM/AAAA HH:MM" dès la première réouverture, même après la nouvelle soumission.
- Bandeau d'état à l'étape Onboarding tant que la nouvelle soumission n'est pas reçue : auteur, date, nombre d'éléments, destinataire.
- API : champ `reopened` booléen exposé, comme en V1.

```
Given une souscription rouverte en attente de l'investisseur
When l'opérateur ouvre le listing filtré sur "Rouvert"
Then la souscription apparaît avec le badge "Rouvert"

Given une souscription rouverte puis soumise à nouveau
When l'opérateur ouvre le détail
Then le bandeau n'est plus affiché
And l'en-tête indique "Rouvert 1 fois" avec la date
```

### Story 7 : Reprendre le parcours et soumettre à nouveau côté investisseur

**En tant qu'** investisseur
**Je veux** retrouver dans mon parcours les éléments à corriger avec le commentaire du gestionnaire
**Afin de** corriger mon dossier sans tout ressaisir

Règles métier

- Le lien de l'email ouvre le parcours sur le premier élément à corriger. Statut d'onboarding `kycreopened`.
- Les éléments pointés sont signalés avec leur commentaire. Les autres réponses sont conservées.
- Une pièce supprimée à la réouverture est à déposer de nouveau.
- La nouvelle soumission suit le circuit standard : gabarit `onboarding-valid`, statut "À valider", fin du bandeau Rouvert.
- Les éléments corrigés repassent à contrôler et sont signalés comme modifiés depuis la soumission précédente (IC-5264).

```
Given une souscription rouverte sur la réponse "Nationalité" avec un commentaire
When l'investisseur ouvre le lien de reprise
Then le parcours s'ouvre sur "Nationalité"
And le commentaire du gestionnaire est affiché

Given l'investisseur a corrigé les éléments pointés
When il soumet son dossier
Then la souscription passe à "À valider"
And les éléments corrigés repassent à contrôler côté back-office
```

---

## 5. Questions ouvertes

1. **Libellé.** "Rouvrir le KYC" désigne aujourd'hui, dans l'étape Conformité, la réouverture des décisions de conformité. L'atelier Souscription v3 appelle "réouverture KYC" la réouverture de la souscription. Proposition : "Rouvrir pour correction" pour la souscription, "Rouvrir les décisions" pour la conformité.
2. **Reprise en main et compteur.** La maquette ne compte pas la reprise en main dans le nombre de réouvertures (iso `reopenQuest`). Question restée ouverte dans IC-5248. Autre option : deux actions séparées dans l'en-tête plutôt qu'un choix dans la modale.
3. **Validation pendant la réouverture.** La V1 laisse valider un dossier rouvert non resoumis (règle 4.5). On garde, ou on bloque avec un motif tant que l'investisseur n'a pas resoumis ?
4. **Suppression des pièces.** Le comportement par défaut de la V1 supprime les pièces pointées. Pour la piste d'audit, faut-il plutôt les archiver ?
5. **Réouverture par le partenaire depuis son portail.** Hors de cette epic (portail distributeur). En V1 elle remet la validation partenaire à 0 et n'écrit qu'au distributeur.
