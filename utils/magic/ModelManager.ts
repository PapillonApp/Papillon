import * as FileSystem from "expo-file-system";
import { loadTensorflowModel, TensorflowModel } from "react-native-fast-tflite";

import packageJson from "@/package.json";

import { MAGIC_URL } from "../endpoints";
import { checkAndUpdateModel, getCurrentPtr } from "./updater";
import { log } from "../logger/logger";

export type ModelPrediction = {
  scores: number[];
  predicted: string;
  labelScores: Record<string, number>;
};

function removeAccents(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function applyKerasFilters(text: string, filters?: string): string {
  const defaultFilters = '!"#$%&()*+,-./:;<=>?@[\\]^_`{|}~\t\n';
  const filtersToUse = filters ?? defaultFilters;

  let result = text;
  for (const char of filtersToUse) {
    result = result.replace(new RegExp("\\" + char, "g"), " ");
  }

  return result;
}

function compactSpaces(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

function normalizeText(text: string, config: any): string {
  let normalized = text;
  normalized = removeAccents(normalized);

  if (config.lower === true) {
    normalized = normalized.toLowerCase();
  }

  normalized = applyKerasFilters(normalized, config.filters);

  normalized = compactSpaces(normalized);

  return normalized;
}

let globalInitializationPromise: Promise<void> | null = null;

class ModelManager {
  private static instance: ModelManager;
  private model: TensorflowModel | null = null;
  private maxLen = 128;
  private batchSize = 1;
  private labels: string[] = [];
  private labelToId: Record<string, number> = {};
  private wordIndex: Record<string, number> = {};
  private tokenizerConfig: any = {};
  private oovIndex = 1;
  private isInitializing = false;
  private hasInitialized = false;

  static getInstance(): ModelManager {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager();
    }
    return ModelManager.instance;
  }

  async performPreventiveCleanup(): Promise<void> {
    try {
      const ptr = await getCurrentPtr();
      if (ptr) {
        const modelUri = ptr.dir + "model/model.tflite";
        const tokenizerUri = ptr.dir + "model/tokenizer.json";
        const labelsUri = ptr.dir + "model/labels.json";

        const modelExists = await FileSystem.getInfoAsync(modelUri);
        const tokenizerExists = await FileSystem.getInfoAsync(tokenizerUri);
        const labelsExists = await FileSystem.getInfoAsync(labelsUri);

        if (
          !modelExists.exists ||
          !tokenizerExists.exists ||
          !labelsExists.exists
        ) {
          const resetResult = await this.reset();
          if (!resetResult.success) {
            log(`Cleanup failed: ${resetResult.error}`);
            throw new Error(`Cleanup failed: ${resetResult.error}`);
          }
        }
      }
    } catch (error) {
      log(`Preventive cleanup error: ${String(error)}`);
      throw new Error(`Preventive cleanup error: ${String(error)}`);
    }
  }

  async safeInit(): Promise<void> {
    if (globalInitializationPromise) {
      return globalInitializationPromise;
    }

    if (this.hasInitialized || this.isInitializing) {
      return;
    }

    globalInitializationPromise = this._performSafeInit();

    try {
      await globalInitializationPromise;
    } finally {
      globalInitializationPromise = null;
    }
  }

  private async _performSafeInit(): Promise<void> {
    this.isInitializing = true;

    try {
      await this.performPreventiveCleanup();

      const result = await this.init();
      if (!result.success) {
        const resetResult = await this.reset();
        if (!resetResult.success) {
          log(`Safe init reset failed: ${resetResult.error}`);
          throw new Error(`Safe init reset failed: ${resetResult.error}`);
        }
      }
      this.hasInitialized = true;
      log("SafeInit completed successfully. Model is up-to-date.");
    } catch (error) {
      log(`Safe init error: ${String(error)}`);
      throw new Error(`Safe init error: ${String(error)}`);
    } finally {
      this.isInitializing = false;
    }
  }

  resetInitializationState(): void {
    this.isInitializing = false;
    this.hasInitialized = false;
    globalInitializationPromise = null;
  }

  async init(): Promise<{ source: string; success: boolean; error?: string }> {
    try {
      const loadedFromActive = await this.tryLoadFromActivePtr();
      if (loadedFromActive) {
        log("Model initialized successfully");
        return { source: loadedFromActive, success: true };
      }

      try {
        await checkAndUpdateModel(packageJson.version, MAGIC_URL);
      } catch {
        log("Model update failed");
      }

      const loadedAfterUpdate = await this.tryLoadFromActivePtr();
      if (loadedAfterUpdate) {
        log("Model initialized successfully after update");
        return { source: loadedAfterUpdate, success: true };
      }

      const ptr = await getCurrentPtr();
      const errorMsg = `No dynamic model available. Reason: ${ptr ? "ptr exists" : "no ptr"}`;
      log(`Initialization error: ${errorMsg}`);
      return { source: "none", success: false, error: errorMsg };
    } catch (error) {
      log(`Initialization error: ${String(error)}`);
      return {
        source: "none",
        success: false,
        error: `Init error: ${String(error)}`,
      };
    }
  }

  async refresh(): Promise<{
    success: boolean;
    updated: boolean;
    error?: string;
  }> {
    try {
      const before = await getCurrentPtr();

      try {
        await checkAndUpdateModel(packageJson.version, MAGIC_URL);
      } catch {
        log("Model refresh failed during update");
        return { success: false, updated: false, error: "Update failed" };
      }

      const after = await getCurrentPtr();

      if (
        after &&
        (!before ||
          before.version !== after.version ||
          before.name !== after.name)
      ) {
        try {
          await this.loadFromDirectory(after.dir);
          log("Model refreshed successfully with new version");
          return { success: true, updated: true };
        } catch {
          log("Failed to load new model during refresh");
          return {
            success: false,
            updated: false,
            error: "Failed to load new model",
          };
        }
      }

      if (!this.model && after) {
        try {
          await this.loadFromDirectory(after.dir);
          log("Model refreshed successfully with existing version");
          return { success: true, updated: true };
        } catch {
          log("Failed to load existing model during refresh");
          return {
            success: false,
            updated: false,
            error: "Failed to load existing model",
          };
        }
      }

      log("Model refresh completed with no changes");
      return { success: true, updated: false };
    } catch (error) {
      log(`Refresh error: ${String(error)}`);
      return {
        success: false,
        updated: false,
        error: `Refresh error: ${String(error)}`,
      };
    }
  }

  async reset(): Promise<{ success: boolean; error?: string }> {
    try {
      this.model = null;
      this.labels = [];
      this.labelToId = {};
      this.wordIndex = {};
      this.tokenizerConfig = {};
      this.oovIndex = 1;
      this.maxLen = 128;
      this.batchSize = 1;

      this.isInitializing = false;
      this.hasInitialized = false;
      globalInitializationPromise = null;

      const MODELS_ROOT = FileSystem.documentDirectory + "papillon-models/";
      const CURRENT_PTR = MODELS_ROOT + "current.json";

      const ptrInfo = await FileSystem.getInfoAsync(CURRENT_PTR);
      if (ptrInfo.exists) {
        await FileSystem.deleteAsync(CURRENT_PTR, { idempotent: true });
      }

      const modelsInfo = await FileSystem.getInfoAsync(MODELS_ROOT);
      if (modelsInfo.exists) {
        await FileSystem.deleteAsync(MODELS_ROOT, { idempotent: true });
      }

      log("Model reset successfully");
      return { success: true };
    } catch (error) {
      log(`Reset error: ${String(error)}`);
      return { success: false, error: `Reset error: ${String(error)}` };
    }
  }

  getStatus(): {
    hasModel: boolean;
    maxLen: number;
    batchSize: number;
    labelsCount: number;
    labelToIdCount: number;
    wordIndexSize: number;
    oovIndex: number;
    tokenizerConfigLoaded: boolean;
    isInitializing: boolean;
    hasInitialized: boolean;
    labels: string[];
    modelType: string;
    tokenizerInfo: {
      hasFilters: boolean;
      hasLowerCase: boolean;
      oovToken: string | null;
      configKeys: string[];
    };
    memoryInfo: {
      globalPromiseActive: boolean;
      instanceExists: boolean;
    };
  } {
    return {
      hasModel: this.model !== null,
      maxLen: this.maxLen,
      batchSize: this.batchSize,
      labelsCount: this.labels.length,
      labelToIdCount: Object.keys(this.labelToId).length,
      wordIndexSize: Object.keys(this.wordIndex).length,
      oovIndex: this.oovIndex,
      tokenizerConfigLoaded: Object.keys(this.tokenizerConfig).length > 0,
      isInitializing: this.isInitializing,
      hasInitialized: this.hasInitialized,
      labels: [...this.labels],
      modelType: this.model ? "TensorFlow Lite" : "None",
      tokenizerInfo: {
        hasFilters: this.tokenizerConfig.filters !== undefined,
        hasLowerCase: this.tokenizerConfig.lower === true,
        oovToken: this.tokenizerConfig.oov_token || null,
        configKeys: Object.keys(this.tokenizerConfig),
      },
      memoryInfo: {
        globalPromiseActive: globalInitializationPromise !== null,
        instanceExists: ModelManager.instance !== undefined,
      },
    };
  }

  private async tryLoadFromActivePtr(): Promise<string | null> {
    const ptr = await getCurrentPtr();
    if (!ptr) {
      return null;
    }
    try {
      await this.loadFromDirectory(ptr.dir);
      return `dynamic:${ptr.version}`;
    } catch (e) {
      try {
        const MODELS_ROOT = FileSystem.documentDirectory + "papillon-models/";
        const CURRENT_PTR = MODELS_ROOT + "current.json";

        await FileSystem.deleteAsync(CURRENT_PTR, { idempotent: true });

        await FileSystem.deleteAsync(ptr.dir, { idempotent: true });
      } catch (cleanupError) {}

      return null;
    }
  }

  async loadFromDirectory(dirUri: string): Promise<void> {
    try {
      const modelUri = dirUri + "model/model.tflite";
      const tokenizerUri = dirUri + "model/tokenizer.json";
      const labelsUri = dirUri + "model/labels.json";

      this.model = await loadTensorflowModel({ url: modelUri });

      const tokenizerRaw = await FileSystem.readAsStringAsync(tokenizerUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      const tokenizerJson = JSON.parse(tokenizerRaw);
      const config = tokenizerJson.config;
      this.tokenizerConfig = config;

      const wordIndexUri = dirUri + "model/word_index.json";
      const wordIndexInfo = await FileSystem.getInfoAsync(wordIndexUri);

      let wordIndex: Record<string, number> = {};

      if (wordIndexInfo.exists) {
        const wordIndexRaw = await FileSystem.readAsStringAsync(wordIndexUri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        wordIndex = JSON.parse(wordIndexRaw);
      } else if (tokenizerJson.word_index) {
        wordIndex = tokenizerJson.word_index;
      } else if (tokenizerJson.index_word) {
        const indexWord = tokenizerJson.index_word;
        wordIndex = {};
        for (const [index, word] of Object.entries(indexWord)) {
          if (typeof word === "string") {
            wordIndex[word] = parseInt(index, 10);
          }
        }
      } else {
        throw new Error(
          "Aucun word_index disponible : ni word_index.json, ni word_index dans tokenizer.json, ni index_word"
        );
      }

      this.wordIndex = wordIndex;

      const oovToken = config.oov_token;
      if (oovToken && wordIndex[oovToken] !== undefined) {
        this.oovIndex = wordIndex[oovToken];
      } else {
        this.oovIndex = 1;
      }

      const labelsRaw = await FileSystem.readAsStringAsync(labelsUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      this.labels = JSON.parse(labelsRaw);

      const labelToIdUri = dirUri + "model/label_to_id.json";
      const labelToIdInfo = await FileSystem.getInfoAsync(labelToIdUri);
      if (labelToIdInfo.exists) {
        const labelToIdRaw = await FileSystem.readAsStringAsync(labelToIdUri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        this.labelToId = JSON.parse(labelToIdRaw);
      } else {
        this.labelToId = {};
        for (let i = 0; i < this.labels.length; i++) {
          this.labelToId[this.labels[i]] = i;
        }
      }
    } catch (error) {
      throw new Error(`Load error: ${String(error)}`);
    }
  }

  tokenize(text: string, verbose: boolean = false): number[] {
    const normalizedText = normalizeText(text, this.tokenizerConfig);

    if (!normalizedText.trim()) {
      return new Array(this.maxLen).fill(0);
    }
    const words = normalizedText.split(" ").filter(w => w.length > 0);
    const sequence: number[] = [];
    const unknownWords: string[] = [];

    for (const word of words) {
      const idx = this.wordIndex[word];
      if (idx !== undefined) {
        sequence.push(idx);
      } else {
        sequence.push(this.oovIndex);
        unknownWords.push(word);
      }
    }

    if (sequence.length > this.maxLen) {
      sequence.splice(this.maxLen);
    }

    while (sequence.length < this.maxLen) {
      sequence.push(0);
    }

    if (unknownWords.length > 0) {
      log(
        `[TOKENIZE] Mots inconnus (${unknownWords.length}): [${unknownWords.join(", ")}]`
      );
    }

    log(
      `[TOKENIZE] Séquence finale: longueur=${sequence.length}, 10 premiers tokens=[${sequence.slice(0, 10).join(", ")}]`
    );

    return sequence;
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

      const seq = this.tokenize(text, verbose);
      const inputArr = new Int32Array(this.batchSize * this.maxLen);

      for (let i = 0; i < seq.length && i < this.maxLen; i++) {
        inputArr[i] = seq[i];
      }

      try {
        const [out] = await this.model.run([inputArr]);

        const scores = Array.from(out as Float32Array);

        const best = scores.indexOf(Math.max(...scores));

        let predictedLabel: string | undefined;

        if (Object.keys(this.labelToId).length > 0) {
          predictedLabel = Object.keys(this.labelToId).find(
            label => this.labelToId[label] === best
          );
        } else {
          predictedLabel = this.labels?.[best];
        }

        const predicted =
          predictedLabel === null ? "null" : (predictedLabel ?? `#${best}`);

        const labelScores: Record<string, number> = {};

        if (Object.keys(this.labelToId).length > 0) {
          for (const [label, id] of Object.entries(this.labelToId)) {
            if (id < scores.length) {
              labelScores[label] = scores[id];
            }
          }
        } else {
          for (let i = 0; i < this.labels.length && i < scores.length; i++) {
            const label = this.labels[i];
            if (label !== null) {
              labelScores[label] = scores[i];
            } else {
              labelScores["null"] = scores[i];
            }
          }
        }

        return { scores, predicted, labelScores };
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        log(`[PREDICT MODEL RUN ERROR] Erreur TFLite: ${errorMessage}`);
        return {
          error: `Erreur d'exécution du modèle TFLite: ${errorMessage}`,
          success: false,
        };
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      log(`[PREDICT ERROR] Erreur générale: ${errorMessage}`);
      return {
        error: `Erreur générale lors de la prédiction: ${errorMessage}`,
        success: false,
      };
    }
  }
}

export default ModelManager.getInstance();
