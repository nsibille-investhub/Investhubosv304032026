# Souscription v3 : Édition de la souscription (modale de modification)

Pendant "Edition / Update" de IC-5117, qui porte l'affichage (widget compact, mode Plus, refresh).
Périmètre de ce ticket : la modale ouverte par le bouton **Modifier** du widget de détail, en back-office.

**Programme** : Souscription V3 (IC-4938) · **Module** : Investhub Onboarding
**Spécification de référence** : PRD Détail de la souscription V3, sections 6 à 11 (page Confluence 981958660)

---

## 1. Ce que ce ticket ne redéfinit pas

La modale d'édition réutilise les composants, les listes et les règles de saisie de la **modale de création** déjà spécifiée. Aucun de ces sujets n'est repris ici.

| Sujet | Défini par |
| --- | --- |
| Composants de saisie, listes déroulantes, recherche unifiée d'investisseur, sous-formulaires de création rapide | IC-4729 et ses stories enfants |
| Enchaînement conditionnel des sections selon les valeurs saisies | IC-5346 |
| Moteur Montant ↔ Parts : champ principal et champ dérivé, bornes de modalité, arrondis, exemptions | IC-5249, IC-5250, IC-5251, IC-5252 et spécification 755859457 |
| Hiérarchie des taux de frais d'entrée, seuil de gratuité, frais minimum, prime de souscription | IC-4734 |
| Prix de la part figé à la création | IC-5253 |
| Encadrement de la modification des montants selon l'état du dossier | IC-5255 |
| Référentiel d'états, persistance, historique des transitions | IC-5212, IC-5210, IC-5214 |
| Widget compact, mode Plus, bouton Refresh | IC-5117 |
| Actions du cycle de vie (inviter, valider, rouvrir, envoyer en signature, réduire l'engagement, transférer, annuler) | Menu d'actions de la page |
| Routage des notifications déclenchées par une modification | IC-5241 |
| Filtre des parts et des partenaires autorisés à distribuer le couple fonds et part | IC-4756, IC-4734 |

Ce ticket décrit donc uniquement quatre choses : **ce que la modale contient**, **qui peut ouvrir quoi**, **ce qui est modifiable selon l'état**, et **ce que l'enregistrement déclenche**.

---

## 2. Ouverture, droits et lecture seule

| Contrôle | Règle |
| --- | --- |
| Rendu du bouton Modifier | Droit `campaigns-investors`, fonds de la souscription dans le périmètre de l'opérateur, part non restreinte à d'autres opérateurs |
| Lecture seule | Droit `campaigns-investors-readonly` avec statut 1 : le bouton n'est pas rendu, le mode Plus reste accessible. Code `readonly_right` |
| Ouverture de la modale | Le serveur revérifie droit, appartenance du fonds à l'application et périmètre **à l'ouverture comme à la sauvegarde**. La V1 ne contrôle rien à l'ouverture (anomalie A7) |
| État terminal | Sur Transférée, Annulée, Refusée, Expirée, le bouton reste visible et la modale s'ouvre **entièrement en lecture**, avec un bandeau expliquant pourquoi |
| Correction exceptionnelle | Droit dédié `subscriptions-exceptional-edit`, distinct du droit de gestion. Il déverrouille les groupes fermés par l'état, contre un motif obligatoire. Un seul droit, trois usages (montants IC-5255, typologie, validation d'un dossier non soumis IC-5217) |
| Portails partenaire et investisseur | Hors périmètre. La modification depuis un portail reste une demande de modification (`subchanges`) ou la modification du montant portail |

---

## 3. Anatomie de la modale

| Élément | Comportement |
| --- | --- |
| Point d'entrée | Bouton **Modifier** en pied du panneau déplié (implémentation actuelle du panneau Souscription), doublé sur la rangée d'attributs du widget compact (IC-5106) |
| Structure | Une seule modale en sections titrées, **dans le même ordre et avec les mêmes libellés que le panneau de lecture**. Chaque section est atteignable directement depuis l'icône d'édition du mode Plus |
| Préchargement | Valeurs courantes telles quelles, sans recalcul. Le recalcul ne s'opère qu'à la première modification (IC-5253) |
| Bandeau d'état | Résume l'état du dossier et ce qu'il autorise. Exemple : "Dossier en signature : la modification des montants ou de l'identité annulera la procédure de signature en cours" |
| Interrupteur Correction exceptionnelle | Dans le bandeau, visible seulement avec le droit dédié. Activé, il déverrouille les groupes concernés et rend obligatoire un champ Motif de 20 caractères minimum, non prérempli |
| Champ non modifiable | Affiché **en lecture avec sa valeur** et une infobulle donnant la raison. Jamais masqué : l'opérateur doit pouvoir lire ce qu'il ne peut pas changer |
| Aucune règle côté front | Le front rend `fields[x].editable`, `fields[x].exceptional` et `access.exceptionalEdit.allowed` renvoyés par le serveur. Il n'implémente aucune règle d'état |
| Enregistrer | Désactivé tant qu'une erreur bloquante existe. Annuler ferme sans écrire, avec confirmation si des champs ont changé |
| Après enregistrement | Widget, mode Plus et onglets dépendants se rafraîchissent, l'opérateur reste sur la page. Le setting `Stay on subscription page` est sans objet en V3 |

---

## 4. Champs, section par section

### 4.0 Ordre et libellés

L'ordre des sections et des champs de la modale reprend celui du panneau de lecture : **Souscription**, **Souscripteur**, **Co-souscripteur**, **Distribution**, **Qualification**, **Champs personnalisés**. Les libellés sont ceux déjà en place, dont plusieurs ne se déduisent pas du nom de colonne.

| Libellé plateforme (EN) | Libellé FR | Colonne |
| --- | --- | --- |
| Subscription | Souscription | section |
| Underwriter | Souscripteur | section |
| Custom fields | Champs personnalisés | section |
| Amount | Montant souscrit | `amount` |
| Amount of share | Prix de la part | `part_price` |
| Number of shares | Nombre de parts | `nb_parts` |
| Entrance fees | Frais d'entrée | `fees_amount` |
| Subscription premium | Prime de souscription | `premium_amount` |
| Withdrawal activated | Prélèvement SEPA | `sdd` |
| Type of subscriber | Type de souscripteur | `id_investortype` |
| Subscription name | Nom de la souscription | `subscription_name` |
| External identifier | Identifiant externe | `legacy_id` |

Tout libellé, placeholder, infobulle, message d'erreur et `aria-label` de la modale passe par une clé de traduction sous le namespace `subscriptions.editModal.*`, avec la clé ajoutée simultanément dans `en.json` et `fr.json`. Aucune chaîne en dur.

### 4.1 Tableau des champs

Colonne **Groupe** : renvoie à la matrice d'éditabilité de la section 6. C'est le seul endroit où se lisent les conditions liées à l'état, elles ne sont pas répétées champ par champ.
Colonne **Écart avec la création** : "=" signifie composant, liste et règle de saisie identiques à la modale de création.

### Section Souscription

| Champ | Colonne | Groupe | Affichage / setting | Écart avec la création |
| --- | --- | --- | --- | --- |
| Langue du dossier | `id_langue` | G1 | Application multilingue (`apps.multilangue`) | = |
| Identifiant externe | `legacy_id` | G1 | Toujours | Texte libre |
| Identifiant CRM | `crm_id` | G1 | Setting `CRM id for subscriptions` | Format identifiant Salesforce (15 ou 18 caractères, préfixe 006) |
| Part | `id_part` | G3 | Toujours | = (mêmes filtres). Le changement de part applique le prix de la nouvelle part comme prix figé |
| Montant souscrit | `amount` | G3 | Toujours | = (moteur unique) |
| Prix de la part | `part_price` | Lecture | Toujours | **Écart** : modifiable en V1, désormais en lecture avec la mention "figé à la création". Ne change que par changement de part |
| Nombre de parts | `nb_parts` | G3 | Toujours | = (moteur unique, décimales du fonds) |
| Frais d'entrée | `fees_amount` | G3 | Toujours | Saisie taux ou montant, l'un recalculant l'autre, taux plafonné au maximum de la part. **Aucun frais automatique n'est appliqué en édition** |
| Prime de souscription | `premium_amount` | G3 | Masqué si `Minimal subscription form` | = (hors moteur, IC-5256) |
| Total dû | calculé | Lecture | Toujours | Montant souscrit + frais + prime |
| Option de conservation | `conservation` | G9 | Masqué si `Minimal subscription form` | = |
| Type de souscription | `id_subscriptiontype` | G10 | Toujours | Pose `id_typesetter` et `date_typeset` et journalise `editSubType`, comme la fiche de contrôle (anomalie A5) |
| Prélèvement SEPA | `sdd` | G8 | Toujours | **Écart** : ne force plus `sepa_status` à approuvé (anomalie A2). Voir verrous mandat, section 7 |
| Mode de détention | `euroclear` | G7 | Toujours | **Ajout** : absent de la création (renseigné par l'onboarding ou ici). Options Non renseigné / Pur (9) / Administré (1). Un mode nul reste nul (anomalie A4) |

Le panneau observé sur une application sans partenaire et sans identifiant CRM n'affiche ni la section Distribution ni le champ Identifiant CRM : c'est le comportement attendu, les conditions d'affichage de la modale sont identiques à celles du panneau de lecture. Le mode de détention n'est pas rendu aujourd'hui dans le panneau, il est ajouté par ce ticket (voir la ligne correspondante).

### Section Souscripteur

Les données d'identité sont **copiées sur la souscription**, distinctes de la fiche investisseur. Les corriger ici ne met pas à jour la fiche.

| Champ | Colonne | Groupe | Affichage / setting | Écart avec la création |
| --- | --- | --- | --- | --- |
| Type de souscripteur | `id_investortype` | G2 | Toujours | = . Réaffecte l'onboarding si setting `Autoonboarding` et dossier sans aucune réponse. Sinon verrou `onboarding_started` |
| Structure | `id_structure` | G2 | Toujours | = , sans le sous-formulaire de création rapide de structure |
| Nom de la souscription | `subscription_name` | G1 | Toujours | Aucun recalcul automatique |
| Raison sociale | `company_name` | G4 | Toujours | Copie sur la souscription |
| Nom, Prénom | `lastname`, `firstname` | G4 | Toujours | Copie sur la souscription |
| Email | `email` | G4 | Toujours | Format validé |
| Téléphone | `phone` | G4 | Toujours | Indicatif international, sans forcer +33 |
| Adresse 1, Adresse 2, Code postal, Ville | `adresse1`, `adresse2`, `zipcode`, `city` | G4 | Toujours | Composant adresse réutilisable IC-5059 |
| Pays | `id_country` | G4 | Toujours | **Écart** : liste dans la langue de l'opérateur, français seul en V1 (anomalie A11) |
| Date de naissance | `birthdate` | G4 | Personne physique | Vide écrit nul |
| Nationalité | `citizenship` | G4 | Personne physique | **Écart** : écrite en texte, la V1 la caste en entier et la perd (anomalie A3) |
| IBAN | `iban` | G5 | Toujours | Validé par pays, recopié sur `sepa_iban` |
| BIC | `bic` | G5 | Toujours | Recopié sur `sepa_bic` |

### Section Co-souscripteur

Bloc affiché si `additional_signer_firstname` est renseigné, second bloc si `additional_signer2_firstname` l'est. Le co-souscripteur se déclare par l'onboarding : la modale **corrige, elle n'ajoute pas**. Une section vide n'est pas proposée.

| Champ | Colonne | Groupe | Écart avec la création |
| --- | --- | --- | --- |
| Nom, Prénom, Email, Téléphone du co-souscripteur | `additional_signer_lastname`, `_firstname`, `_email`, `_phone` | G4 | Absent de la création |
| Nom, Prénom, Email, Téléphone du second co-souscripteur | `additional_signer2_*` | G4 | **Ajout** : colonnes écrites par l'onboarding, non éditables en V1 (décision Q7) |

### Section Distribution

Section affichée si l'application compte au moins un partenaire. Les champs de rémunération n'apparaissent que si le module Commissions partenaires est actif.

| Champ | Colonne | Groupe | Écart avec la création |
| --- | --- | --- | --- |
| Partenaire | `id_partner` | G6a | = (liste filtrée sur les partenaires autorisés à distribuer le couple fonds et part, plus "En direct", avec lien "afficher tous les partenaires" qui lève le filtre et avertit). Corrige l'anomalie A10 |
| Conseiller | `id_partneruser` | G6a | Liste rechargée au changement de partenaire |
| Souscription assistée | `assisted` | G6b | **Ajout** : présent à la création, absent de l'édition V1 (anomalie A9). Actif seulement si un partenaire est sélectionné |
| Taux de commission | `commission` | G6c | Prérempli par le recalcul, modifiable. Un écart avec le taux partenaire sur la part est signalé |
| Exclure des rétrocessions | `noretro` | G6c | Absent de la création |

### Section Qualification

| Champ | Colonne | Groupe | Écart avec la création |
| --- | --- | --- | --- |
| Contact investisseur rattaché | `id_investorcontact` | G10 | **Ajout** : décide du destinataire de la réouverture et de l'audience investisseur de IC-5241. Modifiable nulle part en V1 (anomalie A13). Liste des contacts de l'investisseur, plus "Aucun" |
| Side letter requise | `sideletter_required` | G10 | **Ajout** : posé à la création depuis le module ventes, jamais modifiable ensuite. La confirmation reste une action de la fiche de contrôle (IC-5268) |

### Section Champs personnalisés

Affichée si au moins un champ personnalisé de l'objet `subscription` est visible en back-office. Groupe **G1** pour l'ensemble du bloc.

| Règle | Détail |
| --- | --- |
| Périmètre et ordre | Champs de l'app avec `object = subscription` et `hide_bo = 0`, triés sur `ordre`, un par ligne, avec l'aide contextuelle (clé `ci-field-<id>`) |
| Types de saisie | `text`, `textarea`, `select`, `select_multiple`, `checkbox`, `color`, `date`, `html` |
| Obligatoire back-office | `mandatory_bo = 1` ajoute une astérisque et bloque l'enregistrement si le champ est vide |
| Cascade | Un champ dont `id_parent > 0` n'apparaît que si le parent a une valeur, et ses options dépendent de cette valeur |
| Multilingue | `multilanguage = 1` et application multilingue : une valeur par langue |
| Masqué back-office | `hide_bo = 1` : ni affiché, ni écrasé à la sauvegarde |
| Stockage | JSON `souscriptions.fields` sous la forme `{id_field: {name, value}}` |

---

## 5. Comportements dynamiques

| Déclencheur | Conséquence |
| --- | --- |
| Changement de part | Bascule de modalité si la nouvelle part diffère, conservation du champ principal, recalcul du champ dérivé au prix de la nouvelle part, recalcul du taux de commission si un partenaire est sélectionné, avertissement rappelant que les documents déjà générés ne correspondent plus à la part |
| Changement de partenaire | Recalcul du taux (`getCommRate`, convention signée requise, sinon zéro), rechargement des conseillers, remise à Non de l'interrupteur assistée si le partenaire est vidé |
| Passage En direct | Assistée à Non, commission à zéro, conseiller vidé |
| Saisie hors bornes | Erreur bloquante du catalogue moteur. Si la souscription est exemptée parce que l'investisseur a déjà investi, le message devient un avertissement non bloquant |
| Arrondi | Avertissement non bloquant "Montant ajusté à X" (IC-5252) |
| Frais | Taux et montant liés, taux plafonné avec message si dépassement, frais à zéro autorisés |
| État du dossier | **Aucun champ ne se masque en fonction de l'état, il passe en lecture** |

---

## 6. Éditabilité : groupes et matrice par état

### 6.1 Groupes de champs

| Groupe | Champs |
| --- | --- |
| G1 Libellés et identifiants | Nom de la souscription, identifiant externe, identifiant CRM, langue, champs personnalisés |
| G2 Typologie du dossier | Type de souscripteur, structure |
| G3 Montants et parts | Part, nombre de parts, montant souscrit, frais d'entrée, prime |
| G4 Identité du souscripteur | Raison sociale, nom, prénom, email, téléphone, adresse, pays, date de naissance, nationalité, co-souscripteurs |
| G5 Coordonnées bancaires | IBAN, BIC |
| G6a Rattachement distribution | Partenaire, conseiller |
| G6b Souscription assistée | Assistée |
| G6c Rémunération | Taux de commission, exclusion des rétrocessions |
| G7 Mode de détention | Mode de détention |
| G8 Prélèvement | Prélèvement SEPA |
| G9 Conservation | Option de conservation |
| G10 Qualification | Type de souscription, side letter requise, contact investisseur rattaché |

### 6.2 Matrice

**O** modifiable · **L** lecture seule · **O\*** modifiable avec avertissement bloquant à confirmer · **E** lecture seule, déverrouillable par la correction exceptionnelle (droit dédié et motif).

| Groupe | Brouillon | Invitée | En cours | Prête à soumettre | En correction | Pré-val. partenaire | À contrôler | Validée, à envoyer | En signature | Active | Transférée | Annulée, Refusée, Expirée |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| G1 Libellés et identifiants | O | O | O | O | O | O | O | O | O | O | L | L |
| G2 Typologie | O | O | O | O | E | E | E | E | E | E | L | L |
| G3 Montants et parts | O | O | O | O | O | O | O | O | O\* | E | L | L |
| G4 Identité | O | O | O | O | O | O | O | O | O\* | O | L | L |
| G5 Bancaire | O | O | O | O | O | O | O | O | O\* | O | L | L |
| G6a Partenaire, conseiller | O | O | O | O | O | O | O | O | E | conseiller O, partenaire E | L | L |
| G6b Assistée | O | O | O | O | O | E | E | E | E | E | L | L |
| G6c Commission, exclusion | O | O | O | O | O | O | O | O | O | O | L | L |
| G7 Mode de détention | O | O | O | O | O | O | O | O | O | O | L | L |
| G8 Prélèvement | O | O | O | O | O | O | O | O | L | L | L | L |
| G9 Conservation | O | O | O | O | O | O | O | O | L | L | L | L |
| G10 Qualification | O | O | O | O | O | O | O | O | O | O | L | L |

### 6.3 Justification par groupe

| Groupe | Raison du verrouillage |
| --- | --- |
| G3 Montants | Ouverts avant activation, fermés sur Active (renvoi vers Réduction d'engagement et Transfert), correction exceptionnelle possible sur Active. En signature, la modification est acceptée après avertissement bloquant et **annule la procédure de signature** (décision Q2) |
| G2 Typologie | Fermée dès que le dossier a quitté la main de l'investisseur : changer le type de souscripteur désolidarise les réponses de l'onboarding qui les a posées. Reste fermée en correction, le dossier repart avec le même onboarding |
| G4, G5 Identité et bancaire | Ouverts sur tous les états non terminaux, Active incluse : c'est le back-office qui corrige une faute de frappe ou un changement d'adresse. En signature, même règle que les montants, les documents portent l'identité |
| G6a Distribution | Libre jusqu'à l'envoi en signature. Ensuite correction exceptionnelle : le partenaire est sur les documents et dans les rétrocessions. Le conseiller reste modifiable sur Active, c'est une réaffectation courante |
| G6b Assistée | Fermée dès la soumission : elle pilote la visibilité des sections et pièces de l'onboarding |
| G7 Mode de détention | Ouvert partout sauf terminaux, il se corrige souvent après activation à la demande du dépositaire |
| G8, G9 Prélèvement et conservation | Fermés dès l'envoi en signature : ils figurent sur les documents et, pour le prélèvement, ouvrent un mandat |
| G10 Qualification | Ouverte partout sauf terminaux, c'est la main du back-office |
| Terminaux | Tout en lecture. Une souscription transférée est une trace historique. L'annulation se défait par l'action Réactiver, pas par la modale |

### 6.4 Correspondance technique des états

Tant que l'état persistant de IC-5212 n'existe pas, le serveur déduit l'état des colonnes actuelles.

| État | Correspondance actuelle |
| --- | --- |
| Brouillon | `status` 0, `invited` 0, `self` 0, `is_complete` 0 |
| Invitée | `status` 0, `invited` 1, aucune réponse |
| En cours | `status` 0, `is_complete` 0, au moins une réponse, complétion < 100 % |
| Prête à soumettre | Idem avec complétion à 100 % |
| En correction | `status` 0, `is_complete` 0, `reopened` 1 |
| En pré-validation partenaire | `is_complete` 1, `partner_validation` 1 |
| À contrôler | `status` 0, `is_complete` 1, `partner_validation` ≠ 1 |
| Validée, à envoyer en signature | `status` 1, `signatures` vide |
| En signature | `status` 1, `signatures` non vide |
| Active | `status` 2, quel que soit `payment_status` |
| Transférée | `status` 5 |
| Annulée, Refusée, Expirée | N'existent pas encore (IC-5220, IC-5221, IC-5222) |

La matrice raisonne sur l'état technique, **jamais sur un statut personnalisé de fonds ou d'application**.

---

## 7. Verrous indépendants de l'état

Ces verrous s'appliquent quel que soit l'état, se cumulent avec la matrice et sont renvoyés par le serveur avec un code et un message.

| Verrou | Condition | Effet | Code |
| --- | --- | --- | --- |
| Lecture seule | Droit readonly, statut 1 | Tout en lecture | `readonly_right` |
| Demande de modification en attente | Ligne `subchanges` de statut 0 sur le champ (address, iban, subscription_name, company_name, lastname, email, phone) | Champ (ou groupe pour adresse et IBAN) en lecture, lien vers la demande. L'opérateur traite la demande d'abord | `pending_subchange` |
| Décompte de rétrocession généré | `id_decompte > 0` | Taux et exclusion en lecture, partenaire en correction exceptionnelle | `commission_settled` |
| Mandat SEPA approuvé | `sepa_status` = 2 | IBAN et BIC restent modifiables, la sauvegarde exige la confirmation "le mandat signé porte l'ancien IBAN, un nouveau mandat sera nécessaire" et remet `sepa_status` à 0 avec journalisation. G8 en lecture | `sepa_mandate_approved` |
| Mandat SEPA en attente | `sepa_status` = 1 | Même règle, sans remise à zéro : la procédure en cours est signalée | `sepa_mandate_pending` |
| Part indisponible | Part supprimée ou archivée | Montants et parts en lecture, message "Cette part n'est plus disponible, contactez le support" | `share_unavailable` |
| Marché secondaire | Offre de vente ou enchère en cours sur la souscription | Montants et parts en lecture | `secondary_market_locked` |
| Issue d'un transfert | `transfered_from > 0` | Montants et parts en correction exceptionnelle : le montant résulte du calcul de transfert | `transferred_in` |
| Flux financiers existants | Au moins un appel, une distribution ou un capital account rattaché | Montants et parts en correction exceptionnelle même hors Active. Motif enregistré avec valeurs avant et après | `financial_flows_exist` |
| Souscription parente ou liée | `id_mothersouscription > 0` ou `nb_linkedsubscriptions > 0` | Avertissement non bloquant : les souscriptions liées ne sont pas recalculées | `linked_subscriptions` |
| Onboarding commencé | Au moins une réponse enregistrée | Type de souscripteur en lecture même avant soumission. Déverrouillable par correction exceptionnelle, qui prévient de la perte des réponses | `onboarding_started` |
| Fonds hors périmètre | Fonds ou fonds maître non autorisé | Page inaccessible | `fund_out_of_scope` |
| Part restreinte | Part réservée à d'autres opérateurs (`parts_clients`) | Page inaccessible | `share_restricted` |

---

## 8. Paramètres qui modifient la modale

Seuls les settings ayant un effet sur l'édition sont listés. Les settings d'affichage sont dans IC-5117.

| Paramètre | Niveau | Effet sur la modale |
| --- | --- | --- |
| `CRM id for subscriptions` | Application | Affiche le champ Identifiant CRM |
| `Minimal subscription form` | Application | Masque Prime de souscription et Option de conservation |
| Application multilingue | Application | Affiche la liste Langue du dossier et les champs personnalisés multilingues |
| `Autoonboarding` | Application | Réaffecte l'onboarding au changement de type de souscripteur si le dossier est vierge |
| Commissions partenaires | Application | Affiche Taux de commission et Exclure des rétrocessions |
| `Calculate subscription amount with share nav` | Application | Le moteur utilise la dernière VL comme prix pour une part nouvellement sélectionnée |
| Bornes de montant minimum et exemptions | Application | Bornes appliquées par le moteur, exemption si l'investisseur a déjà investi |
| `Hide shares for admin subscriptions` | Application | Aucun effet : la saisie du nombre de parts reste possible |
| `Don't allow amount change for assisted subscription` | Application | Aucun effet : ce setting ne concerne que le portail investisseur |
| `Stay on subscription page` | Application | Sans objet en V3 |
| Champs personnalisés objet souscription | Application | Section Champs personnalisés, obligatoires BO, cascades, multilingue |
| Décimales, devise | Fonds | Précision du nombre de parts et format des montants |
| Modalité, prix, bornes, taux de frais maximum et plancher, seuil de gratuité, restriction opérateurs | Part | Champ principal et dérivé, bornes, plafond et plancher de frais, liste des parts proposées |
| Taux partenaire sur la part et statut de convention (`parts_partners`) | Partenaire et part | Recalcul du taux au changement de partenaire ou de part |
| Fonds activés, convention, `open shares without signature` | Partenaire | Filtre de la liste des partenaires autorisés |

---

## 9. Enregistrement : règles serveur et effets de bord

Le serveur applique les mêmes règles que le front et ne fait confiance à aucune décision du client.

| # | Règle |
| --- | --- |
| 1 | Authentification et droits : JWT, droit `campaigns-investors`, fonds dans le périmètre, part non restreinte. Sinon 403 |
| 2 | Verrou de version : la requête porte la date de dernière mise à jour lue à l'ouverture. Si la souscription a changé entre-temps, 409 et message "La souscription a été modifiée par ailleurs, rechargez la page" |
| 3 | Recalcul du contrat d'éditabilité à la sauvegarde depuis l'état réel en base. Tout champ reçu non modifiable est refusé, **même à valeur identique** : 422 avec le code du verrou. Le front n'envoie pas les champs en lecture |
| 4 | Correction exceptionnelle : si des champs de groupe E sont reçus, droit dédié requis et motif de 20 caractères minimum. Sinon 403 |
| 5 | Validation des valeurs : formats (email, IBAN par pays, identifiant CRM, date) et appartenances (la part au fonds, la structure à l'investisseur, le conseiller au partenaire, le partenaire à l'application, le type de souscription à l'application ou global, le pays, la langue), champs personnalisés obligatoires. Erreurs regroupées par champ dans une seule réponse 422 |
| 6 | Montants et parts : passage obligatoire par le moteur unique. Le serveur ne stocke jamais un triplet parts, prix, montant incohérent (anomalie A8). Le prix figé n'est réécrit qu'au changement de part |
| 7 | Effets de bord, dans l'ordre de la table ci-dessous |
| 8 | Journalisation : une ligne `souscriptionsactions` d'action `edit` par sauvegarde, **plus une ligne par champ modifié** portant nom du champ, ancienne valeur, nouvelle valeur, auteur, date et motif de correction exceptionnelle le cas échéant. Alimente IC-5214 et l'export du dossier (anomalie A12) |
| 9 | Notifications : aucune notification envoyée par la modification elle-même. Les événements qui en découlent relèvent de IC-5241 |
| 10 | Réponse : la souscription rechargée, le contrat d'éditabilité recalculé, et la liste des effets appliqués, que le front affiche en confirmation ("Taux de commission recalculé à 2 %", "Conseiller retiré", "Onboarding réaffecté") |

### Effets de bord, dans l'ordre

| Ordre | Condition | Effet |
| --- | --- | --- |
| 1 | Dossier En signature et changement dans G3, G4 ou G5 | Annulation de la procédure chez le prestataire, remise à vide des données de signature et de la date d'envoi, retour à l'état Validée à envoyer en signature, journalisation de l'annulation avec le champ déclencheur. La relance de la signature reste une action explicite de l'opérateur |
| 2 | Partenaire ou part changé et aucun taux saisi par l'opérateur | Recalcul de la commission |
| 3 | Conseiller n'appartenant plus au partenaire | Conseiller vidé |
| 4 | Plus de partenaire | Assistée remise à Non |
| 5 | Type de souscripteur changé, dossier vierge, `Autoonboarding` actif | Réaffectation de l'onboarding |
| 6 | IBAN ou BIC changé | Recopie sur `sepa_iban` et `sepa_bic`, sauf mandat approuvé ou en attente : remise à zéro du statut de mandat après confirmation |
| 7 | Type de souscription changé | Pose de l'auteur et de la date de qualification |
| 8 | Champs personnalisés | Écriture sans toucher aux champs masqués en back-office |

### Contrat front / back

| Endpoint | Rôle |
| --- | --- |
| `GET /subscription/{id}/edit-form` | Valeurs courantes, `version`, `state`, `access` (readOnly, exceptionalEdit), `fields[x]` (editable, exceptional, lock, message, link), `options` (parts, structures, partenaires, conseillers, pays, types, langues, contacts, champs personnalisés), `display` (booléens d'affichage conditionnel) |
| `PUT /subscription/{id}` | `version`, champs modifiés uniquement, `exceptionalReason` si besoin. 200 avec souscription rechargée, nouveau contrat et `appliedSideEffects` ; 409 conflit de version ; 422 erreurs par champ avec code et message ; 403 droit manquant |
| `GET /partners/{id}/advisers` | Conseillers d'un partenaire, appelé au changement de partenaire |

Règle : toute divergence entre ce que le front affiche et ce que le serveur accepte est un défaut du serveur, pas du front.

---

## 10. Champs volontairement exclus de la modale

| Champ | Où il se modifie |
| --- | --- |
| Dates du cycle de vie (`date_*`, `acquisition_date`, `availability_date`, `processing_date`) | Actions du cycle de vie et saisie de la date de VL sur la fiche active. Une édition libre fabriquerait un passé, à rebours de IC-5219 |
| État, statut de paiement, validation interne, pré-validation partenaire | Actions et leurs transitions |
| Engagement réduit (`new_amount`, `reduced`) | Action Réduction d'engagement, qui historise ancien et nouveau montant |
| Notes internes | Onglet Notes |
| Signataires | Bloc Signataires et ses actions |
| Réponses du dossier | Fiche de contrôle, avec journalisation et propagation (IC-5264) |
| Investisseur porteur | Action de réaffectation dédiée, avec resynchronisation des données copiées (décision Q8) |

---

## 11. Critères d'acceptance

**Ouverture et droits**
1. Un opérateur en lecture seule ne voit pas le bouton Modifier, et l'appel direct de l'endpoint de lecture renvoie 403.
2. L'ouverture de la modale sur une souscription d'une autre application renvoie 403, sans charger le formulaire.
3. Sur une souscription transférée, la modale s'ouvre en lecture intégrale avec le bandeau d'explication.
4. Sans le droit `subscriptions-exceptional-edit`, l'interrupteur Correction exceptionnelle n'est pas rendu.

**Éditabilité**
5. Chaque champ non modifiable affiche sa valeur, l'infobulle et la raison du verrou.
6. Sur un dossier Active, les montants sont en lecture avec renvoi vers Réduction d'engagement et Transfert, et deviennent modifiables après activation de la correction exceptionnelle avec un motif de 20 caractères.
7. Sur un dossier En signature, la modification d'un montant, de l'identité ou de l'IBAN affiche une confirmation bloquante annonçant l'annulation de la signature, et l'enregistrement ramène le dossier à Validée à envoyer en signature.
8. Un champ portant une demande de modification en attente est en lecture avec le lien vers la demande.
9. Un décompte de rétrocession généré met taux et exclusion en lecture et le partenaire en correction exceptionnelle.
10. Une souscription avec au moins un appel de fonds met les montants en correction exceptionnelle même hors état Active.

**Saisie et effets**
11. Le prix de la part est en lecture avec la mention "figé à la création", et ne change qu'au changement de part.
12. Le changement de partenaire recalcule le taux de commission, recharge les conseillers et vide le conseiller devenu invalide.
13. Activer le prélèvement SEPA ne met pas le mandat à Approuvé, et le désactiver sur un mandat approuvé demande confirmation avant de remettre le statut à zéro.
14. Modifier le type de souscription pose l'auteur et la date de qualification et journalise l'opération.
15. La nationalité saisie est relue à l'identique après enregistrement.
16. La liste des pays s'affiche dans la langue de l'opérateur.
17. Un champ personnalisé obligatoire en back-office vide bloque l'enregistrement, un champ masqué n'est pas écrasé.

**Serveur**
18. Un `PUT` portant un champ non modifiable renvoie 422 avec le code du verrou, même si la valeur est inchangée.
19. Un `PUT` dont la version ne correspond plus renvoie 409, sans écriture partielle.
20. Un `PUT` de correction exceptionnelle sans motif ou avec un motif trop court renvoie 403.
21. Chaque sauvegarde produit une ligne d'action et une ligne de journal par champ modifié, avec ancienne et nouvelle valeur.
22. La réponse liste les effets de bord appliqués, et le front les affiche en confirmation.

---

## 12. Découpage proposé

| Story | Intitulé | Dépendances |
| --- | --- | --- |
| S1 | Ouvrir la modale de modification préchargée avec le contrat d'éditabilité | IC-5117 (widget), endpoint de lecture |
| S2 | Modifier les libellés, identifiants, mode de détention et qualification | S1 |
| S3 | Modifier l'identité et les coordonnées bancaires, avec verrous de demande en attente et de mandat SEPA | S1 |
| S4 | Modifier la distribution : partenaire, conseiller, assistée, commission, avec recalcul et verrou décompte | S1 |
| S5 | Modifier les montants et parts par le moteur unique, avec encadrement par l'état | S1, IC-5250, IC-5253, IC-5255 |
| S6 | Modifier les champs personnalisés de la souscription | S1 |
| S7 | Correction exceptionnelle sous droit dédié et motif | S5, IC-5217 pour le droit |
| S8 | Journaliser chaque modification champ par champ | S2 à S7, alimente IC-5214 |
| S9 | Refuser côté serveur toute modification hors contrat d'éditabilité et gérer le conflit de version | S1 |
| S10 | Annuler la procédure de signature en cours sur modification d'un dossier en signature | S3, S5, epic signature |

---

## 13. Anomalies V1 corrigées par ce ticket

| # | Constat V1 | Traitement |
| --- | --- | --- |
| A1 | L'édition n'a aucune vérification d'état, tout est modifiable à tout stade | Matrice de la section 6 |
| A2 | Activer le prélèvement force le mandat à Approuvé sans signature | Section 4, Prélèvement SEPA |
| A3 | La nationalité est castée en entier alors que la colonne est un texte, toute saisie devient 0 | Écriture texte, liste de pays |
| A4 | Un mode de détention nul s'affiche Pur et est écrit 9 à la première sauvegarde | Option Non renseigné, valeur nulle préservée |
| A5 | La qualification depuis la modale ne pose ni auteur ni date | Effet de bord unifié avec la fiche de contrôle |
| A6 | Le changement de partenaire ne recalcule pas la commission et ne contrôle pas le conseiller | Recalcul et contrôle, effets 2 et 3 |
| A7 | Le chargement de la modale ne vérifie ni droit ni appartenance à l'application | Contrôle complet à l'ouverture |
| A8 | Parts, prix et montant sont trois champs libres, le serveur accepte un triplet incohérent | Moteur unique, prix figé en lecture |
| A9 | La souscription assistée est modifiable à la création et nulle part ensuite | Ajout en section 4 |
| A10 | La liste des partenaires n'est pas filtrée sur les partenaires autorisés à distribuer la part | Filtre avec levée explicite |
| A11 | Le pays n'est proposé qu'en français | Langue de l'opérateur |
| A12 | Le journal ne porte qu'un libellé générique, sans les valeurs modifiées | Journal champ par champ |
| A13 | Le contact investisseur rattaché n'est modifiable nulle part | Ajout en section 4 |
