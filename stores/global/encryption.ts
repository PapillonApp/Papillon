import { Directory, File, Paths } from "expo-file-system";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { createMMKV, MMKV } from "react-native-mmkv";

// Must match react-native-mmkv's iOS root (AppGroupIdentifier in Info.plist)
const APP_GROUP_ID = "group.xyz.getpapillon";

const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
};

const SECURITY_LOGOUT_NOTICE = "security-logout-notice";

// True once if the accounts could not be recovered, so the user is told why they are logged out
export function consumeSecurityLogoutNotice(): boolean {
  const storage = createMMKV();
  const pending = storage.getBoolean(SECURITY_LOGOUT_NOTICE) === true;
  if (pending) {storage.remove(SECURITY_LOGOUT_NOTICE);}
  return pending;
}

const toPath =(uri: string) => decodeURIComponent(uri.replace(/^file:\/\//, ""));

const isReadable = (json?: string): boolean => {
  if (!json) {return false;}
  try {
    JSON.parse(json);
    return true;
  } catch {
    return false;
  }
};

function mmkvDirectory(): Directory | undefined {
  if (Platform.OS === "ios") {return Paths.appleSharedContainers[APP_GROUP_ID];}
  return new Directory(Paths.document, "mmkv");
}

// Reads a copy of the file with the per-device key, leaving the open instance untouched
function readWithDeviceKey(id: string, deviceKey: string): string | undefined {
  const source = mmkvDirectory();
  if (!source) {return undefined;}

  const copy = new Directory(Paths.cache, "mmkv-recovery");
  if (copy.exists) {copy.delete();}
  copy.create({ intermediates: true });

  try {
    new File(source, id).copySync(new File(copy, id));
    new File(source, `${id}.crc`).copySync(new File(copy, `${id}.crc`));

    const value = createMMKV({
      id,
      path: toPath(copy.uri),
      encryptionKey: deviceKey,
      encryptionType: "AES-256",
    }).getString(id);
    return isReadable(value) ? value : undefined;
  } finally {
    copy.delete();
  }
}

// 8.6.0 re-encrypted some files with a per-device key, but PapillonKit reads the same
// file in the same process with the static key: bring those files back to the static key.
function recoverDeviceKeyFile(mmkv: MMKV, id: string) {
  const migratedName = `mmkv-key.${id}.migrated`;
  if (SecureStore.getItem(migratedName, SECURE_STORE_OPTIONS) !== "1") {return;}

  if (!isReadable(mmkv.getString(id))) {
    let recovered: string | undefined;
    try {
      const deviceKey = SecureStore.getItem(`mmkv-key.${id}`, SECURE_STORE_OPTIONS);
      recovered = deviceKey ? readWithDeviceKey(id, deviceKey) : undefined;
    } catch (error) {
      console.error(`Unable to read MMKV "${id}" with the per-device key:`, error);
    }

    // Unreadable with either key: start from a clean file so new logins are saved
    mmkv.clearAll();
    if (recovered) {
      mmkv.set(id, recovered);
    } else {
      createMMKV().set(SECURITY_LOGOUT_NOTICE, true);
    }
  }

  SecureStore.setItem(migratedName, "reverted", SECURE_STORE_OPTIONS);
}

// Always the static key: PapillonKit (widgets, Live Activities, Siri) opens this file
// natively with it, and MMKV shares one instance per file within the process.
export function createEncryptedMMKV(id: string, legacyKey?: string): MMKV {
  const mmkv = createMMKV({ id, encryptionKey: legacyKey });

  try {
    recoverDeviceKeyFile(mmkv, id);
  } catch (error) {
    console.error(`Unable to recover MMKV "${id}" from the per-device key:`, error);
  }

  return mmkv;
}
