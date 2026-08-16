import { Platform } from "react-native";

import type PapillonNativeModuleType from "./PapillonNativeModule";

let nativeModule: typeof PapillonNativeModuleType | null = null;

function getNativeModule(): typeof PapillonNativeModuleType | null {
  if (Platform.OS !== "ios") {
    return null;
  }
  if (!nativeModule) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    nativeModule = require("./PapillonNativeModule").default;
  }
  return nativeModule;
}

export async function reindexSpotlight(accountId: string): Promise<void> {
  await getNativeModule()?.reindexSpotlight(accountId);
}

export async function clearSpotlightIndex(): Promise<void> {
  await getNativeModule()?.clearSpotlightIndex();
}
