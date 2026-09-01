import * as SecureStore from "expo-secure-store";

const MYCPE_TOKEN_KEY_PREFIX = "papillon.mycpe.token";

export interface MyCpeSecureStore {
  setItemAsync(key: string, value: string): Promise<void>;
  getItemAsync(key: string): Promise<string | null>;
  deleteItemAsync(key: string): Promise<void>;
}

const defaultSecureStore = SecureStore as MyCpeSecureStore;

const requireValue = (value: string, label: string): string => {
  if (!value.trim()) {
    throw new Error(`${label} ne peut pas être vide.`);
  }
  return value;
};

export function getMyCpeTokenStorageKey(serviceAccountId: string): string {
  return `${MYCPE_TOKEN_KEY_PREFIX}.${requireValue(serviceAccountId, "serviceAccountId")}`;
}

export async function saveMyCpeToken(
  serviceAccountId: string,
  token: string,
  secureStore: MyCpeSecureStore = defaultSecureStore
): Promise<void> {
  requireValue(token, "token");
  await secureStore.setItemAsync(
    getMyCpeTokenStorageKey(serviceAccountId),
    token
  );
}

export async function getMyCpeToken(
  serviceAccountId: string,
  secureStore: MyCpeSecureStore = defaultSecureStore
): Promise<string | null> {
  return secureStore.getItemAsync(getMyCpeTokenStorageKey(serviceAccountId));
}

export async function deleteMyCpeToken(
  serviceAccountId: string,
  secureStore: MyCpeSecureStore = defaultSecureStore
): Promise<void> {
  await secureStore.deleteItemAsync(getMyCpeTokenStorageKey(serviceAccountId));
}
