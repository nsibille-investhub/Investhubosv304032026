# 🔍 Système de Recherche Multi-Champs Standard

Ce document explique comment implémenter la recherche multi-champs dans tous les tableaux de l'application InvestHub.

## 📚 Architecture

Le système de recherche est composé de plusieurs éléments réutilisables :

### 1. **Hook `useTableSearch`** (`/utils/useTableSearch.ts`)
Hook React personnalisé qui gère la logique de recherche multi-champs.

**Fonctionnalités :**
- Filtre les données sur plusieurs champs simultanément
- Support des champs imbriqués (ex: `contrepartie.name`)
- Performance optimisée avec `useMemo`
- Retourne les données filtrées et les matches

**Paramètres :**
- `data`: Tableau de données à filtrer
- `searchableFields`: Liste des champs sur lesquels effectuer la recherche

**Retour :**
- `searchTerm`: Terme de recherche actuel
- `setSearchTerm`: Fonction pour modifier le terme de recherche
- `filteredData`: Données filtrées
- `searchMatches`: Map des matches trouvés par item
- `hasActiveSearch`: Boolean indiquant si une recherche est active

### 2. **Composant `SearchBar`** (`/components/SearchBar.tsx`)
Composant UI réutilisable pour la barre de recherche.

**Props :**
- `value`: Valeur actuelle de la recherche
- `onChange`: Callback appelé lors du changement
- `placeholder`: Texte de placeholder (optionnel)
- `className`: Classes CSS additionnelles (optionnel)

**Features :**
- Animation du bouton clear
- Design cohérent avec l'app
- Focus states optimisés

### 3. **Composant `HighlightText`** (`/components/HighlightText.tsx`)
Composant pour surligner les termes de recherche dans le texte.

**Props :**
- `text`: Texte à afficher
- `searchTerm`: Terme à surligner
- `className`: Classes CSS additionnelles (optionnel)

**Features :**
- Surlignage jaune semi-transparent
- Performance optimisée avec `memo`
- Gestion des caractères spéciaux regex

### 4. **Configuration centralisée** (`/utils/searchConfig.ts`)
Définit les champs searchables pour chaque type de tableau.

**Constantes disponibles :**
- `SUBSCRIPTION_SEARCH_FIELDS`: Pour le tableau des souscriptions
- `ENTITY_SEARCH_FIELDS`: Pour le tableau des entités
- `DOCUMENT_SEARCH_FIELDS`: Pour le tableau des documents

## 🚀 Guide d'Implémentation

### Étape 1 : Importer les dépendances

```tsx
import { useTableSearch } from '../utils/useTableSearch';
import { SUBSCRIPTION_SEARCH_FIELDS } from '../utils/searchConfig';
import { SearchBar } from './SearchBar';
import { HighlightText } from './HighlightText';
```

### Étape 2 : Initialiser le hook de recherche

```tsx
const {
  searchTerm,
  setSearchTerm,
  filteredData,
  hasActiveSearch,
} = useTableSearch(data, SUBSCRIPTION_SEARCH_FIELDS);

const handleSearchChange = (value: string) => {
  setSearchTerm(value);
  setPaginationPage(1); // Reset pagination
};
```

### Étape 3 : Intégrer au tri et à la pagination

```tsx
const sortedData = useMemo(() => {
  // Utiliser filteredData si recherche active, sinon data brute
  const dataToSort = hasActiveSearch ? filteredData : data;
  
  if (!sortConfig) return dataToSort;
  
  return [...dataToSort].sort((a, b) => {
    // Logique de tri...
  });
}, [filteredData, data, sortConfig, hasActiveSearch]);

// La pagination utilise automatiquement sortedData
const totalItems = sortedData.length;
const tableData = sortedData.slice(startIndex, endIndex);
```

### Étape 4 : Ajouter le SearchBar dans l'UI

Dans votre FilterBar ou header de tableau :

```tsx
<SearchBar 
  value={searchTerm}
  onChange={handleSearchChange}
  placeholder="Rechercher dans le tableau..."
/>
```

### Étape 5 : Passer searchTerm au DataTable

```tsx
<SubscriptionDataTable 
  data={tableData}
  searchTerm={searchTerm}
  // ... autres props
/>
```

### Étape 6 : Utiliser HighlightText dans les cellules

```tsx
<td className="px-6 py-4">
  <HighlightText 
    text={row.name} 
    searchTerm={searchTerm}
  />
</td>
```

Pour les composants imbriqués (ex: ContrepartieCard) :

```tsx
<ContrepartieCard 
  contrepartie={row.contrepartie} 
  searchTerm={searchTerm}
/>
```

Et dans ContrepartieCard.tsx :

```tsx
interface ContrepartieProps {
  contrepartie: {...};
  searchTerm?: string; // Ajouter cette prop
}

export function ContrepartieCard({ contrepartie, searchTerm = '' }: ContrepartieProps) {
  return (
    // ...
    <HighlightText text={contrepartie.name} searchTerm={searchTerm} />
  );
}
```

### Étape 7 : Afficher le nombre de résultats filtrés

Dans la pagination :

```tsx
<div className="text-sm text-gray-600">
  {startIndex + 1}-{endIndex} of {totalItems} items
  {hasActiveSearch && (
    <span className="ml-2 text-blue-600">
      (filtré{totalItems !== data.length && ` de ${data.length}`})
    </span>
  )}
</div>
```

## ✅ Checklist d'Implémentation

Pour ajouter la recherche à un nouveau tableau :

- [ ] Définir les champs searchables dans `/utils/searchConfig.ts`
- [ ] Importer `useTableSearch` et la config dans la page
- [ ] Initialiser le hook avec les données et les champs
- [ ] Intégrer `filteredData` dans la logique de tri
- [ ] Ajouter `SearchBar` dans l'UI
- [ ] Passer `searchTerm` au composant DataTable
- [ ] Utiliser `HighlightText` dans toutes les cellules concernées
- [ ] Mettre à jour les sous-composants (Cards, etc.) pour accepter `searchTerm`
- [ ] Afficher l'indicateur de filtrage dans la pagination
- [ ] Tester avec différents termes de recherche

## 🎨 Personnalisation

### Changer le style du surlignage

Modifier dans `HighlightText.tsx` :

```tsx
<mark
  className="bg-yellow-200 text-gray-900 rounded px-0.5 font-medium"
  style={{ backgroundColor: 'rgba(250, 204, 21, 0.4)' }}
>
  {part}
</mark>
```

### Ajouter un debounce

```tsx
import { useState, useEffect } from 'react';

const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(searchTerm);
  }, 300);
  
  return () => clearTimeout(timer);
}, [searchTerm]);

const { filteredData } = useTableSearch(data, fields, debouncedSearch);
```

## 📋 Exemples Complets

### Tableau de Souscriptions
Voir `/components/SubscriptionsPage.tsx` et `/components/SubscriptionDataTable.tsx`

### Composants Imbriqués
- `/components/ContrepartieCard.tsx`
- `/components/PartenaireCard.tsx`

## 🔧 Maintenance

Lors de l'ajout de nouvelles colonnes au tableau :

1. Ajouter le champ dans `/utils/searchConfig.ts`
2. S'assurer que le champ existe dans le type de données
3. Ajouter `HighlightText` dans la nouvelle cellule
4. Tester la recherche sur ce champ

## ⚠️ Notes Importantes

- **Performance** : Le hook utilise `useMemo` pour optimiser les performances
- **Champs imbriqués** : Supportés avec la notation point (ex: `contrepartie.name`)
- **Compatibilité** : Fonctionne avec tous les types de données (string, number, etc.)
- **Pagination** : Toujours reset la pagination à la page 1 lors d'une nouvelle recherche
- **Tri** : Appliquer le tri APRÈS le filtrage de recherche

## 🐛 Debugging

Si la recherche ne fonctionne pas :

1. Vérifier que les champs dans `searchConfig.ts` correspondent exactement aux propriétés de l'objet
2. Vérifier que `filteredData` est bien utilisée dans le tri
3. Vérifier que `searchTerm` est bien passée à tous les sous-composants
4. Console.log `filteredData` pour voir ce qui est retourné
5. Vérifier que `hasActiveSearch` est bien utilisé dans les conditions

---

**Dernière mise à jour :** 2025-01-16  
**Auteur :** InvestHub Development Team
