export type CourseLiveActivitySizes = {
  course: { gap: number; lead: number; subject: number; detail: number };
  schedule: { label: number; ended: number };
  timerBox: { short: number; long: number };
  banner: {
    padding: number;
    gap: number;
    row: number;
    badge: number;
    timer: number;
  };
  watch: {
    padding: { leading: number; trailing: number; top: number; bottom: number };
    gap: number;
    badge: number;
    subject: number;
    timer: number;
    ended: number;
  };
  island: {
    compact: {
      emoji: number;
      timer: number;
      timerBox: number;
      ended: number;
      leading: number;
      trailing: number;
    };
    minimal: number;
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
