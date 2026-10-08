import { Directory, File, Paths } from "expo-file-system";
import { Dimensions } from "react-native";

import { useAccountStore } from "@/stores/account";
import { useSettingsStore } from "@/stores/settings";
import { AccountWallpaper, Personalization, Wallpaper } from "@/stores/settings/types";
import { generateMeshGradient } from "@/utils/generative";

const accountKey = (accountId?: string | null) => accountId ?? "default";

const readAccountWallpaper = (personalization: Personalization, accountId?: string | null): AccountWallpaper =>
  personalization.wallpapersByAccount?.[accountKey(accountId)] ?? {
    wallpaper: personalization.wallpaper,
    lastImageWallpaper: personalization.lastImageWallpaper,
    wallpaperGradient: personalization.wallpaperGradient,
  };

/** Wallpaper settings of the active account. */
export const useAccountWallpaper = (): AccountWallpaper => {
  const accountId = useAccountStore(state => state.lastUsedAccount);
  const personalization = useSettingsStore(state => state.personalization);
  return readAccountWallpaper(personalization, accountId);
};

export const getAccountWallpaper = (): AccountWallpaper =>
  readAccountWallpaper(useSettingsStore.getState().personalization, useAccountStore.getState().lastUsedAccount);

/** Merges updates into the active account's wallpaper settings. */
export function setAccountWallpaper(updates: Partial<AccountWallpaper>) {
  const { personalization, mutateProperty } = useSettingsStore.getState();
  const accountId = useAccountStore.getState().lastUsedAccount;
  mutateProperty("personalization", {
    wallpapersByAccount: {
      ...personalization.wallpapersByAccount,
      [accountKey(accountId)]: { ...readAccountWallpaper(personalization, accountId), ...updates },
    },
  });
}

export type Gradient = { colors: string[]; seed: number };

export const GRADIENT_PALETTE = [
  "#DD007D", "#FF6B6B", "#FF9F43", "#E8B048", "#26B290", "#1DD1A1",
  "#48B7E8", "#2E86DE", "#5F27CD", "#C400DD", "#222F3E", "#F5F6FA",
];
// Home shows the wallpaper full width and 400pt tall (cover): match that ratio so the preview is what gets applied
export const GRADIENT_HEIGHT = 800;
export const GRADIENT_WIDTH = Math.round(GRADIENT_HEIGHT * Dimensions.get("window").width / 400);

export const isGradient = (wallpaper?: Wallpaper) => wallpaper?.id.startsWith("gradient:") ?? false;

export const randomSeed = () => Math.floor(Math.random() * 1e9);

export const randomGradient = (): Gradient => ({
  colors: [...GRADIENT_PALETTE].sort(() => Math.random() - 0.5).slice(0, 2 + Math.floor(Math.random() * 3)),
  seed: randomSeed(),
});

/** Renders the gradient to a PNG in the wallpapers folder and sets it as the wallpaper. */
export function applyGradientWallpaper(gradient: Gradient) {
  const image = generateMeshGradient(gradient.colors, gradient.seed, GRADIENT_WIDTH, GRADIENT_HEIGHT);
  if (!image) return;

  const directory = new Directory(Paths.document, "wallpapers");
  if (!directory.exists) directory.create();

  const id = `gradient:${Date.now()}`;
  const file = new File(directory, `${id}.png`);
  file.writeSync(image.encodeToBytes());

  const { wallpaper: previous, lastImageWallpaper } = getAccountWallpaper();

  setAccountWallpaper({
    wallpaper: { id, path: { directory: directory.name, name: file.name } },
    wallpaperGradient: gradient,
    lastImageWallpaper: previous && !isGradient(previous) ? previous : lastImageWallpaper,
  });

  if (isGradient(previous) && previous?.path?.name) {
    const previousFile = new File(directory, previous.path.name);
    if (previousFile.exists) previousFile.delete();
  }
}
