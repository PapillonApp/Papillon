import adjust from "@/utils/adjustColor";

export type WidgetPalette = {
  surface: string;
  strong: string;
  soft: string;
  heading: string;
  body: string;
  chip: string;
};

/**
 * Both schemes are resolved up front: WidgetKit re-renders a widget when the
 * system appearance changes, and the app is not running to recompute them.
 */
export type WidgetTheme = {
  light: WidgetPalette;
  dark: WidgetPalette;
};

export type WidgetFonts = {
  regular: string;
  medium: string;
  semibold: string;
  bold: string;
};

// Every tone is the accent pushed towards the surface it sits on. The steps are
// picked so the small text clears 4.5:1 against that surface for all six app
// colours — the accent used as-is only reaches about 2.5:1 on its own tint.
const LIGHT = {
  surface: 0.9,
  chip: 0.78,
  strong: -0.34,
  soft: -0.42,
  heading: -0.48,
  body: -0.62
};

const DARK = {
  surface: -0.84,
  chip: -0.7,
  strong: 0.42,
  soft: 0.28,
  heading: 0.4,
  body: 0.62
};

const palette = (accent: string, steps: typeof LIGHT): WidgetPalette => ({
  surface: adjust(accent, steps.surface),
  chip: adjust(accent, steps.chip),
  strong: adjust(accent, steps.strong),
  soft: adjust(accent, steps.soft),
  heading: adjust(accent, steps.heading),
  body: adjust(accent, steps.body)
});

export const buildWidgetTheme = (accent: string): WidgetTheme => ({
  light: palette(accent, LIGHT),
  dark: palette(accent, DARK)
});
