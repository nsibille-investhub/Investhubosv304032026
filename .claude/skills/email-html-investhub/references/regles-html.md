# Règles d'intégration HTML pour les emails

Chaque règle est suivie du client qui la motive et du code que le script `lint_email_html.py` renvoie quand elle n'est pas respectée. Une règle sans code n'est pas vérifiable automatiquement : elle se vérifie à la relecture.

## 1. Structure du fichier

| Règle | Pourquoi | Code |
|---|---|---|
| Doctype XHTML 1.0 Transitional ou HTML 4.01 Transitional | Le doctype HTML5 change le rendu des images inline et des espaces dans plusieurs clients, et certains le réécrivent de toute façon | `DOCTYPE` |
| UTF-8 déclaré dans un `<meta http-equiv="Content-Type">` | Accents et symboles cassés sinon chez les clients qui ignorent l'en-tête MIME | `CHARSET` |
| `lang="fr"` (ou `en`) sur `<html>` | Lecteurs d'écran, correcteurs, traduction automatique de Gmail | `LANG` |
| CSS inline sur chaque balise ; `<style>` réservé aux media queries, au dark mode et aux resets non inlinables | Gmail et plusieurs webmails suppriment ou ignorent tout ou partie du `<style>` | relecture |
| Bloc `<style>` sous 8 192 caractères | Au-dessus, Gmail supprime le bloc entier | `STYLE-8K` |
| Aucune erreur de syntaxe dans le `<style>` | Une accolade manquante et Gmail supprime le bloc entier | `STYLE-SYNTAX` |
| Aucune `background-image` dans le `<style>` | Gmail supprime le bloc entier | `STYLE-BGIMG` |
| Aucun commentaire HTML dans un `<style>` | Yahoo supprime tout ce qui suit le commentaire | `STYLE-COMMENT` |
| Source HTML sous 100 Ko, images non comptées | Gmail tronque le message à 102 Ko et affiche "Afficher l'intégralité du message" | `POIDS` |
| Zéro JavaScript, `<form>`, `<iframe>`, `<svg>`, `<button>` | Supprimés ou bloqués par tous les clients majeurs, signal spam | `BALISE-INTERDITE` |
| Bloc `OfficeDocumentSettings` avec `PixelsPerInch` à 96 | Outlook applique sinon la mise à l'échelle DPI de Windows aux largeurs en pixels | `MSO-DPI` |

## 2. Mise en page

| Règle | Pourquoi | Code |
|---|---|---|
| Tableaux imbriqués avec `role="presentation"` | Sans le rôle, les lecteurs d'écran annoncent chaque table comme un tableau de données | `TABLE-ROLE` |
| `cellpadding="0" cellspacing="0" border="0"` sur chaque table | Valeurs par défaut non nulles dans Outlook et certains webmails | `TABLE-ATTR` |
| `width` en attribut HTML sur chaque table | Outlook et Samsung Mail lisent l'attribut, pas le CSS | `TABLE-WIDTH` |
| Padding sur les `<td>`, jamais sur `<div>` ni `<img>` | Outlook ignore le padding des `<div>` et des `<img>` | `PADDING-DIV`, `PADDING-IMG` |
| Largeur cible 600 px, conteneur `width="100%"` en attribut avec `max-width:600px`, ghost table MSO à 600 | 600 px passe dans tous les volets de lecture ; l'attribut sert Samsung Mail, le `max-width` sert Gmail et Apple, la ghost table sert Outlook | `OUTLOOK-MAXWIDTH` |
| Une seule colonne sur mobile ; colonnes desktop en tables fluides `align="left"` dans une ghost table, empilées par media query | Outlook n'a pas de media queries, la ghost table fixe ses colonnes ; les autres clients empilent naturellement | relecture |
| Pas de flexbox, grid, `position`, `box-shadow`, `transform`, `animation`, `transition` | Non supportés par Outlook, supprimés par Gmail | `CSS-INTERDIT` |
| Boutons en `<td>` avec `bgcolor` + padding + lien texte, VML en conditionnel MSO | Outlook ignore le padding d'un `<a>` : seul le texte reste cliquable | `BOUTON-A`, `BOUTON-VML` |
| Jamais un CTA en image seule | Images bloquées par défaut dans Outlook et de nombreux clients d'entreprise | relecture |
| Zones cliquables de 44 x 44 px minimum | Recommandation d'accessibilité tactile, évite les erreurs de clic sur mobile | `BOUTON-44` |
| Pas de `height` en CSS sur une image responsive | Yahoo convertit `height` en `min-height`, ce qui invalide `height:auto` et déforme l'image | `IMG-CSS-HEIGHT` |
| `!important` collé à la valeur, sans espace | Yahoo supprime la déclaration si un espace précède `!important` | `IMPORTANT` |

## 3. Outlook (moteur Word)

| Règle | Pourquoi | Code |
|---|---|---|
| Garder ghost tables, VML et commentaires conditionnels | Tant que la part Outlook legacy de la base n'est pas mesurée sous 10 %, c'est la seule façon d'obtenir un rendu correct | relecture |
| Forcer Arial ou Helvetica dans un `<!--[if mso]><style>` | Sans ça, une web font ne dégrade pas vers le fallback déclaré : Outlook tombe en Times New Roman | `MSO-FONT` |
| Pas de `border-radius`, `max-width`, image de fond CSS, dégradé : aplats uniquement | Outlook les ignore. Le design doit tenir en angles droits et en couleurs pleines | `OUTLOOK-RADIUS`, `OUTLOOK-MAXWIDTH`, `CSS-INTERDIT` |
| `mso-line-height-rule:exactly` sur chaque bloc de texte | Outlook arrondit sinon l'interlignage à la hausse | `MSO-LH` |
| Vérifier que les commentaires conditionnels restent inoffensifs dans New Outlook | New Outlook les ignore et rend la version standard : la version standard doit donc être complète par elle-même | relecture |

Syntaxe des conditionnels :

```html
<!--[if mso]> visible seulement dans Outlook Windows <![endif]-->
<!--[if !mso]><!-- --> visible partout sauf Outlook Windows <!--<![endif]-->
<!--[if gte mso 9]> Outlook 2000 et plus <![endif]-->
```

## 4. Typographie

| Règle | Pourquoi | Code |
|---|---|---|
| Pile `'DM Sans', Helvetica, Arial, sans-serif` | DM Sans se charge dans Apple Mail et iOS, Helvetica sur Mac, Arial partout ailleurs | `FONT-STACK` |
| Corps à 16 px, jamais sous 14 px | Lisibilité mobile ; iOS agrandit d'office ce qui est sous 13 px et casse la mise en page | `FONT-MIN` |
| Interlignage 1.4 à 1.5 | Lisibilité, et marge suffisante pour les arrondis d'Outlook | `INTERLIGNAGE` |
| Contraste 4.5:1 pour le texte courant, 3:1 pour les titres, en clair et en sombre | WCAG AA. Vérifier avec `--contrast` | manuel |

## 5. Images

| Règle | Pourquoi | Code |
|---|---|---|
| `width`, `alt`, `display:block` sur chaque `<img>` | `width` pour Outlook et Samsung, `alt` pour les images bloquées, `display:block` contre l'espace fantôme sous l'image | `IMG-WIDTH`, `IMG-ALT`, `IMG-BLOCK` |
| `height` en attribut sur les images à taille fixe | La mise en page ne saute pas pendant le chargement | `IMG-HEIGHT` |
| `alt=""` sur les images décoratives | Un lecteur d'écran ne lit rien plutôt qu'un nom de fichier | relecture |
| Alt text stylé (font-size, color, font-family) | Gmail et Outlook affichent l'alt avec les styles de l'image : lisible images bloquées | `IMG-ALT-STYLE` |
| PNG ou JPG en HTTPS sur un domaine stable, retina x2 redimensionné par `width` | Base64 bloqué par Gmail et Outlook, HTTP mixte bloqué, WebP et SVG non supportés par Outlook | `IMG-HTTPS`, `IMG-BASE64` |
| Aucune information critique en image | L'email doit rester compréhensible images désactivées | relecture |

## 6. Dark mode

| Règle | Pourquoi | Code |
|---|---|---|
| `<meta name="color-scheme" content="light dark">` et `<meta name="supported-color-schemes" content="light dark">` | Sans ces déclarations, Apple Mail n'applique pas vos styles sombres et impose sa propre inversion | `DARKMODE` |
| `@media (prefers-color-scheme: dark)` dans le `<style>` | Apple Mail, Outlook Mac, Thunderbird appliquent vos couleurs sombres | `DARKMODE` |
| Off-white `#FAFAFA` plutôt que `#FFFFFF`, gris foncé `#222222` plutôt que `#000000` | Le blanc et le noir purs déclenchent l'inversion la plus agressive dans Gmail et Outlook | `DARKMODE-PUR` |
| Logo posé sur un aplat foncé, pas de PNG transparent qui suppose un fond blanc | Un logo sombre sur fond transparent disparaît une fois le fond inversé | relecture |
| Accepter de ne rien contrôler sur Gmail iOS, Gmail Android et Outlook | Ces clients inversent sans lire vos styles : concevoir pour que l'inversion reste acceptable (contrastes forts, aplats) | relecture |

Les surcharges dark mode ciblent des classes (`.dm-card`, `.dm-text`) et utilisent `!important` collé à la valeur, sinon le CSS inline gagne.

## 7. Accessibilité

| Règle | Pourquoi | Code |
|---|---|---|
| `role="presentation"` sur toutes les tables de mise en page | Voir section 2 | `TABLE-ROLE` |
| Hiérarchie sémantique réelle : un `<h1>`, des `<h2>`, `<p>`, listes | Navigation au lecteur d'écran par titres | `H1`, `SEMANTIQUE` |
| Libellés de liens explicites, jamais "cliquez ici" | Un lecteur d'écran liste les liens hors contexte ; les filtres anti-spam pénalisent aussi | `LIEN-GENERIQUE` |
| Aucune information portée par la seule couleur | Daltonisme, dark mode, impression noir et blanc | relecture |
| Lecture au clavier et zoom 200 % vérifiés | Le zoom 200 % révèle les largeurs fixes qui débordent | manuel |

## 8. Arbitrages entre règles

Plusieurs règles ci-dessus se contredisent si on les lit au pied de la lettre. Voici la position du skill.

`max-width` alors qu'Outlook l'ignore : le conteneur porte `width="100%"` en attribut et `max-width:600px` en CSS, et il est encadré d'une ghost table MSO `width="600"`. Outlook lit la ghost table, les autres lisent le `max-width`. Un `max-width` sans ghost table dans le fichier est une erreur ; avec ghost table, il ne déclenche rien.

`border-radius` : le skill livre en angles droits par défaut, conformément à la règle "aplats uniquement". Si l'opérateur veut des arrondis, ils se posent sur le `<td>` du bouton et sur `arcsize` du `<v:roundrect>`, en acceptant l'alerte `OUTLOOK-RADIUS` : c'est une amélioration progressive, pas une dépendance.

`height` sur les images : les règles demandent `height` en attribut sur chaque image et interdisent `height` en CSS sur les images responsives. Une image pleine largeur avec `height="300"` en attribut et `width:100%` en CSS serait écrasée sur mobile (l'attribut vaut un `height:300px`), et `height:auto` en CSS est neutralisé par Yahoo. Position : image à taille fixe (logo, picto) = `width` + `height` en attributs ; image pleine largeur = `width` en attribut, `width:100%` en CSS, aucun `height`. Le navigateur recalcule la hauteur depuis le ratio natif.

Preheader masqué alors que Google déconseille le contenu caché : le preheader reste toléré s'il est court, cohérent avec l'objet et sans bourrage de mots-clés. En cas de doute, le supprimer : la première ligne visible sert de preheader.

Resets dans le `<style>` : `-webkit-text-size-adjust`, `mso-table-lspace`, `a[x-apple-data-detectors]` ne peuvent pas tous être inlinés. Ils restent dans le `<style>`, sous les media queries, et comptent dans la limite de 8 192 caractères.

Web font : le `<link>` Google Fonts se place dans un `<!--[if !mso]><!-- -->` pour qu'Outlook ne le voie pas, et un `<!--[if mso]><style>` force Arial. Gmail ignore le `<link>` et retombe sur Helvetica ou Arial : c'est attendu.

Fragments de gabarit (mode B) : sans `<head>`, pas de media queries ni de dark mode. Le fragment est donc à une seule colonne par construction et ses couleurs doivent rester acceptables une fois inversées. Si la plateforme accepte un jour un document complet, passer en mode A.
