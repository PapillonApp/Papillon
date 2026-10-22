/**
 * The ids TipKit files dismissals under, for as long as the app is installed.
 *
 * They are gathered here because a tip is usually retired somewhere other than
 * where it is shown — the moment the user does the thing it was teaching — and
 * the two sides have to agree. Never reuse an id for a different hint, and only
 * change one when the tip is meant to come back for everybody.
 */
export const TipIds = {
  /** Points at the home palette button: the wallpaper can be changed. */
  homeWallpaper: "home.wallpaper",
  /** Points at the tasks week title: the weeks can be swiped through. */
  tasksWeekScroll: "tasks.week-scroll",
  /** Points at the averages graph: it can be scrubbed to read the history. */
  gradesAverageHistory: "grades.average-history",
} as const;

export type TipId = (typeof TipIds)[keyof typeof TipIds];

/**
 * How many times a screen has to be opened before its tip is allowed to show.
 *
 * Nobody wants three callouts on their first run, so discovery is staggered:
 * the plainly useful and self-contained comes first, and the tips that explain
 * a gesture on a screen you have to seek out come once the app is familiar.
 * The counts are per screen, so they are a running order rather than a
 * stopwatch — a user who lives in the grades tab still gets that tip late,
 * because lateness here means "after you have settled in", not "after a week".
 */
export const TipVisitsRequired: Record<TipId, number> = {
  [TipIds.homeWallpaper]: 2,
  [TipIds.tasksWeekScroll]: 3,
  [TipIds.gradesAverageHistory]: 4,
};

/**
 * How many visits a tip may appear on before it retires itself.
 *
 * TipKit only files a dismissal when the close button is used: tapping outside
 * the callout dismisses the popover and leaves the tip eligible, so it comes
 * straight back the next time the screen behind it redraws. A budget counted on
 * our side is the only ceiling that holds whichever way the user gets rid of it
 * — and a hint nobody took up twice is a hint they do not want.
 */
export const TIP_MAX_SHOWS = 2;
