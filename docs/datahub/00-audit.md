# 00 — Audit du design system (pré-module DataHub)

> But : établir l'état existant du DS avant la production du module **DataHub**. Aucun fichier n'a été modifié, aucun composant créé.

---

## 1. Stack

Les versions proviennent de `package.json` (racine). Aucun `tailwind.config.*` ni `postcss.config.*` n'est présent : Tailwind v4 est détecté via la directive `tailwindcss v4.1.3` en tête de `src/index.css` (CSS précompilé, tokens inlinés).

| Domaine | Lib / outil | Version |
|---|---|---|
| Framework | React | `^18.3.1` |
| Build | Vite | `6.3.5` (plugin `@vitejs/plugin-react-swc ^3.10.2`) |
| Style | Tailwind CSS | `v4.1.3` (compilé dans `src/index.css`, pas de config JS) |
| Utilitaires classes | `clsx`, `tailwind-merge`, `class-variance-authority` | `^0.7.1` pour CVA |
| Primitives UI | `@radix-ui/react-*` | `^1.x / 2.x` (dialog, select, tabs, toggle-group, tooltip, popover, scroll-area, …) |
| Icônes | `lucide-react` | `^0.487.0` (+ `@fortawesome/*`, utilitaire `src/utils/modernIcons.tsx`) |
| Animations | `motion` / `framer-motion` | `*` |
| Formulaires | `react-hook-form` | `^7.55.0` |
| Toasts | `sonner` | `^2.0.3` |
| Drag & drop | `react-dnd` + `react-dnd-html5-backend` | `*` (présents en deps, non utilisés par le wizard actuel) |
| Commande / combobox | `cmdk` | `^1.1.1` |
| Dates | `date-fns` (`^3.6.0`), `react-day-picker` (`^8.10.1`) | |
| Charts | `recharts` | `^2.15.2` |
| Routing | `react-router-dom` (`*`) — **déclaré mais non utilisé** ; routing custom hash-based dans `src/utils/routing.ts` | |
| Storybook | `@storybook/react-vite`, `@storybook/addon-essentials`, `@storybook/addon-interactions` | **Non listés dans `package.json`** (utilisés par `.storybook/*` et imports de stories) |
| i18n | Custom `src/utils/languageContext.tsx` | — |

---

## 2. Arborescence `src/` (utile au module)

```
src/
├── App.tsx                 Router géant (if/else sur currentPage), monte toutes les pages.
├── main.tsx                Entry, wrappe LanguageProvider + App.
├── index.css               Tailwind v4 compilé + tokens sémantiques (--background, --primary…).
├── components/
│   ├── ui/                 DS shadcn-like (Button, Badge, Card, Dialog, Table, Input, Select…).
│   │   ├── big-modal.tsx   Modale fullscreen "wizard-ready" (90vw × 85vh, glassmorphism).
│   │   └── utils.ts        export `cn` (clsx + tailwind-merge).
│   ├── filters/            Filtres métier (Date, MultiSelect, Status…).
│   ├── settings/           Pages de réglages, template `SettingsTemplate.tsx`.
│   ├── ModernSidebar.tsx   Menu latéral à sections/sous-menus (MenuItem + SubMenuItem).
│   ├── MassUploadWizard.tsx Wizard multi-étapes + drag&drop HTML5 natif.
│   ├── DataTable.tsx       Table "maison" (tri, sélection, Badge, Button, toast).
│   └── …                   100+ composants métier (pages, cellules, badges statut).
├── stories/                Storybook, CSF3 + `tags:['autodocs']`.
│   ├── Foundations/        Colors, Typography
│   ├── Inputs/             Button, Input, Select, Checkbox/Switch, FolderSelector
│   ├── DataDisplay/        Avatar, Badge, Card, Table, SpecificAudience…
│   ├── Feedback/           Alert, Skeleton
│   └── Navigation/         Breadcrumb, Tabs
├── utils/
│   ├── routing.ts          Hash-based router (enum `Page` + maps `PAGE_TO_PATH` / `PATH_TO_PAGE`).
│   ├── languageContext.tsx i18n maison, hook `useTranslation()`.
│   ├── modernIcons.tsx     Ré-export centralisé d'icônes Lucide.
│   └── …                   Generators mock, formatters, contexts.
└── locales/                Fichiers de traduction.
```

Pas de dossier `src/features/` aujourd'hui : convention **à inaugurer** pour DataHub.

---

## 3. Inventaire DS (`src/components/ui/`)

| Composant | Chemin | Variants / slots |
|---|---|---|
| Accordion | `ui/accordion.tsx` | Radix, pas de CVA |
| Alert | `ui/alert.tsx` | CVA : `default` \| `destructive` |
| AlertDialog | `ui/alert-dialog.tsx` | Radix |
| AspectRatio | `ui/aspect-ratio.tsx` | Radix |
| AutocompleteSelect | `ui/autocomplete-select.tsx` | Custom |
| Avatar | `ui/avatar.tsx` | Radix |
| **Badge** | `ui/badge.tsx` | CVA : `default` \| `secondary` \| `destructive` \| `outline` |
| **BigModal** | `ui/big-modal.tsx` | Modale fullscreen (90vw × 85vh, glassmorphism) — spécifique à ce repo |
| Breadcrumb | `ui/breadcrumb.tsx` | Slots `List/Item/Link/Page/Separator/Ellipsis` |
| **Button** | `ui/button.tsx` | CVA : `primary` \| `secondary` \| `ghost` \| `danger` \| `link` (+ alias legacy : `default/destructive/outline`). Tailles : `default/sm/lg/icon`. `asChild` supporté. |
| Calendar | `ui/calendar.tsx` | `react-day-picker` |
| **Card** | `ui/card.tsx` | Composé : `Card/Header/Title/Description/Action/Content/Footer` (pas de variants, radius `rounded-xl`) |
| Carousel | `ui/carousel.tsx` | `embla-carousel-react` |
| Chart | `ui/chart.tsx` | `recharts` + ChartContainer/Tooltip… |
| Checkbox | `ui/checkbox.tsx` | Radix |
| Collapsible | `ui/collapsible.tsx` | Radix |
| Command | `ui/command.tsx` | `cmdk` (combobox/search palette) |
| ContextMenu | `ui/context-menu.tsx` | Radix |
| CountBadge | `ui/count-badge.tsx` | Custom (badge numérique) |
| DataPagination | `ui/data-pagination.tsx` | Custom |
| DatePicker | `ui/date-picker.tsx` | Custom sur Calendar |
| **Dialog** | `ui/dialog.tsx` | Radix. `DialogContent` max-width `sm:max-w-lg` → non adapté aux wizards |
| Drawer | `ui/drawer.tsx` | `vaul` |
| DropdownMenu | `ui/dropdown-menu.tsx` | Radix |
| FolderSpaceDialog | `ui/folder-space-dialog.tsx` | Custom métier |
| Form | `ui/form.tsx` | `react-hook-form` + Radix label |
| HoverCard | `ui/hover-card.tsx` | Radix |
| ImageUpload | `ui/image-upload.tsx` | Custom |
| InputOTP | `ui/input-otp.tsx` | `input-otp` |
| **Input** | `ui/input.tsx` | Pas de variants ; `h-9`, bg blanc, focus ring CSS vars |
| Label | `ui/label.tsx` | Radix |
| Menubar | `ui/menubar.tsx` | Radix |
| ModernMultiselect | `ui/modern-multiselect.tsx` (+ `-demo`) | Custom |
| NavigationMenu | `ui/navigation-menu.tsx` | Radix |
| Pagination | `ui/pagination.tsx` | Custom |
| Popover | `ui/popover.tsx` | Radix |
| Progress | `ui/progress.tsx` | Radix |
| RadioGroup | `ui/radio-group.tsx` | Radix |
| Resizable | `ui/resizable.tsx` | `react-resizable-panels` |
| ScrollArea | `ui/scroll-area.tsx` | Radix |
| SegmentMultiselect | `ui/segment-multiselect.tsx` | Custom |
| **Select** | `ui/select.tsx` | Radix. Trigger tailles `sm` \| `default` via `data-size` |
| Separator | `ui/separator.tsx` | Radix |
| Sheet | `ui/sheet.tsx` | Radix dialog latéral |
| Sidebar | `ui/sidebar.tsx` | shadcn primitives (⚠ non utilisé : le menu actif est `components/ModernSidebar.tsx`) |
| Skeleton | `ui/skeleton.tsx` | Tailwind animate |
| Slider | `ui/slider.tsx` | Radix |
| Sonner | `ui/sonner.tsx` | `sonner` toaster |
| Switch | `ui/switch.tsx` | Radix |
| **Table** | `ui/table.tsx` | Primitives `Table/Header/Body/Row/Head/Cell/Footer/Caption`. Pas d'édition inline native. |
| Tabs | `ui/tabs.tsx` | Radix |
| TargetingSelects | `ui/targeting-selects.tsx` | Custom métier |
| Textarea | `ui/textarea.tsx` | Simple |
| Timeline | `ui/timeline.tsx` | Custom |
| Toggle / ToggleGroup | `ui/toggle.tsx`, `ui/toggle-group.tsx` | CVA variants `default/outline`, tailles `sm/default/lg` |
| Tooltip | `ui/tooltip.tsx` | Radix |

Composants DS "satellites" hors `ui/` utiles au module : `StatusBadge.tsx`, `Tag.tsx`, `EmptyState.tsx`, `InfoBanner.tsx`, `AIInsightBanner.tsx`, `EditableField.tsx`, `EditableSection.tsx`, `DataTable.tsx`, `FilterBar.tsx`.

---

## 4. Matrice de réutilisation (besoins DataHub → DS)

| Besoin DataHub | Composant DS à utiliser | Chemin | Statut |
|---|---|---|---|
| Badge de statut **publié / brouillon / dépublié / modif** | `StatusBadge` (palette success/warning/danger/neutral) **ou** `Badge` + variants custom | `components/StatusBadge.tsx`, `ui/badge.tsx` | ✅ Réutilisable. Les 4 états → mapping variants `success/warning/danger/neutral` (ou ajouter un variant `info` dédié "modif"). |
| Badge de **mode d'ingestion** (manuel/fichier/API/MCP) | `Badge` (variant `secondary` / `outline`) + icône Lucide | `ui/badge.tsx` | ✅ Réutilisable. Pas de variants métier → à **composer** en wrapper `IngestionModeBadge` côté feature. |
| Badge de **type de pivot temporel** | `Badge` `outline` + icône Calendar | `ui/badge.tsx` | ✅ Réutilisable en wrapper feature. |
| **Carte de collection** | `Card` + `CardHeader/Title/Description/Action/Content/Footer` | `ui/card.tsx` | ✅ Réutilisable ; composer `CollectionCard` côté feature (pas de variants DS à créer). |
| **Tableau avec édition inline** | `Table` primitives + pattern `EditableField` | `ui/table.tsx` + `components/EditableField.tsx` | ⚠️ Table nue, édition cellule **à créer** (`EditableField` vise un champ formulaire, pas une cellule). Un composant `EditableCell` feature-local est à construire. |
| **Modale fullscreen (wizard)** | `BigModal` (90vw × 85vh) | `ui/big-modal.tsx` | ✅ Réutilisable tel quel (dédié wizards). |
| **Stepper 4 étapes** | ❌ Aucun Stepper DS | — | 🔨 **À créer** (pattern inline dans `MassUploadWizard.tsx` ≈ 800 lignes à extraire proprement en `Stepper` feature-local). |
| **Upload drag & drop** | ❌ Aucun `Dropzone` DS ; pattern HTML5 natif existant | `MassUploadWizard.tsx` (drag events natifs) | 🔨 **À créer** un `Dropzone` feature-local. `react-dnd` est en deps mais non utilisé ici — préférer rester sur HTML5 natif comme le reste du code. |
| **Toggle segmenté avant/après** | `ToggleGroup` + `ToggleGroupItem` (type `single`) | `ui/toggle-group.tsx` | ✅ Réutilisable directement. |

---

## 5. Conventions observées

- **Nommage des composants DS** : fichiers `kebab-case.tsx`, exports `PascalCase`, souvent ré-exportés comme namespace (`Card`, `CardHeader`, `CardContent`…). `data-slot="<name>"` posé sur chaque primitive pour hooks CSS.
- **Pattern CVA** : **oui**, mais partiel. Présent sur `Button`, `Badge`, `Alert`, `Toggle`/`ToggleGroup`. Beaucoup de composants Radix "wrappers" ne déclarent pas de variants et exposent uniquement `className`. `cn` = `twMerge(clsx(...))` dans `components/ui/utils.ts`.
- **Imports versionnés** : la plupart des fichiers DS importent les packages avec suffixe de version (`@radix-ui/react-slot@1.1.2`, `class-variance-authority@0.7.1`, `lucide-react@0.487.0`…). `vite.config.ts` ajoute des alias pour faire coller ces imports aux packages réels — c'est une **empreinte Figma Make**. ⚠️ À respecter strictement pour tout nouveau composant DS ajouté au dossier `ui/`.
- **Stories** : **CSF3** avec `satisfies Meta<typeof X>`, `tags: ['autodocs']`, `args`/`argTypes` et render stories pour les "all variants". Titres Storybook en `Group/Name` (`Inputs/Button`, `Data Display/Badge`). Emplacement : `src/stories/<Group>/<Name>.stories.tsx`.
- **Routing** : **pas de `react-router`** actif malgré la présence en deps. Routage via hash + enum `Page` dans `src/utils/routing.ts`. Ajouter une page requiert :
  1. Ajouter la clé dans le type `Page` (routing.ts).
  2. Ajouter l'entrée dans `PAGE_TO_PATH`.
  3. Ajouter une branche dans le big if/else d'`App.tsx` (~l. 668).
  4. Ajouter un `<MenuItem>` / `<SubMenuItem>` dans `ModernSidebar.tsx` avec `onClick={() => onPageChange?.('datahub-xxx')}`.
- **Pattern sidebar** : `MenuItem` (parent avec sous-menu) + `SubMenuItem` (badge, `isActive`, `onClick`). Sections collapsibles pilotées par `openMenus` state + `currentPage`. Les clés i18n vivent dans `t('sidebar.menu.*')` et `t('sidebar.submenu.*')`.
- **i18n** : `useTranslation()` maison (`src/utils/languageContext.tsx`). Toute string utilisateur doit passer par `t('...')`.
- **Theming** : tokens CSS dans `src/index.css` (`--background`, `--primary`, `--muted`, `--success`, `--warning`, `--danger`, `--success-soft`…). Dark mode via classe `.dark`. Pas de token feature-spécifique à prévoir pour DataHub.

---

## 6. Décisions d'emplacement

- **Code feature** : `src/features/datahub/` (à inaugurer — pattern `features/` absent, mais répo tolère sans contrainte technique). Sous-organisation proposée :
  ```
  src/features/datahub/
    components/      # cartes, cellules, badges métier (IngestionModeBadge, CollectionCard…)
    pages/           # pages "DataHub collections", "Dataset detail"…
    wizard/          # Stepper + steps du wizard full-screen
    hooks/
    types.ts
    mockData.ts
  ```
- **Primitives DS génériques nées du module** (Stepper, Dropzone, EditableCell) : **à promouvoir dans `src/components/ui/`** uniquement quand réutilisées ailleurs. Par défaut → feature-local dans `src/features/datahub/components/`.
- **Stories** : `src/stories/DataHub/*.stories.tsx` (nouveau groupe Storybook) + stories de primitives promues dans leur groupe DS existant (`Data Display`, `Inputs`…). Respect CSF3 + `tags:['autodocs']`.
- **Routing** : clés `Page` préfixées `datahub-*` (cohérent avec `settings-*`).
- **Menu** : nouvelle section top-level `dataHub` dans `ModernSidebar.tsx` (icône `icons.Database` ou similaire) avec sous-entrées (collections, datasets, ingestions…).

---

## 7. Risques & points de vigilance

1. **Storybook non déclaré dans `package.json`**. Les fichiers `.storybook/main.ts` et les imports `@storybook/react` existent, mais aucune des devDependencies Storybook n'est listée. Tout `npm install` puis `storybook dev` échouera. → Vérifier avant d'écrire des stories / ou ajouter la dette ensuite.
2. **Imports versionnés "Figma Make"** (`@radix-ui/react-slot@1.1.2`). Mimer exactement ce pattern dans `src/components/ui/*` sinon Vite alias ne matchera pas. Pour `src/features/datahub/`, préférer des imports propres (sans version) — **ne pas polluer** la feature avec ce legacy.
3. **Tailwind sans config JS** : `src/index.css` est un CSS Tailwind v4 **précompilé** (10923 lignes). Toute nouvelle classe/token non présent dans ce dump ne sera **pas stylée**. Soit reconfigurer le build Tailwind proprement, soit s'en tenir aux tokens et classes déjà présents. À **confirmer avec l'équipe build** avant de poser des classes exotiques.
4. **`react-router-dom` fantôme** : déclaré en deps, jamais importé. Le vrai routeur est hash-based (`utils/routing.ts`). Ne pas introduire `<BrowserRouter>` "par réflexe".
5. **`App.tsx` = 1903 lignes, big if/else** : l'ajout de 5–6 pages DataHub va rallonger. Acceptable sur le court terme, mais un map `{ [Page]: ComponentLazy }` serait plus propre (hors scope audit).
6. **Deux sidebars** : `components/ui/sidebar.tsx` (shadcn, inutilisé) et `components/ModernSidebar.tsx` (prod). Ne pas confondre : tout ajout de menu va dans `ModernSidebar.tsx`.
7. **Pas d'`EditableCell` DS** : le pattern existant (`EditableField`) est conçu pour un champ formulaire isolé (label + value + edit toggle), pas une cellule de tableau. Il faudra créer le nôtre.
8. **Pas de Stepper ni de Dropzone DS** : 2 primitives manquantes pour le wizard. Le `MassUploadWizard.tsx` contient de quoi extraire (patterns inline, pas composant).
9. **`BigModal` utilise imports Radix non-versionnés** (`@radix-ui/react-dialog` sans `@1.1.6`) — anomalie vs le reste du DS, mais fonctionne (l'alias Vite accepte les deux). À signaler, pas bloquant.
10. **Drag & drop** : `react-dnd` est en deps, mais le code de prod utilise le HTML5 natif. Décider dès le départ : rester HTML5 natif pour cohérence, ou démarrer sur `react-dnd`. Recommandation audit : **HTML5 natif**.
11. **Figma assets** : imports `figma:asset/…` résolus via aliases Vite pointant vers `src/assets/`. Pas de logo DataHub à prévoir tant que non fourni.

---

## Résumé final

- **Stack** : React 18 + Vite 6 + Tailwind v4 (CSS précompilé) + Radix + CVA + shadcn-like ; routing hash maison (`utils/routing.ts`, pas de react-router actif) ; Storybook CSF3 présent mais **deps absentes du `package.json`**.
- **Dossier DataHub choisi** : `src/features/datahub/` (à inaugurer), stories dans `src/stories/DataHub/`, pages enregistrées via enum `Page` + branche dans `App.tsx` + section dans `ModernSidebar.tsx`.
- **3 composants DS les plus réutilisables** : `BigModal` (wizard fullscreen prêt à l'emploi), `ToggleGroup` (segmenté avant/après), `Badge` + `StatusBadge` (tous les badges statuts/modes/pivots).
- **Gaps à combler (feature-local d'abord)** : `Stepper` 4 étapes, `Dropzone` (drag & drop upload), `EditableCell` pour tableau inline-éditable.
- **Points de vigilance** : (1) Storybook non-installé à ajouter, (2) imports `@pkg@version` à respecter dans `ui/` sinon alias Vite cassé, (3) Tailwind sans config — classes non présentes dans `index.css` non stylées, (4) i18n obligatoire via `useTranslation()`, (5) ne pas ressortir `react-router` ni la `ui/sidebar.tsx` inutilisée.
