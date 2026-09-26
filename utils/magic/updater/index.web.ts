// Web/Electron build of the Magic model updater.
//
// The native updater downloads a .tflite model and smoke-tests it with
// react-native-fast-tflite, which does not exist on web. Metro picks this
// file over index.ts when bundling for web/Electron, so "Magic" is reported
// as having no model to update instead of crashing the bundle.

import type { CurrentPtr } from "./types";

export async function getCurrentPtr(): Promise<CurrentPtr | null> {
  return null;
}

export async function setCurrentPtr(_ptr: CurrentPtr): Promise<void> {
  // No-op: no model is ever stored on desktop.
}

export async function checkAndUpdateModel(
  _appVersion: string,
  _manifestUrl?: string
): Promise<{ updated: boolean; using: CurrentPtr | null; reason?: string }> {
  return { updated: false, using: null, reason: "unsupported-platform" };
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
