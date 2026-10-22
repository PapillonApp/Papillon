// react-native-fast-tflite was removed (no React Native 0.88 support). Magic+ is disabled
// until a replacement inference runtime exists; this stub keeps the rest of the code compiling
// and makes any model load fail cleanly instead of crashing.
export const MAGIC_AVAILABLE = false;

export type TensorflowModel = {
  inputs: { shape: number[] }[];
  run: (input: ArrayBufferView[]) => Promise<ArrayBufferView[]>;
};

export async function loadTensorflowModel(_source: { url: string }): Promise<TensorflowModel> {
  throw new Error("TensorFlow Lite is not available in this build.");
}
