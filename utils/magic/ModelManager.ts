/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-console */
import { loadTensorflowModel, TensorflowModel } from "react-native-fast-tflite";

function log(...args: any[]) {
  console.log("[ModelManager]", ...args);
}

export type ModelPrediction = {
  scores: number[];
  predicted: string;
  labelScores: Record<string, number>;
};

export type TestResult = {
  total: number;
  correct: number;
  accuracy: number;
  details: Array<{
    description: string;
    expected: string | null;
    predicted: string;
    correct: boolean;
    scores: number[];
  }>;
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

      log("Model loaded:", this.model);

      const shape = this.model?.inputs?.[0]?.shape;
      if (shape && shape[1]) {
        this.maxLen = shape[1];
        log("Model input length:", this.maxLen);
      }
    } catch (error) {
      log("Error loading model:", error);
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

    log("OOV token:", config.oov_token, "→ index", this.oovIndex);
    log("Loaded tokenizer with", Object.keys(wordIndex).length, "words");

    this.labels = require("@/assets/model/labels.json");
    log("Loaded labels:", this.labels.length, this.labels);
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
    log("[TOKENIZED]", seq);

    const inputArr = new Float32Array(this.maxLen);
    for (let i = 0; i < seq.length && i < this.maxLen; i++) {
      inputArr[i] = seq[i];
    }

    log("[INPUT TENSOR]", {
      name: this.model.inputs[0].name,
      dataType: "float32",
      shape: [1, this.maxLen],
      dataTypeActual: inputArr.constructor.name,
      dataLength: inputArr.length,
    });

    try {
      log("[DEBUG] InputArr is TypedArray:", inputArr instanceof Float32Array);
      log("[DEBUG] InputArr buffer:", inputArr.buffer instanceof ArrayBuffer);
      log("[DEBUG] InputArr length:", inputArr.length);
      log("[DEBUG] First 5 values:", Array.from(inputArr.slice(0, 5)));

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

      log("[RESULT]", { predicted, scores, labelScores });
      return { scores, predicted, labelScores };
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      log("[PREDICT ERROR]", errorMessage);
      throw e;
    }
  }

  async testModel(numSamples: number = 20): Promise<TestResult> {
    if (!this.model) {
      throw new Error("Model not loaded");
    }

    log(`Testing model with ${numSamples} samples...`);

    try {
      const dataset = require("@/assets/model/datasets.json");

      // Shuffle the dataset and take the specified number of samples
      const shuffled = [...dataset].sort(() => Math.random() - 0.5);
      const samples = shuffled.slice(0, numSamples);

      let correct = 0;
      const details: TestResult["details"] = [];

      for (let i = 0; i < samples.length; i++) {
        const sample = samples[i];
        const description = sample.description;
        const expected = sample.type;

        try {
          const prediction = await this.predict(description);

          // Normaliser la comparaison pour gérer les valeurs null
          const expectedLabel = expected === null ? "null" : expected;
          const isCorrect = prediction.predicted === expectedLabel;

          if (isCorrect) {
            correct++;
          }

          details.push({
            description,
            expected,
            predicted: prediction.predicted,
            correct: isCorrect,
            scores: prediction.scores,
          });

          log(
            `[TEST ${i + 1}/${samples.length}] ${isCorrect ? "✓" : "✗"} "${description.slice(0, 50)}..." -> Expected: ${expectedLabel}, Got: ${prediction.predicted}`
          );
        } catch (error) {
          log(
            `[TEST ${i + 1}/${samples.length}] ERROR testing "${description.slice(0, 50)}...": ${error}`
          );
          details.push({
            description,
            expected,
            predicted: "ERROR",
            correct: false,
            scores: [],
          });
        }
      }

      const accuracy = (correct / samples.length) * 100;

      const result: TestResult = {
        total: samples.length,
        correct,
        accuracy,
        details,
      };

      log(
        `[TEST COMPLETE] Accuracy: ${accuracy.toFixed(1)}% (${correct}/${samples.length})`
      );
      return result;
    } catch (error) {
      log("[TEST ERROR]", error);
      throw error;
    }
  }
}

export default ModelManager.getInstance();
