import adjust from "@/utils/adjustColor";

export type CourseLiveActivityAppearance = {
  ink: { title: string; detail: string; accent: string };
  surface: { banner: string; watch: string };
};

/**
 * Every ground a Live Activity is drawn on is dark — the Lock Screen, StandBy,
 * the watch's Smart Stack, the Dynamic Island — and the colour scheme the widget
 * runtime reports does not reliably say so: it comes back "light" on all of
 * them, which is what once painted a white card with dark text there. So there
 * is no light variant to pick, and the layout does not branch on one.
 *
 * Each tone is the subject's colour blended towards white, far enough apart that
 * the title leads, the accent carries the colour and the second line stays
 * second. The banner's own background is the same colour taken the other way,
 * almost to black — enough to say which course without lighting up the
 * wallpaper behind it.
 */
const TONE = {
  title: 0.9,
  detail: 0.45,
  accent: 0.62,
  banner: -0.86
};

/** The Smart Stack is black, and a card sitting on it should be too. */
const WATCH_SURFACE = "#000000";

export const buildCourseAppearance = (
  color: string
): CourseLiveActivityAppearance => ({
  ink: {
    title: adjust(color, TONE.title),
    detail: adjust(color, TONE.detail),
    accent: adjust(color, TONE.accent)
  },
  surface: {
    banner: adjust(color, TONE.banner),
    watch: WATCH_SURFACE
  }
});
