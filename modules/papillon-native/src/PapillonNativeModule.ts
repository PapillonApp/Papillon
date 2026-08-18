import { NativeModule, requireNativeModule } from "expo";

export interface SpotlightDebugSnapshot {
  activeAccountIds: string[];
  indexedCourseCount: number;
  indexedHomeworkCount: number;
  indexedGradeCount: number;
  rawCourseCount: number;
  rawHomeworkCount: number;
  rawGradeCount: number;
  lastIndexedAt: number | null;
}

declare class PapillonNativeModule extends NativeModule {
  reindexSpotlight(accountIds: string[]): Promise<void>;
  clearSpotlightIndex(): Promise<void>;
  getSpotlightDebugSnapshot(): Promise<SpotlightDebugSnapshot>;
}

export default requireNativeModule<PapillonNativeModule>("PapillonNative");
