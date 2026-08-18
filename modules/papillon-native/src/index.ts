import { Platform } from "react-native";

import type PapillonNativeModuleType from "./PapillonNativeModule";
import type { SpotlightDebugSnapshot } from "./PapillonNativeModule";

export type { SpotlightDebugSnapshot };

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

export async function reindexSpotlight(accountIds: string[]): Promise<void> {
  await getNativeModule()?.reindexSpotlight(accountIds);
}

export async function clearSpotlightIndex(): Promise<void> {
  await getNativeModule()?.clearSpotlightIndex();
}

export async function getSpotlightDebugSnapshot(): Promise<SpotlightDebugSnapshot | null> {
  return (await getNativeModule()?.getSpotlightDebugSnapshot()) ?? null;
}
