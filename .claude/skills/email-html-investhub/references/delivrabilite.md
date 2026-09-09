# Délivrabilité : ce qui se joue hors du HTML

Le HTML le plus propre n'arrive pas en boîte de réception si l'expéditeur, l'objet ou l'infrastructure sont mal réglés. Ce document sert à produire la fiche d'envoi qui accompagne un email quand la demande touche à ces sujets, ou quand l'opérateur prépare un envoi marketing. Le skill ne paramètre rien : il rappelle et il vérifie ce qui est vérifiable depuis le HTML (version texte, lien de désabonnement, liens non raccourcis, liens vers le domaine de l'expéditeur).

## Objet, expéditeur, preheader

- Le display name identifie uniquement l'émetteur : pas de contenu de message, pas de nom du destinataire, pas d'emoji imitant un élément d'interface, pas de formulation qui suggère une réponse ("Re:", "Réponse à votre demande").
- Objet sans `Re:` ni `Fwd:` factices. Une promesse tenue par le contenu.
- Preheader court, cohérent avec l'objet, sans répétition de l'objet ni bourrage de mots-clés. Google déconseille de masquer du contenu via HTML ou CSS : le preheader masqué reste toléré s'il reste sobre.
- Une adresse d'expéditeur par type de message : marketing et transactionnel séparés (par exemple `news@` et `notifications@`), pour que la réputation de l'un ne pénalise pas l'autre.

## Infrastructure

- SPF et DKIM publiés sur le domaine d'envoi, clé DKIM de 2 048 bits.
- DMARC publié, au minimum en `p=none`, avec une adresse de rapport suivie.
- Domaine du `From:` aligné avec le domaine SPF ou DKIM.
- PTR valides en résolution directe et inverse, transmission en TLS.
- En-têtes `List-Unsubscribe` et `List-Unsubscribe-Post: List-Unsubscribe=One-Click` sur tout envoi marketing, plus un lien de désabonnement visible dans le corps. Demandes traitées sous 48 h.
- Taux de plaintes suivi dans Google Postmaster Tools : cible sous 0,10 %, alerte à 0,30 %.
- Version texte brut jointe à chaque envoi (le script la génère avec `--text-out`).
- Pas d'URL raccourcies. Les liens pointent vers le domaine de l'expéditeur ou vers un domaine de tracking aligné.
- Montée en volume progressive sur un nouveau domaine ou une nouvelle IP, cadence régulière, pas de pics.
- Ne pas juger la délivrabilité au taux d'ouverture : Google ne le mesure pas et le considère comme un mauvais indicateur. Regarder les plaintes, les rebonds, le placement en boîte de réception.

## Avant chaque envoi

- Rendu vérifié sur Gmail web, Gmail Android, Outlook classique, New Outlook, Apple Mail iOS, Orange et Free.
- Images bloquées : le message reste compréhensible, les alt sont lisibles.
- Dark mode : Apple Mail applique vos styles ; Gmail et Outlook inversent de façon acceptable.
- Zoom 200 % : rien ne déborde.
- Troncature Gmail : source sous 100 Ko, le pied reste visible.
- Tous les liens cliqués, y compris le miroir et le désabonnement, testé de bout en bout.
- Score spam contrôlé avec l'outil de l'ESP ou un service tiers.
- Envoi test sur une adresse de chaque FAI cible avant l'envoi réel.

## Fiche d'envoi type à joindre au récap

```
Objet : ...
Preheader : ...
Expéditeur : Nom affiché <adresse@domaine>, type marketing / transactionnel
Version texte : fichier .txt joint
Désabonnement : lien visible dans le pied + en-têtes List-Unsubscribe côté ESP
Tests prévus : Gmail web, Gmail Android, Outlook classique, New Outlook, Apple Mail iOS, Orange, Free
Points d'attention : ...
```
