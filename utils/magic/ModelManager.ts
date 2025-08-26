import * as FileSystem from "expo-file-system";
import { loadTensorflowModel, TensorflowModel } from "react-native-fast-tflite";

import packageJson from "@/package.json";

import { MAGIC_URL } from "../endpoints";
import { log } from "../logger/logger";
import { checkAndUpdateModel, getCurrentPtr } from "./updater";

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

  async safeInit(): Promise<void> {
    try {
      const result = await this.init();
      if (result.success) {
        log(
          `[SAFE_INIT] ✅ Modèle initialisé avec succès. Source: ${result.source}`
        );
      } else {
        log(
          `[SAFE_INIT] ⚠️ Impossible d'initialiser le modèle: ${result.error}`
        );
      }
    } catch (error) {
      log(
        `[SAFE_INIT] ❌ Erreur lors de l'initialisation sûre: ${String(error)}`
      );
    }
  }

  async init(): Promise<{ source: string; success: boolean; error?: string }> {
    try {
      log("[INIT] Démarrage initialisation du modèle");

      const loadedFromActive = await this.tryLoadFromActivePtr();
      if (loadedFromActive) {
        log("[INIT] Modèle dynamique chargé (existant) ✅");
        return { source: loadedFromActive, success: true };
      }

      try {
        log("[INIT] Aucun modèle actif. Lancement checkAndUpdateModel…");
        const res = await checkAndUpdateModel(packageJson.version, MAGIC_URL);
        log(
          `[INIT] Update terminé: updated=${res.updated} reason=${res.reason ?? "ok"}`
        );
      } catch (e) {
        log(`[INIT] Erreur pendant checkAndUpdateModel: ${String(e)}`);
        // continuer le processus
      }

      const loadedAfterUpdate = await this.tryLoadFromActivePtr();
      if (loadedAfterUpdate) {
        log("[INIT] Modèle dynamique chargé après mise à jour");
        return { source: loadedAfterUpdate, success: true };
      }

      const ptr = await getCurrentPtr();
      const errorMsg = `Aucun modèle dynamique disponible. reason=no-current-ptr | updater-résultat=${
        ptr ? "ptr-exists" : "no-ptr"
      }`;
      log(`[INIT] ${errorMsg}`);
      return { source: "none", success: false, error: errorMsg };
    } catch (error) {
      const errorMsg = `Erreur lors de l'initialisation du modèle: ${String(error)}`;
      log(`[INIT ERROR] ${errorMsg}`);
      return { source: "none", success: false, error: errorMsg };
    }
  }

  async refresh(): Promise<{
    success: boolean;
    updated: boolean;
    error?: string;
  }> {
    try {
      log("[REFRESH] Démarrage mise à jour manuelle…");
      const before = await getCurrentPtr();

      try {
        await checkAndUpdateModel(packageJson.version, MAGIC_URL);
      } catch (e) {
        log(`[REFRESH] Erreur pendant checkAndUpdateModel: ${String(e)}`);
        return {
          success: false,
          updated: false,
          error: `Erreur de mise à jour: ${String(e)}`,
        };
      }

      const after = await getCurrentPtr();

      if (
        after &&
        (!before ||
          before.version !== after.version ||
          before.name !== after.name)
      ) {
        try {
          log(
            `[REFRESH] Nouveau modèle détecté: ${after.name} v${after.version} → rechargement`
          );
          await this.loadFromDirectory(after.dir);
          return { success: true, updated: true };
        } catch (e) {
          log(
            `[REFRESH] Erreur lors du chargement du nouveau modèle: ${String(e)}`
          );
          return {
            success: false,
            updated: false,
            error: `Erreur de chargement: ${String(e)}`,
          };
        }
      }

      if (!this.model && after) {
        try {
          log(
            "[REFRESH] Pas de modèle en mémoire, chargement depuis le ptr actuel…"
          );
          await this.loadFromDirectory(after.dir);
          return { success: true, updated: true };
        } catch (e) {
          log(
            `[REFRESH] Erreur lors du chargement du modèle existant: ${String(e)}`
          );
          return {
            success: false,
            updated: false,
            error: `Erreur de chargement: ${String(e)}`,
          };
        }
      }

      log("[REFRESH] Aucun changement de modèle.");
      return { success: true, updated: false };
    } catch (error) {
      const errorMsg = `Erreur générale lors du refresh: ${String(error)}`;
      log(`[REFRESH ERROR] ${errorMsg}`);
      return { success: false, updated: false, error: errorMsg };
    }
  }

  async reset(): Promise<{ success: boolean; error?: string }> {
    log("[RESET] Démarrage du reset du modèle...");

    try {
      this.model = null;
      this.labels = [];
      this.wordIndex = {};
      this.oovIndex = 1;
      this.maxLen = 128;
      log("[RESET] Modèle en mémoire nettoyé");

      const MODELS_ROOT = FileSystem.documentDirectory + "papillon-models/";
      const CURRENT_PTR = MODELS_ROOT + "current.json";

      const ptrInfo = await FileSystem.getInfoAsync(CURRENT_PTR);
      if (ptrInfo.exists) {
        await FileSystem.deleteAsync(CURRENT_PTR, { idempotent: true });
        log("[RESET] Pointeur actuel supprimé");
      } else {
        log("[RESET] Aucun pointeur actuel à supprimer");
      }

      const modelsInfo = await FileSystem.getInfoAsync(MODELS_ROOT);
      if (modelsInfo.exists) {
        await FileSystem.deleteAsync(MODELS_ROOT, { idempotent: true });
        log("[RESET] Dossier des modèles supprimé");
      } else {
        log("[RESET] Aucun dossier de modèles à supprimer");
      }

      log("[RESET] Reset terminé avec succès ✅");
      return { success: true };
    } catch (error) {
      const errorMsg = `Erreur lors du reset: ${String(error)}`;
      log(`[RESET ERROR] ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  }

  getStatus(): {
    hasModel: boolean;
    maxLen: number;
    labelsCount: number;
    wordIndexSize: number;
    oovIndex: number;
  } {
    return {
      hasModel: this.model !== null,
      maxLen: this.maxLen,
      labelsCount: this.labels.length,
      wordIndexSize: Object.keys(this.wordIndex).length,
      oovIndex: this.oovIndex,
    };
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
      if (shape && shape[1]) {
        this.maxLen = shape[1];
      }

      const tokenizerRaw = await FileSystem.readAsStringAsync(tokenizerUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      const tokenizerJson = JSON.parse(tokenizerRaw);
      const config = tokenizerJson.config;
      const wordCounts = JSON.parse(config.word_counts);
      const wordIndex: Record<string, number> = {};
      let index = 1;
      for (const w of Object.keys(wordCounts)) {
        wordIndex[w] = index++;
      }
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
  ): Promise<ModelPrediction | { error: string; success: false }> {
    try {
      if (!this.model) {
        const errorMsg =
          "Model not loaded (dynamic-only): appelle d'abord ModelManager.init()";
        log(`[PREDICT ERROR] ${errorMsg}`);
        return { error: errorMsg, success: false };
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
        log(`[PREDICT MODEL RUN ERROR] ${errorMessage}`);
        return {
          error: `Erreur lors de l'exécution du modèle: ${errorMessage}`,
          success: false,
        };
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      log(`[PREDICT ERROR] ${errorMessage}`);
      return {
        error: `Erreur générale lors de la prédiction: ${errorMessage}`,
        success: false,
      };
    }
  }
}

export default ModelManager.getInstance();
