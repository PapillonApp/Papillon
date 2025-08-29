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
  private debugMode = false;

  static getInstance(): ModelManager {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager();
    }
    return ModelManager.instance;
  }

  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
    this.debugLog(`[DEBUG] Mode debug ${enabled ? "activé" : "désactivé"}`);
  }

  getDebugMode(): boolean {
    return this.debugMode;
  }

  private debugLog(message: string): void {
    if (this.debugMode) {
      log(message);
    }
  }

  private criticalLog(message: string): void {
    log(message);
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
          this.criticalLog(
            "[CLEANUP] 🧹 Fichiers du modèle manquants détectés, nettoyage préventif..."
          );
          const resetResult = await this.reset();
          if (resetResult.success) {
            this.criticalLog("[CLEANUP] ✅ Nettoyage préventif terminé");
          } else {
            this.criticalLog(
              `[CLEANUP] ❌ Échec du nettoyage préventif: ${resetResult.error}`
            );
          }
        }
      }
    } catch (error) {
      this.criticalLog(
        `[CLEANUP] ⚠️ Erreur lors du nettoyage préventif: ${String(error)}`
      );
    }
  }

  async safeInit(): Promise<void> {
    if (globalInitializationPromise) {
      this.debugLog(
        "[SAFE_INIT] ⏳ Initialisation globale déjà en cours, attendre..."
      );
      return globalInitializationPromise;
    }

    if (this.hasInitialized) {
      this.debugLog("[SAFE_INIT] ⏭️ Initialisation déjà effectuée, ignorer");
      return;
    }

    if (this.isInitializing) {
      this.debugLog(
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
    this.criticalLog(
      "[SAFE_INIT] 🚀 Démarrage de l'initialisation sûre (première fois)"
    );

    try {
      await this.performPreventiveCleanup();

      const result = await this.init();
      if (result.success) {
        this.criticalLog(
          `[SAFE_INIT] Modèle initialisé avec succès. Source: ${result.source}`
        );
        this.hasInitialized = true;
      } else {
        this.criticalLog(`[SAFE_INIT] Échec d'initialisation: ${result.error}`);
        this.debugLog(
          "[SAFE_INIT] Reset automatique pour préparer le prochain démarrage..."
        );

        try {
          const resetResult = await this.reset();
          if (resetResult.success) {
            this.debugLog(
              "[SAFE_INIT] Reset automatique terminé. Le modèle sera téléchargé au prochain démarrage."
            );
          } else {
            this.criticalLog(
              `[SAFE_INIT] Échec du reset automatique: ${resetResult.error}`
            );
          }
        } catch (resetError) {
          this.criticalLog(
            `[SAFE_INIT] Erreur critique lors du reset: ${String(resetError)}`
          );
        }
        this.hasInitialized = true;
      }
    } catch (error) {
      this.criticalLog(
        `[SAFE_INIT] Erreur critique lors de l'initialisation: ${String(error)}`
      );
      this.debugLog("[SAFE_INIT] Tentative de reset d'urgence...");

      try {
        await this.reset();
        this.debugLog("[SAFE_INIT] Reset d'urgence terminé.");
      } catch (resetError) {
        this.criticalLog(
          `[SAFE_INIT] Échec du reset d'urgence: ${String(resetError)}`
        );
      }
      this.hasInitialized = true;
    } finally {
      this.isInitializing = false;
      this.debugLog("[SAFE_INIT] Fin du processus d'initialisation sûre");
    }
  }

  resetInitializationState(): void {
    this.isInitializing = false;
    this.hasInitialized = false;
    globalInitializationPromise = null;
    this.debugLog("[RESET_STATE] État d'initialisation global réinitialisé");
  }

  async init(): Promise<{ source: string; success: boolean; error?: string }> {
    try {
      this.debugLog("[INIT] Démarrage initialisation du modèle");

      const loadedFromActive = await this.tryLoadFromActivePtr();
      if (loadedFromActive) {
        this.criticalLog("[INIT] Modèle dynamique chargé (existant) ✅");
        return { source: loadedFromActive, success: true };
      }

      try {
        this.debugLog(
          "[INIT] Aucun modèle actif. Lancement checkAndUpdateModel…"
        );
        const res = await checkAndUpdateModel(packageJson.version, MAGIC_URL);
        this.debugLog(
          `[INIT] Update terminé: updated=${res.updated} reason=${res.reason ?? "ok"}`
        );
      } catch (e) {
        this.criticalLog(
          `[INIT] Erreur pendant checkAndUpdateModel: ${String(e)}`
        );
        // continuer le processus
      }

      const loadedAfterUpdate = await this.tryLoadFromActivePtr();
      if (loadedAfterUpdate) {
        this.criticalLog("[INIT] Modèle dynamique chargé après mise à jour");
        return { source: loadedAfterUpdate, success: true };
      }

      const ptr = await getCurrentPtr();
      const errorMsg = `Aucun modèle dynamique disponible. reason=no-current-ptr | updater-résultat=${
        ptr ? "ptr-exists" : "no-ptr"
      }`;
      this.criticalLog(`[INIT] ${errorMsg}`);
      return { source: "none", success: false, error: errorMsg };
    } catch (error) {
      const errorMsg = `Erreur lors de l'initialisation du modèle: ${String(error)}`;
      this.criticalLog(`[INIT ERROR] ${errorMsg}`);
      return { source: "none", success: false, error: errorMsg };
    }
  }

  async refresh(): Promise<{
    success: boolean;
    updated: boolean;
    error?: string;
  }> {
    try {
      this.debugLog("[REFRESH] Démarrage mise à jour manuelle…");
      const before = await getCurrentPtr();

      try {
        await checkAndUpdateModel(packageJson.version, MAGIC_URL);
      } catch (e) {
        this.criticalLog(
          `[REFRESH] Erreur pendant checkAndUpdateModel: ${String(e)}`
        );
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
          this.criticalLog(
            `[REFRESH] Nouveau modèle détecté: ${after.name} v${after.version} → rechargement`
          );
          await this.loadFromDirectory(after.dir);
          return { success: true, updated: true };
        } catch (e) {
          this.criticalLog(
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
          this.debugLog(
            "[REFRESH] Pas de modèle en mémoire, chargement depuis le ptr actuel…"
          );
          await this.loadFromDirectory(after.dir);
          return { success: true, updated: true };
        } catch (e) {
          this.criticalLog(
            `[REFRESH] Erreur lors du chargement du modèle existant: ${String(e)}`
          );
          return {
            success: false,
            updated: false,
            error: `Erreur de chargement: ${String(e)}`,
          };
        }
      }

      this.debugLog("[REFRESH] Aucun changement de modèle.");
      return { success: true, updated: false };
    } catch (error) {
      const errorMsg = `Erreur générale lors du refresh: ${String(error)}`;
      this.criticalLog(`[REFRESH ERROR] ${errorMsg}`);
      return { success: false, updated: false, error: errorMsg };
    }
  }

  async reset(): Promise<{ success: boolean; error?: string }> {
    this.criticalLog("[RESET] Démarrage du reset du modèle...");

    try {
      // Nettoyer le modèle en mémoire
      this.model = null;
      this.labels = [];
      this.labelToId = {};
      this.wordIndex = {};
      this.tokenizerConfig = {};
      this.oovIndex = 1;
      this.maxLen = 128;
      this.batchSize = 1;

      // Réinitialiser l'état d'initialisation
      this.isInitializing = false;
      this.hasInitialized = false;
      globalInitializationPromise = null;

      this.debugLog(
        "[RESET] Modèle en mémoire et état d'initialisation nettoyés"
      );

      const MODELS_ROOT = FileSystem.documentDirectory + "papillon-models/";
      const CURRENT_PTR = MODELS_ROOT + "current.json";

      const ptrInfo = await FileSystem.getInfoAsync(CURRENT_PTR);
      if (ptrInfo.exists) {
        await FileSystem.deleteAsync(CURRENT_PTR, { idempotent: true });
        this.debugLog("[RESET] Pointeur actuel supprimé");
      } else {
        this.debugLog("[RESET] Aucun pointeur actuel à supprimer");
      }

      const modelsInfo = await FileSystem.getInfoAsync(MODELS_ROOT);
      if (modelsInfo.exists) {
        await FileSystem.deleteAsync(MODELS_ROOT, { idempotent: true });
        this.debugLog("[RESET] Dossier des modèles supprimé");
      } else {
        this.debugLog("[RESET] Aucun dossier de modèles à supprimer");
      }

      this.criticalLog("[RESET] Reset terminé avec succès ✅");
      return { success: true };
    } catch (error) {
      const errorMsg = `Erreur lors du reset: ${String(error)}`;
      this.criticalLog(`[RESET ERROR] ${errorMsg}`);
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
    tokenizerConfigLoaded: boolean;
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
    };
  }

  private async tryLoadFromActivePtr(): Promise<string | null> {
    const ptr = await getCurrentPtr();
    if (!ptr) {
      this.debugLog("[INIT] Aucun currentPtr trouvé sur le disque.");
      return null;
    }
    try {
      this.debugLog(
        `[INIT] Chargement du modèle actif: ${ptr.name} v${ptr.version}`
      );
      await this.loadFromDirectory(ptr.dir);
      return `dynamic:${ptr.version}`;
    } catch (e) {
      this.criticalLog(
        `[INIT] Échec de chargement depuis dir actif (${ptr.dir}): ${String(e)}`
      );
      this.debugLog("[INIT] Nettoyage automatique du modèle corrompu...");

      try {
        const MODELS_ROOT = FileSystem.documentDirectory + "papillon-models/";
        const CURRENT_PTR = MODELS_ROOT + "current.json";

        await FileSystem.deleteAsync(CURRENT_PTR, { idempotent: true });
        this.debugLog("[INIT] Pointeur corrompu supprimé");

        await FileSystem.deleteAsync(ptr.dir, { idempotent: true });
        this.debugLog(`[INIT] Dossier du modèle corrompu supprimé: ${ptr.dir}`);
      } catch (cleanupError) {
        this.criticalLog(
          `[INIT] Erreur lors du nettoyage: ${String(cleanupError)}`
        );
      }

      return null;
    }
  }

  async loadFromDirectory(dirUri: string): Promise<void> {
    try {
      this.debugLog(`[LOAD] Chargement depuis le dossier: ${dirUri}`);
      const modelUri = dirUri + "model/model.tflite";
      const tokenizerUri = dirUri + "model/tokenizer.json";
      const labelsUri = dirUri + "model/labels.json";

      this.debugLog(`[LOAD] Chargement du modèle TFLite: ${modelUri}`);
      this.model = await loadTensorflowModel({ url: modelUri });

      const shape = this.model?.inputs?.[0]?.shape;
      this.debugLog(`[LOAD] Shape du modèle détectée: [${shape?.join(", ")}]`);

      this.batchSize = 1;
      this.maxLen = 128;

      this.debugLog(
        `[LOAD] Configuration forcée: batchSize=${this.batchSize}, maxLen=${this.maxLen}`
      );

      this.debugLog(`[LOAD] Chargement du tokenizer: ${tokenizerUri}`);
      const tokenizerRaw = await FileSystem.readAsStringAsync(tokenizerUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      const tokenizerJson = JSON.parse(tokenizerRaw);
      const config = tokenizerJson.config;
      this.tokenizerConfig = config; // Stocker la configuration pour la tokenisation

      const wordIndexUri = dirUri + "model/word_index.json";
      const wordIndexInfo = await FileSystem.getInfoAsync(wordIndexUri);

      let wordIndex: Record<string, number> = {};

      if (wordIndexInfo.exists) {
        this.debugLog(
          `[LOAD] Chargement du word_index.json exporté: ${wordIndexUri}`
        );
        const wordIndexRaw = await FileSystem.readAsStringAsync(wordIndexUri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        wordIndex = JSON.parse(wordIndexRaw);
        this.debugLog(
          `[LOAD] Word index exporté chargé: ${Object.keys(wordIndex).length} mots`
        );
      } else if (tokenizerJson.word_index) {
        this.debugLog(`[LOAD] Utilisation du word_index existant du tokenizer`);
        wordIndex = tokenizerJson.word_index;
        this.debugLog(
          `[LOAD] Word index depuis tokenizer.json: ${Object.keys(wordIndex).length} mots`
        );
      } else if (tokenizerJson.index_word) {
        this.debugLog(`[LOAD] Reconstruction du word_index depuis index_word`);
        const indexWord = tokenizerJson.index_word;
        wordIndex = {};
        for (const [index, word] of Object.entries(indexWord)) {
          if (typeof word === "string") {
            wordIndex[word] = parseInt(index, 10);
          }
        }
        this.debugLog(
          `[LOAD] Word index reconstruit depuis index_word: ${Object.keys(wordIndex).length} mots`
        );
      } else {
        throw new Error(
          "Aucun word_index disponible : ni word_index.json, ni word_index dans tokenizer.json, ni index_word"
        );
      }

      this.wordIndex = wordIndex;

      const oovToken = config.oov_token;
      if (oovToken && wordIndex[oovToken] !== undefined) {
        this.oovIndex = wordIndex[oovToken];
        this.debugLog(
          `[LOAD] OOV token "${oovToken}" trouvé à l'index ${this.oovIndex}`
        );
      } else {
        this.oovIndex = 1;
        this.debugLog(
          `[LOAD] OOV token non trouvé, utilisation de l'index 1 par défaut`
        );
      }

      const paddingWords = Object.keys(wordIndex).filter(
        word => wordIndex[word] === 0
      );
      if (paddingWords.length === 0) {
        this.debugLog(`[LOAD] Index 0 réservé au padding (correct)`);
      } else {
        this.debugLog(
          `[LOAD WARNING] L'index 0 est assigné à: [${paddingWords.join(", ")}] - devrait être réservé au padding`
        );
      }

      this.debugLog(
        `[LOAD] Tokenizer chargé: ${Object.keys(wordIndex).length} mots, oovIndex=${this.oovIndex}`
      );
      this.debugLog(
        `[LOAD] Premier mots du tokenizer: ${Object.keys(wordIndex).slice(0, 10).join(", ")}`
      );
      this.debugLog(
        `[LOAD] Premiers indices: ${Object.keys(wordIndex)
          .slice(0, 10)
          .map(w => `${w}:${wordIndex[w]}`)
          .join(", ")}`
      );

      // Log des tokens spéciaux
      const specialTokens = Object.keys(wordIndex).filter(
        w => w.startsWith("[") || w.startsWith("<")
      );
      if (specialTokens.length > 0) {
        this.debugLog(
          `[LOAD] Tokens spéciaux détectés: ${specialTokens.map(w => `${w}:${wordIndex[w]}`).join(", ")}`
        );
      }

      this.debugLog(`[LOAD] Chargement des labels: ${labelsUri}`);
      const labelsRaw = await FileSystem.readAsStringAsync(labelsUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      this.labels = JSON.parse(labelsRaw);
      this.debugLog(
        `[LOAD] Labels chargées: ${this.labels.length} classes - [${this.labels.slice(0, 5).join(", ")}${this.labels.length > 5 ? "..." : ""}]`
      );

      const labelToIdUri = dirUri + "model/label_to_id.json";
      const labelToIdInfo = await FileSystem.getInfoAsync(labelToIdUri);
      if (labelToIdInfo.exists) {
        this.debugLog(
          `[LOAD] Chargement du mapping label_to_id: ${labelToIdUri}`
        );
        const labelToIdRaw = await FileSystem.readAsStringAsync(labelToIdUri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        this.labelToId = JSON.parse(labelToIdRaw);
        this.debugLog(
          `[LOAD] Label to ID mapping chargé: ${Object.keys(this.labelToId).length} mappings`
        );

        const labelsSet = new Set(this.labels.filter(label => label !== null));
        const labelToIdSet = new Set(Object.keys(this.labelToId));

        const missingInMapping = this.labels.filter(
          label => label !== null && !(label in this.labelToId)
        );
        const extraInMapping = Object.keys(this.labelToId).filter(
          label => !this.labels.includes(label)
        );

        const labelsCount = labelsSet.size;
        const mappingCount = labelToIdSet.size;

        if (labelsCount !== mappingCount) {
          this.debugLog(
            `[LOAD ERROR] Cardinalité différente: labels.json a ${labelsCount} labels, label_to_id.json a ${mappingCount} mappings`
          );
        } else {
          this.debugLog(
            `[LOAD OK] Cardinalité cohérente: ${labelsCount} labels = ${mappingCount} mappings`
          );
        }

        if (missingInMapping.length > 0) {
          this.debugLog(
            `[LOAD ERROR] Labels manquants dans label_to_id.json: [${missingInMapping.join(", ")}]`
          );
        }
        if (extraInMapping.length > 0) {
          this.debugLog(
            `[LOAD ERROR] Mappings supplémentaires dans label_to_id.json: [${extraInMapping.join(", ")}]`
          );
        }

        if (
          missingInMapping.length === 0 &&
          extraInMapping.length === 0 &&
          labelsCount === mappingCount
        ) {
          this.debugLog(
            `[LOAD OK] Cohérence parfaite entre labels.json et label_to_id.json`
          );
        } else {
          this.debugLog(
            `[LOAD WARNING] Incohérences détectées entre labels.json et label_to_id.json`
          );
        }

        const sampleMappings = Object.entries(this.labelToId).slice(0, 5);
        this.debugLog(
          `[LOAD] Exemples de mappings: ${sampleMappings.map(([label, id]) => `"${label}":${id}`).join(", ")}`
        );

        let indexMismatches = 0;
        for (let i = 0; i < this.labels.length; i++) {
          const label = this.labels[i];
          const expectedId = this.labelToId[label];
          if (expectedId !== undefined && expectedId !== i) {
            indexMismatches++;
            if (indexMismatches <= 3) {
              this.debugLog(
                `[LOAD MISMATCH] Label "${label}" à l'index ${i} mais mapping ID ${expectedId}`
              );
            }
          }
        }

        if (indexMismatches > 0) {
          this.debugLog(
            `[LOAD WARNING] ${indexMismatches} décalages détectés entre indices labels et IDs mappés`
          );
        } else {
          this.debugLog(
            `[LOAD OK] Indices des labels correspondent aux IDs mappés`
          );
        }
      } else {
        this.debugLog(
          `[LOAD] Aucun fichier label_to_id.json trouvé, utilisation de l'ordre des labels`
        );
        this.labelToId = {};
        for (let i = 0; i < this.labels.length; i++) {
          this.labelToId[this.labels[i]] = i;
        }
      }

      this.criticalLog("[LOAD] Modèle dynamique chargé avec succès");
    } catch (error) {
      this.criticalLog(`[LOAD ERROR] ${String(error)}`);
      throw error;
    }
  }

  tokenize(text: string, verbose: boolean = false): number[] {
    if (verbose || this.debugMode) {
      this.debugLog(`[TOKENIZE] Texte original: "${text}"`);
    }
    const normalizedText = normalizeText(text, this.tokenizerConfig);
    if (verbose || this.debugMode) {
      this.debugLog(`[TOKENIZE] Texte normalisé: "${normalizedText}"`);
    }

    if (!normalizedText.trim()) {
      this.debugLog(
        `[TOKENIZE] Texte vide après normalisation, retour d'une séquence de zéros`
      );
      return new Array(this.maxLen).fill(0);
    }
    const words = normalizedText.split(" ").filter(w => w.length > 0);
    const sequence: number[] = [];
    const unknownWords: string[] = [];

    if (verbose || this.debugMode) {
      this.debugLog(`[TOKENIZE] Mots après split: [${words.join(", ")}]`);
    }

    for (const word of words) {
      const idx = this.wordIndex[word];
      if (idx !== undefined) {
        sequence.push(idx);
        if (verbose || this.debugMode) {
          this.debugLog(`[TOKENIZE] "${word}" → ${idx}`);
        }
      } else {
        sequence.push(this.oovIndex);
        unknownWords.push(word);
        if (verbose || this.debugMode) {
          this.debugLog(`[TOKENIZE] "${word}" → OOV (${this.oovIndex})`);
        }
      }
    }

    if (sequence.length > this.maxLen) {
      sequence.splice(this.maxLen);
      if (verbose || this.debugMode) {
        this.debugLog(`[TOKENIZE] Séquence tronquée à ${this.maxLen} tokens`);
      }
    }

    while (sequence.length < this.maxLen) {
      sequence.push(0);
    }

    if (unknownWords.length > 0 && this.debugMode) {
      this.debugLog(
        `[TOKENIZE] Mots inconnus (${unknownWords.length}): [${unknownWords.join(", ")}]`
      );
    }

    if (this.debugMode) {
      this.debugLog(
        `[TOKENIZE] Séquence finale: longueur=${sequence.length}, 10 premiers tokens=[${sequence.slice(0, 10).join(", ")}]`
      );
    }

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
        this.criticalLog(`[PREDICT ERROR] ${errorMsg}`);
        return { error: errorMsg, success: false };
      }

      if (verbose || this.debugMode) {
        this.debugLog(`[PREDICT START] Text: "${text}", verbose: ${verbose}`);
        this.debugLog(
          `[PREDICT MODEL INFO] batchSize: ${this.batchSize}, maxLen: ${this.maxLen}, labels: ${this.labels.length}, labelToId: ${Object.keys(this.labelToId).length}`
        );

        const modelInputShape = this.model?.inputs?.[0]?.shape;
        this.debugLog(
          `[PREDICT MODEL SHAPE] Expected input shape: [${modelInputShape?.join(", ")}]`
        );

        if (
          modelInputShape &&
          (modelInputShape[0] !== 1 || modelInputShape[1] !== this.maxLen)
        ) {
          this.debugLog(
            `[PREDICT WARNING] Forme inattendue: attendu [1, ${this.maxLen}], reçu [${modelInputShape.join(", ")}]`
          );
        }
      }

      const seq = this.tokenize(text, verbose || this.debugMode);
      if (verbose || this.debugMode) {
        this.debugLog(
          `[PREDICT TOKENIZED] Taille séquence: ${seq.length}, 10 premiers tokens: [${seq.slice(0, 10).join(", ")}]`
        );
      }
      const inputArr = new Int32Array(this.batchSize * this.maxLen);

      for (let i = 0; i < seq.length && i < this.maxLen; i++) {
        inputArr[i] = seq[i];
      }

      if (verbose || this.debugMode) {
        this.debugLog(
          `[PREDICT INPUT] Forme envoyée: [${this.batchSize}, ${this.maxLen}], type: ${inputArr.constructor.name}`
        );
        this.debugLog(
          `[PREDICT INPUT] 10 premières valeurs: [${Array.from(inputArr.slice(0, 10)).join(", ")}]`
        );
      }

      try {
        if (verbose || this.debugMode) {
          this.debugLog(
            `[PREDICT RUN] Exécution du modèle TFLite avec entrée int32`
          );
        }
        const [out] = await this.model.run([inputArr]);
        if (verbose || this.debugMode) {
          this.debugLog(`[PREDICT RUN SUCCESS] Modèle exécuté avec succès`);
        }

        const scores = Array.from(out as Float32Array);
        if (verbose || this.debugMode) {
          this.debugLog(
            `[PREDICT OUTPUT] Longueur sortie: ${scores.length}, type: Float32Array (probabilités softmax)`
          );
          this.debugLog(
            `[PREDICT OUTPUT] 5 premiers scores: [${scores
              .slice(0, 5)
              .map(s => s.toFixed(4))
              .join(", ")}]`
          );
        }

        const best = scores.indexOf(Math.max(...scores));
        if (verbose || this.debugMode) {
          this.debugLog(
            `[PREDICT RESULT] Indice argmax: ${best}, score max: ${scores[best].toFixed(4)}`
          );
        }

        let predictedLabel: string | undefined;

        if (Object.keys(this.labelToId).length > 0) {
          predictedLabel = Object.keys(this.labelToId).find(
            label => this.labelToId[label] === best
          );
          if (predictedLabel && (verbose || this.debugMode)) {
            this.debugLog(
              `[PREDICT MAPPING] Label trouvé via label_to_id: "${predictedLabel}" pour l'index ${best}`
            );
          } else if (!predictedLabel && (verbose || this.debugMode)) {
            this.debugLog(
              `[PREDICT MAPPING WARNING] Aucun label trouvé pour l'index ${best} dans label_to_id`
            );
            predictedLabel = this.labels?.[best];
            this.debugLog(
              `[PREDICT MAPPING FALLBACK] Utilisation de l'index direct: "${predictedLabel}"`
            );
          }
        } else {
          predictedLabel = this.labels?.[best];
          if (verbose || this.debugMode) {
            this.debugLog(
              `[PREDICT MAPPING] Pas de label_to_id, utilisation directe de l'index ${best}: "${predictedLabel}"`
            );
          }
        }

        const predicted =
          predictedLabel === null ? "null" : (predictedLabel ?? `#${best}`);
        if (verbose || this.debugMode) {
          this.debugLog(
            `[PREDICT FINAL] Label prédit: "${predicted}" (index: ${best}, score: ${scores[best].toFixed(4)})`
          );
        }

        const labelScores: Record<string, number> = {};

        if (Object.keys(this.labelToId).length > 0) {
          for (const [label, id] of Object.entries(this.labelToId)) {
            if (id < scores.length) {
              labelScores[label] = scores[id];
            }
          }
          if (verbose || this.debugMode) {
            this.debugLog(
              `[PREDICT SCORES] Scores ordonnés selon label_to_id: ${Object.keys(labelScores).length} mappings`
            );
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
          if (verbose || this.debugMode) {
            this.debugLog(
              `[PREDICT SCORES] Scores selon l'ordre de labels.json: ${Object.keys(labelScores).length} mappings`
            );
          }
        }

        if (verbose || this.debugMode) {
          this.debugLog(`[PREDICT SUCCESS] Prédiction terminée avec succès`);
        }
        return { scores, predicted, labelScores };
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        this.criticalLog(
          `[PREDICT MODEL RUN ERROR] Erreur TFLite: ${errorMessage}`
        );
        if (this.debugMode) {
          this.debugLog(
            `[PREDICT DEBUG] Forme d'entrée: [${this.batchSize}, ${this.maxLen}], type: ${inputArr.constructor.name}`
          );
          const modelInputShape = this.model?.inputs?.[0]?.shape;
          this.debugLog(
            `[PREDICT DEBUG] Forme attendue: [${modelInputShape?.join(", ")}]`
          );
          this.debugLog(
            `[PREDICT DEBUG] Premiers tokens: [${Array.from(inputArr.slice(0, 5)).join(", ")}]`
          );
          this.debugLog(
            `[PREDICT DEBUG] Runtime TFLite doit accepter int32 en entrée et float32 en sortie`
          );
        }
        return {
          error: `Erreur d'exécution du modèle TFLite: ${errorMessage}`,
          success: false,
        };
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      this.criticalLog(`[PREDICT ERROR] Erreur générale: ${errorMessage}`);
      return {
        error: `Erreur générale lors de la prédiction: ${errorMessage}`,
        success: false,
      };
    }
  }
}

export default ModelManager.getInstance();
