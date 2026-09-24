import { Directory, File, Paths } from "expo-file-system";
import type { ImagePickerAsset } from "expo-image-picker";

import type { Wallpaper } from "@/stores/settings/types";

const wallpaperDirectory = new Directory(Paths.document, "wallpapers");

export function getWallpaperUri(wallpaper?: Wallpaper): string | null {
  if (!wallpaper) return null;
  if (wallpaper.path?.name) {
    const file = new File(Paths.document, wallpaper.path.directory || "", wallpaper.path.name);
    return file.exists ? file.uri : null;
  }
  return wallpaper.url ?? null;
}

export function hasWallpaperStorage(): boolean {
  return wallpaperDirectory.exists;
}

export function getWallpaperStorageSize(): number {
  try {
    return wallpaperDirectory.exists ? wallpaperDirectory.info().size ?? 0 : 0;
  } catch {
    return 0;
  }
}

export async function downloadWallpaper(wallpaper: Wallpaper): Promise<Wallpaper> {
  if (!wallpaper.url) throw new Error("Cette image n’a pas d’adresse de téléchargement.");
  if (!wallpaperDirectory.exists) wallpaperDirectory.create();

  const fileName = `${wallpaper.id.replace(/[^a-zA-Z0-9._-]/g, "-")}.jpg`;
  const file = new File(wallpaperDirectory, fileName);
  const downloaded = file.exists ? file : await File.downloadFileAsync(wallpaper.url, file);

  return {
    id: wallpaper.id,
    path: { directory: wallpaperDirectory.name, name: downloaded.name },
    url: wallpaper.url,
    credit: wallpaper.credit,
  };
}

export async function saveCustomWallpaper(asset: ImagePickerAsset): Promise<Wallpaper> {
  if (!wallpaperDirectory.exists) wallpaperDirectory.create();

  const id = `custom:${Date.now()}`;
  const file = new File(wallpaperDirectory, `${id.replace(":", "-")}.jpg`);
  new File(asset.uri).copy(file);

  return { id, path: { directory: wallpaperDirectory.name, name: file.name } };
}

export function clearWallpaperStorage(): void {
  if (wallpaperDirectory.exists) wallpaperDirectory.delete();
}
