/* eslint-disable @typescript-eslint/no-require-imports */

import { loadTensorflowModel, TensorflowModel } from "react-native-fast-tflite";
import { log } from "../logger/logger";

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

  async loadModel(): Promise<void> {
    try {
      log("Loading model...");
      const modelAsset = require("@/assets/model/model.tflite");
      this.model = await loadTensorflowModel(modelAsset);

      const shape = this.model?.inputs?.[0]?.shape;
      if (shape && shape[1]) {
        this.maxLen = shape[1];
      }
    } catch (error) {
      log(String(error));
      throw error;
    }
  }

  async loadTokenizer(): Promise<void> {
    log("Loading tokenizer & labels");
    const tokenizerRaw = require("@/assets/model/tokenizer.json");
    const config = tokenizerRaw.config;
    const wordCounts = JSON.parse(config.word_counts);
    const wordIndex: Record<string, number> = {};
    let index = 1;
    for (const word of Object.keys(wordCounts)) {
      wordIndex[word] = index++;
    }
    this.wordIndex = wordIndex;
    this.oovIndex = wordIndex[config.oov_token] ?? 1;

    this.labels = require("@/assets/model/labels.json");
  }

  cleanText(t: string): string {
    const cleaned = t
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .toLowerCase();
    return cleaned;
  }

  tokenize(text: string): number[] {
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

    if (unknownWords.length) {
      log("[UNKNOWN WORDS]", unknownWords.join(", "));
    }
    return sequence.slice(0, this.maxLen);
  }

  async predict(text: string): Promise<ModelPrediction> {
    if (!this.model) {
      throw new Error("Model not loaded");
    }

    log("Running prediction for:", text);
    log("Tokenizing text:", text);

    const seq = this.tokenize(text);
    log("[CLEAN TEXT]", this.cleanText(text));
    log("[TOKENIZED]", seq.join(", "));

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
      log("[PREDICT ERROR]", errorMessage);
      throw e;
    }
  }
}

export default ModelManager.getInstance();
