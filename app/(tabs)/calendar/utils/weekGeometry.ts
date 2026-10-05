import type { Course } from "@/services/shared/timetable";

export const HOUR_GUTTER_WIDTH = 50;

export const BASE_HOUR_HEIGHT = 62;

export const MIN_HOUR_HEIGHT = 34;
export const MAX_HOUR_HEIGHT = 190;

export const HALF_HOUR_LINE_THRESHOLD = 100;

export function clampHourHeight(value: number): number {
  'worklet';
  return Math.min(MAX_HOUR_HEIGHT, Math.max(MIN_HOUR_HEIGHT, value));
}

export const DAY_HEADER_HEIGHT = 56;

const MIN_COLUMN_WIDTH = 128;

export const MIN_COLUMNS = 2;
export const MAX_COLUMNS = 7;

export interface WeekendVisibility {
  saturday: boolean;
  sunday: boolean;
}

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

export const PAGE_ORIGIN = 5000;
export const PAGE_COUNT = PAGE_ORIGIN * 2 + 1;

const DAY_MS = 24 * 60 * 60 * 1000;

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

export function startOfWeek(date: Date): Date {
  const monday = startOfDay(date);
  // getDay() is 0 on Sunday, which belongs to the week that started six days ago.
  const shift = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - shift);
  return monday;
}

export function dayIndexFromDate(origin: Date, date: Date, offsets: number[]): number {
  const perWeek = offsets.length;
  const days = Math.round((startOfDay(date).getTime() - origin.getTime()) / DAY_MS);
  const week = Math.floor(days / 7);
  const offset = days - week * 7;

  const slot = offsets.indexOf(offset);
  if (slot !== -1) {
    return week * perWeek + slot;
  }

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

export const DEFAULT_HOUR_RANGE: HourRange = { startHour: 8, endHour: 18 };

export function getHourRange(days: { courses: Course[] }[]): HourRange {
  let startHour = DEFAULT_HOUR_RANGE.startHour;
  let endHour = DEFAULT_HOUR_RANGE.endHour;

  for (const day of days) {
    for (const course of day.courses) {
      const from = Math.floor(minutesIntoDay(course.from) / 60);
      if (from < startHour) {
        startHour = from;
      }
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
  topRatio: number;
  heightRatio: number;
  leftRatio: number;
  widthRatio: number;
  durationMinutes: number;
}

export const MIN_BLOCK_HEIGHT = 22;

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
