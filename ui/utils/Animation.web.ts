import { Easing, FadeInUp, FadeOut } from "react-native-reanimated";

/**
 * Web-safe animation helpers.
 *
 * Reanimated Web does not support springified layout/entering/exiting builders
 * in the same way as native. In particular, springify() on layout builders can
 * trigger runtime warnings and can conflict with opacity on the same element.
 * Disable layout transitions on Web while keeping simple fade entering/exiting
 * animations available.
 */
export const Animation = (_animation?: unknown, _style?: unknown) => undefined;

export const PapillonFadeIn = FadeInUp.duration(200).easing(Easing.out(Easing.ease));
export const PapillonFadeOut = FadeOut.duration(150).easing(Easing.in(Easing.ease));
