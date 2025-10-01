import Countly from "countly-sdk-react-native-bridge";
import { MMKV } from "react-native-mmkv";
import * as FileSystem from 'expo-file-system';
import { isWindows } from "../platform";

// --- Abstraction for consent storage ---

const CONSENT_FILE_PATH = `${FileSystem.documentDirectory}consent_settings.json`;

interface ConsentStorage {
  getBoolean(key: string): Promise<boolean | null>;
  set(key: string, value: boolean): Promise<void>;
}

class MMKVConsenStorage implements ConsentStorage {
  private mmkv: MMKV;
  constructor() {
    this.mmkv = new MMKV({ id: 'consent' });
  }
  async getBoolean(key: string): Promise<boolean | null> {
    const value = this.mmkv.getBoolean(key);
    return value === undefined ? null : value;
  }
  async set(key: string, value: boolean): Promise<void> {
    this.mmkv.set(key, value);
  }
}

class FileConsentStorage implements ConsentStorage {
  private cache: Record<string, boolean> | null = null;

  private async read(): Promise<Record<string, boolean>> {
    if (this.cache) return this.cache;
    try {
      const fileInfo = await FileSystem.getInfoAsync(CONSENT_FILE_PATH);
      if (fileInfo.exists) {
        const content = await FileSystem.readAsStringAsync(CONSENT_FILE_PATH);
        this.cache = JSON.parse(content);
        return this.cache || {};
      }
    } catch (e) { console.error("Failed to read consent file", e); }
    this.cache = {};
    return this.cache;
  }

  private async write(data: Record<string, boolean>): Promise<void> {
    try {
      await FileSystem.writeAsStringAsync(CONSENT_FILE_PATH, JSON.stringify(data));
      this.cache = data;
    } catch (e) { console.error("Failed to write consent file", e); }
  }

  async getBoolean(key: string): Promise<boolean | null> {
    const data = await this.read();
    return data[key] ?? null;
  }

  async set(key: string, value: boolean): Promise<void> {
    const data = await this.read();
    data[key] = value;
    await this.write(data);
  }
}

const consentStorage: ConsentStorage = isWindows ? new FileConsentStorage() : new MMKVConsenStorage();

// --- Refactored functions ---

interface ConsentStatus {
  given: boolean;
  required: boolean;
  optional: boolean;
  advanced: boolean;
}

export const checkConsent = async (): Promise<ConsentStatus> => {
  const given = await consentStorage.getBoolean("consent") ?? false;
  const required = await consentStorage.getBoolean("countly-consent-required") ?? false;
  const optional = await consentStorage.getBoolean("countly-consent-optional") ?? false;
  const advanced = await consentStorage.getBoolean("countly-consent-advanced") ?? false;

  return { given, required, optional, advanced };
}

interface ConsentLevels {
  none: boolean;
  required: boolean;
  optional: boolean;
  advanced: boolean;
}

export const setConsent = async (consent: keyof ConsentLevels) => {
  const consentMap = {
    none: { given: true, required: false, optional: false, advanced: false },
    required: { given: true, required: true, optional: false, advanced: false },
    optional: { given: true, required: true, optional: true, advanced: false },
    advanced: { given: true, required: true, optional: true, advanced: true },
  };

  const levels = consentMap[consent];
  await consentStorage.set("consent", levels.given);
  await consentStorage.set("countly-consent-required", levels.required);
  await consentStorage.set("countly-consent-optional", levels.optional);
  await consentStorage.set("countly-consent-advanced", levels.advanced);

  // Guard Countly calls on Windows, as the native module won't be available.
  if (isWindows) {
    return;
  }

  // Set Countly consent levels
  if (consent === "required") {
    Countly.giveConsent(["sessions"]);
  } else if (consent === "optional") {
    Countly.giveConsent(["sessions", "crashes", "users"]);
  } else if (consent === "advanced") {
    Countly.giveConsent(["sessions", "crashes", "users", "location", "attribution", "push", "star-rating", "feedback"]);
  }
};