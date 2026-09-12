/**
 * Every measurement the Live Activity draws with, in one place.
 *
 * The layout cannot import them: it is serialized whole and re-evaluated inside
 * the widget extension, which has no access to the app bundle, so a reference to
 * anything outside the function throws at render time. They travel with the
 * content instead — this is the file to edit when a size looks wrong.
 */
export type CourseLiveActivitySizes = {
  /** The course block: subject, then where and when, on every presentation. */
  course: { gap: number; lead: number; subject: number; detail: number };
  /** The schedule block: what the countdown runs to, above the countdown. */
  schedule: { label: number; ended: number };
  /**
   * What a running clock reserves, as a multiple of its own size — one for a
   * countdown under the hour, one for a longer one that has hours to fit in.
   */
  timerBox: { short: number; long: number };
  /** Lock Screen and StandBy. */
  banner: {
    padding: number;
    gap: number;
    row: number;
    badge: number;
    timer: number;
  };
  /** The watch's Smart Stack and CarPlay, where the whole thing is one row. */
  watch: {
    padding: { leading: number; trailing: number; top: number; bottom: number };
    gap: number;
    badge: number;
    subject: number;
    timer: number;
    ended: number;
  };
  island: {
    /**
     * The compact regions frame the sensor housing, so every point they take is
     * a point wider the island gets. `timerBox` is sized a little over `timer`:
     * the clock reads better with a shade of room around it.
     */
    compact: {
      emoji: number;
      timer: number;
      timerBox: number;
      ended: number;
      leading: number;
      trailing: number;
    };
    /** A circle barely wider than a glyph. */
    minimal: number;
    /**
     * The expanded regions are laid out around the camera and the system gives
     * them no insets of their own: what is not padded here touches the edge.
     */
    expanded: {
      badge: number;
      timer: number;
      gap: number;
      inset: number;
      top: number;
    };
  };
};

export const COURSE_LIVE_ACTIVITY_SIZES: CourseLiveActivitySizes = {
  course: { gap: 1, lead: 8, subject: 18, detail: 15 },
  schedule: { label: 15, ended: 20 },
  timerBox: { short: 2.9, long: 3.7 },
  banner: { padding: 16, gap: 10, row: 12, badge: 32, timer: 24 },
  watch: {
    padding: { leading: 10, trailing: 10, top: 8, bottom: 8 },
    gap: 8,
    badge: 30,
    subject: 15,
    timer: 17,
    ended: 15
  },
  island: {
    compact: {
      emoji: 16,
      timer: 14.5,
      timerBox: 15,
      ended: 15,
      leading: 2,
      trailing: 4.5
    },
    minimal: 16,
    expanded: { badge: 32, timer: 24, gap: 10, inset: 10, top: 6 }
  }
};
