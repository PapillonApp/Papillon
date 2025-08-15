import * as FileSystem from "expo-file-system";
import { loadTensorflowModel, TensorflowModel } from "react-native-fast-tflite";
import { log } from "../logger/logger";

import { checkAndUpdateModel, getCurrentPtr, getActivePaths } from "./updater";
import { MAGIC_URL } from "../endpoints";
import packageJson from "@/package.json";

export type ModelPrediction = {
  scores: number[];
  predicted: string;
  labelScores: Record<string, number>;
};

class ModelManager {
  private static instance: ModelManager;
  private model: TensorflowModel | null = null;
  private maxLen = 128;
  private labels: string[] = [];
  private wordIndex: Record<string, number> = {};
  private oovIndex = 1;

  static getInstance(): ModelManager {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager();
    }
    return ModelManager.instance;
  }

  async init(): Promise<{ source: string }> {
    log("[INIT] Démarrage initialisation du modèle");

    const loadedFromActive = await this.tryLoadFromActivePtr();
    if (loadedFromActive) {
      log("[INIT] Modèle dynamique chargé (existant) ✅");
      return { source: loadedFromActive };
    }

    try {
      log("[INIT] Aucun modèle actif. Lancement checkAndUpdateModel…");
      const res = await checkAndUpdateModel(packageJson.version, MAGIC_URL);
      log(
        `[INIT] Update terminé: updated=${res.updated} reason=${res.reason ?? "ok"}`
      );
    } catch (e) {
      log(`[INIT] Erreur pendant checkAndUpdateModel: ${String(e)}`);
    }

    const loadedAfterUpdate = await this.tryLoadFromActivePtr();
    if (loadedAfterUpdate) {
      log("[INIT] Modèle dynamique chargé après mise à jour");
      return { source: loadedAfterUpdate };
    }

    const ptr = await getCurrentPtr();
    throw new Error(
      `[INIT] Aucun modèle dynamique disponible. reason=no-current-ptr | updater-résultat=${
        ptr ? "ptr-exists" : "no-ptr"
      }`
    );
  }

  async refresh(): Promise<boolean> {
    log("[REFRESH] Démarrage mise à jour manuelle…");
    const before = await getCurrentPtr();
    await checkAndUpdateModel(packageJson.version, MAGIC_URL);
    const after = await getCurrentPtr();

    if (
      after &&
      (!before ||
        before.version !== after.version ||
        before.name !== after.name)
    ) {
      log(
        `[REFRESH] Nouveau modèle détecté: ${after.name} v${after.version} → rechargement`
      );
      await this.loadFromDirectory(after.dir);
      return true;
    }

    if (!this.model && after) {
      log(
        "[REFRESH] Pas de modèle en mémoire, chargement depuis le ptr actuel…"
      );
      await this.loadFromDirectory(after.dir);
      return true;
    }

    log("[REFRESH] Aucun changement de modèle.");
    return false;
  }

  private async tryLoadFromActivePtr(): Promise<string | null> {
    const ptr = await getCurrentPtr();
    if (!ptr) {
      log("[INIT] Aucun currentPtr trouvé sur le disque.");
      return null;
    }
    try {
      log(`[INIT] Chargement du modèle actif: ${ptr.name} v${ptr.version}`);
      await this.loadFromDirectory(ptr.dir);
      return `dynamic:${ptr.version}`;
    } catch (e) {
      log(
        `[INIT] Échec de chargement depuis dir actif (${ptr.dir}): ${String(e)}`
      );
      return null;
    }
  }

  async loadFromDirectory(dirUri: string): Promise<void> {
    try {
      log(`[LOAD] Chargement depuis le dossier: ${dirUri}`);
      const modelUri = dirUri + "model/model.tflite";
      const tokenizerUri = dirUri + "model/tokenizer.json";
      const labelsUri = dirUri + "model/labels.json";

      this.model = await loadTensorflowModel({ url: modelUri });

      const shape = this.model?.inputs?.[0]?.shape;
      if (shape && shape[1]) this.maxLen = shape[1];

      const tokenizerRaw = await FileSystem.readAsStringAsync(tokenizerUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      const tokenizerJson = JSON.parse(tokenizerRaw);
      const config = tokenizerJson.config;
      const wordCounts = JSON.parse(config.word_counts);
      const wordIndex: Record<string, number> = {};
      let index = 1;
      for (const w of Object.keys(wordCounts)) wordIndex[w] = index++;
      this.wordIndex = wordIndex;
      this.oovIndex = wordIndex[config.oov_token] ?? 1;

      const labelsRaw = await FileSystem.readAsStringAsync(labelsUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      this.labels = JSON.parse(labelsRaw);

      log("[LOAD] Modèle dynamique chargé avec succes");
    } catch (error) {
      log(`[LOAD ERROR] ${String(error)}`);
      throw error;
    }
  }

  cleanText(t: string): string {
    const cleaned = t
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .toLowerCase();
    return cleaned;
  }

  tokenize(text: string, verbose: boolean = false): number[] {
    const words = this.cleanText(text).split(/\s+/);
    const sequence: number[] = [];
    const unknownWords: string[] = [];

    for (const w of words) {
      const idx = this.wordIndex[w];
      if (idx) {
        sequence.push(idx);
      } else {
        sequence.push(this.oovIndex);
        unknownWords.push(w);
      }
    }

    while (sequence.length < this.maxLen) {
      sequence.push(0);
    }

    if (verbose && unknownWords.length) {
      log(`[UNKNOWN WORDS] ${unknownWords.join(", ")}`);
    }
    return sequence.slice(0, this.maxLen);
  }

  async predict(
    text: string,
    verbose: boolean = false
  ): Promise<ModelPrediction> {
    if (!this.model) {
      throw new Error(
        "Model not loaded (dynamic-only): appelle d'abord ModelManager.init(appVersion, manifestUrl)"
      );
    }

    if (verbose) {
      log(`Running prediction for: ${text}`);
      log(`Tokenizing text: ${text}`);
    }

    const seq = this.tokenize(text, verbose);
    if (verbose) {
      log(`[CLEAN TEXT] ${this.cleanText(text)}`);
      log(`[TOKENIZED] ${seq.join(", ")}`);
    }

    const inputArr = new Float32Array(this.maxLen);
    for (let i = 0; i < seq.length && i < this.maxLen; i++) {
      inputArr[i] = seq[i];
    }

    try {
      const [out] = await this.model.run([inputArr]);
      const scores = Array.from(out as Float32Array);
      const best = scores.indexOf(Math.max(...scores));

      const predictedLabel = this.labels?.[best];
      const predicted =
        predictedLabel === null ? "null" : (predictedLabel ?? `#${best}`);

      const labelScores: Record<string, number> = {};
      for (let i = 0; i < this.labels.length && i < scores.length; i++) {
        const label = this.labels[i];
        if (label !== null) {
          labelScores[label] = scores[i];
        } else {
          labelScores["null"] = scores[i];
        }
      }

      return { scores, predicted, labelScores };
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      log(`[PREDICT ERROR] ${errorMessage}`);
      throw e;
    }
  }
}

export default ModelManager.getInstance();
