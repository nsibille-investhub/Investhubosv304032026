# Starter Pack gabarits de mails — données de maquette

Contenu réel extrait du Starter Pack Confluence (espace WIH, page parent
`931037186` « Gabarit Mail - Starter Pack »). Chaque section du référentiel a
son fichier ici, avec pour chaque gabarit : slug, libellé, origine de l'envoi,
destinataire, variables réellement remplacées à l'envoi, variables proposées
(qui n'existent pas encore côté code), puis le sujet et le HTML généré en
français et en anglais.

Le HTML est repris tel quel depuis Confluence, sans reformatage : c'est ce que
l'écran Gabarits des mails affiche dans l'éditeur et l'aperçu.

## Correspondance sections / pages Confluence

| Fichier | Section | Page Confluence | Gabarits |
| --- | --- | --- | --- |
| `section-01-accounts.ts` | 1 Comptes et accès | 931069954 | 16 |
| `section-02-onboarding.ts` | 2 Onboarding et souscriptions | 930971651 | 18 |
| `section-03-signature.ts` | 3 Signature électronique | 931168258 | 6 |
| `section-04-kyc.ts` | 4 KYC / AML et conformité | 931201026 | 13 |
| `section-05-payments.ts` | 5 Paiements | 930971672 | 3 |
| `section-06-capital-calls.ts` | 6 Appels de fonds | 931233794 | 7 |
| `section-07-distributions.ts` | 7 Distributions, capital accounts et déblocages | 930709507 | 7 |
| `section-08-redemptions.ts` | 8 Rachats | 930807810 | 7 |
| `section-09-secondary.ts` | 9 Marché secondaire | 931102722 | 9 |
| `section-10-documents.ts` | 10 Documents et data room | 930545678 | 5 |
| `section-11-partners.ts` | 11 Partenaires et rétrocessions | 930217986 | 12 |
| `section-12-communication.ts` | 12 Communication et demandes de contact | 931135490 | 9 |

Total attendu : 112 gabarits. `index.ts` assemble les sections et vérifie ce
total au chargement.

## Reprendre une extraction interrompue

Les fichiers de section absents sont ceux qui restent à extraire. Pour chacun :
récupérer la page Confluence correspondante au format markdown, puis
transcrire chaque ligne du tableau en entrée `StarterPackTemplate`. Le HTML doit
être copié caractère pour caractère, y compris les styles inline et les
entités (`&copy;`, `&middot;`, `&nbsp;`).
