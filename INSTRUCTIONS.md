# Scola desktop — à dézipper à la racine de ton repo Papillon

## 1. Installer

```
git clone https://github.com/<ton-fork>/Papillon.git
cd Papillon
```

Dézippe ce fichier directement à la racine (les dossiers `app/`, `electron/`,
`.github/` etc. viennent se fondre dans les tiens — dis "remplacer" si demandé).

```
git add -A
git commit -m "Ajout de Scola (version PC via Electron)"
git push
```

## 2. Clé Google Geolocation (pour que la position soit trouvée, pas juste demandée)

1. console.cloud.google.com → nouveau projet
2. API Library → active "Geolocation API"
3. Facturation → lie un compte de facturation au projet (obligatoire côté Google, même en usage gratuit)
4. Identifiants → Créer des identifiants → Clé API → restreins-la à la Geolocation API
5. Sur GitHub : Settings → Secrets and variables → Actions → New repository secret
   → nom `GOOGLE_GEOLOCATION_API_KEY`, valeur = la clé

Sans cette étape, l'app compile et tourne quand même : la permission de
géolocalisation est bien demandée, seule la recherche de position échouera.

## 3. Lancer le build

Onglet **Actions** du repo → "Build Electron (Scola)" → **Run workflow**.
Une fois terminé, l'installeur `Scola Setup 1.0.0.exe` est dans les
**artifacts** du run.

## Contenu de ce patch

- `package.json`, `app.config.ts`, `.gitignore` — modifiés (une ligne/bloc ajouté à chaque fois)
- `app/(onboarding)/utils/constants.tsx`, `.../pronote/locate.tsx` — modifiés (le QR code est masqué sur PC)
- `app/(onboarding)/services/pronote/qrcode.web.tsx` — nouveau (écran de repli si on tombe quand même sur cette route)
- `utils/magic/ModelManager.web.ts`, `utils/magic/updater/index.web.ts` — nouveaux (le modèle IA "Magic" est désactivé sur PC, pas d'équivalent web pour TensorFlow Lite)
- `database/index.web.ts` — nouveau (stockage local via IndexedDB au lieu de SQLite natif)
- `patches/esup-multi.js+1.0.4.patch` — corrige un vrai bug de packaging dans une dépendance (`esup-multi.js`), appliqué automatiquement par patch-package à l'install
- `electron/` — l'appli desktop (main.js, preload.js, config electron-builder, icônes/visuels Scola)
- `.github/workflows/build-electron.yml` — le workflow qui build l'exe

Détails et explications de chaque choix : voir la conversation Claude.
