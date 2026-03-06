# Guide des liens partageables - InvestHub

## Vue d'ensemble

InvestHub utilise maintenant un système de routing basé sur les **hash URLs** qui permet de :
- ✅ Créer des liens directs vers n'importe quelle page
- ✅ Partager des URLs avec vos collaborateurs
- ✅ Utiliser les boutons précédent/suivant du navigateur
- ✅ Bookmarker des pages spécifiques
- ✅ Ouvrir plusieurs pages dans différents onglets

## Structure des URLs

### Pages principales

| Page | URL |
|------|-----|
| Investisseurs | `#/investors` |
| Souscriptions | `#/subscriptions` |
| Alertes (Monitoring) | `#/monitoring` |
| Documents | `#/documents` |
| Tracking | `#/tracking` |
| Entités | `#/entities` |

### Pages de paramètres

| Page | URL |
|------|-----|
| App Store | `#/settings/app-store` |
| Utilisateurs | `#/settings/users` |
| Équipes | `#/settings/teams` |
| Droits | `#/settings/rights` |
| Statuts investisseurs | `#/settings/investor-status` |
| Statuts deals | `#/settings/deal-status` |
| Statuts personnalisés | `#/settings/custom-status` |
| Types de deals | `#/settings/deal-types` |
| Types de flux | `#/settings/flow-types` |
| Sociétés de gestion | `#/settings/management-companies` |
| Champs personnalisés | `#/settings/custom-fields` |
| Pays et risques | `#/settings/countries-risks` |
| Fournisseurs | `#/settings/providers` |
| Plan comptable | `#/settings/chart-of-accounts` |
| Historique email | `#/settings/mail-history` |
| Historique SMS | `#/settings/sms-history` |
| Templates email | `#/settings/mail-templates` |
| Stats email | `#/settings/mail-stats` |
| Groupes email | `#/settings/mail-groups` |
| Logs | `#/settings/logs` |
| Logs Lemonway | `#/settings/logs-lemonway` |
| Logs Harvest | `#/settings/logs-harvest` |
| IPs connues | `#/settings/known-ips` |
| DocuSign | `#/settings/docusign` |
| Contrôles | `#/settings/controls` |
| AICs | `#/settings/aics` |
| Imports | `#/settings/imports` |
| Fichiers hébergés | `#/settings/hosted-files` |
| Catégories de sections | `#/settings/section-categories` |
| Reporting | `#/settings/reporting` |
| Rapports | `#/settings/reports` |
| Requêtes | `#/settings/queries` |
| Formatage variables | `#/settings/variable-formatting` |
| Outils | `#/settings/tools` |

## Exemples d'utilisation

### Lien complet

Si votre application est hébergée sur `https://investhub.app`, les liens complets seraient :

```
https://investhub.app/#/investors
https://investhub.app/#/monitoring
https://investhub.app/#/settings/investor-status
```

### Partager un lien

1. Naviguez vers la page que vous souhaitez partager
2. Copiez l'URL depuis la barre d'adresse de votre navigateur
3. Partagez cette URL avec vos collaborateurs
4. Ils seront automatiquement dirigés vers la même page

### Bookmarker une page

1. Naviguez vers la page
2. Utilisez le raccourci `Ctrl+D` (Windows/Linux) ou `Cmd+D` (Mac)
3. La page sera bookmarkée avec son URL exacte

## Fonctionnalités avancées

### Navigation via le navigateur

- **Bouton précédent** : Revient à la page précédente
- **Bouton suivant** : Avance à la page suivante
- Les changements de page sont enregistrés dans l'historique du navigateur

### URLs avec paramètres (à venir)

Dans les futures versions, vous pourrez également partager des liens avec des paramètres :

```
#/investors?status=prospect&search=dupont
#/monitoring?status=need_review&analyst=marie
#/settings/investor-status?highlight=new-status-id
```

## Utilisation programmatique

### Pour les développeurs

Le système de routing expose plusieurs fonctions utilitaires dans `/utils/routing.ts` :

```typescript
import { navigateToPage, getShareableUrl, getPageFromHash } from './utils/routing';

// Naviguer vers une page
navigateToPage('investors');
navigateToPage('settings-investor-status');

// Obtenir l'URL partageable
const url = getShareableUrl('monitoring');
console.log(url); // https://investhub.app/#/monitoring

// Obtenir la page actuelle depuis l'URL
const currentPage = getPageFromHash();
```

## Limitations

- Les hash URLs commencent par `#`, ce qui est standard pour les SPAs (Single Page Applications)
- Les paramètres de recherche et filtres ne sont pas encore persistés dans l'URL
- Le rechargement de la page réinitialise l'état de l'application (filtres, recherches, etc.)

## Support

Pour toute question ou problème avec les liens partageables, contactez l'équipe technique InvestHub.
