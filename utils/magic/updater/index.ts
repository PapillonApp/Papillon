import * as FileSystem from "expo-file-system/legacy";
import { loadTensorflowModel } from "react-native-fast-tflite";

import { log } from "@/utils/logger/logger";

import { extractMagicToStaging, validateExtractedTree } from "./extract";
import { ensureDir, readJSON, withLock, writeJSON } from "./fileUtils";
import { fileSha256Hex, verifySize } from "./integrity";
import { fetchManifest, validateManifest } from "./manifest";
import { isInternetReachable } from "./network";
import { satisfiesAll } from "./semver";
import { CurrentPtr } from "./types";

const MODELS_ROOT = FileSystem.documentDirectory + "papillon-models/";
const CURRENT_PTR = MODELS_ROOT + "current.json";
const LOCK_PATH = MODELS_ROOT + ".update.lock";

export async function getCurrentPtr(): Promise<CurrentPtr | null> {
  log(`[MODELUPDATER] Lecture du pointeur actuel: ${CURRENT_PTR}`);
  const info = await FileSystem.getInfoAsync(CURRENT_PTR);
  if (!info.exists) {
    log("[PTR] Aucun pointeur trouvé.");
    return null;
  }
  const ptr = await readJSON<CurrentPtr>(CURRENT_PTR);
  log(`[MODELUPDATER] Actuel: ${ptr.name} v${ptr.version}`);
  return ptr;
}

export async function setCurrentPtr(ptr: CurrentPtr) {
  log(`[PTR] Mise à jour du pointeur -> ${ptr.name} v${ptr.version}`);
  await writeJSON(CURRENT_PTR, ptr);
}

async function smokeTestModel(dirUri: string) {
  log(`[MODELUPDATER] Test du modèle: ${dirUri}model/model.tflite`);
  const m = await loadTensorflowModel({ url: dirUri + "model/model.tflite" });
  const inputShape = m?.inputs?.[0]?.shape;
  const batchSize = inputShape?.[0] ?? 1;
  const maxLen = inputShape?.[1] ?? 128;
  const totalElements = batchSize * maxLen;
  log(`[MODELUPDATER] Input shape: ${inputShape}, batchSize=${batchSize}, maxLen=${maxLen}, totalElements=${totalElements}`);
  
  const inputArr = new Int32Array(totalElements);
  inputArr.fill(0);
  
  await m.run([inputArr]);
  log("[MODELUPDATER] Test réussi");
}

export async function checkAndUpdateModel(
  appVersion: string,
  manifestUrl?: string
) {
  return withLock(LOCK_PATH, async () => {
    log("[MODELUPDATER] Démarrage de l'updater");

    if (!(await isInternetReachable())) {
      log("[MODELUPDATER] Pas de connexion internet. Annulation.");
      return {
        updated: false,
        using: await getCurrentPtr(),
        reason: "offline",
      };
    }

    if (!manifestUrl) {
      throw new Error("manifestUrl is required");
    }
    const latest = await fetchManifest(manifestUrl, appVersion);
    validateManifest(latest);
    log("[MODELUPDATER] Manifest valide");

    if (
      latest.compatible_versions?.length &&
      !satisfiesAll(appVersion, latest.compatible_versions)
    ) {
      log(
        `[MODELUPDATER] Version app ${appVersion} incompatible avec ${latest.compatible_versions.join(", ")}`
      );
      return {
        updated: false,
        using: await getCurrentPtr(),
        reason: "incompatible",
      };
    }
    log("[MODELUPDATER] Compatible");

    log("[MODELUPDATER] Vérification si déjà à jour…");
    const current = await getCurrentPtr();
    if (
      current &&
      current.version === latest.version &&
      current.name === latest.name
    ) {
      log("[MODELUPDATER] Déjà à jour");
      return { updated: false, using: current, reason: "same-version" };
    }
    log("[MODELUPDATER] Nouvelle version détectée");

    const magicPath = MODELS_ROOT + `tmp_${Date.now()}.magic`;
    log(
      `[MODELUPDATER] Téléchargement du nouveau modèle: ${latest.download_url}`
    );
    await FileSystem.downloadAsync(latest.download_url, magicPath);
    log(`[MODELUPDATER] Téléchargement terminé -> ${magicPath}`);

    if (latest.size_bytes) {
      await verifySize(magicPath, latest.size_bytes);
      log("[MODELUPDATER] Taille correcte");
    }

    if (latest.sha256) {
      const hex = await fileSha256Hex(magicPath);
      if (hex !== latest.sha256.toLowerCase()) {
        throw new Error(`sha256-mismatch expected=${latest.sha256} got=${hex}`);
      }
      log("[MODELUPDATER] Intégrité OK");
    }

    const staging = MODELS_ROOT + `_staging_${latest.name}_${latest.version}/`;
    await extractMagicToStaging(magicPath, staging);
    log("[MODELUPDATER] Extraction terminée");

    const infos = (await validateExtractedTree(staging)) as {
      name: string;
      version: string;
    };
    if (infos.name !== latest.name || infos.version !== latest.version) {
      throw new Error("infos-mismatch");
    }
    log("[MODELUPDATER] Structure valide");

    log("[MODELUPDATER] Lancement du test");
    await smokeTestModel(staging);

    const finalDir = MODELS_ROOT + `${latest.name}/${latest.version}/`;
    log(`[MODELUPDATER] Promotion vers dossier final: ${finalDir}`);
    await ensureDir(MODELS_ROOT + `${latest.name}/`);
    if ((await FileSystem.getInfoAsync(finalDir)).exists) {
      log("[MODELUPDATER] Suppression ancienne version…");
      await FileSystem.deleteAsync(finalDir, { idempotent: true });
    }
    await FileSystem.moveAsync({ from: staging, to: finalDir });
    log("[MODELUPDATER] Promotion effectuée ✅");

    const nextPtr: CurrentPtr = {
      name: latest.name,
      version: latest.version,
      dir: finalDir,
    };
    await setCurrentPtr(nextPtr);

    try {
      log(`[MODELUPDATER] Suppression fichier temporaire: ${magicPath}`);
      await FileSystem.deleteAsync(magicPath, { idempotent: true });
    } catch (e) {
      log(`[MODELUPDATER]  Erreur suppression temp: ${String(e)}`);
    }

    log("[MODELUPDATER] Mise a jour terminé");
    return { updated: true, using: nextPtr };
  });
}

export function getActivePaths(ptr: CurrentPtr) {
  const base = ptr.dir;
  return {
    model: base + "model/model.tflite",
    tokenizer: base + "model/tokenizer.json",
    labels: base + "model/labels.json",
    infos: base + "metadata.json",
  };
}
