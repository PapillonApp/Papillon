import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { createMMKV, MMKV } from "react-native-mmkv";

const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
};

const KEY_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
const KEY_LENGTH = 32;

function generateKey(): string {
  const bytes = Crypto.getRandomBytes(KEY_LENGTH);
  let key = "";
  for (let i = 0; i < KEY_LENGTH; i++) {
    key += KEY_ALPHABET[bytes[i] & 63];
  }
  return key;
}

function getOrCreateDeviceKey(keyName: string): string {
  const existing = SecureStore.getItem(keyName, SECURE_STORE_OPTIONS);
  if (existing) {return existing;}

  const key = generateKey();
  SecureStore.setItem(keyName, key, SECURE_STORE_OPTIONS);

  if (SecureStore.getItem(keyName, SECURE_STORE_OPTIONS) !== key) {
    throw new Error("Unable to persist MMKV encryption key in secure storage");
  }
  return key;
}

export function createEncryptedMMKV(id: string, legacyKey?: string): MMKV | null {
  const keyName = `mmkv-key.${id}`;
  const migratedName = `mmkv-key.${id}.migrated`;

  try {
    const key = getOrCreateDeviceKey(keyName);

    if (SecureStore.getItem(migratedName, SECURE_STORE_OPTIONS) === "1") {
      return createMMKV({ id, encryptionKey: key, encryptionType: "AES-256" });
    }

    const mmkv = createMMKV({ id, encryptionKey: legacyKey });
    mmkv.encrypt(key, "AES-256");
    SecureStore.setItem(migratedName, "1", SECURE_STORE_OPTIONS);
    return mmkv;
  } catch (error) {
    console.error(`Unable to open encrypted MMKV "${id}":`, error);
    return null;
  }
}
