/**
 * Web/Tauri layout animations are disabled deliberately. Native Papillon
 * transitions stay enabled on iOS/Android; Web uses normal React layout.
 */
export const Animation = (_animation?: unknown, _style?: unknown) => undefined;
export const PapillonFadeIn = undefined;
export const PapillonFadeOut = undefined;
