# 🔍 Guide de débogage du routing

## Problème résolu

Le problème était que l'application mettait à jour l'URL deux fois :
1. Une fois lors du changement de page via la sidebar
2. Une fois en réaction au changement de currentPage

Cela créait un conflit où l'URL était toujours réinitialisée à `/investors`.

## Solution implémentée

**Principe : L'URL est la source de vérité unique**

1. ✅ Au chargement initial : L'URL détermine la page à afficher
2. ✅ Navigation via sidebar : Change uniquement l'URL → le listener hashchange met à jour le state
3. ✅ Boutons back/forward : Le listener hashchange met à jour le state
4. ✅ Lien direct : L'URL initiale détermine la page

## Test de validation

### 1. Test de navigation directe
Ouvrez ces URLs dans votre navigateur :

```
https://market-lock-57593835.figma.site/#/investors
https://market-lock-57593835.figma.site/#/settings/deal-status
https://market-lock-57593835.figma.site/#/settings/investor-status
https://market-lock-57593835.figma.site/#/settings/custom-status
https://market-lock-57593835.figma.site/#/monitoring
https://market-lock-57593835.figma.site/#/subscriptions
```

**Résultat attendu :** Chaque URL doit charger directement la bonne page.

### 2. Test de navigation dans l'app
1. Cliquez sur "Investisseurs" dans la sidebar
2. Vérifiez que l'URL change en `#/investors`
3. Cliquez sur "Administration > Statuts deals"
4. Vérifiez que l'URL change en `#/settings/deal-status`

**Résultat attendu :** L'URL doit changer à chaque navigation.

### 3. Test des boutons navigateur
1. Naviguez vers plusieurs pages
2. Cliquez sur le bouton "Précédent" (←)
3. Cliquez sur le bouton "Suivant" (→)

**Résultat attendu :** Les boutons doivent fonctionner correctement.

### 4. Test de partage
1. Naviguez vers "Administration > Statuts personnalisés"
2. Copiez l'URL : `#/settings/custom-status`
3. Ouvrez un nouvel onglet
4. Collez l'URL

**Résultat attendu :** Le nouvel onglet doit ouvrir directement la page des statuts personnalisés.

## Logs de débogage

Ouvrez la console développeur (F12) et observez les logs :

```
[Routing] Hash: #/settings/deal-status -> Path: /settings/deal-status -> Page: settings-deal-status
[App] Initial page from URL: settings-deal-status
[Routing] Navigate to page: settings-investor-status -> Hash: #/settings/investor-status
[App] Hash changed, setting page to: settings-investor-status
```

### Interprétation des logs

1. **`[Routing] Hash: ...`** : Montre comment l'URL est analysée
2. **`[App] Initial page from URL: ...`** : Page chargée au démarrage
3. **`[Routing] Navigate to page: ...`** : Navigation programmatique
4. **`[App] Hash changed, setting page to: ...`** : Réaction au changement d'URL

## Vérification du mapping

Le fichier `/utils/routing.ts` contient le mapping entre les noms de pages et les URLs :

```typescript
'settings-deal-status': '/settings/deal-status'
```

Si une page ne fonctionne pas, vérifiez que :
1. Le nom de page existe dans `PAGE_TO_PATH`
2. Le path est correctement formé (commence par `/`)
3. Le mapping inverse `PATH_TO_PAGE` est correct

## Désactiver les logs

Une fois le système validé, vous pouvez supprimer les `console.log` dans :
- `/utils/routing.ts` : lignes avec `console.log('[Routing] ...')`
- `/App.tsx` : lignes avec `console.log('[App] ...')`

## Architecture finale

```
URL change (initial load, navigation, back/forward)
    ↓
window.location.hash is updated
    ↓
hashchange event fires
    ↓
onHashChange() listener calls getPageFromHash()
    ↓
setCurrentPage(newPage) updates React state
    ↓
Component re-renders with new page
```

**Flux de navigation utilisateur :**
```
User clicks sidebar menu
    ↓
navigateToPage(page) is called
    ↓
window.location.hash is updated
    ↓
[Same as above from "hashchange event fires"]
```

## Problèmes connus résolus

✅ **Redirection vers /investors** : Résolu en supprimant la double mise à jour  
✅ **URL non synchronisée** : Résolu en utilisant l'URL comme source de vérité  
✅ **Boucle infinie** : Évité en appelant uniquement navigateToPage() (pas setCurrentPage + navigateToPage)  

## Si ça ne fonctionne toujours pas

1. **Videz le cache du navigateur** : Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)
2. **Vérifiez la console** : Recherchez des erreurs JavaScript
3. **Vérifiez les logs** : Les logs `[Routing]` et `[App]` doivent apparaître
4. **Testez en navigation privée** : Pour éliminer les extensions/cache

## Support

Si le problème persiste, partagez :
1. L'URL complète que vous essayez d'ouvrir
2. Les logs de la console
3. Le comportement observé vs attendu
