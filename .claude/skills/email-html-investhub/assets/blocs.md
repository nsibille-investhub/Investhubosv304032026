# Blocs prêts à coller

Tous les blocs supposent le conteneur du squelette : 600 px, padding horizontal 40 px, donc 520 px utiles. Adapter les largeurs si le padding change. Chaque bloc se pose dans un `<tr><td class="px" style="padding:...">` du conteneur. La pile de polices est toujours `'DM Sans', Helvetica, Arial, sans-serif`.

Sommaire :
1. Paragraphe, titres, surtitre
2. Bouton
3. Image fixe et image pleine largeur
4. Picto + texte côte à côte
5. Liste à puces
6. Tableau récapitulatif libellé / valeur
7. Encadré et bandeau
8. Code à usage unique
9. Filet et espaceur
10. Preheader
11. Pied de page (mode A) et enveloppe Starter Pack (mode B)
12. Dark mode et media queries

## 1. Paragraphe, titres, surtitre

```html
<p class="dm-muted" style="margin:0 0 12px 0; font-family:'DM Sans', Helvetica, Arial, sans-serif; font-size:14px; line-height:20px; mso-line-height-rule:exactly; font-weight:600; letter-spacing:1px; text-transform:uppercase; color:#456B6C;">Surtitre</p>
<h1 class="h1 dm-text" style="margin:0 0 16px 0; font-family:'DM Sans', Helvetica, Arial, sans-serif; font-size:30px; line-height:38px; mso-line-height-rule:exactly; font-weight:700; color:#000E2B;">Titre principal</h1>
<h2 class="dm-text" style="margin:0 0 8px 0; font-family:'DM Sans', Helvetica, Arial, sans-serif; font-size:20px; line-height:26px; mso-line-height-rule:exactly; font-weight:700; color:#000E2B;">Titre de section</h2>
<p class="dm-text" style="margin:0 0 16px 0; font-family:'DM Sans', Helvetica, Arial, sans-serif; font-size:16px; line-height:24px; mso-line-height-rule:exactly; color:#000E2B;">Paragraphe courant.</p>
```

Pourquoi `margin` sur les `<p>` et pas sur les `<td>` : Outlook respecte les marges des paragraphes, pas celles des tables. Le padding vertical entre blocs reste sur le `<td>`.

## 2. Bouton

```html
<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://www.investhub.cloud/page" style="height:48px; v-text-anchor:middle; width:260px;" arcsize="0%" stroke="f" fillcolor="#CBFF99">
  <w:anchorlock/>
  <center style="color:#000E2B; font-family:Arial, Helvetica, sans-serif; font-size:16px; font-weight:bold;">Libellé explicite</center>
</v:roundrect>
<![endif]-->
<!--[if !mso]><!-- -->
<table role="presentation" width="260" cellpadding="0" cellspacing="0" border="0" class="btn" style="border-collapse:collapse;">
  <tr>
    <td bgcolor="#CBFF99" align="center" style="background-color:#CBFF99; padding:14px 24px; font-family:'DM Sans', Helvetica, Arial, sans-serif; font-size:16px; line-height:20px; mso-line-height-rule:exactly; font-weight:600;">
      <a href="https://www.investhub.cloud/page" target="_blank" rel="noopener" style="display:block; color:#000E2B; text-decoration:none; font-family:'DM Sans', Helvetica, Arial, sans-serif; font-size:16px; line-height:20px; font-weight:600;">Libellé explicite</a>
    </td>
  </tr>
</table>
<!--<![endif]-->
```

Hauteur : 14 + 20 + 14 = 48 px, au-dessus du minimum de 44. Pour centrer le bouton, mettre `align="center"` sur le `<td>` parent et `align="center"` sur la table. Le `href` du `<v:roundrect>` et celui du `<a>` doivent être identiques. Bouton inversé (fond `#000E2B`, texte `#CBFF99`) : changer `fillcolor`, `bgcolor`, `background-color` et les deux `color`.

Toujours doubler le bouton d'un lien texte quelque part dans le mail ("Si le bouton ne s'affiche pas...") pour les clients qui bloquent tout.

## 3. Image fixe et image pleine largeur

Image à taille fixe (logo, picto) : `width` et `height` en attributs, alt stylé.

```html
<img src="https://cdn.exemple/logo-blanc.png" width="140" height="40" alt="InvestHub" style="display:block; border:0; outline:none; text-decoration:none; font-family:'DM Sans', Helvetica, Arial, sans-serif; font-size:16px; line-height:20px; font-weight:700; color:#FAFAFA;" />
```

Image pleine largeur : `width` en attribut à la largeur utile, `width:100%` en CSS, aucun `height`. Fichier source en x2 (1040 px pour 520 de rendu).

```html
<img src="https://cdn.exemple/visuel-1040x520.png" width="520" alt="Description éditoriale du visuel" style="display:block; width:100%; max-width:520px; border:0; outline:none; text-decoration:none; font-family:'DM Sans', Helvetica, Arial, sans-serif; font-size:16px; line-height:24px; color:#000E2B;" />
```

Pour une image qui touche les bords du conteneur, la poser dans un `<td>` sans padding avec `width="600"` et `max-width:600px`. Le `<td>` porte un `bgcolor` de repli (couleur dominante du visuel) pour les clients qui bloquent les images.

## 4. Picto + texte côte à côte

Deux cellules dans une même ligne : la table reste sur une ligne dans tous les clients, y compris mobile, donc le picto doit rester petit (48 à 64 px).

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
  <tr>
    <td width="64" valign="top" style="padding:0 16px 0 0;">
      <img src="https://cdn.exemple/picto-fonds.png" width="48" height="48" alt="" style="display:block; border:0; outline:none;" />
    </td>
    <td valign="top" style="padding:0;">
      <h2 class="dm-text" style="margin:0 0 4px 0; font-family:'DM Sans', Helvetica, Arial, sans-serif; font-size:18px; line-height:24px; mso-line-height-rule:exactly; font-weight:700; color:#000E2B;">Titre</h2>
      <p class="dm-text" style="margin:0; font-family:'DM Sans', Helvetica, Arial, sans-serif; font-size:16px; line-height:24px; mso-line-height-rule:exactly; color:#000E2B;">Texte.</p>
    </td>
  </tr>
</table>
```

Le picto est décoratif : `alt=""`. Le titre porte l'information.

## 5. Liste à puces

Une vraie liste, pour la sémantique. Les marges se posent inline, Outlook les respecte.

```html
<ul style="margin:0 0 16px 0; padding:0 0 0 20px; font-family:'DM Sans', Helvetica, Arial, sans-serif; font-size:16px; line-height:24px; mso-line-height-rule:exactly; color:#000E2B;" class="dm-text">
  <li style="margin:0 0 8px 0; mso-line-height-rule:exactly;">Premier point.</li>
  <li style="margin:0 0 8px 0; mso-line-height-rule:exactly;">Deuxième point.</li>
  <li style="margin:0; mso-line-height-rule:exactly;">Troisième point.</li>
</ul>
```

Si le rendu des puces doit être contrôlé au pixel (puce colorée, tiret), passer par une table à deux colonnes par item : cellule de 20 px avec le caractère de puce, cellule texte. La liste perd alors sa sémantique ; réserver aux cas où le design l'impose.

## 6. Tableau récapitulatif libellé / valeur

C'est un tableau de données : pas de `role="presentation"`, un `<th scope="row">` par ligne pour le libellé. Le script accepte une table sans rôle dès qu'elle contient un `<th>`.

```html
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
  <tr>
    <th scope="row" align="left" style="padding:10px 0; border-bottom:1px solid #D9D8CB; font-family:'DM Sans', Helvetica, Arial, sans-serif; font-size:16px; line-height:24px; mso-line-height-rule:exactly; font-weight:400; color:#456B6C;" class="dm-rule dm-muted">Montant appelé</th>
    <td align="right" style="padding:10px 0; border-bottom:1px solid #D9D8CB; font-family:'DM Sans', Helvetica, Arial, sans-serif; font-size:16px; line-height:24px; mso-line-height-rule:exactly; font-weight:600; color:#000E2B;" class="dm-rule dm-text">$investamount</td>
  </tr>
  <tr>
    <th scope="row" align="left" style="padding:10px 0; font-family:'DM Sans', Helvetica, Arial, sans-serif; font-size:16px; line-height:24px; mso-line-height-rule:exactly; font-weight:400; color:#456B6C;" class="dm-muted">Date limite de règlement</th>
    <td align="right" style="padding:10px 0; font-family:'DM Sans', Helvetica, Arial, sans-serif; font-size:16px; line-height:24px; mso-line-height-rule:exactly; font-weight:600; color:#000E2B;" class="dm-text">$duedate</td>
  </tr>
</table>
```

## 7. Encadré et bandeau

Aplat de couleur, angles droits, pas d'ombre. Le lime reste une étiquette, pas un fond de grande surface.

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
  <tr>
    <td bgcolor="#000E2B" style="background-color:#000E2B; padding:24px;">
      <p style="margin:0 0 8px 0; font-family:'DM Sans', Helvetica, Arial, sans-serif; font-size:14px; line-height:20px; mso-line-height-rule:exactly; font-weight:600; letter-spacing:1px; text-transform:uppercase; color:#CBFF99;">Étiquette</p>
      <p style="margin:0; font-family:'DM Sans', Helvetica, Arial, sans-serif; font-size:16px; line-height:24px; mso-line-height-rule:exactly; color:#FAFAFA;">Texte de l'encadré.</p>
    </td>
  </tr>
</table>
```

Variante claire : `bgcolor="#EDECE4"` (écru plus clair que le fond de page) avec texte `#000E2B`. Variante filet : `<td style="border-left:3px solid #CBFF99; padding:12px 16px;">`, utilisée dans le gabarit exemple pour reprendre un message ou une liste de pièces.

## 8. Code à usage unique

```html
<p style="margin:0; font-family:'DM Sans', Helvetica, Arial, sans-serif; font-size:32px; line-height:40px; mso-line-height-rule:exactly; letter-spacing:6px; font-weight:700; text-align:center; color:#000E2B;" class="dm-text">$code</p>
```

Le code reste du texte sélectionnable, jamais une image.

## 9. Filet et espaceur

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
  <tr>
    <td class="dm-rule" style="border-top:1px solid #D9D8CB; font-size:1px; line-height:1px;">&nbsp;</td>
  </tr>
</table>
```

Espaceur vertical : préférer le padding du `<td>` suivant. Si un espaceur est indispensable : `<td height="24" style="font-size:1px; line-height:1px;">&nbsp;</td>`. Le script tolère `font-size:1px` sur une cellule qui ne contient qu'un `&nbsp;`.

## 10. Preheader

Juste après `<body>`, avant la première table :

```html
<div style="display:none; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; mso-hide:all; color:#D9D8CB;">Une phrase courte, cohérente avec l'objet.</div>
```

Pas de suite de `&zwnj;&nbsp;` pour pousser le texte d'aperçu : c'est du contenu caché que Google déconseille.

## 11. Pied de page (mode A) et enveloppe Starter Pack (mode B)

Mode A : identité de l'expéditeur, raison de la réception, désabonnement, miroir. Les variables d'ESP (`{{unsubscribe_url}}`, `*|UNSUB|*`, `{{ mirror }}`) dépendent de l'outil : demander la syntaxe à l'opérateur.

```html
<td bgcolor="#000E2B" class="px" style="background-color:#000E2B; padding:28px 40px;">
  <p style="margin:0 0 8px 0; font-family:'DM Sans', Helvetica, Arial, sans-serif; font-size:14px; line-height:20px; mso-line-height-rule:exactly; color:#B4AEA4;">InvestHub, adresse postale</p>
  <p style="margin:0; font-family:'DM Sans', Helvetica, Arial, sans-serif; font-size:14px; line-height:20px; mso-line-height-rule:exactly; color:#B4AEA4;">Vous recevez cet email parce que vous utilisez la plateforme InvestHub. <a href="{{unsubscribe_url}}" target="_blank" style="color:#CBFF99; text-decoration:underline;">Se désabonner</a> &middot; <a href="{{mirror_url}}" target="_blank" style="color:#CBFF99; text-decoration:underline;">Voir cet email dans le navigateur</a></p>
</td>
```

Mode B : l'enveloppe Starter Pack commence par le logo et finit par la signature d'équipe puis le pied avec `$year`, `$appname`, `$mirror`. Ces trois fragments sont identiques dans les 112 gabarits ; les reprendre du fichier `assets/gabarit-plateforme-exemple.html` sans les modifier. En anglais : "Best regards, The $appname team" et "View this message in your browser".

## 12. Dark mode et media queries

Le seul contenu autorisé dans le `<style>` du `<head>`, avec les resets non inlinables. Toujours `!important` collé à la valeur.

```html
<style type="text/css">
  body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  img { -ms-interpolation-mode: bicubic; }
  a[x-apple-data-detectors] { color: inherit!important; text-decoration: none!important; }
  @media screen and (max-width: 620px) {
    .col { width: 100%!important; max-width: 100%!important; }
    .px { padding-left: 20px!important; padding-right: 20px!important; }
    .btn { width: 100%!important; }
    .h1 { font-size: 26px!important; line-height: 32px!important; }
  }
  @media (prefers-color-scheme: dark) {
    .dm-body { background-color: #0B1220!important; }
    .dm-card { background-color: #161C2C!important; }
    .dm-text { color: #F2F2F2!important; }
    .dm-muted { color: #B4AEA4!important; }
    .dm-rule { border-color: #2A3245!important; }
  }
</style>
```

Les classes `dm-*` se posent sur chaque élément dont la couleur doit changer en sombre. Le bouton lime, l'en-tête et le pied `#000E2B` ne changent pas : ils tiennent dans les deux modes.
