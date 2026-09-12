import type { Course } from "@/services/shared/timetable";

/**
 * Geometry of the weekly grid. Everything the week view draws is derived from
 * these constants plus the available width, so the layout stays a pure function
 * of the window size and never has to be measured.
 */

/** Column holding the hour labels, to the left of the scrolling day columns. */
export const HOUR_GUTTER_WIDTH = 50;

/** Height of one hour of the grid at rest, sized so a 55min course fits two text lines. */
export const BASE_HOUR_HEIGHT = 62;

// How far a pinch may take that height: from a whole day at a glance to a
// couple of hours filling the screen.
export const MIN_HOUR_HEIGHT = 34;
export const MAX_HOUR_HEIGHT = 190;

/** Above this, an hour is tall enough to be worth splitting in half. */
export const HALF_HOUR_LINE_THRESHOLD = 100;

export function clampHourHeight(value: number): number {
  'worklet';
  return Math.min(MAX_HOUR_HEIGHT, Math.max(MIN_HOUR_HEIGHT, value));
}

/** Height of the fixed row of day names above the grid. */
export const DAY_HEADER_HEIGHT = 56;

/**
 * Narrowest a day column may get. Picked so every phone lands on two days and
 * the count only grows on genuinely wider windows (large tablets, split view).
 */
const MIN_COLUMN_WIDTH = 128;

export const MIN_COLUMNS = 2;
export const MAX_COLUMNS = 7;

export interface WeekendVisibility {
  saturday: boolean;
  sunday: boolean;
}

/**
 * Days after Monday the grid draws, in the order it draws them. A weekend day
 * with no class anywhere in the timetable is left out entirely rather than
 * given a column nothing can ever fill.
 */
export function visibleDayOffsets({ saturday, sunday }: WeekendVisibility): number[] {
  const offsets = [0, 1, 2, 3, 4];
  if (saturday) {
    offsets.push(5);
  }
  if (sunday) {
    offsets.push(6);
  }
  return offsets;
}

/** The pager cannot address negative pages, so page 0 sits this far back. */
export const PAGE_ORIGIN = 5000;
export const PAGE_COUNT = PAGE_ORIGIN * 2 + 1;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * How many days fit side by side in `width`. Never more than a week holds, so
 * the widest layout is exactly one week per page rather than a week and a bit.
 */
export function getColumnCount(width: number, daysPerWeek: number): number {
  const upper = Math.min(MAX_COLUMNS, Math.max(MIN_COLUMNS, daysPerWeek));
  if (!Number.isFinite(width) || width <= 0) {
    return MIN_COLUMNS;
  }
  const fitting = Math.floor(width / MIN_COLUMN_WIDTH);
  return Math.min(upper, Math.max(MIN_COLUMNS, fitting));
}

export function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** Monday of the week `date` falls in. Weeks are Monday-based like the rest of the app. */
export function startOfWeek(date: Date): Date {
  const monday = startOfDay(date);
  // getDay() is 0 on Sunday, which belongs to the week that started six days ago.
  const shift = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - shift);
  return monday;
}

/**
 * Position of `date` in the sequence of days the grid actually draws, counted
 * from `origin` (a Monday). Hidden weekend days take no slot, so the index runs
 * `daysPerWeek` to the week rather than seven.
 *
 * Calendar distance is measured on local midnights, so a DST change inside the
 * interval cannot round the result onto the neighbouring day.
 */
export function dayIndexFromDate(origin: Date, date: Date, offsets: number[]): number {
  const perWeek = offsets.length;
  const days = Math.round((startOfDay(date).getTime() - origin.getTime()) / DAY_MS);
  const week = Math.floor(days / 7);
  const offset = days - week * 7;

  const slot = offsets.indexOf(offset);
  if (slot !== -1) {
    return week * perWeek + slot;
  }

  // A day the grid hides has no slot of its own. Fold it onto the next day that
  // is drawn, so picking a hidden Sunday from the header lands on the Monday.
  const next = offsets.findIndex(candidate => candidate > offset);
  return next === -1 ? (week + 1) * perWeek : week * perWeek + next;
}

export function dateFromDayIndex(origin: Date, index: number, offsets: number[]): Date {
  const perWeek = offsets.length;
  const week = Math.floor(index / perWeek);
  const date = new Date(origin);
  date.setDate(origin.getDate() + week * 7 + offsets[index - week * perWeek]);
  return date;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

export function minutesIntoDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export interface HourRange {
  startHour: number;
  endHour: number;
}

/** Hours the grid is drawn for: a school day by default, widened by the data. */
export const DEFAULT_HOUR_RANGE: HourRange = { startHour: 8, endHour: 18 };

/**
 * Widens the default range just enough to hold every course handed in. Both
 * bounds snap to whole hours, so the range only changes when a course actually
 * falls outside the hours already drawn.
 */
export function getHourRange(days: { courses: Course[] }[]): HourRange {
  let startHour = DEFAULT_HOUR_RANGE.startHour;
  let endHour = DEFAULT_HOUR_RANGE.endHour;

  for (const day of days) {
    for (const course of day.courses) {
      const from = Math.floor(minutesIntoDay(course.from) / 60);
      if (from < startHour) {
        startHour = from;
      }
      // A course ending after midnight reads as minute 0 of the next day: treat
      // it as running to the end of this one instead of collapsing the range.
      const rawEnd = course.to.getTime() <= course.from.getTime()
        ? 24 * 60
        : minutesIntoDay(course.to) || 24 * 60;
      const to = Math.ceil(rawEnd / 60);
      if (to > endHour) {
        endHour = to;
      }
    }
  }

  return {
    startHour: Math.max(0, startHour),
    endHour: Math.min(24, Math.max(endHour, startHour + 1)),
  };
}

export interface PositionedCourse {
  course: Course;
  /**
   * Position and size down the grid, as shares of its full height in [0, 1].
   * Expressed as ratios rather than pixels so a zoom only has to resize the
   * grid itself and every block follows.
   */
  topRatio: number;
  heightRatio: number;
  /** Share of the day column this block starts at and occupies, in [0, 1]. */
  leftRatio: number;
  widthRatio: number;
  /** Minutes the block covers, to pick how much detail fits at a given zoom. */
  durationMinutes: number;
}

/** Blocks shorter than this are grown so their subject name stays readable. */
export const MIN_BLOCK_HEIGHT = 22;

/**
 * Places a day's courses in the grid, splitting the column between courses that
 * overlap in time. Courses are grouped into clusters of mutually overlapping
 * blocks, and each cluster is divided into as many lanes as it needs, so an
 * isolated course keeps the full width even when another part of the day is busy.
 */
export function layoutDayCourses(courses: Course[], range: HourRange): PositionedCourse[] {
  if (courses.length === 0) {
    return [];
  }

  const gridStart = range.startHour * 60;
  const gridEnd = range.endHour * 60;
  const gridMinutes = Math.max(1, gridEnd - gridStart);

  const items = courses
    .map(course => {
      const start = minutesIntoDay(course.from);
      const rawEnd = course.to.getTime() <= course.from.getTime()
        ? 24 * 60
        : minutesIntoDay(course.to) || 24 * 60;
      return { course, start, end: Math.max(rawEnd, start + 1) };
    })
    .sort((a, b) => a.start - b.start || b.end - a.end);

  const positioned: PositionedCourse[] = [];
  let cluster: { course: Course; start: number; end: number; lane: number }[] = [];
  let laneEnds: number[] = [];

  const flush = () => {
    const lanes = laneEnds.length;
    for (const item of cluster) {
      const top = Math.max(item.start, gridStart) - gridStart;
      const bottom = Math.min(item.end, gridEnd) - gridStart;
      positioned.push({
        course: item.course,
        topRatio: top / gridMinutes,
        heightRatio: Math.max(0, bottom - top) / gridMinutes,
        leftRatio: item.lane / lanes,
        widthRatio: 1 / lanes,
        durationMinutes: Math.max(0, bottom - top),
      });
    }
    cluster = [];
    laneEnds = [];
  };

  for (const item of items) {
    // A course starting after everything in the cluster has ended opens a new
    // one, which lets it take the full width again.
    if (cluster.length > 0 && laneEnds.every(end => end <= item.start)) {
      flush();
    }

    let lane = laneEnds.findIndex(end => end <= item.start);
    if (lane === -1) {
      lane = laneEnds.length;
    }
    laneEnds[lane] = item.end;
    cluster.push({ ...item, lane });
  }

  flush();

  return positioned;
}
