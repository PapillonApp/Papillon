import { useMemo } from "react";

import { useSettingsStore } from "@/stores/settings";

export type AppFontFamily = "sn-pro" | "fixel-text" | "oxanium" | "courgette" | "ibm-plex-serif";

export type FontAlias =
  | "light"
  | "regular"
  | "medium"
  | "semibold"
  | "bold"
  | "black";

export const STABLE_FONT_FAMILIES = {
  snpro_light: "snpro-light",
  snpro_regular: "snpro-regular",
  snpro_medium: "snpro-medium",
  snpro_semibold: "snpro-semibold",
  snpro_bold: "snpro-bold",
  snpro_black: "snpro-black",
  fixeltext_light: "fixeltext-light",
  fixeltext_regular: "fixeltext-regular",
  fixeltext_medium: "fixeltext-medium",
  fixeltext_semibold: "fixeltext-semibold",
  fixeltext_bold: "fixeltext-bold",
  oxanium_light: "oxanium-light",
  oxanium_regular: "oxanium-regular",
  oxanium_medium: "oxanium-medium",
  oxanium_semibold: "oxanium-semibold",
  oxanium_bold: "oxanium-bold",
  courgette_regular: "courgette-regular",
  ibmplexserif_light: "ibmplexserif-light",
  ibmplexserif_regular: "ibmplexserif-regular",
  ibmplexserif_medium: "ibmplexserif-medium",
  ibmplexserif_semibold: "ibmplexserif-semibold",
  ibmplexserif_bold: "ibmplexserif-bold",
} as const;

export const FONT_CONFIG = {
  [STABLE_FONT_FAMILIES.snpro_light]: require("@/assets/fonts/SNPro-Light.ttf"),
  [STABLE_FONT_FAMILIES.snpro_regular]: require("@/assets/fonts/SNPro-Regular.ttf"),
  [STABLE_FONT_FAMILIES.snpro_medium]: require("@/assets/fonts/SNPro-Medium.ttf"),
  [STABLE_FONT_FAMILIES.snpro_semibold]: require("@/assets/fonts/SNPro-Semibold.ttf"),
  [STABLE_FONT_FAMILIES.snpro_bold]: require("@/assets/fonts/SNPro-Bold.ttf"),
  [STABLE_FONT_FAMILIES.snpro_black]: require("@/assets/fonts/SNPro-Black.ttf"),
  [STABLE_FONT_FAMILIES.fixeltext_light]: require("@/assets/fonts/FixelText-Light.otf"),
  [STABLE_FONT_FAMILIES.fixeltext_regular]: require("@/assets/fonts/FixelText-Regular.otf"),
  [STABLE_FONT_FAMILIES.fixeltext_medium]: require("@/assets/fonts/FixelText-Medium.otf"),
  [STABLE_FONT_FAMILIES.fixeltext_semibold]: require("@/assets/fonts/FixelText-SemiBold.otf"),
  [STABLE_FONT_FAMILIES.fixeltext_bold]: require("@/assets/fonts/FixelText-Bold.otf"),
  [STABLE_FONT_FAMILIES.oxanium_light]: require("@/assets/fonts/Oxanium-Light.ttf"),
  [STABLE_FONT_FAMILIES.oxanium_regular]: require("@/assets/fonts/Oxanium-Regular.ttf"),
  [STABLE_FONT_FAMILIES.oxanium_medium]: require("@/assets/fonts/Oxanium-Medium.ttf"),
  [STABLE_FONT_FAMILIES.oxanium_semibold]: require("@/assets/fonts/Oxanium-SemiBold.ttf"),
  [STABLE_FONT_FAMILIES.oxanium_bold]: require("@/assets/fonts/Oxanium-Bold.ttf"),
  [STABLE_FONT_FAMILIES.courgette_regular]: require("@/assets/fonts/Courgette-Regular.ttf"),
  [STABLE_FONT_FAMILIES.ibmplexserif_light]: require("@/assets/fonts/IBMPlexSerif-Light.ttf"),
  [STABLE_FONT_FAMILIES.ibmplexserif_regular]: require("@/assets/fonts/IBMPlexSerif-Regular.ttf"),
  [STABLE_FONT_FAMILIES.ibmplexserif_medium]: require("@/assets/fonts/IBMPlexSerif-Medium.ttf"),
  [STABLE_FONT_FAMILIES.ibmplexserif_semibold]: require("@/assets/fonts/IBMPlexSerif-SemiBold.ttf"),
  [STABLE_FONT_FAMILIES.ibmplexserif_bold]: require("@/assets/fonts/IBMPlexSerif-Bold.ttf"),
} as const;

const FONT_ALIAS_MAP: Record<AppFontFamily, Record<FontAlias, string>> = {
  "sn-pro": {
    light: STABLE_FONT_FAMILIES.snpro_light,
    regular: STABLE_FONT_FAMILIES.snpro_regular,
    medium: STABLE_FONT_FAMILIES.snpro_medium,
    semibold: STABLE_FONT_FAMILIES.snpro_semibold,
    bold: STABLE_FONT_FAMILIES.snpro_bold,
    black: STABLE_FONT_FAMILIES.snpro_black,
  },
  "fixel-text": {
    light: STABLE_FONT_FAMILIES.fixeltext_light,
    regular: STABLE_FONT_FAMILIES.fixeltext_regular,
    medium: STABLE_FONT_FAMILIES.fixeltext_medium,
    semibold: STABLE_FONT_FAMILIES.fixeltext_semibold,
    bold: STABLE_FONT_FAMILIES.fixeltext_bold,
    black: STABLE_FONT_FAMILIES.fixeltext_bold,
  },
  "oxanium": {
    light: STABLE_FONT_FAMILIES.oxanium_light,
    regular: STABLE_FONT_FAMILIES.oxanium_regular,
    medium: STABLE_FONT_FAMILIES.oxanium_medium,
    semibold: STABLE_FONT_FAMILIES.oxanium_semibold,
    bold: STABLE_FONT_FAMILIES.oxanium_bold,
    black: STABLE_FONT_FAMILIES.oxanium_bold,
  },
  "courgette": {
    regular: STABLE_FONT_FAMILIES.courgette_regular,
    light: STABLE_FONT_FAMILIES.courgette_regular,
    medium: STABLE_FONT_FAMILIES.courgette_regular,
    semibold: STABLE_FONT_FAMILIES.courgette_regular,
    bold: STABLE_FONT_FAMILIES.courgette_regular,
    black: STABLE_FONT_FAMILIES.courgette_regular,
  },
  "ibm-plex-serif": {
    light: STABLE_FONT_FAMILIES.ibmplexserif_light,
    regular: STABLE_FONT_FAMILIES.ibmplexserif_regular,
    medium: STABLE_FONT_FAMILIES.ibmplexserif_medium,
    semibold: STABLE_FONT_FAMILIES.ibmplexserif_semibold,
    bold: STABLE_FONT_FAMILIES.ibmplexserif_bold,
    black: STABLE_FONT_FAMILIES.ibmplexserif_bold,
  },
};

const isFontAlias = (font: string): font is FontAlias => {
  return (
    font === "light" ||
    font === "regular" ||
    font === "medium" ||
    font === "semibold" ||
    font === "bold" ||
    font === "black"
  );
};

export const f = (font: FontAlias | string, selectedFontFamily?: AppFontFamily) => {
  if (!isFontAlias(font)) {
    return font;
  }

  const family = selectedFontFamily ?? useSettingsStore.getState().personalization.fontFamily ?? "sn-pro";
  const familyMap = FONT_ALIAS_MAP[family];

  return familyMap[font];
};

export const useFont = () => {
  const selectedFontFamily = useSettingsStore((state) => state.personalization.fontFamily ?? "sn-pro");

  return useMemo(
    () => (font: FontAlias | string) => f(font, selectedFontFamily),
    [selectedFontFamily]
  );
};
