import { Directory, File, Paths } from "expo-file-system";
import { Dimensions } from "react-native";

import { useSettingsStore } from "@/stores/settings";
import { Wallpaper } from "@/stores/settings/types";
import { generateMeshGradient } from "@/utils/generative";

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

  const { personalization, mutateProperty } = useSettingsStore.getState();
  const { wallpaper: previous, lastImageWallpaper } = personalization;

  mutateProperty("personalization", {
    wallpaper: { id, path: { directory: directory.name, name: file.name } },
    wallpaperGradient: gradient,
    lastImageWallpaper: previous && !isGradient(previous) ? previous : lastImageWallpaper,
  });

  if (isGradient(previous) && previous?.path?.name) {
    const previousFile = new File(directory, previous.path.name);
    if (previousFile.exists) previousFile.delete();
  }
}
