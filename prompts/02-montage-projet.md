# Prompt 2 — Montage du projet : base de données + application web terrain

> À donner à l'assistant Locksmith Expert (Prompt 1) pour lancer la construction.
> Dépôt : `joviani-create/locksmith`, branche `main`.

---

## Objectif
Construire (1) une **base de données** des procédures de programmation de clés
automobiles, priorisée sur les véhicules présents à Madagascar, et (2) une
**application web mobile-first, utilisable hors-ligne**, pour les consulter sur le terrain.

## Contraintes
- Utilisateur unique au départ (le serrurier), appareil : téléphone/tablette Android.
- **Hors-ligne d'abord** : PWA avec Service Worker, base locale embarquée.
- Rapide : trouver une fiche en **moins de 10 secondes** (3 taps maximum).
- Gratuit à héberger (GitHub Pages / Cloudflare Pages / Netlify).
- Aucune donnée inventée : chaque fiche a un niveau de fiabilité et une source.
- Langue de l'interface : **français** (option malgache plus tard).

## Phase 0 — Cadrage (ne code rien avant validation)
Pose-moi les questions nécessaires, au minimum :
- Liste réelle des 20–30 modèles que je rencontre le plus.
- Modèles exacts d'outils et versions logicielles (Autel, XTool, VVDI, KEYDIY, XP400).
- Mes données existantes (notes, photos, captures, fichiers) à importer.
- Préférence stack (par défaut : voir ci-dessous).

## Phase 1 — Modèle de données
Propose et fais valider un schéma, au minimum :
- `marque`, `modele`, `generation` (années début/fin), `marche` (EU, JDM, Asie, Afrique…)
- `systeme_immo` (type, puce/transpondeur, fréquence télécommande, type de lame, profil de lame)
- `type_cle` (lame simple, télécommande, flip, smart/proximité) avec références de
  clés compatibles (Xhorse, KEYDIY, OEM, aftermarket)
- `procedure` : scénario (`cle_ajoutee`, `all_keys_lost`, `copie`), outil, accessoires, étapes ordonnées
- `prerequis` (PIN, alimentation, durée d'attente), `risques`
- `fiabilite` (`verifie_terrain`, `source_constructeur_outil`, `source_communautaire`, `a_verifier`),
  `source`, `version_logiciel`, `date_maj`
- `journal_intervention` (privé) : date, véhicule, VIN, résultat, notes, photos — pour
  capitaliser mes propres retours terrain.
Format de stockage : **JSON/YAML versionné dans le dépôt** (source de vérité,
facile à relire et corriger) + build vers **SQLite** (WASM) pour la recherche dans l'app.
Ajoute un **JSON Schema** et un script de validation exécuté en CI.

## Phase 2 — Alimentation de la base
- Commence par les **10 marques/modèles les plus courants à Madagascar**, pas tout d'un coup.
- Pour chaque fiche : remplis uniquement ce qui est connu avec certitude ; le reste
  en `a_verifier`. Ne devine jamais une puce, une fréquence ou un chemin de menu.
- Fournis un **gabarit de saisie** pour que j'ajoute mes retours terrain en 1 minute
  (formulaire dans l'app + export JSON).
- Prévois un import CSV pour mes notes existantes.

## Phase 3 — Application web
Stack par défaut (à confirmer en Phase 0) : **TypeScript + Vite + React (ou Svelte)**,
SQLite WASM ou index JSON + Fuse.js, Workbox pour le hors-ligne.
Fonctions MVP :
1. **Recherche** instantanée (marque → modèle → année) + saisie libre + filtre marché.
2. **Fiche véhicule** : système immo, clés compatibles, procédures par scénario
   (ajout / All Keys Lost), outil recommandé, risques en évidence (bandeau rouge).
3. **Mode checklist** pas-à-pas, gros boutons, écran qui reste allumé.
4. **Favoris** et **récents**.
5. **Journal d'intervention** local (+ export/import JSON), photos facultatives.
6. **Badge de fiabilité** visible sur chaque donnée.
7. **Hors-ligne complet** + indicateur de dernière synchronisation/mise à jour.
8. Thème sombre/clair, police lisible, usage à une main.
Hors MVP : comptes multi-utilisateurs, synchro cloud, OCR du VIN, décodage VIN, version malgache.

## Phase 4 — Qualité et livraison
- Tests : validation du schéma, tests de recherche, test e2e du mode hors-ligne (Playwright).
- Déploiement automatique (GitHub Actions → GitHub Pages) à chaque push sur `main`.
- Audit Lighthouse (PWA ≥ 90, perf mobile ≥ 85).
- `README.md` : installation, ajout d'une fiche, conventions, comment installer l'app sur le téléphone.

## Méthode de travail
- Travaille **par petites étapes** : une phase à la fois, résume ce qui est fait,
  propose la suite, attends ma validation avant la phase suivante.
- Un commit clair par changement logique ; push sur `main` à la fin de chaque étape.
- Quand une donnée automobile te manque, **demande-la-moi ou marque-la `a_verifier`**.
- Termine chaque réponse par : ce qui est fait / ce qui reste / ce que tu me demandes.

## Premier livrable attendu
1. Tes questions de la Phase 0.
2. Une proposition de schéma de données (Phase 1) avec 2 fiches d'exemple
   clairement marquées comme **exemples non vérifiés**.
3. L'arborescence du dépôt proposée.
