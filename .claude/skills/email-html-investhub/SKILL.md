---
name: email-html-investhub
description: "Activer ce skill dès qu'il faut produire, corriger ou auditer du HTML destiné à partir par email : email marketing ou transactionnel, newsletter, invitation, relance, annonce, gabarit de mail de la plateforme InvestHub (Starter Pack, variables $prenom, $link...), ou tout fragment HTML affiché dans un client mail. Déclencheurs : 'génère un email HTML', 'code-moi ce mail', 'gabarit de mail', 'template mail', 'intègre cette newsletter', 'rends ce mail compatible Outlook / Gmail / dark mode', 'vérifie ce HTML d'email', 'version texte de ce mail', 'pourquoi ce mail s'affiche mal', ou toute demande où le livrable est un HTML envoyé par mail, même sans le mot HTML. Le skill impose tableaux imbriqués, CSS inline, 600 px, boutons VML, dark mode, accessibilité et délivrabilité, fournit squelette et blocs conformes, et contrôle le résultat par script avant livraison. À utiliser avec product-newsletter-investhub (qui décide du contenu) : ce skill prend la main dès qu'on écrit le HTML."
---

# SKILL - Intégration HTML des emails InvestHub

## Identité du skill

Ce skill produit du HTML d'email qui s'affiche correctement partout où InvestHub envoie : Gmail web et mobile, Outlook classique (moteur Word), New Outlook, Apple Mail, Yahoo, Orange, Free, Samsung Mail. Il couvre deux livrables :

- Mode A, email complet : newsletter, annonce, invitation, relance, communication ad hoc. Un document HTML autonome, prêt à coller dans l'outil d'envoi.
- Mode B, gabarit de plateforme : un fragment HTML injecté par InvestHub dans son enveloppe pour les mails transactionnels (Starter Pack, 112 gabarits, variables `$prenom`, `$link`, `$appname`...). Pas de doctype ni de `<head>`, tout le reste s'applique.

Le skill ne décide pas du contenu éditorial d'une newsletter (c'est `product-newsletter-investhub`) ni du ton (`product-manager-investhub`, `no-ai-style`). Il prend la main dès qu'on écrit du HTML. Quand `product-newsletter-investhub` est actif, son template `assets/email-template.html` et sa checklist de conformité sont remplacés par ceux de ce skill : ils tolèrent des pratiques qui cassent le rendu (image de fond CSS dans l'en-tête, border-radius, tailles sous 14 px, doctype HTML5, SVG inline).

## Pourquoi des tableaux

Les clients mail n'ont pas de moteur de rendu commun. Outlook Windows utilise le moteur de Word : il ignore flexbox, grid, max-width, border-radius, les images de fond CSS et le padding sur les `<div>`. Gmail supprime tout bloc `<style>` qui dépasse 8 192 caractères, contient une erreur de syntaxe ou une `background-image`. Yahoo supprime les `!important` précédés d'un espace et tout ce qui suit un commentaire dans un `<style>`. Samsung Mail se cale sur l'attribut HTML `width`, pas sur le CSS. La seule structure qui tient partout : des tableaux imbriqués, du CSS inline sur chaque balise, et des commentaires conditionnels pour Outlook. Ce n'est pas un choix esthétique, c'est le plus petit dénominateur commun.

## Workflow

### Étape 0 : cadrage

Ne demander que ce qui manque, et proposer une valeur par défaut à chaque fois.

- Mode A ou B ? Si le mail est déclenché par une action sur la plateforme (souscription, appel de fonds, signature, KYC, rachat...), c'est le mode B.
- Langue : fr, en, ou les deux (un gabarit de plateforme existe toujours en FR et en EN).
- Contenu fourni ou à rédiger ? Objet, preheader, CTA principal.
- Visuels : URL HTTPS sur un domaine stable ? Sinon, bloc typographique sur aplat de couleur. Jamais de base64, jamais d'image de fond, jamais de SVG.
- Mode A : identité de l'expéditeur pour le pied (raison sociale, adresse postale), variable de désabonnement de l'outil d'envoi, lien miroir.
- Mode B : slug ou section du gabarit, destinataire (investisseur, partenaire, équipe), variables réellement disponibles au point d'envoi.

Données : aucun nom, email, IBAN, montant réel ou document client dans les exemples et les aperçus. Prénoms fictifs acceptés (Camille, Sofia).

### Étape 1 : contenu

Si le contenu est à rédiger : vouvoiement, une idée par phrase, présent de l'indicatif, vocabulaire InvestHub (part, fonds, investisseur, distributeur ou partenaire, souscription). Libellés de liens qui décrivent la destination ("Compléter mon dossier", jamais "cliquez ici"). Toute information qui compte est dans le texte : l'email doit rester compréhensible images bloquées, et aucune information ne repose sur la seule couleur.

Structure type : surtitre facultatif, un seul `<h1>`, paragraphes à 16 px, un CTA principal, blocs secondaires, pied de page.

Mode B : vérifier chaque variable dans `src/utils/mailTemplateVariables.ts` (clés de l'objet `DESCRIPTIONS`). Une variable absente du catalogue n'est pas remplacée à l'envoi : le destinataire verrait `$montant` en clair. Ne jamais en inventer. Si une donnée manque, la proposer comme variable à créer dans le récap, pas dans le HTML.

Le catalogue ne dit pas ce qui est réellement injecté à chaque point d'envoi. Cette information est dans `src/utils/starterPack/section-*.ts` : le tableau `variables` d'un gabarit liste ce que le back passe vraiment, `proposedVariables` ce qui manque encore côté code. Avant d'utiliser une variable, regarder les gabarits voisins de la même section. Une variable présente au catalogue mais jamais dans un tableau `variables` de la section (le script la signale en alerte `VARIABLE-NON-VERIFIEE`) doit être confirmée avec l'équipe back et listée dans le récap comme point à vérifier.

### Étape 2 : intégration

Partir toujours d'un asset, jamais d'une page blanche :

- Mode A : copier `assets/squelette-email.html`, retirer les blocs inutiles, dupliquer ceux qu'il faut.
- Mode B : copier `assets/gabarit-plateforme-exemple.html`.
- Blocs supplémentaires (liste, tableau récapitulatif, picto + texte, code à usage unique, bandeau) : `assets/blocs.md`.

Règles d'or pendant l'assemblage. Le détail, client par client, et les arbitrages sont dans `references/regles-html.md`.

1. Tables imbriquées, `role="presentation" cellpadding="0" cellspacing="0" border="0"` et `width` en attribut HTML sur chacune.
2. Conteneur `width="100%"` avec `max-width:600px`, encadré d'une ghost table MSO `width="600"`. Sans la ghost table, `max-width` est une erreur.
3. CSS inline sur chaque balise. Le `<style>` du `<head>` ne porte que les media queries, le dark mode et les quelques resets non inlinables. Moins de 8 192 caractères, zéro commentaire HTML, zéro `background-image`, `!important` collé à la valeur.
4. Padding sur les `<td>` uniquement, jamais sur `<div>` ni `<img>`.
5. Texte : `'DM Sans', Helvetica, Arial, sans-serif`, corps 16 px, rien sous 14 px, interlignage 1.4 à 1.5, `mso-line-height-rule:exactly` sur chaque bloc de texte. Arial forcé pour Outlook dans un `<!--[if mso]>`.
6. Images : `width`, `alt`, `display:block`, HTTPS, alt stylé (police, taille, couleur). Image à taille fixe : `height` en attribut. Image pleine largeur : `width` en attribut à la largeur de rendu, `width:100%` en CSS, aucun `height` ni en attribut ni en CSS.
7. Boutons : `<td bgcolor>` + padding + lien texte, `<v:roundrect>` en conditionnel MSO, 44 px de haut minimum. Jamais un CTA en image seule.
8. Aplats de couleur uniquement : pas de dégradé, pas d'ombre, pas d'arrondi, pas d'image de fond.
9. Dark mode : les deux `<meta>` color-scheme, `@media (prefers-color-scheme: dark)`, `#FAFAFA` plutôt que `#FFFFFF`, `#222222` plutôt que `#000000`, logo posé sur un aplat foncé.
10. Une seule colonne sur mobile. Les colonnes desktop sont des tables fluides `align="left"` dans une ghost table MSO, empilées par media query.
11. Zéro `<script>`, `<form>`, `<iframe>`, `<svg>`, `<button>`.
12. Hiérarchie sémantique réelle : `<h1>`, `<h2>`, `<p>`, `<ul>`, même si tout est posé dans des `<td>`.

### Étape 3 : contrôle

Lancer le script avant toute livraison :

```
python3 <dossier-du-skill>/scripts/lint_email_html.py email.html --text-out email.txt
python3 <dossier-du-skill>/scripts/lint_email_html.py gabarit.html --fragment
```

Dans ce dépôt, le dossier du skill est `.claude/skills/email-html-investhub`. Le script n'a aucune dépendance hors bibliothèque standard Python.

Zéro erreur est la condition de livraison. Chaque alerte restante est corrigée ou justifiée en une ligne dans le récap. En mode fragment, le script vérifie aussi que chaque variable `$` existe dans le catalogue de la plateforme. L'option `--text-out` produit la version texte brut à joindre à l'envoi.

Contraste : `--contrast "#456B6C" "#FAFAFA"` pour tout couple texte / fond qui n'est pas dans la charte ci-dessous. Minimum 4.5:1 pour le texte courant, 3:1 pour les titres, à vérifier en clair et en sombre.

Puis relire le fichier avec ces questions : l'email reste-t-il compréhensible images bloquées ? Le CTA a-t-il un libellé explicite ? Tous les liens pointent-ils vers un domaine InvestHub ou client, jamais vers Jira ou Confluence ? Le pied porte-t-il l'expéditeur, le désabonnement et le lien miroir (mode A) ?

### Étape 4 : livraison

Produire :

1. Le fichier HTML, et le `.txt` en mode A.
2. Un récap court : objet et preheader proposés, poids du HTML, résultat du script (erreurs, alertes justifiées), variables utilisées et variables manquantes à créer (mode B), points restant à tester.
3. Les tests avant envoi à rappeler à l'opérateur : rendu sur Gmail web, Gmail Android, Outlook classique, New Outlook, Apple Mail iOS, Orange et Free ; images bloquées ; dark mode ; zoom 200 % ; troncature Gmail ; tous les liens cliqués ; désabonnement testé de bout en bout ; envoi test sur une adresse de chaque FAI cible.

Si la demande touche à l'objet, à l'expéditeur, au preheader ou à l'infrastructure d'envoi, s'appuyer sur `references/delivrabilite.md` et joindre au récap une fiche d'envoi.

## Charte InvestHub appliquée à l'email

Contrastes vérifiés avec le script.

| Usage | Valeur |
|---|---|
| Fond de page | `#D9D8CB` |
| Conteneur | `#FAFAFA` (jamais `#FFFFFF`) |
| Texte principal | `#000E2B` |
| Texte secondaire, mentions | `#456B6C` (5.6:1 sur `#FAFAFA`) |
| Liens dans le texte | `#0A3D4A` |
| En-tête et pied | fond `#000E2B`, texte `#B4AEA4`, liens `#CBFF99` |
| Bouton | fond `#CBFF99`, texte `#000E2B`, angles droits |
| Dark mode | page `#0B1220`, conteneur `#161C2C`, texte `#F2F2F2`, secondaire `#B4AEA4` |

Typographie : DM Sans chargée via Google Fonts pour Apple Mail et iOS, Helvetica puis Arial partout ailleurs, Arial forcé dans Outlook. La FH 1089 italique de la charte marketing ne se charge dans aucun client majeur : ne l'utiliser que si le rendu Georgia italique convient, jamais sur un mot porteur de sens. Tailles : corps 16/24, h1 30/38 (26/32 sur mobile), h2 20/26, mentions et pied 14/20.

Le lime `#CBFF99` reste réservé aux éléments d'action et aux étiquettes courtes, jamais en fond de grande surface.

## Ce que ce skill ne couvre pas

- Le choix des features et la rédaction marketing d'une newsletter : `product-newsletter-investhub`.
- L'envoi, la configuration de l'outil d'emailing, SPF, DKIM, DMARC : le skill rappelle les prérequis mais ne les paramètre pas.
- Les écrans de la plateforme qui affichent et éditent les gabarits (`src/components/settings/MailTemplate*.tsx`) : c'est du code produit, soumis aux conventions du CLAUDE.md, pas de l'email.

## Références internes

- `assets/squelette-email.html` : document complet conforme, mode A, tous les blocs de base.
- `assets/gabarit-plateforme-exemple.html` : fragment conforme avec variables, mode B.
- `assets/blocs.md` : blocs prêts à coller, avec la raison de chaque choix.
- `references/regles-html.md` : les règles, client par client, et les arbitrages entre règles qui se contredisent.
- `references/delivrabilite.md` : objet, expéditeur, preheader, infrastructure, tests avant envoi.
- `scripts/lint_email_html.py` : contrôle automatique, vérification des variables, version texte, contraste.
