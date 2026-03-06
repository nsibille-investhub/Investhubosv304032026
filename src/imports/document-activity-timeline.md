FRONT – Timeline d’activité Document

Affichage des actions User (Investisseur + Contact Supp)

Objectif

Afficher, pour un document donné :

L’historique chronologique des actions

Les actions des investisseurs

Les actions des contacts supplémentaires

En respectant :

Le contexte actif (Global / Investisseur / Contact)

Les filtres appliqués

Le Rule Engine

Source de vérité

API utilisée :

GET /documents/{document_id}/activity

Le Front ne reconstruit jamais la timeline à partir d’autres endpoints.

Chargement selon le contexte

Mode Global (Admin)

Appel :

GET /documents/{id}/activity

Retourne :

Tous les événements

Tous les investisseurs

Tous les contacts

Mode Investisseur

Appel :

GET /documents/{id}/activity?investor_id=123

Retourne :

Les événements directs de l’investisseur

Les événements de tous ses contacts


⚠️ Aucun événement d’un autre investisseur ne doit être retourné.

Mode Contact

Appel :

GET /documents/{id}/activity?contact_id=456

Retourne :

Uniquement les événements liés à ce contact

Pas ceux des autres contacts.
 Pas ceux de l’investisseur principal.

Types d’événements affichés

Notifications

notification_sent

notification_delivered

notification_failed

notification_opened

notification_clicked

Consultation

document_viewed

document_downloaded

Chaque événement = 1 ligne distincte.

Un téléchargement reste distinct d’une consultation.

Rendu UI

Chaque ligne doit afficher :

Icône adaptée au type

Label métier (“Document téléchargé”, “Notification ouverte”…)

user_name

user_type (Investor / Contact / Advisor)

timestamp

Ordre :

Décroissant (plus récent en haut)

Filtres Front

Filtres possibles :

Par type (notification / consultation)

Par période (from / to)

Par utilisateur

Chaque filtre déclenche un nouvel appel API.

Le filtrage s’applique côté backend avant pagination.

Pagination

Paramètres :

page
limit

Règle :

Pagination backend

Le Front ne slice jamais localement

Les filtres doivent être appliqués avant pagination

Respect du Rule Engine

Un événement ne doit être affiché que si :

Le document est accessible dans le contexte actif

L’utilisateur appelant a le droit de voir ces logs

Exemple :

En contexte investisseur A
 → aucun event de l’investisseur B ne doit apparaître

Cas spécifiques

🔹 Contact supp

Un événement généré par un contact doit contenir :

{
  "contact_id": 456,
  "investor_id": 123
}

Il est rattaché :

au contact

et indirectement à l’investisseur

Intégration avec KPI

La timeline permet de recalculer :

Engagement document

Nombre total d’événements

Dernière activité

Activité par user

Invariants

Les événements sont immuables.

Chaque action est indépendante.

Le tri est toujours chronologique.

Les filtres doivent être cumulables.

Le backend reste source de vérité.