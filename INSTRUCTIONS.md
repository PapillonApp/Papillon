# Scola — passage à Tauri

Dézippe à la racine du repo (comme les patchs précédents), accepte de
remplacer `package.json`, commit, push.

Nouveau par rapport à Electron :
- `src-tauri/` — le projet Rust/Tauri (remplace `electron/`)
- `.github/workflows/build-tauri.yml` — nouveau workflow (tu peux supprimer
  `build-electron.yml` et le dossier `electron/` si tu ne veux plus du tout
  d'Electron, ou les garder de côté sans impact)

Pas de clé Google à configurer cette fois : Tauri utilise le navigateur
Edge installé sur le PC (WebView2), qui gère la géolocalisation nativement
via le service de localisation de Windows.

Toujours nécessaire : Windows Paramètres → Confidentialité → Localisation →
autoriser les applications à accéder à la position.

Lancement : Actions → "Build Scola (Tauri)" → Run workflow. Le premier build
Rust est plus long que les précédents (compilation native, pas juste du JS) —
compte plusieurs minutes de plus.
