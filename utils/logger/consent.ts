import { MMKV } from "react-native-mmkv";

import { posthog } from "@/utils/logger/posthog";

const storage = new MMKV();

export type ConsentLevel = "none" | "essentials" | "advanced";

const GIVEN_KEY = "consent-given";
const LEVEL_KEY = "consent-level"
const DATE_KEY = "consent-date";

export interface ConsentStatus {
  given: boolean;
  level: ConsentLevel;
  date: string | null;
}

export const checkConsent = async (): Promise<ConsentStatus> => {
  return {
    given: storage.getBoolean(GIVEN_KEY) ?? false,
    level: (storage.getString(LEVEL_KEY) as ConsentLevel | undefined) ?? "none",
    date: storage.getString(DATE_KEY) ?? null,
  };
};

export const setConsent = async (level: ConsentLevel): Promise<void> => {
  storage.set(GIVEN_KEY, true);
  storage.set(LEVEL_KEY, level);
  storage.set(DATE_KEY, new Date().toISOString());

  if (level === "none") {
    await posthog.optOut();
  } else {
    await posthog.optIn();
  }
};
