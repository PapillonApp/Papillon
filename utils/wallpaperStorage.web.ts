import type { ImagePickerAsset } from "expo-image-picker";

import type { Wallpaper } from "@/stores/settings/types";

export function getWallpaperUri(wallpaper?: Wallpaper): string | null {
  return wallpaper?.url ?? null;
}

export function hasWallpaperStorage(): boolean {
  return false;
}

export function getWallpaperStorageSize(): number {
  return 0;
}

export async function downloadWallpaper(wallpaper: Wallpaper): Promise<Wallpaper> {
  return wallpaper;
}

export async function saveCustomWallpaper(asset: ImagePickerAsset): Promise<Wallpaper> {
  const id = `custom:${Date.now()}`;
  const url = asset.base64
    ? `data:${asset.mimeType || "image/jpeg"};base64,${asset.base64}`
    : asset.uri;
  return { id, url };
}

export function clearWallpaperStorage(): void {
  // Browser wallpapers are saved with the personalization settings.
}
