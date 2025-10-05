import { Directory,File } from "expo-file-system";

export async function ensureDir(uri: string) {
  const dir = new Directory(uri);
  if (!dir.exists) {
    dir.create({ intermediates: true });
  }
}

async function ensureParentDir(path: string) {
  const parts = path.split("/").slice(0, -1).join("/") + "/";
  const parentDir = new Directory(parts);
  if (!parentDir.exists) {
    parentDir.create({ intermediates: true });
  }
}

export async function readJSON<T>(uri: string): Promise<T> {
  const file = new File(uri);
  const raw = await file.text();
  return JSON.parse(raw) as T;
}

export async function writeJSON(uri: string, data: unknown) {
  await ensureParentDir(uri);
  const file = new File(uri);
  await file.write(JSON.stringify(data, null, 2));
}

export async function withLock<T>(
  lockPath: string,
  fn: () => Promise<T>
): Promise<T> {
  await ensureParentDir(lockPath);

  const lockFile = new File(lockPath);
  if (lockFile.exists) {
    throw new Error("update-in-progress");
  }

  await lockFile.write(Date.now().toString());
  try {
    return await fn();
  } finally {
    try {
      lockFile.delete();
    } catch { /* empty */ }
  }
}
