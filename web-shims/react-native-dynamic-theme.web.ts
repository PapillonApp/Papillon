// Shim web/desktop pour `react-native-dynamic-theme`.
//
// Le paquet expose une fonction JS pure (createDynamicColorSchemeFromSourceColor)
// utilisée comme repli sur toute plateforme non-Android — exactement notre
// cas sur web. Le problème n'est pas cette logique (saine), mais le fait
// que son point d'entrée (core/index.js) importe NativeDynamicTheme.js, qui
// appelle `TurboModuleRegistry.getEnforcing('DynamicTheme')` au niveau
// module : ça plante le bundling web avant même qu'on atteigne le test
// `Platform.OS === 'android'` qui aurait de toute façon évité cette branche.
// On réimporte donc directement les utilitaires JS purs du paquet (jamais
// NativeDynamicTheme.js) : comportement strictement identique à ce que
// l'app obtient déjà sur iOS aujourd'hui, juste sans l'import cassé.
import { DEFAULT_SOURCE_COLOR } from "react-native-dynamic-theme/lib/module/constants/dynamicColorSchemeConstants";
import {
  createAdditionalDynamicColorSchemeFromSourceColor,
  createDynamicColorSchemeFromSourceColor,
} from "react-native-dynamic-theme/lib/module/utils/dynamicColorSchemeUtils";
import { createExtendedTonalPalettesFromSourceColor } from "react-native-dynamic-theme/lib/module/utils/tonalPaletteUtils";

export const getExtendedDynamicColorSchemeFromSourceColor = (sourceColor: string) =>
  createDynamicColorSchemeFromSourceColor(sourceColor);

export const getExtendedDynamicSchemeFromSourceColor = (sourceColor: string) => {
  const dynamicScheme = createDynamicColorSchemeFromSourceColor(sourceColor);
  const additionalDynamicColorSchemes = createAdditionalDynamicColorSchemeFromSourceColor(sourceColor);
  const tonalPalettesVariants = createExtendedTonalPalettesFromSourceColor(sourceColor);
  return {
    sourceColor,
    palettes: tonalPalettesVariants,
    schemes: { ...dynamicScheme, ...additionalDynamicColorSchemes },
  };
};

export const getExtendedDynamicScheme = getExtendedDynamicSchemeFromSourceColor;

// Seule fonction réellement utilisée dans l'app (utils/theme/Theme.ts) :
// celle-ci vérifie déjà `Platform.OS === 'android'` avant d'appeler cette
// fonction, donc sur web on retombe systématiquement sur la couleur de
// repli — identique au comportement iOS actuel.
export const getDynamicColorScheme = (fallbackColor?: string) =>
  createDynamicColorSchemeFromSourceColor(fallbackColor || DEFAULT_SOURCE_COLOR);
