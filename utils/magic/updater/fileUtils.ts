import * as FileSystem from "expo-file-system/legacy";

export async function ensureDir(uri: string) {
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists)
  {await FileSystem.makeDirectoryAsync(uri, { intermediates: true });}
}

async function ensureParentDir(path: string) {
  const parts = path.split("/").slice(0, -1).join("/") + "/";
  const info = await FileSystem.getInfoAsync(parts);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(parts, { intermediates: true });
  }
}

export async function readJSON<T>(uri: string): Promise<T> {
  const raw = await FileSystem.readAsStringAsync(uri);
  return JSON.parse(raw) as T;
}

export async function writeJSON(uri: string, data: unknown) {
  await FileSystem.writeAsStringAsync(uri, JSON.stringify(data, null, 2));
}

export async function withLock<T>(
  lockPath: string,
  fn: () => Promise<T>
): Promise<T> {
  await ensureParentDir(lockPath);

  const info = await FileSystem.getInfoAsync(lockPath);
  if (info.exists) {throw new Error("update-in-progress");}

  await FileSystem.writeAsStringAsync(lockPath, Date.now().toString());
  try {
    return await fn();
  } finally {
    try {
      await FileSystem.deleteAsync(lockPath, { idempotent: true });
    } catch { /* empty */ }
  }
}
