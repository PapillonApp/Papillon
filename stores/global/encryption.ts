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

// Opening an MMKV file with the wrong key discards its content, so every path
// below must open the file with the key it is actually encrypted with.
export function createEncryptedMMKV(id: string, legacyKey?: string): MMKV {
  const keyName = `mmkv-key.${id}`;
  const migratedName = `mmkv-key.${id}.migrated`;

  let key: string | null = null;
  let migrated = false;
  try {
    key = getOrCreateDeviceKey(keyName);
    migrated = SecureStore.getItem(migratedName, SECURE_STORE_OPTIONS) === "1";
  } catch (error) {
    console.error(`Secure storage unavailable for MMKV "${id}":`, error);
  }

  if (key && migrated) {
    return createMMKV({ id, encryptionKey: key, encryptionType: "AES-256" });
  }

  // Not migrated yet (or secure storage unavailable): the file still uses the legacy key
  const mmkv = createMMKV({ id, encryptionKey: legacyKey });
  if (!key) {return mmkv;}

  try {
    mmkv.encrypt(key, "AES-256");
  } catch (error) {
    console.error(`Unable to migrate MMKV "${id}", keeping the legacy key:`, error);
    return mmkv;
  }

  try {
    SecureStore.setItem(migratedName, "1", SECURE_STORE_OPTIONS);
  } catch (error) {
    // Without the flag, the next launch would open the file with the legacy key: roll back
    console.error(`Unable to save migration flag for MMKV "${id}", rolling back:`, error);
    mmkv.encrypt(legacyKey ?? "");
  }
  return mmkv;
}
