# locksmith

Base de données et application web (PWA) pour la programmation de clés automobiles sur le terrain.
Priorité : véhicules présents à Madagascar.

## Principe
- `data/fiches/**.json` : **source de vérité** (une fiche par véhicule), validée par `data/schema/fiche.schema.json`.
- `data/reference/outils.json` : le parc d'outils (Autel IM508 + XP400, XTool X100 PAD, Xhorse VVDI Mini Key Tool, KEYDIY KD-X2, Xhorse Panda, Lishi).
- `app/` : PWA (Preact + Vite), utilisable sur Android et iPhone, hors-ligne après la première ouverture.

## Règle d'or
Aucune donnée inventée. Chaque procédure porte un niveau de fiabilité
(`verifie_terrain`, `source_constructeur_outil`, `source_communautaire`, `a_verifier`) et une source.
Les véhicules hors périmètre de l'équipe sont en `zone_risque: "rouge"`.

## Ajouter une fiche
1. Copier un exemple de `data/fiches/_exemples/` vers `data/fiches/<marque>/<id>.json`.
2. Remplir **uniquement ce qui est certain** ; le reste en `a_verifier`.
3. Vérifier : `cd app && npm install && npm run validate`.
4. Les fiches dont l'`id` commence par `exemple_` affichent un bandeau « EXEMPLE FICTIF » : à supprimer dès que de vraies fiches existent.

## Développer
```bash
cd app
npm install
npm run dev       # serveur local
npm run build     # validation + build de production
```

## Installer sur le téléphone
- **Android (Chrome)** : menu ⋮ → « Installer l'application ».
- **iPhone (Safari)** : Partager → « Sur l'écran d'accueil ».

Ouvrir l'application une fois avec du réseau pour la mettre en cache.

## Déploiement
Chaque push sur `main` valide les fiches puis déploie sur GitHub Pages
(à activer une fois : Settings → Pages → Source : « GitHub Actions »).

## Journal d'intervention
Stocké **localement** sur l'appareil (jamais envoyé). Export/import JSON depuis l'onglet « Journal »
pour sauvegarder ou partager avec l'équipe.
