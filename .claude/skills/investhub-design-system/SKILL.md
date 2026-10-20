---
name: investhub-design-system
description: À charger AVANT toute modification d'interface dans ce dépôt (écran, onglet, tableau, panneau latéral, modale, formulaire, bouton, badge, filtre). Donne l'inventaire des composants du Design System InvestHub, les écrans de référence à imiter, les règles qui ne se discutent pas (aucun composant fait main, CSS Tailwind précompilé, i18n) et la vérification à faire avant de livrer. Déclencheurs : « crée l'écran », « refais l'onglet », « ajoute un tableau », « panneau latéral », « modale », « aligne sur le design system », « harmonise avec », toute capture d'écran d'UI à reproduire ou corriger.
---

# Design System InvestHub : comment construire une interface

Le Design System est **la seule source** des composants. On ne dessine jamais un composant à la main
(titre de section, carte à interrupteur, modale, cellule de tableau, menu d'actions…). Si un besoin n'est
couvert par rien, on **crée le composant dans `src/components/ui/`**, on le documente dans la page
Design System, puis on l'utilise. On ne recopie jamais un bloc de classes d'un écran à l'autre.

## 1. Avant d'écrire une ligne

1. Identifier le type d'écran et ouvrir l'écran de référence correspondant (section 3). L'imiter, pas l'inventer.
2. Chercher le composant dans l'inventaire (section 2), puis dans la page Design System
   (`src/components/DesignSystemPage.tsx`, `src/components/design-system/FundDetailComponentsSection.tsx`).
3. En cas de doute entre deux composants : prendre celui de l'écran de référence et le dire dans le compte rendu.

## 2. Inventaire

### Page de détail (fonds, investisseur, souscription)
| Besoin | Composant | Import |
|---|---|---|
| En-tête : titre, statut, sous-titre, actions | `PageHeader`, `PageHeaderSubtitle`, `PageHeaderSubtitleItem`, `PageHeaderSubtitleSeparator` | `ui/page-header` |
| Fil d'Ariane | celui de l'application (`App.tsx`), jamais un fil d'Ariane local | — |
| Onglets | `Tabs` + `DetailTabsList` (dans `px-8 bg-card border-b`), contenu en `px-8 py-6` sur fond `bg-muted` | `ui/tabs`, `ui/detail-tabs` |
| Bandeau d'état (archivé, verrouillé…) | `PageStateBanner` | `ui/page-state-banner` |
| Carte de synthèse, chiffres | `WidgetCard`, `WidgetMetric` | `ui/widget-card` |
| Statut | `StatusBadge` (variants success, warning, danger, info, neutral) | `StatusBadge` |
| Étiquette neutre (segment, rôle, type de note…) | `Tag` | `Tag` |
| État vide | `EmptyState` | `EmptyState` |

### Listing (liste principale ou onglet de détail)
| Besoin | Composant | Import |
|---|---|---|
| Carte du listing + barre | `ListingCard` (prop `toolbar`) | `ui/listing` |
| Recherche + filtres | `FilterBar` (+ bouton « Ajouter » à droite dans la toolbar) | `FilterBar` |
| Tableau | `DataTable` (`compactMode hideSelection searchTerm`) | `DataTable` |
| Colonne nom (lien + ID copiable ou ligne secondaire) | `ListingNameCell` | `ui/listing` |
| Pastille de type avec icône | `ListingTypeTag` | `ui/listing` |
| Compteur cliquable | `ListingCountTag` | `ui/listing` |
| Donnée multiple (« premier + n autres », carte de détail au clic) | `ListingStackCell` + `ListingStackRow` | `ui/listing` |
| Actions de ligne | `TableRowActions` : **≤ 3 actions = boutons icône, au-delà 3 boutons + menu ⋮**, libellé au survol obligatoire, motif d'indisponibilité via `disabledReason`, suppression en `intent: 'danger'` et en dernier | `ui/row-actions` |
| Pagination | `DataPagination` | `ui/data-pagination` |

### Création / modification d'un objet : panneau latéral
Référence : détail d'un document (Data Room) et détail d'une alerte.
| Besoin | Composant |
|---|---|
| Conteneur | `Sheet` + `SheetContent side="right" style={SIDE_PANEL_WIDE_STYLE} className="h-full p-0 gap-0"` |
| En-tête | `SidePanelHeader` (titre + description) |
| Section | `SidePanelSection` (icône, titre, description) |
| Carte blanche dans la section | `SidePanelCard` (`flush` pour une liste à séparateurs) |
| Interrupteur + libellé | `SidePanelSwitchRow` |
| Périmètre tous / sélection / aucun | `SidePanelScopeField` |
| Fichier | `SidePanelFileDrop` |
| Pied Annuler / Enregistrer | `SidePanelFooter` |
| Champs | `Input` et `SelectTrigger` en `h-11`, dates en `Input type="date"` `h-11`, multisélection `ModernMultiSelect` avec `SIDE_PANEL_BADGE_STYLE`, texte long `RichTextEditor` |
| Liste composable (droits, liens…) | une `SidePanelCard` par élément, titre « Élément n » + `RowActionButton` de suppression, bouton `outline` pleine largeur « Ajouter » dessous |
Tout cela vient de `ui/side-panel`.

### Modales
Référence : « Nouvelle souscription » (`NewSubscriptionDialog`).
| Besoin | Composant |
|---|---|
| Formulaire long / assistant | `BigModal` + `BigModalContent className="p-0 gap-0"` + `BigModalPanelHeader` (icône, titre, sous-titre, fermeture) + `BigModalBody` + `BigModalPanelFooter` (Annuler/Retour à gauche, actions à droite) |
| Confirmation (suppression, archivage…) | `ConfirmDialog` (`ui/confirm-dialog`), même habillage en taille compacte (`BIG_MODAL_COMPACT`) |
Jamais `AlertDialog` ou `Dialog` nus pour une nouvelle modale.

### Retour utilisateur
- Chaque bouton icône a son libellé au survol (`Tooltip`, déjà intégré à `RowActionButton` / `TableRowActions`).
- Action indisponible : visible, grisée, motif au survol (`DisabledReason` ou `disabledReason`).
- Résultat d'une action : `toast` (sonner).

## 3. Écrans de référence
- Détail d'un fonds : `src/components/fund-detail/FundDetailPage.tsx` (en-tête, onglets, tableau des parts).
- Détail d'un investisseur : `src/components/InvestorDetailPage.tsx` et `src/components/investor-detail/*` (listings d'onglet, panneaux contact, structure, note).
- Listing investisseurs : `src/components/InvestorsPage.tsx` + `InvestorDataTable.tsx`.
- Panneau latéral : `src/components/DocumentAddModal.tsx`, `src/components/AlertDetailDrawer.tsx`.
- Modale : `src/components/NewSubscriptionDialog.tsx`.

## 4. Règles qui ne se discutent pas

### CSS Tailwind précompilé
`src/index.css` est un Tailwind **déjà compilé**. Une classe absente de ce fichier n'a **aucun effet, sans erreur**
(ex. `md:grid-cols-4`, `text-[26px]`, `max-w-[calc(100%-2rem)]`). Avant de livrer :
```bash
node scripts/check-tailwind-classes.mjs --changed origin/main
```
Toute classe signalée sur une ligne que l'on a écrite est remplacée par une classe existante
(`grep -o '\.max-w-\\\[[^\\]*\\\]' src/index.css` pour voir les valeurs disponibles), ou le besoin est
porté par un composant du Design System qui l'utilise déjà.

### i18n
Voir `CLAUDE.md` : aucun texte en dur, clés en FR et EN au même endroit.

### Pas de doublon
Un composant fait main découvert en chemin est remplacé par le composant du Design System, ou extrait vers
`src/components/ui/` et réutilisé partout où le même bloc apparaît (y compris dans l'écran de référence).

## 5. Vérifier avant de dire « fait »
1. `npx vite build` passe.
2. `node scripts/check-tailwind-classes.mjs --changed origin/main` : rien de nouveau sur les lignes modifiées.
3. Clés i18n présentes en FR et EN.
4. Capture de l'écran (Playwright, Chromium dans `/opt/pw-browsers/chromium`) comparée à l'écran de référence :
   même en-tête, mêmes cartes, mêmes boutons, mêmes espacements. Une différence visible = pas fini.
5. Si un composant a été créé ou modifié : la page Design System est mise à jour (référentiel des colonnes,
   section Panneaux latéraux, ou section du composant).
