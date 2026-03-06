# 🔗 Exemples d'URLs InvestHub - Démo Rapide

## Tester le système de routing

Votre application InvestHub supporte maintenant les **liens directs** ! Voici comment les tester :

### 1️⃣ Navigation simple

Ajoutez ces chemins après l'URL de base de votre application :

```
#/investors          → Page Investisseurs
#/subscriptions      → Page Souscriptions  
#/monitoring         → Page Alertes (Monitoring)
#/documents          → Page Documents
#/tracking           → Page Tracking
```

### 2️⃣ Accès aux paramètres

```
#/settings/investor-status    → Statuts investisseurs
#/settings/deal-status        → Statuts deals
#/settings/custom-status      → Statuts personnalisés
#/settings/users              → Utilisateurs
#/settings/teams              → Équipes
```

### 3️⃣ Test pratique

**Essayez ceci :**

1. Ouvrez votre console développeur (F12)
2. Tapez :
   ```javascript
   window.location.hash = '#/settings/custom-status'
   ```
3. ✨ Vous êtes automatiquement redirigé vers la page des statuts personnalisés !

**Ou directement dans votre navigateur :**
- Naviguez vers la page Investisseurs
- Copiez l'URL complète (elle contient `#/investors`)
- Collez cette URL dans un nouvel onglet
- ✅ Vous arrivez directement sur la page Investisseurs !

### 4️⃣ Partage avec vos collègues

**Exemple concret :**

Vous voulez montrer les statuts personnalisés à un collègue ?

1. Naviguez vers **Administration > Status personnalisés**
2. L'URL devient automatiquement : `https://votre-domaine.com/#/settings/custom-status`
3. Partagez cette URL → Votre collègue arrive directement sur cette page !

### 5️⃣ Utilisation programmatique

Dans la console développeur, testez :

```javascript
// Importer les fonctions (dans un composant React)
import { navigateToPage, getShareableUrl } from './utils/routing';

// Naviguer
navigateToPage('investors');
navigateToPage('settings-custom-status');

// Obtenir l'URL complète
const url = getShareableUrl('monitoring');
console.log(url); // https://.../#/monitoring

// Copier dans le presse-papier
navigator.clipboard.writeText(url);
```

### 6️⃣ Fonctionnalités du navigateur

- **←** Bouton Précédent : Retour à la page précédente
- **→** Bouton Suivant : Avance dans l'historique
- **⭐ Bookmark** : Sauvegarde l'URL exacte de la page
- **🔄 Refresh** : Revient à la même page (mais perd les filtres/recherches)

### 7️⃣ URL complètes par page

Si votre app est sur `https://investhub.app` :

| Page | URL complète |
|------|--------------|
| Investisseurs | `https://investhub.app/#/investors` |
| Souscriptions | `https://investhub.app/#/subscriptions` |
| Alertes | `https://investhub.app/#/monitoring` |
| Documents | `https://investhub.app/#/documents` |
| Statuts investisseurs | `https://investhub.app/#/settings/investor-status` |
| Statuts deals | `https://investhub.app/#/settings/deal-status` |
| Statuts personnalisés | `https://investhub.app/#/settings/custom-status` |

### 8️⃣ Commande rapide - Console

Testez toutes les pages d'un coup :

```javascript
const pages = [
  'investors',
  'subscriptions', 
  'monitoring',
  'settings-investor-status',
  'settings-deal-status',
  'settings-custom-status'
];

pages.forEach((page, i) => {
  setTimeout(() => {
    window.location.hash = `#/${page.replace('settings-', 'settings/')}`;
    console.log(`✓ Page: ${page}`);
  }, i * 2000);
});
```

## 🎯 Cas d'usage

### Onboarding d'un nouvel utilisateur
Envoyez-lui directement le lien vers les paramètres :
`https://investhub.app/#/settings/users`

### Support technique
"Pouvez-vous aller sur cette page ?" 
→ Envoyez le lien direct au lieu d'expliquer le chemin

### Documentation
Créez des liens directs dans votre documentation interne

### Emails de notification
Incluez des liens directs vers les alertes ou souscriptions

---

**Note :** Les filtres et recherches ne sont pas encore persistés dans l'URL (version future).
