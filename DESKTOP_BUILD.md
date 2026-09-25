# Papillon — build desktop (Windows)

Ce dossier ajoute un portage **desktop non officiel** de [Papillon](https://github.com/PapillonApp/Papillon)
par-dessus le code source de l'app mobile (Expo / React Native), en gardant
l'app mobile strictement intacte : rien n'a été supprimé, seulement des
fichiers ajoutés et quelques points de branchement `Platform.OS === 'web'`.

- **Techno** : [Tauri 2](https://tauri.app/) plutôt qu'Electron — le binaire
  final s'appuie sur WebView2 (déjà présent sur Windows 10/11) au lieu
  d'embarquer tout Chromium, donc un exécutable de quelques Mo au lieu de
  100+ Mo.
- **Aucun droit admin requis** : l'installeur NSIS est configuré en mode
  `currentUser` (installation dans le profil utilisateur, pas dans
  `Program Files`). L'exécutable brut (`papillon.exe`, sans installeur) est
  aussi fourni en artefact de build si tu préfères juste le lancer sans
  rien installer.
- **macOS** : non traité pour l'instant, comme demandé.

## Builder le .exe (sur GitHub, sans rien installer en local)

1. Pousse ce dossier vers ton fork (`https://github.com/<toi>/Papillon`).
2. Onglet **Actions** → workflow **"Build desktop (Windows)"** → **Run workflow**.
   (Il se déclenche aussi automatiquement à chaque push sur `main`/`master`.)
3. Une fois le run terminé (~10-15 min, compilation Rust incluse), l'artefact
   **`papillon-windows`** contient :
   - `Papillon_0.1.0_x64-setup.exe` (installeur NSIS, mode utilisateur)
   - `papillon.exe` (exécutable portable, aucune installation)

## Builder en local (si tu as Rust + Node)

```bash
npm install
npm run desktop:build
```

Le build web passe par `npm run export:web` (Expo, plateforme `web`, sortie
SPA dans `dist/`) automatiquement avant la compilation Tauri — c'est
configuré dans `src-tauri/tauri.conf.json` (`beforeBuildCommand`).

## Ce qui a changé par rapport au code mobile

Tout est dans `web-shims/` (composants de remplacement, un fichier par
paquet incompatible) + `metro.config.js` (qui redirige ces paquets vers
leur shim **uniquement en bundling web** — iOS/Android ne sont jamais
impactés) :

| Paquet / fichier | Pourquoi | Ce qui change sur desktop |
|---|---|---|
| `react-native-fast-tflite` | Aucun runtime TFLite hors mobile | La fonctionnalité **"Magic"** (catégorisation auto des devoirs) est désactivée |
| `@nozbe/watermelondb` (adaptateur) | `better-sqlite3` est un binaire Node, pas dispo en navigateur | `database/index.web.ts` utilise `LokiJSAdapter` (IndexedDB) — stockage local réel, pas un stub |
| `esup-multi.js` | `package.json` cassé en amont (`main` pointe vers un fichier absent du paquet publié) | Rien ne change vraiment : juste redirigé vers le vrai fichier CJS |
| `@react-native-community/datetimepicker` | Aucun support web | Réécrit avec les `<input type="date"/"time">` natifs du navigateur |
| `react-native-linear-gradient` | Aucun support web | Réécrit en CSS `linear-gradient()` |
| `react-native-dynamic-theme` (Material You) | Importe un module natif Android au chargement, même hors Android | Repli JS pur déjà utilisé par l'app sur iOS — comportement identique |
| MMKV (`stores/global/index.ts`) | Le chiffrement MMKV n'existe pas sur web | Le stockage des comptes n'est **pas chiffré** sur desktop (stocké en localStorage). La clé étant de toute façon codée en dur dans le bundle JS, ce n'était de toute façon qu'une protection légère, pas un vrai secret — mais autant le savoir. |
| `react-native-webview` | Aucun support web, et un `<iframe>` ne peut pas injecter du JS dans une page cross-origin (sandbox navigateur) | Voir section dédiée ci-dessous ⚠️ |
| Sortie web Expo | Le mode `"static"` (pré-rendu de 136 routes en pages HTML) plantait (`this.validatePath is not a function`, bug de rendu statique, pas lié aux shims) | Passé en `"single"` (SPA classique) dans `app.config.ts` — de toute façon le bon choix pour une app chargée une fois par Tauri |

## ⚠️ Partie la moins testée : connexion Pronote via ENT/CAS

Un des multiples chemins de connexion Pronote (`app/(onboarding)/services/pronote/browser.tsx`,
utilisé par les établissements avec authentification fédérée) injecte du
JavaScript dans la page Pronote elle-même pour lire son état de connexion.
Un `<iframe>` ne peut **pas** faire ça pour du contenu cross-origin — c'est
une limitation de sécurité du navigateur, pas quelque chose de contournable
en JS.

La solution mise en place (`web-shims/react-native-webview.web.tsx` côté JS
+ `src-tauri/src/embedded_webview.rs` côté Rust) ouvre une vraie fenêtre
WebView native pilotée depuis Rust, avec le même niveau d'accès que la
WebView native sur mobile (injection de script, lecture de la navigation).

Cette partie repose sur des API Tauri réelles et documentées
(`on_navigation`, `on_page_load`, `initialization_script`, `on_ipc_handler`),
mais je n'ai **pas pu la compiler ni la tester** de bout en bout — pas de
toolchain Rust/Windows disponible dans l'environnement où ce projet a été
préparé. Si `cargo build` râle sur une de ces méthodes lors du premier run
GitHub Actions, la doc Tauri sur `WebviewWindowBuilder` est le premier
endroit à regarder :
<https://docs.rs/tauri/latest/tauri/webview/struct.WebviewWindowBuilder.html>

**Tous les autres chemins de connexion Pronote** (identifiants directs,
QR code, etc.) ainsi qu'EcoleDirecte, Skolengo, etc. n'utilisent pas de
WebView et ne sont pas concernés par cette limitation.

## Pas vérifié en détail (mais ne fait pas planter le build)

- Fonctionnalités caméra (scan QR/carte cantine) : `expo-camera` a un
  support web correct côté paquet, mais le flux caméra desktop n'a pas été
  cliqué en conditions réelles.
- Géolocalisation : pareil, le paquet supporte le web, non re-testé ici.
- Widgets écran d'accueil iOS/Android : déjà absents proprement sur toute
  plateforme non-iOS (`widgets/useWidgetSync.ts`), rien à faire.

## Icônes

Générées automatiquement depuis `assets/images/icon.png` (l'icône Papillon
existante) via `npx tauri icon`.
