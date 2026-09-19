// Web/Electron build of ModelManager.
//
// react-native-fast-tflite wraps a native TurboModule (NativeRNTflite) that
// only exists on iOS/Android — there is no WASM/web build of it. Metro picks
// this ".web.ts" file instead of ModelManager.ts automatically when bundling
// for the web/Electron target, so the on-device "Magic" text classifier is
// simply reported as unavailable here instead of crashing the bundle.
//
// Every export below mirrors ModelManager.ts's public shape exactly, so every
// call site (useAppInitialization, app/(settings)/magic.tsx, devmode.tsx,
// utils/magic/prediction.ts) keeps working unchanged.

export type ModelPrediction = {
  scores: number[];
  predicted: string;
  labelScores: Record<string, number>;
};

class ModelManager {
  private static instance: ModelManager;

  static getInstance(): ModelManager {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager();
    }
    return ModelManager.instance;
  }

  async performPreventiveCleanup(): Promise<void> {
    // Nothing to clean up: no model is ever downloaded on desktop.
  }

  async safeInit(): Promise<void> {
    // No-op: Magic stays disabled on the desktop build.
  }

  resetInitializationState(): void {
    // No-op.
  }

  async reset(): Promise<{ success: boolean; error?: string }> {
    return { success: true };
  }

  async refresh(): Promise<{
    success: boolean;
    updated: boolean;
    error?: string;
  }> {
    return { success: true, updated: false };
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
      hasModel: false,
      maxLen: 0,
      batchSize: 0,
      labelsCount: 0,
      labelToIdCount: 0,
      wordIndexSize: 0,
      oovIndex: 0,
      tokenizerConfigLoaded: false,
      isInitializing: false,
      hasInitialized: false,
      labels: [],
      modelType: "Indisponible sur PC",
      tokenizerInfo: {
        hasFilters: false,
        hasLowerCase: false,
        oovToken: null,
        configKeys: [],
      },
      memoryInfo: {
        globalPromiseActive: false,
        instanceExists: true,
      },
    };
  }

  async predict(
    _text: string,
    _verbose: boolean = false
  ): Promise<ModelPrediction | { error: string; success: false }> {
    return {
      error: "Magic n'est pas disponible sur la version PC",
      success: false,
    };
  }
}

export default ModelManager.getInstance();
