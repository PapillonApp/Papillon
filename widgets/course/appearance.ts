import adjust from "@/utils/adjustColor";

export type CourseLiveActivityAppearance = {
  ink: { title: string; detail: string; accent: string };
  surface: { banner: string; watch: string };
};

const TONE = {
  title: 0.9,
  detail: 0.45,
  accent: 0.62,
  banner: -0.86
};

const WATCH_SURFACE = "#000000";

// Every ground a Live Activity is drawn on is dark, but the widget runtime
// reports "light" on all of them — hence no light variant.
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
