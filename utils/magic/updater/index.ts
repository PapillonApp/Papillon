import { Directory, File, Paths } from "expo-file-system";
import { loadTensorflowModel } from "react-native-fast-tflite";

import { debug } from "@/utils/logger/logger";

import { extractMagicToStaging, validateExtractedTree } from "./extract";
import { ensureDir, readJSON, withLock, writeJSON } from "./fileUtils";
import { fileSha256Hex, verifySize } from "./integrity";
import { fetchManifest, validateManifest } from "./manifest";
import { isInternetReachable } from "./network";
import { satisfiesAll } from "./semver";
import { CurrentPtr } from "./types";

const MODELS_ROOT = new Directory(Paths.document, "papillon-models");

export async function getCurrentPtr(): Promise<CurrentPtr | null> {
  const currentPtrFile = new File(MODELS_ROOT, "current.json");
  debug(`[MODELUPDATER] Lecture du pointeur actuel: ${currentPtrFile.uri}`);
  
  // Vérifier si le répertoire parent existe
  if (!MODELS_ROOT.exists) {
    debug("[PTR] Répertoire papillon-models n'existe pas");
    return null;
  }
  
  if (!currentPtrFile.exists) {
    debug("[PTR] Aucun pointeur trouvé.");
    return null;
  }
  
  try {
    const ptr = await readJSON<CurrentPtr>(currentPtrFile.uri);
    debug(`[MODELUPDATER] Actuel: ${ptr.name} v${ptr.version}`);
    return ptr;
  } catch (error) {
    debug(`[PTR] Erreur lecture pointeur: ${String(error)}`);
    return null;
  }
}

export async function setCurrentPtr(ptr: CurrentPtr) {
  debug(`[PTR] Mise à jour du pointeur -> ${ptr.name} v${ptr.version}`);
  await ensureDir(MODELS_ROOT.uri);
  const currentPtrFile = new File(MODELS_ROOT, "current.json");
  await writeJSON(currentPtrFile.uri, ptr);
}

async function smokeTestModel(dirUri: string) {
  debug(`[MODELUPDATER] Test du modèle: ${dirUri}model/model.tflite`);
  const m = await loadTensorflowModel({ url: dirUri + "model/model.tflite" });
  const inputShape = m?.inputs?.[0]?.shape;
  const batchSize = inputShape?.[0] ?? 1;
  const maxLen = inputShape?.[1] ?? 128;
  const totalElements = batchSize * maxLen;
  debug(`[MODELUPDATER] Input shape: ${inputShape}, batchSize=${batchSize}, maxLen=${maxLen}, totalElements=${totalElements}`);
  
  const inputArr = new Int32Array(totalElements);
  inputArr.fill(0);
  
  await m.run([inputArr]);
  debug("[MODELUPDATER] Test réussi");
}

export async function checkAndUpdateModel(
  appVersion: string,
  manifestUrl?: string
) {
  return withLock(new File(MODELS_ROOT, ".update.lock").uri, async () => {
    debug("[MODELUPDATER] Démarrage de l'updater");

    if (!(await isInternetReachable())) {
      debug("[MODELUPDATER] Pas de connexion internet. Annulation.");
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
    debug("[MODELUPDATER] Manifest valide");

    if (
      latest.compatible_versions?.length &&
      !satisfiesAll(appVersion, latest.compatible_versions)
    ) {
      debug(
        `[MODELUPDATER] Version app ${appVersion} incompatible avec ${latest.compatible_versions.join(", ")}`
      );
      return {
        updated: false,
        using: await getCurrentPtr(),
        reason: "incompatible",
      };
    }
    debug("[MODELUPDATER] Compatible");

    debug("[MODELUPDATER] Vérification si déjà à jour…");
    const current = await getCurrentPtr();
    if (
      current &&
      current.version === latest.version &&
      current.name === latest.name
    ) {
      debug("[MODELUPDATER] Déjà à jour");
      return { updated: false, using: current, reason: "same-version" };
    }
    debug("[MODELUPDATER] Nouvelle version détectée");

    const magicFile = new File(MODELS_ROOT, `tmp_${Date.now()}.magic`);
    debug(
      `[MODELUPDATER] Téléchargement du nouveau modèle: ${latest.download_url}`
    );
    const downloadedFile = await File.downloadFileAsync(latest.download_url, MODELS_ROOT);
    await downloadedFile.move(magicFile);
    debug(`[MODELUPDATER] Téléchargement terminé -> ${magicFile.uri}`);

    if (latest.size_bytes) {
      await verifySize(magicFile.uri, latest.size_bytes);
      debug("[MODELUPDATER] Taille correcte");
    }

    if (latest.sha256) {
      const hex = await fileSha256Hex(magicFile.uri);
      if (hex !== latest.sha256.toLowerCase()) {
        throw new Error(`sha256-mismatch expected=${latest.sha256} got=${hex}`);
      }
      debug("[MODELUPDATER] Intégrité OK");
    }

    const staging = new Directory(MODELS_ROOT, `_staging_${latest.name}_${latest.version}`);
    await extractMagicToStaging(magicFile.uri, staging.uri);
    debug("[MODELUPDATER] Extraction terminée");

    const infos = (await validateExtractedTree(staging.uri)) as {
      name: string;
      version: string;
    };
    if (infos.name !== latest.name || infos.version !== latest.version) {
      throw new Error("infos-mismatch");
    }
    debug("[MODELUPDATER] Structure valide");

    debug("[MODELUPDATER] Lancement du test");
    await smokeTestModel(staging.uri);

    const modelDir = new Directory(MODELS_ROOT, latest.name);
    const finalDir = new Directory(modelDir, latest.version);
    debug(`[MODELUPDATER] Promotion vers dossier final: ${finalDir.uri}`);
    await ensureDir(modelDir.uri);
    if (finalDir.exists) {
      debug("[MODELUPDATER] Suppression ancienne version…");
      finalDir.delete();
    }
    staging.move(finalDir);
    debug("[MODELUPDATER] Promotion effectuée ✅");

    const nextPtr: CurrentPtr = {
      name: latest.name,
      version: latest.version,
      dir: finalDir.uri,
    };
    await setCurrentPtr(nextPtr);

    try {
      debug(`[MODELUPDATER] Suppression fichier temporaire: ${magicFile.uri}`);
      magicFile.delete();
    } catch (e) {
      debug(`[MODELUPDATER]  Erreur suppression temp: ${String(e)}`);
    }

    debug("[MODELUPDATER] Mise a jour terminé");
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
