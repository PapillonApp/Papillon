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

let globalInitializationPromise: Promise<void> | null = null;

class ModelManager {
  private static instance: ModelManager;
  private model: TensorflowModel | null = null;
  private maxLen = 128;
  private batchSize = 1;
  private labels: string[] = [];
  private labelToId: Record<string, number> = {};
  private wordIndex: Record<string, number> = {};
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
          log(
            "[CLEANUP] 🧹 Fichiers du modèle manquants détectés, nettoyage préventif..."
          );
          const resetResult = await this.reset();
          if (resetResult.success) {
            log("[CLEANUP] ✅ Nettoyage préventif terminé");
          } else {
            log(
              `[CLEANUP] ❌ Échec du nettoyage préventif: ${resetResult.error}`
            );
          }
        }
      }
    } catch (error) {
      log(`[CLEANUP] ⚠️ Erreur lors du nettoyage préventif: ${String(error)}`);
    }
  }

  async safeInit(): Promise<void> {
    if (globalInitializationPromise) {
      log("[SAFE_INIT] ⏳ Initialisation globale déjà en cours, attendre...");
      return globalInitializationPromise;
    }

    if (this.hasInitialized) {
      log("[SAFE_INIT] ⏭️ Initialisation déjà effectuée, ignorer");
      return;
    }

    if (this.isInitializing) {
      log(
        "[SAFE_INIT] ⏳ Initialisation déjà en cours sur cette instance, ignorer"
      );
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
    log("[SAFE_INIT] 🚀 Démarrage de l'initialisation sûre (première fois)");

    try {
      await this.performPreventiveCleanup();

      const result = await this.init();
      if (result.success) {
        log(
          `[SAFE_INIT] Modèle initialisé avec succès. Source: ${result.source}`
        );
        this.hasInitialized = true;
      } else {
        log(`[SAFE_INIT] Échec d'initialisation: ${result.error}`);
        log(
          "[SAFE_INIT] Reset automatique pour préparer le prochain démarrage..."
        );

        try {
          const resetResult = await this.reset();
          if (resetResult.success) {
            log(
              "[SAFE_INIT] Reset automatique terminé. Le modèle sera téléchargé au prochain démarrage."
            );
          } else {
            log(`[SAFE_INIT] Échec du reset automatique: ${resetResult.error}`);
          }
        } catch (resetError) {
          log(
            `[SAFE_INIT] Erreur critique lors du reset: ${String(resetError)}`
          );
        }
        this.hasInitialized = true;
      }
    } catch (error) {
      log(
        `[SAFE_INIT] Erreur critique lors de l'initialisation: ${String(error)}`
      );
      log("[SAFE_INIT] Tentative de reset d'urgence...");

      try {
        await this.reset();
        log("[SAFE_INIT] Reset d'urgence terminé.");
      } catch (resetError) {
        log(`[SAFE_INIT] Échec du reset d'urgence: ${String(resetError)}`);
      }
      this.hasInitialized = true;
    } finally {
      this.isInitializing = false;
      log("[SAFE_INIT] Fin du processus d'initialisation sûre");
    }
  }

  resetInitializationState(): void {
    this.isInitializing = false;
    this.hasInitialized = false;
    globalInitializationPromise = null;
    log("[RESET_STATE] État d'initialisation global réinitialisé");
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
      // Nettoyer le modèle en mémoire
      this.model = null;
      this.labels = [];
      this.labelToId = {};
      this.wordIndex = {};
      this.oovIndex = 1;
      this.maxLen = 128;
      this.batchSize = 1;

      // Réinitialiser l'état d'initialisation
      this.isInitializing = false;
      this.hasInitialized = false;
      globalInitializationPromise = null;

      log("[RESET] Modèle en mémoire et état d'initialisation nettoyés");

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
    batchSize: number;
    labelsCount: number;
    labelToIdCount: number;
    wordIndexSize: number;
    oovIndex: number;
  } {
    return {
      hasModel: this.model !== null,
      maxLen: this.maxLen,
      batchSize: this.batchSize,
      labelsCount: this.labels.length,
      labelToIdCount: Object.keys(this.labelToId).length,
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
      log("[INIT] Nettoyage automatique du modèle corrompu...");

      try {
        const MODELS_ROOT = FileSystem.documentDirectory + "papillon-models/";
        const CURRENT_PTR = MODELS_ROOT + "current.json";

        await FileSystem.deleteAsync(CURRENT_PTR, { idempotent: true });
        log("[INIT] Pointeur corrompu supprimé");

        await FileSystem.deleteAsync(ptr.dir, { idempotent: true });
        log(`[INIT] Dossier du modèle corrompu supprimé: ${ptr.dir}`);
      } catch (cleanupError) {
        log(`[INIT] Erreur lors du nettoyage: ${String(cleanupError)}`);
      }

      return null;
    }
  }

  async loadFromDirectory(dirUri: string): Promise<void> {
    try {
      log(`[LOAD] Chargement depuis le dossier: ${dirUri}`);
      const modelUri = dirUri + "model/model.tflite";
      const tokenizerUri = dirUri + "model/tokenizer.json";
      const labelsUri = dirUri + "model/labels.json";

      log(`[LOAD] Chargement du modèle TFLite: ${modelUri}`);
      this.model = await loadTensorflowModel({ url: modelUri });

      const shape = this.model?.inputs?.[0]?.shape;
      log(`[LOAD] Shape du modèle détectée: [${shape?.join(", ")}]`);
      
      if (shape) {
        if (shape[0]) {
          this.batchSize = shape[0];
          log(`[LOAD] Batch size défini: ${this.batchSize}`);
        }
        if (shape[1]) {
          this.maxLen = shape[1];
          log(`[LOAD] Max length défini: ${this.maxLen}`);
        }
      }
      
      log(`[LOAD] Configuration finale: batchSize=${this.batchSize}, maxLen=${this.maxLen}`);

      log(`[LOAD] Chargement du tokenizer: ${tokenizerUri}`);
      const tokenizerRaw = await FileSystem.readAsStringAsync(tokenizerUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      const tokenizerJson = JSON.parse(tokenizerRaw);
      const config = tokenizerJson.config;
      const wordCounts = JSON.parse(config.word_counts);
      
      // Vérifier si on a un word_index existant dans le tokenizer
      let wordIndex: Record<string, number> = {};
      if (tokenizerJson.word_index) {
        log(`[LOAD] Utilisation du word_index existant du tokenizer`);
        wordIndex = tokenizerJson.word_index;
      } else {
        log(`[LOAD] Reconstruction du word_index depuis word_counts`);
        let index = 1;
        for (const w of Object.keys(wordCounts)) {
          wordIndex[w] = index++;
        }
      }
      
      this.wordIndex = wordIndex;
      this.oovIndex = wordIndex[config.oov_token] ?? 1;
      log(`[LOAD] Tokenizer chargé: ${Object.keys(wordIndex).length} mots, oovIndex=${this.oovIndex}`);
      log(`[LOAD] Premier mots du tokenizer: ${Object.keys(wordIndex).slice(0, 10).join(", ")}`);
      log(`[LOAD] Premiers indices: ${Object.keys(wordIndex).slice(0, 10).map(w => `${w}:${wordIndex[w]}`).join(", ")}`);
      
      // Log des tokens spéciaux
      const specialTokens = Object.keys(wordIndex).filter(w => w.startsWith('[') || w.startsWith('<'));
      if (specialTokens.length > 0) {
        log(`[LOAD] Tokens spéciaux détectés: ${specialTokens.map(w => `${w}:${wordIndex[w]}`).join(", ")}`);
      }

      log(`[LOAD] Chargement des labels: ${labelsUri}`);
      const labelsRaw = await FileSystem.readAsStringAsync(labelsUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      this.labels = JSON.parse(labelsRaw);
      log(`[LOAD] Labels chargées: ${this.labels.length} classes - [${this.labels.slice(0, 5).join(", ")}${this.labels.length > 5 ? "..." : ""}]`);

      // Charger le mapping label_to_id si disponible
      const labelToIdUri = dirUri + "model/label_to_id.json";
      const labelToIdInfo = await FileSystem.getInfoAsync(labelToIdUri);
      if (labelToIdInfo.exists) {
        log(`[LOAD] Chargement du mapping label_to_id: ${labelToIdUri}`);
        const labelToIdRaw = await FileSystem.readAsStringAsync(labelToIdUri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        this.labelToId = JSON.parse(labelToIdRaw);
        log(`[LOAD] Label to ID mapping chargé: ${Object.keys(this.labelToId).length} mappings`);
        
        // Vérifier la cohérence avec les labels
        const missingLabels = this.labels.filter(label => !(label in this.labelToId));
        const extraMappings = Object.keys(this.labelToId).filter(label => !this.labels.includes(label));
        
        if (missingLabels.length > 0) {
          log(`[LOAD WARNING] Labels manquants dans label_to_id: [${missingLabels.join(", ")}]`);
        }
        if (extraMappings.length > 0) {
          log(`[LOAD WARNING] Mappings supplémentaires dans label_to_id: [${extraMappings.join(", ")}]`);
        }
        
        // Afficher quelques exemples de mapping pour vérification
        const sampleMappings = Object.entries(this.labelToId).slice(0, 5);
        log(`[LOAD] Exemples de mappings: ${sampleMappings.map(([label, id]) => `"${label}":${id}`).join(", ")}`);
        
        // Vérifier si les IDs correspondent aux indices des labels
        let indexMismatches = 0;
        for (let i = 0; i < this.labels.length; i++) {
          const label = this.labels[i];
          const expectedId = this.labelToId[label];
          if (expectedId !== undefined && expectedId !== i) {
            indexMismatches++;
            if (indexMismatches <= 3) { // Log seulement les 3 premiers
              log(`[LOAD MISMATCH] Label "${label}" à l'index ${i} mais mapping ID ${expectedId}`);
            }
          }
        }
        
        if (indexMismatches > 0) {
          log(`[LOAD WARNING] ${indexMismatches} décalages détectés entre indices labels et IDs mappés`);
        } else {
          log(`[LOAD OK] Indices des labels correspondent aux IDs mappés`);
        }
        
        log(`[LOAD] Cohérence label/mapping: ${this.labels.length - missingLabels.length}/${this.labels.length} OK`);
      } else {
        log(`[LOAD] Aucun fichier label_to_id.json trouvé, utilisation de l'ordre des labels`);
        // Créer un mapping basé sur l'index des labels
        this.labelToId = {};
        for (let i = 0; i < this.labels.length; i++) {
          this.labelToId[this.labels[i]] = i;
        }
      }

      log("[LOAD] Modèle dynamique chargé avec succes");
    } catch (error) {
      log(`[LOAD ERROR] ${String(error)}`);
      throw error;
    }
  }

  tokenize(text: string, verbose: boolean = false): number[] {
    const words = text.split(/\s+/);
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

      log(`[PREDICT START] Text: "${text}", verbose: ${verbose}`);
      log(`[PREDICT MODEL INFO] batchSize: ${this.batchSize}, maxLen: ${this.maxLen}, labels: ${this.labels.length}, labelToId: ${Object.keys(this.labelToId).length}`);

      if (verbose) {
        log(`Running prediction for: ${text}`);
        log(`Tokenizing text: ${text}`);
      }

      const seq = this.tokenize(text, verbose);
      log(`[PREDICT TOKENIZED] Sequence length: ${seq.length}, first 10 tokens: [${seq.slice(0, 10).join(", ")}]`);
      
      if (verbose) {
        log(`[TOKENIZED] ${seq.join(", ")}`);
      }

      const totalInputSize = this.batchSize * this.maxLen;
      log(`[PREDICT INPUT] Creating input array of size ${totalInputSize} (${this.batchSize} x ${this.maxLen})`);
      
      // Le modèle attend des int32, pas des float32
      const inputArr = new Int32Array(totalInputSize);
      
      // Remplir seulement les premiers éléments avec la séquence tokenisée
      for (let i = 0; i < seq.length && i < this.maxLen; i++) {
        inputArr[i] = seq[i];
      }
      
      log(`[PREDICT INPUT FILLED] First 10 values: [${Array.from(inputArr.slice(0, 10)).join(", ")}]`);
      log(`[PREDICT INPUT FILLED] Last 10 values: [${Array.from(inputArr.slice(-10)).join(", ")}]`);
      log(`[PREDICT INPUT SIZE] Input array length: ${inputArr.length}, expected: ${totalInputSize}, type: ${inputArr.constructor.name}`);

      // Vérifier les dimensions du modèle avant l'exécution
      const modelInputShape = this.model?.inputs?.[0]?.shape;
      log(`[PREDICT MODEL SHAPE] Expected input shape: [${modelInputShape?.join(", ")}]`);

      try {
        log(`[PREDICT RUN] About to run model with input size ${inputArr.length}, type: ${inputArr.constructor.name}`);
        const [out] = await this.model.run([inputArr]);
        log(`[PREDICT RUN SUCCESS] Model executed successfully`);
        
        const scores = Array.from(out as Float32Array);
        log(`[PREDICT OUTPUT] Output scores length: ${scores.length}`);
        log(`[PREDICT OUTPUT] First 5 scores: [${scores.slice(0, 5).join(", ")}]`);
        
        const best = scores.indexOf(Math.max(...scores));
        log(`[PREDICT RESULT] Best index: ${best}, max score: ${scores[best]}`);

        // Trouver le label correspondant à l'index de sortie
        let predictedLabel: string | undefined;
        
        // Si on a labelToId, chercher le label qui correspond à l'index de sortie
        if (Object.keys(this.labelToId).length > 0) {
          predictedLabel = Object.keys(this.labelToId).find(label => this.labelToId[label] === best);
          log(`[PREDICT MAPPING] Recherche du label pour l'index ${best} dans labelToId`);
          if (predictedLabel) {
            log(`[PREDICT MAPPING] Label trouvé: "${predictedLabel}" pour l'index ${best}`);
          } else {
            log(`[PREDICT MAPPING WARNING] Aucun label trouvé pour l'index ${best} dans labelToId`);
            // Fallback sur l'ancien système
            predictedLabel = this.labels?.[best];
            log(`[PREDICT MAPPING FALLBACK] Utilisation de l'index direct: "${predictedLabel}"`);
          }
        } else {
          // Pas de labelToId, utiliser l'index direct
          predictedLabel = this.labels?.[best];
          log(`[PREDICT MAPPING] Pas de labelToId, utilisation directe de l'index ${best}: "${predictedLabel}"`);
        }

        const predicted = predictedLabel === null ? "null" : (predictedLabel ?? `#${best}`);
        log(`[PREDICT FINAL] Predicted: "${predicted}", label: "${predictedLabel}", index: ${best}`);

        // Construire labelScores en utilisant le bon mapping
        const labelScores: Record<string, number> = {};
        
        if (Object.keys(this.labelToId).length > 0) {
          // Utiliser labelToId pour mapper correctement
          for (const [label, id] of Object.entries(this.labelToId)) {
            if (id < scores.length) {
              labelScores[label] = scores[id];
            }
          }
          log(`[PREDICT SCORES] Utilisé labelToId pour mapper ${Object.keys(labelScores).length} scores`);
        } else {
          // Fallback sur l'index direct
          for (let i = 0; i < this.labels.length && i < scores.length; i++) {
            const label = this.labels[i];
            if (label !== null) {
              labelScores[label] = scores[i];
            } else {
              labelScores["null"] = scores[i];
            }
          }
          log(`[PREDICT SCORES] Utilisé indices directs pour mapper ${Object.keys(labelScores).length} scores`);
        }

        log(`[PREDICT SUCCESS] Prediction completed successfully`);
        return { scores, predicted, labelScores };
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        log(`[PREDICT MODEL RUN ERROR] ${errorMessage}`);
        log(`[PREDICT DEBUG] Input array details: length=${inputArr.length}, type=${inputArr.constructor.name}, first 5=[${Array.from(inputArr.slice(0, 5)).join(", ")}]`);
        log(`[PREDICT DEBUG] Model input shape: [${modelInputShape?.join(", ")}]`);
        log(`[PREDICT DEBUG] Expected size: ${modelInputShape ? modelInputShape.reduce((a, b) => a * b, 1) : "unknown"}`);
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
