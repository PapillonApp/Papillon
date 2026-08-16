import { NativeModule, requireNativeModule } from "expo";

declare class PapillonNativeModule extends NativeModule {
  reindexSpotlight(accountId: string): Promise<void>;
  clearSpotlightIndex(): Promise<void>;
}

export default requireNativeModule<PapillonNativeModule>("PapillonNative");
