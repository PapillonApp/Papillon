/**
 * Web/Tauri: Reanimated custom worklet entering/exiting builders are not
 * reliable in the current Reanimated Web runtime. Returning undefined makes
 * the existing components keep their native animations while the Web build
 * renders the same UI without trying to execute unsupported builders.
 */
export const PapillonZoomIn = undefined;
export const PapillonZoomOut = undefined;
export const PapillonAppearIn = undefined;
export const PapillonAppearOut = undefined;
export const PapillonSpringIn = undefined;
export const PapillonSpringOut = undefined;
export const PapillonAndroidMenuIn = undefined;
