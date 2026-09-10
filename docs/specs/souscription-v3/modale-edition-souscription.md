# Souscription v3 : Modifier une souscription depuis la modale d'édition

**Type** : Story · **Parent** : IC-5117 (affichage du détail) · **Programme** : Souscription V3 (IC-4938)
**Module** : Investhub Onboarding · **Composant** : Souscriptions

> En tant qu'opérateur back-office porteur du droit `campaigns-investors`, je veux modifier les données d'une souscription depuis une modale unique, afin de corriger un dossier sans repasser par les écrans V1.

Objectif : **réplication à l'identique de la modale d'édition V1** (`editSubPrompt.php` et bloc `editSub` de `_activeData`) dans le nouveau détail de souscription. Même champs, même sections, mêmes conditions d'affichage. Les corrections de la V1 sont limitées à celles listées en section 6.

---

## 1. Ce que cette story ne redéfinit pas

| Sujet | Porté par |
| --- | --- |
| Composants de saisie, listes déroulantes, filtres de parts et de partenaires | Modale de création, IC-4729 et ses stories enfants |
| Moteur Montant ↔ Parts : champ principal et dérivé, bornes, arrondis, exemptions | IC-5249, IC-5250, IC-5251, IC-5252 et spécification 755859457 |
| Hiérarchie des taux de frais d'entrée, seuil de gratuité, frais minimum | IC-4734 |
| Prix de la part figé, et son affichage en lecture | IC-5253 |
| **Encadrement de la modification des montants selon l'état du dossier** | IC-5255 |
| Verrouillage de la validation d'un dossier non soumis | IC-5217 |
| Statut unique et persistant, historique des transitions | IC-5212, IC-5214 |
| Widget compact, mode Plus, bouton Refresh | IC-5117 |
| Notifications déclenchées par une modification | IC-5241 |
| Actions du cycle de vie (inviter, valider, rouvrir, envoyer en signature, réduire l'engagement, transférer) | Menu d'actions de la page |

La modale consomme ces règles, elle ne les porte pas. En particulier : **aucun encadrement par l'état n'est développé ici**. Comme en V1, les champs sont modifiables quel que soit l'état, jusqu'à la livraison de IC-5255.

---

## 2. Ouverture et droits

| Contrôle | Règle |
| --- | --- |
| Point d'entrée | Bouton **Modifier** en pied du panneau de détail déplié |
| Droit requis | `campaigns-investors`, fonds de la souscription dans le périmètre de l'opérateur, part non restreinte à d'autres opérateurs |
| Lecture seule | Droit `campaigns-investors-readonly` avec statut 1 : le bouton n'est pas rendu |
| Contrôle serveur | Droit, appartenance du fonds à l'application et périmètre revérifiés **à l'ouverture comme à l'enregistrement**. La V1 ne contrôle rien à l'ouverture |
| Préchargement | Valeurs courantes telles quelles, sans recalcul |
| Après enregistrement | Panneau de détail rafraîchi, l'opérateur reste sur la page. Le setting `Stay on subscription page` est sans objet |

---

## 3. Champs, section par section

Ordre et libellés repris du panneau de lecture. Les libellés, placeholders, infobulles et messages d'erreur passent par des clés de traduction sous `subscriptions.editModal.*`, ajoutées simultanément dans `en.json` et `fr.json`.

### Souscription

| Champ | Colonne | Saisie | Condition d'affichage |
| --- | --- | --- | --- |
| Langue du dossier | `id_langue` | Liste des langues de l'application | Application multilingue |
| Identifiant externe | `legacy_id` | Texte libre | Toujours |
| Identifiant CRM | `crm_id` | Texte, avec l'infobulle d'aide de la V1 | Setting `CRM id for subscriptions` |
| Part | `id_part` | Liste des parts du fonds, libellé nom, prix, modalité | Toujours |
| Montant souscrit | `amount` | Numérique en devise du fonds | Toujours |
| Prix de la part | `part_price` | Lecture seule, mention "figé à la création" | Toujours |
| Nombre de parts | `nb_parts` | Numérique aux décimales du fonds | Toujours |
| Frais d'entrée | `fees_amount` | Taux et montant liés, taux plafonné au maximum de la part | Toujours |
| Prime de souscription | `premium_amount` | Numérique en devise | Masqué si `Minimal subscription form` |
| Option de conservation | `conservation` | Interrupteur | Masqué si `Minimal subscription form` |
| Type de souscription | `id_subscriptiontype` | Liste des types de l'application et globaux, plus "Non qualifié" | Toujours |
| Prélèvement SEPA | `sdd` | Interrupteur | Toujours |
| Mode de détention | `euroclear` | Liste : Non renseigné, Pur (9), Administré (1) | Toujours |

### Souscripteur

Ces données sont copiées sur la souscription, distinctes de la fiche investisseur. Les corriger ici ne met pas à jour la fiche.

| Champ | Colonne | Saisie | Condition d'affichage |
| --- | --- | --- | --- |
| Type de souscripteur | `id_investortype` | Liste des types de l'application et globaux | Toujours |
| Structure | `id_structure` | Structures de l'investisseur, plus "En nom propre" | Toujours |
| Nom de la souscription | `subscription_name` | Texte | Toujours |
| Raison sociale | `company_name` | Texte | Toujours |
| Nom, Prénom | `lastname`, `firstname` | Texte | Toujours |
| Email | `email` | Texte, format validé | Toujours |
| Téléphone | `phone` | Texte, indicatif international, sans forcer +33 | Toujours |
| Adresse 1, Adresse 2, Code postal, Ville | `adresse1`, `adresse2`, `zipcode`, `city` | Texte, composant adresse de IC-5059 | Toujours. En lecture, une seule ligne concaténée |
| Pays | `id_country` | Liste des pays | Toujours |
| Date de naissance | `birthdate` | Sélecteur de date, vide écrit nul | Personne physique |
| Nationalité | `citizenship` | Liste des pays | Personne physique |
| IBAN | `iban` | Texte, validé par pays | Toujours |
| BIC | `bic` | Texte | Toujours |

### Co-souscripteur

Bloc affiché si `additional_signer_firstname` est renseigné, comme en V1. Le co-souscripteur se déclare par l'onboarding : la modale corrige, elle n'ajoute pas.

| Champ | Colonne |
| --- | --- |
| Nom, Prénom, Email, Téléphone du co-souscripteur | `additional_signer_lastname`, `_firstname`, `_email`, `_phone` |

### Distribution

Section affichée si l'application compte au moins un partenaire. Taux et exclusion affichés seulement si le module Commissions partenaires est actif.

| Champ | Colonne | Saisie |
| --- | --- | --- |
| Partenaire | `id_partner` | Partenaires autorisés à distribuer le couple fonds et part, plus "En direct", avec un lien qui lève le filtre |
| Conseiller | `id_partneruser` | Conseillers du partenaire sélectionné, rechargés au changement |
| Souscription assistée | `assisted` | Interrupteur, actif seulement si un partenaire est sélectionné |
| Taux de commission | `commission` | Pourcentage, prérempli par le recalcul, modifiable |
| Exclure des rétrocessions | `noretro` | Interrupteur |

### Champs personnalisés

Bloc affiché si au moins un champ de l'objet `subscription` est visible en back-office. Comportement repris de `clCustomfields`, identique à l'affichage décrit dans IC-5117.

| Règle |
| --- |
| Champs avec `object = subscription` et `hide_bo = 0`, triés sur `ordre`, un par ligne, avec l'aide contextuelle `ci-field-<id>` |
| Types : `text`, `textarea`, `select`, `select_multiple`, `checkbox`, `color`, `date`, `html` |
| `mandatory_bo = 1` : astérisque au libellé et enregistrement bloqué si le champ est vide |
| `id_parent > 0` : champ affiché seulement si le parent a une valeur, options dépendantes de cette valeur |
| `multilanguage = 1` et application multilingue : une valeur par langue |
| `hide_bo = 1` : ni affiché, ni écrasé à l'enregistrement |
| Stockage JSON `souscriptions.fields` sous la forme `{id_field: {name, value}}` |

---

## 4. Comportements dynamiques

| Déclencheur | Conséquence |
| --- | --- |
| Changement de part | Bascule de modalité si elle diffère, conservation du champ principal, recalcul du champ dérivé au prix de la nouvelle part, recalcul du taux de commission si un partenaire est sélectionné |
| Changement de partenaire | Recalcul du taux (`getCommRate`, convention signée requise, sinon zéro), rechargement des conseillers |
| Passage En direct | Assistée à Non, commission à zéro, conseiller vidé |
| Saisie hors bornes ou arrondi | Messages du moteur (IC-5251, IC-5252), la modale ne définit pas ses propres messages |
| Frais | Taux et montant liés, message si le taux dépasse le maximum de la part, frais à zéro autorisés |

---

## 5. Enregistrement

| # | Règle |
| --- | --- |
| 1 | Droits et périmètre revérifiés côté serveur. Sinon 403 |
| 2 | Validation des formats (email, IBAN par pays, date) et des appartenances : la part au fonds, la structure à l'investisseur, le conseiller au partenaire, le partenaire à l'application, le type de souscription à l'application ou global. Erreurs regroupées par champ dans une seule réponse |
| 3 | Montants et parts passent par le moteur unique. Le serveur ne stocke jamais un triplet parts, prix, montant incohérent. Le prix figé n'est réécrit qu'au changement de part |
| 4 | Champs personnalisés obligatoires en back-office vérifiés, champs masqués non écrasés |
| 5 | Effets de bord, dans l'ordre de la table ci-dessous |
| 6 | Journalisation : une ligne `souscriptionsactions` d'action `edit`, avec la liste des champs modifiés et leurs valeurs avant et après |

### Effets de bord

| Ordre | Condition | Effet |
| --- | --- | --- |
| 1 | Partenaire ou part changé, aucun taux saisi | Recalcul de la commission |
| 2 | Conseiller n'appartenant plus au partenaire | Conseiller vidé |
| 3 | Plus de partenaire | Assistée remise à Non |
| 4 | Type de souscripteur changé, dossier sans aucune réponse, setting `Autoonboarding` actif | Réaffectation de l'onboarding |
| 5 | IBAN ou BIC changé | Recopie sur `sepa_iban` et `sepa_bic` |
| 6 | Type de souscription changé | Pose de `id_typesetter` et `date_typeset`, comme la fiche de contrôle |

---

## 6. Écarts assumés avec la V1

Corrections retenues parce qu'elles portent sur du code réécrit de toute façon. Tout le reste est repris tel quel.

| # | Constat V1 | Correction |
| --- | --- | --- |
| A2 | Activer le prélèvement force `sepa_status` à Approuvé sans signature | Le statut du mandat n'est plus touché par l'interrupteur |
| A3 | La nationalité est castée en entier alors que la colonne est un texte : toute saisie devient 0 | Écriture en texte, liste de pays |
| A4 | Un mode de détention nul s'affiche Pur et est écrit 9 à la première sauvegarde | Option Non renseigné, valeur nulle préservée |
| A5 | La qualification depuis la modale ne pose ni auteur ni date, contrairement à la fiche de contrôle | Effet de bord 6 |
| A6 | Le changement de partenaire ne recalcule pas la commission et ne contrôle pas le conseiller, alors que la création le fait | Effets de bord 1 et 2 |
| A7 | Le chargement de la modale ne vérifie ni droit ni appartenance à l'application : le formulaire de toute souscription est chargeable par identifiant | Contrôle complet à l'ouverture |
| A8 | Parts, prix et montant sont trois champs libres liés par du JavaScript, le serveur accepte un triplet incohérent | Moteur unique, prix figé en lecture |
| A9 | La souscription assistée est modifiable à la création et nulle part ensuite | Interrupteur ajouté à la section Distribution |
| A10 | La liste des partenaires n'est pas filtrée sur les partenaires autorisés à distribuer la part | Filtre avec levée explicite |
| A11 | Le pays n'est proposé qu'en français | Liste traduite |
| A12 | Le journal ne porte qu'un libellé générique, sans les valeurs modifiées | Champs modifiés listés avec valeurs avant et après |

**Non retenu dans cette story**, malgré des colonnes existantes : second co-souscripteur (`additional_signer2_*`), contact investisseur rattaché (`id_investorcontact`), side letter requise (`sideletter_required`). Ce sont des champs que la V1 n'édite pas : les ajouter relève d'une demande produit distincte, pas de la réplication.

---

## 7. Champs exclus de la modale

| Champ | Où il se modifie |
| --- | --- |
| Dates du cycle de vie (`date_*`, `acquisition_date`, `availability_date`, `processing_date`) | Actions du cycle de vie et saisie de la date de VL |
| État, statut de paiement, validation interne, pré-validation partenaire | Actions et leurs transitions |
| Engagement réduit (`new_amount`, `reduced`) | Action Réduction d'engagement |
| Notes internes, signataires, réponses du dossier | Onglets et blocs dédiés |
| Investisseur porteur | Action de réaffectation |

---

## 8. Critères d'acceptance

1. Le bouton Modifier n'est pas rendu pour un opérateur en lecture seule, et l'appel direct de l'endpoint renvoie 403.
2. L'ouverture de la modale sur une souscription d'une autre application renvoie 403, sans charger le formulaire.
3. Les sections et les champs apparaissent dans l'ordre et avec les libellés du panneau de lecture, et chaque libellé provient d'une clé de traduction présente dans `en.json` et `fr.json`.
4. Les champs et sections conditionnels suivent les mêmes conditions qu'à l'affichage : identifiant CRM sous setting, prime et conservation masquées en formulaire minimal, langue sur application multilingue, co-souscripteur si le prénom est renseigné, distribution si l'application compte un partenaire.
5. Le prix de la part est en lecture avec la mention "figé à la création", et ne change qu'au changement de part.
6. Modifier le nombre de parts recalcule le montant, et inversement, par le moteur unique et aux décimales du fonds.
7. Le changement de partenaire recalcule le taux de commission, recharge les conseillers et vide le conseiller devenu invalide.
8. Passer en direct remet assistée à Non, la commission à zéro et vide le conseiller.
9. Activer le prélèvement SEPA ne modifie pas le statut du mandat.
10. La nationalité et le mode de détention saisis sont relus à l'identique après enregistrement, et un mode de détention non renseigné reste nul.
11. Modifier le type de souscription pose l'auteur et la date de qualification.
12. Un champ personnalisé obligatoire en back-office laissé vide bloque l'enregistrement ; un champ masqué en back-office n'est pas écrasé ; un champ enfant n'apparaît que si son parent a une valeur.
13. L'enregistrement produit une ligne de journal listant les champs modifiés avec leurs valeurs avant et après.
14. Le serveur refuse un triplet parts, prix, montant incohérent.
