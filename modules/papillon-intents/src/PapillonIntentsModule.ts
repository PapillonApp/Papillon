import { NativeModule, requireNativeModule } from "expo";

import type { IntentRequestEvent } from "./types";

export type PapillonIntentsModuleEvents = {
  onIntentRequest: (event: IntentRequestEvent) => void;
};

declare class PapillonIntentsModule extends NativeModule<PapillonIntentsModuleEvents> {
  resolveRequest(requestId: string, payloadJson: string): void;
  rejectRequest(requestId: string, message: string): void;
  markReady(): void;
  configure(settingsJson: string): void;
  setCache(entityType: string, payloadJson: string): void;
  getCache(entityType: string): string | null;
}

export default requireNativeModule<PapillonIntentsModule>("PapillonIntents");
