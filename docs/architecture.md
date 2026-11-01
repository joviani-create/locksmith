# Architecture proposée — locksmith

## Décisions tirées de vos réponses
| Constat | Conséquence |
|---|---|
| Android **et** iPhone | PWA (une seule base de code, installable via « Ajouter à l'écran d'accueil » sur Safari et Chrome). |
| Réseau mobile toujours disponible, équipe de plusieurs serruriers | **Online-first avec cache hors-ligne** + base partagée pour que l'équipe voie les mêmes fiches. |
| Pas de notes existantes, apprentissage par l'expérience / YouTube | Priorité à la **saisie rapide de retours terrain** (formulaire de 1 minute) ; chaque source YouTube est enregistrée avec son lien. |
| Équipe évite les véhicules à risque | Champ `zone_risque` (vert / orange / rouge) : les véhicules **rouges** affichent un bandeau « hors périmètre ». |
| Principalement clés Xhorse, Autel pour certaines smart keys, KEYDIY en dernier | Champ `cles_compatibles` par fabricant, avec ordre de préférence. |
| Lishi parfois peu fiable (VW) | Le Lishi est un « outil » dans la base ; une note terrain peut signaler ses échecs. |

## Arborescence
```
locksmith/
├─ README.md
├─ prompts/                  # persona + montage (déjà présents)
├─ docs/architecture.md      # ce document
├─ data/
│  ├─ schema/fiche.schema.json
│  ├─ reference/outils.json  # votre parc d'outils
│  └─ fiches/
│     ├─ _exemples/          # exemples NON vérifiés (ignorés par l'app en production)
│     ├─ hyundai/ kia/ renault/ peugeot/ citroen/ toyota/ …
├─ scripts/                  # validation du schéma, build SQLite/JSON
├─ app/                      # PWA (Vite + TypeScript)
└─ .github/workflows/        # CI : validation + déploiement GitHub Pages
```

## Choix techniques (à valider)
- **Source de vérité** : fiches JSON dans le dépôt (relisibles, versionnées, corrigibles).
- **App** : Vite + TypeScript + Svelte ou React, recherche locale (Fuse.js), Service Worker (Workbox).
- **Partage entre serruriers** : étape 2 — un petit service (Supabase ou Firebase, gratuits à ce volume) pour que chacun envoie ses retours terrain, que vous validez avant de les promouvoir en `verifie_terrain`.
- **Hébergement** : GitHub Pages (gratuit).

## Ordre de remplissage proposé (selon votre périmètre)
1. Hyundai et Kia (volume le plus fort), 2. Toyota, 3. Renault / Peugeot / Citroën (anciens modèles),
4. Nissan / Mitsubishi / Mazda / Ford, 5. Geely / Haval / Great Wall / GAC,
6. VW (hors MQB) / Mercedes (< 2015) / Audi (anciens), 7. Jeep / Land Rover.
Les modèles listés comme risqués (Touareg, Audi récentes, Duster récent, Koléos…) sont saisis en **rouge** pour éviter toute erreur.
