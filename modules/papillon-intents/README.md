# papillon-intents

Bridge **générique** entre les **Apple App Intents** (Siri / Apple Intelligence /
Raccourcis / Spotlight, iOS 16+) et le **runtime JS React**. iOS uniquement.

Tu déclares tes intents et tes entités dans **un seul fichier de config qui vit
dans TON app** (`papillon-intents.config.ts`, à la racine du projet — pas dans le
module). Le code Swift (App Intents + App Entities + AppShortcutsProvider) est
**généré au prebuild**. Côté JS, tu fournis une fonction async par `action` ;
quand Siri lance l'intent, le bridge exécute ta fonction, attend la donnée
fraîche, et la rend à Siri sous forme d'App Entities.

Le module ne contient **aucune** config en dur : il est réutilisable tel quel
sur plusieurs apps, chacune fournissant son propre fichier de config.

---

## Installation

```bash
npm install papillon-intents
```

1. **Ajoute le plugin** dans `app.json` (il découvre `papillon-intents.config.*`
   à la racine ; ou passe un chemin explicite) :
   ```json
   {
     "expo": {
       "plugins": [
         "papillon-intents"
       ]
     }
   }
   ```
   ```jsonc
   // variante avec chemin explicite :
   "plugins": [["papillon-intents", { "config": "./config/intents.ts" }]]
   ```
2. **Crée `papillon-intents.config.ts`** à la racine de l'app (voir la référence
   plus bas).
3. **Enregistre tes handlers** au tout début de l'entrée JS (avant le render),
   et **`npx expo prebuild -p ios`**. Build sur **device réel** (Siri / App
   Intents ne marchent pas en Expo Go).

> Développement local de ce repo : le module est local (`modules/papillon-intents`)
> et l'app de test l'importe par chemin relatif. Un consommateur npm importe par
> nom : `import { registerHandler } from "papillon-intents"`.

---

## Comment ça marche (le pont headless)

Un App Intent est du Swift pur, isolé du JS. Avec `openAppWhenRun = false`,
l'intent s'exécute **in-process** : iOS réveille l'app **en arrière-plan** (sans
UI), donc Expo/RN charge le bundle et le runtime JS devient vivant.

```
Siri / Raccourcis
      │  perform()
      ▼
GetLatestGradesIntent ──► PapillonIntentsBridge.fetch(action)   (Swift)
      ▲                            │  event onIntentRequest{requestId, action, params}
      │  .result(value:[Entity])   ▼
      │                     registry (JS) ──► ton handler async  ── refresh ──►
      │                            │  resolveRequest(requestId, json)
      └──────── CheckedContinuation ◄────────┘
```

- Si l'app tourne déjà → réponse quasi-instantanée.
- Si l'app est froide → l'app boot en arrière-plan ; la requête est **mise en
  file** côté natif et **rejouée** dès que JS appelle `markReady()`.
- `timeoutMs` borne l'attente (budget Siri ~30 s).

> ⚠️ **Expérimental.** iOS n'a pas de Headless JS officiel. Risques : latence de
> boot à froid, restauration de session sans UI. **Fallback** : mettre
> `openAppWhenRun: true` sur l'intent (ouvre l'app pour rafraîchir).

---

## Ajouter un intent en 3 étapes

1. **Déclare-le** dans `papillon-intents.config.ts` (racine de l'app : entité + intent).
2. **Enregistre le handler** côté app (cf. `src/intents.ts`) :
   ```ts
   registerHandler("courses.getForDay", async (params) => {
     const day = params.day as string | undefined;
     return await fetchCourses(day); // shape = l'entité déclarée
   });
   ```
3. **`npx expo prebuild -p ios`** puis rebuild. Le nouvel intent apparaît dans
   Raccourcis / Siri, sans écrire de Swift.

---

## Référence du fichier de config

### `settings`
| Clé | Type | Défaut | Description |
|---|---|---|---|
| `appGroup` | `string` | — | App Group backing le cache des entités (`group.…`). |
| `defaultTimeoutMs` | `number` | `25000` | Timeout par défaut des intents. |
| `logLevel` | `"off"\|"error"\|"warn"\|"debug"` | `"warn"` | Verbosité JS. |
| `backgroundLaunch` | `boolean` | `true` | Autorise le réveil headless. |
| `cache` | `{ enabled, ttlMs? }` | `{enabled:true}` | Cache App Group pour les queries. |
| `donations` | `{ enabled }` | — | Donation des intents (suggestions Siri). |
| `spotlight` | `{ enabled }` | — | Indexation Spotlight (réservé, voir Limites). |

### `entities` (chaque entrée → 1 `AppEntity` Swift)
| Clé | Type | Description |
|---|---|---|
| `typeName` | `string` | `"Grade"` → `struct GradeEntity`. |
| `typeDisplayName` | `string` | Nom de type (TypeDisplayRepresentation). |
| `display` | `{ title, subtitle?, image? }` | Champs affichés par Siri. `image` = `{ systemImage }` \| `{ systemImageField }` \| `{ urlField }`. |
| `properties` | `Record<name, {type,title?,queryable?,searchable?}>` | `@Property` typées. `type` ∈ `string\|number\|bool\|date` (+ `?`). |
| `defaultQueryProperty` | `string` | Propriété de la query par défaut. |
| `stringQueryProperties` | `string[]` | Champs matchés par `EntityStringQuery` (recherche libre). |
| `indexed` | `boolean` | Réservé Spotlight (voir Limites). |

### `intents`
| Clé | Type | Description |
|---|---|---|
| `id` | `string` | `"getLatestGrades"` → `GetLatestGradesIntent`. |
| `action` | `string` | Clé de routage → `registerHandler(action, fn)`. |
| `title` | `string` | Titre de l'intent. |
| `description` | `string?` | IntentDescription. |
| `phrases` | `string[]?` | Phrases Siri. Utiliser `${applicationName}` (requis iOS 17+). |
| `shortTitle` / `systemImage` | `string?` | Tuile du raccourci. |
| `openAppWhenRun` | `boolean?` | `false` = headless ; `true` = fallback ouverture app. |
| `requiresAuth` | `boolean?` | Ajoute `__requiresAuth: true` aux params du handler. |
| `timeoutMs` | `number?` | Override du timeout. |
| `parameters` | `ParameterDef[]?` | `type` ∈ `string\|number\|bool\|date\|enum\|entity`. |
| `returns` | `ReturnShape` | `{type:"entityList"\|"entity", entity, dialog?}` \| `{type:"dialog", dialog}` \| `{type:"value", dialog?}`. |

---

## API JS

```ts
import {
  registerHandler, registerHandlers, unregisterHandler,
  configure, primeCache, readCache,
} from "papillon-intents"; // ou chemin relatif vers modules/papillon-intents/src
```

- `registerHandler(action, async (params) => result)` — la donnée fraîche.
- `configure(settings)` — pousse timeout / logLevel / appGroup au natif.
- `primeCache(entityType, items)` — pré-remplit le cache App Group (pour
  `suggestedEntities` quand JS est éteint).

---

## Limites & notes

- **Device réel requis** : Siri / App Intents ne fonctionnent pas dans Expo Go,
  et les donations ne s'entraînent que sur device.
- **Cross-module import** : le Swift généré (target principale) fait
  `import PapillonIntents` pour atteindre `PapillonIntentsBridge` /
  `PapillonEntityStore` (pod, `DEFINES_MODULE = YES`).
- **Auth headless** : le handler doit pouvoir restaurer la session sans UI.
- **`indexed` / Spotlight** : la conformance `IndexedEntity` (iOS 18) n'est pas
  encore générée — les queries lisent déjà le cache App Group, ce qui couvre
  `suggestedEntities`. À étendre via CoreSpotlight si besoin.
